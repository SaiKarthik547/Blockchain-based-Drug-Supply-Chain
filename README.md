# PharmaTrack India - Pharmaceutical Supply Chain Tracking System

A comprehensive pharmaceutical supply chain tracking system designed for the Indian market, featuring QR code generation, expiry date tracking, discounted pricing, and role-based access control.

## 🚀 Features

### **Core Functionality**
- **Drug Registration & Tracking**: Complete lifecycle tracking from manufacturing to patient delivery
- **QR Code Generation**: Secure QR codes for drug tracking (manufacturer/admin only)
- **Customer Portal**: QR code scanning and drug information access for customers
- **Expiry Date Management**: Automatic expiry tracking with discounted pricing
- **Role-Based Access**: Different interfaces for manufacturers, distributors, pharmacies, and customers

### **QR Code System**
- **Secure QR Generation**: Manufacturers and admins can generate QR codes for drugs
- **QR Code Viewing**: View QR codes for any drug in the system
- **Customer Scanning**: Customers can scan QR codes to get complete drug information
- **Data Integrity**: Security hashes prevent QR code tampering

### **Expiry & Pricing System**
- **Automatic Expiry Tracking**: Real-time expiry status updates
- **Discounted Pricing**: Automatic discounts based on expiry dates
  - 50% discount for drugs < 30 days to expiry
  - 30% discount for drugs < 60 days to expiry
  - 15% discount for drugs < 90 days to expiry
- **Expired Drug Blacklisting**: Expired drugs are automatically blacklisted
- **Price Display**: All prices in Indian Rupees (₹)

### **User Management**
- **Smooth User Switching**: Logout button for easy user switching
- **Current User Display**: Shows logged-in user name and role
- **Role-Based Navigation**: Users only see pages they have access to
- **Demo Accounts**: Pre-configured accounts for testing

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Shadcn/ui, Tailwind CSS
- **QR Code**: qrcode library for generation
- **State Management**: React hooks with localStorage persistence
- **Authentication**: Local storage-based mock authentication

## 📋 Demo Credentials

| Username | Password | Role | Organization | Access |
|----------|----------|------|-------------|--------|
| `admin` | `admin123` | Administrator | PharmaTrack India | Full access to all features |
| **Manufacturers** |
| `cipla` | `cipla123` | Manufacturer | Cipla Ltd. | Drug creation, QR generation, transfers |
| `sunpharma` | `sunpharma123` | Manufacturer | Sun Pharmaceutical Industries Ltd. | Drug creation, QR generation, transfers |
| `drreddy` | `drreddy123` | Manufacturer | Dr. Reddy's Laboratories Ltd. | Drug creation, QR generation, transfers |
| **Distributors** |
| `medplus` | `medplus123` | Distributor | MedPlus Distribution Ltd. | Drug transfers, distribution management |
| `alliance` | `alliance123` | Distributor | Alliance Healthcare India | Drug transfers, distribution management |
| `mckesson` | `mckesson123` | Distributor | McKesson India | Drug transfers, distribution management |
| **Pharmacies** |
| `apollo` | `apollo123` | Pharmacy | Apollo Pharmacy Chain | Drug sales, customer interactions |
| `medpluspharm` | `medpluspharm123` | Pharmacy | MedPlus Pharmacy Chain | Drug sales, customer interactions |
| `pharmeasy` | `pharmeasy123` | Pharmacy | PharmEasy Retail | Drug sales, customer interactions |
| **Customer** |
| `customer` | `customer123` | Customer | Individual Customer | QR code scanning, drug information |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd chain-trackr-main

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Running the Application
1. Start the development server: `npm run dev`
2. Open your browser to `http://localhost:8080`
3. Login with any of the demo credentials above
4. Explore different features based on your role

## 📱 User Interfaces

### **Dashboard**
- Overview of all drugs in the system
- Statistics and analytics
- Quick access to all features
- Drug cards with QR code viewing

### **Manufacturing**
- Register new drugs with expiry dates and pricing
- Generate QR codes for tracking
- View manufacturing history

