"use client";

import { useEffect } from "react";

interface ShopViewTrackerProps {
  shopId: string;
}

export function ShopViewTracker({ shopId }: ShopViewTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      try {
        // Get or create session ID
        let sessionId = sessionStorage.getItem("bloom_session_id");
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          sessionStorage.setItem("bloom_session_id", sessionId);
        }

        await fetch("/api/tracking/shop-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shop_id: shopId,
            session_id: sessionId,
          }),
        });
      } catch {
        // Ignore tracking errors
      }
    };

    trackView();
  }, [shopId]);

  return null; // This component doesn't render anything
}
