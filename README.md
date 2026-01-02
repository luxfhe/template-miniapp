# CoFHE MiniApp Template

A fully-featured template for building privacy-preserving decentralized applications using **LuxFHE CoFHE (Confidential on Fully Homomorphic Encryption)** and **Base MiniApps**. This template demonstrates how to integrate Fully Homomorphic Encryption (FHE) into a Base or Farcaster MiniApp, allowing users to interact with encrypted on-chain data without ever revealing the actual values.

## 🎯 Purpose

This template showcases how to build applications that leverage **Fully Homomorphic Encryption** to:
- Store and manipulate encrypted data on-chain
- Perform computations on encrypted values without decryption
- Maintain user privacy while ensuring transparency and verifiability
- Create seamless user experiences with Web3 wallets and Farcaster integration

The template includes a simple **encrypted counter** example that demonstrates the complete FHE workflow: encryption, on-chain computation, and local decryption.

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- A wallet with a private key and testnet funds (Base Sepolia)
  - Get Base Sepolia ETH from: [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- **OnchainKit API Key** from [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
- (Optional) A Farcaster account for testing the MiniApp

## 🏗️ Project Structure

This is a **monorepo** containing two main packages:

```
fhe-miniapp-template/
├── packages/
│   ├── hardhat/          # Smart contract development
│   └── miniapp/          # Next.js MiniApp frontend
├── package.json          # Root package with workspace scripts
└── README.md
```

## 🚀 Quick Start

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Environment Setup

> **Note:** After setting up your environment, you'll need to deploy the contract. See the [🚢 Deploying Your Contract](#-deploying-your-contract) section below.

1. **For Hardhat** (`packages/hardhat/.env`):
```env
PRIVATE_KEY=your_private_key_here
```

2. **For MiniApp** (`packages/miniapp/.env.local`):
```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_coinbase_api_key
NEXT_PUBLIC_URL=your_app_deployed_url
```

## 🚢 Deploying Your Contract

Before you can use the MiniApp, you need to deploy the Counter contract and configure the frontend to use it.

### Step 1: Deploy the Contract

Navigate to the Hardhat package and deploy to Base Sepolia:

```bash
# From the root directory
npm run deploycounter:hardhat

# OR from the hardhat directory
cd packages/hardhat
npx hardhat deploy-counter --network base-sepolia
```

**Expected Output:**
```
Deploying Counter to base-sepolia...
Deploying with account: 0x...
Counter deployed to: 0x316afF9FB759ab89124464048A6B6b305A618Bd0
```

The deployment script will automatically save the contract address to `packages/hardhat/deployments/base-sepolia.json`.

### Step 2: Get the Contract ABI

After compilation, the ABI is available in the artifacts:

```bash
# Compile contracts (if not already compiled)
cd packages/hardhat
npx hardhat compile
```

The ABI will be generated at:
```
packages/hardhat/artifacts/contracts/Counter.sol/Counter.json
```

### Step 3: Update deployedContracts.ts

Update the contract configuration in the MiniApp:

**File:** `packages/miniapp/src/contracts/deployedContracts.ts`

```typescript
export const CONTRACT_ABI = [
  // ... (copy the ABI from Counter.json)
];

export const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
```

**How to get the ABI:**
1. Open `packages/hardhat/artifacts/contracts/Counter.sol/Counter.json`
2. Copy the `abi` array from the JSON file
3. Paste it as `CONTRACT_ABI` in `deployedContracts.ts`

**How to get the Address:**
1. Copy the address from the deployment output
2. OR check `packages/hardhat/deployments/base-sepolia.json`
3. Set it as `CONTRACT_ADDRESS` in `deployedContracts.ts`

### Step 4: Verify Your Setup

Make sure the contract is properly configured:

```bash
# Start the MiniApp
npm run dev:miniapp
```

If the contract address is correctly set, you should be able to:
- Connect your wallet
- Initialize CoFHE
- Generate a permit
- Interact with the encrypted counter

### Deployment Script Details

The deployment task is located at `packages/hardhat/tasks/deploy-counter.ts`:

```typescript
task('deploy-counter', 'Deploy the Counter contract')
  .setAction(async (_, hre) => {
    const [deployer] = await ethers.getSigners()
    const Counter = await ethers.getContractFactory('Counter')
    const counter = await Counter.deploy()
    await counter.waitForDeployment()
    
    const counterAddress = await counter.getAddress()
    saveDeployment(network.name, 'Counter', counterAddress)
    
    return counterAddress
  })
```

The script:
1. Gets the deployer's signer from your `PRIVATE_KEY`
2. Deploys the Counter contract
3. Waits for deployment confirmation
4. Saves the address to the deployments folder

### Deploying to Other Networks

To deploy to different networks, update `packages/hardhat/hardhat.config.ts` and use:

```bash
# Ethereum Sepolia
npx hardhat deploy-counter --network eth-sepolia

# Arbitrum Sepolia
npx hardhat deploy-counter --network arb-sepolia
```

### Quick Deployment Checklist

```
✅ Install dependencies: npm run install:all
✅ Create .env file in packages/hardhat/ with PRIVATE_KEY
✅ Ensure wallet has Base Sepolia testnet ETH
✅ Compile contracts: npm run build:hardhat
✅ Deploy contract: npm run deploycounter:hardhat
✅ Copy deployed address from terminal output
✅ Update CONTRACT_ADDRESS in packages/miniapp/src/contracts/deployedContracts.ts
✅ Start MiniApp: npm run dev:miniapp
```

### Troubleshooting Deployment

**Issue: "insufficient funds for intrinsic transaction cost"**
- Solution: Get Base Sepolia ETH from the [faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

**Issue: "missing PRIVATE_KEY"**
- Solution: Create a `.env` file in `packages/hardhat/` and add your private key

**Issue: "CONTRACT_ADDRESS is empty" error in MiniApp**
- Solution: Make sure you've updated `packages/miniapp/src/contracts/deployedContracts.ts` with your deployed contract address

**Issue: Network connection timeout**
- Solution: Check your internet connection or try again. The Base Sepolia network may be experiencing high traffic.

## 📜 Available Scripts

### Root Level Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:miniapp` | Start the MiniApp development server |
| `npm run build:miniapp` | Build the MiniApp for production |
| `npm run start:miniapp` | Start the production MiniApp server |
| `npm run build:hardhat` | Compile smart contracts |
| `npm run test:hardhat` | Run smart contract tests |
| `npm run deploycounter:hardhat` | Deploy Counter contract to Base Sepolia |
| `npm run clean` | Remove all node_modules |
| `npm run install:all` | Install dependencies for all packages |

## 📦 Packages

### 1. Hardhat Package (`packages/hardhat/`)

The Hardhat package handles smart contract development and deployment for CoFHE-enabled contracts.

#### Key Features

- **CoFHE Integration**: Uses `@luxfheprotocol/fhe-contracts` for FHE operations
- **Network Support**: Configured for Ethereum Sepolia, Arbitrum Sepolia, and Base Sepolia
- **Testing**: Includes test suite for encrypted operations
- **Deployment Tasks**: Custom Hardhat tasks for contract interaction

#### Smart Contract: Counter.sol

The example contract demonstrates FHE operations:

```solidity
contract Counter {
    euint32 public count;  // Encrypted counter value
    
    function increment() public { /* ... */ }
    function decrement() public { /* ... */ }
    function reset(InEuint32 memory value) public { /* ... */ }
}
```

**Key FHE Operations**:
- `FHE.asEuint32()` - Convert plaintext to encrypted value
- `FHE.add()` / `FHE.sub()` - Arithmetic on encrypted values
- `FHE.allowSender()` - Grant decryption permissions
- `FHE.decrypt()` - Request decryption (async operation)

#### Hardhat Scripts

```bash
cd packages/hardhat

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Base Sepolia
npx hardhat deploy-counter --network base-sepolia

# Interact with deployed contract
npx hardhat increment-counter --network base-sepolia
npx hardhat reset-counter --network base-sepolia
```

#### Important Files

- `contracts/Counter.sol` - Example FHE contract
- `tasks/` - Custom Hardhat tasks for deployment and interaction
- `test/Counter.test.ts` - Contract test suite
- `deployments/base-sepolia.json` - Deployed contract addresses

---

### 2. MiniApp Package (`packages/miniapp/`)

A Next.js application that integrates with Farcaster MiniApps and demonstrates the complete CoFHE workflow.


#### The CoFHE Workflow

The MiniApp demonstrates a complete privacy-preserving workflow with 5 key steps:

##### Step 1: 🔐 Authentication

**File**: `src/app/page.tsx`

Users authenticate via Farcaster and connect their wallet:

```typescript
const { isFrameReady, context } = useMiniKit();
const { isConnected } = useAccount();
```

**Features**:
- Farcaster Frame authentication
- Wallet connection via OnchainKit
- Access to user's Farcaster profile (FID, display name)

---

##### Step 2: ⚙️ Initialize CoFHE

**File**: `src/hooks/useFHE.ts`

Initialize the CoFHE client to enable encryption/decryption operations:

```typescript
const { isInitialized, isInitializing } = useFHE();
```

**What happens**:
1. Connects to CoFHE network (verifier, coprocessor, threshold network)
2. Downloads FHE public keys
3. Initializes encryption/decryption capabilities
4. Sets up the viem client for blockchain interaction

**Key Configuration**:
```typescript
await fhe.initializeWithViem({
  viemClient: publicClient,
  viemWalletClient: walletClient,
  environment: "TESTNET",
  generatePermit: false,  // Permits generated manually
});
```

---

##### Step 3: 📝 Generate Permit

**File**: `src/hooks/usePermit.ts`

Create a permit that grants permission to encrypt/decrypt specific  values:

```typescript
const { hasValidPermit, generatePermit } = usePermit();

// Generate a new permit
await generatePermit();
```

**What is a Permit?**
- A cryptographic proof that grants encryption rights
- Signed by the user's wallet
- Has an expiration date (30 days in this template)
- Stored locally in browser storage
- Required before you can encrypt/decrypt any encrypted values

**Permit Configuration**:
```typescript
await fhe.createPermit({
  type: "self",
  name: "MiniApp Name",
  issuer: userAddress,
  expiration: Math.round(Date.now() / 1000) + (30 * 24 * 60 * 60),
});
```

---

##### Step 4: 🔒 Encrypt & Submit Transaction

**File**: `src/components/FHECounter.tsx`

Encrypt user input and send it to the smart contract:

```typescript
// 1. Encrypt the user's input
const encryptedInput = await fhe.encrypt([
  Encryptable.uint32(userValue)
]);

// 2. Send encrypted value to contract
const calls: ContractFunctionParameters[] = [{
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: "reset",
  args: [encryptedInput.data?.[0]],
}];

// 3. Execute transaction via OnchainKit
<Transaction calls={calls} onStatus={handleOnStatus}>
  <TransactionButton />
</Transaction>
```

**Key Points**:
- User input is encrypted client-side before being sent
- The blockchain never sees the plaintext value
- The contract can perform operations on the encrypted data
- Uses OnchainKit's Transaction components for seamless UX

---

##### Step 5: 🔓 Decrypt & Display

**File**: `src/components/FHECounter.tsx` (EncryptedValue component)

Decrypt encrypted values locally for display:

```typescript
// Read encrypted value from contract
const { data: count } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: "count",
});

// Decrypt locally using CoFHE
const decryptedValue = await fhe.unseal(ctHash, FheTypes.Uint32);

if (decryptedValue.success) {
  // Display the decrypted value
  setValue(decryptedValue.data!.toString());
}
```

**Key Points**:
- Decryption happens client-side using the permit
- Only users with valid permits can decrypt
- The contract must grant permission via `FHE.allowSender()`
- Decryption requires interaction with CoFHE decryption service

**Privacy Model**:
- The encrypted value (`count`) is public on-chain
- Only authorized users can decrypt it locally
- The decrypted value is never transmitted to the blockchain

---

#### Key Components

##### `FHECounter.tsx`
The main component demonstrating all FHE operations:
- **SetCounterRow** - Encrypts and sets new values
- **IncrementButton** - Increments encrypted counter
- **DecrementButton** - Decrements encrypted counter
- **EncryptedValue** - Displays and decrypts encrypted values
- **EncryptedCounterDisplay** - Wrapper for counter display

##### `useFHE.ts` Hook
Manages CoFHE initialization:
- Auto-initializes when wallet connects
- Resets on chain/account changes
- Provides encryption/decryption functions
- Manages permit generation

##### `usePermit.ts` Hook
Manages permit lifecycle:
- Check for existing permits
- Generate new permits
- Remove/revoke permits
- Validate permit expiration

##### `fheStore.ts`
Global state management:
```typescript
interface FHEStore {
  isInitialized: boolean;
  setIsInitialized: (value: boolean) => void;
}
```

##### `providers.tsx`
Sets up the application context:
- Wagmi configuration for Base Sepolia
- OnchainKit provider for transactions
- React Query for data fetching
- Farcaster MiniApp connector

---

#### Development

```bash
cd packages/miniapp

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

#### Deployment

The MiniApp can be deployed to Vercel, Netlify, or any platform supporting Next.js:

1. Build the application: `npm run build`
2. Deploy the `.next` folder
3. Ensure environment variables are set
4. Update the MiniKit config with your production URL

---

## 🔗 Important Links

### LuxFHE Documentation
- **Main Docs**: [https://docs.luxfhe.zone](https://docs.luxfhe.zone)

### Base & MiniApp Documentation
- **Base Docs**: [https://docs.base.org](https://docs.base.org)
- **OnchainKit**: [https://onchainkit.xyz](https://onchainkit.xyz)
- **MiniApp SDK**: [https://docs.farcaster.xyz/developers/frames/v2/miniapps](https://docs.farcaster.xyz/developers/frames/v2/miniapps)
- **Farcaster Docs**: [https://docs.farcaster.xyz](https://docs.farcaster.xyz)

### Additional Resources
- **CoFHE Contracts**: [https://github.com/LuxFHEProtocol/fhe-contracts](https://github.com/LuxFHEProtocol/fhe-contracts)

---

## 🎓 Understanding the Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

1. 🔐 AUTHENTICATION
   User connects Farcaster account + Web3 wallet
   ↓
2. ⚙️ INITIALIZE COFHE
   Download FHE keys and setup encryption/decryption
   ↓
3. 📝 GENERATE PERMIT
   Create cryptographic proof for decryption rights
   ↓
4. 🔒 ENCRYPT & TRANSACT
   Encrypt data locally → Send to smart contract → Contract operates on encrypted data
   ↓
5. 🔓 DECRYPT & DISPLAY
   Read encrypted value from chain → Decrypt locally using permit → Display to user
```

---

## 🔒 Privacy Guarantees

- **Client-Side Encryption**: User data is encrypted in the browser before transmission
- **On-Chain Privacy**: The blockchain only stores encrypted values
- **Permissioned Decryption**: Only users with valid permits can decrypt
- **Local Decryption**: Decryption happens client-side, not on-chain
- **Compute on Encrypted Data**: Smart contracts can perform operations without seeing plaintext

---

## 🛠️ Troubleshooting

### Common Issues

**CoFHE won't initialize**
- Ensure you're connected to a supported network (Base Sepolia)
- Check that your wallet is properly connected
- Clear browser storage and reconnect

**Permit generation fails**
- Verify wallet connection
- Check that CoFHE is initialized
- Ensure you're on the correct network

**Decryption fails**
- Confirm you have a valid permit
- Verify you've interacted with the contract (needed for permission)
- Check that `FHE.allowSender()` was called in the contract

**Transaction fails**
- Ensure you have sufficient testnet funds
- Verify contract address is correct
- Check network connectivity

---

## 📄 License

MIT

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 💬 Support

For questions and support:
- LuxFHE Discord: [https://discord.gg/luxfhe](https://discord.gg/luxfhe)
- LuxFHE Telegram: [https://t.me/LuxFHEOfficial](https://t.me/+OEO4CItQYh8xYzNh)
- Documentation: [https://docs.luxfhe.zone](https://docs.luxfhe.zone)

