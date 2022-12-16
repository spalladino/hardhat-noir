import { HardhatUserConfig } from "hardhat/types";

import "../src/index";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  noir: {
    mainCircuitName: "mul",
  },
};

export default config;
