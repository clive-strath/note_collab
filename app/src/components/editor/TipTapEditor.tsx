'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { useEffect, useState, useRef } from 'react'
import { liveblocksClient } from '@/lib/liveblocks-provider'
import { getYjsProviderForRoom } from '@liveblocks/yjs'

interface TipTapEditorProps {
  noteId: string
  userId: string
  userName: string
  isLocked?: boolean
}

export function TipTapEditor({ noteId, userId, userName, isLocked = false }: TipTapEditorProps) {
  const [provider, setProvider] = useState<any>(null)
  
  const editor = useEditor({
    editable: !isLocked,
    extensions: [
      StarterKit.configure({

        history: false,
      }),
      ...(provider ? [
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
      ] : []),
    ],
  })

  // Debounced save
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(async () => {
        const content = editor.getHTML()
        await fetch(`/api/notes/${noteId}/content`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        })
      }, 2000)
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [editor, noteId])

  useEffect(() => {
    if (noteId && userId) {
      const { room, leave } = liveblocksClient.enterRoom(noteId, { initialPresence: {} })
      const provider = getYjsProviderForRoom(room)
      setProvider(provider)
      
      return () => {
        leave()
      }
    }
  }, [noteId, userId])

  return (
    <div className="ruled-paper-editor">
      <div className="editor-toolbar">
        <div className="flex flex-wrap gap-2 p-2 border-b border-gray-200">
          <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`px-3 py-1 text-sm rounded ${editor?.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Bold</button>
          <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`px-3 py-1 text-sm rounded ${editor?.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Italic</button>
          <button onClick={() => editor?.chain().focus().toggleStrike().run()} className={`px-3 py-1 text-sm rounded ${editor?.isActive('strike') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Strike</button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-3 py-1 text-sm rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>H1</button>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-3 py-1 text-sm rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>H2</button>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-3 py-1 text-sm rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>H3</button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`px-3 py-1 text-sm rounded ${editor?.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Bullet</button>
          <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`px-3 py-1 text-sm rounded ${editor?.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Number</button>
          <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`px-3 py-1 text-sm rounded ${editor?.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Code</button>
          <button onClick={() => editor?.chain().focus().setHorizontalRule().run()} className={`px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200`}>Rule</button>
        </div>
      </div>
      
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none focus:outline-none"
        style={{
          backgroundColor: '#FFFEF7',
          backgroundImage: `
            linear-gradient(#E74C3C 2px, transparent 2px),
            repeating-linear-gradient(transparent, transparent 23px, #D6E4F5 23px, #D6E4F5 24px)
          `,
          backgroundSize: '100% 24px',
          backgroundPosition: '60px 0',
          paddingLeft: '80px',
          paddingRight: '60px',
          paddingTop: '40px',
          paddingBottom: '40px',
          minHeight: '500px',
          lineHeight: '24px'
        }}
      />
    </div>
  )
}
