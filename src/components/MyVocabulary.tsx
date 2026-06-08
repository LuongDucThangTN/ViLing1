/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Task } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { playBeep } from "../utils/audio";

interface MyVocabularyProps {
  tasks: Task[];
  completedTasks: string[];
  soundEnabled: boolean;
}

interface VocabItem {
  id: string; // Task ID or Advanced Word ID
  word: string; // The vocabulary term
  meaning: string; // Translation, synonym or short explanation
  explanation: string; // Detailed description
  example: string; // Example sentence
  topicId: string;
  topicName: string;
  topicIcon: string;
  source: "Thử Thách" | "Chuyên Sâu";
}

const TOPIC_METADATA: Record<string, { name: string; icon: string }> = {
  danh_lam: { name: "Danh lam thắng cảnh", icon: "🏔️" },
  du_lich: { name: "Du lịch", icon: "✈️" },
  dich_vu: { name: "Dịch vụ", icon: "🛎️" },
  moi_truong: { name: "Môi trường", icon: "🌿" },
  giao_duc: { name: "Giáo dục", icon: "🎓" },
  viec_lam: { name: "Việc làm", icon: "💼" },
  chung: { name: "Chung", icon: "⚡" },
};

// Static data of advanced words to match keys stored in localStorage ("viling_learned_words")
const ADVANCED_WORDS_DICT: Record<string, Omit<VocabItem, "source">> = {
  mw_dl_1: {
    id: "mw_dl_1",
    word: "Di sản thiên nhiên",
    meaning: "Natural Heritage",
    explanation: "Cảnh quan thiên nhiên hoặc vùng địa lý được bảo vệ nghiêm ngặt nhờ giá trị thẩm mỹ, khoa học hoặc sinh thái học độc đáo.",
    example: "Địa hình karst của Vịnh Hạ Long là di sản thiên nhiên thế giới vô giá.",
    topicId: "danh_lam",
    topicName: "Danh lam thắng cảnh",
    topicIcon: "🏔️",
  },
  mw_dl_2: {
    id: "mw_dl_2",
    word: "Cảnh quan kỳ vĩ",
    meaning: "Magnificent Landscape",
    explanation: "Góc nhìn bao quát tuyệt đẹp, hoành tráng gây ấn tượng cực kỳ mạnh mẽ cho người thưởng ngoạn.",
    example: "Đèo Mã Pí Lèng mang đến một cảnh quan kỳ vĩ lôi cuốn hàng triệu lữ khách.",
    topicId: "danh_lam",
    topicName: "Danh lam thắng cảnh",
    topicIcon: "🏔️",
  },
  mw_tour_1: {
    id: "mw_tour_1",
    word: "Du lịch sinh thái",
    meaning: "Ecotourism",
    explanation: "Mô hình du lịch dựa vào thiên nhiên, kết hợp bảo tồn, giáo dục môi trường và cải thiện sinh kế địa phương.",
    example: "Xu hướng du lịch sinh thái đang ngày một phát triển mạnh tại vùng ngập mặn.",
    topicId: "du_lich",
    topicName: "Du lịch",
    topicIcon: "✈️",
  },
  mw_tour_2: {
    id: "mw_tour_2",
    word: "Hành trình khám phá",
    meaning: "Exploration Itinerary",
    explanation: "Chuyến du ngoạn đi sâu tìm hiểu văn hóa bản địa, lịch sử phong phú của một vùng đất mới mẻ.",
    example: "Chúng tôi lên kế hoạch cho một hành trình khám phá di sản miền Trung Việt Nam.",
    topicId: "du_lich",
    topicName: "Du lịch",
    topicIcon: "✈️",
  },
  mw_srv_1: {
    id: "mw_srv_1",
    word: "Trải nghiệm khách hàng",
    meaning: "Customer Experience (CX)",
    explanation: "Toàn bộ cảm xúc, nhận thức tích tụ của khách hàng sau mọi tương tác với thương hiệu hay nhà cung ứng.",
    example: "Nâng cấp trải nghiệm khách hàng tối ưu giúp giữ chân người dịch dụng lâu dài.",
    topicId: "dich_vu",
    topicName: "Dịch vụ",
    topicIcon: "🛎️",
  },
  mw_srv_2: {
    id: "mw_srv_2",
    word: "Hậu mãi chu đáo",
    meaning: "Attentive After-Sales Service",
    explanation: "Sự chăm sóc, hỗ trợ kỹ thuật và bảo hành tuyệt vời sau khi hoàn thành giao dịch mua bán sản phẩm.",
    example: "Chế độ hậu mãi chu đáo là cam kết vàng nâng tầm uy tín doanh nghiệp.",
    topicId: "dich_vu",
    topicName: "Dịch vụ",
    topicIcon: "🛎️",
  },
  mw_mt_1: {
    id: "mw_mt_1",
    word: "Đa dạng sinh học",
    meaning: "Biodiversity",
    explanation: "Sự phong phú cùng chung sống hoà hợp của hàng ngàn sinh vật quý hiếm trong một vùng đệm hệ sinh thái tự nhiên.",
    example: "Bảo tồn tính đa dạng sinh học là chìa khóa then chốt của sự sống bền vững.",
    topicId: "moi_truong",
    topicName: "Môi trường",
    topicIcon: "🌿",
  },
  mw_mt_2: {
    id: "mw_mt_2",
    word: "Bảo tồn bền vững",
    meaning: "Sustainable Conservation",
    explanation: "Gìn giữ nguyên trạng, bảo vệ nghiêm ngặt chống hao hụt mà vẫn mang lại lợi ích giáo dục bền lâu.",
    example: "Ban quản lý rừng hướng đến mục tiêu tiếp tục bảo tồn bền vững nguồn gen gỗ quý.",
    topicId: "moi_truong",
    topicName: "Môi trường",
    topicIcon: "🌿",
  },
  mw_mt_3: {
    id: "mw_mt_3",
    word: "Thải carbon thấp",
    meaning: "Low-Carbon Emission",
    explanation: "Sự hạn chế tối đa khí thải chứa carbon dioxid ra bầu khí quyển nhằm đẩy lùi hiện tượng trái đất nóng lên.",
    example: "Sử dụng xe điện là một hành động thiết thực của mô hình đô thị thải carbon thấp.",
    topicId: "moi_truong",
    topicName: "Môi trường",
    topicIcon: "🌿",
  },
  mw_gd_1: {
    id: "mw_gd_1",
    word: "Chương trình tích hợp",
    meaning: "Integrated Curriculum",
    explanation: "Quy trình thiết kế giảng dạy liên thông, đan xen kiến thức khoa học và xã hội giúp kích thích óc đa chiều.",
    example: "Giáo án mới lồng ghép các hoạt động ngoại khóa dưới mô hình chương trình tích hợp đa ngành.",
    topicId: "giao_duc",
    topicName: "Giáo dục",
    topicIcon: "🎓",
  },
  mw_gd_2: {
    id: "mw_gd_2",
    word: "Kiểm định chất lượng",
    meaning: "Quality Accreditation",
    explanation: "Tiến trình khảo sát đánh giá hệ thống, khách quan toàn bộ hoạt động đào tạo của một cơ sở học vấn.",
    example: "Đại học ViLing tự hào kiểm định chất lượng đạt mức tối đa theo thang nhận diện toàn cầu.",
    topicId: "giao_duc",
    topicName: "Giáo dục",
    topicIcon: "🎓",
  },
  mw_gd_3: {
    id: "mw_gd_3",
    word: "Tự chủ học thuật",
    meaning: "Academic Autonomy",
    explanation: "Quyền hạn độc lập trong giảng luận, xác định phương pháp giảng khoa mới mẻ mà không bị bó hẹp nguyên mẫu cũ.",
    example: "Giáo sư được giao quyền tự chủ học thuật cao để thử nghiệm phương án soạn từ SCAMPER.",
    topicId: "giao_duc",
    topicName: "Giáo dục",
    topicIcon: "🎓",
  },
  mw_vl_1: {
    id: "mw_vl_1",
    word: "Tái cấu trúc nhân sự",
    meaning: "HR Restructuring",
    explanation: "Việc thay đổi sự phân bổ quản trị và điều phối lại nguồn lao động, thúc đẩy vai trò nòng cốt hiệu quả.",
    example: "Hội đồng quản trị áp dụng tái cấu trúc nhân sự trực tuyến để giảm tải tối đa bộ máy hành chính.",
    topicId: "viec_lam",
    topicName: "Việc làm",
    topicIcon: "💼",
  },
  mw_vl_2: {
    id: "mw_vl_2",
    word: "Thị trường lao động",
    meaning: "Labor Market",
    explanation: "Khái niệm kinh tế biểu thị quan hệ cung và cầu về sức lao động, nơi ứng viên tìm công việc tối ưu nhất.",
    example: "Xu hướng trí tuệ nhân tạo tăng tốc đang mở ra cuộc chạy đua khốc liệt trên thị trường lao động.",
    topicId: "viec_lam",
    topicName: "Việc làm",
    topicIcon: "💼",
  },
  mw_vl_3: {
    id: "mw_vl_3",
    word: "Hiệu năng làm việc",
    meaning: "Work Productivity",
    explanation: "Thước đo khối lượng giá trị đầu ra, được hạch toán chặt chẽ trên mỗi đơn vị sức lao động chi ra.",
    example: "Chăm chỉ kết hợp rèn luyện đúng giờ giúp nâng cao đáng kể hiệu năng làm việc hằng ngày.",
    topicId: "viec_lam",
    topicName: "Việc làm",
    topicIcon: "💼",
  },
};

