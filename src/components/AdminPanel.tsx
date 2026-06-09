/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Task, VideoPost, Topic } from "../types";
import { TOPICS } from "../data/staticData";

interface AdminPanelProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  posts: VideoPost[];
  setPosts: React.Dispatch<React.SetStateAction<VideoPost[]>>;
  soundEnabled: boolean;
}

export default function AdminPanel({
  tasks,
  setTasks,
  posts,
  setPosts,
  soundEnabled,
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("viling_admin_auth") === "true";
  });
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Sub tabs inside Admin: 'tasks' | 'posts'
  const [activeSubTab, setActiveSubTab] = useState<"tasks" | "posts">("tasks");

  // Filter & Search states
  const [taskSearch, setTaskSearch] = useState("");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState("all");
  const [selectedFormatFilter, setSelectedFormatFilter] = useState("all");

  // Editing Task details
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({});

  // Editing VideoPost details
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<Partial<VideoPost>>({});

  // Status message
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().toLowerCase() === "admin") {
      setIsAuthenticated(true);
      setLoginError("");
      localStorage.setItem("viling_admin_auth", "true");
    } else {
      setLoginError("Mật khẩu không chính xác! Gợi ý: Hãy nhập 'admin'.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("viling_admin_auth");
  };

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(""), 3500);
    } else {
      setInfoMessage(msg);
      setTimeout(() => setInfoMessage(""), 3500);
    }
  };

  // --- Task Editing Functions ---
  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskForm({ ...task });
  };

  const handleAddTask = () => {
    const newId = `task_${Date.now()}`;
    const newTask: Task = {
      id: newId,
      topicId: "giao_duc",
      format: "quiz",
      typeCode: "Q",
      typeLabel: "Q - Trắc nghiệm ôn tập",
      question: "Câu văn mẫu chứa <span class='text-red-500 font-bold'>\"từ ngữ\"</span> cần rèn luyện...",
      options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      correctIndex: 0,
      placeholder: "",
      answers: [],
      successMsg: "Học tập tiến bộ! Giải nghĩa ngôn từ độc đáo.",
    };
    setEditingTaskId(newId);
    setTaskForm(newTask);
  };

  const handleSaveTask = async () => {
    if (!taskForm.question || taskForm.question.trim() === "") {
      showToast("Câu hỏi không thể để trống!", true);
      return;
    }

    try {
      const res = await fetch("/api/tasks/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: taskForm }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setTasks((prev) => {
          const idx = prev.findIndex((t) => t.id === taskForm.id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = taskForm as Task;
            return copy;
          } else {
            return [...prev, taskForm as Task];
          }
        });
        setEditingTaskId(null);
        showToast("Lưu câu hỏi thành công! ✓");
      } else {
        showToast(data.error || "Lỗi khi lưu câu hỏi.", true);
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối máy chủ.", true);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi ${id}?`)) return;

    try {
      const res = await fetch("/api/tasks/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        if (editingTaskId === id) setEditingTaskId(null);
        showToast("Đã xóa câu hỏi khỏi ngân hàng đề!");
      } else {
        showToast(data.error || "Lỗi xóa câu hỏi.", true);
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối máy chủ.", true);
    }
  };

  // --- VideoPost Editing Functions ---
  const startEditingPost = (post: VideoPost) => {
    setEditingPostId(post.id);
    setPostForm({ ...post });
  };

  const handleAddPost = () => {
    const newId = `v_${Date.now()}`;
    const newPost: VideoPost = {
      id: newId,
      username: "admin_viling",
      title: "Mẹo hay ghi nhớ thuật ngữ Tiếng Việt mới rực rỡ!",
      category: "tat_ca",
      likes: 120,
      comments: 5,
      bgGradient: "linear-gradient(135deg, #4c1d95, #c084fc)",
      videoUrl: "",
      audioUrl: "",
    };
    setEditingPostId(newId);
    setPostForm(newPost);
  };

  const handleSavePost = async () => {
    if (!postForm.title || postForm.title.trim() === "") {
      showToast("Tiêu đề bài viết không được trống!", true);
      return;
    }

    try {
      const res = await fetch("/api/microlearn/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: postForm }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setPosts((prev) => {
          const idx = prev.findIndex((p) => p.id === postForm.id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = postForm as VideoPost;
            return copy;
          } else {
            return [...prev, postForm as VideoPost];
          }
        });
        setEditingPostId(null);
        showToast("Lưu bài đăng thành công! ✓");
      } else {
        showToast(data.error || "Lỗi khi lưu bài đăng.", true);
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối máy chủ.", true);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài đăng MicroLearn ${id}?`)) return;

    try {
      const res = await fetch("/api/microlearn/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        if (editingPostId === id) setEditingPostId(null);
        showToast("Đã loại bỏ bài đăng ra khỏi MicroLearn feed!");
      } else {
        showToast(data.error || "Lỗi khi xóa bài đăng.", true);
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối máy chủ.", true);
    }
  };

  // Pre-configured templates helper for SCAMPER code selection
  const updateScamperFields = (code: string) => {
    const templates: Record<string, { label: string; p: string; a: string[]; s: string }> = {
      Q: { label: "Q - Trắc nghiệm ôn tập", p: "", a: [], s: "Rất vinh hạnh! Giải nghĩa câu hỏi rành mạch khích lệ." },
      S: { label: "S - Thay thế (Substitute)", p: "Nhập một từ tinh tế thay thế cho từ bôi đỏ...", a: ["mỹ từ", "tuyệt hảo"], s: "Lựa chọn xuất sắc! Từ thay thế giữ nguyên thông điệp tinh tế." },
      C: { label: "C - Kết hợp (Combine)", p: "Ghép âm tố với từ gốc để tạo từ vựng hay...", a: ["sinh học", "học thuật"], s: "Khả năng tư duy kết hợp logic chuẩn học đường!" },
      A: { label: "A - Thích ứng (Adapt)", p: "Nhập một biến thể ngữ cảnh thích hợp...", a: ["thích ứng"], s: "Kỳ vĩ! Áp dụng từ ngữ mượt mà trong ngữ cảnh mới." },
      M: { label: "M - Sửa đổi (Modify)", p: "Nhập từ điều chỉnh sắc thái cường điệu...", a: ["vô cùng"], s: "Sửa đổi sắc bộc lộ cảm xúc dạt dào hoàn mỹ!" },
      P: { label: "P - Khác biệt (Put to other uses)", p: "Nhập từ đưa vào bối cảnh chuyên biệt...", a: ["kịch nghệ"], s: "Dùng từ chuyên môn trong văn phong đời thường rất tài tình!" },
      E: { label: "E - Lược bớt (Eliminate)", p: "Lược bớt từ kéo dài quá mức thành từ ngắn...", a: ["cắt giảm"], s: "Tuyệt đỉnh rút gọn súc tích dồi dào nhạc điệu gốc!" },
      R: { label: "R - Đảo ngược (Reverse)", p: "Nhập từ đảo lộn vị trí âm tiết tạo sắc thái...", a: ["lực nhân", "trình quy"], s: "Đảo ngược vị trí âm tiết tinh khôi đầy thú vị!" },
    };

    const match = templates[code];
    if (match) {
      setTaskForm((prev) => ({
        ...prev,
        typeCode: code,
        typeLabel: match.label,
        format: code === "Q" ? "quiz" : "input",
        placeholder: match.p,
        answers: match.a,
        successMsg: match.s,
      }));
    }
  };

  // Simple rendering of standard topics name matching
  const getTopicName = (id: string) => {
    return TOPICS.find((t) => t.id === id)?.name || id;
  };

  // Render Login state first
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl shadow-xl space-y-6 text-center animate-fade-in mt-10">
        <div className="w-16 h-16 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          🔒
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-[var(--text-main)]">Hệ thống Quản Trị Viên</h2>
          <p className="text-xxs text-[var(--text-sub)]">
            Vùng bảo mật chỉ dành cho người điều hành cập nhật câu hỏi, audio và bài học.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1.5Col">
            <label className="text-xs font-bold text-[var(--text-main)] block">Mật khẩu xác minh:</label>
            <input
              type="password"
              placeholder="Nhập 'admin' để mở khóa nhanh..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-xs text-[var(--text-main)] focus:outline-none focus:border-red-600 font-mono"
              autoFocus
            />
          </div>

          {loginError && (
            <p className="text-[10px] font-black text-rose-500 animate-pulse text-center">
              ⚠ {loginError}
            </p>
          )}

          <button
            type="submit"
            className="cursor-pointer w-full bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            Mở khóa Hệ thống 🔓
          </button>
        </form>
      </div>
    );
  }

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchSearch =
      task.id.toLowerCase().includes(taskSearch.toLowerCase()) ||
      task.question.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (task.typeLabel && task.typeLabel.toLowerCase().includes(taskSearch.toLowerCase()));

    const matchTopic = selectedTopicFilter === "all" || task.topicId === selectedTopicFilter;
    const matchFormat = selectedFormatFilter === "all" || task.format === selectedFormatFilter;

    return matchSearch && matchTopic && matchFormat;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-left">
      {/* Header and logout controls */}
      <div className="bg-gradient-to-r from-red-600 to-amber-600 p-4 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-red-900/10">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[8px] font-mono tracking-wider uppercase font-black">
              LIVE DATABASE
            </span>
            <span className="text-[10px] font-extrabold text-red-100">Chào quản trị viên! 👋</span>
          </div>
          <h2 className="text-lg font-black tracking-tight">Hệ Thống Thiết Lập & Cấu Hình ViLing</h2>
        </div>
        <button
          onClick={handleLogout}
          className="cursor-pointer bg-white/10 hover:bg-white/20 text-xs font-bold px-4 py-2 rounded-xl border border-white/20 transition-all active:scale-95 whitespace-nowrap"
        >
          Đăng xuất ✕
        </button>
      </div>

      {/* Info messages */}
      {infoMessage && (
        <div className="bg-green-500/10 border border-green-500/20 px-4 py-2.5 rounded-xl text-xs font-bold text-green-600">
          ✓ {infoMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500">
          ⚠ {errorMessage}
        </div>
      )}

      {/* Primary Dashboard Selector */}
      <div className="flex bg-[var(--input-bg)] p-1 rounded-2xl border border-[var(--border-color)]">
        <button
          onClick={() => {
            setActiveSubTab("tasks");
            setEditingTaskId(null);
            setEditingPostId(null);
          }}
          className={`flex-1 py-3 text-center rounded-xl text-xs font-black tracking-wide transition-all ${
            activeSubTab === "tasks"
              ? "bg-[var(--card-bg)] text-[#b91c1c] shadow"
              : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
          }`}
        >
          📚 NGÂN HÀNG CÂU HỎI ({tasks.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab("posts");
            setEditingTaskId(null);
            setEditingPostId(null);
          }}
          className={`flex-1 py-3 text-center rounded-xl text-xs font-black tracking-wide transition-all ${
            activeSubTab === "posts"
              ? "bg-[var(--card-bg)] text-[#b91c1c] shadow"
              : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
          }`}
        >
          🎬 MULTIMEDIA MICROLEARN ({posts.length})
        </button>
      </div>

      {/* ======================= TAB 1: TASK MANAGEMENT ======================= */}
      {activeSubTab === "tasks" && (
        <div className="space-y-4">
          {editingTaskId ? (
            /* Task Editor Card */
            <div className="bg-[var(--card-bg)] border-2 border-red-500/30 p-5 rounded-3xl shadow-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">
                  {editingTaskId.startsWith("task_") ? "✨ THÊM MỚI THỬ THÁCH" : "✏️ CẬP NHẬT THỬ THÁCH"}
                </span>
                <span className="text-xxs font-mono font-bold text-[var(--text-sub)] bg-[var(--input-bg)] px-2 py-0.5 rounded">
                  ID: {taskForm.id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Topic ID */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-main)]">Chủ đề bài học:</label>
                  <select
                    value={taskForm.topicId || "giao_duc"}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, topicId: e.target.value }))}
                    className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-main)] font-semibold"
                  >
                    {TOPICS.filter((t) => t.id !== "tat_ca").map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SCAMPER/Quiz Code Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-main)]">Phương pháp (SCAMPER / Q):</label>
                  <select
                    value={taskForm.typeCode || "Q"}
                    onChange={(e) => updateScamperFields(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-main)] font-semibold"
                  >
                    <option value="Q">Q - Trắc nghiệm (Quiz)</option>
                    <option value="S">S - Thay thế (Substitute)</option>
                    <option value="C">C - Kết hợp (Combine)</option>
                    <option value="A">A - Thích nghi (Adapt)</option>
                    <option value="M">M - Sửa đổi (Modify)</option>
                    <option value="P">P - Khác biệt (Put to other uses)</option>
                    <option value="E">E - Lược bỏ (Eliminate)</option>
                    <option value="R">R - Đảo ngược (Reverse)</option>
                  </select>
                </div>

                {/* format */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-main)]">Định dạng hiển thị:</label>
                  <select
                    disabled
                    value={taskForm.format || "quiz"}
                    className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-sub)] font-semibold opacity-70"
                  >
                    <option value="quiz">Trắc nghiệm chọn A, B, C, D</option>
                    <option value="input">Người học tự nhập tay</option>
                  </select>
                </div>
              </div>

              {/* Question Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-main)] flex justify-between">
                  <span>Nội dung Câu hỏi (Chấp nhận thẻ HTML để tô màu):</span>
                  <span className="text-[9px] text-[var(--text-sub)]">Sử dụng &lt;span class='text-red-500 font-bold'&gt;"từ"&lt;/span&gt; để bôi đỏ</span>
                </label>
                <textarea
                  rows={3}
                  value={taskForm.question || ""}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, question: e.target.value }))}
                  placeholder="Nhập nội dung đề bài tiếng Việt..."
                  className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-xs text-[var(--text-main)] focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 leading-relaxed font-medium"
                />
              </div>

              {/* Quiz specific fields (options, correct index) */}
              {taskForm.format === "quiz" && (
                <div className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
                  <span className="text-[10px] font-black text-[var(--text-main)] block uppercase tracking-wider">
                    Cấu hình Trắc Nghiệm Đa Lựa Chọn
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, oIdx) => {
                      const letter = ["A", "B", "C", "D"][oIdx];
                      return (
                        <div key={oIdx} className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--text-sub)]">Đáp án {letter}:</label>
                          <input
                            type="text"
                            value={taskForm.options?.[oIdx] || ""}
                            onChange={(e) => {
                              const currentOptions = [...(taskForm.options || ["", "", "", ""])];
                              currentOptions[oIdx] = e.target.value;
                              setTaskForm((prev) => ({ ...prev, options: currentOptions }));
                            }}
                            className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] font-semibold"
                            placeholder={`Nội dung lựa chọn ${letter}...`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[var(--border-color)]">
                    <label className="text-xs font-bold text-[var(--text-main)]">Đáp án đúng chính xác nhất:</label>
                    <div className="flex gap-2">
                      {["A", "B", "C", "D"].map((letter, index) => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => setTaskForm((prev) => ({ ...prev, correctIndex: index }))}
                          className={`cursor-pointer w-10 h-10 rounded-full font-black text-xs transition-all ${
                            taskForm.correctIndex === index
                              ? "bg-red-600 text-white"
                              : "bg-[var(--card-bg)] text-[var(--text-sub)] border border-[var(--border-color)]"
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Input specific fields */}
              {taskForm.format === "input" && (
                <div className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
                  <span className="text-[10px] font-black text-[var(--text-main)] block uppercase tracking-wider">
                    Cấu hình rèn luyện nhập câu trả lời tự do
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[var(--text-main)]">Gợi ý mộc (placeholder):</label>
                      <input
                        type="text"
                        value={taskForm.placeholder || ""}
                        onChange={(e) => setTaskForm((prev) => ({ ...prev, placeholder: e.target.value }))}
                        className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)]"
                        placeholder="Nhập hướng dẫn điền từ..."
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[var(--text-main)]">
                        Từ khóa đáp án chấp nhận (cách nhau bằng dấu phẩy):
                      </label>
                      <input
                        type="text"
                        value={taskForm.answers?.join(", ") || ""}
                        onChange={(e) => {
                          const list = e.target.value.split(",").map((x) => x.trim());
                          setTaskForm((prev) => ({ ...prev, answers: list }));
                        }}
                        className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] font-semibold font-mono"
                        placeholder="Ví dụ: sơn lâm, sơn hà, quần sơn"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Success praise message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-main)]">Thông điệp khen ngợi & Giải thích từ tố:</label>
                <input
                  type="text"
                  value={taskForm.successMsg || ""}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, successMsg: e.target.value }))}
                  placeholder="Ví dụ: Rất đỉnh cao! Từ 'thần' phản ánh tinh chất vũ bão..."
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-xs text-[var(--text-main)] font-semibold"
                />
              </div>

              {/* Editor Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setEditingTaskId(null)}
                  className="cursor-pointer px-4 py-2 text-xs font-bold text-[var(--text-sub)] rounded-xl border border-[var(--border-color)] hover:bg-[var(--input-bg)] transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveTask}
                  className="cursor-pointer bg-red-600 hover:bg-red-700 font-extrabold text-white text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 shadow-md active:scale-95 transition-all"
                >
                  💾 Lưu Thiết Lập
                </button>
              </div>
            </div>
          ) : (
            /* Task Search Filters + List Layout */
            <div className="space-y-4">
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm câu hỏi, phôi bài, kĩ thuật..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-main)] focus:outline-none"
                />
                
                <select
                  value={selectedTopicFilter}
                  onChange={(e) => setSelectedTopicFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-main)] font-semibold cursor-pointer focus:outline-none"
                >
                  <option value="all">📁 Tất cả Chủ đề</option>
                  {TOPICS.filter((t) => t.id !== "tat_ca").map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedFormatFilter}
                  onChange={(e) => setSelectedFormatFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-main)] font-semibold cursor-pointer focus:outline-none"
                >
                  <option value="all">🎭 Tất cả Định dạng</option>
                  <option value="quiz">Trắc nghiệm chọn A, B, C, D</option>
                  <option value="input">Tự luận nhập câu trả lời</option>
                </select>

                <button
                  onClick={handleAddTask}
                  className="cursor-pointer bg-red-600 hover:bg-red-700 font-black text-white text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1 transition-transform active:scale-95"
                >
                  <span>➕ Tạo Câu Hỏi</span>
                </button>
              </div>

              {/* Tasks List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredTasks.length === 0 ? (
                  <div className="col-span-full text-center py-10 bg-[var(--input-bg)] border border-dashed border-[var(--border-color)] rounded-2xl">
                    <span className="text-2xl">🔍</span>
                    <p className="text-xxs text-[var(--text-sub)] mt-1.5 font-bold">Không tìm thấy câu hỏi tương khớp.</p>
                  </div>
                ) : (
                  filteredTasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-2xl flex flex-col justify-between gap-3.5 shadow-sm hover:border-red-500/20 transition-all group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-red-600/10 text-red-600 dark:text-red-400 font-extrabold px-2 py-0.5 rounded-full">
                            {t.typeLabel ? t.typeLabel.split(" - ")[0] : t.typeCode} • {getTopicName(t.topicId)}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-[var(--text-sub)] bg-[var(--input-bg)] px-1.5 py-0.5 rounded">
                            {t.id}
                          </span>
                        </div>
                        <h4
                          className="text-xs font-bold text-[var(--text-main)] leading-relaxed line-clamp-3 group-hover:text-red-600 transition-colors"
                          dangerouslySetInnerHTML={{ __html: t.question }}
                        />
                        {t.format === "quiz" ? (
                          <div className="grid grid-cols-2 gap-1 pt-1.5 text-[9px] font-bold text-[var(--text-sub)]">
                            {t.options?.slice(0, 4).map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`truncate bg-[var(--input-bg)] px-2 py-1 rounded ${
                                  t.correctIndex === oIdx ? "border border-green-500 text-green-600 bg-green-500/5" : ""
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[9.5px] font-mono text-indigo-500/90 truncate bg-indigo-500/5 px-2 py-1 rounded select-all mt-1">
                            🎯 Đ/ÁN: {t.answers?.join(", ")}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)] text-xxs">
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="cursor-pointer bg-red-50 hover:bg-red-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all text-[10px]"
                        >
                          Xóa
                        </button>
                        <button
                          onClick={() => startEditingTask(t)}
                          className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-1.5 rounded-lg active:scale-95 transition-all text-[10px]"
                        >
                          Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: MULTIMEDIA MICROLEARN ======================= */}
      {activeSubTab === "posts" && (
        <div className="space-y-4">
          {editingPostId ? (
            /* Post Editor Form */
            <div className="bg-[var(--card-bg)] border-2 border-red-500/30 p-5 rounded-3xl shadow-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">
                  {editingPostId.startsWith("v_") ? "🎬 THÊM MỚI BÀI MICROLEARN" : "✏️ CẬP NHẬT KIẾN THỨC REELS"}
                </span>
                <span className="text-xxs font-mono font-bold text-[var(--text-sub)] bg-[var(--input-bg)] px-2 py-0.5 rounded">
                  Post ID: {postForm.id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-main)]">Tên kênh/Tác giả (@):</label>
                  <input
                    type="text"
                    value={postForm.username || ""}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, username: e.target.value.replace("@", "") }))}
                    className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-main)] font-semibold"
                    placeholder="career_builder_viet"
                  />
                </div>

                {/* Category Linked */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-main)]">Chủ đề Thực hành liên kết:</label>
                  <select
                    value={postForm.category || "giao_duc"}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-main)] font-semibold"
                  >
                    <option value="tat_ca">Nhập đề chung</option>
                    {TOPICS.filter((t) => t.id !== "tat_ca").map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Background Gradient String */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-main)]">Gradient Nền (CSS):</label>
                  <input
                    type="text"
                    value={postForm.bgGradient || ""}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, bgGradient: e.target.value }))}
                    className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-main)] font-mono"
                    placeholder="linear-gradient(135deg, #1e293b, #0f172a)"
                  />
                </div>
              </div>

              {/* Title Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-main)]">Tiêu đề / Caption bài giảng ngắn:</label>
                <textarea
                  rows={2}
                  value={postForm.title || ""}
                  onChange={(e) => setPostForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ví dụ: Cách rèn luyện tư duy loại bỏ (Eliminate) để dõng dạc câu từ..."
                  className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-xs text-[var(--text-main)] focus:outline-none placeholder:text-[var(--text-sub)]/50 focus:border-red-600 focus:ring-1 focus:ring-red-600 font-medium"
                />
              </div>

              {/* VIDEO & AUDIO URL CONFIGURATION */}
              <div className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--border-color)] space-y-4">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-wider block">
                  ⚙️ Cấu hình Đường dẫn Đa phương tiện (Media Links)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Video URL */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1">
                      <span>🎥 1. Đường dẫn VIDEO:</span>
                      <span className="text-[9px] text-[var(--text-sub)] font-normal">(Link Video .mp4 trực tuyến)</span>
                    </label>
                    <input
                      type="url"
                      value={postForm.videoUrl || ""}
                      onChange={(e) => setPostForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                      className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] font-mono"
                      placeholder="https://assets.mixkit.co/videos/...large.mp4"
                    />
                    <p className="text-[9px] text-[var(--text-sub)] leading-relaxed italic">
                      Nếu để trống, ứng dụng sẽ phục dựng đĩa quay CD 3D sang trọng mô phỏng âm thanh tuyệt đối.
                    </p>
                  </div>

                  {/* Audio URL */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1">
                      <span>🔊 2. Đường dẫn AUDIO:</span>
                      <span className="text-[9px] text-[var(--text-sub)] font-normal">(Link Audio .mp3 trực tiếp)</span>
                    </label>
                    <input
                      type="url"
                      value={postForm.audioUrl || ""}
                      onChange={(e) => setPostForm((prev) => ({ ...prev, audioUrl: e.target.value }))}
                      className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] font-mono"
                      placeholder="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                    />
                    <p className="text-[9px] text-[var(--text-sub)] leading-relaxed italic">
                      Nếu có, đĩa quay CD 3D của MicroLearn sẽ phát sóng thực thụ sóng nhạc này đến tai học viên!
                    </p>
                  </div>
                </div>

                {/* Multimedia previewer test live! */}
                <div className="border-t border-[var(--border-color)] pt-3">
                  <span className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-wider block mb-2">
                    📺 Trình phát Thử nghiệm
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Video preview player */}
                    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold mb-1.5 block">Video Test</span>
                      {postForm.videoUrl ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
                          <video
                            src={postForm.videoUrl}
                            controls
                            className="w-full h-full max-h-[140px] object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video rounded-xl bg-slate-900 border border-slate-700/50 flex flex-col items-center justify-center text-[10px] font-bold text-slate-500 py-3">
                          ❌ Chưa cấu hình video
                        </div>
                      )}
                    </div>

                    {/* Audio preview player */}
                    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold mb-1.5 block">Audio Test</span>
                      {postForm.audioUrl ? (
                        <div className="w-full flex flex-col items-center gap-1.5">
                          <audio src={postForm.audioUrl} controls className="w-full max-w-[180px] h-8" />
                          <span className="text-[8px] font-mono select-all text-[var(--text-sub)]">
                            {postForm.audioUrl.substring(0, 30)}...
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-[70px] rounded-xl bg-slate-900 border border-slate-700/50 flex flex-col items-center justify-center text-[10px] font-bold text-slate-500 py-3">
                          ❌ Chưa cấu hình audio
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setEditingPostId(null)}
                  className="cursor-pointer px-4 py-2 text-xs font-bold text-[var(--text-sub)] rounded-xl border border-[var(--border-color)] hover:bg-[var(--input-bg)] transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSavePost}
                  className="cursor-pointer bg-red-600 hover:bg-red-700 font-extrabold text-white text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 shadow-md active:scale-95 transition-all"
                >
                  💾 Lưu Bài Đăng
                </button>
              </div>
            </div>
          ) : (
            /* MicroLearn Feed Posts List */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-2xl">
                <div>
                  <h4 className="font-bold text-xs text-[var(--text-main)]">Hồ sơ bài giảng MicroLearn</h4>
                  <p className="text-[10px] text-[var(--text-sub)]">Quản lý các video reels ngắn hoặc tệp tin audio bài học</p>
                </div>
                <button
                  onClick={handleAddPost}
                  className="cursor-pointer bg-red-600 hover:bg-red-700 font-extrabold text-white text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1 transition-transform active:scale-95"
                >
                  <span>➕ Tạo Bài Reels</span>
                </button>
              </div>

              {/* Feed lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.length === 0 ? (
                  <div className="col-span-full text-center py-10 bg-[var(--input-bg)] border border-dashed border-[var(--border-color)] rounded-2xl">
                    <span className="text-2xl">⚡</span>
                    <p className="text-xs text-[var(--text-sub)] mt-1.5 font-bold">Chưa tạo bất cứ bài giảng MicroLearn nào.</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      style={{ background: post.bgGradient }}
                      className="relative w-full aspect-[9/11] rounded-3xl p-5 flex flex-col justify-between text-white shadow-lg overflow-hidden group border border-white/10"
                    >
                      {/* background overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none" />

                      {/* top layout */}
                      <div className="relative flex items-start justify-between">
                        <span className="bg-black/30 backdrop-blur text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          📁 {getTopicName(post.category)}
                        </span>
                        <span className="text-[8px] font-mono opacity-50">ID: {post.id}</span>
                      </div>

                      {/* Middle media signal indicators */}
                      <div className="relative flex items-center justify-center gap-3">
                        {post.videoUrl ? (
                          <span className="text-base bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-pulse" title="Có Video Player">
                            🎥
                          </span>
                        ) : (
                          <span className="text-base bg-white/20 text-white/50 w-8 h-8 rounded-full flex items-center justify-center" title="Cách điệu disk">
                            💿
                          </span>
                        )}

                        {post.audioUrl ? (
                          <span className="text-base bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg" title="Móng phát Audio">
                            🔊
                          </span>
                        ) : (
                          <span className="text-base bg-white/20 text-white/50 w-8 h-8 rounded-full flex items-center justify-center" title="Không phát Audio">
                            🔇
                          </span>
                        )}
                      </div>

                      {/* bottom layout */}
                      <div className="relative space-y-2">
                        <div className="space-y-1">
                          <p className="text-[10px] font-extrabold text-[#fca5a5]">@{post.username}</p>
                          <h4 className="text-[11px] font-bold leading-normal truncate-3-lines line-clamp-3">
                            {post.title}
                          </h4>
                        </div>

                        {/* action controls */}
                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-white/10 text-xxs select-none">
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="cursor-pointer bg-red-950/40 hover:bg-red-900 border border-red-500/30 text-rose-300 font-bold px-2.5 py-1.5 rounded-lg active:scale-95 transition-all text-[9.5px]"
                          >
                            Xóa
                          </button>
                          <button
                            onClick={() => startEditingPost(post)}
                            className="cursor-pointer bg-white text-slate-900 hover:bg-slate-100 font-black px-3.5 py-1.5 rounded-lg active:scale-95 transition-all text-[9.5px]"
                          >
                            Chỉnh sửa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
