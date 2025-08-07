
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title UserManagement
 * @dev Manages user roles and permissions in the PharmaTrack system
 * 
 * BLOCKCHAIN LOGIC DESCRIPTION:
 * This contract handles all user authentication and authorization for the pharmaceutical supply chain.
 * It replaces the current localStorage-based auth system with blockchain-based identity management.
 * 
 * KEY RESPONSIBILITIES:
 * - Register and manage user accounts (manufacturers, distributors, pharmacies, customers)
 * - Assign and revoke roles with appropriate permissions
 * - Validate user permissions for drug operations
 * - Maintain company profiles and verification status
 * - Handle multi-signature requirements for critical operations
 * - Integrate with existing auth system for seamless transition
 * 
 * USER ROLES:
 * - ADMIN: Full system access, can manage all users and drugs
 * - MANUFACTURER: Can create drugs, generate QR codes, transfer to distributors
 * - DISTRIBUTOR: Can receive from manufacturers, transfer to pharmacies
 * - PHARMACY: Can receive from distributors, sell to customers
 * - CUSTOMER: Can view drug information, verify authenticity
 * - INSPECTOR: Can perform quality checks, access audit trails
 * 
 * INTEGRATION WITH REACT APP:
 * - Login.tsx calls authenticateUser() instead of localStorage
 * - Registration forms call registerUser() with role assignment
 * - All protected routes validate permissions through this contract
 * - Profile management updates blockchain data
 * 
 * ETHEREUM COMPATIBILITY:
 * - Uses OpenZeppelin AccessControl for standard role management
 * - Implements EIP-712 for secure off-chain signature verification
 * - Gas-optimized role checking for frequent operations
 */
