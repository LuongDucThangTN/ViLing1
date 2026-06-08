/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface WordItem {
  id: string;
  word: string;
  meaning: string;
  explanation: string;
  example: string;
  topicId: string;
  topicName: string;
  topicIcon: string;
  color: string;
}

const WOTD_WORDS: WordItem[] = [
  {
    id: "wotd_dl_1",
    word: "Kỳ quan thiên nhiên",
    meaning: "Natural Wonder",
    explanation: "Cảnh quan thiên nhiên sở hữu vẻ đẹp phi thường, cấu trúc kỳ vĩ độc nhất vô nhị do tiến trình địa chất kiến tạo hàng triệu năm.",
    example: "Hệ thống hang động thạch nhũ lấp lánh tại Phong Nha - Kẻ Bàng chính là một <strong class='text-purple-500 dark:text-purple-400'>kỳ quan thiên nhiên</strong> của nhân loại.",
    topicId: "danh_lam",
    topicName: "Danh thắng",
    topicIcon: "🏔️",
    color: "#a21caf",
  },
  {
    id: "wotd_dl_2",
    word: "Kiến trúc cổ kính",
    meaning: "Ancient Architecture",
    explanation: "Công trình xây dựng mang đậm dấu ấn lịch sử, mỹ thuật truyền thống lâu đời và được bảo tồn nguyên vẹn qua thăng trầm thời gian.",
    example: "Chùa Một Cột với kiến trúc một cột đá độc lập giữa hồ sen mang vẻ đẹp <strong class='text-purple-500 dark:text-purple-400'>cổ kính</strong> thanh tao.",
    topicId: "danh_lam",
    topicName: "Danh thắng",
    topicIcon: "🏔️",
    color: "#a21caf",
  },
  {
    id: "wotd_tour_1",
    word: "Du hành bản địa",
    meaning: "Indigenous Travel",
    explanation: "Hình thức du dịch chuyên sâu giúp lữ khách trực tiếp trải nghiệm cuộc sống sinh hoạt và phong tục tập quán phong phú của đồng bào dân tộc thiểu số.",
    example: "Hành trình <strong class='text-[#06b6d4]'>du hành bản địa</strong> đưa chúng tôi hòa mình vào ngày tết nhảy độc đáo của người Dao đỏ.",
    topicId: "du_lich",
    topicName: "Du lịch",
    topicIcon: "✈️",
    color: "#06b6d4",
  },
  {
    id: "wotd_tour_2",
    word: "Sinh thái bền vững",
    meaning: "Sustainable Ecotourism",
    explanation: "Hoạt động lữ hành có ý thức bảo tồn thiên nhiên, hạn chế rác thải nhựa, tôn trọng bản sắc văn hóa và hỗ trợ kinh tế dân cư tại chỗ.",
    example: "Học tập thói quen lưu trú xanh giúp nâng cao ý thức về du lịch <strong class='text-[#06b6d4]'>sinh thái bền vững</strong>.",
    topicId: "du_lich",
    topicName: "Du lịch",
    topicIcon: "✈️",
    color: "#06b6d4",
  },
  {
    id: "wotd_srv_1",
    word: "Hậu mãi tối ưu",
    meaning: "Optimal Customer Care Service",
    explanation: "Chính sách chăm sóc khách hàng đỉnh cao, cung cấp hỗ trợ kỹ thuật tận tình, bảo dưỡng định kỳ sau khi bàn giao sản phẩm thương mại.",
    example: "Cam kết bảo hành lưu động 24/7 khẳng định tiêu chuẩn của quy trình <strong class='text-[#f43f5e]'>hậu mãi tối ưu</strong>.",
    topicId: "dich_vu",
    topicName: "Dịch vụ",
    topicIcon: "🛎️",
    color: "#f43f5e",
  },
  {
    id: "wotd_srv_2",
    word: "Tận tâm phục vụ",
    meaning: "Dedicated Customer Service",
    explanation: "Tinh thần nỗ lực thấu cảm, chu đáo tối đa vì lợi ích và trải nghiệm hoàn hảo của khách hàng trong suốt thời gian giao dịch.",
    example: "Sự <strong class='text-[#f43f5e]'>tận tâm phục vụ</strong> của cán bộ nhân viên chính là giá trị cốt lõi kiến tạo lòng tin trung thành vững bền.",
    topicId: "dich_vu",
    topicName: "Dịch vụ",
    topicIcon: "🛎️",
    color: "#f43f5e",
  },
  {
    id: "wotd_mt_1",
    word: "Môi trường sinh thái",
    meaning: "Ecological Environment",
    explanation: "Hệ thống các yếu tố vật chất tự nhiên bao quanh sinh vật (đất, nước, không khí) ảnh hưởng trực tiếp đến sự sống và tiến hóa.",
    example: "Chung tay loại bỏ chất thải hóa học độc hại để chung sống an lành trong <strong class='text-[#10b981]'>môi trường sinh thái</strong> trong lành.",
    topicId: "moi_truong",
    topicName: "Môi trường",
    topicIcon: "🌿",
    color: "#10b981",
  },
  {
    id: "wotd_mt_2",
    word: "Bảo tồn sinh thái",
    meaning: "Ecological Conservation",
    explanation: "Việc quy hoạch bảo vệ nghiêm ngặt các vùng đệm tự nhiên, bảo vệ động thực vật sách đỏ chống khai thác hủy hoại.",
    example: "Thành lập khu dự trữ sinh quyển quốc gia hướng tới mục tiêu lâu dài về <strong class='text-[#10b981]'>bảo tồn sinh thái</strong>.",
    topicId: "moi_truong",
    topicName: "Môi trường",
    topicIcon: "🌿",
    color: "#10b981",
  },
  {
    id: "wotd_edu_1",
    word: "Tri thức toàn diện",
    meaning: "Comprehensive Knowledge",
    explanation: "Sự trang bị cân bằng giữa lý thuyết hàn lâm xuất sắc, kỹ năng thực hành nghề nghiệp vượt trội và trí tuệ cảm xúc phong phú.",
    example: "Môi trường giáo dục hiện đại chú trọng khơi dậy nội lực để học viên gặt hái <strong class='text-[#3b82f6]'>tri thức toàn diện</strong>.",
    topicId: "giao_duc",
    topicName: "Giáo dục",
    topicIcon: "🎓",
    color: "#3b82f6",
  },
  {
    id: "wotd_edu_2",
    word: "Giảng truyền kế thừa",
    meaning: "Educational Inheritance and Teaching",
    explanation: "Phương pháp giảng dạy sư phạm đúc kết khoa học, giúp thế hệ đi trước truyền thụ tinh hoa học thuật sâu sắc cho học thế hệ sau.",
    example: "Các nghệ nhân tâm huyết đang tích cực <strong class='text-[#3b82f6]'>giảng truyền kế thừa</strong> tinh hoa nhạc cụ dân tộc cho thế hệ trẻ.",
    topicId: "giao_duc",
    topicName: "Giáo dục",
    topicIcon: "🎓",
    color: "#3b82f6",
  },
  {
    id: "wotd_job_1",
    word: "Thị trường lao động",
    meaning: "Labor Market / Job Market",
    explanation: "Nơi thiết lập các mối quan hệ cung - cầu sức lao động, làm cầu nối kết nối ứng viên tài năng với các cơ hội nghề nghiệp lớn.",
    example: "Chuyển đổi số mạnh mẽ tạo ra hàng ngàn vị trí lập trình viên mới mẻ trên <strong class='text-[#f59e0b]'>thị trường lao động</strong>.",
    topicId: "viec_lam",
    topicName: "Việc làm",
    topicIcon: "💼",
    color: "#f59e0b",
  },
  {
    id: "wotd_job_2",
    word: "Tác phong chuyên nghiệp",
    meaning: "Professional Work Ethics / Demeanor",
    explanation: "Thái độ làm việc nghiêm túc, đúng giờ, tôn trọng kỷ luật nhóm, tinh thần trách nhiệm cao độ và giao tiếp chuẩn mực văn minh.",
    example: "Rèn luyện <strong class='text-[#f59e0b]'>tác phong chuyên nghiệp</strong> giúp bạn xây dựng uy tín vượt bậc trong lòng đối tác.",
    topicId: "viec_lam",
    topicName: "Việc làm",
    topicIcon: "💼",
    color: "#f59e0b",
  }
];

