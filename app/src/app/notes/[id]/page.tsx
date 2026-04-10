'use client'

import { TipTapEditor } from '@/components/editor/TipTapEditor'
import { Layout } from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Share2, Download, FileText } from 'lucide-react'
import { CommentsPanel } from '@/components/editor/CommentsPanel'
import { ShareModal } from '@/components/editor/ShareModal'
import { exportAsDocx, exportAsPdf } from '@/lib/export'

export default function NotePage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [note, setNote] = useState<any>(null)
  const [title, setTitle] = useState('Untitled Note')
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const fetchNote = async () => {
      const res = await fetch(`/api/notes/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setNote(data.note)
        setTitle(data.note.title || 'Untitled Note')
      }
    }
    fetchNote()
  }, [params.id, user])

  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle)
    await fetch(`/api/notes/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
  }

  const handleToggleLock = async () => {
    const newLockState = !note?.is_locked
    const res = await fetch(`/api/notes/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_locked: newLockState }),
    })
    if (res.ok) {
      setNote({ ...note, is_locked: newLockState })
    }
  }

  const handleExportPDF = () => {
    exportAsPdf(title, 'note-editor-container')
  }

  const handleExportDOCX = () => {
    const editorHtml = document.querySelector('.ProseMirror')?.innerHTML || ''
    exportAsDocx(title, editorHtml)
  }

  if (loading || !user) {
    return <Layout><div className="flex h-screen items-center justify-center">Loading...</div></Layout>
  }

  const isOwner = note && note.owner_id === user?.id

  return (
    <Layout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] relative flex overflow-hidden">
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-10 w-full flex-wrap gap-2">
            <input
              type="text"
              placeholder="Note Title"
              className="text-xl font-semibold bg-transparent border-none outline-none flex-1 min-w-[200px] truncate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleTitleChange(title)}
              disabled={note?.is_locked && !isOwner}
            />
            <div className="flex flex-wrap space-x-2">
              <button onClick={handleExportPDF} className="p-2 rounded-md transition-colors flex items-center shadow-sm border bg-white border-gray-200 text-gray-600 hover:bg-gray-50" title="Export as PDF">
                <Download className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">PDF</span>
              </button>
              <button onClick={handleExportDOCX} className="p-2 rounded-md transition-colors flex items-center shadow-sm border bg-white border-gray-200 text-gray-600 hover:bg-gray-50" title="Export as DOCX">
                <FileText className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">DOCX</span>
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={() => setShareOpen(true)}
                    className="p-2 rounded-md transition-colors flex items-center shadow-sm border bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    title="Share Note"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                  <button
                    onClick={handleToggleLock}
                    className={`p-2 rounded-md transition-colors flex items-center shadow-sm border ${note?.is_locked ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    title={note?.is_locked ? "Unlock Note" : "Lock Note"}
                  >
                    <span className="text-sm font-medium">{note?.is_locked ? 'Locked' : 'Lock'}</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setCommentsOpen(!commentsOpen)}
                className={`p-2 rounded-md transition-colors flex items-center shadow-sm border ${commentsOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                title="Toggle Comments"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Comments</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative overflow-auto" id="note-editor-container">
            {note?.is_locked && (
              <div className="bg-orange-100 text-orange-800 px-4 py-2 text-sm text-center font-medium sticky top-0 z-10 shadow-sm">
                This note is locked by the owner. It is currently read-only.
              </div>
            )}
            <TipTapEditor 
              noteId={params.id} 
              userId={user.id}
              userName={user.user_metadata?.name || user.email || 'Anonymous'}
              isLocked={note?.is_locked && !isOwner}
            />
          </div>
        </div>

        {/* Comments Side Panel positioned absolutely over the editor on the right side */}
        <CommentsPanel 
          noteId={params.id} 
          isOpen={commentsOpen} 
          onClose={() => setCommentsOpen(false)} 
        />
        
        {/* Share Modal */}
        <ShareModal
          noteId={params.id}
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      </div>
    </Layout>
  )
}