### **Distribution**
- Transfer drugs between entities
- Track distribution network
- View transfer history

### **Sales**
- Record drug sales to patients
- Track sales history
- View revenue analytics

### **Customer Portal**
- Scan QR codes to get drug information
- View manufacturing and expiry dates
- See pricing and discount information
- Access complete drug profiles

### **Track Drug**
- Search drugs by batch number
- View complete supply chain timeline
- Access QR codes for tracking
- See detailed drug information

## 🔐 Security Features

- **Role-Based Access Control**: Users only see features they have permission for
- **QR Code Security**: Hash verification prevents tampering
- **Data Integrity**: Secure data storage and validation
- **Session Management**: Automatic session expiry and logout

## 🎨 Design Features

- **Indian Localization**: All currency in Indian Rupees (₹)
- **Professional UI**: Modern, clean interface with medical theme
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Background Images**: Integrated medical-themed background images
- **Color-Coded Status**: Visual indicators for drug status and expiry

## 📊 Sample Data

The application comes with 30 sample drugs including:
- Pain relief medications (Paracetamol, Ibuprofen, etc.)
- Antibiotics (Amoxicillin, Azithromycin, etc.)
- Chronic disease medications (Metformin, Insulin, etc.)

Each drug includes:
- Complete manufacturing information
- Expiry dates and pricing
- Supply chain history
- QR codes for tracking

## 🔄 Key Workflows

### **Manufacturer Workflow**
1. Register new drug with expiry date and price
2. Generate QR code for tracking
3. Transfer drugs to distributors
4. Monitor drug status and expiry

### **Customer Workflow**
1. Scan QR code on drug package
2. View complete drug information
3. Check expiry date and pricing
4. Verify drug authenticity

### **Admin Workflow**
1. Monitor all drugs in the system
2. Generate QR codes for any drug
3. View analytics and statistics
4. Manage user access and permissions

## 🏗️ Detailed Functionality Architecture

### **🔐 Authentication & User Management**

#### **Login System**
- **Multi-Role Authentication**: Support for 5 distinct user roles
- **Session Management**: Secure login/logout with localStorage persistence
- **Role-Based Access Control (RBAC)**: Granular permissions per role
- **User Switching**: Smooth logout and re-login for role testing

#### **User Roles & Permissions Matrix**

| Feature | Admin | Manufacturer | Distributor | Pharmacy | Customer |
|---------|-------|--------------|-------------|----------|----------|
| **Dashboard Access** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Limited |
| **Drug Registration** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **QR Code Generation** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **QR Code Viewing** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Drug Transfers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Sales Recording** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Customer Portal** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Analytics & Reports** | ✅ Full | ✅ Limited | ✅ Limited | ✅ Limited | ❌ |
| **System Administration** | ✅ | ❌ | ❌ | ❌ | ❌ |

### **🏭 Manufacturer Role Architecture**

#### **Core Capabilities**
- **Drug Registration**: Create new drug batches with complete metadata
- **QR Code Management**: Generate and view QR codes for drug tracking
- **Supply Chain Initiation**: Start drug distribution process
- **Quality Control**: Monitor drug status and expiry dates

#### **Detailed Workflow**
1. **Drug Creation Process**
   - Enter drug name, composition, batch number
   - Set manufacturing date and expiry date
   - Define pricing (base price in ₹)
   - Generate unique QR code for tracking
   - Store complete drug metadata

2. **QR Code Generation**
   - Create secure QR codes with drug information
   - Include security hash for tamper detection
   - Store QR data with batch number
   - Enable offline QR code viewing

3. **Distribution Management**
   - Transfer drugs to distributor entities
   - Track transfer history and status
   - Monitor drug location in supply chain
   - Update drug status automatically

4. **Quality Monitoring**
   - Track expiry dates in real-time
   - Monitor drug status changes
   - View manufacturing analytics
   - Generate quality reports

#### **Data Access**
- **Own Drugs**: Full access to drugs created by manufacturer
- **System Overview**: View all drugs in system (read-only)
- **Analytics**: Manufacturing statistics and reports
- **QR Codes**: Generate and view QR codes for any drug

