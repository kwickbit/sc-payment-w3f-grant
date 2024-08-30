// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


contract PaymentProcessor is AccessControl, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    // Mapping to track processed paymentIds
    mapping(string => bool) public processedPayments;

    // Event to log successful payments
    event PaymentReceived(address indexed from, uint256 amount, string paymentId);

    constructor() EIP712("PaymentProcessor", "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(APPROVER_ROLE, msg.sender);
    }

    struct PaymentRequest {
        string paymentId;
        uint256 amount;
        address payer;
    }

    function receivePayment(
        PaymentRequest calldata request,
        bytes calldata signature
    ) external payable {
        require(msg.value > 0, "No Ether sent");
        require(msg.value == request.amount, "Incorrect payment amount");
        require(!processedPayments[request.paymentId], "Payment already processed");

        // Generate the EIP-712 typed data hash
        bytes32 structHash = keccak256(abi.encode(
            keccak256("PaymentRequest(string paymentId,uint256 amount,address payer)"),
            keccak256(bytes(request.paymentId)),
            request.amount,
            request.payer
        ));

        bytes32 hash = _hashTypedDataV4(structHash);

        // Recover the signer and verify their role
        address signer = ECDSA.recover(hash, signature);
        require(hasRole(APPROVER_ROLE, signer), "Invalid approver signature");

        // Mark the paymentId as processed
        processedPayments[request.paymentId] = true;

        // Emit the event
        emit PaymentReceived(request.payer, msg.value, request.paymentId);
    }

    function addApprover(address approver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(APPROVER_ROLE, approver);
    }

    function removeApprover(address approver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(APPROVER_ROLE, approver);
    }

    function withdrawFunds(address payable to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= address(this).balance, "Insufficient balance");
        to.transfer(amount);
    }

    receive() external payable {}
}
