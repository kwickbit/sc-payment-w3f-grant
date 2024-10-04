require("dotenv").config();
import { ethers, keccak256, toUtf8Bytes, AbiCoder, uuidV4 } from "ethers";
import { uuid } from 'uuidv4';

// Define constants from the environment file
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY || "";
const ERC20_CONTRACT_ADDRESS = process.env.ERC20_CONTRACT_ADDRESS || "";
const KB_PAYMENT_PROCESSOR_ADDRESS = process.env.KB_PAYMENT_PROCESSOR_ADDRESS || "";

// ERC20 ABI to interact with the ERC20 token contract
const ERC20_ABI = [
  "function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
];

// KBPaymentProcessor ABI
const KB_PAYMENT_PROCESSOR_ABI = [
  "function receiveERC20Payment(address token, (string paymentId, uint256 amount, address payer, address merchantAddress) calldata request, bytes calldata signature) external",
  "function getTypedDataV4Hash(bytes32 structHash) external view returns (bytes32)",
];

// Create an async function to handle the payment and signing process
async function createAndSignPaymentRequest() {
  console.time("Total Execution Time");

  const provider = new ethers.JsonRpcProvider("https://moonbeam-alpha.api.onfinality.io/public"); // Replace with your provider
  const wallet = new ethers.Wallet(SIGNER_PRIVATE_KEY, provider);

  // Define the ERC-20 contract and KBPaymentProcessor contract
  const erc20Contract = new ethers.Contract(ERC20_CONTRACT_ADDRESS, ERC20_ABI, wallet);
  const kbPaymentProcessor = new ethers.Contract(KB_PAYMENT_PROCESSOR_ADDRESS, KB_PAYMENT_PROCESSOR_ABI, wallet);

  // Define the payment request parameters
  const paymentId = uuid()
  console.log(`Approving paymentId: [${paymentId}]`)
  const amount = 1
  const payer = wallet.address;
  const merchantAddress = "0xA361DF383c5594FFc3b0E4F6d140D6518559Ed8b"; // Replace with actual merchant address

  // Step 1: Create the PaymentRequest object
  const paymentRequest = {
    paymentId: paymentId,
    amount: amount,
    payer: payer,
    merchantAddress: merchantAddress,
  };

  console.log("PaymentRequest object created:", paymentRequest);

  const abiCoder = new ethers.AbiCoder();

  const structHash = keccak256(
    abiCoder.encode(
      ["bytes32", "bytes32", "uint256", "address", "address"],
      [
        keccak256(toUtf8Bytes("PaymentRequest(string paymentId,uint256 amount,address payer,address merchantAddress)")),
        keccak256(toUtf8Bytes(paymentId)),
        amount,
        payer,
        merchantAddress,
      ]
    )
  );

  console.log("Struct hash:", structHash);

  // Step 3: Sign the hash using the wallet's private key
  const signature = await wallet.signTypedData(
    {
      name: "PaymentProcessor",
      version: "1",
      chainId: 1287, // Moonbase chain ID
      verifyingContract: KB_PAYMENT_PROCESSOR_ADDRESS,
    },
    {
      PaymentRequest: [
        { name: "paymentId", type: "string" },
        { name: "amount", type: "uint256" },
        { name: "payer", type: "address" },
        { name: "merchantAddress", type: "address" },
      ],
    },
    paymentRequest
  );

  console.log("PaymentRequest signed:", signature);

  // Step 4: Approve the KBPaymentProcessor contract to spend the ERC20 token
  console.time("ERC-20 token approved for transfer.")
  const approvalTx = await erc20Contract.approve(KB_PAYMENT_PROCESSOR_ADDRESS, amount);
  await approvalTx.wait();
  console.timeEnd("ERC-20 token approved for transfer.");


  // Step 5: Call the receiveERC20Payment function on the KBPaymentProcessor contract
  console.time("Payment completed successfully!")
  const paymentTx = await kbPaymentProcessor.receiveERC20Payment(ERC20_CONTRACT_ADDRESS, paymentRequest, signature);
  await paymentTx.wait();
  console.timeEnd("Payment completed successfully!");
  console.timeEnd("Total Execution Time");
}

// Execute the function
createAndSignPaymentRequest().catch((error) => {
  console.error("Error executing payment request:", error);
});