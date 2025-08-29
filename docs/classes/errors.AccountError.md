[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / [errors](../modules/errors.md) / AccountError

# Class: AccountError

[errors](../modules/errors.md).AccountError

## Hierarchy

- `Error`

  ↳ **`AccountError`**

  ↳↳ [`AccountNotInitialized`](errors.AccountNotInitialized.md)

  ↳↳ [`BridgeStateMalformed`](errors.BridgeStateMalformed.md)

  ↳↳ [`ChainSupportInfoNotSupported`](errors.ChainSupportInfoNotSupported.md)

  ↳↳ [`AssetFeeNotSupported`](errors.AssetFeeNotSupported.md)

  ↳↳ [`BridgeFeeMalformed`](errors.BridgeFeeMalformed.md)

  ↳↳ [`ChainSupportInfoMalformed`](errors.ChainSupportInfoMalformed.md)

  ↳↳ [`DiscountInfoMalformed`](errors.DiscountInfoMalformed.md)

  ↳↳ [`ConfirmationStorageMalformed`](errors.ConfirmationStorageMalformed.md)

  ↳↳ [`DiscountNotActive`](errors.DiscountNotActive.md)

  ↳↳ [`SubmissionInfoNotExists`](errors.SubmissionInfoNotExists.md)

  ↳↳ [`ExternalCallMetaNotExists`](errors.ExternalCallMetaNotExists.md)

  ↳↳ [`BridgePaused`](errors.BridgePaused.md)

  ↳↳ [`BridgeNotExists`](errors.BridgeNotExists.md)

  ↳↳ [`BridgeMalformed`](errors.BridgeMalformed.md)

## Table of contents

### Constructors

- [constructor](errors.AccountError.md#constructor)

### Properties

- [publicKey](errors.AccountError.md#publickey)

## Constructors

### constructor

• **new AccountError**(`publicKey`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `publicKey` | `PublicKey` |

#### Overrides

Error.constructor

#### Defined in

[errors.ts:19](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L19)

## Properties

### publicKey

• `Readonly` **publicKey**: `PublicKey`

#### Defined in

[errors.ts:17](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L17)
