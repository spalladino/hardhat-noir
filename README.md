# hardhat-noir

An unofficial Hardhat plugin for working with circuits written in [Noir](https://github.com/noir-lang/noir). 

Inspired by [vezenovm/basic_mul_noir_example](https://github.com/vezenovm/basic_mul_noir_example/).

## What

This plugin adds convenience methods to the Hardhat Runtime Environment for generating and verifying proofs for a circuit.

```js
import { noir } from "hardhat";

it("verifies proof for mul", async function () {
  const input = { x: 3, y: 4, result: 12 };
  expect(await noir.getCircuit().verifyProofFor(input)).to.be.true;
});
```

This plugin also hooks to the default `compile` task so **circuits are automatically compiled** whenever you run `hardhat compile` Circuits will only be recompiled if there are any changes detected in the source files. The same applies to the **Solidity verifier contract**, which is generated in Hardhat's configured contracts folder, and the pragma is tweaked to support Solidity 0.8. These tasks can also be manually invoked via `noir:compile` and `noir:contract`.

```bash
$ hardhat compile
Compiling circuit mul with nargo...
ACIR gates generated : 13
Generated ACIR code into build/mul.acir
Ok("/home/spalladino/Projects/hardhat-noir/example/circuits/build/mul.acir")

Generating verifier contract for mul with nargo...
ACIR gates generated : 13
Contract successfully created and located at contract/plonk_vk.sol
Moved verifier contract to MulVerifier.sol in contracts folder

Compiled 1 Solidity file successfully
Done in 2.59s.
```

## Installation

```bash
npm install hardhat-noir
```

Import the plugin in your `hardhat.config.js`:

```js
require("hardhat-noir");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "hardhat-noir";
```

## Tasks

These tasks only run if there are no changes detected so circuit source files, or are invoked with the `--force` flag. Both tasks will use the WASM libraries, unless the flag `--nargo` is set or `useNargo` is set to true in the config, in which case they will use the `nargo` binary available in the PATH.

- `noir:compile`: Compiles the circuit in the `circuitsPath`.
- `noir:contract`: Generates a verifier contract for the circuit in Hardhat's contracts folder.

> :wink: The solidity pragma of the generated contract is automatically changed from `>=0.6.0 <0.8.0` to `>=0.6.0 <0.9.0` to support the latest versions of solc, since the generated verifier is compatible with the 0.8 releases.

## Environment extensions

This plugin adds a [`noir`](src/noir.ts) field to the Hardhat Runtime Environment, which exposes a `getCircuit` method. This returns a [`Circuit`](src/circuit.ts) abstraction with the following convenience methods, which are wrappers over the ones in `@noir-lang/barretenberg/dest/client_proofs`.

- `getProof(input)`: Generates a proof for the circuit given the input variables.
- `verifyProof(proof)`: Verifies a proof.
- `verifyProofFor(input)`: Generates and verifies a proof in a single call.

As an example:

```ts
import { noir } from "hardhat";

async function run(): Promise<boolean> {
  const input = { x: 3, y: 4, result: 12 };
  return noir.getCircuit().verifyProofFor(input);
}
```

The equivalent code without the plugin would be the following, as adapted from the [`basic_mul_noir_example`](https://github.com/vezenovm/basic_mul_noir_example/blob/826ac5f998cc64fd6998f236a7b9b789045bb78a/test/1_mul.ts):

```ts
import { acir_from_bytes } from '@noir-lang/noir_wasm';
import { setup_generic_prover_and_verifier, create_proof, verify_proof } from '@noir-lang/barretenberg/dest/client_proofs';

async function run(): Promise<boolean> {
  const acirBuffer = readFileSync('./circuits/build/mul.acir');
  const acirByteArray = new Uint8Array(buffer);
  const acir = acir_from_bytes(acirByteArray);

  const abi = { x: 3, y: 4, result: 12 };

  const [prover, verifier] = await setup_generic_prover_and_verifier(acir);
  const proof = await create_proof(prover, acir, abi);
  return await verify_proof(verifier, proof);
}
```

## Configuration

This plugin extends the Hardhat config with a `noir` field with the following fields. See [the `config.ts` file](src/config.ts) for more info.

```js
module.exports = {
  noir: {
    circuitsPath: 'circuits',
    mainCircuitName: 'main',
    nargoBin: 'nargo',
    useNargo: false,
    autoCompile: true,
    autoGenerateContract: true,
  }
};
```

## Next

Ideas for future improvements:

- [ ] Support multiple circuits within the same Hardhat project, each on their individual folder
- [x] Fall back to compilation and verifier generation using node libraries, if nargo is unavailable
