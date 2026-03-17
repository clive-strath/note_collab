'use client'

import { createClient } from '@liveblocks/client'
import { createLiveblocksProvider } from '@liveblocks/yjs'
import * as Y from 'yjs'

const liveblocksClient = createClient({
  authEndpoint: '/api/liveblocks-auth',
})

export function createCollaborationProvider(roomId: string, yDoc: Y.Doc) {
  return createLiveblocksProvider(yDoc, roomId, liveblocksClient)
}

export { liveblocksClient }
