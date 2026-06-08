/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Topic } from "../types";

interface TopicChipsProps {
  topics: Topic[];
  selectedTopic: string;
  setSelectedTopic: (id: string) => void;
  onChipClick?: () => void;
}

export default function TopicChips({
  topics,
  selectedTopic,
  setSelectedTopic,
  onChipClick,
}: TopicChipsProps) {
  return (
    <div className="flex overflow-x-auto gap-2.5 pb-3 mb-2 scrollbar-none scroll-smooth">
      {topics.map((topic) => {
        const isActive = selectedTopic === topic.id;
        return (
          <button
            key={topic.id}
            onClick={() => {
              setSelectedTopic(topic.id);
              if (onChipClick) onChipClick();
            }}
            className={`px-4 py-2 rounded-full cursor-pointer border text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              isActive
                ? "bg-[#b91c1c] text-white border-[#b91c1c] shadow-lg shadow-red-500/20 scale-102"
                : "bg-[var(--input-bg)] text-[var(--text-sub)] border-[var(--border-color)] hover:border-red-500/30"
            }`}
          >
            <span className="mr-1">{topic.icon}</span>
            {topic.name}
          </button>
        );
      })}
    </div>
  );
}
