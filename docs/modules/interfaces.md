[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / interfaces

# Namespace: interfaces

## Table of contents

### Enumerations

- [AccountType](../enums/interfaces.AccountType.md)
- [BridgeState](../enums/interfaces.BridgeState.md)
- [FixedFeeType](../enums/interfaces.FixedFeeType.md)
- [ProtocolStatusEnum](../enums/interfaces.ProtocolStatusEnum.md)
- [WalletCheckEnum](../enums/interfaces.WalletCheckEnum.md)

### Interfaces

- [ActiveDiscountType](../interfaces/interfaces.ActiveDiscountType.md)
- [AnchorErrorType](../interfaces/interfaces.AnchorErrorType.md)
- [AutoParamsType](../interfaces/interfaces.AutoParamsType.md)
- [BridgeFeeInfoType](../interfaces/interfaces.BridgeFeeInfoType.md)
- [BridgeInfoType](../interfaces/interfaces.BridgeInfoType.md)
- [BridgeType](../interfaces/interfaces.BridgeType.md)
- [BridgedEventType](../interfaces/interfaces.BridgedEventType.md)
- [ChainSupportInfoType](../interfaces/interfaces.ChainSupportInfoType.md)
- [ConfirmationStorageType](../interfaces/interfaces.ConfirmationStorageType.md)
- [DiscountInfoType](../interfaces/interfaces.DiscountInfoType.md)
- [ExternalCallMetaType](../interfaces/interfaces.ExternalCallMetaType.md)
- [FeeInfoType](../interfaces/interfaces.FeeInfoType.md)
- [HashDeployInfoParams](../interfaces/interfaces.HashDeployInfoParams.md)
- [InitMintBridgeParamsType](../interfaces/interfaces.InitMintBridgeParamsType.md)
- [MintBridgeCreatedEventType](../interfaces/interfaces.MintBridgeCreatedEventType.md)
- [MintBridgeType](../interfaces/interfaces.MintBridgeType.md)
- [NotSupportedChainInfoType](../interfaces/interfaces.NotSupportedChainInfoType.md)
- [RawBridgeType](../interfaces/interfaces.RawBridgeType.md)
- [RentType](../interfaces/interfaces.RentType.md)
- [SendBridgeCreatedEventType](../interfaces/interfaces.SendBridgeCreatedEventType.md)
- [SendBridgeMap](../interfaces/interfaces.SendBridgeMap.md)
- [SendBridgeType](../interfaces/interfaces.SendBridgeType.md)
- [StateType](../interfaces/interfaces.StateType.md)
- [SubmissionIdParams](../interfaces/interfaces.SubmissionIdParams.md)
- [SubmissionInfoType](../interfaces/interfaces.SubmissionInfoType.md)
- [SubmissionStatusType](../interfaces/interfaces.SubmissionStatusType.md)
- [SupportedChainInfoType](../interfaces/interfaces.SupportedChainInfoType.md)
- [TransferredEventType](../interfaces/interfaces.TransferredEventType.md)
- [WalletInfo](../interfaces/interfaces.WalletInfo.md)
- [WalletsCheckConfig](../interfaces/interfaces.WalletsCheckConfig.md)

### Type Aliases

- [AmountType](interfaces.md#amounttype)
- [BridgeVariantType](interfaces.md#bridgevarianttype)
- [ChainIdType](interfaces.md#chainidtype)
- [ChainSupportInfoVariantType](interfaces.md#chainsupportinfovarianttype)
- [Concrete](interfaces.md#concrete)
- [DeepConcrete](interfaces.md#deepconcrete)
- [DiscountVariantType](interfaces.md#discountvarianttype)
- [ExternalCallMetaAccumulationType](interfaces.md#externalcallmetaaccumulationtype)
- [ExternalCallMetaExecutedType](interfaces.md#externalcallmetaexecutedtype)
- [ExternalCallMetaExecutionType](interfaces.md#externalcallmetaexecutiontype)
- [ExternalCallMetaVariant](interfaces.md#externalcallmetavariant)
- [HexString](interfaces.md#hexstring)
- [Optional](interfaces.md#optional)
- [SolanaPubkey](interfaces.md#solanapubkey)

### Functions

- [isActiveDiscount](interfaces.md#isactivediscount)
- [isExtCallMetaAccumulation](interfaces.md#isextcallmetaaccumulation)
- [isExtCallMetaExecuted](interfaces.md#isextcallmetaexecuted)
- [isExtCallMetaExecution](interfaces.md#isextcallmetaexecution)
- [isMintBridge](interfaces.md#ismintbridge)
- [isSendBridge](interfaces.md#issendbridge)
- [isSupportedChainInfoType](interfaces.md#issupportedchaininfotype)

## Type Aliases

### AmountType

Ƭ **AmountType**: `string` \| `number` \| `BN`

#### Defined in

[interfaces.ts:83](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L83)

___

### BridgeVariantType

Ƭ **BridgeVariantType**: [`SendBridgeType`](../interfaces/interfaces.SendBridgeType.md) \| [`MintBridgeType`](../interfaces/interfaces.MintBridgeType.md) \| { `empty`: `Record`<`string`, `never`\>  }

#### Defined in

[interfaces.ts:285](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L285)

___

### ChainIdType

Ƭ **ChainIdType**: `BN` \| `number` \| `Buffer` \| `string`

#### Defined in

[interfaces.ts:98](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L98)

___

### ChainSupportInfoVariantType

Ƭ **ChainSupportInfoVariantType**: [`SupportedChainInfoType`](../interfaces/interfaces.SupportedChainInfoType.md) \| [`NotSupportedChainInfoType`](../interfaces/interfaces.NotSupportedChainInfoType.md)

#### Defined in

[interfaces.ts:236](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L236)

___

### Concrete

Ƭ **Concrete**<`Type`\>: { [Property in keyof Type]-?: Type[Property] }

#### Type parameters

| Name |
| :------ |
| `Type` |

#### Defined in

[interfaces.ts:34](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L34)

___

### DeepConcrete

Ƭ **DeepConcrete**<`Type`\>: { [Property in keyof Type]-?: Type[Property] extends object ? DeepConcrete<Type[Property]\> : Type[Property] }

#### Type parameters

| Name |
| :------ |
| `Type` |

#### Defined in

[interfaces.ts:38](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L38)

___

### DiscountVariantType

Ƭ **DiscountVariantType**: [`ActiveDiscountType`](../interfaces/interfaces.ActiveDiscountType.md) \| { `unactive`: `Record`<`string`, `never`\>  }

#### Defined in

[interfaces.ts:311](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L311)

___

### ExternalCallMetaAccumulationType

Ƭ **ExternalCallMetaAccumulationType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accumulation` | { `externalCallLen`: `BN`  } |
| `accumulation.externalCallLen` | `BN` |

#### Defined in

[interfaces.ts:194](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L194)

___

### ExternalCallMetaExecutedType

Ƭ **ExternalCallMetaExecutedType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `executed` | `Record`<`string`, `never`\> |

#### Defined in

[interfaces.ts:200](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L200)

___

### ExternalCallMetaExecutionType

Ƭ **ExternalCallMetaExecutionType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `execution` | { `externalCallLen`: `BN` ; `isAuthInitialized`: `boolean` ; `offset`: `BN`  } |
| `execution.externalCallLen` | `BN` |
| `execution.isAuthInitialized` | `boolean` |
| `execution.offset` | `BN` |

#### Defined in

[interfaces.ts:186](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L186)

___

### ExternalCallMetaVariant

Ƭ **ExternalCallMetaVariant**: [`ExternalCallMetaExecutionType`](interfaces.md#externalcallmetaexecutiontype) \| [`ExternalCallMetaAccumulationType`](interfaces.md#externalcallmetaaccumulationtype) \| [`ExternalCallMetaExecutedType`](interfaces.md#externalcallmetaexecutedtype)

#### Defined in

[interfaces.ts:204](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L204)

___

### HexString

Ƭ **HexString**: `string`

hex-encoded string with `0x` prefix

#### Defined in

[interfaces.ts:81](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L81)

___

### Optional

Ƭ **Optional**<`Type`\>: { [Property in keyof Type]?: Type[Property] }

#### Type parameters

| Name |
| :------ |
| `Type` |

#### Defined in

[interfaces.ts:42](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L42)

___

### SolanaPubkey

Ƭ **SolanaPubkey**: `PublicKey` \| `string`

base58-encoded string or @solana/web3.PublicKey instance

#### Defined in

[interfaces.ts:76](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L76)

## Functions

### isActiveDiscount

▸ **isActiveDiscount**(`arg`): arg is DiscountVariantType

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`DiscountVariantType`](interfaces.md#discountvarianttype) |

#### Returns

arg is DiscountVariantType

#### Defined in

[interfaces.ts:307](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L307)

___

### isExtCallMetaAccumulation

▸ **isExtCallMetaAccumulation**(`arg`): arg is ExternalCallMetaAccumulationType

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`ExternalCallMetaVariant`](interfaces.md#externalcallmetavariant) |

#### Returns

arg is ExternalCallMetaAccumulationType

#### Defined in

[interfaces.ts:206](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L206)

___

### isExtCallMetaExecuted

▸ **isExtCallMetaExecuted**(`arg`): arg is ExternalCallMetaExecutedType

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`ExternalCallMetaVariant`](interfaces.md#externalcallmetavariant) |

#### Returns

arg is ExternalCallMetaExecutedType

#### Defined in

[interfaces.ts:214](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L214)

___

### isExtCallMetaExecution

▸ **isExtCallMetaExecution**(`arg`): arg is ExternalCallMetaExecutionType

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`ExternalCallMetaVariant`](interfaces.md#externalcallmetavariant) |

#### Returns

arg is ExternalCallMetaExecutionType

#### Defined in

[interfaces.ts:210](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L210)

___

### isMintBridge

▸ **isMintBridge**(`arg`): arg is MintBridgeType

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`BridgeVariantType`](interfaces.md#bridgevarianttype) |

#### Returns

arg is MintBridgeType

#### Defined in

[interfaces.ts:281](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L281)

___

### isSendBridge

▸ **isSendBridge**(`arg`): arg is SendBridgeType

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`BridgeVariantType`](interfaces.md#bridgevarianttype) |

#### Returns

arg is SendBridgeType

#### Defined in

[interfaces.ts:266](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L266)

___

### isSupportedChainInfoType

▸ **isSupportedChainInfoType**(`arg`): arg is SupportedChainInfoType

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | [`ChainSupportInfoVariantType`](interfaces.md#chainsupportinfovarianttype) |

#### Returns

arg is SupportedChainInfoType

#### Defined in

[interfaces.ts:228](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L228)
