// Mock data service for drug supply chain tracking
import { v4 as uuidv4 } from 'uuid'

// Utility function to convert date strings back to Date objects
const convertDates = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  
  if (Array.isArray(obj)) {
    return obj.map(convertDates)
  }
  
  const converted: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (key.includes('Date') || key.includes('timestamp') || key === 'productionDate' || key === 'expiryDate') {
      converted[key] = typeof value === 'string' ? new Date(value) : value
    } else if (typeof value === 'object' && value !== null) {
      converted[key] = convertDates(value)
    } else {
      converted[key] = value
    }
  }
  return converted
}

// Types for drug tracking
export interface DrugData {
  batchNumber: string
  drugName: string
  manufacturer: string
  composition: string
  productionDate: Date
  expiryDate: Date
  currentStatus: 'manufactured' | 'distributed' | 'sold' | 'expired'
  history: DrugEvent[]
  qrCodeGenerated?: boolean
  qrCodeData?: string
  price: number
  discountedPrice?: number
  isExpired: boolean
  isBlacklisted: boolean
}

export interface DrugEvent {
  type: 'manufactured' | 'transferred' | 'sold'
  timestamp: Date
  details: {
    entity?: string
    location?: string
    price?: number
    fromEntity?: string
    toEntity?: string
  }
}

export interface TransferData {
  batchNumber: string
  fromEntity: string
  toEntity: string
  transferDate: Date
  location: string
}

export interface SaleData {
  batchNumber: string
  pharmacy: string
  saleDate: Date
  price: number
  location: string
}

// Enhanced interfaces for order management
export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  pharmacyId: string
  pharmacyName: string
  drugBatchNumber: string
  drugName: string
  quantity: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: Date
  expectedDeliveryDate?: Date
  actualDeliveryDate?: Date
  notes?: string
  trackingNumber?: string
}

export interface Inventory {
  id: string
  drugBatchNumber: string
  drugName: string
  location: 'manufacturer' | 'distributor' | 'pharmacy'
  locationId: string
  locationName: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  unitPrice: number
  lastUpdated: Date
  expiryDate: Date
  isExpired: boolean
}

export interface Delivery {
  id: string
  orderId: string
  fromLocation: string
  toLocation: string
  fromLocationName: string
  toLocationName: string
  drugBatchNumber: string
  drugName: string
  quantity: number
  status: 'scheduled' | 'in_transit' | 'delivered' | 'cancelled'
  scheduledDate: Date
  actualDate?: Date
  trackingNumber: string
  notes?: string
}

export interface QualityCheck {
  id: string
  drugBatchNumber: string
  manufacturerId: string
  manufacturerName: string
  checkDate: Date
  qualityScore: number
  isPassed: boolean
  notes: string
  inspectorName: string
}

export interface ProductionRequest {
  id: string
  distributorId: string
  distributorName: string
  drugName: string
  requestedQuantity: number
  requestedBy: Date
  status: 'pending' | 'approved' | 'in_production' | 'completed' | 'cancelled'
  expectedCompletionDate?: Date
  actualCompletionDate?: Date
  notes?: string
}

// Mock database storage
const mockDatabase: Map<string, DrugData> = new Map()

// Mock data storage
const orders = new Map<string, Order>()
const inventory = new Map<string, Inventory>()
const deliveries = new Map<string, Delivery>()
const qualityChecks = new Map<string, QualityCheck>()
const productionRequests = new Map<string, ProductionRequest>()

