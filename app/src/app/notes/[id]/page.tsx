'use client'

import { TipTapEditor } from '@/components/editor/TipTapEditor'
import { Layout } from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Share2, Download, FileText, Lock, Unlock } from 'lucide-react'
import { CommentsPanel } from '@/components/editor/CommentsPanel'
import { ShareModal } from '@/components/editor/ShareModal'
import { exportAsDocx, exportAsPdf } from '@/lib/export'
import { Button } from '@/components/ui/button'

export default function NotePage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [note, setNote] = useState<any>(null)
  const [title, setTitle] = useState('Untitled Note')
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>('read')

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
        setUserRole(data.userRole || 'read')
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
    return <Layout><div className="flex h-screen items-center justify-center text-ink-400">Loading your paper...</div></Layout>
  }

  const isOwner = note && note.owner_id === user?.id

  return (
    <Layout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] relative flex overflow-hidden">
        <div className="flex-1 paper-card-3d flex flex-col overflow-hidden">
          {/* Toolbar - styled as wooden ruler/stationery bar */}
          <div className="stationery-bar sticky top-0 z-20 border-b border-ink-200/50">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                {/* Paper clip decoration */}
                <div className="w-8 h-8 flex-shrink-0 paper-clip" />
                
                <input
                  type="text"
                  placeholder="Note Title"
                  className="text-lg font-semibold font-caveat bg-transparent border-none outline-none flex-1 min-w-[150px] truncate text-ink-900 placeholder-ink-400"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleTitleChange(title)}
                  disabled={note?.is_locked && !isOwner}
                />
                {note?.is_locked && !isOwner && (
                  <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" title="Locked by owner" />
                )}
              </div>
              
              <div className="flex flex-wrap items-center space-x-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportPDF}
                  className="btn-ghost-paper"
                  title="Export as PDF"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs font-medium">PDF</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportDOCX}
                  className="btn-ghost-paper"
                  title="Export as DOCX"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs font-medium">DOCX</span>
                </Button>
                {isOwner && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShareOpen(true)}
                      className="btn-ghost-paper"
                      title="Share Note"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="hidden sm:inline text-xs font-medium">Share</span>
                    </Button>
                    <Button
                      variant={note?.is_locked ? "amber" : "ghost"}
                      size="sm"
                      onClick={handleToggleLock}
                      className={note?.is_locked ? "btn-amber" : "btn-ghost-paper"}
                      title={note?.is_locked ? "Unlock Note" : "Lock Note"}
                    >
                      {note?.is_locked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Unlock className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline text-xs font-medium">
                        {note?.is_locked ? 'Locked' : 'Lock'}
                      </span>
                    </Button>
                  </>
                )}
                <Button
                  variant={commentsOpen ? "ink" : "ghost"}
                  size="sm"
                  onClick={() => setCommentsOpen(!commentsOpen)}
                  className={commentsOpen ? "btn-ink" : "btn-ghost-paper"}
                  title="Toggle Comments"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs font-medium">Comments</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Locked banner */}
          {note?.is_locked && !isOwner && (
            <div className="locked-banner sticky top-16 z-10 border-b border-amber-200">
              <span className="flex items-center justify-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4" />
                This note is locked by the owner. It is currently read-only.
              </span>
            </div>
          )}

          {/* Editor Area */}
          <div className="flex-1 relative overflow-auto" id="note-editor-container">
            <TipTapEditor 
              noteId={params.id} 
              userId={user.id}
              userName={user.user_metadata?.name || user.email || 'Anonymous'}
              isLocked={note?.is_locked && !isOwner}
              userRole={userRole}
            />
          </div>
        </div>

        {/* Comments Side Panel */}
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