import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

function safeEnv(key?: string) {
       return key && key.length > 0
}

let _pusherServer: any = null
if (safeEnv(process.env.PUSHER_APP_ID) && safeEnv(process.env.NEXT_PUBLIC_PUSHER_KEY) && safeEnv(process.env.PUSHER_SECRET) && safeEnv(process.env.NEXT_PUBLIC_PUSHER_CLUSTER)) {
       _pusherServer = new PusherServer({
              appId: process.env.PUSHER_APP_ID!,
              key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
              secret: process.env.PUSHER_SECRET!,
              cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
              useTLS: true,
       })
} else {
       // Fallback stub to avoid runtime errors during build when env vars are missing
       _pusherServer = {
              trigger: async () => {
                     // noop
                     return
              }
       }
}

export const pusherServer = _pusherServer

let _pusherClient: any = null
if (safeEnv(process.env.NEXT_PUBLIC_PUSHER_KEY) && safeEnv(process.env.NEXT_PUBLIC_PUSHER_CLUSTER)) {
       _pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER! })
} else {
       _pusherClient = {
              subscribe: () => ({ bind: () => {}, unbind_all: () => {}, unsubscribe: () => {} })
       }
}

export const pusherClient = _pusherClient
