//! # Non-Custodial Payment Processor
//!
//! This smart contract is designed to act as a non-custodial payment processor in a multi-chain environment, leveraging the Polkadot Asset Hub (Paseo) and cross-consensus messaging (XCM).
//!
//! ## Overview
//! The contract facilitates payments for users by interacting with the Asset Hub to process stablecoin transactions. It prevents double payments by tracking payment statuses and relies on an off-chain indexer to handle XCM result callbacks.
//!
//! ## Constants
//! - **`ASSET_ID`**: The ID of the asset on the Asset Hub. This contract uses asset ID `27` (e.g., USDC).
//! - **`REF_TIME`**: Reference time parameter for XCM execution.
//! - **`PROOF_SIZE`**: Proof size parameter for XCM execution.
//! - **`FEE_MAX`**: Maximum fees the contract is willing to pay for XCM execution on the Asset Hub.
//! - **Payment Statuses**:
//!   - **`PAYMENT_FAILED`**: Payment processing failed (`3`).
//!   - **`PAYMENT_DONE`**: Payment successfully completed (`1`).
//!   - **`PAYMENT_ONGOING`**: Payment is in progress (`2`).
//!   - **`PAYMENT_NO_STATUS`**: No payment associated with the given `payment_id` (`0`).
//!
//! ## Payment Flow Explanation
//! 1. **User Approval**: The user pre-approves a transfer of the payment amount (e.g., USDC) to the contract's address on the Asset Hub.
//! 2. **Calling the Contract**: The user calls the `pay` method on this contract, providing the `payment_id` and amount.
//! 3. **XCM Transmission**: The contract sends an XCM message to the Asset Hub to initiate the payment.
//! 4. **Event Detection**: Off-chain indexers detect the XCM result and call back the contract with success or failure.
//! 5. **Fund Transfer**: In case of success, the program transfers the funds to the recipient.

#![cfg_attr(not(feature = "std"), no_std, no_main)]

mod xcm;
const ASSET_ID: u32 = 27;
const REF_TIME: u64 = 1_000_000_000;
const PROOF_SIZE: u64 = 100_000;
const PAYMENT_FAILED: u8 = 3;
const PAYMENT_DONE: u8 = 1;
const PAYMENT_ONGOING: u8 = 2;
const PAYMENT_NO_STATUS: u8 = 0;


#[ink::contract]
mod payment_processor {
    use ink::codegen::Env;
    use crate::xcm::{AssetsCall, RuntimeCall};
    use sp_runtime::MultiAddress;
    use ink::env::{Error as EnvError};
    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;
    use ink::xcm::prelude::*;
    use ink::xcm::v4::OriginKind;
    use ink::env::hash_bytes;
    use ink::env::hash::{
        HashOutput,
        Blake2x256,
    };
    use scale::{Compact, Encode};
    use crate::{ASSET_ID, PAYMENT_DONE, PAYMENT_FAILED, PAYMENT_NO_STATUS, PAYMENT_ONGOING, PROOF_SIZE, REF_TIME};
    const FEE_MAX: Balance = 10_000_000_000;

    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum RuntimeError {
        XcmExecuteFailed,
        XcmSendFailed,
    }

    impl From<EnvError> for RuntimeError {
        fn from(e: EnvError) -> Self {
            use ink::env::ReturnErrorCode;
            match e {
                EnvError::ReturnError(ReturnErrorCode::XcmExecutionFailed) => {
                    RuntimeError::XcmExecuteFailed
                }
                EnvError::ReturnError(ReturnErrorCode::XcmSendFailed) => {
                    RuntimeError::XcmSendFailed
                }
                _ => panic!("Unexpected error from `pallet-contracts`."),
            }
        }
    }

    /// Stores payment statuses and the owner of the contract.
    #[ink(storage)]
    pub struct PaymentProcessor {
        /// Mapping of payment IDs to their statuses.
        payments: Mapping<Vec<u8>, u8>,
        /// Owner of the contract.
        owner: AccountId,
    }

    impl Default for PaymentProcessor {
        fn default() -> Self {
            Self::new()
        }
    }

    impl PaymentProcessor {

