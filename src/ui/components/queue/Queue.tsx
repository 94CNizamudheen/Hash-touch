
import { useCallback, useEffect, useState } from "react"

import { queueService } from "@/services/core/queue.service"
import type { QueueTokenData } from "@/types/queue"

import { localEventBus, LocalEventTypes } from "@/services/eventbus/LocalEventBus"
import { useQueueWebSocket } from "@/ui/context/web-socket/QueueWebSocketContext"
import QueueHeader from "./QueueHeader"
import SplashScreen from "../common/SplashScreen"

export default function QueueDisplay() {
  const [tokens, setTokens] = useState<QueueTokenData[]>([])
  const [loading, setLoading] = useState(false)

  const { isConnected } = useQueueWebSocket()

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true)
      const listed = await queueService.getActiveTokens()
      console.log("listed", listed)
      setTokens(listed)

    } catch (error) {
      console.error("❌ Failed to fetch queue tokens", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial load
    fetchTokens()

    // Subscribe to queue updates (from QueueWebSocketContext)
    const unsubQueueUpdated = localEventBus.subscribe(LocalEventTypes.QUEUE_UPDATED, fetchTokens)

    // Optional fine-grained listeners (animations / logs)
    const unsubTokenCalled = localEventBus.subscribe(LocalEventTypes.QUEUE_TOKEN_CALLED, (e) => {
      console.log("🎤 Token called:", e.payload?.tokenNumber)
    })

    const unsubTokenServed = localEventBus.subscribe(LocalEventTypes.QUEUE_TOKEN_SERVED, (e) => {
      console.log("✅ Token served:", e.payload?.tokenNumber)
    })

    return () => {
      unsubQueueUpdated()
      unsubTokenCalled()
      unsubTokenServed()
    }
  }, [fetchTokens])

  const waitingTokens = tokens.filter((t) => t.status === "WAITING")
  const calledTokens = tokens.filter((t) => t.status === "CALLED")

  if (loading) {
    return <SplashScreen />
  }

  return (
    <div className="bg-background h-screen overflow-hidden flex flex-col safe-area " >
      {/* ------------------------------ Header -------------------------------- */}
      <QueueHeader wsConnected={isConnected} />

      {/* ------------------------------ Last Sync Bar -------------------------------- */}


      {/* ------------------------------ Ready for pick up (Called Tokens) -------------------------------- */}
      <section className="flex-1 flex flex-col px-4 py-6 overflow-hidden">
        <div
          className="py-4 px-6 rounded-t-lg text-center text-white font-bold text-2xl"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Ready for pick up
        </div>

        <div
          className="flex-1 flex flex-wrap content-start gap-4 p-6 overflow-y-auto  "
        >
          {calledTokens.length === 0 ? (
            <p style={{ color: "var(--muted-foreground)" }} className="w-full text-center">
              No tokens ready for pick up
            </p>
          ) : (
            calledTokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-center font-bold text-4xl rounded-lg w-32 h-28"
                style={{
                  backgroundColor: "var(--card)",
                  color: "var(--primary)",
                  border: "3px solid",
                  borderColor: "var(--primary)",
                }}
              >
                {token.token_number}
              </div>
            ))
          )}
        </div>
      </section>

      {/* ------------------------------ Preparing (Waiting Tokens) -------------------------------- */}
      <section className="flex-1 flex flex-col px-4 py-0 overflow-hidden">
        <div
          className="py-4 px-6 rounded-t-lg text-center text-white font-bold text-2xl"
          style={{ backgroundColor: "var(--warning)" }}
        >
          Preparing
        </div>

        <div
          className="flex-1 flex flex-wrap content-start gap-4 p-6 overflow-y-auto "
        >
          {waitingTokens.length === 0 ? (
            <p  className="w-full text-center text-warning">
              No tokens preparing
            </p>
          ) : (
            waitingTokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-center font-bold text-4xl rounded-lg w-32 h-28"
                style={{
                  backgroundColor: "var(--card)",
                  color: "var(--muted-foreground)",
                  border: "2px solid",
                  borderColor: "var(--muted-foreground)",
                }}
              >
                {token.token_number}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
