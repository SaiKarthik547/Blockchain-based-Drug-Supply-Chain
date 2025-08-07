# MySQL Database Setup for PharmaTrack India

## 🗄️ **Database Overview**

This guide will help you set up a MySQL database to replace the localStorage-based data storage in the PharmaTrack India application. The database provides:

- **Persistent Data Storage**: All data is stored in MySQL tables
- **Relational Integrity**: Foreign key relationships ensure data consistency
- **Scalability**: Can handle large amounts of data efficiently
- **Security**: Proper authentication and authorization
- **Audit Trail**: Complete audit logging for compliance

## 📋 **Prerequisites**

1. **MySQL Server** (version 8.0 or higher)
2. **Node.js** (version 16 or higher)
3. **npm** or **yarn** package manager

## 🚀 **Installation Steps**

### Step 1: Install MySQL Server

#### Windows:
```bash
# Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
# Run the installer and follow the setup wizard
# Remember the root password you set
```

#### macOS:
```bash
# Using Homebrew
brew install mysql
brew services start mysql

# Or download from: https://dev.mysql.com/downloads/mysql/
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Step 2: Install MySQL Dependencies

```bash
cd chain-trackr-main
npm install mysql2
```

### Step 3: Create Database and Tables

1. **Start MySQL and connect as root:**
```bash
mysql -u root -p
```

2. **Run the schema file:**
```bash
mysql -u root -p < database/schema.sql
```

3. **Verify the database was created:**
```sql
SHOW DATABASES;
USE pharmatrack_india;
SHOW TABLES;
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=pharmatrack_india
DB_PORT=3306

# Application Configuration
VITE_APP_TITLE=PharmaTrack India
VITE_APP_VERSION=1.0.0
```

### Step 5: Test Database Connection

```bash
# Start the development server
npm run dev

