[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / accounts

# Namespace: accounts

## Table of contents

### Variables

- [getBridgeAccount](accounts.md#getbridgeaccount)
- [getBridgeFeeAccount](accounts.md#getbridgefeeaccount)
- [getChainSupportInfoAccount](accounts.md#getchainsupportinfoaccount)
- [getTokenMintAccount](accounts.md#gettokenmintaccount)

### Functions

- [findAssociatedTokenAddress](accounts.md#findassociatedtokenaddress)
- [getBridgeMapAddress](accounts.md#getbridgemapaddress)
- [getClaimMarkerAddress](accounts.md#getclaimmarkeraddress)
- [getDiscountInfoAccount](accounts.md#getdiscountinfoaccount)
- [getExternalCallMetaAccount](accounts.md#getexternalcallmetaaccount)
- [getExternalCallStorageAccount](accounts.md#getexternalcallstorageaccount)
- [getMintAuthorityAccount](accounts.md#getmintauthorityaccount)
- [getNoBridgeFeeAccount](accounts.md#getnobridgefeeaccount)
- [getNoDiscountAccount](accounts.md#getnodiscountaccount)
- [getNonceAccount](accounts.md#getnonceaccount)
- [getSignaturesStorageAccount](accounts.md#getsignaturesstorageaccount)
- [getStateAccount](accounts.md#getstateaccount)
- [getSubmissionAddressAccount](accounts.md#getsubmissionaddressaccount)
- [getSubmissionAuthAccount](accounts.md#getsubmissionauthaccount)
- [getTokenMetadataAddress](accounts.md#gettokenmetadataaddress)
- [getTokenMetadataMasterAddress](accounts.md#gettokenmetadatamasteraddress)

## Variables

### getBridgeAccount

• `Const` **getBridgeAccount**: `Memoized`<(`tokenMint`: `PublicKey`) => [`PublicKey`, `number`]\>

#### Defined in

[addresses.ts:96](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L96)

___

### getBridgeFeeAccount

• `Const` **getBridgeFeeAccount**: `Memoized`<(`bridge`: `PublicKey`, `chainIdArray`: `Buffer`) => [`PublicKey`, `number`]\>

#### Defined in

[addresses.ts:113](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L113)

___

### getChainSupportInfoAccount

• `Const` **getChainSupportInfoAccount**: `Memoized`<(`chainIdArray`: `Buffer`) => [`PublicKey`, `number`]\>

#### Defined in

[addresses.ts:105](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L105)

___

### getTokenMintAccount

• `Const` **getTokenMintAccount**: `Memoized`<(`debridgeId`: `Buffer`) => [`PublicKey`, `number`]\>

#### Defined in

[addresses.ts:129](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L129)

## Functions

### findAssociatedTokenAddress

▸ **findAssociatedTokenAddress**(`wallet`, `tokenMint`): [`PublicKey`, `number`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `wallet` | `PublicKey` |
| `tokenMint` | `PublicKey` |

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:45](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L45)

___

### getBridgeMapAddress

▸ **getBridgeMapAddress**(`bridgeId`): [`PublicKey`, `number`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `bridgeId` | `Buffer` |

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:84](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L84)

___

### getClaimMarkerAddress

▸ **getClaimMarkerAddress**(): [`PublicKey`, `number`]

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:41](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L41)

___

### getDiscountInfoAccount

▸ **getDiscountInfoAccount**(`user`): [`PublicKey`, `number`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `user` | `PublicKey` |

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:101](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L101)

___

### getExternalCallMetaAccount

▸ **getExternalCallMetaAccount**(`externalCallStorage`): [`PublicKey`, `number`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `externalCallStorage` | `PublicKey` |

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:67](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L67)

___

### getExternalCallStorageAccount

▸ **getExternalCallStorageAccount**(`submissionId`, `executorPubkey`, `sourceChainId`): [`PublicKey`, `number`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `submissionId` | `Buffer` |
| `executorPubkey` | `PublicKey` |
| `sourceChainId` | `Buffer` |

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:60](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L60)

___

### getMintAuthorityAccount

▸ **getMintAuthorityAccount**(`bridge`): [`PublicKey`, `number`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `bridge` | `PublicKey` |

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:52](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L52)

___

### getNoBridgeFeeAccount

▸ **getNoBridgeFeeAccount**(): [`PublicKey`, `number`]

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:92](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L92)

___

### getNoDiscountAccount

▸ **getNoDiscountAccount**(): [`PublicKey`, `number`]

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:88](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L88)

___

### getNonceAccount

▸ **getNonceAccount**(): [`PublicKey`, `number`]

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:56](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L56)

___

### getSignaturesStorageAccount

▸ **getSignaturesStorageAccount**(`message`): [`PublicKey`, `number`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `Buffer` |

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:121](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L121)

___

### getStateAccount

▸ **getStateAccount**(): [`PublicKey`, `number`]

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:125](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L125)

___

### getSubmissionAddressAccount

▸ **getSubmissionAddressAccount**(`submissionId`): [`PublicKey`, `number`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `submissionId` | `Buffer` |

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:74](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L74)

___

### getSubmissionAuthAccount

▸ **getSubmissionAuthAccount**(`submissionAddress`): [`PublicKey`, `number`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `submissionAddress` | `PublicKey` |

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:78](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L78)

___

### getTokenMetadataAddress

▸ **getTokenMetadataAddress**(`tokenMint`): [`PublicKey`, `number`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `tokenMint` | `PublicKey` |

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:30](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L30)

___

### getTokenMetadataMasterAddress

▸ **getTokenMetadataMasterAddress**(): [`PublicKey`, `number`]

#### Returns

[`PublicKey`, `number`]

#### Defined in

[addresses.ts:37](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/addresses.ts#L37)