        /// Converts the provided parachain and account information into a hash.
        fn convert_to_hash(family: &str, para_id: u32, account_id: AccountId) -> [u8; 32] {
            let acc_type = "AccountId32";
            let acc_type_len = (acc_type.len() as u32).saturating_add(32u32);

            let mut input: Vec<u8> = Vec::new();

            input.extend(family.as_bytes().to_vec());
            input.extend(Compact(para_id).encode());
            input.extend(Compact(acc_type_len).encode());
            input.extend(acc_type.as_bytes().to_vec());
            input.extend(account_id.0);

            let mut output = <Blake2x256 as HashOutput>::Type::default(); // 256-bit buffer
            hash_bytes::<Blake2x256>(input.as_slice(), &mut output);

            output
        }

        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                payments: Mapping::new(),
                owner: Self::env().caller(),
            }
        }

        /// Returns the address of the contract on the sibling Asset Hub parachain.
        fn get_ah_address() -> [u8; 32] {
            Self::convert_to_hash("SiblingChain", 4001, Self::env().account_id())
        }

        /// Marks a payment as successfully completed.
        ///
        /// # Parameters
        /// - `payment_id`: The unique ID of the payment.
        #[ink(message)]
        pub fn callback_success(&mut self, payment_id: Vec<u8>) -> Result<(), RuntimeError> {
            // Check if the caller is the owner
            assert_eq!(self.env().caller(), self.owner, "Caller is not authorized");

            self.payments.insert(payment_id, &PAYMENT_DONE);

            Ok(())
        }

        /// Marks a payment as failed.
        ///
        /// # Parameters
        /// - `payment_id`: The unique ID of the payment.
        #[ink(message)]
        pub fn callback_fail(&mut self, payment_id: Vec<u8>) -> Result<(), RuntimeError> {
            // Check if the caller is the owner
            assert_eq!(self.env().caller(), self.owner, "Caller is not authorized");

            self.payments.insert(payment_id, &PAYMENT_FAILED);

            Ok(())
        }

        /// Initiates a payment process.
        ///
        /// # Parameters
        /// - `amount`: The amount to be transferred.
        /// - `payment_id`: The unique ID of the payment.
        #[ink(message)]
        pub fn pay(
            &mut self,
            amount: u128,
            payment_id: [u8; 32]
        ) -> Result<XcmHash, RuntimeError> {
            // Check if payment_id is already going on
            let payment_status_opt = self.payments.get(payment_id.to_vec());
            assert_ne!(payment_status_opt, Some(PAYMENT_ONGOING), "Payment is on going already");
            assert_ne!(payment_status_opt, Some(PAYMENT_DONE), "Payment is already completed");

            let ah = Junctions::from([Parachain(1000)]);
            let destination: Location = Location { parents: 1, interior: ah};
            let asset: Asset = (Location::parent(), FEE_MAX).into();
            let sc_ah_address = Self::get_ah_address();
            let sc_location: Location = AccountId32{network: None, id: sc_ah_address}.into();

            let transfer_approved = RuntimeCall::Assets(AssetsCall::TransferApproved{
                id: ASSET_ID,
                owner: MultiAddress::<AccountId, ()>::Id(self.env().caller()),
                destination: MultiAddress::<AccountId, ()>::Id(AccountId::from(sc_ah_address)),
                amount
            });

            let message: Xcm<()> = Xcm::builder()
                .withdraw_asset(asset.clone().into())
                .buy_execution(asset, Unlimited)
                .set_appendix(
                    Xcm::builder_unsafe()
                        .refund_surplus()
                        .deposit_asset(
                            Wild(WildAsset::All),
                            sc_location.clone(),
                        )
                        .build(),
                )
                .set_error_handler(Xcm::builder_unsafe().report_error(QueryResponseInfo{
                    destination: destination.clone(),
                    query_id: u64::from_le_bytes(payment_id[0..8].try_into().unwrap()),
                    max_weight: Weight::from_parts(REF_TIME, PROOF_SIZE)
                }).build())
                .transact(
                    OriginKind::SovereignAccount,
                    Weight::from_parts(REF_TIME, PROOF_SIZE),
                    transfer_approved.encode().into(),
                )
                .expect_transact_status(MaybeErrorCode::Success)
                .set_topic(payment_id)
                .build();

            let hash = self.env().xcm_send(
                &VersionedLocation::V4(destination),
                &VersionedXcm::V4(message),
            )?;

            self.payments.insert(payment_id.to_vec(), &PAYMENT_ONGOING);

            Ok(hash)
        }

        #[ink(message)]
        pub fn generic_execute_ah(
            &mut self,
            encoded_extrinsic: Vec<u8>
        ) -> Result<XcmHash, RuntimeError> {
            let asset: Asset = (Location::parent(), FEE_MAX).into();
            let ah = Junctions::from([Parachain(1000)]);
            let dest: Location = Location { parents: 1, interior: ah};

            let message: Xcm<()> = Xcm::builder()
                .withdraw_asset(asset.clone().into())
                .buy_execution(asset.clone(), Unlimited)
                .transact(
                    OriginKind::SovereignAccount,
                    Weight::from_parts(REF_TIME, PROOF_SIZE),
                    encoded_extrinsic.into(),
                )
                .build();

            self.env()
                .xcm_send(&VersionedLocation::V4(dest), &VersionedXcm::V4(message))
                .map_err(Into::into)
        }

        /// Simply returns the current status of the payment.
        #[ink(message)]
        pub fn get(&self, payment_id: Vec<u8>) -> u8 {
            self.payments.get(payment_id).unwrap_or(PAYMENT_NO_STATUS)
        }
    }


}


#[cfg(all(test, feature = "e2e-tests"))]
mod e2e_tests;