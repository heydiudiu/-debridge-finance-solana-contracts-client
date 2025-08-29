[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / [errors](../modules/errors.md) / AssociatedWalletNotInitialized

# Class: AssociatedWalletNotInitialized

[errors](../modules/errors.md).AssociatedWalletNotInitialized

## Hierarchy

- [`AccountNotInitialized`](errors.AccountNotInitialized.md)

  ↳ **`AssociatedWalletNotInitialized`**

## Table of contents

### Constructors

- [constructor](errors.AssociatedWalletNotInitialized.md#constructor)

### Properties

- [associatedWallet](errors.AssociatedWalletNotInitialized.md#associatedwallet)
- [publicKey](errors.AssociatedWalletNotInitialized.md#publickey)

### Methods

- [toString](errors.AssociatedWalletNotInitialized.md#tostring)

## Constructors

### constructor

• **new AssociatedWalletNotInitialized**(`pk`, `associatedWallet`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `pk` | `PublicKey` |
| `associatedWallet` | `PublicKey` |

#### Overrides

[AccountNotInitialized](errors.AccountNotInitialized.md).[constructor](errors.AccountNotInitialized.md#constructor)

#### Defined in

[errors.ts:60](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L60)

## Properties

### associatedWallet

• `Readonly` **associatedWallet**: `PublicKey`

#### Defined in

[errors.ts:58](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L58)

___

### publicKey

• `Readonly` **publicKey**: `PublicKey`

#### Inherited from

[AccountNotInitialized](errors.AccountNotInitialized.md).[publicKey](errors.AccountNotInitialized.md#publickey)

#### Defined in

[errors.ts:17](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L17)

## Methods

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AccountNotInitialized](errors.AccountNotInitialized.md).[toString](errors.AccountNotInitialized.md#tostring)

#### Defined in

[errors.ts:26](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L26)
