// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract KBPaymentProcessor is AccessControl, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");
    uint256 public royaltyPercentage; // Royalty fee as a percentage (e.g., 200 = 2%)

    address public multisigWallet; // Address of the multisig wallet that will receive the royalty

    // Mapping to track processed paymentIds
    mapping(string => bool) public processedPayments;

    // Events to log successful payments
    event ERC20PaymentReceived(
        address indexed token,
        address indexed from,
        uint256 amount,
        string paymentId,
        address merchant,
        uint256 royaltyAmount
    );

    constructor(uint256 _royaltyPercentage, address _multisigWallet) EIP712("PaymentProcessor", "1") {
        require(_royaltyPercentage <= 10000, "Invalid royalty percentage"); // Max 100%
        royaltyPercentage = _royaltyPercentage;
        multisigWallet = _multisigWallet;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(APPROVER_ROLE, msg.sender);
    }

    struct PaymentRequest {
        string paymentId;
        uint256 amount;
        address payer;
        address merchantAddress; // Merchant's address
    }

    // ERC-20 Token Payment Handling with Royalty
    function receiveERC20Payment(
        IERC20 token,
        PaymentRequest calldata request,
        bytes calldata signature
    ) external {
        require(!processedPayments[request.paymentId], "Payment already processed");

        // Generate the EIP-712 typed data hash
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("PaymentRequest(string paymentId,uint256 amount,address payer,address merchantAddress)"),
                keccak256(bytes(request.paymentId)),
                request.amount,
                request.payer,
                request.merchantAddress
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);

        // Recover the signer and verify their role
        address signer = ECDSA.recover(hash, signature);
        require(hasRole(APPROVER_ROLE, signer), "Invalid approver signature");

        // Calculate the royalty fee and the amount to be sent to the destination
        uint256 royaltyAmount = (request.amount * royaltyPercentage) / 10000;
        uint256 amountToTransfer = request.amount - royaltyAmount;

        // Transfer royalty to multisig wallet directly from the payer
        require(token.transferFrom(request.payer, multisigWallet, royaltyAmount), "ERC20 royalty transfer failed");

        require(
            token.transferFrom(request.payer, request.merchantAddress, amountToTransfer), "ERC20 transfer to destination failed"
        );

        // Mark the paymentId as processed
        processedPayments[request.paymentId] = true;

        // Emit the event
        emit ERC20PaymentReceived(
            address(token), request.payer, request.amount, request.paymentId, request.merchantAddress, royaltyAmount
        );
    }

    function getTypedDataV4Hash(bytes32 structHash) external view returns (bytes32) {
        return _hashTypedDataV4(structHash);
    }

    // Approver management
    function addApprover(address approver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(APPROVER_ROLE, approver);
    }

    function removeApprover(address approver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(APPROVER_ROLE, approver);
    }

    // Update multisig wallet
    function setMultisigWallet(address newMultisigWallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        multisigWallet = newMultisigWallet;
    }

    // Update royalty percentage
    function setRoyaltyPercentage(uint256 newRoyaltyPercentage) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRoyaltyPercentage <= 10000, "Invalid royalty percentage"); // Max 100%
        royaltyPercentage = newRoyaltyPercentage;
    }
}