// Known core static challenges to display beautifully immediately
const CORE_CHALLENGES_DICT: Record<string, Omit<VocabItem, "source" | "id">> = {
  danh_lam_q1: {
    word: "Di sản thế giới",
    meaning: "World Heritage Site",
    explanation: "Danh hiệu danh giá phong tặng cho vùng vịnh, hòn đảo hay công trình có sắc thái tự nhiên hay văn hoá nổi bật toàn cầu.",
    example: "UNESCO vinh danh Vịnh Hạ Long là Di sản thế giới nhờ kiến tạo địa chất đặc hữu vô song.",
    topicId: "danh_lam",
    topicName: "Danh lam thắng cảnh",
    topicIcon: "🏔️",
  },
  du_lich_s1: {
    word: "Nghỉ dưỡng",
    meaning: "Resort Leisure",
    explanation: "Hoạt động lữ hành đi xa kết cấu hồi phục sức khỏe toàn thân thông qua nghỉ ngơi nhàn nhã.",
    example: "Du khách lựa chọn du lịch nghỉ dưỡng thay thế cho đi chơi đơn thuần để xua tan mệt mỏi.",
    topicId: "du_lich",
    topicName: "Du lịch",
    topicIcon: "✈️",
  },
  dich_vu_q1: {
    word: "Trải nghiệm",
    meaning: "Sự thấu cảm khách hàng",
    explanation: "Đầu ra cảm nhận cốt lõi của ngành dịch vụ xuất sắc khi phục vụ chu đáo, mang tính thấu cảm cao.",
    example: "Trải nghiệm khách hàng tuyệt hảo mang đến cơ hội đột phá doanh thu mới mẻ.",
    topicId: "dich_vu",
    topicName: "Dịch vụ",
    topicIcon: "🛎️",
  },
  moi_truong_q1: {
    word: "Bảo tồn",
    meaning: "Conservation / Preservation",
    explanation: "Giữ lại nguyên trạng để không bị mất đi, hư hao hay hao hụt trong hệ sinh thái thiên nhiên hoang dã.",
    example: "Từ 'bảo tồn' đại diện cho ý thức bảo vệ vẻ đẹp đa dạng sinh học dồi dào.",
    topicId: "moi_truong",
    topicName: "Môi trường",
    topicIcon: "🌿",
  },
  giao_duc_q1: {
    word: "Giảng dạy",
    meaning: "Teaching",
    explanation: "Tiến trình truyền thụ kiến thức hệ thống, kích phát tư duy và thắp sáng năng lực tiềm tàng của môn sinh.",
    example: "Giảng dạy hiệu quả kết hợp rèn luyện SCAMPER giúp gia tăng tối đa sự tự chủ học thuật.",
    topicId: "giao_duc",
    topicName: "Giáo dục",
    topicIcon: "🎓",
  },
  moi_truong_s1: {
    word: "Ô nhiễm",
    meaning: "Pollution",
    explanation: "Trạng thái các thành tố tự nhiên bị phá hoại, nhiễm bẩn nặng vấy tác hại tiêu cực đến sức khỏe con người.",
    example: "Cần tìm từ vựng thay thế sáng tạo định danh cho trạng thái ô nhiễm nguồn nước.",
    topicId: "moi_truong",
    topicName: "Môi trường",
    topicIcon: "🌿",
  },
  giao_duc_c1: {
    word: "Sinh xuất",
    meaning: "Stem word 'SINH'",
    explanation: "Âm tiết trung tâm trong các từ học thuật chỉ học đường như tuyển sinh, thí sinh, sinh viên, giáo sinh.",
    example: "Chữ 'sinh' chỉ vai trò giáo dục quan trọng biểu thị sự sản sinh thế hệ tiềm lực ngày mai.",
    topicId: "giao_duc",
    topicName: "Giáo dục",
    topicIcon: "🎓",
  },
  viec_lam_r1: {
    word: "Quy trình",
    meaning: "Workflow / Procedure",
    explanation: "Hệ thống trình tự thao tác, hạch toán công việc rành mạch để duy trì hiệu năng vận hành chuẩn mực lý tưởng.",
    example: "Đảo cấu trúc của từ 'Quy trình' kích hoạt phản xạ phân tích ngữ nghĩa đảo ngược ấn tượng.",
    topicId: "viec_lam",
    topicName: "Việc làm",
    topicIcon: "💼",
  },
};

