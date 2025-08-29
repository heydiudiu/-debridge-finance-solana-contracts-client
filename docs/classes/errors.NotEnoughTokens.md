[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / [errors](../modules/errors.md) / NotEnoughTokens

# Class: NotEnoughTokens

[errors](../modules/errors.md).NotEnoughTokens

## Hierarchy

- `Error`

  ↳ **`NotEnoughTokens`**

## Table of contents

### Constructors

- [constructor](errors.NotEnoughTokens.md#constructor)

### Properties

- [associatedWallet](errors.NotEnoughTokens.md#associatedwallet)
- [currentAmount](errors.NotEnoughTokens.md#currentamount)
- [neededAmount](errors.NotEnoughTokens.md#neededamount)

## Constructors

### constructor

• **new NotEnoughTokens**(`wallet`, `current`, `needed`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `wallet` | `PublicKey` |
| `current` | `number` \| `BN` |
| `needed` | `number` \| `BN` |

#### Overrides

Error.constructor

#### Defined in

[errors.ts:126](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L126)

## Properties

### associatedWallet

• `Readonly` **associatedWallet**: `PublicKey`

#### Defined in

[errors.ts:120](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L120)

___

### currentAmount

• `Readonly` **currentAmount**: `BN`

#### Defined in

[errors.ts:122](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L122)

___

### neededAmount

• `Readonly` **neededAmount**: `BN`

#### Defined in

[errors.ts:124](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L124)
