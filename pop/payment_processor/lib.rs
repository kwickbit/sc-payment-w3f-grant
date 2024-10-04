#![cfg_attr(not(feature = "std"), no_std, no_main)]



#[ink::contract]
mod payment_processor {

    use ink::env::Error as EnvError;
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

        fn convert_to_hash(family: &str, para_id: u32) -> [u8; 32] {
            let acc_type = "AccountId32";
            let acc_type_len = (acc_type.len() as u32).saturating_add(32u32);

            let mut input: Vec<u8> = Vec::new();

            input.extend(family.as_bytes().to_vec());
            input.extend(Compact(para_id).encode());
            input.extend(Compact(acc_type_len).encode());
            input.extend(acc_type.as_bytes().to_vec());
            input.extend(Self::env().account_id().0);

            let mut output = <Blake2x256 as HashOutput>::Type::default(); // 256-bit buffer
            hash_bytes::<Blake2x256>(input.as_slice(), &mut output);

            output
        }

        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                paid: Mapping::new(),
                beneficiary: Self::env().caller(),
                owner: Self::env().caller(),
                fee_perthousand: 15,
            }
        }

        fn get_ah_address() -> [u8; 32] {
            Self::convert_to_hash("SiblingChain", 4001)
        }

        #[ink(message)]
        pub fn pay(&mut self, encoded_extrinsic: Vec<u8>, fee_max: u128, ref_time: u64, proof_size: u64) -> Result<XcmHash, RuntimeError> {
            let ah = Junctions::from([Parachain(1000)]);
            let destination: Location = Location { parents: 1, interior: ah};
            let asset: Asset = (Location::parent(), fee_max).into();
            let refund_location: Location = AccountId32{network: None, id: Self::get_ah_address()}.into();

            let message: Xcm<()> = Xcm::builder()
                .withdraw_asset(asset.clone().into())
                .buy_execution(asset, Unlimited)
                .transact(
                    OriginKind::SovereignAccount,
                    Weight::from_parts(ref_time, proof_size),
                    encoded_extrinsic.into(),
                )
                .refund_surplus()
                .deposit_asset(Wild(WildAsset::All), refund_location)
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


#[cfg(all(test, feature = "e2e-tests"))]
mod e2e_tests;