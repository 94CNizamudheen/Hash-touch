import { useCallback, useEffect, useState } from "react";
import QueueSettingsButton from "./QueueSettingsButton";

import { queueService } from "@/services/core/queue.service";
import type { QueueTokenData } from "@/types/queue"; 

import {
  localEventBus,
  LocalEventTypes,
} from "@/services/eventbus/LocalEventBus";

export default function QueueDisplay() {
  const [tokens, setTokens] = useState<QueueTokenData[]>([]);
  const [loading, setLoading] = useState(false);



  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true);
      const listed = await queueService.getActiveTokens();
      setTokens(listed);
    } catch (error) {
      console.error("❌ Failed to fetch queue tokens", error);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    // Initial load
    fetchTokens();

    // Subscribe to queue updates (from QueueWebSocketContext)
    const unsubQueueUpdated = localEventBus.subscribe(
      LocalEventTypes.QUEUE_UPDATED,
      fetchTokens
    );

    // Optional fine-grained listeners (animations / logs)
    const unsubTokenCalled = localEventBus.subscribe(
      LocalEventTypes.QUEUE_TOKEN_CALLED,
      (e) => {
        console.log("🎤 Token called:", e.payload?.tokenNumber);
      }
    );

    const unsubTokenServed = localEventBus.subscribe(
      LocalEventTypes.QUEUE_TOKEN_SERVED,
      (e) => {
        console.log("✅ Token served:", e.payload?.tokenNumber);
      }
    );

    return () => {
      unsubQueueUpdated();
      unsubTokenCalled();
      unsubTokenServed();
    };
  }, [fetchTokens]);



  const waitingTokens = tokens.filter((t) => t.status === "WAITING");
  const calledTokens = tokens.filter((t) => t.status === "CALLED");
  const servedTokens = tokens.filter((t) => t.status === "SERVED");



  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* ------------------------------ Header -------------------------------- */}
      <header className="flex-shrink-0 text-center py-4 md:py-6">
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-wide text-blue-400 drop-shadow-md">
          Queue Display
        </h1>
        <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2">
          Now Serving • Please Wait for Your Turn
        </p>

        {loading && (
          <div className="text-center text-gray-400 text-xs md:text-sm mt-1">
            Refreshing...
          </div>
        )}
      </header>

      {/* --------------------------- Now Calling ------------------------------- */}
      <section className="flex-1 flex flex-col justify-center items-center px-4 py-4 md:py-6 min-h-0">
        <h2 className="text-xl md:text-3xl font-bold text-green-400 mb-3 md:mb-4">
          Now Calling
        </h2>

        <div className="flex justify-center flex-wrap gap-3 md:gap-6 max-h-full overflow-y-auto">
          {calledTokens.length === 0 ? (
            <p className="text-gray-500 text-base md:text-lg">
              No tokens being called
            </p>
          ) : (
            calledTokens.map((token) => (
              <div
                key={token.id}
                className="bg-green-500 text-slate-900 font-extrabold text-3xl md:text-5xl
                           w-24 h-24 md:w-32 md:h-32 flex items-center justify-center
                           rounded-2xl shadow-lg animate-pulse"
              >
                {token.tokenNumber}
              </div>
            ))
          )}
        </div>
      </section>

      {/* ---------------------------- Waiting ---------------------------------- */}
      <section className="flex-shrink-0 bg-slate-800 py-3 md:py-4 rounded-t-3xl shadow-inner max-h-[30vh]">
        <h2 className="text-lg md:text-2xl font-semibold text-yellow-400 mb-2 md:mb-3 text-center px-4">
          Waiting Tokens
        </h2>

        <div className="flex justify-center flex-wrap gap-2 md:gap-4 px-4 overflow-y-auto max-h-[calc(30vh-4rem)]">
          {waitingTokens.length === 0 ? (
            <p className="text-gray-500 text-sm md:text-base">
              No waiting tokens
            </p>
          ) : (
            waitingTokens.map((token) => (
              <div
                key={token.id}
                className="bg-yellow-500 text-slate-900 font-bold text-lg md:text-2xl
                           w-16 h-16 md:w-20 md:h-20 flex items-center justify-center
                           rounded-xl shadow-md"
              >
                {token.tokenNumber}
              </div>
            ))
          )}
        </div>
      </section>

      {/* -------------------------- Recently Served ---------------------------- */}
      <section className="flex-shrink-0 bg-slate-900 py-2 md:py-3">
        <h2 className="text-sm md:text-lg text-gray-400 text-center font-medium px-4">
          Recently Served
        </h2>

        <div className="flex justify-center flex-wrap gap-1.5 md:gap-2 px-4 mt-1 md:mt-2">
          {servedTokens.length === 0 ? (
            <p className="text-gray-600 text-xs md:text-sm">
              No served tokens yet
            </p>
          ) : (
            servedTokens.slice(-5).map((token) => (
              <div
                key={token.id}
                className="bg-gray-600 text-white font-bold text-base md:text-xl
                           w-12 h-12 md:w-16 md:h-16 flex items-center justify-center
                           rounded-lg opacity-70"
              >
                {token.tokenNumber}
              </div>
            ))
          )}
        </div>
      </section>

      <QueueSettingsButton />
    </div>
  );
}
