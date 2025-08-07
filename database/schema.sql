-- PharmaTrack India Database Schema
-- MySQL Database for Indian Pharmaceutical Supply Chain Management

-- Create database
CREATE DATABASE IF NOT EXISTS pharmatrack_india;
USE pharmatrack_india;

-- Users table for authentication and role management
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manufacturer', 'distributor', 'pharmacy', 'customer') NOT NULL,
    name VARCHAR(100) NOT NULL,
    organization VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_organization (organization)
);

-- Organizations table for company details
CREATE TABLE organizations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type ENUM('manufacturer', 'distributor', 'pharmacy', 'regulator') NOT NULL,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),
    license_number VARCHAR(50),
    gst_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_city (city),
    INDEX idx_state (state)
);

-- Drugs table for medicine information
CREATE TABLE drugs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150),
    manufacturer_id VARCHAR(50) NOT NULL,
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    composition TEXT,
    strength VARCHAR(50),
    dosage_form VARCHAR(50),
    pack_size VARCHAR(50),
    mrp DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2),
    production_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    is_expired BOOLEAN DEFAULT FALSE,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    qr_code_generated BOOLEAN DEFAULT FALSE,
    qr_code_data TEXT,
    security_hash VARCHAR(255),
    status ENUM('active', 'expired', 'blacklisted', 'recalled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manufacturer_id) REFERENCES organizations(id),
    INDEX idx_batch_number (batch_number),
    INDEX idx_manufacturer (manufacturer_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_status (status),
    INDEX idx_production_date (production_date)
);

-- Drug tracking events table
CREATE TABLE drug_events (
    id VARCHAR(50) PRIMARY KEY,
    drug_id VARCHAR(50) NOT NULL,
    event_type ENUM('manufactured', 'transferred', 'received', 'sold', 'expired', 'blacklisted', 'recalled') NOT NULL,
    from_organization_id VARCHAR(50),
    to_organization_id VARCHAR(50),
    quantity INT NOT NULL,
    location VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_by VARCHAR(50) NOT NULL,
    FOREIGN KEY (drug_id) REFERENCES drugs(id),
    FOREIGN KEY (from_organization_id) REFERENCES organizations(id),
    FOREIGN KEY (to_organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_drug_id (drug_id),
    INDEX idx_event_type (event_type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_from_org (from_organization_id),
    INDEX idx_to_org (to_organization_id)
);

-- Inventory table for stock management
CREATE TABLE inventory (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) NOT NULL,
    drug_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    available_quantity INT GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (drug_id) REFERENCES drugs(id),
    UNIQUE KEY unique_org_drug (organization_id, drug_id),
    INDEX idx_organization (organization_id),
    INDEX idx_drug (drug_id),
    INDEX idx_available_quantity (available_quantity)
);

-- Orders table for purchase orders
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    pharmacy_id VARCHAR(50) NOT NULL,
    drug_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (pharmacy_id) REFERENCES organizations(id),
    FOREIGN KEY (drug_id) REFERENCES drugs(id),
    INDEX idx_order_number (order_number),
    INDEX idx_customer (customer_id),
    INDEX idx_pharmacy (pharmacy_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
);

-- Deliveries table for shipment tracking
CREATE TABLE deliveries (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    from_organization_id VARCHAR(50) NOT NULL,
    to_organization_id VARCHAR(50) NOT NULL,
    drug_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    delivery_date DATE,
    expected_delivery_date DATE,
    status ENUM('pending', 'in_transit', 'delivered', 'failed') DEFAULT 'pending',
    tracking_number VARCHAR(50),
    carrier VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (from_organization_id) REFERENCES organizations(id),
    FOREIGN KEY (to_organization_id) REFERENCES organizations(id),
    FOREIGN KEY (drug_id) REFERENCES drugs(id),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_delivery_date (delivery_date),
    INDEX idx_tracking_number (tracking_number)
);

-- Quality checks table
CREATE TABLE quality_checks (
    id VARCHAR(50) PRIMARY KEY,
    drug_id VARCHAR(50) NOT NULL,
    organization_id VARCHAR(50) NOT NULL,
    check_type ENUM('manufacturing', 'receiving', 'storage', 'expiry') NOT NULL,
    check_date DATE NOT NULL,
    inspector_name VARCHAR(100),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    visual_inspection BOOLEAN,
    packaging_integrity BOOLEAN,
    label_accuracy BOOLEAN,
    overall_result ENUM('pass', 'fail', 'conditional') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drug_id) REFERENCES drugs(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    INDEX idx_drug_id (drug_id),
    INDEX idx_organization (organization_id),
    INDEX idx_check_date (check_date),
    INDEX idx_result (overall_result)
);

-- Production requests table
CREATE TABLE production_requests (
    id VARCHAR(50) PRIMARY KEY,
    requesting_organization_id VARCHAR(50) NOT NULL,
    manufacturer_id VARCHAR(50) NOT NULL,
    drug_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    requested_delivery_date DATE,
    status ENUM('pending', 'approved', 'in_production', 'completed', 'cancelled') DEFAULT 'pending',
    approved_quantity INT,
    approved_delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requesting_organization_id) REFERENCES organizations(id),
    FOREIGN KEY (manufacturer_id) REFERENCES organizations(id),
    INDEX idx_requesting_org (requesting_organization_id),
    INDEX idx_manufacturer (manufacturer_id),
    INDEX idx_status (status),
    INDEX idx_requested_date (requested_delivery_date)
);

-- Sales table for transaction records
CREATE TABLE sales (
    id VARCHAR(50) PRIMARY KEY,
    pharmacy_id VARCHAR(50) NOT NULL,
    drug_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('cash', 'card', 'upi', 'net_banking') DEFAULT 'cash',
    prescription_required BOOLEAN DEFAULT FALSE,
    prescription_number VARCHAR(50),
    notes TEXT,
    FOREIGN KEY (pharmacy_id) REFERENCES organizations(id),
    FOREIGN KEY (drug_id) REFERENCES drugs(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    INDEX idx_pharmacy (pharmacy_id),
    INDEX idx_drug (drug_id),
    INDEX idx_sale_date (sale_date),
    INDEX idx_customer (customer_id)
);

-- Audit log table for security and compliance
CREATE TABLE audit_log (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id VARCHAR(50),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp),
    INDEX idx_table_record (table_name, record_id)
);

-- Insert demo data
INSERT INTO organizations (id, name, type, address, city, state, pincode, phone, email, license_number, gst_number) VALUES
-- Manufacturers
('org-001', 'Cipla Ltd.', 'manufacturer', 'Mumbai Central, Mumbai', 'Mumbai', 'Maharashtra', '400008', '+91-22-2308 0000', 'contact@cipla.com', 'LIC001', 'GST001'),
('org-002', 'Sun Pharmaceutical Industries Ltd.', 'manufacturer', 'Goregaon, Mumbai', 'Mumbai', 'Maharashtra', '400063', '+91-22-4324 0000', 'contact@sunpharma.com', 'LIC002', 'GST002'),
('org-003', 'Dr. Reddy\'s Laboratories Ltd.', 'manufacturer', 'Banjara Hills, Hyderabad', 'Hyderabad', 'Telangana', '500034', '+91-40-4900 0000', 'contact@drreddys.com', 'LIC003', 'GST003'),

-- Distributors
('org-004', 'MedPlus Distribution Ltd.', 'distributor', 'Andheri, Mumbai', 'Mumbai', 'Maharashtra', '400058', '+91-22-2857 0000', 'ops@medplus.com', 'LIC004', 'GST004'),
('org-005', 'Alliance Healthcare India', 'distributor', 'Bandra, Mumbai', 'Mumbai', 'Maharashtra', '400050', '+91-22-2643 0000', 'ops@alliancehealthcare.com', 'LIC005', 'GST005'),
('org-006', 'McKesson India', 'distributor', 'Parel, Mumbai', 'Mumbai', 'Maharashtra', '400012', '+91-22-2419 0000', 'ops@mckessonindia.com', 'LIC006', 'GST006'),

-- Pharmacies
('org-007', 'Apollo Pharmacy Chain', 'pharmacy', 'T Nagar, Chennai', 'Chennai', 'Tamil Nadu', '600017', '+91-44-2829 0000', 'manager@apollopharmacy.com', 'LIC007', 'GST007'),
('org-008', 'MedPlus Pharmacy Chain', 'pharmacy', 'Koramangala, Bangalore', 'Bangalore', 'Karnataka', '560034', '+91-80-2550 0000', 'manager@medpluspharmacy.com', 'LIC008', 'GST008'),
('org-009', 'PharmEasy Retail', 'pharmacy', 'Andheri West, Mumbai', 'Mumbai', 'Maharashtra', '400058', '+91-22-2857 0000', 'manager@pharmeasy.com', 'LIC009', 'GST009');

-- Insert demo users
INSERT INTO users (id, username, email, password_hash, role, name, organization, is_active) VALUES
-- Admin
('user-001', 'admin', 'admin@pharmatrackindia.com', '$2b$10$demo_hash_admin', 'admin', 'System Administrator', 'PharmaTrack India', TRUE),

-- Manufacturers
('user-002', 'cipla', 'contact@cipla.com', '$2b$10$demo_hash_cipla', 'manufacturer', 'Cipla Manufacturing', 'Cipla Ltd.', TRUE),
('user-003', 'sunpharma', 'contact@sunpharma.com', '$2b$10$demo_hash_sunpharma', 'manufacturer', 'Sun Pharma Manufacturing', 'Sun Pharmaceutical Industries Ltd.', TRUE),
('user-004', 'drreddy', 'contact@drreddys.com', '$2b$10$demo_hash_drreddy', 'manufacturer', 'Dr. Reddy\'s Manufacturing', 'Dr. Reddy\'s Laboratories Ltd.', TRUE),

-- Distributors
('user-005', 'medplus', 'ops@medplus.com', '$2b$10$demo_hash_medplus', 'distributor', 'MedPlus Distribution', 'MedPlus Distribution Ltd.', TRUE),
('user-006', 'alliance', 'ops@alliancehealthcare.com', '$2b$10$demo_hash_alliance', 'distributor', 'Alliance Healthcare Distribution', 'Alliance Healthcare India', TRUE),
('user-007', 'mckesson', 'ops@mckessonindia.com', '$2b$10$demo_hash_mckesson', 'distributor', 'McKesson India Distribution', 'McKesson India', TRUE),

-- Pharmacies
('user-008', 'apollo', 'manager@apollopharmacy.com', '$2b$10$demo_hash_apollo', 'pharmacy', 'Apollo Pharmacy', 'Apollo Pharmacy Chain', TRUE),
('user-009', 'medpluspharm', 'manager@medpluspharmacy.com', '$2b$10$demo_hash_medpluspharm', 'pharmacy', 'MedPlus Pharmacy', 'MedPlus Pharmacy Chain', TRUE),
('user-010', 'pharmeasy', 'manager@pharmeasy.com', '$2b$10$demo_hash_pharmeasy', 'pharmacy', 'PharmEasy Pharmacy', 'PharmEasy Retail', TRUE),

-- Customer
('user-011', 'customer', 'customer@pharmatrackindia.com', '$2b$10$demo_hash_customer', 'customer', 'Customer User', 'Individual Customer', TRUE);

-- Insert demo drugs
INSERT INTO drugs (id, name, generic_name, manufacturer_id, batch_number, composition, strength, dosage_form, pack_size, mrp, price, discounted_price, production_date, expiry_date, is_expired, is_blacklisted, qr_code_generated, qr_code_data, security_hash) VALUES
('drug-001', 'Paracetamol 500mg', 'Paracetamol', 'org-001', 'CIPLA0012024001', 'Paracetamol 500mg', '500mg', 'Tablet', '10 tablets', 15.00, 12.00, 10.00, '2024-01-15', '2026-01-15', FALSE, FALSE, TRUE, '{"drugId":"drug-001","batchNumber":"CIPLA0012024001"}', 'hash_001'),
('drug-002', 'Amoxicillin 250mg', 'Amoxicillin', 'org-002', 'SUN0022024001', 'Amoxicillin 250mg', '250mg', 'Capsule', '10 capsules', 45.00, 38.00, 35.00, '2024-01-20', '2025-07-20', FALSE, FALSE, TRUE, '{"drugId":"drug-002","batchNumber":"SUN0022024001"}', 'hash_002'),
('drug-003', 'Omeprazole 20mg', 'Omeprazole', 'org-003', 'DRRED0032024001', 'Omeprazole 20mg', '20mg', 'Capsule', '15 capsules', 120.00, 100.00, 90.00, '2024-01-10', '2025-01-10', FALSE, FALSE, TRUE, '{"drugId":"drug-003","batchNumber":"DRRED0032024001"}', 'hash_003'),
('drug-004', 'Metformin 500mg', 'Metformin', 'org-001', 'CIPLA0042024001', 'Metformin 500mg', '500mg', 'Tablet', '15 tablets', 35.00, 30.00, 25.00, '2024-01-05', '2025-01-05', FALSE, FALSE, TRUE, '{"drugId":"drug-004","batchNumber":"CIPLA0042024001"}', 'hash_004'),
('drug-005', 'Amlodipine 5mg', 'Amlodipine', 'org-002', 'SUN0052024001', 'Amlodipine 5mg', '5mg', 'Tablet', '10 tablets', 25.00, 22.00, 20.00, '2024-01-12', '2025-01-12', FALSE, FALSE, TRUE, '{"drugId":"drug-005","batchNumber":"SUN0052024001"}', 'hash_005');

-- Insert demo inventory
INSERT INTO inventory (id, organization_id, drug_id, quantity, reserved_quantity) VALUES
('inv-001', 'org-004', 'drug-001', 500, 50),
('inv-002', 'org-005', 'drug-002', 300, 30),
('inv-003', 'org-006', 'drug-003', 200, 20),
('inv-004', 'org-007', 'drug-001', 100, 10),
('inv-005', 'org-008', 'drug-002', 150, 15),
('inv-006', 'org-009', 'drug-003', 80, 8);

-- Insert demo drug events
INSERT INTO drug_events (id, drug_id, event_type, from_organization_id, to_organization_id, quantity, location, notes, created_by) VALUES
('event-001', 'drug-001', 'manufactured', 'org-001', NULL, 1000, 'Mumbai', 'Initial production batch', 'user-002'),
('event-002', 'drug-001', 'transferred', 'org-001', 'org-004', 500, 'Mumbai to Mumbai', 'Distribution transfer', 'user-002'),
('event-003', 'drug-001', 'received', 'org-004', NULL, 500, 'Mumbai', 'Received from manufacturer', 'user-005'),
('event-004', 'drug-001', 'transferred', 'org-004', 'org-007', 100, 'Mumbai to Chennai', 'Pharmacy supply', 'user-005'),
('event-005', 'drug-002', 'manufactured', 'org-002', NULL, 800, 'Mumbai', 'Production batch', 'user-003'),
('event-006', 'drug-002', 'transferred', 'org-002', 'org-005', 300, 'Mumbai to Mumbai', 'Distribution', 'user-003');

-- Insert demo orders
INSERT INTO orders (id, order_number, customer_id, pharmacy_id, drug_id, quantity, unit_price, total_amount, expected_delivery_date, status, payment_status) VALUES
('order-001', 'ORD0012024001', 'user-011', 'org-007', 'drug-001', 2, 12.00, 24.00, '2024-02-15', 'delivered', 'paid'),
('order-002', 'ORD0022024001', 'user-011', 'org-008', 'drug-002', 1, 38.00, 38.00, '2024-02-20', 'processing', 'paid'),
('order-003', 'ORD0032024001', 'user-011', 'org-009', 'drug-003', 1, 100.00, 100.00, '2024-02-25', 'pending', 'pending');

-- Insert demo sales
INSERT INTO sales (id, pharmacy_id, drug_id, customer_id, quantity, unit_price, total_amount, discount_amount, final_amount, payment_method) VALUES
('sale-001', 'org-007', 'drug-001', 'user-011', 2, 12.00, 24.00, 2.00, 22.00, 'upi'),
('sale-002', 'org-008', 'drug-002', 'user-011', 1, 38.00, 38.00, 3.00, 35.00, 'card'),
('sale-003', 'org-009', 'drug-003', 'user-011', 1, 100.00, 100.00, 10.00, 90.00, 'cash');

-- Insert demo quality checks
INSERT INTO quality_checks (id, drug_id, organization_id, check_type, check_date, inspector_name, temperature, humidity, visual_inspection, packaging_integrity, label_accuracy, overall_result, notes) VALUES
('qc-001', 'drug-001', 'org-001', 'manufacturing', '2024-01-15', 'Dr. Sharma', 25.5, 45.2, TRUE, TRUE, TRUE, 'pass', 'All parameters within limits'),
('qc-002', 'drug-002', 'org-002', 'manufacturing', '2024-01-20', 'Dr. Patel', 24.8, 48.1, TRUE, TRUE, TRUE, 'pass', 'Quality standards met'),
('qc-003', 'drug-001', 'org-007', 'receiving', '2024-01-25', 'Mr. Kumar', 26.2, 46.5, TRUE, TRUE, TRUE, 'pass', 'Received in good condition');

-- Insert demo production requests
INSERT INTO production_requests (id, requesting_organization_id, manufacturer_id, drug_name, quantity, requested_delivery_date, status, notes) VALUES
('pr-001', 'org-004', 'org-001', 'Paracetamol 500mg', 1000, '2024-03-15', 'approved', 'Urgent requirement for flu season'),
('pr-002', 'org-005', 'org-002', 'Amoxicillin 250mg', 500, '2024-03-20', 'pending', 'Regular supply requirement'),
('pr-003', 'org-006', 'org-003', 'Omeprazole 20mg', 300, '2024-03-25', 'in_production', 'New market demand'); 