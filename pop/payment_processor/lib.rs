#![cfg_attr(not(feature = "std"), no_std, no_main)]


#[ink::contract]
mod payment_processor {
    use ink::env::Error as EnvError;
    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;
    use ink::xcm::prelude::*;
    use sp_arithmetic::Perbill;

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

        /// A message to pay for a specific transaction
        #[ink(message)]
        pub fn pay(&mut self, payment_info: PaymentInformation) -> Result<XcmHash, RuntimeError> {

            let fee_amount = Perbill::from_perthousand(1).saturating_reciprocal_mul(payment_info.amount);

            let ah = Junctions::from([Parachain(1000)]);
            let destination: Location = Location { parents: 1, interior: ah};
            let asset: Asset = (Location{parents: 1, interior: Junctions::from([Parachain(1000), GeneralIndex(payment_info.asset_id)])}, payment_info.amount).into();
            let fee_asset: Asset = (Location{parents: 1, interior: Junctions::from([Parachain(1000), GeneralIndex(payment_info.asset_id)])}, fee_amount).into();
            let beneficiary = AccountId32 {
                network: None,
                id: *self.env().caller().as_ref(),
            };

            let message: Xcm<()> = Xcm::builder()
                .withdraw_asset(asset.clone().into())
                .buy_execution(fee_asset, Unlimited)
                .deposit_asset(asset.into(), beneficiary.into())
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