// Generate unique batch number
export const generateBatchNumber = (): string => {
  return `BATCH-${uuidv4().substring(0, 8).toUpperCase()}`
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

// Mock data service functions
export const dataService = {
  // Create new drug
  createDrug: async (drugData: Omit<DrugData, 'history' | 'currentStatus' | 'isExpired' | 'isBlacklisted' | 'qrCodeGenerated' | 'qrCodeData'>): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const now = new Date()
      const isExpired = drugData.expiryDate < now
      
      const drug: DrugData = {
        ...drugData,
        currentStatus: isExpired ? 'expired' : 'manufactured',
        isExpired,
        isBlacklisted: isExpired,
        qrCodeGenerated: false,
        price: drugData.price || 0,
        history: [{
          type: 'manufactured',
          timestamp: drugData.productionDate,
          details: {
            entity: drugData.manufacturer,
            location: 'Manufacturing Facility'
          }
        }]
      }
      
      mockDatabase.set(drugData.batchNumber, drug)
      return true
    } catch (error) {
      console.error('Error creating drug:', error)
      return false
    }
  },

  // Generate QR code for drug (manufacturer/admin only)
  generateQRCode: async (batchNumber: string): Promise<{ success: boolean; qrCodeData?: string; error?: string }> => {
    try {
      const drug = mockDatabase.get(batchNumber)
      if (!drug) {
        return { success: false, error: 'Drug not found' }
      }
      
      if (drug.qrCodeGenerated) {
        return { success: false, error: 'QR code already generated for this batch' }
      }
      
      // Generate QR code data
      const qrData = {
        batchNumber: drug.batchNumber,
        drugName: drug.drugName,
        manufacturer: drug.manufacturer,
        productionDate: drug.productionDate.toISOString(),
        expiryDate: drug.expiryDate.toISOString(),
        composition: drug.composition,
        price: drug.price,
        securityHash: generateSecurityHash(drug.batchNumber + drug.drugName + drug.manufacturer)
      }
      
      drug.qrCodeGenerated = true
      drug.qrCodeData = JSON.stringify(qrData)
      mockDatabase.set(batchNumber, drug)
      
      return { success: true, qrCodeData: drug.qrCodeData }
    } catch (error) {
      console.error('Error generating QR code:', error)
      return { success: false, error: 'Failed to generate QR code' }
    }
  },

  // Get drug by QR code (customer access)
  getDrugByQRCode: async (qrCodeData: string): Promise<DrugData | null> => {
    try {
      const qrData = JSON.parse(qrCodeData)
      const drug = mockDatabase.get(qrData.batchNumber)
      
      if (!drug) return null
      
      // Verify security hash
      const expectedHash = generateSecurityHash(qrData.batchNumber + qrData.drugName + qrData.manufacturer)
      if (qrData.securityHash !== expectedHash) {
        return null
      }
      
      return drug
    } catch (error) {
      console.error('Error getting drug by QR code:', error)
      return null
    }
  },

  // Calculate discounted price based on expiry
  calculateDiscountedPrice: (drug: DrugData): number => {
    const now = new Date()
    const daysUntilExpiry = Math.ceil((drug.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry <= 0) {
      return 0 // Expired - not for sale
    } else if (daysUntilExpiry <= 30) {
      return Math.round(drug.price * 0.5) // 50% discount for < 30 days
    } else if (daysUntilExpiry <= 60) {
      return Math.round(drug.price * 0.7) // 30% discount for < 60 days
    } else if (daysUntilExpiry <= 90) {
      return Math.round(drug.price * 0.85) // 15% discount for < 90 days
    }
    
    return drug.price // No discount
  },

  // Update drug expiry status
  updateExpiryStatus: async (): Promise<void> => {
    const now = new Date()
    for (const [batchNumber, drug] of mockDatabase.entries()) {
      if (drug.expiryDate < now && !drug.isExpired) {
        drug.isExpired = true
        drug.isBlacklisted = true
        drug.currentStatus = 'expired'
        drug.discountedPrice = 0
        mockDatabase.set(batchNumber, drug)
      } else if (!drug.isExpired) {
        drug.discountedPrice = dataService.calculateDiscountedPrice(drug)
        mockDatabase.set(batchNumber, drug)
      }
    }
  },

  // Transfer drug
  transferDrug: async (transferData: TransferData): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const drug = mockDatabase.get(transferData.batchNumber)
      if (!drug) throw new Error('Drug not found')
      
      drug.history.push({
        type: 'transferred',
        timestamp: transferData.transferDate,
        details: {
          fromEntity: transferData.fromEntity,
          toEntity: transferData.toEntity,
          location: transferData.location
        }
      })
      
      drug.currentStatus = 'distributed'
      mockDatabase.set(transferData.batchNumber, drug)
      return true
    } catch (error) {
      console.error('Error transferring drug:', error)
      return false
    }
  },

  // Sell drug
  sellDrug: async (saleData: SaleData): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const drug = mockDatabase.get(saleData.batchNumber)
      if (!drug) throw new Error('Drug not found')
      
      drug.history.push({
        type: 'sold',
        timestamp: saleData.saleDate,
        details: {
          entity: saleData.pharmacy,
          location: saleData.location,
          price: saleData.price
        }
      })
      
      drug.currentStatus = 'sold'
      mockDatabase.set(saleData.batchNumber, drug)
      return true
    } catch (error) {
      console.error('Error selling drug:', error)
      return false
    }
  },

  // Get drug history
  getDrugHistory: async (batchNumber: string): Promise<DrugData | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockDatabase.get(batchNumber) || null
    } catch (error) {
      console.error('Error getting drug history:', error)
      return null
    }
  },

  // Get all drugs for dashboard stats
  getAllDrugs: async (): Promise<DrugData[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return Array.from(mockDatabase.values())
  },

  // Import from CSV
  importFromCSV: async (drugs: DrugData[]): Promise<{ success: boolean; imported: number; errors: string[] }> => {
    const errors: string[] = []
    let imported = 0
    
    for (const drug of drugs) {
      try {
        // Check if batch number already exists
        if (mockDatabase.has(drug.batchNumber)) {
          errors.push(`Batch ${drug.batchNumber} already exists`)
          continue
        }
        
        await dataService.createDrug(drug)
        imported++
      } catch (error) {
        errors.push(`Failed to import ${drug.batchNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return { success: imported > 0, imported, errors }
  },

  // Bulk operations for transfers and sales
  bulkTransfer: async (transfers: TransferData[]): Promise<{ success: boolean; processed: number; errors: string[] }> => {
    const errors: string[] = []
    let processed = 0
    
    for (const transfer of transfers) {
      try {
        await dataService.transferDrug(transfer)
        processed++
      } catch (error) {
        errors.push(`Failed to transfer ${transfer.batchNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return { success: processed > 0, processed, errors }
  },

  bulkSale: async (sales: SaleData[]): Promise<{ success: boolean; processed: number; errors: string[] }> => {
    const errors: string[] = []
    let processed = 0
    
    for (const sale of sales) {
      try {
        await dataService.sellDrug(sale)
        processed++
      } catch (error) {
        errors.push(`Failed to sell ${sale.batchNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return { success: processed > 0, processed, errors }
  },

  // Order Management
  createOrder: async (orderData: Omit<Order, 'id' | 'orderDate' | 'status'>): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const order: Order = {
        ...orderData,
        id: `ORD-${Date.now()}`,
        orderDate: new Date(),
        status: 'pending'
      }
      
      orders.set(order.id, order)
      localStorage.setItem('pharmaTrack_orders', JSON.stringify(Array.from(orders.entries())))
      return true
    } catch (error) {
      console.error('Error creating order:', error)
      return false
    }
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      return Array.from(orders.values())
    } catch (error) {
      console.error('Error getting orders:', error)
      return []
    }
  },

  getOrdersByCustomer: async (customerId: string): Promise<Order[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      return Array.from(orders.values()).filter(order => order.customerId === customerId)
    } catch (error) {
      console.error('Error getting customer orders:', error)
      return []
    }
  },

  getOrdersByPharmacy: async (pharmacyId: string): Promise<Order[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      return Array.from(orders.values()).filter(order => order.pharmacyId === pharmacyId)
    } catch (error) {
      console.error('Error getting pharmacy orders:', error)
      return []
    }
  },

  updateOrderStatus: async (orderId: string, status: Order['status'], notes?: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const order = orders.get(orderId)
      if (!order) return false
      
      order.status = status
      if (notes) order.notes = notes
      
      orders.set(orderId, order)
      localStorage.setItem('pharmaTrack_orders', JSON.stringify(Array.from(orders.entries())))
      return true
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  },

  // Inventory Management
  getInventory: async (location?: string): Promise<Inventory[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      let inventoryList = Array.from(inventory.values())
      
      if (location) {
        inventoryList = inventoryList.filter(item => item.location === location)
      }
      
      return inventoryList
    } catch (error) {
      console.error('Error getting inventory:', error)
      return []
    }
  },

  searchInventory: async (searchTerm: string): Promise<Inventory[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const searchLower = searchTerm.toLowerCase()
      
      return Array.from(inventory.values()).filter(item => 
        item.drugName.toLowerCase().includes(searchLower) ||
        item.drugBatchNumber.toLowerCase().includes(searchLower) ||
        item.locationName.toLowerCase().includes(searchLower)
      )
    } catch (error) {
      console.error('Error searching inventory:', error)
      return []
    }
  },

  updateInventory: async (inventoryId: string, updates: Partial<Inventory>): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const item = inventory.get(inventoryId)
      if (!item) return false
      
      Object.assign(item, updates)
      item.lastUpdated = new Date()
      item.availableQuantity = item.quantity - item.reservedQuantity
      
      inventory.set(inventoryId, item)
      localStorage.setItem('pharmaTrack_inventory', JSON.stringify(Array.from(inventory.entries())))
      return true
    } catch (error) {
      console.error('Error updating inventory:', error)
      return false
    }
  },

  // Delivery Management
  createDelivery: async (deliveryData: Omit<Delivery, 'id' | 'trackingNumber'>): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const delivery: Delivery = {
        ...deliveryData,
        id: `DEL-${Date.now()}`,
        trackingNumber: `TRK-${Date.now()}-${new Date().getFullYear()}`
      }
      
      deliveries.set(delivery.id, delivery)
      localStorage.setItem('pharmaTrack_deliveries', JSON.stringify(Array.from(deliveries.entries())))
      return true
    } catch (error) {
      console.error('Error creating delivery:', error)
      return false
    }
  },

  getDeliveries: async (): Promise<Delivery[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      return Array.from(deliveries.values())
    } catch (error) {
      console.error('Error getting deliveries:', error)
      return []
    }
  },

  updateDeliveryStatus: async (deliveryId: string, status: Delivery['status']): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const delivery = deliveries.get(deliveryId)
      if (!delivery) return false
      
      delivery.status = status
      if (status === 'delivered') {
        delivery.actualDate = new Date()
      }
      
      deliveries.set(deliveryId, delivery)
      localStorage.setItem('pharmaTrack_deliveries', JSON.stringify(Array.from(deliveries.entries())))
      return true
    } catch (error) {
      console.error('Error updating delivery status:', error)
      return false
    }
  },

  // Quality Check Management
  createQualityCheck: async (qcData: Omit<QualityCheck, 'id'>): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const qualityCheck: QualityCheck = {
        ...qcData,
        id: `QC-${Date.now()}`
      }
      
      qualityChecks.set(qualityCheck.id, qualityCheck)
      localStorage.setItem('pharmaTrack_qualityChecks', JSON.stringify(Array.from(qualityChecks.entries())))
      return true
    } catch (error) {
      console.error('Error creating quality check:', error)
      return false
    }
  },

  getQualityChecks: async (): Promise<QualityCheck[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      return Array.from(qualityChecks.values())
    } catch (error) {
      console.error('Error getting quality checks:', error)
      return []
    }
  },

  // Production Request Management
  createProductionRequest: async (prData: Omit<ProductionRequest, 'id' | 'requestedBy' | 'status'>): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const productionRequest: ProductionRequest = {
        ...prData,
        id: `PR-${Date.now()}`,
        requestedBy: new Date(),
        status: 'pending'
      }
      
      productionRequests.set(productionRequest.id, productionRequest)
      localStorage.setItem('pharmaTrack_productionRequests', JSON.stringify(Array.from(productionRequests.entries())))
      return true
    } catch (error) {
      console.error('Error creating production request:', error)
      return false
    }
  },

  getProductionRequests: async (): Promise<ProductionRequest[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      return Array.from(productionRequests.values())
    } catch (error) {
      console.error('Error getting production requests:', error)
      return []
    }
  },

  updateProductionRequestStatus: async (requestId: string, status: ProductionRequest['status'], expectedDate?: Date): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const request = productionRequests.get(requestId)
      if (!request) return false
      
      request.status = status
      if (expectedDate) {
        request.expectedCompletionDate = expectedDate
      }
      
      if (status === 'completed') {
        request.actualCompletionDate = new Date()
      }
      
      productionRequests.set(requestId, request)
      localStorage.setItem('pharmaTrack_productionRequests', JSON.stringify(Array.from(productionRequests.entries())))
      return true
    } catch (error) {
      console.error('Error updating production request status:', error)
      return false
    }
  },

  // Initialize data
  initializeData: () => {
    initializeSampleData()
  }
}

// Enhanced sample data with 30 drugs for comprehensive demo
const initializeSampleData = () => {
  // Check if data already exists in localStorage
  const existingData = localStorage.getItem('chaintrackr_drugs')
  if (existingData) {
    try {
      const drugs = JSON.parse(existingData)
      // Load existing data into memory with date conversion
      drugs.forEach((drug: DrugData) => {
        const convertedDrug = convertDates(drug) as DrugData
        mockDatabase.set(drug.batchNumber, convertedDrug)
      })
      
      // Load existing new data structures
      const existingOrders = localStorage.getItem('pharmaTrack_orders')
      if (existingOrders) {
        const ordersData = JSON.parse(existingOrders)
        ordersData.forEach(([id, order]: [string, Order]) => {
          const convertedOrder = convertDates(order) as Order
          orders.set(id, convertedOrder)
        })
      }
      
      const existingInventory = localStorage.getItem('pharmaTrack_inventory')
      if (existingInventory) {
        const inventoryData = JSON.parse(existingInventory)
        inventoryData.forEach(([id, item]: [string, Inventory]) => {
          const convertedItem = convertDates(item) as Inventory
          inventory.set(id, convertedItem)
        })
      }
      
      const existingDeliveries = localStorage.getItem('pharmaTrack_deliveries')
      if (existingDeliveries) {
        const deliveriesData = JSON.parse(existingDeliveries)
        deliveriesData.forEach(([id, delivery]: [string, Delivery]) => {
          const convertedDelivery = convertDates(delivery) as Delivery
          deliveries.set(id, convertedDelivery)
        })
      }
      
      const existingQualityChecks = localStorage.getItem('pharmaTrack_qualityChecks')
      if (existingQualityChecks) {
        const qcData = JSON.parse(existingQualityChecks)
        qcData.forEach(([id, qc]: [string, QualityCheck]) => {
          const convertedQC = convertDates(qc) as QualityCheck
          qualityChecks.set(id, convertedQC)
        })
      }
      
      const existingProductionRequests = localStorage.getItem('pharmaTrack_productionRequests')
      if (existingProductionRequests) {
        const prData = JSON.parse(existingProductionRequests)
        prData.forEach(([id, pr]: [string, ProductionRequest]) => {
          const convertedPR = convertDates(pr) as ProductionRequest
          productionRequests.set(id, convertedPR)
        })
      }
      
      return
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
    }
  }

  const sampleDrugs = [
    // Batch 1-10: Pain Relief Medications (with expiry dates and prices)
    { batchNumber: 'BATCH-MED001', drugName: 'Paracetamol 500mg', manufacturer: 'Cipla Ltd.', composition: 'Paracetamol, Starch, Magnesium stearate', productionDate: new Date('2024-01-15'), expiryDate: new Date('2026-01-15'), price: 25 },
    { batchNumber: 'BATCH-MED002', drugName: 'Ibuprofen 400mg', manufacturer: 'Sun Pharmaceutical Industries Ltd.', composition: 'Ibuprofen, Lactose monohydrate, Croscarmellose sodium', productionDate: new Date('2024-01-20'), expiryDate: new Date('2026-01-20'), price: 30 },
    { batchNumber: 'BATCH-MED003', drugName: 'Diclofenac 50mg', manufacturer: 'Dr. Reddy\'s Laboratories Ltd.', composition: 'Diclofenac sodium, Lactose, Magnesium stearate', productionDate: new Date('2024-01-25'), expiryDate: new Date('2026-01-25'), price: 35 },
    { batchNumber: 'BATCH-MED004', drugName: 'Naproxen 250mg', manufacturer: 'Lupin Ltd.', composition: 'Naproxen sodium, Povidone, Croscarmellose sodium', productionDate: new Date('2024-01-28'), expiryDate: new Date('2026-01-28'), price: 40 },
    { batchNumber: 'BATCH-MED005', drugName: 'Aspirin 100mg', manufacturer: 'Cipla Ltd.', composition: 'Acetylsalicylic acid, Microcrystalline cellulose', productionDate: new Date('2024-02-01'), expiryDate: new Date('2026-02-01'), price: 15 },
    { batchNumber: 'BATCH-MED006', drugName: 'Celecoxib 200mg', manufacturer: 'Glenmark Pharmaceuticals Ltd.', composition: 'Celecoxib, Lactose monohydrate, Sodium lauryl sulfate', productionDate: new Date('2024-02-03'), expiryDate: new Date('2026-02-03'), price: 120 },
    { batchNumber: 'BATCH-MED007', drugName: 'Tramadol 50mg', manufacturer: 'Sun Pharmaceutical Industries Ltd.', composition: 'Tramadol HCl, Microcrystalline cellulose, Lactose', productionDate: new Date('2024-02-05'), expiryDate: new Date('2026-02-05'), price: 85 },
    { batchNumber: 'BATCH-MED008', drugName: 'Codeine 30mg', manufacturer: 'Dr. Reddy\'s Laboratories Ltd.', composition: 'Codeine phosphate, Lactose, Starch, Magnesium stearate', productionDate: new Date('2024-02-08'), expiryDate: new Date('2026-02-08'), price: 95 },
    { batchNumber: 'BATCH-MED009', drugName: 'Morphine 10mg', manufacturer: 'Lupin Ltd.', composition: 'Morphine sulfate, Lactose monohydrate, Talc', productionDate: new Date('2024-02-10'), expiryDate: new Date('2026-02-10'), price: 150 },
    { batchNumber: 'BATCH-MED010', drugName: 'Fentanyl 25mcg', manufacturer: 'Glenmark Pharmaceuticals Ltd.', composition: 'Fentanyl citrate, Lactose, Microcrystalline cellulose', productionDate: new Date('2024-02-12'), expiryDate: new Date('2026-02-12'), price: 200 },
    
    // Batch 11-20: Antibiotics and Anti-infectives
    { batchNumber: 'BATCH-MED011', drugName: 'Amoxicillin 500mg', manufacturer: 'Cipla Ltd.', composition: 'Amoxicillin trihydrate, Magnesium stearate, Talc', productionDate: new Date('2024-02-15'), expiryDate: new Date('2026-02-15'), price: 45 },
    { batchNumber: 'BATCH-MED012', drugName: 'Azithromycin 250mg', manufacturer: 'Sun Pharmaceutical Industries Ltd.', composition: 'Azithromycin dihydrate, Lactose, Croscarmellose sodium', productionDate: new Date('2024-02-18'), expiryDate: new Date('2026-02-18'), price: 75 },
    { batchNumber: 'BATCH-MED013', drugName: 'Ciprofloxacin 500mg', manufacturer: 'Dr. Reddy\'s Laboratories Ltd.', composition: 'Ciprofloxacin HCl, Microcrystalline cellulose, Povidone', productionDate: new Date('2024-02-20'), expiryDate: new Date('2026-02-20'), price: 60 },
    { batchNumber: 'BATCH-MED014', drugName: 'Doxycycline 100mg', manufacturer: 'Lupin Ltd.', composition: 'Doxycycline hyclate, Lactose monohydrate, Sodium starch glycolate', productionDate: new Date('2024-02-22'), expiryDate: new Date('2026-02-22'), price: 55 },
    { batchNumber: 'BATCH-MED015', drugName: 'Cephalexin 250mg', manufacturer: 'Glenmark Pharmaceuticals Ltd.', composition: 'Cephalexin monohydrate, Magnesium stearate, Silica', productionDate: new Date('2024-02-25'), expiryDate: new Date('2026-02-25'), price: 50 },
    { batchNumber: 'BATCH-MED016', drugName: 'Metronidazole 400mg', manufacturer: 'Cipla Ltd.', composition: 'Metronidazole, Microcrystalline cellulose, Povidone', productionDate: new Date('2024-02-28'), expiryDate: new Date('2026-02-28'), price: 35 },
    { batchNumber: 'BATCH-MED017', drugName: 'Clindamycin 300mg', manufacturer: 'Sun Pharmaceutical Industries Ltd.', composition: 'Clindamycin HCl, Lactose, Corn starch', productionDate: new Date('2024-03-01'), expiryDate: new Date('2026-03-01'), price: 80 },
    { batchNumber: 'BATCH-MED018', drugName: 'Vancomycin 500mg', manufacturer: 'Dr. Reddy\'s Laboratories Ltd.', composition: 'Vancomycin HCl, Mannitol, Phosphoric acid', productionDate: new Date('2024-03-03'), expiryDate: new Date('2026-03-03'), price: 250 },
    { batchNumber: 'BATCH-MED019', drugName: 'Penicillin V 500mg', manufacturer: 'Lupin Ltd.', composition: 'Penicillin V potassium, Lactose, Magnesium stearate', productionDate: new Date('2024-03-05'), expiryDate: new Date('2026-03-05'), price: 40 },
    { batchNumber: 'BATCH-MED020', drugName: 'Erythromycin 250mg', manufacturer: 'Glenmark Pharmaceuticals Ltd.', composition: 'Erythromycin stearate, Cellulose, Povidone', productionDate: new Date('2024-03-08'), expiryDate: new Date('2026-03-08'), price: 65 },
    
    // Batch 21-30: Chronic Disease Management
    { batchNumber: 'BATCH-MED021', drugName: 'Metformin 500mg', manufacturer: 'Cipla Ltd.', composition: 'Metformin HCl, Povidone, Magnesium stearate', productionDate: new Date('2024-03-10'), expiryDate: new Date('2026-03-10'), price: 20 },
    { batchNumber: 'BATCH-MED022', drugName: 'Insulin Glargine 100U/ml', manufacturer: 'Biocon Ltd.', composition: 'Insulin glargine, Zinc chloride, Metacresol', productionDate: new Date('2024-03-12'), expiryDate: new Date('2026-03-12'), price: 450 },
    { batchNumber: 'BATCH-MED023', drugName: 'Lisinopril 10mg', manufacturer: 'Sun Pharmaceutical Industries Ltd.', composition: 'Lisinopril, Mannitol, Starch', productionDate: new Date('2024-03-15'), expiryDate: new Date('2026-03-15'), price: 25 },
    { batchNumber: 'BATCH-MED024', drugName: 'Amlodipine 5mg', manufacturer: 'Dr. Reddy\'s Laboratories Ltd.', composition: 'Amlodipine besylate, Microcrystalline cellulose, Sodium starch glycolate', productionDate: new Date('2024-03-18'), expiryDate: new Date('2026-03-18'), price: 30 },
    { batchNumber: 'BATCH-MED025', drugName: 'Atorvastatin 20mg', manufacturer: 'Lupin Ltd.', composition: 'Atorvastatin calcium, Lactose monohydrate, Croscarmellose sodium', productionDate: new Date('2024-03-20'), expiryDate: new Date('2026-03-20'), price: 35 },
    { batchNumber: 'BATCH-MED026', drugName: 'Levothyroxine 50mcg', manufacturer: 'Glenmark Pharmaceuticals Ltd.', composition: 'Levothyroxine sodium, Lactose monohydrate, Microcrystalline cellulose', productionDate: new Date('2024-03-22'), expiryDate: new Date('2026-03-22'), price: 40 },
    { batchNumber: 'BATCH-MED027', drugName: 'Warfarin 5mg', manufacturer: 'Cipla Ltd.', composition: 'Warfarin sodium, Lactose, Starch, Magnesium stearate', productionDate: new Date('2024-03-25'), expiryDate: new Date('2026-03-25'), price: 15 },
    { batchNumber: 'BATCH-MED028', drugName: 'Sertraline 50mg', manufacturer: 'Sun Pharmaceutical Industries Ltd.', composition: 'Sertraline HCl, Microcrystalline cellulose, Sodium starch glycolate', productionDate: new Date('2024-03-28'), expiryDate: new Date('2026-03-28'), price: 55 },
    { batchNumber: 'BATCH-MED029', drugName: 'Alprazolam 0.5mg', manufacturer: 'Dr. Reddy\'s Laboratories Ltd.', composition: 'Alprazolam, Lactose monohydrate, Microcrystalline cellulose', productionDate: new Date('2024-03-30'), expiryDate: new Date('2026-03-30'), price: 70 },
    { batchNumber: 'BATCH-MED030', drugName: 'Omeprazole 20mg', manufacturer: 'Lupin Ltd.', composition: 'Omeprazole, Lactose, Hydroxypropyl methylcellulose', productionDate: new Date('2024-04-01'), expiryDate: new Date('2026-04-01'), price: 45 }
  ]

  // Create drugs with varied supply chain events
  sampleDrugs.forEach(async (drug, index) => {
    await dataService.createDrug(drug)
    
    // Create different supply chain scenarios with multiple entities
    const scenario = index % 6
    
    switch (scenario) {
      case 0: // Cipla -> MedPlus -> Apollo
        if (index < 10) {
          await dataService.transferDrug({
            batchNumber: drug.batchNumber,
            fromEntity: drug.manufacturer,
            toEntity: 'MedPlus Distribution Ltd.',
            transferDate: new Date(drug.productionDate.getTime() + 5 * 24 * 60 * 60 * 1000),
            location: 'Mumbai Distribution Center'
          })
          
          await dataService.sellDrug({
            batchNumber: drug.batchNumber,
            pharmacy: 'Apollo Pharmacy',
            saleDate: new Date(drug.productionDate.getTime() + 10 * 24 * 60 * 60 * 1000),
            price: Math.round((Math.random() * 200 + 50) * 100) / 100,
            location: 'Mumbai Central Branch'
          })
        }
        break
        
      case 1: // Sun Pharma -> Alliance -> MedPlus Pharmacy
        if (index < 15) {
          await dataService.transferDrug({
            batchNumber: drug.batchNumber,
            fromEntity: drug.manufacturer,
            toEntity: 'Alliance Healthcare India',
            transferDate: new Date(drug.productionDate.getTime() + 3 * 24 * 60 * 60 * 1000),
            location: 'Delhi Regional Warehouse'
          })
          
          await dataService.sellDrug({
            batchNumber: drug.batchNumber,
            pharmacy: 'MedPlus Pharmacy',
            saleDate: new Date(drug.productionDate.getTime() + 8 * 24 * 60 * 60 * 1000),
            price: Math.round((Math.random() * 150 + 75) * 100) / 100,
            location: 'Delhi Central Mall'
          })
        }
        break
        
      case 2: // Dr. Reddy's -> McKesson -> PharmEasy
        if (index < 20) {
          await dataService.transferDrug({
            batchNumber: drug.batchNumber,
            fromEntity: drug.manufacturer,
            toEntity: 'McKesson India',
            transferDate: new Date(drug.productionDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            location: 'Bangalore Central Warehouse'
          })
          
          await dataService.sellDrug({
            batchNumber: drug.batchNumber,
            pharmacy: 'PharmEasy',
            saleDate: new Date(drug.productionDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            price: Math.round((Math.random() * 180 + 60) * 100) / 100,
            location: 'Bangalore Tech Park'
          })
        }
        break
        
      case 3: // Multiple transfers with different distributors
        if (index < 25) {
          await dataService.transferDrug({
            batchNumber: drug.batchNumber,
            fromEntity: drug.manufacturer,
            toEntity: 'MedPlus Distribution Ltd.',
            transferDate: new Date(drug.productionDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            location: 'Chennai Regional Hub'
          })
          
          await dataService.transferDrug({
            batchNumber: drug.batchNumber,
            fromEntity: 'MedPlus Distribution Ltd.',
            toEntity: 'Alliance Healthcare India',
            transferDate: new Date(drug.productionDate.getTime() + 5 * 24 * 60 * 60 * 1000),
            location: 'Chennai Central Hub'
          })
          
          await dataService.sellDrug({
            batchNumber: drug.batchNumber,
            pharmacy: 'Apollo Pharmacy',
            saleDate: new Date(drug.productionDate.getTime() + 9 * 24 * 60 * 60 * 1000),
            price: Math.round((Math.random() * 160 + 80) * 100) / 100,
            location: 'Chennai Central Branch'
          })
        }
        break
        
      case 4: // Distributed but not sold
        if (index < 28) {
          await dataService.transferDrug({
            batchNumber: drug.batchNumber,
            fromEntity: drug.manufacturer,
            toEntity: 'McKesson India',
            transferDate: new Date(drug.productionDate.getTime() + 3 * 24 * 60 * 60 * 1000),
            location: 'Hyderabad Regional Warehouse'
          })
        }
        break
        
      case 5: // Recently manufactured (no transfers yet)
      default:
        // Keep as manufactured only
        break
    }
  })
  
  // Initialize sample data for new features
  const sampleOrders: Order[] = [
    {
      id: 'ORD-001',
      customerId: 'cust-001',
      customerName: 'Customer User',
      customerEmail: 'customer@pharmatrackindia.com',
      pharmacyId: 'pharm-001',
      pharmacyName: 'Apollo Pharmacy',
      drugBatchNumber: 'BATCH-MED001',
      drugName: 'Paracetamol 500mg',
      quantity: 2,
      totalPrice: 50,
      status: 'confirmed',
      orderDate: new Date('2024-01-15'),
      expectedDeliveryDate: new Date('2024-01-20'),
      trackingNumber: 'TRK-001-2024'
    },
    {
      id: 'ORD-002',
      customerId: 'cust-001',
      customerName: 'Customer User',
      customerEmail: 'customer@pharmatrackindia.com',
      pharmacyId: 'pharm-002',
      pharmacyName: 'MedPlus Pharmacy',
      drugBatchNumber: 'BATCH-MED002',
      drugName: 'Ibuprofen 400mg',
      quantity: 1,
      totalPrice: 30,
      status: 'processing',
      orderDate: new Date('2024-01-16'),
      expectedDeliveryDate: new Date('2024-01-22'),
      trackingNumber: 'TRK-002-2024'
    },
    {
      id: 'ORD-003',
      customerId: 'cust-001',
      customerName: 'Customer User',
      customerEmail: 'customer@pharmatrackindia.com',
      pharmacyId: 'pharm-003',
      pharmacyName: 'PharmEasy',
      drugBatchNumber: 'BATCH-MED003',
      drugName: 'Diclofenac 50mg',
      quantity: 3,
      totalPrice: 105,
      status: 'pending',
      orderDate: new Date('2024-01-17'),
      expectedDeliveryDate: new Date('2024-01-25'),
      trackingNumber: 'TRK-003-2024'
    }
  ]

  const sampleInventory: Inventory[] = [
    {
      id: 'INV-001',
      drugBatchNumber: 'BATCH-MED001',
      drugName: 'Paracetamol 500mg',
      location: 'pharmacy',
      locationId: 'pharm-001',
      locationName: 'Apollo Pharmacy',
      quantity: 100,
      reservedQuantity: 5,
      availableQuantity: 95,
      unitPrice: 25,
      lastUpdated: new Date('2024-01-15'),
      expiryDate: new Date('2026-01-15'),
      isExpired: false
    },
    {
      id: 'INV-002',
      drugBatchNumber: 'BATCH-MED002',
      drugName: 'Ibuprofen 400mg',
      location: 'distributor',
      locationId: 'dist-001',
      locationName: 'MedPlus Distribution Ltd.',
      quantity: 500,
      reservedQuantity: 10,
      availableQuantity: 490,
      unitPrice: 30,
      lastUpdated: new Date('2024-01-16'),
      expiryDate: new Date('2026-01-20'),
      isExpired: false
    },
    {
      id: 'INV-003',
      drugBatchNumber: 'BATCH-MED003',
      drugName: 'Diclofenac 50mg',
      location: 'distributor',
      locationId: 'dist-002',
      locationName: 'Alliance Healthcare India',
      quantity: 300,
      reservedQuantity: 8,
      availableQuantity: 292,
      unitPrice: 35,
      lastUpdated: new Date('2024-01-17'),
      expiryDate: new Date('2026-01-25'),
      isExpired: false
    },
    {
      id: 'INV-004',
      drugBatchNumber: 'BATCH-MED004',
      drugName: 'Naproxen 250mg',
      location: 'pharmacy',
      locationId: 'pharm-002',
      locationName: 'MedPlus Pharmacy',
      quantity: 75,
      reservedQuantity: 3,
      availableQuantity: 72,
      unitPrice: 40,
      lastUpdated: new Date('2024-01-18'),
      expiryDate: new Date('2026-01-28'),
      isExpired: false
    },
    {
      id: 'INV-005',
      drugBatchNumber: 'BATCH-MED005',
      drugName: 'Aspirin 100mg',
      location: 'pharmacy',
      locationId: 'pharm-003',
      locationName: 'PharmEasy',
      quantity: 200,
      reservedQuantity: 12,
      availableQuantity: 188,
      unitPrice: 15,
      lastUpdated: new Date('2024-01-19'),
      expiryDate: new Date('2026-02-01'),
      isExpired: false
    }
  ]

  const sampleDeliveries: Delivery[] = [
    {
      id: 'DEL-001',
      orderId: 'ORD-001',
      fromLocation: 'pharm-001',
      toLocation: 'cust-001',
      fromLocationName: 'Apollo Pharmacy',
      toLocationName: 'Customer User',
      drugBatchNumber: 'BATCH-MED001',
      drugName: 'Paracetamol 500mg',
      quantity: 2,
      status: 'scheduled',
      scheduledDate: new Date('2024-01-20'),
      trackingNumber: 'TRK-001-2024',
      notes: 'Scheduled for delivery'
    }
  ]

  const sampleQualityChecks: QualityCheck[] = [
    {
      id: 'QC-001',
      drugBatchNumber: 'BATCH-MED001',
      manufacturerId: 'mfg-001',
      manufacturerName: 'Cipla Ltd.',
      checkDate: new Date('2024-01-10'),
      qualityScore: 95,
      isPassed: true,
      notes: 'All quality parameters met',
      inspectorName: 'Dr. Rajesh Kumar'
    },
    {
      id: 'QC-002',
      drugBatchNumber: 'BATCH-MED011',
      manufacturerId: 'mfg-002',
      manufacturerName: 'Sun Pharmaceutical Industries Ltd.',
      checkDate: new Date('2024-01-12'),
      qualityScore: 92,
      isPassed: true,
      notes: 'Quality standards maintained',
      inspectorName: 'Dr. Priya Sharma'
    },
    {
      id: 'QC-003',
      drugBatchNumber: 'BATCH-MED021',
      manufacturerId: 'mfg-003',
      manufacturerName: 'Dr. Reddy\'s Laboratories Ltd.',
      checkDate: new Date('2024-01-14'),
      qualityScore: 98,
      isPassed: true,
      notes: 'Excellent quality parameters',
      inspectorName: 'Dr. Amit Patel'
    }
  ]

  const sampleProductionRequests: ProductionRequest[] = [
    {
      id: 'PR-001',
      distributorId: 'dist-001',
      distributorName: 'MedPlus Distribution Ltd.',
      drugName: 'Amoxicillin 500mg',
      requestedQuantity: 1000,
      requestedBy: new Date('2024-01-15'),
      status: 'approved',
      expectedCompletionDate: new Date('2024-02-15'),
      notes: 'High demand in market'
    },
    {
      id: 'PR-002',
      distributorId: 'dist-002',
      distributorName: 'Alliance Healthcare India',
      drugName: 'Azithromycin 250mg',
      requestedQuantity: 800,
      requestedBy: new Date('2024-01-16'),
      status: 'pending',
      expectedCompletionDate: new Date('2024-02-20'),
      notes: 'Seasonal demand increase'
    },
    {
      id: 'PR-003',
      distributorId: 'dist-003',
      distributorName: 'McKesson India',
      drugName: 'Ciprofloxacin 500mg',
      requestedQuantity: 1200,
      requestedBy: new Date('2024-01-17'),
      status: 'in_production',
      expectedCompletionDate: new Date('2024-02-10'),
      notes: 'Emergency stock requirement'
    }
  ]

  // Load sample data into maps
  sampleOrders.forEach(order => orders.set(order.id, order))
  sampleInventory.forEach(item => inventory.set(item.id, item))
  sampleDeliveries.forEach(delivery => deliveries.set(delivery.id, delivery))
  sampleQualityChecks.forEach(qc => qualityChecks.set(qc.id, qc))
  sampleProductionRequests.forEach(pr => productionRequests.set(pr.id, pr))

  // Save to localStorage after initialization
  setTimeout(() => {
    saveToLocalStorage()
    // Update expiry status after data is loaded
    dataService.updateExpiryStatus()
  }, 2000)
}

// Save current state to localStorage
const saveToLocalStorage = () => {
  try {
    const drugsArray = Array.from(mockDatabase.values())
    localStorage.setItem('chaintrackr_drugs', JSON.stringify(drugsArray))
    
    // Save new data structures
    localStorage.setItem('pharmaTrack_orders', JSON.stringify(Array.from(orders.entries())))
    localStorage.setItem('pharmaTrack_inventory', JSON.stringify(Array.from(inventory.entries())))
    localStorage.setItem('pharmaTrack_deliveries', JSON.stringify(Array.from(deliveries.entries())))
    localStorage.setItem('pharmaTrack_qualityChecks', JSON.stringify(Array.from(qualityChecks.entries())))
    localStorage.setItem('pharmaTrack_productionRequests', JSON.stringify(Array.from(productionRequests.entries())))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Initialize sample data when module loads
initializeSampleData()

// Add localStorage integration to existing dataService functions
const originalCreateDrug = dataService.createDrug
const originalTransferDrug = dataService.transferDrug
const originalSellDrug = dataService.sellDrug

dataService.createDrug = async (drugData) => {
  const result = await originalCreateDrug(drugData)
  if (result) saveToLocalStorage()
  return result
}

dataService.transferDrug = async (transferData) => {
  const result = await originalTransferDrug(transferData)
  if (result) saveToLocalStorage()
  return result
}

dataService.sellDrug = async (saleData) => {
  const result = await originalSellDrug(saleData)
  if (result) saveToLocalStorage()
  return result
}

export default dataService 