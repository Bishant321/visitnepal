import React, { useRef, useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (startY.current === null || refreshing) return;
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      e.preventDefault();
      setPullDistance(Math.min(delta * 0.5, THRESHOLD + 20));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(0);
      await onRefresh?.();
      setRefreshing(false);
    } else {
      setPullDistance(0);
    }
    startY.current = null;
  };

  const showing = pullDistance > 10 || refreshing;

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {showing && (
        <div
          className="ptr-indicator"
          style={{ top: refreshing ? 12 : Math.max(pullDistance - 44, -44) + "px", opacity: refreshing ? 1 : Math.min(pullDistance / THRESHOLD, 1) }}
        >
          <RefreshCw
            className={`w-4 h-4 text-red-800 ${refreshing ? "animate-spin" : ""}`}
            style={{ transform: refreshing ? undefined : `rotate(${(pullDistance / THRESHOLD) * 360}deg)` }}
          />
          {refreshing ? "Refreshing..." : pullDistance >= THRESHOLD ? "Release to refresh" : "Pull to refresh"}
        </div>
      )}
      <div style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? "transform 0.3s ease" : "none" }}>
        {children}
      </div>
    </div>
  );
}