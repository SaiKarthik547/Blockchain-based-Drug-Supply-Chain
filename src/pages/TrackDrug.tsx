import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Package, Truck, ShoppingCart, MapPin, Calendar, User, DollarSign, CheckCircle, AlertCircle, Activity, QrCode } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { dataService, DrugData, DrugEvent } from '@/utils/dataService'
import { generateQRCode } from '@/utils/qrCode'
import { hasRole } from '@/utils/auth'

const TrackDrug = () => {
  const [searchParams] = useSearchParams()
  const [batchNumber, setBatchNumber] = useState(searchParams.get('batch') || '')
  const [drugData, setDrugData] = useState<DrugData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedQRCode, setSelectedQRCode] = useState<string>('')
  const [showQRModal, setShowQRModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const batchFromUrl = searchParams.get('batch')
    if (batchFromUrl) {
      setBatchNumber(batchFromUrl)
      handleSearch(batchFromUrl)
    }
  }, [searchParams])

  const handleSearch = async (batch?: string) => {
    const searchBatch = batch || batchNumber.trim()
    
    if (!searchBatch) {
      toast({
        title: "Enter Batch Number",
        description: "Please enter a batch number to track",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    
    try {
      const data = await dataService.getDrugHistory(searchBatch)
      setDrugData(data)
      
      if (!data) {
        toast({
          title: "Drug Not Found",
          description: `No drug found with batch number: ${searchBatch}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to retrieve drug information",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'manufactured':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'distributed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'sold':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'manufactured':
        return <Package className="h-5 w-5 text-blue-600" />
      case 'transferred':
        return <Truck className="h-5 w-5 text-yellow-600" />
      case 'sold':
        return <ShoppingCart className="h-5 w-5 text-green-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  const formatEventTitle = (event: DrugEvent) => {
    switch (event.type) {
      case 'manufactured':
        return 'Drug Manufactured'
      case 'transferred':
        return `Transferred from ${event.details.fromEntity} to ${event.details.toEntity}`
      case 'sold':
        return `Sold to Patient`
      default:
        return 'Unknown Event'
    }
  }

  const handleViewQRCode = async () => {
    if (!drugData) return
    
    try {
      if (!drugData.qrCodeGenerated) {
        // Generate QR code if not already generated
        const result = await dataService.generateQRCode(drugData.batchNumber)
        if (result.success && result.qrCodeData) {
          const qrCodeImage = await generateQRCode(drugData)
          setSelectedQRCode(qrCodeImage)
          setShowQRModal(true)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to generate QR code",
            variant: "destructive"
          })
        }
      } else {
        // Use existing QR code
        const qrCodeImage = await generateQRCode(drugData)
        setSelectedQRCode(qrCodeImage)
        setShowQRModal(true)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      })
    }
  }

  const closeQRModal = () => {
    setShowQRModal(false)
    setSelectedQRCode('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-primary">Track Drug Journey</h1>
          <p className="text-lg text-muted-foreground">
            Enter a batch number to view the complete supply chain history
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 shadow-pharmaceutical bg-gradient-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Search className="h-5 w-5" />
              Drug Batch Lookup
            </CardTitle>
            <CardDescription>
              Search by batch number to track the drug's journey through the supply chain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter batch number (e.g., BATCH-MED001)"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 text-base bg-card/50 border-primary/30 focus:border-primary"
                />
              </div>
              <Button
                variant="track"
                size="lg"
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="shadow-glow"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track Drug
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Drug Information */}
        {drugData && (
          <div className="space-y-6">
            {/* Drug Details Card */}
            <Card className="shadow-pharmaceutical bg-gradient-card border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Package className="h-6 w-6" />
                    Drug Information
                  </CardTitle>
                  <Badge className={getStatusColor(drugData.currentStatus)}>
                    {drugData.currentStatus.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Batch Number</h4>
                      <p className="text-lg font-mono bg-muted px-3 py-2 rounded">{drugData.batchNumber}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Drug Name</h4>
                      <p className="text-lg">{drugData.drugName}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Manufacturer</h4>
                      <p className="text-lg">{drugData.manufacturer}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Composition</h4>
                      <p className="text-sm">{drugData.composition}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Manufacturing Date</h4>
                      <p className="text-lg">{drugData.productionDate ? drugData.productionDate.toLocaleDateString('en-IN') : 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Expiry Date</h4>
                      <p className="text-lg">{drugData.expiryDate ? drugData.expiryDate.toLocaleDateString('en-IN') : 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Price</h4>
                      <p className="text-lg">₹{drugData.price ? drugData.price.toFixed(2) : 'N/A'}</p>
                      {drugData.discountedPrice && drugData.discountedPrice !== drugData.price && (
                        <p className="text-sm text-green-600">
                          Discounted: ₹{drugData.discountedPrice.toFixed(2)}
                        </p>
                      )}
                      {drugData.isExpired && (
                        <p className="text-sm text-red-600 font-medium">NOT FOR SALE - EXPIRED</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Total Events</h4>
                      <p className="text-lg font-bold text-primary">{drugData.history.length}</p>
                    </div>
                  </div>
                </div>
                
                {/* QR Code Button */}
                {(hasRole('manufacturer') || hasRole('admin')) && (
                  <div className="mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={handleViewQRCode}
                      className="w-full"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      View QR Code for Tracking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supply Chain Timeline */}
            <Card className="shadow-pharmaceutical bg-gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Activity className="h-6 w-6" />
                  Supply Chain Timeline
                </CardTitle>
                <CardDescription>
                  Complete journey of this drug through the supply chain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {drugData.history.map((event, index) => (
                    <div key={index} className="relative">
                      {/* Timeline line */}
                      {index < drugData.history.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-20 bg-border"></div>
                      )}
                      
                      {/* Event */}
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary bg-card flex items-center justify-center shadow-glow">
                          {getEventIcon(event.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="bg-card/50 border border-primary/30 rounded-lg p-4 shadow-glow backdrop-blur-sm">
                            <h4 className="font-semibold text-lg mb-2 text-primary">{formatEventTitle(event)}</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{event.timestamp ? event.timestamp.toLocaleDateString() : 'N/A'} at {event.timestamp ? event.timestamp.toLocaleTimeString() : 'N/A'}</span>
                              </div>
                              
                              {event.details.entity && (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span>{event.details.entity}</span>
                                </div>
                              )}
                              
                              {event.details.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{event.details.location}</span>
                                </div>
                              )}
                              
                              {event.details.price && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span>₹{event.details.price.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !drugData && !isLoading && (
          <Card className="text-center shadow-card">
            <CardContent className="py-12">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Drug Not Found</h3>
              <p className="text-muted-foreground mb-6">
                No drug was found with the batch number "{batchNumber}". 
                Please check the batch number and try again.
              </p>
              <p className="text-sm text-muted-foreground">
                Try searching with: BATCH-MED001, BATCH-MED002, or BATCH-MED003
              </p>
            </CardContent>
          </Card>
        )}

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">QR Code for Tracking</h3>
                <div className="flex justify-center mb-4">
                  <img 
                    src={selectedQRCode} 
                    alt="QR Code" 
                    className="w-64 h-64 border rounded-lg"
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code to track the drug information
                </p>
                <Button onClick={closeQRModal} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackDrug