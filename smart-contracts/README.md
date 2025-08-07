# PharmaTrack India - Smart Contracts

## Overview
This directory contains all Solidity smart contracts for the PharmaTrack India blockchain integration. Each drug batch gets its own individual smart contract instance, making the system fully decentralized and Ethereum-compatible.

## Architecture

### Core Principle: One Batch = One Blockchain Contract
Every drug batch in the system deploys its own smart contract instance, ensuring:
- Complete isolation between batches
- Individual ownership and transfer rights
- Separate audit trails per batch
- Scalable architecture
- Ethereum ERC standards compliance

### Contract Structure

```
contracts/
├── core/                    # Core system contracts
│   ├── DrugRegistry.sol     # Central registry for all drugs
│   ├── DrugBatch.sol        # Individual batch contract template
│   ├── BatchFactory.sol     # Factory for creating batch contracts
│   └── UserManagement.sol   # Role-based access control
├── supply-chain/            # Supply chain management
│   ├── SupplyChain.sol      # Transfer and tracking logic
│   ├── Inventory.sol        # Inventory management
│   └── Orders.sol           # Order processing
├── quality/                 # Quality and compliance
│   ├── QualityControl.sol   # Quality checks and standards
│   └── AuditTrail.sol       # Immutable audit logging
├── pricing/                 # Pricing and discounts
│   └── PricingOracle.sol    # Dynamic pricing logic
└── interfaces/              # Contract interfaces
    ├── IDrugBatch.sol       # Batch contract interface
    ├── ISupplyChain.sol     # Supply chain interface
    └── IQualityControl.sol  # Quality control interface
```

## Ethereum Compatibility

### ERC Standards Implementation
- **ERC-721**: Each drug batch as a unique NFT
- **ERC-20**: Supply chain incentive tokens
- **ERC-165**: Interface detection
- **ERC-173**: Contract ownership

### Network Support
- **Ethereum Mainnet**: Production deployment
- **Ethereum Testnets**: Development and testing
- **Layer 2 Solutions**: Polygon, Arbitrum for lower gas costs
- **Local Development**: Ganache, Hardhat networks

## Integration with React Application

### Blockchain Service Layer
The smart contracts integrate with the existing React application through:
- `blockchainService.ts`: Main blockchain interaction service
- `contractInterfaces.ts`: TypeScript contract interfaces
- `web3Config.ts`: Web3 configuration and network settings

### Hybrid Data Architecture
- **Blockchain**: Immutable records, ownership, transfers
- **Local Storage**: UI state, caching, offline functionality
- **Synchronization**: Automatic sync between blockchain and local data

## Deployment Strategy

### Development Phase
1. Deploy to local Ganache network
2. Test all contract interactions
3. Verify gas optimization
4. Security audit preparation

### Testing Phase
1. Deploy to Ethereum testnets (Goerli, Sepolia)
2. End-to-end testing with React app
3. Performance and gas cost analysis
4. User acceptance testing

### Production Phase
1. Security audit completion
2. Deploy to Ethereum mainnet
3. Monitor contract performance
4. Gradual migration of existing data

## Gas Optimization

### Efficient Contract Design
- Minimal storage operations
- Batch operations where possible
- Event-based data retrieval
- Proxy patterns for upgradability

### Cost Considerations
- Factory pattern reduces deployment costs
- Efficient data structures
- Optimized function calls
- Layer 2 integration for lower fees

## Security Features

### Access Control
- Role-based permissions
- Multi-signature requirements
- Time-locked operations
- Emergency pause functionality

### Data Integrity
- Cryptographic hashes
- Merkle tree verification
- Immutable audit trails
- Tamper-proof records

## Getting Started

### Prerequisites
- Node.js 18+
- Truffle or Hardhat
- MetaMask wallet
- Ethereum testnet ETH

### Installation
```bash
cd smart-contracts
npm install
truffle compile
truffle migrate --network development
```

### Testing
```bash
truffle test
npm run test:coverage
```

## Contract Addresses (To be updated after deployment)

### Mainnet
- DrugRegistry: `0x...`
- BatchFactory: `0x...`
- SupplyChain: `0x...`

### Testnet (Goerli)
- DrugRegistry: `0x...`
- BatchFactory: `0x...`
- SupplyChain: `0x...`

## Documentation

- [Contract API Documentation](./docs/api.md)
- [Integration Guide](./docs/integration.md)
- [Deployment Guide](./docs/deployment.md)
- [Security Audit](./docs/security.md)

## Support

For technical support or questions about the smart contracts, please refer to the main project documentation or contact the development team.
