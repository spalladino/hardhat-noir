import { execSync } from "child_process";
import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { sync as globSync } from 'glob';
import { join } from 'path';
import { stat } from 'fs';
import { max } from 'lodash';
import { promisify } from "util";

export interface CompileNoirTaskArgs {
  quiet: boolean;
  force: boolean;
}

export async function needsCompileNoir(hre: HRE): Promise<boolean> {
  const { circuitsPath } = hre.config.noir;

  const sourcesMtime = await getMaxMTime(join(circuitsPath, 'src', '**/*.nr'));
  const artifactMtime = await getMaxMTime(join(circuitsPath, 'build', '*.acir'));
  return !artifactMtime || !sourcesMtime || sourcesMtime > artifactMtime;
}

async function getMaxMTime(pattern: string): Promise<number | undefined> {
  const files = globSync(pattern);
  const mtimes = await Promise.all(files.map(f => promisify(stat)(f).then(s => s.mtimeMs)));
  return max(mtimes);
}

export async function compileNoir(hre: HRE, args: CompileNoirTaskArgs) {
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
