export type DebridgeSettingsProgram = {
    version: "1.4.0";
    name: "debridge_settings_program";
    docs: [
        "The 'debridge_settings_program' is Solana program provider settings for deBridge Protocol",
        "For security reasons, ownership of the main structures is carried out from this program.",
        "",
        "There are several roles for this module.",
        '- "👤 Protocol Authority" - multi-signature account with extra privilege for setup protocol settings',
        '- "👤 Stop Tap" - this account that has the authority to stop the protocol, but does not have the authority to start it',
        '- "👤 User" - user of our Protocol',
        '- "👤 Bridge Contract" - debridge contract program. It can change bridge data condition. This type of access can be granted by `mint_authority` account with pubkey from [`Bridge::get_mint_authority_address`]'
    ];
    instructions: [
        {
            name: "initializeState";
            docs: [
                "Constructor of program",
                "",
                "Initializes the state and main roles in the system",
                "Whoever calls him becomes authority",
                "",
                "# Arguments",
                "* `confirmation_threshold` - how many transactions are needed within one slot to use `excess_confirmation` instead of `min_confirmations`",
                "* `excess_confirmation` - extra number of confirmations required to confirm actions in the system",
                "* `min_confirmation` - minimum number of confirmations required to confirm actions in the system",
                "",
                "# Events",
                "* [`events::StateInitialized`]",
                "",
                "# Roles",
                "* 👤 User - anyone can initialize state but program key signature needed"
            ];
            accounts: [
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: false;
                    docs: ["👤 Protocol Authority"];
                },
                {
                    name: "stopTap";
                    isMut: false;
                    isSigner: false;
                    docs: ["👤 Stop Tap"];
                },
                {
                    name: "feeBeneficiary";
                    isMut: false;
                    isSigner: false;
                    docs: [
                        "Beneficiary of the commission in the system",
                        "Implied that this will be an account belonging to another program (FeeProxy),",
                        "which will be responsible for the distribution of commissions"
                    ];
                },
                {
                    name: "systemProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System program account"];
                },
                {
                    name: "settingsProgram";
                    isMut: false;
                    isSigner: true;
                    docs: ["Need settings program signature to initialize state"];
                },
                {
                    name: "payer";
                    isMut: true;
                    isSigner: true;
                    docs: ["👤 User: Fund account for state initializing"];
                }
            ];
            args: [
                {
                    name: "confirmationThreshold";
                    type: "u32";
                },
                {
                    name: "excessConfirmations";
                    type: "u32";
                },
                {
                    name: "minConfirmations";
                    type: "u32";
                }
            ];
        },
        {
            name: "addOracle";
            docs: [
                "Add a public address (from Ethereum network) as an oracle to our protocol",
                "",
                "Oracles are those who can sign certain actions prescribed by the protocol by secp256k1",
                "algorithm.",
                "",
                "# Arguments",
                "* `oracle` - public address. Truncated hash from public key secp256k1",
                "* `is_required` - Is this oracle required to sign all actions to the system?",
                "",
                "# Events",
                "* [`events::OracleAdded`]",
                "",
                "# Roles",
                '* "👤 Protocol Authority" only',
                "",
                "# Errors",
                "* `ErrorCode::OracleDuplication` - If the oracle is already present inside the State",
                "* `ErrorCode::MaxOracleCount` - Oracles must be less",
                "than [`state::ORACLES_MAX_SIZE`] & [`state::REQUIRED_ORACLES_MAX_SIZE`] respectively",
                "* `ErrorCode::InvalidMinConfirmationCount` - If the new number of oracles violates the",
                "invariant for min confirmations (`min_confirmation > (oracles_len / 2) + 1`)"
            ];
            accounts: [
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                }
            ];
            args: [
                {
                    name: "oracle";
                    type: {
                        array: ["u8", 20];
                    };
                },
                {
                    name: "isRequired";
                    type: "bool";
                }
            ];
        },
        {
            name: "removeOracle";
            docs: [
                "Remove a public address from Ethereum network from the list of oracles of our protocol",
                "",
                "Oracles are those who can sign certain actions prescribed by the protocol by secp256k1",
                "algorithm.",
                "",
                "# Arguments",
                "* `removing_oracle` - public address. Truncated hash from public key secp256k1",
                "* `is_required` - Is this oracle required to sign all actions to the system?",
                "In this case, it is used to optimize the search in the list of oracles",
                "# Events",
                "* [`events::OracleRemoved`]",
                "",
                "# Roles",
                '* "👤 Protocol Authority" only'
            ];
            accounts: [
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                }
            ];
            args: [
                {
                    name: "removingOracle";
                    type: {
                        array: ["u8", 20];
                    };
                },
                {
                    name: "isRequired";
                    type: "bool";
                }
            ];
        },
        {
            name: "updateMinConfirmationCount";
            docs: [
                "Updates the number of minimum confirmations required for actions under the protocol",
                "",
                "# Arguments",
                "* `min_confirmation` - new number of minimum confirmations",
                "",
                "# Events",
                "* [`events::StateUpdated`]",
                "",
                "# Roles",
                '* "👤 Protocol Authority" only'
            ];
            accounts: [
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                }
            ];
            args: [
                {
                    name: "minConfirmation";
                    type: "u32";
                }
            ];
        },
        {
            name: "updateExcessConfirmationTimeslot";
            docs: [
                "Updates the timer, for check excess confirmation count",
                "",
                "# Arguments",
                "* `new_excess_confirmation_timeslot_seconds` - new timeslot duration in seconds",
                "",
                "# Events",
                "* [`events::StateUpdated`]",
                "",
                "# Roles",
                '* "👤 Protocol Authority" only'
            ];
            accounts: [
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                }
            ];
            args: [
                {
                    name: "newExcessConfirmationTimeslotSeconds";
                    type: "u64";
                }
            ];
        },
        {
            name: "updateExcessConfirmationCount";
            docs: [
                "Updates the number of excess confirmations required for actions under the protocol",
                "",
                "# Arguments",
                "* `excess_confirmation` - new number of excess confirmations",
                "",
                "# Events",
                "* [`events::StateUpdated`]",
                "",
                "# Roles",
                '* "👤 Protocol Authority" only'
            ];
            accounts: [
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                }
            ];
            args: [
                {
                    name: "excessConfirmations";
                    type: "u32";
                }
            ];
        },
        {
            name: "updateConfirmationThreshold";
            docs: [
                "Updates the number of how many transactions are needed within one slot",
                "to use `excess_confirmation` instead of `min_confirmations` from [`State`]",
                "",
                "# Events",
                "* [`events::StateUpdated`]",
                "",
                "# Roles",
                "* 👤 Protocol Authority only"
            ];
            accounts: [
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                }
            ];
            args: [
                {
                    name: "confirmationThreshold";
                    type: "u32";
                }
            ];
        },
        {
            name: "updateGlobalFee";
            docs: [
                "Updates values of global fix fee and transfer fee bps",
                "",
                "# Arguments",
                "* `global_fixed_fee` - new  global fixed fee",
                "* `global_transfer_fee` - new global transfer fee bps",
                "",
                "# Events",
                "* [`events::StateUpdated`]",
                "",
                "# Roles",
                "* 👤 Protocol Authority only"
            ];
            accounts: [
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                }
            ];
            args: [
                {
                    name: "globalFixedFee";
                    type: "u64";
                },
                {
                    name: "globalTransferFeeBps";
                    type: "u64";
                }
            ];
        },
        {
            name: "pauseState";
            docs: ["Pause state", "", "# Events", "* [`events::StateUpdated`]", "", "# Roles", "* 👤 Stop tap only"];
            accounts: [
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "stopTap";
                    isMut: false;
                    isSigner: true;
                    docs: ["👤 Stop Tap"];
                }
            ];
            args: [];
        },
        {
            name: "unpauseState";
            docs: ["Unpause state", "", "# Events", "* [`events::StateUpdated`]", "", "# Roles", "* 👤 Protocol Authority only"];
            accounts: [
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                }
            ];
            args: [];
        },
        {
            name: "updateStopTap";
            docs: [
                "Update StopTap account in [`State`] that has the authority to stop the protocol, but does not have the authority to start it",
                "",
                "# Events",
                "* [`events::StateUpdated`]",
                "",
                "# Roles",
                "* 👤 Protocol Authority only"
            ];
            accounts: [
                {
                    name: "updateState";
                    accounts: [
                        {
                            name: "state";
                            isMut: true;
                            isSigner: false;
                            docs: ["State account with service information", "There is a single state account for the entire program"];
                        },
                        {
                            name: "protocolAuthority";
                            isMut: false;
                            isSigner: true;
                            docs: ["Authority of protocol"];
                        }
                    ];
                },
                {
                    name: "account";
                    isMut: false;
                    isSigner: false;
                    docs: ["New value of some account stored in state"];
                }
            ];
            args: [];
        },
        {
            name: "updateFeeBeneficiary";
            docs: [
                "Update FeeBeneficiary account in [`State`] that has the authority to stop the protocol, but does not have the authority to start it",
                "",
                "# Events",
                "* [`events::StateUpdated`]",
                "",
                "# Roles",
                "* 👤 Protocol Authority only"
            ];
            accounts: [
                {
                    name: "updateState";
                    accounts: [
                        {
                            name: "state";
                            isMut: true;
                            isSigner: false;
                            docs: ["State account with service information", "There is a single state account for the entire program"];
                        },
                        {
                            name: "protocolAuthority";
                            isMut: false;
                            isSigner: true;
                            docs: ["Authority of protocol"];
                        }
                    ];
                },
                {
                    name: "account";
                    isMut: false;
                    isSigner: false;
                    docs: ["New value of some account stored in state"];
                }
            ];
            args: [];
        },
        {
            name: "updateProtocolAuthority";
            docs: [
                "Update Protocol Authority account in [`State`]",
                "",
                "# Events",
                "* [`events::StateUpdated`]",
                "",
                "# Roles",
                "* 👤 Protocol Authority only"
            ];
            accounts: [
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                },
                {
                    name: "newProtocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["New authority of protocol"];
                }
            ];
            args: [];
        },
        {
            name: "storeConfirmations";
            docs: [
                "Initialize or update [`ConfirmationStorage`] storage",
                "",
                "Due to the limitations of Solana on the length of transactions,",
                "we create a temporary storage for verified oracle keys that have already signed the message",
                "",
                "# Arguments",
                "* `msg` - Message whose signature is being verified",
                "",
                "# Events",
                "* [`events::OracleSignatureVerified]",
                "* [`events::Log]",
                "",
                "# Roles",
                "* 👤 User - anyone can store signature."
            ];
            accounts: [
                {
                    name: "state";
                    isMut: false;
                    isSigner: false;
                    docs: [
                        "State account with service information",
                        "There is a single state account for the entire program",
                        "",
                        "We use it here for filter oracle keys from instructions"
                    ];
                },
                {
                    name: "confirmationStorage";
                    isMut: true;
                    isSigner: false;
                    docs: [
                        "Temporary storage for signatures",
                        "Stores signatures for one day. Access is obtained by a signed message bytes",
                        "[`ConfirmationStorage`] inside account data"
                    ];
                },
                {
                    name: "instructions";
                    isMut: false;
                    isSigner: false;
                    docs: [
                        "Instructions system variable account",
                        "",
                        "Stores previous instructions within a transaction",
                        "We use to check the signatures"
                    ];
                },
                {
                    name: "systemProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System program account"];
                },
                {
                    name: "payer";
                    isMut: false;
                    isSigner: false;
                    docs: ["👤 User", "Signer if [`Self::confirmation_storage] not exists"];
                }
            ];
            args: [
                {
                    name: "msg";
                    type: "bytes";
                }
            ];
        },
        {
            name: "closeConfirmationStorageForSubmission";
            docs: [
                "Close the signature storage",
                "",
                "",
                "# Arguments",
                "* `msg` - Message whose signature is being verified",
                "",
                "# Roles",
                "* 👤 Protocol Authority",
                "If the composition of the oracles has completely changed, then it may be necessary to",
                "close the confirmation storage for create it anew and empty",
                "* 👤 User",
                "If the storage was used, then you can return the funds to the creator of the vault."
            ];
            accounts: [
                {
                    name: "state";
                    isMut: false;
                    isSigner: false;
                    docs: [
                        "State account with service information",
                        "There is a single state account for the entire program",
                        "",
                        "We use it here for filter oracle keys from instructions"
                    ];
                },
                {
                    name: "confirmationStorage";
                    isMut: true;
                    isSigner: false;
                    docs: [
                        "Temporary storage for signatures",
                        "Stores signatures for one day. Access is obtained by a signed message bytes",
                        "[`ConfirmationStorage`] inside account data"
                    ];
                },
                {
                    name: "confirmationStorageCreator";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "submission";
                    isMut: false;
                    isSigner: false;
                    docs: ["An account proving that the transfer was mad and with information", "about `original_claimer` account"];
                },
                {
                    name: "payer";
                    isMut: false;
                    isSigner: true;
                    docs: ["Transaction payer."];
                }
            ];
            args: [
                {
                    name: "msg";
                    type: {
                        array: ["u8", 32];
                    };
                }
            ];
        },
        {
            name: "initializeMintBridge";
            docs: [
                "Initialize new [`bridge::BridgeVariant::Mint`] bridge",
                "",
                "The action requires the signatures of the oracles",
                "The signatures are verified by the Solana runtime ([`anchor_lang::solana_program::secp256k1_program`]).",
                "We look at the previous instructions (the depth is calculated based on the number of oracles in the [`State`]) and if",
                "the instructions passed, then we confirm the action",
                "",
                "# Arguments",
                "* `deploy_info` - information about the new token signed in the previous transaction instruction",
                "",
                "# Events",
                "* [`events::Log`]",
                "* [`events::MintBridgeCreated`]",
                "",
                "# Roles",
                "* 👤 User - anyone can create a Mint Bridge by this method, however they need oracle signatures"
            ];
            accounts: [
                {
                    name: "bridgeData";
                    isMut: true;
                    isSigner: false;
                    docs: ["The account that we initialize to store data about the [`bridge::BridgeVariant::Mint`]"];
                },
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "feeBeneficiary";
                    isMut: false;
                    isSigner: false;
                    docs: [
                        "Beneficiary of the commission in the system",
                        "Implied that this will be an account belonging to another program (FeeProxy),",
                        "which will be responsible for the distribution of commissions"
                    ];
                },
                {
                    name: "payer";
                    isMut: true;
                    isSigner: true;
                    docs: ["👤 User"];
                },
                {
                    name: "tokenMint";
                    isMut: true;
                    isSigner: false;
                    docs: [
                        "This is our wrapped token [`token::Mint`] that we will be using",
                        "to represent tokens from [`deploy_info::DeployInfo::chain_id`] chain",
                        "",
                        "Initialization will take place inside [`Self::init_token_mint`]"
                    ];
                },
                {
                    name: "mintAuthority";
                    isMut: false;
                    isSigner: false;
                    docs: [
                        "A non-existent account belonging to our `debridge_program` to authorize program actions",
                        "with `staking_wallet` and mint new wrapping tokens"
                    ];
                },
                {
                    name: "confirmationStorage";
                    isMut: true;
                    isSigner: false;
                    docs: ["Confirmation storage"];
                },
                {
                    name: "confirmationStorageCreator";
                    isMut: true;
                    isSigner: false;
                    docs: ["Confirmation storage creator. Need for `confirmation_storage` creation fund returning"];
                },
                {
                    name: "systemProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System program account"];
                },
                {
                    name: "tokenProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System spl token program"];
                },
                {
                    name: "rent";
                    isMut: false;
                    isSigner: false;
                    docs: ["Sysvar rent for init mint inside"];
                },
                {
                    name: "tokenMetadataMaster";
                    isMut: false;
                    isSigner: false;
                    docs: ["Account with URI mask for mint bridge token logo"];
                },
                {
                    name: "tokenMetadataProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["Metaplex metadata program"];
                },
                {
                    name: "tokenMetadata";
                    isMut: true;
                    isSigner: false;
                    docs: ["Account with mint bridge token metadata"];
                }
            ];
            args: [
                {
                    name: "deployInfo";
                    type: {
                        defined: "DeployInfo";
                    };
                }
            ];
        },
        {
            name: "initializeSendBridge";
            docs: [
                "Initialize new [`bridge::BridgeVariant::Send`] bridge",
                "",
                "# Events",
                "* [`events::Log`]",
                "* [`events::SendBridgeCreated`]",
                "",
                "# Roles",
                "* 👤 User - anyone can create a Send Bridge by this method, if it's not exists"
            ];
            accounts: [
                {
                    name: "bridgeData";
                    isMut: true;
                    isSigner: false;
                    docs: ["The account that we initialize to store data about the [`bridge::BridgeVariant::Send`]"];
                },
                {
                    name: "bridgeIdMap";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "stakingWallet";
                    isMut: true;
                    isSigner: false;
                    docs: [
                        "Account for initialization that will store the token fee and staking native Solana tokens",
                        "It is owned by [`Self::mint_authority`]"
                    ];
                },
                {
                    name: "tokenMint";
                    isMut: false;
                    isSigner: false;
                    docs: ["This is native SPL Solana token for send it by new bridge"];
                },
                {
                    name: "mintAuthority";
                    isMut: false;
                    isSigner: false;
                    docs: [
                        "A non-existent account belonging to our `debridge_program` to authorize program actions",
                        "with `staking_wallet`"
                    ];
                },
                {
                    name: "systemProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System program account"];
                },
                {
                    name: "tokenProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System spl token program"];
                },
                {
                    name: "payer";
                    isMut: true;
                    isSigner: true;
                    docs: ["👤 User"];
                },
                {
                    name: "tokenMetadata";
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [];
        },
        {
            name: "updateFeeBridgeInfo";
            docs: [
                "Update or initialize new [`BridgeFeeInfo`] bridge",
                "",
                "This structure store information about asset fee in Bridge -> Chain",
                "",
                "# Arguments",
                "* `target_chain_id` - the commission chain for which we set",
                "* `chain_fee` - new chain fee",
                "",
                "# Events",
                "* [`events::BridgeFeeInfoInitialized`]",
                "",
                "# Roles",
                "* 👤 User - can create a [`BridgeFeeInfo`], but not set `chain_fee`",
                "* 👤 Protocol Authority - can initialize or update a [`BridgeFeeInfo`] and set `chain_fee`"
            ];
            accounts: [
                {
                    name: "bridgeData";
                    isMut: false;
                    isSigner: false;
                    docs: ["This is the bridge for which we add additional information with a commission"];
                },
                {
                    name: "tokenMint";
                    isMut: false;
                    isSigner: false;
                    docs: ["Bridge mint token, for additional validation that the bridge correct"];
                },
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "bridgeFee";
                    isMut: true;
                    isSigner: false;
                    docs: ["New account for storing commission information between Bridge -> Chain"];
                },
                {
                    name: "payer";
                    isMut: true;
                    isSigner: true;
                    docs: ["👤 User or 👤 Protocol Authority"];
                },
                {
                    name: "systemProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System program account"];
                },
                {
                    name: "tokenProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System spl token program"];
                }
            ];
            args: [
                {
                    name: "targetChainId";
                    type: {
                        array: ["u8", 32];
                    };
                },
                {
                    name: "chainFee";
                    type: "u64";
                }
            ];
        },
        {
            name: "initializeDiscountInfo";
            docs: [
                "Initialize new [`DiscountInfo`] structure",
                "",
                "This structure store information about discount for [`InitDiscountInfo::user`]",
                "",
                "# Arguments",
                "* `fix_bps` - information about fix fee discount",
                "* `transfer_bps` - information about transfer fee discount",
                "",
                "# Events",
                "* [`events::DiscountInitialized]",
                "",
                "# Roles",
                "* 👤 Protocol Authority"
            ];
            accounts: [
                {
                    name: "state";
                    isMut: false;
                    isSigner: false;
                    docs: ["State account with service information", "Use here for check [`Self::protocol_authority`]"];
                },
                {
                    name: "discountInfo";
                    isMut: true;
                    isSigner: false;
                    docs: ["Program account with information about user discount"];
                },
                {
                    name: "user";
                    isMut: false;
                    isSigner: false;
                    docs: ["The user for whom we are creating a discount"];
                },
                {
                    name: "systemProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System program account"];
                },
                {
                    name: "protocolAuthority";
                    isMut: true;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                }
            ];
            args: [
                {
                    name: "fixBps";
                    type: "u16";
                },
                {
                    name: "transferBps";
                    type: "u16";
                }
            ];
        },
        {
            name: "updateDiscountInfo";
            docs: [
                "Update account with [`DiscountInfo`] structure",
                "",
                "This structure store information about discount for [`UpdateDiscountInfo::user`]",
                "",
                "# Arguments",
                "* `is_active` - disable or enable discount for user",
                "* `fix_bps` - information about fix fee discount",
                "* `transfer_bps` - information about transfer fee discount",
                "",
                "# Events",
                "* [`events::DiscountInitialized]",
                "",
                "# Roles",
                "* 👤 Protocol Authority"
            ];
            accounts: [
                {
                    name: "state";
                    isMut: false;
                    isSigner: false;
                    docs: ["State account with service information", "Use here for check [`Self::protocol_authority`]"];
                },
                {
                    name: "discountInfo";
                    isMut: true;
                    isSigner: false;
                    docs: ["Program account with information about user discount"];
                },
                {
                    name: "user";
                    isMut: false;
                    isSigner: false;
                    docs: ["The user for whom the discount is being created"];
                },
                {
                    name: "systemProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System program account"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                }
            ];
            args: [
                {
                    name: "isActive";
                    type: "bool";
                },
                {
                    name: "fixBps";
                    type: "u16";
                },
                {
                    name: "transferBps";
                    type: "u16";
                }
            ];
        },
        {
            name: "updateChainSupportInfo";
            docs: [
                "Initialize account with [`ChainSupportInfo`]",
                "",
                "This structure store information about fees in transfer with `target_chain_id`",
                "",
                "# Arguments",
                "* `target_chain_id` - target chain",
                "* `chain_support_info_bump` - service information about public key of [`UpdateChainSupportInfo::chain_support_info`]",
                "* `is_supported` - disable or enable chain support",
                "* `fixed_fee` - new value for [`ChainSupportInfoVariant::Supported`] `fixed_fee` field",
                "* `transfer_fee` - new value for [`ChainSupportInfoVariant::Supported`] `transfer_fee` field",
                "* `chain_address_len` - specified for chain address len",
                "",
                "# Events",
                "* [`events::SupportChainInfoUpdated`]",
                "",
                "# Roles",
                "* 👤 Protocol Authority"
            ];
            accounts: [
                {
                    name: "state";
                    isMut: false;
                    isSigner: false;
                    docs: ["State account with service information", "Use here for check [`Self::protocol_authority`]"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                },
                {
                    name: "payer";
                    isMut: true;
                    isSigner: true;
                },
                {
                    name: "chainSupportInfo";
                    isMut: true;
                    isSigner: false;
                    docs: ["An account that stores support and commission information for a specific chain"];
                },
                {
                    name: "systemProgram";
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [
                {
                    name: "targetChainId";
                    type: {
                        array: ["u8", 32];
                    };
                },
                {
                    name: "isSupported";
                    type: "bool";
                },
                {
                    name: "fixedFee";
                    type: {
                        option: "u64";
                    };
                },
                {
                    name: "transferFee";
                    type: {
                        option: "u64";
                    };
                },
                {
                    name: "chainAddressLen";
                    type: "u16";
                }
            ];
        },
        {
            name: "setBridgeMaxAmount";
            docs: [
                "Set bridge max amount parameter",
                "",
                "# Arguments",
                "* `new_max_amount` - new maximum amount value for bridge",
                "",
                "# Events",
                "* [`events::BridgeMaxAmountSetted`]",
                "",
                "# Roles",
                "* 👤 Protocol Authority"
            ];
            accounts: [
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                },
                {
                    name: "bridgeData";
                    isMut: true;
                    isSigner: false;
                    docs: [
                        "The account contains all the information about the operation of the bridge",
                        "",
                        "There are the address of the token with which the bridge works,",
                        "the amount of liquidity stored, the collected fee amount and",
                        "the settings for the operation of the bridge"
                    ];
                },
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "tokenMint";
                    isMut: false;
                    isSigner: false;
                    docs: ["The mint account of the token with which the bridge works"];
                },
                {
                    name: "tokenProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System spl token program"];
                }
            ];
            args: [
                {
                    name: "newMaxAmount";
                    type: "u64";
                }
            ];
        },
        {
            name: "setBridgeMinReservedBps";
            docs: [
                "Set bridge min reserved bps parameter",
                "",
                "# Arguments",
                "* `new_min_reserved_bps` - new minimum reserved bps value for bridge",
                "# Events",
                "* [`events::BridgeMinReservedBpsSetted`]",
                "",
                "# Roles",
                "* 👤 Protocol Authority"
            ];
            accounts: [
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                },
                {
                    name: "bridgeData";
                    isMut: true;
                    isSigner: false;
                    docs: [
                        "The account contains all the information about the operation of the bridge",
                        "",
                        "There are the address of the token with which the bridge works,",
                        "the amount of liquidity stored, the collected fee amount and",
                        "the settings for the operation of the bridge"
                    ];
                },
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "tokenMint";
                    isMut: false;
                    isSigner: false;
                    docs: ["The mint account of the token with which the bridge works"];
                },
                {
                    name: "tokenProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System spl token program"];
                }
            ];
            args: [
                {
                    name: "newMinReservedBps";
                    type: "u64";
                }
            ];
        },
        {
            name: "pauseBridge";
            docs: ["Emergency bridge stop", "", "# Events", "* [`events::BridgeWorkToggled`]", "", "# Roles", "* 👤 Stop Tap"];
            accounts: [
                {
                    name: "stopTap";
                    isMut: false;
                    isSigner: true;
                    docs: ["👤 Stop Tap"];
                },
                {
                    name: "bridgeData";
                    isMut: true;
                    isSigner: false;
                    docs: ["Bridge account to be stopped"];
                },
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "tokenMint";
                    isMut: false;
                    isSigner: false;
                    docs: ["The mint account of the token with which the bridge works"];
                },
                {
                    name: "tokenProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System spl token program"];
                }
            ];
            args: [];
        },
        {
            name: "unpauseBridge";
            docs: ["Unlocking the bridge", "", "# Events", "* [`events::BridgeWorkToggled`]", "", "# Roles", "* 👤 Protocol Authority"];
            accounts: [
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["Authority of protocol"];
                },
                {
                    name: "bridgeData";
                    isMut: true;
                    isSigner: false;
                    docs: ["Bridge account to be run"];
                },
                {
                    name: "state";
                    isMut: true;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "tokenMint";
                    isMut: false;
                    isSigner: false;
                    docs: ["The mint account of the token with which the bridge works"];
                },
                {
                    name: "tokenProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System spl token program"];
                }
            ];
            args: [];
        },
        {
            name: "resetFreezeAuthorityBatch";
            accounts: [
                {
                    name: "tokenProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System spl token program"];
                }
            ];
            args: [];
        },
        {
            name: "initMetadataMaster";
            docs: ["Initialize mint bridge SPL-token metadata URI mask", "", "# Roles", "👤 Protocol Authority"];
            accounts: [
                {
                    name: "tokenMetadataMaster";
                    isMut: true;
                    isSigner: false;
                    docs: ["Account with URI mask for mint bridge token logo"];
                },
                {
                    name: "state";
                    isMut: false;
                    isSigner: false;
                    docs: ["State account with service information", "There is a single state account for the entire program"];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["👤 Protocol Authority"];
                },
                {
                    name: "payer";
                    isMut: true;
                    isSigner: true;
                    docs: ["👤 User: Fund account for metadata master initializing"];
                },
                {
                    name: "systemProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["System program account"];
                }
            ];
            args: [
                {
                    name: "initPrefix";
                    type: "string";
                },
                {
                    name: "initPostfix";
                    type: "string";
                }
            ];
        },
        {
            name: "updateMetadataMaster";
            docs: ["Update mint bridge SPL-token metadata URI mask", "", "# Roles", "👤 Protocol Authority"];
            accounts: [
                {
                    name: "tokenMetadataMaster";
                    isMut: true;
                    isSigner: false;
                    docs: ["Account with URI mask for mint bridge token logo"];
                },
                {
                    name: "state";
                    isMut: false;
                    isSigner: false;
                    docs: [
                        "State account with service information",
                        "There is a single state account for the entire program",
                        "",
                        "We use it here for filter oracle keys from instructions"
                    ];
                },
                {
                    name: "protocolAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: ["👤 Protocol Authority"];
                }
            ];
            args: [
                {
                    name: "newPrefix";
                    type: "string";
                },
                {
                    name: "newPostfix";
                    type: "string";
                }
            ];
        },
        {
            name: "updateMintBridgeTokenUri";
            docs: [
                "Update mint bridge SPL-token URI, based on mask from [`UpdateMintBridgeTokenMetadata::token_metadata_master`]",
                "",
                "# Roles",
                "👤 Protocol Authority"
            ];
            accounts: [
                {
                    name: "updateBridge";
                    accounts: [
                        {
                            name: "protocolAuthority";
                            isMut: false;
                            isSigner: true;
                            docs: ["Authority of protocol"];
                        },
                        {
                            name: "bridgeData";
                            isMut: true;
                            isSigner: false;
                            docs: [
                                "The account contains all the information about the operation of the bridge",
                                "",
                                "There are the address of the token with which the bridge works,",
                                "the amount of liquidity stored, the collected fee amount and",
                                "the settings for the operation of the bridge"
                            ];
                        },
                        {
                            name: "state";
                            isMut: true;
                            isSigner: false;
                            docs: ["State account with service information", "There is a single state account for the entire program"];
                        },
                        {
                            name: "tokenMint";
                            isMut: false;
                            isSigner: false;
                            docs: ["The mint account of the token with which the bridge works"];
                        },
                        {
                            name: "tokenProgram";
                            isMut: false;
                            isSigner: false;
                            docs: ["System spl token program"];
                        }
                    ];
                },
                {
                    name: "tokenMetadataMaster";
                    isMut: false;
                    isSigner: false;
                    docs: ["Account with URI mask for mint bridge token logo"];
                },
                {
                    name: "tokenMetadataProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["Metaplex metadata program"];
                },
                {
                    name: "tokenMetadata";
                    isMut: true;
                    isSigner: false;
                    docs: ["Account with mint bridge token metadata"];
                }
            ];
            args: [];
        },
        {
            name: "updateMintBridgeTokenNames";
            accounts: [
                {
                    name: "updateBridge";
                    accounts: [
                        {
                            name: "protocolAuthority";
                            isMut: false;
                            isSigner: true;
                            docs: ["Authority of protocol"];
                        },
                        {
                            name: "bridgeData";
                            isMut: true;
                            isSigner: false;
                            docs: [
                                "The account contains all the information about the operation of the bridge",
                                "",
                                "There are the address of the token with which the bridge works,",
                                "the amount of liquidity stored, the collected fee amount and",
                                "the settings for the operation of the bridge"
                            ];
                        },
                        {
                            name: "state";
                            isMut: true;
                            isSigner: false;
                            docs: ["State account with service information", "There is a single state account for the entire program"];
                        },
                        {
                            name: "tokenMint";
                            isMut: false;
                            isSigner: false;
                            docs: ["The mint account of the token with which the bridge works"];
                        },
                        {
                            name: "tokenProgram";
                            isMut: false;
                            isSigner: false;
                            docs: ["System spl token program"];
                        }
                    ];
                },
                {
                    name: "tokenMetadataMaster";
                    isMut: false;
                    isSigner: false;
                    docs: ["Account with URI mask for mint bridge token logo"];
                },
                {
                    name: "tokenMetadataProgram";
                    isMut: false;
                    isSigner: false;
                    docs: ["Metaplex metadata program"];
                },
                {
                    name: "tokenMetadata";
                    isMut: true;
                    isSigner: false;
                    docs: ["Account with mint bridge token metadata"];
                }
            ];
            args: [
                {
                    name: "newName";
                    type: "string";
                },
                {
                    name: "newSymbol";
                    type: "string";
                }
            ];
        },
        {
            name: "stakeBalance";
            docs: [
                "Add in bridge data amount of new staking tokens",
                "",
                "# Arguments",
                "* `amount` - amount of staking tokens",
                "",
                "# Roles",
                "👤 Bridge Contract"
            ];
            accounts: [
                {
                    name: "mintAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: [
                        "The PDA that is the authorization for the transfer of tokens to the user",
                        "",
                        "It's wrapper token mint authority account for mint bridge,",
                        "staking token account owner for send bridge and changing",
                        "balance in bridge_data"
                    ];
                },
                {
                    name: "bridgeData";
                    isMut: true;
                    isSigner: false;
                    docs: [
                        "The account contains all the information about the operation of the bridge",
                        "",
                        "There are the address of the token with which the bridge works,",
                        "the amount of liquidity stored, the collected fee amount and",
                        "the settings for the operation of the bridge"
                    ];
                },
                {
                    name: "tokenMint";
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [
                {
                    name: "amount";
                    type: "u64";
                }
            ];
        },
        {
            name: "releaseBalance";
            docs: [
                "Subtract from bridge data amount of claiming tokens",
                "",
                "# Arguments",
                "* `amount` - amount of claiming tokens",
                "",
                "# Roles",
                "👤 Bridge Contract"
            ];
            accounts: [
                {
                    name: "mintAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: [
                        "The PDA that is the authorization for the transfer of tokens to the user",
                        "",
                        "It's wrapper token mint authority account for mint bridge,",
                        "staking token account owner for send bridge and changing",
                        "balance in bridge_data"
                    ];
                },
                {
                    name: "bridgeData";
                    isMut: true;
                    isSigner: false;
                    docs: [
                        "The account contains all the information about the operation of the bridge",
                        "",
                        "There are the address of the token with which the bridge works,",
                        "the amount of liquidity stored, the collected fee amount and",
                        "the settings for the operation of the bridge"
                    ];
                },
                {
                    name: "tokenMint";
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [
                {
                    name: "amount";
                    type: "u64";
                }
            ];
        },
        {
            name: "stakeFee";
            docs: ["Add in bridge data fee", "", "# Arguments", "* `amount` - amount of staking fee", "", "# Roles", "👤 Bridge Contract"];
            accounts: [
                {
                    name: "mintAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: [
                        "The PDA that is the authorization for the transfer of tokens to the user",
                        "",
                        "It's wrapper token mint authority account for mint bridge,",
                        "staking token account owner for send bridge and changing",
                        "balance in bridge_data"
                    ];
                },
                {
                    name: "bridgeData";
                    isMut: true;
                    isSigner: false;
                    docs: [
                        "The account contains all the information about the operation of the bridge",
                        "",
                        "There are the address of the token with which the bridge works,",
                        "the amount of liquidity stored, the collected fee amount and",
                        "the settings for the operation of the bridge"
                    ];
                },
                {
                    name: "tokenMint";
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [
                {
                    name: "amount";
                    type: "u64";
                }
            ];
        },
        {
            name: "releaseFee";
            docs: [
                "Withdraw from bridge data fee",
                "",
                "# Arguments",
                "* `amount` - amount of withdrawing fee",
                "",
                "# Roles",
                "👤 Bridge Contract"
            ];
            accounts: [
                {
                    name: "mintAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: [
                        "The PDA that is the authorization for the transfer of tokens to the user",
                        "",
                        "It's wrapper token mint authority account for mint bridge,",
                        "staking token account owner for send bridge and changing",
                        "balance in bridge_data"
                    ];
                },
                {
                    name: "bridgeData";
                    isMut: true;
                    isSigner: false;
                    docs: [
                        "The account contains all the information about the operation of the bridge",
                        "",
                        "There are the address of the token with which the bridge works,",
                        "the amount of liquidity stored, the collected fee amount and",
                        "the settings for the operation of the bridge"
                    ];
                },
                {
                    name: "tokenMint";
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [
                {
                    name: "amount";
                    type: "u64";
                }
            ];
        },
        {
            name: "stakeNativeFee";
            docs: [
                "Add in bridge data native fee",
                "",
                "# Arguments",
                "* `amount` - amount of staking native tokens",
                "",
                "# Roles",
                "👤 Bridge Contract"
            ];
            accounts: [
                {
                    name: "mintAuthority";
                    isMut: false;
                    isSigner: true;
                    docs: [
                        "The PDA that is the authorization for the transfer of tokens to the user",
                        "",
                        "It's wrapper token mint authority account for mint bridge,",
                        "staking token account owner for send bridge and changing",
                        "balance in bridge_data"
                    ];
                },
                {
                    name: "bridgeData";
                    isMut: true;
                    isSigner: false;
                    docs: [
                        "The account contains all the information about the operation of the bridge",
                        "",
                        "There are the address of the token with which the bridge works,",
                        "the amount of liquidity stored, the collected fee amount and",
                        "the settings for the operation of the bridge"
                    ];
                },
                {
                    name: "tokenMint";
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [
                {
                    name: "amount";
                    type: "u64";
                }
            ];
        }
    ];
    accounts: [
        {
            name: "bridge";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "data";
                        type: {
                            defined: "BridgeVariant";
                        };
                    },
                    {
                        name: "bumps";
                        type: {
                            defined: "BridgeCommonBumps";
                        };
                    }
                ];
            };
        },
        {
            name: "sendBridgeMap";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "tokenMint";
                        type: "publicKey";
                    }
                ];
            };
        },
        {
            name: "bridgeFeeInfo";
            docs: ["Information about fee for each bridge and chain"];
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "bridgeFeeBump";
                        type: "u8";
                    },
                    {
                        name: "assetChainFee";
                        docs: ["Fee for this chain in bridge asset"];
                        type: {
                            option: "u64";
                        };
                    }
                ];
            };
        },
        {
            name: "chainSupportInfo";
            docs: ["Information about chain support and commissions within it"];
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "data";
                        type: {
                            defined: "ChainSupportInfoVariant";
                        };
                    },
                    {
                        name: "chainSupportInfoBump";
                        type: "u8";
                    }
                ];
            };
        },
        {
            name: "discountInfo";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "data";
                        type: {
                            defined: "DiscountInfoVariant";
                        };
                    },
                    {
                        name: "bump";
                        type: "u8";
                    }
                ];
            };
        },
        {
            name: "confirmationStorage";
            docs: [
                "This is a repository for oracle keys",
                "",
                "Due to computational limitations, we can only use the secp256k1 signature verification program",
                "provider by Solana",
                "",
                "Due to the size restrictions on one transaction, we must accumulate signatures, and not process with",
                "one transaction"
            ];
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "oracles";
                        type: {
                            vec: {
                                array: ["u8", 20];
                            };
                        };
                    },
                    {
                        name: "capacity";
                        type: "u64";
                    },
                    {
                        name: "bump";
                        type: "u8";
                    },
                    {
                        name: "creator";
                        docs: ["Information about the payer of the rent,", "for refund, when the storage is no longer necessary"];
                        type: "publicKey";
                    }
                ];
            };
        },
        {
            name: "state";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "status";
                        docs: ["Current full protocol status"];
                        type: {
                            defined: "Status";
                        };
                    },
                    {
                        name: "protocolAuthority";
                        docs: ["- 👤 Protocol Authority - multi-signature account with extra privilege for setup protocol settings"];
                        type: "publicKey";
                    },
                    {
                        name: "stopTap";
                        docs: [
                            "- 👤 Stop Tap - this account that has the authority to stop the protocol, but does not have the authority to start it"
                        ];
                        type: "publicKey";
                    },
                    {
                        name: "feeBeneficiary";
                        docs: [
                            "Beneficiary of the commission within the system",
                            "This is intended to be a separate profit sharing contract."
                        ];
                        type: "publicKey";
                    },
                    {
                        name: "oracles";
                        docs: ["deBridge oracles that provide signatures for verifying external actions"];
                        type: {
                            vec: {
                                array: ["u8", 20];
                            };
                        };
                    },
                    {
                        name: "requiredOracles";
                        docs: [
                            "Mandatory deBridge oracles that provide signatures for verifying external actions",
                            "Signatures of these oracles are always required"
                        ];
                        type: {
                            vec: {
                                array: ["u8", 20];
                            };
                        };
                    },
                    {
                        name: "confirmationGuard";
                        docs: ["Stores the logic of the required number of submissions for the actions"];
                        type: {
                            defined: "ConfirmationParamsGuard";
                        };
                    },
                    {
                        name: "globalFixedFee";
                        docs: ["Fixed fee in SOL"];
                        type: "u64";
                    },
                    {
                        name: "globalTransferFeeBps";
                        docs: ["Transfer fee in bridge tokens"];
                        type: "u64";
                    }
                ];
            };
        },
        {
            name: "tokenMetadataMaster";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "prefix";
                        type: "string";
                    },
                    {
                        name: "postfix";
                        type: "string";
                    }
                ];
            };
        }
    ];
    types: [
        {
            name: "BridgeInfo";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "maxAmount";
                        docs: ["Maximum amount to transfer"];
                        type: "u64";
                    },
                    {
                        name: "balance";
                        docs: ["Total locked assets"];
                        type: "u64";
                    },
                    {
                        name: "lockedInStrategies";
                        docs: ["Total locked assets in strategy (AAVE, Compound, etc)"];
                        type: "u64";
                    },
                    {
                        name: "minReservesBps";
                        docs: ["Minimal hot reserves in basis points (1/10000)"];
                        type: "u64";
                    },
                    {
                        name: "state";
                        type: {
                            defined: "BridgeState";
                        };
                    },
                    {
                        name: "collectedFee";
                        docs: ["Total collected fees"];
                        type: "u64";
                    },
                    {
                        name: "withdrawnFee";
                        docs: ["Fees that already withdrawn"];
                        type: "u64";
                    },
                    {
                        name: "collectedNativeFee";
                        docs: ["Total fees collected in lamports"];
                        type: "u64";
                    }
                ];
            };
        },
        {
            name: "BridgeCommonBumps";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "bridge";
                        type: "u8";
                    },
                    {
                        name: "mintAuthority";
                        type: "u8";
                    },
                    {
                        name: "stakingWallet";
                        type: "u8";
                    }
                ];
            };
        },
        {
            name: "DeployInfo";
            docs: ["This class represent information about wrapped token in this network"];
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "chainId";
                        type: {
                            array: ["u8", 32];
                        };
                    },
                    {
                        name: "nativeTokenAddress";
                        type: "bytes";
                    },
                    {
                        name: "name";
                        type: "string";
                    },
                    {
                        name: "symbol";
                        type: "string";
                    },
                    {
                        name: "decimals";
                        type: "u8";
                    }
                ];
            };
        },
        {
            name: "BridgeAndTokenMint";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "tokenMint";
                        type: {
                            array: ["u8", 32];
                        };
                    },
                    {
                        name: "bridge";
                        type: {
                            array: ["u8", 32];
                        };
                    }
                ];
            };
        },
        {
            name: "ConfirmationParamsGuard";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "currentTimeslot";
                        type: {
                            option: "u64";
                        };
                    },
                    {
                        name: "submissionInTimeslotCount";
                        type: "u32";
                    },
                    {
                        name: "confirmationThreshold";
                        type: "u32";
                    },
                    {
                        name: "excessConfirmations";
                        type: "u32";
                    },
                    {
                        name: "minConfirmations";
                        type: "u32";
                    },
                    {
                        name: "excessConfirmationTimeslot";
                        type: "u64";
                    }
                ];
            };
        },
        {
            name: "BridgeState";
            type: {
                kind: "enum";
                variants: [
                    {
                        name: "Work";
                    },
                    {
                        name: "Paused";
                    }
                ];
            };
        },
        {
            name: "BridgeVariant";
            type: {
                kind: "enum";
                variants: [
                    {
                        name: "Empty";
                    },
                    {
                        name: "Send";
                        fields: [
                            {
                                name: "info";
                                docs: ["Bridge settings and statistics"];
                                type: {
                                    defined: "BridgeInfo";
                                };
                            },
                            {
                                name: "native_token_address";
                                docs: ["The mint account of spl-token with which the bridge works"];
                                type: "publicKey";
                            }
                        ];
                    },
                    {
                        name: "Mint";
                        fields: [
                            {
                                name: "info";
                                docs: ["Bridge settings and statistics"];
                                type: {
                                    defined: "BridgeInfo";
                                };
                            },
                            {
                                name: "source_chain_id";
                                docs: ["The id of the chain of which the native token belongs"];
                                type: {
                                    array: ["u8", 32];
                                };
                            },
                            {
                                name: "native_token_address";
                                docs: ["The native token address from original network. Can have different size with chain specific"];
                                type: "bytes";
                            },
                            {
                                name: "token_mint_bump";
                                docs: ["The bump for creating PDA address of wrapped token mint account"];
                                type: "u8";
                            },
                            {
                                name: "deploy_id";
                                docs: ["The id that was used to initialize the bridge"];
                                type: {
                                    array: ["u8", 32];
                                };
                            },
                            {
                                name: "denominator";
                                docs: [
                                    "How many orders of magnitude the minimum value for the wrapped token is greater than that of the native token"
                                ];
                                type: "u8";
                            }
                        ];
                    }
                ];
            };
        },
        {
            name: "ChainSupportInfoVariant";
            docs: [
                "Internal information about chain support and commissions within it",
                "# Variants",
                "* [`ChainSupportInfoVariant::NotSupported`] - this chain not supported",
                "* [`ChainSupportInfoVariant::Supported] - this chain supported and we have `fixed_fee` & `transfer_fee` values for it"
            ];
            type: {
                kind: "enum";
                variants: [
                    {
                        name: "NotSupported";
                    },
                    {
                        name: "Supported";
                        fields: [
                            {
                                name: "fixed_fee";
                                docs: ["Fixed fee in SOL"];
                                type: {
                                    option: "u64";
                                };
                            },
                            {
                                name: "transfer_fee_bps";
                                docs: ["Transfer fee in bridge tokens"];
                                type: {
                                    option: "u64";
                                };
                            },
                            {
                                name: "chain_address_len";
                                docs: ["Length of address in this chain"];
                                type: "u16";
                            }
                        ];
                    }
                ];
            };
        },
        {
            name: "DiscountInfoVariant";
            type: {
                kind: "enum";
                variants: [
                    {
                        name: "Unactive";
                    },
                    {
                        name: "Active";
                        fields: [
                            {
                                name: "fix_bps";
                                type: "u16";
                            },
                            {
                                name: "transfer_bps";
                                type: "u16";
                            }
                        ];
                    }
                ];
            };
        },
        {
            name: "Status";
            type: {
                kind: "enum";
                variants: [
                    {
                        name: "Working";
                    },
                    {
                        name: "Paused";
                    }
                ];
            };
        }
    ];
    events: [
        {
            name: "Log";
            fields: [
                {
                    name: "msg";
                    type: "string";
                    index: false;
                }
            ];
        },
        {
            name: "StateInitialized";
            fields: [
                {
                    name: "authority";
                    type: "publicKey";
                    index: false;
                },
                {
                    name: "stopTap";
                    type: "publicKey";
                    index: false;
                },
                {
                    name: "feeBeneficiary";
                    type: "publicKey";
                    index: false;
                },
                {
                    name: "confirmationThreshold";
                    type: "u32";
                    index: false;
                },
                {
                    name: "excessConfirmations";
                    type: "u32";
                    index: false;
                },
                {
                    name: "minConfirmation";
                    type: "u32";
                    index: false;
                },
                {
                    name: "globalFixedFee";
                    type: "u64";
                    index: false;
                },
                {
                    name: "globalTransferFeeBps";
                    type: "u64";
                    index: false;
                }
            ];
        },
        {
            name: "StateUpdated";
            fields: [
                {
                    name: "authority";
                    type: "publicKey";
                    index: false;
                },
                {
                    name: "stopTap";
                    type: "publicKey";
                    index: false;
                },
                {
                    name: "feeBeneficiary";
                    type: "publicKey";
                    index: false;
                },
                {
                    name: "confirmationThreshold";
                    type: "u32";
                    index: false;
                },
                {
                    name: "excessConfirmations";
                    type: "u32";
                    index: false;
                },
                {
                    name: "minConfirmation";
                    type: "u32";
                    index: false;
                },
                {
                    name: "globalFixedFee";
                    type: "u64";
                    index: false;
                },
                {
                    name: "globalTransferFeeBps";
                    type: "u64";
                    index: false;
                }
            ];
        },
        {
            name: "OracleAdded";
            fields: [
                {
                    name: "newOracleKey";
                    type: {
                        array: ["u8", 20];
                    };
                    index: false;
                },
                {
                    name: "isRequired";
                    type: "bool";
                    index: false;
                }
            ];
        },
        {
            name: "OracleRemoved";
            fields: [
                {
                    name: "removedOracleKey";
                    type: {
                        array: ["u8", 20];
                    };
                    index: false;
                },
                {
                    name: "isTooBigMinConfirmation";
                    type: "bool";
                    index: false;
                },
                {
                    name: "isTooBigExcessConfirmation";
                    type: "bool";
                    index: false;
                }
            ];
        },
        {
            name: "MintBridgeCreated";
            fields: [
                {
                    name: "bridgeId";
                    type: {
                        array: ["u8", 32];
                    };
                    index: false;
                },
                {
                    name: "deployId";
                    type: {
                        array: ["u8", 32];
                    };
                    index: false;
                },
                {
                    name: "wrapperTokenAddress";
                    type: {
                        array: ["u8", 32];
                    };
                    index: false;
                }
            ];
        },
        {
            name: "SendBridgeTokenMeta";
            fields: [
                {
                    name: "tokenSymbol";
                    type: "string";
                    index: false;
                },
                {
                    name: "tokenName";
                    type: "string";
                    index: false;
                },
                {
                    name: "tokenMint";
                    type: "publicKey";
                    index: false;
                }
            ];
        },
        {
            name: "SendBridgeCreated";
            fields: [
                {
                    name: "bridgeId";
                    type: {
                        array: ["u8", 32];
                    };
                    index: false;
                }
            ];
        },
        {
            name: "BridgeMaxAmountSetted";
            fields: [
                {
                    name: "bridgeId";
                    type: {
                        array: ["u8", 32];
                    };
                    index: false;
                },
                {
                    name: "oldMaxAmount";
                    type: "u64";
                    index: false;
                },
                {
                    name: "newMaxAmount";
                    type: "u64";
                    index: false;
                }
            ];
        },
        {
            name: "BridgeMinReservedBpsSetted";
            fields: [
                {
                    name: "bridgeId";
                    type: {
                        array: ["u8", 32];
                    };
                    index: false;
                },
                {
                    name: "oldMinReservedBps";
                    type: "u64";
                    index: false;
                },
                {
                    name: "newMinReservedBps";
                    type: "u64";
                    index: false;
                }
            ];
        },
        {
            name: "BridgeWorkToggled";
            fields: [
                {
                    name: "bridgeId";
                    type: {
                        array: ["u8", 32];
                    };
                    index: false;
                },
                {
                    name: "isWorking";
                    type: "bool";
                    index: false;
                }
            ];
        },
        {
            name: "BridgeFeeInfoInitialized";
            fields: [
                {
                    name: "chainId";
                    type: {
                        array: ["u8", 32];
                    };
                    index: false;
                },
                {
                    name: "chainFee";
                    type: {
                        option: "u64";
                    };
                    index: false;
                }
            ];
        },
        {
            name: "OracleSignatureVerified";
            fields: [
                {
                    name: "msg";
                    type: "bytes";
                    index: false;
                },
                {
                    name: "oracleCount";
                    type: "u32";
                    index: false;
                }
            ];
        },
        {
            name: "DiscountInitialized";
            fields: [
                {
                    name: "user";
                    type: "publicKey";
                    index: false;
                }
            ];
        },
        {
            name: "SupportChainInfoUpdated";
            fields: [
                {
                    name: "chainId";
                    type: {
                        array: ["u8", 32];
                    };
                    index: false;
                },
                {
                    name: "isActive";
                    type: "bool";
                    index: false;
                }
            ];
        },
        {
            name: "FreezeAuthorityResetBatched";
            fields: [
                {
                    name: "batch";
                    type: {
                        vec: {
                            defined: "BridgeAndTokenMint";
                        };
                    };
                    index: false;
                }
            ];
        },
        {
            name: "AccountThawed";
            fields: [
                {
                    name: "account";
                    type: {
                        array: ["u8", 32];
                    };
                    index: false;
                },
                {
                    name: "tokenMint";
                    type: {
                        array: ["u8", 32];
                    };
                    index: false;
                },
                {
                    name: "bridge";
                    type: {
                        array: ["u8", 32];
                    };
                    index: false;
                }
            ];
        }
    ];
    errors: [
        {
            code: 6000;
            name: "StatePaused";
        },
        {
            code: 6001;
            name: "StateNotPaused";
        },
        {
            code: 16000;
            name: "AuthorityAccessError";
            msg: "Authority Action Only";
        },
        {
            code: 16001;
            name: "OracleNotFound";
            msg: "Oracle not found in State";
        },
        {
            code: 16002;
            name: "WrongSignature";
            msg: "Wrong Signature";
        },
        {
            code: 16003;
            name: "RequiredSignatureNeeded";
            msg: "No signature from Required oracle";
        },
        {
            code: 16004;
            name: "SignaturesVerificationError";
            msg: "Not correct signatures";
        },
        {
            code: 16005;
            name: "NotEnoughSignatures";
            msg: "Not enough signatures";
        },
        {
            code: 16006;
            name: "MaxOracleCount";
            msg: "Max oracle count";
        },
        {
            code: 16007;
            name: "OracleDuplication";
            msg: "Oracle duplication";
        },
        {
            code: 16008;
            name: "BridgeAlreadyInitialized";
            msg: "Bridge already initialized";
        },
        {
            code: 16009;
            name: "BridgeAlreadyWorking";
            msg: "Bridge already working";
        },
        {
            code: 16010;
            name: "BridgeAlreadyPaused";
            msg: "Bridge already paused";
        },
        {
            code: 16011;
            name: "BridgeNotInitialized";
            msg: "Bridge not initialized";
        },
        {
            code: 16012;
            name: "WrongDeployInfo";
            msg: "Your deploy info not correct for solana bridge";
        },
        {
            code: 16013;
            name: "SerializeError";
            msg: "Error while serialization data";
        },
        {
            code: 16014;
            name: "BadChainSupportedKey";
            msg: "Couldn't create chain support pubkey for the bridge";
        },
        {
            code: 16015;
            name: "ChainNotSupported";
        },
        {
            code: 16016;
            name: "BadNonce";
            msg: "Can't get nonce from provided account";
        },
        {
            code: 16017;
            name: "AssetFeeNotSupport";
            msg: "Asset fee doesn't support for this chain";
        },
        {
            code: 16018;
            name: "ExcessConfirmationError";
            msg: "The number of excess confirmations checks is less than the number of minimum confirmations checks";
        },
        {
            code: 16019;
            name: "InvalidParameter";
            msg: "Wrong parameter for `State`";
        },
        {
            code: 16020;
            name: "InvalidMinConfirmationCount";
            msg: "Min confirmation count not correct";
        },
        {
            code: 19107;
            name: "InvalidExcessConfirmationTimer";
        },
        {
            code: 16021;
            name: "InvalidTokenMint";
            msg: "Wrong token mint";
        },
        {
            code: 16022;
            name: "WrongInstructionSysvarAccount";
            msg: "WrongInstructionSysvarAccount";
        },
        {
            code: 16023;
            name: "InvalidVerificationSignatureKey";
            msg: "InvalidVerificationSignatureKey,";
        },
        {
            code: 16024;
            name: "NoConfirmationInstruction";
            msg: "No confirmation verification instruction,";
        },
        {
            code: 16025;
            name: "CreateTokenProgramError";
            msg: "CreateTokenProgramError,";
        },
        {
            code: 16026;
            name: "FailedToLoadSignatureVerificationInstruction";
            msg: "FailedToLoadSignatureVerificationInstruction,";
        },
        {
            code: 16027;
            name: "SignatureVerificationInstructionWrongProgramId";
            msg: "SignatureVerificationInstructionWrongProgramId,";
        },
        {
            code: 16028;
            name: "MathErrorWhileCalculateDepth";
            msg: "Mathematical error while calculate depth for check signature instruction";
        },
        {
            code: 16029;
            name: "MathErrorWhileCalculateRent";
            msg: "Mathematical error while calculate rent for signature storage";
        },
        {
            code: 16030;
            name: "WrongStakingWalletAccount";
            msg: "Your staking wallet account not correct";
        },
        {
            code: 16031;
            name: "UnauthorizedAttemptToCloseConfirmationStore";
            msg: "Only 👤 Protocol Authority can close the signature store if it is not used";
        },
        {
            code: 16032;
            name: "NotEnoughAmount";
            msg: "Not enough amount at bridge";
        },
        {
            code: 16033;
            name: "NoConfirmationStorage";
            msg: "Can't find confirmation storage";
        },
        {
            code: 16034;
            name: "NotProtocolAuthority";
            msg: "Protocol Authority mustn't set for another role";
        },
        {
            code: 16035;
            name: "WrongDiscountInfo";
            msg: "Provided discount info account with wrong key";
        },
        {
            code: 16036;
            name: "ThresholdConfirmationError";
            msg: "Threshold confirmation count not correct";
        },
        {
            code: 16037;
            name: "WrongSignatureIndexes";
            msg: "Wrong index in signature context";
        },
        {
            code: 16038;
            name: "InvalidBridgeMapKey";
            msg: "Invalid bridge map key";
        },
        {
            code: 16039;
            name: "InvalidAccountsLength";
            msg: "Invalid accounts length";
        }
    ];
};
export declare const IDL: DebridgeSettingsProgram;
//# sourceMappingURL=debridge_settings_program.d.ts.map