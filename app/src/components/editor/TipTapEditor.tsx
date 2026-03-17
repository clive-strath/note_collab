'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { useEffect, useState } from 'react'
import { createCollaborationProvider } from '@/lib/liveblocks-provider'

interface TipTapEditorProps {
  noteId: string
  userId: string
  userName: string
}

export function TipTapEditor({ noteId, userId, userName }: TipTapEditorProps) {
  const [provider, setProvider] = useState<any>(null)
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      // Add collaboration extensions when provider is available
      ...(provider ? [
        Collaboration.configure({
          document: new Y.Doc(),
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
    content: '<p>Start writing your note here...</p>',
  })

  useEffect(() => {
    // Initialize Y.js document and LiveBlocks provider
    if (noteId && userId) {
      const ydoc = new Y.Doc()
      const ytext = ydoc.getText('content')
      
      // Initialize LiveBlocks provider
      const liveblocksProvider = createCollaborationProvider(noteId, ydoc)
      setProvider(liveblocksProvider)
      
      return () => {
        // Cleanup provider on unmount
        if (liveblocksProvider) {
          liveblocksProvider.destroy()
        }
      }
    }
  }, [noteId, userId])

  return (
    <div className="ruled-paper-editor">
      <div className="editor-toolbar">
        {/* Toolbar buttons */}
        <div className="flex space-x-2 p-2 border-b border-gray-200">
          <button 
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`px-3 py-1 text-sm rounded ${
              editor?.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Bold
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 text-sm rounded ${
              editor?.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Italic
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 text-sm rounded ${
              editor?.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            List
          </button>
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
