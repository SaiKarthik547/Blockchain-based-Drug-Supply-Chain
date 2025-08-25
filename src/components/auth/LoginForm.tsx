import { useState } from 'react'
import { Eye, EyeOff, LogIn, Users, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { login, getDemoCredentials, type LoginCredentials } from '@/utils/auth'
import { blockchainLogin, isMetaMaskInstalled } from '@/utils/blockchain'

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

const LoginForm = ({ onSuccess, onSwitchToRegister }: LoginFormProps) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDemoCredentials, setShowDemoCredentials] = useState(false)
  const [authMethod, setAuthMethod] = useState<'traditional' | 'blockchain'>('traditional')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login(credentials)
      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlockchainLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await blockchainLogin()
      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Blockchain login failed')
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (username: string, password: string) => {
    setCredentials({ username, password })
    setShowDemoCredentials(false)
  }

  const demoCredentials = getDemoCredentials()

  return (
    <Card className="w-full max-w-md mx-auto shadow-pharmaceutical bg-gradient-card border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-medical rounded-xl flex items-center justify-center mb-4 shadow-glow">
          <LogIn className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl text-primary">Login to ChainTrackr</CardTitle>
        <CardDescription>
          Access your pharmaceutical supply chain dashboard
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Authentication Method Toggle */}
        <div className="flex rounded-md shadow-sm" role="group">
          <Button
            type="button"
            variant={authMethod === 'traditional' ? 'default' : 'outline'}
            className={`flex-1 rounded-r-none ${authMethod === 'traditional' ? '' : 'border-r-0'}`}
            onClick={() => setAuthMethod('traditional')}
          >
            Traditional Login
          </Button>
          <Button
            type="button"
            variant={authMethod === 'blockchain' ? 'default' : 'outline'}
            className="flex-1 rounded-l-none"
            onClick={() => setAuthMethod('blockchain')}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Blockchain Login
          </Button>
        </div>

        {authMethod === 'traditional' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
                className="bg-card/50 border-primary/30 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                  className="bg-card/50 border-primary/30 focus:border-primary pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-pharmaceutical"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-primary/20">
              <h3 className="font-medium text-primary mb-2">Blockchain Authentication</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Connect your MetaMask wallet to authenticate with the blockchain.
                Your Ethereum address will be used as your identity.
              </p>
              
              {!isMetaMaskInstalled() ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    MetaMask is not installed. Please install the MetaMask browser extension to continue.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button
                  onClick={handleBlockchainLogin}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-pharmaceutical"
                  disabled={isLoading}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>By connecting, you agree to our terms and conditions.</p>
              <p className="mt-1">Your wallet address will be used as your identity on the blockchain.</p>
            </div>
          </div>
        )}

        <Separator className="my-4" />

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowDemoCredentials(!showDemoCredentials)}
          >
            <Users className="h-4 w-4 mr-2" />
            {showDemoCredentials ? 'Hide' : 'Show'} Demo Accounts
          </Button>

          {showDemoCredentials && authMethod === 'traditional' && (
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">
                Demo accounts for testing:
              </p>
              {demoCredentials.map((cred) => (
                <Button
                  key={cred.username}
                  variant="ghost"
                  className="w-full justify-start text-sm h-auto py-2"
                  onClick={() => handleDemoLogin(cred.username, cred.password)}
                >
                  <div className="text-left">
                    <div className="font-medium">{cred.username}</div>
                    <div className="text-xs text-muted-foreground">{cred.role}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <p className="text-sm text-muted-foreground text-center">
          Don't have an account?{' '}
          <Button
            variant="link"
            className="p-0 h-auto text-primary"
            onClick={onSwitchToRegister}
          >
            Register here
          </Button>
        </p>
      </CardFooter>
    </Card>
  )
}

export default LoginForm