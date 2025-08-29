[@debridge-finance/solana-client](README.md) / Exports

# @debridge-finance/solana-client

## Table of contents

### Namespaces

- [accounts](modules/accounts.md)
- [constants](modules/constants.md)
- [errors](modules/errors.md)
- [instructions](modules/instructions.md)
- [interfaces](modules/interfaces.md)
- [utils](modules/utils.md)

### Classes

- [DeBridgeSolanaClient](classes/DeBridgeSolanaClient.md)

### Variables

- [CONFIG](modules.md#config)

### Functions

- [packSignatures](modules.md#packsignatures)

## Variables

### CONFIG

• `Const` **CONFIG**: `Config`

#### Defined in

[config.ts:55](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/config.ts#L55)

## Functions

### packSignatures

▸ **packSignatures**(`message`, `signatures`): `Buffer`

Packs signatures and signed data into solana secp instruction data

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `Buffer` | signed data |
| `signatures` | `Buffer`[] | array of signatures |

#### Returns

`Buffer`

secp instruction data

#### Defined in

[generateSignatures.ts:127](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/generateSignatures.ts#L127)
