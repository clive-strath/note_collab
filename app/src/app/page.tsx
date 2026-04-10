'use client'

import { Layout } from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // User is logged in, but we don't have a /notes dashboard yet except the sidebar,
      // wait, they can just stay on / or we can keep them where they are so they see the sidebar and "New Note".
      // Actually, if we leave them on the home page, the sidebar is visible to logged-in users.
      // Let's just leave them on / unless there's a dedicated /notes page.
      // But the sidebar is in Layout. They can just click New Note.
      // Wait, let's keep the home page as a dashboard if logged in.
    }
  }, [user, loading, router])

  if (loading) return <Layout><div className="flex justify-center items-center h-64">Loading...</div></Layout>

  // If logged in, maybe show a dashboard prompt?
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Collaborative Notes
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Real-time collaborative note-taking with a beautiful ruled paper interface
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Real-time Collaboration</h3>
              <p className="text-gray-600">
                Edit notes together with your team in real-time with conflict-free synchronization
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Ruled Paper Interface</h3>
              <p className="text-gray-600">
                Familiar note-taking experience with blue lines and red margin
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Row-level security ensures your notes are only accessible to authorized users
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
