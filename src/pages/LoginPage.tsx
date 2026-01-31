import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../auth/useAuth'
import { redirectForRole } from '../auth/AuthProvider'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import Alert from '../components/Alert'
import type { ApiError } from '../types/dto'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      const role = await login(values.email, values.password)
      navigate(redirectForRole(role), { replace: true })
    } catch (err) {
      const apiError = err as { response?: { data?: ApiError } }
      setError(apiError.response?.data?.message ?? 'Login failed')
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-600">Sign in to continue.</p>
        </div>
        {error ? <Alert message={error} tone="error" /> : null}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="you@university.edu"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <p className="text-sm text-gray-600">
          No account?{' '}
          <Link to="/register" className="font-medium text-gray-900">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default LoginPage
