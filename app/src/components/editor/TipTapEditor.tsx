'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import FontFamily from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import * as Y from 'yjs'
import { useEffect, useState, useRef } from 'react'
import { liveblocksClient } from '@/lib/liveblocks-provider'
import { getYjsProviderForRoom } from '@liveblocks/yjs'

interface TipTapEditorProps {
  noteId: string
  userId: string
  userName: string
  isLocked?: boolean
  userRole?: string
}

// 1. Wrapper component that ensures provider is loaded BEFORE Editor mounts
export function TipTapEditor(props: TipTapEditorProps) {
  const [provider, setProvider] = useState<any>(null)
  const [initialHtml, setInitialHtml] = useState<string | null>(null)
  const [fetching, setFetching] = useState(true)
  
  useEffect(() => {
    if (props.noteId && props.userId) {
      const { room, leave } = liveblocksClient.enterRoom(props.noteId, { initialPresence: {} })
      const provider = getYjsProviderForRoom(room)
      setProvider(provider)
      
      // Fetch guaranteed saved HTML from PostgreSQL database
      fetch(`/api/notes/${props.noteId}/content`)
        .then(res => res.json())
        .then(data => {
          if (data?.content?.content) {
            setInitialHtml(data.content.content)
          } else {
            setInitialHtml('')
          }
        })
        .catch(e => {
          console.error('Failed to pre-fetch DB content', e)
          setInitialHtml('')
        })
        .finally(() => setFetching(false))

      return () => {
        leave()
      }
    }
  }, [props.noteId, props.userId])

  if (!provider || fetching) {
    return <div className="flex h-96 items-center justify-center text-slate-400 font-medium">Booting Secure Collaborative Environment...</div>
  }

  return <InnerEditor {...props} provider={provider} initialHtml={initialHtml || ''} />
}

// 2. Inner component that safely assumes provider is available
function InnerEditor({ noteId, userId, userName, isLocked = false, userRole = 'read', provider, initialHtml }: TipTapEditorProps & { provider: any, initialHtml: string }) {
  const isReadOnly = isLocked || userRole === 'read'

  const editor = useEditor({
    editable: !isReadOnly,
    content: initialHtml,
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Collaboration.configure({
        document: provider.getYDoc(),
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: userName,
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
        },
      }),
    ],
  })

  // Synchronize TipTap editable state with React lifecycle
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly)
    }
  }, [editor, isReadOnly])

  // Explicitly push HTML into Y.js document if it is empty on mount!
  useEffect(() => {
    if (editor && initialHtml && !editor.isDestroyed) {
      // TipTap natively blocks `content: initialHtml` when Collaboration is running.
      // So we manually inject it. If the room is empty, this seeds the Liveblocks network.
      if (editor.isEmpty || editor.getHTML() === '<p></p>') {
        editor.commands.setContent(initialHtml)
      }
    }
  }, [editor, initialHtml])

  const [isSaving, setIsSaving] = useState(false)

  const handleManualSave = async () => {
    if (!editor) return
    setIsSaving(true)
    try {
      const content = editor.getHTML()
      await fetch(`/api/notes/${noteId}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
    } catch (e) {
      console.error('Manual save failed', e)
    } finally {
      setTimeout(() => setIsSaving(false), 500)
    }
  }

  // Debounced save
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(async () => {
        try {
          const content = editor.getHTML()
          await fetch(`/api/notes/${noteId}/content`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          })
        } catch (e) {
          console.warn('Backup fetch intentionally swallowed to prevent overlay crash:', e)
        }
      }, 2000)
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [editor, noteId])

  return (
    <div className="ruled-paper-editor">
      <div className="editor-toolbar relative">
        <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-200">
          <select 
            onChange={(e) => editor?.chain().focus().setFontFamily(e.target.value).run()}
            className="px-2 py-1 bg-white border border-gray-300 rounded text-sm cursor-pointer disabled:opacity-50"
            disabled={isReadOnly}
            defaultValue="var(--font-sans), sans-serif"
          >
            <option value="var(--font-sans), sans-serif">Standard Font</option>
            <option value="var(--font-caveat), cursive">Caveat</option>
            <option value="var(--font-permanent-marker), cursive">Permanent Marker</option>
            <option value="var(--font-dancing-script), cursive">Dancing Script</option>
            <option value="var(--font-indie-flower), cursive">Indie Flower</option>
          </select>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button disabled={isReadOnly} onClick={() => editor?.chain().focus().toggleBold().run()} className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 ${editor?.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Bold</button>
          <button disabled={isReadOnly} onClick={() => editor?.chain().focus().toggleItalic().run()} className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 ${editor?.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Italic</button>
          <button disabled={isReadOnly} onClick={() => editor?.chain().focus().toggleStrike().run()} className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 ${editor?.isActive('strike') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Strike</button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button disabled={isReadOnly} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 ${editor?.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>H1</button>
          <button disabled={isReadOnly} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 ${editor?.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>H2</button>
          <button disabled={isReadOnly} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 ${editor?.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>H3</button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button disabled={isReadOnly} onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 ${editor?.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Bullet</button>
          <button disabled={isReadOnly} onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 ${editor?.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Number</button>
          <button disabled={isReadOnly} onClick={() => editor?.chain().focus().setHorizontalRule().run()} className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 bg-gray-100 hover:bg-gray-200`}>Rule</button>
          
          {isReadOnly ? (
             <div className="ml-auto flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
               <span className="font-semibold">Read Only</span>
             </div>
          ) : (
             <button 
               onClick={handleManualSave}
               disabled={isSaving}
               className={`ml-auto px-4 py-1 text-sm font-bold rounded ${isSaving ? 'bg-gray-400 text-gray-700' : 'bg-green-500 text-white hover:bg-green-600'} transition-all shadow`}
               title="Force manual save to database"
             >
               {isSaving ? 'Saving...' : 'Save'}
             </button>
          )}
        </div>
      </div>
      
      <div className="editor-container overflow-hidden rounded-b-xl border-x border-b border-gray-200">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none focus:outline-none"
          style={{
            backgroundColor: '#FFFEF7',
            backgroundImage: `
              linear-gradient(90deg, transparent 79px, rgba(231, 76, 60, 0.4) 79px, rgba(231, 76, 60, 0.4) 81px, transparent 81px),
              linear-gradient(transparent 23px, #ADD8E6 23px, #ADD8E6 24px)
            `,
            backgroundSize: '100% 100%, 100% 24px',
            backgroundPosition: '0 0, 0 4px',
            paddingLeft: '100px',
            paddingRight: '60px',
            paddingTop: '4px',
            paddingBottom: '24px',
            minHeight: '600px',
          }}
        />
      </div>
    </div>
  )
}
