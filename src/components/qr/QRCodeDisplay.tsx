import { useState, useEffect } from 'react'
import { Download, Printer, QrCode, Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { DrugData } from '@/utils/dataService'
import { generateQRCode, generatePrintableQRCode, downloadQRCode, createQRTrackingData } from '@/utils/qrCode'

interface QRCodeDisplayProps {
  drug: DrugData
  size?: 'small' | 'medium' | 'large'
  showDownload?: boolean
  showDetails?: boolean
}

const QRCodeDisplay = ({ 
  drug, 
  size = 'medium', 
  showDownload = true, 
  showDetails = true 
}: QRCodeDisplayProps) => {
  const [qrCodeStandard, setQrCodeStandard] = useState<string>('')
  const [qrCodePrintable, setQrCodePrintable] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(true)
  const [error, setError] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    generateQRCodes()
  }, [drug])

  const generateQRCodes = async () => {
    try {
      setIsGenerating(true)
      setError('')
      
      const [standardQR, printableQR] = await Promise.all([
        generateQRCode(drug),
        generatePrintableQRCode(drug)
      ])
      
      setQrCodeStandard(standardQR)
      setQrCodePrintable(printableQR)
    } catch (error) {
      console.error('Error generating QR codes:', error)
      setError('Failed to generate QR codes')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async (printable: boolean = false) => {
    try {
      await downloadQRCode(drug, printable)
      toast({
        title: "QR Code Downloaded",
        description: `${printable ? 'Printable' : 'Standard'} QR code saved successfully`,
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download QR code",
        variant: "destructive"
      })
    }
  }

  const handlePrint = () => {
    if (!qrCodePrintable) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const qrData = createQRTrackingData(drug)
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Drug QR Code - ${drug.batchNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              text-align: center;
            }
            .header {
              margin-bottom: 20px;
            }
            .qr-container {
              margin: 20px 0;
            }
            .details {
              margin-top: 20px;
              text-align: left;
              max-width: 400px;
              margin-left: auto;
              margin-right: auto;
            }
            .detail-row {
              margin: 5px 0;
              padding: 5px;
              border-bottom: 1px solid #eee;
            }
            .label {
              font-weight: bold;
              display: inline-block;
              width: 150px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ChainTrackr Drug Verification</h1>
            <h2>Secure QR Code</h2>
          </div>
          
          <div class="qr-container">
            <img src="${qrCodePrintable}" alt="Drug QR Code" style="max-width: 300px; height: auto;" />
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Batch Number:</span>
              <span>${drug.batchNumber}</span>
            </div>
            <div class="detail-row">
              <span class="label">Drug Name:</span>
              <span>${drug.drugName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Manufacturer:</span>
              <span>${drug.manufacturer}</span>
            </div>
            <div class="detail-row">
              <span class="label">Production Date:</span>
                                      <span>${drug.productionDate ? drug.productionDate.toLocaleDateString() : 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Security Hash:</span>
              <span style="font-family: monospace; font-size: 12px;">${qrData.securityHash}</span>
            </div>
            <div class="detail-row">
              <span class="label">Generated:</span>
              <span>${new Date().toLocaleString()}</span>
            </div>
          </div>
          
          <div style="margin-top: 30px; font-size: 12px; color: #666;">
            <p>Scan this QR code with PharmaTrack India to verify drug authenticity</p>
            <p>This QR code contains cryptographically secured data</p>
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
  }

  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  }

  if (isGenerating) {
    return (
      <Card className="shadow-pharmaceutical bg-gradient-card border-primary/20">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <QrCode className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Generating secure QR code...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-pharmaceutical bg-gradient-card border-primary/20">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={generateQRCodes} 
            className="w-full mt-4"
            variant="outline"
          >
            Retry Generation
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-pharmaceutical bg-gradient-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Shield className="h-5 w-5" />
          Secure QR Code
        </CardTitle>
        <CardDescription>
          Cryptographically secured QR code for drug verification
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Standard</TabsTrigger>
            <TabsTrigger value="printable">Printable</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard" className="space-y-4">
            <div className="flex justify-center">
              <div className={`${sizeClasses[size]} border-2 border-primary/20 rounded-lg p-2 bg-white`}>
                <img 
                  src={qrCodeStandard} 
                  alt={`QR Code for ${drug.batchNumber}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {showDownload && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleDownload(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="printable" className="space-y-4">
            <div className="flex justify-center">
              <div className="w-80 h-80 border-2 border-primary/20 rounded-lg p-4 bg-white">
                <img 
                  src={qrCodePrintable} 
                  alt={`Printable QR Code for ${drug.batchNumber}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {showDownload && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleDownload(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  onClick={handlePrint}
                  variant="outline"
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Security Info */}
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            This QR code contains cryptographically secured data with integrity verification. 
            Any tampering will be detected during scanning.
          </AlertDescription>
        </Alert>

        {/* Drug Details */}
        {showDetails && (
          <div className="bg-muted/20 p-4 rounded-lg border border-primary/20">
            <h4 className="font-medium mb-3 text-primary">QR Code Contains</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batch Number:</span>
                <span className="font-mono">{drug.batchNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Drug Name:</span>
                <span>{drug.drugName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Manufacturer:</span>
                <span>{drug.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Production:</span>
                                        <span>{drug.productionDate ? drug.productionDate.toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Security Hash:</span>
                <span className="font-mono text-xs">{createQRTrackingData(drug).securityHash}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Usage Instructions */}
        <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
          <h4 className="font-medium mb-2">Usage Instructions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Scan with ChainTrackr app to verify authenticity</li>
            <li>• QR code contains encrypted drug information</li>
            <li>• Tampering will be automatically detected</li>
            <li>• Print for physical drug packaging labels</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default QRCodeDisplay