### **🚚 Distributor Role Architecture**

#### **Core Capabilities**
- **Drug Transfers**: Move drugs between supply chain entities
- **Inventory Management**: Track drug stock and location
- **Supply Chain Coordination**: Coordinate between manufacturers and pharmacies
- **Status Monitoring**: Monitor drug status and expiry

#### **Detailed Workflow**
1. **Transfer Management**
   - Receive drugs from manufacturers
   - Transfer drugs to pharmacies
   - Update drug location and status
   - Maintain transfer audit trail

2. **Inventory Tracking**
   - Monitor drug stock levels
   - Track drug locations
   - Manage warehouse operations
   - Handle logistics coordination

3. **Quality Assurance**
   - Verify drug authenticity
   - Check expiry dates
   - Monitor storage conditions
   - Report quality issues

4. **Supply Chain Analytics**
   - View distribution statistics
   - Track transfer efficiency
   - Monitor delivery times
   - Generate distribution reports

#### **Data Access**
- **Transfer Operations**: Full access to drug transfer functions
- **Inventory View**: Complete inventory visibility
- **Analytics**: Distribution and transfer statistics
- **Quality Monitoring**: Expiry and status tracking

### **🏥 Pharmacy Role Architecture**

#### **Core Capabilities**
- **Sales Management**: Record drug sales to customers
- **Customer Interaction**: Handle customer queries and purchases
- **Inventory Management**: Track pharmacy stock levels
- **Revenue Analytics**: Monitor sales performance

#### **Detailed Workflow**
1. **Sales Recording**
   - Record customer purchases
   - Apply expiry-based discounts
   - Update inventory levels
   - Generate sales receipts

2. **Customer Service**
   - Handle customer inquiries
   - Provide drug information
   - Assist with QR code scanning
   - Manage customer relationships

3. **Inventory Management**
   - Monitor pharmacy stock
   - Track drug availability
   - Manage reorder processes
   - Handle expired drugs

4. **Revenue Analytics**
   - Track sales performance
   - Monitor discount applications
   - Analyze customer patterns
   - Generate revenue reports

#### **Data Access**
- **Sales Operations**: Full access to sales recording
- **Customer Data**: Access to customer interaction history
- **Inventory**: Pharmacy stock visibility
- **Analytics**: Sales and revenue statistics

### **👤 Customer Role Architecture**

#### **Core Capabilities**
- **QR Code Scanning**: Scan drug QR codes for information
- **Drug Information Access**: View complete drug details
- **Expiry Checking**: Verify drug expiry dates
- **Price Verification**: Check pricing and discounts

#### **Detailed Workflow**
1. **QR Code Interaction**
   - Scan QR codes on drug packages
   - Input QR data manually if needed
   - Retrieve complete drug information
   - Verify drug authenticity

2. **Drug Information Access**
   - View manufacturing details
   - Check expiry dates
   - See pricing information
   - Access composition details

3. **Expiry & Pricing**
   - Check if drug is expired
   - View discounted pricing
   - Understand expiry warnings
   - Verify purchase decisions

4. **Security Verification**
   - Verify QR code authenticity
   - Check security hashes
   - Confirm drug origin
   - Validate supply chain

#### **Data Access**
- **QR Scanning**: Access to QR code scanning functionality
- **Drug Information**: Read-only access to drug details
- **Pricing**: View pricing and discount information
- **Security**: Verify drug authenticity and origin

### **👨‍💼 Admin Role Architecture**

#### **Core Capabilities**
- **System Administration**: Full system access and control
- **User Management**: Monitor and manage user activities
- **Analytics & Reporting**: Comprehensive system analytics
- **Quality Assurance**: Monitor overall system health

#### **Detailed Workflow**
1. **System Monitoring**
   - Monitor all drugs in system
   - Track user activities
   - Monitor system performance
   - Handle system issues

2. **Analytics & Reporting**
   - Generate comprehensive reports
   - Analyze supply chain efficiency
   - Monitor quality metrics
   - Track system usage

