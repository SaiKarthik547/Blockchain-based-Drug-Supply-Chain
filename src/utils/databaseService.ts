// Database Service Layer for PharmaTrack India
// This service provides the same interface as dataService.ts but uses MySQL database

import { executeQuery, queries, databaseUtils } from './database'

// Types
export interface DrugData {
  id: string
  name: string
  generic_name?: string
  manufacturer_id: string
  manufacturer_name?: string
  batch_number: string
  composition: string
  strength: string
  dosage_form: string
  pack_size: string
  mrp: number
  price: number
  discounted_price?: number
  production_date: Date
  expiry_date: Date
  is_expired: boolean
  is_blacklisted: boolean
  qr_code_generated: boolean
  qr_code_data?: string
  security_hash?: string
  status: 'active' | 'expired' | 'blacklisted' | 'recalled'
  created_at: Date
  updated_at: Date
}

export interface UserData {
  id: string
  username: string
  email: string
  password_hash: string
  role: 'admin' | 'manufacturer' | 'distributor' | 'pharmacy' | 'customer'
  name: string
  organization: string
  is_active: boolean
  created_at: Date
  last_login?: Date
}

export interface InventoryData {
  id: string
  organization_id: string
  drug_id: string
  drug_name?: string
  batch_number?: string
  expiry_date?: Date
  organization_name?: string
  quantity: number
  reserved_quantity: number
  available_quantity: number
  last_updated: Date
}

export interface OrderData {
  id: string
  order_number: string
  customer_id: string
  customer_name?: string
  pharmacy_id: string
  pharmacy_name?: string
  drug_id: string
  drug_name?: string
  quantity: number
  unit_price: number
  total_amount: number
  order_date: Date
  expected_delivery_date?: Date
  actual_delivery_date?: Date
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  notes?: string
}

export interface SalesData {
  id: string
  pharmacy_id: string
  pharmacy_name?: string
  drug_id: string
  drug_name?: string
  customer_id?: string
  customer_name?: string
  quantity: number
  unit_price: number
  total_amount: number
  discount_amount: number
  final_amount: number
  sale_date: Date
  payment_method: 'cash' | 'card' | 'upi' | 'net_banking'
  prescription_required: boolean
  prescription_number?: string
  notes?: string
}

export interface DrugEventData {
  id: string
  drug_id: string
  event_type: 'manufactured' | 'transferred' | 'received' | 'sold' | 'expired' | 'blacklisted' | 'recalled'
  from_organization_id?: string
  from_organization_name?: string
  to_organization_id?: string
  to_organization_name?: string
  quantity: number
  location: string
  timestamp: Date
  notes?: string
  created_by: string
  created_by_name?: string
}

export interface QualityCheckData {
  id: string
  drug_id: string
  drug_name?: string
  organization_id: string
  organization_name?: string
  check_type: 'manufacturing' | 'receiving' | 'storage' | 'expiry'
  check_date: Date
  inspector_name?: string
  temperature?: number
  humidity?: number
  visual_inspection?: boolean
  packaging_integrity?: boolean
  label_accuracy?: boolean
  overall_result: 'pass' | 'fail' | 'conditional'
  notes?: string
  created_at: Date
}

export interface ProductionRequestData {
  id: string
  requesting_organization_id: string
  requesting_organization_name?: string
  manufacturer_id: string
  manufacturer_name?: string
  drug_name: string
  quantity: number
  requested_delivery_date?: Date
  status: 'pending' | 'approved' | 'in_production' | 'completed' | 'cancelled'
  approved_quantity?: number
  approved_delivery_date?: Date
  notes?: string
  created_at: Date
  updated_at: Date
}

