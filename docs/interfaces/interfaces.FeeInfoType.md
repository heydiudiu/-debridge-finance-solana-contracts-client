[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / [interfaces](../modules/interfaces.md) / FeeInfoType

# Interface: FeeInfoType

[interfaces](../modules/interfaces.md).FeeInfoType

## Table of contents

### Properties

- [discount](interfaces.FeeInfoType.md#discount)
- [finalAmount](interfaces.FeeInfoType.md#finalamount)
- [fixed](interfaces.FeeInfoType.md#fixed)
- [transfer](interfaces.FeeInfoType.md#transfer)

## Properties

### discount

• **discount**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fixBps` | `number` |
| `transferBps` | `number` |

#### Defined in

[interfaces.ts:91](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L91)

___

### finalAmount

• **finalAmount**: `BN`

#### Defined in

[interfaces.ts:95](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L95)

___

### fixed

• **fixed**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `amount` | `BN` |
| `type` | [`FixedFeeType`](../enums/interfaces.FixedFeeType.md) |

#### Defined in

[interfaces.ts:86](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L86)

___

### transfer

• **transfer**: `BN`

#### Defined in

[interfaces.ts:90](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L90)
