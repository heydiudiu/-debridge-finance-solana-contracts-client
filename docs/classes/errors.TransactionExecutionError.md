[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / [errors](../modules/errors.md) / TransactionExecutionError

# Class: TransactionExecutionError

[errors](../modules/errors.md).TransactionExecutionError

## Hierarchy

- `Error`

  ↳ **`TransactionExecutionError`**

## Table of contents

### Constructors

- [constructor](errors.TransactionExecutionError.md#constructor)

### Properties

- [customErrors](errors.TransactionExecutionError.md#customerrors)
- [programLogs](errors.TransactionExecutionError.md#programlogs)

## Constructors

### constructor

• **new TransactionExecutionError**(`logs`, `idlErrors`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `logs` | `string`[] |
| `idlErrors` | [`IDLError`](../interfaces/errors.IDLError.md)[] |

#### Overrides

Error.constructor

#### Defined in

[errors.ts:112](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L112)

## Properties

### customErrors

• `Readonly` **customErrors**: [`IDLError`](../interfaces/errors.IDLError.md)[]

#### Defined in

[errors.ts:110](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L110)

___

### programLogs

• `Readonly` **programLogs**: `string`[]

#### Defined in

[errors.ts:108](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/errors.ts#L108)
