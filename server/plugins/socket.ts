import type { Server as HttpServer } from 'node:http'
import { Server as IOServer } from 'socket.io'
import type { H3Event } from 'h3'
import { isParticipant } from '../utils/chats'

let io: IOServer | null = null

function getIO(): IOServer | null {
  return io
}

export function broadcastToChat(chatId: string, event: string, payload: unknown) {
  io?.to(`chat:${chatId}`).emit(event, payload)
}

async function getUserIdFromEvent(event: H3Event): Promise<string | null> {
  try {
    const session = await getUserSession(event)
    return (session?.user as { id?: string } | undefined)?.id || null
  } catch {
    return null
  }
}

function installIo(httpServer: HttpServer) {
  if (io) return
  io = new IOServer(httpServer, {
    path: '/api/socket.io',
    cors: { origin: true, credentials: true },
    serveClient: false
  })

  io.use(async (socket, next) => {
    try {
      // Build a faux H3Event-like object for getUserSession
      const req = socket.request as unknown as H3Event['node']['req']
      // h3 uses event.node.req — provide both keys
      const fakeEvent = {
        node: { req, res: {} as H3Event['node']['res'] },
        context: {} as H3Event['context'],
        path: req.url,
        method: 'GET'
      } as unknown as H3Event
      const userId = await getUserIdFromEvent(fakeEvent)
      if (!userId) {
        return next(new Error('unauthorized'))
      }
      ;(socket.data as { userId: string }).userId = userId
      next()
    } catch (err) {
      next(err as Error)
    }
  })

  io.on('connection', (socket) => {
    const userId = (socket.data as { userId?: string }).userId
    if (!userId) {
      socket.disconnect(true)
      return
    }
    // personal room
    socket.join(`user:${userId}`)

    socket.on('chat:join', async (chatId: string) => {
      if (typeof chatId !== 'string') return
      if (!(await isParticipant(chatId, userId))) return
      socket.join(`chat:${chatId}`)
      socket.emit('chat:joined', { chatId })
    })

    socket.on('chat:leave', (chatId: string) => {
      if (typeof chatId !== 'string') return
      socket.leave(`chat:${chatId}`)
    })

    socket.on('chat:typing', async (payload: { chatId: string; typing: boolean }) => {
      if (!payload?.chatId) return
      if (!(await isParticipant(payload.chatId, userId))) return
      socket.to(`chat:${payload.chatId}`).emit('chat:typing', {
        chatId: payload.chatId,
        userId,
        typing: !!payload.typing
      })
    })
  })

  console.log('[socket.io] attached to http server')
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const req = event.node.req as { socket?: { server?: HttpServer } }
    const httpServer = req.socket?.server
    if (httpServer && !io) {
      installIo(httpServer)
    }
  })
})

export { getIO }
