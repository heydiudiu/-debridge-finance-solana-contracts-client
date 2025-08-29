/// <reference types="node" />
/// <reference types="node" />
import { Idl, Program } from "@coral-xyz/anchor";
import { AccountInfo } from "@solana/web3.js";
import { DebridgeProgram } from "./idl/debridge_program";
import { DebridgeSettingsProgram } from "./idl/debridge_settings_program";
type InputType = null | AccountInfo<Buffer> | Buffer | Uint8Array;
type AccountNames<Idls extends Idl> = NonNullable<Idls["accounts"]>[number]["name"];
export type Decoder<Idls extends Idl> = {
    [Acc in AccountNames<Idls> as `decode${Capitalize<Acc>}`]: (data: InputType) => Awaited<ReturnType<Program<Idls>["account"][Acc]["fetchNullable"]>>;
};
export declare function buildDebridgeDecoder(debridge: Program<DebridgeProgram>, settings: Program<DebridgeSettingsProgram>): Decoder<DebridgeProgram | DebridgeSettingsProgram>;
export {};
//# sourceMappingURL=decoder.d.ts.map