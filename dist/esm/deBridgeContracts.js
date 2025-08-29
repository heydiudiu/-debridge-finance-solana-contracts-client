import { __awaiter } from "tslib";
import { Buffer } from "buffer";
import { BN, Program, setProvider, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey, Secp256k1Program, Transaction, TransactionInstruction, SYSVAR_RENT_PUBKEY, VersionedTransaction, MessageV0, SystemProgram, ComputeBudgetProgram, } from "@solana/web3.js";
import logger from "loglevel";
import * as prefix from "loglevel-plugin-prefix";
import memoize from "micro-memoize";
import { f64, struct, nu64, u8 } from "@solana/buffer-layout";
import * as wasm from "@debridge-finance/debridge-external-call";
import { SolanaParser } from "@debridge-finance/solana-transaction-parser";
import { DeBridgeResolver, crypto, helpers, findAssociatedTokenAddress as findATA, constants, TOKEN_PROGRAM_ID, WRAPPED_SOL_MINT, getTokenMetadataAddress, interfaces as solanaInterfaces, TOKEN_METADATA_PROGRAM_ID, spl, txs, } from "@debridge-finance/solana-utils";
import { SEND_HASHED_DATA, EXT_CALL_STORAGE_OFFSET, LOG_EVENT } from "./constants";
import { packSignatures } from "./generateSignatures";
import { BRIDGED_EVENT, TRANSFERRED_EVENT } from "./constants";
import { AlreadyClaimed, AssetFeeNotSupported, AssociatedWalletNotInitialized, BridgeFeeMalformed, BridgeFeeNotInitialized, BridgeMalformed, BridgeNotExists, BridgePaused, BridgeStateMalformed, BridgeStateNotExists, ChainSupportInfoMalformed, ChainSupportInfoNotInitialized, ChainSupportInfoNotSupported, ConfirmationStorageMalformed, DiscountInfoMalformed, DiscountNotActive, ExternalCallMetaNotExists, NotEnoughTokens, StructDecodeError, SubmissionInfoNotExists, } from "./errors";
import * as instructions from "./instructions";
import { DEFAULT_CONFIG } from "./config";
import { BridgeState, isSupportedChainInfoType, isMintBridge, isSendBridge, isActiveDiscount, isExtCallMetaExecuted, FixedFeeType, WalletCheckEnum, isExtCallMetaAccumulation, isExtCallMetaExecution, isExtCallMetaFailed, } from "./interfaces";
import { IDL as programIdl } from "./idl/debridge_program";
import { IDL as settingsIdl } from "./idl/debridge_settings_program";
import { checkFlag, isAccountEmpty } from "./utils";
import * as Submission from "./submission";
import { buildDebridgeDecoder } from "./decoder";
logger.setLevel(logger.levels.INFO);
prefix.reg(logger);
prefix.apply(logger);
const isBuffer = solanaInterfaces.isBuffer;
const CALLDATA_CHUNK_SIZE = 800;
export function getRemainingAccountsAndBumps(data, offset, count, submission, submissionAuth, submissionWallet) {
    const context = wasm.get_external_call_account_meta(data, offset, data.length, count, submission.toBase58(), submissionAuth.toBase58(), submissionWallet.toBase58());
    const subsitutionBumps = context.reversed_subsitution_bumps();
    const remainingAccounts = context.remaning_accounts().map((item, index) => {
        const pk = new PublicKey(item.pubkey);
        return {
            isSigner: item.is_signer,
            isWritable: item.is_writable,
            pubkey: pk,
        };
    });
    context.free();
    return [remainingAccounts, subsitutionBumps];
}
export function extCallDataToInstructions(data, offset = 0) {
    // if (offset !== 0) {
    // 	offset -= 8;
    // }
    const iter = wasm.get_external_call_instructions(data, offset, data.length);
    let item;
    const ixs = [];
    do {
        item = iter.next();
        if (!item)
            continue;
        const start = item.position_start;
        const end = item.position_end;
        // item is beeing freed after the next call, hence we can't get any properties of item later
        const ix = item.instruction();
        const jsObjCopy = {
            expenses: ix.expenses,
            reward: ix.reward,
            instruction: ix.instruction,
            start: Number(start),
            end: Number(end),
        };
        ix.free();
        if (item)
            ixs.push(jsObjCopy);
    } while (item != undefined);
    iter.free();
    return ixs;
}
function newTxWithOptionalPriorityFee(priorityFee) {
    const tx = new Transaction();
    if (priorityFee) {
        tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: priorityFee.limit }));
        if (priorityFee.microLamports)
            tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee.microLamports }));
    }
    return tx;
}
function customIsPubkey(obj) {
    const casted = obj;
    // WARN!: Don't use Object.prototype.hasOwnPropery here because obj can be built dynamically
    const containsMethods = "toBase58" in casted && "equals" in casted;
    return containsMethods || obj.constructor.name == "PublicKey";
}
function findAssociatedTokenAddress(wallet, tokenMint, associatedTokenProgramId) {
    return findATA(wallet, tokenMint, TOKEN_PROGRAM_ID, associatedTokenProgramId);
}
export function initWasm(input) {
    return __awaiter(this, void 0, void 0, function* () {
        return isBuffer(input) ? wasm.initSync(input) : wasm.default(input);
    });
}
export class DeBridgeSolanaClient {
    constructor(connection, chainId, wallet, params) {
        this.debug = false;
        if (!chainId) {
            throw new Error(`chainId is required`);
        }
        this.chainId = chainId;
        this._wallet = undefined;
        if (wallet) {
            if ("payer" in wallet) {
                this._wallet = new helpers.Wallet(wallet.payer);
            }
            else {
                this._wallet = wallet;
            }
        }
        this._provider = new AnchorProvider(connection, wallet || {}, {});
        setProvider(this._provider);
        const programId = (params === null || params === void 0 ? void 0 : params.programId) || DEFAULT_CONFIG.DEBRIDGE_PROGRAM_ID;
        const settingsProgramId = (params === null || params === void 0 ? void 0 : params.settingsProgramId) || DEFAULT_CONFIG.SETTINGS_PROGRAM_ID;
        this.associatedTokenProgramId = new PublicKey((params === null || params === void 0 ? void 0 : params.associatedTokenProgramId) || DEFAULT_CONFIG.ASSOCIATED_TOKEN_PROGRAM_ID);
        if (params === null || params === void 0 ? void 0 : params.debug) {
            logger.setLevel(logger.levels.DEBUG);
            this.debug = true;
        }
        this.priorityFeeConfig = params === null || params === void 0 ? void 0 : params.priorityFeeConfig;
        this._settingsProgram = new Program(settingsIdl, settingsProgramId, this._provider);
        this._program = new Program(programIdl, programId, this._provider);
        this.accountsResolver = DeBridgeResolver(this.program.programId, this.settingsProgram.programId).methods;
        [this.statePublicKey] = this.accountsResolver.getStateAddress();
        this.getStateSafe = memoize(this.getStateSafe.bind(this), { maxSize: 1, isPromise: true });
        this.getBridgeFeeSafe = memoize(this.getBridgeFeeSafe.bind(this), {
            transformKey: ((args) => [args[0].toBase58()]),
            maxSize: 5,
            isPromise: true,
        });
        //this.getBridgeInfoSafe = memoize<DeBridgeSolanaClient["getBridgeInfoSafe"]>(this.getBridgeInfoSafe.bind(this), {
        //	transformKey: ((args: [PublicKey]) => [args[0].toBase58()]) as MicroMemoize.KeyTransformer,
        //	maxSize: 5,
        //});
        this.getChainSupportInfoSafe = memoize(this.getChainSupportInfoSafe.bind(this), {
            transformKey: ((args) => [args[0].toBase58(), args[1] ? 1 : 0]),
            isPromise: true,
        });
        this.getDiscountInfoSafe = memoize(this.getDiscountInfoSafe.bind(this), {
            maxSize: 1,
            isPromise: true,
        });
        this.getBridgeFee = memoize(this.getBridgeFee.bind(this), {
            transformKey: ((args) => [args[0].toBase58(), args[1].toString()]),
            maxSize: 10,
            isPromise: true,
        });
        this.getRent = memoize(this.getRent.bind(this), { isPromise: true });
        this.decoder = buildDebridgeDecoder(this.program, this.settingsProgram);
    }
    /**
     * Async constructor for this class
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const state = yield this.getStateSafe();
                this.feeBeneficiarAccount = state.feeBeneficiary;
                return yield Promise.resolve();
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    getSubmissionState(submissionId, calldata, subscriptionCommitment = "confirmed") {
        return __awaiter(this, void 0, void 0, function* () {
            submissionId = isBuffer(submissionId) ? submissionId : helpers.hexToBuffer(submissionId);
            let externalCallStorage = undefined;
            let externalCallMeta = undefined;
            if (calldata !== undefined) {
                try {
                    const existingSubmission = yield this.getSubmissionInfoSafe(this.accountsResolver.getSubmissionAddress(submissionId)[0]);
                    if (!existingSubmission.claimer.equals(calldata.executor)) {
                        logger.warn(`[getSubmissionState] Submission already is claimed by ${existingSubmission.claimer.toBase58()}, using it's calldata storage`);
                        externalCallStorage = this.accountsResolver.getExternalCallStorageAddress(submissionId, existingSubmission.claimer, calldata.sourceChain)[0];
                    }
                    else {
                        externalCallStorage = this.accountsResolver.getExternalCallStorageAddress(submissionId, calldata.executor, calldata.sourceChain)[0];
                    }
                }
                catch (e) {
                    externalCallStorage = this.accountsResolver.getExternalCallStorageAddress(submissionId, calldata.executor, calldata.sourceChain)[0];
                }
                finally {
                    // account exists
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    externalCallMeta = this.accountsResolver.getExternalCallMetaAddress(externalCallStorage)[0];
                }
            }
            const state = new Submission.SubmissionState(this.decoder, this._connection, submissionId, {
                confirmationStorage: this.accountsResolver.getConfirmationsStorageAddress(submissionId)[0],
                submission: this.accountsResolver.getSubmissionAddress(submissionId)[0],
                externalCall: externalCallMeta && externalCallStorage
                    ? {
                        externalCallStorage,
                        externalCallMeta,
                    }
                    : null,
            }, logger.debug.bind(logger), undefined, subscriptionCommitment);
            return state.getInitialState();
        });
    }
    /**
     * Checks if instance is initialized
     * @returns true if this.init() was called before and client is ready for work
     */
    isInitialized() {
        return (this === null || this === void 0 ? void 0 : this.feeBeneficiarAccount) !== undefined;
    }
    get _connection() {
        return this._provider.connection;
    }
    updateConnection(newConnection) {
        this._provider = new AnchorProvider(newConnection, this._provider.wallet, this._provider.opts);
        // TODO: investigate if we can update provider for anchor.program without initializing new object
        this._settingsProgram = new Program(settingsIdl, this.settingsProgram.programId, this._provider);
        this._program = new Program(programIdl, this.program.programId, this._provider);
    }
    updateWallet(newWallet) {
        this._provider = new AnchorProvider(this._provider.connection, newWallet, this.provider.opts);
        this._settingsProgram = new Program(settingsIdl, this.settingsProgram.programId, this._provider);
        this._program = new Program(programIdl, this.program.programId, this._provider);
        this._wallet = newWallet;
    }
    updateWalletAndConnection(newConnection, newWallet) {
        this._provider = new AnchorProvider(newConnection, newWallet, this.provider.opts);
        this._settingsProgram = new Program(settingsIdl, this.settingsProgram.programId, this._provider);
        this._program = new Program(programIdl, this.program.programId, this._provider);
        this._wallet = newWallet;
    }
    getAccountInfo(account, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield this._connection.getAccountInfo(new PublicKey(account), commitment || this._connection.commitment);
            if (info && info.lamports !== 0) {
                return info;
            }
            else {
                return null;
            }
        });
    }
    checkIfAccountExists(account) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield this.getAccountInfo(account);
            return info !== null;
        });
    }
    /**
     * Get number of confirmations in provided storage
     * @param confirmationsStorage address of confirmation storage
     * @returns number of confirmations in storage
     */
    getConfirmationsCount(confirmationsStorage) {
        return __awaiter(this, void 0, void 0, function* () {
            confirmationsStorage = new PublicKey(confirmationsStorage);
            const stateStorage = yield this.getStateSafe();
            const requiredConfirmations = stateStorage.confirmationGuard.minConfirmations;
            let haveConfirmations = 0;
            try {
                const confirmationsStorageData = yield this.getConfirmationStorageSafe(confirmationsStorage);
                haveConfirmations = confirmationsStorageData.oracles.length;
                return { haveConfirmations, requiredConfirmations };
            }
            catch (error) {
                throw new Error("Failed to get confirmations");
            }
        });
    }
    /**
     * Waits until confirmation storage is filed
     * @param confStorage address of confirmations storage
     * @param retries number of retries before code will fail
     * @returns true when confirmation storage is filled properly
     */
    waitForConfirmations(confStorage, retries = 10, timeout = 2500) {
        return __awaiter(this, void 0, void 0, function* () {
            confStorage = new PublicKey(confStorage);
            for (let i = 0; i < retries; i++) {
                try {
                    yield helpers.sleep(timeout);
                    const { haveConfirmations, requiredConfirmations } = yield this.getConfirmationsCount(confStorage);
                    if (this.debug)
                        logger.debug(`got confirmations: ${haveConfirmations}, required: ${requiredConfirmations}`);
                    if (haveConfirmations >= requiredConfirmations) {
                        return true;
                    }
                }
                catch (e) {
                    logger.info("Failed to get confirmation storage");
                }
            }
            return false;
        });
    }
    /**
     * Checks if confirmations storage contains enough signatures
     * @param storage confirmations storage account
     * @returns true if stored confirmations count is enough for claim
     */
    isEnoughConfirmationsStored(storage) {
        return __awaiter(this, void 0, void 0, function* () {
            storage = new PublicKey(storage);
            try {
                const confirmations = yield this.getConfirmationsCount(storage);
                return confirmations.haveConfirmations >= confirmations.requiredConfirmations;
            }
            catch (_a) {
                return false;
            }
        });
    }
    buildInitNonceMasterTranscation(payer) {
        return __awaiter(this, void 0, void 0, function* () {
            payer = new PublicKey(payer);
            return {
                instructions: [
                    yield instructions
                        .initNonceMasterInstruction(this._program, { nonceStorage: this.accountsResolver.getNonceAddress()[0], payer })
                        .instruction(),
                ],
                payer,
            };
        });
    }
    /**
     * Checks if bridge initialized
     * @param debridgeId hex-encoded string
     * @returns true if bridge initialized
     */
    isMintBridgeInitialized(debridgeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [tokenMintAccount] = this.accountsResolver.getTokenMintAddress(helpers.hexToBuffer(debridgeId));
            const [bridgeAccount] = this.accountsResolver.getBridgeAddress(tokenMintAccount);
            try {
                yield this.getBridgeInfoSafe(bridgeAccount);
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
    /**
     * Checks if bridge fee info initialized
     * @param debridgeId
     * @param chainIdFrom
     * @returns true if bridge fee info initialized
     */
    isBridgeFeeInfoInitialized(debridgeId, chainIdFrom) {
        return __awaiter(this, void 0, void 0, function* () {
            const chainIdBuffer = crypto.normalizeChainId(chainIdFrom);
            const [tokenMintAccount] = this.accountsResolver.getTokenMintAddress(helpers.hexToBuffer(debridgeId));
            const [bridgeAccount] = this.accountsResolver.getBridgeAddress(tokenMintAccount);
            const [bridgeFeeAccount] = this.accountsResolver.getBridgeFeeAddress(bridgeAccount, chainIdBuffer);
            try {
                yield this.getBridgeFeeSafe(bridgeFeeAccount);
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
    /**
     * Extracts deBridge events from the transaction logs
     * @param txHash trnasaction hash
     * @returns deBridge and deBridgeSettings events
     */
    getEventsFromTransaction(txHash) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const txData = yield this._connection.getTransaction(txHash, { maxSupportedTransactionVersion: 0 });
            if (!txData)
                throw new Error("Failed to get tx");
            const eventMarker = "Program data: ";
            const events = [];
            for (const log of ((_a = txData.meta) === null || _a === void 0 ? void 0 : _a.logMessages) || []) {
                if (!log.startsWith(eventMarker))
                    continue;
                const slicedLog = log.slice(eventMarker.length);
                let decoded = this.program.coder.events.decode(slicedLog);
                if (!decoded)
                    decoded = this.settingsProgram.coder.events.decode(slicedLog);
                if (decoded)
                    events.push(decoded);
            }
            return events;
        });
    }
    /**
     * Invokes the given callback every time the Transferred event is emitted.
     *
     * @param handler The function to invoke whenever the Transferred event is emitted from
     *                program logs
     * @returns subscription id
     */
    onTransferred(handler) {
        return this.program.addEventListener(TRANSFERRED_EVENT, handler);
    }
    /**
     * Invokes the given callback every time the Bridged event is emitted.
     *
     * @param handler The function to invoke whenever the Bridged event is emitted from
     *                program logs
     * @returns subscription id
     */
    onBridged(handler) {
        return this.program.addEventListener(BRIDGED_EVENT, handler);
    }
    /**
     * Removes subscription on transferred or bridged events
     *
     * @param subscriptionId id of subscription returned from {@link onBridged} or {@link onTransferred}
     */
    removeOnEvent(subscriptionId) {
        return this.program.removeEventListener(subscriptionId);
    }
    /**
     * Returns balance of the bridge associated with the mint or throws error if no such bridge were found
     * @param tokenMint address of mint for some token
     * @returns balance of the bridge or throws error if no bridge were found
     */
    getBridgeBalance(tokenMint) {
        return __awaiter(this, void 0, void 0, function* () {
            tokenMint = new PublicKey(tokenMint);
            const [bridgeAccount] = this.accountsResolver.getBridgeAddress(tokenMint);
            const bridgeData = yield this.getBridgeInfoSafe(bridgeAccount);
            return bridgeData.info.balance;
        });
    }
    /**
     * Gets fix fee and transfer fee from chain support info (if exists, else global values)
     * @param chainSupportInfo
     * @returns fixed fee, transfer fee bps
     */
    getFeesOrGlobal(chainSupportInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (customIsPubkey(chainSupportInfo))
                chainSupportInfo = yield this.getChainSupportInfoSafe(chainSupportInfo, false);
            let supportedChainInfo;
            const state = yield this.getStateSafe();
            if (isSupportedChainInfoType(chainSupportInfo.data)) {
                supportedChainInfo = chainSupportInfo.data;
            }
            else {
                throw new Error(`Chain not supported!`);
            }
            return {
                fixedFee: supportedChainInfo.supported.fixedFee || state.globalFixedFee,
                transferFeeBps: supportedChainInfo.supported.transferFeeBps || state.globalTransferFeeBps,
            };
        });
    }
    static calculateFeeInternal(amount, useAssetFee, isSol, fees, bridgeFee, activeDiscount) {
        let fixedFee = fees.fixedFee;
        if (useAssetFee) {
            if (!bridgeFee)
                throw new Error("useAssetFee is true, but bridgeFee object is null");
            fixedFee = (bridgeFee === null || bridgeFee === void 0 ? void 0 : bridgeFee.assetChainFee) || fixedFee;
        }
        const fixFeeVariant = useAssetFee ? FixedFeeType.ASSET : FixedFeeType.NATIVE;
        // fixed fee
        if (activeDiscount) {
            const discount = fixedFee.muln(activeDiscount.active.fixBps).divn(constants.BPS_DENOMINATOR);
            fixedFee = fixedFee.sub(discount);
        }
        if (useAssetFee) {
            amount = amount.sub(fixedFee);
        }
        // transfer fee
        let calculatedTransferFee = amount.mul(fees.transferFeeBps).divn(constants.BPS_DENOMINATOR);
        if (activeDiscount) {
            const discount = calculatedTransferFee.muln(activeDiscount.active.transferBps).divn(constants.BPS_DENOMINATOR);
            calculatedTransferFee = calculatedTransferFee.sub(discount);
        }
        const discountResult = activeDiscount ? Object.assign({}, activeDiscount.active) : { fixBps: 0, transferBps: 0 };
        return {
            fixed: { amount: fixedFee, type: fixFeeVariant },
            transfer: calculatedTransferFee,
            discount: discountResult,
            finalAmount: amount.sub(calculatedTransferFee),
        };
    }
    getBridgeFee(tokenMint, chainIdBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const [bridgeAccount] = this.accountsResolver.getBridgeAddress(tokenMint);
            const [bridgeFeeAccount] = this.accountsResolver.getBridgeFeeAddress(bridgeAccount, chainIdBuffer);
            const bridgeFee = yield this.getBridgeFeeSafe(bridgeFeeAccount);
            return [bridgeFeeAccount, bridgeFee];
        });
    }
    /**
     * Gets submission status from the chain
     * @param submissionId
     * @returns submission status with context
     */
    getSubmissionStatus(submissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            submissionId = isBuffer(submissionId) ? submissionId : helpers.hexToBuffer(submissionId);
            let submission;
            const [submissionAccount] = this.accountsResolver.getSubmissionAddress(submissionId);
            try {
                submission = yield this.getSubmissionInfoSafe(submissionAccount);
            }
            catch (_a) {
                logger.info(`Failed to get submission account: ${submissionAccount.toBase58()}`);
                return {
                    type: "notClaimed",
                    data: null,
                };
            }
            const [extCallStorageAccount] = this.accountsResolver.getExternalCallStorageAddress(submissionId, submission.claimer, Buffer.from(submission.sourceChainId));
            const [extCallMeta] = this.accountsResolver.getExternalCallMetaAddress(extCallStorageAccount);
            let meta;
            try {
                meta = yield this.getExternalCallMetaSafe(extCallMeta);
                // logger.warn(meta);
            }
            catch (_b) {
                // No meta - ext call was executed or fallbacked
                const parser = new SolanaParser([{ idl: programIdl, programId: this._program.programId }]);
                const transactions = yield this._connection.getSignaturesForAddress(extCallMeta, { limit: 100 });
                for (const txHash of transactions) {
                    const parsed = yield parser.parseTransaction(this._connection, txHash.signature, true);
                    if (!parsed)
                        throw new Error(`Failed to get tx: ${txHash.signature}`);
                    // start from latest instruction
                    for (const parsedIx of parsed.reverse()) {
                        if (!parsedIx.programId.equals(this._program.programId))
                            continue;
                        if (parsedIx.name === "executeExternalCall")
                            return { type: "executed", data: null };
                        else if (parsedIx.name === "makeFallbackForExternalCall")
                            return { type: "fallback", data: null };
                    }
                    yield helpers.sleep(1000);
                }
                return null;
            }
            if (isExtCallMetaAccumulation(meta.data)) {
                return {
                    type: "accumulation",
                    data: meta.data,
                };
            }
            else if (isExtCallMetaExecuted(meta.data)) {
                return {
                    type: "executed",
                    data: meta.data,
                };
            }
            else if (isExtCallMetaFailed(meta.data)) {
                return {
                    type: "fallback",
                    data: meta.data,
                };
            }
            else {
                return {
                    type: "executing",
                    data: meta.data,
                };
            }
        });
    }
    /*
    Calculate decimals for Solana wrapped token based on common decimals value for EVM networks.

    This is necessary for compatibility with the general protocol. In Solana the amount of tokens
    in wallet is stored in the u64 type, and in EVM networks in u256 type.
     By agreement, if the token decimal from the EVM network is less than 8, then it remains unchanged in Solana.
    If it is more than 8, then the decimals of the wrapped token created in Solana are equal 8.
    */
    getWrapperDecimals(decimals) {
        return Math.min(decimals, 8);
    }
    /**
     * Calculate fee of claim execution in solana
     * @param senderAddressLength length of sender in bytes
     * @param bridgeId id of bridge used to bridge assets
     * @param solPrice price of 1 SOL in usd
     * @param tokenPrice price of token to send into solana in usd
     * @param tokenDecimals decimals of token to send into solana
     * @param walletExists is receiver wallet exists
     * @param executionFeeMultiplier multiplier of profitability for claimers
     * @returns execution fee
     */
    calculateExecutionFee(senderAddressLength, bridgeId, solPrice, tokenPrice, tokenDecimals, walletExists, executionFeeMultiplier, isRequiredTempRentCost, extCall) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rent, bridge, guard] = yield Promise.all([
                this.getRent(),
                this.getBridgeByDeBridgeId(bridgeId),
                (yield this.getStateSafe()).confirmationGuard,
            ]);
            const signaturePrice = BigInt(5000);
            const costInput = new wasm.CostCalculationInput(senderAddressLength, isRequiredTempRentCost, guard.excessConfirmations, BigInt(rent.lamportsPerByteYear), rent.exemptionThreshold, signaturePrice, BigInt(0), solPrice, tokenPrice, tokenDecimals, bridge !== null, walletExists, false, executionFeeMultiplier - 1, extCall ? BigInt(extCall.length) : undefined);
            const weiPrice = BigInt(yield costInput.calculate_recomended_claim_execution_fee());
            costInput.free();
            const rewards = [];
            if (extCall) {
                const solanaDimensionCostInput = new wasm.CostCalculationInput(senderAddressLength, isRequiredTempRentCost, guard.excessConfirmations, BigInt(rent.lamportsPerByteYear), rent.exemptionThreshold, signaturePrice, BigInt(0), solPrice, tokenPrice, this.getWrapperDecimals(tokenDecimals), bridge !== null, walletExists, false, executionFeeMultiplier - 1, extCall ? BigInt(extCall.length) : undefined);
                const externalCallWithRewards = solanaDimensionCostInput.calculate_recomended_reward_for_external_call(extCall);
                const ixs = extCallDataToInstructions(externalCallWithRewards);
                for (const ix of ixs) {
                    rewards.push(ix.reward);
                }
                extCall = externalCallWithRewards;
                solanaDimensionCostInput.free();
            }
            const denormalize = (amount, decimals) => BigInt(new BN(amount.toString()).mul(new BN(10).pow(new BN(decimals - 8))).toString());
            return {
                claimCost: weiPrice,
                rewards,
                executionCost: rewards.map((reward) => denormalize(reward, tokenDecimals)).reduce((acc, val) => acc + val, BigInt(0)),
                externalCallWithRewards: extCall,
                total: weiPrice + rewards.reduce((acc, val) => acc + val, BigInt(0)),
            };
        });
    }
    /**
     * Calculates fee for specified transfer params
     * @param tokenMint mint of token to transfer
     * @param chainId id of the destination chain we want to send tokens
     * @param discountAccount account for which we'll try to find discount
     * @param useAssetFee asset or native execution fee
     * @param amount amount of transferrable assets
     * @returns information about fee
     */
    calculateFee(tokenMint, chainId, discountAccount, useAssetFee, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            tokenMint = new PublicKey(tokenMint);
            const chainIdBuffer = crypto.normalizeChainId(chainId);
            const [chainSupportInfoAccount] = this.accountsResolver.getChainSupportInfoAddress(chainIdBuffer);
            const fees = yield this.getFeesOrGlobal(chainSupportInfoAccount);
            let activeDiscount = undefined;
            if (discountAccount) {
                const [discountInfoAccount] = this.accountsResolver.getDiscountInfoAddress(new PublicKey(discountAccount));
                const discountInfo = yield this.getDiscountInfoSafe(discountInfoAccount, true);
                if (discountInfo) {
                    activeDiscount = discountInfo;
                }
            }
            let brdigeFeeOrNull = undefined;
            // fixed fee
            if (useAssetFee) {
                const [bridgeFeeAccount, bridgeFee] = yield this.getBridgeFee(tokenMint, chainIdBuffer);
                if (!bridgeFee.assetChainFee) {
                    throw new AssetFeeNotSupported(bridgeFeeAccount);
                }
                brdigeFeeOrNull = bridgeFee;
            }
            return DeBridgeSolanaClient.calculateFeeInternal(new BN(amount), useAssetFee, tokenMint == WRAPPED_SOL_MINT, fees, brdigeFeeOrNull, activeDiscount);
        });
    }
    /**
     * Returns bridge info from solana by debridgeId
     * @param deBridgeId bridge id in deBridge network, {@link hashDebridgeId}
     * @returns null if bridge not exists or bridge token address and bridge info from solana blockchain
     */
    getBridgeByDeBridgeId(deBridgeId) {
        return __awaiter(this, void 0, void 0, function* () {
            deBridgeId = isBuffer(deBridgeId) ? deBridgeId : helpers.hexToBuffer(deBridgeId);
            const [mapAccount] = this.accountsResolver.getBridgeMapAddress(deBridgeId);
            const accountData = yield this.getAccountInfo(mapAccount);
            if (!accountData)
                return null;
            let tokenMint;
            if (TOKEN_PROGRAM_ID.equals(accountData.owner)) {
                tokenMint = mapAccount;
            }
            else {
                const decoded = this.settingsProgram.coder.accounts.decode("sendBridgeMap", accountData.data);
                tokenMint = decoded.tokenMint;
            }
            const [bridgeAccount] = this.accountsResolver.getBridgeAddress(tokenMint);
            const bridge = yield this.getBridgeInfoSafe(bridgeAccount);
            return { bridge, tokenMint };
        });
    }
    getRent() {
        return __awaiter(this, void 0, void 0, function* () {
            const rentData = yield this.getAccountInfo(SYSVAR_RENT_PUBKEY);
            if (!rentData)
                throw new Error("unexpected! Failed to get RENT_SYSVAR data");
            const rentStruct = struct([nu64("lamportsPerByteYear"), f64("exemptionThreshold"), u8("burnPercent")]);
            return rentStruct.decode(rentData.data);
        });
    }
    /**
     * Returns parsed state of smart-contract from blockchain
     * @returns parsed bridge state
     */
    getStateSafe() {
        return __awaiter(this, void 0, void 0, function* () {
            const stateData = yield this.getAccountInfo(this.statePublicKey);
            if (!stateData) {
                throw new BridgeStateNotExists(this.statePublicKey);
            }
            let parsedState;
            try {
                parsedState = this.settingsProgram.coder.accounts.decode("state", stateData.data);
            }
            catch (error) {
                if (error instanceof StructDecodeError)
                    throw new BridgeStateMalformed(this.statePublicKey);
                throw error;
            }
            return parsedState;
        });
    }
    /**
     * Returns parsed confirmation storage, may be used to get current confirmations count
     * @param confirmationStorage account of ConfirmationStorage for specific deployInfo/submission
     * @returns parsed confirmation storage
     */
    getConfirmationStorageSafe(confirmationStorage) {
        return __awaiter(this, void 0, void 0, function* () {
            confirmationStorage = new PublicKey(confirmationStorage);
            if (!confirmationStorage)
                throw new Error("confirmationStorageAccount not set");
            const confirmationStorageData = yield this.getAccountInfo(confirmationStorage);
            if (!confirmationStorageData)
                throw new Error("No data in confirmation storage account " + confirmationStorage.toString());
            let parsedConfirmationStorage;
            try {
                parsedConfirmationStorage = this.settingsProgram.coder.accounts.decode("confirmationStorage", confirmationStorageData.data);
            }
            catch (error) {
                if (error instanceof StructDecodeError)
                    throw new ConfirmationStorageMalformed(confirmationStorage);
                throw error;
            }
            return parsedConfirmationStorage;
        });
    }
    /**
     * Returns parsed chainSupportInfo from blockchain or raises error
     * @param chainSupportInfo account of chainSupportInfo
     * @param checkIfSupported check if chainSupportInfo is supported
     * @returns parsed chainSupportInfo
     */
    getChainSupportInfoSafe(chainSupportInfo, checkIfSupported = true) {
        return __awaiter(this, void 0, void 0, function* () {
            chainSupportInfo = new PublicKey(chainSupportInfo);
            const chainSupportInfoData = yield this.getAccountInfo(chainSupportInfo);
            if (!chainSupportInfoData) {
                throw new ChainSupportInfoNotInitialized(chainSupportInfo);
            }
            let parsedChainSupportInfo;
            try {
                parsedChainSupportInfo = this.settingsProgram.coder.accounts.decode("chainSupportInfo", chainSupportInfoData.data);
            }
            catch (error) {
                if (error instanceof StructDecodeError)
                    throw new ChainSupportInfoMalformed(chainSupportInfo);
                throw error;
            }
            if (checkIfSupported && !isSupportedChainInfoType(parsedChainSupportInfo.data)) {
                throw new ChainSupportInfoNotSupported(chainSupportInfo);
            }
            return parsedChainSupportInfo;
        });
    }
    static getBridgeInfoFromBridgeType(bridge) {
        if (bridge === null) {
            throw new Error("Empty parsed bridge data");
        }
        if (isMintBridge(bridge.data)) {
            return bridge.data.mint.info;
        }
        else if (isSendBridge(bridge.data)) {
            return bridge.data.send.info;
        }
        else {
            throw new Error("Bridge not supported!");
        }
    }
    /**
     * Returns parsed bridgeInfo from blockchain or raises error
     * @param bridge account of bridgeInfo
     * @returns parsed bridgeInfo
     */
    getBridgeInfoSafe(bridge) {
        return __awaiter(this, void 0, void 0, function* () {
            bridge = new PublicKey(bridge);
            const bridgeData = yield this.getAccountInfo(bridge);
            if (!bridgeData) {
                throw new BridgeNotExists(bridge);
            }
            let parsedBridge;
            try {
                parsedBridge = this.decoder.decodeBridge(bridgeData.data);
            }
            catch (error) {
                if (error instanceof StructDecodeError)
                    throw new BridgeMalformed(bridge);
                throw error;
            }
            if (parsedBridge === null)
                throw new BridgeMalformed(bridge);
            return Object.assign(Object.assign({}, parsedBridge), { info: DeBridgeSolanaClient.getBridgeInfoFromBridgeType(parsedBridge) });
        });
    }
    /**
     * Returns parsed bridgeFee from blockchain or raises error
     * @param bridgeFee account of bridgeFee
     * @returns parsed bridgeFee
     */
    getBridgeFeeSafe(bridgeFee) {
        return __awaiter(this, void 0, void 0, function* () {
            bridgeFee = new PublicKey(bridgeFee);
            const bridgeFeeData = yield this.getAccountInfo(bridgeFee);
            if (!bridgeFeeData) {
                throw new BridgeFeeNotInitialized(bridgeFee);
            }
            let parsedBridgeFee;
            try {
                parsedBridgeFee = this.settingsProgram.coder.accounts.decode("bridgeFeeInfo", bridgeFeeData.data);
            }
            catch (error) {
                if (error instanceof StructDecodeError)
                    throw new BridgeFeeMalformed(bridgeFee);
                throw error;
            }
            return parsedBridgeFee;
        });
    }
    /**
     * Returns parsed activeDiscountInfo from blockchain or raises error
     * @param discount account of discount info
     * @param returnNullIfNoDiscount dont raise error if discount not found/malformed/not active, just return null
     * @returns parsed activeDiscountInfo
     */
    getDiscountInfoSafe(discount, returnNullIfNoDiscount = true) {
        return __awaiter(this, void 0, void 0, function* () {
            discount = new PublicKey(discount);
            const discountData = yield this.getAccountInfo(discount);
            if (!discountData) {
                return undefined;
            }
            let parsedDiscount;
            try {
                parsedDiscount = this.settingsProgram.coder.accounts.decode("discountInfo", discountData.data);
            }
            catch (error) {
                if (error instanceof StructDecodeError)
                    throw new DiscountInfoMalformed(discount);
                throw error;
            }
            if (!isActiveDiscount(parsedDiscount.data)) {
                if (returnNullIfNoDiscount) {
                    return undefined;
                }
                else {
                    throw new DiscountNotActive(discount);
                }
            }
            return parsedDiscount.data;
        });
    }
    /**
     * Fetches submission info from blockchain
     * @param submission account of submissioon
     * @returns parsed submission info
     */
    getSubmissionInfoSafe(submission, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            submission = new PublicKey(submission);
            commitment = commitment || this._connection.commitment;
            const fetched = yield this.program.account.submissionAccount.fetchNullable(submission, commitment);
            if (fetched) {
                return fetched;
            }
            else {
                throw new SubmissionInfoNotExists(submission);
            }
        });
    }
    /**
     * Fetches extCallMeta from blockchain
     * @param externalCallMeta account of ext call meta
     * @returns parsed external call metadata
     */
    getExternalCallMetaSafe(externalCallMeta, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            externalCallMeta = new PublicKey(externalCallMeta);
            commitment = commitment || this._connection.commitment;
            const fetched = yield this.program.account.externalCallMeta.fetchNullable(externalCallMeta, commitment);
            if (fetched) {
                return fetched;
            }
            else {
                throw new ExternalCallMetaNotExists(externalCallMeta);
            }
        });
    }
    /**
     * Builds fallback transaction
     * @param submissionId
     * @param executor who pays for the actions
     * @returns list of transactions with fallback ix and close unused wallets ixs
     */
    buildFallbackTransactions(submissionId, executor) {
        return __awaiter(this, void 0, void 0, function* () {
            executor = new PublicKey(executor);
            const result = [{ instructions: [], payer: executor }];
            const submissionIdBuffer = isBuffer(submissionId) ? submissionId : helpers.hexToBuffer(submissionId);
            const [submission] = this.accountsResolver.getSubmissionAddress(submissionIdBuffer);
            const [submissionAuth, submissionAuthBump] = this.accountsResolver.getSubmissionAuthAddress(submission);
            const submissionInfo = yield this.getSubmissionInfoSafe(submission);
            const [submissionWallet] = findAssociatedTokenAddress(submissionAuth, submissionInfo.tokenMint, this.associatedTokenProgramId);
            const [externalCallStorage] = this.accountsResolver.getExternalCallStorageAddress(submissionIdBuffer, submissionInfo.claimer, Buffer.from(submissionInfo.sourceChainId));
            const [externalCallMeta] = this.accountsResolver.getExternalCallMetaAddress(externalCallStorage);
            const [bridge] = this.accountsResolver.getBridgeAddress(submissionInfo.tokenMint);
            const [fallbackWallet] = findAssociatedTokenAddress(submissionInfo.fallbackAddress, submissionInfo.tokenMint, this.associatedTokenProgramId);
            if ((yield this.getAccountInfo(fallbackWallet)) === null)
                result[0].instructions.push(spl.createAssociatedWalletInstruction(submissionInfo.tokenMint, fallbackWallet, submissionInfo.fallbackAddress, executor));
            // make fallback
            const fallbackBuilder = instructions.buildMakeFallbackForExternalCallInstruction(this.program, {
                submission,
                tokenMint: submissionInfo.tokenMint,
                originalClaimer: submissionInfo.claimer,
                state: this.statePublicKey,
                fallbackAddress: submissionInfo.fallbackAddress,
                bridge,
                externalCallStorage,
                externalCallMeta,
                submissionAuth,
                submissionWallet,
                fallbackAddressWallet: fallbackWallet,
                executor,
                rewardBeneficiaryWallet: findAssociatedTokenAddress(executor, submissionInfo.tokenMint, this.associatedTokenProgramId)[0],
            }, { submissionId: submissionIdBuffer, submissionAuthBump });
            result[0].instructions.push(yield fallbackBuilder.instruction());
            // find submissionAuth ATAs
            const walletsToClose = yield spl.getAllTokenAccountsWithBalances(this._connection, submissionAuth);
            const closePairs = yield Promise.all(walletsToClose
                .filter((wallet) => !wallet.address.equals(submissionWallet))
                .map((wallet) => __awaiter(this, void 0, void 0, function* () {
                const ixs = [];
                const [fallbackForWallet] = findAssociatedTokenAddress(submissionInfo.fallbackAddress, wallet.mint, this.associatedTokenProgramId);
                if (!(yield this.checkIfAccountExists(fallbackForWallet)))
                    ixs.push(spl.createAssociatedWalletInstruction(wallet.mint, fallbackForWallet, submissionInfo.fallbackAddress, executor));
                const closeSubAuthWalletBuilder = instructions.buildCloseSubmissionAuthWalletInstruction(this.program, {
                    externalCallMeta,
                    externalCallStorage,
                    originalClaimer: submissionInfo.claimer,
                    tokenMint: wallet.mint,
                    submission,
                    submissionAuth,
                    submissionAuthLostWallet: wallet.address,
                    fallbackAddressWallet: fallbackForWallet,
                }, { submissionId: submissionIdBuffer, submissionAuthBump });
                ixs.push(yield closeSubAuthWalletBuilder.instruction());
                return ixs;
            }), this));
            // pack [init wallet]+close ix as tight as possible
            for (const closePair of closePairs) {
                const clonedTx = new Transaction().add(...result[result.length - 1].instructions);
                clonedTx.add(...closePair);
                const txSize = txs.getTransactionSize(clonedTx);
                if (txSize != null && txSize <= 1230) {
                    result[result.length - 1].instructions.push(...closePair);
                }
                else {
                    result.push({ instructions: closePair, payer: executor });
                }
            }
            return result;
        });
    }
    /**
     * Builds transaction for mint bridge initialization
     * @param payer who pays for initialization
     * @param chainId native chain id
     * @param tokenAddress hex-encoded native token address
     * @param tokenName name of the token
     * @param tokenSymbol token symbol
     * @param decimals otken decimals
     * @returns built transaction
     */
    buildInitializeMintBridgeTransaction(payer, chainId, tokenAddress, tokenName, tokenSymbol, decimals) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInitialized())
                yield this.init();
            payer = new PublicKey(payer);
            const chainIdBuffer = crypto.normalizeChainId(chainId);
            const [chainSupportInfoAccount] = this.accountsResolver.getChainSupportInfoAddress(chainIdBuffer);
            const chainSupportInfo = yield this.getChainSupportInfoSafe(chainSupportInfoAccount);
            if (!isSupportedChainInfoType(chainSupportInfo.data)) {
                throw new Error("chain supoprt info not supported!");
            }
            const nativeTokenAddress = helpers.hexToBuffer(tokenAddress);
            if (nativeTokenAddress.length != chainSupportInfo.data.supported.chainAddressLen) {
                throw new Error(`Bad token address len, expected: ${chainSupportInfo.data.supported.chainAddressLen}, got: ${tokenAddress.length}`);
            }
            const debridgeId = crypto.hashDebridgeId(chainIdBuffer, "0x" + nativeTokenAddress.toString("hex"));
            const message = crypto.hashDeployInfo({ decimals, tokenName, tokenSymbol, debridgeId });
            const [confirmationStorage] = this.accountsResolver.getConfirmationsStorageAddress(helpers.hexToBuffer(message));
            let confirmationStorageCreator = payer;
            try {
                const storage = yield this.getConfirmationStorageSafe(confirmationStorage);
                confirmationStorageCreator = storage.creator;
            }
            catch (_a) {
                logger.debug("No confirmation storage exists -> confirmationStorageCreator is payer");
            }
            const [tokenMint] = this.accountsResolver.getTokenMintAddress(helpers.hexToBuffer(debridgeId));
            const [bridgeData] = this.accountsResolver.getBridgeAddress(tokenMint);
            const [mintAuthority] = this.accountsResolver.getMintAuthorityAddress(bridgeData);
            const initMintBuilder = instructions.initializeMintBridgeInstruction(this._settingsProgram, {
                tokenMint,
                bridgeData,
                mintAuthority,
                confirmationStorage,
                confirmationStorageCreator,
                payer: payer,
                state: this.statePublicKey,
                feeBeneficiary: this.feeBeneficiarAccount,
                tokenMetadata: getTokenMetadataAddress(tokenMint, TOKEN_METADATA_PROGRAM_ID)[0],
                tokenMetadataMaster: this.accountsResolver.getTokenMetadataMasterAddress()[0],
            }, {
                nativeTokenAddress,
                tokenName,
                tokenSymbol,
                decimals,
                chainId: chainIdBuffer,
            });
            const result = { instructions: [yield initMintBuilder.instruction()], payer };
            return { debridgeId, transaction: result };
        });
    }
    /**
     * Builds transaction for staking wallet creation (if not exists) and send bridge initializaion
     * @param tokenMint token mint account to init bridge
     * @param payer who pays for transaction
     * @returns transaction for [staking wallet creation] and send bridge initialization
     */
    buildInitializeSendBridgeTransaction(tokenMint, payer) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            tokenMint = new PublicKey(tokenMint);
            payer = new PublicKey(payer);
            const [bridgeAccount] = this.accountsResolver.getBridgeAddress(tokenMint);
            const [mintAuthority] = this.accountsResolver.getMintAuthorityAddress(bridgeAccount);
            const [stakingWallet] = findAssociatedTokenAddress(mintAuthority, tokenMint, this.associatedTokenProgramId);
            const bridgeId = helpers.hexToBuffer(crypto.hashDebridgeId(this.chainId, tokenMint.toBuffer()));
            const [bridgeMap] = this.accountsResolver.getBridgeMapAddress(bridgeId);
            if (!(yield this.checkIfAccountExists(stakingWallet))) {
                result.push(spl.createAssociatedWalletInstruction(tokenMint, stakingWallet, mintAuthority, payer));
            }
            const initSendBuilder = instructions.initializeSendBridgeInstruction(this._settingsProgram, {
                payer,
                state: this.statePublicKey,
                tokenMint,
                bridgeData: bridgeAccount,
                mintAuthority,
                stakingWallet,
                bridgeIdMap: bridgeMap,
                tokenMetadata: getTokenMetadataAddress(tokenMint, TOKEN_METADATA_PROGRAM_ID)[0],
            });
            result.push(yield initSendBuilder.instruction());
            return { instructions: result, payer };
        });
    }
    /**
     * Builds transaction which updates bridge fee info
     * @param chainId
     * @param tokenMint
     * @param chainFee new fee value
     * @param payer
     * @returns built transaction
     */
    buildUpdateFeeBridgeInfoTransaction(chainId, tokenMint, chainFee, payer) {
        return __awaiter(this, void 0, void 0, function* () {
            tokenMint = new PublicKey(tokenMint);
            payer = new PublicKey(payer);
            const chainIdBuffer = crypto.normalizeChainId(chainId);
            const [bridgeData] = this.accountsResolver.getBridgeAddress(tokenMint);
            const [bridgeFee] = this.accountsResolver.getBridgeFeeAddress(bridgeData, chainIdBuffer);
            return {
                instructions: [
                    yield instructions
                        .updateFeeBridgeInfoInstruction(this._settingsProgram, {
                        tokenMint,
                        bridgeData,
                        state: this.statePublicKey,
                        payer: payer,
                        bridgeFee: bridgeFee,
                    }, {
                        chainFee: new BN(chainFee),
                        targetChainId: chainIdBuffer,
                    })
                        .instruction(),
                ],
                payer,
            };
        });
    }
    /**
     * Builds instruction context to use in CPI calls
     * @param sender account of sender
     * @param sendFromWallet address of wallet
     * @param payableAmount amount to send
     * @param tokenMint account of token mint of token we want to send
     * @param receiver address of receiver in another blockchain, hex string with "0x" prefix
     * @param chainIdTo id of destination blockchain
     * @param useAssetFee use assets (tokens) or native (lamports) to pay fee
     * @param fallbackAddress fallback in destination chain, hex string with "0x" prefix
     * @param flags external call flags - if SEND_HASHED flag set will process data arg as hash, not raw data
     * @param executionFee amount of tokens to pay for execution
     * @param data externall call data
     * @returns context for deBridge send
     */
    buildSendContext(sender, sendFromWallet, tokenMint, receiver, chainIdTo, useAssetFee, fallbackAddress, flags, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInitialized())
                yield this.init();
            sender = new PublicKey(sender);
            tokenMint = new PublicKey(tokenMint);
            const chainIdBuffer = crypto.normalizeChainId(chainIdTo);
            const [bridge] = this.accountsResolver.getBridgeAddress(tokenMint);
            const bridgeData = yield this.getBridgeInfoSafe(bridge);
            if (bridgeData.info.state == BridgeState.PAUSE) {
                throw new BridgePaused(bridge);
            }
            let [discountAccount] = this.accountsResolver.getDiscountInfoAddress(sender);
            const discountInfo = yield this.getDiscountInfoSafe(discountAccount);
            if (!discountInfo) {
                [discountAccount] = this.accountsResolver.getNoDiscountAddress();
                if (this.debug)
                    logger.debug(`no discount flow, no discount account: ${discountAccount.toBase58()}`);
            }
            const [mintAuthority] = this.accountsResolver.getMintAuthorityAddress(bridge);
            const [stakingWallet] = findAssociatedTokenAddress(mintAuthority, tokenMint, this.associatedTokenProgramId);
            const [chainSupportInfoAccount] = this.accountsResolver.getChainSupportInfoAddress(chainIdBuffer);
            const chainSupportInfo = yield this.getChainSupportInfoSafe(chainSupportInfoAccount, false);
            if (!isSupportedChainInfoType(chainSupportInfo.data)) {
                throw new ChainSupportInfoNotSupported(chainSupportInfoAccount);
            }
            const receiverBuffer = helpers.hexToBuffer(receiver, chainSupportInfo.data.supported.chainAddressLen);
            if (this.debug)
                logger.debug(`Receiver buffer: ${receiverBuffer.toString("hex")}`);
            if (receiverBuffer.length !== chainSupportInfo.data.supported.chainAddressLen) {
                throw Error(`Bad receiver length! Got: ${receiverBuffer.length}, expected: ${chainSupportInfo.data.supported.chainAddressLen}`);
            }
            const fallbackAddressBuffer = helpers.hexToBuffer(fallbackAddress);
            if (fallbackAddressBuffer.length !== chainSupportInfo.data.supported.chainAddressLen)
                throw Error(`Bad fallback length! Got: ${fallbackAddressBuffer.length}, expected: ${chainSupportInfo.data.supported.chainAddressLen}`);
            let [bridgeFeeAccount] = this.accountsResolver.getBridgeFeeAddress(bridge, chainIdBuffer);
            let bridgeFee = undefined;
            if (useAssetFee) {
                bridgeFee = yield this.getBridgeFeeSafe(bridgeFeeAccount);
                if (!(bridgeFee === null || bridgeFee === void 0 ? void 0 : bridgeFee.assetChainFee))
                    throw new AssetFeeNotSupported(bridgeFeeAccount);
            }
            else {
                [bridgeFeeAccount] = this.accountsResolver.getNoBridgeFeeAddress();
            }
            if (!sendFromWallet) {
                sendFromWallet = findAssociatedTokenAddress(sender, tokenMint, this.associatedTokenProgramId)[0];
            }
            const [nonceStorage] = this.accountsResolver.getNonceAddress();
            let externalCallShortcut;
            data = data ? (isBuffer(data) ? data : helpers.hexToBuffer(data)) : undefined;
            if (checkFlag(flags, SEND_HASHED_DATA)) {
                if (!data) {
                    externalCallShortcut = crypto.hashExternalCallBytes(undefined);
                }
                else {
                    externalCallShortcut = data;
                }
            }
            else {
                externalCallShortcut = crypto.hashExternalCallBytes(data);
            }
            if (this.debug)
                logger.debug(`Shortcut: ${externalCallShortcut.toString("hex")}`);
            const [externalCallStorage] = this.accountsResolver.getExternalCallStorageAddress(externalCallShortcut, sender, crypto.normalizeChainId(this.chainId));
            const [externalCallMeta] = this.accountsResolver.getExternalCallMetaAddress(externalCallStorage);
            const accounts = {
                bridgeCtx: {
                    bridge,
                    tokenMint,
                    stakingWallet,
                    mintAuthority,
                    chainSupportInfo: chainSupportInfoAccount,
                    splTokenProgram: TOKEN_PROGRAM_ID,
                    settingsProgram: this.settingsProgram.programId,
                },
                stateCtx: {
                    state: this.statePublicKey,
                    feeBeneficiary: this.feeBeneficiarAccount,
                },
                nonceStorage,
                sendFromWallet,
                sendFrom: sender,
                bridgeFee: bridgeFeeAccount,
                discount: discountAccount,
                systemProgram: SystemProgram.programId,
                externalCallStorage,
                externalCallMeta,
            };
            const accountMeta = [
                { isSigner: false, isWritable: true, pubkey: accounts.bridgeCtx.bridge },
                { isSigner: false, isWritable: true, pubkey: accounts.bridgeCtx.tokenMint },
                {
                    isSigner: false,
                    isWritable: true,
                    pubkey: accounts.bridgeCtx.stakingWallet,
                },
                {
                    isSigner: false,
                    isWritable: false,
                    pubkey: accounts.bridgeCtx.mintAuthority,
                },
                {
                    isSigner: false,
                    isWritable: false,
                    pubkey: accounts.bridgeCtx.chainSupportInfo,
                },
                {
                    isSigner: false,
                    isWritable: false,
                    pubkey: accounts.bridgeCtx.settingsProgram,
                },
                {
                    isSigner: false,
                    isWritable: false,
                    pubkey: accounts.bridgeCtx.splTokenProgram,
                },
                { isSigner: false, isWritable: true, pubkey: accounts.stateCtx.state },
                {
                    isSigner: false,
                    isWritable: true,
                    pubkey: accounts.stateCtx.feeBeneficiary,
                },
                { isSigner: false, isWritable: true, pubkey: accounts.nonceStorage },
                { isSigner: false, isWritable: true, pubkey: accounts.sendFromWallet },
                { isSigner: false, isWritable: false, pubkey: accounts.systemProgram },
                { isSigner: false, isWritable: true, pubkey: accounts.externalCallStorage },
                { isSigner: false, isWritable: true, pubkey: accounts.externalCallMeta },
                { isSigner: true, isWritable: true, pubkey: accounts.sendFrom },
                { isSigner: false, isWritable: false, pubkey: accounts.discount },
                { isSigner: false, isWritable: false, pubkey: accounts.bridgeFee },
            ];
            const flatAccounts = {
                bridge,
                tokenMint,
                stakingWallet,
                mintAuthority,
                chainSupportInfo: accounts.bridgeCtx.chainSupportInfo,
                splTokenProgram: accounts.bridgeCtx.splTokenProgram,
                settingsProgram: accounts.bridgeCtx.settingsProgram,
                state: accounts.stateCtx.state,
                feeBeneficiary: accounts.stateCtx.feeBeneficiary,
                nonceStorage,
                sendFromWallet,
                sendFrom: sender,
                bridgeFee: bridgeFeeAccount,
                discount: discountAccount,
                systemProgram: accounts.systemProgram,
                externalCallStorage,
                externalCallMeta,
            };
            return {
                asFlat: flatAccounts,
                asAccountMeta: accountMeta,
                asIdl: accounts,
            };
        });
    }
    /**
     * Builds instruction which sends tokens to another blockchain via deBridge send or mint bridge
     * @param sender account of sender
     * @param sendFromWallet address of wallet
     * @param payableAmount amount to send
     * @param tokenMint account of token mint of token we want to send
     * @param receiver address of receiver in another blockchain, hex string with "0x" prefix
     * @param chainIdTo id of destination blockchain
     * @param useAssetFee use assets (tokens) or native (lamports) to pay fee
     * @param referralCode param from evm-based networks
     * @param fallbackAddress fallback in destination chain, hex string with "0x" prefix
     * @param flags external call flags
     * @param executionFee amount of tokens to pay for execution
     * @param data externall call data
     * @param checkSenderBalance  true if sendFromWallet balance need to be checked
     * @returns deBridge send instruction with optional extCall initialization
     */
    buildSendInstruction(sender, sendFromWallet, payableAmount, tokenMint, receiver, chainIdTo, useAssetFee, referralCode, fallbackAddress, flags, executionFee, data, checkSenderBalance = true, sendFromWalletMayNotExist = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInitialized())
                yield this.init();
            sender = new PublicKey(sender);
            tokenMint = new PublicKey(tokenMint);
            const result = newTxWithOptionalPriorityFee((_a = this.priorityFeeConfig) === null || _a === void 0 ? void 0 : _a.send);
            const chainIdBuffer = crypto.normalizeChainId(chainIdTo);
            const amountBN = new BN(payableAmount);
            const [bridgeDataAccount] = this.accountsResolver.getBridgeAddress(tokenMint);
            const bridgeData = yield this.getBridgeInfoSafe(bridgeDataAccount);
            if (bridgeData.info.state == BridgeState.PAUSE) {
                throw new BridgePaused(bridgeDataAccount);
            }
            let [discountAccount] = this.accountsResolver.getDiscountInfoAddress(sender);
            const discountInfo = yield this.getDiscountInfoSafe(discountAccount);
            if (!discountInfo) {
                [discountAccount] = this.accountsResolver.getNoDiscountAddress();
                if (this.debug)
                    logger.debug(`no discount flow, no discount account: ${discountAccount.toBase58()}`);
            }
            const [mintAuthority] = this.accountsResolver.getMintAuthorityAddress(bridgeDataAccount);
            const [chainSupportInfoAccount] = this.accountsResolver.getChainSupportInfoAddress(chainIdBuffer);
            const chainSupportInfo = yield this.getChainSupportInfoSafe(chainSupportInfoAccount, false);
            if (!isSupportedChainInfoType(chainSupportInfo.data)) {
                throw new ChainSupportInfoNotSupported(chainSupportInfoAccount);
            }
            const receiverBuffer = helpers.hexToBuffer(receiver, chainSupportInfo.data.supported.chainAddressLen);
            if (receiverBuffer.length !== chainSupportInfo.data.supported.chainAddressLen) {
                throw Error(`Bad receiver length! Got: ${receiverBuffer.length}, expected: ${chainSupportInfo.data.supported.chainAddressLen}`);
            }
            if (this.debug)
                logger.debug(`Receiver buffer: ${receiverBuffer.toString("hex")}`);
            const fallbackAddressBuffer = helpers.hexToBuffer(fallbackAddress);
            if (fallbackAddressBuffer.length !== chainSupportInfo.data.supported.chainAddressLen)
                throw Error(`Bad fallback length! Got: ${fallbackAddressBuffer.length}, expected: ${chainSupportInfo.data.supported.chainAddressLen}`);
            let [bridgeFeeAccount] = this.accountsResolver.getBridgeFeeAddress(bridgeDataAccount, chainIdBuffer);
            let bridgeFee = undefined;
            if (useAssetFee) {
                bridgeFee = yield this.getBridgeFeeSafe(bridgeFeeAccount);
                if (!(bridgeFee === null || bridgeFee === void 0 ? void 0 : bridgeFee.assetChainFee))
                    throw new AssetFeeNotSupported(bridgeFeeAccount);
            }
            else {
                [bridgeFeeAccount] = this.accountsResolver.getNoBridgeFeeAddress();
            }
            if (!sendFromWallet) {
                sendFromWallet = findAssociatedTokenAddress(sender, tokenMint, this.associatedTokenProgramId)[0];
            }
            if (!(yield this.checkIfAccountExists(sendFromWallet))) {
                if (!sendFromWalletMayNotExist)
                    throw new AssociatedWalletNotInitialized(sender, sendFromWallet); // we cant send from uninitialized account since it doesnt have tokens
            }
            const [stakingWallet] = findAssociatedTokenAddress(mintAuthority, tokenMint, this.associatedTokenProgramId);
            if (!(yield this.checkIfAccountExists(stakingWallet))) {
                result.add(spl.createAssociatedWalletInstruction(tokenMint, stakingWallet, mintAuthority, sender));
            }
            const fees = DeBridgeSolanaClient.calculateFeeInternal(amountBN, useAssetFee, tokenMint == WRAPPED_SOL_MINT, yield this.getFeesOrGlobal(chainSupportInfo), bridgeFee, discountInfo);
            if (checkSenderBalance) {
                // check if we have enough tokens
                let initialBalance;
                try {
                    initialBalance = yield spl.getSPLWalletBalance(this._connection, sendFromWallet);
                }
                catch (_b) {
                    throw new AssociatedWalletNotInitialized(sender, sendFromWallet);
                }
                let balanceAfterTx = initialBalance.sub(amountBN);
                if ((useAssetFee && fees.fixed.type !== FixedFeeType.ASSET) || (!useAssetFee && fees.fixed.type !== FixedFeeType.NATIVE)) {
                    throw new Error("unreachable code");
                }
                if (useAssetFee) {
                    balanceAfterTx = balanceAfterTx.sub(fees.fixed.amount);
                }
                if (balanceAfterTx.ltn(0)) {
                    throw new NotEnoughTokens(sendFromWallet, initialBalance, amountBN);
                }
                const balance = yield spl.getNativeWalletBalance(this._connection, sender);
                if (!useAssetFee && balance.sub(fees.fixed.amount).ltn(0)) {
                    throw new NotEnoughTokens(sender, balance, fees.fixed.amount);
                }
            }
            const [nonceStorage] = this.accountsResolver.getNonceAddress();
            let externalCallShortcut;
            data = data ? (isBuffer(data) ? data : helpers.hexToBuffer(data)) : undefined;
            if (data !== undefined || executionFee !== undefined || flags !== undefined) {
                if (checkFlag(flags, SEND_HASHED_DATA)) {
                    if (!data) {
                        externalCallShortcut = crypto.hashExternalCallBytes(undefined);
                    }
                    else {
                        externalCallShortcut = data;
                    }
                }
                else {
                    externalCallShortcut = crypto.hashExternalCallBytes(data);
                }
                if (this.debug)
                    logger.debug(`Shortcut: ${externalCallShortcut.toString("hex")}`);
            }
            else {
                externalCallShortcut = crypto.hashExternalCallBytes(undefined);
            }
            const [externalCallStorage] = this.accountsResolver.getExternalCallStorageAddress(externalCallShortcut, sender, crypto.normalizeChainId(this.chainId));
            const [externalCallMeta] = this.accountsResolver.getExternalCallMetaAddress(externalCallStorage);
            if (this.debug)
                logger.debug(`external call storage: ${externalCallStorage.toBase58()}, meta: ${externalCallMeta.toBase58()}`);
            const subParams = data || executionFee || flags
                ? {
                    executionFee: new BN(executionFee !== null && executionFee !== void 0 ? executionFee : 0),
                    fallbackAddress: fallbackAddressBuffer,
                    externalCallShortcut: externalCallShortcut,
                    reservedFlag: flags
                        ? isBuffer(flags)
                            ? flags
                            : new BN(flags !== null && flags !== void 0 ? flags : 0).toArrayLike(Buffer, "be", 32)
                        : new BN(0).toArrayLike(Buffer, "be", 32),
                }
                : undefined;
            let exTxs = { store: [] };
            if (data && !checkFlag(flags, SEND_HASHED_DATA)) {
                exTxs = yield this.prepareExtCallTransactions(externalCallShortcut, this.chainId, sender, data, {
                    meta: externalCallMeta,
                    storage: externalCallStorage,
                });
            }
            const sendIx = yield instructions
                .sendInstruction(this._program, {
                stakingWallet,
                sendFromWallet,
                nonceStorage,
                tokenMint,
                mintAuthority,
                chainSupportInfo: chainSupportInfoAccount,
                discount: discountAccount,
                bridge: bridgeDataAccount,
                bridgeFee: bridgeFeeAccount,
                sendFrom: sender,
                state: this.statePublicKey,
                feeBeneficiary: this.feeBeneficiarAccount,
                externalCallMeta,
                externalCallStorage,
                settingsProgram: this.settingsProgram.programId,
            }, {
                submissionParams: subParams,
                amount: amountBN,
                chainIdBuffer,
                useAssetFee,
                referralCode: referralCode,
                receiver: receiverBuffer,
            })
                .instruction();
            result.add(sendIx);
            return { transaction: { instructions: result.instructions, payer: sender }, extCallStorage: exTxs };
        });
    }
    /**
     * Builds list of transactions for confirmation of bridge init/claim
     * @param message message that was signed
     * @param payer who pays for confirmation storage creation and TX
     * @param confirmationStorage account for signature storage
     * @param signatures array of message validator's signatures
     * @returns transactions for confirmation of some action
     */
    buildStoreConfirmationsTransaction(message, payer, confirmationStorage, signatures, priorityFee) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            payer = new PublicKey(payer);
            confirmationStorage = new PublicKey(confirmationStorage);
            const messageBuf = helpers.hexToBuffer(message);
            const storeSignaturesInstruction = instructions.storeConfirmationsInstruction(this._settingsProgram, {
                state: this.statePublicKey,
                confirmationStorage: confirmationStorage,
                payer: payer,
            }, { message: messageBuf });
            const CHUNK_SIZE = 5;
            const transactions = [];
            priorityFee = (_b = priorityFee !== null && priorityFee !== void 0 ? priorityFee : (_a = this.priorityFeeConfig) === null || _a === void 0 ? void 0 : _a.storeConfirmations) !== null && _b !== void 0 ? _b : { limit: 200000, microLamports: 10 };
            for (let i = 0; i < signatures.length; i += CHUNK_SIZE) {
                const result = newTxWithOptionalPriorityFee(priorityFee);
                const signaturesChunk = signatures.slice(i, i + CHUNK_SIZE);
                const packedSignatures = packSignatures(messageBuf, signaturesChunk, 2);
                const signaturesInstruction = new TransactionInstruction({
                    keys: [],
                    programId: Secp256k1Program.programId,
                    data: packedSignatures,
                });
                result.add(signaturesInstruction);
                result.add(yield storeSignaturesInstruction.instruction());
                transactions.push({
                    instructions: result.instructions,
                    payer,
                });
            }
            return transactions;
        });
    }
    /**
     * Hashes submission
     * @param params {@link SubmissionIdParams}
     * @returns submissionId and sourceChainId
     */
    hashSubmissionId(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const bridgeData = customIsPubkey(params.bridge)
                ? (yield this.getBridgeInfoSafe(params.bridge)).data
                : params.bridge;
            const sourceChainId = crypto.normalizeChainId(params.chainFrom);
            let nativeTokenAddress;
            let debridgeId;
            if (isMintBridge(bridgeData)) {
                nativeTokenAddress = bridgeData.mint.nativeTokenAddress;
                debridgeId = helpers.hexToBuffer(crypto.hashDebridgeId(Buffer.from(bridgeData.mint.sourceChainId), nativeTokenAddress));
            }
            else if (isSendBridge(bridgeData)) {
                nativeTokenAddress = bridgeData.send.nativeTokenAddress.toBuffer();
                debridgeId = helpers.hexToBuffer(crypto.hashDebridgeId(this.chainId, nativeTokenAddress)); // correct
            }
            else {
                throw new Error(`Bridge not supported!`);
            }
            const subId = crypto.hashSubmissionIdRaw({
                debridgeId,
                sourceChainId: params.chainFrom,
                targetChainId: this.chainId,
                amount: params.amount,
                nonce: params.nonce,
                receiver: params.receiver,
                autoParams: params.autoParams,
            });
            return [helpers.hexToBuffer(subId), sourceChainId];
        });
    }
    /**
     * Builds extend extCallStorage instruction
     * @param submissionId
     * @param sourceChainId
     * @param executor
     * @param chunk
     * @param totalLength
     * @param calculatedAccounts precalculated accounts
     * @param priorityFee
     * @returns extend extCallStorage instruction
     */
    buildExternalCallStorageInstruction(submissionId, sourceChainId, executor, chunk, totalLength, calculatedAccounts, priorityFee) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            executor = new PublicKey(executor);
            const subIdBuffer = isBuffer(submissionId) ? submissionId : helpers.hexToBuffer(submissionId);
            const chainId = crypto.normalizeChainId(sourceChainId);
            const externalCallStorage = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.extCallStorage) || this.accountsResolver.getExternalCallStorageAddress(subIdBuffer, executor, chainId)[0];
            const externalCallMeta = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.extCallMeta) || this.accountsResolver.getExternalCallMetaAddress(externalCallStorage)[0];
            const ix = yield instructions
                .initOrUpdateExternalCallStorage(this._program, { claimer: executor, externalCallStorage, externalCallMeta }, {
                sourceChainId: chainId,
                externalCallLen: totalLength,
                rawInstructions: chunk.data,
                externalInstructionsOffset: chunk.offset,
                storageKey: subIdBuffer,
            })
                .instruction();
            const tx = newTxWithOptionalPriorityFee(priorityFee !== null && priorityFee !== void 0 ? priorityFee : (_a = this.priorityFeeConfig) === null || _a === void 0 ? void 0 : _a.storeExternalCall);
            tx.add(ix);
            return {
                instructions: tx.instructions,
                payer: executor,
            };
        });
    }
    /**
     * Compares `data` arg and on-chain value
     * @param storage external call storage account
     * @param data data to compare
     * @returns true if on-chain data equals to `data` param
     */
    isExtCallStorageCorrect(storage, data) {
        return __awaiter(this, void 0, void 0, function* () {
            storage = new PublicKey(storage);
            const accountData = yield this.getAccountInfo(storage);
            return accountData ? accountData.data.slice(EXT_CALL_STORAGE_OFFSET).equals(data) : false;
        });
    }
    /**
     * @deprecated
     * Builds execute external call transaction
     * @param submissionId
     * @param executor
     * @param rewardBeneficiaryWallet wallet which will receive reward for execution
     * @param count number of instructions to execute
     * @param remainingAccounts accounts from extCallData
     * @param calculatedAccounts precalculated accounts
     * @param sourceChainId
     * @returns execute external call transaction
     */
    buildExecuteExternalCallTransaction(submissionId, executor, rewardBeneficiaryWallet, count, calculatedAccounts, sourceChainId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            executor = new PublicKey(executor);
            rewardBeneficiaryWallet = new PublicKey(rewardBeneficiaryWallet);
            const subIdBuffer = isBuffer(submissionId) ? submissionId : helpers.hexToBuffer(submissionId);
            const result = new Transaction();
            const submission = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.submission) || this.accountsResolver.getSubmissionAddress(subIdBuffer)[0];
            const submissionAuth = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.submissionAuth) || this.accountsResolver.getSubmissionAuthAddress(submission)[0];
            let submissionData = null;
            if (!sourceChainId || !calculatedAccounts.originalClaimer || !calculatedAccounts.fallbackAddress || !calculatedAccounts.tokenMint) {
                submissionData = yield this.getSubmissionInfoSafe(submission);
                calculatedAccounts.originalClaimer = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.originalClaimer) || submissionData.claimer;
                sourceChainId = Buffer.from(submissionData.sourceChainId);
                calculatedAccounts.tokenMint = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.tokenMint) || submissionData.tokenMint;
                calculatedAccounts.fallbackAddress = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.fallbackAddress) || submissionData.fallbackAddress;
                calculatedAccounts.originalClaimer = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.originalClaimer) || submissionData.claimer;
            }
            const chainId = crypto.normalizeChainId(sourceChainId);
            const externalCallStorage = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.extCallStorage) ||
                this.accountsResolver.getExternalCallStorageAddress(subIdBuffer, calculatedAccounts.originalClaimer, chainId)[0];
            const externalCallData = yield this.getAccountInfo(externalCallStorage);
            if (!externalCallData)
                throw new Error("Empty ext call storage");
            const externalCallMeta = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.extCallMeta) || this.accountsResolver.getExternalCallMetaAddress(externalCallStorage)[0];
            const meta = yield this.getExternalCallMetaSafe(externalCallMeta);
            if (isExtCallMetaExecuted(meta.data))
                throw new Error("already executed");
            const bridge = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.bridge) || this.accountsResolver.getBridgeAddress(calculatedAccounts.tokenMint)[0];
            const fallbackAddressWallet = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.fallbackAddressWallet) ||
                findAssociatedTokenAddress(calculatedAccounts.fallbackAddress, calculatedAccounts.tokenMint, this.associatedTokenProgramId)[0];
            const submissionWallet = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.submissionWallet) ||
                findAssociatedTokenAddress(submissionAuth, calculatedAccounts.tokenMint, this.associatedTokenProgramId)[0];
            // create missing accounts
            if (!(yield this.checkIfAccountExists(fallbackAddressWallet))) {
                result.add(spl.createAssociatedWalletInstruction(calculatedAccounts.tokenMint, fallbackAddressWallet, calculatedAccounts.fallbackAddress, executor));
            }
            // submission wallet must exist
            /*
            if (!(await this.checkIfAccountExists(submissionWallet))) {
                transaction.add(
                    spl.createAssociatedWalletInstruction(calculatedAccounts.tokenMint, submissionWallet, submissionAuth, executor),
                );
            }
            */
            // create reward wallet if missing and fallbackWallet != rewardWallet
            if (!rewardBeneficiaryWallet.equals(fallbackAddressWallet)) {
                if (!(yield this.checkIfAccountExists(rewardBeneficiaryWallet))) {
                    result.add(spl.createAssociatedWalletInstruction(calculatedAccounts.tokenMint, rewardBeneficiaryWallet, executor, executor));
                }
            }
            const [remainingAccounts, subsitutionBumps] = getRemainingAccountsAndBumps(externalCallData.data, isExtCallMetaExecution(meta.data) ? (_b = (_a = meta.data.execution) === null || _a === void 0 ? void 0 : _a.offset.toNumber()) !== null && _b !== void 0 ? _b : EXT_CALL_STORAGE_OFFSET : EXT_CALL_STORAGE_OFFSET, count, submission, submissionAuth, submissionWallet);
            const execIx = instructions.executeExternalCallInstruction(this.program, {
                state: this.statePublicKey,
                executor,
                externalCallMeta,
                externalCallStorage,
                submission,
                submissionAuth,
                bridge,
                originalClaimer: calculatedAccounts.originalClaimer,
                fallbackAddressWallet,
                fallbackAddress: calculatedAccounts.fallbackAddress,
                rewardBeneficiaryWallet,
                submissionWallet,
                tokenMint: calculatedAccounts.tokenMint,
            }, { submissionId: subIdBuffer, count, subsitutionBumps: Buffer.from(subsitutionBumps) }, remainingAccounts);
            result.add(yield execIx.instruction());
            return { instructions: result.instructions, payer: executor };
        });
    }
    initializeExtCallWalletsIfNeeded(fallbackAddress, rewardBeneficiaryWallet, tokenMint, executor) {
        return __awaiter(this, void 0, void 0, function* () {
            const createIxs = [];
            // create missing accounts
            const [fallbackAddressWallet] = findATA(fallbackAddress, tokenMint);
            const fallbackWalletExists = yield this.checkIfAccountExists(fallbackAddressWallet);
            if (!fallbackWalletExists) {
                logger.debug(`[initializeExtCallWalletsIfNeeded] Initializing fallback`);
                createIxs.push(spl.createAssociatedWalletInstruction(tokenMint, fallbackAddressWallet, fallbackAddress, executor));
            }
            if (!rewardBeneficiaryWallet.equals(fallbackAddressWallet)) {
                if (!(yield this.checkIfAccountExists(rewardBeneficiaryWallet))) {
                    logger.debug(`[initializeExtCallWalletsIfNeeded] Initializing reward beneficiary`);
                    createIxs.push(spl.createAssociatedWalletInstruction(tokenMint, rewardBeneficiaryWallet, executor, executor));
                }
            }
            return createIxs;
        });
    }
    buildOptimalExecuteExternalCallTransactionV2(submissionState, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function* () {
            if (!submissionState.submission)
                throw new Error("failed to get submission");
            if (!submissionState.accounts.externalCall)
                throw new Error("Expected submission to contain calldata info");
            if (!this.wallet)
                throw new Error("Wallet needed! Please set the wallet via this.updateWallet");
            const prefixInstructions = newTxWithOptionalPriorityFee(options === null || options === void 0 ? void 0 : options.priorityFee).instructions;
            const submissionData = submissionState.submission.data;
            if (!submissionData)
                throw new Error(`Submission data is empty`);
            const submissionAuth = this.accountsResolver.getSubmissionAuthAddress(submissionState.accounts.submission)[0];
            const executeAccounts = {
                originalClaimer: submissionData.claimer,
                executor: this.wallet.publicKey,
                externalCallMeta: submissionState.accounts.externalCall.externalCallMeta,
                externalCallStorage: submissionState.accounts.externalCall.externalCallStorage,
                fallbackAddress: submissionData.fallbackAddress,
                fallbackAddressWallet: findAssociatedTokenAddress(submissionData.fallbackAddress, submissionData.tokenMint)[0],
                tokenMint: submissionData.tokenMint,
                submission: submissionState.accounts.submission,
                submissionAuth,
                submissionWallet: findAssociatedTokenAddress(submissionAuth, submissionData.tokenMint)[0],
                bridge: this.accountsResolver.getBridgeAddress(submissionData.tokenMint)[0],
                rewardBeneficiaryWallet: findAssociatedTokenAddress(this.wallet.publicKey, submissionData.tokenMint)[0],
            };
            if (!((_a = submissionState.externalCallMeta) === null || _a === void 0 ? void 0 : _a.data) || !((_b = submissionState.externalCallStorage) === null || _b === void 0 ? void 0 : _b.data))
                throw new Error("Storage and meta should be initialized");
            if ((_d = (_c = submissionState.externalCallMeta) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.data.accumulation) {
                logger.debug(`claim was not performed, exec will fail without claim`);
            }
            if ((_f = (_e = submissionState.externalCallMeta) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.data.executed)
                throw new Error("external call was already executed");
            if ((_h = (_g = submissionState.externalCallMeta) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.data.failed)
                throw new Error("external call failed to execute");
            const offset = ((_j = submissionState.externalCallMeta) === null || _j === void 0 ? void 0 : _j.data.data.execution)
                ? submissionState.externalCallMeta.data.data.execution.offset.toNumber()
                : EXT_CALL_STORAGE_OFFSET;
            return this.findOptimalExecuteCount(submissionState.submissionId, submissionState.externalCallStorage.data, offset, executeAccounts, prefixInstructions);
        });
    }
    buildExecuteExternalCallTransactions(submissionState, priorityFee) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function* () {
            if (!submissionState.submission)
                throw new Error("failed to get submission");
            if (!submissionState.accounts.externalCall)
                throw new Error("Expected submission to contain calldata info");
            if (!this.wallet)
                throw new Error("Wallet needed! Please set the wallet via this.updateWallet");
            const submissionData = submissionState.submission.data;
            if (!submissionData)
                throw new Error(`Submission data is empty`);
            const submissionAuth = this.accountsResolver.getSubmissionAuthAddress(submissionState.accounts.submission)[0];
            const executeAccounts = {
                originalClaimer: submissionData.claimer,
                executor: this.wallet.publicKey,
                externalCallMeta: submissionState.accounts.externalCall.externalCallMeta,
                externalCallStorage: submissionState.accounts.externalCall.externalCallStorage,
                fallbackAddress: submissionData.fallbackAddress,
                fallbackAddressWallet: findAssociatedTokenAddress(submissionData.fallbackAddress, submissionData.tokenMint)[0],
                tokenMint: submissionData.tokenMint,
                submission: submissionState.accounts.submission,
                submissionAuth,
                submissionWallet: findAssociatedTokenAddress(submissionAuth, submissionData.tokenMint)[0],
                bridge: this.accountsResolver.getBridgeAddress(submissionData.tokenMint)[0],
                rewardBeneficiaryWallet: findAssociatedTokenAddress(this.wallet.publicKey, submissionData.tokenMint)[0],
            };
            if (!((_a = submissionState.externalCallMeta) === null || _a === void 0 ? void 0 : _a.data) || !((_b = submissionState.externalCallStorage) === null || _b === void 0 ? void 0 : _b.data))
                throw new Error("Storage and meta should be initialized");
            if ((_d = (_c = submissionState.externalCallMeta) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.data.accumulation) {
                logger.debug(`claim was not performed, exec will fail without claim`);
            }
            if ((_f = (_e = submissionState.externalCallMeta) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.data.executed)
                throw new Error("external call was already executed");
            if ((_h = (_g = submissionState.externalCallMeta) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.data.failed)
                throw new Error("external call failed to execute");
            const offset = ((_j = submissionState.externalCallMeta) === null || _j === void 0 ? void 0 : _j.data.data.execution)
                ? submissionState.externalCallMeta.data.data.execution.offset.toNumber()
                : EXT_CALL_STORAGE_OFFSET;
            return this.getAllExecuteExternalCallTxs(submissionState.submissionId, submissionState.externalCallStorage.data, offset, executeAccounts, [], priorityFee);
        });
    }
    /**
     * Builds execute external call transaction with max available number of instructions to execute
     * @param submissionId
     * @param executor
     * @param rewardBeneficiaryWallet wallet which will receive reward for execution = ATA(executor, tokenMint)
     * @param calculatedAccounts precalculated accounts
     * @param sourceChainId
     * @returns execute external call transaction, number of instructions to execute
     */
    buildOptimalExecuteExternalCallTransaction(submissionId, executor, rewardBeneficiaryWallet, calculatedAccounts, sourceChainId, prefixInstructions = [], ALTs = [], calldata, metaData) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            executor = new PublicKey(executor);
            if (!calculatedAccounts)
                calculatedAccounts = {};
            rewardBeneficiaryWallet = new PublicKey(rewardBeneficiaryWallet);
            const subIdBuffer = isBuffer(submissionId) ? submissionId : helpers.hexToBuffer(submissionId);
            const submission = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.submission) || this.accountsResolver.getSubmissionAddress(subIdBuffer)[0];
            const submissionAuth = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.submissionAuth) || this.accountsResolver.getSubmissionAuthAddress(submission)[0];
            if (!sourceChainId || !calculatedAccounts.originalClaimer || !calculatedAccounts.tokenMint || !calculatedAccounts.fallbackAddress) {
                const submissionData = yield this.getSubmissionInfoSafe(submission);
                calculatedAccounts.originalClaimer = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.originalClaimer) || submissionData.claimer;
                sourceChainId = Buffer.from(submissionData.sourceChainId);
                calculatedAccounts.tokenMint = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.tokenMint) || submissionData.tokenMint;
                calculatedAccounts.fallbackAddress = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.fallbackAddress) || submissionData.fallbackAddress;
                calculatedAccounts.originalClaimer = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.originalClaimer) || submissionData.claimer;
            }
            const chainId = crypto.normalizeChainId(sourceChainId);
            const externalCallStorage = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.extCallStorage) ||
                this.accountsResolver.getExternalCallStorageAddress(subIdBuffer, calculatedAccounts.originalClaimer, chainId)[0];
            const externalCallMeta = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.extCallMeta) || this.accountsResolver.getExternalCallMetaAddress(externalCallStorage)[0];
            const bridge = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.bridge) || this.accountsResolver.getBridgeAddress(calculatedAccounts.tokenMint)[0];
            const fallbackAddressWallet = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.fallbackAddressWallet) ||
                findAssociatedTokenAddress(calculatedAccounts.fallbackAddress, calculatedAccounts.tokenMint, this.associatedTokenProgramId)[0];
            const submissionWallet = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.submissionWallet) ||
                findAssociatedTokenAddress(submissionAuth, calculatedAccounts.tokenMint, this.associatedTokenProgramId)[0];
            const externalCallData = calldata ? { data: calldata } : yield this.getAccountInfo(externalCallStorage);
            if (!externalCallData)
                throw new Error("failed to get ext call data");
            const meta = metaData ? metaData : yield this.getExternalCallMetaSafe(externalCallMeta);
            if (isExtCallMetaAccumulation(meta.data)) {
                logger.debug(`claim was not performed, exec will fail without claim`);
            }
            if (isExtCallMetaExecuted(meta.data))
                throw new Error("external call was already executed");
            if (isExtCallMetaFailed(meta.data))
                throw new Error("external call failed to execute");
            const offset = isExtCallMetaAccumulation(meta.data) ? EXT_CALL_STORAGE_OFFSET : (_a = meta.data.execution) === null || _a === void 0 ? void 0 : _a.offset.toNumber();
            // simulation part
            const execAccounts = {
                submission,
                submissionAuth,
                submissionWallet,
                tokenMint: calculatedAccounts.tokenMint,
                bridge,
                executor,
                externalCallMeta,
                externalCallStorage,
                fallbackAddress: calculatedAccounts.fallbackAddress,
                fallbackAddressWallet,
                originalClaimer: calculatedAccounts.originalClaimer,
                rewardBeneficiaryWallet,
            };
            return this.findOptimalExecuteCount(subIdBuffer, externalCallData.data, offset !== null && offset !== void 0 ? offset : EXT_CALL_STORAGE_OFFSET, execAccounts, prefixInstructions, ALTs);
        });
    }
    findOptimalExecuteCount(submissionId, externalCallData, offset, execAccounts, prefixInstructions = [], ALTs = []) {
        return __awaiter(this, void 0, void 0, function* () {
            let execIx = null;
            let vtx = null;
            let optimalCountMin = 0;
            let optimalCountMax = extCallDataToInstructions(externalCallData, offset).length + 1;
            let middle = 0;
            while (optimalCountMax - optimalCountMin > 1) {
                middle = Math.floor((optimalCountMin + optimalCountMax) / 2);
                logger.debug(`Current min: ${optimalCountMin}, max: ${optimalCountMax}, middle: ${middle}`);
                try {
                    execIx = yield this.buildExecuteExternalCallIx(submissionId, externalCallData, offset, middle, execAccounts);
                    vtx = new VersionedTransaction(MessageV0.compile({
                        instructions: [...prefixInstructions, execIx],
                        payerKey: execAccounts.executor,
                        recentBlockhash: constants.FAKE_BLOCKHASH,
                        addressLookupTableAccounts: ALTs,
                    }));
                    const txSize = txs.getTransactionSize(vtx);
                    let err = null;
                    if (txSize === null || txSize > 1232) {
                        err = "Tx is too big";
                    }
                    else {
                        const simulation = yield this._connection.simulateTransaction(vtx, { replaceRecentBlockhash: true });
                        logger.debug(simulation.value.err);
                        err = simulation.value.err;
                    }
                    if (err === null) {
                        optimalCountMin = middle;
                    }
                    else {
                        optimalCountMax = middle;
                    }
                }
                catch (e) {
                    logger.debug(e);
                    optimalCountMax = middle;
                }
            }
            let optimal = Math.floor((optimalCountMax + optimalCountMin) / 2);
            optimal = optimal === 0 ? 1 : optimal;
            logger.debug(`Optimal count: ${optimal}`);
            execIx = yield this.buildExecuteExternalCallIx(submissionId, externalCallData, offset, optimal, execAccounts);
            return [
                {
                    instructions: [...prefixInstructions, execIx],
                    payer: execAccounts.executor,
                    ALTs,
                },
                optimal,
            ];
        });
    }
    getAllExecuteExternalCallTxs(submissionId, externalCallData, offset, execAccounts, ALTs = [], priorityFee) {
        return __awaiter(this, void 0, void 0, function* () {
            const allTxs = [];
            const ixs = extCallDataToInstructions(externalCallData, offset);
            const totalIxs = ixs.length;
            let currentOffset = offset;
            let processedIxs = 0;
            const priotityIxs = [];
            if (priorityFee === null || priorityFee === void 0 ? void 0 : priorityFee.limit) {
                priotityIxs.push(ComputeBudgetProgram.setComputeUnitLimit({ units: priorityFee.limit }));
            }
            if (priorityFee === null || priorityFee === void 0 ? void 0 : priorityFee.microLamports) {
                priotityIxs.push(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee.microLamports }));
            }
            while (processedIxs < totalIxs) {
                let execIx = null;
                let vtx = null;
                let optimalCountMin = 0;
                let optimalCountMax = totalIxs + 1 - processedIxs;
                let middle = 0;
                while (optimalCountMax - optimalCountMin > 1) {
                    middle = Math.floor((optimalCountMin + optimalCountMax) / 2);
                    logger.debug(`Current min: ${optimalCountMin}, max: ${optimalCountMax}, middle: ${middle}`);
                    try {
                        execIx = yield this.buildExecuteExternalCallIx(submissionId, externalCallData, currentOffset, middle, execAccounts);
                        vtx = new VersionedTransaction(MessageV0.compile({
                            instructions: [...priotityIxs, execIx],
                            payerKey: execAccounts.executor,
                            recentBlockhash: constants.FAKE_BLOCKHASH,
                            addressLookupTableAccounts: ALTs,
                        }));
                        const txSize = txs.getTransactionSize(vtx);
                        if (txSize === null || txSize > 1232) {
                            optimalCountMax = middle;
                        }
                        else {
                            optimalCountMin = middle;
                        }
                    }
                    catch (e) {
                        logger.debug(e);
                        optimalCountMax = middle;
                    }
                }
                let optimal = Math.floor((optimalCountMax + optimalCountMin) / 2);
                optimal = optimal === 0 ? 1 : optimal;
                logger.debug(`Optimal count: ${optimal}`);
                execIx = yield this.buildExecuteExternalCallIx(submissionId, externalCallData, currentOffset, optimal, execAccounts);
                processedIxs += optimal;
                currentOffset = ixs[processedIxs - 1].end;
                allTxs.push({
                    instructions: [...priotityIxs, execIx],
                    payer: execAccounts.executor,
                    ALTs,
                });
            }
            return allTxs;
        });
    }
    buildExecuteExternalCallIx(submissionId, externalCallData, offset, count, ixAccounts) {
        const [remainingAccounts, subsitutionBumps] = getRemainingAccountsAndBumps(externalCallData, offset, count, ixAccounts.submission, ixAccounts.submissionAuth, ixAccounts.submissionWallet);
        return instructions
            .executeExternalCallInstruction(this.program, Object.assign({ state: this.statePublicKey }, ixAccounts), { submissionId, count, subsitutionBumps: Buffer.from(subsitutionBumps) }, remainingAccounts)
            .instruction();
    }
    executeExternalCallV2(submissionState, sendFn, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function* () {
            const metaData = (_a = submissionState.externalCallMeta) === null || _a === void 0 ? void 0 : _a.data;
            const storageData = (_b = submissionState.externalCallStorage) === null || _b === void 0 ? void 0 : _b.data;
            const submissionData = (_c = submissionState.submission) === null || _c === void 0 ? void 0 : _c.data;
            if (!storageData)
                throw new Error(`Trying to exec ext call with empty ext call storage`);
            if (!metaData)
                throw new Error(`Trying to exec external call with empty ext call meta`);
            if (!submissionData)
                throw new Error(`Missing submission account. Maybe not calimed yet?`);
            if (metaData.data.failed)
                throw new Error("Cant exec external call in failed state");
            if (!this.wallet)
                throw new Error("Failed to get wallet. Forgot to call updateWallet?");
            if (metaData.data.executed)
                return;
            const result = [];
            const stateChangeTimeout = (_d = options === null || options === void 0 ? void 0 : options.stateChangeTimeout) !== null && _d !== void 0 ? _d : 10000;
            const offset = metaData.data.execution ? metaData.data.execution.offset.toNumber() : EXT_CALL_STORAGE_OFFSET;
            const totalIx = extCallDataToInstructions(storageData, offset).length;
            let currentIx = 0;
            let oldOffset = offset;
            const fallback = submissionData.fallbackAddress;
            const tokenMint = submissionData.tokenMint;
            const [rewardBeneficiaryWallet] = findATA(this.wallet.publicKey, tokenMint);
            const walletsInitInstructions = yield this.initializeExtCallWalletsIfNeeded(fallback, rewardBeneficiaryWallet, tokenMint, this.wallet.publicKey);
            if (walletsInitInstructions.length > 0) {
                const [txId] = yield sendFn({ instructions: walletsInitInstructions, payer: this.wallet.publicKey });
                result.push(txId);
                logger.debug(`[execExternalCallV2] Initialized reward beneficiary wallet and [fallback wallet] ${txId}`);
                yield helpers.sleep(3000);
            }
            while (currentIx < totalIx) {
                const [execTx, count] = yield this.buildOptimalExecuteExternalCallTransactionV2(submissionState, options);
                const [execTxId] = yield sendFn(execTx);
                result.push(execTxId);
                logger.debug(`Execute ${count} external instructions: ${execTxId}`);
                currentIx += count;
                const changeLoopStart = Date.now();
                for (;;) {
                    if ((_e = submissionState.externalCallMeta) === null || _e === void 0 ? void 0 : _e.isEmpty)
                        return result; // executed
                    if ((_g = (_f = submissionState.externalCallMeta) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.data.executed)
                        return result;
                    else if ((_j = (_h = submissionState.externalCallMeta) === null || _h === void 0 ? void 0 : _h.data) === null || _j === void 0 ? void 0 : _j.data.failed)
                        throw new Error("Cant exec external call in failed state");
                    else if (((_l = (_k = submissionState.externalCallMeta) === null || _k === void 0 ? void 0 : _k.data) === null || _l === void 0 ? void 0 : _l.data.execution) &&
                        submissionState.externalCallMeta.data.data.execution.offset.toNumber() !== oldOffset) {
                        oldOffset = submissionState.externalCallMeta.data.data.execution.offset.toNumber();
                        break;
                    }
                    if (Date.now() - changeLoopStart > stateChangeTimeout) {
                        throw new Error(`ExternalCallMeta hasn't changed in ${stateChangeTimeout}ms`);
                    }
                    yield helpers.sleep(300);
                }
            }
            return result;
        });
    }
    /**
     * Executes externall call until done or error
     * @param submissionId
     * @param extCallStorageAccount
     * @param extCallMetaAccount
     * @param claimTokenMint token to claim
     * @returns transaction ids of ExecuteExternalCall
     */
    executeExternalCall(submissionId, extCallStorageAccount, extCallMetaAccount, claimTokenMint, sender, fallbackAddress, options) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.wallet)
                throw new Error("Wallet needed! Please set the wallet via this.updateWallet");
            const metadataPollingInterval = (options === null || options === void 0 ? void 0 : options.metadataPollingInterval) || 2000;
            const result = [];
            submissionId = isBuffer(submissionId) ? submissionId : helpers.hexToBuffer(submissionId);
            claimTokenMint = new PublicKey(claimTokenMint);
            extCallMetaAccount = new PublicKey(extCallMetaAccount);
            extCallStorageAccount = new PublicKey(extCallStorageAccount);
            const [rewardBeneficiaryWallet] = findAssociatedTokenAddress(this.wallet.publicKey, claimTokenMint, this.associatedTokenProgramId);
            const [submission] = this.accountsResolver.getSubmissionAddress(submissionId);
            const [bridge] = this.accountsResolver.getBridgeAddress(claimTokenMint);
            let originalClaimer = undefined;
            let sourceChain = undefined;
            if (!fallbackAddress) {
                const submissionInfo = yield this.getSubmissionInfoSafe(submission);
                fallbackAddress = submissionInfo.fallbackAddress;
                originalClaimer = submissionInfo.claimer;
                sourceChain = new BN(submissionInfo.sourceChainId).toNumber();
            }
            else {
                fallbackAddress = new PublicKey(fallbackAddress);
            }
            const [fallbackAddressWallet] = findAssociatedTokenAddress(fallbackAddress, claimTokenMint, this.associatedTokenProgramId);
            const walletsInitInstructions = yield this.initializeExtCallWalletsIfNeeded(fallbackAddress, rewardBeneficiaryWallet, claimTokenMint, this.wallet.publicKey);
            if (walletsInitInstructions.length > 0) {
                const [txId] = yield sender({ instructions: walletsInitInstructions, payer: this.wallet.publicKey });
                logger.debug(`Initialized reward beneficiary wallet and [fallback wallet] ${txId}`);
            }
            let extCallMetaData;
            try {
                extCallMetaData = yield this.getExternalCallMetaSafe(extCallMetaAccount);
            }
            catch (e) {
                logger.error(`[executeExternalCall] failed to get extCallMetaData -> claim was not completed`, e);
                throw e;
            }
            let metaExecution = null;
            let retires = 0;
            while (!metaExecution) {
                extCallMetaData = yield this.getExternalCallMetaSafe(extCallMetaAccount);
                if (isExtCallMetaExecution(extCallMetaData.data)) {
                    metaExecution = extCallMetaData.data;
                }
                retires += 1;
                if (retires > 10) {
                    throw new Error(`[executeExternalCall] extCallMeta is not in execution state, can't exec without claim!`);
                }
                yield helpers.sleep(metadataPollingInterval);
            }
            const extCallChainData = yield this.getAccountInfo(extCallStorageAccount);
            if (!extCallChainData)
                return Promise.reject("Empty extCall on-chain data");
            const totalIx = extCallDataToInstructions(extCallChainData.data, (_a = metaExecution.execution) === null || _a === void 0 ? void 0 : _a.offset.toNumber()).length;
            let currentIx = 0;
            while (currentIx < totalIx) {
                const [execTx, ixCount] = yield this.buildOptimalExecuteExternalCallTransaction(submissionId, this.wallet.publicKey, rewardBeneficiaryWallet, {
                    submission,
                    extCallStorage: extCallStorageAccount,
                    extCallMeta: extCallMetaAccount,
                    originalClaimer,
                    tokenMint: claimTokenMint,
                    bridge,
                    fallbackAddress,
                    fallbackAddressWallet,
                }, sourceChain, [
                    ComputeBudgetProgram.setComputeUnitLimit({ units: 500000 }),
                    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50000 }),
                ], [], extCallChainData.data, extCallMetaData);
                const metaUpdatePromise = new Promise((resolve) => {
                    this._connection.onAccountChange(extCallMetaAccount, (accountInfo, context) => {
                        resolve(accountInfo.data);
                    });
                });
                const execTxId = yield sender(execTx);
                result.push(execTxId[0]);
                currentIx += ixCount;
                const oldOffset = (_b = metaExecution.execution) === null || _b === void 0 ? void 0 : _b.offset.toString();
                const newData = yield metaUpdatePromise;
                if (newData.length === 0)
                    return result; // execution finished - new data is empty
                const newDecodedData = this._program.coder.accounts.decode("externalCallMeta", newData);
                if (isExtCallMetaExecuted(newDecodedData.data))
                    return result;
                if (isExtCallMetaExecution(newDecodedData.data) && oldOffset === ((_c = newDecodedData.data.execution) === null || _c === void 0 ? void 0 : _c.offset.toString()))
                    throw new Error("Meta was not updated");
                extCallMetaData = newDecodedData;
                /*
                while (oldOffset == metaExecution.execution.offset.toString()) {
                    try {
                        extCallMetaData = await this.getExternalCallMetaSafe(extCallMetaAccount);
                    } catch (e) {
                        if (e instanceof ExternalCallMetaNotExists) return result;
                        throw e;
                    }
                    metaExecution = extCallMetaData.data as ExternalCallMetaExecutionType;
                    if (isExtCallMetaExecuted(metaExecution)) return result;
                    await helpers.sleep(metadataPollingInterval);
                }
                if (isExtCallMetaExecuted(metaExecution)) break;
                */
            }
            return result;
        });
    }
    static splitDataForExternalCall(data, usePriorityFee = false) {
        // Max tx size = 1232 bytes
        // Full init or update tx size = 1206 bytes
        // 1232 - 1206 = 26 bytes (20 bytes added to max tx size, 6 bytes reserved to prevent overflow)
        // TODO: usePriorityFee?
        const EXTEND_IX_MAX_SIZE = 806; // 876 - (usePriorityFee ? 70 : 0);
        const INIT_OR_UPDATE_CHUNK_SIZE = EXTEND_IX_MAX_SIZE + 20;
        const result = [];
        let currentPos = 0;
        while (currentPos < data.length) {
            const chunkSize = INIT_OR_UPDATE_CHUNK_SIZE;
            const chunk = data.slice(currentPos, currentPos + chunkSize);
            result.push({ data: chunk, offset: currentPos });
            currentPos += CALLDATA_CHUNK_SIZE;
        }
        return result;
    }
    /**
     * Prepares transactions for external call data initialization
     * If calldata already initiailized will return empty list
     * Else if calldata is allocated but not stored correctly will overwrite only bad chunks
     * Else will build txs for alloc & store
     * @param submissionId
     * @param sourceChainId
     * @param executor
     * @param data external call data
     * @param calculatedAccounts precalculated accounts
     * @returns init and extend external call transactions
     */
    prepareExtCallTransactions(submissionId, sourceChainId, executor, data, calculatedAccounts) {
        return __awaiter(this, void 0, void 0, function* () {
            executor = new PublicKey(executor);
            const chainId = crypto.normalizeChainId(sourceChainId);
            const subId = isBuffer(submissionId) ? submissionId : helpers.hexToBuffer(submissionId);
            const [extCallStorage] = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.storage)
                ? [calculatedAccounts.storage]
                : this.accountsResolver.getExternalCallStorageAddress(subId, executor, chainId);
            const [extCallMeta] = (calculatedAccounts === null || calculatedAccounts === void 0 ? void 0 : calculatedAccounts.meta)
                ? [calculatedAccounts.meta]
                : this.accountsResolver.getExternalCallMetaAddress(extCallStorage);
            const result = { meta: extCallMeta, storage: extCallStorage };
            if (!data) {
                data = Buffer.from([]);
            }
            data = Buffer.isBuffer(data) ? data : helpers.hexToBuffer(data);
            const storedData = yield this.getAccountInfo(extCallStorage);
            if (storedData === null) {
                const dataChunks = DeBridgeSolanaClient.splitDataForExternalCall(data);
                const totalSize = data.length;
                const transactions = [];
                for (const chunk of dataChunks) {
                    transactions.push(yield this.buildExternalCallStorageInstruction(submissionId, sourceChainId, executor, chunk, totalSize, {
                        extCallStorage,
                        extCallMeta,
                    }));
                }
                return Object.assign(Object.assign({}, result), { store: transactions });
            }
            else {
                logger.debug(`Calldata already exists on chain, checking if overwrite required`);
                if (storedData === null || storedData === void 0 ? void 0 : storedData.data.slice(EXT_CALL_STORAGE_OFFSET).equals(data)) {
                    logger.debug(`Stored correct calldata`);
                    return Object.assign(Object.assign({}, result), { store: [] });
                }
                else {
                    const onChainData = storedData.data.slice(EXT_CALL_STORAGE_OFFSET);
                    const OVERWRITE_CHUNK_SIZE = CALLDATA_CHUNK_SIZE;
                    const NUMBER_OF_OVERWITE_IXS_IN_TX = 1;
                    const transactions = [{ payer: executor, instructions: [] }];
                    let offset = 0;
                    const totalSize = data.length;
                    while (offset < totalSize) {
                        const range = [offset, offset + OVERWRITE_CHUNK_SIZE];
                        const correctChunk = data.slice(...range);
                        if (!onChainData.slice(...range).equals(correctChunk)) {
                            logger.debug(`Overwrite required for chunk: ${range[0]}..${range[1]}`);
                            const updateExtCallIx = yield this.buildExternalCallStorageInstruction(submissionId, sourceChainId, executor, { data: correctChunk, offset }, totalSize, {
                                extCallMeta,
                                extCallStorage,
                            });
                            const currentTx = transactions.at(-1);
                            if (!currentTx) {
                                throw new Error("Should never happen, last txs in overwrite txs list always exists");
                            }
                            if (currentTx.instructions.length < NUMBER_OF_OVERWITE_IXS_IN_TX) {
                                currentTx.instructions.push(...updateExtCallIx.instructions);
                            }
                            else {
                                transactions.push(updateExtCallIx);
                            }
                        }
                        offset += OVERWRITE_CHUNK_SIZE;
                    }
                    return Object.assign(Object.assign({}, result), { store: transactions });
                }
            }
        });
    }
    storeExternallCall(extCallTransactions, sender, data, overwriteOnError = false) {
        return __awaiter(this, void 0, void 0, function* () {
            data = Buffer.isBuffer(data) ? data : helpers.hexToBuffer(data);
            let result = [];
            const firstTx = extCallTransactions.store[0];
            const storageAccount = firstTx.instructions[0].keys[0].pubkey;
            const metaAccount = firstTx.instructions[0].keys[1].pubkey;
            const onChainData = yield this._connection.getAccountInfo(storageAccount);
            if (onChainData !== null && (onChainData === null || onChainData === void 0 ? void 0 : onChainData.data) !== null) {
                if (onChainData.data.slice(EXT_CALL_STORAGE_OFFSET).equals(data)) {
                    // already stored
                    return [];
                }
                if (!overwriteOnError)
                    throw new Error("OnChain data already exists but it's broken");
            }
            if (extCallTransactions.store.length > 0) {
                const extendIds = yield sender(...extCallTransactions.store);
                result = result.concat(extendIds);
            }
            const extCallMetaData = yield this.getExternalCallMetaSafe(metaAccount);
            const metaAccumulation = extCallMetaData.data.accumulation;
            let extCallAccountData = Buffer.from([]);
            let dataEqual = false;
            let retries = 0;
            while (!dataEqual) {
                yield helpers.sleep(3000);
                retries += 1;
                if (retries > 20)
                    return Promise.reject("Failed to store correct data into extCallStorage");
                const tmp = yield this.getAccountInfo(storageAccount);
                if (tmp) {
                    extCallAccountData = tmp.data;
                }
                if (extCallAccountData &&
                    extCallAccountData.slice(EXT_CALL_STORAGE_OFFSET, metaAccumulation === null || metaAccumulation === void 0 ? void 0 : metaAccumulation.externalCallLen.toNumber()).equals(data))
                    dataEqual = true;
            }
            return result;
        });
    }
    storeExternalCallV2(extCallTransactions, data, submissionState, sender, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.wallet)
                throw new Error("Wallet needed! Please set the wallet via this.updateWallet");
            const overwriteOnError = (options === null || options === void 0 ? void 0 : options.overwriteOnError) || false;
            const initTimeoutMs = (options === null || options === void 0 ? void 0 : options.initTimeout) || 10000; // 10 seconds
            const storeTimeoutMs = (options === null || options === void 0 ? void 0 : options.storeTimeout) || 5000; // 5 seconds
            let result = [];
            if (submissionState.externalCallStorage !== null && !submissionState.externalCallStorage.isEmpty) {
                if ((_a = submissionState.externalCallStorage.data) === null || _a === void 0 ? void 0 : _a.slice(EXT_CALL_STORAGE_OFFSET).equals(data)) {
                    // already stored
                    return [];
                }
                //console.log(onChainData.data.slice(EXT_CALL_STORAGE_OFFSET).toString("hex"));
                //console.log("-".repeat(10));
                //console.log(data.toString("hex"));
                if (!overwriteOnError)
                    throw new Error("OnChain data already exists but it's broken");
            }
            /*
            let storedFullDataInAllocTx = false;
            // allocate calldata only in case it wasn't already allocated
            if (submissionState.externalCallStorage?.isEmpty ?? true) {
                const allocPromise = new Promise<boolean>((resolve, reject) => {
                    const failTimeout = setTimeout(reject, initTimeoutMs);
                    submissionState.onActionOnce(Submission.UpdateActions.ExternalCallStorage, (onChainData) => {
                        clearTimeout(failTimeout);
                        resolve(onChainData !== null && onChainData.slice(EXT_CALL_STORAGE_OFFSET).equals(data));
                    });
                });
    
                try {
                    storedFullDataInAllocTx = await allocPromise;
                } catch (e) {
                    logger.error(e);
                    throw new Error(`Failed to allocate memory for calldata in ${initTimeoutMs}ms`);
                }
            }
            */
            if (extCallTransactions.store.length === 0) {
                return result;
            }
            else {
                // wait a little for tx to finalize
                yield helpers.sleep(1000);
                const storePromise = new Promise((resolve, reject) => {
                    const failTimeout = setTimeout(reject, storeTimeoutMs);
                    submissionState.onCorrectCalldataOnce(data, () => {
                        clearTimeout(failTimeout);
                        resolve();
                    });
                });
                // handle rejection in case when sendAll fails and throws an error
                storePromise.catch((e) => {
                    logger.error(e);
                });
                let extendIds = [];
                if (extCallTransactions.store.length > 0) {
                    extendIds = yield sender(...extCallTransactions.store);
                    result = result.concat(extendIds);
                    logger.debug(`Fill external call: ${extendIds.join(", ")}`);
                }
                try {
                    yield storePromise;
                }
                catch (e) {
                    logger.error(e);
                    throw new Error(`Failed to store calldata in ${storeTimeoutMs}ms`);
                }
            }
            return result;
        });
    }
    buildCloseExternalCallStorageIx(claimer, submissionId, sourceChainId) {
        return __awaiter(this, void 0, void 0, function* () {
            submissionId = typeof submissionId === "string" ? helpers.hexToBuffer(submissionId) : submissionId;
            claimer = new PublicKey(claimer);
            const chainId = crypto.normalizeChainId(sourceChainId);
            const [externalCallStorage] = this.accountsResolver.getExternalCallStorageAddress(submissionId, claimer, chainId);
            const [externalCallMeta] = this.accountsResolver.getExternalCallMetaAddress(externalCallStorage);
            const builder = instructions.buildCloseExternalCallStorageInstruction(this.program, {
                claimer,
                externalCallMeta,
                externalCallStorage,
            }, {
                chainId,
                submissionId,
            });
            return {
                instructions: [yield builder.instruction()],
                payer: claimer,
            };
        });
    }
    /**
     * Builds transaction which claims tokens from another blockchain via deBridge send or mint bridge
     * @param executor signer of transaction
     * @param amount amount to claim
     * @param receiverInfo receiver address, tokenMint, claimToWallet
     * @param senderInfo source chain id and sender in source chain in a format "0x..."
     * @param submissionInfo nonce and submissionId
     * @param autoParams amount of tokens to pay for execution, fallback address, flags and external call data
     * @param createMissingWallets if true, add instructions for creation of missing wallets in transaction
     * @returns transaction for claim
     */
    buildClaimTransaction(executor, amount, receiverInfo, senderInfo, submissionInfo, autoParams, createMissingWallets, confirmationStorageCreator, priorityFee) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInitialized())
                yield this.init();
            if (createMissingWallets === undefined)
                createMissingWallets = true;
            const missingWalletsConfig = typeof createMissingWallets === "boolean"
                ? {
                    payerWallet: createMissingWallets ? { check: WalletCheckEnum.Create } : { check: WalletCheckEnum.ThrowError },
                    receiverWallet: createMissingWallets ? { check: WalletCheckEnum.Create } : { check: WalletCheckEnum.ThrowError },
                    stakingWallet: createMissingWallets ? { check: WalletCheckEnum.Create } : { check: WalletCheckEnum.ThrowError },
                }
                : createMissingWallets;
            const subIdBuffer = isBuffer(submissionInfo.submissionId)
                ? submissionInfo.submissionId
                : helpers.hexToBuffer(submissionInfo.submissionId);
            logger.info(`Claiming submission: ${helpers.bufferToHex(subIdBuffer)}`);
            const result = newTxWithOptionalPriorityFee(priorityFee !== null && priorityFee !== void 0 ? priorityFee : (_a = this.priorityFeeConfig) === null || _a === void 0 ? void 0 : _a.claim);
            const sourceChainId = crypto.normalizeChainId(senderInfo.chainFrom);
            executor = new PublicKey(executor);
            const receiver = typeof receiverInfo.receiver === "string"
                ? receiverInfo.receiver.startsWith("0x")
                    ? new PublicKey(helpers.hexToBuffer(receiverInfo.receiver))
                    : new PublicKey(receiverInfo.receiver)
                : new PublicKey(receiverInfo.receiver);
            const tokenMint = new PublicKey(receiverInfo.tokenMint);
            let claimToWallet = null;
            let externalCallData = undefined;
            if ((autoParams === null || autoParams === void 0 ? void 0 : autoParams.data) && autoParams.data !== "0x") {
                externalCallData = isBuffer(autoParams.data) ? autoParams.data : helpers.hexToBuffer(autoParams.data);
            }
            const [bridgeDataAccount] = this.accountsResolver.getBridgeAddress(tokenMint);
            const [mintAuthority] = this.accountsResolver.getMintAuthorityAddress(bridgeDataAccount);
            const [submissionAddr] = this.accountsResolver.getSubmissionAddress(subIdBuffer);
            const [submissionAuthAddr] = this.accountsResolver.getSubmissionAuthAddress(submissionAddr);
            const [chainSupportInfoAccount] = this.accountsResolver.getChainSupportInfoAddress(sourceChainId);
            const [stakingWallet] = findAssociatedTokenAddress(mintAuthority, tokenMint, this.associatedTokenProgramId);
            const [payerWallet] = ((_b = missingWalletsConfig.payerWallet) === null || _b === void 0 ? void 0 : _b.wallet)
                ? [new PublicKey(missingWalletsConfig.payerWallet.wallet)]
                : findAssociatedTokenAddress(executor, tokenMint, this.associatedTokenProgramId);
            const claimToWalletOwner = externalCallData !== undefined ? submissionAuthAddr : receiver;
            if (!claimToWallet)
                [claimToWallet] = findAssociatedTokenAddress(claimToWalletOwner, tokenMint, this.associatedTokenProgramId);
            const [receiverData, claimToWalletData, stakingWalletData, payerWalletData] = yield this._connection.getMultipleAccountsInfo([
                receiver,
                claimToWallet,
                stakingWallet,
                payerWallet,
            ]);
            const receiverIsTokenAccount = receiverData && receiverData.owner.equals(TOKEN_PROGRAM_ID);
            if (receiverIsTokenAccount) {
                if (externalCallData !== undefined) {
                    throw new Error("receiver account should be usual account when ext call data exists");
                }
                claimToWallet = (receiverInfo === null || receiverInfo === void 0 ? void 0 : receiverInfo.claimToWallet) ? new PublicKey(receiverInfo.claimToWallet) : receiver;
            }
            if (isAccountEmpty(stakingWalletData)) {
                if (missingWalletsConfig.stakingWallet.check === WalletCheckEnum.Create) {
                    result.add(spl.createAssociatedWalletInstruction(tokenMint, stakingWallet, mintAuthority, executor));
                }
                else {
                    throw new AssociatedWalletNotInitialized(mintAuthority, stakingWallet);
                }
            }
            if (missingWalletsConfig.payerWallet.check !== WalletCheckEnum.AllowUninitialized && isAccountEmpty(payerWalletData)) {
                if (missingWalletsConfig.payerWallet.check === WalletCheckEnum.Create) {
                    logger.debug(`Creating payerWallet: ${payerWallet.toBase58()}`);
                    result.add(spl.createAssociatedWalletInstruction(tokenMint, payerWallet, executor, executor));
                }
                else if (missingWalletsConfig.payerWallet.check === WalletCheckEnum.ThrowError) {
                    throw new AssociatedWalletNotInitialized(executor, payerWallet);
                }
            }
            if (!payerWallet.equals(claimToWallet) && isAccountEmpty(claimToWalletData)) {
                if (missingWalletsConfig.receiverWallet.check === WalletCheckEnum.Create) {
                    logger.debug(`Creating claimToWallet: ${claimToWallet.toBase58()}`);
                    result.add(spl.createAssociatedWalletInstruction(tokenMint, claimToWallet, claimToWalletOwner, executor));
                }
                else if (missingWalletsConfig.receiverWallet.check === WalletCheckEnum.ThrowError) {
                    throw new AssociatedWalletNotInitialized(receiver, claimToWallet);
                }
            }
            const [confirmationStorage] = this.accountsResolver.getConfirmationsStorageAddress(subIdBuffer);
            const [externalCallStorage] = this.accountsResolver.getExternalCallStorageAddress(subIdBuffer, executor, sourceChainId);
            const [externalCallMeta] = this.accountsResolver.getExternalCallMetaAddress(externalCallStorage);
            let claimAutoParams = undefined;
            let exTxs = { store: [] };
            if (externalCallData && !checkFlag(autoParams === null || autoParams === void 0 ? void 0 : autoParams.flags, SEND_HASHED_DATA)) {
                exTxs = yield this.prepareExtCallTransactions(submissionInfo.submissionId, sourceChainId, executor, externalCallData, {
                    meta: externalCallMeta,
                    storage: externalCallStorage,
                });
            }
            if (autoParams !== undefined && autoParams.executionFee !== "" && autoParams.fallbackAddress !== "") {
                claimAutoParams = {
                    executionFee: crypto.denormalizeAmount(new BN((autoParams === null || autoParams === void 0 ? void 0 : autoParams.executionFee) || 0), 0),
                    nativeSender: helpers.hexToBuffer(senderInfo.sender),
                    reservedFlag: new BN((autoParams === null || autoParams === void 0 ? void 0 : autoParams.flags) || 0).toArrayLike(Buffer, "be", 32),
                    externalCallShortcut: crypto.hashExternalCallBytes(autoParams === null || autoParams === void 0 ? void 0 : autoParams.data),
                };
            }
            const [claimMarker] = this.accountsResolver.getClaimMarkerAddress();
            let fallback = receiver;
            if (autoParams === null || autoParams === void 0 ? void 0 : autoParams.fallbackAddress) {
                fallback = new PublicKey(autoParams.fallbackAddress.startsWith("0x") ? helpers.hexToBuffer(autoParams.fallbackAddress) : autoParams.fallbackAddress);
            }
            if (!confirmationStorageCreator) {
                try {
                    const confStorage = yield this.getConfirmationStorageSafe(confirmationStorage);
                    confirmationStorageCreator = confStorage.creator;
                }
                catch (_c) {
                    confirmationStorageCreator = executor;
                }
            }
            const claimInstrBuilder = instructions.claimInstrution(this._program, {
                submissionAddr,
                tokenMint,
                claimMarker,
                bridgeData: bridgeDataAccount,
                stakingWallet,
                mintAuthority,
                chainSupportInfo: chainSupportInfoAccount,
                claimToWallet,
                fallbackAddress: fallback,
                receiver,
                confirmationStorage,
                executor,
                payerWallet,
                externalCallStorage,
                externalCallMeta,
                state: this.statePublicKey,
                feeBeneficiary: this.feeBeneficiarAccount,
                confirmationStorageCreator: confirmationStorageCreator,
                settingsProgram: this.settingsProgram.programId,
            }, {
                sourceChainId,
                amount: crypto.denormalizeAmount(new BN(amount), 0),
                nonce: new BN(submissionInfo.nonce).toArrayLike(Buffer, "be", 32),
                submissionParams: claimAutoParams,
            });
            const claimInstr = yield claimInstrBuilder.instruction();
            result.add(claimInstr);
            return { extCallStorage: exTxs, transaction: { instructions: result.instructions, payer: executor } };
        });
    }
    /**
     * Checks if we can claim amount from bridge
     * @param tokenMint pubkey or base58 encoded pubkey of token main
     * @param isMint
     * @param amount amount to check
     * @returns true if amout is less than bridge balance or bridge is mint
     */
    isBridgeBalanceOk(tokenMint, isMint, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!isMint) {
                tokenMint = new PublicKey(tokenMint);
                const balance = yield this.getBridgeBalance(tokenMint);
                logger.debug(`Bridge balance: ${balance.toString()}`);
                return balance.sub(new BN(amount)).ltn(0) ? false : true;
            }
            return true;
        });
    }
    /**
     * Checks if submission is used
     * @param submissionId debridge submission id, {@link hashSubmissionIdRaw}
     * @returns true if non-empty associated account for submission exists
     */
    isSubmissionUsed(submissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [submissionAddr] = this.accountsResolver.getSubmissionAddress(isBuffer(submissionId) ? submissionId : helpers.hexToBuffer(submissionId));
            const subData = yield this.getAccountInfo(submissionAddr);
            return subData ? subData.data.length > 0 : false;
        });
    }
    /**
     * Checks if claim won't fail
     * @param executor account of transaction signer
     * @param amount amount to claim
     * @param receiverInfo account of receiver, token mint and [claimToWallet address]
     * @param senderInfo hex-encoded sender and chain id from
     * @param submissionInfo nonce and [submissionId]
     * @param autoParams execution fee, external call data, fallback address
     * @param createMissingWallets if true, method won't fail during wallets check
     * @returns calculated submission id and confirmation storage address
     */
    checkClaimParams(executor, amount, receiverInfo, senderInfo, submissionInfo, autoParams, createMissingWallets = true) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            executor = new PublicKey(executor);
            const receiver = typeof receiverInfo.receiver === "string"
                ? receiverInfo.receiver.startsWith("0x")
                    ? new PublicKey(helpers.hexToBuffer(receiverInfo.receiver))
                    : new PublicKey(receiverInfo.receiver)
                : new PublicKey(receiverInfo.receiver);
            const tokenMint = new PublicKey(receiverInfo.tokenMint);
            const [bridgeDataAccount] = this.accountsResolver.getBridgeAddress(tokenMint);
            const [mintAuthorityAccount] = this.accountsResolver.getMintAuthorityAddress(bridgeDataAccount);
            const [stakingWalletAccount] = findAssociatedTokenAddress(mintAuthorityAccount, tokenMint, this.associatedTokenProgramId);
            const [payerWalletAccount] = findAssociatedTokenAddress(executor, tokenMint, this.associatedTokenProgramId);
            const [claimToWallet] = receiverInfo.claimToWallet
                ? [new PublicKey(receiverInfo.claimToWallet)]
                : findAssociatedTokenAddress(receiver, tokenMint, this.associatedTokenProgramId);
            const [rawBridgeData, stakingWalletAccountData, payerWalletAccountData, claimToWalletData] = yield this._connection.getMultipleAccountsInfo([bridgeDataAccount, stakingWalletAccount, payerWalletAccount, claimToWallet]);
            const bridgeData = this.decoder.decodeBridge(rawBridgeData);
            if (!createMissingWallets) {
                if (isAccountEmpty(stakingWalletAccountData)) {
                    throw new AssociatedWalletNotInitialized(mintAuthorityAccount, stakingWalletAccount);
                }
                if (isAccountEmpty(payerWalletAccountData)) {
                    throw new AssociatedWalletNotInitialized(executor, payerWalletAccount);
                }
                if (isAccountEmpty(claimToWalletData)) {
                    throw new AssociatedWalletNotInitialized(receiver, claimToWallet);
                }
            }
            const amountBN = new BN(amount);
            if (bridgeData === null)
                throw new Error("Bridge not exists or failed to fetch it's info from the RPC");
            if (DeBridgeSolanaClient.getBridgeInfoFromBridgeType(bridgeData).state === BridgeState.PAUSE) {
                throw new BridgePaused(bridgeDataAccount);
            }
            const [submissionId, sourceChainId] = yield this.hashSubmissionId({
                bridge: bridgeData.data,
                nonce: submissionInfo.nonce,
                receiver,
                chainFrom: senderInfo.chainFrom,
                amount,
                autoParams,
            });
            const [chainSupportInfoAccount] = this.accountsResolver.getChainSupportInfoAddress(sourceChainId);
            const [rawChainSupportInfo, rawSubmission] = yield this._connection.getMultipleAccountsInfo([
                chainSupportInfoAccount,
                this.accountsResolver.getSubmissionAddress(submissionId)[0],
            ]);
            try {
                const chainSupportInfo = this.decoder.decodeChainSupportInfo(rawChainSupportInfo);
                if (!isSupportedChainInfoType(chainSupportInfo === null || chainSupportInfo === void 0 ? void 0 : chainSupportInfo.data)) {
                    throw new ChainSupportInfoNotSupported(chainSupportInfoAccount);
                }
            }
            catch (e) {
                throw new ChainSupportInfoMalformed(chainSupportInfoAccount);
            }
            if (!isAccountEmpty(rawSubmission) && ((_a = rawSubmission === null || rawSubmission === void 0 ? void 0 : rawSubmission.data.length) !== null && _a !== void 0 ? _a : 0) > 0) {
                throw new AlreadyClaimed(submissionId);
            }
            // TODO: check confirmations
            // const [confirmationStorage, confirmationStorageBump] = accounts.getConfirmationStorageAccount(submissionId);
            // TODO: vlaidate ext call storage
            // const [externalCallStorageAccount, externalCallStorageBump] = this.accountsResolver.getExternalCallStorageAddress(submissionId, executor.publicKey);
            // check if send bridge has enough tokens locked
            if (bridgeData.data.send) {
                const balance = bridgeData.data.send.info.balance;
                logger.debug(`Send bridge balance: ${balance.toString()}`);
                if (balance.sub(new BN(amount)).ltn(0)) {
                    throw new NotEnoughTokens(stakingWalletAccount, 0, amountBN);
                }
            }
            const [confirmationStorageAccount] = this.accountsResolver.getConfirmationsStorageAddress(submissionId);
            return [submissionId, confirmationStorageAccount];
        });
    }
    get feeBeneficiary() {
        if (!this.isInitialized())
            throw new Error("Initialized, call init first");
        return this.feeBeneficiarAccount;
    }
    get wallet() {
        if (!this._wallet) {
            return null;
        }
        return this._wallet;
    }
    get provider() {
        return this._provider;
    }
    /**
     * get deBridge anchor.Program
     * @returns deBridge anchor.Program instance
     */
    get program() {
        return this._program;
    }
    /**
     * get deBridgeSettings anchor.Program
     * @returns deBridgeSettings anchor.Program instance
     */
    get settingsProgram() {
        return this._settingsProgram;
    }
    /**
     * Returns list of all possible custom errors
     * @returns list of all errors for deBridge and deBridgeSettings
     */
    get idlErrors() {
        return (this.program.idl.errors || []).concat((this.settingsProgram.idl.errors || []));
    }
    static setEventListeners(program, mainEvent, resolve, reject, resolveCondition) {
        // eslint-disable-next-line prefer-const
        let cleanResolve;
        const conditionFunc = resolveCondition ? resolveCondition : (event) => true;
        const eventListener = program.addEventListener(mainEvent, (event, slot) => conditionFunc(event) && cleanResolve(event));
        const logEventListener = program.addEventListener(LOG_EVENT, (event, slot) => logger.debug("===== LOG_EVENT: ", event));
        const removeEventListeners = () => __awaiter(this, void 0, void 0, function* () {
            yield program.removeEventListener(eventListener);
            yield program.removeEventListener(logEventListener);
        });
        cleanResolve = (message) => __awaiter(this, void 0, void 0, function* () {
            yield removeEventListeners();
            resolve(message);
        });
        const cleanReject = (error) => __awaiter(this, void 0, void 0, function* () {
            yield removeEventListeners();
            reject(error);
        });
        return { cleanResolve, cleanReject };
    }
}
//# sourceMappingURL=deBridgeContracts.js.map