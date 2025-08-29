/// <reference types="node" />
/// <reference types="node" />
/// <reference types="bn.js" />
import { Buffer } from "buffer";
import { BN, Program, AnchorProvider, Wallet, IdlEvents, Idl } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction, Connection, AccountMeta, Commitment, AddressLookupTableAccount } from "@solana/web3.js";
import * as wasm from "@debridge-finance/debridge-external-call";
import { DeBridgeResolver, helpers } from "@debridge-finance/solana-utils";
import { DataChunk } from "./instructions";
import { BridgeFeeInfoType, ConfirmationStorageType, StateType, ExternalCallMetaType, ChainSupportInfoType, SupportedChainInfoType, BridgeType, ActiveDiscountType, SubmissionInfoType, Concrete, AmountType, AutoParamsType, ChainIdType, FeeInfoType, SubmissionIdParams, SolanaPubkey, HexString, WalletsCheckConfig, SubmissionStatusType, ExtCallTransactions, ActionPriorityFee, PriorityFeeConfig, NonCompiledTransaction, CastedFromWasmInstruction } from "./interfaces";
import { DebridgeProgram } from "./idl/debridge_program";
import { DebridgeSettingsProgram } from "./idl/debridge_settings_program";
import * as Submission from "./submission";
import { buildDebridgeDecoder } from "./decoder";
export type SenderFn = (...txs: NonCompiledTransaction[]) => Promise<string[]>;
export declare function getRemainingAccountsAndBumps(data: Buffer, offset: number, count: number, submission: PublicKey, submissionAuth: PublicKey, submissionWallet: PublicKey): readonly [AccountMeta[], any[]];
export declare function extCallDataToInstructions(data: Uint8Array, offset?: number): CastedFromWasmInstruction[];
export declare function initWasm(input: Buffer | string): Promise<wasm.InitOutput>;
export declare class DeBridgeSolanaClient {
    private _program;
    private _settingsProgram;
    statePublicKey: PublicKey;
    accountsResolver: ReturnType<typeof DeBridgeResolver>["methods"];
    decoder: ReturnType<typeof buildDebridgeDecoder>;
    chainId: number;
    private _wallet;
    private _provider;
    private feeBeneficiarAccount;
    private debug;
    private associatedTokenProgramId;
    private priorityFeeConfig;
    constructor(connection: Connection, chainId: number, wallet?: helpers.Wallet | Wallet, params?: {
        programId?: SolanaPubkey;
        settingsProgramId?: SolanaPubkey;
        associatedTokenProgramId?: SolanaPubkey;
        debug?: boolean;
        priorityFeeConfig?: PriorityFeeConfig;
    });
    /**
     * Async constructor for this class
     */
    init(): Promise<void>;
    getSubmissionState(submissionId: Buffer | string, calldata?: {
        executor: PublicKey;
        sourceChain: number;
    }, subscriptionCommitment?: Commitment): Promise<Submission.SubmissionState<boolean>>;
    /**
     * Checks if instance is initialized
     * @returns true if this.init() was called before and client is ready for work
     */
    isInitialized(): boolean;
    private get _connection();
    updateConnection(newConnection: Connection): void;
    updateWallet(newWallet: helpers.Wallet): void;
    updateWalletAndConnection(newConnection: Connection, newWallet: helpers.Wallet): void;
    private getAccountInfo;
    private checkIfAccountExists;
    /**
     * Get number of confirmations in provided storage
     * @param confirmationsStorage address of confirmation storage
     * @returns number of confirmations in storage
     */
    getConfirmationsCount(confirmationsStorage: SolanaPubkey): Promise<{
        haveConfirmations: number;
        requiredConfirmations: number;
    }>;
    /**
     * Waits until confirmation storage is filed
     * @param confStorage address of confirmations storage
     * @param retries number of retries before code will fail
     * @returns true when confirmation storage is filled properly
     */
    waitForConfirmations(confStorage: SolanaPubkey, retries?: number, timeout?: number): Promise<boolean>;
    /**
     * Checks if confirmations storage contains enough signatures
     * @param storage confirmations storage account
     * @returns true if stored confirmations count is enough for claim
     */
    isEnoughConfirmationsStored(storage: SolanaPubkey): Promise<boolean>;
    buildInitNonceMasterTranscation(payer: SolanaPubkey): Promise<NonCompiledTransaction>;
    /**
     * Checks if bridge initialized
     * @param debridgeId hex-encoded string
     * @returns true if bridge initialized
     */
    isMintBridgeInitialized(debridgeId: HexString): Promise<boolean>;
    /**
     * Checks if bridge fee info initialized
     * @param debridgeId
     * @param chainIdFrom
     * @returns true if bridge fee info initialized
     */
    isBridgeFeeInfoInitialized(debridgeId: HexString, chainIdFrom: ChainIdType): Promise<boolean>;
    /**
     * Extracts deBridge events from the transaction logs
     * @param txHash trnasaction hash
     * @returns deBridge and deBridgeSettings events
     */
    getEventsFromTransaction(txHash: string): Promise<import("@coral-xyz/anchor").Event<import("@coral-xyz/anchor/dist/cjs/idl").IdlEvent, Record<string, string>>[]>;
    /**
     * Invokes the given callback every time the Transferred event is emitted.
     *
     * @param handler The function to invoke whenever the Transferred event is emitted from
     *                program logs
     * @returns subscription id
     */
    onTransferred(handler: (event: IdlEvents<DebridgeProgram>["Transferred"], slot: number) => void): number;
    /**
     * Invokes the given callback every time the Bridged event is emitted.
     *
     * @param handler The function to invoke whenever the Bridged event is emitted from
     *                program logs
     * @returns subscription id
     */
    onBridged(handler: (event: IdlEvents<DebridgeProgram>["Bridged"], slot: number) => void): number;
    /**
     * Removes subscription on transferred or bridged events
     *
     * @param subscriptionId id of subscription returned from {@link onBridged} or {@link onTransferred}
     */
    removeOnEvent(subscriptionId: number): Promise<void>;
    /**
     * Returns balance of the bridge associated with the mint or throws error if no such bridge were found
     * @param tokenMint address of mint for some token
     * @returns balance of the bridge or throws error if no bridge were found
     */
    getBridgeBalance(tokenMint: SolanaPubkey): Promise<BN>;
    /**
     * Gets fix fee and transfer fee from chain support info (if exists, else global values)
     * @param chainSupportInfo
     * @returns fixed fee, transfer fee bps
     */
    getFeesOrGlobal(chainSupportInfo: PublicKey | ChainSupportInfoType): Promise<Concrete<Omit<SupportedChainInfoType["supported"], "chainAddressLen">>>;
    private static calculateFeeInternal;
    private getBridgeFee;
    /**
     * Gets submission status from the chain
     * @param submissionId
     * @returns submission status with context
     */
    getSubmissionStatus(submissionId: HexString | Buffer): Promise<SubmissionStatusType | null>;
    private getWrapperDecimals;
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
    calculateExecutionFee(senderAddressLength: number, bridgeId: HexString, solPrice: number, tokenPrice: number, tokenDecimals: number, walletExists: boolean, executionFeeMultiplier: number, isRequiredTempRentCost: boolean, extCall?: Uint8Array): Promise<{
        claimCost: bigint;
        executionCost: bigint;
        rewards: bigint[];
        externalCallWithRewards?: Uint8Array;
        total: bigint;
    }>;
    /**
     * Calculates fee for specified transfer params
     * @param tokenMint mint of token to transfer
     * @param chainId id of the destination chain we want to send tokens
     * @param discountAccount account for which we'll try to find discount
     * @param useAssetFee asset or native execution fee
     * @param amount amount of transferrable assets
     * @returns information about fee
     */
    calculateFee(tokenMint: SolanaPubkey, chainId: ChainIdType, discountAccount: SolanaPubkey | null, useAssetFee: boolean, amount: AmountType): Promise<FeeInfoType>;
    /**
     * Returns bridge info from solana by debridgeId
     * @param deBridgeId bridge id in deBridge network, {@link hashDebridgeId}
     * @returns null if bridge not exists or bridge token address and bridge info from solana blockchain
     */
    getBridgeByDeBridgeId(deBridgeId: HexString | Buffer): Promise<{
        bridge: BridgeType;
        tokenMint: PublicKey;
    } | null>;
    private getRent;
    /**
     * Returns parsed state of smart-contract from blockchain
     * @returns parsed bridge state
     */
    getStateSafe(): Promise<StateType>;
    /**
     * Returns parsed confirmation storage, may be used to get current confirmations count
     * @param confirmationStorage account of ConfirmationStorage for specific deployInfo/submission
     * @returns parsed confirmation storage
     */
    getConfirmationStorageSafe(confirmationStorage: SolanaPubkey): Promise<ConfirmationStorageType>;
    /**
     * Returns parsed chainSupportInfo from blockchain or raises error
     * @param chainSupportInfo account of chainSupportInfo
     * @param checkIfSupported check if chainSupportInfo is supported
     * @returns parsed chainSupportInfo
     */
    getChainSupportInfoSafe(chainSupportInfo: SolanaPubkey, checkIfSupported?: boolean): Promise<ChainSupportInfoType>;
    private static getBridgeInfoFromBridgeType;
    /**
     * Returns parsed bridgeInfo from blockchain or raises error
     * @param bridge account of bridgeInfo
     * @returns parsed bridgeInfo
     */
    getBridgeInfoSafe(bridge: SolanaPubkey): Promise<BridgeType>;
    /**
     * Returns parsed bridgeFee from blockchain or raises error
     * @param bridgeFee account of bridgeFee
     * @returns parsed bridgeFee
     */
    getBridgeFeeSafe(bridgeFee: SolanaPubkey): Promise<BridgeFeeInfoType>;
    /**
     * Returns parsed activeDiscountInfo from blockchain or raises error
     * @param discount account of discount info
     * @param returnNullIfNoDiscount dont raise error if discount not found/malformed/not active, just return null
     * @returns parsed activeDiscountInfo
     */
    getDiscountInfoSafe(discount: SolanaPubkey, returnNullIfNoDiscount?: boolean): Promise<ActiveDiscountType | undefined>;
    /**
     * Fetches submission info from blockchain
     * @param submission account of submissioon
     * @returns parsed submission info
     */
    getSubmissionInfoSafe(submission: SolanaPubkey, commitment?: Commitment): Promise<SubmissionInfoType>;
    /**
     * Fetches extCallMeta from blockchain
     * @param externalCallMeta account of ext call meta
     * @returns parsed external call metadata
     */
    getExternalCallMetaSafe(externalCallMeta: SolanaPubkey, commitment?: Commitment): Promise<ExternalCallMetaType>;
    /**
     * Builds fallback transaction
     * @param submissionId
     * @param executor who pays for the actions
     * @returns list of transactions with fallback ix and close unused wallets ixs
     */
    buildFallbackTransactions(submissionId: HexString | Buffer, executor: SolanaPubkey): Promise<NonCompiledTransaction[]>;
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
    buildInitializeMintBridgeTransaction(payer: SolanaPubkey, chainId: ChainIdType, tokenAddress: string, tokenName: string, tokenSymbol: string, decimals: number): Promise<{
        transaction: NonCompiledTransaction;
        debridgeId: string;
    }>;
    /**
     * Builds transaction for staking wallet creation (if not exists) and send bridge initializaion
     * @param tokenMint token mint account to init bridge
     * @param payer who pays for transaction
     * @returns transaction for [staking wallet creation] and send bridge initialization
     */
    buildInitializeSendBridgeTransaction(tokenMint: SolanaPubkey, payer: SolanaPubkey): Promise<NonCompiledTransaction>;
    /**
     * Builds transaction which updates bridge fee info
     * @param chainId
     * @param tokenMint
     * @param chainFee new fee value
     * @param payer
     * @returns built transaction
     */
    buildUpdateFeeBridgeInfoTransaction(chainId: ChainIdType, tokenMint: SolanaPubkey, chainFee: AmountType, payer: SolanaPubkey): Promise<NonCompiledTransaction>;
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
    buildSendContext(sender: SolanaPubkey, sendFromWallet: PublicKey | null, tokenMint: SolanaPubkey, receiver: HexString, chainIdTo: number | Buffer, useAssetFee: boolean, fallbackAddress: HexString, flags?: Buffer | number, data?: Buffer | HexString): Promise<{
        asFlat: {
            bridge: PublicKey;
            tokenMint: PublicKey;
            stakingWallet: PublicKey;
            mintAuthority: PublicKey;
            chainSupportInfo: PublicKey;
            splTokenProgram: PublicKey;
            settingsProgram: PublicKey;
            state: PublicKey;
            feeBeneficiary: PublicKey;
            nonceStorage: PublicKey;
            sendFromWallet: PublicKey;
            sendFrom: PublicKey;
            bridgeFee: PublicKey;
            discount: PublicKey;
            systemProgram: PublicKey;
            externalCallStorage: PublicKey;
            externalCallMeta: PublicKey;
        };
        asAccountMeta: AccountMeta[];
        asIdl: {
            nonceStorage: PublicKey;
            systemProgram: PublicKey;
            bridgeCtx: {
                bridge: PublicKey;
                tokenMint: PublicKey;
                stakingWallet: PublicKey;
                mintAuthority: PublicKey;
                chainSupportInfo: PublicKey;
                settingsProgram: PublicKey;
                splTokenProgram: PublicKey;
            };
            stateCtx: {
                state: PublicKey;
                feeBeneficiary: PublicKey;
            };
            sendFromWallet: PublicKey;
            externalCallStorage: PublicKey;
            externalCallMeta: PublicKey;
            sendFrom: PublicKey;
            discount: PublicKey;
            bridgeFee: PublicKey;
        };
    }>;
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
    buildSendInstruction(sender: SolanaPubkey, sendFromWallet: PublicKey | null, payableAmount: AmountType, tokenMint: SolanaPubkey, receiver: HexString, chainIdTo: number | Buffer, useAssetFee: boolean, referralCode: number, fallbackAddress: HexString, flags?: Buffer | number, executionFee?: AmountType, data?: Buffer | HexString, checkSenderBalance?: boolean, sendFromWalletMayNotExist?: boolean): Promise<{
        extCallStorage: ExtCallTransactions;
        transaction: NonCompiledTransaction;
    }>;
    /**
     * Builds list of transactions for confirmation of bridge init/claim
     * @param message message that was signed
     * @param payer who pays for confirmation storage creation and TX
     * @param confirmationStorage account for signature storage
     * @param signatures array of message validator's signatures
     * @returns transactions for confirmation of some action
     */
    buildStoreConfirmationsTransaction(message: HexString, payer: SolanaPubkey, confirmationStorage: SolanaPubkey, signatures: Buffer[], priorityFee?: ActionPriorityFee): Promise<NonCompiledTransaction[]>;
    /**
     * Hashes submission
     * @param params {@link SubmissionIdParams}
     * @returns submissionId and sourceChainId
     */
    hashSubmissionId(params: SubmissionIdParams): Promise<[Buffer, Buffer]>;
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
    buildExternalCallStorageInstruction(submissionId: HexString | Buffer, sourceChainId: ChainIdType, executor: SolanaPubkey, chunk: DataChunk, totalLength: number, calculatedAccounts?: {
        extCallStorage?: PublicKey;
        extCallMeta?: PublicKey;
    }, priorityFee?: ActionPriorityFee): Promise<NonCompiledTransaction>;
    /**
     * Compares `data` arg and on-chain value
     * @param storage external call storage account
     * @param data data to compare
     * @returns true if on-chain data equals to `data` param
     */
    isExtCallStorageCorrect(storage: SolanaPubkey, data: Buffer): Promise<boolean>;
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
    buildExecuteExternalCallTransaction(submissionId: HexString | Buffer, executor: SolanaPubkey, rewardBeneficiaryWallet: SolanaPubkey, count: number, calculatedAccounts: {
        submissionWallet?: PublicKey;
        fallbackAddress?: PublicKey;
        fallbackAddressWallet?: PublicKey;
        tokenMint?: PublicKey;
        extCallStorage?: PublicKey;
        extCallMeta?: PublicKey;
        submission?: PublicKey;
        submissionAuth?: PublicKey;
        bridge?: PublicKey;
        originalClaimer?: PublicKey;
    }, sourceChainId?: ChainIdType): Promise<NonCompiledTransaction>;
    private initializeExtCallWalletsIfNeeded;
    buildOptimalExecuteExternalCallTransactionV2(submissionState: Submission.SubmissionState<true>, options?: {
        priorityFee?: ActionPriorityFee;
    }): Promise<[NonCompiledTransaction, number]>;
    buildExecuteExternalCallTransactions(submissionState: Submission.SubmissionState<true>, priorityFee?: ActionPriorityFee): Promise<NonCompiledTransaction[]>;
    /**
     * Builds execute external call transaction with max available number of instructions to execute
     * @param submissionId
     * @param executor
     * @param rewardBeneficiaryWallet wallet which will receive reward for execution = ATA(executor, tokenMint)
     * @param calculatedAccounts precalculated accounts
     * @param sourceChainId
     * @returns execute external call transaction, number of instructions to execute
     */
    buildOptimalExecuteExternalCallTransaction(submissionId: HexString | Buffer, executor: SolanaPubkey, rewardBeneficiaryWallet: SolanaPubkey, calculatedAccounts?: {
        submissionWallet?: PublicKey;
        fallbackAddress?: PublicKey;
        fallbackAddressWallet?: PublicKey;
        tokenMint?: PublicKey;
        extCallStorage?: PublicKey;
        extCallMeta?: PublicKey;
        submission?: PublicKey;
        submissionAuth?: PublicKey;
        bridge?: PublicKey;
        originalClaimer?: PublicKey;
    }, sourceChainId?: ChainIdType, prefixInstructions?: TransactionInstruction[], ALTs?: AddressLookupTableAccount[], calldata?: Buffer, metaData?: ExternalCallMetaType): Promise<[NonCompiledTransaction, number]>;
    private findOptimalExecuteCount;
    private getAllExecuteExternalCallTxs;
    private buildExecuteExternalCallIx;
    executeExternalCallV2(submissionState: Submission.SubmissionState, sendFn: SenderFn, options?: {
        priorityFee?: ActionPriorityFee;
        stateChangeTimeout?: number;
    }): Promise<string[] | undefined>;
    /**
     * Executes externall call until done or error
     * @param submissionId
     * @param extCallStorageAccount
     * @param extCallMetaAccount
     * @param claimTokenMint token to claim
     * @returns transaction ids of ExecuteExternalCall
     */
    executeExternalCall(submissionId: string | Buffer, extCallStorageAccount: SolanaPubkey, extCallMetaAccount: SolanaPubkey, claimTokenMint: SolanaPubkey, sender: SenderFn, fallbackAddress?: SolanaPubkey, options?: {
        metadataPollingInterval?: number;
    }): Promise<string[]>;
    private static splitDataForExternalCall;
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
    prepareExtCallTransactions(submissionId: HexString | Buffer, sourceChainId: ChainIdType, executor: SolanaPubkey, data?: Buffer | HexString, calculatedAccounts?: {
        meta?: PublicKey;
        storage?: PublicKey;
    }): Promise<ExtCallTransactions>;
    storeExternallCall(extCallTransactions: ExtCallTransactions, sender: SenderFn, data: Buffer | string, overwriteOnError?: boolean): Promise<string[]>;
    storeExternalCallV2(extCallTransactions: ExtCallTransactions, data: Buffer, submissionState: Submission.SubmissionState, sender: SenderFn, options?: {
        overwriteOnError?: boolean;
        initTimeout?: number;
        storeTimeout?: number;
    }): Promise<string[]>;
    buildCloseExternalCallStorageIx(claimer: SolanaPubkey, submissionId: Buffer | string, sourceChainId: ChainIdType): Promise<NonCompiledTransaction>;
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
    buildClaimTransaction(executor: SolanaPubkey, amount: AmountType, receiverInfo: {
        receiver: SolanaPubkey | HexString;
        tokenMint: SolanaPubkey;
        claimToWallet?: SolanaPubkey;
    }, senderInfo: {
        chainFrom: ChainIdType;
        sender: string;
    }, submissionInfo: {
        nonce: number;
        submissionId: HexString | Buffer;
    }, autoParams?: Omit<AutoParamsType, "nativeSender"> & {
        nativeSender?: string;
    }, createMissingWallets?: boolean | WalletsCheckConfig, confirmationStorageCreator?: PublicKey, priorityFee?: ActionPriorityFee): Promise<{
        transaction: NonCompiledTransaction;
        extCallStorage: ExtCallTransactions;
    }>;
    /**
     * Checks if we can claim amount from bridge
     * @param tokenMint pubkey or base58 encoded pubkey of token main
     * @param isMint
     * @param amount amount to check
     * @returns true if amout is less than bridge balance or bridge is mint
     */
    isBridgeBalanceOk(tokenMint: SolanaPubkey, isMint: boolean, amount: AmountType): Promise<boolean>;
    /**
     * Checks if submission is used
     * @param submissionId debridge submission id, {@link hashSubmissionIdRaw}
     * @returns true if non-empty associated account for submission exists
     */
    isSubmissionUsed(submissionId: HexString | Buffer): Promise<boolean>;
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
    checkClaimParams(executor: SolanaPubkey, amount: AmountType, receiverInfo: {
        receiver: SolanaPubkey | HexString;
        tokenMint: SolanaPubkey;
        claimToWallet?: SolanaPubkey;
    }, senderInfo: {
        chainFrom: ChainIdType;
        sender: string;
    }, submissionInfo: {
        nonce: number;
    }, autoParams?: AutoParamsType, createMissingWallets?: boolean): Promise<[Buffer, PublicKey]>;
    get feeBeneficiary(): PublicKey;
    get wallet(): Pick<helpers.Wallet, "publicKey" | "signAllTransactions" | "signTransaction"> | null;
    get provider(): AnchorProvider;
    /**
     * get deBridge anchor.Program
     * @returns deBridge anchor.Program instance
     */
    get program(): Program<DebridgeProgram>;
    /**
     * get deBridgeSettings anchor.Program
     * @returns deBridgeSettings anchor.Program instance
     */
    get settingsProgram(): Program<DebridgeSettingsProgram>;
    /**
     * Returns list of all possible custom errors
     * @returns list of all errors for deBridge and deBridgeSettings
     */
    get idlErrors(): NonNullable<Program["idl"]["errors"]>;
    static setEventListeners<I extends Idl, N extends NonNullable<I["events"]>[number]["name"]>(program: Program<I>, mainEvent: N, resolve: (message: IdlEvents<I>[N]) => void, reject: (error: Error) => void, resolveCondition?: (e: IdlEvents<I>[N]) => boolean): {
        cleanResolve: (message: IdlEvents<I>[N]) => Promise<void>;
        cleanReject: (error: Error) => Promise<void>;
    };
}
//# sourceMappingURL=deBridgeContracts.d.ts.map