import { existsSync } from "fs";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { join as pathJoin } from "path";

import { Circuit, loadCircuit } from "./circuit";
import "./type-extensions";

export class Noir {
  constructor(private hre: HardhatRuntimeEnvironment) {}

  /**
   * Returns an already-compiled Circuit object from an .acir file
   * @param name name of the ACIR file (without extension) in the build folder, defaults to config.noir.mainCircuitName
   * @returns a Circuit object initialized with the ACIR
   */
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
