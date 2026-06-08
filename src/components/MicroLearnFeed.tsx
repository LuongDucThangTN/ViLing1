/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { VideoPost } from "../types";

interface MicroLearnFeedProps {
  posts: VideoPost[];
  onPracticeTopic: (category: string) => void;
  soundEnabled: boolean;
  playSwipe: () => void;
  playSuccess: () => void;
}

export default function MicroLearnFeed({
  posts,
  onPracticeTopic,
  soundEnabled,
  playSwipe,
  playSuccess,
}: MicroLearnFeedProps) {
  const [likesCount, setLikesCount] = useState<Record<string, number>>(() => {
    return posts.reduce((acc, p) => ({ ...acc, [p.id]: p.likes }), {});
  });
  const [likedStates, setLikedStates] = useState<Record<string, boolean>>({});

  const handleLike = (id: string) => {
    const wasLiked = likedStates[id];
    setLikedStates((prev) => ({ ...prev, [id]: !wasLiked }));
    setLikesCount((prev) => ({
      ...prev,
      [id]: wasLiked ? prev[id] - 1 : prev[id] + 1,
    }));
    if (!wasLiked) {
      playSuccess();
    }
  };

  return (
    <div className="absolute inset-0 bg-[#000000] text-white flex flex-col h-full overflow-hidden">
      <div className="h-[90%] overflow-y-auto snap-y snap-mandatory scroll-smooth pb-16">
        {posts.map((post) => {
          const isLiked = likedStates[post.id];
          const count = likesCount[post.id];

          return (
            <div
              key={post.id}
              style={{ background: post.bgGradient }}
              className="relative w-full h-[75vh] flex-shrink-0 snap-start flex flex-col justify-between p-6 opacity-95"
            >
              {/* Header metadata */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur px-3 py-1.5 rounded-full text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#b91c1c] animate-pulse"></span>
                  <strong>Mẹo Học Nhanh</strong>
                </div>
                <div className="text-xxs font-mono opacity-50 tracking-wider">
                  Post ID: {post.id}
                </div>
              </div>

              {/* Central spinning audio disk visualization or play overlay */}
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/25 relative animate-spin [animation-duration:10s]">
                  <span className="text-3xl">💿</span>
                </div>
                <div className="mt-4 bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full text-center text-xs opacity-80">
                  🔊 Âm thanh truyền tải từ Giảng viên
                </div>
              </div>

              {/* Bottom text overlays & CTA buttons */}
              <div className="flex flex-col gap-4">
                <div className="pr-16 relative">
                  <h3 className="font-extrabold text-lg text-white mb-1.5">
                    @{post.username}
                  </h3>
                  <p className="text-sm text-slate-100/90 leading-relaxed font-normal mb-3">
                    {post.title}
                  </p>

                  {/* Redirect CTA Button */}
                  <button
                    onClick={() => {
                      playSwipe();
                      onPracticeTopic(post.category);
                    }}
                    className="cursor-pointer bg-[#b91c1c] hover:bg-red-600 border border-red-500 text-white font-bold px-5 py-3 rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 active:scale-98"
                  >
                    <span>🎯 Luyện tập ngay chủ đề này</span>
                  </button>
                </div>

                {/* Right sidebar metrics controls */}
                <div className="absolute right-4 bottom-28 flex flex-col items-center gap-5">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex flex-col items-center gap-1 cursor-pointer group active:scale-75 transition-transform"
                  >
                    <div
                      className={`w-12 h-12 rounded-full border border-white/20 bg-black/30 backdrop-blur flex items-center justify-center text-2xl shadow transition-colors ${
                        isLiked ? "border-rose-500 text-rose-500 bg-rose-500/10" : "text-white"
                      }`}
                    >
                      ❤️
                    </div>
                    <span className="text-xxs font-extrabold text-slate-200">
                      {count.toLocaleString()}
                    </span>
                  </button>

                  {/* Comment Button */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-black/30 backdrop-blur flex items-center justify-center text-2xl shadow">
                      💬
                    </div>
                    <span className="text-xxs font-extrabold text-slate-200">
                      {post.comments.toLocaleString()}
                    </span>
                  </div>

                  {/* Share indicator */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-black/30 backdrop-blur flex items-center justify-center text-xl">
                      ✈️
                    </div>
                    <span className="text-xxs font-bold text-slate-200">Chia sẻ</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
