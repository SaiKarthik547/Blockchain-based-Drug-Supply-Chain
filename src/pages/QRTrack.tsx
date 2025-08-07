import { useState, useEffect } from 'react'
import { QrCode, History, Shield, Camera, AlertTriangle, CheckCircle, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import QRScannerComponent from '@/components/qr/QRScanner'
import QRCodeDisplay from '@/components/qr/QRCodeDisplay'
import { dataService, DrugData, DrugEvent } from '@/utils/dataService'
import { type QRTrackingData, getQRScanHistory, clearQRScanHistory } from '@/utils/qrCode'
import { getCurrentUser } from '@/utils/auth'

interface ScanHistoryItem extends QRTrackingData {
  scannedAt: string
  scanId: string
}

const QRTrack = () => {
  const [scannedDrug, setScannedDrug] = useState<DrugData | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([])
  const [isLoadingDrug, setIsLoadingDrug] = useState(false)
  const [activeTab, setActiveTab] = useState('scanner')
  const [error, setError] = useState<string>('')
  const { toast } = useToast()
  const user = getCurrentUser()

  useEffect(() => {
    loadScanHistory()
  }, [])

  const loadScanHistory = () => {
    const history = getQRScanHistory()
    setScanHistory(history)
  }

  const handleScanSuccess = async (qrData: QRTrackingData) => {
    setIsLoadingDrug(true)
    setError('')
    
    try {
      // Fetch full drug data from data service
      const drugData = await dataService.getDrugHistory(qrData.batchNumber)
      
      if (!drugData) {
        setError(`Drug with batch number ${qrData.batchNumber} not found in system`)
        toast({
          title: "Drug Not Found",
          description: `Batch ${qrData.batchNumber} is not registered in the system`,
          variant: "destructive"
        })
        return
      }

      setScannedDrug(drugData)
      loadScanHistory() // Refresh history after new scan
      setActiveTab('results')
      
      toast({
        title: "Drug Verified",
        description: `Successfully verified ${drugData.drugName}`,
      })
    } catch (error) {
      console.error('Error fetching drug data:', error)
      setError('Failed to verify drug information')
      toast({
        title: "Verification Failed",
        description: "Could not verify drug information",
        variant: "destructive"
      })
    } finally {
      setIsLoadingDrug(false)
    }
  }

  const handleScanError = (error: string) => {
    setError(error)
    toast({
      title: "Scan Error",
      description: error,
      variant: "destructive"
    })
  }

  const clearHistory = () => {
    clearQRScanHistory()
    setScanHistory([])
    toast({
      title: "History Cleared",
      description: "Scan history has been cleared",
    })
  }

  const viewHistoryItem = async (item: ScanHistoryItem) => {
    setIsLoadingDrug(true)
    try {
      const drugData = await dataService.getDrugHistory(item.batchNumber)
      if (drugData) {
        setScannedDrug(drugData)
        setActiveTab('results')
      }
    } catch (error) {
      console.error('Error loading drug from history:', error)
    } finally {
      setIsLoadingDrug(false)
    }
  }

  const getStatusBadge = (status: DrugData['currentStatus']) => {
    const variants = {
      manufactured: { variant: 'secondary' as const, text: 'Manufactured' },
      distributed: { variant: 'outline' as const, text: 'In Distribution' },
      sold: { variant: 'default' as const, text: 'Sold' }
    }
    
    const config = variants[status]
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const formatEventType = (type: DrugEvent['type']) => {
    const types = {
      manufactured: { icon: '🏭', text: 'Manufactured' },
      transferred: { icon: '🚛', text: 'Transferred' },
      sold: { icon: '🏪', text: 'Sold' }
    }
    return types[type]
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-primary">
          QR Code Drug Tracking
        </h1>
        <p className="text-xl text-muted-foreground">
          Scan QR codes to verify drug authenticity and track supply chain
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Scanner
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History ({scanHistory.length})
          </TabsTrigger>
        </TabsList>

        {/* Scanner Tab */}
        <TabsContent value="scanner" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <QRScannerComponent 
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
              />
            </div>
            
            <div className="space-y-4">
              {/* Quick Stats */}
              <Card className="shadow-pharmaceutical bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <QrCode className="h-5 w-5" />
                    QR Tracking Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{scanHistory.length}</div>
                      <div className="text-sm text-muted-foreground">Total Scans</div>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {new Set(scanHistory.map(item => item.batchNumber)).size}
                      </div>
                      <div className="text-sm text-muted-foreground">Unique Drugs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Scans */}
              <Card className="shadow-pharmaceutical bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle>Recent Scans</CardTitle>
                </CardHeader>
                <CardContent>
                  {scanHistory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No scans yet. Start by scanning a QR code.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {scanHistory.slice(0, 3).map((item) => (
                        <div 
                          key={item.scanId}
                          className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-primary/10"
                        >
                          <div>
                            <div className="font-medium">{item.batchNumber}</div>
                            <div className="text-sm text-muted-foreground">{item.drugName}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewHistoryItem(item)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {isLoadingDrug ? (
            <Card className="shadow-pharmaceutical bg-gradient-card border-primary/20">
              <CardContent className="flex items-center justify-center p-12">
                <div className="text-center">
                  <Shield className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Verifying drug information...</p>
                </div>
              </CardContent>
            </Card>
          ) : scannedDrug ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Drug Information */}
              <div className="space-y-6">
                <Card className="shadow-pharmaceutical bg-gradient-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-primary">
                        <CheckCircle className="h-5 w-5" />
                        Drug Verified
                      </span>
                      {getStatusBadge(scannedDrug.currentStatus)}
                    </CardTitle>
                    <CardDescription>
                      QR code verification successful - drug is authentic
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Batch Number:</span>
                        <span className="font-mono font-medium">{scannedDrug.batchNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Drug Name:</span>
                        <span className="font-medium">{scannedDrug.drugName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Manufacturer:</span>
                        <span>{scannedDrug.manufacturer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Composition:</span>
                        <span>{scannedDrug.composition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Production Date:</span>
                        <span>{scannedDrug.productionDate ? scannedDrug.productionDate.toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Supply Chain Timeline */}
                <Card className="shadow-pharmaceutical bg-gradient-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-primary">Supply Chain Timeline</CardTitle>
                    <CardDescription>
                      Complete journey from manufacturing to current status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scannedDrug.history.map((event, index) => {
                        const eventInfo = formatEventType(event.type)
                        return (
                          <div key={index} className="flex items-start gap-4">
                            <div className="text-2xl">{eventInfo.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{eventInfo.text}</span>
                                <span className="text-sm text-muted-foreground">
                                  {event.timestamp ? event.timestamp.toLocaleDateString() : 'N/A'}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {event.details.entity && (
                                  <span>Entity: {event.details.entity}</span>
                                )}
                                {event.details.location && (
                                  <span className="ml-4">Location: {event.details.location}</span>
                                )}
                                {event.details.price && (
                                  <span className="ml-4">Price: ₹{event.details.price}</span>
                                )}
                                {event.details.fromEntity && event.details.toEntity && (
                                  <span>From: {event.details.fromEntity} → To: {event.details.toEntity}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* QR Code Display */}
              <div>
                <QRCodeDisplay 
                  drug={scannedDrug}
                  size="medium"
                  showDownload={true}
                  showDetails={true}
                />
              </div>
            </div>
          ) : (
            <Card className="shadow-pharmaceutical bg-gradient-card border-primary/20">
              <CardContent className="flex items-center justify-center p-12">
                <div className="text-center">
                  <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Scan a QR code to view drug information</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="shadow-pharmaceutical bg-gradient-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <History className="h-5 w-5" />
                  Scan History
                </CardTitle>
                <CardDescription>
                  All previously scanned QR codes
                </CardDescription>
              </div>
              {scanHistory.length > 0 && (
                <Button variant="outline" onClick={clearHistory}>
                  Clear History
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {scanHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No scan history yet</p>
                  <p className="text-sm text-muted-foreground">Scanned QR codes will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scanHistory.map((item) => (
                    <div 
                      key={item.scanId}
                      className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-primary/10 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.batchNumber}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.scannedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>{item.drugName}</span>
                          <span className="mx-2">•</span>
                          <span>{item.manufacturer}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewHistoryItem(item)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default QRTrack