[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / [interfaces](../modules/interfaces.md) / AutoParamsType

# Interface: AutoParamsType

[interfaces](../modules/interfaces.md).AutoParamsType

## Table of contents

### Properties

- [data](interfaces.AutoParamsType.md#data)
- [executionFee](interfaces.AutoParamsType.md#executionfee)
- [fallbackAddress](interfaces.AutoParamsType.md#fallbackaddress)
- [flags](interfaces.AutoParamsType.md#flags)
- [nativeSender](interfaces.AutoParamsType.md#nativesender)
- [shortcut](interfaces.AutoParamsType.md#shortcut)

## Properties

### data

• `Optional` **data**: `string` \| `Buffer`

external call data, buffer or hex-encoded string

#### Defined in

[interfaces.ts:129](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L129)

___

### executionFee

• **executionFee**: [`AmountType`](../modules/interfaces.md#amounttype)

#### Defined in

[interfaces.ts:120](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L120)

___

### fallbackAddress

• **fallbackAddress**: `string`

if 0x prefix exists - hex-encoded string, else Base58-encoded pubkey

#### Defined in

[interfaces.ts:125](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L125)

___

### flags

• `Optional` **flags**: `string` \| `number` \| `Buffer`

#### Defined in

[interfaces.ts:121](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L121)

___

### nativeSender

• **nativeSender**: `string`

hex-encoded sender

#### Defined in

[interfaces.ts:134](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L134)

___

### shortcut

• `Optional` **shortcut**: `string` \| `Buffer`

#### Defined in

[interfaces.ts:130](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L130)