interface WordOfTheDayProps {
  soundEnabled: boolean;
  playClick: () => void;
}

export default function WordOfTheDay({ soundEnabled, playClick }: WordOfTheDayProps) {
  // Use today's calendar date as a seed to select the daily word
  const getDailyIndex = () => {
    try {
      const today = new Date();
      const stringSeed = today.getFullYear().toString() + today.getMonth().toString() + today.getDate().toString();
      let hash = 0;
      for (let i = 0; i < stringSeed.length; i++) {
        hash = stringSeed.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash) % WOTD_WORDS.length;
    } catch {
      return 0; // Baseline safety fallback
    }
  };

  const [currentIndex, setCurrentIndex] = useState<number>(getDailyIndex());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  const activeWord = WOTD_WORDS[currentIndex];

  // Manual shuffler with beautiful quick loading effect
  const handleShuffleWord = () => {
    playClick();
    setIsRotating(true);
    
    // Choose a random word index that is different from current if possible
    let nextIdx = currentIndex;
    if (WOTD_WORDS.length > 1) {
      while (nextIdx === currentIndex) {
        nextIdx = Math.floor(Math.random() * WOTD_WORDS.length);
      }
    } else {
      nextIdx = 0;
    }

    setTimeout(() => {
      setCurrentIndex(nextIdx);
      setIsRotating(false);
    }, 280);
  };

  // Text-To-Speech to read aloud the Vietnamese word
  const handleSpeak = () => {
    if (!activeWord || isSpeaking) return;
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel(); // Stop active speaking first
        const utterance = new SpeechSynthesisUtterance(activeWord.word);
        utterance.lang = "vi-VN";
        utterance.rate = 0.9; // Natural paced flow

        utterance.onstart = () => {
          setIsSpeaking(true);
        };
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech Synthesis has been blocked by environment limits:", err);
        setIsSpeaking(false);
      }
    }
  };

  // Stop speaking when user moves/changes word
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex]);

  if (!activeWord) return null;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4.5 shadow-sm transition-all duration-300 relative overflow-hidden group">
      
      {/* Decorative ambient blurred orb */}
      <div 
        style={{ backgroundColor: `${activeWord.color}15` }}
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -translate-y-8 translate-x-8 pointer-events-none transition-all duration-500"
      />

      {/* Header Info badge */}
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <span className="flex items-center gap-1.5 text-[9px] font-black text-[#b91c1c] tracking-widest uppercase">
          <span className="animate-pulse">✨</span> TỪ VỰNG CỦA NGÀY
        </span>
        <button
          onClick={handleSpeak}
          title="Nghe phát âm"
          className={`cursor-pointer w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            isSpeaking 
              ? "bg-[#b91c1c] text-white scale-105" 
              : "bg-[var(--input-bg)] text-[var(--text-sub)] hover:text-[#b91c1c] hover:bg-red-500/10 border border-[var(--border-color)]/25"
          }`}
        >
          {isSpeaking ? (
            <div className="flex gap-0.5 items-end justify-center h-3.5">
              <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
              <span className="w-0.5 h-3.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></span>
              <span className="w-0.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></span>
            </div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>

      {/* Main Vocabulary Card content */}
      <div className={`transition-all duration-200 ${isRotating ? "opacity-30 scale-98 rotate-y-45" : "opacity-100 scale-100"}`}>
        <div className="mb-2">
          <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight leading-none mb-1">
            {activeWord.word}
          </h2>
          <span className="text-xs font-bold text-[var(--text-sub)] italic block">
            meaning: {activeWord.meaning}
          </span>
        </div>

        {/* Detailed Concept Explanation phrase */}
        <p className="text-[11.5px] leading-relaxed text-[var(--text-sub)] mb-3 bg-[var(--input-bg)]/20 px-3 py-2.5 rounded-xl border border-[var(--border-color)]/10 font-medium">
          {activeWord.explanation}
        </p>

        {/* Dynamic Context Example sentence */}
        <div className="border-l-3 border-[var(--border-color)] pl-3 py-0.5 mb-4.5">
          <span className="text-[10px] font-bold text-[var(--text-sub)] uppercase tracking-wider block mb-0.5">
            Ví dụ ngữ cảnh:
          </span>
          <p 
            className="text-xs text-[var(--text-main)] italic leading-relaxed"
            dangerouslySetInnerHTML={{ __html: activeWord.example }}
          />
        </div>
      </div>

      {/* Footer Pill metadata & shuffler action */}
      <div className="flex items-center justify-between border-t border-[var(--border-color)]/30 pt-3.5 relative z-10">
        <span 
          style={{ 
            color: activeWord.color,
            backgroundColor: `${activeWord.color}15`,
            borderColor: `${activeWord.color}25`
          }}
          className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5"
        >
          <span>{activeWord.topicIcon}</span>
          <span>{activeWord.topicName}</span>
        </span>

        {/* Explores button */}
        <button
          onClick={handleShuffleWord}
          className="cursor-pointer text-[10px] font-black text-[#b91c1c] bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/15 uppercase tracking-wide flex items-center gap-1 transition-all active:scale-97 select-none"
        >
          <span>🔄 Khám phá từ khác</span>
        </button>
      </div>

    </div>
  );
}
