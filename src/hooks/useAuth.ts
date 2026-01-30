import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from '@/hooks/use-toast'

export function useAuth() {
  const navigate = useNavigate()
  const { setAuth, clearAuth } = useAuthStore()

  const login = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post('/auth/login', credentials)
      return response.data
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAuth(data.data.token, data.data.user)
        navigate('/')
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        })
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      })
    },
  })

  const register = useMutation({
    mutationFn: async (userData: { email: string; username: string; password: string }) => {
      const response = await api.post('/auth/register', userData)
      return response.data
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAuth(data.data.token, data.data.user)
        navigate('/')
        toast({
          title: 'Registration successful',
          description: 'Welcome to AI Trade Vision!',
        })
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Registration failed',
        variant: 'destructive',
      })
    },
  })

  const upgradeToVIP = useMutation({
    mutationFn: async (paymentInfo: { cardNumber: string; expiry: string; cvv: string }) => {
      const response = await api.post('/auth/upgrade-vip', paymentInfo)
      return response.data
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAuth(data.data.token, data.data.user)
        toast({
          title: '🎉 Upgraded to VIP!',
          description: 'You now have access to AI Analysis features.',
        })
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Upgrade failed',
        description: error.response?.data?.message || 'Failed to upgrade to VIP',
        variant: 'destructive',
      })
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (profileData: { username?: string; email?: string; currentPassword?: string; newPassword?: string }) => {
      const response = await api.put('/auth/profile', profileData)
      return response.data
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const currentToken = useAuthStore.getState().token
        if (currentToken) {
          setAuth(currentToken, data.data.user)
        }
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        })
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      })
    },
  })

  const logout = () => {
    clearAuth()
    navigate('/login')
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    })
  }

  return {
    login,
    register,
    logout,
    upgradeToVIP,
    updateProfile,
  }
}

