[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / [interfaces](../modules/interfaces.md) / TransferredEventType

# Interface: TransferredEventType

[interfaces](../modules/interfaces.md).TransferredEventType

## Table of contents

### Properties

- [amount](interfaces.TransferredEventType.md#amount)
- [bridgeId](interfaces.TransferredEventType.md#bridgeid)
- [collectedFee](interfaces.TransferredEventType.md#collectedfee)
- [collectedTransferFee](interfaces.TransferredEventType.md#collectedtransferfee)
- [denominator](interfaces.TransferredEventType.md#denominator)
- [executionFee](interfaces.TransferredEventType.md#executionfee)
- [feeType](interfaces.TransferredEventType.md#feetype)
- [nativeSender](interfaces.TransferredEventType.md#nativesender)
- [nonce](interfaces.TransferredEventType.md#nonce)
- [receiver](interfaces.TransferredEventType.md#receiver)
- [referralCode](interfaces.TransferredEventType.md#referralcode)
- [sendType](interfaces.TransferredEventType.md#sendtype)
- [submissionId](interfaces.TransferredEventType.md#submissionid)
- [submissionParams](interfaces.TransferredEventType.md#submissionparams)
- [targetChainId](interfaces.TransferredEventType.md#targetchainid)

## Properties

### amount

• **amount**: `BN`

#### Defined in

[interfaces.ts:345](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L345)

___

### bridgeId

• **bridgeId**: `number`[]

#### Defined in

[interfaces.ts:344](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L344)

___

### collectedFee

• **collectedFee**: `BN`

#### Defined in

[interfaces.ts:350](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L350)

___

### collectedTransferFee

• **collectedTransferFee**: `BN`

#### Defined in

[interfaces.ts:351](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L351)

___

### denominator

• **denominator**: `number`

#### Defined in

[interfaces.ts:359](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L359)

___

### executionFee

• `Optional` **executionFee**: `BN`

#### Defined in

[interfaces.ts:358](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L358)

___

### feeType

• **feeType**: { `native`: `Record`<`string`, `never`\>  } \| { `asset`: `Record`<`string`, `never`\>  }

#### Defined in

[interfaces.ts:349](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L349)

___

### nativeSender

• **nativeSender**: `PublicKey`

#### Defined in

[interfaces.ts:352](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L352)

___

### nonce

• **nonce**: `number`[]

#### Defined in

[interfaces.ts:347](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L347)

___

### receiver

• **receiver**: `Buffer`

#### Defined in

[interfaces.ts:346](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L346)

___

### referralCode

• `Optional` **referralCode**: `number`

#### Defined in

[interfaces.ts:360](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L360)

___

### sendType

• **sendType**: { `staked`: `Record`<`string`, `never`\>  } \| { `burnt`: `Record`<`string`, `never`\>  }

#### Defined in

[interfaces.ts:342](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L342)

___

### submissionId

• **submissionId**: `number`[]

#### Defined in

[interfaces.ts:343](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L343)

___

### submissionParams

• **submissionParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `externalCallStorageShortcut` | `number`[] |
| `fallbackAddress` | `Buffer` |
| `reservedFlag` | `number`[] |

#### Defined in

[interfaces.ts:353](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L353)

___

### targetChainId

• **targetChainId**: `number`[]

#### Defined in

[interfaces.ts:348](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L348)
