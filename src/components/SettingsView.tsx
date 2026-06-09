/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsViewProps {
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onReset: (type: "progress" | "full") => void;
  onOpenAdmin: () => void;
}

export default function SettingsView({
  soundEnabled,
  setSoundEnabled,
  darkMode,
  setDarkMode,
  onReset,
  onOpenAdmin,
}: SettingsViewProps) {
  const [reminderEnabled, setReminderEnabled] = React.useState<boolean>(() => {
    const saved = localStorage.getItem("viling_reminder_enabled");
    return saved === "true";
  });

  const [reminderTime, setReminderTime] = React.useState<string>(() => {
    const saved = localStorage.getItem("viling_reminder_time");
    return saved || "19:00";
  });

  const [permissionStatus, setPermissionStatus] = React.useState<string>(() => {
    if (!("Notification" in window)) return "not_supported";
    return Notification.permission;
  });

  const [confirmResetType, setConfirmResetType] = React.useState<"progress" | "full" | null>(null);
  const [isResetExecuting, setIsResetExecuting] = React.useState(false);

  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = React.useState<string>(() => {
    return localStorage.getItem("viling_selected_voice") || "google-tts";
  });

  React.useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const viVoices = allVoices.filter((v) => {
        const l = v.lang.toLowerCase();
        return l.startsWith("vi") || l.includes("vietnam") || l.includes("viet");
      });
      setVoices(viVoices);
    };

    updateVoices();
    if ("onvoiceschanged" in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("viling_selected_voice", selectedVoice);
  }, [selectedVoice]);

  React.useEffect(() => {
    localStorage.setItem("viling_reminder_enabled", String(reminderEnabled));
  }, [reminderEnabled]);

  React.useEffect(() => {
    localStorage.setItem("viling_reminder_time", reminderTime);
  }, [reminderTime]);

  // Periodic reminder execution while tab is open
  React.useEffect(() => {
    if (!reminderEnabled) return;

    let lastFiredDate = "";

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const dateStr = now.toDateString();

      if (currentTimeStr === reminderTime && lastFiredDate !== dateStr) {
        lastFiredDate = dateStr;
        triggerNotification(
          "Giờ vàng chinh phục Tiếng Việt! 🇻🇳",
          "🔥 Hãy dành ra 2 phút để cải thiện vốn từ vựng đa chiều và duy trì chuỗi liên tiếp!"
        );
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [reminderEnabled, reminderTime]);

  const triggerNotification = (title: string, body: string) => {
    if (!("Notification" in window)) {
      alert(`[Thông báo giả lập]: ${title}\n${body}`);
      return;
    }

    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f514.png",
        });
      } catch (e) {
        // Fallback for sandboxed iframes throwing errors on constructors
        alert(`[Thông báo]: ${title}\n${body}`);
      }
    } else {
      // Alert fallback if not granted
      alert(`[Thông báo]: ${title}\n${body}`);
    }
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Trình duyệt này không hỗ trợ Notification API.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === "granted") {
        triggerNotification(
          "ViLing - Đã bật thông báo 🔔",
          "Cảm ơn thiết lập của bạn! Chúng tôi đã sẵn sàng nhắc nhở bạn rèn luyện hằng ngày."
        );
      }
    } catch (e) {
      // Fallback callback style
      Notification.requestPermission((p) => {
        setPermissionStatus(p);
      });
    }
  };

  const testImmediateNotification = () => {
    const timeParts = reminderTime.split(":");
    const displayTime = `${timeParts[0]}h${timeParts[1] || "00"}`;
    triggerNotification(
      "Nhắc nhở học tập ViLing! 🇻🇳",
      `🔔 Đã đến giờ rèn luyện (${displayTime}). Nhấn vào đây để tiếp tục tăng trưởng vốn từ của bạn!`
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      <div>
        <h3 className="text-sm font-black text-[var(--text-main)] tracking-wider uppercase mb-3.5">
          Tùy chọn hiển thị & âm thanh
        </h3>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden divide-y divide-[var(--border-color)]">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-transparent">
            <div>
              <div className="text-sm font-bold text-[var(--text-main)]">Giao diện tối</div>
              <div className="text-[10px] text-[var(--text-sub)]">Chuyển đổi giao diện nền bảo vệ mắt</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between p-4 bg-transparent">
            <div>
              <div className="text-sm font-bold text-[var(--text-main)]">Hiệu ứng âm thanh</div>
              <div className="text-[10px] text-[var(--text-sub)]">Phát âm thanh khi làm bài tập, nhận điểm</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Voice Selector Dropdown */}
          <div className="flex flex-col p-4 bg-transparent gap-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[var(--text-main)]">Giọng phát âm Tiếng Việt</div>
                <div className="text-[10px] text-[var(--text-sub)]">Chọn giọng đọc từ vựng từ hệ thống hoặc máy dịch</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
              <select
                id="voice-selector"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:border-red-600 cursor-pointer"
              >
                <option value="google-tts">🟢 Mặc định (Google Stream - Đọc tự nhiên nhất)</option>
                {voices.length === 0 ? (
                  <option value="" disabled className="text-xs text-[var(--text-sub)]">
                    (Không tìm thấy giọng tiếng Việt cục bộ khác)
                  </option>
                ) : (
                  voices.map((v) => (
                    <option key={v.name} value={v.name} className="text-xs">
                      🔊 {v.name} ({v.lang})
                    </option>
                  ))
                )}
              </select>
              
              <button
                id="btn-voice-test"
                type="button"
                onClick={() => {
                  const testText = "Kính chào anh chị học viên, chúc anh chị một ngày học tiếng Việt đầy niềm vui và ý nghĩa!";
                  if (selectedVoice === "google-tts") {
                    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(testText)}`;
                    const audio = new Audio(ttsUrl);
                    audio.play().catch(err => {
                      console.warn("Google TTS test failed:", err);
                      // fallback to standard browser TTS
                      if (typeof window !== "undefined" && 'speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(testText);
                        utterance.lang = "vi-VN";
                        window.speechSynthesis.speak(utterance);
                      }
                    });
                  } else {
                    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(testText);
                      utterance.lang = "vi-VN";
                      utterance.rate = 0.88;
                      const matchingVoice = voices.find(v => v.name === selectedVoice);
                      if (matchingVoice) {
                        utterance.voice = matchingVoice;
                      }
                      window.speechSynthesis.speak(utterance);
                    }
                  }
                }}
                className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 border border-red-200/50 dark:border-red-900/30 text-[#b91c1c] dark:text-red-400 text-xs font-black px-4 py-2 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1 shrink-0"
                title="Nghe thử giọng nói đã chọn"
              >
                <span>🔊 Nghe Thử</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Study Reminder Segment */}
      <div>
        <h3 className="text-sm font-black text-[var(--text-main)] tracking-wider uppercase mb-3.5 flex items-center gap-1.5">
          🔔 Nhắc nhở học tập hàng ngày
        </h3>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[var(--text-main)]">Kích hoạt nhắc nhở</div>
              <div className="text-[10px] text-[var(--text-sub)]">
                Nhắc nhở học đều đặn để lưu giữ ngọn lửa học tập
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-red-600"></div>
            </label>
          </div>

          {reminderEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-color)] animate-fade-in">
              {/* Target time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-main)]">Chọn khung giờ nhắc nhở:</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-xs text-[var(--text-main)] font-semibold font-mono focus:outline-none focus:border-red-600"
                />
              </div>

              {/* API and Permission status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-main)]">Cấp quyền trình duyệt:</label>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      permissionStatus === "granted"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : permissionStatus === "denied"
                        ? "bg-red-500/10 text-red-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {permissionStatus === "granted"
                      ? "✓ Đã cho phép"
                      : permissionStatus === "denied"
                      ? "✗ Đã từ chối"
                      : permissionStatus === "not_supported"
                      ? "Không hỗ trợ"
                      : "• Chưa cấp quyền"}
                  </span>

                  {permissionStatus !== "granted" && permissionStatus !== "not_supported" && (
                    <button
                      onClick={requestPermission}
                      className="cursor-pointer text-[10px] bg-red-600 hover:bg-red-700 text-white font-black px-2.5 py-1 rounded-lg transition-transform active:scale-95"
                    >
                      Yêu cầu 🔔
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sm:col-span-2 pt-1">
                <button
                  onClick={testImmediateNotification}
                  className="cursor-pointer w-full text-center bg-[var(--input-bg)] border border-[var(--border-color)] hover:bg-red-500/5 hover:border-red-500/30 text-[var(--text-main)] font-black py-2 rounded-xl text-xs transition-colors active:scale-[0.99] flex items-center justify-center gap-1.5"
                >
                  🚀 Nhấp để kiểm tra thông báo ngay lập tức
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Methodology documentation */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
        <h4 className="text-sm font-black text-[var(--text-main)] flex items-center gap-1.5 mb-3">
          📚 Phương pháp học SCAMPER là gì?
        </h4>
        <div className="text-xs text-[var(--text-sub)] leading-relaxed space-y-2.5">
          <p>
            <strong>SCAMPER</strong> là viết tắt của các kỹ thuật kích thích tư duy sáng tạo trong ngôn ngữ:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>S (Substitute)</strong>: Thay thế từ bằng một từ đồng nghĩa khác biệt.</li>
            <li><strong>C (Combine)</strong>: Kết hợp tiếng, từ ghép tạo nghĩa thú vị mới.</li>
            <li><strong>A (Adapt)</strong>: Thích ứng ngữ cảnh để biến đổi sắc thái từ vựng.</li>
            <li><strong>M (Modify)</strong>: Sửa đổi, cường điệu hóa hoặc giảm nhẹ tính chất.</li>
            <li><strong>P (Put to other uses)</strong>: Dùng từ chuyên ngành trong cuộc sống.</li>
            <li><strong>E (Eliminate)</strong>: Lược bỏ tiếng dư thừa để viết súc tích.</li>
            <li><strong>R (Reverse)</strong>: Đảo ngược vị trí âm tiết tạo sắc thái độc đáo.</li>
          </ul>
        </div>
      </div>

      {/* Admin Section */}
      <div>
        <h3 className="text-sm font-black text-[var(--text-main)] tracking-wider uppercase mb-3.5">
          💼 Quản trị hệ thống ViLing
        </h3>
        <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-left transition-all hover:bg-red-500/20">
          <h4 className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-wide flex items-center gap-1">
            🔑 Cập nhật Nội dung Học tập & MicroLearn
          </h4>
          <p className="text-[10px] text-[var(--text-sub)] mt-1.5 leading-relaxed">
            Cho phép điều phối viên hoặc quản trị viên tùy biến ngân hàng đề thi câu hỏi, cập nhật hoặc đăng tải thêm các video học, clip Reels động trong mục MicroLearn.
          </p>
          <button
            onClick={onOpenAdmin}
            className="cursor-pointer mt-3 bg-red-600 hover:bg-red-700 active:scale-97 text-white font-black py-2.5 px-4 rounded-xl text-[10px] tracking-wide transition-all uppercase"
          >
            Mở Bảng Quản Trị Hệ Thống 🔒
          </button>
        </div>
      </div>

      {/* Dangerous/Reset section */}
      <div>
        <h3 className="text-xs font-black text-rose-600 tracking-wider uppercase mb-3.5 flex items-center gap-1.5 animate-pulse">
          ⚠️ Hệ thống & Khôi phục
        </h3>
        <div className="space-y-4">
          {/* Option 1: Study Progress Reset */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-left transition-all hover:bg-amber-500/10">
            <h4 className="text-xs font-black text-amber-700 dark:text-amber-500 uppercase tracking-wide flex items-center gap-1">
              🔄 Khôi phục riêng Tiến trình học
            </h4>
            <p className="text-[10px] text-[var(--text-sub)] mt-1.5 leading-relaxed">
              Tác vụ này sẽ đặt điểm XP về 0, làm trống danh sách từ vựng đã học, lịch sử câu hỏi trả lời sai, tiến độ học tập hôm nay và các ghi chú cá nhân. 
              <strong className="text-amber-600 dark:text-amber-400 block mt-1">Giữ nguyên: Hồ sơ học viên (Tên, ảnh đại diện, danh hiệu) & Cài đặt hệ thống (Âm thanh, Chế độ tối).</strong>
            </p>
            <button
              onClick={() => {
                console.log("SettingsView: clicked \"Đặt lại Tiến độ học\" button!");
                setConfirmResetType("progress");
              }}
              className="cursor-pointer mt-3 bg-amber-600 hover:bg-amber-700 active:scale-97 text-white font-black py-2 px-4 rounded-xl text-[10px] tracking-wide transition-all"
            >
              Đặt lại Tiến độ học ⚡
            </button>
          </div>

          {/* Option 2: Full Factory Reset */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-left transition-all hover:bg-red-500/10">
            <h4 className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-1">
              💀 Khôi phục Cài đặt gốc Toàn diện
            </h4>
            <p className="text-[10px] text-[var(--text-sub)] mt-1.5 leading-relaxed">
              Xóa sạch 100% cơ sở dữ liệu trên thiết bị. Reset hoàn toàn tất cả hồ sơ, ảnh đại diện tùy chọn, cài đặt chế độ sáng tối, cấu hình âm thanh, hẹn giờ nhắc nhở cũng như toàn bộ hoạt động học tập của bạn về trạng thái ban đầu khi cài app.
            </p>
            <button
              onClick={() => {
                console.log("SettingsView: clicked \"Khôi phục Cài đặt gốc\" button!");
                setConfirmResetType("full");
              }}
              className="cursor-pointer mt-3 bg-red-600 hover:bg-red-700 active:scale-97 text-white font-black py-2 px-4 rounded-xl text-[10px] tracking-wide transition-all"
            >
              Khôi phục Cài đặt gốc ✕
            </button>
          </div>
        </div>
      </div>

      {/* Pure React Custom Confirmation Dialog Overlay */}
      <AnimatePresence>
        {confirmResetType && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="bg-[var(--card-bg)] border-2 border-red-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center"
            >
              <div className="absolute top-4 right-4 text-xs font-mono font-bold bg-red-100 dark:bg-red-500/10 text-red-600 px-2 py-0.5 rounded-md">
                Cảnh báo ⚠️
              </div>

              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
                {confirmResetType === "progress" ? "🔄" : "💀"}
              </div>

              <h4 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider mb-2">
                {confirmResetType === "progress" 
                  ? "Đặt lại tiến trình học?" 
                  : "Khôi phục cài đặt gốc?"}
              </h4>

              <p className="text-[11px] text-[var(--text-sub)] leading-relaxed mb-5">
                {confirmResetType === "progress"
                  ? "Tác vụ này sẽ đặt điểm XP về 0, xóa sạch các từ vựng đã học, lịch sử câu hỏi sai, tiến độ học tập và ghi chú cá nhân. Giữ nguyên Hồ sơ cá nhân và các cài đặt của bạn."
                  : "Xóa toàn bộ 100% cơ sở dữ liệu trên thiết bị này. Ứng dụng sẽ trở lại trạng thái ban đầu tinh khôi (bao gồm cả cài đặt sáng tối, âm thanh, hồ sơ học viên)."}
              </p>

              {isResetExecuting ? (
                <div className="flex flex-col items-center justify-center gap-2 py-3">
                  <svg className="animate-spin h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-[10px] text-[var(--text-sub)] font-bold">Đang xóa sạch dữ liệu và khởi động lại...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      console.log("SettingsView: clicked \"Hủy bỏ\" in reset dialog");
                      setConfirmResetType(null);
                    }}
                    className="cursor-pointer py-2.5 px-4 rounded-xl border border-[var(--border-color)] text-xs font-black text-[var(--text-main)] fallback-btn hover:bg-[var(--input-bg)] active:scale-97 transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log(`SettingsView: clicked \"Xác nhận\" reset with type = ${confirmResetType}`);
                      setIsResetExecuting(true);
                      // Trigger direct app reset handlers
                      setTimeout(() => {
                        if (confirmResetType) {
                          console.log("SettingsView: executing onReset handler for type", confirmResetType);
                          onReset(confirmResetType);
                        } else {
                          console.error("SettingsView: confirmResetType was null upon execution!");
                        }
                      }, 500);
                    }}
                    className={`cursor-pointer py-2.5 px-4 rounded-xl text-white font-black text-xs active:scale-97 transition-all ${
                      confirmResetType === "progress"
                        ? "bg-amber-600 hover:bg-amber-700 font-extrabold"
                        : "bg-red-600 hover:bg-red-700 font-extrabold"
                    }`}
                  >
                    Xác nhận ✕
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
