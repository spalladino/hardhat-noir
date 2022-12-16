// We load the plugin here.
import { HardhatUserConfig } from "hardhat/types";

import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  defaultNetwork: "hardhat",
  noir: {
    circuitsPath: "noir",
    mainCircuitName: "mul",
  },
};

export default config;