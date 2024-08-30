import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PaymentProcessorModule = buildModule("PaymentProcessor", (m) => {

  const paymentProcessor = m.contract("PaymentProcessor", [], {});

  return { paymentProcessor };
});

export default PaymentProcessorModule;
