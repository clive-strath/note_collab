import { useState, useEffect } from 'react'
import { X, Trash2, Shield, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Permission {
  id: string
  role: string
  user_id: string
  profiles?: { name: string; email: string; avatar_url: string }
}

export function FolderShareModal({ folderId, isOpen, onClose }: { folderId: string, isOpen: boolean, onClose: () => void }) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('read')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) fetchPermissions()
  }, [isOpen, folderId])

  const fetchPermissions = async () => {
    setLoading(true)
    const res = await fetch(`/api/folders/${folderId}/permissions`)
    if (res.ok) {
      const data = await res.json()
      setPermissions(data.permissions || [])
    }
    setLoading(false)
  }

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) return

    const res = await fetch(`/api/folders/${folderId}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), role }),
    })
    
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to add user')
    } else {
      setPermissions(prev => {
        const idx = prev.findIndex(p => p.id === data.permission.id)
        if (idx !== -1) {
          const newArr = [...prev]
          newArr[idx] = data.permission
          return newArr
        }
        return [...prev, data.permission]
      })
      setEmail('')
    }
  }

  const handleRemove = async (permissionId: string) => {
    if (!confirm('Remove this user?')) return
    const res = await fetch(`/api/folders/${folderId}/permissions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissionId }),
    })
    if (res.ok) {
      setPermissions(prev => prev.filter(p => p.id !== permissionId))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-blue-500" />
            Share Folder
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <form onSubmit={handleShare} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Invite people to Folder</label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="read">Can view</option>
                  <option value="write">Can edit</option>
                  <option value="admin">Full access</option>
                </select>
                <Button type="submit" size="sm" disabled={!email.trim()}>Share</Button>
              </div>
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
          </form>
        </div>

        <div className="p-4 flex-1 overflow-y-auto max-h-64">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">People with access</h3>
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
          ) : permissions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No one else has access yet.</p>
          ) : (
            <div className="space-y-3">
              {permissions.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold uppercase">
                      {(p.profiles?.name || p.profiles?.email || 'U')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{p.profiles?.name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">{p.profiles?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-gray-500 flex items-center capitalize">
                      <Shield className="w-3 h-3 mr-1" />
                      {p.role}
                    </span>
                    <button onClick={() => handleRemove(p.id)} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors" title="Remove access">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
