// CSV file processing utilities
import { DrugData, TransferData, SaleData } from './dataService'
import { v4 as uuidv4 } from 'uuid'

export interface CSVDrugData {
  batchNumber?: string
  drugName: string
  manufacturer: string
  composition: string
  productionDate: string
  currentStatus?: 'manufactured' | 'distributed' | 'sold'
}

export interface CSVTransferData {
  batchNumber: string
  fromEntity: string
  toEntity: string
  transferDate: string
  location: string
}

export interface CSVSaleData {
  batchNumber: string
  pharmacy: string
  saleDate: string
  price: string
  location: string
}

export interface CSVImportResult {
  success: boolean
  drugsImported: number
  transfersImported: number
  salesImported: number
  errors: string[]
}

// Parse CSV content
export const parseCSV = (content: string): string[][] => {
  const lines = content.trim().split('\n')
  return lines.map(line => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  })
}

// Convert CSV data to drug objects
export const csvToDrugData = (csvData: string[][]): { drugs: DrugData[], errors: string[] } => {
  const drugs: DrugData[] = []
  const errors: string[] = []
  
  if (csvData.length < 2) {
    errors.push('CSV file must contain headers and at least one data row')
    return { drugs, errors }
  }
  
  const headers = csvData[0].map(h => h.toLowerCase().trim())
  const dataRows = csvData.slice(1)
  
  // Expected headers for drug data
  const requiredHeaders = ['drugname', 'manufacturer', 'composition', 'productiondate']
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
  
  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(', ')}`)
    return { drugs, errors }
  }
  
  dataRows.forEach((row, index) => {
    try {
      const rowData: any = {}
      headers.forEach((header, i) => {
        rowData[header] = row[i]?.trim() || ''
      })
      
      // Validate required fields
      if (!rowData.drugname || !rowData.manufacturer || !rowData.productiondate) {
        errors.push(`Row ${index + 2}: Missing required fields`)
        return
      }
      
      // Parse date
      let productionDate: Date
      try {
        productionDate = new Date(rowData.productiondate)
        if (isNaN(productionDate.getTime())) {
          throw new Error('Invalid date')
        }
      } catch {
        errors.push(`Row ${index + 2}: Invalid production date format`)
        return
      }
      
      const drug: DrugData = {
        batchNumber: rowData.batchnumber || `BATCH-${uuidv4().substring(0, 8).toUpperCase()}`,
        drugName: rowData.drugname,
        manufacturer: rowData.manufacturer,
        composition: rowData.composition || 'Not specified',
        productionDate,
        currentStatus: (rowData.currentstatus as any) || 'manufactured',
        history: [{
          type: 'manufactured',
          timestamp: productionDate,
          details: {
            entity: rowData.manufacturer,
            location: rowData.location || 'Manufacturing Facility'
          }
        }]
      }
      
      drugs.push(drug)
    } catch (error) {
      errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  })
  
  return { drugs, errors }
}

// Convert CSV data to transfer objects
export const csvToTransferData = (csvData: string[][]): { transfers: TransferData[], errors: string[] } => {
  const transfers: TransferData[] = []
  const errors: string[] = []
  
  if (csvData.length < 2) {
    return { transfers, errors }
  }
  
  const headers = csvData[0].map(h => h.toLowerCase().trim())
  const dataRows = csvData.slice(1)
  
  const requiredHeaders = ['batchnumber', 'fromentity', 'toentity', 'transferdate', 'location']
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
  
  if (missingHeaders.length > 0) {
    errors.push(`Transfer data missing headers: ${missingHeaders.join(', ')}`)
    return { transfers, errors }
  }
  
  dataRows.forEach((row, index) => {
    try {
      const rowData: any = {}
      headers.forEach((header, i) => {
        rowData[header] = row[i]?.trim() || ''
      })
      
      if (!rowData.batchnumber || !rowData.fromentity || !rowData.toentity || !rowData.transferdate) {
        errors.push(`Transfer row ${index + 2}: Missing required fields`)
        return
      }
      
      let transferDate: Date
      try {
        transferDate = new Date(rowData.transferdate)
        if (isNaN(transferDate.getTime())) {
          throw new Error('Invalid date')
        }
      } catch {
        errors.push(`Transfer row ${index + 2}: Invalid transfer date format`)
        return
      }
      
      const transfer: TransferData = {
        batchNumber: rowData.batchnumber,
        fromEntity: rowData.fromentity,
        toEntity: rowData.toentity,
        transferDate,
        location: rowData.location || 'Unknown Location'
      }
      
      transfers.push(transfer)
    } catch (error) {
      errors.push(`Transfer row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  })
  
  return { transfers, errors }
}

