'use client'

import { Layout } from '@/components/layout/Layout'

export default function HomePage() {
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
