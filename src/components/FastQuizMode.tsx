/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Task, ValidationResponse } from "../types";

interface FastQuizModeProps {
  tasks: Task[];
  onComplete: (taskId: string, xp: number) => void;
  soundEnabled: boolean;
  playSuccess: () => void;
  playFail: () => void;
  selectedTopic?: string;
}

// Rich fallback vocabulary tasks covering essential themes to ensure we ALWAYS have plenty of fresh content
const FALLBACK_QUIZZES: Task[] = [
  {
    id: "fq_dl_1",
    topicId: "danh_lam",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm thắng cảnh",
    question: "Danh thắng nào sau đây được UNESCO vinh danh là Di sản thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi kỳ vĩ?",
    options: ["Vịnh Hạ Long", "Hồ Gươm", "Đèo Hải Vân", "Trại Gáo"],
    correctIndex: 0,
    successMsg: "Chính xác! Vịnh Hạ Long sở hữu vẻ đẹp kỳ vĩ được quốc tế đánh giá cực cao."
  },
  {
    id: "fq_tour_2",
    topicId: "du_lich",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm du lịch",
    question: "Loại hình du lịch tập trung vào việc tìm hiểu văn hóa ẩm thực, phong tục tập quán bản địa được gọi là gì?",
    options: ["Du lịch mạo hiểm", "Du lịch tâm linh", "Du lịch văn hóa", "Du lịch nghỉ dưỡng thương mại"],
    correctIndex: 2,
    successMsg: "Tuyệt vời! Du lịch văn hóa giúp du khách kết nối sâu sắc với bản sắc vùng miền."
  },
  {
    id: "fq_srv_3",
    topicId: "dich_vu",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm dịch vụ",
    question: "Để cải thiện chất lượng dịch vụ khách hàng, hành động nào sau đây là quan trọng hàng đầu?",
    options: ["Cắt giảm nhân viên dịch vụ", "Lắng nghe phản hồi và thấu hiểu nhu cầu khách hàng", "Phớt lờ các khiếu nại nhỏ", "Chỉ chăm sóc khách hàng VIP"],
    correctIndex: 1,
    successMsg: "Tuyệt đối chính xác! Thấu hiểu và phản hồi thiện chí là cốt lõi của dịch vụ 5 sao."
  },
  {
    id: "fq_env_4",
    topicId: "moi_truong",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm bảo bối xanh",
    question: "Giải pháp nào là bền vững nhất để giảm thiểu lượng chất thải nhựa sử dụng một lần ra đại dương?",
    options: ["Đốt rác lộ thiên", "Thay thế bằng sản phẩm dễ phân hủy sinh học và tái sử dụng", "Vứt rác sang các nước lân cận", "Chôn lấp rác sâu dưới lòng đất"],
    correctIndex: 1,
    successMsg: "Cực kỳ chuẩn xác! Sử dụng vật liệu thân thiện môi trường giúp loại bỏ rác nhựa từ gốc."
  },
  {
    id: "fq_edu_5",
    topicId: "giao_duc",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm giáo dục",
    question: "Phương pháp học tập chủ động (Active Learning) khuyến khích học viên làm gì?",
    options: ["Học vẹt thuộc lòng", "Đọc - chép thụ động", "Tư duy phản biện, thảo luận và thực hành thực tế", "Nghỉ học tự do"],
    correctIndex: 2,
    successMsg: "Chính xác! Học tập chủ động thúc đẩy nhận thức sâu sắc thông qua trải nghiệm."
  },
  {
    id: "fq_job_6",
    topicId: "viec_lam",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm thị trường",
    question: "Yếu tố nào được coi là 'Chìa khóa' giúp ứng viên ghi điểm trong mắt nhà tuyển dụng thời đại số?",
    options: ["Trình độ ngoại ngữ vượt trội", "Kỹ năng chuyên môn kết hợp khả năng tự học liên tục", "Sử dụng bằng cấp giả tinh vi", "Thời gian làm việc không nghỉ phép"],
    correctIndex: 1,
    successMsg: "Xuất sắc! Khả năng thích ứng và học hỏi liên tục giúp bạn định vị bản thân vượt trội."
  }
];

