'use client'

import { Layout } from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50">Loading...</div>

  // If logged in, show the application layout dashboard
  if (user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome back, {user.user_metadata?.name || 'User'}!</h2>
          <p className="text-gray-600 mb-8">Select a note from the sidebar or create a new one to get started.</p>
        </div>
      </Layout>
    )
  }

  // If unauthenticated, the landing page is the login/registration page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}

