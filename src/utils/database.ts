// MySQL Database Service for PharmaTrack India
import mysql from 'mysql2/promise'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pharmatrack_india',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:30' // IST timezone
}

// Create connection pool
let pool: mysql.Pool | null = null

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    if (!pool) {
      pool = mysql.createPool(dbConfig)
      console.log('✅ Database connection pool created')
    }
    
    // Test connection
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Get database connection
export const getConnection = async () => {
  if (!pool) {
    await initializeDatabase()
  }
  return pool!.getConnection()
}

// Execute query with parameters
export const executeQuery = async (query: string, params: any[] = []) => {
  try {
    const connection = await getConnection()
    const [results] = await connection.execute(query, params)
    connection.release()
    return results
  } catch (error) {
    console.error('❌ Query execution failed:', error)
    throw error
  }
}

// Execute transaction
export const executeTransaction = async (queries: { query: string; params: any[] }[]) => {
  const connection = await getConnection()
  try {
    await connection.beginTransaction()
    
    for (const { query, params } of queries) {
      await connection.execute(query, params)
    }
    
    await connection.commit()
    connection.release()
    return true
  } catch (error) {
    await connection.rollback()
    connection.release()
    console.error('❌ Transaction failed:', error)
    throw error
  }
}

// User Management Queries
export const userQueries = {
  // Get all users
  getAllUsers: `SELECT * FROM users WHERE is_active = TRUE ORDER BY created_at DESC`,
  
  // Get user by username
  getUserByUsername: `SELECT * FROM users WHERE username = ? AND is_active = TRUE`,
  
  // Get user by ID
  getUserById: `SELECT * FROM users WHERE id = ? AND is_active = TRUE`,
  
  // Create new user
  createUser: `INSERT INTO users (id, username, email, password_hash, role, name, organization, is_active) 
               VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
  
  // Update user last login
  updateLastLogin: `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`,
  
  // Update user
  updateUser: `UPDATE users SET username = ?, email = ?, role = ?, name = ?, organization = ?, is_active = ? WHERE id = ?`,
  
  // Delete user (soft delete)
  deleteUser: `UPDATE users SET is_active = FALSE WHERE id = ?`,
  
  // Get users by role
  getUsersByRole: `SELECT * FROM users WHERE role = ? AND is_active = TRUE ORDER BY created_at DESC`
}

// Drug Management Queries
export const drugQueries = {
  // Get all drugs
  getAllDrugs: `SELECT d.*, o.name as manufacturer_name 
                FROM drugs d 
                JOIN organizations o ON d.manufacturer_id = o.id 
                ORDER BY d.created_at DESC`,
  
  // Get drug by ID
  getDrugById: `SELECT d.*, o.name as manufacturer_name 
                FROM drugs d 
                JOIN organizations o ON d.manufacturer_id = o.id 
                WHERE d.id = ?`,
  
  // Get drug by batch number
  getDrugByBatchNumber: `SELECT d.*, o.name as manufacturer_name 
                         FROM drugs d 
                         JOIN organizations o ON d.manufacturer_id = o.id 
                         WHERE d.batch_number = ?`,
  
  // Get drug by QR code data
  getDrugByQRCode: `SELECT d.*, o.name as manufacturer_name 
                    FROM drugs d 
                    JOIN organizations o ON d.manufacturer_id = o.id 
                    WHERE d.qr_code_data = ?`,
  
  // Create new drug
  createDrug: `INSERT INTO drugs (id, name, generic_name, manufacturer_id, batch_number, composition, 
                strength, dosage_form, pack_size, mrp, price, discounted_price, production_date, 
                expiry_date, qr_code_generated, qr_code_data, security_hash) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  
  // Update drug
  updateDrug: `UPDATE drugs SET name = ?, generic_name = ?, composition = ?, strength = ?, 
               dosage_form = ?, pack_size = ?, mrp = ?, price = ?, discounted_price = ?, 
               production_date = ?, expiry_date = ?, is_expired = ?, is_blacklisted = ?, 
               qr_code_generated = ?, qr_code_data = ?, security_hash = ?, status = ? WHERE id = ?`,
  
  // Get drugs by manufacturer
  getDrugsByManufacturer: `SELECT d.*, o.name as manufacturer_name 
                           FROM drugs d 
                           JOIN organizations o ON d.manufacturer_id = o.id 
                           WHERE d.manufacturer_id = ? ORDER BY d.created_at DESC`,
  
  // Get expired drugs
  getExpiredDrugs: `SELECT d.*, o.name as manufacturer_name 
                    FROM drugs d 
                    JOIN organizations o ON d.manufacturer_id = o.id 
                    WHERE d.expiry_date < CURDATE() ORDER BY d.expiry_date ASC`,
  
  // Get drugs expiring soon (within 30 days)
  getDrugsExpiringSoon: `SELECT d.*, o.name as manufacturer_name 
                         FROM drugs d 
                         JOIN organizations o ON d.manufacturer_id = o.id 
                         WHERE d.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
                         ORDER BY d.expiry_date ASC`,
  
  // Update drug expiry status
  updateExpiryStatus: `UPDATE drugs SET is_expired = TRUE, status = 'expired' 
                       WHERE expiry_date < CURDATE() AND is_expired = FALSE`
}

