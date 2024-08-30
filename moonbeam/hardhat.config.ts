import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import 'dotenv/config';


const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    moonbase_alpha: {
      url: 'https://moonbase-alpha.public.blastapi.io/',
      chainId: 1287,
      accounts: [process.env.PRIVATE_KEY || ''],
    },
  },
};

export default config;
