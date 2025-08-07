import { useState, useRef, useEffect } from 'react'
import { Camera, CameraOff, Scan, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import QrScanner from 'qr-scanner'
import { parseQRData, saveQRScanToHistory, checkCameraAccess, getAvailableCameras, type QRTrackingData } from '@/utils/qrCode'

interface QRScannerProps {
  onScanSuccess: (qrData: QRTrackingData) => void
  onScanError?: (error: string) => void
}

const QRScannerComponent = ({ onScanSuccess, onScanError }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState<boolean | null>(null)
  const [availableCameras, setAvailableCameras] = useState<QrScanner.Camera[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [lastScan, setLastScan] = useState<QRTrackingData | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    initializeCamera()
    return () => {
      stopScanning()
    }
  }, [])

  const initializeCamera = async () => {
    try {
      const cameraAvailable = await checkCameraAccess()
      setHasCamera(cameraAvailable)
      
      if (cameraAvailable) {
        const cameras = await getAvailableCameras()
        setAvailableCameras(cameras)
        if (cameras.length > 0) {
          setSelectedCamera(cameras[0].id)
        }
      }
    } catch (error) {
      console.error('Camera initialization error:', error)
      setHasCamera(false)
      setError('Failed to access camera')
    }
  }

  const startScanning = async () => {
    if (!videoRef.current || !hasCamera) return

    try {
      setError('')
      setIsScanning(true)

      const scanner = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          onDecodeError: () => {
            // Ignore decode errors - they happen continuously while scanning
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: selectedCamera || 'environment'
        }
      )

      scannerRef.current = scanner
      await scanner.start()

      toast({
        title: "Scanner Active",
        description: "Point your camera at a QR code to scan",
      })
    } catch (error) {
      console.error('Scanner start error:', error)
      setError('Failed to start camera scanner')
      setIsScanning(false)
      
      toast({
        title: "Scanner Error",
        description: "Failed to start camera scanner",
        variant: "destructive"
      })
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop()
      scannerRef.current.destroy()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleScanResult = (result: string) => {
    try {
      const qrData = parseQRData(result)
      
      if (!qrData) {
        const errorMsg = 'Invalid QR code or tampered data'
        setError(errorMsg)
        onScanError?.(errorMsg)
        
        toast({
          title: "Invalid QR Code",
          description: "QR code is not valid or data has been tampered with",
          variant: "destructive"
        })
        return
      }

      // Check if this is the same as last scan (prevent duplicate scans)
      if (lastScan?.batchNumber === qrData.batchNumber && 
          Date.now() - (lastScan.timestamp || 0) < 2000) {
        return
      }

      setLastScan(qrData)
      saveQRScanToHistory(qrData)
      onScanSuccess(qrData)
      
      toast({
        title: "QR Code Scanned",
        description: `Successfully scanned ${qrData.batchNumber}`,
      })

      // Auto-stop scanning after successful scan
      setTimeout(() => {
        stopScanning()
      }, 1000)

    } catch (error) {
      const errorMsg = 'Error processing QR code'
      console.error('QR processing error:', error)
      setError(errorMsg)
      onScanError?.(errorMsg)
    }
  }

  const switchCamera = async (cameraId: string) => {
    setSelectedCamera(cameraId)
    if (isScanning) {
      stopScanning()
      // Brief delay before restarting with new camera
      setTimeout(() => {
        startScanning()
      }, 500)
    }
  }

  if (hasCamera === null) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-pharmaceutical bg-gradient-card border-primary/20">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Checking camera access...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasCamera) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-pharmaceutical bg-gradient-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <CameraOff className="h-5 w-5" />
            Camera Not Available
          </CardTitle>
          <CardDescription>
            Camera access is required for QR code scanning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please check camera permissions and try again. Make sure your device has a camera and the browser has permission to access it.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={initializeCamera} 
            className="w-full mt-4"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Camera Access
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-pharmaceutical bg-gradient-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Scan className="h-6 w-6" />
          QR Code Scanner
        </CardTitle>
        <CardDescription>
          Scan QR codes to track drug authenticity and history
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Camera Selection */}
        {availableCameras.length > 1 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Camera</label>
            <Select value={selectedCamera} onValueChange={switchCamera}>
              <SelectTrigger className="bg-card/50 border-primary/30">
                <SelectValue placeholder="Choose camera" />
              </SelectTrigger>
              <SelectContent>
                {availableCameras.map((camera) => (
                  <SelectItem key={camera.id} value={camera.id}>
                    {camera.label || `Camera ${camera.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Scanner Controls */}
        <div className="flex gap-2">
          {!isScanning ? (
            <Button 
              onClick={startScanning}
              className="flex-1"
              variant="hero"
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          ) : (
            <Button 
              onClick={stopScanning}
              variant="outline"
              className="flex-1"
            >
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          )}
        </div>

        {/* Video Preview */}
        <div className="relative">
          <video
            ref={videoRef}
            className={`w-full max-w-md mx-auto rounded-lg border-2 ${
              isScanning ? 'border-primary' : 'border-muted'
            } ${isScanning ? 'block' : 'hidden'}`}
            style={{ maxHeight: '300px' }}
          />
          
          {!isScanning && (
            <div className="w-full max-w-md mx-auto h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
              <div className="text-center">
                <Scan className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Camera preview will appear here</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Last Scan Info */}
        {lastScan && (
          <div className="bg-muted/20 p-4 rounded-lg border border-primary/20">
            <h4 className="font-medium mb-2 text-primary">Last Scanned</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Batch:</span> {lastScan.batchNumber}</p>
              <p><span className="font-medium">Drug:</span> {lastScan.drugName}</p>
              <p><span className="font-medium">Manufacturer:</span> {lastScan.manufacturer}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
          <h4 className="font-medium mb-2">Scanning Instructions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Hold your device steady</li>
            <li>• Ensure good lighting</li>
            <li>• Point camera directly at QR code</li>
            <li>• Keep QR code within the frame</li>
            <li>• Scanner will automatically detect and process the code</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default QRScannerComponent