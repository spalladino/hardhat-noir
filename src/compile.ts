import { execSync } from "child_process";
import { readFileSync, stat, writeFileSync } from "fs";
import { mkdirpSync, moveSync } from "fs-extra";
import { sync as globSync } from "glob";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { camelCase, max, upperFirst } from "lodash";
import { dirname, join } from "path";
import { promisify } from "util";

export interface CompileNoirTaskArgs {
  quiet: boolean;
  force: boolean;
}

export async function needsCompileNoir(hre: HRE): Promise<boolean> {
  const { circuitsPath } = hre.config.noir;

  const sourcesMtime = await getMaxMTime(join(circuitsPath, "src", "**/*.nr"));
  const artifactMtime = await getMaxMTime(
    join(circuitsPath, "build", "*.acir")
  );
  return !artifactMtime || !sourcesMtime || sourcesMtime > artifactMtime;
}

export async function compileNoir(hre: HRE, args: CompileNoirTaskArgs) {
  const { quiet } = args;
  const {
    nargoBin,
    mainCircuitName: circuitName,
    circuitsPath,
  } = hre.config.noir;
  if (!quiet) console.error(`Compiling circuit ${circuitName} with nargo...`);

  const stdio = quiet ? "ignore" : "inherit";
  execSync(`${nargoBin} compile ${circuitName}`, { cwd: circuitsPath, stdio });
}

export async function needsGenerateContract(hre: HRE): Promise<boolean> {
  const { circuitsPath } = hre.config.noir;

  const sourcesMtime = await getMaxMTime(join(circuitsPath, "src", "**/*.nr"));
  const contractMtime = await getMaxMTime(getVerifierContractPath(hre));
  return !contractMtime || !sourcesMtime || sourcesMtime > contractMtime;
}

export async function generateVerifierContract(
  hre: HRE,
  args: CompileNoirTaskArgs
) {
  const { quiet } = args;
  const {
    nargoBin,
    mainCircuitName: circuitName,
    circuitsPath,
  } = hre.config.noir;
  const contractName = `${upperFirst(camelCase(circuitName))}Verifier.sol`;
  const contractPath = getVerifierContractPath(hre);

  if (!quiet) {
    console.error(
      `Generating verifier contract for ${circuitName} with nargo...`
    );
  }

  // Call nargo to create the verifier contract
  const stdio = quiet ? "ignore" : "inherit";
  execSync(`${nargoBin} contract`, { cwd: circuitsPath, stdio });

  // Move the contract to the user contracts folder, renamed as CircuitVerifier.sol
  mkdirpSync(dirname(contractPath));
  moveSync(join(circuitsPath, "contract", `plonk_vk.sol`), contractPath, {
    overwrite: true,
  });

  // Be cool and tweak the overzealous solidity pragma
  writeFileSync(
    contractPath,
    readFileSync(contractPath)
      .toString()
      .replace(
        `pragma solidity >=0.6.0 <0.8.0`,
        `pragma solidity >=0.6.0 <0.9.0`
      )
  );

  if (!quiet) {
    console.error(
      `Moved verifier contract to ${contractName} in contracts folder`
    );
  }
}

function getVerifierContractPath(hre: HRE) {
  const { mainCircuitName } = hre.config.noir;
  const { sources: contractsPath } = hre.config.paths;
  const contractName = `${upperFirst(camelCase(mainCircuitName))}Verifier.sol`;
  return join(contractsPath, contractName);
}

async function getMaxMTime(pattern: string): Promise<number | undefined> {
  const files = globSync(pattern);
  const mtimes = await Promise.all(
    files.map((f) => promisify(stat)(f).then((s) => s.mtimeMs))
  );
  return max(mtimes);
}
