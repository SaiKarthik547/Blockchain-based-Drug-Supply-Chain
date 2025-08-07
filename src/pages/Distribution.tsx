import { useState, useEffect } from 'react'
import { Truck, Plus, Package, Calendar, MapPin, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { dataService, DrugData, TransferData } from '@/utils/dataService'

interface DistributionForm {
  batchNumber: string
  fromEntity: string
  toEntity: string
  transferDate: string
  location: string
}

interface RecentTransfer extends TransferData {
  drugName: string
  id: string
}

const Distribution = () => {
  const [formData, setFormData] = useState<DistributionForm>({
    batchNumber: '',
    fromEntity: '',
    toEntity: '',
    transferDate: new Date().toISOString().split('T')[0],
    location: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [drugInfo, setDrugInfo] = useState<DrugData | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [recentTransfers, setRecentTransfers] = useState<RecentTransfer[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadRecentTransfers()
  }, [])

  const loadRecentTransfers = async () => {
    try {
      const drugs = await dataService.getAllDrugs()
      const transfers: RecentTransfer[] = []
      
      drugs.forEach(drug => {
        drug.history.forEach((event, index) => {
          if (event.type === 'transferred') {
            transfers.push({
              id: `${drug.batchNumber}-${index}`,
              batchNumber: drug.batchNumber,
              drugName: drug.drugName,
              fromEntity: event.details.fromEntity || '',
              toEntity: event.details.toEntity || '',
              transferDate: event.timestamp,
              location: event.details.location || ''
            })
          }
        })
      })
      
      // Sort by date, most recent first
      transfers.sort((a, b) => b.transferDate.getTime() - a.transferDate.getTime())
      setRecentTransfers(transfers.slice(0, 10)) // Show last 10 transfers
    } catch (error) {
      console.error('Failed to load recent transfers:', error)
    }
  }

  const handleInputChange = (field: keyof DistributionForm, value: string) => {
    setFormData(prev => ({
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
      
      if (drug) {
        // Auto-fill current holder as "from" entity
        const lastEvent = drug.history[drug.history.length - 1]
        if (lastEvent.details.entity) {
          setFormData(prev => ({
            ...prev,
            fromEntity: lastEvent.details.entity || ''
          }))
        }
      } else {
        toast({
          title: "Drug Not Found",
          description: `No drug found with batch number: ${formData.batchNumber}`,
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

    if (!formData.fromEntity.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the source entity",
        variant: "destructive"
      })
      return
    }

    if (!formData.toEntity.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the destination entity",
        variant: "destructive"
      })
      return
    }

    if (!formData.location.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the transfer location",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const transferData: TransferData = {
        batchNumber: formData.batchNumber,
        fromEntity: formData.fromEntity,
        toEntity: formData.toEntity,
        transferDate: new Date(formData.transferDate),
        location: formData.location
      }

      const success = await dataService.transferDrug(transferData)

      if (success) {
        toast({
          title: "Transfer Recorded Successfully!",
          description: `Distribution of batch ${formData.batchNumber} has been recorded in system`,
        })

        // Reset form
        setFormData({
          batchNumber: '',
          fromEntity: '',
          toEntity: '',
          transferDate: new Date().toISOString().split('T')[0],
          location: ''
        })
        setDrugInfo(null)
        
        // Reload recent transfers
        loadRecentTransfers()
      } else {
        throw new Error('Failed to record transfer')
      }
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Failed to record transfer in system. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Distribution Management</h1>
          <p className="text-lg text-muted-foreground">
            Record drug transfers between entities in the supply chain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution Form */}
          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-6 w-6" />
                  Record Drug Transfer
                </CardTitle>
                <CardDescription>
                  Log the transfer of drugs between entities
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
                      placeholder="Enter batch number to transfer"
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
                  <Card className="bg-accent/50">
                    <CardContent className="pt-4">
                      <div className="space-y-2 text-sm">
                        <div><strong>Drug:</strong> {drugInfo.drugName}</div>
                        <div><strong>Manufacturer:</strong> {drugInfo.manufacturer}</div>
                        <div><strong>Status:</strong> 
                          <Badge className="ml-2" variant="secondary">
                            {drugInfo.currentStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* From Entity */}
                <div className="space-y-2">
                  <Label htmlFor="fromEntity">From Entity</Label>
                  <Input
                    id="fromEntity"
                    value={formData.fromEntity}
                    onChange={(e) => handleInputChange('fromEntity', e.target.value)}
                    placeholder="Current holder/distributor"
                  />
                </div>

                {/* To Entity */}
                <div className="space-y-2">
                  <Label htmlFor="toEntity">To Entity</Label>
                  <Input
                    id="toEntity"
                    value={formData.toEntity}
                    onChange={(e) => handleInputChange('toEntity', e.target.value)}
                    placeholder="Receiving entity/distributor"
                  />
                </div>

                {/* Transfer Date */}
                <div className="space-y-2">
                  <Label htmlFor="transferDate">Transfer Date</Label>
                  <Input
                    id="transferDate"
                    type="date"
                    value={formData.transferDate}
                    onChange={(e) => handleInputChange('transferDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Transfer Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Distribution Center A, Warehouse B"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  variant="medical"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                      Recording Transfer...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Record Transfer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transfers */}
          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  Recent Transfers
                </CardTitle>
                <CardDescription>
                  Latest distribution activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransfers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No recent transfers found
                    </p>
                  ) : (
                    recentTransfers.map((transfer) => (
                      <div
                        key={transfer.id}
                        className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{transfer.drugName}</h4>
                            <p className="text-sm font-mono text-muted-foreground">
                              {transfer.batchNumber}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {transfer.transferDate ? transfer.transferDate.toLocaleDateString() : 'N/A'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{transfer.fromEntity} → {transfer.toEntity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{transfer.location}</span>
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

export default Distribution