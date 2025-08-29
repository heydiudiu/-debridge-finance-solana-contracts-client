"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCloseExternalCallStorageInstruction = exports.buildMakeFallbackForExternalCallInstruction = exports.buildCloseSubmissionAuthWalletInstruction = exports.resetFreezeAuthorityBatch = exports.storeConfirmationsInstruction = exports.updateExternalCallStorageInstruction = exports.initOrUpdateExternalCallStorage = exports.initExternalCallStorageInstruction = exports.claimInstrution = exports.sendInstruction = exports.initChainSupportInfoInstruction = exports.updateFeeBridgeInfoInstruction = exports.initializeMintBridgeInstruction = exports.initializeSendBridgeInstruction = exports.executeExternalCallInstruction = exports.initNonceMasterInstruction = exports.TransactionBuilder = exports.InstructionBuilder = void 0;
const buffer_1 = require("buffer");
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const solana_utils_1 = require("@debridge-finance/solana-utils");
class InstructionBuilder {
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
    async instruction() {
        return this.builder.instruction();
    }
    set accountsCreationFees(lamports) {
        this.creationFees = lamports;
    }
    get accountsCreationFees() {
        return this.creationFees;
    }
}
exports.InstructionBuilder = InstructionBuilder;
class TransactionBuilder {
    constructor(instructions = []) {
        this.instructions = instructions;
    }
    add(instruction) {
        this.instructions.push(instruction);
    }
    async transaction() {
        return new web3_js_1.Transaction().add(...(await Promise.all(this.instructions.map((builder) => builder.instruction()))));
    }
}
exports.TransactionBuilder = TransactionBuilder;
function initNonceMasterInstruction(program, context) {
    const builder = new InstructionBuilder(program.methods.initNonceMaster, { ...context, systemProgram: web3_js_1.SystemProgram.programId }, []);
    return builder;
}
exports.initNonceMasterInstruction = initNonceMasterInstruction;
function executeExternalCallInstruction(program, context, params, remainingAccounts) {
    const b = new InstructionBuilder(program.methods.executeExternalCall, { ...context, systemProgram: web3_js_1.SystemProgram.programId, splTokenProgram: solana_utils_1.TOKEN_PROGRAM_ID }, [
        ["submissionId", Array.from(params.submissionId)],
        ["count", params.count],
        ["reversedSubsitutionBumps", params.subsitutionBumps],
    ], remainingAccounts);
    return b;
}
exports.executeExternalCallInstruction = executeExternalCallInstruction;
function initializeSendBridgeInstruction(settingsProgram, context) {
    const builder = new InstructionBuilder(settingsProgram.methods.initializeSendBridge, {
        ...context,
        systemProgram: web3_js_1.SystemProgram.programId,
        tokenProgram: solana_utils_1.TOKEN_PROGRAM_ID,
    }, []);
    return builder;
}
exports.initializeSendBridgeInstruction = initializeSendBridgeInstruction;
function initializeMintBridgeInstruction(settingsProgram, context, params) {
    const builder = new InstructionBuilder(settingsProgram.methods.initializeMintBridge, {
        ...context,
        tokenMetadataProgram: solana_utils_1.TOKEN_METADATA_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
        tokenProgram: solana_utils_1.TOKEN_PROGRAM_ID,
        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
    }, [
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
exports.initializeMintBridgeInstruction = initializeMintBridgeInstruction;
function updateFeeBridgeInfoInstruction(settingsProgram, context, params) {
    const builder = new InstructionBuilder(settingsProgram.methods.updateFeeBridgeInfo, { ...context, systemProgram: web3_js_1.SystemProgram.programId, tokenProgram: solana_utils_1.TOKEN_PROGRAM_ID }, [
        ["targetChainId", Array.from(params.targetChainId)],
        ["chainFee", params.chainFee],
    ]);
    return builder;
}
exports.updateFeeBridgeInfoInstruction = updateFeeBridgeInfoInstruction;
// currently not supported
function initChainSupportInfoInstruction(settingsProgram, context, params) {
    if (params.fixedFee) {
        params.fixedFee.toArrayLike(buffer_1.Buffer, "le", 8);
    }
    return settingsProgram.instruction.updateChainSupportInfo(Array.from(params.targetChainId), params.isSupported, (params === null || params === void 0 ? void 0 : params.fixedFee) || null, (params === null || params === void 0 ? void 0 : params.transferFee) || null, params.chainAddressLen, {
        accounts: {
            ...context,
            systemProgram: web3_js_1.SystemProgram.programId,
        },
    });
}
exports.initChainSupportInfoInstruction = initChainSupportInfoInstruction;
function sendInstruction(program, context, params) {
    const builder = new InstructionBuilder(program.methods.send, {
        bridgeCtx: {
            bridge: context.bridge,
            tokenMint: context.tokenMint,
            stakingWallet: context.stakingWallet,
            mintAuthority: context.mintAuthority,
            chainSupportInfo: context.chainSupportInfo,
            splTokenProgram: solana_utils_1.TOKEN_PROGRAM_ID,
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
        systemProgram: web3_js_1.SystemProgram.programId,
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
exports.sendInstruction = sendInstruction;
function normalizeClaimSubmissionParams(params) {
    return {
        nativeSender: params.nativeSender,
        externalCallShortcut: Array.from(params.externalCallShortcut),
        executionFee: Array.from(params.executionFee),
        reservedFlag: Array.from(params.reservedFlag),
    };
}
function claimInstrution(program, context, params) {
    const builder = new InstructionBuilder(program.methods.claim, {
        submission: context.submissionAddr,
        bridgeCtx: {
            bridge: context.bridgeData,
            tokenMint: context.tokenMint,
            stakingWallet: context.stakingWallet,
            mintAuthority: context.mintAuthority,
            chainSupportInfo: context.chainSupportInfo,
            splTokenProgram: solana_utils_1.TOKEN_PROGRAM_ID,
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
        systemProgram: web3_js_1.SystemProgram.programId,
    }, [
        ["sourceChainId", Array.from(params.sourceChainId)],
        ["rawAmount", Array.from(params.amount)],
        ["nonce", Array.from(params.nonce)],
        ["submissionsParam", (params === null || params === void 0 ? void 0 : params.submissionParams) ? normalizeClaimSubmissionParams(params.submissionParams) : null],
    ]);
    return builder;
}
exports.claimInstrution = claimInstrution;
function initExternalCallStorageInstruction(program, context, params) {
    const builder = new InstructionBuilder(program.methods.initExternalCallStorage, {
        storageOwner: context.claimer,
        externalCallMeta: context.externalCallMeta,
        externalCallStorage: context.externalCallStorage,
        systemProgram: web3_js_1.SystemProgram.programId,
    }, [
        ["externalCallLen", params.externalCallLen],
        ["chainId", Array.from(params.sourceChainId)],
        ["storageKey", Array.from(params.storageKey)],
        ["rawInstructions", params.rawInstructions],
    ]);
    return builder;
}
exports.initExternalCallStorageInstruction = initExternalCallStorageInstruction;
function initOrUpdateExternalCallStorage(program, context, params) {
    const builder = new InstructionBuilder(program.methods.initOrUpdateExternalCallStorage, {
        storageOwner: context.claimer,
        externalCallMeta: context.externalCallMeta,
        externalCallStorage: context.externalCallStorage,
        systemProgram: web3_js_1.SystemProgram.programId,
    }, [
        ["externalCallLen", params.externalCallLen],
        ["chainId", new anchor_1.BN(params.sourceChainId)],
        ["storageKey", Array.from(params.storageKey)],
        ["externalInstructionsOffset", params.externalInstructionsOffset],
        ["rawInstructions", params.rawInstructions],
    ]);
    return builder;
}
exports.initOrUpdateExternalCallStorage = initOrUpdateExternalCallStorage;
function updateExternalCallStorageInstruction(program, context, params) {
    const builder = new InstructionBuilder(program.methods.updateExternalCallStorage, {
        ...context,
        systemProgram: web3_js_1.SystemProgram.programId,
    }, [
        ["chainId", Array.from(params.sourceChainId)],
        ["submissionId", Array.from(params.submissionId)],
        ["externalInstructionsOffset", new anchor_1.BN(params.rawInstructions.offset)],
        ["rawInstructions", params.rawInstructions.data],
    ]);
    return builder;
}
exports.updateExternalCallStorageInstruction = updateExternalCallStorageInstruction;
function storeConfirmationsInstruction(settingsProgram, context, params) {
    const builder = new InstructionBuilder(settingsProgram.methods.storeConfirmations, {
        ...context,
        instructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
        systemProgram: web3_js_1.SystemProgram.programId,
    }, [["msg", params.message]]);
    return builder;
}
exports.storeConfirmationsInstruction = storeConfirmationsInstruction;
function resetFreezeAuthorityBatch(settingsProgram, remainingAccounts) {
    const builder = new InstructionBuilder(settingsProgram.methods.resetFreezeAuthorityBatch, { tokenProgram: solana_utils_1.TOKEN_PROGRAM_ID }, 
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
exports.resetFreezeAuthorityBatch = resetFreezeAuthorityBatch;
function buildCloseSubmissionAuthWalletInstruction(program, context, params) {
    const builder = new InstructionBuilder(program.methods.closeSubmissionAuthWallet, { ...context, splTokenProgram: solana_utils_1.TOKEN_PROGRAM_ID }, [
        ["submissionId", Array.from(params.submissionId)],
        ["submissionAuthBump", params.submissionAuthBump],
    ]);
    return builder;
}
exports.buildCloseSubmissionAuthWalletInstruction = buildCloseSubmissionAuthWalletInstruction;
function buildMakeFallbackForExternalCallInstruction(program, context, params) {
    const builder = new InstructionBuilder(program.methods.makeFallbackForExternalCall, { ...context, systemProgram: web3_js_1.SystemProgram.programId, splTokenProgram: solana_utils_1.TOKEN_PROGRAM_ID }, [
        ["submissionId", Array.from(params.submissionId)],
        ["submissionAuthBump", params.submissionAuthBump],
    ]);
    return builder;
}
exports.buildMakeFallbackForExternalCallInstruction = buildMakeFallbackForExternalCallInstruction;
function buildCloseExternalCallStorageInstruction(program, context, params) {
    const builder = new InstructionBuilder(program.methods.closeExternalCallStorage, {
        ...context,
        systemProgram: web3_js_1.SystemProgram.programId,
    }, [
        ["chainId", Array.from(params.chainId)],
        ["submissionId", Array.from(params.submissionId)],
    ]);
    return builder;
}
exports.buildCloseExternalCallStorageInstruction = buildCloseExternalCallStorageInstruction;
//# sourceMappingURL=instructions.js.map