3. **Quality Assurance**
   - Monitor drug expiry patterns
   - Track quality issues
   - Ensure data integrity
   - Maintain system security

4. **User Support**
   - Assist with user issues
   - Monitor user activities
   - Provide system guidance
   - Handle administrative tasks

#### **Data Access**
- **Full System Access**: Complete access to all features
- **User Management**: Monitor all user activities
- **Analytics**: Comprehensive system analytics
- **Administration**: Full administrative control

### **🔧 Technical Architecture**

#### **System Architecture Overview**
```
┌─────────────────────────────────────────────────────────────────┐
│                    PharmaTrack India System                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   React     │  │  TypeScript │  │   Vite      │          │
│  │  Frontend   │  │   Language  │  │   Build     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Shadcn/ui  │  │   Tailwind  │  │   QR Code   │          │
│  │ Components  │  │     CSS     │  │   Library   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Auth      │  │   Data      │  │   QR Code   │          │
│  │  Service    │  │  Service    │  │   Service   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Local      │  │   Mock      │  │   Session   │          │
│  │  Storage    │  │  Database   │  │  Management │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

#### **Data Flow Architecture**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───▶│   Login     │───▶│   Role      │───▶│   Feature   │
│  Interface  │    │  Form       │    │ Verification│    │   Access    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Response  │◀───│   Data      │◀───│   Data      │◀───│   Data      │
│  Display    │    │  Processing │    │  Operations │    │  Service    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### **Authentication Flow**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───▶│   Login     │───▶│   Validate  │───▶│   Create    │
│  Enters     │    │  Form       │    │  Credentials│    │   Session   │
│ Credentials │    │  Submission │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Redirect  │◀───│   Store     │◀───│   Set       │◀───│   Generate  │
│   to        │    │   User      │    │   User      │    │   Session   │
│  Dashboard  │    │   Data      │    │   Role      │    │   Token     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### **QR Code Generation Flow**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Drug      │───▶│   Generate  │───▶│   Create    │───▶│   Store     │
│  Creation   │    │   Security  │    │   QR Code   │    │   QR Data   │
│   Form      │    │    Hash     │    │   Image     │    │   with      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Display   │◀───│   Return    │◀───│   Generate  │◀───│   Update    │
│   QR Code   │    │   QR Code   │    │   QR Code   │    │   Drug      │
│   Image     │    │   Image     │    │   Data      │    │   Record    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### **Drug Tracking Flow**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Scan/     │───▶│   Decode    │───▶│   Validate  │───▶│   Retrieve  │
│   Input     │    │   QR Code   │    │   Security  │    │   Drug      │
│   QR Code   │    │   Data      │    │    Hash     │    │   Data      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Display   │◀───│   Calculate │◀───│   Check     │◀───│   Fetch     │
│   Drug      │    │   Discount  │    │   Expiry    │    │   Complete  │
│  Information│    │   Price     │    │   Status    │    │   Drug      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### **Role-Based Access Control (RBAC)**
```
┌─────────────────────────────────────────────────────────────────┐
│                    User Authentication                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Admin     │  │Manufacturer │  │Distributor  │          │
│  │   Role      │  │   Role      │  │   Role      │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│  ┌─────────────┐  ┌─────────────┐                            │
│  │  Pharmacy   │  │  Customer   │                            │
│  │   Role      │  │   Role      │                            │
│  └─────────────┘  └─────────────┘                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Dashboard  │  │  Drug       │  │  QR Code    │          │
│  │   Access    │  │ Creation    │  │ Generation  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Transfers  │  │   Sales     │  │  Customer   │          │
│  │   Access    │  │ Recording   │  │   Portal    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

