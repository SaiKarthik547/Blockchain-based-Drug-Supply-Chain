
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DrugRegistry
 * @dev Main registry contract for the PharmaTrack system
 * 
 * BLOCKCHAIN LOGIC DESCRIPTION:
 * This is the central registry that manages all drug batch contracts in the system.
 * It serves as the main entry point for the React application to interact with the blockchain.
 * 
 * KEY RESPONSIBILITIES:
 * - Deploy new DrugBatch contracts for each manufactured drug
 * - Maintain a registry of all drug batch contracts
 * - Provide search and discovery functions for drug batches
 * - Manage global statistics and analytics
 * - Handle batch number uniqueness validation
 * - Integrate with UserManagement for access control
 * 
 * INTEGRATION WITH REACT APP:
 * - Manufacturing.tsx calls createDrugBatch() to deploy new contracts
 * - Dashboard.tsx calls getGlobalStats() for analytics
 * - TrackDrug.tsx calls findDrugBatch() to locate specific drugs
 * - All components use this as the main blockchain interface
 * 
 * ETHEREUM COMPATIBILITY:
 * - Uses standard Ethereum gas optimization techniques
 * - Implements EIP-165 for interface detection
 * - Compatible with all major Ethereum wallets (MetaMask, WalletConnect)
 * - Supports both mainnet and testnets (Goerli, Sepolia)
 */
