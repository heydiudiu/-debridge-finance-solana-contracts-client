[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / instructions

# Namespace: instructions

## Table of contents

### Interfaces

- [ClaimContextType](../interfaces/instructions.ClaimContextType.md)
- [ClaimParamsType](../interfaces/instructions.ClaimParamsType.md)
- [ClaimSubmissionParamsInputType](../interfaces/instructions.ClaimSubmissionParamsInputType.md)
- [DataChunk](../interfaces/instructions.DataChunk.md)
- [ExecExternalCallContextType](../interfaces/instructions.ExecExternalCallContextType.md)
- [ExecExternalCallParamsType](../interfaces/instructions.ExecExternalCallParamsType.md)
- [ExtCallStorageContextType](../interfaces/instructions.ExtCallStorageContextType.md)
- [ExtendExtCallStorageParamsType](../interfaces/instructions.ExtendExtCallStorageParamsType.md)
- [InitChainSupportInfoContextType](../interfaces/instructions.InitChainSupportInfoContextType.md)
- [InitChainSupportInfoParamsType](../interfaces/instructions.InitChainSupportInfoParamsType.md)
- [InitExtCallStorageParamsType](../interfaces/instructions.InitExtCallStorageParamsType.md)
- [InitSendBridgeContextType](../interfaces/instructions.InitSendBridgeContextType.md)
- [InitializeMintBridgeContextType](../interfaces/instructions.InitializeMintBridgeContextType.md)
- [InitializeMintBridgeParamsType](../interfaces/instructions.InitializeMintBridgeParamsType.md)
- [SendContextType](../interfaces/instructions.SendContextType.md)
- [SendParamsType](../interfaces/instructions.SendParamsType.md)
- [StoreSignaturesContextType](../interfaces/instructions.StoreSignaturesContextType.md)
- [StoreSignaturesParamsType](../interfaces/instructions.StoreSignaturesParamsType.md)
- [UpdateFeeBridgeInfoContextType](../interfaces/instructions.UpdateFeeBridgeInfoContextType.md)
- [UpdateFeeBridgeInfoParamsType](../interfaces/instructions.UpdateFeeBridgeInfoParamsType.md)

### Functions

- [buildCloseSubmissionAuthWalletInstruction](instructions.md#buildclosesubmissionauthwalletinstruction)
- [buildMakeFallbackForExternalCallInstruction](instructions.md#buildmakefallbackforexternalcallinstruction)
- [claimInstrution](instructions.md#claiminstrution)
- [executeExternalCallInstruction](instructions.md#executeexternalcallinstruction)
- [initChainSupportInfoInstruction](instructions.md#initchainsupportinfoinstruction)
- [initExternalCallStorageInstruction](instructions.md#initexternalcallstorageinstruction)
- [initializeMintBridgeInstruction](instructions.md#initializemintbridgeinstruction)
- [initializeSendBridgeInstruction](instructions.md#initializesendbridgeinstruction)
- [sendInstruction](instructions.md#sendinstruction)
- [storeSignaturesInstruction](instructions.md#storesignaturesinstruction)
- [updateExternalCallStorageInstruction](instructions.md#updateexternalcallstorageinstruction)
- [updateFeeBridgeInfoInstruction](instructions.md#updatefeebridgeinfoinstruction)

## Functions

### buildCloseSubmissionAuthWalletInstruction

▸ **buildCloseSubmissionAuthWalletInstruction**(`program`, `context`, `params`): `Promise`<`TransactionInstruction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `program` | `Program`<`DebridgeProgram`\> |
| `context` | `SendToFallbackContextType` |
| `params` | `FallbackParamsType` |

#### Returns

`Promise`<`TransactionInstruction`\>

#### Defined in

[instructions.ts:459](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L459)

___

### buildMakeFallbackForExternalCallInstruction

▸ **buildMakeFallbackForExternalCallInstruction**(`program`, `context`, `params`): `Promise`<`TransactionInstruction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `program` | `Program`<`DebridgeProgram`\> |
| `context` | `MakeFallbackForExternalCallContextType` |
| `params` | `FallbackParamsType` |

#### Returns

`Promise`<`TransactionInstruction`\>

#### Defined in

[instructions.ts:479](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L479)

___

### claimInstrution

▸ **claimInstrution**(`program`, `context`, `params`): `TransactionInstruction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `program` | `Program`<`DebridgeProgram`\> |
| `context` | [`ClaimContextType`](../interfaces/instructions.ClaimContextType.md) |
| `params` | [`ClaimParamsType`](../interfaces/instructions.ClaimParamsType.md) |

#### Returns

`TransactionInstruction`

#### Defined in

[instructions.ts:314](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L314)

___

### executeExternalCallInstruction

▸ **executeExternalCallInstruction**(`program`, `context`, `params`, `remainingAccounts?`): `TransactionInstruction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `program` | `Program`<`DebridgeProgram`\> |
| `context` | [`ExecExternalCallContextType`](../interfaces/instructions.ExecExternalCallContextType.md) |
| `params` | [`ExecExternalCallParamsType`](../interfaces/instructions.ExecExternalCallParamsType.md) |
| `remainingAccounts?` | `AccountMeta`[] |

#### Returns

`TransactionInstruction`

#### Defined in

[instructions.ts:40](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L40)

___

### initChainSupportInfoInstruction

▸ **initChainSupportInfoInstruction**(`settingsProgram`, `context`, `params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `settingsProgram` | `Program`<`DebridgeSettingsProgram`\> |
| `context` | [`InitChainSupportInfoContextType`](../interfaces/instructions.InitChainSupportInfoContextType.md) |
| `params` | [`InitChainSupportInfoParamsType`](../interfaces/instructions.InitChainSupportInfoParamsType.md) |

#### Returns

`void`

#### Defined in

[instructions.ts:184](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L184)

___

### initExternalCallStorageInstruction

▸ **initExternalCallStorageInstruction**(`program`, `context`, `params`): `TransactionInstruction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `program` | `Program`<`DebridgeProgram`\> |
| `context` | [`ExtCallStorageContextType`](../interfaces/instructions.ExtCallStorageContextType.md) |
| `params` | [`InitExtCallStorageParamsType`](../interfaces/instructions.InitExtCallStorageParamsType.md) |

#### Returns

`TransactionInstruction`

#### Defined in

[instructions.ts:370](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L370)

___

### initializeMintBridgeInstruction

▸ **initializeMintBridgeInstruction**(`settingsProgram`, `context`, `params`): `TransactionInstruction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `settingsProgram` | `Program`<`DebridgeSettingsProgram`\> |
| `context` | [`InitializeMintBridgeContextType`](../interfaces/instructions.InitializeMintBridgeContextType.md) |
| `params` | [`InitializeMintBridgeParamsType`](../interfaces/instructions.InitializeMintBridgeParamsType.md) |

#### Returns

`TransactionInstruction`

#### Defined in

[instructions.ts:103](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L103)

___

### initializeSendBridgeInstruction

▸ **initializeSendBridgeInstruction**(`settingsProgram`, `context`): `TransactionInstruction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `settingsProgram` | `Program`<`DebridgeSettingsProgram`\> |
| `context` | [`InitSendBridgeContextType`](../interfaces/instructions.InitSendBridgeContextType.md) |

#### Returns

`TransactionInstruction`

#### Defined in

[instructions.ts:72](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L72)

___

### sendInstruction

▸ **sendInstruction**(`program`, `context`, `params`): `TransactionInstruction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `program` | `Program`<`DebridgeProgram`\> |
| `context` | [`SendContextType`](../interfaces/instructions.SendContextType.md) |
| `params` | [`SendParamsType`](../interfaces/instructions.SendParamsType.md) |

#### Returns

`TransactionInstruction`

#### Defined in

[instructions.ts:235](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L235)

___

### storeSignaturesInstruction

▸ **storeSignaturesInstruction**(`settingsProgram`, `context`, `params`): `TransactionInstruction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `settingsProgram` | `Program`<`DebridgeSettingsProgram`\> |
| `context` | [`StoreSignaturesContextType`](../interfaces/instructions.StoreSignaturesContextType.md) |
| `params` | [`StoreSignaturesParamsType`](../interfaces/instructions.StoreSignaturesParamsType.md) |

#### Returns

`TransactionInstruction`

#### Defined in

[instructions.ts:426](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L426)

___

### updateExternalCallStorageInstruction

▸ **updateExternalCallStorageInstruction**(`program`, `context`, `params`): `TransactionInstruction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `program` | `Program`<`DebridgeProgram`\> |
| `context` | [`ExtCallStorageContextType`](../interfaces/instructions.ExtCallStorageContextType.md) |
| `params` | [`ExtendExtCallStorageParamsType`](../interfaces/instructions.ExtendExtCallStorageParamsType.md) |

#### Returns

`TransactionInstruction`

#### Defined in

[instructions.ts:397](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L397)

___

### updateFeeBridgeInfoInstruction

▸ **updateFeeBridgeInfoInstruction**(`settingsProgram`, `context`, `params`): `TransactionInstruction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `settingsProgram` | `Program`<`DebridgeSettingsProgram`\> |
| `context` | [`UpdateFeeBridgeInfoContextType`](../interfaces/instructions.UpdateFeeBridgeInfoContextType.md) |
| `params` | [`UpdateFeeBridgeInfoParamsType`](../interfaces/instructions.UpdateFeeBridgeInfoParamsType.md) |

#### Returns

`TransactionInstruction`

#### Defined in

[instructions.ts:151](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L151)
