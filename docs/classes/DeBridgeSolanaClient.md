[@debridge-finance/solana-client](../README.md) / [Exports](../modules.md) / DeBridgeSolanaClient

# Class: DeBridgeSolanaClient

## Table of contents

### Constructors

- [constructor](DeBridgeSolanaClient.md#constructor)

### Properties

- [statePublicKey](DeBridgeSolanaClient.md#statepublickey)

### Accessors

- [idlErrors](DeBridgeSolanaClient.md#idlerrors)
- [program](DeBridgeSolanaClient.md#program)
- [provider](DeBridgeSolanaClient.md#provider)
- [settingsProgram](DeBridgeSolanaClient.md#settingsprogram)
- [wallet](DeBridgeSolanaClient.md#wallet)

### Methods

- [buildClaimTransaction](DeBridgeSolanaClient.md#buildclaimtransaction)
- [buildExecuteExternalCallTransaction](DeBridgeSolanaClient.md#buildexecuteexternalcalltransaction)
- [buildExtendExternalCallStorageInstruction](DeBridgeSolanaClient.md#buildextendexternalcallstorageinstruction)
- [buildFallbackTransactions](DeBridgeSolanaClient.md#buildfallbacktransactions)
- [buildInitExternalCallInstruction](DeBridgeSolanaClient.md#buildinitexternalcallinstruction)
- [buildInitializeMintBridgeTransaction](DeBridgeSolanaClient.md#buildinitializemintbridgetransaction)
- [buildInitializeSendBridgeTransaction](DeBridgeSolanaClient.md#buildinitializesendbridgetransaction)
- [buildOptimalExecuteExternalCallTransaction](DeBridgeSolanaClient.md#buildoptimalexecuteexternalcalltransaction)
- [buildSendInstruction](DeBridgeSolanaClient.md#buildsendinstruction)
- [buildStoreSignaturesTransaction](DeBridgeSolanaClient.md#buildstoresignaturestransaction)
- [buildUpdateFeeBridgeInfoTransaction](DeBridgeSolanaClient.md#buildupdatefeebridgeinfotransaction)
- [calculateExecutionFee](DeBridgeSolanaClient.md#calculateexecutionfee)
- [calculateFee](DeBridgeSolanaClient.md#calculatefee)
- [checkClaimParams](DeBridgeSolanaClient.md#checkclaimparams)
- [checkIfAccountExists](DeBridgeSolanaClient.md#checkifaccountexists)
- [checkIfAssociatedWalletExists](DeBridgeSolanaClient.md#checkifassociatedwalletexists)
- [createAssociatedWalletInstruction](DeBridgeSolanaClient.md#createassociatedwalletinstruction)
- [getAccountWithType](DeBridgeSolanaClient.md#getaccountwithtype)
- [getAllWalletsWithBalances](DeBridgeSolanaClient.md#getallwalletswithbalances)
- [getAssocSPLWalletBalance](DeBridgeSolanaClient.md#getassocsplwalletbalance)
- [getBridgeBalance](DeBridgeSolanaClient.md#getbridgebalance)
- [getBridgeByDeBridgeId](DeBridgeSolanaClient.md#getbridgebydebridgeid)
- [getBridgeFeeSafe](DeBridgeSolanaClient.md#getbridgefeesafe)
- [getBridgeInfoSafe](DeBridgeSolanaClient.md#getbridgeinfosafe)
- [getChainSupportInfoSafe](DeBridgeSolanaClient.md#getchainsupportinfosafe)
- [getClaimTokenMint](DeBridgeSolanaClient.md#getclaimtokenmint)
- [getConfirmationStorageSafe](DeBridgeSolanaClient.md#getconfirmationstoragesafe)
- [getConfirmationsCount](DeBridgeSolanaClient.md#getconfirmationscount)
- [getDiscountInfoSafe](DeBridgeSolanaClient.md#getdiscountinfosafe)
- [getExternalCallMetaSafe](DeBridgeSolanaClient.md#getexternalcallmetasafe)
- [getNativeWalletBalance](DeBridgeSolanaClient.md#getnativewalletbalance)
- [getRent](DeBridgeSolanaClient.md#getrent)
- [getSPLWalletBalance](DeBridgeSolanaClient.md#getsplwalletbalance)
- [getStateSafe](DeBridgeSolanaClient.md#getstatesafe)
- [getSubmissionInfoSafe](DeBridgeSolanaClient.md#getsubmissioninfosafe)
- [getSubmissionStatus](DeBridgeSolanaClient.md#getsubmissionstatus)
- [getWrappedSolAccountsWithBalance](DeBridgeSolanaClient.md#getwrappedsolaccountswithbalance)
- [hashSubmissionId](DeBridgeSolanaClient.md#hashsubmissionid)
- [init](DeBridgeSolanaClient.md#init)
- [initializeMintBridge](DeBridgeSolanaClient.md#initializemintbridge)
- [isBridgeBalanceOk](DeBridgeSolanaClient.md#isbridgebalanceok)
- [isBridgeFeeInfoInitialized](DeBridgeSolanaClient.md#isbridgefeeinfoinitialized)
- [isBridgeInitialized](DeBridgeSolanaClient.md#isbridgeinitialized)
- [isEnoughSignaturesStored](DeBridgeSolanaClient.md#isenoughsignaturesstored)
- [isExtCallExecuted](DeBridgeSolanaClient.md#isextcallexecuted)
- [isExtCallStorageCorrect](DeBridgeSolanaClient.md#isextcallstoragecorrect)
- [isInitialized](DeBridgeSolanaClient.md#isinitialized)
- [isSubmissionUsed](DeBridgeSolanaClient.md#issubmissionused)
- [isTransactionClaimed](DeBridgeSolanaClient.md#istransactionclaimed)
- [onBridged](DeBridgeSolanaClient.md#onbridged)
- [onTransferred](DeBridgeSolanaClient.md#ontransferred)
- [prepareExtCallTransactions](DeBridgeSolanaClient.md#prepareextcalltransactions)
- [prepareOnClaimPromise](DeBridgeSolanaClient.md#prepareonclaimpromise)
- [prepareOnSendPromise](DeBridgeSolanaClient.md#prepareonsendpromise)
- [removeOnEvent](DeBridgeSolanaClient.md#removeonevent)
- [sendTx](DeBridgeSolanaClient.md#sendtx)
- [updateConnection](DeBridgeSolanaClient.md#updateconnection)
- [updateWallet](DeBridgeSolanaClient.md#updatewallet)
- [updateWalletAndConnection](DeBridgeSolanaClient.md#updatewalletandconnection)
- [waitForConfirmations](DeBridgeSolanaClient.md#waitforconfirmations)
- [wrapSolInSplTransaction](DeBridgeSolanaClient.md#wrapsolinspltransaction)
- [buildReplenishWsolBalanceTransaction](DeBridgeSolanaClient.md#buildreplenishwsolbalancetransaction)
- [checkFlag](DeBridgeSolanaClient.md#checkflag)
- [getTransactionSize](DeBridgeSolanaClient.md#gettransactionsize)
- [getWalletOwnerByData](DeBridgeSolanaClient.md#getwalletownerbydata)
- [hashDebridgeId](DeBridgeSolanaClient.md#hashdebridgeid)
- [hashDeployInfo](DeBridgeSolanaClient.md#hashdeployinfo)
- [hashSubmissionIdRaw](DeBridgeSolanaClient.md#hashsubmissionidraw)
- [isWalletCorrectATA](DeBridgeSolanaClient.md#iswalletcorrectata)
- [normalizeChainId](DeBridgeSolanaClient.md#normalizechainid)
- [setEventListeners](DeBridgeSolanaClient.md#seteventlisteners)

## Constructors

### constructor

• **new DeBridgeSolanaClient**(`connection`, `wallet?`, `params?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `connection` | `Connection` |
| `wallet?` | `Wallet` |
| `params?` | `Object` |
| `params.associatedTokenProgramId?` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) |
| `params.debug?` | `boolean` |
| `params.programId?` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) |
| `params.settingsProgramId?` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) |

#### Defined in

[deBridgeContracts.ts:138](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L138)

## Properties

### statePublicKey

• **statePublicKey**: `PublicKey`

#### Defined in

[deBridgeContracts.ts:132](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L132)

## Accessors

### idlErrors

• `get` **idlErrors**(): `IdlErrorCode`[]

Returns list of all possible custom errors

#### Returns

`IdlErrorCode`[]

list of all errors for deBridge and deBridgeSettings

#### Defined in

[deBridgeContracts.ts:2776](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2776)

___

### program

• `get` **program**(): `Program`<`DebridgeProgram`\>

get deBridge anchor.Program

#### Returns

`Program`<`DebridgeProgram`\>

deBridge anchor.Program instance

#### Defined in

[deBridgeContracts.ts:2760](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2760)

___

### provider

• `get` **provider**(): `AnchorProvider`

#### Returns

`AnchorProvider`

#### Defined in

[deBridgeContracts.ts:2752](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2752)

___

### settingsProgram

• `get` **settingsProgram**(): `Program`<`DebridgeSettingsProgram`\>

get deBridgeSettings anchor.Program

#### Returns

`Program`<`DebridgeSettingsProgram`\>

deBridgeSettings anchor.Program instance

#### Defined in

[deBridgeContracts.ts:2768](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2768)

___

### wallet

• `get` **wallet**(): `Pick`<`Wallet`, ``"publicKey"`` \| ``"signAllTransactions"`` \| ``"signTransaction"``\>

#### Returns

`Pick`<`Wallet`, ``"publicKey"`` \| ``"signAllTransactions"`` \| ``"signTransaction"``\>

#### Defined in

[deBridgeContracts.ts:2748](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2748)

## Methods

### buildClaimTransaction

▸ **buildClaimTransaction**(`executor`, `amount`, `receiverInfo`, `senderInfo`, `submissionInfo`, `autoParams?`, `createMissingWallets?`, `confirmationStorageCreator?`): `Promise`<{ `extCallStorage`: `Transaction`[] = exTxs; `transaction`: `Transaction`  }\>

Builds transaction which claims tokens from another blockchain via deBridge send or mint bridge

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `executor` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | signer of transaction |
| `amount` | [`AmountType`](../modules/interfaces.md#amounttype) | `undefined` | amount to claim |
| `receiverInfo` | `Object` | `undefined` | receiver address, tokenMint, claimToWallet |
| `receiverInfo.claimToWallet?` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | - |
| `receiverInfo.receiver` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | - |
| `receiverInfo.tokenMint` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | - |
| `senderInfo` | `Object` | `undefined` | source chain id and sender in source chain in a format "0x..." |
| `senderInfo.chainFrom` | [`ChainIdType`](../modules/interfaces.md#chainidtype) | `undefined` | - |
| `senderInfo.sender` | `string` | `undefined` | - |
| `submissionInfo` | `Object` | `undefined` | nonce and submissionId |
| `submissionInfo.nonce` | `number` | `undefined` | - |
| `submissionInfo.submissionId` | `string` \| `Buffer` | `undefined` | - |
| `autoParams?` | [`AutoParamsType`](../interfaces/interfaces.AutoParamsType.md) | `undefined` | amount of tokens to pay for execution, fallback address, flags and external call data |
| `createMissingWallets` | `boolean` \| [`WalletsCheckConfig`](../interfaces/interfaces.WalletsCheckConfig.md) | `true` | if true, add instructions for creation of missing wallets in transaction |
| `confirmationStorageCreator?` | `PublicKey` | `undefined` | - |

#### Returns

`Promise`<{ `extCallStorage`: `Transaction`[] = exTxs; `transaction`: `Transaction`  }\>

transaction for claim

#### Defined in

[deBridgeContracts.ts:2433](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2433)

___

### buildExecuteExternalCallTransaction

▸ **buildExecuteExternalCallTransaction**(`submissionId`, `executor`, `rewardBeneficiaryWallet`, `count`, `subsitutionBumps`, `remainingAccounts`, `calculatedAccounts`, `sourceChainId?`): `Promise`<`Transaction`\>

Builds execute external call transaction

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `submissionId` | `string` \| `Buffer` |  |
| `executor` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) |  |
| `rewardBeneficiaryWallet` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | wallet which will receive reward for execution |
| `count` | `number` | number of instructions to execute |
| `subsitutionBumps` | `number`[] \| `Buffer` | - |
| `remainingAccounts` | `AccountMeta`[] | accounts from extCallData |
| `calculatedAccounts` | `Object` | precalculated accounts |
| `calculatedAccounts.bridge?` | `PublicKey` | - |
| `calculatedAccounts.extCallMeta?` | `PublicKey` | - |
| `calculatedAccounts.extCallStorage?` | `PublicKey` | - |
| `calculatedAccounts.fallbackAddress?` | `PublicKey` | - |
| `calculatedAccounts.fallbackAddressWallet?` | `PublicKey` | - |
| `calculatedAccounts.originalClaimer?` | `PublicKey` | - |
| `calculatedAccounts.submission?` | `PublicKey` | - |
| `calculatedAccounts.submissionAuth?` | [`PublicKey`, `number`] | - |
| `calculatedAccounts.submissionWallet?` | `PublicKey` | - |
| `calculatedAccounts.tokenMint?` | `PublicKey` | - |
| `sourceChainId?` | [`ChainIdType`](../modules/interfaces.md#chainidtype) |  |

#### Returns

`Promise`<`Transaction`\>

execute external call transaction

#### Defined in

[deBridgeContracts.ts:2036](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2036)

___

### buildExtendExternalCallStorageInstruction

▸ **buildExtendExternalCallStorageInstruction**(`submissionId`, `sourceChainId`, `executor`, `data`, `calculatedAccounts?`): `TransactionInstruction`

Builds extend extCallStorage instruction

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `submissionId` | `string` \| `Buffer` |  |
| `sourceChainId` | [`ChainIdType`](../modules/interfaces.md#chainidtype) |  |
| `executor` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) |  |
| `data` | [`DataChunk`](../interfaces/instructions.DataChunk.md) | external call data |
| `calculatedAccounts?` | `Object` | precalculated accounts |
| `calculatedAccounts.extCallMeta?` | `PublicKey` | - |
| `calculatedAccounts.extCallStorage?` | `PublicKey` | - |

#### Returns

`TransactionInstruction`

extend extCallStorage instruction

#### Defined in

[deBridgeContracts.ts:1985](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1985)

___

### buildFallbackTransactions

▸ **buildFallbackTransactions**(`submissionId`, `executor`): `Promise`<`Transaction`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `submissionId` | `string` \| `Buffer` |
| `executor` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) |

#### Returns

`Promise`<`Transaction`[]\>

#### Defined in

[deBridgeContracts.ts:1033](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1033)

___

### buildInitExternalCallInstruction

▸ **buildInitExternalCallInstruction**(`submissionId`, `sourceChainId`, `executor`, `calculatedAccounts`, `data?`, `fullDataSize?`): `TransactionInstruction`

Builds init extCallStorage instruction

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `submissionId` | `string` \| `Buffer` |  |
| `sourceChainId` | [`ChainIdType`](../modules/interfaces.md#chainidtype) |  |
| `executor` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) |  |
| `calculatedAccounts` | `Object` | precalculated accounts |
| `calculatedAccounts.meta?` | `PublicKey` | - |
| `calculatedAccounts.storage?` | `PublicKey` | - |
| `data?` | `Buffer` | external call data |
| `fullDataSize?` | `number` | size of ext call data length |

#### Returns

`TransactionInstruction`

init ext call storage instruction

#### Defined in

[deBridgeContracts.ts:1939](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1939)

___

### buildInitializeMintBridgeTransaction

▸ **buildInitializeMintBridgeTransaction**(`payer`, `chainId`, `tokenAddress`, `tokenName`, `tokenSymbol`, `decimals`): `Promise`<{ `debridgeId`: `string` ; `transaction`: `Transaction`  }\>

Builds transaction for mint bridge initialization

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payer` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | who pays for initialization |
| `chainId` | [`ChainIdType`](../modules/interfaces.md#chainidtype) | native chain id |
| `tokenAddress` | `string` | hex-encoded native token address |
| `tokenName` | `string` | name of the token |
| `tokenSymbol` | `string` | token symbol |
| `decimals` | `number` | otken decimals |

#### Returns

`Promise`<{ `debridgeId`: `string` ; `transaction`: `Transaction`  }\>

built transaction

#### Defined in

[deBridgeContracts.ts:1137](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1137)

___

### buildInitializeSendBridgeTransaction

▸ **buildInitializeSendBridgeTransaction**(`tokenMint`, `payer`): `Promise`<`Transaction`\>

Builds transaction for staking wallet creation (if not exists) and send bridge initializaion

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenMint` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | token mint account to init bridge |
| `payer` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | who pays for transaction |

#### Returns

`Promise`<`Transaction`\>

transaction for [staking wallet creation] and send bridge initialization

#### Defined in

[deBridgeContracts.ts:1239](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1239)

___

### buildOptimalExecuteExternalCallTransaction

▸ **buildOptimalExecuteExternalCallTransaction**(`submissionId`, `executor`, `rewardBeneficiaryWallet`, `calculatedAccounts?`, `sourceChainId?`): `Promise`<[`Transaction`, `number`]\>

Builds execute external call transaction with max available number of instructions to execute

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `submissionId` | `string` \| `Buffer` |  |
| `executor` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) |  |
| `rewardBeneficiaryWallet` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | wallet which will receive reward for execution = ATA(executor, tokenMint) |
| `calculatedAccounts?` | `Object` | precalculated accounts |
| `calculatedAccounts.bridge?` | `PublicKey` | - |
| `calculatedAccounts.extCallMeta?` | `PublicKey` | - |
| `calculatedAccounts.extCallStorage?` | `PublicKey` | - |
| `calculatedAccounts.fallbackAddress?` | `PublicKey` | - |
| `calculatedAccounts.fallbackAddressWallet?` | `PublicKey` | - |
| `calculatedAccounts.originalClaimer?` | `PublicKey` | - |
| `calculatedAccounts.submission?` | `PublicKey` | - |
| `calculatedAccounts.submissionAuth?` | [`PublicKey`, `number`] | - |
| `calculatedAccounts.submissionWallet?` | `PublicKey` | - |
| `calculatedAccounts.tokenMint?` | `PublicKey` | - |
| `sourceChainId?` | [`ChainIdType`](../modules/interfaces.md#chainidtype) |  |

#### Returns

`Promise`<[`Transaction`, `number`]\>

execute external call transaction, number of instructions to execute

#### Defined in

[deBridgeContracts.ts:2142](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2142)

___

### buildSendInstruction

▸ **buildSendInstruction**(`sender`, `sendFromWallet`, `payableAmount`, `tokenMint`, `receiver`, `chainIdTo`, `useAssetFee`, `referralCode`, `fallbackAddress`, `flags?`, `executionFee?`, `data?`, `checkSenderBalance?`, `sendFromWalletMayNotExist?`): `Promise`<{ `extCallStorage`: `Transaction`[] = exTxs; `transaction`: `Transaction` = result }\>

Builds instruction which sends tokens to another blockchain via deBridge send or mint bridge

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `sender` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | account of sender |
| `sendFromWallet` | ``null`` \| `PublicKey` | `undefined` | address of wallet |
| `payableAmount` | [`AmountType`](../modules/interfaces.md#amounttype) | `undefined` | amount to send |
| `tokenMint` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | account of token mint of token we want to send |
| `receiver` | `string` | `undefined` | address of receiver in another blockchain, hex string with "0x" prefix |
| `chainIdTo` | `number` \| `Buffer` | `undefined` | id of destination blockchain |
| `useAssetFee` | `boolean` | `undefined` | use assets (tokens) or native (lamports) to pay fee |
| `referralCode` | `number` | `undefined` | param from evm-based networks |
| `fallbackAddress` | `string` | `undefined` | fallback in destination chain, hex string with "0x" prefix |
| `flags?` | `number` \| `Buffer` | `undefined` | external call flags |
| `executionFee?` | [`AmountType`](../modules/interfaces.md#amounttype) | `undefined` | amount of tokens to pay for execution |
| `data?` | `string` \| `Buffer` | `undefined` | externall call data |
| `checkSenderBalance` | `boolean` | `true` | true if sendFromWallet balance need to be checked |
| `sendFromWalletMayNotExist` | `boolean` | `false` | - |

#### Returns

`Promise`<{ `extCallStorage`: `Transaction`[] = exTxs; `transaction`: `Transaction` = result }\>

instruction for send bridge init

#### Defined in

[deBridgeContracts.ts:1504](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1504)

___

### buildStoreSignaturesTransaction

▸ **buildStoreSignaturesTransaction**(`message`, `payer`, `signatureStorage`, `signatures`): `Transaction`[]

Builds list of transactions for confirmation of bridge init/claim

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | message that was signed |
| `payer` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | who pays for confirmation storage creation and TX |
| `signatureStorage` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | account for signature storage |
| `signatures` | `Buffer`[] | array of message validator's signatures |

#### Returns

`Transaction`[]

transactions for confirmation of some action

#### Defined in

[deBridgeContracts.ts:1780](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1780)

___

### buildUpdateFeeBridgeInfoTransaction

▸ **buildUpdateFeeBridgeInfoTransaction**(`chainId`, `tokenMint`, `chainFee`, `payer`): `Transaction`

Builds transaction which updates bridge fee info

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `chainId` | [`ChainIdType`](../modules/interfaces.md#chainidtype) |  |
| `tokenMint` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) |  |
| `chainFee` | [`AmountType`](../modules/interfaces.md#amounttype) | new fee value |
| `payer` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) |  |

#### Returns

`Transaction`

built transaction

#### Defined in

[deBridgeContracts.ts:1279](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1279)

___

### calculateExecutionFee

▸ **calculateExecutionFee**(`senderAddressLength`, `nativeTokenAddress`, `nativeChainId`, `solPrice`, `tokenPrice`, `tokenDecimals`, `executionFeeMultiplier`): `Promise`<`bigint`\>

Calculate fee of claim execution in solana

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `senderAddressLength` | `number` | length of sender in bytes |
| `nativeTokenAddress` | `string` | native address of token to send |
| `nativeChainId` | `number` | native address of chain |
| `solPrice` | `number` | price of 1 SOL in usd |
| `tokenPrice` | `number` | price of token to send into solana in usd |
| `tokenDecimals` | `number` | decimals of token to send into solana |
| `executionFeeMultiplier` | `number` | multiplier of profitability for claimers |

#### Returns

`Promise`<`bigint`\>

execution fee

#### Defined in

[deBridgeContracts.ts:686](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L686)

___

### calculateFee

▸ **calculateFee**(`tokenMint`, `chainId`, `discountAccount`, `useAssetFee`, `amount`): `Promise`<[`FeeInfoType`](../interfaces/interfaces.FeeInfoType.md)\>

Calculates fee for specified transfer params

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenMint` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | mint of token to transfer |
| `chainId` | [`ChainIdType`](../modules/interfaces.md#chainidtype) | id of the destination chain we want to send tokens |
| `discountAccount` | ``null`` \| [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | account for which we'll try to find discount |
| `useAssetFee` | `boolean` | asset or native execution fee |
| `amount` | [`AmountType`](../modules/interfaces.md#amounttype) | amount of transferrable assets |

#### Returns

`Promise`<[`FeeInfoType`](../interfaces/interfaces.FeeInfoType.md)\>

information about fee

#### Defined in

[deBridgeContracts.ts:727](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L727)

___

### checkClaimParams

▸ **checkClaimParams**(`executor`, `amount`, `receiverInfo`, `senderInfo`, `submissionInfo`, `autoParams?`, `createMissingWallets?`): `Promise`<[`Buffer`, `PublicKey`]\>

Checks if claim won't fail

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `executor` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | account of transaction signer |
| `amount` | [`AmountType`](../modules/interfaces.md#amounttype) | `undefined` | amount to claim |
| `receiverInfo` | `Object` | `undefined` | account of receiver, token mint and [claimToWallet address] |
| `receiverInfo.claimToWallet?` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | - |
| `receiverInfo.receiver` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | - |
| `receiverInfo.tokenMint` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | - |
| `senderInfo` | `Object` | `undefined` | hex-encoded sender and chain id from |
| `senderInfo.chainFrom` | [`ChainIdType`](../modules/interfaces.md#chainidtype) | `undefined` | - |
| `senderInfo.sender` | `string` | `undefined` | - |
| `submissionInfo` | `Object` | `undefined` | nonce and [submissionId] |
| `submissionInfo.nonce` | `number` | `undefined` | - |
| `autoParams?` | [`AutoParamsType`](../interfaces/interfaces.AutoParamsType.md) | `undefined` | execution fee, external call data, fallback address |
| `createMissingWallets` | `boolean` | `true` | if true, method won't fail during wallets check |

#### Returns

`Promise`<[`Buffer`, `PublicKey`]\>

calculated submission id and confirmation storage address

#### Defined in

[deBridgeContracts.ts:2664](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2664)

___

### checkIfAccountExists

▸ **checkIfAccountExists**(`account`): `Promise`<`boolean`\>

Checks if account exists in blockchain

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | account to check |

#### Returns

`Promise`<`boolean`\>

true if account exists

#### Defined in

[deBridgeContracts.ts:1712](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1712)

___

### checkIfAssociatedWalletExists

▸ **checkIfAssociatedWalletExists**(`mintAccount`, `originalWallet`): `Promise`<`boolean`\>

Checks existance of associated wallet for specified token

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mintAccount` | `PublicKey` | mint account of SPL-token |
| `originalWallet` | `PublicKey` | account of solana wallet |

#### Returns

`Promise`<`boolean`\>

true if account exists

#### Defined in

[deBridgeContracts.ts:1700](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1700)

___

### createAssociatedWalletInstruction

▸ **createAssociatedWalletInstruction**(`tokenMint`, `associatedAccount`, `owner`, `payer`): `TransactionInstruction`

Builds instruction for creation of associated wallet for specified token

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenMint` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | mint account of SPL-token |
| `associatedAccount` | `PublicKey` | associated account address |
| `owner` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | owner of the associated account |
| `payer` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | who pays for account creation |

#### Returns

`TransactionInstruction`

#### Defined in

[deBridgeContracts.ts:1725](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1725)

___

### getAccountWithType

▸ **getAccountWithType**(`account`): `Promise`<[``null`` \| `AccountInfo`<`Buffer`\>, [`AccountType`](../enums/interfaces.AccountType.md)]\>

Requests account from blockchain and returns result with account type

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | address of account |

#### Returns

`Promise`<[``null`` \| `AccountInfo`<`Buffer`\>, [`AccountType`](../enums/interfaces.AccountType.md)]\>

account info and account type

#### Defined in

[deBridgeContracts.ts:268](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L268)

___

### getAllWalletsWithBalances

▸ **getAllWalletsWithBalances**(`owner`): `Promise`<[`WalletInfo`](../interfaces/interfaces.WalletInfo.md)[]\>

Gets list of user's SPL-token accounts

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `owner` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | owner of the SPL wallets |

#### Returns

`Promise`<[`WalletInfo`](../interfaces/interfaces.WalletInfo.md)[]\>

list of accounts with amount on them

#### Defined in

[deBridgeContracts.ts:1309](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1309)

___

### getAssocSPLWalletBalance

▸ **getAssocSPLWalletBalance**(`originalWallet`, `tokenMint`): `Promise`<`BN`\>

Returns balance of associated wallet in SPL-tokens

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `originalWallet` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | native tokens wallet address |
| `tokenMint` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | mint of SPL-Token |

#### Returns

`Promise`<`BN`\>

#### Defined in

[deBridgeContracts.ts:532](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L532)

___

### getBridgeBalance

▸ **getBridgeBalance**(`tokenMint`): `Promise`<`BN`\>

Returns balance of the bridge associated with the mint or throws error if no such bridge were found

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenMint` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | address of mint for some token |

#### Returns

`Promise`<`BN`\>

balance of the bridge or throws error if no bridge were found

#### Defined in

[deBridgeContracts.ts:557](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L557)

___

### getBridgeByDeBridgeId

▸ **getBridgeByDeBridgeId**(`deBridgeId`): `Promise`<``null`` \| { `bridge`: [`BridgeType`](../interfaces/interfaces.BridgeType.md) ; `tokenMint`: `PublicKey`  }\>

Returns bridge info from solana by debridgeId

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deBridgeId` | `string` \| `Buffer` | bridge id in deBridge network, [hashDebridgeId](DeBridgeSolanaClient.md#hashdebridgeid) |

#### Returns

`Promise`<``null`` \| { `bridge`: [`BridgeType`](../interfaces/interfaces.BridgeType.md) ; `tokenMint`: `PublicKey`  }\>

null if bridge not exists or bridge token address and bridge info from solana blockchain

#### Defined in

[deBridgeContracts.ts:787](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L787)

___

### getBridgeFeeSafe

▸ **getBridgeFeeSafe**(`bridgeFee`): `Promise`<[`BridgeFeeInfoType`](../interfaces/interfaces.BridgeFeeInfoType.md)\>

Returns parsed bridgeFee from blockchain or raises error

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bridgeFee` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | account of bridgeFee |

#### Returns

`Promise`<[`BridgeFeeInfoType`](../interfaces/interfaces.BridgeFeeInfoType.md)\>

parsed bridgeFee

#### Defined in

[deBridgeContracts.ts:926](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L926)

___

### getBridgeInfoSafe

▸ **getBridgeInfoSafe**(`bridge`): `Promise`<[`BridgeType`](../interfaces/interfaces.BridgeType.md)\>

Returns parsed bridgeInfo from blockchain or raises error

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bridge` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | account of bridgeInfo |

#### Returns

`Promise`<[`BridgeType`](../interfaces/interfaces.BridgeType.md)\>

parsed bridgeInfo

#### Defined in

[deBridgeContracts.ts:902](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L902)

___

### getChainSupportInfoSafe

▸ **getChainSupportInfoSafe**(`chainSupportInfo`, `checkIfSupported?`): `Promise`<[`ChainSupportInfoType`](../interfaces/interfaces.ChainSupportInfoType.md)\>

Returns parsed chainSupportInfo from blockchain or raises error

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `chainSupportInfo` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | account of chainSupportInfo |
| `checkIfSupported` | `boolean` | `true` | check if chainSupportInfo is supported |

#### Returns

`Promise`<[`ChainSupportInfoType`](../interfaces/interfaces.ChainSupportInfoType.md)\>

parsed chainSupportInfo

#### Defined in

[deBridgeContracts.ts:866](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L866)

___

### getClaimTokenMint

▸ **getClaimTokenMint**(`debridgeId`): `PublicKey`

Calculates token mint by submission data

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `debridgeId` | `string` \| `Buffer` | id of bridge |

#### Returns

`PublicKey`

token mint of bridge token

#### Defined in

[deBridgeContracts.ts:1481](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1481)

___

### getConfirmationStorageSafe

▸ **getConfirmationStorageSafe**(`confirmationStorage`): `Promise`<[`ConfirmationStorageType`](../interfaces/interfaces.ConfirmationStorageType.md)\>

Returns parsed confirmation storage, may be used to get current confirmations count

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `confirmationStorage` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | account of ConfirmationStorage for specific deployInfo/submission |

#### Returns

`Promise`<[`ConfirmationStorageType`](../interfaces/interfaces.ConfirmationStorageType.md)\>

parsed confirmation storage

#### Defined in

[deBridgeContracts.ts:840](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L840)

___

### getConfirmationsCount

▸ **getConfirmationsCount**(`confirmationsStorage`): `Promise`<{ `haveConfirmations`: `number` ; `requiredConfirmations`: `number`  }\>

Get number of confirmations in provided storage

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `confirmationsStorage` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | address of confirmation storage |

#### Returns

`Promise`<{ `haveConfirmations`: `number` ; `requiredConfirmations`: `number`  }\>

number of confirmations in storage

#### Defined in

[deBridgeContracts.ts:414](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L414)

___

### getDiscountInfoSafe

▸ **getDiscountInfoSafe**(`discount`, `returnNullIfNoDiscount?`): `Promise`<`undefined` \| [`ActiveDiscountType`](../interfaces/interfaces.ActiveDiscountType.md)\>

Returns parsed activeDiscountInfo from blockchain or raises error

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `discount` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | account of discount info |
| `returnNullIfNoDiscount` | `boolean` | `true` | dont raise error if discount not found/malformed/not active, just return null |

#### Returns

`Promise`<`undefined` \| [`ActiveDiscountType`](../interfaces/interfaces.ActiveDiscountType.md)\>

parsed activeDiscountInfo

#### Defined in

[deBridgeContracts.ts:951](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L951)

___

### getExternalCallMetaSafe

▸ **getExternalCallMetaSafe**(`externalCallMeta`): `Promise`<[`ExternalCallMetaType`](../interfaces/interfaces.ExternalCallMetaType.md)\>

Fetches extCallMeta from blockchain

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `externalCallMeta` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | account of ext call meta |

#### Returns

`Promise`<[`ExternalCallMetaType`](../interfaces/interfaces.ExternalCallMetaType.md)\>

parsed external call metadata

#### Defined in

[deBridgeContracts.ts:998](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L998)

___

### getNativeWalletBalance

▸ **getNativeWalletBalance**(`wallet`): `Promise`<`BN`\>

Returns balance of specified wallet in native tokens

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wallet` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | wallet to inspect |

#### Returns

`Promise`<`BN`\>

#### Defined in

[deBridgeContracts.ts:520](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L520)

___

### getRent

▸ **getRent**(): `Promise`<[`RentType`](../interfaces/interfaces.RentType.md)\>

#### Returns

`Promise`<[`RentType`](../interfaces/interfaces.RentType.md)\>

#### Defined in

[deBridgeContracts.ts:805](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L805)

___

### getSPLWalletBalance

▸ **getSPLWalletBalance**(`wallet`): `Promise`<`BN`\>

Returns balance of specified wallet in SPL-tokens

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wallet` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | spl-tokens wallet address |

#### Returns

`Promise`<`BN`\>

#### Defined in

[deBridgeContracts.ts:545](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L545)

___

### getStateSafe

▸ **getStateSafe**(): `Promise`<[`StateType`](../interfaces/interfaces.StateType.md)\>

Returns parsed state of smart-contract from blockchain

#### Returns

`Promise`<[`StateType`](../interfaces/interfaces.StateType.md)\>

parsed bridge state

#### Defined in

[deBridgeContracts.ts:817](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L817)

___

### getSubmissionInfoSafe

▸ **getSubmissionInfoSafe**(`submission`): `Promise`<[`SubmissionInfoType`](../interfaces/interfaces.SubmissionInfoType.md)\>

Fetches submission info from blockchain

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `submission` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | account of submissioon |

#### Returns

`Promise`<[`SubmissionInfoType`](../interfaces/interfaces.SubmissionInfoType.md)\>

parsed submission info

#### Defined in

[deBridgeContracts.ts:983](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L983)

___

### getSubmissionStatus

▸ **getSubmissionStatus**(`submissionId`): `Promise`<``null`` \| [`SubmissionStatusType`](../interfaces/interfaces.SubmissionStatusType.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `submissionId` | `string` \| `Buffer` |

#### Returns

`Promise`<``null`` \| [`SubmissionStatusType`](../interfaces/interfaces.SubmissionStatusType.md)\>

#### Defined in

[deBridgeContracts.ts:632](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L632)

___

### getWrappedSolAccountsWithBalance

▸ **getWrappedSolAccountsWithBalance**(`owner`): `Promise`<[`WalletInfo`](../interfaces/interfaces.WalletInfo.md)[]\>

Gets list of user's WSOL token accounts

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `owner` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | owner of the WSOL wallets |

#### Returns

`Promise`<[`WalletInfo`](../interfaces/interfaces.WalletInfo.md)[]\>

list of accounts with amount on them

#### Defined in

[deBridgeContracts.ts:1354](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1354)

___

### hashSubmissionId

▸ **hashSubmissionId**(`params`): `Promise`<[`Buffer`, `Buffer`]\>

Hashes submission

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`SubmissionIdParams`](../interfaces/interfaces.SubmissionIdParams.md) | [SubmissionIdParams](../interfaces/interfaces.SubmissionIdParams.md) |

#### Returns

`Promise`<[`Buffer`, `Buffer`]\>

submissionId and sourceChainId

#### Defined in

[deBridgeContracts.ts:1892](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1892)

___

### init

▸ **init**(): `Promise`<`void`\>

Async constructor for this class

#### Returns

`Promise`<`void`\>

#### Defined in

[deBridgeContracts.ts:188](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L188)

___

### initializeMintBridge

▸ **initializeMintBridge**(`params`): `Promise`<{ `event`: [`MintBridgeCreatedEventType`](../interfaces/interfaces.MintBridgeCreatedEventType.md) = event; `transactionId`: `string` = txId }\>

Initializes mint bridge using wallet provided in constructor

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`InitMintBridgeParamsType`](../interfaces/interfaces.InitMintBridgeParamsType.md) | [InitMintBridgeParamsType](../interfaces/interfaces.InitMintBridgeParamsType.md) |

#### Returns

`Promise`<{ `event`: [`MintBridgeCreatedEventType`](../interfaces/interfaces.MintBridgeCreatedEventType.md) = event; `transactionId`: `string` = txId }\>

transactionId and event [MintBridgeCreatedEventType](../interfaces/interfaces.MintBridgeCreatedEventType.md)

#### Defined in

[deBridgeContracts.ts:1198](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1198)

___

### isBridgeBalanceOk

▸ **isBridgeBalanceOk**(`tokenMint`, `isMint`, `amount`): `Promise`<`boolean`\>

Checks if we can claim amount from bridge

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenMint` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | pubkey or base58 encoded pubkey of token main |
| `isMint` | `boolean` |  |
| `amount` | [`AmountType`](../modules/interfaces.md#amounttype) | amount to check |

#### Returns

`Promise`<`boolean`\>

true if amout is less than bridge balance or bridge is mint

#### Defined in

[deBridgeContracts.ts:2627](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2627)

___

### isBridgeFeeInfoInitialized

▸ **isBridgeFeeInfoInitialized**(`debridgeId`, `chainIdFrom`): `Promise`<`boolean`\>

Checks if bridge fee info initialized

#### Parameters

| Name | Type |
| :------ | :------ |
| `debridgeId` | `string` |
| `chainIdFrom` | [`ChainIdType`](../modules/interfaces.md#chainidtype) |

#### Returns

`Promise`<`boolean`\>

true if bridge fee info initialized

#### Defined in

[deBridgeContracts.ts:380](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L380)

___

### isBridgeInitialized

▸ **isBridgeInitialized**(`debridgeId`): `Promise`<`boolean`\>

Checks if bridge initialized

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `debridgeId` | `string` | hex-encoded string |

#### Returns

`Promise`<`boolean`\>

true if bridge initialized

#### Defined in

[deBridgeContracts.ts:361](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L361)

___

### isEnoughSignaturesStored

▸ **isEnoughSignaturesStored**(`storage`): `Promise`<`boolean`\>

Checks if confirmations storage contains enough signatures

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storage` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | confirmations storage account |

#### Returns

`Promise`<`boolean`\>

true if stored confirmations count is enough for claim

#### Defined in

[deBridgeContracts.ts:345](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L345)

___

### isExtCallExecuted

▸ **isExtCallExecuted**(`meta`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `meta` | `PublicKey` |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[deBridgeContracts.ts:2019](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2019)

___

### isExtCallStorageCorrect

▸ **isExtCallStorageCorrect**(`storage`, `data`): `Promise`<`boolean`\>

Compares `data` arg and on-chain value

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storage` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | external call storage account |
| `data` | `Buffer` | data to compare |

#### Returns

`Promise`<`boolean`\>

true if on-chain data equals to `data` param

#### Defined in

[deBridgeContracts.ts:2012](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2012)

___

### isInitialized

▸ **isInitialized**(): `boolean`

Checks if instance is initialized

#### Returns

`boolean`

true if this.init() was called before and client is ready for work

#### Defined in

[deBridgeContracts.ts:203](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L203)

___

### isSubmissionUsed

▸ **isSubmissionUsed**(`submissionId`): `Promise`<`boolean`\>

Checks if submission is used

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `submissionId` | `string` \| `Buffer` | debridge submission id, [hashSubmissionIdRaw](DeBridgeSolanaClient.md#hashsubmissionidraw) |

#### Returns

`Promise`<`boolean`\>

true if non-empty associated account for submission exists

#### Defined in

[deBridgeContracts.ts:2644](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2644)

___

### isTransactionClaimed

▸ **isTransactionClaimed**(`submissionId`): `Promise`<`boolean`\>

Checks if transactions claimed

#### Parameters

| Name | Type |
| :------ | :------ |
| `submissionId` | `string` \| `Buffer` |

#### Returns

`Promise`<`boolean`\>

ture if transaction claimed

#### Defined in

[deBridgeContracts.ts:400](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L400)

___

### onBridged

▸ **onBridged**(`handler`): `number`

Invokes the given callback every time the Bridged event is emitted.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handler` | (`event`: [`BridgedEventType`](../interfaces/interfaces.BridgedEventType.md), `slot`: `number`) => `void` | The function to invoke whenever the Bridged event is emitted from                program logs |

#### Returns

`number`

subscription id

#### Defined in

[deBridgeContracts.ts:449](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L449)

___

### onTransferred

▸ **onTransferred**(`handler`): `number`

Invokes the given callback every time the Transferred event is emitted.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handler` | (`event`: [`TransferredEventType`](../interfaces/interfaces.TransferredEventType.md), `slot`: `number`) => `void` | The function to invoke whenever the Transferred event is emitted from                program logs |

#### Returns

`number`

subscription id

#### Defined in

[deBridgeContracts.ts:438](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L438)

___

### prepareExtCallTransactions

▸ **prepareExtCallTransactions**(`submissionId`, `sourceChainId`, `executor`, `data?`, `calculatedAccounts?`): `Transaction`[]

Prepares transactions for external call data initialization

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `submissionId` | `string` \| `Buffer` |  |
| `sourceChainId` | [`ChainIdType`](../modules/interfaces.md#chainidtype) |  |
| `executor` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) |  |
| `data?` | `string` \| `Buffer` | external call data |
| `calculatedAccounts?` | `Object` | precalculated accounts |
| `calculatedAccounts.meta?` | `PublicKey` | - |
| `calculatedAccounts.storage?` | `PublicKey` | - |

#### Returns

`Transaction`[]

init and extend external call transactions

#### Defined in

[deBridgeContracts.ts:2346](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2346)

___

### prepareOnClaimPromise

▸ **prepareOnClaimPromise**(`submissionId`): `Promise`<[`TransferredEventType`](../interfaces/interfaces.TransferredEventType.md)\>

Constructs promise for correct claimed-evevent resolution

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `submissionId` | `string` | in hex form |

#### Returns

`Promise`<[`TransferredEventType`](../interfaces/interfaces.TransferredEventType.md)\>

promise which will be resolved on `claimed` event

#### Defined in

[deBridgeContracts.ts:467](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L467)

___

### prepareOnSendPromise

▸ **prepareOnSendPromise**(`sender`, `bridgeId`): `Promise`<[`TransferredEventType`](../interfaces/interfaces.TransferredEventType.md)\>

Constructs promise for correct sent-evevent resolution

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sender` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | address of sender |
| `bridgeId` | `string` | bridge id in `0x1122...` form |

#### Returns

`Promise`<[`TransferredEventType`](../interfaces/interfaces.TransferredEventType.md)\>

promise which will be resolved on `send` event

#### Defined in

[deBridgeContracts.ts:488](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L488)

___

### removeOnEvent

▸ **removeOnEvent**(`subscriptionId`): `Promise`<`void`\>

Removes subscription on transferred or bridged events

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `subscriptionId` | `number` | id of subscription returned from [onBridged](DeBridgeSolanaClient.md#onbridged) or [onTransferred](DeBridgeSolanaClient.md#ontransferred) |

#### Returns

`Promise`<`void`\>

#### Defined in

[deBridgeContracts.ts:458](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L458)

___

### sendTx

▸ **sendTx**(`transaction`): `Promise`<`string`\>

Signs and sends single transaction

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `transaction` | `Transaction` | tx to send |

#### Returns

`Promise`<`string`\>

tx id

#### Defined in

[deBridgeContracts.ts:302](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L302)

___

### updateConnection

▸ **updateConnection**(`newConnection`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `newConnection` | `Connection` |

#### Returns

`void`

#### Defined in

[deBridgeContracts.ts:211](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L211)

___

### updateWallet

▸ **updateWallet**(`newWallet`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `newWallet` | `Wallet` |

#### Returns

`void`

#### Defined in

[deBridgeContracts.ts:218](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L218)

___

### updateWalletAndConnection

▸ **updateWalletAndConnection**(`newConnection`, `newWallet`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `newConnection` | `Connection` |
| `newWallet` | `Wallet` |

#### Returns

`void`

#### Defined in

[deBridgeContracts.ts:224](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L224)

___

### waitForConfirmations

▸ **waitForConfirmations**(`confStorage`, `retries?`, `timeout?`): `Promise`<`boolean`\>

Waits until confirmation storage is filed

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `confStorage` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | `undefined` | address of confirmations storage |
| `retries` | `number` | `10` | number of retries before code will fail |
| `timeout` | `number` | `2500` | - |

#### Returns

`Promise`<`boolean`\>

true when confirmation storage is filled properly

#### Defined in

[deBridgeContracts.ts:320](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L320)

___

### wrapSolInSplTransaction

▸ **wrapSolInSplTransaction**(`amount`, `owner`): `Promise`<[`Transaction`, `Keypair`]\>

Builds transaction that wraps specified amount of lamports into spl

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `amount` | [`AmountType`](../modules/interfaces.md#amounttype) | lamports to wrap |
| `owner` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | owner of created wallet |

#### Returns

`Promise`<[`Transaction`, `Keypair`]\>

#### Defined in

[deBridgeContracts.ts:1426](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1426)

___

### buildReplenishWsolBalanceTransaction

▸ `Static` **buildReplenishWsolBalanceTransaction**(`amount`, `transferFrom`, `transferTo`): `Transaction`

Builds transaction to transfer&wrap native sol from src wallet to dst wallet

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `amount` | [`AmountType`](../modules/interfaces.md#amounttype) | number of lamports to transfer and wrap |
| `transferFrom` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | source native account |
| `transferTo` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | destination wallet |

#### Returns

`Transaction`

transaction to transfer&wrap sol

#### Defined in

[deBridgeContracts.ts:1401](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1401)

___

### checkFlag

▸ `Static` **checkFlag**(`flags`, `toCheck`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `flags` | `undefined` \| `string` \| `number` \| `Buffer` |
| `toCheck` | `number` |

#### Returns

`boolean`

#### Defined in

[deBridgeContracts.ts:2413](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2413)

___

### getTransactionSize

▸ `Static` **getTransactionSize**(`transaction`, `feePayer?`): `number`

Serializes transaction and returns serialized size

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `transaction` | `Transaction` | tx to get length |
| `feePayer?` | `PublicKey` | optional fee payer |

#### Returns

`number`

transaction size

#### Defined in

[deBridgeContracts.ts:236](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L236)

___

### getWalletOwnerByData

▸ `Static` **getWalletOwnerByData**(`data`): `PublicKey`

Parses input data and returns owner of the token account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `Buffer` | TokenAccount data |

#### Returns

`PublicKey`

owner of the token account

#### Defined in

[deBridgeContracts.ts:256](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L256)

___

### hashDebridgeId

▸ `Static` **hashDebridgeId**(`nativeChainId`, `nativeTokenAddress`): `string`

Returns bridgeid hash

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nativeChainId` | [`ChainIdType`](../modules/interfaces.md#chainidtype) | chain id where token originates |
| `nativeTokenAddress` | `string` \| `Buffer` | address of token in native chain in format "0x<HEX STRING>" |

#### Returns

`string`

bridge id in deBridge network

#### Defined in

[deBridgeContracts.ts:775](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L775)

___

### hashDeployInfo

▸ `Static` **hashDeployInfo**(`params`): `Buffer`

Hashes deploy info

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`HashDeployInfoParams`](../interfaces/interfaces.HashDeployInfoParams.md) | [HashDeployInfoParams](../interfaces/interfaces.HashDeployInfoParams.md) |

#### Returns

`Buffer`

keccak256 of deployInfo structure

#### Defined in

[deBridgeContracts.ts:1022](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1022)

___

### hashSubmissionIdRaw

▸ `Static` **hashSubmissionIdRaw**(`params`): `Buffer`

Hashes submission for provided data

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `Object` | data to hash |
| `params.amount` | [`AmountType`](../modules/interfaces.md#amounttype) | - |
| `params.autoParams?` | [`AutoParamsType`](../interfaces/interfaces.AutoParamsType.md) | - |
| `params.debridgeId` | `string` \| `Buffer` | - |
| `params.denominator?` | `number` | - |
| `params.nonce` | `number` | - |
| `params.receiver` | `Buffer` \| [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | - |
| `params.sourceChainId` | [`ChainIdType`](../modules/interfaces.md#chainidtype) | - |
| `params.targetChainId` | [`ChainIdType`](../modules/interfaces.md#chainidtype) | - |

#### Returns

`Buffer`

submissionId from provided params

#### Defined in

[deBridgeContracts.ts:1823](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1823)

___

### isWalletCorrectATA

▸ `Static` **isWalletCorrectATA**(`walletAddress`, `data`): `boolean`

Checks if provided walletAddress = ATA(walletAddess.owner, walletAddress.tokenMint)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `walletAddress` | [`SolanaPubkey`](../modules/interfaces.md#solanapubkey) | address of potentially associated wallet |
| `data` | `Buffer` | data of the account |

#### Returns

`boolean`

true if ATA address equals to provided walletAddress

#### Defined in

[deBridgeContracts.ts:288](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L288)

___

### normalizeChainId

▸ `Static` **normalizeChainId**(`chainId`): `Buffer`

Converts chainId into valid form

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId` | [`ChainIdType`](../modules/interfaces.md#chainidtype) |

#### Returns

`Buffer`

normalized chainId buffer

#### Defined in

[deBridgeContracts.ts:1013](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L1013)

___

### setEventListeners

▸ `Static` **setEventListeners**<`I`\>(`program`, `mainEvent`, `resolve`, `reject`, `resolveCondition?`): `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `I` | extends `Idl` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `program` | `Program`<`I`\> |
| `mainEvent` | `string` |
| `resolve` | (`message`: `unknown`) => `void` |
| `reject` | (`error`: `Error`) => `void` |
| `resolveCondition?` | (`e`: `unknown`) => `boolean` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `cleanReject` | (`error`: `Error`) => `Promise`<`void`\> |
| `cleanResolve` | (`message`: `unknown`) => `Promise`<`void`\> |

#### Defined in

[deBridgeContracts.ts:2782](https://github.com/debridge-finance/solana-contracts-client/blob/1b61583/src/deBridgeContracts.ts#L2782)
