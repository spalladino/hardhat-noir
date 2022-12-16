// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import { existsSync, unlinkSync, statSync, utimesSync } from "fs";
import { resolve } from "path";

import { useEnvironment } from "./helpers";

const artifactPath = resolve(
  __dirname,
  `fixture-projects/hardhat-project/noir/build/mul.acir`
);

const circuitSourcePath = resolve(
  __dirname,
  `fixture-projects/hardhat-project/noir/src/main.nr`
);

describe.only("tasks", function () {
  describe("compile", function () {
    useEnvironment("hardhat-project");

    beforeEach(function () {
      if (existsSync(artifactPath)) {
        unlinkSync(artifactPath);
      }
    });

    it("compiles circuit", async function () {
      await this.hre.run("compile:noir", { quiet: true });
      assert.isTrue(existsSync(artifactPath));
    });

    it("compiles circuit when compiling contracts", async function () {
      await this.hre.run("compile", { quiet: true });
      assert.isTrue(existsSync(artifactPath));
    });

    it("does not recompile if no changes to sources", async function () {
      await this.hre.run("compile:noir", { quiet: true });
      const artifactMtime = statSync(artifactPath).mtimeMs;
      await this.hre.run("compile:noir", { quiet: true });
      const newArtifactMtime = statSync(artifactPath).mtimeMs;
      assert.equal(newArtifactMtime, artifactMtime);
    });

    it("recompiles if sources changed", async function () {
      await this.hre.run("compile:noir", { quiet: true });
      const artifactMtime = statSync(artifactPath).mtimeMs;
      const now = new Date();
      utimesSync(circuitSourcePath, now, now);
      await this.hre.run("compile:noir", { quiet: true });
      const newArtifactMtime = statSync(artifactPath).mtimeMs;
      assert.isAbove(newArtifactMtime, artifactMtime);
    });

    it("recompiles if forced", async function () {
      await this.hre.run("compile:noir", { quiet: true });
      const artifactMtime = statSync(artifactPath).mtimeMs;
      await this.hre.run("compile:noir", { quiet: true, force: true });
      const newArtifactMtime = statSync(artifactPath).mtimeMs;
      assert.isAbove(newArtifactMtime, artifactMtime);
    });
  });
});

describe("hre", function () {
  describe("circuit", function () {
    useEnvironment("hardhat-project");

    beforeEach(async function () {
      if (!existsSync(artifactPath)) {
        await this.hre.run("compile:noir", { quiet: true });
      }
    });

    it("gets the default compiled circuit", async function () {
      const circuit = this.hre.noir.getCircuit();
      assert.exists(circuit.getACIR());
    });

    it("fails to get non existing circuit", async function () {
      assert.throws(() => this.hre.noir.getCircuit("not-exists"));
    });

    it("gets and verifies a valid proof for the circuit", async function () {
      const circuit = this.hre.noir.getCircuit();
      const proof = await circuit.getProof({ x: 2, y: 3, result: 6 });
      assert.isTrue(await circuit.verifyProof(proof));
    });

    it("gets and verifies a valid proof for the circuit via shorthand", async function () {
      const circuit = this.hre.noir.getCircuit();
      assert.isTrue(await circuit.verifyProofFor({ x: 2, y: 3, result: 6 }));
    });

    it("fails to verify invalid proof", async function () {
      const circuit = this.hre.noir.getCircuit();
      const proof = await circuit.getProof({ x: 2, y: 3, result: 5 });
      assert.isFalse(await circuit.verifyProof(proof));
    });
  });
});
