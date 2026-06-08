/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTabChange?: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "luyentap", label: "Luyện tập", icon: "💡" },
    { id: "video", label: "MicroLearn", icon: "▶️" },
    { id: "hoso", label: "Hồ sơ", icon: "🏆" },
    { id: "caidat", label: "Cài đặt", icon: "⚙️" },
  ];

  return (
    <div className="flex justify-around bg-[var(--nav-bg)] border-t border-[var(--border-color)] pb-6 pt-3 sticky bottom-0 w-full z-50 transition-colors duration-300">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (onTabChange) onTabChange();
            }}
            className={`flex-1 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              isActive ? "text-[#b91c1c] font-bold" : "text-[var(--text-sub)]"
            }`}
          >
            <span
              className={`text-2xl mb-1 transition-transform duration-300 ${
                isActive ? "-translate-y-1 scale-110" : ""
              }`}
            >
              {tab.icon}
            </span>
            <span className="text-[11px] font-semibold tracking-wide">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
