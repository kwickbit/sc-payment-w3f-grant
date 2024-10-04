import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    EIP712DomainChanged: event("0x0a6387c9ea3628b88a633bb4f3b151770f70085117a15f9bf3787cda53f13d31", "EIP712DomainChanged()", {}),
    ERC20PaymentReceived: event("0x7f308a618b5e1b09db055d62fa8ee5afe9d78d2a8dd739cb587b7b7b2092f16b", "ERC20PaymentReceived(address,address,uint256,string,address,uint256)", {"token": indexed(p.address), "from": indexed(p.address), "amount": p.uint256, "paymentId": p.string, "merchant": p.address, "royaltyAmount": p.uint256}),
    RoleAdminChanged: event("0xbd79b86ffe0ab8e8776151514217cd7cacd52c909f66475c3af44e129f0b00ff", "RoleAdminChanged(bytes32,bytes32,bytes32)", {"role": indexed(p.bytes32), "previousAdminRole": indexed(p.bytes32), "newAdminRole": indexed(p.bytes32)}),
    RoleGranted: event("0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d", "RoleGranted(bytes32,address,address)", {"role": indexed(p.bytes32), "account": indexed(p.address), "sender": indexed(p.address)}),
    RoleRevoked: event("0xf6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b", "RoleRevoked(bytes32,address,address)", {"role": indexed(p.bytes32), "account": indexed(p.address), "sender": indexed(p.address)}),
}

export const functions = {
    APPROVER_ROLE: viewFun("0x4245962b", "APPROVER_ROLE()", {}, p.bytes32),
    DEFAULT_ADMIN_ROLE: viewFun("0xa217fddf", "DEFAULT_ADMIN_ROLE()", {}, p.bytes32),
    addApprover: fun("0xb646c194", "addApprover(address)", {"approver": p.address}, ),
    eip712Domain: viewFun("0x84b0196e", "eip712Domain()", {}, {"fields": p.bytes1, "name": p.string, "version": p.string, "chainId": p.uint256, "verifyingContract": p.address, "salt": p.bytes32, "extensions": p.array(p.uint256)}),
    getRoleAdmin: viewFun("0x248a9ca3", "getRoleAdmin(bytes32)", {"role": p.bytes32}, p.bytes32),
    getTypedDataV4Hash: viewFun("0x0ff28b0c", "getTypedDataV4Hash(bytes32)", {"structHash": p.bytes32}, p.bytes32),
    grantRole: fun("0x2f2ff15d", "grantRole(bytes32,address)", {"role": p.bytes32, "account": p.address}, ),
    hasRole: viewFun("0x91d14854", "hasRole(bytes32,address)", {"role": p.bytes32, "account": p.address}, p.bool),
    multisigWallet: viewFun("0x9075becf", "multisigWallet()", {}, p.address),
    processedPayments: viewFun("0x9b931abf", "processedPayments(string)", {"_0": p.string}, p.bool),
    receiveERC20Payment: fun("0xfe93e0a0", "receiveERC20Payment(address,(string,uint256,address,address),bytes)", {"token": p.address, "request": p.struct({"paymentId": p.string, "amount": p.uint256, "payer": p.address, "merchantAddress": p.address}), "signature": p.bytes}, ),
    removeApprover: fun("0x6cf4c88f", "removeApprover(address)", {"approver": p.address}, ),
    renounceRole: fun("0x36568abe", "renounceRole(bytes32,address)", {"role": p.bytes32, "callerConfirmation": p.address}, ),
    revokeRole: fun("0xd547741f", "revokeRole(bytes32,address)", {"role": p.bytes32, "account": p.address}, ),
    royaltyPercentage: viewFun("0x8a71bb2d", "royaltyPercentage()", {}, p.uint256),
    setMultisigWallet: fun("0x64913477", "setMultisigWallet(address)", {"newMultisigWallet": p.address}, ),
    setRoyaltyPercentage: fun("0x61ba27da", "setRoyaltyPercentage(uint256)", {"newRoyaltyPercentage": p.uint256}, ),
    supportsInterface: viewFun("0x01ffc9a7", "supportsInterface(bytes4)", {"interfaceId": p.bytes4}, p.bool),
}

export class Contract extends ContractBase {

    APPROVER_ROLE() {
        return this.eth_call(functions.APPROVER_ROLE, {})
    }

    DEFAULT_ADMIN_ROLE() {
        return this.eth_call(functions.DEFAULT_ADMIN_ROLE, {})
    }

    eip712Domain() {
        return this.eth_call(functions.eip712Domain, {})
    }

    getRoleAdmin(role: GetRoleAdminParams["role"]) {
        return this.eth_call(functions.getRoleAdmin, {role})
    }

