[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / [instructions](../modules/instructions.md) / SendParamsType

# Interface: SendParamsType

[instructions](../modules/instructions.md).SendParamsType

## Table of contents

### Properties

- [amount](instructions.SendParamsType.md#amount)
- [chainIdBuffer](instructions.SendParamsType.md#chainidbuffer)
- [receiver](instructions.SendParamsType.md#receiver)
- [referralCode](instructions.SendParamsType.md#referralcode)
- [submissionParams](instructions.SendParamsType.md#submissionparams)
- [useAssetFee](instructions.SendParamsType.md#useassetfee)

## Properties

### amount

• **amount**: `BN`

#### Defined in

[instructions.ts:206](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L206)

___

### chainIdBuffer

• **chainIdBuffer**: `Buffer`

#### Defined in

[instructions.ts:205](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L205)

___

### receiver

• **receiver**: `Buffer`

#### Defined in

[instructions.ts:207](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L207)

___

### referralCode

• `Optional` **referralCode**: `BN`

#### Defined in

[instructions.ts:209](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L209)

___

### submissionParams

• `Optional` **submissionParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `executionFee` | `BN` |
| `externalCallShortcut` | `Buffer` |
| `fallbackAddress` | `Buffer` |
| `reservedFlag` | `Buffer` |

#### Defined in

[instructions.ts:210](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L210)

___

### useAssetFee

• **useAssetFee**: `boolean`

#### Defined in

[instructions.ts:208](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/instructions.ts#L208)
