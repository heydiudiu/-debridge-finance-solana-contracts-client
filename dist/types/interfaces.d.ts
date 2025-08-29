/// <reference types="bn.js" />
/// <reference types="node" />
/// <reference types="node" />
import { Buffer } from "buffer";
import { Address, BN, Idl, Program } from "@coral-xyz/anchor";
import { AddressLookupTableAccount, PublicKey, TransactionInstruction } from "@solana/web3.js";
export type CastedFromWasmInstruction = {
    expenses: bigint;
    reward: bigint;
    instruction: unknown;
    start: number;
    end: number;
};
export type AccountStructByName<I extends Idl, Name extends keyof Program<I>["account"]> = Awaited<ReturnType<Program<I>["account"][Name]["fetchNullable"]>>;
export type NonCompiledTransaction = {
    instructions: TransactionInstruction[];
    ALTs?: AddressLookupTableAccount[];
    payer: PublicKey;
};
export type ExtCallTransactions = {
    store: InitOrUpdateExtCallTransactions;
};
export type InitOrUpdateExtCallTransactions = NonCompiledTransaction[];
export type ActionPriorityFee = {
    limit: number;
    microLamports?: number;
};
export type PriorityFeeConfig = {
    send?: ActionPriorityFee;
    claim?: ActionPriorityFee;
    /**
     * Limit should be around 30_000
     */
    initExternalCall?: ActionPriorityFee;
    /**
     * Limit should be around 15_000
     */
    storeExternalCall?: ActionPriorityFee;
    storeConfirmations?: ActionPriorityFee;
};
type TypeMap = {
    publicKey: PublicKey;
    bool: boolean;
    string: string;
    bytes: Uint8Array;
} & {
    [K in "u8" | "i8" | "u16" | "i16" | "u32" | "i32" | "f32" | "f64"]: number;
} & {
    [K in "u64" | "i64" | "u128" | "i128"]: BN;
};
export type IdlTypeDefStruct = Array<IdlField>;
export type IdlTypeDef = {
    name: string;
    docs?: string[];
    type: IdlTypeDefTy;
};
export type IdlTypeDefTyStruct = {
    kind: "struct";
    fields: IdlTypeDefStruct;
};
export type IdlEnumVariant = {
    name: string;
    fields?: IdlEnumFields;
};
export type IdlEnumFields = IdlEnumFieldsNamed | IdlEnumFieldsTuple;
export type IdlEnumFieldsNamed = IdlField[];
export type IdlEnumFieldsTuple = IdlType[];
export type IdlTypeDefTyEnum = {
    kind: "enum";
    variants: IdlEnumVariant[];
};
export type IdlTypeDefTy = IdlTypeDefTyEnum | IdlTypeDefTyStruct;
export type DecodeType<T extends IdlType, Defined> = T extends keyof TypeMap ? TypeMap[T] : T extends {
    defined: keyof Defined;
} ? Defined[T["defined"]] : T extends {
    option: {
        defined: keyof Defined;
    };
} ? Defined[T["option"]["defined"]] | null : T extends {
    option: keyof TypeMap;
} ? TypeMap[T["option"]] | null : T extends {
    coption: {
        defined: keyof Defined;
    };
} ? Defined[T["coption"]["defined"]] | null : T extends {
    coption: keyof TypeMap;
} ? TypeMap[T["coption"]] | null : T extends {
    vec: keyof TypeMap;
} ? TypeMap[T["vec"]][] : T extends {
    vec: {
        defined: keyof Defined;
    };
} ? Defined[T["vec"]["defined"]][] : T extends {
    array: [defined: keyof TypeMap, size: number];
} ? TypeMap[T["array"][0]][] : unknown;
/**
 * decode single enum.field
 */
declare type DecodeEnumField<F, Defined> = F extends IdlType ? DecodeType<F, Defined> : never;
/**
 * decode enum variant: named or tuple
 */
declare type DecodeEnumFields<F extends IdlEnumFields, Defined> = F extends IdlEnumFieldsNamed ? {
    [F2 in F[number] as F2["name"]]: DecodeEnumField<F2["type"], Defined>;
} : F extends IdlEnumFieldsTuple ? {
    [F3 in keyof F as Exclude<F3, keyof unknown[]>]: DecodeEnumField<F[F3], Defined>;
} : Record<string, never>;
/**
 * Since TypeScript do not provide OneOf helper we can
 * simply mark enum variants with +?
 */
