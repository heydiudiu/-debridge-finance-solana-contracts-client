@debridge-finance/solana-client / [Exports](modules.md)

[Docs](docs/README.md)

## Client init
Since js doesn't support async constructors we have to initialize client object with `const client = new DeBridgeSolanaClient()` and then wait until it initializes (`await client.init()`) - loads program state, etc...
After initialization we can request data from blockchain and build transactions

### How to wrap Sol->WSol (SPL-Sol)
We can't send native SOL tokens, we need to wrap them first into SPL-token form (`SystemProgram.createAccount` + `SystemProgram.transfer` native sol to created account + `TokenProgram.InitializeAccount` to convert system account into token account (SPL-wallet)). If we don't want to create new wallet we can call `SystemProgram.transfer` and then `TokenProgram.SyncNative` to convert transferred Sols into SPL-Sol

### How to send token from Solana to other blockchain?
1. Check if user's associated wallet exists and user have ehough tokens. We can get all user's wallets with [`getAllWalletsWithBalances`](docs/classes/DeBridgeSolanaClient.md#getallwalletswithbalances) 
2. Check if chain is supported - we can't send from Solana to unsupported chains, hence `chainSupportInfo` must exist and be in `Supported` state, see [`getChainSupportInfoSafe`](docs/classes/DeBridgeSolanaClient.md#getchainsupportinfosafe) for details
3. Check if bridge exists (SPL-tokens are sent via **Send** bridge, deAssets are sent via **Mint** bridge which 100% exists) and in **Working** state - if bridge doesn't exist we can't send tokens and we need to init bridge first (see bridge initialization->send). We can check if bridge exists with `getBridgeByDeBridgeId` (if we have debridgeId) or find bridge account and try to get it from blockchain 
   ```ts
   const [bridgeAccount] = accounts.getBridgeAccount(tokenMint); 
   const [bridge] = await client.getBridgeInfoSafe(bridgeAccount); // will throw error if bridge not exists
   ```
4. [Optional] If we want to pay fee with asset we're sending, we need to set `useAssetFee` flag to true and check if **bridgeFeeInfo** exists using [`isBridgeFeeInfoInitialized`](docs/classes/DeBridgeSolanaClient.md#isbridgefeeinfoinitialized). If **bridgeFeeInfo**->assetChainFee not exists we can't pay fee with assets and we also can't init **bridgeFeeInfo**.
5. [Optional] If we want to pass some additional data (external call data) we have two options - set SEND_HASHED flag and pass external call data off-chain (saves gas but automatic execution is unavailable) or save external call data into special Solana account (ExternalCallStorage) associated with send transaction
	- *ExtCallShortcut flow* - we need to pass external call shortcut (`keccak256(ext call data)`) and flags with 4th bit (8) set to send->submissionParams
	- *ExtCallStorage flow* - see [externall call preparation section](#external-call-data-preparation) 
6. Send! If we have a discount we want to pass it into `send` instruction, else we need to pass speical **no_discount** account (but [`buildSendInstruction`](docs/classes/DeBridgeSolanaClient.md#buildsendinstruction) calculates all the accounts under the hood). We also need to specify which wallet we want to use (user may have multiple wallets associated with same token mint), execution fee is a reward for automatic claim in target chain

### How to claim token from other blockchain to Solana
1. Check if chain is supported - we can't claim from unsupported chains, hence `chainSupportInfo` must exist and be in `Supported` state, see [`getChainSupportInfoSafe`](docs/classes/DeBridgeSolanaClient.md#getchainsupportinfosafe) for details
2. Check if bridge exists - [`getBridgeByDeBridgeId`](docs/classes/DeBridgeSolanaClient.md#getbridgebydebridgeid) (deAssets are claimed via **Send** bridge, assets are claimed via **Mint**) and in **Working** state - if bridge doesn't exist we can't send tokens and we need to init bridge first (see bridge initialization->mint).
3. Check if submission wasn't already claimed with [`isSubmissionUsed`](docs/classes/DeBridgeSolanaClient.md#issubmissionused)
4. Store confirmations from validators with `storeConfirmations` instruction (one transaction can store up to 6 signatures) which can be built with [`buildStoreSignaturesTransaction`](docs/classes/DeBridgeSolanaClient.md#buildstoresignaturestransaction), this transactions can be signed and sent in a batch mode.
5. [Optional] If we have external call data we need to check if SEND_HASHED_FLAG is set. If flag is not set we need to fill ExternalCallStorage
	- *ExtCallStorage flow* - see [externall call preparation section](#external-call-data-preparation) 
6. All checks from steps 1,2 and 3 can be performed in automatic mode with function [`checkClaimParams`](docs/classes/DeBridgeSolanaClient.md#checkclaimparams) - check if submission is not already claimed, check bridge balance, check chainSupportInfo and Bridge.
7. Create store confirmations with `buildStoreConfirmationsTransaction`, you can get signatures from API using `/api/SubmissionConfirmations/getForSubmission` route.
8. Claim! just call `claim` instruction built with [`buildClaimTransaction`](docs/classes/DeBridgeSolanaClient.md#buildclaimtransaction) after all signatures were saved - this can be checked with [`isTransactionConfirmed`](docs/classes/DeBridgeSolanaClient.md#istransactionconfirmed) or [`getConfirmationsCount`](docs/classes/DeBridgeSolanaClient.md#getconfirmationscount)
9. [Optional] if external call exists, we need to execute it, we could execute them by calling `buildOptimalExecuteExternalCallTransaction`. This function tries to build tx with execution of as much as possible external instructions. Need to be called until external call is executed or fails to execute.

### External call data preparation

Since solana's transaction size limit is 1232 bytes we can't store all external call data in single transaction, hence we need to split the data in chunks and send bunch of chunks in different transactions. 
We need to call [`initExternalCallStorage`](docs/classes/DeBridgeSolanaClient.md#buildinitexternalcallinstruction) instruction (storageKey = external call shortcut - **claim**/extCallShortcut - **send**, external call length = external call data length, source chain id = source chain - **claim**/solana id - **send**) to allocate memory and fill first chunk. If external call data is larger than ~800 bytes, we need to initialize externall call storage and fill it with data calling `extendExternalCallStorage` instruction [`buildExtendExternalCallStorageInstruction`](docs/classes/DeBridgeSolanaClient.md#buildextendexternalcallstorageinstruction). 

Function [`prepareExtCallTransactions`](https://github.com/debridge-finance/solana-contracts-client/blob/develop/docs/classes/DeBridgeSolanaClient.md#prepareextcalltransactions) splits data into chunks of optimal size and returns array of transactions to execute. First tx is `initExternalCallStorage`, rest (optional) are `extendExternalCallStorage`. `initExternalCallStorage` allocates required memory space in blockchain and fills it with initial data chunk. Since we can't write data to not-yet-allocated memory we have to wait until first transaction is finalized and extCallStorage is allocated. After that we can send rest transactions in a batch mode and wait until Solana processes them. We can check if storage was filled correctly using [`isExtCallStorageCorrect`](docs/classes/DeBridgeSolanaClient.md#isextcallstoragecorrect) 

### Bridge initialization
- Send bridge - to init send bridge we need to call `initializeSendBridge` instruction for SPL-token mint that we want to init - [`buildInitializeSendBridgeTransaction`](docs/classes/DeBridgeSolanaClient.md#buildinitializesendbridgetransaction).
- Mint bridge - to init mint bridge we need to `storeConfirmations` for deploy info, wait until confirmations are saved and then call `initializeMintBridge` instruction - [`buildInitializeMintBridgeTransaction`](docs/classes/DeBridgeSolanaClient.md#buildextendexternalcallstorageinstruction)

### Entities
- State - unique, contains oracles, required oracles, min confirmations, if protocol is active and other system information.
- Bridge (general info) - contains bridge state (working/paused), collected fee and other system information.
- Send bridge - assocated with token, contains amount of locked tokens, native SPL-token address and general bridge info
- Mint bridge - associated with token in outter chain and outer chain id, contains amount of minted tokens, source chain id, source token address and general bridge info
- ChainSupportInfo - associated with chain, contains **State** (supported/unsupported) of target chain and fixedFee/transferFee values (if values are None globalFixedFee/globalTransferFee will be used)
- BridgeFeeInfo - associated with bridge, contains assetChainFee option (None or value, if None asset chain fee is unsupported)

## Examples
**TODO:** Tests are available at the moment

### Claim flow
![sendClaim-Page-1 drawio](https://user-images.githubusercontent.com/11212162/165912819-52f54d7e-775e-4917-8d06-faa25b065adc.png)

### Send flow
![sendClaim-Page-2 drawio](https://user-images.githubusercontent.com/11212162/165914211-cc0f80a1-0a47-4f4c-a628-11aa15e56ee7.png)
