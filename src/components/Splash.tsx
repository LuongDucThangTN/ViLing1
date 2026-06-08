/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1500);

    const completeTimer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      id="splash-screen"
      style={{
        zIndex: 9999,
        background: "linear-gradient(135deg, #b91c1c, #991b1b)",
        transition: "opacity 500ms ease-out",
        opacity: fading ? 0 : 1,
      }}
      className="absolute inset-0 flex flex-col justify-center items-center text-white"
    >
      <div className="text-5xl font-extrabold tracking-tight mb-2 animate-pulse font-sans">
        ViLing
      </div>
      <div className="text-xs uppercase tracking-widest font-semibold opacity-85">
        HỌC TỪ VỰNG CHỦ ĐỘNG
      </div>
      <div className="absolute bottom-10 text-xxs opacity-50 flex items-center gap-1.5 font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        TRÍ TUỆ NHÂN TẠO GEMINI HỖ TRỢ
      </div>
    </div>
  );
}
