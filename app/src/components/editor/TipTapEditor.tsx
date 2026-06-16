'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import FontFamily from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import * as Y from 'yjs'
import { useEffect, useState, useRef } from 'react'
import { liveblocksClient } from '@/lib/liveblocks-provider'
import { getYjsProviderForRoom } from '@liveblocks/yjs'
import { Bold, Italic, Strikethrough, Type, List, ListOrdered, Heading1, Heading2, Heading3, Minus, Save, Download, FileText, Paperclip, Scissors, Copy, Pilcrow, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    return <div className="flex h-96 items-center justify-center text-ink-400 font-medium font-caveat text-lg">Preparing your paper...</div>
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

  const toolbarGroups = [
    // Font family
    [
      {
        component: (
          <select
            onChange={(e) => editor?.chain().focus().setFontFamily(e.target.value).run()}
            className="select-paper text-sm py-1.5 px-2"
            disabled={isReadOnly}
            defaultValue="var(--font-sans), sans-serif"
            aria-label="Font family"
          >
            <option value="var(--font-sans), sans-serif">Standard Font</option>
            <option value="var(--font-caveat), cursive">Caveat</option>
            <option value="var(--font-permanent-marker), cursive">Permanent Marker</option>
            <option value="var(--font-dancing-script), cursive">Dancing Script</option>
            <option value="var(--font-indie-flower), cursive">Indie Flower</option>
          </select>
        ),
        separator: true
      }
    ],
    // Text formatting
    [
      { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold'), tooltip: 'Bold (Ctrl+B)' },
      { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic'), tooltip: 'Italic (Ctrl+I)' },
      { icon: Strikethrough, action: () => editor?.chain().focus().toggleStrike().run(), active: editor?.isActive('strike'), tooltip: 'Strikethrough' },
      { separator: true },
      { icon: Heading1, action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), active: editor?.isActive('heading', { level: 1 }), tooltip: 'Heading 1' },
      { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }), tooltip: 'Heading 2' },
      { icon: Heading3, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive('heading', { level: 3 }), tooltip: 'Heading 3' },
      { separator: true },
      { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList'), tooltip: 'Bullet List' },
      { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList'), tooltip: 'Numbered List' },
      { separator: true },
      { icon: Minus, action: () => editor?.chain().focus().setHorizontalRule().run(), tooltip: 'Horizontal Rule' },
    ],
    // Alignment
    [
      { icon: AlignLeft, action: () => editor?.chain().focus().setTextAlign('left').run(), active: editor?.isActive({ textAlign: 'left' }), tooltip: 'Align Left' },
      { icon: AlignCenter, action: () => editor?.chain().focus().setTextAlign('center').run(), active: editor?.isActive({ textAlign: 'center' }), tooltip: 'Align Center' },
      { icon: AlignRight, action: () => editor?.chain().focus().setTextAlign('right').run(), active: editor?.isActive({ textAlign: 'right' }), tooltip: 'Align Right' },
      { icon: AlignJustify, action: () => editor?.chain().focus().setTextAlign('justify').run(), active: editor?.isActive({ textAlign: 'justify' }), tooltip: 'Justify' },
      { separator: true },
      { icon: Undo, action: () => editor?.chain().focus().undo().run(), disabled: !editor?.can().undo(), tooltip: 'Undo (Ctrl+Z)' },
      { icon: Redo, action: () => editor?.chain().focus().redo().run(), disabled: !editor?.can().redo(), tooltip: 'Redo (Ctrl+Y)' },
    ]
  ]

  return (
    <div className="ruled-paper-editor flex flex-col h-full">
      {/* Stationery Toolbar */}
      <div className="stationery-bar border-b border-ink-200/50 sticky top-0 z-20">
        <div className="flex flex-wrap items-center gap-2 p-3">
          {/* Paper clip decoration on far left */}
          <Paperclip className="w-6 h-6 text-ink-300 flex-shrink-0 -ml-1" aria-hidden="true" />
          
          {toolbarGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex items-center gap-1">
              {group.map((item, itemIndex) => {
                if (item.separator) {
                  return <div key={`sep-${groupIndex}-${itemIndex}`} className="w-px h-6 bg-ink-200/50 mx-1" aria-hidden="true" />
                }
                if (item.component) {
                  return <div key={`comp-${groupIndex}-${itemIndex}`} className="flex items-center">{item.component}</div>
                }
                const Icon = item.icon
                return (
                  <button
                    key={groupIndex * 100 + itemIndex}
                    type="button"
                    onClick={item.action}
                    disabled={isReadOnly || item.disabled}
                    className={`btn-tool-paper ${item.active ? 'active' : ''} ${item.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title={item.tooltip}
                    aria-label={item.tooltip}
                    aria-pressed={item.active || false}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          ))}

          {isReadOnly ? (
            <div className="ml-auto flex items-center text-xs text-amber-600 bg-amber-50/80 px-2.5 py-1.5 rounded border border-amber-200/50 backdrop-blur-sm">
              <span className="font-medium">Read Only</span>
            </div>
          ) : (
            <button
              onClick={handleManualSave}
              disabled={isSaving}
              className="ml-auto btn-save-paper"
              title="Force manual save to database"
              aria-label={isSaving ? 'Saving...' : 'Save to database'}
            >
              <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span className="hidden sm:inline font-medium text-xs">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Editor Area - Ruled Paper */}
      <div className="flex-1 editor-paper overflow-auto">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none focus:outline-none p-6 pt-2"
        />
      </div>
    </div>
  )
}