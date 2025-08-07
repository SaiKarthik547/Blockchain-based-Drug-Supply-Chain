// QR Code utilities for secure drug tracking
import QRCode from 'qrcode'
import QrScanner from 'qr-scanner'
import { DrugData } from './dataService'

export interface QRTrackingData {
  batchNumber: string
  drugName: string
  manufacturer: string
  productionDate: string
  securityHash: string
  timestamp: number
}

// Generate security hash for QR data integrity
const generateSecurityHash = (data: string): string => {
  // Simple hash function for demo - in production use proper cryptographic hash
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

// Create QR tracking data from drug data
export const createQRTrackingData = (drug: DrugData): QRTrackingData => {
  const baseData = `${drug.batchNumber}|${drug.drugName}|${drug.manufacturer}|${drug.productionDate.toISOString()}`
  const securityHash = generateSecurityHash(baseData + 'CHAINTRACKR_SECRET')
  
  return {
    batchNumber: drug.batchNumber,
    drugName: drug.drugName,
    manufacturer: drug.manufacturer,
    productionDate: drug.productionDate.toISOString(),
    securityHash,
    timestamp: Date.now()
  }
}

// Verify QR data integrity
export const verifyQRData = (qrData: QRTrackingData): boolean => {
  const baseData = `${qrData.batchNumber}|${qrData.drugName}|${qrData.manufacturer}|${qrData.productionDate}`
  const expectedHash = generateSecurityHash(baseData + 'CHAINTRACKR_SECRET')
  return qrData.securityHash === expectedHash
}

// Generate QR code as data URL
export const generateQRCode = async (drug: DrugData): Promise<string> => {
  const qrData = createQRTrackingData(drug)
  const qrString = JSON.stringify(qrData)
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1e40af', // Primary blue
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H' // High error correction for better reliability
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

// Generate QR code for printing (larger size)
export const generatePrintableQRCode = async (drug: DrugData): Promise<string> => {
  const qrData = createQRTrackingData(drug)
  const qrString = JSON.stringify(qrData)
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      width: 600,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating printable QR code:', error)
    throw new Error('Failed to generate printable QR code')
  }
}

// Parse QR code data
export const parseQRData = (qrString: string): QRTrackingData | null => {
  try {
    const qrData = JSON.parse(qrString) as QRTrackingData
    
    // Validate required fields
    if (!qrData.batchNumber || !qrData.drugName || !qrData.manufacturer || 
        !qrData.productionDate || !qrData.securityHash) {
      return null
    }
    
    // Verify data integrity
    if (!verifyQRData(qrData)) {
      console.warn('QR data integrity check failed')
      return null
    }
    
    return qrData
  } catch (error) {
    console.error('Error parsing QR data:', error)
    return null
  }
}

// Check if device has camera access
export const checkCameraAccess = async (): Promise<boolean> => {
  try {
    const hasCamera = await QrScanner.hasCamera()
    return hasCamera
  } catch (error) {
    console.error('Error checking camera access:', error)
    return false
  }
}

// Get available cameras
export const getAvailableCameras = async (): Promise<QrScanner.Camera[]> => {
  try {
    const cameras = await QrScanner.listCameras(true)
    return cameras
  } catch (error) {
    console.error('Error getting cameras:', error)
    return []
  }
}

// Local storage key for QR scan history
const QR_SCAN_HISTORY_KEY = 'chaintrackr_qr_scans'

// Save QR scan to history
export const saveQRScanToHistory = (qrData: QRTrackingData): void => {
  try {
    const existingHistory = localStorage.getItem(QR_SCAN_HISTORY_KEY)
    const history = existingHistory ? JSON.parse(existingHistory) : []
    
    // Add scan with timestamp
    const scanRecord = {
      ...qrData,
      scannedAt: new Date().toISOString(),
      scanId: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Keep only last 50 scans
    history.unshift(scanRecord)
    const trimmedHistory = history.slice(0, 50)
    
    localStorage.setItem(QR_SCAN_HISTORY_KEY, JSON.stringify(trimmedHistory))
  } catch (error) {
    console.error('Error saving QR scan to history:', error)
  }
}

// Get QR scan history
export const getQRScanHistory = () => {
  try {
    const history = localStorage.getItem(QR_SCAN_HISTORY_KEY)
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('Error getting QR scan history:', error)
    return []
  }
}

// Clear QR scan history
export const clearQRScanHistory = (): void => {
  localStorage.removeItem(QR_SCAN_HISTORY_KEY)
}

// Download QR code as image
export const downloadQRCode = async (drug: DrugData, printable: boolean = false): Promise<void> => {
  try {
    const qrCodeDataURL = printable ? 
      await generatePrintableQRCode(drug) : 
      await generateQRCode(drug)
    
    const link = document.createElement('a')
    link.download = `QR_${drug.batchNumber}_${printable ? 'printable' : 'standard'}.png`
    link.href = qrCodeDataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading QR code:', error)
    throw new Error('Failed to download QR code')
  }
}
