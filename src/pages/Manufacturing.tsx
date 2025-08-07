import { useState } from 'react'
import { Package, Plus, CheckCircle, AlertCircle, QrCode } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { dataService, generateBatchNumber } from '@/utils/dataService'
import { generateQRCode } from '@/utils/qrCode'

interface ManufacturingForm {
  batchNumber: string
  drugName: string
  manufacturer: string
  composition: string
  productionDate: string
  expiryDate: string
  price: string
}

const Manufacturing = () => {
  const [formData, setFormData] = useState<ManufacturingForm>({
    batchNumber: generateBatchNumber(),
    drugName: '',
    manufacturer: '',
    composition: '',
    productionDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 years from now
    price: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const { toast } = useToast()

  const handleInputChange = (field: keyof ManufacturingForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateNewBatchNumber = () => {
    setFormData(prev => ({
      ...prev,
      batchNumber: generateBatchNumber()
    }))
  }

  const handleGenerateQRCode = async () => {
    if (!formData.batchNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a batch number first",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingQR(true)
    try {
      const result = await dataService.generateQRCode(formData.batchNumber)
      
      if (result.success && result.qrCodeData) {
        // Generate QR code image
        const drug = await dataService.getDrugHistory(formData.batchNumber)
        if (drug) {
          const qrCodeImage = await generateQRCode(drug)
          setQrCodeData(qrCodeImage)
          toast({
            title: "QR Code Generated Successfully!",
            description: "QR code has been created for this batch",
          })
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate QR code",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.drugName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a drug name",
        variant: "destructive"
      })
      return
    }

    if (!formData.manufacturer.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter manufacturer information",
        variant: "destructive"
      })
      return
    }

    if (!formData.composition.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter drug composition",
        variant: "destructive"
      })
      return
    }

    if (!formData.expiryDate) {
      toast({
        title: "Validation Error",
        description: "Please enter expiry date",
        variant: "destructive"
      })
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const success = await dataService.createDrug({
        batchNumber: formData.batchNumber,
        drugName: formData.drugName,
        manufacturer: formData.manufacturer,
        composition: formData.composition,
        productionDate: new Date(formData.productionDate),
        expiryDate: new Date(formData.expiryDate),
        price: parseFloat(formData.price)
      })

      if (success) {
        toast({
          title: "Drug Registered Successfully!",
          description: `Batch ${formData.batchNumber} has been recorded in the system`,
        })

        // Reset form with new batch number
        setFormData({
          batchNumber: generateBatchNumber(),
          drugName: '',
          manufacturer: '',
          composition: '',
          productionDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: ''
        })
      } else {
        throw new Error('Failed to register drug')
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register drug in system. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Manufacturing Registration</h1>
          <p className="text-lg text-muted-foreground">
            Register new pharmaceutical products in the system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  Drug Registration Form
                </CardTitle>
                <CardDescription>
                  Enter drug information to create a new batch record in the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Batch Number */}
                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="batchNumber"
                      value={formData.batchNumber}
                      onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                      className="font-mono"
                      placeholder="BATCH-XXXXXXXX"
                    />
                    <Button
                      variant="outline"
                      onClick={generateNewBatchNumber}
                      className="whitespace-nowrap"
                    >
                      Generate New
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Unique identifier for this drug batch
                  </p>
                </div>

                {/* Drug Name */}
                <div className="space-y-2">
                  <Label htmlFor="drugName">Drug Name</Label>
                  <Input
                    id="drugName"
                    value={formData.drugName}
                    onChange={(e) => handleInputChange('drugName', e.target.value)}
                    placeholder="e.g., Aspirin 100mg"
                  />
                </div>

                {/* Manufacturer */}
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder="e.g., PharmaCorp Ltd."
                  />
                </div>

                {/* Composition */}
                <div className="space-y-2">
                  <Label htmlFor="composition">Drug Composition</Label>
                  <Textarea
                    id="composition"
                    value={formData.composition}
                    onChange={(e) => handleInputChange('composition', e.target.value)}
                    placeholder="e.g., Acetylsalicylic acid, Microcrystalline cellulose, Magnesium stearate"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    List all active and inactive ingredients
                  </p>
                </div>

                {/* Production Date */}
                <div className="space-y-2">
                  <Label htmlFor="productionDate">Production Date</Label>
                  <Input
                    id="productionDate"
                    type="date"
                    value={formData.productionDate}
                    onChange={(e) => handleInputChange('productionDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-muted-foreground">
                    Date when the drug expires
                  </p>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-sm text-muted-foreground">
                    Price in Indian Rupees
                  </p>
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
                      Registering...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Register Drug
                    </>
                  )}
                </Button>

                {/* QR Code Generation Button */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGenerateQRCode}
                  disabled={isGeneratingQR || !formData.batchNumber.trim()}
                  className="w-full"
                >
                  {isGeneratingQR ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                      Generating QR Code...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-5 w-5 mr-2" />
                      Generate QR Code
                    </>
                  )}
                </Button>

                {/* QR Code Display */}
                {qrCodeData && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-semibold text-center">Generated QR Code</h4>
                    <div className="flex justify-center">
                      <img 
                        src={qrCodeData} 
                        alt="QR Code" 
                        className="w-48 h-48 border rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      Scan this QR code to track the drug information
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            {/* System Info */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  System Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Immutable record creation</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Cryptographic verification</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Transparent audit trail</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Anti-counterfeiting protection</span>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Info */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Compliance Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Ensure all drug information complies with local pharmaceutical regulations.
                </p>
                <p>
                  Batch numbers must be unique across all manufacturing facilities.
                </p>
                <p>
                  Production dates cannot be in the future and must be accurate.
                </p>
                <p>
                  All ingredient information must be complete and verified.
                </p>
              </CardContent>
            </Card>

            {/* Sample Data */}
            <Card className="shadow-card bg-accent/50">
              <CardHeader>
                <CardTitle className="text-lg">Sample Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Drug:</strong> Paracetamol 500mg
                </div>
                <div>
                  <strong>Manufacturer:</strong> Cipla Ltd.
                </div>
                <div>
                  <strong>Composition:</strong> Paracetamol, Starch, Magnesium stearate
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Manufacturing