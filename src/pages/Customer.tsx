import { useState } from 'react'
import { QrCode, Package, AlertTriangle, CheckCircle, XCircle, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { dataService, DrugData, Order } from '@/utils/dataService'
import { getCurrentUser } from '@/utils/auth'

const Customer = () => {
  const [scannedDrug, setScannedDrug] = useState<DrugData | null>(null)
  const [manualQRInput, setManualQRInput] = useState('')
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'scan' | 'orders'>('scan')
  const { toast } = useToast()
  const currentUser = getCurrentUser()

  const handleManualQRInput = async () => {
    if (!manualQRInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter QR code data",
        variant: "destructive"
      })
      return
    }

    try {
      const drug = await dataService.getDrugByQRCode(manualQRInput.trim())
      if (drug) {
        setScannedDrug(drug)
        toast({
          title: "Drug Information Retrieved",
          description: `Successfully found ${drug.drugName}`,
        })
      } else {
        toast({
          title: "Drug Not Found",
          description: "This drug is not registered in our system",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to retrieve drug information",
        variant: "destructive"
      })
    }
  }

  const handlePlaceOrder = async () => {
    if (!scannedDrug || !customerInfo.name || !customerInfo.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      const orderData = {
        customerId: currentUser?.id || 'cust-001',
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        pharmacyId: 'pharm-001',
        pharmacyName: 'Apollo Pharmacy',
        drugBatchNumber: scannedDrug.batchNumber,
        drugName: scannedDrug.drugName,
        quantity: orderQuantity,
        totalPrice: scannedDrug.price * orderQuantity
      }

      const success = await dataService.createOrder(orderData)
      if (success) {
        toast({
          title: "Order Placed Successfully!",
          description: "Your order has been submitted and is being processed",
        })
        setShowOrderForm(false)
        setCustomerInfo({ name: '', email: '', phone: '', address: '' })
        setOrderQuantity(1)
        loadCustomerOrders()
      } else {
        toast({
          title: "Order Failed",
          description: "Failed to place order. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Order Error",
        description: "Failed to place order",
        variant: "destructive"
      })
    }
  }

  const loadCustomerOrders = async () => {
    try {
      const orders = await dataService.getOrdersByCustomer(currentUser?.id || 'cust-001')
      setCustomerOrders(orders)
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const clearResults = () => {
    setScannedDrug(null)
    setManualQRInput('')
    setShowOrderForm(false)
  }

  const getExpiryStatus = (drug: DrugData) => {
    const now = new Date()
    const daysUntilExpiry = Math.ceil((drug.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (drug.isExpired) {
      return { status: 'expired', text: 'EXPIRED - NOT FOR SALE', color: 'text-red-600', bgColor: 'bg-red-100' }
    } else if (daysUntilExpiry <= 30) {
      return { status: 'critical', text: 'CRITICAL - Expires Soon', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    } else if (daysUntilExpiry <= 90) {
      return { status: 'warning', text: 'WARNING - Approaching Expiry', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    } else {
      return { status: 'good', text: 'GOOD - Valid', color: 'text-green-600', bgColor: 'bg-green-100' }
    }
  }

  const getOrderStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-orange-100 text-orange-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Load orders on component mount
  useState(() => {
    loadCustomerOrders()
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Customer Portal</h1>
          <p className="text-lg text-muted-foreground">
            Track drugs, place orders, and manage your pharmaceutical needs
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-8">
          <Button
            variant={activeTab === 'scan' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('scan')}
            className="flex-1"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Scan & Order
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('orders')}
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            My Orders
          </Button>
        </div>

        {activeTab === 'scan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-6 w-6" />
                  QR Code Input
                </CardTitle>
                <CardDescription>
                  Enter QR code data to get drug information and place orders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    value={manualQRInput}
                    onChange={(e) => setManualQRInput(e.target.value)}
                    placeholder="Paste QR code data here..."
                  />
                  <Button onClick={handleManualQRInput} className="w-full">
                    Check Drug Information
                  </Button>
                </div>
              </CardContent>
            </Card>

            {scannedDrug ? (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-6 w-6" />
                    Drug Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{scannedDrug.drugName}</h3>
                    <p className="text-muted-foreground">Batch: {scannedDrug.batchNumber}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Manufacturer</p>
                      <p className="font-medium">{scannedDrug.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{scannedDrug.currentStatus}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Composition</p>
                    <p className="text-sm">{scannedDrug.composition}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Manufacturing Date</p>
                      <p className="font-medium">
                        {scannedDrug.productionDate ? scannedDrug.productionDate.toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expiry Date</p>
                      <p className="font-medium">
                        {scannedDrug.expiryDate ? scannedDrug.expiryDate.toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Expiry Status</p>
                    {(() => {
                      const expiryStatus = getExpiryStatus(scannedDrug)
                      return (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${expiryStatus.bgColor}`}>
                          {expiryStatus.status === 'expired' ? (
                            <XCircle className={`h-4 w-4 ${expiryStatus.color}`} />
                          ) : expiryStatus.status === 'critical' ? (
                            <AlertTriangle className={`h-4 w-4 ${expiryStatus.color}`} />
                          ) : (
                            <CheckCircle className={`h-4 w-4 ${expiryStatus.color}`} />
                          )}
                          <span className={`text-sm font-medium ${expiryStatus.color}`}>
                            {expiryStatus.text}
                          </span>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Pricing</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Original Price:</span>
                        <span className="font-medium">₹{scannedDrug.price.toFixed(2)}</span>
                      </div>
                      {scannedDrug.discountedPrice !== undefined && scannedDrug.discountedPrice !== scannedDrug.price && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Discounted Price:</span>
                          <span className="font-medium text-green-600">
                            ₹{scannedDrug.discountedPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className={`text-sm font-medium ${
                        scannedDrug.isExpired ? 'text-red-600' : 
                        scannedDrug.discountedPrice && scannedDrug.discountedPrice < scannedDrug.price ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {scannedDrug.isExpired ? 'NOT FOR SALE - EXPIRED' : 
                         scannedDrug.discountedPrice && scannedDrug.discountedPrice < scannedDrug.price ? 
                         `${Math.round(((scannedDrug.price - scannedDrug.discountedPrice) / scannedDrug.price) * 100)}% DISCOUNT APPLIED` : 
                         'NO DISCOUNT'}
                      </div>
                    </div>
                  </div>

                  {!scannedDrug.isExpired && (
                    <Button 
                      onClick={() => setShowOrderForm(true)} 
                      className="w-full"
                      disabled={scannedDrug.isExpired}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Place Order
                    </Button>
                  )}

                  <Button onClick={clearResults} variant="outline" className="w-full">
                    Scan Another
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Enter QR code data to view drug information</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Orders</h2>
              <Button onClick={loadCustomerOrders} variant="outline">
                Refresh Orders
              </Button>
            </div>

            {customerOrders.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {customerOrders.map((order) => (
                  <Card key={order.id} className="shadow-card">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{order.drugName}</h3>
                          <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-medium">{order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Price</p>
                          <p className="font-medium">₹{order.totalPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Order Date</p>
                          <p className="font-medium">{order.orderDate ? order.orderDate.toLocaleDateString('en-IN') : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Expected Delivery</p>
                          <p className="font-medium">
                            {order.expectedDeliveryDate ? order.expectedDeliveryDate.toLocaleDateString('en-IN') : 'TBD'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Form Modal */}
        {showOrderForm && scannedDrug && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Place Order</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    placeholder="Enter delivery address"
                  />
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium">Order Summary</p>
                  <p className="text-sm text-muted-foreground">{scannedDrug.drugName}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {orderQuantity}</p>
                  <p className="text-sm font-medium">Total: ₹{(scannedDrug.price * orderQuantity).toFixed(2)}</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handlePlaceOrder} className="flex-1">
                    Place Order
                  </Button>
                  <Button onClick={() => setShowOrderForm(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Customer 