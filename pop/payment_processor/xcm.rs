use ink::primitives::AccountId;
use sp_runtime::MultiAddress;

#[ink::scale_derive(Encode)]
pub enum RuntimeCall {
    /// This index can be found by investigating runtime configuration. You can check the
    /// pallet order inside `construct_runtime!` block and read the position of your
    /// pallet (0-based).
    ///
    ///
    /// [See here for more.](https://substrate.stackexchange.com/questions/778/how-to-get-pallet-index-u8-of-a-pallet-in-runtime)
    #[codec(index = 50)]
    Assets(AssetsCall),
}

#[ink::scale_derive(Encode)]
pub enum AssetsCall {
    /// This index can be found by investigating the pallet dispatchable API. In your
    /// pallet code, look for `#[pallet::call]` section and check
    /// `#[pallet::call_index(x)]` attribute of the call. If these attributes are
    /// missing, use source-code order (0-based).
    #[codec(index = 25)]
    TransferApproved {
        #[codec(compact)]
        id: u32,
        owner: MultiAddress<AccountId, ()>,
        destination: MultiAddress<AccountId, ()>,
        #[codec(compact)]
        amount: u128,
    },
}