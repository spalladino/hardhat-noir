import "hardhat/types/config";
import "hardhat/types/runtime";

import { NoirConfig } from "./config";
import { NoirField } from "./noir";

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    noir?: Partial<NoirConfig>;
  }

  export interface HardhatConfig {
    noir: NoirConfig;
  }
}

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    noir: NoirField;
  }
}
