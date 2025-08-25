// Authentication utilities with local storage
import { v4 as uuidv4 } from 'uuid'
import { isBlockchainAuthenticated, getCurrentBlockchainUser, blockchainLogout } from '@/utils/blockchain'

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'manufacturer' | 'distributor' | 'pharmacy' | 'customer'
  name: string
  organization: string
  createdAt: Date
  lastLogin: Date
  isActive: boolean
  // Blockchain specific fields
  blockchainAddress?: string
  isBlockchainUser?: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  name: string
  organization: string
  role: 'manufacturer' | 'distributor' | 'pharmacy' | 'customer'
}

// Local storage keys
const USERS_KEY = 'chaintrackr_users'
const CURRENT_USER_KEY = 'chaintrackr_current_user'
const SESSION_KEY = 'chaintrackr_session'

// Utility function to convert date strings back to Date objects
const convertUserDates = (user: any): User => {
  return {
    ...user,
    createdAt: new Date(user.createdAt),
    lastLogin: new Date(user.lastLogin)
  }
}

// FRESH DEMO USERS - COMPLETELY NEW SYSTEM
const createFreshDemoUsers = (): User[] => {
  return [
    {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@pharmatrackindia.com',
      role: 'admin',
      name: 'System Administrator',
      organization: 'PharmaTrack India',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      isActive: true
    },
    {
      id: 'mfg-001',
      username: 'manufacturer',
      email: 'contact@manufacturer.com',
      role: 'manufacturer',
      name: 'Drug Manufacturer',
      organization: 'Pharma Manufacturing Ltd.',
      createdAt: new Date('2024-01-02'),
      lastLogin: new Date('2024-01-15'),
      isActive: true
    },
    {
      id: 'dist-001',
      username: 'distributor',
      email: 'ops@distributor.com',
      role: 'distributor',
      name: 'Drug Distributor',
      organization: 'Pharma Distribution Ltd.',
      createdAt: new Date('2024-01-03'),
      lastLogin: new Date('2024-01-20'),
      isActive: true
    },
    {
      id: 'pharm-001',
      username: 'pharmacy',
      email: 'manager@pharmacy.com',
      role: 'pharmacy',
      name: 'Local Pharmacy',
      organization: 'City Pharmacy Chain',
      createdAt: new Date('2024-01-04'),
      lastLogin: new Date('2024-01-25'),
      isActive: true
    },
    {
      id: 'cust-001',
      username: 'customer',
      email: 'customer@pharmatrackindia.com',
      role: 'customer',
      name: 'Customer User',
      organization: 'Individual Customer',
      createdAt: new Date('2024-01-05'),
      lastLogin: new Date('2024-01-30'),
      isActive: true
    }
  ]
}

// Initialize with demo users - FORCE FRESH START
const initializeDemoUsers = () => {
  console.log('🔄 FORCING FRESH DEMO USERS INITIALIZATION')
  
  // ALWAYS create fresh demo users
  const demoUsers = createFreshDemoUsers()
  localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers))
  console.log('✅ Fresh demo users created successfully')
  console.log('👥 Available users:', demoUsers.map(u => u.username))
}

// Get all users from localStorage - SIMPLIFIED
export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY)
  
  if (!users) {
    console.log('⚠️ No users found, creating fresh demo users')
    initializeDemoUsers()
    const freshUsers = localStorage.getItem(USERS_KEY)
    if (!freshUsers) return []
    return JSON.parse(freshUsers).map(convertUserDates)
  }
  
  try {
    const parsedUsers = JSON.parse(users).map(convertUserDates)
    console.log(`📊 Loaded ${parsedUsers.length} users from localStorage`)
    return parsedUsers
  } catch (error) {
    console.error('❌ Error parsing users, creating fresh demo users:', error)
    initializeDemoUsers()
    const freshUsers = localStorage.getItem(USERS_KEY)
    if (!freshUsers) return []
    return JSON.parse(freshUsers).map(convertUserDates)
  }
}

// Save users to localStorage
const saveUsers = (users: User[]) => {
  try {
    console.log('💾 Saving users to localStorage:', users.length)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    console.log('✅ Users saved successfully')
  } catch (error) {
    console.error('❌ Error saving users:', error)
  }
}

// Login user - SIMPLIFIED AND ROBUST
export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    console.log('🔐 Login attempt for:', credentials.username)
    
    // Get fresh users
    const users = getUsers()
    console.log('📊 Total users found:', users.length)
    console.log('👥 Available usernames:', users.map(u => u.username))
    
    // Find user by exact username match
    const user = users.find(u => u.username === credentials.username && u.isActive === true)
    console.log('🔍 Found user:', user ? `${user.username} (${user.role})` : 'NOT FOUND')
    
    if (!user) {
      console.log('❌ User not found or not active')
      return { success: false, error: 'Invalid username or password' }
    }
    
    // Accept any password with length >= 4 for demo
    const passwordValid = credentials.password.length >= 4
    console.log('🔑 Password valid:', passwordValid)
    
    if (!passwordValid) {
      console.log('❌ Password validation failed')
      return { success: false, error: 'Invalid username or password' }
    }
    
    // Update last login
    user.lastLogin = new Date()
    const updatedUsers = users.map(u => u.id === user.id ? user : u)
    saveUsers(updatedUsers)
    
    // Create session
    const session = {
      userId: user.id,
      token: uuidv4(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    
    console.log('✅ Login successful for:', user.username)
    return { success: true, user }
  } catch (error) {
    console.error('❌ Login error:', error)
    return { success: false, error: 'Login failed. Please try again.' }
  }
}

