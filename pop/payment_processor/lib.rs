#![cfg_attr(not(feature = "std"), no_std, no_main)]

mod xcm;
const ASSET_ID: u32 = 27;
const REF_TIME: u64 = 1_000_000_000;
const PROOF_SIZE: u64 = 100_000;

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
    use crate::{ASSET_ID, PROOF_SIZE, REF_TIME};
    const FEE_MAX: Balance = 1;

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

    #[ink(storage)]
    pub struct PaymentProcessor {
        paid: Mapping<Vec<u8>, bool>,
        ongoing: Mapping<Vec<u8>, bool>,
        beneficiary: AccountId,
        owner: AccountId,
        fee_perthousand: u32,
    }

    impl Default for PaymentProcessor {
        fn default() -> Self {
            Self::new()
        }
    }

    impl PaymentProcessor {

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
                paid: Mapping::new(),
                ongoing: Mapping::new(),
                beneficiary: Self::env().caller(),
                owner: Self::env().caller(),
                fee_perthousand: 15,
            }
        }

        #[ink(message)]
        pub fn callback_success(&mut self, payment_id: Vec<u8>) -> Result<(), RuntimeError> {
            // Convert payment_id to hex format and print
            let payment_id_hex = hex::encode(&payment_id);
            ink::env::debug_println!("callback got called with payment_id in hex: {}", payment_id_hex);

            self.ongoing.insert(payment_id.clone(), &false);
            self.paid.insert(payment_id, &true);

            Ok(())
        }

        fn get_ah_address() -> [u8; 32] {
            Self::convert_to_hash("SiblingChain", 4001, Self::env().account_id())
        }

        #[ink(message)]
        pub fn pay(
            &mut self,
            amount: u128,
            payment_id: [u8; 32],
            fee_max: Balance,
        ) -> Result<XcmHash, RuntimeError> {
            let ah = Junctions::from([Parachain(1000)]);
            let destination: Location = Location { parents: 1, interior: ah};
            let asset: Asset = (Location::parent(), fee_max).into();
            let sc_ah_address = Self::get_ah_address();
            let sc_location: Location = AccountId32{network: None, id: sc_ah_address}.into();

            let transfer_approved = RuntimeCall::Assets(AssetsCall::TransferApproved{
                id: ASSET_ID,
                owner: MultiAddress::<AccountId, ()>::Id(self.env().caller()),
                destination: MultiAddress::<AccountId, ()>::Id(AccountId::from(sc_ah_address)),
                amount
            });

            let mut error_handler_instructions = Vec::new();
            error_handler_instructions.push(RefundSurplus);
            error_handler_instructions.push(DepositAsset {
                assets: All.into(),
                beneficiary: sc_location.clone(),
            });

            let message: Xcm<()> = Xcm::builder()
                .withdraw_asset(asset.clone().into())
                .buy_execution(asset, Unlimited)
                .set_topic(payment_id)
                .transact(
                    OriginKind::SovereignAccount,
                    Weight::from_parts(REF_TIME, PROOF_SIZE),
                    transfer_approved.encode().into(),
                )
                // .set_error_handler(Xcm(error_handler_instructions))
                .set_topic(payment_id)
                .refund_surplus()
                .set_topic(payment_id)
                .deposit_asset(Wild(WildAsset::All), sc_location)
                .set_topic(payment_id)
                .build();

            let hash = self.env().xcm_send(
                &VersionedLocation::V4(destination),
                &VersionedXcm::V4(message),
            )?;

            Ok(hash)
        }

        /// Simply returns the current value of our `bool`.
        #[ink(message)]
        pub fn get(&self, payment_id: Vec<u8>) -> bool {
            self.paid.get(payment_id).unwrap_or(false)
        }
    }

    #[derive(Clone, PartialEq, Eq, Debug)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub struct PaymentId {
        pub value: Vec<u8>,
    }

    #[derive(Clone, PartialEq, Eq, Debug)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub struct PaymentInformation {
        pub sender: AccountId,
        pub amount: u128,
        pub asset_id: u128,
        pub payment_id: PaymentId,
    }

}

#[cfg(test)]
mod tests {
    use ink::xcm::latest::{Asset, Junctions, Location};
    use ink::xcm::prelude::{AccountId32, Parachain};
    use super::*;
    // #[ink::test]
    // fn log_xcm_message() {
    //     let fee_max = 10000000000;
    //     let ah = Junctions::from([Parachain(1000)]);
    //     let destination: Location = Location { parents: 1, interior: ah};
    //     let asset: Asset = (Location::parent(), fee_max).into();
    //     let sc_ah_address = env;
    //     let sc_location: Location = AccountId32{network: None, id: sc_ah_address}.into();
    // 
    //     let transfer_approved = RuntimeCall::Assets(AssetsCall::TransferApproved{
    //         id: ASSET_ID,
    //         owner: MultiAddress::<AccountId, ()>::Id(self.env().caller()),
    //         destination: MultiAddress::<AccountId, ()>::Id(AccountId::from(sc_ah_address)),
    //         amount
    //     });
    //     let message: Xcm<()> = Xcm::builder()
    //         .withdraw_asset(asset.clone().into())
    //         .buy_execution(asset, Unlimited)
    //         .set_topic(payment_id)
    //         .transact(
    //             OriginKind::SovereignAccount,
    //             Weight::from_parts(ref_time, proof_size),
    //             transfer_approved.encode().into(),
    //         )
    //         .refund_surplus()
    //         .deposit_asset(Wild(WildAsset::All), sc_location)
    //         .build();
    //     
    //     ink::env::debug_println!("log_xcm_message {:?}", message);
    // }
}

#[cfg(all(test, feature = "e2e-tests"))]
mod e2e_tests;