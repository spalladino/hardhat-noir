// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import { existsSync } from "fs";
import { resolve } from "path";

import { useEnvironment } from "./helpers";

const artifactPath = resolve(
  __dirname,
  `fixture-projects/hardhat-project/noir/build/mul.acir`
);

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
