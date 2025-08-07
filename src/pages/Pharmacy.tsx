import { useState, useEffect } from 'react'
import { Package, Search, Plus, Edit, Eye, AlertTriangle, TrendingUp, Users, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { dataService, Inventory, Order } from '@/utils/dataService'
import { getCurrentUser } from '@/utils/auth'

const Pharmacy = () => {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory')
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [newPrice, setNewPrice] = useState('')
  const { toast } = useToast()
  const currentUser = getCurrentUser()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [inventoryData, ordersData] = await Promise.all([
        dataService.getInventory('pharmacy'),
        dataService.getOrdersByPharmacy(currentUser?.id || 'pharm-001')
      ])
      setInventory(inventoryData)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadData()
      return
    }

    try {
      const searchResults = await dataService.searchInventory(searchTerm)
      setInventory(searchResults.filter(item => item.location === 'pharmacy'))
    } catch (error) {
      console.error('Error searching inventory:', error)
    }
  }

  const handleUpdatePrice = async () => {
    if (!selectedItem || !newPrice) return

    try {
      const success = await dataService.updateInventory(selectedItem.id, {
        unitPrice: parseFloat(newPrice)
      })

      if (success) {
        toast({
          title: "Price Updated",
          description: "Drug price has been updated successfully",
        })
        setShowPriceModal(false)
        setNewPrice('')
        setSelectedItem(null)
        loadData()
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update price",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update price",
        variant: "destructive"
      })
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const success = await dataService.updateOrderStatus(orderId, status)
      if (success) {
        toast({
          title: "Status Updated",
          description: "Order status has been updated",
        })
        loadData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      })
    }
  }

  const getExpiryStatus = (item: Inventory) => {
    const now = new Date()
    const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (item.isExpired) {
      return { status: 'expired', text: 'EXPIRED', color: 'text-red-600', bgColor: 'bg-red-100' }
    } else if (daysUntilExpiry <= 30) {
      return { status: 'critical', text: 'EXPIRES SOON', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    } else if (daysUntilExpiry <= 90) {
      return { status: 'warning', text: 'APPROACHING EXPIRY', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    } else {
      return { status: 'good', text: 'VALID', color: 'text-green-600', bgColor: 'bg-green-100' }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Pharmacy Management</h1>
          <p className="text-lg text-muted-foreground">
            Manage inventory, process orders, and set dynamic pricing
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-8">
          <Button
            variant={activeTab === 'inventory' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('inventory')}
            className="flex-1"
          >
            <Package className="h-4 w-4 mr-2" />
            Inventory
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('orders')}
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Orders
          </Button>
        </div>

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Inventory Management</h2>
              <Button onClick={loadData} variant="outline">
                Refresh
              </Button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
              <Input
                placeholder="Search drugs by name or batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventory.map((item) => {
                const expiryStatus = getExpiryStatus(item)
                return (
                  <Card key={item.id} className="shadow-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{item.drugName}</CardTitle>
                          <CardDescription>Batch: {item.drugBatchNumber}</CardDescription>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${expiryStatus.bgColor}`}>
                          <span className={expiryStatus.color}>{expiryStatus.text}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Available</p>
                          <p className="font-medium">{item.availableQuantity}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reserved</p>
                          <p className="font-medium">{item.reservedQuantity}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium">₹{item.unitPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expiry</p>
                          <p className="font-medium">{item.expiryDate ? item.expiryDate.toLocaleDateString('en-IN') : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item)
                            setNewPrice(item.unitPrice.toString())
                            setShowPriceModal(true)
                          }}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Update Price
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {inventory.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No inventory items found</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order Management</h2>
              <Button onClick={loadData} variant="outline">
                Refresh Orders
              </Button>
            </div>

            {orders.length === 0 ? (
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
                {orders.map((order) => (
                  <Card key={order.id} className="shadow-card">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{order.drugName}</h3>
                          <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">Customer: {order.customerName}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                            >
                              Confirm Order
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                            >
                              Cancel Order
                            </Button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                          >
                            Start Processing
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                          >
                            Mark Shipped
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price Update Modal */}
        {showPriceModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Update Price</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="drugName">Drug Name</Label>
                  <Input
                    id="drugName"
                    value={selectedItem.drugName}
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="currentPrice">Current Price</Label>
                  <Input
                    id="currentPrice"
                    value={`₹${selectedItem.unitPrice.toFixed(2)}`}
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="newPrice">New Price (₹)</Label>
                  <Input
                    id="newPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Enter new price"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdatePrice} className="flex-1">
                    Update Price
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowPriceModal(false)
                      setSelectedItem(null)
                      setNewPrice('')
                    }} 
                    variant="outline" 
                    className="flex-1"
                  >
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

export default Pharmacy 