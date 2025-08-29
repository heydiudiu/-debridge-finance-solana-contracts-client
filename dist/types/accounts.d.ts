/// <reference types="node" />
/// <reference types="node" />
import { AccountInfo, PublicKey } from "@solana/web3.js";
type DecodeFn<T> = (data: Uint8Array) => T;
export interface Stringable {
    toString(): string;
}
export interface AccountInfoWithAddress<T> extends Partial<AccountInfo<T | null>>, Stringable {
    address: PublicKey;
}
export declare function buildDecodedAccountInfoWithAddress<T>(address: PublicKey, info: AccountInfo<Buffer> | null, decoder: DecodeFn<T>): AccountInfoWithAddress<T>;
export declare class UpdatableAccountInfo<T> implements AccountInfoWithAddress<T> {
    private accountAddress;
    private decoder;
    private accountInfo;
    constructor(accountAddress: PublicKey, info: AccountInfo<Buffer> | null, decoder: DecodeFn<T>);
    toString(): string;
    setData(newData: AccountInfo<Buffer>): void;
    get isEmpty(): boolean;
    get address(): PublicKey;
    get lamports(): number | undefined;
    get owner(): PublicKey | undefined;
    get data(): T | null | undefined;
    get executable(): boolean | undefined;
}
export {};
//# sourceMappingURL=accounts.d.ts.map