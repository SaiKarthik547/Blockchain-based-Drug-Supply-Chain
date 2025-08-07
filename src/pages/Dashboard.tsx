import { useState, useEffect } from 'react'
import { Search, Package, Truck, ShoppingCart, Activity, TrendingUp, Shield, QrCode, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import heroDarkMedical from '@/assets/hero-dark-medical.jpg'
import heroBlockchainMedical from '@/assets/hero-blockchain-medical.jpg'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { dataService, DrugData } from '@/utils/dataService'
import { useNavigate } from 'react-router-dom'
import { generateQRCode } from '@/utils/qrCode'
import { hasRole } from '@/utils/auth'


interface DashboardStats {
  totalDrugs: number
  manufactured: number
  distributed: number
  sold: number
}

const Dashboard = () => {
  const [searchBatch, setSearchBatch] = useState('')
  const [stats, setStats] = useState<DashboardStats>({
    totalDrugs: 0,
    manufactured: 0,
    distributed: 0,
    sold: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [drugs, setDrugs] = useState<DrugData[]>([])
  const [selectedQRCode, setSelectedQRCode] = useState<string>('')
  const [showQRModal, setShowQRModal] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const allDrugs = await dataService.getAllDrugs()
      setDrugs(allDrugs)
      const newStats = {
        totalDrugs: allDrugs.length,
        manufactured: allDrugs.filter(d => d.currentStatus === 'manufactured').length,
        distributed: allDrugs.filter(d => d.currentStatus === 'distributed').length,
        sold: allDrugs.filter(d => d.currentStatus === 'sold').length
      }
      setStats(newStats)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (!searchBatch.trim()) {
      toast({
        title: "Enter Batch Number",
        description: "Please enter a batch number to track",
        variant: "destructive"
      })
      return
    }
    
    // Navigate to tracking page with batch number
    navigate(`/track?batch=${encodeURIComponent(searchBatch.trim())}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleViewQRCode = async (drug: DrugData) => {
    try {
      if (!drug.qrCodeGenerated) {
        // Generate QR code if not already generated
        const result = await dataService.generateQRCode(drug.batchNumber)
        if (result.success && result.qrCodeData) {
          const qrCodeImage = await generateQRCode(drug)
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
        const qrCodeImage = await generateQRCode(drug)
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

  const statCards = [
    {
      title: "Total Drugs",
      value: stats.totalDrugs,
      description: "Registered in system",
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Manufactured",
      value: stats.manufactured,
      description: "Ready for distribution",
      icon: Activity,
      color: "text-blue-600"
    },
    {
      title: "Distributed",
      value: stats.distributed,
      description: "In distribution network",
      icon: Truck,
      color: "text-yellow-600"
    },
    {
      title: "Sold",
      value: stats.sold,
      description: "Completed transactions",
      icon: ShoppingCart,
      color: "text-green-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroDarkMedical})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-primary/20"></div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center text-foreground">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-primary">
              PharmaTrack India
              <span className="block text-3xl lg:text-5xl mt-2 text-foreground">
                Indian Pharmaceutical Supply Chain
              </span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-muted-foreground">
              Track every medicine from Indian manufacturers to patient delivery using secure technology
            </p>
            
            {/* Search Section */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter batch number (e.g., BATCH-MED001)"
                    value={searchBatch}
                    onChange={(e) => setSearchBatch(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-14 text-lg bg-card/20 backdrop-blur-sm border-primary/30 text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                <Button
                  variant="hero"
                  size="hero"
                  onClick={handleSearch}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-pharmaceutical"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Track Drug
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="shadow-pharmaceutical hover:shadow-medical transition-all duration-300 bg-gradient-card border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {isLoading ? '...' : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Indian Pharmaceutical Supply Chain</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete pharmaceutical traceability for Indian market powered by secure technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center shadow-pharmaceutical hover:shadow-medical transition-all duration-300 bg-gradient-card border-primary/20">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-gradient-medical rounded-xl flex items-center justify-center mb-4 shadow-glow">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-primary">Secure & Immutable</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-muted-foreground">
                Every transaction is recorded securely, ensuring data integrity and preventing counterfeiting
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center shadow-pharmaceutical hover:shadow-medical transition-all duration-300 bg-gradient-card border-primary/20">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-gradient-medical rounded-xl flex items-center justify-center mb-4 shadow-glow">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-primary">Full Traceability</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-muted-foreground">
                Track medicines from manufacturing to patient delivery with complete visibility at every step
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center shadow-pharmaceutical hover:shadow-medical transition-all duration-300 bg-gradient-card border-primary/20">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-gradient-medical rounded-xl flex items-center justify-center mb-4 shadow-glow">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-primary">Real-time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-muted-foreground">
                Get instant notifications and updates on drug status throughout the supply chain
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drugs List Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">All Drugs in System</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            View and manage all registered drugs with their QR codes for tracking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drugs.map((drug) => (
            <Card key={drug.batchNumber} className="shadow-pharmaceutical hover:shadow-medical transition-all duration-300 bg-gradient-card border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{drug.drugName}</CardTitle>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    drug.currentStatus === 'manufactured' ? 'bg-blue-100 text-blue-800' :
                    drug.currentStatus === 'distributed' ? 'bg-yellow-100 text-yellow-800' :
                    drug.currentStatus === 'sold' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {drug.currentStatus.toUpperCase()}
                  </div>
                </div>
                <CardDescription>
                  Batch: {drug.batchNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Manufacturer:</span>
                    <span className="font-medium">{drug.manufacturer}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Manufacturing Date:</span>
                    <span className="font-medium">
                      {drug.productionDate ? 
                        (drug.productionDate instanceof Date ? drug.productionDate.toLocaleDateString('en-IN') : new Date(drug.productionDate).toLocaleDateString('en-IN')) 
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <span className="font-medium">
                      {drug.expiryDate ? 
                        (drug.expiryDate instanceof Date ? drug.expiryDate.toLocaleDateString('en-IN') : new Date(drug.expiryDate).toLocaleDateString('en-IN')) 
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">₹{drug.price ? drug.price.toFixed(2) : 'N/A'}</span>
                  </div>
                  {drug.discountedPrice && drug.discountedPrice !== drug.price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discounted Price:</span>
                      <span className="font-medium text-green-600">₹{drug.discountedPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/track?batch=${drug.batchNumber}`)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {(hasRole('manufacturer') || hasRole('admin')) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewQRCode(drug)}
                      className="flex-1"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      View QR
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
  )
}

export default Dashboard