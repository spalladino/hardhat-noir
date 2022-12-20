// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import { existsSync, readFileSync, statSync, unlinkSync, utimesSync } from "fs";
import { join, resolve } from "path";

import { useEnvironment } from "./helpers";

const projectPath = resolve(__dirname, `fixture-projects/hardhat-project`);

const artifactPath = join(projectPath, `noir/build/mul.acir`);
const verifierPath = join(projectPath, `contracts/MulVerifier.sol`);
const circuitSourcePath = join(projectPath, `/noir/src/main.nr`);

describe("tasks", function () {
  useEnvironment("hardhat-project");

  beforeEach(function () {
    if (existsSync(artifactPath)) unlinkSync(artifactPath);
    if (existsSync(verifierPath)) unlinkSync(verifierPath);
  });

  describe("compile", function () {
    it("compiles circuit and generates verifier contract", async function () {
      await this.hre.run("compile", { quiet: true });
      assert.isTrue(existsSync(artifactPath));
    });
  });

  describe("noir:compile", function () {
    it("compiles valid circuit with wasm", async function () {
      this.hre.config.noir.useNargo = false;
      await this.hre.run("noir:compile", { quiet: true });
      assert.isTrue(existsSync(artifactPath));
      const circuit = this.hre.noir.getCircuit();
      assert.isTrue(await circuit.verifyProofFor({ x: 2, y: 3, result: 6 }));
    });

    it("compiles circuit with nargo", async function () {
      await this.hre.run("noir:compile", { quiet: true, nargo: true });
      assert.isTrue(existsSync(artifactPath));
    });

    it("compiles circuit on reverse task name", async function () {
      await this.hre.run("compile:noir", { quiet: true });
      assert.isTrue(existsSync(artifactPath));
    });

    it("does not recompile if no changes to sources", async function () {
      await this.hre.run("noir:compile", { quiet: true });
      const artifactMtime = statSync(artifactPath).mtimeMs;
      await this.hre.run("noir:compile", { quiet: true });
      const newArtifactMtime = statSync(artifactPath).mtimeMs;
      assert.equal(newArtifactMtime, artifactMtime);
    });

    it("recompiles if sources changed", async function () {
      await this.hre.run("noir:compile", { quiet: true });
      const artifactMtime = statSync(artifactPath).mtimeMs;
      const now = new Date();
      utimesSync(circuitSourcePath, now, now);
      await this.hre.run("noir:compile", { quiet: true });
      const newArtifactMtime = statSync(artifactPath).mtimeMs;
      assert.isAbove(newArtifactMtime, artifactMtime);
    });

    it("recompiles if forced", async function () {
      await this.hre.run("noir:compile", { quiet: true });
      const artifactMtime = statSync(artifactPath).mtimeMs;
      await this.hre.run("noir:compile", { quiet: true, force: true });
      const newArtifactMtime = statSync(artifactPath).mtimeMs;
      assert.isAbove(newArtifactMtime, artifactMtime);
    });
  });

  describe("noir:contract", function () {
    it("generates contract with wasm", async function () {
      this.hre.config.noir.useNargo = false;
      await this.hre.run("noir:compile", { quiet: true });
      await this.hre.run("noir:contract", { quiet: true });
      assert.isTrue(existsSync(verifierPath));
      const content = readFileSync(verifierPath).toString();
      assert.include(content, `pragma solidity >=0.6.0`);
      assert.notInclude(content, `pragma solidity >=0.6.0 <0.8.0`);
    });

    it("generates contract with nargo", async function () {
      await this.hre.run("noir:contract", { quiet: true });
      assert.isTrue(existsSync(verifierPath));
      const content = readFileSync(verifierPath).toString();
      assert.include(content, `pragma solidity >=0.6.0 <0.9.0`);
      assert.notInclude(content, `pragma solidity >=0.6.0 <0.8.0`);
    });

    it("does not recompile if no changes to sources", async function () {
      await this.hre.run("noir:contract", { quiet: true });
      const verifierMtime = statSync(verifierPath).mtimeMs;
      await this.hre.run("noir:contract", { quiet: true });
      const newVerifierMtime = statSync(verifierPath).mtimeMs;
      assert.equal(newVerifierMtime, verifierMtime);
    });

    it("recompiles if sources changed", async function () {
      await this.hre.run("noir:contract", { quiet: true });
      const verifierMtime = statSync(verifierPath).mtimeMs;
      const now = new Date();
      utimesSync(circuitSourcePath, now, now);
      await this.hre.run("noir:contract", { quiet: true });
      const newVerifierMtime = statSync(verifierPath).mtimeMs;
      assert.isAbove(newVerifierMtime, verifierMtime);
    });

    it("recompiles if forced", async function () {
      await this.hre.run("noir:contract", { quiet: true });
      const verifierMtime = statSync(verifierPath).mtimeMs;
      await this.hre.run("noir:contract", { quiet: true, force: true });
      const newVerifierMtime = statSync(verifierPath).mtimeMs;
      assert.isAbove(newVerifierMtime, verifierMtime);
    });
  });
});
