import { TASK_COMPILE_GET_COMPILATION_TASKS } from "hardhat/builtin-tasks/task-names";
import { extendConfig, extendEnvironment, subtask, task } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatRuntimeEnvironment as HRE, HardhatUserConfig, TaskArguments } from "hardhat/types";
import { isAbsolute, join, normalize } from "path";

import { compileNoir, CompileNoirTaskArgs, needsCompileNoir } from "./compile";
import { Noir } from "./noir";
import "./type-extensions";

export const TASK_COMPILE_NOIR = "compile:noir";

// Just to be friendly with the user in case they input it the other way around
export const TASK_COMPILE_NOIR_REVERSE = "noir:compile";

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
  }
);

extendEnvironment((hre) => {
  hre.noir = lazyObject(() => new Noir(hre));
});

subtask(
  TASK_COMPILE_GET_COMPILATION_TASKS,
  async (args: TaskArguments, hre, runSuper): Promise<string[]> => {
    const otherTasks: string[] = await runSuper(args);
    const noirTasks = hre.config.noir.autoCompile ? [TASK_COMPILE_NOIR] : [];
    return [...noirTasks, ...otherTasks];
  }
);

const compileTask = async (args: CompileNoirTaskArgs, hre: HRE): Promise<void> => {
  if (args.force || await needsCompileNoir(hre)) {
    await compileNoir(hre, args);
  } else if (!args.quiet) {
    console.error(`All circuits are up to date`);
  }
};

task(TASK_COMPILE_NOIR, compileTask);
task(TASK_COMPILE_NOIR_REVERSE, compileTask);