# Check browser console for database connection messages
```

## 📊 **Database Schema**

### Core Tables

#### 1. **users** - User Authentication
```sql
- id (VARCHAR(50)) - Primary key
- username (VARCHAR(50)) - Unique username
- email (VARCHAR(100)) - User email
- password_hash (VARCHAR(255)) - Encrypted password
- role (ENUM) - admin, manufacturer, distributor, pharmacy, customer
- name (VARCHAR(100)) - Full name
- organization (VARCHAR(150)) - Organization name
- is_active (BOOLEAN) - Account status
- created_at (TIMESTAMP) - Account creation date
- last_login (TIMESTAMP) - Last login time
```

#### 2. **organizations** - Company Information
```sql
- id (VARCHAR(50)) - Primary key
- name (VARCHAR(150)) - Company name
- type (ENUM) - manufacturer, distributor, pharmacy, regulator
- address (TEXT) - Full address
- city (VARCHAR(50)) - City
- state (VARCHAR(50)) - State
- pincode (VARCHAR(10)) - Postal code
- phone (VARCHAR(20)) - Contact number
- email (VARCHAR(100)) - Contact email
- license_number (VARCHAR(50)) - Business license
- gst_number (VARCHAR(20)) - GST number
```

#### 3. **drugs** - Medicine Information
```sql
- id (VARCHAR(50)) - Primary key
- name (VARCHAR(150)) - Drug name
- generic_name (VARCHAR(150)) - Generic name
- manufacturer_id (VARCHAR(50)) - Foreign key to organizations
- batch_number (VARCHAR(50)) - Unique batch number
- composition (TEXT) - Drug composition
- strength (VARCHAR(50)) - Drug strength
- dosage_form (VARCHAR(50)) - Tablet, capsule, etc.
- pack_size (VARCHAR(50)) - Package size
- mrp (DECIMAL(10,2)) - Maximum retail price
- price (DECIMAL(10,2)) - Selling price
- discounted_price (DECIMAL(10,2)) - Discounted price
- production_date (DATE) - Manufacturing date
- expiry_date (DATE) - Expiry date
- is_expired (BOOLEAN) - Expiry status
- is_blacklisted (BOOLEAN) - Blacklist status
- qr_code_generated (BOOLEAN) - QR code status
- qr_code_data (TEXT) - QR code data
- security_hash (VARCHAR(255)) - Security hash
- status (ENUM) - active, expired, blacklisted, recalled
```

#### 4. **inventory** - Stock Management
```sql
- id (VARCHAR(50)) - Primary key
- organization_id (VARCHAR(50)) - Foreign key to organizations
- drug_id (VARCHAR(50)) - Foreign key to drugs
- quantity (INT) - Available quantity
- reserved_quantity (INT) - Reserved quantity
- available_quantity (INT) - Computed available quantity
- last_updated (TIMESTAMP) - Last update time
```

#### 5. **orders** - Purchase Orders
```sql
- id (VARCHAR(50)) - Primary key
- order_number (VARCHAR(50)) - Unique order number
- customer_id (VARCHAR(50)) - Foreign key to users
- pharmacy_id (VARCHAR(50)) - Foreign key to organizations
- drug_id (VARCHAR(50)) - Foreign key to drugs
- quantity (INT) - Order quantity
- unit_price (DECIMAL(10,2)) - Unit price
- total_amount (DECIMAL(10,2)) - Total amount
- order_date (TIMESTAMP) - Order date
- expected_delivery_date (DATE) - Expected delivery
- actual_delivery_date (DATE) - Actual delivery
- status (ENUM) - pending, confirmed, processing, shipped, delivered, cancelled
- payment_status (ENUM) - pending, paid, failed, refunded
```

#### 6. **sales** - Sales Transactions
```sql
- id (VARCHAR(50)) - Primary key
- pharmacy_id (VARCHAR(50)) - Foreign key to organizations
- drug_id (VARCHAR(50)) - Foreign key to drugs
- customer_id (VARCHAR(50)) - Foreign key to users
- quantity (INT) - Sale quantity
- unit_price (DECIMAL(10,2)) - Unit price
- total_amount (DECIMAL(10,2)) - Total amount
- discount_amount (DECIMAL(10,2)) - Discount amount
- final_amount (DECIMAL(10,2)) - Final amount
- sale_date (TIMESTAMP) - Sale date
- payment_method (ENUM) - cash, card, upi, net_banking
- prescription_required (BOOLEAN) - Prescription requirement
- prescription_number (VARCHAR(50)) - Prescription number
```

#### 7. **drug_events** - Supply Chain Tracking
```sql
- id (VARCHAR(50)) - Primary key
- drug_id (VARCHAR(50)) - Foreign key to drugs
- event_type (ENUM) - manufactured, transferred, received, sold, expired, blacklisted, recalled
- from_organization_id (VARCHAR(50)) - Source organization
- to_organization_id (VARCHAR(50)) - Destination organization
- quantity (INT) - Event quantity
- location (VARCHAR(100)) - Event location
- timestamp (TIMESTAMP) - Event timestamp
- notes (TEXT) - Event notes
- created_by (VARCHAR(50)) - Foreign key to users
```

#### 8. **quality_checks** - Quality Control
```sql
- id (VARCHAR(50)) - Primary key
- drug_id (VARCHAR(50)) - Foreign key to drugs
- organization_id (VARCHAR(50)) - Foreign key to organizations
- check_type (ENUM) - manufacturing, receiving, storage, expiry
- check_date (DATE) - Check date
- inspector_name (VARCHAR(100)) - Inspector name
- temperature (DECIMAL(5,2)) - Temperature reading
- humidity (DECIMAL(5,2)) - Humidity reading
- visual_inspection (BOOLEAN) - Visual inspection result
- packaging_integrity (BOOLEAN) - Packaging check result
- label_accuracy (BOOLEAN) - Label check result
- overall_result (ENUM) - pass, fail, conditional
- notes (TEXT) - Check notes
```

#### 9. **production_requests** - Manufacturing Requests
```sql
- id (VARCHAR(50)) - Primary key
- requesting_organization_id (VARCHAR(50)) - Requester organization
- manufacturer_id (VARCHAR(50)) - Manufacturer organization
- drug_name (VARCHAR(150)) - Requested drug name
- quantity (INT) - Requested quantity
- requested_delivery_date (DATE) - Requested delivery date
- status (ENUM) - pending, approved, in_production, completed, cancelled
- approved_quantity (INT) - Approved quantity
- approved_delivery_date (DATE) - Approved delivery date
- notes (TEXT) - Request notes
```

#### 10. **audit_log** - Security and Compliance
```sql
- id (VARCHAR(50)) - Primary key
- user_id (VARCHAR(50)) - Foreign key to users
- action (VARCHAR(100)) - Action performed
- table_name (VARCHAR(50)) - Affected table
- record_id (VARCHAR(50)) - Affected record
- old_values (JSON) - Previous values
- new_values (JSON) - New values
- ip_address (VARCHAR(45)) - User IP address
- user_agent (TEXT) - User agent string
- timestamp (TIMESTAMP) - Action timestamp
```

## 🔧 **Database Operations**

### Common Queries

#### Get All Drugs with Manufacturer Info
```sql
SELECT d.*, o.name as manufacturer_name 
FROM drugs d 
JOIN organizations o ON d.manufacturer_id = o.id 
ORDER BY d.created_at DESC;
```

#### Get Inventory by Organization
```sql
SELECT i.*, d.name as drug_name, d.batch_number, d.expiry_date, 
       o.name as organization_name 