// Inventory Management Queries
export const inventoryQueries = {
  // Get inventory by organization
  getInventoryByOrganization: `SELECT i.*, d.name as drug_name, d.batch_number, d.expiry_date, 
                              o.name as organization_name 
                              FROM inventory i 
                              JOIN drugs d ON i.drug_id = d.id 
                              JOIN organizations o ON i.organization_id = o.id 
                              WHERE i.organization_id = ? ORDER BY i.last_updated DESC`,
  
  // Get inventory item
  getInventoryItem: `SELECT i.*, d.name as drug_name, d.batch_number, d.expiry_date, 
                    o.name as organization_name 
                    FROM inventory i 
                    JOIN drugs d ON i.drug_id = d.id 
                    JOIN organizations o ON i.organization_id = o.id 
                    WHERE i.organization_id = ? AND i.drug_id = ?`,
  
  // Create or update inventory
  upsertInventory: `INSERT INTO inventory (id, organization_id, drug_id, quantity, reserved_quantity) 
                    VALUES (?, ?, ?, ?, ?) 
                    ON DUPLICATE KEY UPDATE 
                    quantity = VALUES(quantity), 
                    reserved_quantity = VALUES(reserved_quantity), 
                    last_updated = CURRENT_TIMESTAMP`,
  
  // Update inventory quantity
  updateInventoryQuantity: `UPDATE inventory SET quantity = ?, last_updated = CURRENT_TIMESTAMP 
                           WHERE organization_id = ? AND drug_id = ?`,
  
  // Reserve inventory
  reserveInventory: `UPDATE inventory SET reserved_quantity = reserved_quantity + ? 
                    WHERE organization_id = ? AND drug_id = ? AND available_quantity >= ?`,
  
  // Release reserved inventory
  releaseInventory: `UPDATE inventory SET reserved_quantity = GREATEST(0, reserved_quantity - ?) 
                    WHERE organization_id = ? AND drug_id = ?`
}