    getTypedDataV4Hash(structHash: GetTypedDataV4HashParams["structHash"]) {
        return this.eth_call(functions.getTypedDataV4Hash, {structHash})
    }

    hasRole(role: HasRoleParams["role"], account: HasRoleParams["account"]) {
        return this.eth_call(functions.hasRole, {role, account})
    }

    multisigWallet() {
        return this.eth_call(functions.multisigWallet, {})
    }

    processedPayments(_0: ProcessedPaymentsParams["_0"]) {
        return this.eth_call(functions.processedPayments, {_0})
    }

    royaltyPercentage() {
        return this.eth_call(functions.royaltyPercentage, {})
    }

    supportsInterface(interfaceId: SupportsInterfaceParams["interfaceId"]) {
        return this.eth_call(functions.supportsInterface, {interfaceId})
    }
}

/// Event types
export type EIP712DomainChangedEventArgs = EParams<typeof events.EIP712DomainChanged>
export type ERC20PaymentReceivedEventArgs = EParams<typeof events.ERC20PaymentReceived>
export type RoleAdminChangedEventArgs = EParams<typeof events.RoleAdminChanged>
export type RoleGrantedEventArgs = EParams<typeof events.RoleGranted>
export type RoleRevokedEventArgs = EParams<typeof events.RoleRevoked>

/// Function types
export type APPROVER_ROLEParams = FunctionArguments<typeof functions.APPROVER_ROLE>
export type APPROVER_ROLEReturn = FunctionReturn<typeof functions.APPROVER_ROLE>

export type DEFAULT_ADMIN_ROLEParams = FunctionArguments<typeof functions.DEFAULT_ADMIN_ROLE>
export type DEFAULT_ADMIN_ROLEReturn = FunctionReturn<typeof functions.DEFAULT_ADMIN_ROLE>

export type AddApproverParams = FunctionArguments<typeof functions.addApprover>
export type AddApproverReturn = FunctionReturn<typeof functions.addApprover>

export type Eip712DomainParams = FunctionArguments<typeof functions.eip712Domain>
export type Eip712DomainReturn = FunctionReturn<typeof functions.eip712Domain>

export type GetRoleAdminParams = FunctionArguments<typeof functions.getRoleAdmin>
export type GetRoleAdminReturn = FunctionReturn<typeof functions.getRoleAdmin>

export type GetTypedDataV4HashParams = FunctionArguments<typeof functions.getTypedDataV4Hash>
export type GetTypedDataV4HashReturn = FunctionReturn<typeof functions.getTypedDataV4Hash>

export type GrantRoleParams = FunctionArguments<typeof functions.grantRole>
export type GrantRoleReturn = FunctionReturn<typeof functions.grantRole>

export type HasRoleParams = FunctionArguments<typeof functions.hasRole>
export type HasRoleReturn = FunctionReturn<typeof functions.hasRole>

export type MultisigWalletParams = FunctionArguments<typeof functions.multisigWallet>
export type MultisigWalletReturn = FunctionReturn<typeof functions.multisigWallet>

export type ProcessedPaymentsParams = FunctionArguments<typeof functions.processedPayments>
export type ProcessedPaymentsReturn = FunctionReturn<typeof functions.processedPayments>

export type ReceiveERC20PaymentParams = FunctionArguments<typeof functions.receiveERC20Payment>
export type ReceiveERC20PaymentReturn = FunctionReturn<typeof functions.receiveERC20Payment>

export type RemoveApproverParams = FunctionArguments<typeof functions.removeApprover>
export type RemoveApproverReturn = FunctionReturn<typeof functions.removeApprover>

export type RenounceRoleParams = FunctionArguments<typeof functions.renounceRole>
export type RenounceRoleReturn = FunctionReturn<typeof functions.renounceRole>

export type RevokeRoleParams = FunctionArguments<typeof functions.revokeRole>
export type RevokeRoleReturn = FunctionReturn<typeof functions.revokeRole>

export type RoyaltyPercentageParams = FunctionArguments<typeof functions.royaltyPercentage>
export type RoyaltyPercentageReturn = FunctionReturn<typeof functions.royaltyPercentage>

export type SetMultisigWalletParams = FunctionArguments<typeof functions.setMultisigWallet>
export type SetMultisigWalletReturn = FunctionReturn<typeof functions.setMultisigWallet>

export type SetRoyaltyPercentageParams = FunctionArguments<typeof functions.setRoyaltyPercentage>
export type SetRoyaltyPercentageReturn = FunctionReturn<typeof functions.setRoyaltyPercentage>

export type SupportsInterfaceParams = FunctionArguments<typeof functions.supportsInterface>
export type SupportsInterfaceReturn = FunctionReturn<typeof functions.supportsInterface>