// Convert CSV data to sale objects
export const csvToSaleData = (csvData: string[][]): { sales: SaleData[], errors: string[] } => {
  const sales: SaleData[] = []
  const errors: string[] = []
  
  if (csvData.length < 2) {
    return { sales, errors }
  }
  
  const headers = csvData[0].map(h => h.toLowerCase().trim())
  const dataRows = csvData.slice(1)
  
  const requiredHeaders = ['batchnumber', 'pharmacy', 'saledate', 'price', 'location']
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
  
  if (missingHeaders.length > 0) {
    errors.push(`Sale data missing headers: ${missingHeaders.join(', ')}`)
    return { sales, errors }
  }
  
  dataRows.forEach((row, index) => {
    try {
      const rowData: any = {}
      headers.forEach((header, i) => {
        rowData[header] = row[i]?.trim() || ''
      })
      
      if (!rowData.batchnumber || !rowData.pharmacy || !rowData.saledate || !rowData.price) {
        errors.push(`Sale row ${index + 2}: Missing required fields`)
        return
      }
      
      let saleDate: Date
      try {
        saleDate = new Date(rowData.saledate)
        if (isNaN(saleDate.getTime())) {
          throw new Error('Invalid date')
        }
      } catch {
        errors.push(`Sale row ${index + 2}: Invalid sale date format`)
        return
      }
      
      let price: number
      try {
        price = parseFloat(rowData.price.replace(/[$,]/g, ''))
        if (isNaN(price) || price < 0) {
          throw new Error('Invalid price')
        }
      } catch {
        errors.push(`Sale row ${index + 2}: Invalid price format`)
        return
      }
      
      const sale: SaleData = {
        batchNumber: rowData.batchnumber,
        pharmacy: rowData.pharmacy,
        saleDate,
        price,
        location: rowData.location || 'Unknown Location'
      }
      
      sales.push(sale)
    } catch (error) {
      errors.push(`Sale row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  })
  
  return { sales, errors }
}

// Generate sample CSV templates
export const generateDrugCSVTemplate = (): string => {
  const headers = ['batchNumber', 'drugName', 'manufacturer', 'composition', 'productionDate', 'currentStatus']
  const sampleData = [
    ['BATCH-CSV001', 'Aspirin 100mg', 'PharmaCorp Ltd.', 'Acetylsalicylic acid, Microcrystalline cellulose', '2024-01-15', 'manufactured'],
    ['BATCH-CSV002', 'Ibuprofen 200mg', 'MediTech Industries', 'Ibuprofen, Lactose monohydrate', '2024-01-20', 'manufactured']
  ]
  
  return [headers, ...sampleData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}

export const generateTransferCSVTemplate = (): string => {
  const headers = ['batchNumber', 'fromEntity', 'toEntity', 'transferDate', 'location']
  const sampleData = [
    ['BATCH-CSV001', 'PharmaCorp Ltd.', 'MedDistribution Co.', '2024-01-20', 'Distribution Center A'],
    ['BATCH-CSV002', 'MediTech Industries', 'Regional Distributors', '2024-01-22', 'Warehouse B']
  ]
  
  return [headers, ...sampleData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}

export const generateSaleCSVTemplate = (): string => {
  const headers = ['batchNumber', 'pharmacy', 'saleDate', 'price', 'location']
  const sampleData = [
    ['BATCH-CSV001', 'City Pharmacy', '2024-01-25', '12.99', 'Downtown Store'],
    ['BATCH-CSV002', 'Health Plus Pharmacy', '2024-01-27', '8.49', 'Mall Location']
  ]
  
  return [headers, ...sampleData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}

// Download CSV template
export const downloadCSVTemplate = (type: 'drugs' | 'transfers' | 'sales') => {
  let content: string
  let filename: string
  
  switch (type) {
    case 'drugs':
      content = generateDrugCSVTemplate()
      filename = 'drug_template.csv'
      break
    case 'transfers':
      content = generateTransferCSVTemplate()
      filename = 'transfer_template.csv'
      break
    case 'sales':
      content = generateSaleCSVTemplate()
      filename = 'sale_template.csv'
      break
  }
  
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}