// Order Management Queries
export const orderQueries = {
  // Get all orders
  getAllOrders: `SELECT o.*, u.name as customer_name, d.name as drug_name, 
                org.name as pharmacy_name 
                FROM orders o 
                JOIN users u ON o.customer_id = u.id 
                JOIN drugs d ON o.drug_id = d.id 
                JOIN organizations org ON o.pharmacy_id = org.id 
                ORDER BY o.order_date DESC`,
  
  // Get orders by customer
  getOrdersByCustomer: `SELECT o.*, d.name as drug_name, org.name as pharmacy_name 
                        FROM orders o 
                        JOIN drugs d ON o.drug_id = d.id 
                        JOIN organizations org ON o.pharmacy_id = org.id 
                        WHERE o.customer_id = ? ORDER BY o.order_date DESC`,
  
  // Get orders by pharmacy
  getOrdersByPharmacy: `SELECT o.*, u.name as customer_name, d.name as drug_name 
                        FROM orders o 
                        JOIN users u ON o.customer_id = u.id 
                        JOIN drugs d ON o.drug_id = d.id 
                        WHERE o.pharmacy_id = ? ORDER BY o.order_date DESC`,
  
  // Create new order
  createOrder: `INSERT INTO orders (id, order_number, customer_id, pharmacy_id, drug_id, 
                quantity, unit_price, total_amount, expected_delivery_date, status, payment_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  
  // Update order status
  updateOrderStatus: `UPDATE orders SET status = ?, payment_status = ?, 
                     actual_delivery_date = ? WHERE id = ?`,
  
  // Get order by ID
  getOrderById: `SELECT o.*, u.name as customer_name, d.name as drug_name, 
                org.name as pharmacy_name 
                FROM orders o 
                JOIN users u ON o.customer_id = u.id 
                JOIN drugs d ON o.drug_id = d.id 
                JOIN organizations org ON o.pharmacy_id = org.id 
                WHERE o.id = ?`
}

// Sales Management Queries
export const salesQueries = {
  // Get all sales
  getAllSales: `SELECT s.*, u.name as customer_name, d.name as drug_name, 
                org.name as pharmacy_name 
                FROM sales s 
                LEFT JOIN users u ON s.customer_id = u.id 
                JOIN drugs d ON s.drug_id = d.id 
                JOIN organizations org ON s.pharmacy_id = org.id 
                ORDER BY s.sale_date DESC`,
  
  // Get sales by pharmacy
  getSalesByPharmacy: `SELECT s.*, u.name as customer_name, d.name as drug_name 
                       FROM sales s 
                       LEFT JOIN users u ON s.customer_id = u.id 
                       JOIN drugs d ON s.drug_id = d.id 
                       WHERE s.pharmacy_id = ? ORDER BY s.sale_date DESC`,
  
  // Create new sale
  createSale: `INSERT INTO sales (id, pharmacy_id, drug_id, customer_id, quantity, 
                unit_price, total_amount, discount_amount, final_amount, payment_method, 
                prescription_required, prescription_number) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  
  // Get sales statistics
  getSalesStats: `SELECT 
                    COUNT(*) as total_sales,
                    SUM(final_amount) as total_revenue,
                    AVG(final_amount) as avg_sale_amount,
                    COUNT(DISTINCT customer_id) as unique_customers
                   FROM sales 
                   WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
}

// Drug Events Queries
export const drugEventQueries = {
  // Get drug events by drug ID
  getDrugEvents: `SELECT e.*, u.name as created_by_name, 
                  from_org.name as from_organization_name, 
                  to_org.name as to_organization_name 
                  FROM drug_events e 
                  JOIN users u ON e.created_by = u.id 
                  LEFT JOIN organizations from_org ON e.from_organization_id = from_org.id 
                  LEFT JOIN organizations to_org ON e.to_organization_id = to_org.id 
                  WHERE e.drug_id = ? ORDER BY e.timestamp DESC`,
  
  // Create drug event
  createDrugEvent: `INSERT INTO drug_events (id, drug_id, event_type, from_organization_id, 
                    to_organization_id, quantity, location, notes, created_by) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  
  // Get events by organization
  getEventsByOrganization: `SELECT e.*, d.name as drug_name, u.name as created_by_name 
                           FROM drug_events e 
                           JOIN drugs d ON e.drug_id = d.id 
                           JOIN users u ON e.created_by = u.id 
                           WHERE e.from_organization_id = ? OR e.to_organization_id = ? 
                           ORDER BY e.timestamp DESC`
}

