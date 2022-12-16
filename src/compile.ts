import { execSync } from "child_process";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function compileNoir(
  hre: HardhatRuntimeEnvironment,
  args: { quiet: boolean }
) {
  const { quiet } = args;
  const { nargoBin, mainCircuitName, circuitsPath } = hre.config.noir;
  if (!quiet) {
    console.error(`Compiling circuit ${mainCircuitName} with nargo...`);
  }
  const stdio = quiet ? "ignore" : "inherit";
  execSync(`${nargoBin} compile ${mainCircuitName}`, {
    cwd: circuitsPath,
    stdio,
  });
}
