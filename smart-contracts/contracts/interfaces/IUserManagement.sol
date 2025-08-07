// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IUserManagement
 * @dev Interface for user management and authentication
 * 
 * BLOCKCHAIN LOGIC DESCRIPTION:
 * This interface defines the standard functions for user management,
 * role assignment, and authentication in the PharmaTrack system.
 * 
 * KEY INTERFACE FUNCTIONS:
 * - registerUser(): Register new users with roles
 * - authenticateUser(): Verify user credentials
 * - assignRole(): Assign roles to users
 * - revokeRole(): Remove roles from users
 * - hasPermission(): Check user permissions
 * - updateProfile(): Update user profile information
 * 
 * ROLE DEFINITIONS:
 * - ADMIN: Full system access
 * - MANUFACTURER: Drug creation and QR generation
 * - DISTRIBUTOR: Supply chain management
 * - PHARMACY: Sales and customer service
 * - CUSTOMER: Drug verification and purchase
 * - INSPECTOR: Quality control and auditing
 * 
 * INTEGRATION REQUIREMENTS:
 * - Must be implemented by UserManagement contract
 * - Used by all other contracts for access control
 * - Enables role-based UI rendering in frontend
 * - Supports multi-signature operations
 * 
 * ETHEREUM COMPATIBILITY:
 * - OpenZeppelin AccessControl compatibility
 * - EIP-712 signature verification support
 * - Gas-optimized permission checking
 * - Event-driven role change notifications
 */
