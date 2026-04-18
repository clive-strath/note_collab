import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { X, Trash2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Comment {
  id: string
  content: string
  created_at: string
  author_id: string
  profiles?: { name: string; avatar_url: string }
}

export function CommentsPanel({ noteId, isOpen, onClose }: { noteId: string, isOpen: boolean, onClose: () => void }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchComments()
    }
  }, [isOpen, noteId])

  const fetchComments = async () => {
    setLoading(true)
    const res = await fetch(`/api/notes/${noteId}/comments`)
    if (res.ok) {
      const data = await res.json()
      setComments(data.comments || [])
    }
    setLoading(false)
  }

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    const res = await fetch(`/api/notes/${noteId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment, anchor_type: 'paragraph' }),
    })

    if (res.ok) {
      const data = await res.json()
      setComments([...comments, data.comment])
      setNewComment('')
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return
    const res = await fetch(`/api/notes/${noteId}/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(comments.filter(c => c.id !== commentId))
    }
  }

  if (!isOpen) return null

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col h-full absolute right-0 top-0 z-10 shadow-lg transition-transform">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-700">Comments</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500 text-center">Loading...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">No comments yet.</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold uppercase">
                    {(c.profiles?.name || 'A')[0]}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-700">{c.profiles?.name || 'Anonymous'}</span>
                    <span className="text-[10px] text-gray-400 block">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {user?.id === c.author_id && (
                  <button onClick={() => deleteComment(c.id)} className="text-gray-400 hover:text-red-500 p-1">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 break-words">{c.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white shadow-inner">
        <form onSubmit={postComment} className="flex flex-col space-y-2">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full text-sm border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-20"
          />
          <Button type="submit" disabled={!newComment.trim()} size="sm" className="self-end">
            <Send className="h-3 w-3 mr-1" />
            Post
          </Button>
        </form>
      </div>
    </div>
  )
}
