[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / [errors](../modules/errors.md) / AccountNotInitialized

# Class: AccountNotInitialized

[errors](../modules/errors.md).AccountNotInitialized

## Hierarchy

- [`AccountError`](errors.AccountError.md)

  ↳ **`AccountNotInitialized`**

  ↳↳ [`BridgeStateNotExists`](errors.BridgeStateNotExists.md)

  ↳↳ [`ChainSupportInfoNotInitialized`](errors.ChainSupportInfoNotInitialized.md)

  ↳↳ [`BridgeFeeNotInitialized`](errors.BridgeFeeNotInitialized.md)

  ↳↳ [`AssociatedWalletNotInitialized`](errors.AssociatedWalletNotInitialized.md)

## Table of contents

### Constructors

- [constructor](errors.AccountNotInitialized.md#constructor)

### Properties

- [publicKey](errors.AccountNotInitialized.md#publickey)

### Methods

- [toString](errors.AccountNotInitialized.md#tostring)

## Constructors

### constructor

• **new AccountNotInitialized**(`publicKey`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `publicKey` | `PublicKey` |

#### Inherited from

[AccountError](errors.AccountError.md).[constructor](errors.AccountError.md#constructor)

#### Defined in

[errors.ts:19](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L19)

## Properties

### publicKey

• `Readonly` **publicKey**: `PublicKey`

#### Inherited from

[AccountError](errors.AccountError.md).[publicKey](errors.AccountError.md#publickey)

#### Defined in

[errors.ts:17](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L17)

## Methods

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[errors.ts:26](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L26)
