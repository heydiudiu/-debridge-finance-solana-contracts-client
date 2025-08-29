/// <reference types="node" />
/// <reference types="node" />
import { AccountInfo, Commitment, Connection, PublicKey } from "@solana/web3.js";
import { AccountStructByName, ConfirmationStorageType, ExternalCallMetaType, SubmissionInfoType } from "./interfaces";
import { DebridgeProgram } from "./idl/debridge_program";
import { DebridgeSettingsProgram } from "./idl/debridge_settings_program";
import { Decoder } from "./decoder";
import { UpdatableAccountInfo } from "./accounts";
export declare enum UpdateActions {
    ExternalCallStorage = "externalCallStorage",
    ExternalCallMeta = "externalCallMeta",
    ConfirmationStorage = "confirmationStorage",
    Submission = "submission",
    CorrectCalldata = "correctCalldata"
}
type ActionMap = {
    [UpdateActions.ExternalCallStorage]: Buffer;
    [UpdateActions.ExternalCallMeta]: ExternalCallMetaType;
    [UpdateActions.ConfirmationStorage]: ConfirmationStorageType;
    [UpdateActions.Submission]: SubmissionInfoType;
    [UpdateActions.CorrectCalldata]: null;
};
type TypedCallback<Action extends UpdateActions> = (data: ActionMap[Action] | null) => unknown;
export declare class SubmissionState<WithExtCall extends boolean = boolean> {
    protected decoder: Decoder<DebridgeProgram | DebridgeSettingsProgram>;
    protected connection: Connection;
    submissionId: Buffer;
    accounts: {
        confirmationStorage: PublicKey;
        submission: PublicKey;
        externalCall: WithExtCall extends true ? {
            externalCallMeta: PublicKey;
            externalCallStorage: PublicKey;
        } : null;
        commitment?: Commitment;
    };
    private logFn?;
    private subManager;
    private nativeSubscriptions;
    confirmationStorage: UpdatableAccountInfo<AccountStructByName<DebridgeSettingsProgram, "confirmationStorage">>;
    submission: UpdatableAccountInfo<AccountStructByName<DebridgeProgram, "submissionAccount">>;
    externalCallStorage: WithExtCall extends true ? UpdatableAccountInfo<Buffer> : null;
    externalCallMeta: WithExtCall extends true ? UpdatableAccountInfo<AccountStructByName<DebridgeProgram, "externalCallMeta">> : null;
    private expectedCalldata?;
    onAction<Action extends Exclude<UpdateActions, UpdateActions.CorrectCalldata>>(type: Action, callback: TypedCallback<Action>, repeat: "unlimited" | number): void;
    onActionOnce<Action extends Exclude<UpdateActions, UpdateActions.CorrectCalldata>>(type: Action, callback: TypedCallback<Action>): void;
    onCorrectCalldataOnce(expected: Buffer, callback: () => unknown): void;
    private updateListener;
    constructor(decoder: Decoder<DebridgeProgram | DebridgeSettingsProgram>, connection: Connection, submissionId: Buffer, accounts: {
        confirmationStorage: PublicKey;
        submission: PublicKey;
        externalCall: WithExtCall extends true ? {
            externalCallMeta: PublicKey;
            externalCallStorage: PublicKey;
        } : null;
        commitment?: Commitment;
    }, logFn?: ((...args: any[]) => unknown) | undefined, initialState?: {
        confirmationStorage: AccountInfo<Buffer> | null;
        submission: AccountInfo<Buffer> | null;
        externalCall: WithExtCall extends true ? {
            meta: AccountInfo<Buffer> | null;
            storage: AccountInfo<Buffer> | null;
        } : null;
    }, subscriptionCommitment?: Commitment);
    getInitialState(): Promise<this>;
    unsubscribe(): Promise<void[]>;
}
export {};
//# sourceMappingURL=submission.d.ts.map