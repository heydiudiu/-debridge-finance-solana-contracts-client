"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientV2 = void 0;
const tslib_1 = require("tslib");
const web3_js_1 = require("@solana/web3.js");
const wasm = tslib_1.__importStar(require("@debridge-finance/debridge-external-call"));
const anchor_1 = require("@coral-xyz/anchor");
const solana_utils_1 = require("@debridge-finance/solana-utils");
const debridge_settings_program_1 = require("./idl/debridge_settings_program");
const debridge_program_1 = require("./idl/debridge_program");
const interfaces_1 = require("./interfaces");
const _1 = require(".");
const decoder_1 = require("./decoder");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const accounts_1 = require("./accounts");
function newTxWithOptionalPriorityFee(priorityFee) {
    const tx = new web3_js_1.Transaction();
    if (priorityFee) {
        tx.add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: priorityFee.limit }));
        if (priorityFee.microLamports)
            tx.add(web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee.microLamports }));
    }
    return tx;
}
class ClientV2 {
    constructor(connection, options) {
        var _a, _b;
        this.connection = connection;
        this.feeBeneficiaryAccount = undefined;
        this.cachedState = null;
        if (!(options === null || options === void 0 ? void 0 : options.chainId)) {
            throw new Error(`chainId is required`);
        }
        this.chainId = options.chainId;
        this.settings = new anchor_1.Program(debridge_settings_program_1.IDL, (_a = options === null || options === void 0 ? void 0 : options.settingsProgram) !== null && _a !== void 0 ? _a : solana_utils_1.programs.settings);
        this.program = new anchor_1.Program(debridge_program_1.IDL, (_b = options === null || options === void 0 ? void 0 : options.deBridgeProgram) !== null && _b !== void 0 ? _b : solana_utils_1.programs.deBridge);
        this.logger = options === null || options === void 0 ? void 0 : options.clientLogger;
        this.accountsResolver = (0, solana_utils_1.DeBridgeResolver)(this.program.programId, this.settings.programId).methods;
        this.decoder = (0, decoder_1.buildDebridgeDecoder)(this.program, this.settings);
        this.priorityFeeConfig = options === null || options === void 0 ? void 0 : options.priorityFeeConfig;
        this.stateAccount = this.accountsResolver.getStateAddress()[0];
    }
    async getState() {
        if (this.cachedState !== null) {
            return this.cachedState;
        }
        else {
            const account = await this.connection.getAccountInfo(this.stateAccount);
            const decoded = this.decoder.decodeState(account);
            this.cachedState = decoded;
            if (this.cachedState) {
                this.feeBeneficiaryAccount = this.cachedState.feeBeneficiary;
            }
            return this.cachedState;
        }
    }
    getCalldataShortcut(flags, data) {
        const calldata = data ? (typeof data === "string" ? solana_utils_1.helpers.hexToBuffer(data) : Buffer.from(data)) : undefined;
        return (0, utils_1.checkFlag)(flags, constants_1.SEND_HASHED_DATA) ? calldata !== null && calldata !== void 0 ? calldata : solana_utils_1.crypto.hashExternalCallBytes() : solana_utils_1.crypto.hashExternalCallBytes(calldata);
    }
    splitDataForExternalCall(data, usePriorityFee = false) {
        const EXTEND_IX_MAX_SIZE = 876 - (usePriorityFee ? 70 : 0);
        const INIT_OR_UPDATE_CHUNK_SIZE = EXTEND_IX_MAX_SIZE + 20;
        const result = [];
        let currentPos = 0;
        while (currentPos < data.length) {
            const chunkSize = INIT_OR_UPDATE_CHUNK_SIZE;
            const chunk = data.slice(currentPos, currentPos + chunkSize);
            result.push({ data: chunk, offset: currentPos });
            currentPos += chunkSize;
        }
        return result;
    }
    async buildFillExtcallStorageTransactions(sourceChain, totalLength, chunks, storageKey, accounts, priorityFee) {
        var _a;
        if (chunks.length === 0)
            return null;
        const storePriorityFee = priorityFee !== null && priorityFee !== void 0 ? priorityFee : (_a = this.priorityFeeConfig) === null || _a === void 0 ? void 0 : _a.storeExternalCall;
        const sourceChainId = solana_utils_1.crypto.normalizeChainId(sourceChain);
        const ixContext = {
            claimer: accounts.executor,
            externalCallMeta: accounts.externalCallMeta,
            externalCallStorage: accounts.externalCallStorage,
        };
        const result = [];
        for (const chunk of chunks) {
            result.push({
                instructions: newTxWithOptionalPriorityFee(storePriorityFee).add(await _1.instructions
                    .initOrUpdateExternalCallStorage(this.program, ixContext, {
                    externalCallLen: totalLength,
                    rawInstructions: chunk.data,
                    sourceChainId,
                    storageKey,
                    externalInstructionsOffset: chunk.offset,
                })
                    .instruction()).instructions,
                payer: accounts.executor,
            });
        }
        return result;
    }
    async prepareExternalCallTransactions(storageKey, sourceChain, data, accounts, priorityFee) {
        var _a, _b, _c, _d, _e, _f;
        let chunksToWrite = [];
        const storePriorityFee = priorityFee !== null && priorityFee !== void 0 ? priorityFee : (_a = this.priorityFeeConfig) === null || _a === void 0 ? void 0 : _a.storeExternalCall;
        const logger = (_b = this.logger) === null || _b === void 0 ? void 0 : _b.child({ method: "prepareExternalCallTransactions" });
        if (((_c = accounts.submission) === null || _c === void 0 ? void 0 : _c.data) !== null) {
            logger === null || logger === void 0 ? void 0 : logger.debug("Submission already claimed, hence calldata was already saved");
            return null;
        }
        if (accounts.externalCallMeta) {
            const decodedExtCallMeta = accounts.externalCallMeta.data;
            if (!(0, interfaces_1.isExtCallMetaAccumulation)((_d = decodedExtCallMeta === null || decodedExtCallMeta === void 0 ? void 0 : decodedExtCallMeta.data) !== null && _d !== void 0 ? _d : null)) {
                logger === null || logger === void 0 ? void 0 : logger.debug(`ExternalCallMeta exists and is not in accumulation state, no need to save calldata`);
                return null;
            }
            else {
                // accumulation, already allocated, need to overwrite
                if (((_e = accounts.externalCallStorage) === null || _e === void 0 ? void 0 : _e.data) === undefined || accounts.externalCallStorage.data === null) {
                    throw new Error(`storage should be already initialized, something is wrong`);
                }
                else if (data.equals((_f = accounts.externalCallStorage.data) === null || _f === void 0 ? void 0 : _f.slice(constants_1.EXT_CALL_STORAGE_OFFSET))) {
                    logger === null || logger === void 0 ? void 0 : logger.debug(`Data was already stored correctly, no need to overwrite`);
                    return null;
                }
                else {
                    const onChainData = accounts.externalCallStorage.data.slice(constants_1.EXT_CALL_STORAGE_OFFSET);
                    const OVERWRITE_CHUNK_SIZE = 870 - (storePriorityFee ? 50 : 0);
                    let offset = 0;
                    while (offset < data.length) {
                        const range = [offset, offset + OVERWRITE_CHUNK_SIZE];
                        const correctChunk = data.slice(...range);
                        if (!correctChunk.equals(onChainData.slice(...range))) {
                            logger === null || logger === void 0 ? void 0 : logger.debug(`Overwrite required for chunk: ${range[0]}..${range[1]}`);
                            chunksToWrite.push({ data: correctChunk, offset });
                        }
                        offset += OVERWRITE_CHUNK_SIZE;
                    }
                }
            }
        }
        else {
            chunksToWrite = this.splitDataForExternalCall(data, storePriorityFee !== undefined);
        }
        return this.buildFillExtcallStorageTransactions(sourceChain, data.length, chunksToWrite, storageKey, {
            executor: accounts.executor,
            externalCallMeta: accounts.externalCallMeta.address,
            externalCallStorage: accounts.externalCallStorage.address,
        }, priorityFee);
    }
    /**
     * Packs initCalldata and other instructions into single tx if possible
     * If extCallTransactions contains both init & store txs that's pointless -> return extCall transactions as is
     * @param instructions instructions list that should go before initCalldata (prefix) and after initCalldata ix (postfix)
     * @param extCallTxs calldata txs or null
     * @returns packed tx and modified extCallTransactions
     */
    tryPackCalldataTransaction(ixs, extCallTxs) {
        var _a;
        const result = new web3_js_1.Transaction();
        if (ixs.prefix.length) {
            result.add(...ixs.prefix);
        }
        if (extCallTxs) {
            const txCopy = new web3_js_1.Transaction(result);
            let lastIx = null;
            if (extCallTxs.length === 1) {
                lastIx = (_a = extCallTxs.at(0)) === null || _a === void 0 ? void 0 : _a.instructions.at(0);
            }
            // if last ix is null, hence it wasn't modified and we don't need to process it
            if (lastIx !== null) {
                if (lastIx === undefined)
                    throw new Error(`Unreachable, empty store ext call tx`);
                txCopy.add(lastIx);
                txCopy.add(...ixs.postfix);
                const txSize = solana_utils_1.txs.getTransactionSize(txCopy);
                if (txSize !== null && txSize !== void 0 ? txSize : +Infinity < solana_utils_1.constants.MAX_TX_SIZE - 2) {
                    result.add(lastIx);
                    result.add(...ixs.postfix);
                    extCallTxs = null;
                }
            }
        }
        return {
            transaction: result,
            extCallTxs: extCallTxs,
        };
    }
    buildSendContext(sender, tokenMint, chainTo, externalCall, options) {
        var _a, _b;
        const [bridge] = this.accountsResolver.getBridgeAddress(tokenMint);
        const sendFromWallet = (_a = options === null || options === void 0 ? void 0 : options.sendFromWallet) !== null && _a !== void 0 ? _a : (0, solana_utils_1.findAssociatedTokenAddress)(sender, tokenMint)[0];
        const [mintAuthority] = this.accountsResolver.getMintAuthorityAddress(bridge);
        const [chainSupportInfo] = this.accountsResolver.getChainSupportInfoAddress(solana_utils_1.crypto.normalizeChainId(chainTo));
        const [stakingWallet] = (0, solana_utils_1.findAssociatedTokenAddress)(mintAuthority, tokenMint);
        const [nonceStorage] = this.accountsResolver.getNonceAddress();
        const [bridgeFee] = (options === null || options === void 0 ? void 0 : options.useAssetFee)
            ? this.accountsResolver.getBridgeFeeAddress(bridge, chainTo)
            : this.accountsResolver.getNoBridgeFeeAddress();
        const [discount] = (options === null || options === void 0 ? void 0 : options.useDiscount)
            ? this.accountsResolver.getDiscountInfoAddress(sender)
            : this.accountsResolver.getNoDiscountAddress();
        const shortcut = (externalCall === null || externalCall === void 0 ? void 0 : externalCall.shortcut)
            ? typeof externalCall.shortcut === "string"
                ? solana_utils_1.helpers.hexToBuffer(externalCall.shortcut)
                : Buffer.from(externalCall.shortcut)
            : this.getCalldataShortcut((_b = externalCall === null || externalCall === void 0 ? void 0 : externalCall.flags) !== null && _b !== void 0 ? _b : 0, externalCall === null || externalCall === void 0 ? void 0 : externalCall.data);
        const [externalCallStorage] = this.accountsResolver.getExternalCallStorageAddress(shortcut, sender, solana_utils_1.crypto.normalizeChainId(this.chainId));
        const [externalCallMeta] = this.accountsResolver.getExternalCallMetaAddress(externalCallStorage);
        const accounts = {
            bridgeCtx: {
                bridge,
                tokenMint,
                stakingWallet,
                mintAuthority,
                chainSupportInfo,
                splTokenProgram: solana_utils_1.TOKEN_PROGRAM_ID,
                settingsProgram: this.settings.programId,
            },
            stateCtx: {
                state: this.stateAccount,
                feeBeneficiary: this.feeBeneficiary,
            },
            nonceStorage,
            sendFromWallet,
            sendFrom: sender,
            bridgeFee,
            discount,
            systemProgram: web3_js_1.SystemProgram.programId,
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
            bridgeFee,
            discount,
            systemProgram: accounts.systemProgram,
            externalCallStorage,
            externalCallMeta,
        };
        return {
            asFlat: flatAccounts,
            asAccountMeta: accountMeta,
            asIdl: accounts,
        };
    }
    async buildSendTransactions(sender, amount, receiverInfo, senderInfo, autoParams, options) {
        var _a, _b, _c, _d, _e, _f;
        const logger = (_a = this.logger) === null || _a === void 0 ? void 0 : _a.child({ method: "buildSend" });
        const result = newTxWithOptionalPriorityFee((_b = options === null || options === void 0 ? void 0 : options.sendPriorityFee) !== null && _b !== void 0 ? _b : (_c = this.priorityFeeConfig) === null || _c === void 0 ? void 0 : _c.send);
        if (options === undefined)
            options = {};
        if (options.useAssetFee === undefined)
            options.useAssetFee = false;
        sender = new web3_js_1.PublicKey(sender);
        const tokenMint = new web3_js_1.PublicKey(senderInfo.tokenMint);
        const chainId = solana_utils_1.crypto.normalizeChainId(receiverInfo.chainTo);
        const sendAccounts = this.buildSendContext(sender, tokenMint, chainId, autoParams !== null && autoParams !== void 0 ? autoParams : null, {
            sendFromWallet: (senderInfo === null || senderInfo === void 0 ? void 0 : senderInfo.sendFromWallet) ? new web3_js_1.PublicKey(senderInfo.sendFromWallet) : undefined,
            ...options,
        }).asFlat;
        const externalCallExists = (autoParams === null || autoParams === void 0 ? void 0 : autoParams.data) && !(0, utils_1.checkFlag)(autoParams === null || autoParams === void 0 ? void 0 : autoParams.flags, constants_1.SEND_HASHED_DATA);
        const externalCallAccounts = [];
        if (externalCallExists) {
            externalCallAccounts.push(sendAccounts.externalCallMeta, sendAccounts.externalCallStorage);
        }
        const [discountData, bridgeFeeData, sendFromWalletData, stakingWalletData, chainSupportInfoData, bridgeAccountData, ...extCallChainData] = await this.connection.getMultipleAccountsInfo([
            sendAccounts.discount,
            sendAccounts.bridgeFee,
            sendAccounts.sendFromWallet,
            sendAccounts.stakingWallet,
            sendAccounts.chainSupportInfo,
            sendAccounts.bridge,
            ...externalCallAccounts,
        ]);
        const bridgeData = this.decoder.decodeBridge(bridgeAccountData);
        if (!bridgeData)
            throw new errors_1.BridgeNotExists(sendAccounts.bridge);
        let isPaused = false;
        if ((0, interfaces_1.isMintBridge)(bridgeData.data)) {
            isPaused = bridgeData.data.mint.info.state === interfaces_1.BridgeState.PAUSE;
        }
        else if ((0, interfaces_1.isSendBridge)(bridgeData.data)) {
            isPaused = bridgeData.data.send.info.state === interfaces_1.BridgeState.PAUSE;
        }
        else {
            throw new Error(`Bridge not exists or malformed`);
        }
        if (isPaused)
            throw new errors_1.BridgePaused(sendAccounts.bridge);
        if ((0, utils_1.isAccountEmpty)(stakingWalletData)) {
            result.add(solana_utils_1.spl.createAssociatedWalletInstruction(tokenMint, sendAccounts.stakingWallet, sendAccounts.mintAuthority, sender));
        }
        if (options.useAssetFee) {
            if ((0, utils_1.isAccountEmpty)(bridgeFeeData))
                throw new errors_1.AssetFeeNotSupported(sendAccounts.bridgeFee);
        }
        if ((0, utils_1.isAccountEmpty)(sendFromWalletData)) {
            throw new errors_1.AssociatedWalletNotInitialized(sender, sendAccounts.sendFromWallet);
        }
        if (options.useDiscount) {
            if ((0, utils_1.isAccountEmpty)(discountData)) {
                throw new errors_1.DiscountNotExists(sendAccounts.discount);
            }
            else {
                const decodedDiscount = this.decoder.decodeDiscountInfo(discountData);
                if (decodedDiscount === null)
                    throw new errors_1.DiscountInfoMalformed(sendAccounts.discount);
                if (!(0, interfaces_1.isActiveDiscount)(decodedDiscount.data))
                    throw new errors_1.DiscountNotActive(sendAccounts.discount);
            }
        }
        const receiver = solana_utils_1.helpers.hexToBuffer(receiverInfo.receiver);
        const chainSupportInfo = this.decoder.decodeChainSupportInfo(chainSupportInfoData);
        const fallbackAddressBuffer = (autoParams === null || autoParams === void 0 ? void 0 : autoParams.fallbackAddress)
            ? solana_utils_1.helpers.hexToBuffer(autoParams.fallbackAddress)
            : undefined;
        if (chainSupportInfo === null) {
            throw new errors_1.ChainSupportInfoNotInitialized(sendAccounts.chainSupportInfo);
        }
        else if (!(0, interfaces_1.isSupportedChainInfoType)(chainSupportInfo.data)) {
            throw new errors_1.ChainSupportInfoNotSupported(sendAccounts.chainSupportInfo);
        }
        else {
            if (receiver.length !== chainSupportInfo.data.supported.chainAddressLen)
                throw Error(`Bad receiver length! Got: ${receiver.length}, expected: ${chainSupportInfo.data.supported.chainAddressLen}`);
            if (fallbackAddressBuffer && fallbackAddressBuffer.length !== chainSupportInfo.data.supported.chainAddressLen)
                throw Error(`Bad fallback length! Got: ${fallbackAddressBuffer.length}, expected: ${chainSupportInfo.data.supported.chainAddressLen}`);
        }
        let submissionParams = undefined;
        const externalCallShortcut = (autoParams === null || autoParams === void 0 ? void 0 : autoParams.shortcut)
            ? typeof autoParams.shortcut === "string"
                ? solana_utils_1.helpers.hexToBuffer(autoParams.shortcut)
                : autoParams.shortcut
            : this.getCalldataShortcut((_d = autoParams === null || autoParams === void 0 ? void 0 : autoParams.flags) !== null && _d !== void 0 ? _d : 0, autoParams === null || autoParams === void 0 ? void 0 : autoParams.data);
        if (autoParams) {
            if (fallbackAddressBuffer === undefined)
                throw new Error(`Should never happen, fallbackAddressBuffer is undefined`);
            submissionParams = {
                executionFee: new anchor_1.BN((_e = autoParams.executionFee) !== null && _e !== void 0 ? _e : 0),
                fallbackAddress: fallbackAddressBuffer,
                externalCallShortcut: externalCallShortcut,
                reservedFlag: solana_utils_1.interfaces.isBuffer(autoParams.flags)
                    ? autoParams.flags
                    : new anchor_1.BN((_f = autoParams === null || autoParams === void 0 ? void 0 : autoParams.flags) !== null && _f !== void 0 ? _f : 0).toArrayLike(Buffer, "be", 32),
            };
        }
        let extCallTxs = null;
        if (externalCallExists) {
            if (!(autoParams === null || autoParams === void 0 ? void 0 : autoParams.data)) {
                throw new Error(`AutoParams.data field is empty while shortuct is not hash([]) && SEND_HASHED flag is not set`);
            }
            const [extCallMetaData, extCallStorageData] = extCallChainData;
            const externalCallData = typeof autoParams.data === "string" ? solana_utils_1.helpers.hexToBuffer(autoParams.data) : autoParams.data;
            extCallTxs = await this.prepareExternalCallTransactions(externalCallShortcut, this.chainId, externalCallData, {
                executor: sender,
                externalCallMeta: (0, accounts_1.buildDecodedAccountInfoWithAddress)(sendAccounts.externalCallMeta, extCallMetaData, this.decoder.decodeExternalCallMeta),
                externalCallStorage: (0, accounts_1.buildDecodedAccountInfoWithAddress)(sendAccounts.externalCallStorage, extCallStorageData, (data) => Buffer.from(data)),
            });
        }
        const builder = _1.instructions.sendInstruction(this.program, sendAccounts, {
            amount: new anchor_1.BN(amount.toString()),
            chainIdBuffer: chainId,
            receiver,
            useAssetFee: options.useAssetFee,
            referralCode: options === null || options === void 0 ? void 0 : options.referralCode,
            submissionParams,
        });
        return this.tryPackCalldataTransaction({ prefix: result.instructions, postfix: [await builder.instruction()] }, extCallTxs);
    }
    async buildClaimTransactions(executor, amount, receiverInfo, senderInfo, submissionInfo, autoParams, options) {
        var _a, _b, _c, _d, _e;
        if (options === undefined)
            options = {};
        if ((options === null || options === void 0 ? void 0 : options.createMissingWallets) === undefined) {
            options.createMissingWallets = true;
        }
        const missingWalletsConfig = typeof options.createMissingWallets === "boolean"
            ? {
                payerWallet: options.createMissingWallets
                    ? { check: interfaces_1.WalletCheckEnum.Create }
                    : { check: interfaces_1.WalletCheckEnum.ThrowError },
                receiverWallet: options.createMissingWallets
                    ? { check: interfaces_1.WalletCheckEnum.Create }
                    : { check: interfaces_1.WalletCheckEnum.ThrowError },
                stakingWallet: options.createMissingWallets
                    ? { check: interfaces_1.WalletCheckEnum.Create }
                    : { check: interfaces_1.WalletCheckEnum.ThrowError },
            }
            : options.createMissingWallets;
        executor = new web3_js_1.PublicKey(executor);
        const sourceChainId = solana_utils_1.crypto.normalizeChainId(senderInfo.chainFrom);
        const subIdBuffer = typeof submissionInfo.submissionId === "string"
            ? solana_utils_1.helpers.hexToBuffer(submissionInfo.submissionId)
            : submissionInfo.submissionId;
        const logger = (_a = this.logger) === null || _a === void 0 ? void 0 : _a.child({ submission: solana_utils_1.helpers.bufferToHex(subIdBuffer) });
        logger === null || logger === void 0 ? void 0 : logger.info("Started to build claim tx");
        const result = newTxWithOptionalPriorityFee((_b = options.claimPriorityFee) !== null && _b !== void 0 ? _b : (_c = this.priorityFeeConfig) === null || _c === void 0 ? void 0 : _c.claim);
        const receiver = typeof receiverInfo.receiver === "string"
            ? receiverInfo.receiver.startsWith("0x")
                ? new web3_js_1.PublicKey(solana_utils_1.helpers.hexToBuffer(receiverInfo.receiver))
                : new web3_js_1.PublicKey(receiverInfo.receiver)
            : new web3_js_1.PublicKey(receiverInfo.receiver);
        const tokenMint = new web3_js_1.PublicKey(receiverInfo.tokenMint);
        let claimToWalletAccount = null;
        let externalCallData = undefined;
        if ((autoParams === null || autoParams === void 0 ? void 0 : autoParams.data) && autoParams.data !== "0x") {
            externalCallData = typeof autoParams.data === "string" ? solana_utils_1.helpers.hexToBuffer(autoParams.data) : autoParams.data;
        }
        const [confirmationStorageAccount] = this.accountsResolver.getConfirmationsStorageAddress(subIdBuffer);
        const [bridgeDataAccount] = this.accountsResolver.getBridgeAddress(tokenMint);
        const [mintAuthorityAccount] = this.accountsResolver.getMintAuthorityAddress(bridgeDataAccount);
        const [submissionAccount] = this.accountsResolver.getSubmissionAddress(subIdBuffer);
        const [submissionAuthAccount] = this.accountsResolver.getSubmissionAuthAddress(submissionAccount);
        const [stakingWalletAccount] = (0, solana_utils_1.findAssociatedTokenAddress)(mintAuthorityAccount, tokenMint);
        const [payerWalletAccount] = ((_d = missingWalletsConfig.payerWallet) === null || _d === void 0 ? void 0 : _d.wallet)
            ? [new web3_js_1.PublicKey(missingWalletsConfig.payerWallet.wallet)]
            : (0, solana_utils_1.findAssociatedTokenAddress)(executor, tokenMint);
        const claimToWalletOwner = externalCallData !== undefined ? submissionAuthAccount : receiver;
        claimToWalletAccount = (receiverInfo === null || receiverInfo === void 0 ? void 0 : receiverInfo.claimToWallet) ? new web3_js_1.PublicKey(receiverInfo.claimToWallet) : receiver;
        if (!claimToWalletAccount)
            [claimToWalletAccount] = (0, solana_utils_1.findAssociatedTokenAddress)(claimToWalletOwner, tokenMint);
        const [claimMarker] = this.accountsResolver.getClaimMarkerAddress();
        let fallback = receiver;
        if (autoParams === null || autoParams === void 0 ? void 0 : autoParams.fallbackAddress) {
            fallback = new web3_js_1.PublicKey(autoParams.fallbackAddress.startsWith("0x") ? solana_utils_1.helpers.hexToBuffer(autoParams.fallbackAddress) : autoParams.fallbackAddress);
        }
        const [chainSupportInfoAccount] = this.accountsResolver.getChainSupportInfoAddress(sourceChainId);
        const [externalCallStorageAccount] = this.accountsResolver.getExternalCallStorageAddress(subIdBuffer, executor, sourceChainId);
        const [externalCallMetaAccount] = this.accountsResolver.getExternalCallMetaAddress(externalCallStorageAccount);
        const [stakingWalletData, payerWalletData, submissionData, confirmationStorageData, externalCallStorageData, externalCallMetaData] = await this.connection.getMultipleAccountsInfo([
            stakingWalletAccount,
            payerWalletAccount,
            submissionAccount,
            confirmationStorageAccount,
            externalCallStorageAccount,
            externalCallMetaAccount,
        ]);
        if ((0, utils_1.isAccountEmpty)(stakingWalletData)) {
            if (missingWalletsConfig.stakingWallet.check === interfaces_1.WalletCheckEnum.Create) {
                result.add(solana_utils_1.spl.createAssociatedWalletInstruction(tokenMint, stakingWalletAccount, mintAuthorityAccount, executor));
            }
            else {
                throw new errors_1.AssociatedWalletNotInitialized(mintAuthorityAccount, stakingWalletAccount);
            }
        }
        let claimAutoParams = undefined;
        if (autoParams !== undefined && autoParams.executionFee !== "" && autoParams.fallbackAddress !== "") {
            claimAutoParams = {
                executionFee: solana_utils_1.crypto.denormalizeAmount(new anchor_1.BN((autoParams === null || autoParams === void 0 ? void 0 : autoParams.executionFee) || 0), 0),
                nativeSender: solana_utils_1.helpers.hexToBuffer(senderInfo.sender),
                reservedFlag: new anchor_1.BN((autoParams === null || autoParams === void 0 ? void 0 : autoParams.flags) || 0).toArrayLike(Buffer, "be", 32),
                externalCallShortcut: solana_utils_1.crypto.hashExternalCallBytes(autoParams === null || autoParams === void 0 ? void 0 : autoParams.data),
            };
        }
        const submission = new _1.Submission.SubmissionState(this.decoder, this.connection, subIdBuffer, {
            confirmationStorage: confirmationStorageAccount,
            submission: submissionAccount,
            externalCall: externalCallData !== undefined
                ? {
                    externalCallMeta: externalCallMetaAccount,
                    externalCallStorage: externalCallStorageAccount,
                }
                : null,
        }, (_e = this.logger) === null || _e === void 0 ? void 0 : _e.child({ module: "submissionListener" }).debug, {
            confirmationStorage: confirmationStorageData,
            submission: submissionData,
            externalCall: externalCallData !== undefined
                ? {
                    meta: externalCallMetaData,
                    storage: externalCallStorageData,
                }
                : null,
        });
        let extCallTxs = null;
        if (externalCallData !== undefined) {
            const submissionWithCalldata = submission;
            extCallTxs = await this.prepareExternalCallTransactions(subIdBuffer, sourceChainId, externalCallData, {
                executor,
                externalCallMeta: submissionWithCalldata.externalCallMeta,
                externalCallStorage: submissionWithCalldata.externalCallStorage,
                submission: submission.submission,
            });
        }
        if (!(options === null || options === void 0 ? void 0 : options.confirmationStorageCreator)) {
            if (submission.confirmationStorage !== null && submission.confirmationStorage.data) {
                options.confirmationStorageCreator = submission.confirmationStorage.data.creator;
            }
            else {
                options.confirmationStorageCreator = executor;
            }
        }
        const builder = _1.instructions.claimInstrution(this.program, {
            tokenMint,
            bridgeData: bridgeDataAccount,
            submissionAddr: submissionAccount,
            mintAuthority: mintAuthorityAccount,
            stakingWallet: stakingWalletAccount,
            chainSupportInfo: chainSupportInfoAccount,
            claimToWallet: claimToWalletAccount,
            fallbackAddress: fallback,
            receiver,
            confirmationStorage: confirmationStorageAccount,
            confirmationStorageCreator: options.confirmationStorageCreator,
            executor,
            payerWallet: payerWalletAccount,
            externalCallStorage: externalCallStorageAccount,
            externalCallMeta: externalCallMetaAccount,
            claimMarker,
            state: this.stateAccount,
            feeBeneficiary: this.feeBeneficiary,
            settingsProgram: this.settings.programId,
        }, {
            sourceChainId,
            amount: solana_utils_1.crypto.denormalizeAmount(new anchor_1.BN(amount.toString()), 0),
            nonce: new anchor_1.BN(submissionInfo.nonce).toArrayLike(Buffer, "be", 32),
            submissionParams: claimAutoParams,
        });
        return this.tryPackCalldataTransaction({ prefix: result.instructions, postfix: [await builder.instruction()] }, extCallTxs);
    }
    async buildStoreConfirmationsTransactions(payer, message, signatures, priorityFee) {
        var _a;
        const messageBuf = typeof message === "string" ? solana_utils_1.helpers.hexToBuffer(message) : Buffer.from(message);
        const [confirmationStorage] = this.accountsResolver.getConfirmationsStorageAddress(messageBuf);
        const storeSignaturesInstruction = await _1.instructions
            .storeConfirmationsInstruction(this.settings, {
            state: this.stateAccount,
            confirmationStorage,
            payer: payer,
        }, { message: messageBuf })
            .instruction();
        const CHUNK_SIZE = 5;
        const transactions = [];
        priorityFee = priorityFee !== null && priorityFee !== void 0 ? priorityFee : (_a = this.priorityFeeConfig) === null || _a === void 0 ? void 0 : _a.storeConfirmations;
        const signaturesBuf = signatures.map((s) => (typeof s === "string" ? solana_utils_1.helpers.hexToBuffer(s) : Buffer.from(s)));
        for (let i = 0; i < signaturesBuf.length; i += CHUNK_SIZE) {
            const transaction = newTxWithOptionalPriorityFee(priorityFee);
            const signaturesChunk = signaturesBuf.slice(i, i + CHUNK_SIZE);
            let instructionIndex = 0;
            if (priorityFee) {
                instructionIndex = (priorityFee === null || priorityFee === void 0 ? void 0 : priorityFee.microLamports) ? 2 : 1;
            }
            const packedSignatures = (0, _1.packSignatures)(messageBuf, signaturesChunk, instructionIndex);
            const signaturesInstruction = new web3_js_1.TransactionInstruction({
                keys: [],
                programId: web3_js_1.Secp256k1Program.programId,
                data: packedSignatures,
            });
            transaction.add(signaturesInstruction, storeSignaturesInstruction);
            transactions.push(transaction);
        }
        return transactions;
    }
    async buildInitMintBridge(payer, deployInfo, priorityFee) {
        const normalizedChainId = solana_utils_1.crypto.normalizeChainId(deployInfo.chainId.toString());
        const debridgeId = solana_utils_1.crypto.hashDebridgeId(normalizedChainId, deployInfo.nativeAddress);
        const debridgeIdBuf = solana_utils_1.helpers.hexToBuffer(debridgeId);
        const [tokenMint] = this.accountsResolver.getTokenMintAddress(debridgeIdBuf);
        const [bridgeData] = this.accountsResolver.getBridgeAddress(tokenMint);
        const deployId = solana_utils_1.crypto.hashDeployInfo({
            debridgeId,
            decimals: deployInfo.decimals,
            tokenName: deployInfo.name,
            tokenSymbol: deployInfo.symbol,
        });
        const [confirmationStorage] = this.accountsResolver.getConfirmationsStorageAddress(solana_utils_1.helpers.hexToBuffer(deployId));
        const [confStorageData] = await this.connection.getMultipleAccountsInfo([confirmationStorage]);
        let confirmationStorageCreator = payer;
        if (confStorageData !== null) {
            const decodedConfStorageData = this.decoder.decodeConfirmationStorage(confStorageData);
            if ((decodedConfStorageData === null || decodedConfStorageData === void 0 ? void 0 : decodedConfStorageData.creator) !== undefined) {
                confirmationStorageCreator = decodedConfStorageData.creator;
            }
            else {
                throw new Error(`Confirmation storage for deployId: ${deployId} exists, but it's broken (${confirmationStorage.toBase58()})`);
            }
        }
        const ix = await _1.instructions
            .initializeMintBridgeInstruction(this.settings, {
            bridgeData,
            tokenMetadataMaster: this.accountsResolver.getTokenMetadataMasterAddress()[0],
            confirmationStorage,
            confirmationStorageCreator,
            feeBeneficiary: this.feeBeneficiary,
            payer,
            state: this.stateAccount,
            tokenMint,
            mintAuthority: this.accountsResolver.getMintAuthorityAddress(bridgeData)[0],
            tokenMetadata: (0, solana_utils_1.getTokenMetadataAddress)(tokenMint, solana_utils_1.TOKEN_METADATA_PROGRAM_ID)[0],
        }, {
            chainId: normalizedChainId,
            decimals: deployInfo.decimals,
            nativeTokenAddress: deployInfo.nativeAddress,
            tokenName: deployInfo.name,
            tokenSymbol: deployInfo.symbol,
        })
            .instruction();
        return newTxWithOptionalPriorityFee(priorityFee).add(ix);
    }
    async buildInitSendBridge(payer, tokenMint, priorityFee) {
        const result = newTxWithOptionalPriorityFee(priorityFee);
        const bridgeId = solana_utils_1.helpers.hexToBuffer(solana_utils_1.crypto.hashDebridgeId(this.chainId, tokenMint.toBuffer()));
        const [bridgeData] = this.accountsResolver.getBridgeAddress(tokenMint);
        const [mintAuthority] = this.accountsResolver.getMintAuthorityAddress(bridgeData);
        const [stakingWallet] = (0, solana_utils_1.findAssociatedTokenAddress)(mintAuthority, tokenMint);
        const [stakingWalletData, ix] = await Promise.all([
            this.connection.getAccountInfo(stakingWallet),
            _1.instructions
                .initializeSendBridgeInstruction(this.settings, {
                payer,
                state: this.stateAccount,
                bridgeData,
                tokenMint,
                bridgeIdMap: this.accountsResolver.getBridgeMapAddress(bridgeId)[0],
                mintAuthority,
                stakingWallet,
                tokenMetadata: (0, solana_utils_1.getTokenMetadataAddress)(tokenMint, solana_utils_1.TOKEN_METADATA_PROGRAM_ID)[0],
            })
                .instruction(),
        ]);
        if (stakingWalletData === null) {
            result.add(solana_utils_1.spl.createAssociatedWalletInstruction(tokenMint, stakingWallet, mintAuthority, payer));
        }
        result.add(ix);
        return result;
    }
    prepareRemainingExtCallAccounts(count, submission, submissionAuth, submissionWallet, offset, calldata) {
        const executeContext = wasm.get_external_call_account_meta(calldata, offset, calldata.length, count, submission.toBase58(), submissionAuth.toBase58(), submissionWallet.toBase58());
        const remainingAccounts = executeContext.remaning_accounts().map((item) => ({
            isSigner: item.is_signer,
            isWritable: item.is_writable,
            pubkey: new web3_js_1.PublicKey(item.pubkey),
        }));
        executeContext.free();
        return [remainingAccounts, Buffer.from(executeContext.reversed_subsitution_bumps())];
    }
    buildExecuteExternalCallInstruction(accounts, submissionId, sourceChainId, count, subsitutionBumps) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const subIdBuffer = Buffer.from(submissionId);
        accounts.submission = (_a = accounts.submission) !== null && _a !== void 0 ? _a : this.accountsResolver.getSubmissionAddress(subIdBuffer)[0];
        accounts.submissionAuth = (_b = accounts.submissionAuth) !== null && _b !== void 0 ? _b : this.accountsResolver.getSubmissionAuthAddress(accounts.submission)[0];
        accounts.submissionWallet = (_c = accounts.submissionWallet) !== null && _c !== void 0 ? _c : (0, solana_utils_1.findAssociatedTokenAddress)(accounts.submissionAuth, accounts.tokenMint)[0];
        accounts.bridge = (_d = accounts.bridge) !== null && _d !== void 0 ? _d : this.accountsResolver.getBridgeAddress(accounts.tokenMint)[0];
        accounts.fallbackAddressWallet =
            (_e = accounts.fallbackAddressWallet) !== null && _e !== void 0 ? _e : (0, solana_utils_1.findAssociatedTokenAddress)(accounts.fallbackAddress, accounts.tokenMint)[0];
        accounts.externalCallStorage =
            (_f = accounts.externalCallStorage) !== null && _f !== void 0 ? _f : this.accountsResolver.getExternalCallStorageAddress(subIdBuffer, accounts.executor, sourceChainId)[0];
        accounts.externalCallMeta =
            (_g = accounts.externalCallMeta) !== null && _g !== void 0 ? _g : this.accountsResolver.getExternalCallMetaAddress(accounts.externalCallStorage)[0];
        accounts.rewardBeneficiaryWallet =
            (_h = accounts.rewardBeneficiaryWallet) !== null && _h !== void 0 ? _h : (0, solana_utils_1.findAssociatedTokenAddress)(accounts.executor, accounts.tokenMint)[0];
        const builder = _1.instructions.executeExternalCallInstruction(this.program, {
            bridge: accounts.bridge,
            executor: accounts.executor,
            externalCallMeta: accounts.externalCallMeta,
            externalCallStorage: accounts.externalCallStorage,
            fallbackAddress: accounts.fallbackAddress,
            fallbackAddressWallet: accounts.fallbackAddressWallet,
            originalClaimer: accounts.originalClaimer,
            rewardBeneficiaryWallet: accounts.rewardBeneficiaryWallet,
            state: this.stateAccount,
            submission: accounts.submission,
            submissionAuth: accounts.submissionAuth,
            submissionWallet: accounts.submissionWallet,
            tokenMint: accounts.tokenMint,
        }, { count, submissionId: subIdBuffer, subsitutionBumps }, accounts.remaining);
        return builder.instruction();
    }
    buildExecuteExternalCallTransaction(count, submissionId, executor, externalCallStorage, externalCallMeta, submission) {
        var _a, _b;
        if (!submission.data)
            throw new Error(`Empty submission data`);
        if (!externalCallMeta.data)
            throw new Error(`Empty extCall meta data`);
        if (!externalCallStorage.data)
            throw new Error(`Empty extCall data`);
        const [submissionAuth] = this.accountsResolver.getSubmissionAuthAddress(submission.address);
        const [submissionWallet] = (0, solana_utils_1.findAssociatedTokenAddress)(submission.address, submission.data.tokenMint);
        const [remaining, bumps] = this.prepareRemainingExtCallAccounts(count, submission.address, submissionAuth, submissionWallet, (_b = (_a = externalCallMeta.data.data.execution) === null || _a === void 0 ? void 0 : _a.offset.toNumber()) !== null && _b !== void 0 ? _b : constants_1.EXT_CALL_STORAGE_OFFSET, externalCallStorage.data);
        const execIx = this.buildExecuteExternalCallInstruction({
            executor,
            fallbackAddress: executor,
            originalClaimer: submission.data.claimer,
            remaining,
            tokenMint: submission.data.tokenMint,
            submission: submission.address,
            submissionAuth,
            submissionWallet,
            externalCallMeta: externalCallMeta.address,
            externalCallStorage: externalCallStorage.address,
        }, submissionId, new anchor_1.BN(submission.data.sourceChainId).toNumber(), count, bumps);
    }
    /*
    private async findOptimalExecuteCount(
        externalCallStorage: AccountInfoWithAddress<Buffer>,
        externalCallMeta: AccountInfoWithAddress<AccountStructByName<DebridgeProgram, "externalCallMeta">>,
    ) {
        let execIx: TransactionInstruction | null = null;
        let vtx: VersionedTransaction | null = null;
        let optimalCountMin = 0;
        let offset = EXT_CALL_STORAGE_OFFSET;
        if (externalCallMeta.data?.data.execution) {
            offset = externalCallMeta.data.data.execution.offset.toNumber();
        }
        let optimalCountMax = extCallDataToInstructions(externalCallData, offset).length + 1;
        let middle: number = 0;
        while (optimalCountMax - optimalCountMin > 1) {
            middle = Math.floor((optimalCountMin + optimalCountMax) / 2);
            logger.debug(`Current min: ${optimalCountMin}, max: ${optimalCountMax}, middle: ${middle}`);
            try {
                execIx = await this.buildExecuteExternalCallInstruction(submissionId, externalCallData, offset, middle, execAccounts);
                vtx = new VersionedTransaction(
                    MessageV0.compile({
                        instructions: [...prefixInstructions, execIx],
                        payerKey: execAccounts.executor,
                        recentBlockhash: constants.FAKE_BLOCKHASH,
                        addressLookupTableAccounts: ALTs,
                    }),
                );
                const simulation = await this._connection.simulateTransaction(vtx, { replaceRecentBlockhash: true });
                logger.debug(simulation.value.err);
                if (simulation.value.err === null) {
                    optimalCountMin = middle;
                } else {
                    optimalCountMax = middle;
                }
            } catch (e) {
                logger.debug(e);
                optimalCountMax = middle;
            }
        }
        let optimal = Math.floor((optimalCountMax + optimalCountMin) / 2);
        optimal = optimal === 0 ? 1 : optimal;
        logger.debug(`Optimal count: ${optimal}`);
        execIx = await this.buildExecuteExternalCallIx(submissionId, externalCallData, offset, optimal, execAccounts);
        vtx = new VersionedTransaction(
            MessageV0.compile({
                instructions: [...prefixInstructions, execIx],
                payerKey: execAccounts.executor,
                recentBlockhash: constants.FAKE_BLOCKHASH,
                addressLookupTableAccounts: ALTs,
            }),
        );

        return [vtx, optimal];
    }
    */
    get feeBeneficiary() {
        if (this.feeBeneficiaryAccount === undefined)
            throw new Error(`State hasnt been fetched yet`);
        return this.feeBeneficiaryAccount;
    }
}
exports.ClientV2 = ClientV2;
//# sourceMappingURL=optimizedClient.js.map