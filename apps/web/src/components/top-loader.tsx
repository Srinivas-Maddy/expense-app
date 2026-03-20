"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const start = useCallback(() => {
    setProgress(0);
    setVisible(true);
    // Animate to 80% quickly, then slow down
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 90) {
        clearInterval(interval);
        p = 90;
      }
      setProgress(p);
    }, 100);
    return interval;
  }, []);

  const done = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }, []);

  useEffect(() => {
    const interval = start();
    // Complete when route changes finish
    const timer = setTimeout(() => {
      clearInterval(interval);
      done();
    }, 400);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [pathname, searchParams, start, done]);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          boxShadow: "0 0 10px rgba(99, 102, 241, 0.7), 0 0 5px rgba(99, 102, 241, 0.5)",
        }}
      />
    </div>
  );
}