export default function FastQuizMode({
  tasks,
  onComplete,
  soundEnabled,
  playSuccess,
  playFail,
  selectedTopic,
}: FastQuizModeProps) {
  const [gameState, setGameState] = useState<"intro" | "playing" | "summary">("intro");
  const [currentQuizTasks, setCurrentQuizTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Interaction states for the current question
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [userInputValue, setUserInputValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentFeedback, setCurrentFeedback] = useState<ValidationResponse | null>(null);
  
  // Stat trackers
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [totalXpEarned, setTotalXpEarned] = useState<number>(0);

  const [fastQuizHint, setFastQuizHint] = useState<string | null>(null);
  const [isFastQuizHintLoading, setIsFastQuizHintLoading] = useState(false);

  const handleFetchFastQuizHint = async (task: Task) => {
    if (isFastQuizHintLoading || fastQuizHint) return;
    setIsFastQuizHintLoading(true);
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
        setFastQuizHint(json.data.hint);
      } else {
        throw new Error("Lỗi API gợi ý");
      }
    } catch (err) {
      console.error(err);
      setFastQuizHint("Nghĩ về cách ứng dụng ngôn từ súc tích nhất liên quan tới ngữ cảnh!");
    } finally {
      setIsFastQuizHintLoading(false);
    }
  };
  
  // Shuffle and pick 5 random tasks
  const startNewQuiz = () => {
    // Collect all unique tasks from app standard tasks + fallback tasks
    const allAvailable = [...tasks, ...FALLBACK_QUIZZES];
    const uniqueMap = new Map<string, Task>();
    allAvailable.forEach(t => uniqueMap.set(t.id, t));
    const mergedList = Array.from(uniqueMap.values());
    
    // Filter matching selected topic if it's not "tat_ca"
    let pool = mergedList;
    if (selectedTopic && selectedTopic !== "tat_ca" && selectedTopic !== "all") {
      pool = mergedList.filter(t => t.topicId === selectedTopic);
      // If we don't have enough questions for this topic, fill with remaining to avoid empty quiz
      if (pool.length < 5) {
        const fillers = mergedList.filter(t => t.topicId !== selectedTopic);
        pool = [...pool, ...fillers.slice(0, 5 - pool.length)];
      }
    }

    // Fisher-Yates shuffle
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    setCurrentQuizTasks(selected);
    setCurrentIndex(0);
    setSelectedOptIdx(null);
    setUserInputValue("");
    setCurrentFeedback(null);
    setCorrectAnswersCount(0);
    setTotalXpEarned(0);
    setFastQuizHint(null);
    setIsFastQuizHintLoading(false);
    setGameState("playing");
  };

  const activeTask = currentQuizTasks[currentIndex];

  // Validate answer for the current step
  const handleAnswerSubmit = async (selectedIdx?: number) => {
    if (!activeTask || currentFeedback) return;

    if (activeTask.format === "quiz") {
      const optionIdx = selectedIdx !== undefined ? selectedIdx : selectedOptIdx;
      if (optionIdx === null || optionIdx === undefined) return;
      
      setSelectedOptIdx(optionIdx);
      const isCorrect = optionIdx === activeTask.correctIndex;
      
      if (isCorrect) {
        playSuccess();
        setCorrectAnswersCount(prev => prev + 1);
        setTotalXpEarned(prev => prev + 10);
        setCurrentFeedback({
          isValid: true,
          explanation: activeTask.successMsg || "Bạn đã trả lời vô cùng chính xác!",
          xpEarned: 10
        });
        onComplete(activeTask.id, 10);
      } else {
        playFail();
        setCurrentFeedback({
          isValid: false,
          explanation: `Rất tiếc! Đáp án đúng đúng là: "${activeTask.options && activeTask.options[activeTask.correctIndex || 0]}".`,
          xpEarned: 0
        });
        onComplete(activeTask.id, 0);
      }
    } else {
      // Input Validation
      const answerVal = userInputValue.trim();
      if (!answerVal) return;

      setIsSubmitting(true);
      try {
        // Try to hit API route for smart Gemini verification
        const res = await fetch("/api/ai/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: activeTask.id,
            question: activeTask.question,
            userAnswer: answerVal,
            typeLabel: activeTask.typeLabel,
            topicId: activeTask.topicId,
          }),
        });

        const json = await res.json();
        if (json.status === "success" && json.data) {
          const result: ValidationResponse = json.data;
          setCurrentFeedback(result);
          if (result.isValid) {
            playSuccess();
            setCorrectAnswersCount(prev => prev + 1);
            setTotalXpEarned(prev => prev + (result.xpEarned || 10));
            onComplete(activeTask.id, result.xpEarned || 10);
          } else {
            playFail();
          }
        } else {
          throw new Error("Lỗi API validation");
        }
      } catch (err) {
        // Local baseline validation logic if API has issues
        console.warn("Fast quiz API validation error, running offline backup verification:", err);
        const acceptableAnswers = activeTask.answers || [];
        const isMatched = acceptableAnswers.some(ans => 
          answerVal.toLowerCase().includes(ans.toLowerCase()) || 
          ans.toLowerCase().includes(answerVal.toLowerCase())
        );

        if (isMatched) {
          playSuccess();
          setCorrectAnswersCount(prev => prev + 1);
          setTotalXpEarned(prev => prev + 10);
          setCurrentFeedback({
            isValid: true,
            explanation: activeTask.successMsg || "Tuyệt vời! Từ vựng bạn nhập hoàn toàn chính xác.",
            xpEarned: 10
          });
          onComplete(activeTask.id, 10);
        } else {
          playFail();
          setCurrentFeedback({
            isValid: false,
            explanation: `Chưa khớp hoàn toàn! Một số đáp án gợi ý: ${acceptableAnswers.join(", ") || "đáp án đắt giá phù hợp chủ đề"}.`,
            xpEarned: 0
          });
          onComplete(activeTask.id, 0);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < 4) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptIdx(null);
      setUserInputValue("");
      setCurrentFeedback(null);
      setFastQuizHint(null);
      setIsFastQuizHintLoading(false);
    } else {
      setGameState("summary");
    }
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm min-h-[460px] flex flex-col justify-between transition-colors duration-300">
      
      {/* INTRO MODULE */}
      {gameState === "intro" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 animate-fade-in">
          <div className="w-16 h-16 bg-red-500/10 dark:bg-red-500/15 rounded-full flex items-center justify-center mb-5 border border-red-500/15 animate-bounce">
            <span className="text-3xl">⚡</span>
          </div>
          <h2 className="text-lg font-black text-[var(--text-main)] mb-2">Chế Độ Luyện Tập Nhanh</h2>
          <p className="text-xs text-[var(--text-sub)] leading-relaxed max-w-sm mb-8 px-4">
            Rèn luyện phản xạ ngôn từ với chuỗi <strong className="text-red-500">5 câu hỏi ngẫu nhiên</strong> từ hệ ngân học từ vựng kết hợp SCAMPER sáng tạo. Tổng kết điểm số ngay lập tức!
          </p>

          <button
            onClick={startNewQuiz}
            className="cursor-pointer w-full max-w-[280px] bg-[#b91c1c] text-white font-black text-sm py-4 rounded-xl uppercase tracking-wider shadow-lg shadow-red-700/10 active:scale-98 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
          >
            <span>🚀 Bắt đầu ngay</span>
          </button>
        </div>
      )}

      {/* ACTIVE PLAYING MODULE */}
      {gameState === "playing" && activeTask && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Steps & Progress line */}
            <div className="flex items-center justify-between mb-4.5">
              <span className="text-xs font-black text-[var(--text-sub)] tracking-wider uppercase">
                Câu hỏi {currentIndex + 1} / 5
              </span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((step) => {
                  let indicatorClass = "bg-slate-200 dark:bg-slate-800";
                  if (step < currentIndex) {
                    indicatorClass = "bg-emerald-500";
                  } else if (step === currentIndex) {
                    indicatorClass = "bg-[#b91c1c] animate-pulse";
                  }
                  return <div key={step} className={`w-6.5 h-1.5 rounded-full ${indicatorClass} transition-all duration-300`} />;
                })}
              </div>
            </div>

            {/* Question Card theme label */}
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-red-500/10 text-[#b91c1c] border border-red-500/15">
                {activeTask.typeLabel}
              </span>
              <span className="text-xxs font-semibold text-[var(--text-sub)]">
                🔔 Thử thách phản xạ nhanh
              </span>
            </div>

            {/* Main Question view */}
            <div className="text-base font-normal leading-relaxed text-[var(--text-main)] mb-6">
              <p dangerouslySetInnerHTML={{ __html: activeTask.question }} />
            </div>

            {/* COMPONENT INTERACTION AREA */}
            <div className="space-y-3">
              {/* Quiz Mode list */}
              {activeTask.format === "quiz" && activeTask.options && (
                <div className="flex flex-col gap-2.5">
                  {activeTask.options.map((option, idx) => {
                    let btnStyle = "border-[var(--border-color)] bg-[var(--input-bg)]";
                    const isAnswered = currentFeedback !== null;

                    if (isAnswered) {
                      if (idx === activeTask.correctIndex) {
                        btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold";
                      } else if (selectedOptIdx === idx) {
                        btnStyle = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                      } else {
                        btnStyle = "border-transparent opacity-50 bg-[var(--input-bg)] cursor-not-allowed";
                      }
                    } else {
                      btnStyle = "border-[var(--border-color)] hover:border-red-500/50 active:scale-99";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleAnswerSubmit(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${btnStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Input logic */}
              {activeTask.format === "input" && (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={userInputValue}
                    onChange={(e) => setUserInputValue(e.target.value)}
                    disabled={currentFeedback !== null || isSubmitting}
                    placeholder={activeTask.placeholder || "Nhập câu trả lời tối ưu..."}
                    className="w-full p-3.5 border-2 border-[var(--border-color)] rounded-xl text-sm outline-none bg-[var(--input-bg)] text-[var(--text-main)] transition-all duration-200 focus:border-red-500"
                  />

                  {/* Gemini Intelligent Hint for Fast Quiz Mode */}
                  {currentFeedback === null && (
                    <div className="text-left mt-0.5">
                      {fastQuizHint ? (
                        <div className="bg-purple-500/5 text-purple-700 dark:text-purple-300 border border-purple-500/20 p-3 rounded-xl text-[11px] leading-relaxed animate-fade-in flex items-start gap-1.5">
                          <span className="text-sm">💡</span>
                          <div>
                            <strong className="text-purple-600 dark:text-purple-400 font-extrabold block mb-0.5">Gợi ý từ Gemini:</strong>
                            <span>{fastQuizHint}</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleFetchFastQuizHint(activeTask)}
                          disabled={isFastQuizHintLoading}
                          className="cursor-pointer text-[10px] font-black text-purple-600 dark:text-purple-400 hover:text-white hover:bg-purple-600/95 border border-purple-500/30 dark:border-purple-500/40 hover:border-transparent px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-97 select-none disabled:opacity-50"
                        >
                          {isFastQuizHintLoading ? (
                            <>
                              <svg className="animate-spin h-3 w-3 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Gemini đang tìm gợi ý...</span>
                            </>
                          ) : (
                            <>
                              <span>💡 Bí từ? Thử nhận một gợi ý thông thái từ Gemini</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {currentFeedback === null && (
                    <button
                      disabled={isSubmitting || !userInputValue.trim()}
                      onClick={() => handleAnswerSubmit()}
                      className="cursor-pointer w-full bg-[#b91c1c] text-white py-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow active:scale-98 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Gemini đang thẩm định...</span>
                        </>
                      ) : (
                        <span>🤖 Kiểm tra kết quả</span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Answer Feedbacks overlay */}
            <AnimatePresence>
              {currentFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`mt-4.5 p-4 rounded-xl border text-xs leading-relaxed ${
                    currentFeedback.isValid
                      ? "bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                      : "bg-amber-500/5 text-amber-800 dark:text-amber-400 border-amber-500/25"
                  }`}
                >
                  <p className="font-semibold block mb-1">
                    {currentFeedback.isValid ? "✨ Tuyệt vời!" : "💡 Phân tích lỗi:"}
                  </p>
                  <p>{currentFeedback.explanation}</p>
                  {currentFeedback.isValid && (
                    <span className="font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                      +10 XP đã được cộng!
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Core Footer Next controller tab */}
          {currentFeedback && (
            <div className="mt-6">
              <button
                onClick={handleNextQuestion}
                className="cursor-pointer w-full bg-[#b91c1c] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
              >
                <span>{currentIndex < 4 ? "Câu tiếp theo" : "Xem tổng kết"}</span>
                <span>➔</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUMMARY RESULTS MODULE */}
      {gameState === "summary" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 animate-fade-in">
          <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-500/15 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
            <span className="text-3xl">🏆</span>
          </div>

          <h2 className="text-xl font-black text-[var(--text-main)] mb-1">Hoàn thành đợt luyện nhanh!</h2>
          <span className="text-[10px] text-[var(--text-sub)] uppercase tracking-widest font-black block mb-5">
            tốc độ phản xạ hoàn hảo
          </span>

          {/* Score Circle Card */}
          <div className="bg-[var(--input-bg)] border border-[var(--border-color)]/30 px-6 py-5.5 rounded-2xl w-full max-w-[280px] mb-8 shadow-inner">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-[var(--text-sub)]">Trả lời đúng</span>
              <strong className="text-emerald-500 font-extrabold text-sm">{correctAnswersCount} / 5 câu</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--text-sub)]">Điểm thưởng tích lũy</span>
              <strong className="text-[#b91c1c] dark:text-red-400 font-black text-sm">+{totalXpEarned} XP</strong>
            </div>
          </div>

          {/* Interactive Motivation Text based on performance */}
          <p className="text-xs text-[var(--text-sub)] italic max-w-xs mb-8 px-4 leading-relaxed">
            {correctAnswersCount === 5 
              ? "Xuất sắc tuyệt đối! Bạn có tư duy ngôn từ rực rỡ chuẩn học giả tinh anh."
              : correctAnswersCount >= 3
              ? "Rất khá! Khả năng phản xạ và vốn học thuật của bạn đang tiến bộ thần tốc."
              : "Đừng nản chí! Thường xuyên luyện tập nhanh mỗi ngày sẽ giúp bạn ghi nhớ sâu rộng ngữ pháp."}
          </p>

          {/* Side-by-side action buttons */}
          <div className="flex gap-3 w-full max-w-[290px]">
            <button
              onClick={() => setGameState("intro")}
              className="cursor-pointer flex-1 bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs py-3.5 rounded-xl transition-all"
            >
              Quay lại
            </button>
            <button
              onClick={startNewQuiz}
              className="cursor-pointer flex-1 bg-[#b91c1c] text-white hover:bg-red-700 font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-md shadow-red-700/10 transition-all"
            >
              Luyện tiếp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