// Register new user
export const register = async (data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const users = getUsers()
    
    // Check if username or email already exists
    if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
      return { success: false, error: 'Username already exists' }
    }
    
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'Email already exists' }
    }
    
    // Create new user
    const newUser: User = {
      id: uuidv4(),
      username: data.username,
      email: data.email,
      role: data.role,
      name: data.name,
      organization: data.organization,
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true
    }
    
    // Save user
    const updatedUsers = [...users, newUser]
    saveUsers(updatedUsers)
    
    // Auto-login after registration
    const session = {
      userId: newUser.id,
      token: uuidv4(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    
    return { success: true, user: newUser }
  } catch (error) {
    return { success: false, error: 'Registration failed. Please try again.' }
  }
}

// Get current user (hybrid approach - checks both traditional and blockchain auth)
export const getCurrentUser = (): User | null => {
  // First check for blockchain authentication
  if (isBlockchainAuthenticated()) {
    const blockchainUser = getCurrentBlockchainUser()
    if (blockchainUser) {
      // Create a User object from blockchain data
      return {
        id: blockchainUser.address,
        username: blockchainUser.address,
        email: `${blockchainUser.address}@blockchain.user`,
        role: blockchainUser.role,
        name: blockchainUser.name,
        organization: blockchainUser.organization,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        blockchainAddress: blockchainUser.address,
        isBlockchainUser: true
      }
    }
  }
  
  // Fall back to traditional authentication
  const session = localStorage.getItem(SESSION_KEY)
  const currentUser = localStorage.getItem(CURRENT_USER_KEY)
  
  if (!session || !currentUser) return null
  
  try {
    const sessionData = JSON.parse(session)
    const userData = JSON.parse(currentUser)
    
    // Check if session is expired
    if (new Date(sessionData.expiresAt) < new Date()) {
      logout()
      return null
    }
    
    return convertUserDates(userData)
  } catch {
    return null
  }
}

// Logout user (hybrid approach)
export const logout = () => {
  // Logout from blockchain if authenticated
  if (isBlockchainAuthenticated()) {
    blockchainLogout()
  }
  
  // Traditional logout
  localStorage.removeItem(CURRENT_USER_KEY)
  localStorage.removeItem(SESSION_KEY)
}

// Reset authentication system - FORCE COMPLETE RESET
export const resetAuth = () => {
  console.log('🔄 FORCING COMPLETE AUTH RESET')
  localStorage.removeItem(USERS_KEY)
  localStorage.removeItem(CURRENT_USER_KEY)
  localStorage.removeItem(SESSION_KEY)
  blockchainLogout() // Also logout from blockchain
  initializeDemoUsers()
  console.log('✅ Authentication system completely reset')
}

// Check if user is authenticated (hybrid approach)
export const isAuthenticated = (): boolean => {
  // Check blockchain authentication first
  if (isBlockchainAuthenticated()) {
    return true
  }
  
  // Fall back to traditional authentication
  return getCurrentUser() !== null
}

// Check if user has specific role
export const hasRole = (role: string): boolean => {
  const user = getCurrentUser()
  return user?.role === role || user?.role === 'admin'
}

// Check if user can perform action based on role
export const canPerformAction = (action: 'create_drug' | 'transfer_drug' | 'sell_drug' | 'view_all' | 'manage_users' | 'generate_qr' | 'scan_qr'): boolean => {
  const user = getCurrentUser()
  if (!user) return false
  
  switch (action) {
    case 'create_drug':
      return user.role === 'manufacturer' || user.role === 'admin'
    case 'transfer_drug':
      return user.role === 'manufacturer' || user.role === 'distributor' || user.role === 'admin'
    case 'sell_drug':
      return user.role === 'pharmacy' || user.role === 'admin'
    case 'view_all':
      return user.role === 'admin'
    case 'manage_users':
      return user.role === 'admin'
    case 'generate_qr':
      return user.role === 'manufacturer' || user.role === 'admin'
    case 'scan_qr':
      return user.role === 'customer' || user.role === 'admin'
    default:
      return false
  }
}

// Get demo credentials for testing
export const getDemoCredentials = () => {
  return [
    { username: 'admin', password: 'admin123', role: 'Administrator', description: 'Full system access' },
    { username: 'manufacturer', password: 'manufacturer123', role: 'Manufacturer', description: 'Drug creation and QR generation' },
    { username: 'distributor', password: 'distributor123', role: 'Distributor', description: 'Distribution management' },
    { username: 'pharmacy', password: 'pharmacy123', role: 'Pharmacy', description: 'Inventory and order management' },
    { username: 'customer', password: 'customer123', role: 'Customer', description: 'Drug tracking and verification' }
  ]
}

// Test authentication system
export const testAuthSystem = async () => {
  console.log('🧪 Testing authentication system...')
  
  // Force complete reset
  resetAuth()
  
  // Test each demo account
  const credentials = getDemoCredentials()
  const results = []
  
  for (const cred of credentials) {
    console.log(`🔍 Testing: ${cred.username}`)
    const result = await login({ username: cred.username, password: cred.password })
    results.push({
      username: cred.username,
      success: result.success,
      error: result.error
    })
    console.log(`📊 Result for ${cred.username}:`, result.success ? '✅ SUCCESS' : '❌ FAILED - ' + result.error)
  }
  
  console.log('📋 All test results:', results)
  return results
}

// Force initialization on module load
console.log('🚀 Initializing fresh authentication system...')
initializeDemoUsers()