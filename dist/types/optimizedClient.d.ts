/// <reference types="node" />
/// <reference types="node" />
import { AccountMeta, Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import * as pino from "pino";
import { Program } from "@coral-xyz/anchor";
import { DebridgeSettingsProgram } from "./idl/debridge_settings_program";
import { DebridgeProgram } from "./idl/debridge_program";
import { ActionPriorityFee, AutoParamsType, ChainIdType, HexString, PriorityFeeConfig, SolanaPubkey, WalletsCheckConfig, AccountStructByName, InitOrUpdateExtCallTransactions } from "./interfaces";
import { AccountInfoWithAddress } from "./accounts";
export declare class ClientV2 {
    private connection;
    settings: Program<DebridgeSettingsProgram>;
    program: Program<DebridgeProgram>;
    chainId: number;
    private logger?;
    private accountsResolver;
    private decoder;
    readonly priorityFeeConfig?: PriorityFeeConfig;
    readonly stateAccount: PublicKey;
    private feeBeneficiaryAccount;
    private cachedState;
    constructor(connection: Connection, options: {
        chainId: number;
        deBridgeProgram?: SolanaPubkey;
        settingsProgram?: SolanaPubkey;
        clientLogger?: pino.Logger;
        priorityFeeConfig?: PriorityFeeConfig;
    });
    getState(): Promise<AccountStructByName<DebridgeSettingsProgram, "state">>;
    private getCalldataShortcut;
    private splitDataForExternalCall;
    private buildFillExtcallStorageTransactions;
    prepareExternalCallTransactions(storageKey: Buffer, sourceChain: number | Buffer, data: Buffer, accounts: {
        executor: PublicKey;
        externalCallStorage: AccountInfoWithAddress<Buffer>;
        externalCallMeta: AccountInfoWithAddress<AccountStructByName<DebridgeProgram, "externalCallMeta">>;
        submission?: AccountInfoWithAddress<AccountStructByName<DebridgeProgram, "submissionAccount">>;
    }, priorityFee?: ActionPriorityFee): Promise<InitOrUpdateExtCallTransactions | null>;
    /**
     * Packs initCalldata and other instructions into single tx if possible
     * If extCallTransactions contains both init & store txs that's pointless -> return extCall transactions as is
     * @param instructions instructions list that should go before initCalldata (prefix) and after initCalldata ix (postfix)
     * @param extCallTxs calldata txs or null
     * @returns packed tx and modified extCallTransactions
     */
    private tryPackCalldataTransaction;
    buildSendContext(sender: PublicKey, tokenMint: PublicKey, chainTo: number | string | Buffer, externalCall: {
        data?: Uint8Array | string;
        shortcut?: Uint8Array | string;
        flags?: number | string | Buffer;
    } | null, options?: {
        sendFromWallet?: PublicKey;
        useDiscount?: boolean;
        useAssetFee?: boolean;
    }): {
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
    };
    buildSendTransactions(sender: SolanaPubkey, amount: bigint | number, receiverInfo: {
        chainTo: ChainIdType;
        receiver: HexString;
    }, senderInfo: {
        tokenMint: SolanaPubkey;
        sendFromWallet?: SolanaPubkey;
    }, autoParams?: AutoParamsType, options?: {
        sendPriorityFee?: ActionPriorityFee;
        useAssetFee?: boolean;
        useDiscount?: boolean;
        referralCode?: number;
    }): Promise<{
        extCallTxs: InitOrUpdateExtCallTransactions | null;
        transaction: Transaction;
    }>;
    buildClaimTransactions(executor: SolanaPubkey, amount: bigint, receiverInfo: {
        receiver: SolanaPubkey;
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
    }, options?: {
        createMissingWallets?: boolean | WalletsCheckConfig;
        confirmationStorageCreator?: PublicKey;
        claimPriorityFee?: ActionPriorityFee;
    }): Promise<{
        extCallTxs: InitOrUpdateExtCallTransactions | null;
        transaction: Transaction;
    }>;
    buildStoreConfirmationsTransactions(payer: PublicKey, message: Uint8Array | string, signatures: Uint8Array[] | string[], priorityFee?: ActionPriorityFee): Promise<Transaction[]>;
    buildInitMintBridge(payer: PublicKey, deployInfo: {
        name: string;
        symbol: string;
        decimals: number;
        nativeAddress: Buffer;
        chainId: number | bigint;
    }, priorityFee?: ActionPriorityFee): Promise<Transaction>;
    buildInitSendBridge(payer: PublicKey, tokenMint: PublicKey, priorityFee?: ActionPriorityFee): Promise<Transaction>;
    prepareRemainingExtCallAccounts(count: number, submission: PublicKey, submissionAuth: PublicKey, submissionWallet: PublicKey, offset: number, calldata: Buffer): [AccountMeta[], Buffer];
    buildExecuteExternalCallInstruction(accounts: {
        tokenMint: PublicKey;
        executor: PublicKey;
        fallbackAddress: PublicKey;
        originalClaimer: PublicKey;
        bridge?: PublicKey;
        externalCallStorage?: PublicKey;
        externalCallMeta?: PublicKey;
        submission?: PublicKey;
        submissionAuth?: PublicKey;
        submissionWallet?: PublicKey;
        fallbackAddressWallet?: PublicKey;
        rewardBeneficiaryWallet?: PublicKey;
        remaining: AccountMeta[];
    }, submissionId: Uint8Array, sourceChainId: number, count: number, subsitutionBumps: Buffer): Promise<TransactionInstruction>;
    buildExecuteExternalCallTransaction(count: number, submissionId: Buffer, executor: PublicKey, externalCallStorage: AccountInfoWithAddress<Buffer>, externalCallMeta: AccountInfoWithAddress<AccountStructByName<DebridgeProgram, "externalCallMeta">>, submission: AccountInfoWithAddress<AccountStructByName<DebridgeProgram, "submissionAccount">>): void;
    get feeBeneficiary(): PublicKey;
}
//# sourceMappingURL=optimizedClient.d.ts.map