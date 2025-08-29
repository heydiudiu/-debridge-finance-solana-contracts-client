[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / [errors](../modules/errors.md) / InsufficientFunds

# Class: InsufficientFunds

[errors](../modules/errors.md).InsufficientFunds

## Hierarchy

- `Error`

  ↳ **`InsufficientFunds`**

## Table of contents

### Constructors

- [constructor](errors.InsufficientFunds.md#constructor)

### Properties

- [account](errors.InsufficientFunds.md#account)
- [currentBalance](errors.InsufficientFunds.md#currentbalance)
- [neededAmount](errors.InsufficientFunds.md#neededamount)

## Constructors

### constructor

• **new InsufficientFunds**(`account`, `needed`, `currentBalance`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `PublicKey` |
| `needed` | `number` \| `BN` |
| `currentBalance` | `number` \| `BN` |

#### Overrides

Error.constructor

#### Defined in

[errors.ts:73](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L73)

## Properties

### account

• `Readonly` **account**: `PublicKey`

#### Defined in

[errors.ts:67](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L67)

___

### currentBalance

• `Readonly` **currentBalance**: `BN`

#### Defined in

[errors.ts:71](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L71)

___

### neededAmount

• `Readonly` **neededAmount**: `BN`

#### Defined in

[errors.ts:69](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L69)
