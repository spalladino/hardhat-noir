/* tslint:disable no-unused-expression */
import { expect } from "chai";
import { noir } from "hardhat";

import { Circuit } from "../circuit";

describe("mul", function () {
  let circuit: Circuit;

  before(async () => {
    circuit = noir.getCircuit();
  });

  it("verifies proof", async function () {
    const proof = await circuit.getProof({ x: 3, y: 4, result: 12 });
    expect(await circuit.verifyProof(proof)).to.be.true;
  });

  it("fails to verify invalid proof", async function () {
    const proof = await circuit.getProof({ x: 3, y: 4, result: 10 });
    expect(await circuit.verifyProof(proof)).to.be.false;
  });

  it("verifies proof with shorthand function", async function () {
    expect(await circuit.verifyProofFor({ x: 3, y: 4, result: 12 })).to.be.true;
  });
});
