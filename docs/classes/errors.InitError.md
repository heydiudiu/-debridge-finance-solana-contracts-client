[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / [errors](../modules/errors.md) / InitError

# Class: InitError

[errors](../modules/errors.md).InitError

## Hierarchy

- `Error`

  ↳ **`InitError`**

## Table of contents

### Constructors

- [constructor](errors.InitError.md#constructor)

### Properties

- [baseError](errors.InitError.md#baseerror)
- [idlPath](errors.InitError.md#idlpath)

## Constructors

### constructor

• **new InitError**(`idlPath`, `baseError`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `idlPath` | `string` |
| `baseError` | `Error` |

#### Overrides

Error.constructor

#### Defined in

[errors.ts:9](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L9)

## Properties

### baseError

• `Readonly` **baseError**: `Error`

#### Defined in

[errors.ts:7](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L7)

___

### idlPath

• `Readonly` **idlPath**: `string`

#### Defined in

[errors.ts:5](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L5)