#### **Supply Chain Flow**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Manufacturer │───▶│Distributor  │───▶│  Pharmacy   │───▶│  Customer   │
│  Creates    │    │  Transfers  │    │   Sells     │    │   Buys      │
│   Drug      │    │   Drug      │    │   Drug      │    │   Drug      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Generate   │    │  Update     │    │  Apply      │    │  Scan QR    │
│   QR Code   │    │  Location   │    │  Discount   │    │   Code      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### **Expiry Management Flow**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Check     │───▶│   Calculate │───▶│   Apply     │───▶│   Update    │
│   Expiry    │    │   Days to   │    │   Discount  │    │   Status    │
│   Date      │    │   Expiry    │    │   Price     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Display   │◀───│   Mark as   │◀───│   Check if  │◀───│   Update    │
│   Status    │    │  Expired    │    │   Expired   │    │   Drug      │
│             │    │             │    │             │    │   Record    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### **Security Architecture**
- **Authentication**: Local storage-based session management
- **Authorization**: Role-based access control (RBAC)
- **Data Integrity**: Hash verification for QR codes
- **Session Security**: Automatic session management

#### **Data Persistence**
- **Local Storage**: Client-side data persistence
- **Mock Database**: Simulated backend data storage
- **Data Synchronization**: Real-time data updates
- **Backup & Recovery**: Data persistence across sessions

#### **API Architecture**
- **Mock Services**: Simulated backend API calls
- **Data Service Layer**: Centralized data management
- **Authentication Service**: User session management
- **QR Code Service**: QR generation and verification

### **📊 System Analytics**

#### **Manufacturing Analytics**
- Drugs created per manufacturer
- QR codes generated
- Quality metrics
- Expiry patterns

#### **Distribution Analytics**
- Transfer efficiency
- Delivery times
- Inventory turnover
- Supply chain performance

#### **Sales Analytics**
- Revenue tracking
- Discount applications
- Customer patterns
- Inventory performance

#### **Quality Analytics**
- Expiry monitoring
- Quality issues
- Security verification
- System health metrics

## 🔄 **Step-by-Step Workflow Diagrams**

