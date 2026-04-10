'use client'

import { createClient } from '@liveblocks/client'
import { LiveblocksYjsProvider } from '@liveblocks/yjs'
import * as Y from 'yjs'

const liveblocksClient = createClient({
  authEndpoint: '/api/liveblocks-auth',
})

export function createCollaborationProvider(roomId: string, yDoc: Y.Doc) {
  return new LiveblocksYjsProvider(liveblocksClient, roomId, yDoc)
}

export { liveblocksClient }
