import { createClient } from '@liveblocks/client'

const liveblocksClient = createClient({
  authEndpoint: '/api/liveblocks-auth',
})

export { liveblocksClient }
