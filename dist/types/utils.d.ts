/// <reference types="node" />
/// <reference types="node" />
/// <reference types="bn.js" />
import { Buffer } from "buffer";
import { BN } from "@coral-xyz/anchor";
import { AccountInfo } from "@solana/web3.js";
export declare function normalize(amount: Buffer, nominator: number): BN;
export declare function preHashMessage(data: Buffer): Buffer;
export declare function checkFlag(flags: undefined | number | Buffer | string, toCheck: number): boolean;
export declare function isAccountEmpty(acc: AccountInfo<unknown> | null): boolean;
//# sourceMappingURL=utils.d.ts.map