/// <reference types="node" />
/// <reference types="node" />
import { Buffer } from "buffer";
export declare function generateSignatures(message: Buffer, privateKeys: string[], instructionIndex: number): Buffer;
export declare function restoreSignaturePubkey(message: Buffer, signature: Buffer, output?: "hex" | "buffer"): string | Buffer;
/**
 * Packs signatures and signed data into solana secp instruction data
 * @param message signed data
 * @param signatures array of signatures
 * @returns secp instruction data
 */
export declare function packSignatures(message: Buffer, signatures: Buffer[], instructionIndex?: number): Buffer;
//# sourceMappingURL=generateSignatures.d.ts.map