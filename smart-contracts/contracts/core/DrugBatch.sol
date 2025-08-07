
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DrugBatch
 * @dev Individual contract for each drug batch (implements IDrugBatch)
 * 
 * BLOCKCHAIN LOGIC DESCRIPTION:
 * Each drug batch gets its own unique contract instance, making every batch a separate blockchain entity.
 * This provides maximum transparency, immutability, and individual tracking capabilities.
 * 
 * KEY RESPONSIBILITIES:
 * - Store immutable manufacturing data (batch number, composition, dates, etc.)
 * - Track complete supply chain journey from manufacturer to customer
 * - Calculate dynamic pricing based on expiry dates
 * - Record quality check results permanently
 * - Generate and verify QR codes for authenticity
 * - Handle transfers between supply chain entities
 * - Manage drug status (active, expired, recalled, sold)
 * 
 * UNIQUE BLOCKCHAIN FEATURES:
 * - Each batch is an ERC-721 NFT for unique identification
 * - Immutable audit trail of all transactions
 * - Automatic expiry-based pricing calculations
 * - Cryptographic QR code verification
 * - Emergency recall capabilities
 * - Multi-signature support for critical operations
 * 
 * INTEGRATION WITH REACT APP:
 * - Manufacturing.tsx deploys new instances via DrugRegistry
 * - Distribution.tsx calls transferDrug() for supply chain moves
 * - Sales.tsx calls sellDrug() for final customer sales
 * - TrackDrug.tsx reads complete history from blockchain
 * - QR scanner verifies authenticity using verifyQRCode()
 * 
 * DATA MIGRATION FROM CURRENT SYSTEM:
 * - Existing localStorage data can be migrated to blockchain
 * - Batch numbers remain consistent for continuity
 * - Historical data preserved in contract deployment
 */