declare type DecodeEnum<K extends IdlTypeDefTyEnum, Defined> = {
    [X in K["variants"][number] as Uncapitalize<X["name"]>]+?: DecodeEnumFields<NonNullable<X["fields"]>, Defined>;
};
type DecodeStruct<I extends IdlTypeDefTyStruct, Defined> = {
    [F in I["fields"][number] as F["name"]]: DecodeType<F["type"], Defined>;
};
export type IdlField = Idl["instructions"][number]["args"][number];
type IdlType = IdlField["type"];
export type TypeDef<I extends IdlTypeDef, Defined> = I["type"] extends IdlTypeDefTyEnum ? DecodeEnum<I["type"], Defined> : I["type"] extends IdlTypeDefTyStruct ? DecodeStruct<I["type"], Defined> : never;
type DeepAddressToPubkey<T> = {
    [P in keyof T]: T[P] extends Address ? PublicKey : DeepAddressToPubkey<T[P]>;
};
export type IdlAccountsPubkeys<T> = DeepAddressToPubkey<T>;
export declare enum AccountType {
    System = 0,
    Token = 1,
    CorrectATA = 2,
    Unknown = 3,
    NotExists = 4
}
export declare enum WalletCheckEnum {
    AllowUninitialized = 0,
    Create = 1,
    ThrowError = 2
}
interface WalletCheck {
    wallet?: SolanaPubkey;
    check: WalletCheckEnum;
}
export interface WalletsCheckConfig {
    payerWallet: WalletCheck;
    receiverWallet: WalletCheck;
    stakingWallet: WalletCheck;
}
export interface AnchorErrorType {
    logs: string[];
}
export type Concrete<Type> = {
    [Property in keyof Type]-?: Type[Property];
};
export type DeepConcrete<Type> = {
    [Property in keyof Type]-?: Type[Property] extends object ? DeepConcrete<Type[Property]> : Type[Property];
};
export type Optional<Type> = {
    [Property in keyof Type]+?: Type[Property];
};
export declare enum FixedFeeType {
    ASSET = 0,
    NATIVE = 1
}
export interface RentType {
    lamportsPerByteYear: number;
    exemptionThreshold: number;
    burnPercent: number;
}
export type ExecuteExternalCallAccounts = {
    executor: PublicKey;
    submissionWallet: PublicKey;
    submissionAuth: PublicKey;
    submission: PublicKey;
    tokenMint: PublicKey;
    externalCallStorage: PublicKey;
    externalCallMeta: PublicKey;
    bridge: PublicKey;
    rewardBeneficiaryWallet: PublicKey;
    fallbackAddress: PublicKey;
    fallbackAddressWallet: PublicKey;
    originalClaimer: PublicKey;
};
/**
 * base58-encoded string or @solana/web3.PublicKey instance
 */
export type SolanaPubkey = PublicKey | string;
/**
 * hex-encoded string with `0x` prefix
 */