FROM inventory i 
JOIN drugs d ON i.drug_id = d.id 
JOIN organizations o ON i.organization_id = o.id 
WHERE i.organization_id = 'org-001' 
ORDER BY i.last_updated DESC;
```

#### Get Expired Drugs
```sql
SELECT d.*, o.name as manufacturer_name 
FROM drugs d 
JOIN organizations o ON d.manufacturer_id = o.id 
WHERE d.expiry_date < CURDATE() 
ORDER BY d.expiry_date ASC;
```

#### Get Sales Statistics (Last 30 Days)
```sql
SELECT 
  COUNT(*) as total_sales,
  SUM(final_amount) as total_revenue,
  AVG(final_amount) as avg_sale_amount,
  COUNT(DISTINCT customer_id) as unique_customers
FROM sales 
WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
```

### Database Maintenance

#### Update Expired Drug Status
```sql
UPDATE drugs 
SET is_expired = TRUE, status = 'expired' 
WHERE expiry_date < CURDATE() AND is_expired = FALSE;
```

#### Clean Old Audit Logs (older than 1 year)
```sql
DELETE FROM audit_log 
WHERE timestamp < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);
```

#### Optimize Tables
```sql
OPTIMIZE TABLE users, drugs, inventory, orders, sales, drug_events;
```

## 🔒 **Security Considerations**

### 1. **User Authentication**
- Passwords are hashed using bcrypt
- Session management with JWT tokens
- Role-based access control

### 2. **Data Encryption**
- Sensitive data encrypted at rest
- SSL/TLS for data in transit
- Database connection encryption

### 3. **Audit Trail**
- All data changes logged
- User actions tracked
- Compliance reporting

### 4. **Backup Strategy**
```bash
# Daily backup
mysqldump -u root -p pharmatrack_india > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u root -p pharmatrack_india < backup_20240101.sql
```

## 📈 **Performance Optimization**

### 1. **Indexes**
- Primary keys on all tables
- Foreign key indexes
- Composite indexes for common queries
- Full-text search indexes

### 2. **Query Optimization**
- Use prepared statements
- Limit result sets
- Pagination for large datasets
- Caching for frequently accessed data

### 3. **Connection Pooling**
- Configure connection pool size
- Monitor connection usage
- Implement connection timeout

## 🚨 **Troubleshooting**

### Common Issues

#### 1. **Connection Refused**
```bash
# Check MySQL service status
sudo systemctl status mysql

# Start MySQL service
sudo systemctl start mysql
```

#### 2. **Access Denied**
```bash
# Reset MySQL root password
sudo mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
```

#### 3. **Database Not Found**
```bash
# Create database manually
mysql -u root -p
CREATE DATABASE pharmatrack_india;
USE pharmatrack_india;
SOURCE database/schema.sql;
```

#### 4. **Port Already in Use**
```bash
# Check port usage
sudo netstat -tlnp | grep 3306

# Kill process using port
sudo kill -9 <PID>
```

## 📞 **Support**

For database-related issues:

1. **Check MySQL logs**: `/var/log/mysql/error.log`
2. **Verify connection**: `mysql -u root -p -h localhost`
3. **Test queries**: Use MySQL Workbench or command line
4. **Monitor performance**: Use MySQL slow query log

## 🎯 **Next Steps**

1. **Set up the database** using the schema file
2. **Configure environment variables** in `.env`
3. **Test the connection** by starting the application
4. **Migrate existing data** from localStorage (if needed)
5. **Monitor performance** and optimize queries
6. **Set up regular backups** for data safety

The database is now ready to handle all PharmaTrack India operations with enterprise-grade reliability and security! 