// Database Service Class
class DatabaseService {
  // Drug Management
  async getAllDrugs(): Promise<DrugData[]> {
    try {
      const results = await executeQuery(queries.drug.getAllDrugs)
      return results.map((row: any) => ({
        ...row,
        production_date: new Date(row.production_date),
        expiry_date: new Date(row.expiry_date),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching drugs:', error)
      return []
    }
  }

  async getDrugById(id: string): Promise<DrugData | null> {
    try {
      const results = await executeQuery(queries.drug.getDrugById, [id])
      if (results.length === 0) return null
      
      const row = results[0]
      return {
        ...row,
        production_date: new Date(row.production_date),
        expiry_date: new Date(row.expiry_date),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
      }
    } catch (error) {
      console.error('Error fetching drug:', error)
      return null
    }
  }

  async getDrugByBatchNumber(batchNumber: string): Promise<DrugData | null> {
    try {
      const results = await executeQuery(queries.drug.getDrugByBatchNumber, [batchNumber])
      if (results.length === 0) return null
      
      const row = results[0]
      return {
        ...row,
        production_date: new Date(row.production_date),
        expiry_date: new Date(row.expiry_date),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
      }
    } catch (error) {
      console.error('Error fetching drug by batch number:', error)
      return null
    }
  }

  async getDrugByQRCode(qrCodeData: string): Promise<DrugData | null> {
    try {
      const results = await executeQuery(queries.drug.getDrugByQRCode, [qrCodeData])
      if (results.length === 0) return null
      
      const row = results[0]
      return {
        ...row,
        production_date: new Date(row.production_date),
        expiry_date: new Date(row.expiry_date),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
      }
    } catch (error) {
      console.error('Error fetching drug by QR code:', error)
      return null
    }
  }

  async createDrug(drugData: Omit<DrugData, 'id' | 'created_at' | 'updated_at'>): Promise<DrugData | null> {
    try {
      const id = databaseUtils.generateId('drug')
      const params = [
        id,
        drugData.name,
        drugData.generic_name,
        drugData.manufacturer_id,
        drugData.batch_number,
        drugData.composition,
        drugData.strength,
        drugData.dosage_form,
        drugData.pack_size,
        drugData.mrp,
        drugData.price,
        drugData.discounted_price,
        databaseUtils.formatDate(drugData.production_date),
        databaseUtils.formatDate(drugData.expiry_date),
        drugData.qr_code_generated,
        drugData.qr_code_data,
        drugData.security_hash
      ]
      
      await executeQuery(queries.drug.createDrug, params)
      return this.getDrugById(id)
    } catch (error) {
      console.error('Error creating drug:', error)
      return null
    }
  }

  async updateDrug(id: string, drugData: Partial<DrugData>): Promise<DrugData | null> {
    try {
      const params = [
        drugData.name,
        drugData.generic_name,
        drugData.composition,
        drugData.strength,
        drugData.dosage_form,
        drugData.pack_size,
        drugData.mrp,
        drugData.price,
        drugData.discounted_price,
        drugData.production_date ? databaseUtils.formatDate(drugData.production_date) : null,
        drugData.expiry_date ? databaseUtils.formatDate(drugData.expiry_date) : null,
        drugData.is_expired,
        drugData.is_blacklisted,
        drugData.qr_code_generated,
        drugData.qr_code_data,
        drugData.security_hash,
        drugData.status,
        id
      ]
      
      await executeQuery(queries.drug.updateDrug, params)
      return this.getDrugById(id)
    } catch (error) {
      console.error('Error updating drug:', error)
      return null
    }
  }

  async getExpiredDrugs(): Promise<DrugData[]> {
    try {
      const results = await executeQuery(queries.drug.getExpiredDrugs)
      return results.map((row: any) => ({
        ...row,
        production_date: new Date(row.production_date),
        expiry_date: new Date(row.expiry_date),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching expired drugs:', error)
      return []
    }
  }

  async getDrugsExpiringSoon(): Promise<DrugData[]> {
    try {
      const results = await executeQuery(queries.drug.getDrugsExpiringSoon)
      return results.map((row: any) => ({
        ...row,
        production_date: new Date(row.production_date),
        expiry_date: new Date(row.expiry_date),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching drugs expiring soon:', error)
      return []
    }
  }

  // User Management
  async getAllUsers(): Promise<UserData[]> {
    try {
      const results = await executeQuery(queries.user.getAllUsers)
      return results.map((row: any) => ({
        ...row,
        created_at: new Date(row.created_at),
        last_login: row.last_login ? new Date(row.last_login) : undefined
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  async getUserByUsername(username: string): Promise<UserData | null> {
    try {
      const results = await executeQuery(queries.user.getUserByUsername, [username])
      if (results.length === 0) return null
      
      const row = results[0]
      return {
        ...row,
        created_at: new Date(row.created_at),
        last_login: row.last_login ? new Date(row.last_login) : undefined
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    try {
      await executeQuery(queries.user.updateLastLogin, [userId])
    } catch (error) {
      console.error('Error updating user last login:', error)
    }
  }

  // Inventory Management
  async getInventoryByOrganization(organizationId: string): Promise<InventoryData[]> {
    try {
      const results = await executeQuery(queries.inventory.getInventoryByOrganization, [organizationId])
      return results.map((row: any) => ({
        ...row,
        expiry_date: row.expiry_date ? new Date(row.expiry_date) : undefined,
        last_updated: new Date(row.last_updated)
      }))
    } catch (error) {
      console.error('Error fetching inventory:', error)
      return []
    }
  }

  async upsertInventory(inventoryData: Omit<InventoryData, 'last_updated'>): Promise<InventoryData | null> {
    try {
      const id = databaseUtils.generateId('inv')
      const params = [
        id,
        inventoryData.organization_id,
        inventoryData.drug_id,
        inventoryData.quantity,
        inventoryData.reserved_quantity
      ]
      
      await executeQuery(queries.inventory.upsertInventory, params)
      return this.getInventoryItem(inventoryData.organization_id, inventoryData.drug_id)
    } catch (error) {
      console.error('Error upserting inventory:', error)
      return null
    }
  }

  async getInventoryItem(organizationId: string, drugId: string): Promise<InventoryData | null> {
    try {
      const results = await executeQuery(queries.inventory.getInventoryItem, [organizationId, drugId])
      if (results.length === 0) return null
      
      const row = results[0]
      return {
        ...row,
        expiry_date: row.expiry_date ? new Date(row.expiry_date) : undefined,
        last_updated: new Date(row.last_updated)
      }
    } catch (error) {
      console.error('Error fetching inventory item:', error)
      return null
    }
  }

  // Order Management
  async getAllOrders(): Promise<OrderData[]> {
    try {
      const results = await executeQuery(queries.order.getAllOrders)
      return results.map((row: any) => ({
        ...row,
        order_date: new Date(row.order_date),
        expected_delivery_date: row.expected_delivery_date ? new Date(row.expected_delivery_date) : undefined,
        actual_delivery_date: row.actual_delivery_date ? new Date(row.actual_delivery_date) : undefined
      }))
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  async getOrdersByCustomer(customerId: string): Promise<OrderData[]> {
    try {
      const results = await executeQuery(queries.order.getOrdersByCustomer, [customerId])
      return results.map((row: any) => ({
        ...row,
        order_date: new Date(row.order_date),
        expected_delivery_date: row.expected_delivery_date ? new Date(row.expected_delivery_date) : undefined,
        actual_delivery_date: row.actual_delivery_date ? new Date(row.actual_delivery_date) : undefined
      }))
    } catch (error) {
      console.error('Error fetching customer orders:', error)
      return []
    }
  }

  async createOrder(orderData: Omit<OrderData, 'id' | 'order_date'>): Promise<OrderData | null> {
    try {
      const id = databaseUtils.generateId('order')
      const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      
      const params = [
        id,
        orderNumber,
        orderData.customer_id,
        orderData.pharmacy_id,
        orderData.drug_id,
        orderData.quantity,
        orderData.unit_price,
        orderData.total_amount,
        orderData.expected_delivery_date ? databaseUtils.formatDate(orderData.expected_delivery_date) : null,
        orderData.status,
        orderData.payment_status
      ]
      
      await executeQuery(queries.order.createOrder, params)
      return this.getOrderById(id)
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  }

  async getOrderById(id: string): Promise<OrderData | null> {
    try {
      const results = await executeQuery(queries.order.getOrderById, [id])
      if (results.length === 0) return null
      
      const row = results[0]
      return {
        ...row,
        order_date: new Date(row.order_date),
        expected_delivery_date: row.expected_delivery_date ? new Date(row.expected_delivery_date) : undefined,
        actual_delivery_date: row.actual_delivery_date ? new Date(row.actual_delivery_date) : undefined
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  }

  // Sales Management
  async getAllSales(): Promise<SalesData[]> {
    try {
      const results = await executeQuery(queries.sales.getAllSales)
      return results.map((row: any) => ({
        ...row,
        sale_date: new Date(row.sale_date)
      }))
    } catch (error) {
      console.error('Error fetching sales:', error)
      return []
    }
  }

  async createSale(saleData: Omit<SalesData, 'id' | 'sale_date'>): Promise<SalesData | null> {
    try {
      const id = databaseUtils.generateId('sale')
      const params = [
        id,
        saleData.pharmacy_id,
        saleData.drug_id,
        saleData.customer_id,
        saleData.quantity,
        saleData.unit_price,
        saleData.total_amount,
        saleData.discount_amount,
        saleData.final_amount,
        saleData.payment_method,
        saleData.prescription_required,
        saleData.prescription_number
      ]
      
      await executeQuery(queries.sales.createSale, params)
      return this.getSaleById(id)
    } catch (error) {
      console.error('Error creating sale:', error)
      return null
    }
  }

  async getSaleById(id: string): Promise<SalesData | null> {
    try {
      const results = await executeQuery(queries.sales.getAllSales)
      const sale = results.find((row: any) => row.id === id)
      if (!sale) return null
      
      return {
        ...sale,
        sale_date: new Date(sale.sale_date)
      }
    } catch (error) {
      console.error('Error fetching sale:', error)
      return null
    }
  }

  // Drug Events
  async getDrugEvents(drugId: string): Promise<DrugEventData[]> {
    try {
      const results = await executeQuery(queries.drugEvent.getDrugEvents, [drugId])
      return results.map((row: any) => ({
        ...row,
        timestamp: new Date(row.timestamp)
      }))
    } catch (error) {
      console.error('Error fetching drug events:', error)
      return []
    }
  }

  async createDrugEvent(eventData: Omit<DrugEventData, 'id' | 'timestamp'>): Promise<DrugEventData | null> {
    try {
      const id = databaseUtils.generateId('event')
      const params = [
        id,
        eventData.drug_id,
        eventData.event_type,
        eventData.from_organization_id,
        eventData.to_organization_id,
        eventData.quantity,
        eventData.location,
        eventData.notes,
        eventData.created_by
      ]
      
      await executeQuery(queries.drugEvent.createDrugEvent, params)
      return this.getDrugEventById(id)
    } catch (error) {
      console.error('Error creating drug event:', error)
      return null
    }
  }

  async getDrugEventById(id: string): Promise<DrugEventData | null> {
    try {
      const results = await executeQuery(queries.drugEvent.getDrugEvents, ['dummy'])
      const event = results.find((row: any) => row.id === id)
      if (!event) return null
      
      return {
        ...event,
        timestamp: new Date(event.timestamp)
      }
    } catch (error) {
      console.error('Error fetching drug event:', error)
      return null
    }
  }

  // Utility functions (compatible with existing dataService interface)
  generateSecurityHash(data: string): string {
    return btoa(data + 'pharmatrack_salt_' + Date.now())
  }

  generateQRCode(drugData: DrugData): string {
    const qrData = {
      drugId: drugData.id,
      batchNumber: drugData.batch_number,
      manufacturer: drugData.manufacturer_name,
      productionDate: drugData.production_date.toISOString(),
      expiryDate: drugData.expiry_date.toISOString(),
      securityHash: this.generateSecurityHash(drugData.batch_number)
    }
    return JSON.stringify(qrData)
  }

  calculateDiscountedPrice(price: number, expiryDate: Date): number {
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry <= 0) return price * 0.5 // 50% discount for expired
    if (daysUntilExpiry <= 7) return price * 0.7 // 30% discount for expiring within 7 days
    if (daysUntilExpiry <= 30) return price * 0.8 // 20% discount for expiring within 30 days
    
    return price
  }

  updateExpiryStatus(): Promise<void> {
    return executeQuery(queries.drug.updateExpiryStatus)
      .then(() => console.log('✅ Drug expiry status updated'))
      .catch(error => console.error('❌ Error updating expiry status:', error))
  }
}

// Create and export singleton instance
const databaseService = new DatabaseService()
export default databaseService 