export default function MyVocabulary({ tasks, completedTasks, soundEnabled }: MyVocabularyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("all");
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  
  // Selected single item viewing details
  const [activeItem, setActiveItem] = useState<VocabItem | null>(null);
  const [notesText, setNotesText] = useState("");
  const [allNotes, setAllNotes] = useState<Record<string, string>>(() => {
    const raw = localStorage.getItem("viling_vocab_notes");
    return raw ? JSON.parse(raw) : {};
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Re-build custom terms vocabulary list based on storage on open/mount
  useEffect(() => {
    // 1. Get learned words (from study advanced section)
    const rawLearnedIds = localStorage.getItem("viling_learned_words");
    const learnedIds: string[] = rawLearnedIds ? JSON.parse(rawLearnedIds) : [];
    
    const items: VocabItem[] = [];

    // Add Advanced learned items
    learnedIds.forEach((id) => {
      const info = ADVANCED_WORDS_DICT[id];
      if (info) {
        items.push({
          ...info,
          source: "Chuyên Sâu",
        });
      }
    });

    // 2. Add Completed Challenge items
    completedTasks.forEach((taskId) => {
      // Is it a well-known core task?
      const coreInfo = CORE_CHALLENGES_DICT[taskId];
      if (coreInfo) {
        // Prevent duplicate if word exists
        if (!items.some((i) => i.word.toLowerCase() === coreInfo.word.toLowerCase())) {
          items.push({
            id: taskId,
            ...coreInfo,
            source: "Thử Thách",
          });
        }
      } else {
        // AI generated or local dynamic task lookup
        const foundTask = tasks.find((t) => t.id === taskId);
        if (foundTask) {
          // Attempt using regex pattern on question to extract target highlighted term
          const spanMatch = foundTask.question.match(/<span[^>]*>(?:["“'"”&quot;]+)?([^<>"“”'']*)(?:["“'"”&quot;]+)?<\/span>/i);
          const extractedTerm = spanMatch ? spanMatch[1].trim() : "";
          
          if (extractedTerm && extractedTerm.length < 35) {
            // Capitalize word
            const formattedWord = extractedTerm.charAt(0).toUpperCase() + extractedTerm.slice(1);
            if (!items.some((i) => i.word.toLowerCase() === formattedWord.toLowerCase())) {
              const meta = TOPIC_METADATA[foundTask.topicId] || TOPIC_METADATA.chung;
              items.push({
                id: foundTask.id,
                word: formattedWord,
                meaning: foundTask.typeLabel || "Từ vựng AI",
                explanation: foundTask.successMsg || "Đã chinh phục thành công thử thách thực tế này hằng ngày.",
                example: `Câu hỏi rèn luyện nơi bạn hoàn thành: "${foundTask.question.replace(/<[^>]*>/g, '')}"`,
                topicId: foundTask.topicId,
                topicName: meta.name,
                topicIcon: meta.icon,
                source: "Thử Thách",
              });
            }
          }
        }
      }
    });

    setVocabList(items);
  }, [completedTasks, tasks, isOpen]);

  const handleOpenItem = (item: VocabItem) => {
    setActiveItem(item);
    setNotesText(allNotes[item.id] || "");
    playBeep(650, "sine", 0.08, soundEnabled);
  };

  const handleSaveNotes = () => {
    if (!activeItem) return;
    
    const updated = {
      ...allNotes,
      [activeItem.id]: notesText,
    };
    
    setAllNotes(updated);
    localStorage.setItem("viling_vocab_notes", JSON.stringify(updated));

    // Show temporary beautiful success feedback
    setToastMessage("Đã cập nhật ghi chú cá nhân! 💾");
    playBeep(980, "sine", 0.1, soundEnabled);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Filter words
  const filteredItems = vocabList.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (allNotes[item.id] && allNotes[item.id].toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTopic = selectedTopicId === "all" || item.topicId === selectedTopicId;

    return matchesSearch && matchesTopic;
  });

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4.5 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗂️</span>
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider">Từ vựng của tôi</h3>
            <span className="text-[10px] text-[var(--text-sub)] font-semibold">
              Bộ từ điển cá nhân đa chiều của bạn
            </span>
          </div>
        </div>
        
        {/* Count Indicator */}
        <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
          {vocabList.length} từ đã học
        </span>
      </div>

      <p className="text-[11px] text-[var(--text-sub)] leading-snug">
        Tổng hợp tất cả từ khóa học thuật nâng cao từ các bộc lộ kỹ thuật SCAMPER và từ vựng tích lũy. Nhấn để đọc giải nghĩa hoặc viết ghi chú tùy biến.
      </p>

      {/* Button Open */}
      <button
        onClick={() => {
          setIsOpen(true);
          playBeep(580, "sine", 0.08, soundEnabled);
        }}
        className="cursor-pointer w-full text-center bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs tracking-wider uppercase transition-colors shadow-md shadow-red-700/10 active:scale-98"
      >
        📖 Mở Sổ Tay Từ Vựng
      </button>

      {/* Slide-Up Overlay Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-3 font-sans backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[var(--app-bg)] w-full max-w-[395px] h-[84vh] rounded-3xl border border-[var(--border-color)] overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-4.5 relative">
                <button
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer absolute top-4.5 right-4.5 w-7 h-7 rounded-full bg-black/25 flex items-center justify-center hover:bg-black/40 text-sm font-bold text-white transition-opacity border border-white/10"
                >
                  ✕
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🗂️</span>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">
                      Từ Điển Tự Thuật
                    </span>
                    <h3 className="text-lg font-black tracking-tight leading-tight">Từ vựng của tôi</h3>
                  </div>
                </div>
              </div>

              {/* Tooling filters */}
              <div className="p-4 bg-[var(--card-bg)] border-b border-[var(--border-color)] space-y-3">
                {/* Search input field */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm từ khóa, nghĩa hoặc ghi chú..."
                    className="w-full pl-8.5 pr-3 py-2 text-xs border border-[var(--border-color)] rounded-xl bg-[var(--input-bg)] text-[var(--text-main)] font-semibold outline-none focus:border-red-600 transition-colors"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-[var(--text-sub)] opacity-70">🔍</span>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2 text-xs text-[var(--text-sub)] hover:text-red-500 font-bold"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                {/* Micro Topic filter chips inside dictionary */}
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[10px] font-bold">
                  {[
                    { id: "all", label: "Tất cả", icon: "🌐" },
                    { id: "danh_lam", label: "Danh lam thắng cảnh", icon: "🏔️" },
                    { id: "du_lich", label: "Du lịch", icon: "✈️" },
                    { id: "dich_vu", label: "Dịch vụ", icon: "🛎️" },
                    { id: "moi_truong", label: "Môi trường", icon: "🌿" },
                    { id: "giao_duc", label: "Giáo dục", icon: "🎓" },
                    { id: "viec_lam", label: "Việc làm", icon: "💼" },
                  ].map((chip) => {
                    const isSelected = selectedTopicId === chip.id;
                    return (
                      <button
                        key={chip.id}
                        onClick={() => setSelectedTopicId(chip.id)}
                        className={`cursor-pointer px-2.5 py-1.5 rounded-lg border flex items-center gap-1 shrink-0 transition-all ${
                          isSelected
                            ? "bg-red-600 text-white border-red-600 shadow-sm"
                            : "bg-[var(--input-bg)] text-[var(--text-sub)] border-[var(--border-color)] hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span>{chip.icon}</span>
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content Areas split: Left index list / Right detail if chosen, or toggle style */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--app-bg)] relative">
                
                {toastMessage && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-black shadow-lg px-4 py-2 rounded-full z-30 animate-bounce flex items-center gap-1.5 border border-white/20">
                    <span>💾</span>
                    <span>{toastMessage}</span>
                  </div>
                )}

                {activeItem ? (
                  /* DETAILED SINGLE VIEW WITH NOTES WRITER */
                  <div className="space-y-4 animate-fade-in">
                    {/* Back header button */}
                    <button
                      onClick={() => setActiveItem(null)}
                      className="cursor-pointer inline-flex items-center gap-1.5 text-xxs font-black text-red-600 uppercase bg-red-600/10 hover:bg-red-600/15 p-2 rounded-lg transition-transform"
                    >
                      ← Quay lại danh bạ từ vựng
                    </button>

                    {/* Word info card */}
                    <div className="bg-[var(--card-bg)] border-2 border-[#b91c1c]/15 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{activeItem.topicIcon}</span>
                            <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded bg-slate-300/20 dark:bg-slate-700/40 text-[var(--text-sub)]">
                              {activeItem.topicName}
                            </span>
                          </div>
                          <h4 className="text-xl font-black text-[var(--text-main)] tracking-tight">
                            {activeItem.word}
                          </h4>
                          <p className="text-xs text-[#b91c1c] font-bold mt-0.5">
                            {activeItem.meaning}
                          </p>
                        </div>

                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                          activeItem.source === "Chuyên Sâu"
                            ? "bg-amber-500/15 text-amber-600"
                            : "bg-blue-500/15 text-blue-600"
                        }`}>
                          {activeItem.source}
                        </span>
                      </div>

                      {/* Explanation paragraph */}
                      <div className="pt-3 border-t border-[var(--border-color)] space-y-1">
                        <span className="text-[10px] font-black uppercase text-[var(--text-sub)]">Định Nghĩa / Gợi Ý:</span>
                        <p className="text-xs text-[var(--text-main)] leading-relaxed bg-[var(--input-bg)] p-3 rounded-xl border border-[var(--border-color)]">
                          {activeItem.explanation}
                        </p>
                      </div>

                      {/* Display Example sentence */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-[var(--text-sub)]">Ngữ Cảnh Thực Tế:</span>
                        <p className="text-xs italic text-[var(--text-main)] leading-relaxed opacity-90 pl-3 border-l-2 border-red-500">
                          {activeItem.example}
                        </p>
                      </div>
                    </div>

                    {/* Personal Notes Section */}
                    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4.5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-[var(--text-main)] flex items-center gap-1.5">
                          ✍️ Ghi Chú Cá Nhân
                          {allNotes[activeItem.id] && (
                            <span className="text-[8px] uppercase bg-green-500 text-white font-mono px-1.5 py-0.5 rounded-full">
                              Đã lưu
                            </span>
                          )}
                        </label>
                        <span className="text-[9px] text-[var(--text-sub)] italic font-semibold">
                          Tự do chỉnh sửa ghi chú học liệu của bạn
                        </span>
                      </div>

                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="Ví dụ: dùng từ này thay thế cho 'môi trường xanh', cần lưu ý cách dùng, từ trái nghĩa là..."
                        rows={4}
                        className="w-full p-3 border border-[var(--border-color)] rounded-xl bg-[var(--input-bg)] text-xs text-[var(--text-main)] font-semibold outline-none focus:border-red-600 resize-none transition-all leading-normal"
                      />

                      <button
                        onClick={handleSaveNotes}
                        className="cursor-pointer w-full text-center bg-[#b91c1c] text-white py-2.5 rounded-xl text-xs font-black tracking-wide uppercase hover:bg-red-700 transition-colors shadow-sm"
                      >
                        💾 Lưu Ghi Chú Ngay
                      </button>
                    </div>
                  </div>
                ) : (
                  /* INDEX LIST VIEW */
                  <div className="space-y-2.5">
                    {filteredItems.length === 0 ? (
                      <div className="text-center py-14 px-4">
                        <span className="text-4xl block mb-2">💡</span>
                        <h4 className="font-extrabold text-xs text-[var(--text-main)] uppercase tracking-wide">
                          {vocabList.length === 0 ? "Chưa có từ vựng nào" : "Không tìm thấy kết quả"}
                        </h4>
                        <p className="text-[10px] text-[var(--text-sub)] max-w-xxs mx-auto leading-normal mt-1 opacity-85">
                          {vocabList.length === 0
                            ? "Giải quyết chính xác các bài tập hoặc bấm 'Thuộc lòng' từ vựng nâng cao để ghi danh sách vào sổ tay."
                            : "Không có từ khóa hoặc ghi chú nào phù hợp với biểu thức tìm kiếm hiện tại."}
                        </p>
                      </div>
                    ) : (
                      filteredItems.map((item) => {
                        const noteSnippet = allNotes[item.id];
                        return (
                          <motion.div
                            key={item.id}
                            whileHover={{ scale: 0.99, x: 2 }}
                            onClick={() => handleOpenItem(item)}
                            className="bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-red-500/20 hover:bg-slate-500/5 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 shadow-xs"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <span className="text-2xl p-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] shadow-xs shrink-0">
                                {item.topicIcon}
                              </span>
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-xs font-black text-[var(--text-main)] tracking-tight truncate">
                                  {item.word}
                                </span>
                                <span className="text-[10px] text-[var(--text-sub)] truncate leading-normal">
                                  {item.meaning}
                                </span>
                                {noteSnippet && (
                                  <span className="text-[9px] text-green-600 font-extrabold flex items-center gap-0.5 italic mt-0.5 truncate">
                                    📝 Ghi chú: &quot;{noteSnippet}&quot;
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0 gap-1">
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                item.source === "Chuyên Sâu"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              }`}>
                                {item.source}
                              </span>
                              <span className="text-[9px] text-[var(--text-sub)] opacity-70">
                                Chi tiết →
                              </span>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Footer context */}
              <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--border-color)] text-center text-[10px] text-[var(--text-sub)] font-semibold flex items-center justify-between">
                <span>Viling Glossary Matrix v1.4</span>
                <span className="font-bold text-[#b91c1c]">{vocabList.length} thuật ngữ</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
