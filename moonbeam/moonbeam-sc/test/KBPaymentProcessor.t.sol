// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KBPaymentProcessor.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 Token for testing
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MTK") {
        _mint(msg.sender, 1000 * 10 ** 18); // Mint 1000 tokens to msg.sender
    }
}

contract KBPaymentProcessorTest is Test {
    KBPaymentProcessor paymentContract;
    MockERC20 mockToken;

    address multisigWallet = address(0x456); // Multisig wallet address
    address destination = address(0x789); // Destination address
    uint256 royaltyPercentage = 500; // 5% royalty for example
    uint256 amount = 1000 ether; // Amount to be transferred (using ether as decimals for ERC-20)

    // Simulate a private key for the approver
    uint256 privateKey = 0xA11CE;
    address approver = vm.addr(privateKey);
    address payer = address(0x123); // Simulated payer address

    function setUp() public {
        // Deploy mock token and mint to payer
        vm.prank(payer);
        mockToken = new MockERC20();

        // Deploy the payment contract with mockToken and other parameters
        paymentContract = new KBPaymentProcessor(royaltyPercentage, multisigWallet);

        // Grant APPROVER_ROLE to the approver address
        bytes32 APPROVER_ROLE = keccak256("APPROVER_ROLE");
        paymentContract.grantRole(APPROVER_ROLE, approver);
    }

    function testReceiveERC20Payment() public {
        // Create a valid PaymentRequest
        KBPaymentProcessor.PaymentRequest memory request = KBPaymentProcessor.PaymentRequest({
            paymentId: "payment123",
            amount: amount,
            payer: payer,
            merchantAddress: address(0xABC)
        });

        // Step 1: Generate the struct hash (this is the same as done in the contract)
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("PaymentRequest(string paymentId,uint256 amount,address payer,address merchantAddress)"),
                keccak256(bytes(request.paymentId)),
                request.amount,
                request.payer,
                request.merchantAddress
            )
        );

        // Step 2: Get the final EIP-712 message hash
        bytes32 messageHash = paymentContract.getTypedDataV4Hash(structHash);

        // Step 3: Simulate signing the message hash with the private key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, messageHash);

        // Combine r, s, and v into a signature
        bytes memory signature = abi.encodePacked(r, s, v);

        // Step 4: Approve the token transfer
        vm.prank(payer);
        mockToken.approve(address(paymentContract), amount);

        // Step 5: Call receiveERC20Payment and verify the behavior
        paymentContract.receiveERC20Payment(mockToken, request, signature);

        // Check if the royalty amount is transferred to the multisig wallet
        uint256 royaltyAmount = (request.amount * royaltyPercentage) / 10000;
        assertEq(mockToken.balanceOf(multisigWallet), royaltyAmount);

        // Check if the remaining amount is transferred to the destination
        uint256 amountToTransfer = request.amount - royaltyAmount;
        assertEq(mockToken.balanceOf(request.merchantAddress), amountToTransfer);

        // Ensure the payment is marked as processed
        bool processed = paymentContract.processedPayments(request.paymentId);
        assertTrue(processed);
    }
}
