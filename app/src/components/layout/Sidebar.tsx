'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Folder, FileText, Lock, ChevronDown, ChevronRight, Trash2, Edit2, FolderPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface Note {
  id: string
  title: string
  is_locked: boolean
  updated_at: string
  folder_id?: string
}

interface Folder {
  id: string
  name: string
}

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [notesRes, foldersRes] = await Promise.all([
        fetch('/api/notes'),
        fetch('/api/folders'),
      ])
      const notesData = await notesRes.json()
      const foldersData = await foldersRes.json()
      setNotes(notesData.notes || [])
      setFolders(foldersData.folders || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createNote = async (folderId?: string) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Note', folder_id: folderId }),
      })
      const data = await res.json()
      if (data.note) {
        setNotes(prev => [data.note, ...prev])
        router.push(`/notes/${data.note.id}`)
        if (onClose) onClose()
      }
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() }),
      })
      const data = await res.json()
      if (data.folder) {
        setFolders(prev => [...prev, data.folder])
        setNewFolderName('')
        setShowNewFolderInput(false)
      }
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }

  const renameFolder = async (id: string) => {
    if (!editFolderName.trim()) return
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editFolderName.trim() }),
      })
      const data = await res.json()
      if (data.folder) {
        setFolders(prev => prev.map(f => f.id === id ? data.folder : f))
        setEditingFolder(null)
      }
    } catch (error) {
      console.error('Failed to rename folder:', error)
    }
  }

  const deleteFolder = async (id: string) => {
    if (!confirm('Delete this folder? Notes inside will be moved to the root.')) return
    try {
      await fetch(`/api/folders/${id}`, { method: 'DELETE' })
      setFolders(prev => prev.filter(f => f.id !== id))
      setNotes(prev => prev.map(n => n.folder_id === id ? { ...n, folder_id: undefined } : n))
    } catch (error) {
      console.error('Failed to delete folder:', error)
    }
  }

  const deleteNote = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('Delete this note?')) return
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const rootNotes = filteredNotes.filter(n => !n.folder_id)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200
          overflow-y-auto z-40 flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100 md:hidden">
          <span className="text-sm font-medium text-gray-700">Menu</span>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="p-3 space-y-4">
          {/* New Note */}
          <Button className="w-full" size="sm" onClick={() => createNote()}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>

          {/* Folders Section */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Folders</span>
              <button
                title="New folder"
                onClick={() => setShowNewFolderInput(true)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <FolderPlus className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>

            {showNewFolderInput && (
              <div className="flex items-center space-x-1 mb-2">
                <Input
                  autoFocus
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="Folder name..."
                  className="h-7 text-xs"
                  onKeyDown={e => {
                    if (e.key === 'Enter') createFolder()
                    if (e.key === 'Escape') { setShowNewFolderInput(false); setNewFolderName('') }
                  }}
                />
                <Button size="sm" className="h-7 px-2 text-xs" onClick={createFolder}>Add</Button>
              </div>
            )}

            <div className="space-y-0.5">
              {folders.map(folder => {
                const folderNotes = filteredNotes.filter(n => n.folder_id === folder.id)
                const isExpanded = expandedFolders.has(folder.id)
                return (
                  <div key={folder.id}>
                    <div className="flex items-center group rounded hover:bg-gray-50">
                      <button
                        onClick={() => toggleFolder(folder.id)}
                        className="flex items-center flex-1 p-1.5 text-sm text-left"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400 mr-1" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-gray-400 mr-1" />
                        )}
                        <Folder className="h-4 w-4 text-blue-500 mr-1.5" />
                        {editingFolder === folder.id ? (
                          <input
                            autoFocus
                            value={editFolderName}
                            onChange={e => setEditFolderName(e.target.value)}
                            className="text-xs border rounded px-1 py-0.5 w-full"
                            onClick={e => e.stopPropagation()}
                            onKeyDown={e => {
                              if (e.key === 'Enter') renameFolder(folder.id)
                              if (e.key === 'Escape') setEditingFolder(null)
                            }}
                          />
                        ) : (
                          <span className="text-sm truncate">{folder.name}</span>
                        )}
                      </button>
                      <div className="hidden group-hover:flex items-center pr-1 space-x-0.5">
                        <button
                          onClick={() => { createNote(folder.id); toggleFolder(folder.id) }}
                          title="New note in folder"
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Plus className="h-3 w-3 text-gray-500" />
                        </button>
                        <button
                          onClick={() => { setEditingFolder(folder.id); setEditFolderName(folder.name) }}
                          title="Rename"
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Edit2 className="h-3 w-3 text-gray-500" />
                        </button>
                        <button
                          onClick={() => deleteFolder(folder.id)}
                          title="Delete"
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="ml-4 border-l border-gray-100 pl-2 mt-0.5 space-y-0.5">
                        {folderNotes.length === 0 ? (
                          <p className="text-xs text-gray-400 py-1 pl-1">No notes</p>
                        ) : (
                          folderNotes.map(note => (
                            <NoteItem key={note.id} note={note} onDelete={deleteNote} onNavClick={onClose} />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Root Notes */}
          <div>
            <div className="mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</span>
            </div>
            {isLoading ? (
              <div className="text-xs text-gray-400 py-1">Loading...</div>
            ) : rootNotes.length === 0 ? (
              <div className="text-xs text-gray-400 py-1">
                {searchQuery ? 'No notes match your search' : 'No notes yet. Create one!'}
              </div>
            ) : (
              <div className="space-y-0.5">
                {rootNotes.map(note => (
                  <NoteItem key={note.id} note={note} onDelete={deleteNote} onNavClick={onClose} />
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

function NoteItem({ note, onDelete, onNavClick }: {
  note: Note
  onDelete: (id: string, e: React.MouseEvent) => void
  onNavClick?: () => void
}) {
  return (
    <a
      href={`/notes/${note.id}`}
      onClick={() => onNavClick?.()}
      className="flex items-center justify-between p-1.5 rounded hover:bg-gray-100 group"
    >
      <div className="flex items-center space-x-1.5 flex-1 min-w-0">
        <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
        <span className="text-sm truncate text-gray-700">{note.title}</span>
        {note.is_locked && <Lock className="h-3 w-3 text-orange-500 flex-shrink-0" />}
      </div>
      <button
        onClick={e => onDelete(note.id, e)}
        className="hidden group-hover:block p-1 hover:bg-red-100 rounded"
        title="Delete note"
      >
        <Trash2 className="h-3 w-3 text-red-400" />
      </button>
    </a>
  )
}
