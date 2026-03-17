'use client'

import { TipTapEditor } from '@/components/editor/TipTapEditor'
import { Layout } from '@/components/layout/Layout'

export default function NotePage({ params }: { params: { id: string } }) {
  // TODO: Get user from auth context
  const userId = 'user-id-placeholder'
  const userName = 'User Name'

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Note Title"
              className="text-xl font-semibold bg-transparent border-none outline-none w-full"
              defaultValue="Untitled Note"
            />
          </div>
          
          <TipTapEditor 
            noteId={params.id} 
            userId={userId}
            userName={userName}
          />
        </div>
      </div>
    </Layout>
  )
}
