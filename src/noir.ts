import { existsSync } from "fs";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { join as pathJoin } from "path";

import { Circuit, loadCircuit } from "./circuit";
import "./type-extensions";

export class NoirField {
  constructor(private hre: HardhatRuntimeEnvironment) {}

  public getCircuit(name?: string): Circuit {
    const circuitName = name ?? this.hre.config.noir.mainCircuitName;
    const path = pathJoin(
      this.hre.config.noir.circuitsPath,
      "build",
      `${circuitName}.acir`
    );
    if (!existsSync(path)) {
      throw new Error(
        `Circuit not found at ${path}. Maybe you forgot to run \`nargo compile\`?`
      );
    }
    return loadCircuit(path);
  }
}
