import {
  create_proof as createProof,
  setup_generic_prover_and_verifier as setupGenericProverAndVerifier,
  StandardExampleProver,
  StandardExampleVerifier,
  verify_proof as verifyProof,
} from "@noir-lang/barretenberg/dest/client_proofs";
import { acir_from_bytes as acirFromBytes } from "@noir-lang/noir_wasm";
import { readFileSync } from "fs";

export type ACIR = any;
export type Proof = any;
export type Input = any;

export class Circuit {
  private prover?: StandardExampleProver;
  private verifier?: StandardExampleVerifier;

  constructor(private acir: ACIR) {}

  public getACIR(): ACIR {
    return this.acir;
  }

  public async getProof(input: Input): Promise<Proof> {
    const [prover, _verifier] = await this.getProverAndVerifier();
    return createProof(prover, this.acir, input);
  }

  public async verifyProof(proof: Proof): Promise<boolean> {
    const [_prover, verifier] = await this.getProverAndVerifier();
    return verifyProof(verifier, proof);
  }

  public async verifyProofFor(input: Input): Promise<boolean> {
    const proof = await this.getProof(input);
    return this.verifyProof(proof);
  }

  protected async getProverAndVerifier(): Promise<
    [StandardExampleProver, StandardExampleVerifier]
  > {
    if (!this.prover || !this.verifier) {
      [this.prover, this.verifier] = await setupGenericProverAndVerifier(
        this.acir
      );
    }
    return [this.prover, this.verifier];
  }
}

export function loadCircuit(path: string): Circuit {
  const buffer = new Uint8Array(readFileSync(path));
  const acir: ACIR = acirFromBytes(buffer);
  return new Circuit(acir);
}
