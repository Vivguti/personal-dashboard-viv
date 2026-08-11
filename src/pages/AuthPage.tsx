import { useState } from 'react'
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
  const { signIn, signUp, enterDemoMode } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  })

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      setError(null)
      await signIn(data.email, data.password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    }
  }

  const onSignUpSubmit = async (data: SignUpFormValues) => {
    try {
      setError(null)
      await signUp(data.email, data.password, data.displayName)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white/10 dark:bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-700 text-white font-black text-lg rounded-xl mb-3 shadow-md">
            OS
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Personal OS</h1>
          <p className="text-emerald-200 text-sm">Your life, productivity & health organized.</p>
        </div>

        <div className="flex mb-6 bg-black/20 rounded-lg p-1">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isLogin ? 'bg-emerald-700 text-white' : 'text-gray-300 hover:text-white'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isLogin ? 'bg-emerald-700 text-white' : 'text-gray-300 hover:text-white'}`}
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

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <button
            onClick={enterDemoMode}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20"
          >
            ⚡ Explore App in Live Demo Mode
          </button>
        </div>
      </div>
    </div>
  )
}
