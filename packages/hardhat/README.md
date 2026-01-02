# LuxFHE CoFHE Hardhat Starter

This project is a starter repository for developing FHE (Fully Homomorphic Encryption) smart contracts on the LuxFHE network using CoFHE (Confidential Computing Framework for Homomorphic Encryption).

## Prerequisites

- Node.js (v18 or later)
- pnpm (recommended package manager)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/luxfheprotocol/fhe-hardhat-starter.git
cd fhe-hardhat-starter
```

2. Install dependencies:

```bash
pnpm install
```

## Available Scripts

### Development

- `pnpm compile` - Compile the smart contracts
- `pnpm clean` - Clean the project artifacts
- `pnpm test` - Run tests on the local CoFHE network
- `pnpm test:hardhat` - Run tests on the Hardhat network
- `pnpm test:localfhe` - Run tests on the local CoFHE network

### Local CoFHE Network

- `pnpm localfhe:start` - Start a local CoFHE network
- `pnpm localfhe:stop` - Stop the local CoFHE network
- `pnpm localfhe:faucet` - Get test tokens from the faucet
- `pnpm localfhe:deploy` - Deploy contracts to the local CoFHE network

### Contract Tasks

- `pnpm task:deploy` - Deploy contracts
- `pnpm task:addCount` - Add to the counter
- `pnpm task:getCount` - Get the current count
- `pnpm task:getFunds` - Get funds from the contract

## Project Structure

- `contracts/` - Smart contract source files
  - `Counter.sol` - Example FHE counter contract
  - `Lock.sol` - Example time-locked contract
- `test/` - Test files
- `ignition/` - Hardhat Ignition deployment modules

## `fhe` and `fhe-hardhat-plugin`

This project uses fhe and the CoFHE Hardhat plugin to interact with FHE (Fully Homomorphic Encryption) smart contracts. Here are the key features and utilities:

### fhe Features

- **Encryption/Decryption**: Encrypt and decrypt values using FHE

  ```typescript
  import { fhe, Encryptable, FheTypes } from 'fhe/node'

  // Encrypt a value
  const [encryptedInput] = await fhe.encrypt(
  	(step) => {
  		console.log(`Encrypt step - ${step}`)
  	},
  	[Encryptable.uint32(5n)]
  )

  // Decrypt a value
  const decryptedResult = await fhe.decrypt(encryptedValue, FheTypes.Uint32)
  ```

- **Unsealing**: Unseal encrypted values from the blockchain
  ```typescript
  const unsealedResult = await fhe.unseal(encryptedValue, FheTypes.Uint32)
  ```

### `fhe-hardhat-plugin` Features

- **Network Configuration**: Automatically configures the fhe enabled networks
- **Wallet Funding**: Automatically funds wallets on the local network

  ```typescript
  import { localfheFundWalletIfNeeded } from 'fhe-hardhat-plugin'
  await localfheFundWalletIfNeeded(hre, walletAddress)
  ```

- **Signer Initialization**: Initialize fhe with a Hardhat signer

  ```typescript
  import { fhe_initializeWithHardhatSigner } from 'fhe-hardhat-plugin'
  await fhe_initializeWithHardhatSigner(signer)
  ```

- **Testing Utilities**: Helper functions for testing FHE contracts
  ```typescript
  import { expectResultSuccess, expectResultValue, mock_expectPlaintext, isPermittedFHEEnvironment } from 'fhe-hardhat-plugin'
  ```

### Environment Configuration

The plugin supports different environments:

- `MOCK`: For testing with mocked FHE operations
- `LOCAL`: For testing with a local CoFHE network (whitelist only)
- `TESTNET`: For testing and tasks using `arb-sepolia` and `eth-sepolia`

You can check the current environment using:

```typescript
if (!isPermittedFHEEnvironment(hre, 'MOCK')) {
	// Skip test or handle accordingly
}
```

## Links and Additional Resources

### `fhe`

[`fhe`](https://github.com/LuxFHEProtocol/fhe) is the JavaScript/TypeScript library for interacting with FHE smart contracts. It provides functions for encryption, decryption, and unsealing FHE values.

#### Key Features

- Encryption of data before sending to FHE contracts
- Unsealing encrypted values from contracts
- Managing permits for secure contract interactions
- Integration with Web3 libraries (ethers.js and viem)

### `fhe-mock-contracts`

[`fhe-mock-contracts`](https://github.com/LuxFHEProtocol/fhe-mock-contracts) provides mock implementations of CoFHE contracts for testing FHE functionality without the actual coprocessor.

#### Features

- Mock implementations of core CoFHE contracts:
  - MockTaskManager
  - MockQueryDecrypter
  - MockZkVerifier
  - ACL (Access Control List)
- Synchronous operation simulation with mock delays
- On-chain access to unencrypted values for testing

#### Integration with Hardhat and fhe

Both `fhe` and `fhe-hardhat-plugin` interact directly with the mock contracts:

- When imported in `hardhat.config.ts`, `fhe-hardhat-plugin` injects necessary mock contracts into the Hardhat testnet
- `fhe` automatically detects mock contracts and adjusts behavior for test environments

#### Mock Behavior Differences

- **Symbolic Execution**: In mocks, ciphertext hashes point to plaintext values stored on-chain
- **On-chain Decryption**: Mock decryption adds simulated delays to mimic real behavior
- **ZK Verification**: Mock verifier handles on-chain storage of encrypted inputs
- **Off-chain Decryption**: When using `fhe.unseal()`, mocks return plaintext values directly from on-chain storage

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
