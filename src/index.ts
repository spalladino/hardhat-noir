import { TASK_COMPILE_GET_COMPILATION_TASKS } from "hardhat/builtin-tasks/task-names";
import { extendConfig, extendEnvironment, subtask, task } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import {
  ConfigurableTaskDefinition,
  HardhatConfig,
  HardhatRuntimeEnvironment as HRE,
  HardhatUserConfig,
  TaskArguments,
} from "hardhat/types";
import { compact } from "lodash";
import { isAbsolute, join, normalize } from "path";

import {
  compileNoir,
  CompileNoirTaskArgs,
  generateVerifierContract,
  needsCompileNoir,
  needsGenerateContract,
} from "./compile";
import { Noir } from "./noir";
import "./type-extensions";

// Just to be friendly with the user in case they input it one way or another
export const TASK_NOIR_COMPILE = "noir:compile";
export const TASK_COMPILE_NOIR = "compile:noir";

export const TASK_NOIR_GENERATE_CONTRACT = "noir:contract";

function getPath(rootPath: string, defaultPath: string, userPath?: string) {
  if (userPath === undefined) {
    return join(rootPath, defaultPath);
  } else if (isAbsolute(userPath)) {
    return userPath;
  } else {
    return normalize(join(rootPath, userPath));
  }
}

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const noir = config.noir || {};
    config.noir = noir;

    noir.circuitsPath = getPath(
      config.paths.root,
      "circuits",
      userConfig.noir?.circuitsPath
    );
    noir.mainCircuitName = userConfig.noir?.mainCircuitName ?? "main";
    noir.nargoBin = userConfig.noir?.nargoBin ?? "nargo";
    noir.autoCompile = userConfig.noir?.autoCompile ?? true;
    noir.autoGenerateContract = userConfig.noir?.autoGenerateContract ?? true;
  }
);

extendEnvironment((hre) => {
  hre.noir = lazyObject(() => new Noir(hre));
});

subtask(
  TASK_COMPILE_GET_COMPILATION_TASKS,
  async (args: TaskArguments, hre, runSuper): Promise<string[]> => {
    const otherTasks: string[] = await runSuper(args);
    const noirTasks = compact([
      hre.config.noir.autoCompile ? TASK_COMPILE_NOIR : null,
      hre.config.noir.autoGenerateContract ? TASK_NOIR_GENERATE_CONTRACT : null,
    ]);
    return [...noirTasks, ...otherTasks];
  }
);

const compileTaskAction = async (
  args: CompileNoirTaskArgs,
  hre: HRE
): Promise<void> => {
  if (args.force || (await needsCompileNoir(hre))) {
    await compileNoir(hre, args);
  } else if (!args.quiet) {
    console.error(`All circuits are up to date`);
  }
};

const configureNoirCompileTask = (
  taskDefinition: ConfigurableTaskDefinition
): ConfigurableTaskDefinition => {
  return taskDefinition
    .addFlag("quiet", "Keep it silent")
    .addFlag(
      "force",
      "Force compilation even if circuits have not ben modified"
    );
};

configureNoirCompileTask(task(TASK_COMPILE_NOIR, compileTaskAction));
configureNoirCompileTask(
  task(TASK_NOIR_COMPILE, "Compiles noir circuit", compileTaskAction)
);

configureNoirCompileTask(
  task(
    TASK_NOIR_GENERATE_CONTRACT,
    "Generates verifier contract for noir circuit",
    async (args: CompileNoirTaskArgs, hre: HRE): Promise<void> => {
      if (args.force || (await needsGenerateContract(hre))) {
        await generateVerifierContract(hre, args);
      } else if (!args.quiet) {
        console.error("Verifier contract is up to date");
      }
    }
  )
);
