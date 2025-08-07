
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDrugRegistry
 * @dev Interface for the main drug registry contract
 * 
 * BLOCKCHAIN LOGIC DESCRIPTION:
 * This interface defines the standard functions for the central drug registry
 * that manages all drug batch contracts in the PharmaTrack system.
 * 
 * KEY INTERFACE FUNCTIONS:
 * - createDrugBatch(): Deploy new drug batch contracts
 * - findDrugBatch(): Locate specific drug batches
 * - getAllDrugs(): Retrieve all registered drugs
 * - getGlobalStats(): Get system-wide statistics
 * - validateBatchNumber(): Check batch number uniqueness
 * - updateDrugStatus(): Update drug status across system
 * 
 * INTEGRATION REQUIREMENTS:
 * - Must be implemented by DrugRegistry contract
 * - Used by frontend for type-safe contract interaction
 * - Enables contract upgradeability through proxy patterns
 * - Provides standard interface for third-party integrations
 * 
 * ETHEREUM COMPATIBILITY:
 * - EIP-165 interface detection support
 * - Standard function signatures for interoperability
 * - Gas estimation helpers for frontend
 * - Event definitions for real-time updates
 */
