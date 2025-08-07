import { useState, useRef } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  parseCSV, 
  csvToDrugData, 
  csvToTransferData, 
  csvToSaleData,
  downloadCSVTemplate,
  type CSVImportResult 
} from '@/utils/csvUtils'
import dataService from '@/utils/dataService'

interface CSVImporterProps {
  onImportComplete?: (result: CSVImportResult) => void
}

const CSVImporter = ({ onImportComplete }: CSVImporterProps) => {
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null)
  const [activeTab, setActiveTab] = useState('drugs')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive"
      })
      return
    }

    setIsImporting(true)
    setImportProgress(0)
    setImportResult(null)

    try {
      const fileContent = await file.text()
      setImportProgress(20)

      const csvData = parseCSV(fileContent)
      setImportProgress(40)

      let result: CSVImportResult = {
        success: false,
        drugsImported: 0,
        transfersImported: 0,
        salesImported: 0,
        errors: []
      }

      switch (activeTab) {
        case 'drugs': {
          const { drugs, errors } = csvToDrugData(csvData)
          setImportProgress(60)
          
          if (drugs.length > 0) {
            const importResult = await dataService.importFromCSV(drugs)
            result = {
              ...result,
              success: importResult.success,
              drugsImported: importResult.imported,
              errors: [...errors, ...importResult.errors]
            }
          } else {
            result.errors = errors
          }
          break
        }
        
        case 'transfers': {
          const { transfers, errors } = csvToTransferData(csvData)
          setImportProgress(60)
          
          if (transfers.length > 0) {
            const importResult = await dataService.bulkTransfer(transfers)
            result = {
              ...result,
              success: importResult.success,
              transfersImported: importResult.processed,
              errors: [...errors, ...importResult.errors]
            }
          } else {
            result.errors = errors
          }
          break
        }
        
        case 'sales': {
          const { sales, errors } = csvToSaleData(csvData)
          setImportProgress(60)
          
          if (sales.length > 0) {
            const importResult = await dataService.bulkSale(sales)
            result = {
              ...result,
              success: importResult.success,
              salesImported: importResult.processed,
              errors: [...errors, ...importResult.errors]
            }
          } else {
            result.errors = errors
          }
          break
        }
      }

      setImportProgress(100)
      setImportResult(result)
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.drugsImported + result.transfersImported + result.salesImported} records`,
        })
      } else {
        toast({
          title: "Import Failed",
          description: "Some records could not be imported. Check the details below.",
          variant: "destructive"
        })
      }

      onImportComplete?.(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setImportResult({
        success: false,
        drugsImported: 0,
        transfersImported: 0,
        salesImported: 0,
        errors: [errorMessage]
      })
      
      toast({
        title: "Import Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownloadTemplate = (type: 'drugs' | 'transfers' | 'sales') => {
    downloadCSVTemplate(type)
    toast({
      title: "Template Downloaded",
      description: `${type} CSV template has been downloaded`,
    })
  }

  const tabData = [
    {
      value: 'drugs',
      label: 'Drug Data',
      description: 'Import new drug batches with manufacturing information',
      templateFields: ['batchNumber', 'drugName', 'manufacturer', 'composition', 'productionDate', 'currentStatus']
    },
    {
      value: 'transfers',
      label: 'Transfer Records',
      description: 'Import drug transfer events between entities',
      templateFields: ['batchNumber', 'fromEntity', 'toEntity', 'transferDate', 'location']
    },
    {
      value: 'sales',
      label: 'Sale Records',
      description: 'Import drug sale transactions from pharmacies',
      templateFields: ['batchNumber', 'pharmacy', 'saleDate', 'price', 'location']
    }
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-pharmaceutical bg-gradient-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Upload className="h-6 w-6" />
          CSV Data Import
        </CardTitle>
        <CardDescription>
          Upload CSV files to import drug data, transfer records, or sale transactions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            {tabData.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-4">
              <Card className="bg-muted/30 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{tab.label}</CardTitle>
                  <CardDescription>{tab.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Template Download */}
                  <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-primary/20">
                    <div>
                      <h4 className="font-medium">Download Template</h4>
                      <p className="text-sm text-muted-foreground">
                        Get the CSV template with required fields: {tab.templateFields.join(', ')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadTemplate(tab.value as any)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Template
                    </Button>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor={`file-${tab.value}`}>Upload CSV File</Label>
                    <Input
                      id={`file-${tab.value}`}
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={isImporting}
                      className="bg-card/50 border-primary/30 focus:border-primary"
                    />
                  </div>

                  {/* Import Progress */}
                  {isImporting && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Importing data...</span>
                        <span>{importProgress}%</span>
                      </div>
                      <Progress value={importProgress} className="h-2" />
                    </div>
                  )}

                  {/* Import Results */}
                  {importResult && (
                    <div className="space-y-3">
                      {importResult.success ? (
                        <Alert className="border-green-500/50 bg-green-500/10">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-700 dark:text-green-300">
                            Import completed successfully! 
                            {importResult.drugsImported > 0 && ` ${importResult.drugsImported} drugs imported.`}
                            {importResult.transfersImported > 0 && ` ${importResult.transfersImported} transfers imported.`}
                            {importResult.salesImported > 0 && ` ${importResult.salesImported} sales imported.`}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Import failed or completed with errors. Please check the details below.
                          </AlertDescription>
                        </Alert>
                      )}

                      {importResult.errors.length > 0 && (
                        <Card className="bg-destructive/10 border-destructive/20">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-destructive">Import Errors ({importResult.errors.length})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {importResult.errors.map((error, index) => (
                                <p key={index} className="text-xs text-destructive/80">
                                  {error}
                                </p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      CSV Format Instructions
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• First row must contain column headers</li>
                      <li>• Use comma (,) as field separator</li>
                      <li>• Enclose fields with commas in quotes</li>
                      <li>• Date format: YYYY-MM-DD or MM/DD/YYYY</li>
                      <li>• Download template for correct format</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default CSVImporter