export type HexString = string;
export type AmountType = string | number | BN;
export interface FeeInfoType {
    fixed: {
        amount: BN;
        type: FixedFeeType;
    };
    transfer: BN;
    discount: {
        fixBps: number;
        transferBps: number;
    };
    finalAmount: BN;
}
export type ChainIdType = BN | number | Buffer | string;
export interface InitMintBridgeParamsType {
    payer: PublicKey;
    chainId: ChainIdType;
    tokenAddress: string;
    tokenName: string;
    tokenSymbol: string;
    decimals: number;
}
export interface HashDeployInfoParams {
    /**
     * Hex-encdoded debridge id
     */
    debridgeId: string;
    tokenName: string;
    tokenSymbol: string;
    decimals: number;
}
export interface AutoParamsType {
    executionFee: AmountType;
    flags?: number | Buffer | string;
    /**
     * if 0x prefix exists - hex-encoded string, else Base58-encoded pubkey
     */
    fallbackAddress: string;
    /**
     * external call data, buffer or hex-encoded string
     */
    data?: Buffer | HexString;
    shortcut?: Buffer | HexString;
    /**
     * hex-encoded sender
     */
    nativeSender: string;
}
export interface SubmissionIdParams {
    bridge: BridgeVariantType | PublicKey;
    receiver: PublicKey | Buffer;
    amount: AmountType;
    nonce: number;
    chainFrom: ChainIdType;
    autoParams?: AutoParamsType;
}
export interface SendBridgeMap {
    tokenMint: PublicKey;
}
export interface BridgeFeeInfoType {
    bridgeFeeBump: number;
    assetChainFee?: BN;
}
export interface ConfirmationStorageType {
    oracles: Array<number[]>;
    capacity: BN;
    bump: number;
    creator: PublicKey;
}
export declare enum ProtocolStatusEnum {
    WORKING = 0,
    PAUSED = 1
}
export interface StateType {
    status: ProtocolStatusEnum;
    protocolAuthority: PublicKey;
    stopTap: PublicKey;
    feeBeneficiary: PublicKey;
    oracles: Array<number[]>;
    requiredOracles: Array<number[]>;
    confirmationGuard: {
        currentTimeslot?: BN;
        submissionInTimeslotCount: number;
        confirmationThreshold: number;
        excessConfirmations: number;
        minConfirmations: number;
        excessConfirmationTimeslot: BN;
    };
    globalFixedFee: BN;
    globalTransferFeeBps: BN;
}
export type ExternalCallMetaExecutionType = {
    execution?: {
        offset: BN;
        externalCallLen: BN;
        isAuthInitialized: boolean;
    };
};
export type ExternalCallMetaAccumulationType = {
    accumulation?: {
        externalCallLen: BN;
    };
};
export type ExternalCallMetaExecutedType = {
    executed?: Record<string, never>;
};
export type ExternalCallMetaFailedType = {
    failed?: Record<string, never>;
};
export type ExternalCallMetaVariant = ExternalCallMetaExecutionType | ExternalCallMetaAccumulationType | ExternalCallMetaExecutedType | ExternalCallMetaFailedType;
export declare function isExtCallMetaAccumulation(arg: ExternalCallMetaVariant | undefined | null): arg is ExternalCallMetaAccumulationType;
export declare function isExtCallMetaExecution(arg: ExternalCallMetaVariant | undefined | null): arg is ExternalCallMetaExecutionType;
export declare function isExtCallMetaExecuted(arg: ExternalCallMetaVariant | undefined | null): arg is ExternalCallMetaExecutedType;
export declare function isExtCallMetaFailed(arg: ExternalCallMetaVariant | undefined | null): arg is ExternalCallMetaFailedType;
export interface ExternalCallMetaType {
    data: ExternalCallMetaVariant;
    externalCallStorageBump: number;
    bump: number;
}
export interface SupportedChainInfoType {
    supported: {
        chainAddressLen: number;
        fixedFee?: BN;
        transferFeeBps?: BN;
    };
}
export declare function isSupportedChainInfoType(arg: null | undefined | ChainSupportInfoVariantType): arg is SupportedChainInfoType;
export interface NotSupportedChainInfoType {
    notSupported?: Record<string, never>;
}
export type ChainSupportInfoVariantType = SupportedChainInfoType | NotSupportedChainInfoType;
export interface ChainSupportInfoType {
    data: ChainSupportInfoVariantType;
    chainSupportInfoBump: number;
}
export declare enum BridgeState {
    WORK = 0,
    PAUSE = 1
}
export interface BridgeInfoType {
    maxAmount: BN;
    balance: BN;
    lockedInStrategies: BN;
    minReservesBps: BN;
    state: BridgeState;
    collectedFee: BN;
    withdrawnFee: BN;
    collectedNativeFee: BN;
}
export interface SendBridgeType {
    send: {
        info: BridgeInfoType;
        nativeTokenAddress: PublicKey;
    };
}
export declare function isSendBridge(arg: BridgeVariantType): arg is SendBridgeType;
export interface MintBridgeType {
    mint: {
        info: BridgeInfoType;
        sourceChainId: number[];
        nativeTokenAddress: Buffer;
        tokenMintBump: number;
        deployId: number[];
        denominator: number;
    };
}
export declare function isMintBridge(arg: BridgeVariantType): arg is MintBridgeType;
export type BridgeVariantType = SendBridgeType | MintBridgeType | {
    empty?: Record<string, never>;
};
export interface RawBridgeType {
    data: BridgeVariantType;
    bumps: {
        bridge: number;
        mintAuthority: number;
        stakingWallet: number;
    };
}
export interface BridgeType extends RawBridgeType {
    info: BridgeInfoType;
}
export interface ActiveDiscountType {
    active: {
        fixBps: number;
        transferBps: number;
    };
}
export declare function isActiveDiscount(arg: DiscountVariantType): arg is DiscountVariantType;
export type DiscountVariantType = ActiveDiscountType | {
    unactive: Record<string, never>;
};
export interface DiscountInfoType {
    data: DiscountVariantType;
    bump: number;
}
export interface SubmissionInfoType {
    claimer: PublicKey;
    receiver: PublicKey;
    fallbackAddress: PublicKey;
    tokenMint: PublicKey;
    nativeSender: Uint8Array | null;
    sourceChainId: number[];
    bump: number;
}
export interface MintBridgeCreatedEventType {
    bridgeId: number[];
    wrapperTokenAddress: number[];
}
export interface SendBridgeCreatedEventType {
    bridgeId: number[];
}
export interface BridgedEventType {
    submissionId: number[];
}
export interface TransferredEventType {
    sendType: {
        staked: Record<string, never>;
    } | {
        burnt: Record<string, never>;
    };
    submissionId: number[];
    bridgeId: number[];
    amount: BN;
    receiver: Buffer;
    nonce: number[];
    targetChainId: number[];
    feeType: {
        native: Record<string, never>;
    } | {
        asset: Record<string, never>;
    };
    collectedFee: BN;
    collectedTransferFee: BN;
    nativeSender: PublicKey;
    submissionParams: {
        fallbackAddress: Buffer;
        reservedFlag: number[];
        externalCallStorageShortcut: number[];
    };
    executionFee?: BN;
    denominator: number;
    referralCode?: number;
}
export interface SubmissionStatusType {
    type: "notClaimed" | "accumulation" | "executing" | "executed" | "fallback";
    data: ExternalCallMetaVariant | null;
    additionalContext?: unknown;
}
export {};
//# sourceMappingURL=interfaces.d.ts.map