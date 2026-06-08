/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Badge, XpHistoryPoint, Task } from "../types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { calculateStreak, getWeekStatus } from "../utils/streak";
import { motion, AnimatePresence } from "motion/react";

interface ProfileViewProps {
  score: number;
  totalWords: number;
  badges: Badge[];
  xpHistory: XpHistoryPoint[];
  completedDates: string[];
  tasks: Task[];
  completedTasks: string[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-2.5 rounded-xl shadow-lg text-xs font-sans">
        <p className="text-[var(--text-sub)] font-semibold mb-0.5">{payload[0].payload.date}</p>
        <p className="text-[#b91c1c] font-black text-sm">{payload[0].value} XP</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-2.5 rounded-xl shadow-lg text-xs font-sans flex items-center gap-2">
        <span className="text-sm">{data.icon}</span>
        <div>
          <span className="font-extrabold text-[var(--text-main)] block">{data.name}</span>
          <span className="text-[#b91c1c] dark:text-[#f87171] font-black text-xs">{data.value} từ vựng</span>
        </div>
      </div>
    );
  }
  return null;
};

const PRESET_AVATARS = [
  "🇻🇳", "👩‍🚀", "👨‍🎓", "🦁", "🦊", "🐼", "🦄", "🐯", "🐨", "🚀", 
  "🎨", "🧪", "💡", "🧙", "👾", "🤠", "🐱", "🐹", "🐰", "⚡", 
  "🍕", "🥑", "☕", "🏆", "💎", "🎯", "🎭", "🧠"
];

const TITLES_LIST = [
  { text: "🎓 Học Giả Tinh Anh", minXp: 0 },
  { text: "🔥 Thần Tốc Phản Xạ", minXp: 30 },
  { text: "🧠 Chiến Binh Từ Vựng", minXp: 60 },
  { text: "🦉 Nhà Thông Thái ViLing", minXp: 100 },
  { text: "👑 Đại Trạng Nguyên", minXp: 150 },
  { text: "🪐 Thiên Tài Ngôn Ngữ Vạn Vật", minXp: 220 },
];

