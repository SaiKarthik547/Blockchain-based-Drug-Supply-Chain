import { ethers } from 'ethers';

// Blockchain authentication utility for MetaMask integration

export interface BlockchainUser {
  address: string;
  role: 'admin' | 'manufacturer' | 'distributor' | 'pharmacy' | 'customer';
  name: string;
  organization: string;
  registered: boolean;
}

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof (window as any).ethereum !== 'undefined' && 
         (window as any).ethereum.isMetaMask;
};

// Request MetaMask connection
export const connectMetaMask = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  try {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    return accounts[0];
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw new Error('Failed to connect to MetaMask. Please try again.');
  }
};

// Get current account
export const getCurrentAccount = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const accounts = await provider.send('eth_accounts', []);
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

// Get account balance
export const getAccountBalance = async (address: string): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting account balance:', error);
    throw new Error('Failed to get account balance');
  }
};

// Mock function to get user role based on blockchain address
// In a real implementation, this would interact with the UserManagement smart contract
export const getUserRole = async (address: string): Promise<BlockchainUser> => {
  // This is a mock implementation - in reality, we would call the smart contract
  // to get the user's role and other information
  
  // For demo purposes, we'll assign roles based on the address
  // In a real app, this would be stored on the blockchain
  const roles: ('admin' | 'manufacturer' | 'distributor' | 'pharmacy' | 'customer')[] = 
    ['admin', 'manufacturer', 'distributor', 'pharmacy', 'customer'];
  
  // Simple hash-based role assignment for demo
  const addressHash = parseInt(address.slice(2, 10), 16);
  const roleIndex = addressHash % roles.length;
  
  return {
    address,
    role: roles[roleIndex],
    name: `User ${address.slice(0, 8)}`,
    organization: `Organization ${address.slice(0, 6)}`,
    registered: true
  };
};

// Mock function to register a user on the blockchain
// In a real implementation, this would call the UserManagement smart contract
export const registerUserOnBlockchain = async (
  address: string,
  name: string,
  organization: string,
  role: 'admin' | 'manufacturer' | 'distributor' | 'pharmacy' | 'customer'
): Promise<boolean> => {
  // This is a mock implementation - in reality, we would call the smart contract
  console.log(`Registering user ${name} with role ${role} on blockchain`);
  
  // Simulate blockchain registration
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return success
  return true;
};

// Blockchain login function
export const blockchainLogin = async (): Promise<{ success: boolean; user?: BlockchainUser; error?: string }> => {
  try {
    // Connect to MetaMask
    const address = await connectMetaMask();
    
    if (!address) {
      return { success: false, error: 'No account connected' };
    }
    
    // Get user role from blockchain
    const user = await getUserRole(address);
    
    // Store user info in localStorage for persistence
    localStorage.setItem('blockchain_user', JSON.stringify(user));
    localStorage.setItem('blockchain_authenticated', 'true');
    
    return { success: true, user };
  } catch (error: any) {
    console.error('Blockchain login error:', error);
    return { success: false, error: error.message || 'Failed to login with MetaMask' };
  }
};

// Check if user is authenticated with blockchain
export const isBlockchainAuthenticated = (): boolean => {
  return localStorage.getItem('blockchain_authenticated') === 'true';
};

// Get current blockchain user
export const getCurrentBlockchainUser = (): BlockchainUser | null => {
  const userStr = localStorage.getItem('blockchain_user');
  return userStr ? JSON.parse(userStr) : null;
};

// Logout from blockchain
export const blockchainLogout = (): void => {
  localStorage.removeItem('blockchain_user');
  localStorage.removeItem('blockchain_authenticated');
};

// Switch network to Ethereum (or your preferred network)
export const switchToEthereumNetwork = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled()) {
    return false;
  }

  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }], // Ethereum mainnet
    });
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.infura.io/v3/'],
              blockExplorerUrls: ['https://etherscan.io/'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding network:', addError);
        return false;
      }
    }
    console.error('Error switching network:', switchError);
    return false;
  }
};