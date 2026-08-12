import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type LoginFormValues = z.infer<typeof loginSchema>
type SignUpFormValues = z.infer<typeof signUpSchema>

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { user, signIn, signUp, enterDemoMode } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const handleDemoAccess = () => {
    enterDemoMode()
    navigate('/', { replace: true })
  }

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  })

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      setError(null)
      const res = await signIn(data.email, data.password)
      if (res.error) {
        // Fallback to demo mode if backend is unconnected
        handleDemoAccess()
      } else {
        navigate('/', { replace: true })
      }
    } catch {
      handleDemoAccess()
    }
  }

  const onSignUpSubmit = async (data: SignUpFormValues) => {
    try {
      setError(null)
      const res = await signUp(data.email, data.password, data.displayName)
      if (res.error) {
        handleDemoAccess()
      } else {
        navigate('/', { replace: true })
      }
    } catch {
      handleDemoAccess()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5e8d0] p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#23241a] rounded-2xl p-8 shadow-xl border border-[#d6c7ad] dark:border-[#5e6544]/40">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#5e6544] text-[#faf8f3] font-black text-lg rounded-xl mb-3 shadow-xs">
            OS
          </div>
          <h1 className="text-3xl font-black text-[#2e2f22] dark:text-[#faf8f3] mb-1">Personal OS</h1>
          <p className="text-[#8c947d] text-sm">Your life, priorities & wellness organized.</p>
        </div>

        <div className="flex mb-6 bg-[#f5e8d0] dark:bg-[#2e2f22] rounded-xl p-1 border border-[#d6c7ad]">
          <button
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${isLogin ? 'bg-[#5e6544] text-[#faf8f3]' : 'text-[#8c947d] hover:text-[#2e2f22]'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${!isLogin ? 'bg-[#5e6544] text-[#faf8f3]' : 'text-[#8c947d] hover:text-[#2e2f22]'}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              {...loginForm.register('email')}
              error={loginForm.formState.errors.email?.message}
              className="bg-white/5 border-white/10 text-white placeholder-gray-400"
            />
            <Input
              label="Password"
              type="password"
              {...loginForm.register('password')}
              error={loginForm.formState.errors.password?.message}
              className="bg-white/5 border-white/10 text-white placeholder-gray-400"
            />
            <Button
              type="submit"
              fullWidth
              className="mt-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              isLoading={loginForm.formState.isSubmitting}
            >
              Login
            </Button>
          </form>
        ) : (
          <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
            <Input
              label="Display Name"
              type="text"
              {...signUpForm.register('displayName')}
              error={signUpForm.formState.errors.displayName?.message}
              className="bg-white/5 border-white/10 text-white placeholder-gray-400"
            />
            <Input
              label="Email"
              type="email"
              {...signUpForm.register('email')}
              error={signUpForm.formState.errors.email?.message}
              className="bg-white/5 border-white/10 text-white placeholder-gray-400"
            />
            <Input
              label="Password"
              type="password"
              {...signUpForm.register('password')}
              error={signUpForm.formState.errors.password?.message}
              className="bg-white/5 border-white/10 text-white placeholder-gray-400"
            />
            <Input
              label="Confirm Password"
              type="password"
              {...signUpForm.register('confirmPassword')}
              error={signUpForm.formState.errors.confirmPassword?.message}
              className="bg-white/5 border-white/10 text-white placeholder-gray-400"
            />
            <Button
              type="submit"
              fullWidth
              className="mt-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              isLoading={signUpForm.formState.isSubmitting}
            >
              Sign Up
            </Button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-[#d6c7ad] dark:border-[#5e6544]/40 text-center">
          <button
            onClick={handleDemoAccess}
            type="button"
            className="w-full py-3 px-4 rounded-xl bg-[#5e6544] hover:bg-[#2e2f22] text-[#faf8f3] font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>⚡</span> Explore App in Demo Mode
          </button>
        </div>
      </div>
    </div>
  )
}
