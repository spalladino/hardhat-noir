export interface NoirConfig {
  /**
   * Path to the Noir circuits (defaults to circuits).
   */
  circuitsPath: string;
  /**
   * Name of the main circuit, used to generate the acir build artifact and
   * verifier contract (defaults to main).
   */
  mainCircuitName: string;
  /**
   * Path to the nargo binary (defaults to nargo).
   */
  nargoBin: string;
  /**
   * Whether to automatically call noir:compile when hardhat compile is
   * invoked (defaults to true, requires nargo).
   */
  autoCompile: boolean;
  /**
   * Whether to automatically call noir:contract when hardhat compile is
   * invoked (defaults to true, requires nargo).
   */
  autoGenerateContract: boolean;
}