export default function ProfileView({
  score,
  totalWords,
  badges,
  xpHistory = [],
  completedDates = [],
  tasks = [],
  completedTasks = [],
}: ProfileViewProps) {
  const [studentName, setStudentName] = React.useState<string>(() => {
    return localStorage.getItem("viling_student_name") || "Học viên ViLing";
  });
  const [studentAvatar, setStudentAvatar] = React.useState<string>(() => {
    return localStorage.getItem("viling_student_avatar") || "🇻🇳";
  });
  const [studentAvatarImg, setStudentAvatarImg] = React.useState<string | null>(() => {
    return localStorage.getItem("viling_student_avatar_img") || null;
  });
  const [studentTitle, setStudentTitle] = React.useState<string>(() => {
    return localStorage.getItem("viling_student_title") || "🎓 Học Giả Tinh Anh";
  });

  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(studentName);
  const [editAvatar, setEditAvatar] = React.useState(studentAvatar);
  const [editAvatarImg, setEditAvatarImg] = React.useState<string | null>(studentAvatarImg);
  const [editTitle, setEditTitle] = React.useState(studentTitle);

  // Sync edit states when profile state changes
  React.useEffect(() => {
    setEditName(studentName);
    setEditAvatar(studentAvatar);
    setEditAvatarImg(studentAvatarImg);
    setEditTitle(studentTitle);
  }, [studentName, studentAvatar, studentAvatarImg, studentTitle]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Vui lòng tải ảnh nhỏ hơn 2MB để đảm bảo hiệu năng.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxDim = 120; // 120px max dimension
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setEditAvatarImg(compressedDataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) return;
    setStudentName(editName);
    setStudentAvatar(editAvatar);
    setStudentAvatarImg(editAvatarImg);
    setStudentTitle(editTitle);

    localStorage.setItem("viling_student_name", editName.trim());
    localStorage.setItem("viling_student_avatar", editAvatar);
    if (editAvatarImg) {
      localStorage.setItem("viling_student_avatar_img", editAvatarImg);
    } else {
      localStorage.removeItem("viling_student_avatar_img");
    }
    localStorage.setItem("viling_student_title", editTitle);
    setIsEditing(false);
  };

  const streakCount = calculateStreak(completedDates);
  const weekStatus = getWeekStatus(completedDates);

  // Compute progress percentage to next hypothetical rank or mox 200 XP
  const nextRankThreshold = score < 40 ? 40 : score < 80 ? 80 : score < 150 ? 150 : 250;
  const rankProgress = Math.min(100, Math.round((score / nextRankThreshold) * 100));

  // Synchronized vocabulary counting algorithm by topic
  const vocabData = React.useMemo(() => {
    const rawLearnedIds = localStorage.getItem("viling_learned_words");
    const learnedIds: string[] = rawLearnedIds ? JSON.parse(rawLearnedIds) : [];
    
    const uniqueWords = new Set<string>();
    
    const counts: Record<string, number> = {
      danh_lam: 0,
      du_lich: 0,
      dich_vu: 0,
      moi_truong: 0,
      giao_duc: 0,
      viec_lam: 0,
    };

    const advancedTopicMap: Record<string, string> = {
      mw_dl_1: "danh_lam",
      mw_dl_2: "danh_lam",
      mw_tour_1: "du_lich",
      mw_tour_2: "du_lich",
      mw_srv_1: "dich_vu",
      mw_srv_2: "dich_vu",
      mw_mt_1: "moi_truong",
      mw_mt_2: "moi_truong",
      mw_mt_3: "moi_truong",
      mw_gd_1: "giao_duc",
      mw_gd_2: "giao_duc",
      mw_gd_3: "giao_duc",
      mw_vl_1: "viec_lam",
      mw_vl_2: "viec_lam",
      mw_vl_3: "viec_lam",
    };

    const coreChallengesWordMap: Record<string, { word: string; topicId: string }> = {
      danh_lam_q1: { word: "di sản thế giới", topicId: "danh_lam" },
      danh_lam_s1: { word: "thắng cảnh", topicId: "danh_lam" },
      du_lich_s1: { word: "nghỉ dưỡng", topicId: "du_lich" },
      du_lich_q1: { word: "du lịch sinh thái", topicId: "du_lich" },
      dich_vu_q1: { word: "trải nghiệm", topicId: "dich_vu" },
      dich_vu_s1: { word: "hậu mãi", topicId: "dich_vu" },
      moi_truong_q1: { word: "bảo tồn", topicId: "moi_truong" },
      moi_truong_s1: { word: "ô nhiễm", topicId: "moi_truong" },
      giao_duc_q1: { word: "giảng dạy", topicId: "giao_duc" },
      giao_duc_c1: { word: "sinh xuất", topicId: "giao_duc" },
      viec_lam_r1: { word: "quy trình", topicId: "viec_lam" },
      viec_lam_q1: { word: "thị trường lao động", topicId: "viec_lam" },
    };

    // Add Advanced learned items
    learnedIds.forEach((id) => {
      const topicId = advancedTopicMap[id];
      if (topicId) {
        uniqueWords.add(`adv_${id}`);
        counts[topicId] = (counts[topicId] || 0) + 1;
      }
    });

    // Add Completed Challenge items
    completedTasks.forEach((taskId) => {
      const coreInfo = coreChallengesWordMap[taskId];
      if (coreInfo) {
        if (!uniqueWords.has(coreInfo.word.toLowerCase())) {
          uniqueWords.add(coreInfo.word.toLowerCase());
          const tId = coreInfo.topicId;
          counts[tId] = (counts[tId] || 0) + 1;
        }
      } else {
        const foundTask = tasks.find((t) => t.id === taskId);
        if (foundTask) {
          const spanMatch = foundTask.question.match(/<span[^>]*>(?:["“'"”&quot;]+)?([^<>"环保“”'']*)(?:["“'"”&quot;]+)?<\/span>/i);
          const extractedTerm = spanMatch ? spanMatch[1].trim() : "";
          if (extractedTerm && extractedTerm.length < 35) {
            const formatted = extractedTerm.toLowerCase();
            if (!uniqueWords.has(formatted)) {
              uniqueWords.add(formatted);
              const tId = foundTask.topicId;
              if (counts[tId] !== undefined) {
                counts[tId] = (counts[tId] || 0) + 1;
              }
            }
          }
        }
      }
    });

    const metadata: Record<string, { name: string; color: string; icon: string }> = {
      danh_lam: { name: "Danh thắng", color: "#a21caf", icon: "🏔️" },
      du_lich: { name: "Du lịch", color: "#06b6d4", icon: "✈️" },
      dich_vu: { name: "Dịch vụ", color: "#f43f5e", icon: "🛎️" },
      moi_truong: { name: "Môi trường", color: "#10b981", icon: "🌿" },
      giao_duc: { name: "Giáo dục", color: "#3b82f6", icon: "🎓" },
      viec_lam: { name: "Việc làm", color: "#f59e0b", icon: "💼" },
    };

    const finalData = Object.keys(counts).map((key) => {
      const meta = metadata[key];
      return {
        id: key,
        name: meta.name,
        value: counts[key],
        color: meta.color,
        icon: meta.icon,
      };
    });

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

    return {
      chartData: finalData.filter((item) => item.value > 0),
      allTopicsData: finalData,
      totalCount,
    };
  }, [completedTasks, tasks]);

  // Guarantee that there are at least two points to draw a beautiful line dốc dốc
  const chartData = xpHistory.length > 1
    ? xpHistory
    : xpHistory.length === 1
      ? [xpHistory[0], { date: "Hiện tại", xp: score }]
      : [
          { date: "Bắt đầu", xp: 0 },
          { date: "Hiện tại", xp: score },
        ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      {/* Profiler header */}
      <div className="flex flex-col items-center text-center mt-2 relative">
        <div className="group relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 text-white flex items-center justify-center text-4xl shadow-xl shadow-red-500/20 border-4 border-[var(--border-color)] relative overflow-hidden">
            {studentAvatarImg ? (
              <img src={studentAvatarImg} alt={studentName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              studentAvatar
            )}
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-[10px] text-slate-900 border-2 border-white px-2 py-0.5 rounded-full font-black z-10">
              Lvl {Math.floor(score / 50) + 1}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute -bottom-1 -left-1 bg-[var(--card-bg)] hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-[var(--border-color)] p-1.5 rounded-full shadow-md transition-all active:scale-90"
            title="Chỉnh sửa hồ sơ"
          >
            ✏️
          </button>
        </div>
        
        <h2 className="text-xl font-black mt-4 text-[var(--text-main)] flex items-center gap-1">
          {studentName} 
        </h2>
        <span className="text-xs text-red-600 dark:text-red-400 font-bold mt-1.5 bg-red-500/10 dark:bg-red-500/15 px-3 py-1 rounded-full border border-red-500/10 select-none">
          {studentTitle}
        </span>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-[10px] font-black tracking-wider uppercase text-red-600 hover:text-red-700 mt-2 bg-red-500/5 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-all"
        >
          {isEditing ? "Đóng cài đặt ✕" : "✏️ Hiệu chỉnh hồ sơ"}
        </button>
      </div>

      {/* Interactive Profile Editor Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[var(--card-bg)] border-2 border-red-500/25 rounded-2xl p-5 shadow-lg shadow-red-500/5 relative"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-color)]/50">
              <h3 className="text-xs font-black tracking-wider text-[var(--text-main)] uppercase flex items-center gap-1.5">
                ⚙️ Tinh chỉnh Hồ sơ học viên
              </h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-xs text-[var(--text-sub)] hover:text-red-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase tracking-wider">
                  Tên học viên:
                </label>
                <input
                  type="text"
                  maxLength={25}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nhập tên của bạn..."
                  className="w-full p-2.5 border border-[var(--border-color)] rounded-xl bg-[var(--input-bg)] text-xs text-[var(--text-main)] font-semibold outline-none focus:border-red-600"
                />
              </div>

              {/* Character Title Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase tracking-wider">
                  Danh hiệu học tập (Mở khóa theo điểm XP):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TITLES_LIST.map((title) => {
                    const isUnlocked = score >= title.minXp;
                    const isSelected = editTitle === title.text;
                    return (
                      <button
                        key={title.text}
                        disabled={!isUnlocked}
                        onClick={() => setEditTitle(title.text)}
                        className={`text-left p-2 rounded-xl border text-[10px] font-semibold flex items-center justify-between transition-all ${
                          !isUnlocked
                            ? "bg-[var(--input-bg)]/20 border-dashed border-[var(--border-color)]/35 text-[var(--text-sub)] opacity-50 cursor-not-allowed"
                            : isSelected
                            ? "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 font-extrabold"
                            : "bg-[var(--card-bg)] border-[var(--border-color)] hover:border-red-500/40 text-[var(--text-main)]"
                        }`}
                      >
                        <span className="truncate">{title.text}</span>
                        {!isUnlocked ? (
                          <span className="text-[8px] bg-slate-200 dark:bg-zinc-800 px-1 py-0.5 rounded shrink-0 font-mono text-slate-500">
                            🔒 {title.minXp} XP
                          </span>
                        ) : (
                          isSelected && <span className="text-red-600">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avatar Selection (Emoji / Custom Upload) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase tracking-wider">
                  Biểu trưng Avatar:
                </label>
                
                {/* Active preview avatar */}
                <div className="flex items-center gap-3 bg-[var(--input-bg)]/30 border border-[var(--border-color)]/50 p-3 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 text-white flex items-center justify-center text-2xl shadow-sm border border-[var(--border-color)] overflow-hidden shrink-0">
                    {editAvatarImg ? (
                      <img src={editAvatarImg} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      editAvatar
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-[11px] font-black text-[var(--text-main)] block">Xem trước biểu trưng</span>
                    <span className="text-[9px] text-[var(--text-sub)] block mt-0.5">Chọn từ bộ chọn emoji dưới đây hoặc tải ảnh chụp từ máy điện thoại</span>
                  </div>
                  {(editAvatarImg || editAvatar !== "🇻🇳") && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditAvatar("🇻🇳");
                        setEditAvatarImg(null);
                      }}
                      className="text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 px-2 py-1 rounded-lg font-black transition-all"
                    >
                      Đặt lại mặc định
                    </button>
                  )}
                </div>

                {/* Preset Emojis Container */}
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 border border-[var(--border-color)]/55 bg-[var(--input-bg)]/30 rounded-xl">
                  {PRESET_AVATARS.map((emoji) => {
                    const isSelected = editAvatar === emoji && !editAvatarImg;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setEditAvatar(emoji);
                          setEditAvatarImg(null); // Clear custom uploaded image to use emoji
                        }}
                        className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center transition-all select-none ${
                          isSelected
                            ? "bg-red-500 text-white scale-110 shadow-sm"
                            : "hover:bg-[var(--input-bg)]"
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Base64 Avatar Uploader */}
                <div className="pt-1 select-none">
                  <label className="flex items-center justify-center gap-2 border border-dashed border-red-500/30 hover:border-red-500 hover:bg-red-500/5 rounded-xl p-2.5 cursor-pointer transition-all w-full text-center">
                    <span className="text-sm">📸</span>
                    <span className="text-[10px] font-black text-red-600 dark:text-red-400">
                      Tải ảnh cá nhân lên thiết bị này (Chỉ PNG, JPG dưới 2MB)
                    </span>
                    <input
                      type="file"
                      id="viling_avatar_uploader_input"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditName(studentName);
                    setEditAvatar(studentAvatar);
                    setEditAvatarImg(studentAvatarImg);
                    setEditTitle(studentTitle);
                    setIsEditing(false);
                  }}
                  className="cursor-pointer w-full py-2 px-3 border border-[var(--border-color)] hover:bg-[var(--input-bg)] text-[var(--text-main)] font-black text-xs rounded-xl hover:scale-98 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={!editName.trim()}
                  className="cursor-pointer w-full py-2 px-3 bg-[#b91c1c] hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs rounded-xl hover:scale-98 transition-all"
                >
                  Lưu thay đổi 💾
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Streak Card */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-2xl animate-bounce [animation-duration:3s]">
              🔥
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">Chuỗi {streakCount} ngày học liên tiếp</h3>
              <p className="text-[10px] opacity-85 leading-tight">Luyện từ vựng mỗi ngày để lưu giữ ngọn lửa học tập!</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black tracking-tighter">{streakCount}</span>
            <span className="text-[9px] font-bold block opacity-90 leading-none uppercase">ngày</span>
          </div>
        </div>

        {/* 7-Day row tracker bubbles */}
        <div className="grid grid-cols-7 gap-1 bg-black/15 p-2 rounded-xl">
          {weekStatus.map((day, idx) => {
            return (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[9px] font-bold opacity-75 mb-1">{day.dayName}</span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    day.completed
                      ? "bg-amber-400 text-slate-900 shadow-sm"
                      : day.isToday
                      ? "border-2 border-white bg-white/20 text-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {day.completed ? "🔥" : "•"}
                </div>
                {day.isToday && (
                  <span className="text-[7px] font-extrabold bg-white text-red-600 px-1 rounded-full mt-1 uppercase tracking-tighter scale-90">
                    H.nay
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Stats card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 text-center shadow-sm">
          <div className="text-3xl font-black text-[#b91c1c] tracking-tight">{totalWords}</div>
          <div className="text-[10px] font-bold text-[var(--text-sub)] tracking-widest uppercase mt-1">
            Từ đã thuộc
          </div>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 text-center shadow-sm">
          <div className="text-3xl font-black text-amber-500 tracking-tight">{score}</div>
          <div className="text-[10px] font-bold text-[var(--text-sub)] tracking-widest uppercase mt-1">
            Đại lượng XP
          </div>
        </div>
      </div>

      {/* Tỷ lệ từ vựng đã học theo chủ đề (Pie Chart) */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-black text-[var(--text-main)] tracking-wider uppercase mb-5 flex items-center gap-1.5">
          📊 Phân Phối Từ Vựng Đã Học
        </h3>
        
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
          {/* Pie Chart container */}
          <div className="w-40 h-40 shrink-0 relative flex items-center justify-center">
            {vocabData.totalCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vocabData.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {vocabData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--card-bg)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              // Empty State Ring representation when 0 words are learned
              <div className="w-36 h-36 rounded-full border-8 border-dashed border-[var(--border-color)]/50 flex flex-col items-center justify-center text-center">
                <span className="text-xl">😴</span>
              </div>
            )}
            
            {/* Center label inside the Donut Chart */}
            <div className="absolute flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span className="text-2xl font-black text-[var(--text-main)] leading-none tracking-tight">
                {vocabData.totalCount}
              </span>
              <span className="text-[9px] font-bold text-[var(--text-sub)] uppercase tracking-wider mt-1">
                tổng số từ
              </span>
            </div>
          </div>

          {/* Legend stats list */}
          <div className="flex-1 space-y-2 w-full text-left">
            {vocabData.allTopicsData.map((topic) => {
              const matchesPercent = vocabData.totalCount > 0 
                ? Math.round((topic.value / vocabData.totalCount) * 100) 
                : 0;

              return (
                <div 
                  key={topic.id} 
                  className="flex items-center justify-between text-xs font-semibold bg-[var(--input-bg)]/30 hover:bg-[var(--input-bg)]/60 transition-all duration-200 px-3 py-2 rounded-xl border border-[var(--border-color)]/10"
                >
                  <div className="flex items-center gap-2">
                    <span 
                      style={{ backgroundColor: topic.color }} 
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                    ></span>
                    <span className="text-[10px] text-[var(--text-sub)]">{topic.icon}</span>
                    <span className="text-[var(--text-main)] font-black text-[11px]">{topic.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-mono text-[10px]">
                    <span className="text-[var(--text-sub)]">{topic.value} từ</span>
                    <span 
                      style={{ color: topic.value > 0 ? topic.color : "var(--text-sub)" }} 
                      className="font-black w-9 text-right"
                    >
                      {matchesPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {vocabData.totalCount === 0 && (
          <p className="text-[10px] text-[var(--text-sub)] mt-3 text-center italic">
            * Hãy tham gia các thử thách hoặc học chuyên sâu để tích lũy kho từ vựng đầu tiên!
          </p>
        )}
      </div>

      {/* XP Line Chart Progress */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-black text-[var(--text-main)] tracking-wider uppercase mb-3.5 flex items-center gap-1.5">
          📈 Tiến Trình Học Tập XP
        </h3>
        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.35} />
              <XAxis
                dataKey="date"
                stroke="var(--text-sub)"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="var(--text-sub)"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                dx={-8}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="xp"
                stroke="#b91c1c"
                strokeWidth={3}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#b91c1c" }}
                dot={{ r: 2.5, strokeWidth: 0, fill: "#b91c1c" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between text-xs font-bold text-[var(--text-main)] mb-2">
          <span>Tiến trình lên hạng kế tiếp</span>
          <span className="text-[#b91c1c]">{score} / {nextRankThreshold} XP</span>
        </div>
        <div className="w-full h-3 rounded-full bg-[var(--input-bg)] overflow-hidden">
          <div
            style={{ width: `${rankProgress}%` }}
            className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-500"
          ></div>
        </div>
        <p className="text-[10px] text-[var(--text-sub)] mt-2 italic">
          * Đạt {nextRankThreshold} XP để nâng cấp bảng thành thích cá nhân!
        </p>
      </div>

      {/* Badges Achievement list */}
      <div>
        <h3 className="text-sm font-black text-[var(--text-main)] tracking-wider uppercase mb-3.5">
          Danh mục Huy hiệu
        </h3>
        <div className="grid grid-cols-2 gap-3.5">
          {badges.map((badge) => {
            const isUnlocked = score >= badge.xpRequired;

            return (
              <div
                key={badge.id}
                className={`border rounded-2xl p-4 text-center transition-all duration-300 ${
                  isUnlocked
                    ? "bg-amber-500/5 border-amber-400/40 shadow-sm"
                    : "bg-[var(--card-bg)] border-[var(--border-color)] opacity-40 grayscale"
                }`}
              >
                <div className="text-3xl mb-1.5">{badge.icon}</div>
                <div className={`text-xs font-black ${isUnlocked ? "text-amber-600" : "text-[var(--text-main)]"}`}>
                  {badge.title}
                </div>
                <div className="text-[10px] text-[var(--text-sub)] leading-normal mt-1">
                  {badge.description}
                </div>
                <div className="text-[9px] font-mono mt-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded inline-block">
                  Yêu cầu: {badge.xpRequired} XP
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Competitors */}
      <div>
        <h3 className="text-sm font-black text-[var(--text-main)] tracking-wider uppercase mb-3.5 flex items-center gap-1.5">
          🏆 Bảng Xếp Hạng Cao Thủ
        </h3>
        
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm divide-y divide-[var(--border-color)]">
          {[
            { name: "Minh Thư 🌟", xp: 160, avatar: "👩‍🚀" },
            { name: "Tuấn Phong 🍀", xp: 110, avatar: "🦁" },
            { name: "Kha Ly 🍉", xp: 75, avatar: "🦊" },
            { name: "Hoàng Bách 🚀", xp: 30, avatar: "🐼" },
            { name: "Bích Trâm 🌸", xp: 15, avatar: "🦄" },
            { name: `${studentName} (Bạn)`, xp: score, avatar: studentAvatarImg || studentAvatar, isCurrentUser: true }
          ]
            .sort((a, b) => b.xp - a.xp)
            .map((member, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

              return (
                <div
                  key={member.name}
                  className={`flex items-center justify-between p-4 transition-all duration-300 ${
                    member.isCurrentUser
                      ? "bg-red-500/10 dark:bg-red-500/5 font-bold border-l-4 border-l-[#b91c1c]"
                      : "bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Position Label */}
                    <div className="w-6 text-center text-xs font-black text-[var(--text-sub)]">
                      {medal || rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center text-base overflow-hidden shrink-0">
                      {member.avatar.startsWith("dataImage") || member.avatar.startsWith("data:image") ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        member.avatar
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex flex-col">
                      <span className={`text-xs ${member.isCurrentUser ? "text-[#b91c1c] font-black" : "text-[var(--text-main)] font-semibold"}`}>
                        {member.name}
                      </span>
                      {member.isCurrentUser && (
                        <span className="text-[9px] text-[#b91c1c] opacity-80 uppercase font-black tracking-wider leading-none">
                          Bạn đang thi đấu
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating Points XP */}
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-black ${isTop3 ? "text-amber-500" : "text-[var(--text-sub)]"}`}>
                      {member.xp}
                    </span>
                    <span className="text-[10px] text-[var(--text-sub)] opacity-70">XP</span>
                  </div>
                </div>
              );
            })}
        </div>
        <p className="text-[10px] text-[var(--text-sub)] mt-2 italic text-center">
          * Điểm số tự động sắp xếp theo thời gian thực khi làm bài tập!
        </p>
      </div>
    </div>
  );
}
