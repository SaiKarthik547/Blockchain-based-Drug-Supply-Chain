import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Activity, Shield, Package, Truck, ShoppingCart, Info, QrCode, User, LogOut, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { hasRole } from '@/utils/auth'

interface NavigationProps {
  onLogout: () => void
  currentUser: any
}

const Navigation = ({ onLogout, currentUser }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Activity },
    { name: 'Track Drug', href: '/track', icon: Shield },
    { name: 'QR Tracking', href: '/qr-track', icon: QrCode },
    { name: 'Manufacturing', href: '/manufacturing', icon: Package, role: ['admin', 'manufacturer'] },
    { name: 'Distribution', href: '/distribution', icon: Truck, role: ['admin', 'manufacturer', 'distributor'] },
    { name: 'Pharmacy', href: '/pharmacy', icon: ShoppingCart, role: ['admin', 'pharmacy'] },
    { name: 'Sales', href: '/sales', icon: ShoppingCart, role: ['admin', 'pharmacy'] },
    { name: 'Customer', href: '/customer', icon: User, role: ['admin', 'customer'] },
    { name: 'About', href: '/about', icon: Info }
  ]

  const isActivePath = (href: string) => location.pathname === href

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-primary/20 shadow-pharmaceutical">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-medical rounded-lg shadow-glow">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-primary">
              ChainTrackr
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* User Info */}
            {currentUser && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                {currentUser.isBlockchainUser ? (
                  <Wallet className="h-3 w-3" />
                ) : (
                  <User className="h-3 w-3" />
                )}
                <span>{currentUser.name} ({currentUser.role})</span>
                {currentUser.isBlockchainUser && (
                  <span className="bg-green-500 text-white text-xs px-1 rounded">Blockchain</span>
                )}
              </div>
            )}
            {navigationItems.map((item) => {
              const Icon = item.icon
              // Check if user has permission to see this item
              if (item.role && !item.role.some(role => currentUser?.role === role || currentUser?.role === 'admin')) {
                return null
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-medical",
                    isActivePath(item.href)
                      ? "bg-gradient-medical text-primary shadow-glow"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            
            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-medical text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden absolute left-0 right-0 top-16 bg-card/95 backdrop-blur-sm border-b border-primary/20 shadow-pharmaceutical">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile User Info */}
              {currentUser && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-muted/50 rounded-lg text-sm text-muted-foreground mb-2">
                  {currentUser.isBlockchainUser ? (
                    <Wallet className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span>{currentUser.name} ({currentUser.role})</span>
                  {currentUser.isBlockchainUser && (
                    <span className="bg-green-500 text-white text-xs px-1 rounded">Blockchain</span>
                  )}
                </div>
              )}
              {navigationItems.map((item) => {
                const Icon = item.icon
                // Check if user has permission to see this item
                if (item.role && !item.role.some(role => currentUser?.role === role || currentUser?.role === 'admin')) {
                  return null
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-medical",
                      isActivePath(item.href)
                        ? "bg-gradient-medical text-primary shadow-glow"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Mobile Logout Button */}
              <Button
                variant="ghost"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-medical text-red-600 hover:text-red-700 hover:bg-red-50 w-full justify-start"
                onClick={() => {
                  setIsOpen(false)
                  onLogout()
                }}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation