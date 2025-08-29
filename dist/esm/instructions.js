import { __awaiter } from "tslib";
import { Buffer } from "buffer";
import { BN } from "@coral-xyz/anchor";
import { SYSVAR_INSTRUCTIONS_PUBKEY, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from "@debridge-finance/solana-utils";
export class InstructionBuilder {
    constructor(builderMethod, context, data, remainingAccounts) {
        this.context = context;
        this.data = data;
        this.remainingAccounts = remainingAccounts;
        const builder = builderMethod(...data.map((v) => v[1]));
        builder.accounts(context);
        if ((this === null || this === void 0 ? void 0 : this.remainingAccounts) !== undefined && this.remainingAccounts.length > 0) {
            builder.remainingAccounts(this.remainingAccounts);
        }
        this.creationFees = BigInt(0);
        this.builder = builder;
    }
    get accounts() {
        return this.context;
    }
    get args() {
        return Object.fromEntries(this.data);
    }
    instruction() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.builder.instruction();
        });
    }
    set accountsCreationFees(lamports) {
        this.creationFees = lamports;
    }
    get accountsCreationFees() {
        return this.creationFees;
    }
}
export class TransactionBuilder {
    constructor(instructions = []) {
        this.instructions = instructions;
    }
    add(instruction) {
        this.instructions.push(instruction);
    }
    transaction() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Transaction().add(...(yield Promise.all(this.instructions.map((builder) => builder.instruction()))));
        });
    }
}
export function initNonceMasterInstruction(program, context) {
    const builder = new InstructionBuilder(program.methods.initNonceMaster, Object.assign(Object.assign({}, context), { systemProgram: SystemProgram.programId }), []);
    return builder;
}
export function executeExternalCallInstruction(program, context, params, remainingAccounts) {
    const b = new InstructionBuilder(program.methods.executeExternalCall, Object.assign(Object.assign({}, context), { systemProgram: SystemProgram.programId, splTokenProgram: TOKEN_PROGRAM_ID }), [
        ["submissionId", Array.from(params.submissionId)],
        ["count", params.count],
        ["reversedSubsitutionBumps", params.subsitutionBumps],
    ], remainingAccounts);
    return b;
}
export function initializeSendBridgeInstruction(settingsProgram, context) {
    const builder = new InstructionBuilder(settingsProgram.methods.initializeSendBridge, Object.assign(Object.assign({}, context), { systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID }), []);
    return builder;
}
export function initializeMintBridgeInstruction(settingsProgram, context, params) {
    const builder = new InstructionBuilder(settingsProgram.methods.initializeMintBridge, Object.assign(Object.assign({}, context), { tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID, systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID, rent: SYSVAR_RENT_PUBKEY }), [
        [
            "deployInfo",
            {
                chainId: Array.from(params.chainId),
                nativeTokenAddress: params.nativeTokenAddress,
                name: params.tokenName,
                symbol: params.tokenSymbol,
                decimals: params.decimals,
            },
        ],
    ]);
    return builder;
}
export function updateFeeBridgeInfoInstruction(settingsProgram, context, params) {
    const builder = new InstructionBuilder(settingsProgram.methods.updateFeeBridgeInfo, Object.assign(Object.assign({}, context), { systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID }), [
        ["targetChainId", Array.from(params.targetChainId)],
        ["chainFee", params.chainFee],
    ]);
    return builder;
}
// currently not supported
export function initChainSupportInfoInstruction(settingsProgram, context, params) {
    if (params.fixedFee) {
        params.fixedFee.toArrayLike(Buffer, "le", 8);
    }
    return settingsProgram.instruction.updateChainSupportInfo(Array.from(params.targetChainId), params.isSupported, (params === null || params === void 0 ? void 0 : params.fixedFee) || null, (params === null || params === void 0 ? void 0 : params.transferFee) || null, params.chainAddressLen, {
        accounts: Object.assign(Object.assign({}, context), { systemProgram: SystemProgram.programId }),
    });
}
export function sendInstruction(program, context, params) {
    const builder = new InstructionBuilder(program.methods.send, {
        bridgeCtx: {
            bridge: context.bridge,
            tokenMint: context.tokenMint,
            stakingWallet: context.stakingWallet,
            mintAuthority: context.mintAuthority,
            chainSupportInfo: context.chainSupportInfo,
            splTokenProgram: TOKEN_PROGRAM_ID,
            settingsProgram: context.settingsProgram,
        },
        stateCtx: {
            state: context.state,
            feeBeneficiary: context.feeBeneficiary,
        },
        nonceStorage: context.nonceStorage,
        sendFromWallet: context.sendFromWallet,
        sendFrom: context.sendFrom,
        bridgeFee: context.bridgeFee,
        discount: context.discount,
        systemProgram: SystemProgram.programId,
        externalCallStorage: context.externalCallStorage,
        externalCallMeta: context.externalCallMeta,
    }, [
        ["targetChainId", Array.from(params.chainIdBuffer)],
        ["receiver", params.receiver],
        ["isUseAssetFee", params.useAssetFee],
        ["amount", params.amount],
        [
            "submissionParams",
            (params === null || params === void 0 ? void 0 : params.submissionParams)
                ? {
                    executionFee: params.submissionParams.executionFee,
                    externalCallShortcut: Array.from(params.submissionParams.externalCallShortcut),
                    fallbackAddress: params.submissionParams.fallbackAddress,
                    reservedFlag: Array.from(params.submissionParams.reservedFlag),
                }
                : null,
        ],
        ["referralCode", (params === null || params === void 0 ? void 0 : params.referralCode) !== undefined ? params.referralCode : null],
    ]);
    return builder;
}
function normalizeClaimSubmissionParams(params) {
    return {
        nativeSender: params.nativeSender,
        externalCallShortcut: Array.from(params.externalCallShortcut),
        executionFee: Array.from(params.executionFee),
        reservedFlag: Array.from(params.reservedFlag),
    };
}
export function claimInstrution(program, context, params) {
    const builder = new InstructionBuilder(program.methods.claim, {
        submission: context.submissionAddr,
        bridgeCtx: {
            bridge: context.bridgeData,
            tokenMint: context.tokenMint,
            stakingWallet: context.stakingWallet,
            mintAuthority: context.mintAuthority,
            chainSupportInfo: context.chainSupportInfo,
            splTokenProgram: TOKEN_PROGRAM_ID,
            settingsProgram: context.settingsProgram,
        },
        state: {
            state: context.state,
            feeBeneficiary: context.feeBeneficiary,
        },
        claimToWallet: context.claimToWallet,
        claimTo: context.receiver,
        fallbackAddress: context.fallbackAddress,
        confirmationStorage: context.confirmationStorage,
        confirmationStorageCreator: context.confirmationStorageCreator,
        payer: context.executor,
        payerWallet: context.payerWallet,
        externalCallStorage: context.externalCallStorage,
        claimMarker: context.claimMarker,
        externalCallMeta: context.externalCallMeta,
        systemProgram: SystemProgram.programId,
    }, [
        ["sourceChainId", Array.from(params.sourceChainId)],
        ["rawAmount", Array.from(params.amount)],
        ["nonce", Array.from(params.nonce)],
        ["submissionsParam", (params === null || params === void 0 ? void 0 : params.submissionParams) ? normalizeClaimSubmissionParams(params.submissionParams) : null],
    ]);
    return builder;
}
export function initExternalCallStorageInstruction(program, context, params) {
    const builder = new InstructionBuilder(program.methods.initExternalCallStorage, {
        storageOwner: context.claimer,
        externalCallMeta: context.externalCallMeta,
        externalCallStorage: context.externalCallStorage,
        systemProgram: SystemProgram.programId,
    }, [
        ["externalCallLen", params.externalCallLen],
        ["chainId", Array.from(params.sourceChainId)],
        ["storageKey", Array.from(params.storageKey)],
        ["rawInstructions", params.rawInstructions],
    ]);
    return builder;
}
export function initOrUpdateExternalCallStorage(program, context, params) {
    const builder = new InstructionBuilder(program.methods.initOrUpdateExternalCallStorage, {
        storageOwner: context.claimer,
        externalCallMeta: context.externalCallMeta,
        externalCallStorage: context.externalCallStorage,
        systemProgram: SystemProgram.programId,
    }, [
        ["externalCallLen", params.externalCallLen],
        ["chainId", new BN(params.sourceChainId)],
        ["storageKey", Array.from(params.storageKey)],
        ["externalInstructionsOffset", params.externalInstructionsOffset],
        ["rawInstructions", params.rawInstructions],
    ]);
    return builder;
}
export function updateExternalCallStorageInstruction(program, context, params) {
    const builder = new InstructionBuilder(program.methods.updateExternalCallStorage, Object.assign(Object.assign({}, context), { systemProgram: SystemProgram.programId }), [
        ["chainId", Array.from(params.sourceChainId)],
        ["submissionId", Array.from(params.submissionId)],
        ["externalInstructionsOffset", new BN(params.rawInstructions.offset)],
        ["rawInstructions", params.rawInstructions.data],
    ]);
    return builder;
}
export function storeConfirmationsInstruction(settingsProgram, context, params) {
    const builder = new InstructionBuilder(settingsProgram.methods.storeConfirmations, Object.assign(Object.assign({}, context), { instructions: SYSVAR_INSTRUCTIONS_PUBKEY, systemProgram: SystemProgram.programId }), [["msg", params.message]]);
    return builder;
}
export function resetFreezeAuthorityBatch(settingsProgram, remainingAccounts) {
    const builder = new InstructionBuilder(settingsProgram.methods.resetFreezeAuthorityBatch, { tokenProgram: TOKEN_PROGRAM_ID }, 
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    [], [
        {
            pubkey: remainingAccounts.tokenMint,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: remainingAccounts.bridgeData,
            isSigner: true,
            isWritable: false,
        },
    ]);
    return builder;
}
export function buildCloseSubmissionAuthWalletInstruction(program, context, params) {
    const builder = new InstructionBuilder(program.methods.closeSubmissionAuthWallet, Object.assign(Object.assign({}, context), { splTokenProgram: TOKEN_PROGRAM_ID }), [
        ["submissionId", Array.from(params.submissionId)],
        ["submissionAuthBump", params.submissionAuthBump],
    ]);
    return builder;
}
export function buildMakeFallbackForExternalCallInstruction(program, context, params) {
    const builder = new InstructionBuilder(program.methods.makeFallbackForExternalCall, Object.assign(Object.assign({}, context), { systemProgram: SystemProgram.programId, splTokenProgram: TOKEN_PROGRAM_ID }), [
        ["submissionId", Array.from(params.submissionId)],
        ["submissionAuthBump", params.submissionAuthBump],
    ]);
    return builder;
}
export function buildCloseExternalCallStorageInstruction(program, context, params) {
    const builder = new InstructionBuilder(program.methods.closeExternalCallStorage, Object.assign(Object.assign({}, context), { systemProgram: SystemProgram.programId }), [
        ["chainId", Array.from(params.chainId)],
        ["submissionId", Array.from(params.submissionId)],
    ]);
    return builder;
}
//# sourceMappingURL=instructions.js.map