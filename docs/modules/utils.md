[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / utils

# Namespace: utils

## Table of contents

### Functions

- [bufferToHex](utils.md#buffertohex)
- [convertToNumberArrayBuffer](utils.md#converttonumberarraybuffer)
- [denormalize](utils.md#denormalize)
- [hexToBuffer](utils.md#hextobuffer)
- [normalize](utils.md#normalize)
- [preHashMessage](utils.md#prehashmessage)
- [sleep](utils.md#sleep)

## Functions

### bufferToHex

▸ **bufferToHex**(`data`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Buffer` |

#### Returns

`string`

#### Defined in

[utils.ts:24](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/utils.ts#L24)

___

### convertToNumberArrayBuffer

▸ **convertToNumberArrayBuffer**(`stringNumber`, `alignWithZeroesTo?`): `Buffer`

#### Parameters

| Name | Type |
| :------ | :------ |
| `stringNumber` | `string` |
| `alignWithZeroesTo?` | `number` |

#### Returns

`Buffer`

#### Defined in

[utils.ts:35](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/utils.ts#L35)

___

### denormalize

▸ **denormalize**(`amount`, `denominator`): `Buffer`

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `BN` |
| `denominator` | `number` |

#### Returns

`Buffer`

#### Defined in

[utils.ts:5](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/utils.ts#L5)

___

### hexToBuffer

▸ **hexToBuffer**(`data`): `Buffer`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `string` |

#### Returns

`Buffer`

#### Defined in

[utils.ts:18](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/utils.ts#L18)

___

### normalize

▸ **normalize**(`amount`, `nominator`): `BN`

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `Buffer` |
| `nominator` | `number` |

#### Returns

`BN`

#### Defined in

[utils.ts:11](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/utils.ts#L11)

___

### preHashMessage

▸ **preHashMessage**(`data`): `Buffer`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Buffer` |

#### Returns

`Buffer`

#### Defined in

[utils.ts:28](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/utils.ts#L28)

___

### sleep

▸ **sleep**(`milliSeconds`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `milliSeconds` | `number` |

#### Returns

`Promise`<`void`\>

#### Defined in

[utils.ts:49](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/utils.ts#L49)
