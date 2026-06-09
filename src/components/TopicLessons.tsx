/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Task } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { playBeep } from "../utils/audio";

interface TopicLessonsProps {
  tasks: Task[];
  completedTasks: string[];
  mistakes: string[];
  onComplete: (taskId: string, xpEarned: number) => void;
  setMistakes: React.Dispatch<React.SetStateAction<string[]>>;
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  soundEnabled: boolean;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setXpHistory: React.Dispatch<React.SetStateAction<any[]>>;
  activeOpenTopic: string | null;
  setActiveOpenTopic: (topicId: string | null) => void;
  onWordLearned?: (wordId: string) => void;
}

let activeAudio: HTMLAudioElement | null = null;

const speakWord = (text: string) => {
  try {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }

    // Clean string from brackets and emoji components
    const cleanedText = text
      .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF])/g, '')
      .replace(/[()_#/[\]]/g, ' ')
      .trim();
      
    if (!cleanedText) return;

    const selectedVoiceName = localStorage.getItem("viling_selected_voice") || "google-tts";

    if (selectedVoiceName === "google-tts") {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(cleanedText)}`;
      const audio = new Audio(ttsUrl);
      activeAudio = audio;
      
      audio.play().catch(err => {
        console.warn("Google TTS stream blocked or failed, falling back to Web Speech Synthesis:", err);
        // Fallback
        if (typeof window !== "undefined" && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanedText);
          utterance.lang = "vi-VN";
          utterance.rate = 0.88;
          window.speechSynthesis.speak(utterance);
        }
      });
    } else {
      if (typeof window !== "undefined" && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = "vi-VN";
        utterance.rate = 0.88;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.name === selectedVoiceName);
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
        window.speechSynthesis.speak(utterance);
      }
    }
  } catch (error) {
    console.warn("Google TTS audio system failure in TopicLessons:", error);
  }
};

interface TopicCardInfo {
  id: string;
  name: string;
  icon: string;
  desc: string;
  difficulty: "Dễ" | "Trung bình" | "Khó" | "Nâng cao";
  color: string;
}

const STATIC_TOPICS: TopicCardInfo[] = [
  {
    id: "danh_lam",
    name: "Danh lam thắng cảnh",
    icon: "🏔️",
    desc: "Khám phá từ vựng miêu tả kỳ quan tự nhiên, kiến tạo địa chất đặc hữu và di sản văn hoá nhân loại.",
    difficulty: "Dễ",
    color: "from-fuchsia-500/10 to-purple-600/10 border-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400"
  },
  {
    id: "du_lich",
    name: "Du lịch",
    icon: "✈️",
    desc: "Học tập hệ thuật ngữ lữ hành sinh thái, hành trình thám hiểm phiêu lưu và lưu trú văn hoá bản địa.",
    difficulty: "Trung bình",
    color: "from-cyan-500/10 to-sky-600/10 border-cyan-500/15 text-cyan-700 dark:text-cyan-400"
  },
  {
    id: "dich_vu",
    name: "Dịch vụ",
    icon: "🛎️",
    desc: "Đột phá từ vựng tối ưu hóa trải nghiệm khách hàng, quản trị vận hành và hậu mãi dịch vụ chu đáo.",
    difficulty: "Khó",
    color: "from-rose-500/10 to-pink-600/10 border-rose-500/15 text-rose-700 dark:text-rose-400"
  },
  {
    id: "moi_truong",
    name: "Môi trường",
    icon: "🌿",
    desc: "Ôn tập thuật ngữ sinh thái học, đa dạng sinh học và các bài toán thích nghi tự nhiên bền vững.",
    difficulty: "Trung bình",
    color: "from-emerald-500/10 to-teal-600/10 border-emerald-500/15 text-emerald-700 dark:text-emerald-400"
  },
  {
    id: "giao_duc",
    name: "Giáo dục",
    icon: "🎓",
    desc: "Khám phá từ vựng chuyên ngành mẫu đào tạo, chương trình chất lượng và quyền học thuật học đường.",
    difficulty: "Dễ",
    color: "from-blue-500/10 to-indigo-600/10 border-blue-500/15 text-blue-700 dark:text-blue-400"
  },
  {
    id: "viec_lam",
    name: "Việc làm",
    icon: "💼",
    desc: "Nghiên cứu về thị trường nhân sự tuyển dụng, quản trị nhân lực và phương án tối ưu năng suất lẻ.",
    difficulty: "Khó",
    color: "from-amber-500/10 to-orange-600/10 border-amber-500/15 text-amber-500 dark:text-amber-400"
  }
];

interface SampleWord {
  id: string;
  word: string;
  translationOrMeaning: string;
  partOfSpeech: string;
  example: string;
  explanation: string;
}

const ADVANCED_WORDS_BY_TOPIC: Record<string, SampleWord[]> = {
  danh_lam: [
    {
      id: "mw_dl_1",
      word: "Di sản thiên nhiên",
      translationOrMeaning: "Natural Heritage",
      partOfSpeech: "Danh từ",
      example: "Địa hình karst của Vịnh Hạ Long là di sản thiên nhiên thế giới vô giá.",
      explanation: "Cảnh quan thiên nhiên hoặc vùng địa lý được bảo vệ nghiêm ngặt nhờ giá trị thẩm mỹ, khoa học hoặc sinh thái học độc đáo."
    },
    {
      id: "mw_dl_2",
      word: "Cảnh quan kỳ vĩ",
      translationOrMeaning: "Magnificent Landscape",
      partOfSpeech: "Danh từ",
      example: "Đèo Mã Pí Lèng mang đến một cảnh quan kỳ vĩ lôi cuốn hàng triệu lữ khách.",
      explanation: "Góc nhìn bao quát tuyệt đẹp, hoành tráng gây ấn tượng cực kỳ mạnh mẽ cho người thưởng ngoạn."
    }
  ],
  du_lich: [
    {
      id: "mw_tour_1",
      word: "Du lịch sinh thái",
      translationOrMeaning: "Ecotourism",
      partOfSpeech: "Danh từ",
      example: "Xu hướng du lịch sinh thái đang ngày một phát triển mạnh tại vùng ngập mặn.",
      explanation: "Mô hình du lịch dựa vào thiên nhiên, kết hợp bảo tồn, giáo dục môi trường và cải thiện sinh kế địa phương."
    },
    {
      id: "mw_tour_2",
      word: "Hành trình khám phá",
      translationOrMeaning: "Exploration Itinerary",
      partOfSpeech: "Cụm danh từ",
      example: "Chúng tôi lên kế hoạch cho một hành trình khám phá di sản miền Trung Việt Nam.",
      explanation: "Chuyến du ngoạn đi sâu tìm hiểu văn hóa bản địa, lịch sử phong phú của một vùng đất mới mẻ."
    }
  ],
  dich_vu: [
    {
      id: "mw_srv_1",
      word: "Trải nghiệm khách hàng",
      translationOrMeaning: "Customer Experience (CX)",
      partOfSpeech: "Danh từ",
      example: "Nâng cấp trải nghiệm khách hàng tối ưu giúp giữ chân người dịch dụng lâu dài.",
      explanation: "Toàn bộ cảm xúc, nhận thức tích tụ của khách hàng sau mọi tương tác với thương hiệu hay nhà cung ứng."
    },
    {
      id: "mw_srv_2",
      word: "Hậu mãi chu đáo",
      translationOrMeaning: "Attentive After-Sales Service",
      partOfSpeech: "Cụm danh từ",
      example: "Chế độ hậu mãi chu đáo là cam kết vàng nâng tầm uy tín doanh nghiệp.",
      explanation: "Sự chăm sóc, hỗ trợ kỹ thuật và bảo hành tuyệt vời sau khi hoàn thành giao dịch mua bán sản phẩm."
    }
  ],
  moi_truong: [
    {
      id: "mw_mt_1",
      word: "Đa dạng sinh học",
      translationOrMeaning: "Biodiversity",
      partOfSpeech: "Danh từ",
      example: "Bảo tồn tính đa dạng sinh học là chìa khóa then chốt của sự sống bền vững.",
      explanation: "Sự phong phú cùng chung sống hoà hợp của hàng ngàn sinh vật quý hiếm trong một vùng đệm hệ sinh thái tự nhiên."
    },
    {
      id: "mw_mt_2",
      word: "Bảo tồn bền vững",
      translationOrMeaning: "Sustainable Conservation",
      partOfSpeech: "Cụm danh động từ",
      example: "Ban quản lý rừng hướng đến mục tiêu tiếp tục bảo tồn bền vững nguồn gen gỗ quý.",
      explanation: "Gìn giữ nguyên trạng, bảo vệ nghiêm ngặt chống hao hụt mà vẫn mang lại lợi ích giáo dục bền lâu."
    },
    {
      id: "mw_mt_3",
      word: "Thải carbon thấp",
      translationOrMeaning: "Low-Carbon Emission",
      partOfSpeech: "Tính từ",
      example: "Sử dụng xe điện là một hành động thiết thực của mô hình đô thị thải carbon thấp.",
      explanation: "Sự hạn chế tối đa khí thải chứa carbon dioxid ra bầu khí quyển nhằm đẩy lùi hiện tượng trái đất nóng lên."
    }
  ],
  giao_duc: [
    {
      id: "mw_gd_1",
      word: "Chương trình tích hợp",
      translationOrMeaning: "Integrated Curriculum",
      partOfSpeech: "Danh từ",
      example: "Giáo án mới lồng ghép các hoạt động ngoại khóa dưới mô hình chương trình tích hợp đa ngành.",
      explanation: "Quy trình thiết kế giảng dạy liên thông, đan xen kiến thức khoa học và xã hội giúp kích thích óc đa chiều."
    },
    {
      id: "mw_gd_2",
      word: "Kiểm định chất lượng",
      translationOrMeaning: "Quality Accreditation",
      partOfSpeech: "Cụm danh từ",
      example: "Đại học ViLing tự hào kiểm định chất lượng đạt mức tối đa theo thang nhận diện toàn cầu.",
      explanation: "Tiến trình khảo sát đánh giá hệ thống, khách quan toàn bộ hoạt động đào tạo của một cơ sở học vấn."
    },
    {
      id: "mw_gd_3",
      word: "Tự chủ học thuật",
      translationOrMeaning: "Academic Autonomy",
      partOfSpeech: "Danh từ",
      example: "Giáo sư được giao quyền tự chủ học thuật cao để thử nghiệm phương án soạn từ SCAMPER.",
      explanation: "Quyền hạn độc lập trong giảng luận, xác định phương pháp giảng khoa mới mẻ mà không bị bó hẹp nguyên mẫu cũ."
    }
  ],
  viec_lam: [
    {
      id: "mw_vl_1",
      word: "Tái cấu trúc nhân sự",
      translationOrMeaning: "HR Restructuring",
      partOfSpeech: "Danh từ",
      example: "Hội đồng quản trị áp dụng tái cấu trúc nhân sự trực tuyến để giảm tải tối đa bộ máy hành chính.",
      explanation: "Việc thay đổi sự phân bổ quản trị và điều phối lại nguồn lao động, thúc đẩy vai trò nòng cốt hiệu quả."
    },
    {
      id: "mw_vl_2",
      word: "Thị trường lao động",
      translationOrMeaning: "Labor Market",
      partOfSpeech: "Danh từ",
      example: "Xu hướng trí tuệ nhân tạo tăng tốc đang mở ra cuộc chạy đua khốc liệt trên thị trường lao động.",
      explanation: "Khái niệm kinh tế biểu thị quan hệ cung và cầu về sức lao động, nơi ứng viên tìm công việc tối ưu nhất."
    },
    {
      id: "mw_vl_3",
      word: "Hiệu năng làm việc",
      translationOrMeaning: "Work Productivity",
      partOfSpeech: "Danh từ",
      example: "Chăm chỉ kết hợp rèn luyện đúng giờ giúp nâng cao đáng kể hiệu năng làm việc hằng ngày.",
      explanation: "Thước đo khối lượng giá trị đầu ra, được hạch toán chặt chẽ trên mỗi đơn vị sức lao động chi ra."
    }
  ]
};

export interface ScamperGuideItem {
  letter: string;
  name: string;
  icon: string;
  concept: string;
  exampleOriginal: string;
  exampleImproved: string;
  explanation: string;
}

export const SCAMPER_GUIDE_BY_TOPIC: Record<string, ScamperGuideItem[]> = {
  danh_lam: [
    {
      letter: "S",
      name: "Substitute (Thay thế)",
      icon: "🔄",
      concept: "Thay thế các tính từ quá phổ biến bằng các từ Hán-Việt hay từ láy đắt giá.",
      exampleOriginal: "Vịnh Hạ Long có nhiều hòn đảo trông rất đẹp và phong phú.",
      exampleImproved: "Hệ thống đảo đá tại Vịnh Hạ Long kiến tạo nên một quần thể kỳ vĩ và trùng điệp.",
      explanation: "Thay thế 'nhiều', 'rất đẹp', 'phong phú' bằng 'kiến tạo', 'kỳ vĩ', 'trùng điệp' giúp tăng xúc cảm thẩm mỹ."
    },
    {
      letter: "C",
      name: "Combine (Kết hợp)",
      icon: "🤝",
      concept: "Kết hợp từ chỉ thiên nhiên với từ chỉ nghệ thuật/nhân tạo để tạo phép ẩn dụ.",
      exampleOriginal: "Sương mù bao phủ đỉnh núi Fansipan giống như một bức tranh vẽ.",
      exampleImproved: "Bức màn sương mờ dệt nên một bức tranh thủy mặc bao phủ trọn vẹn đỉnh Fansipan.",
      explanation: "Sự kết hợp giữa động từ dệt ('dệt nên') và thuật ngữ hội họa ('tranh thủy mặc') mang lại chiều sâu nghệ thuật."
    },
    {
      letter: "A",
      name: "Adapt (Thích nghi)",
      icon: "🧩",
      concept: "Vận dụng các thuật ngữ lịch sử, khảo cổ hoặc sinh học vào miêu tả cảnh quan.",
      exampleOriginal: "Quần thể Tràng An có lịch sử lâu đời và nhiều hang động tự nhiên quý.",
      exampleImproved: "Tràng An đóng vai trò như một bảo tàng địa chất sống, lưu giữ vết tích trùng điệp của tự nhiên.",
      explanation: "Áp dụng cấu trúc 'bảo tàng địa chất sống' dải từ địa chất học vào hành trình văn hoá di sản."
    },
    {
      letter: "M",
      name: "Modify (Cải biên)",
      icon: "📈",
      concept: "Cường điệu hóa kích cỡ hoặc kéo giãn không gian bằng lối miêu tả đa giác quan.",
      exampleOriginal: "Đứng từ trên đèo Hải Vân nhìn xuống biển cả rất rộng lớn.",
      exampleImproved: "Từ đỉnh đèo Hải Vân mở ra tầm nhìn vô cực, ôm trọn đại dương xanh thẳm khôn cùng.",
      explanation: "Cải biên định lượng không gian bằng từ 'vô cực' và 'khôn cùng' kiến tạo nên cảm quan tự do tột bậc."
    },
    {
      letter: "P",
      name: "Put to other uses (Bối cảnh mới)",
      icon: "💡",
      concept: "Xem cảnh quan như một thực thể có tâm hồn, có hành động biểu ý nhân hóa sâu sắc.",
      exampleOriginal: "Thác Bản Giốc đổ nước xuống sông rất mạnh tạo ra nhiều tiếng ồn.",
      exampleImproved: "Thác Bản Giốc tấu lên bản hùng ca đại ngàn vô tận giữa chốn biên cương hùng vĩ.",
      explanation: "Đưa trường từ vựng âm nhạc ('tấu lên bản hùng ca') vào âm thanh của dòng thác đổ nhân hóa thiên nhiên vô cùng tinh tế."
    },
    {
      letter: "E",
      name: "Eliminate (Lược bỏ)",
      icon: "✂️",
      concept: "Cắt bỏ những từ thừa thãi như 'rất nhiều', 'được', 'bởi vì' để câu văn cô súc.",
      exampleOriginal: "Phong Nha Kẻ Bàng được người ta biết đến rất nhiều bởi vì nó có hang động rất là dài và đẹp.",
      exampleImproved: "Phong Nha - Kẻ Bàng nức tiếng viễn xứ nhờ sở hữu hệ thống hang động thạch nhũ nguyên sơ dài vô tận.",
      explanation: "Lược bỏ cấu từ trung gian rườm rà chủ động/bị động giúp chuyển giao thông điệp dồn dập, mạnh mẽ."
    },
    {
      letter: "R",
      name: "Reverse (Đảo ngược)",
      icon: "⟲",
      concept: "Đảo ngữ tính từ hoặc động từ lên đầu câu để tạo nhịp điệu nhấn mạnh hình ảnh.",
      exampleOriginal: "Ruộng bậc thang Mù Cang Chải trông óng ả rực rỡ dưới nắng chiều thu.",
      exampleImproved: "Óng ả sắc vàng thu, những thửa ruộng bậc thang Mù Cang Chải uốn lượn ôm trọn sườn đồi.",
      explanation: "Đưa cụm từ 'Óng ả sắc vàng thu' lên đầu câu lập tức lôi cuốn thị giác người đọc vào màu sắc chủ đạo trước tiên."
    }
  ],
  du_lich: [
    {
      letter: "S",
      name: "Substitute (Thay thế)",
      icon: "🔄",
      concept: "Thay thế các động từ di chuyển rập khuôn thành các từ ngữ hành trình thi vị.",
      exampleOriginal: "Khách du lịch đi bộ rất mỏi chân trên những con đường ở Đà Lạt.",
      exampleImproved: "Du khách thư thả bách bộ trên những cung đường dốc thoai thoải ngập tràn thông reo tại Đà Lạt.",
      explanation: "Thay thế 'đi bộ rất mỏi chân' bằng hành động nghệ thuật mang tính tận hưởng hành trình 'bách bộ'."
    },
    {
      letter: "C",
      name: "Combine (Kết hợp)",
      icon: "🤝",
      concept: "Ghép nối ẩm thực bản địa với hành trình lịch sử tâm linh để tạo ra cấu từ đa tầng.",
      exampleOriginal: "Ăn đồ ăn Huế rất ngon và cảm nhận được lịch sử xây dựng cung điện cũ.",
      exampleImproved: "Thưởng thức phong vị ẩm thực Huế là cuộc hành trình thưởng lãm tinh hoa vương triều vàng son một thuở.",
      explanation: "Sự kết hợp giữa hoạt động vị giác vật lý ('ăn đồ ăn') với sự hoài niệm lịch sử tâm hồn tạo ra trải nghiệm sống động."
    },
    {
      letter: "A",
      name: "Adapt (Thích nghi)",
      icon: "🧩",
      concept: "Sử dụng ngôn ngữ của vũ trụ học, thiên văn học hoặc hội họa để miêu tả chuyến đi.",
      exampleOriginal: "Đêm ở sa mạc cát Mũi Né trời có rất nhiều sao lấp lánh rõ ràng.",
      exampleImproved: "Giữa sa mạc cát Mũi Né, bầu trời đêm tựa như một dải ngân hà huyền bí lộng lẫy đang chuyển dịch nhẹ nhàng.",
      explanation: "Mượn góc nhìn vĩ mô của thiên văn học ('dải ngân hà chuyển dịch') để làm siêu thực hóa hình ảnh bầu trời đêm."
    },
    {
      letter: "M",
      name: "Modify (Cải biên)",
      icon: "📈",
      concept: "Cài biên gia tăng thuộc tính cảm xúc bên trong tâm trí lữ khách lên mức tối đa.",
      exampleOriginal: "Chiêm bái chùa cổ ở cố đô Hoa Lư giúp lòng thanh tịnh, dễ chịu đi nhiều.",
      exampleImproved: "Hương trầm thoang thoảng nơi chính điện Hoa Lư giúp gột rửa hoàn toàn ưu phiền, đưa tâm hồn về cõi tĩnh lặng tuyệt đối.",
      explanation: "Sử dụng 'gột rửa hoàn toàn', 'tĩnh lặng tuyệt đối' thay vì 'dễ chịu đi nhiều' mang đến cảm quan thăng hoa tinh thần."
    },
    {
      letter: "P",
      name: "Put to other uses (Bối cảnh mới)",
      icon: "💡",
      concept: "Vận dụng chuyến hành trình địa lý như một biểu tượng của sự học hỏi và tu dưỡng trí tuệ.",
      exampleOriginal: "Đi tour trekking rừng Nam Cát Tiên mệt nhưng biết thêm nhiều loài cây lạ.",
      exampleImproved: "Hành trình trekking Nam Cát Tiên là khóa học khai phóng nhãn quan giữa lòng thiên nhiên hoang dã.",
      explanation: "Xem chuyến đi leo núi như một 'khóa học khai phóng nhãn quan' mở rộng bối cảnh ứng dụng từ lữ hành vật lý sang rèn luyện tư duy."
    },
    {
      letter: "E",
      name: "Eliminate (Lược bỏ)",
      icon: "✂️",
      concept: "Cắt bỏ những câu dẫn trung gian phiếm chỉ để tập trung đặc tả linh hồn điểm đến.",
      exampleOriginal: "Chúng ta cần phải đi đến đó để mục kích vì hễ ai đến Sa Pa cũng phải công nhận sương mù rất đặc biệt.",
      exampleImproved: "Đến Sa Pa để tự mình say đắm trong làn sương huyền ảo giăng kín lối đi.",
      explanation: "Loại bỏ hoàn toàn các ý kiến xung quanh rườm rà giúp câu có sức nặng trực diện."
    },
    {
      letter: "R",
      name: "Reverse (Đảo ngược)",
      icon: "⟲",
      concept: "Xáo trộn nhịp thời gian hoặc vị trí chủ ngữ hành động để tạo bất ngờ văn điệu.",
      exampleOriginal: "Con thuyền độc mộc lướt trên mặt hồ Ba Bể bình yên phẳng lặng trong chiều tà.",
      exampleImproved: "Phá vỡ mặt gương hồ Ba Bể phẳng lặng, con thuyền độc mộc rẽ lối lướt êm trong bóng chiều rơi.",
      explanation: "Khởi động câu văn bằng hành động bất ngờ 'Phá vỡ mặt gương lặng' thay vì chỉ miêu tả tĩnh tại thông thường."
    }
  ],
  dich_vu: [
    {
      letter: "S",
      name: "Substitute (Thay thế)",
      icon: "🔄",
      concept: "Thay thế ngôn ngữ thương mại cứng nhắc bằng ngôn ngữ quan tâm tinh tế định hướng con người.",
      exampleOriginal: "Chúng tôi cam kết bán sản phẩm chất lượng tốt và uy tín cao cho quý khách.",
      exampleImproved: "Chúng tôi đồng hành kiến tạo những giá trị sống đích thực thông qua từng giải pháp tin cậy.",
      explanation: "Thay thế 'bán sản phẩm tốt' bằng cụm từ giàu triết lý nhân sinh 'đồng hành kiến tạo giá trị sống đích thực'."
    },
    {
      letter: "C",
      name: "Combine (Kết hợp)",
      icon: "🤝",
      concept: "Kết hợp chất liệu nghệ thuật hoặc thẩm mỹ truyền thống vào quy trình dịch vụ hiện đại.",
      exampleOriginal: "Cửa hàng trà sữa thiết kế đẹp theo kiểu xưa cũ đáp ứng giới trẻ.",
      exampleImproved: "Không gian trà quán là sự giao thoa hài hòa giữa phong vị thưởng trà cổ kính trầm mặc và hơi thở đô thị năng động.",
      explanation: "Kết hợp từ 'phong vị cổ kính' và 'hơi thở năng động' định nghĩa lại giá trị không gian dịch vụ phong phú hơn."
    },
    {
      letter: "A",
      name: "Adapt (Thích nghi)",
      icon: "🧩",
      concept: "Đưa các khái niệm sinh học học, kỹ thuật số hoặc dòng chảy năng lượng vào trải nghiệm dịch vụ.",
      exampleOriginal: "Đội ngũ nhân viên tư vấn nhiệt tình, hỗ trợ gỡ rối kịp thời khi hỏi đáp.",
      exampleImproved: "Hệ thống hỗ trợ hoạt động như một hệ sinh thái tương tác đa chiều, thấu cảm và phản ứng thời gian thực linh hoạt.",
      explanation: "Thích nghi khái niệm 'hệ sinh thái tương tác' mô tả một ban chăm sóc khách hàng vận hành nhịp nhàng như sinh vật tự nhiên."
    },
    {
      letter: "M",
      name: "Modify (Cải biên)",
      icon: "📈",
      concept: "Kéo giãn tiêu chuẩn thông thường thành cam kết độc bản tối thượng tôn vinh khách hàng.",
      exampleOriginal: "Khách sạn phục vụ nước uống chào mừng chu đáo lúc khách nhận phòng nghỉ ngơi.",
      exampleImproved: "Mỗi đóa hoa trà chào mừng tại sảnh chờ đều mang theo thông điệp tiếp đón độc bản chứa chan lòng hiếu khách.",
      explanation: "Thay lý do 'nước uống chu đáo' bằng niềm tự hào 'thông điệp tiếp đón độc bản' tạo ấn tượng đẳng cấp vượt trội."
    },
    {
      letter: "P",
      name: "Put to other uses (Bối cảnh mới)",
      icon: "💡",
      concept: "Chuyển đổi vai trò của khách hàng từ 'người thụ hưởng thụ động' thành 'đồng tác giả trải nghiệm'.",
      exampleOriginal: "Khách hàng mua cà phê tự chọn hương vị theo ý thích cá nhân tại quầy pha.",
      exampleImproved: "Mỗi ly cà phê tự chọn là tác phẩm đồng sáng tạo độc đáo giữa chuyên viên barista và gu thẩm vị riêng của thực khách.",
      explanation: "Quy đổi giao dịch mua bán thành hành động 'đồng sáng tạo tác phẩm nghệ thuật' nâng cao địa vị của khách hàng."
    },
    {
      letter: "E",
      name: "Eliminate (Lược bỏ)",
      icon: "✂️",
      concept: "Cắt bỏ các thủ tục rườm rà mang tính hành chính hoặc xưng hô khuôn mẫu, tăng tốc kết xúc cảm.",
      exampleOriginal: "Quý khách vui lòng điền vào đây thật đầy đủ rồi mới đến lượt chúng tôi xử lý hỗ trợ.",
      exampleImproved: "Chạm để kết nối ngay tức thì với đội ngũ trợ lý riêng biệt của bạn.",
      explanation: "Lược bỏ mọi rào cản hành chính rườm rà, đưa ra lời hứa dịch vụ ngắn gọn, giải quyết trực tiếp tức thời."
    },
    {
      letter: "R",
      name: "Reverse (Đảo ngược)",
      icon: "⟲",
      concept: "Đảo ngược chu trình phục vụ: Để doanh nghiệp lắng nghe phản hồi và cải thiện trước khi giao phẩm.",
      exampleOriginal: "Sau khi dùng xong bữa tại nhà hàng, khách hàng viết phiếu đánh giá món ăn.",
      exampleImproved: "Lấy sự bất hoàn thiện làm động lực, chúng tôi thấu hiểu khẩu vị của bạn trước khi ngọn lửa bếp đầu tiên được thắp lên.",
      explanation: "Tiếp cận khách hàng bằng tư duy 'thấu hiểu khẩu vị trước tiên' đảo ngược hoàn toàn quy trình khảo sát sau dịch vụ."
    }
  ],
  moi_truong: [
    {
      letter: "S",
      name: "Substitute (Thay thế)",
      icon: "🔄",
      concept: "Thay thế các từ miêu tả tàn phá chung chung bằng từ ngữ diễn tả nỗi đau sinh thái trực diện.",
      exampleOriginal: "Nhiều cây xanh bị chặt phá làm cho đất đai bị xói mòn nghiêm trọng.",
      exampleImproved: "Diện tích thảm rừng tự hoại mở đường cho những đồi trọc bị rỉ máu, mất đi tấm khiên phòng hộ nguyên sơ.",
      explanation: "Thay tính từ 'bị xói mòn nghiêm trọng' bằng động từ mạnh mang tính nhân hóa như 'bị rỉ máu' tác động mạnh mẽ vào lương tâm người nghe."
    },
    {
      letter: "C",
      name: "Combine (Kết hợp)",
      icon: "🤝",
      concept: "Giao thoa giữa lối sống công nghiệp hiện đại và nghệ thuật tái sinh tuần hoàn.",
      exampleOriginal: "Mọi người nên mang túi ni-lông đi tái chế thành đồ dùng có ích khác.",
      exampleImproved: "Biến rác plastic thành những chất liệu nghệ thuật tuần hoàn, mang lại vòng đời kiêu hãnh mới cho phế phẩm.",
      explanation: "Kết hợp 'rác plastic' với khái niệm 'nghệ thuật tuần hoàn' tạo nên ý niệm tái chế thẩm mỹ."
    },
    {
      letter: "A",
      name: "Adapt (Thích nghi)",
      icon: "🧩",
      concept: "Ứng dụng các quy luật cân bằng động của vũ trụ hay cấu trúc mạch sống học vào thông điệp bảo tồn.",
      exampleOriginal: "Chúng ta cần bảo vệ các loài động vật hoang dã để giữ cân bằng sinh thái.",
      exampleImproved: "Mỗi sinh vật biến mất là một nút thắt bị đứt gãy trong hệ mạch sống khổng lồ duy trì sự sinh tồn của hành tinh.",
      explanation: "Mượn hình ảnh 'hệ mạch sống bị đứt gãy mạch điện' để cảnh báo về hậu quả nghiêm trọng của việc mất đa dạng sinh học."
    },
    {
      letter: "M",
      name: "Modify (Cải biên)",
      icon: "📈",
      concept: "Tăng chiều sâu thời gian từ 'hiện tại' sang 'kho báu kế thừa ngàn đời sau'.",
      exampleOriginal: "Giữ sạch nguồn nước sông hồ hôm nay để không lo thiếu nước sạch sau này.",
      exampleImproved: "Nước sạch không đơn thuần là tài nguyên tiêu dùng, mà là mạch sữa mẹ tinh khiết nuôi dưỡng huyết quản thế hệ mai sau.",
      explanation: "Ứng dụng nghệ thuật tu từ ẩn dụ 'mạch sữa mẹ tinh khiết' giải nghĩa tầm tầm quan trọng sinh tồn của nguồn nước sạch."
    },
    {
      letter: "P",
      name: "Put to other uses (Bối cảnh mới)",
      icon: "💡",
      concept: "Chuyển nghĩa môi trường tự nhiên từ vị thế 'nền cảnh' thành 'vị chủ nhân tối cao của Trái Đất'.",
      exampleOriginal: "Cây xanh làm mát thành phố và giúp con người có bóng râm mát mẻ.",
      exampleImproved: "Những rặng xà cừ cổ thụ đóng vai trò bộ phổi khổng lồ, hằng ngày thanh lọc bụi trần âm thầm che chở đô thị.",
      explanation: "Đưa cây xanh vào bối cảnh mới là một 'bộ phổi khổng lồ' gánh vác sứ mệnh thanh lọc cuộc sống thành thị."
    },
    {
      letter: "E",
      name: "Eliminate (Lược bỏ)",
      icon: "✂️",
      concept: "Xóa sổ các trạng từ kéo dài lê thê để kêu gọi hành động bảo vệ dứt khoác.",
      exampleOriginal: "Có lẽ tất cả mọi người ở đây đều nên bắt đầu cố gắng hạn chế và giảm bớt đi việc xả rác bừa bãi.",
      exampleImproved: "Ngưng xả rác - Tái thiết màu xanh!",
      explanation: "Tuyệt đối tối giản cấu trúc câu dài dòng thành khẩu hiệu xúc động, đanh thép, tác động trực diện hành vi."
    },
    {
      letter: "R",
      name: "Reverse (Đảo ngược)",
      icon: "⟲",
      concept: "Đảo lộn trách nhiệm và quyền lợi: Con người mắc nợ thiên nhiên thay vì nhận ơn huệ.",
      exampleOriginal: "Trái đất trao tặng nhiều động thực vật quý cho cuộc sống tiện lợi của con người.",
      exampleImproved: "Mang món nợ khổng lồ với Trái đất, con người hiện đại cần học cách hoàn trả màu xanh bằng cả sự kính cẩn.",
      explanation: "Đảo ngược vị thế từ việc 'nhận ban tặng tự nhiên' thành ứng xử 'hoàn trả món nợ' rèn luyện tư duy trách nhiệm sinh thái."
    }
  ],
  giao_duc: [
    {
      letter: "S",
      name: "Substitute (Thay thế)",
      icon: "🔄",
      concept: "Thay các thuật ngữ dạy học truyền thống bằng thuật ngữ khai mở tư duy đương đại.",
      exampleOriginal: "Học sinh ngồi nghe giáo viên giảng bài và cố gắng nhớ kỹ kiến thức.",
      exampleImproved: "Người học chủ động khai phóng tư duy thông qua sự dẫn dắt và định hướng gợi mở tiên phong.",
      explanation: "Thay thế thế bị động học thuộc lòng bằng từ ngữ thúc đẩy chủ thể sáng tạo tự lực."
    },
    {
      letter: "C",
      name: "Combine (Kết hợp)",
      icon: "🤝",
      concept: "Giao đan giữa tư duy công nghệ AI với giá trị giáo dục cảm xúc bản thể của con người.",
      exampleOriginal: "Sử dụng máy tính công nghệ mới để hỗ trợ các em học sinh làm bài tập toán dễ hơn.",
      exampleImproved: "Số hóa giáo án tương tác kết hợp phương pháp thấu cảm học đường giúp kích hoạt toàn diện IQ lẫn EQ học sinh.",
      explanation: "Cấu hợp công nghệ ('số hóa giáo án') cùng tâm lý nhân bản ('thấu cảm học đường') mang lại một giải pháp giáo dục toàn vẹn."
    },
    {
      letter: "A",
      name: "Adapt (Thích nghi)",
      icon: "🧩",
      concept: "Mang phương pháp phản xạ trò chơi (Gamification) thích nghi vào tiến trình rèn luyện ngôn ngữ.",
      exampleOriginal: "Học sinh cần phải viết đi viết lại từ vựng vào sách bài tập cho đến khi thuộc lòng.",
      exampleImproved: "Nhập vai chinh phục bản đồ thử thách từ vựng giúp duy trì ngọn lửa hiếu tri tự nhiên.",
      explanation: "Chuyển đổi nhiệm vụ ghi chép đơn điệu thành một 'hành trình chinh phục bản đồ' nhờ cơ chế gamification."
    },
    {
      letter: "M",
      name: "Modify (Cải biên)",
      icon: "📈",
      concept: "Cải biên lớp học vật lý thành không gian học tập từ xa đa chiều, không biên giới.",
      exampleOriginal: "Lớp học có bốn bức tường sạch sẽ, bàn ghế xếp ngay ngắn để học tập tập trung.",
      exampleImproved: "Lớp học không biên giới với hệ sinh thái học liệu mở, kích thích mọi giác quan khám phá.",
      explanation: "Thay đổi cấu từ phòng ốc gò bó thành 'hệ sinh thái học liệu mở không biên giới' đầy khoáng đạt."
    },
    {
      letter: "P",
      name: "Put to other uses (Bối cảnh mới)",
      icon: "💡",
      concept: "Biến mỗi kỳ thi sát hạch thành sân khấu sáng tạo thực chiến hữu ích xã hội.",
      exampleOriginal: "Đề kiểm tra giúp tính điểm số để xếp hạng học tập cuối kỳ học của học sinh.",
      exampleImproved: "Kỳ kiểm định đóng vai trò bệ phóng dự án thực chiến, giải quyết trực tiếp các thách thức xã hội đương đại.",
      explanation: "Định vị lại bài kiểm tra từ công cụ đánh giá tĩnh sang 'bệ phóng sáng kiến thực chiến'."
    },
    {
      letter: "E",
      name: "Eliminate (Lược bỏ)",
      icon: "✂️",
      concept: "Lược bỏ những kỳ vọng điểm số ảo, áp lực thành tích để học sinh tự do sảy chân để trưởng thành.",
      exampleOriginal: "Thầy cô cần chấm điểm thật nghiêm khắc để học sinh không được mắc bất kỳ lỗi lầm nhỏ nào.",
      exampleImproved: "Giải phóng áp lực thành tích ảo, khuyến khích tư duy phản nghiệm vượt qua khó khăn từ sai sót nhỏ nhất.",
      explanation: "Lược bỏ tính phê bình cực đoan, lấy 'tư duy phản nghiệm từ sai sót' làm động lực phát triển nội sinh."
    },
    {
      letter: "R",
      name: "Reverse (Đảo ngược)",
      icon: "⟲",
      concept: "Phương pháp lớp học đảo ngược (Flipped Classroom) - học sinh định hình bài giảng trước.",
      exampleOriginal: "Thầy cô giảng giải trọn vẹn lý thuyết rồi mới cho bài tập học sinh về nhà thực hành tự làm.",
      exampleImproved: "Tự nghiên cứu lý thuyết qua học liệu số tại nhà, dành trọn thời gian đứng lớp để phản biện và thấu cảm nhóm.",
      explanation: "Đảo ngược trật tự truyền thống học - làm bài, người học làm chủ nghiên cứu trước để tối ưu hóa tương tác trực diện."
    }
  ],
  viec_lam: [
    {
      letter: "S",
      name: "Substitute (Thay thế)",
      icon: "🔄",
      concept: "Thay đổi thuật ngữ tuyển dụng, năng suất lao động nhằm tôn vinh giá trị cống hiến nội tại.",
      exampleOriginal: "Nhân viên chăm chỉ làm việc tăng ca để đạt được chỉ tiêu sếp giao phó hằng ngày.",
      exampleImproved: "Đội ngũ sáng tạo nỗ lực tối đa hóa hiệu suất để kiến tạo giá trị vượt bậc, tự do bộc lộ tiềm năng.",
      explanation: "Thay thế thế nỗ lực vật lý tốn thời gian bằng nỗ lực trí óc 'hiệu suất sáng tạo' chất lượng cao."
    },
    {
      letter: "C",
      name: "Combine (Kết hợp)",
      icon: "🤝",
      concept: "Phối hợp sức mạnh kết nối của mạng xã hội với việc tuyển chọn nhân tài.",
      exampleOriginal: "Doanh nghiệp đăng thông báo tuyển người lên báo chí để chờ nhận hồ sơ xin việc ứng tuyển.",
      exampleImproved: "Tối ưu hóa chuỗi cung ứng nhân tài tương tác thông qua mạng lưới định hướng tri thức đa quốc gia.",
      explanation: "Nâng cấp tin tuyển dụng thành 'chuỗi cung ứng nhân tài' nhờ kết hợp kỹ thuật số và cộng đồng nghề nghiệp toàn cầu."
    },
    {
      letter: "A",
      name: "Adapt (Thích nghi)",
      icon: "🧩",
      concept: "Mang văn hóa linh hoạt thích nghi nhanh của các startup công nghệ (Agile) vào các tập đoàn truyền thống.",
      exampleOriginal: "Doanh nghiệp lớn áp dụng các quy trình làm việc cố định lâu đời để giữ mọi thứ ổn định.",
      exampleImproved: "Tái thiết kế quy trình làm việc theo mô hình Agile linh hoạt, phản hồi thích ứng nhanh trước biến động.",
      explanation: "Thích ứng cơ chế Agile giúp các tổ chức cồng kềnh trở nên cơ động, đổi mới không ngừng."
    },
    {
      letter: "M",
      name: "Modify (Cải biên)",
      icon: "📈",
      concept: "Cài tiến phúc lợi nhân viên từ tiền lương đơn thuần thành chăm sóc sức khỏe toàn vẹn tinh thần.",
      exampleOriginal: "Công ty trả lương đúng hạn và thưởng thêm ít tiền vào các ngày lễ tết trong năm.",
      exampleImproved: "Thiết lập dải phúc lợi toàn diện tập trung bảo dưỡng sức khỏe tinh thần và định hướng thăng tiến.",
      explanation: "Cải biên cấu trúc lương thưởng vật chất thuần túy thành 'dải phúc lợi toàn diện' nuôi dưỡng tâm lý nhân viên bền chặt."
    },
    {
      letter: "P",
      name: "Put to other uses (Bối cảnh mới)",
      icon: "💡",
      concept: "Biến văn phòng làm việc truyền thống thành lồng ấp kiến tạo ý tưởng.",
      exampleOriginal: "Văn phòng có nhiều bàn ghế máy tính sắp xếp hợp lý để mọi người đến làm việc đúng giờ giấc.",
      exampleImproved: "Không gian làm việc chuyển mình thành lồng ấp sáng tạo, nuôi dưỡng các ý tưởng khởi nghiệp đột phá.",
      explanation: "Đưa phòng ban bàn giấy nhàm chán vào bối cảnh tươi mới của một 'lồng ấp ý tưởng khởi nghiệp'."
    },
    {
      letter: "E",
      name: "Eliminate (Lược bỏ)",
      icon: "✂️",
      concept: "Lược bỏ cấu trúc cấp bậc hành chính rườm rà giúp nhân viên trực tiếp đối thoại lãnh đạo.",
      exampleOriginal: "Nhân viên có ý kiến gì muốn phát biểu phải viết báo cáo trình lên trưởng phòng, rồi phó giám đốc xét duyệt.",
      exampleImproved: "Phẳng hóa sơ đồ tổ chức, mở lối đối thoại trực tiếp linh hoạt giữa nhân sự cốt lõi và nhà điều hành.",
      explanation: "Loại bỏ hoàn toàn các tầng cấp phê duyệt cồng kềnh giúp sáng kiến ý tưởng được chuyển giao tức tốc."
    },
    {
      letter: "R",
      name: "Reverse (Đảo ngược)",
      icon: "⟲",
      concept: "Phương pháp tuyển dụng ngược - Doanh nghiệp phải tự chứng minh sức hút văn hóa.",
      exampleOriginal: "Nhà tuyển dụng phỏng vấn ứng viên thật khắt khe để sàng lọc xem ai là người phù hợp nhất làm việc.",
      exampleImproved: "Doanh nghiệp chủ động khẳng định thương hiệu tuyển dụng, lôi cuốn nhân tài hàng đầu tham gia đồng hành.",
      explanation: "Thay đổi tư thế từ 'sàng lọc ứng viên' thành 'lôi cuốn nhân tài' tôn trọng nguồn cốt kinh nghiệm thực chất."
    }
  ]
};

export default function TopicLessons({
  tasks,
  completedTasks,
  mistakes,
  onComplete,
  setMistakes,
  setTasks,
  soundEnabled,
  score,
  setScore,
  setXpHistory,
  activeOpenTopic,
  setActiveOpenTopic,
  onWordLearned,
}: TopicLessonsProps) {
  const [activeModalTab, setActiveModalTab] = useState<"vocabulary" | "scamper" | "mistakes">("vocabulary");
  const [learnedWordIds, setLearnedWordIds] = useState<string[]>(() => {
    const raw = localStorage.getItem("viling_learned_words");
    return raw ? JSON.parse(raw) : [];
  });
  
  // States to handle solving a mistake live inside the modal
  const [solvingTaskId, setSolvingTaskId] = useState<string | null>(null);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [scamperInput, setScamperInput] = useState("");
  const [solveFeedback, setSolveFeedback] = useState<string | null>(null);
  const [isSolvingCorrect, setIsSolvingCorrect] = useState<boolean | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [modalHint, setModalHint] = useState<string | null>(null);
  const [isModalHintLoading, setIsModalHintLoading] = useState(false);
  const [modalWrongAttempts, setModalWrongAttempts] = useState<Record<string, number>>({});

  const [isScamperGuideOpen, setIsScamperGuideOpen] = useState(false);
  const [selectedGuideLetter, setSelectedGuideLetter] = useState("S");

  const [selectedScamperCode, setSelectedScamperCode] = useState<string>("S");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number>(1);
  const [isGeneratingSlot, setIsGeneratingSlot] = useState<Record<string, boolean>>({});

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isCachingAll, setIsCachingAll] = useState<boolean>(false);
  const [cacheProgress, setCacheProgress] = useState<number>(0);

  // Auto-progression configs to skip repetitive step clicks
  const [autoNext, setAutoNext] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("viling_auto_next");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);

  const triggerNextLesson = () => {
    // Clear selections and inputs first to prevent leaks
    setSelectedOptIdx(null);
    setScamperInput("");
    setSolveFeedback(null);
    setIsSolvingCorrect(null);
    setModalHint(null);
    setIsModalHintLoading(false);
    setAutoNextCountdown(null);

    if (activeModalTab === "mistakes") {
      // Next mistake
      const currentMistakeIdx = activeTopicMistakes.findIndex(t => t.id === solvingTaskId);
      if (currentMistakeIdx !== -1 && currentMistakeIdx < activeTopicMistakes.length - 1) {
        const nextMistake = activeTopicMistakes[currentMistakeIdx + 1];
        setSolvingTaskId(nextMistake.id);
      } else {
        setSolvingTaskId(null);
      }
    } else {
      // Next SCAMPER slot index
      const startIdx = selectedDifficulty === "easy" ? 1 : selectedDifficulty === "medium" ? 11 : 21;
      const maxIdx = startIdx + 9;

      if (selectedSlotIdx < maxIdx) {
        const nextIdx = selectedSlotIdx + 1;
        setSelectedSlotIdx(nextIdx);
        const nextTaskId = `${activeOpenTopic}_${selectedScamperCode.toLowerCase()}${nextIdx}`;
        const nextTask = tasks.find((t) => t.id === nextTaskId);
        if (nextTask) {
          setSolvingTaskId(nextTask.id);
        } else {
          // Return matching placeholder state which says it's loading, then trigger generation!
          setSolvingTaskId(nextTaskId);
          handleGenerateSlotTask(nextIdx).then((newTask) => {
            if (newTask) {
              setSolvingTaskId(newTask.id);
            } else {
              setSolvingTaskId(null);
            }
          }).catch((err) => {
            console.error(err);
            setSolvingTaskId(null);
          });
        }
      } else {
        setSolvingTaskId(null);
      }
    }
  };

  React.useEffect(() => {
    if (autoNext && typeof window !== "undefined") {
      localStorage.setItem("viling_auto_next", "true");
    } else if (typeof window !== "undefined") {
      localStorage.setItem("viling_auto_next", "false");
    }
  }, [autoNext]);

  // Synchronized Countdown Effect for Auto Lesson Activation
  React.useEffect(() => {
    let timer: any;
    let countdownInterval: any;
    if (isSolvingCorrect && autoNext) {
      setAutoNextCountdown(3);
      countdownInterval = setInterval(() => {
        setAutoNextCountdown((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      timer = setTimeout(() => {
        triggerNextLesson();
      }, 3000);
    } else {
      setAutoNextCountdown(null);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [isSolvingCorrect, autoNext, solvingTaskId]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Helper inside component to parse trailing number from task ID to get its slot index
  const getTaskIndex = (task: Task): number => {
    const match = task.id.match(/\d+$/);
    return match ? parseInt(match[0], 10) : 1;
  };

  // Reset selected slot index when changing technique category or difficulty level
  React.useEffect(() => {
    const baseIdx = selectedDifficulty === "easy" ? 1 : selectedDifficulty === "medium" ? 11 : 21;
    setSelectedSlotIdx(baseIdx);
  }, [selectedScamperCode, selectedDifficulty]);

  const handleGenerateSlotTask = async (idx: number): Promise<Task | null> => {
    if (!activeOpenTopic || !setTasks) return null;
    const activeTopicObj = STATIC_TOPICS.find((t) => t.id === activeOpenTopic);
    if (!activeTopicObj) return null;

    const slotKey = `${activeOpenTopic}_${selectedScamperCode}_${idx}`;
    if (isGeneratingSlot[slotKey]) return null;

    setIsGeneratingSlot(prev => ({ ...prev, [slotKey]: true }));
    try {
      const res = await fetch("/api/ai/generate-task-by-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: activeOpenTopic,
          typeCode: selectedScamperCode,
          index: idx,
          topicName: activeTopicObj.name,
          difficulty: selectedDifficulty
        })
      });

      const json = await res.json();
      if (json.status === "success" && json.data) {
        const newTask = json.data;
        setTasks(prev => {
          // If task already exists in list (unlikely, but safe), filter it out
          const cleaned = prev.filter(t => t.id !== newTask.id);
          return [...cleaned, newTask];
        });
        
        // Play success beep
        playBeep(783.99, "sine", 0.15, soundEnabled); // G5 pleasant sound
        return newTask;
      }
    } catch (e) {
      console.error("Error generating slot task:", e);
    } finally {
      setIsGeneratingSlot(prev => ({ ...prev, [slotKey]: false }));
    }
    return null;
  };

  const handleCacheAllSlots = async () => {
    if (!activeOpenTopic || !setTasks || isCachingAll) return;
    const activeTopicObj = STATIC_TOPICS.find((t) => t.id === activeOpenTopic);
    if (!activeTopicObj) return;

    const startIdx = selectedDifficulty === "easy" ? 1 : selectedDifficulty === "medium" ? 11 : 21;
    const missingIndices: number[] = [];

    for (let i = 0; i < 10; i++) {
      const currentNum = startIdx + i;
      const targetId = `${activeOpenTopic}_${selectedScamperCode.toLowerCase()}${currentNum}`;
      if (!tasks.some(t => t.id === targetId)) {
        missingIndices.push(currentNum);
      }
    }

    if (missingIndices.length === 0) {
      alert("Tất cả 10 bài học ở cấp độ này đã được tải và ghi nhớ vào cache bộ nhớ đệm thành công!");
      return;
    }

    setIsCachingAll(true);
    setCacheProgress(0);

    let completedCount = 0;
    const totalToDownload = missingIndices.length;

    for (const idx of missingIndices) {
      if (!navigator.onLine) {
        alert("Mất kết nối mạng! Không thể tiếp tục tải các bài học mới để ghi nhớ vào cache.");
        break;
      }
      const slotKey = `${activeOpenTopic}_${selectedScamperCode}_${idx}`;
      setIsGeneratingSlot(prev => ({ ...prev, [slotKey]: true }));
      try {
        const res = await fetch("/api/ai/generate-task-by-slot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicId: activeOpenTopic,
            typeCode: selectedScamperCode,
            index: idx,
            topicName: activeTopicObj.name,
            difficulty: selectedDifficulty
          })
        });

        const json = await res.json();
        if (json.status === "success" && json.data) {
          const newTask = json.data;
          setTasks(prev => {
            const cleaned = prev.filter(t => t.id !== newTask.id);
            return [...cleaned, newTask];
          });
        }
      } catch (e) {
        console.error(`Error caching slot index ${idx}:`, e);
      } finally {
        setIsGeneratingSlot(prev => ({ ...prev, [slotKey]: false }));
        completedCount++;
        setCacheProgress(Math.round((completedCount / totalToDownload) * 100));
      }
    }

    playBeep(880, "sine", 0.35, soundEnabled);
    setIsCachingAll(false);
  };

  const handleFetchModalHint = async (task: Task) => {
    if (isModalHintLoading || modalHint) return;
    setIsModalHintLoading(true);
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          question: task.question,
          typeLabel: task.typeLabel,
          topicId: task.topicId,
        })
      });
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setModalHint(json.data.hint);
      } else {
        throw new Error("Lỗi API gợi ý");
      }
    } catch (err) {
      console.error(err);
      setModalHint("Hãy nghĩ về các từ đồng nghĩa/trái nghĩa phù hợp với chủ đề đang học!");
    } finally {
      setIsModalHintLoading(false);
    }
  };

  // Filter tasks that belong to a specific topic
  const getTasksForTopic = (topicId: string) => tasks.filter((t) => t.topicId === topicId);
  const getCompletedForTopic = (topicId: string) => {
    const topicTasks = getTasksForTopic(topicId);
    return topicTasks.filter((t) => completedTasks.includes(t.id));
  };
  
  const getCompletedCountForLevel = (topicId: string, level: "easy" | "medium" | "hard") => {
    const topicTasks = getTasksForTopic(topicId);
    const completedForTopic = topicTasks.filter((t) => completedTasks.includes(t.id));
    return completedForTopic.filter((t) => {
      const idx = getTaskIndex(t);
      if (level === "easy") return idx <= 10;
      if (level === "medium") return idx > 10 && idx <= 20;
      return idx > 20;
    }).length;
  };

  const getCompletedCountForCode = (code: string) => {
    if (!activeOpenTopic) return 0;
    const topicTasks = getTasksForTopic(activeOpenTopic);
    const codeTasks = topicTasks.filter(t => t.typeCode.toUpperCase() === code.toUpperCase());
    return codeTasks.filter(t => completedTasks.includes(t.id)).length;
  };
  const getMistakesForTopic = (topicId: string) => {
    const topicTasks = getTasksForTopic(topicId);
    return topicTasks.filter((t) => mistakes.includes(t.id));
  };

  const handleOpenPracticeModal = (topicId: string) => {
    setActiveOpenTopic(topicId);
    const mistakesCount = getMistakesForTopic(topicId).length;
    // Default to mistakes tab if mistakes exist, otherwise to vocabulary cards
    setActiveModalTab(mistakesCount > 0 ? "mistakes" : "vocabulary");
    // Clear solving state
    setSolvingTaskId(null);
    setSelectedOptIdx(null);
    setScamperInput("");
    setSolveFeedback(null);
    setIsSolvingCorrect(null);
    setModalHint(null);
    setIsModalHintLoading(false);
    setModalWrongAttempts({});
  };

  const handleLearnWord = (wordId: string, wordText: string) => {
    if (learnedWordIds.includes(wordId)) return;
    
    const newLearned = [...learnedWordIds, wordId];
    setLearnedWordIds(newLearned);
    localStorage.setItem("viling_learned_words", JSON.stringify(newLearned));

    // Store daily learned date mapping
    try {
      const rawDates = localStorage.getItem("viling_learned_word_dates");
      const dates = rawDates ? JSON.parse(rawDates) : {};
      const todayStr = new Date().toISOString().split("T")[0];
      dates[wordId] = todayStr;
      localStorage.setItem("viling_learned_word_dates", JSON.stringify(dates));
    } catch (e) {
      console.error("Lỗi ghi mốc thời gian học từ:", e);
    }

    if (onWordLearned) {
      onWordLearned(wordId);
    }

    // Award +5 XP instantly
    const newScore = score + 5;
    setScore(newScore);
    const now = new Date();
    const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setXpHistory((old) => [...old, { date: `${timeLabel} (Học)`, xp: newScore }]);

    // Pronounce word
    speakWord(wordText);

    // Play high pitch pleasant synthesized sound
    playBeep(880, "sine", 0.15, soundEnabled);
  };

  // Start solving a selected mistake
  const handleStartSolve = (task: Task) => {
    setSolvingTaskId(task.id);
    setSelectedOptIdx(null);
    setScamperInput("");
    setSolveFeedback(null);
    setIsSolvingCorrect(null);
    setModalHint(null);
    setIsModalHintLoading(false);
    setModalWrongAttempts({});
  };

  // Solve Multiple Choice Mistake
  const handleSolveQuizSubmit = (task: Task, idx: number) => {
    setSelectedOptIdx(idx);
    const isCorrect = idx === task.correctIndex;
    setIsSolvingCorrect(isCorrect);

    if (isCorrect) {
      setSolveFeedback("Quá xuất sắc! Bạn đã chọn hoàn toàn chính xác và khắc phục thành công sai lầm trước đây.");
      // Award 5 XP to reward fixing error
      const newScore = score + 5;
      setScore(newScore);
      const now = new Date();
      const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      setXpHistory((old) => [...old, { date: `${timeLabel} (Sửa lỗi)`, xp: newScore }]);

      // Mark completed globally
      onComplete(task.id, 0); // xp already added manually
      // Remove from mistakes list
      setMistakes((prev) => {
        const updated = prev.filter((id) => id !== task.id);
        localStorage.setItem("viling_mistakes", JSON.stringify(updated));
        return updated;
      });
    } else {
      setSolveFeedback("Chưa chính xác! Ôn kỹ gợi ý đáp án phía dưới và cấu hình phản xạ thêm nhé.");
    }
  };

  // Solve SCAMPER Input Mistake
  const handleSolveInputSubmit = async (task: Task) => {
    if (!scamperInput.trim()) return;
    setIsSubmitLoading(true);
    setSolveFeedback(null);
    setIsSolvingCorrect(null);

    try {
      const res = await fetch("/api/ai/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          question: task.question,
          userAnswer: scamperInput,
          typeLabel: task.typeLabel,
          topicId: task.topicId,
        }),
      });

      const json = await res.json();
      if (json.status === "success" && json.data) {
        const { isValid, explanation } = json.data;
        setIsSolvingCorrect(isValid);
        setSolveFeedback(explanation);

        if (isValid) {
          // Award 5 XP
          const newScore = score + 5;
          setScore(newScore);
          const now = new Date();
          const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
          setXpHistory((old) => [...old, { date: `${timeLabel} (Sửa lỗi SCAMPER)`, xp: newScore }]);

          onComplete(task.id, 0);
          setMistakes((prev) => {
            const updated = prev.filter((id) => id !== task.id);
            localStorage.setItem("viling_mistakes", JSON.stringify(updated));
            return updated;
          });
        } else {
          setModalWrongAttempts((prev) => {
            const nextAttempts = (prev[task.id] || 0) + 1;
            if (nextAttempts >= 2) {
              handleFetchModalHint(task);
            }
            return {
              ...prev,
              [task.id]: nextAttempts
            };
          });
        }
      } else {
        throw new Error("Lỗi xác thực.");
      }
    } catch (e) {
      // Offline fallback check match
      const isMatch = task.answers?.some(ans => scamperInput.toLowerCase().includes(ans.toLowerCase()));
      if (isMatch) {
        setIsSolvingCorrect(true);
        setSolveFeedback("Tuyệt vời! Đáp án đáp ứng ngân hàng dữ liệu nhanh. Đã sửa lỗi thành công!");
        const newScore = score + 5;
        setScore(newScore);
        const now = new Date();
        const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        setXpHistory((old) => [...old, { date: `${timeLabel} (Luyện tập)`, xp: newScore }]);

        onComplete(task.id, 0);
        setMistakes((prev) => {
          const updated = prev.filter((id) => id !== task.id);
          localStorage.setItem("viling_mistakes", JSON.stringify(updated));
          return updated;
        });
      } else {
        setIsSolvingCorrect(false);
        setSolveFeedback("Chưa chính xác! Thử lại một từ đồng nghĩa phổ biến hoặc tinh tế khác của ngôn ngữ Việt.");
        setModalWrongAttempts((prev) => {
          const nextAttempts = (prev[task.id] || 0) + 1;
          if (nextAttempts >= 2) {
            handleFetchModalHint(task);
          }
          return {
            ...prev,
            [task.id]: nextAttempts
          };
        });
      }
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const activeTopicObj = STATIC_TOPICS.find((t) => t.id === activeOpenTopic);
  const activeTopicMistakes = activeOpenTopic ? getMistakesForTopic(activeOpenTopic) : [];
  const activeTopicWords = activeOpenTopic ? ADVANCED_WORDS_BY_TOPIC[activeOpenTopic] || [] : [];
  const activeTopicTasks = activeOpenTopic ? getTasksForTopic(activeOpenTopic) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h3 className="text-sm font-black text-[var(--text-main)] tracking-wider uppercase mb-1 flex items-center gap-1.5">
          📚 Thực hành Chuyên sâu
        </h3>
        <p className="text-[10px] text-[var(--text-sub)] mb-3 leading-tight">
          Luyện tập theo từng chủ đề học liệu, khôi phục kiến thức và chinh phục các từ vựng thách thức nhất.
        </p>
      </div>

      {/* Topics grid list */}
      <div className="grid grid-cols-1 gap-3.5">
        {STATIC_TOPICS.map((topic) => {
          const totalTasks = getTasksForTopic(topic.id).length;
          const completedTasksCount = getCompletedForTopic(topic.id).length;
          const mistakesCount = getMistakesForTopic(topic.id).length;
          
          return (
            <motion.div
              key={topic.id}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleOpenPracticeModal(topic.id)}
              className={`bg-gradient-to-r ${topic.color} border border-[var(--border-color)] hover:border-red-500/35 cursor-pointer rounded-2xl p-4.5 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-3.5xl p-2.5 rounded-2xl bg-white dark:bg-slate-900 shadow-md border border-[var(--border-color)]">
                    {topic.icon}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-[#b91c1c] dark:text-red-400 text-sm">{topic.name}</h4>
                      <span className="text-[8px] font-black uppercase text-slate-500 bg-slate-300/20 dark:bg-slate-700/30 px-1.5 py-0.5 rounded">
                        {topic.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium leading-tight opacity-90 text-[var(--text-main)] max-w-[245px]">
                      {topic.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle specs line */}
              <div className="flex items-center justify-between border-t border-[var(--border-color)]/30 pt-3 mt-3.5 text-xs text-[var(--text-sub)]">
                <div className="flex items-center gap-1 font-semibold text-[10px]">
                  <span>📘 Trạng thái:</span>
                  <span className="font-bold text-[var(--text-main)] bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-md">
                    {completedTasksCount}/{totalTasks || 5} bài
                  </span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-[10px]">
                  <span>⚠️ Số lỗi học tập:</span>
                  <span
                    className={`font-black px-1.5 py-0.5 rounded-md ${
                      mistakesCount > 0
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-green-500/10 text-green-600 dark:text-green-400"
                    }`}
                  >
                    {mistakesCount > 0 ? `${mistakesCount} lỗi` : "0 lỗi"}
                  </span>
                </div>
              </div>

              {/* Card CTA quick action */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenPracticeModal(topic.id);
                }}
                className="cursor-pointer font-black text-xxs tracking-wider uppercase text-center bg-[#b91c1c] text-white py-2.5 rounded-xl hover:bg-red-700 active:scale-97 transition-colors mt-3 w-full"
              >
                🎯 Luyện tập theo chủ đề
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Big Overlay Modal for practice details */}
      <AnimatePresence>
        {activeOpenTopic && activeTopicObj && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-3 font-sans backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[var(--app-bg)] w-full max-w-[390px] max-h-[82vh] rounded-3xl border border-[var(--border-color)] overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-4.5 relative">
                {/* Close Button icon */}
                <button
                  onClick={() => setActiveOpenTopic(null)}
                  className="cursor-pointer absolute top-4.5 right-4.5 w-7 h-7 rounded-full bg-black/25 flex items-center justify-center hover:bg-black/40 text-sm font-bold text-white transition-opacity border border-white/10"
                >
                  ✕
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-3xl bg-white/15 w-11 h-11 rounded-xl flex items-center justify-center shadow-md border border-white/10">
                    {activeTopicObj.icon}
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ffd700]">
                      Luyện Tập Đa Chiều
                    </span>
                    <h3 className="text-lg font-black tracking-tight leading-tight">Chủ đề {activeTopicObj.name}</h3>
                  </div>
                </div>
              </div>

              {/* Triple Tab Switch control inside modal */}
              <div className="flex border-b border-[var(--border-color)] bg-[var(--card-bg)] text-xs font-black">
                <button
                  onClick={() => {
                    setActiveModalTab("vocabulary");
                    setSolvingTaskId(null);
                  }}
                  className={`flex-1 py-3 text-center transition-all border-b-2 cursor-pointer ${
                    activeModalTab === "vocabulary"
                      ? "border-b-red-600 text-red-600 dark:text-red-400 font-bold"
                      : "border-b-transparent text-[var(--text-sub)] opacity-85 hover:text-red-600"
                  }`}
                >
                  📖 Từ Vựng
                </button>

                <button
                  onClick={() => {
                    setActiveModalTab("scamper");
                    setSolvingTaskId(null);
                  }}
                  className={`flex-1 py-3 text-center transition-all border-b-2 cursor-pointer ${
                    activeModalTab === "scamper"
                      ? "border-b-red-600 text-red-600 dark:text-red-400 font-bold"
                      : "border-b-transparent text-[var(--text-sub)] opacity-85 hover:text-red-600"
                  }`}
                >
                  🎯 SCAMPER
                </button>

                <button
                  onClick={() => {
                    setActiveModalTab("mistakes");
                    setSolvingTaskId(null);
                  }}
                  className={`flex-1 py-3 text-center transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeModalTab === "mistakes"
                      ? "border-b-red-600 text-red-600 dark:text-red-400 font-bold"
                      : "border-b-transparent text-[var(--text-sub)] opacity-85 hover:text-red-600"
                  }`}
                >
                  ⚠️ Lỗi Sai
                  {activeTopicMistakes.length > 0 && (
                    <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                      {activeTopicMistakes.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Scrollable Main body content */}
              <div className="flex-1 overflow-y-auto p-4 bg-[var(--app-bg)] max-h-[50vh]">
                
                {solvingTaskId ? (
                  // Reusable Live Task Solver block for both SCAMPER list and Mistakes
                  (() => {
                    const matchingTask = activeTopicTasks.find((t) => t.id === solvingTaskId);
                    if (!matchingTask) {
                      const matchIdx = solvingTaskId.match(/\d+$/);
                      const idx = matchIdx ? parseInt(matchIdx[0], 10) : null;
                      const slotKey = idx ? `${activeOpenTopic}_${selectedScamperCode}_${idx}` : "";
                      const isGeneratingThis = isGeneratingSlot[slotKey] || false;

                      if (isGeneratingThis) {
                        return (
                          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-2xl shadow-md animate-fade-in flex flex-col items-center justify-center text-center space-y-4 my-2">
                            <div className="relative">
                              <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                              <span className="absolute inset-0 flex items-center justify-center text-sm">🤖</span>
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-sm text-[var(--text-main)]">
                                Tự động kích hoạt Bài tiếp theo (#{idx})
                              </h4>
                              <p className="text-xxs text-[var(--text-sub)] max-w-xs leading-normal">
                                AI đang mài giũa đề sáng tạo mới tinh cho phản xạ tư duy của bạn...
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }

                    return (
                      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-2xl shadow-md animate-fade-in space-y-4">
                        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                          <span className="text-[10px] font-black uppercase text-red-600 px-2 py-0.5 rounded bg-red-600/10 border border-red-500/20">
                            {matchingTask.typeLabel}
                          </span>
                          <button
                            onClick={() => {
                              setSolvingTaskId(null);
                              setScamperInput("");
                              setSolveFeedback(null);
                              setIsSolvingCorrect(null);
                              setModalHint(null);
                              setIsModalHintLoading(false);
                            }}
                            className="cursor-pointer text-xxs font-black text-[var(--text-sub)] hover:text-red-600"
                          >
                            ← Quay lại
                          </button>
                        </div>

                        {/* Dynamic Progress Bar depending on whether solving SCAMPER or Mistakes */}
                        {(() => {
                          const isMistakeSolving = activeModalTab === "mistakes";
                          if (isMistakeSolving) {
                            const totalMistakes = activeTopicMistakes.length;
                            const currentIdx = activeTopicMistakes.findIndex(t => t.id === solvingTaskId);
                            const solvedCount = activeTopicMistakes.filter(t => completedTasks.includes(t.id)).length;
                            const percent = totalMistakes > 0 ? Math.round((solvedCount / totalMistakes) * 100) : 100;
                            
                            return (
                              <div className="bg-slate-500/5 p-3 rounded-xl border border-[var(--border-color)] text-left space-y-1 my-1">
                                <div className="flex items-center justify-between text-[9px] font-black tracking-wide text-[var(--text-sub)]">
                                  <span>🚀 HOÀN THIỆN LỖI SAI:</span>
                                  <span className="text-red-600 dark:text-red-400">
                                    Thành tích #{currentIdx + 1} / {totalMistakes} ({percent}% đẩy lùi)
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          } else {
                            const startIdx = selectedDifficulty === "easy" ? 1 : selectedDifficulty === "medium" ? 11 : 21;
                            const currentSubsetTaskIds = Array.from({ length: 10 }, (_, i) => `${activeOpenTopic}_${selectedScamperCode.toLowerCase()}${startIdx + i}`);
                            const completedInSubset = currentSubsetTaskIds.filter(id => completedTasks.includes(id)).length;
                            const percent = Math.round((completedInSubset / 10) * 100);
                            
                            return (
                              <div className="bg-slate-500/5 p-3 rounded-xl border border-[var(--border-color)] text-left space-y-1 my-1">
                                <div className="flex items-center justify-between text-[9px] font-black tracking-wide text-[var(--text-sub)]">
                                  <span>🚀 HOÀN THÀNH CHUYÊN ĐỀ DỄ ➔ KHÓ:</span>
                                  <span className="text-red-600 dark:text-red-400">
                                    Bài {selectedSlotIdx} / 30 ({percent}% đạt)
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#b91c1c] to-red-500 rounded-full transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }
                        })()}

                        {/* Interactive SCAMPER technique stepper for rapid identification */}
                        {(() => {
                          const steps = [
                            { code: "S", label: "S - Thay thế (Substitute)", icon: "🔄", colorClass: "bg-blue-600 dark:bg-blue-500 text-white border-blue-600", desc: "Dùng từ ngữ Hán-Việt hay láy đắt giá thế chỗ từ quá quen thuộc để tăng mỹ cảm." },
                            { code: "C", label: "C - Kết hợp (Combine)", icon: "🤝", colorClass: "bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600", desc: "Phối giao các thực thể hoặc các phương diện nghệ thuật độc đáo khác biệt để tạo liên tưởng sâu sắc." },
                            { code: "A", label: "A - Thích nghi (Adapt)", icon: "🧩", colorClass: "bg-amber-500 text-slate-900 border-amber-500", desc: "Hấp thụ, lồng ghép thuật ngữ lịch sử, vũ trụ, khoa học để thi vị hoá câu chữ." },
                            { code: "M", label: "M - Cải biên (Modify)", icon: "📈", colorClass: "bg-orange-500 text-white border-orange-500", desc: "Kéo căng định lượng, phóng vĩ quy mô không gian hoặc cường điệu hóa sự mô tả." },
                            { code: "P", label: "P - Bối cảnh mới (Put to other uses)", icon: "💡", colorClass: "bg-teal-600 dark:bg-teal-500 text-white border-teal-600", desc: "Đổi phương diện từ tả cảnh lặng tĩnh sang bộc lộ chân dung sự vật có linh tính như tri kỉ." },
                            { code: "E", label: "E - Lược bỏ (Eliminate)", icon: "✂️", colorClass: "bg-rose-600 dark:bg-rose-500 text-white border-rose-600", desc: "Thanh giản bớt từ nối rạc, cấu trúc thừa thãi làm cho lối hành văn sắc lẹm, nén chặt." },
                            { code: "R", label: "R - Đảo ngược (Reverse)", icon: "⟲", colorClass: "bg-purple-600 dark:bg-purple-500 text-white border-purple-600", desc: "Xếp xáo thời gian hoặc đảo ngữ động/tính từ lên đầu để gợi nhịp thơ ca cuốn hút." }
                          ];

                          const activeStep = steps.find(s => s.code === matchingTask.typeCode.toUpperCase());
                          const isQuizType = matchingTask.typeCode.toUpperCase() === "Q";

                          return (
                            <div className="bg-gradient-to-r from-red-500/5 via-orange-500/3 to-yellow-500/5 dark:from-red-950/15 dark:to-yellow-950/5 border border-red-500/15 p-2.5 rounded-xl flex flex-col gap-2">
                              <div className="flex items-center justify-between text-[9px] font-black tracking-wide text-[var(--text-sub)]">
                                <span>🗺️ THƯỚC ĐO KỸ THUẬT SÁNG TẠO:</span>
                                {activeStep ? (
                                  <span className="text-red-700 dark:text-red-300 font-extrabold uppercase flex items-center gap-0.5 text-[9px]">
                                    Kỹ thuật: {activeStep.icon} {activeStep.code}
                                  </span>
                                ) : isQuizType ? (
                                  <span className="text-indigo-700 dark:text-indigo-300 font-extrabold uppercase flex items-center gap-0.5 text-[9px]">
                                    ⚡ Q - TRẮC NGHIỆM CỦNG CỐ
                                  </span>
                                ) : null}
                              </div>

                              {/* Small scale stepper flag mapping */}
                              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 select-none">
                                {steps.map((st) => {
                                  const isThisActive = st.code === matchingTask.typeCode.toUpperCase();
                                  return (
                                    <div
                                      key={st.code}
                                      title={st.label}
                                      className={`flex-1 min-w-[34px] text-center py-1 rounded-lg border transition-all text-[9px] font-black flex flex-col items-center justify-center gap-0.5 ${
                                        isThisActive
                                          ? `${st.colorClass} shadow-xs scale-102 ring-1 ring-red-500/35 border-transparent`
                                          : "bg-white/40 dark:bg-black/20 border-slate-200 dark:border-neutral-800 opacity-35 text-[var(--text-sub)]"
                                      }`}
                                    >
                                      <span className="text-xs">{st.icon}</span>
                                      <span className="text-[8px]">{st.code}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {activeStep ? (
                                <div className="text-[9px] text-[var(--text-main)] italic leading-relaxed pt-1.5 border-t border-red-500/10 flex items-start gap-1 font-medium">
                                  <span>🎯</span>
                                  <div>
                                    <strong>Ý cốt lõi:</strong> {activeStep.desc}
                                  </div>
                                </div>
                              ) : isQuizType ? (
                                <div className="text-[9px] text-[var(--text-main)] italic leading-relaxed pt-1.5 border-t border-indigo-500/10 flex items-start gap-1 font-medium">
                                  <span>✍️</span>
                                  <div>
                                    <strong>Mục tiêu:</strong> Ôn tập phản xạ để khắc phục ngay các lỗi diễn đạt nôm na tẻ nhạt.
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })()}

                        <div className="text-xs text-[var(--text-main)] font-semibold leading-relaxed">
                          <p dangerouslySetInnerHTML={{ __html: matchingTask.question }} />
                        </div>

                        {matchingTask.format === "quiz" && matchingTask.options && (
                          <div className="flex flex-col gap-1.5 pt-1">
                            {matchingTask.options.map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSolveQuizSubmit(matchingTask, idx)}
                                disabled={isSolvingCorrect === true}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                  selectedOptIdx === idx
                                    ? isSolvingCorrect
                                      ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-bold"
                                      : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 font-bold"
                                    : "border-[var(--border-color)] bg-[var(--input-bg)] hover:border-red-500/35 text-[var(--text-main)]"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}

                        {matchingTask.format === "input" && (
                          <div className="flex flex-col gap-2 pt-1">
                            <input
                              type="text"
                              value={scamperInput}
                              onChange={(e) => setScamperInput(e.target.value)}
                              disabled={isSolvingCorrect === true || isSubmitLoading}
                              placeholder={matchingTask.placeholder || "Nhập đáp án phản xạ..."}
                              className="w-full p-2.5 border border-[var(--border-color)] rounded-xl bg-[var(--input-bg)] text-xs text-[var(--text-main)] font-semibold outline-none focus:border-red-600"
                            />

                            {/* Intelligent AI Hint */}
                            {isSolvingCorrect !== true && (
                              <div className="text-left py-0.5">
                                {(modalWrongAttempts[matchingTask.id] || 0) >= 2 ? (
                                  <div className="bg-gradient-to-r from-purple-500/10 to-red-500/5 dark:from-purple-950/30 dark:to-red-950/20 border-2 border-purple-500/40 p-3 rounded-xl text-[10px] leading-relaxed animate-fade-in relative overflow-hidden shadow-inner flex flex-col gap-1">
                                    <div className="absolute top-0.5 right-1.5">
                                      <span className="text-[7px] bg-purple-500/20 text-purple-700 dark:text-purple-300 font-extrabold px-1 py-0.2 rounded uppercase font-mono tracking-wider animate-pulse">
                                        Hỗ Trợ AI
                                      </span>
                                    </div>
                                    <div className="flex items-start gap-1 pt-0.5">
                                      <span className="text-xs">🤖</span>
                                      <div>
                                        <strong className="text-purple-700 dark:text-purple-400 font-extrabold block mb-0.5">
                                          Gợi ý từ AI sau {(modalWrongAttempts[matchingTask.id] || 0)} lần thử chưa đúng:
                                        </strong>
                                        {isModalHintLoading ? (
                                          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xxs font-black">
                                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>AI đang soạn gợi ý...</span>
                                          </div>
                                        ) : modalHint ? (
                                          <p className="text-[var(--text-main)] font-semibold italic bg-white/40 dark:bg-black/20 p-2 rounded-lg border border-purple-500/10">
                                            "{modalHint}"
                                          </p>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleFetchModalHint(matchingTask)}
                                            className="cursor-pointer text-[10px] font-black text-purple-600 dark:text-purple-400 hover:underline"
                                          >
                                            👉 Nhấn đây để tải gợi ý từ AI
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  modalHint ? (
                                    <div className="bg-purple-500/5 text-purple-700 dark:text-purple-300 border border-purple-500/20 p-2.5 rounded-xl text-[10px] leading-relaxed animate-fade-in flex items-start gap-1">
                                      <span className="text-xs">💡</span>
                                      <div>
                                        <strong className="text-purple-600 dark:text-purple-400 font-extrabold block mb-0.5">Gợi ý từ AI:</strong>
                                        <span>{modalHint}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleFetchModalHint(matchingTask)}
                                      disabled={isModalHintLoading}
                                      className="cursor-pointer text-xxs font-black text-purple-600 dark:text-purple-400 hover:text-white hover:bg-purple-600/95 border border-purple-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-97 disabled:opacity-50"
                                    >
                                      {isModalHintLoading ? (
                                        <span>AI đang soạn gợi ý...</span>
                                      ) : (
                                        <span>💡 Bí từ? Xem gợi ý nhanh từ AI</span>
                                      )}
                                    </button>
                                  )
                                )}
                              </div>
                            )}

                            {isSolvingCorrect !== true && (
                              <button
                                onClick={() => handleSolveInputSubmit(matchingTask)}
                                disabled={isSubmitLoading || !scamperInput.trim()}
                                className="cursor-pointer w-full bg-[#b91c1c] text-white py-2.5 rounded-xl text-xs font-black hover:bg-red-700 active:scale-95 disabled:opacity-50"
                              >
                                {isSubmitLoading ? "Đang nhờ AI thẩm định..." : "🤖 Thẩm định với AI"}
                              </button>
                            )}
                          </div>
                        )}

                        {solveFeedback && (
                          <div
                            className={`p-3 rounded-xl border text-[11px] leading-relaxed animate-fade-in ${
                              isSolvingCorrect
                                ? "bg-green-500/5 text-green-700 border-green-500/15"
                                : "bg-red-500/5 text-red-700 border-red-500/15"
                            }`}
                          >
                            <div className="flex gap-1.5 items-start">
                              <span className="text-sm">{isSolvingCorrect ? "✨" : "💡"}</span>
                              <div>
                                <strong>{isSolvingCorrect ? "Hoàn thành: " : "Định hướng: "}</strong>
                                {solveFeedback}
                              </div>
                            </div>
                          </div>
                        )}

                        {isSolvingCorrect && (
                          <div className="mb-3 space-y-2.5">
                            {autoNextCountdown !== null && (
                              <div className="bg-green-500/10 border border-green-500/20 px-3 py-2.5 rounded-xl text-center text-[10px] text-green-700 dark:text-green-400 font-extrabold animate-pulse flex items-center justify-center gap-1">
                                🚀 Tự động kích hoạt bài kế tiếp sau {autoNextCountdown} giây...
                              </div>
                            )}
                            <div className="flex justify-center select-none">
                              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-[var(--text-sub)] hover:text-red-700">
                                <input
                                  type="checkbox"
                                  checked={autoNext}
                                  onChange={(e) => setAutoNext(e.target.checked)}
                                  className="accent-red-600 rounded"
                                />
                                <span>Tự động kích hoạt bài kế tiếp</span>
                              </label>
                            </div>
                          </div>
                        )}
                        {isSolvingCorrect && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                playBeep(523.25, "sine", 0.08, soundEnabled); // C5 cheerful sound
                                if (activeModalTab === "mistakes") {
                                  // Next mistake
                                  setSelectedOptIdx(null);
                                  setScamperInput("");
                                  setSolveFeedback(null);
                                  setIsSolvingCorrect(null);
                                  setModalHint(null);
                                  setIsModalHintLoading(false);
                                  
                                  const currentMistakeIdx = activeTopicMistakes.findIndex(t => t.id === solvingTaskId);
                                  if (currentMistakeIdx !== -1 && currentMistakeIdx < activeTopicMistakes.length - 1) {
                                    const nextMistake = activeTopicMistakes[currentMistakeIdx + 1];
                                    setSolvingTaskId(nextMistake.id);
                                  } else {
                                    setSolvingTaskId(null);
                                  }
                                } else {
                                  // Next SCAMPER slot index
                                  setSelectedOptIdx(null);
                                  setScamperInput("");
                                  setSolveFeedback(null);
                                  setIsSolvingCorrect(null);
                                  setModalHint(null);
                                  setIsModalHintLoading(false);

                                  const startIdx = selectedDifficulty === "easy" ? 1 : selectedDifficulty === "medium" ? 11 : 21;
                                  const maxIdx = startIdx + 9;

                                  if (selectedSlotIdx < maxIdx) {
                                    const nextIdx = selectedSlotIdx + 1;
                                    setSelectedSlotIdx(nextIdx);
                                    const nextTaskId = `${activeOpenTopic}_${selectedScamperCode.toLowerCase()}${nextIdx}`;
                                    const nextTask = tasks.find((t) => t.id === nextTaskId);
                                    if (nextTask) {
                                      setSolvingTaskId(nextTask.id);
                                    } else {
                                      // Return matching placeholder state which says it's loading, then trigger generation!
                                      setSolvingTaskId(nextTaskId);
                                      handleGenerateSlotTask(nextIdx).then((newTask) => {
                                        if (newTask) {
                                          setSolvingTaskId(newTask.id);
                                        } else {
                                          // Fallback to overview map if generation fails
                                          setSolvingTaskId(null);
                                        }
                                      }).catch((err) => {
                                        console.error(err);
                                        setSolvingTaskId(null);
                                      });
                                    }
                                  } else {
                                    setSolvingTaskId(null);
                                  }
                                }
                              }}
                              className="w-full cursor-pointer bg-red-600 hover:bg-red-700 active:scale-97 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all animate-bounce"
                            >
                              <span>Câu tiếp theo</span>
                              <span>➔</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <>
                    {/* 1) VOCABULARY TAB */}
                    {activeModalTab === "vocabulary" && (
                      <div className="space-y-4">
                        <div className="p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/15 rounded-xl">
                          <p className="text-[10px] text-red-600 dark:text-red-400 font-bold leading-normal">
                            💡 Nơi tổng hợp các thuật ngữ học thuật mấu chốt. Bấm &quot;Học thuộc&quot; để tích lũy +5 XP vàng duy trì điểm số phản xạ của bạn hằng ngày!
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
                          {activeTopicWords.map((item) => {
                            const isLearned = learnedWordIds.includes(item.id);
                            return (
                              <div
                                key={item.id}
                                className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-2xl shadow-sm transition-all relative overflow-hidden text-left"
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="text-sm font-black text-[var(--text-main)] tracking-tight">
                                        {item.word}
                                      </h4>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          speakWord(item.word);
                                        }}
                                        className="p-1 rounded-full text-red-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer text-[10px] shrink-0"
                                        title="Nghe phát âm từ vựng tiếng Việt"
                                      >
                                        🔊
                                      </button>
                                    </div>
                                    <span className="text-[9px] font-semibold text-[var(--text-sub)] bg-[var(--input-bg)] border border-[var(--border-color)] px-1.5 py-0.5 rounded uppercase block mt-1.5 w-max truncate max-w-full">
                                      {item.partOfSpeech} • {item.translationOrMeaning}
                                    </span>
                                  </div>
                                  <button
                                    disabled={isLearned}
                                    onClick={() => handleLearnWord(item.id, item.word)}
                                    className={`cursor-pointer px-3 py-1 text-[9px] font-extrabold uppercase rounded-lg transition-all shrink-0 ${
                                      isLearned
                                        ? "bg-green-500/10 text-green-600 dark:text-green-400 cursor-not-allowed border border-green-500/25"
                                        : "bg-yellow-500 text-slate-900 shadow-sm active:scale-95"
                                    }`}
                                  >
                                    {isLearned ? "✓ Đã học" : "📖 Học (+5)"}
                                  </button>
                                </div>

                                <p className="text-[11px] text-[var(--text-main)] font-semibold leading-normal bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-[var(--border-color)]/20 mb-2">
                                  {item.explanation}
                                </p>

                                <div className="flex items-center justify-between gap-2 mt-1.5">
                                  <div className="text-[10px] italic text-[var(--text-sub)] min-w-0 flex-1 truncate">
                                    <strong>Ví dụ: </strong>&quot;{item.example}&quot;
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakWord(item.example);
                                    }}
                                    className="text-[9px] font-bold text-[#b91c1c] dark:text-red-400 hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                                    title="Nghe đọc toàn bộ câu ví dụ tiếng Việt"
                                  >
                                    <span>🔊 Nghe câu ví dụ</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2) CHALLENGES / SCAMPER TAB */}
                    {activeModalTab === "scamper" && (
                      <div className="space-y-4">
                        <div className="p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/15 rounded-xl">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-red-600 dark:text-red-400 font-black uppercase">
                              Phương Pháp Tư Duy SCAMPER
                            </span>
                            <span className="text-[10px] font-extrabold text-[var(--text-main)] px-2 py-0.5 bg-red-600/10 rounded">
                              Hoàn thành: {getCompletedForTopic(activeOpenTopic!).length}/240 bài
                            </span>
                          </div>
                          <p className="text-[9px] text-[var(--text-sub)] font-semibold leading-tight">
                            Luyện tập trọn bộ 3 cấp độ (Dễ, Trung bình, Khó), gồm 30 bài rèn luyện cho mỗi kỹ thuật SCAMPER độc bản để tối ưu năng lực phản xạ tiếng Việt!
                          </p>
                        </div>

                        {/* 3-LEVEL DIFFICULTY PROGRESSION SECTOR */}
                        <div>
                          <span className="text-[9px] font-black uppercase text-[var(--text-sub)] tracking-wider block mb-2">
                            Mức độ tư duy & Cột mốc mở khóa liên hoàn:
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {[
                              { level: "easy", name: "Dễ (Cơ bản)", desc: "10 bài/kỹ thuật (Bài #1 - #10)", isLocked: false, color: "from-green-500/10 to-emerald-600/10 border-green-500/20 text-green-700 dark:text-green-400 font-black" },
                              { 
                                level: "medium", 
                                name: "Trung bình (Tăng tốc)", 
                                desc: "10 bài/kỹ thuật (Bài #11 - #20)", 
                                isLocked: getCompletedCountForLevel(activeOpenTopic!, "easy") < 8, 
                                reqText: "Đạt từ 8 bài cấp độ Dễ",
                                currentProgress: `${getCompletedCountForLevel(activeOpenTopic!, "easy")}/8`,
                                color: "from-blue-500/10 to-indigo-600/10 border-blue-500/20 text-blue-700 dark:text-blue-400 font-black" 
                              },
                              { 
                                level: "hard", 
                                name: "Khó (Bác học)", 
                                desc: "10 bài/kỹ thuật (Bài #21 - #30)", 
                                isLocked: getCompletedCountForLevel(activeOpenTopic!, "easy") < 8 || getCompletedCountForLevel(activeOpenTopic!, "medium") < 8, 
                                reqText: "Đạt từ 8 bài Trung bình",
                                currentProgress: `${getCompletedCountForLevel(activeOpenTopic!, "medium")}/8`,
                                color: "from-red-500/10 to-orange-600/10 border-red-500/20 text-red-700 dark:text-red-400 font-black" 
                              }
                            ].map((lvl) => {
                              const isActive = selectedDifficulty === lvl.level;
                              const levelCompletedCount = getCompletedCountForLevel(activeOpenTopic!, lvl.level as any);
                              
                              return (
                                <button
                                  type="button"
                                  key={lvl.level}
                                  onClick={() => {
                                    if (lvl.isLocked) {
                                      playBeep(220, "sawtooth", 0.25, soundEnabled);
                                      return;
                                    }
                                    setSelectedDifficulty(lvl.level as any);
                                    playBeep(440, "sine", 0.08, soundEnabled);
                                  }}
                                  className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer active:scale-98 ${
                                    isActive
                                      ? "ring-2 ring-red-600 border-red-600 bg-red-600/5 dark:bg-red-600/10 scale-102"
                                      : lvl.isLocked
                                      ? "bg-slate-500/5 dark:bg-slate-500/2 border-dashed border-slate-300 dark:border-neutral-800 opacity-60 cursor-not-allowed"
                                      : "bg-[var(--card-bg)] border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between mb-0.5">
                                      <h4 className={`text-[10px] font-black uppercase ${isActive ? "text-red-600 dark:text-red-400" : ""}`}>
                                        {lvl.name}
                                      </h4>
                                      {lvl.isLocked ? (
                                        <span className="text-[10px]" title="Đang bị mật mã niêm phong">🔒</span>
                                      ) : isActive ? (
                                        <span className="text-[9px] animate-pulse text-red-500 font-black">✦ ĐANG CHỌN</span>
                                      ) : (
                                        <span className="text-[10px] text-green-500">🔓 Sẵn sàng</span>
                                      )}
                                    </div>
                                    <p className="text-[8px] font-semibold text-[var(--text-sub)]">
                                      {lvl.desc}
                                    </p>
                                  </div>

                                  <div className="mt-3 pt-1.5 border-t border-[var(--border-color)]/20 flex items-center justify-between w-full text-[9px]">
                                    <span className="text-green-600 dark:text-green-400 font-bold">
                                      ✓ Đã đạt: {levelCompletedCount}/80 bài
                                    </span>
                                    {lvl.isLocked && (
                                      <span className="text-[8px] text-amber-600 font-black uppercase bg-amber-500/10 border border-amber-500/20 px-1 rounded-sm">
                                        Cần {lvl.currentProgress} bài
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* THƯ VIỆN GỢI Ý/VÍ DỤ MẪU SCAMPER CHO BÀI HỌC */}
                        {activeOpenTopic && SCAMPER_GUIDE_BY_TOPIC[activeOpenTopic] && (
                          <div className="bg-gradient-to-br from-red-600/5 via-orange-500/5 to-yellow-500/5 dark:from-red-950/10 dark:to-yellow-950/5 border border-red-500/15 p-3 rounded-2xl">
                            <button
                              type="button"
                              onClick={() => setIsScamperGuideOpen(!isScamperGuideOpen)}
                              className="w-full flex items-center justify-between text-[11px] font-bold text-red-700 dark:text-red-400 focus:outline-none cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5 uppercase tracking-wide">
                                📖 PHƯƠNG PHÁP SCAMPER THỰC CHIẾN (TRA CỨU VÍ DỤ MẪU)
                              </span>
                              <span className="text-xxs px-1.5 py-0.5 bg-red-600/10 dark:bg-red-400/10 rounded-md">
                                {isScamperGuideOpen ? "Đóng cẩm nang ▲" : "Mở cẩm nang ▼"}
                              </span>
                            </button>

                            {isScamperGuideOpen && (
                              <div className="mt-3 space-y-3 animate-fade-in border-t border-red-500/10 pt-3">
                                {/* Letters Selector Row */}
                                <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-red-500/20">
                                  {SCAMPER_GUIDE_BY_TOPIC[activeOpenTopic].map((gItem) => (
                                    <button
                                      type="button"
                                      key={gItem.letter}
                                      onClick={() => setSelectedGuideLetter(gItem.letter)}
                                      className={`flex-none px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider border transition-all cursor-pointer ${
                                        selectedGuideLetter === gItem.letter
                                          ? "bg-red-600 border-red-600 text-white shadow-sm"
                                          : "bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
                                      }`}
                                    >
                                      {gItem.letter}
                                    </button>
                                  ))}
                                </div>

                                {/* Selected Letter Detail */}
                                {(() => {
                                  const activeGuide = SCAMPER_GUIDE_BY_TOPIC[activeOpenTopic].find(
                                    (g) => g.letter === selectedGuideLetter
                                  );
                                  if (!activeGuide) return null;
                                  return (
                                    <div className="bg-white/40 dark:bg-black/40 border border-red-500/10 p-3 rounded-xl space-y-2 text-[10.5px] leading-relaxed">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-sm">{activeGuide.icon}</span>
                                        <strong className="text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-tight">
                                          Kỹ thuật {activeGuide.name}
                                        </strong>
                                      </div>

                                      <p className="text-[var(--text-main)] font-semibold italic">
                                        💡 <strong className="text-slate-800 dark:text-slate-200">Ý niệm tư duy:</strong> {activeGuide.concept}
                                      </p>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-[var(--border-color)]/20">
                                        <div className="bg-red-500/5 p-2 rounded-lg border border-red-500/5">
                                          <span className="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">
                                            ❌ Diễn đạt đơn điệu (Nguyên bản):
                                          </span>
                                          <p className="text-slate-600 dark:text-slate-400 font-medium">
                                            &quot;{activeGuide.exampleOriginal}&quot;
                                          </p>
                                        </div>

                                        <div className="bg-green-500/5 p-2 rounded-lg border border-green-500/10 dark:border-green-400/10 font-medium">
                                          <span className="text-[8px] font-black text-green-600 dark:text-green-400 uppercase block mb-0.5">
                                            ✨ Tiến hóa bứt phá (Sau cải biên):
                                          </span>
                                          <p className="text-green-700 dark:text-green-300 font-extrabold">
                                            &quot;{activeGuide.exampleImproved}&quot;
                                          </p>
                                        </div>
                                      </div>

                                      <div className="bg-indigo-500/5 text-indigo-700 dark:text-indigo-300 p-2.5 rounded-lg text-[10px] border border-indigo-500/10 flex items-start gap-1">
                                        <span className="text-xs">🔬</span>
                                        <div>
                                          <strong>Phân tích khoa học phương pháp: </strong>
                                          <span>{activeGuide.explanation}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}

                        {/* DISPLAY RENDER CONTAINER CARD OR LOCKED SCREEN */}
                        {(() => {
                          const isLocked = (selectedDifficulty === "medium" && getCompletedCountForLevel(activeOpenTopic!, "easy") < 8) ||
                                           (selectedDifficulty === "hard" && (getCompletedCountForLevel(activeOpenTopic!, "easy") < 8 || getCompletedCountForLevel(activeOpenTopic!, "medium") < 8));

                          if (isLocked) {
                            const neededLevel = selectedDifficulty === "medium" ? "easy" : "medium";
                            const currentWins = getCompletedCountForLevel(activeOpenTopic!, neededLevel);
                            const percent = Math.min(100, Math.floor((currentWins / 8) * 100));

                            return (
                              <div className="bg-[var(--card-bg)] border-2 border-dashed border-[var(--border-color)] p-8 rounded-2xl text-center space-y-4 animate-fade-in my-4">
                                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner animate-bounce">
                                  🔒
                                </div>
                                <div className="space-y-1.5">
                                  <h4 className="font-extrabold text-[12px] uppercase text-[var(--text-main)] tracking-wider">
                                    Cấp độ {selectedDifficulty === "medium" ? "Trung Bính" : "Khó"} Đang Niêm Phong!
                                  </h4>
                                  <p className="text-[10px] text-[var(--text-sub)] max-w-sm mx-auto leading-normal">
                                    {selectedDifficulty === "medium" 
                                      ? "Thế giới tư duy tăng tốc đòi hỏi rèn luyện kỹ lưỡng sắc sảo. Hãy tích lũy ít nhất 8 bài đạt chuẩn ở cấp độ Dễ của chủ đề này để khai phá!"
                                      : "Đỉnh cao phong cách Bác học lừng lẫy kiệt tác đang đợi bạn. Đạt tối thiểu 8 bài tập cấp độ Trung bình của chủ đề để hóa giải phong ấn!"}
                                  </p>
                                </div>

                                <div className="max-w-xs mx-auto space-y-1 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-[var(--border-color)]/10">
                                  <div className="flex justify-between items-center text-[9px] font-black text-[var(--text-main)]">
                                    <span>TIẾN ĐỘ CHINH PHỤC CẤP {neededLevel.toUpperCase()}:</span>
                                    <span className="text-red-600">{currentWins}/8 Bài đạt chuẩn</span>
                                  </div>
                                  <div className="w-full bg-slate-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-gradient-to-r from-red-600 to-orange-500 h-full rounded-full transition-all duration-300" 
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDifficulty(neededLevel);
                                    playBeep(440, "sine", 0.08, soundEnabled);
                                  }}
                                  className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wide py-2 px-5 rounded-xl shadow-md transform hover:scale-102 active:scale-97 transition-all inline-flex items-center gap-1"
                                >
                                  <span>👉 Trở lại Rèn luyện cấp {neededLevel === "easy" ? "Dễ" : "Trung bình"}</span>
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4 pt-1">
                              {/* 1. SCAMPER letters category select */}
                              <div>
                                <span className="text-[9px] font-black uppercase text-[var(--text-sub)] tracking-wider block mb-2">
                                  1) Chọn kỹ thuật tư duy sáng tạo SCAMPER:
                                </span>
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
                                  {[
                                    { code: "S", label: "Substitute", short: "S - Thay thế", icon: "🔄" },
                                    { code: "C", label: "Combine", short: "C - Kết hợp", icon: "🤝" },
                                    { code: "A", label: "Adapt", short: "A - Thích nghi", icon: "🧩" },
                                    { code: "M", label: "Modify", short: "M - Cải biên", icon: "📈" },
                                    { code: "P", label: "Put other uses", short: "P - Đa dụng", icon: "💡" },
                                    { code: "E", label: "Eliminate", short: "E - Lược bỏ", icon: "✂️" },
                                    { code: "R", label: "Reverse", short: "R - Đảo ngược", icon: "⟲" },
                                    { code: "Q", label: "Quiz", short: "Q - Trắc nghiệm", icon: "📝" }
                                  ].map((cat) => {
                                    const isActive = selectedScamperCode === cat.code;
                                    const completedCount = getCompletedCountForCode(cat.code);
                                    return (
                                      <button
                                        type="button"
                                        key={cat.code}
                                        onClick={() => setSelectedScamperCode(cat.code)}
                                        className={`relative p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 ${
                                          isActive
                                            ? "border-red-600 bg-red-600/5 dark:bg-red-600/10 scale-102 ring-2 ring-red-500/15"
                                            : "border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
                                        }`}
                                      >
                                        <span className="text-sm md:text-base">{cat.icon}</span>
                                        <span className="text-[10px] font-black uppercase mt-1 tracking-tight">
                                          {cat.code}
                                        </span>
                                        <span className="text-[7.5px] font-bold text-[var(--text-sub)] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                                          {completedCount}/30 Đạt
                                        </span>
                                        {completedCount > 0 && (
                                          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[6px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-xs">
                                            ✓
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 2. Technique Explanation Banner */}
                              {(() => {
                                const activeCatInfo = [
                                  { code: "S", title: "🔄 S - Thay thế (Substitute)", desc: "Dùng từ ngữ Hán-Việt hay từ láy đắt giá thế chỗ tinh xảo cho từ thông thường để tăng mỹ cảm mô tả." },
                                  { code: "C", title: "🤝 C - Kết hợp (Combine)", desc: "Giao cắt hai thực thể, phối trộn ý niệm ngôn ngữ để kiến tạo từ ghép mới giàu năng lực biểu cảm." },
                                  { code: "A", title: "🧩 A - Thích nghi (Adapt)", desc: "Hấp thụ, đặt lồng các thuật ngữ triết học, lịch sử, nhân sinh, vũ trụ nhằm thi vị hóa cảnh quan và sự vật." },
                                  { code: "M", title: "📈 M - Cải biên (Modify)", desc: "Kéo giãn chiều kích vật lý, vĩ cuồng hóa quy mô không gian hoặc mài sắc mức độ cảm xúc một cách ấn tượng." },
                                  { code: "P", title: "💡 P - Bối cảnh mới (Put to other uses)", desc: "Linh tính hóa thiên nhiên, đổi góc nhìn sự vật như một tri kỷ thiết thân hoặc kết nối thuật ngữ phương diện khác." },
                                  { code: "E", title: "✂️ E - Lược bỏ (Eliminate)", desc: "Lọc tách, tối giản hóa phó từ dư thừa, từ ngữ khuôn mẫu để bài viết câu chữ cô súc, cô đọng tinh lượng cực độ." },
                                  { code: "R", title: "⟲ R - Đảo ngược (Reverse)", desc: "Đảo ngữ cấu trúc câu, tráo đổi phụ tố ngữ pháp để dệt nên thanh âm mượt mà đầy nhạc tính bất ngờ." },
                                  { code: "Q", title: "📝 Q - Trắc nghiệm ôn luyện (Quiz)", desc: "Học phần kiểm tra, luyện sâu phản xạ tri thức Hán Việt và kết hợp sáng tạo lý thuyết SCAMPER chuyên sâu." }
                                ].find(c => c.code === selectedScamperCode);

                                if (!activeCatInfo) return null;
                                return (
                                  <div className="bg-slate-500/5 border border-[var(--border-color)] p-2.5 rounded-xl text-left">
                                    <h4 className="text-[10px] font-black text-red-600 dark:text-red-400 tracking-wide uppercase mb-0.5">
                                      {activeCatInfo.title}
                                    </h4>
                                    <p className="text-[9.5px] font-semibold text-[var(--text-sub)] leading-relaxed">
                                      {activeCatInfo.desc}
                                    </p>
                                  </div>
                                );
                              })()}

                              {/* 3. 10-Task Interactive Grid */}
                              <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                                  <span className="text-[9px] font-black uppercase text-[var(--text-sub)] tracking-wider">
                                    2) Bản đồ bồi dưỡng: 10 bài tập thuộc cấp độ {selectedDifficulty === "easy" ? "DỄ" : selectedDifficulty === "medium" ? "TRUNG BÌNH" : "KHÓ"} (Mã {selectedScamperCode})
                                  </span>
                                  
                                  {/* Cache System Badge & Controllers */}
                                  <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto text-[9px]">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-bold border ${
                                      isOnline 
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                    }`}>
                                      {isOnline ? "🟢 Trực Tuyến" : "📡 Ngoại Tuyến (Bộ nhớ đệm)"}
                                    </span>

                                    {(() => {
                                      const startIdx = selectedDifficulty === "easy" ? 1 : selectedDifficulty === "medium" ? 11 : 21;
                                      const loadedCount = Array.from({ length: 10 }, (_, i) => {
                                        const currentNum = startIdx + i;
                                        const targetId = `${activeOpenTopic}_${selectedScamperCode.toLowerCase()}${currentNum}`;
                                        return tasks.some(t => t.id === targetId);
                                      }).filter(Boolean).length;

                                      return (
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-extrabold text-[var(--text-main)] px-1.5 py-0.5 bg-slate-500/10 rounded">
                                            💾 Đã Cache: {loadedCount}/10 bài
                                          </span>
                                          {isCachingAll ? (
                                            <div className="flex items-center gap-1 bg-red-500/10 text-red-600 px-2 py-0.5 border border-red-500/20 rounded-md">
                                              <span className="w-2.5 h-2.5 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"></span>
                                              <span className="font-bold">Đang lưu: {cacheProgress}%</span>
                                            </div>
                                          ) : isOnline && loadedCount < 10 ? (
                                            <button
                                              type="button"
                                              onClick={handleCacheAllSlots}
                                              className="cursor-pointer bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black px-2 py-0.5 rounded-md text-[8.5px] uppercase tracking-wide transition-all shadow-xs"
                                              title="Tải đầy đủ 10 bài bồi dưỡng sáng tạo của kỹ thuật hiện tại về lưu trữ cục bộ"
                                            >
                                              📥 Tải toàn bộ Offline
                                            </button>
                                          ) : loadedCount === 10 ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">✓ Sẵn Sàng Sáng Tạo Offline</span>
                                          ) : null}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                                <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5 matches-box">
                                  {(() => {
                                    const startIdx = selectedDifficulty === "easy" ? 1 : selectedDifficulty === "medium" ? 11 : 21;
                                    return Array.from({ length: 10 }, (_, idx) => {
                                      const currentNum = startIdx + idx;
                                      const targetId = `${activeOpenTopic}_${selectedScamperCode.toLowerCase()}${currentNum}`;
                                      const isDone = completedTasks.includes(targetId);
                                      const isWrong = mistakes.includes(targetId);
                                      const exists = tasks.some(t => t.id === targetId);
                                      const isSelected = selectedSlotIdx === currentNum;

                                      return (
                                        <button
                                          type="button"
                                          key={currentNum}
                                          onClick={() => {
                                            setSelectedSlotIdx(currentNum);
                                            if (!exists) {
                                              handleGenerateSlotTask(currentNum);
                                            }
                                          }}
                                          className={`relative p-2 border rounded-xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 text-[10.5px] font-black ${
                                            isSelected
                                              ? "ring-2 ring-red-600 scale-105 border-red-600 z-10"
                                              : ""
                                          } ${
                                            isDone
                                              ? "bg-green-500/15 border-green-500/30 text-green-700 dark:text-green-400"
                                              : isWrong
                                              ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400 animate-pulse"
                                              : exists
                                              ? "bg-indigo-500/5 border-indigo-500/15 text-indigo-600 dark:text-indigo-300"
                                              : "bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-sub)] border-dashed border-2 opacity-75 hover:opacity-100"
                                          }`}
                                        >
                                          <span>#{currentNum}</span>
                                          {isDone && (
                                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[6px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                                              ✓
                                            </span>
                                          )}
                                          {isWrong && (
                                            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[6px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                                              ⚠️
                                            </span>
                                          )}
                                          {!exists && (
                                            <span className="absolute -top-1 -right-1 bg-slate-500 text-white text-[6px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                                              ✨
                                            </span>
                                          )}
                                        </button>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>

                              {/* 4. Active Exercise Spotlight Panel */}
                              {(() => {
                                const targetId = `${activeOpenTopic}_${selectedScamperCode.toLowerCase()}${selectedSlotIdx}`;
                                const foundTask = tasks.find(t => t.id === targetId);
                                const isGenerating = isGeneratingSlot[targetId] || false;
                                const isDone = completedTasks.includes(targetId);
                                const isWrong = mistakes.includes(targetId);
                                const activeTopicObj = STATIC_TOPICS.find((t) => t.id === activeOpenTopic);

                                return (
                                  <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-fade-in text-left">
                                    <div className="space-y-1 bg-black/5 dark:bg-white/5 py-2 px-3 rounded-xl w-full">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-red-600/10 text-red-600 px-1.5 py-0.5 rounded tracking-wide uppercase">
                                          Cập {selectedDifficulty === "easy" ? "Dễ" : selectedDifficulty === "medium" ? "Trung bình" : "Khó"} • Bài {selectedSlotIdx} • Mã {selectedScamperCode}
                                        </span>
                                        {foundTask ? (
                                          <span className="text-[8px] font-black uppercase text-green-600 px-1.5 py-0.5 bg-green-500/10 rounded">
                                            Sẵn Sàng
                                          </span>
                                        ) : (
                                          <span className="text-[8px] font-black uppercase text-slate-500 px-1.5 py-0.5 bg-slate-500/10 rounded">
                                            Chưa kích hoạt
                                          </span>
                                        )}
                                      </div>
                                      
                                      {foundTask ? (
                                        <>
                                          <h5 className="text-[11px] font-extrabold text-[var(--text-main)] italic leading-snug line-clamp-2 mt-1">
                                            {foundTask.question.replace(/<[^>]*>/g, '')}
                                          </h5>
                                          <p className="text-[9px] text-[var(--text-sub)] font-semibold">
                                            Mài giũa văn phong Việt Ngữ đỉnh cao. Click để mở bảng thẩm định với AI!
                                          </p>
                                        </>
                                      ) : (
                                        <>
                                          <h5 className="text-[11px] font-extrabold text-[var(--text-sub)] line-clamp-2 mt-1 italic">
                                            Bài bồi dưỡng đỉnh cao được thiết kế độc bản bởi Giáo sư AI.
                                          </h5>
                                          <p className="text-[9px] text-[var(--text-sub)] leading-snug font-semibold mt-0.5">
                                            Lấy cảm hứng từ chuyên đề độc quyền &quot;{activeTopicObj?.name || "Chung"}&quot;. Nhấp nút kích hoạt để nạp đề bài từ AI ngay!
                                          </p>
                                        </>
                                      )}
                                    </div>

                                    <div className="flex-none shrink-0 w-full md:w-auto">
                                      {foundTask ? (
                                        <button
                                          type="button"
                                          onClick={() => handleStartSolve(foundTask)}
                                          className="w-full cursor-pointer bg-red-600 text-white rounded-xl py-2 md:py-2.5 px-4 text-[10px] font-black uppercase tracking-wider shadow-md hover:bg-red-700 active:scale-97 transition-all flex items-center justify-center gap-1.5"
                                        >
                                          <span>⚡ {isDone ? "Luyện tập lại" : isWrong ? "Khắc phục lỗi sai" : "Bắt đầu làm bài"}</span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          disabled={isGenerating}
                                          onClick={() => handleGenerateSlotTask(selectedSlotIdx)}
                                          className="w-full cursor-pointer bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white rounded-xl py-2 md:py-2.5 px-4 text-[10px] font-black uppercase tracking-wider shadow-md active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
                                        >
                                          {isGenerating ? (
                                            <>
                                              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                              <span>Đang mài giũa đề...</span>
                                            </>
                                          ) : (
                                            <>
                                              <span>✨ Kích hoạt Bài Học Thuật {selectedSlotIdx}</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* 3) MISTAKES TAB */}
                    {activeModalTab === "mistakes" && (
                      <div className="space-y-4">
                        {activeTopicMistakes.length === 0 ? (
                          <div className="text-center py-10 px-4">
                            <span className="text-5xl block mb-2">🎉</span>
                            <h4 className="font-extrabold text-xs text-[var(--text-main)] uppercase tracking-wide">
                              Tuyệt vời! Không còn lỗi sai nào
                            </h4>
                            <p className="text-[10px] text-[var(--text-sub)] max-w-xxs mx-auto leading-normal mt-1 opacity-80">
                              Bạn đã trả lời xuất sắc toàn bộ thử thách tại chuyên đề này trước đây. Hãy giữ vững phong độ!
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <div className="p-3 bg-red-600/5 dark:bg-red-600/15 border border-red-600/15 rounded-xl">
                              <p className="text-[10px] text-red-600 dark:text-red-400 font-bold leading-normal">
                                ⚠️ Danh sách {activeTopicMistakes.length} câu hỏi bạn từng làm sai. Hãy nhấp &quot;Làm lại bài&quot; để chứng minh bản thân đã nâng tầm tiếng Việt lĩnh vực này!
                              </p>
                            </div>

                            <div className="flex flex-col gap-3">
                              {activeTopicMistakes.map((failedTask) => (
                                <div
                                  key={failedTask.id}
                                  className="bg-[var(--card-bg)] border border-[var(--border-color)] p-3.5 rounded-2xl hover:border-red-500/20 shadow-xs flex flex-col justify-between gap-3.5 transition-shadow"
                                >
                                  <div className="space-y-1.5">
                                    <span className="text-[8px] font-black uppercase text-red-600 bg-red-600/10 px-1.5 py-0.5 rounded">
                                      {failedTask.typeLabel}
                                    </span>
                                    <p
                                      className="text-xs font-medium text-[var(--text-main)] leading-relaxed"
                                      dangerouslySetInnerHTML={{ __html: failedTask.question }}
                                    />
                                  </div>

                                  <button
                                    onClick={() => handleStartSolve(failedTask)}
                                    className="cursor-pointer text-center bg-red-600 hover:bg-red-700 text-white font-black text-[10px] py-1.5 rounded-lg active:scale-97 change-transitions"
                                  >
                                    💪 Làm lại bài này
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* Footer info lock */}
              <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--border-color)] text-center text-[10px] text-[var(--text-sub)] font-semibold">
                ViLing • Sổ tay chuyên sâu: {activeTopicObj.name}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
