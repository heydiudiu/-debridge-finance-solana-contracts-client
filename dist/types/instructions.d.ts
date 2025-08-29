/// <reference types="node" />
/// <reference types="node" />
/// <reference types="bn.js" />
import { Buffer } from "buffer";
import { Program, BN, IdlTypes, Idl } from "@coral-xyz/anchor";
import { PublicKey, AccountMeta, Transaction } from "@solana/web3.js";
import { MethodsBuilder } from "@coral-xyz/anchor/dist/cjs/program/namespace/methods";
import { DebridgeProgram } from "./idl/debridge_program";
import { DebridgeSettingsProgram } from "./idl/debridge_settings_program";
import { DecodeType, IdlField } from "./interfaces";
type IxByName<I extends Idl, IxName extends I["instructions"][number]["name"]> = I["instructions"][number] & {
    name: IxName;
};
type ArgsData<I extends Idl, IxArgs extends IdlField[], Defined = IdlTypes<I>> = {
    [K in IxArgs[number] as K["name"]]: K extends IdlField ? DecodeType<K["type"], Defined> : unknown;
};
type ArgsDataObject<I extends Idl, IxName extends I["instructions"][number]["name"]> = ArgsData<Idl, IxByName<I, IxName>["args"]>;
type ArgsDataInput<I extends Idl, IxName extends I["instructions"][number]["name"]> = CustomArgsTuple<IxByName<I, IxName>["args"], IdlTypes<I>>;
type CustomArgsTuple<A extends IdlField[], Defined> = {
    [K in keyof A]: [A[K]["name"], A[K] extends IdlField ? DecodeType<A[K]["type"], Defined> : unknown];
} & unknown[];
type MethodBuilder<I extends Idl, IxName extends I["instructions"][number]["name"]> = MethodsBuilder<I, I["instructions"][number] & {
    name: IxName;
}>;
export declare class InstructionBuilder<I extends Idl, IxName extends I["instructions"][number]["name"]> {
    private context;
    private data;
    readonly remainingAccounts?: AccountMeta[] | undefined;
    private builder;
    private creationFees;
    constructor(builderMethod: Program<I>["methods"][IxName], context: Parameters<MethodBuilder<I, IxName>["accountsStrict"]>[0], data: ArgsDataInput<I, IxName>, remainingAccounts?: AccountMeta[] | undefined);
    get accounts(): import("@coral-xyz/anchor").Accounts<(I["instructions"][number] & {
        name: IxName;
    })["accounts"][number]>;
    get args(): ArgsDataObject<I, IxName>;
    instruction(): Promise<import("@solana/web3.js").TransactionInstruction>;
    set accountsCreationFees(lamports: bigint);
    get accountsCreationFees(): bigint;
}
export declare class TransactionBuilder {
    readonly instructions: InstructionBuilder<Idl, string>[];
    constructor(instructions?: InstructionBuilder<Idl, string>[]);
    add(instruction: InstructionBuilder<Idl, string>): void;
    transaction(): Promise<Transaction>;
}
export declare function initNonceMasterInstruction(program: Program<DebridgeProgram>, context: {
    nonceStorage: PublicKey;
    payer: PublicKey;
}): InstructionBuilder<DebridgeProgram, "initNonceMaster">;
export interface ExecExternalCallContextType {
    state: PublicKey;
    externalCallStorage: PublicKey;
    externalCallMeta: PublicKey;
    bridge: PublicKey;
    originalClaimer: PublicKey;
    submission: PublicKey;
    submissionAuth: PublicKey;
    submissionWallet: PublicKey;
    rewardBeneficiaryWallet: PublicKey;
    executor: PublicKey;
    fallbackAddress: PublicKey;
    fallbackAddressWallet: PublicKey;
    tokenMint: PublicKey;
}
export interface ExecExternalCallParamsType {
    submissionId: Buffer;
    count: number;
    subsitutionBumps: Buffer;
}
export declare function executeExternalCallInstruction(program: Program<DebridgeProgram>, context: ExecExternalCallContextType, params: ExecExternalCallParamsType, remainingAccounts?: AccountMeta[]): InstructionBuilder<DebridgeProgram, "executeExternalCall">;
export interface InitSendBridgeContextType {
    bridgeData: PublicKey;
    bridgeIdMap: PublicKey;
    state: PublicKey;
    stakingWallet: PublicKey;
    tokenMint: PublicKey;
    tokenMetadata: PublicKey;
    mintAuthority: PublicKey;
    payer: PublicKey;
}
export declare function initializeSendBridgeInstruction(settingsProgram: Program<DebridgeSettingsProgram>, context: InitSendBridgeContextType): InstructionBuilder<DebridgeSettingsProgram, "initializeSendBridge">;
export interface InitializeMintBridgeContextType {
    bridgeData: PublicKey;
    state: PublicKey;
    feeBeneficiary: PublicKey;
    payer: PublicKey;
    tokenMint: PublicKey;
    mintAuthority: PublicKey;
    confirmationStorage: PublicKey;
    confirmationStorageCreator: PublicKey;
    tokenMetadata: PublicKey;
    tokenMetadataMaster: PublicKey;
}
export interface InitializeMintBridgeParamsType {
    chainId: Buffer;
    nativeTokenAddress: Buffer;
    tokenName: string;
    tokenSymbol: string;
    decimals: number;
}
export declare function initializeMintBridgeInstruction(settingsProgram: Program<DebridgeSettingsProgram>, context: InitializeMintBridgeContextType, params: InitializeMintBridgeParamsType): InstructionBuilder<DebridgeSettingsProgram, "initializeMintBridge">;
export interface UpdateFeeBridgeInfoParamsType {
    targetChainId: Buffer;
    chainFee: BN;
}
export interface UpdateFeeBridgeInfoContextType {
    bridgeData: PublicKey;
    tokenMint: PublicKey;
    state: PublicKey;
    bridgeFee: PublicKey;
    payer: PublicKey;
}
export declare function updateFeeBridgeInfoInstruction(settingsProgram: Program<DebridgeSettingsProgram>, context: UpdateFeeBridgeInfoContextType, params: UpdateFeeBridgeInfoParamsType): InstructionBuilder<DebridgeSettingsProgram, "updateFeeBridgeInfo">;
export interface InitChainSupportInfoParamsType {
    targetChainId: Buffer;
    isSupported: boolean;
    fixedFee?: BN;
    transferFee?: BN;
    chainAddressLen: number;
}
export interface InitChainSupportInfoContextType {
    state: PublicKey;
    protocolAuthority: PublicKey;
    payer: PublicKey;
    chainSupportInfo: PublicKey;
}
export declare function initChainSupportInfoInstruction(settingsProgram: Program<DebridgeSettingsProgram>, context: InitChainSupportInfoContextType, params: InitChainSupportInfoParamsType): import("@solana/web3.js").TransactionInstruction;
export interface SendParamsType {
    chainIdBuffer: Buffer;
    amount: BN;
    receiver: Buffer;
    useAssetFee: boolean;
    referralCode?: number;
    submissionParams?: {
        externalCallShortcut: Buffer;
        reservedFlag: Buffer;
        executionFee: BN;
        fallbackAddress: Buffer;
    };
}
export interface SendContextType {
    bridge: PublicKey;
    tokenMint: PublicKey;
    stakingWallet: PublicKey;
    mintAuthority: PublicKey;
    chainSupportInfo: PublicKey;
    bridgeFee: PublicKey;
    discount: PublicKey;
    sendFromWallet: PublicKey;
    nonceStorage: PublicKey;
    state: PublicKey;
    feeBeneficiary: PublicKey;
    sendFrom: PublicKey;
    externalCallStorage: PublicKey;
    externalCallMeta: PublicKey;
    settingsProgram: PublicKey;
}
export declare function sendInstruction(program: Program<DebridgeProgram>, context: SendContextType, params: SendParamsType): InstructionBuilder<DebridgeProgram, "send">;
export interface ClaimContextType {
    bridgeData: PublicKey;
    submissionAddr: PublicKey;
    tokenMint: PublicKey;
    mintAuthority: PublicKey;
    stakingWallet: PublicKey;
    chainSupportInfo: PublicKey;
    claimToWallet: PublicKey;
    fallbackAddress: PublicKey;
    receiver: PublicKey;
    confirmationStorage: PublicKey;
    confirmationStorageCreator: PublicKey;
    executor: PublicKey;
    payerWallet: PublicKey;
    externalCallStorage: PublicKey;
    externalCallMeta: PublicKey;
    claimMarker: PublicKey;
    state: PublicKey;
    feeBeneficiary: PublicKey;
    settingsProgram: PublicKey;
}
export interface ClaimSubmissionParamsInputType {
    executionFee: Buffer;
    reservedFlag: Buffer;
    nativeSender: Buffer;
    externalCallShortcut: Buffer;
}
export interface ClaimParamsType {
    sourceChainId: Buffer;
    amount: Buffer;
    nonce: Buffer;
    submissionParams?: ClaimSubmissionParamsInputType;
}
export declare function claimInstrution(program: Program<DebridgeProgram>, context: ClaimContextType, params: ClaimParamsType): InstructionBuilder<DebridgeProgram, "claim">;
export interface DataChunk {
    data: Buffer;
    offset: number;
}
export interface ExtCallStorageContextType {
    externalCallStorage: PublicKey;
    externalCallMeta: PublicKey;
    claimer: PublicKey;
}
export interface InitExtCallStorageParamsType {
    externalCallLen: number;
    sourceChainId: Buffer;
    storageKey: Buffer;
    rawInstructions: Buffer;
}
export interface InitOrUpdateExtCallStorageParamsType extends InitExtCallStorageParamsType {
    externalInstructionsOffset: number;
}
export declare function initExternalCallStorageInstruction(program: Program<DebridgeProgram>, context: ExtCallStorageContextType, params: InitExtCallStorageParamsType): InstructionBuilder<DebridgeProgram, "initExternalCallStorage">;
export declare function initOrUpdateExternalCallStorage(program: Program<DebridgeProgram>, context: ExtCallStorageContextType, params: InitOrUpdateExtCallStorageParamsType): InstructionBuilder<DebridgeProgram, "initOrUpdateExternalCallStorage">;
export interface ExtendExtCallStorageParamsType {
    sourceChainId: Buffer;
    submissionId: Buffer;
    rawInstructions: DataChunk;
}
export declare function updateExternalCallStorageInstruction(program: Program<DebridgeProgram>, context: ExtCallStorageContextType, params: ExtendExtCallStorageParamsType): InstructionBuilder<DebridgeProgram, "updateExternalCallStorage">;
export interface StoreSignaturesContextType {
    state: PublicKey;
    confirmationStorage: PublicKey;
    payer: PublicKey;
}
export interface StoreSignaturesParamsType {
    message: Buffer;
}
export declare function storeConfirmationsInstruction(settingsProgram: Program<DebridgeSettingsProgram>, context: StoreSignaturesContextType, params: StoreSignaturesParamsType): InstructionBuilder<DebridgeSettingsProgram, "storeConfirmations">;
export interface ResetFreezeAuthorityBatchRemainingAccountsContext {
    tokenMint: PublicKey;
    bridgeData: PublicKey;
}
export declare function resetFreezeAuthorityBatch(settingsProgram: Program<DebridgeSettingsProgram>, remainingAccounts: ResetFreezeAuthorityBatchRemainingAccountsContext): InstructionBuilder<DebridgeSettingsProgram, "resetFreezeAuthorityBatch">;
interface FallbackParamsType {
    submissionId: Buffer;
    submissionAuthBump: number;
}
interface FallbackContextType {
    submission: PublicKey;
    submissionAuth: PublicKey;
    originalClaimer: PublicKey;
    externalCallStorage: PublicKey;
    externalCallMeta: PublicKey;
    fallbackAddressWallet: PublicKey;
    tokenMint: PublicKey;
}
interface SendToFallbackContextType extends FallbackContextType {
    submissionAuthLostWallet: PublicKey;
}
export declare function buildCloseSubmissionAuthWalletInstruction(program: Program<DebridgeProgram>, context: SendToFallbackContextType, params: FallbackParamsType): InstructionBuilder<DebridgeProgram, "closeSubmissionAuthWallet">;
interface MakeFallbackForExternalCallContextType extends FallbackContextType {
    state: PublicKey;
    bridge: PublicKey;
    submissionWallet: PublicKey;
    rewardBeneficiaryWallet: PublicKey;
    executor: PublicKey;
    fallbackAddress: PublicKey;
}
export declare function buildMakeFallbackForExternalCallInstruction(program: Program<DebridgeProgram>, context: MakeFallbackForExternalCallContextType, params: FallbackParamsType): InstructionBuilder<DebridgeProgram, "makeFallbackForExternalCall">;
type CloseExtCallStorageType = {
    chainId: Buffer;
    submissionId: Buffer;
};
type CloseExtCallStorageContextType = {
    claimer: PublicKey;
    externalCallMeta: PublicKey;
    externalCallStorage: PublicKey;
};
export declare function buildCloseExternalCallStorageInstruction(program: Program<DebridgeProgram>, context: CloseExtCallStorageContextType, params: CloseExtCallStorageType): InstructionBuilder<DebridgeProgram, "closeExternalCallStorage">;
export {};
//# sourceMappingURL=instructions.d.ts.map