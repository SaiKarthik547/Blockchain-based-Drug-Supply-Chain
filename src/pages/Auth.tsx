import { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'


interface AuthPageProps {
  onSuccess: () => void
}

const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
      </div>

      {/* Auth Form */}
      <div className="relative z-10 w-full max-w-md">
        {isLogin ? (
          <LoginForm
            onSuccess={onSuccess}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onSuccess={onSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  )
}

export default AuthPage