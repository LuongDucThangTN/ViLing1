/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Task, ValidationResponse } from "../types";

interface TaskCardProps {
  key?: string | number;
  task: Task;
  isCompleted: boolean;
  onComplete: (taskId: string, xp: number) => void;
  soundEnabled: boolean;
  playSuccess: () => void;
  playFail: () => void;
  onMistake?: (taskId: string) => void;
  onPracticeTopic?: (topicId: string) => void;
}

export default function TaskCard({
  task,
  isCompleted,
  onComplete,
  soundEnabled,
  playSuccess,
  playFail,
  onMistake,
  onPracticeTopic,
}: TaskCardProps) {
  const [userVal, setUserVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<ValidationResponse | null>(null);
  const [selectedQuizIdx, setSelectedQuizIdx] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  React.useEffect(() => {
    setUserVal("");
    setFeedback(null);
    setSelectedQuizIdx(null);
    setHint(null);
    setLoadingHint(false);
    setWrongAttempts(0);
  }, [task.id]);

  const handleFetchHint = async () => {
    if (loadingHint || hint) return;
    setLoadingHint(true);
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
        setHint(json.data.hint);
      } else {
        throw new Error("Lỗi API gợi ý");
      }
    } catch (err) {
      console.error(err);
      setHint("Hãy nghĩ về từ viết thường, thể hiện đúng ngữ cảnh trang trọng tinh gọn!");
    } finally {
      setLoadingHint(false);
    }
  };

  // Determine Badge Background Color
  const getBadgeColor = (code: string) => {
    switch (code.toUpperCase()) {
      case "S":
        return "bg-blue-600 text-white";
      case "C":
        return "bg-emerald-600 text-white";
      case "A":
        return "bg-amber-500 text-slate-900";
      case "M":
        return "bg-orange-500 text-white";
      case "P":
        return "bg-teal-600 text-white";
      case "E":
        return "bg-rose-600 text-white";
      case "R":
        return "bg-purple-600 text-white";
      default:
        return "bg-slate-600 text-white";
    }
  };

  // Handle Multiple Choice Selection
  const handleQuizSelect = (idx: number) => {
    if (isCompleted || loading) return;
    setSelectedQuizIdx(idx);

    const isCorrect = idx === task.correctIndex;
    if (isCorrect) {
      playSuccess();
      setFeedback({
        isValid: true,
        explanation: task.successMsg,
        xpEarned: 10,
      });
      onComplete(task.id, 10);
    } else {
      playFail();
      setFeedback({
        isValid: false,
        explanation: "Rất tiếc! Lựa chọn này chưa chính xác. Hãy ôn lại kiến thức và thử câu tiếp theo nhé!",
        xpEarned: 0,
      });
      // Still mark completed so they learn the correct answer but no XP
      onComplete(task.id, 0);
      if (onMistake) onMistake(task.id);
    }
  };

  // Handle SCAMPER validation via Server-side Gemini AI
  const handleAiValidate = async () => {
    if (isCompleted || loading || !userVal.trim()) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/ai/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          question: task.question,
          userAnswer: userVal,
          typeLabel: task.typeLabel,
          topicId: task.topicId,
        }),
      });

      const json = await res.json();
      if (json.status === "success" && json.data) {
        const result: ValidationResponse = json.data;
        setFeedback(result);
        if (result.isValid) {
          playSuccess();
          onComplete(task.id, result.xpEarned || 10);
        } else {
          playFail();
          setWrongAttempts((prev) => {
            const next = prev + 1;
            if (next >= 2) {
              handleFetchHint();
            }
            return next;
          });
          if (onMistake) onMistake(task.id);
        }
      } else {
        throw new Error(json.error || "Lỗi mạng hoặc API");
      }
    } catch (err: any) {
      console.error(err);
      playFail();
      setWrongAttempts((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          handleFetchHint();
        }
        return next;
      });
      setFeedback({
        isValid: false,
        explanation: "Hệ thống AI bận hoặc chưa thể xác nhận. Hãy thử nhập lại từ đồng nghĩa rõ nghĩa hơn!",
        xpEarned: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-2xl mb-5 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in relative overflow-hidden">
      {/* AI Generated Watermark */}
      {task.isAiGenerated && (
        <div className="absolute top-2 right-3 flex items-center gap-1 opacity-70">
          <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold font-mono">
            GEMINI AI
          </span>
        </div>
      )}

      {/* Header Badge */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${getBadgeColor(
            task.typeCode
          )}`}
        >
          {task.typeLabel}
        </span>

        {/* Luyện tập theo chủ đề button */}
        <button
          onClick={() => onPracticeTopic && onPracticeTopic(task.topicId)}
          className="cursor-pointer text-xxs font-black text-[#b91c1c] hover:text-white hover:bg-[#b91c1c] dark:text-red-400 dark:hover:text-white bg-red-500/10 dark:bg-red-500/20 px-2.5 py-1.5 rounded-lg border border-red-500/15 flex items-center gap-1 active:scale-97 transition-all shrink-0"
        >
          🎯 Luyện tập chủ đề
        </button>
      </div>

      {/* Visual SCAMPER Technique Steps Roadmap Progress Flag Block */}
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

        const activeStep = steps.find(s => s.code === task.typeCode.toUpperCase());
        const isQuizType = task.typeCode.toUpperCase() === "Q";

        return (
          <div className="mb-4 bg-gradient-to-r from-red-500/5 via-orange-500/3 to-yellow-500/5 dark:from-red-950/15 dark:to-yellow-950/5 border border-red-500/15 p-3 rounded-2xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-[10px] font-black tracking-wide text-[var(--text-sub)]">
              <span className="flex items-center gap-1">🗺️ TOÀN CẢNH KỸ THUẬT SÁNG TẠO:</span>
              {activeStep ? (
                <span className="text-red-600 dark:text-red-400 font-extrabold uppercase flex items-center gap-1 text-xxs bg-red-500/10 px-2 py-0.5 rounded-full select-none">
                  Kỹ thuật: {activeStep.icon} {activeStep.code}
                </span>
              ) : isQuizType ? (
                <span className="text-indigo-600 dark:text-indigo-450 font-extrabold uppercase flex items-center gap-1 text-xxs bg-indigo-500/10 px-2 py-0.5 rounded-full select-none">
                  ⚡ Q - TRẮC NGHIỆM CỦNG CỐ
                </span>
              ) : null}
            </div>

            {/* Stepper with flag coloring */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 select-none">
              {steps.map((st) => {
                const isThisActive = st.code === task.typeCode.toUpperCase();
                return (
                  <div
                    key={st.code}
                    title={st.label}
                    className={`flex-1 min-w-[38px] text-center py-2 px-0.5 rounded-xl border transition-all text-xxs font-black flex flex-col items-center justify-center gap-0.5 ${
                      isThisActive
                        ? `${st.colorClass} shadow-md scale-102 ring-2 ring-red-500/20 border-transparent`
                        : "bg-white/40 dark:bg-black/20 border-slate-200 dark:border-neutral-800 opacity-35 text-[var(--text-sub)]"
                    }`}
                  >
                    <span className="text-sm">{st.icon}</span>
                    <span className="text-[9px] tracking-tight">{st.code}</span>
                  </div>
                );
              })}
            </div>

            {activeStep ? (
              <div className="text-[10px] text-[var(--text-main)] italic leading-relaxed pt-2 border-t border-red-500/10 flex items-start gap-1.5 font-medium">
                <span className="text-sm">🎯</span>
                <div>
                  <strong>Bản chất ý thức áp dụng:</strong> {activeStep.desc}
                </div>
              </div>
            ) : isQuizType ? (
              <div className="text-[10px] text-[var(--text-main)] italic leading-relaxed pt-2 border-t border-indigo-500/10 flex items-start gap-1.5 font-medium">
                <span className="text-sm">✍️</span>
                <div>
                  <strong>Mục tiêu:</strong> Ôn tập, nhận dạng nhanh các lỗi tư duy diễn đạt thô sơ và thực hành chuyển hoá để hoàn thiện phản xạ tự nhiên.
                </div>
              </div>
            ) : null}
          </div>
        );
      })()}

      {/* Styled HTML Question */}
      <div className="mb-4 text-base font-normal leading-relaxed text-[var(--text-main)]">
        <p dangerouslySetInnerHTML={{ __html: task.question }} />
      </div>

      {/* Quiz Format */}
      {task.format === "quiz" && task.options && (
        <div className="flex flex-col gap-2.5">
          {task.options.map((opt, idx) => {
            let btnClass = "border-[var(--border-color)] bg-[var(--input-bg)]";

            if (isCompleted) {
              if (idx === task.correctIndex) {
                btnClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/30 dark:text-emerald-400";
              } else if (selectedQuizIdx === idx) {
                btnClass = "border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400";
              } else {
                btnClass = "border-transparent opacity-60 bg-[var(--input-bg)] cursor-not-allowed";
              }
            } else {
              btnClass = "border-[var(--border-color)] hover:border-red-500/50 hover:bg-red-50/20 active:scale-99";
            }

            return (
              <button
                key={idx}
                disabled={isCompleted || loading}
                onClick={() => handleQuizSelect(idx)}
                className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all duration-200 cursor-pointer ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Input Format (SCAMPER) */}
      {task.format === "input" && (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={userVal}
            onChange={(e) => setUserVal(e.target.value)}
            disabled={isCompleted || loading}
            placeholder={task.placeholder || "Gõ câu trả lời..."}
            className="w-full p-3.5 border-2 border-[var(--border-color)] rounded-xl text-base outline-none bg-[var(--input-bg)] text-[var(--text-main)] transition-all duration-200 focus:border-red-500"
          />

           {/* Intelligent Hint Option with Gemini */}
          {!isCompleted && (
            <div className="mt-0.5 mb-1 text-left">
              {wrongAttempts >= 2 ? (
                /* Auto-hint prominent notification for struggling learners */
                <div className="bg-gradient-to-r from-purple-500/10 to-red-500/5 dark:from-purple-950/30 dark:to-red-950/20 border-2 border-purple-500/40 p-4 rounded-xl text-[11px] leading-relaxed animate-fade-in relative overflow-hidden shadow-inner flex flex-col gap-1.5">
                  <div className="absolute top-1 right-2">
                    <span className="text-[8px] bg-purple-500/20 text-purple-700 dark:text-purple-300 font-extrabold px-1.5 py-0.5 rounded-md uppercase font-mono tracking-wider animate-pulse">
                      Hỗ Trợ AI
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 pt-0.5">
                    <span className="text-sm">🤖</span>
                    <div>
                      <strong className="text-purple-700 dark:text-purple-400 font-extrabold block mb-1">
                        Gợi ý của Gemini sau {wrongAttempts} lần nhập chưa đúng:
                      </strong>
                      {loadingHint ? (
                        <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-[10px] font-black">
                          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Gemini đang biên soạn tư vấn tinh tế...</span>
                        </div>
                      ) : hint ? (
                        <p className="text-[var(--text-main)] font-semibold italic bg-white/40 dark:bg-black/20 p-2.5 rounded-lg border border-purple-500/10">
                          "{hint}"
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleFetchHint}
                          className="cursor-pointer text-xs font-black text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          👉 Nhấn đây để nhận gợi ý tức thì từ Gemini
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard hint trigger representation when attempts < 2 */
                hint ? (
                  <div className="bg-purple-500/5 text-purple-700 dark:text-purple-300 border border-purple-500/20 p-3 rounded-xl text-[11px] leading-relaxed animate-fade-in flex items-start gap-1.5">
                    <span className="text-sm">💡</span>
                    <div>
                      <strong className="text-purple-600 dark:text-purple-400 font-extrabold block mb-0.5">Gợi ý từ Gemini:</strong>
                      <span>{hint}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleFetchHint}
                    disabled={loadingHint}
                    className="cursor-pointer text-[10px] font-black text-purple-600 dark:text-purple-400 hover:text-white hover:bg-purple-600/95 border border-purple-500/30 dark:border-purple-500/40 hover:border-transparent px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-97 select-none disabled:opacity-50"
                  >
                    {loadingHint ? (
                      <>
                        <svg className="animate-spin h-3 w-3 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Gemini đang soạn gợi ý tinh vi...</span>
                      </>
                    ) : (
                      <>
                        <span>💡 Bí từ? Thử nhận một gợi ý thông thái từ Gemini</span>
                      </>
                    )}
                  </button>
                )
              )}
            </div>
          )}

          {!isCompleted ? (
            <button
              disabled={loading || !userVal.trim()}
              onClick={handleAiValidate}
              className="w-full bg-[#b91c1c] text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-red-500/10 cursor-pointer transition-all hover:bg-red-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      path-id="loading-circle-path"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Mô hình đang phân tích ngôn ngữ...</span>
                </>
              ) : (
                <>
                  <span>🤖 Kiểm tra với Gemini AI</span>
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-bold py-3.5 rounded-xl text-sm cursor-not-allowed"
            >
              ✔️ ĐÃ HOÀN THÀNH THỬ THÁCH
            </button>
          )}
        </div>
      )}

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`mt-4 p-4 rounded-xl border text-sm animate-fade-in leading-relaxed ${
            feedback.isValid
              ? "bg-emerald-500/5 text-emerald-700 border-emerald-500/20"
              : "bg-amber-500/5 text-amber-800 border-amber-500/20"
          }`}
        >
          <div className="flex items-start gap-1.5">
            <span className="text-base">{feedback.isValid ? "✨" : "💡"}</span>
            <div>
              <strong>{feedback.isValid ? "AI đánh giá: " : "Định hướng: "}</strong>
              {feedback.explanation}
              {feedback.xpEarned > 0 && (
                <div className="mt-1 font-bold text-emerald-600">
                  +{feedback.xpEarned} XP nhận thêm!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
