import { HardhatUserConfig } from "hardhat/types";

import "../src/index";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: { enabled: true },
    },
  },
  defaultNetwork: "hardhat",
  noir: {
    mainCircuitName: "mul",
    useNargo: false,
  },
};

export default config;
