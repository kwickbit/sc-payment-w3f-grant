#![cfg_attr(not(feature = "std"), no_std, no_main)]

use sp_arithmetic::Perbill;


#[ink::contract]
mod payment_processor {

    use ink::env::Error as EnvError;
    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;
    use ink::xcm::prelude::*;
    use ink::xcm::v4::OriginKind;

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
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                paid: Mapping::new(),
                beneficiary: Self::env().caller(),
                owner: Self::env().caller(),
                fee_perthousand: 15,
            }
        }

        #[ink(message)]
        pub fn pay(&mut self, encoded_extrinsic: Vec<u8>, fee_max: u128, ref_time: u64, proof_size: u64, to_refund: [u8; 32]) -> Result<XcmHash, RuntimeError> {
            let ah = Junctions::from([Parachain(1000)]);
            let destination: Location = Location { parents: 1, interior: ah};
            let asset: Asset = (Location::parent(), fee_max).into();
            let to_refund: Location = AccountId32{network: None, id: to_refund}.into();

            let message: Xcm<()> = Xcm::builder()
                .withdraw_asset(asset.clone().into())
                .buy_execution(asset, Unlimited)
                .transact(
                    OriginKind::SovereignAccount,
                    Weight::from_parts(ref_time, proof_size),
                    encoded_extrinsic.into(),
                )
                .refund_surplus()
                .deposit_asset(Wild(WildAsset::All), to_refund)
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