// Quality Check Queries
export const qualityCheckQueries = {
  // Get quality checks by drug
  getQualityChecksByDrug: `SELECT qc.*, d.name as drug_name, org.name as organization_name 
                           FROM quality_checks qc 
                           JOIN drugs d ON qc.drug_id = d.id 
                           JOIN organizations org ON qc.organization_id = org.id 
                           WHERE qc.drug_id = ? ORDER BY qc.check_date DESC`,
  
  // Create quality check
  createQualityCheck: `INSERT INTO quality_checks (id, drug_id, organization_id, check_type, 
                       check_date, inspector_name, temperature, humidity, visual_inspection, 
                       packaging_integrity, label_accuracy, overall_result, notes) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  
  // Get quality checks by organization
  getQualityChecksByOrganization: `SELECT qc.*, d.name as drug_name 
                                   FROM quality_checks qc 
                                   JOIN drugs d ON qc.drug_id = d.id 
                                   WHERE qc.organization_id = ? ORDER BY qc.check_date DESC`
}

// Production Request Queries
export const productionRequestQueries = {
  // Get production requests by requesting organization
  getProductionRequestsByRequester: `SELECT pr.*, m.name as manufacturer_name 
                                    FROM production_requests pr 
                                    JOIN organizations m ON pr.manufacturer_id = m.id 
                                    WHERE pr.requesting_organization_id = ? 
                                    ORDER BY pr.created_at DESC`,
  
  // Get production requests by manufacturer
  getProductionRequestsByManufacturer: `SELECT pr.*, r.name as requesting_organization_name 
                                       FROM production_requests pr 
                                       JOIN organizations r ON pr.requesting_organization_id = r.id 
                                       WHERE pr.manufacturer_id = ? 
                                       ORDER BY pr.created_at DESC`,
  
  // Create production request
  createProductionRequest: `INSERT INTO production_requests (id, requesting_organization_id, 
                           manufacturer_id, drug_name, quantity, requested_delivery_date, status, notes) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  
  // Update production request status
  updateProductionRequestStatus: `UPDATE production_requests SET status = ?, 
                                 approved_quantity = ?, approved_delivery_date = ? WHERE id = ?`
}

// Organization Queries
export const organizationQueries = {
  // Get all organizations
  getAllOrganizations: `SELECT * FROM organizations ORDER BY name`,
  
  // Get organizations by type
  getOrganizationsByType: `SELECT * FROM organizations WHERE type = ? ORDER BY name`,
  
  // Get organization by ID
  getOrganizationById: `SELECT * FROM organizations WHERE id = ?`,
  
  // Create organization
  createOrganization: `INSERT INTO organizations (id, name, type, address, city, state, 
                      pincode, phone, email, license_number, gst_number) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  
  // Update organization
  updateOrganization: `UPDATE organizations SET name = ?, type = ?, address = ?, city = ?, 
                      state = ?, pincode = ?, phone = ?, email = ?, license_number = ?, 
                      gst_number = ? WHERE id = ?`
}

// Audit Log Queries
export const auditLogQueries = {
  // Create audit log entry
  createAuditLog: `INSERT INTO audit_log (id, user_id, action, table_name, record_id, 
                   old_values, new_values, ip_address, user_agent) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  
  // Get audit log by user
  getAuditLogByUser: `SELECT * FROM audit_log WHERE user_id = ? ORDER BY timestamp DESC`,
  
  // Get audit log by table
  getAuditLogByTable: `SELECT al.*, u.name as user_name 
                       FROM audit_log al 
                       LEFT JOIN users u ON al.user_id = u.id 
                       WHERE al.table_name = ? ORDER BY al.timestamp DESC`
}

// Utility functions
export const databaseUtils = {
  // Generate unique ID
  generateId: (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Format date for MySQL
  formatDate: (date: Date) => date.toISOString().slice(0, 19).replace('T', ' '),
  
  // Parse MySQL date
  parseDate: (dateString: string) => new Date(dateString),
  
  // Escape string for SQL
  escapeString: (str: string) => str.replace(/'/g, "''"),
  
  // Build WHERE clause
  buildWhereClause: (conditions: Record<string, any>) => {
    const clauses = Object.entries(conditions)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key} = ?`)
    return clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''
  }
}

// Export all queries
export const queries = {
  user: userQueries,
  drug: drugQueries,
  inventory: inventoryQueries,
  order: orderQueries,
  sales: salesQueries,
  drugEvent: drugEventQueries,
  qualityCheck: qualityCheckQueries,
  productionRequest: productionRequestQueries,
  organization: organizationQueries,
  auditLog: auditLogQueries
}

export default {
  initializeDatabase,
  getConnection,
  executeQuery,
  executeTransaction,
  queries,
  utils: databaseUtils
} 