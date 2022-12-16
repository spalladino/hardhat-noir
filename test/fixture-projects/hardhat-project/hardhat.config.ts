// We load the plugin here.
import { HardhatUserConfig } from "hardhat/types";

import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: { enabled: true },
    },
  },
  defaultNetwork: "hardhat",
  noir: {
    circuitsPath: "noir",
    mainCircuitName: "mul",
  },
};

export default config;
