import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Package, Calendar, MapPin, DollarSign, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { dataService, DrugData, SaleData } from '@/utils/dataService'

interface SalesForm {
  batchNumber: string
  pharmacy: string
  saleDate: string
  price: string
  location: string
}

interface RecentSale extends SaleData {
  drugName: string
  id: string
}

const Sales = () => {
  const [formData, setSalesForm] = useState<SalesForm>({
    batchNumber: '',
    pharmacy: '',
    saleDate: new Date().toISOString().split('T')[0],
    price: '',
    location: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [drugInfo, setDrugInfo] = useState<DrugData | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [recentSales, setRecentSales] = useState<RecentSale[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadRecentSales()
  }, [])

  const loadRecentSales = async () => {
    try {
      const drugs = await dataService.getAllDrugs()
      const sales: RecentSale[] = []
      
      drugs.forEach(drug => {
        drug.history.forEach((event, index) => {
          if (event.type === 'sold') {
            sales.push({
              id: `${drug.batchNumber}-${index}`,
              batchNumber: drug.batchNumber,
              drugName: drug.drugName,
              pharmacy: event.details.entity || '',
              saleDate: event.timestamp,
              price: event.details.price || 0,
              location: event.details.location || ''
            })
          }
        })
      })
      
      // Sort by date, most recent first
      sales.sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime())
      setRecentSales(sales.slice(0, 10)) // Show last 10 sales
    } catch (error) {
      console.error('Failed to load recent sales:', error)
    }
  }

  const handleInputChange = (field: keyof SalesForm, value: string) => {
    setSalesForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const searchDrug = async () => {
    if (!formData.batchNumber.trim()) return

    setIsSearching(true)
    try {
      const drug = await dataService.getDrugHistory(formData.batchNumber)
      setDrugInfo(drug)
      
      if (!drug) {
        toast({
          title: "Drug Not Found",
          description: `No drug found with batch number: ${formData.batchNumber}`,
          variant: "destructive"
        })
      } else if (drug.currentStatus === 'sold') {
        toast({
          title: "Already Sold",
          description: "This drug has already been sold to a patient",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search for drug",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.batchNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a batch number",
        variant: "destructive"
      })
      return
    }

    if (!formData.pharmacy.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the pharmacy name",
        variant: "destructive"
      })
      return
    }

    if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive"
      })
      return
    }

    if (!formData.location.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the sale location",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const saleData: SaleData = {
        batchNumber: formData.batchNumber,
        pharmacy: formData.pharmacy,
        saleDate: new Date(formData.saleDate),
        price: parseFloat(formData.price),
        location: formData.location
      }

      const success = await dataService.sellDrug(saleData)

      if (success) {
        toast({
          title: "Sale Recorded Successfully!",
          description: `Sale of batch ${formData.batchNumber} has been recorded in system`,
        })

        // Reset form
        setSalesForm({
          batchNumber: '',
          pharmacy: '',
          saleDate: new Date().toISOString().split('T')[0],
          price: '',
          location: ''
        })
        setDrugInfo(null)
        
        // Reload recent sales
        loadRecentSales()
      } else {
        throw new Error('Failed to record sale')
      }
    } catch (error) {
      toast({
        title: "Sale Recording Failed",
        description: "Failed to record sale in system. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTotalSalesValue = () => {
    return recentSales.reduce((total, sale) => total + sale.price, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Sales Management</h1>
          <p className="text-lg text-muted-foreground">
            Record final drug sales to patients at pharmacies
          </p>
        </div>

        {/* Sales Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">{recentSales.length}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sales Value</p>
                    <p className="text-2xl font-bold">₹{getTotalSalesValue().toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                    <p className="text-2xl font-bold">
                      ₹{recentSales.length > 0 ? (getTotalSalesValue() / recentSales.length).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Form */}
          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  Record Drug Sale
                </CardTitle>
                <CardDescription>
                  Log the final sale of drugs to patients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Batch Number Search */}
                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="batchNumber"
                      value={formData.batchNumber}
                      onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                      placeholder="Enter batch number to sell"
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={searchDrug}
                      disabled={isSearching}
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>

                {/* Drug Info Display */}
                {drugInfo && (
                  <Card className={`${drugInfo.currentStatus === 'sold' ? 'bg-destructive/10' : 'bg-accent/50'}`}>
                    <CardContent className="pt-4">
                      <div className="space-y-2 text-sm">
                        <div><strong>Drug:</strong> {drugInfo.drugName}</div>
                        <div><strong>Manufacturer:</strong> {drugInfo.manufacturer}</div>
                        <div><strong>Status:</strong> 
                          <Badge 
                            className="ml-2" 
                            variant={drugInfo.currentStatus === 'sold' ? 'destructive' : 'secondary'}
                          >
                            {drugInfo.currentStatus.toUpperCase()}
                          </Badge>
                        </div>
                        {drugInfo.currentStatus === 'sold' && (
                          <p className="text-destructive font-medium">This drug has already been sold</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pharmacy */}
                <div className="space-y-2">
                  <Label htmlFor="pharmacy">Pharmacy Name</Label>
                  <Input
                    id="pharmacy"
                    value={formData.pharmacy}
                    onChange={(e) => handleInputChange('pharmacy', e.target.value)}
                    placeholder="e.g., City Pharmacy, HealthCare Drugstore"
                  />
                </div>

                {/* Sale Date */}
                <div className="space-y-2">
                  <Label htmlFor="saleDate">Sale Date</Label>
                  <Input
                    id="saleDate"
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => handleInputChange('saleDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Sale Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Sale Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Downtown Store, Main Branch"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  variant="medical"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting || (drugInfo && drugInfo.currentStatus === 'sold')}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                      Recording Sale...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Record Sale
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sales */}
          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  Recent Sales
                </CardTitle>
                <CardDescription>
                  Latest pharmaceutical sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSales.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No recent sales found
                    </p>
                  ) : (
                    recentSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{sale.drugName}</h4>
                            <p className="text-sm font-mono text-muted-foreground">
                              {sale.batchNumber}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">
                              {sale.saleDate ? sale.saleDate.toLocaleDateString() : 'N/A'}
                            </Badge>
                            <p className="text-lg font-bold text-green-600 mt-1">
                              ₹{sale.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{sale.pharmacy}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{sale.location}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sales