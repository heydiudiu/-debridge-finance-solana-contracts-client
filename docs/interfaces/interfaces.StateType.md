[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / [interfaces](../modules/interfaces.md) / StateType

# Interface: StateType

[interfaces](../modules/interfaces.md).StateType

## Table of contents

### Properties

- [confirmationGuard](interfaces.StateType.md#confirmationguard)
- [feeBeneficiary](interfaces.StateType.md#feebeneficiary)
- [globalFixedFee](interfaces.StateType.md#globalfixedfee)
- [globalTransferFeeBps](interfaces.StateType.md#globaltransferfeebps)
- [oracles](interfaces.StateType.md#oracles)
- [protocolAuthority](interfaces.StateType.md#protocolauthority)
- [requiredOracles](interfaces.StateType.md#requiredoracles)
- [status](interfaces.StateType.md#status)
- [stopTap](interfaces.StateType.md#stoptap)

## Properties

### confirmationGuard

• **confirmationGuard**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `confirmationThreshold` | `number` |
| `currentTimeslot?` | `BN` |
| `excessConfirmationTimeslot` | `BN` |
| `excessConfirmations` | `number` |
| `minConfirmations` | `number` |
| `submissionInTimeslotCount` | `number` |

#### Defined in

[interfaces.ts:174](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L174)

___

### feeBeneficiary

• **feeBeneficiary**: `PublicKey`

#### Defined in

[interfaces.ts:171](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L171)

___

### globalFixedFee

• **globalFixedFee**: `BN`

#### Defined in

[interfaces.ts:182](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L182)

___

### globalTransferFeeBps

• **globalTransferFeeBps**: `BN`

#### Defined in

[interfaces.ts:183](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L183)

___

### oracles

• **oracles**: `number`[][]

#### Defined in

[interfaces.ts:172](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L172)

___

### protocolAuthority

• **protocolAuthority**: `PublicKey`

#### Defined in

[interfaces.ts:169](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L169)

___

### requiredOracles

• **requiredOracles**: `number`[][]

#### Defined in

[interfaces.ts:173](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L173)

___

### status

• **status**: [`ProtocolStatusEnum`](../enums/interfaces.ProtocolStatusEnum.md)

#### Defined in

[interfaces.ts:168](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L168)

___

### stopTap

• **stopTap**: `PublicKey`

#### Defined in

[interfaces.ts:170](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/interfaces.ts#L170)