### **🏭 Manufacturer Workflow**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Manufacturer Workflow                       │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Login as Manufacturer                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Enter     │───▶│   Validate  │───▶│   Access    │      │
│  │ Credentials │    │ Credentials │    │ Dashboard   │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 2: Create New Drug                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Navigate  │───▶│   Fill      │───▶│   Submit    │      │
│  │   to        │    │   Form      │    │   Form      │      │
│  │Manufacturing│    │             │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 3: Generate QR Code                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Click     │───▶│   Generate  │───▶│   Display   │      │
│  │   Generate  │    │   QR Code   │    │   QR Code   │      │
│  │   QR Code   │    │             │    │   Image     │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 4: Transfer Drug                                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Navigate  │───▶│   Select    │───▶│   Confirm   │      │
│  │   to        │    │   Drug &    │    │   Transfer  │      │
│  │Distribution │    │ Distributor │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### **🚚 Distributor Workflow**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Distributor Workflow                        │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Login as Distributor                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Enter     │───▶│   Validate  │───▶│   Access    │      │
│  │ Credentials │    │ Credentials │    │ Dashboard   │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 2: Receive Drugs from Manufacturer                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   View      │───▶│   Confirm   │───▶│   Update    │      │
│  │   Pending   │    │   Receipt   │    │   Status    │      │
│  │   Transfers │    │             │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 3: Transfer to Pharmacy                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Select    │───▶│   Choose    │───▶│   Execute   │      │
│  │   Drug      │    │   Pharmacy  │    │   Transfer  │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 4: Monitor Inventory                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   View      │───▶│   Check     │───▶│   Generate  │      │
│  │   Inventory │    │   Status    │    │   Reports   │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### **🏥 Pharmacy Workflow**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Pharmacy Workflow                           │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Login as Pharmacy                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Enter     │───▶│   Validate  │───▶│   Access    │      │
│  │ Credentials │    │ Credentials │    │ Dashboard   │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 2: Record Drug Sale                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Navigate  │───▶│   Select    │───▶│   Record    │      │
│  │   to Sales  │    │   Drug &    │    │   Sale      │      │
│  │             │    │   Customer  │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 3: Apply Discounts                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Check     │───▶│   Calculate │───▶│   Apply     │      │
│  │   Expiry    │    │   Discount  │    │   Discount  │      │
│  │   Date      │    │   Price     │    │   Price     │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 4: Generate Sales Report                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   View      │───▶│   Analyze   │───▶│   Export    │      │
│  │   Sales     │    │   Data      │    │   Report    │      │
│  │   History   │    │             │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### **👤 Customer Workflow**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Customer Workflow                           │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Login as Customer                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Enter     │───▶│   Validate  │───▶│   Access    │      │
│  │ Credentials │    │ Credentials │    │ Customer    │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 2: Scan QR Code                                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Open      │───▶│   Scan QR   │───▶│   Decode    │      │
│  │   Scanner   │    │   Code      │    │   Data      │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 3: View Drug Information                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Retrieve  │───▶│   Display   │───▶│   Check     │      │
│  │   Drug      │    │   Complete  │    │   Expiry    │      │
│  │   Data      │    │   Details   │    │   Status    │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 4: Verify Authenticity                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Check     │───▶│   Verify    │───▶│   Confirm   │      │
│  │   Security  │    │   Hash      │    │   Purchase  │      │
│  │   Hash      │    │             │    │   Decision  │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### **👨‍💼 Admin Workflow**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Admin Workflow                              │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Login as Admin                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Enter     │───▶│   Validate  │───▶│   Access    │      │
│  │ Credentials │    │ Credentials │    │ Full        │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 2: Monitor System                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   View      │───▶│   Analyze   │───▶│   Identify  │      │
│  │   Dashboard │    │   Statistics │    │   Issues    │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 3: Generate QR Codes                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Select    │───▶│   Generate  │───▶│   View      │      │
│  │   Any Drug  │    │   QR Code   │    │   QR Code   │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 4: Generate Reports                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Access    │───▶│   Compile   │───▶│   Export    │      │
│  │   Analytics │    │   Data      │    │   Reports   │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### **🔍 QR Code Processing Flow**
```
┌─────────────────────────────────────────────────────────────────┐
│                    QR Code Processing                          │
├─────────────────────────────────────────────────────────────────┤
│  Input Phase                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Scan QR   │───▶│   Decode    │───▶│   Extract   │      │
│  │   Code      │    │   QR Data   │    │   Drug ID   │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Validation Phase                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Check     │───▶│   Verify    │───▶│   Validate  │      │
│  │   Security  │    │   Hash      │    │   Format    │      │
│  │   Hash      │    │             │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Retrieval Phase                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Search    │───▶│   Fetch     │───▶│   Load      │      │
│  │   Database  │    │   Drug      │    │   Complete  │      │
│  │             │    │   Data      │    │   Details   │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Display Phase                                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Calculate │───▶│   Format    │───▶│   Display   │      │
│  │   Discount  │    │   Data      │    │   Results   │      │
│  │   Price     │    │             │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### **💰 Pricing & Discount Flow**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Pricing & Discount Flow                     │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Check Expiry Date                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Get       │───▶│   Calculate │───▶│   Determine │      │
│  │   Expiry    │    │   Days to   │    │   Status    │      │
│  │   Date      │    │   Expiry    │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 2: Apply Discount Logic                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Check     │───▶│   Apply     │───▶│   Calculate │      │
│  │   Days to   │    │   Discount  │    │   Final     │      │
│  │   Expiry    │    │   Rate      │    │   Price     │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 3: Update Drug Status                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Check if  │───▶│   Mark as   │───▶│   Update    │      │
│  │   Expired   │    │   Expired   │    │   Database  │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│  Step 4: Display Results                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Show      │───▶│   Display   │───▶│   Show      │      │
│  │   Original  │    │   Discount  │    │   Final     │      │
│  │   Price     │    │   Price     │    │   Status    │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

### Environment Variables
No environment variables are required for the current implementation as it uses localStorage for data persistence.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please contact the development team.

---

**PharmaTrack India** - Revolutionizing pharmaceutical supply chain transparency in India through secure technology and comprehensive tracking solutions.
