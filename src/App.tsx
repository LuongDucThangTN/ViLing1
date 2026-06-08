/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Topic, Task, Badge, VideoPost, XpHistoryPoint } from "./types";
import { TOPICS, BADGES, VIDEO_POSTS } from "./data/staticData";
import {
  playSuccessSound,
  playFailSound,
  playClickSound,
  playSwipeSound,
} from "./utils/audio";

import Splash from "./components/Splash";
import BottomNav from "./components/BottomNav";
import TopicChips from "./components/TopicChips";
import TaskCard from "./components/TaskCard";
import MicroLearnFeed from "./components/MicroLearnFeed";
import ProfileView from "./components/ProfileView";
import SettingsView from "./components/SettingsView";
import TopicLessons from "./components/TopicLessons";
import MyVocabulary from "./components/MyVocabulary";
import FastQuizMode from "./components/FastQuizMode";
import WordOfTheDay from "./components/WordOfTheDay";

const getLearnedWordsTodayCount = () => {
  try {
    const rawDates = localStorage.getItem("viling_learned_word_dates");
    if (!rawDates) return 0;
    const dates = JSON.parse(rawDates);
    const todayStr = new Date().toISOString().split("T")[0];
    let count = 0;
    for (const key in dates) {
      if (dates[key] === todayStr) {
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
};

export default function App() {
  // Navigation & Tab States
  const [activeTab, setActiveTab] = useState<string>("luyentap");
  const [selectedTopic, setSelectedTopic] = useState<string>("tat_ca");
  const [layoutMode, setLayoutMode] = useState<"phone" | "expanded">(() => {
    return (localStorage.getItem("viling_layout_mode") as "phone" | "expanded") || "phone";
  });
  const [splashFinished, setSplashFinished] = useState<boolean>(false);
  const [activeOpenTopic, setActiveOpenTopic] = useState<string | null>(null);
  const [luyenSubTab, setLuyenSubTab] = useState<"challenge" | "academy" | "vocab" | "fastquiz">("challenge");
  const [activeChallengeIndex, setActiveChallengeIndex] = useState<number>(0);

  // Sync layout mode preferences
  useEffect(() => {
    localStorage.setItem("viling_layout_mode", layoutMode);
  }, [layoutMode]);

  // Reset challenge index when changing topic or subtab
  useEffect(() => {
    setActiveChallengeIndex(0);
  }, [selectedTopic, luyenSubTab]);

  // User States & Progress
  const [learnedTodayCount, setLearnedTodayCount] = useState<number>(getLearnedWordsTodayCount);
  const [score, setScore] = useState<number>(() => {
    return Number(localStorage.getItem("viling_score")) || 0;
  });
  const [totalWords, setTotalWords] = useState<number>(() => {
    return Number(localStorage.getItem("viling_words")) || 0;
  });
  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    const raw = localStorage.getItem("viling_completed");
    return raw ? JSON.parse(raw) : [];
  });
  const [completedDates, setCompletedDates] = useState<string[]>(() => {
    const raw = localStorage.getItem("viling_completed_dates");
    return raw ? JSON.parse(raw) : [];
  });
  const [xpHistory, setXpHistory] = useState<XpHistoryPoint[]>(() => {
    const raw = localStorage.getItem("viling_xp_history");
    if (raw) return JSON.parse(raw);
    return [{ date: "Bắt đầu", xp: 0 }];
  });
  const [mistakes, setMistakes] = useState<string[]>(() => {
    const raw = localStorage.getItem("viling_mistakes");
    return raw ? JSON.parse(raw) : [];
  });

  // Settings States
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const raw = localStorage.getItem("viling_sound");
    return raw !== "false"; // Default true
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const raw = localStorage.getItem("viling_theme");
    return raw !== "light"; // Default dark
  });

  // Tasks Database States (Predefined + Generated)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState<boolean>(true);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Confetti Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync Score/Progress to localStorage
  useEffect(() => {
    localStorage.setItem("viling_score", score.toString());
    localStorage.setItem("viling_words", totalWords.toString());
  }, [score, totalWords]);

  useEffect(() => {
    localStorage.setItem("viling_xp_history", JSON.stringify(xpHistory));
  }, [xpHistory]);

  useEffect(() => {
    localStorage.setItem("viling_completed_dates", JSON.stringify(completedDates));
  }, [completedDates]);

  useEffect(() => {
    localStorage.setItem("viling_completed", JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    localStorage.setItem("viling_mistakes", JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    localStorage.setItem("viling_sound", soundEnabled.toString());
  }, [soundEnabled]);

  // Sync Themes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#18191a");
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#b91c1c");
    }
    localStorage.setItem("viling_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Load Initial Tasks on Mount
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks/list");
        const json = await res.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          setTasks(json.data);
        }
      } catch (err) {
        console.error("Task list download error, falling back locally:", err);
        // Fallback local replica of initial static tasks
        setTasks([
          {
            id: "danh_lam_q1",
            topicId: "danh_lam",
            format: "quiz",
            typeCode: "Q",
            typeLabel: "Q - Trắc nghiệm ôn tập",
            question: "Địa danh nào sau đây được UNESCO công nhận là <span class='text-red-500 font-bold'>\"Di sản thiên nhiên thế giới\"</span>?",
            options: [
              "A. Vịnh Hạ Long",
              "B. Công viên nước Đầm Sen",
              "C. Đại lộ Nguyễn Huệ",
              "D. Đầm sen Tây Hồ"
            ],
            correctIndex: 0,
            successMsg: "Chính xác! Vịnh Hạ Long sở hữu vẻ đẹp kỳ vĩ của hàng ngàn đảo đá vôi, đạt danh hiệu danh giá này."
          },
          {
            id: "danh_lam_s1",
            topicId: "danh_lam",
            format: "input",
            typeCode: "S",
            typeLabel: "S - Thay thế (Substitute)",
            question: "Tìm một từ đồng nghĩa, trang trọng hảo cảm hơn để thay thế cho cụm từ <span class='text-purple-500 font-bold'>\"cảnh đẹp\"</span> khi miêu tả danh lam thắng cảnh kỳ vĩ:",
            placeholder: "Nhập một từ tinh tế (ví dụ: thắng cảnh, mỹ cảnh, kỳ quan, tuyệt cảnh)...",
            answers: ["thắng cảnh", "mỹ cảnh", "tuyệt cảnh", "kỳ quan", "cảnh sắc", "cảnh quan"],
            successMsg: "Tuyệt mỹ! Sử dụng từ vựng đắt giá giúp bài viết miêu tả thắng cảnh trở nên sinh động và thơ mộng."
          },
          {
            id: "du_lich_s1",
            topicId: "du_lich",
            format: "input",
            typeCode: "S",
            typeLabel: "S - Thay thế (Substitute)",
            question: "Tìm một cụm từ tiếng Việt thay thế trang trọng hơn cho từ <span class='text-blue-500 font-bold'>\"đi chơi\"</span> trong bối cảnh lữ hành nghỉ dưỡng hằng năm:",
            placeholder: "Nhập một từ/cụm từ (ví dụ: du lịch, nghỉ dưỡng, lữ hành)...",
            answers: ["du lịch", "nghỉ dưỡng", "lữ hành", "du ngoạn", "tham quan", "trải nghiệm"],
            successMsg: "Tuyệt đỉnh! Các từ ngữ này nâng tầm ý nghĩa hành trình khám phá, làm mượt ngôn từ."
          },
          {
            id: "du_lich_q1",
            topicId: "du_lich",
            format: "quiz",
            typeCode: "Q",
            typeLabel: "Q - Trắc nghiệm ôn tập",
            question: "Mô hình <span class='text-cyan-500 font-bold'>\"Du lịch sinh thái\"</span> (Ecotourism) chú trọng hàng đầu vào yếu tố nào?",
            options: [
              "A. Đô thị hóa thần tốc",
              "B. Bảo tồn tự nhiên kết hợp phát triển sinh kế bản địa",
              "C. Khai thác kiệt quệ tài nguyên động vật hoang dã",
              "D. Tổ chức trò chơi mạo hiểm công nghệ cao"
            ],
            correctIndex: 1,
            successMsg: "Chính xác! Du lịch sinh thái hướng tới tính bền vững, bảo vệ môi trường hoang dã."
          },
          {
            id: "dich_vu_q1",
            topicId: "dich_vu",
            format: "quiz",
            typeCode: "Q",
            typeLabel: "Q - Trắc nghiệm nhanh",
            question: "Đâu là yếu tố cốt lõi để nâng cao <span class='text-amber-500 font-bold'>\"Trải nghiệm khách hàng\"</span> trong ngành dịch vụ?",
            options: [
              "A. Sự tận tâm và thấu hiểu nhu cầu",
              "B. Việc phớt lờ ý kiến phản hồi",
              "C. Cắt giảm tối đa đội ngũ hỗ trợ",
              "D. Chỉ tập trung quảng cáo phóng đại"
            ],
            correctIndex: 0,
            successMsg: "Tuyệt diệu! Sự tận tâm và dịch vụ khách hàng hậu mãi chu đáo là chìa khóa của ngành dịch vụ xuất sắc."
          },
          {
            id: "dich_vu_s1",
            topicId: "dich_vu",
            format: "input",
            typeCode: "S",
            typeLabel: "S - Thay thế (Substitute)",
            question: "Tìm một từ/cụm từ chuẩn hóa đại diện cho hoạt động <span class='text-rose-500 font-bold'>\"chăm sóc, hỗ trợ sau khi mua hay lắp đặt sản phẩm\"</span>:",
            placeholder: "Nhập một từ (ví dụ: hậu mãi, bảo hành, bảo trì)...",
            answers: ["hậu mãi", "chăm sóc khách hàng", "bảo hành", "hỗ trợ sau bán hàng", "bảo dưỡng"],
            successMsg: "Cực kỳ chuẩn xác! Dịch vụ hậu mãi chu đáo gầy dựng lòng tin bền vững ở khách hàng."
          },
          {
            id: "moi_truong_q1",
            topicId: "moi_truong",
            format: "quiz",
            typeCode: "Q",
            typeLabel: "Q - Trắc nghiệm ôn tập",
            question: "Từ <span class='text-red-500 font-bold'>\"bảo tồn\"</span> có nghĩa là gì trong ngữ cảnh sinh thái?",
            options: [
              "A. Giữ lại không để cho mất đi hay hao hụt",
              "B. Phá bỏ các cây lâu năm để trồng hoa",
              "C. Xây dựng khu đô thị mới hiện đại hơn",
              "D. Đưa máy móc vào công nghiệp hóa rừng"
            ],
            correctIndex: 0,
            successMsg: "Chính xác! Bảo tồn gìn giữ tính đa dạng của hệ sinh thái thiên nhiên."
          },
          {
            id: "giao_duc_q1",
            topicId: "giao_duc",
            format: "quiz",
            typeCode: "Q",
            typeLabel: "Q - Trắc nghiệm nhanh",
            question: "Hoạt động truyền đạt kiến thức từ người dạy sang người học được gọi là gì?",
            options: [
              "A. Khảo sát thực địa",
              "B. Nghiên cứu tài chính",
              "C. Giảng dạy môn học",
              "D. Tổ chức tuyển sinh"
            ],
            correctIndex: 2,
            successMsg: "Chính xác! Giảng dạy truyền thừa tri thức thế hệ trước cho thế hệ sau."
          },
          {
            id: "moi_truong_s1",
            topicId: "moi_truong",
            format: "input",
            typeCode: "S",
            typeLabel: "S - Thay thế (Substitute)",
            question: "Tìm một động từ thay thế đồng nghĩa cho từ <span class='text-blue-500 font-bold'>\"ô nhiễm\"</span> (ví dụ trong cụm 'ô nhiễm nguồn nước'):",
            placeholder: "Nhập một từ/cụm từ tiếng Việt đồng nghĩa...",
            answers: ["vấy bẩn", "nhiễm bẩn", "vẫn đục", "làm bẩn", "bẩn hóa"],
            successMsg: "Tuyệt vời! Từ thay thế giữ nguyên thông điệp môi trường bị xâm hại."
          },
          {
            id: "giao_duc_c1",
            topicId: "giao_duc",
            format: "input",
            typeCode: "C",
            typeLabel: "C - Kết hợp (Combine)",
            question: "Ghép một tiếng với chữ <span class='text-emerald-500 font-bold'>\"SINH\"</span> để tạo thành một thuật ngữ liên quan đến Giáo dục (ví dụ: 'Sinh viên'):",
            placeholder: "Nhập một từ tiếng Việt hai âm tiết...",
            answers: ["học sinh", "sinh viên", "tuyển sinh", "thí sinh", "giáo sinh", "nữ sinh", "nam sinh"],
            successMsg: "Chính xác! Đều là những danh từ chỉ vai trò học tập học tập quan trọng."
          },
          {
            id: "viec_lam_r1",
            topicId: "viec_lam",
            format: "input",
            typeCode: "R",
            typeLabel: "R - Đảo ngược (Reverse)",
            question: "Đảo thứ tự các âm tiết trong cụm từ <span class='text-purple-500 font-bold'>\"QUY TRÌNH\"</span> (trong quy trình làm việc) để tạo nên một khái niệm hữu ích:",
            placeholder: "Nhập từ đảo ngược...",
            answers: ["trình quy"],
            successMsg: "Bảo đảm/Bổ sung! Trong tiếng Việt, 'quy trình' đảo lại ít phổ biến nhưng phản ánh chuyển vị cấu trúc ngôn từ đặc biệt!"
          },
          {
            id: "viec_lam_q1",
            topicId: "viec_lam",
            format: "quiz",
            typeCode: "Q",
            typeLabel: "Q - Trắc nghiệm ôn tập",
            question: "Nơi diễn ra mối quan hệ cung - cầu sức lao động, kết nối ứng viên và đơn vị tuyển dụng là gì?",
            options: [
              "A. Thị trường lao động",
              "B. Sàn môi giới nông sản",
              "C. Khu công nghiệp kỹ thuật",
              "D. Trung tâm hội nghị triển lãm"
            ],
            correctIndex: 0,
            successMsg: "Rất xuất sắc! Thị trường lao động là khái niệm trung tâm của hoạt động tuyển dụng và phát triển nghề nghiệp."
          }
        ]);
      } finally {
        setIsTasksLoading(false);
      }
    }
    fetchTasks();
  }, []);

  // Trigger high-fidelity Confetti
  const fireConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
    }> = [];

    // Spawn 80 particles
    const colors = ["#b91c1c", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
      });
    }

    let animationId: number;
    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // Gravity
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();

        // Remove if out of screen
        if (p.y > canvas!.height) {
          particles.splice(idx, 1);
        }
      });

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      }
    }
    animate();
  };

  // Completion Handler
  const handleTaskComplete = (taskId: string, xpEarned: number) => {
    if (completedTasks.includes(taskId)) return;

    const newScore = score + xpEarned;
    setScore(newScore);
    if (xpEarned > 0) {
      setTotalWords((prev) => prev + 1);
      fireConfetti();

      // Clear correct items from mistakes
      setMistakes((old) => old.filter((id) => id !== taskId));

      const now = new Date();
      const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      setXpHistory((old) => [...old, { date: timeLabel, xp: newScore }]);

      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;
      setCompletedDates((old) => {
        if (old.includes(todayStr)) return old;
        return [...old, todayStr];
      });

      // Save to daily learned dates mapping under viling_learned_word_dates
      try {
        const rawDates = localStorage.getItem("viling_learned_word_dates");
        const dates = rawDates ? JSON.parse(rawDates) : {};
        dates[taskId] = todayStr;
        localStorage.setItem("viling_learned_word_dates", JSON.stringify(dates));
        // Force state update to sync progress bar live!
        setLearnedTodayCount((count) => count + 1);
      } catch (e) {
        console.error("Lỗi ghi mốc thời gian học từ:", e);
      }
    }
    setCompletedTasks((prev) => [...prev, taskId]);
  };

  // Mistake Register
  const handleMistake = (taskId: string) => {
    setMistakes((old) => {
      if (old.includes(taskId)) return old;
      return [...old, taskId];
    });
  };

  // Generate and append an AI challenge from Gemini
  const handleAiGenerateTask = async () => {
    if (isAiGenerating) return;
    setIsAiGenerating(true);
    playSwipeSound(soundEnabled);

    const activeTopicObj = TOPICS.find((t) => t.id === selectedTopic) || TOPICS[0];
    const topicParam = selectedTopic === "tat_ca" ? "moi_truong" : selectedTopic; // default to env if All
    const topicNameParam = selectedTopic === "tat_ca" ? "Môi trường" : activeTopicObj.name;

    try {
      const res = await fetch("/api/ai/generate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: topicParam,
          topicName: topicNameParam,
        }),
      });

      const json = await res.json();
      if (json.status === "success" && json.data) {
        const newTask: Task = json.data;
        
        // Prepend task so it appears immediately on top of list
        setTasks((prev) => [newTask, ...prev]);
        playSuccessSound(soundEnabled);
      }
    } catch (err) {
      console.error("AI Generation Error, using fallback:", err);
      playFailSound(soundEnabled);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Reset progress or full application settings data
  const handleReset = (type: "progress" | "full") => {
    console.log("App.tsx: handleReset invoked with type =", type);
    try {
      if (type === "progress") {
        console.log("App.tsx: Starting progress partial reset");
        const progressKeys = [
          "viling_score",
          "viling_words",
          "viling_completed",
          "viling_completed_dates",
          "viling_xp_history",
          "viling_mistakes",
          "viling_learned_words",
          "viling_learned_word_dates",
          "viling_vocab_notes"
        ];
        progressKeys.forEach((key) => {
          console.log("App.tsx: Removing localStorage key =", key);
          localStorage.removeItem(key);
        });

        setScore(0);
        setTotalWords(0);
        setCompletedTasks([]);
        setCompletedDates([]);
        setXpHistory([{ date: "Bắt đầu", xp: 0 }]);
        setMistakes([]);
        setLearnedTodayCount(0);
        setSelectedTopic("tat_ca");
        setActiveTab("luyentap");
        
        playClickSound(soundEnabled);
        console.log("App.tsx: Progress keys removed. Scheduling window reload in 350ms.");
        
        // Force instant visual cleanup before reloading next frame
        setTimeout(() => {
          console.log("App.tsx: Executing window.location.reload() for progress reset.");
          window.location.reload();
        }, 350);
      } else {
        console.log("App.tsx: Starting fully comprehensive factory reset (clearing all localStorage)");
        localStorage.clear();
        playClickSound(soundEnabled);
        console.log("App.tsx: LocalStorage cleared entirely. Scheduling window reload in 350ms.");
        setTimeout(() => {
          console.log("App.tsx: Executing window.location.reload() for full reset.");
          window.location.reload();
        }, 350);
      }
    } catch (error) {
      console.error("App.tsx: Exception during reset:", error);
    }
  };

  // Swap tab context from reels to training immediately
  const handlePracticeTopicFromReels = (category: string) => {
    setSelectedTopic(category);
    setActiveTab("luyentap");
  };

  // Filter tasks based on active selectedTopic category
  const filteredTasks = selectedTopic === "tat_ca"
    ? tasks
    : tasks.filter((t) => t.topicId === selectedTopic);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--bg-color)] transition-colors duration-300 font-sans leading-relaxed text-[var(--text-main)] select-none p-0 sm:p-4 lg:p-6 overflow-x-hidden">
      <div className="flex flex-row items-center lg:items-stretch justify-center gap-6 w-full max-w-7xl h-screen sm:h-auto lg:h-[88vh] lg:max-h-[910px]">
        
        {/* LEFT WIND SIDEBAR: Companion dashboard (Hidden on mobile) */}
        <aside className="hidden lg:flex flex-col w-[300px] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-5 shadow-xl transition-all duration-300 h-full overflow-y-auto scrollbar-none gap-5 shrink-0 text-left">
          {/* User Info with Glowing Avatar */}
          <div className="flex flex-col items-center text-center pb-4 border-b border-[var(--border-color)]">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-4xl shadow-md mb-3 select-none">
              <span>🦉</span>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-[var(--card-bg)] flex items-center justify-center text-[10px] text-white font-black" title="Sẵn sàng học tập">
                ✓
              </div>
            </div>
            <h2 className="text-sm font-black tracking-tight text-[var(--text-main)]">Học viên ViLing</h2>
            <span className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest bg-red-500/10 px-2.5 py-0.5 rounded-full mt-1.5 select-none animate-pulse">
              {score >= 150 ? "Huyền thoại" : score >= 80 ? "Cao thủ" : score >= 40 ? "Học giả" : "Khởi hành"}
            </span>
          </div>

          {/* Core App Layout Control Selector */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-[var(--text-sub)] tracking-wider">⚙️ Bố cục Không Gian</span>
            <div className="grid grid-cols-2 bg-[var(--input-bg)] p-1 rounded-2xl border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => {
                  setLayoutMode("phone");
                  if (soundEnabled) {
                    try { playClickSound(soundEnabled); } catch(e){}
                  }
                }}
                className={`py-2 px-1.5 text-center font-bold text-[11px] rounded-xl cursor-pointer transition-all ${
                  layoutMode === "phone"
                    ? "bg-[var(--card-bg)] text-[#b91c1c] shadow-xs font-black scale-102"
                    : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
                }`}
              >
                📱 Di động
              </button>
              <button
                type="button"
                onClick={() => {
                  setLayoutMode("expanded");
                  if (soundEnabled) {
                    try { playClickSound(soundEnabled); } catch(e){}
                  }
                }}
                className={`py-2 px-1.5 text-center font-bold text-[11px] rounded-xl cursor-pointer transition-all ${
                  layoutMode === "expanded"
                    ? "bg-[var(--card-bg)] text-[#b91c1c] shadow-xs font-black scale-102"
                    : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
                }`}
              >
                💻 Máy tính
              </button>
            </div>
          </div>

          {/* Quick Stats Dashboard */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-black uppercase text-[var(--text-sub)] tracking-wider">📊 Thống Kê Nhanh</span>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[var(--input-bg)] border border-[var(--border-color)] p-3 rounded-2xl flex flex-col items-center">
                <span className="text-sm">⚡</span>
                <span className="text-xs font-black text-[var(--text-main)] mt-0.5">{score} XP</span>
                <span className="text-[9px] text-[var(--text-sub)] font-semibold mt-0.5 text-center">Tổng tích lũy</span>
              </div>
              <div className="bg-[var(--input-bg)] border border-[var(--border-color)] p-3 rounded-2xl flex flex-col items-center">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-black text-[var(--text-main)] mt-0.5">{completedDates.length > 0 ? `${completedDates.length} ngày` : "0 ngày"}</span>
                <span className="text-[9px] text-[var(--text-sub)] font-semibold mt-0.5 text-center">Chuỗi ngày</span>
              </div>
              <div className="bg-[var(--input-bg)] border border-[var(--border-color)] p-3 rounded-2xl flex flex-col items-center">
                <span className="text-sm">🎯</span>
                <span className="text-xs font-black text-[var(--text-main)] mt-0.5">{learnedTodayCount}/5 từ</span>
                <span className="text-[9px] text-[var(--text-sub)] font-semibold mt-0.5 text-center">Mục tiêu ngày</span>
              </div>
              <div className="bg-[var(--input-bg)] border border-[var(--border-color)] p-3 rounded-2xl flex flex-col items-center">
                <span className="text-sm">🏆</span>
                <span className="text-xs font-black text-[var(--text-main)] mt-0.5">{completedTasks.length} bài</span>
                <span className="text-[9px] text-[var(--text-sub)] font-semibold mt-0.5 text-center">Đã vượt qua</span>
              </div>
            </div>
          </div>

          {/* Badges Collection (Gamified Showcase) */}
          <div className="space-y-2.5 pt-2 border-t border-[var(--border-color)]">
            <span className="text-[10px] font-black uppercase text-[var(--text-sub)] tracking-wider">🏆 Huy Hiệu Của Bạn</span>
            <div className="space-y-2">
              {BADGES.map((badge) => {
                const isUnlocked = score >= badge.xpRequired;
                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-3 p-2.5 border transition-all rounded-2xl ${
                      isUnlocked
                        ? "bg-gradient-to-r from-red-600/5 to-amber-500/5 border-red-500/20"
                        : "opacity-45 border-dashed border-[var(--border-color)] bg-transparent select-none"
                    }`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-black text-[var(--text-main)] leading-none flex items-center gap-1">
                        {badge.title}
                        {!isUnlocked && <span className="text-[9px]">🔒</span>}
                      </span>
                      <span className="text-[9px] text-[var(--text-sub)] font-semibold mt-1 truncate leading-none">
                        {badge.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CENTER INTERACTIVE SCREEN: The Main Applet Frame */}
        <main className={`w-full ${layoutMode === "expanded" ? "lg:max-w-[760px] xl:max-w-[820px]" : "max-w-[420px]"} h-screen sm:h-[85vh] sm:max-h-[896px] lg:h-full bg-[var(--app-bg)] relative shadow-2xl overflow-hidden flex flex-col transition-all duration-300 border border-[var(--border-color)] sm:rounded-3xl shrink-0`}>
          
          {/* Splash overlay screen */}
          <Splash onComplete={() => setSplashFinished(true)} />

          {/* Dynamic Canvas Confetti */}
          <canvas
            ref={canvasRef}
            id="confetti-canvas"
            className="absolute inset-0 w-full h-full pointer-events-none z-50"
          />

          {/* Core Layout contents (Scrollable body above stick tab nav) */}
          {splashFinished && (
            <>
              <div className="flex-1 pb-32 overflow-y-auto scrollbar-none relative">
              
              {/* Tab: Luyện tập (Study) */}
              {activeTab === "luyentap" && (
                <div className="p-5 animate-fade-in flex flex-col min-h-full">
                  
                  {/* Page header */}
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#b91c1c] uppercase tracking-wider">ViLing App</span>
                      <h1 className="text-2xl font-black tracking-tight text-[var(--text-main)]">Không gian học tập</h1>
                    </div>
                    {/* Live score token */}
                    <div className="flex items-center gap-1 bg-red-500/10 dark:bg-red-500/5 px-3 py-1.5 rounded-full border border-red-500/15">
                      <span className="text-sm border-none bg-transparent">⚡</span>
                      <span className="text-xs font-black text-[#b91c1c] tracking-tight">{score} XP</span>
                    </div>
                  </div>

                  {/* Daily Vocabulary Goal Progress Bar */}
                  {(() => {
                    const dailyGoal = 5;
                    const progressPercent = Math.min(100, Math.round((learnedTodayCount / dailyGoal) * 100));
                    return (
                      <div className="bg-gradient-to-r from-red-500/5 to-amber-500/5 dark:from-red-500/10 dark:to-orange-500/10 border border-red-500/15 p-3.5 rounded-2xl mb-4 shrink-0 shadow-sm relative overflow-hidden">
                        {/* Invisible decorative background glows */}
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-500/10 rounded-full blur-xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

                        <div className="flex justify-between items-center mb-1 relative z-10 animate-fade-in">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">🎯</span>
                            <span className="text-[11px] font-black tracking-tight text-[var(--text-main)] uppercase">
                              Mục tiêu từ vựng hôm nay
                            </span>
                          </div>
                          <span className="text-[11px] font-black text-[#b91c1c] dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full select-none">
                            Đã học {learnedTodayCount}/{dailyGoal} từ
                          </span>
                        </div>

                        {/* Progress track */}
                        <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden mt-1.5 mb-2 relative z-10">
                          <div
                            className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {/* Encouraging caption */}
                        <div className="text-[10px] text-[var(--text-sub)] mt-1 ml-0.5 leading-relaxed relative z-10 animate-fade-in">
                          {learnedTodayCount === 0 ? (
                            <span>
                              Nhấp chọn phần <strong className="text-red-700 dark:text-red-400 font-black cursor-pointer hover:underline" onClick={() => setLuyenSubTab("academy")}>Chuyên đề</strong> phía dưới để bắt đầu học từ mới tích điểm!
                            </span>
                          ) : learnedTodayCount < dailyGoal ? (
                            <span>
                              Tiến triển rất tốt! Chỉ cần học thêm <strong className="text-[var(--text-main)] font-black">{dailyGoal - learnedTodayCount}</strong> từ nữa là hoàn thành mục tiêu ngày.
                            </span>
                          ) : (
                            <span className="text-[#b91c1c] dark:text-amber-400 font-extrabold flex items-center gap-1">
                              ⭐⭐⭐ Thật ấn tượng! Bạn đã hoàn toàn làm chủ mục tiêu từ vựng hôm nay!
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Segmented Sub-Tab Switcher */}
                  <div className="grid grid-cols-4 bg-[var(--input-bg)] p-1 rounded-2xl gap-0.5 mb-5 border border-[var(--border-color)]/30 shrink-0">
                    <button
                      onClick={() => {
                        playClickSound(soundEnabled);
                        setLuyenSubTab("challenge");
                      }}
                      className={`py-2 text-center rounded-xl text-[10px] font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 ${
                        luyenSubTab === "challenge"
                          ? "bg-[#b91c1c] text-white shadow-md shadow-red-700/15"
                          : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
                      }`}
                    >
                      <span>📝</span>
                      <span className="truncate">Thử thách</span>
                    </button>
                    <button
                      onClick={() => {
                        playClickSound(soundEnabled);
                        setLuyenSubTab("academy");
                      }}
                      className={`py-2 text-center rounded-xl text-[10px] font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 ${
                        luyenSubTab === "academy"
                          ? "bg-[#b91c1c] text-white shadow-md shadow-red-700/15"
                          : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
                      }`}
                    >
                      <span>🎓</span>
                      <span className="truncate">Chuyên đề</span>
                    </button>
                    <button
                      onClick={() => {
                        playClickSound(soundEnabled);
                        setLuyenSubTab("vocab");
                      }}
                      className={`py-2 text-center rounded-xl text-[10px] font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 ${
                        luyenSubTab === "vocab"
                          ? "bg-[#b91c1c] text-white shadow-md shadow-red-700/15"
                          : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
                      }`}
                    >
                      <span>📓</span>
                      <span className="truncate">Sổ tay</span>
                    </button>
                    <button
                      onClick={() => {
                        playClickSound(soundEnabled);
                        setLuyenSubTab("fastquiz");
                      }}
                      className={`py-2 text-center rounded-xl text-[10px] font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 ${
                        luyenSubTab === "fastquiz"
                          ? "bg-[#b91c1c] text-white shadow-md shadow-red-700/15"
                          : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
                      }`}
                    >
                      <span>⚡</span>
                      <span className="truncate">Luyện nhanh</span>
                    </button>
                  </div>

                  {/* SUB-TAB CONTENTS Rendering Area */}
                  <div className="space-y-4 overflow-hidden">
                    <AnimatePresence mode="wait">
                      {luyenSubTab === "challenge" && (
                        <motion.div
                          key="challenge"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="space-y-4"
                        >
                          {/* Category Chips Selection Selector */}
                          <TopicChips
                            topics={TOPICS}
                            selectedTopic={selectedTopic}
                            setSelectedTopic={(id) => {
                              playClickSound(soundEnabled);
                              setSelectedTopic(id);
                            }}
                          />

                          {/* Word of the Day widget block */}
                          <WordOfTheDay 
                            soundEnabled={soundEnabled} 
                            playClick={() => playClickSound(soundEnabled)}
                          />

                          {/* AI Challenge Generator Banner */}
                          <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-4.5 rounded-2xl shadow-md relative overflow-hidden flex flex-col gap-3">
                            <p className="text-[10px] uppercase font-black tracking-widest text-[#ffd700]">THỬ THÁCH TRÍ TUỆ NHÂN TẠO</p>
                            <h3 className="font-extrabold text-sm leading-snug">
                              Học từ vựng cấp tiến tích hợp AI
                            </h3>
                            <p className="text-xxs opacity-90 leading-normal">
                              Nhờ trợ lý ảo Gemini viết riêng cho bạn các bài đọc hiểu và trắc nghiệm thực tế xoay quanh chủ đề đã chọn ngay lập tức!
                            </p>

                            <button
                              disabled={isAiGenerating}
                              onClick={handleAiGenerateTask}
                              className="cursor-pointer w-full bg-white text-[#b91c1c] font-black text-xs py-3 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow active:scale-98 disabled:opacity-75 focus:outline-none"
                            >
                              {isAiGenerating ? (
                                <>
                                  <svg className="animate-spin h-4.5 w-4.5 text-[#b91c1c]" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Gemini đang soạn câu hỏi...</span>
                                </>
                              ) : (
                                <>
                                  <span>⚡ Tạo thử thách mới với AI</span>
                                </>
                              )}
                            </button>

                            {selectedTopic !== "tat_ca" && (
                              <button
                                onClick={() => {
                                  playClickSound(soundEnabled);
                                  setLuyenSubTab("academy");
                                  setActiveOpenTopic(selectedTopic);
                                }}
                                className="cursor-pointer mt-2.5 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-[11px] py-2.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] outline-none"
                              >
                                📚 Cẩm nang & Sửa lỗi: {TOPICS.find((t) => t.id === selectedTopic)?.name} 🏁
                              </button>
                            )}
                          </div>

                          {/* Tasks Card Feed List */}
                          {isTasksLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                              <svg className="animate-spin h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="text-xs text-[var(--text-sub)] font-semibold">Đang tải ngân hàng câu hỏi...</span>
                            </div>
                          ) : filteredTasks.length === 0 ? (
                            <div className="text-center py-16 bg-slate-500/5 rounded-2xl border border-dashed border-[var(--border-color)]">
                              <span className="text-4xl mb-3 block">🚧</span>
                              <h4 className="font-bold text-sm text-[var(--text-main)]">Thử thách chưa có sẵn</h4>
                              <p className="text-xxs text-[var(--text-sub)] max-w-xs mx-auto px-4 mt-1">
                                Chưa có bài ôn nào cho danh mục này. Hãy ấn nút tạo bài luyện AI phía trên để Gemini viết tặng bạn câu hỏi thiết thực!
                              </p>
                            </div>
                          ) : (
                            (() => {
                              const currentIndexClamped = Math.min(activeChallengeIndex, filteredTasks.length - 1);
                              const currentTask = filteredTasks[currentIndexClamped];
                              const hasNext = currentIndexClamped < filteredTasks.length - 1;
                              const completedCount = filteredTasks.filter(t => completedTasks.includes(t.id)).length;
                              const progressPercent = Math.round((completedCount / filteredTasks.length) * 100);

                              return (
                                <div className="space-y-4">
                                  {/* Tasks progress tracker */}
                                  <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-2xl shadow-xs">
                                    <div className="flex items-center justify-between text-xxs font-black text-[var(--text-sub)] tracking-wider uppercase mb-2">
                                      <span>🚀 TIẾN TRÌNH LUYỆN ĐỀ:</span>
                                      <span className="text-[#b91c1c] dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full select-none">
                                        Câu {currentIndexClamped + 1} / {filteredTasks.length} ({progressPercent}% đạt)
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1.5 mb-1 select-none">
                                      <div
                                        className="h-full bg-gradient-to-r from-[#b91c1c] to-red-600 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercent}%` }}
                                      />
                                    </div>
                                    <div className="flex justify-between text-[9px] font-bold text-[var(--text-sub)]">
                                      <span>Bắt đầu</span>
                                      <span>Hoàn thành {completedCount} / {filteredTasks.length} bài</span>
                                    </div>
                                  </div>

                                  <AnimatePresence mode="wait">
                                    <motion.div
                                      key={currentTask.id}
                                      initial={{ opacity: 0, x: 15 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -15 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <TaskCard
                                        task={currentTask}
                                        isCompleted={completedTasks.includes(currentTask.id)}
                                        onComplete={handleTaskComplete}
                                        soundEnabled={soundEnabled}
                                        playSuccess={() => playSuccessSound(soundEnabled)}
                                        playFail={() => playFailSound(soundEnabled)}
                                        onMistake={handleMistake}
                                        onPracticeTopic={(topicId) => {
                                          setLuyenSubTab("academy");
                                          setActiveOpenTopic(topicId);
                                        }}
                                        hasNext={hasNext}
                                        onNext={() => {
                                          playClickSound(soundEnabled);
                                          if (hasNext) {
                                            setActiveChallengeIndex(currentIndexClamped + 1);
                                          } else {
                                            // Wrap or complete
                                            setActiveChallengeIndex(0);
                                          }
                                        }}
                                      />
                                    </motion.div>
                                  </AnimatePresence>
                                </div>
                              );
                            })()
                          )}
                        </motion.div>
                      )}

                      {luyenSubTab === "academy" && (
                        <motion.div
                          key="academy"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <TopicLessons
                            tasks={tasks}
                            completedTasks={completedTasks}
                            mistakes={mistakes}
                            onComplete={handleTaskComplete}
                            setMistakes={setMistakes}
                            setTasks={setTasks}
                            soundEnabled={soundEnabled}
                            score={score}
                            setScore={setScore}
                            setXpHistory={setXpHistory}
                            activeOpenTopic={activeOpenTopic}
                            setActiveOpenTopic={setActiveOpenTopic}
                            onWordLearned={() => setLearnedTodayCount((c) => c + 1)}
                          />
                        </motion.div>
                      )}

                      {luyenSubTab === "vocab" && (
                        <motion.div
                          key="vocab"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <MyVocabulary
                            tasks={tasks}
                            completedTasks={completedTasks}
                            soundEnabled={soundEnabled}
                          />
                        </motion.div>
                      )}

                      {luyenSubTab === "fastquiz" && (
                        <motion.div
                          key="fastquiz"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <FastQuizMode
                            tasks={tasks}
                            onComplete={handleTaskComplete}
                            soundEnabled={soundEnabled}
                            playSuccess={() => playSuccessSound(soundEnabled)}
                            playFail={() => playFailSound(soundEnabled)}
                            selectedTopic={selectedTopic}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="text-center py-6 shrink-0 mt-2">
                    <span className="text-[10px] text-[var(--text-sub)] font-semibold block tracking-wide">
                      ViLing • Hệ thống đào tạo từ vựng thông minh kết hợp AI
                    </span>
                  </div>
                </div>
              )}

              {/* Tab: MicroLearn (Reels Feed) */}
              {activeTab === "video" && (
                <div className="absolute inset-0 w-full h-[81vh]">
                  <MicroLearnFeed
                    posts={VIDEO_POSTS}
                    onPracticeTopic={handlePracticeTopicFromReels}
                    soundEnabled={soundEnabled}
                    playSwipe={() => playSwipeSound(soundEnabled)}
                    playSuccess={() => playSuccessSound(soundEnabled)}
                  />
                </div>
              )}

              {/* Tab: Hồ sơ (Profile) */}
              {activeTab === "hoso" && (
                <div className="p-5 animate-fade-in">
                  <div className="mb-5">
                    <span className="text-[10px] font-bold text-[#b91c1c] uppercase tracking-wider">Thành tựu</span>
                    <h1 className="text-2xl font-black tracking-tight text-[var(--text-main)]">Hồ sơ cá nhân</h1>
                  </div>

                  <ProfileView
                    score={score}
                    totalWords={totalWords}
                    badges={BADGES}
                    xpHistory={xpHistory}
                    completedDates={completedDates}
                    tasks={tasks}
                    completedTasks={completedTasks}
                  />
                </div>
              )}

              {/* Tab: Cài đặt (Settings) */}
              {activeTab === "caidat" && (
                <div className="p-5 animate-fade-in">
                  <div className="mb-5">
                    <span className="text-[10px] font-bold text-[#b91c1c] uppercase tracking-wider">Cấu hình</span>
                    <h1 className="text-2xl font-black tracking-tight text-[var(--text-main)]">Cài đặt hệ thống</h1>
                  </div>

                  <SettingsView
                    soundEnabled={soundEnabled}
                    setSoundEnabled={setSoundEnabled}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    onReset={handleReset}
                  />
                </div>
              )}

            </div>

            {/* Absolute Sticky Bottom Nav container */}
            <BottomNav
              activeTab={activeTab}
              setActiveTab={(tab) => {
                playClickSound(soundEnabled);
                setActiveTab(tab);
              }}
            />
          </>
        )}
      </main>

      {/* RIGHT WIND SIDEBAR: Analytics & Insight Cards (Hidden on mobile) */}
      <aside className="hidden lg:flex flex-col w-[300px] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-5 shadow-xl transition-all duration-300 h-full overflow-y-auto scrollbar-none gap-5 shrink-0 text-left">
        {/* XP Progress Insights Card */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-black uppercase text-[var(--text-sub)] tracking-wider">📈 Biểu đồ Điểm XP</span>
          <div className="bg-[var(--input-bg)] border border-[var(--border-color)] p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-sub)]">
              <span>Lịch sử tích lũy</span>
              <span className="text-red-600 dark:text-red-400 font-extrabold">{score} XP</span>
            </div>
            
            {/* Visualized pure CSS mini milestone bars */}
            <div className="flex items-end justify-between h-20 px-2 pt-2 gap-2 select-none">
              {(() => {
                const itemsToShow = xpHistory.slice(-5);
                // Ensure we show at least 5 columns even with placeholder
                const filledItems = Array.from({ length: 5 }, (_, idx) => {
                  return itemsToShow[idx] || { date: "-", xp: 0 };
                });
                const maxVal = Math.max(...filledItems.map(x => x.xp), 15);
                
                return filledItems.map((pt, index) => {
                  const percent = Math.min(100, Math.round((pt.xp / maxVal) * 100));
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 bg-neutral-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 origin-bottom z-50 whitespace-nowrap">
                        {pt.xp} XP
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-neutral-800 rounded-t-lg overflow-hidden h-12 flex items-end">
                        <div
                          className="bg-gradient-to-t from-red-600 to-orange-500 w-full rounded-t-md transition-all duration-500 ease-out"
                          style={{ height: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[8px] text-[var(--text-sub)] font-extrabold truncate w-full text-center leading-none">
                        {pt.date.split(" (")[0]}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* SCAMPER Mental Sandbox Reminders */}
        <div className="space-y-2.5 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-[var(--text-sub)] tracking-wider block mb-2">🧠 Tư duy Đột phá SCAMPER</span>
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto scrollbar-none pr-1 text-left">
              {[
                { l: "S", t: "Substitute", d: "Thay thế", desc: "Đổi thành phần, cách dịch bằng giải pháp khác." },
                { l: "C", t: "Combine", d: "Kết hợp", desc: "Ghép ghép từ vựng với thành ngữ hay ngữ cảnh." },
                { l: "A", t: "Adapt", d: "Thích ứng", desc: "Áp dụng linh hoạt từ vựng trong đời sống." },
                { l: "M", t: "Modify", d: "Sửa đổi", desc: "Tăng, giảm cường điệu hoặc cấu lập từ ngữ mới." },
                { l: "P", t: "Put to Use", d: "Dùng mục đích khác", desc: "Áp dụng từ vào văn phong chuyên biệt khác biệt." },
                { l: "E", t: "Eliminate", d: "Loại bỏ", desc: "Rút gọn, cắt tỉa từ thừa, giữ ý chính cốt lõi sâu sắc." },
                { l: "R", t: "Reverse", d: "Đảo ngược", desc: "Đảo ngược cấu trúc câu hay vế để tăng biểu đạt." }
              ].map((item) => (
                <div key={item.l} className="bg-[var(--input-bg)] border border-[var(--border-color)] p-2 rounded-xl flex items-start gap-2.5 hover:border-red-500/20 transition-all duration-150">
                  <span className="w-5 h-5 rounded bg-[#b91c1c] text-white flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">
                    {item.l}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-[var(--text-main)] leading-none">
                      {item.t} ({item.d})
                    </span>
                    <span className="text-[9px] text-[var(--text-sub)] font-semibold leading-normal mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-600/5 to-amber-500/5 border border-red-500/10 p-3 rounded-2xl mt-4">
            <span className="text-[9px] font-black text-[#b91c1c] uppercase block">💡 Gợi Ý Luyện Tập</span>
            <p className="text-[10px] text-[var(--text-sub)] font-semibold leading-relaxed mt-1">
              Nhấp nút 🔊 ở danh sách từ vựng để nghe giọng phát âm chuẩn bản xứ cho cả tiếng Việt và tiếng Anh.
            </p>
          </div>
        </div>
      </aside>

    </div>
  </div>
  );
}
