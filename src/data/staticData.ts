/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Topic, Badge, VideoPost } from "../types";

export const TOPICS: Topic[] = [
  { id: "tat_ca", name: "Tất cả", icon: "💡" },
  { id: "danh_lam", name: "Danh lam thắng cảnh", icon: "🏔️" },
  { id: "du_lich", name: "Du lịch", icon: "✈️" },
  { id: "dich_vu", name: "Dịch vụ", icon: "🛎️" },
  { id: "moi_truong", name: "Môi trường", icon: "🌿" },
  { id: "giao_duc", name: "Giáo dục", icon: "🎓" },
  { id: "viec_lam", name: "Việc làm", icon: "💼" },
];

export const BADGES: Badge[] = [
  {
    id: "badge_start",
    title: "Khởi Đầu Tốt",
    icon: "🔥",
    description: "Nhận điểm XP đầu tiên",
    xpRequired: 10,
  },
  {
    id: "badge_scholar",
    title: "Học Giả Chăm Chỉ",
    icon: "📖",
    description: "Tích lũy đạt mốc 40 XP",
    xpRequired: 40,
  },
  {
    id: "badge_scamper_master",
    title: "Cao Thủ SCAMPER",
    icon: "🧠",
    description: "Trình độ đột phá từ vựng đạt 80 XP",
    xpRequired: 80,
  },
  {
    id: "badge_legendary",
    title: "Huyền Thoại ViLing",
    icon: "👑",
    description: "Tuyệt đỉnh tài năng đạt từ 150 XP",
    xpRequired: 150,
  },
];

export const VIDEO_POSTS: VideoPost[] = [
  {
    id: "v1",
    username: "tnuerslearnvietnamese",
    title: "Từ vựng chuyên ngành Giáo dục cực hay! 🎓 Thử ngay phương pháp ghép từ độc lạ.",
    category: "giao_duc",
    likes: 24500,
    comments: 892,
    bgGradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
  },
  {
    id: "v2",
    username: "green_planet_vn",
    title: "Phân biệt 'Bảo tồn' vs 'Bảo vệ' trong sinh học và hệ sinh thái 🌿 Cùng học cách tư duy thay thế (Substitute).",
    category: "moi_truong",
    likes: 18200,
    comments: 421,
    bgGradient: "linear-gradient(135deg, #064e3b, #10b981)",
  },
  {
    id: "v3",
    username: "career_builder_viet",
    title: "Tái cấu trúc (Reverse/Rearrange) các bước tuyển dụng đạt hiệu quả tối đa lực lượng lao động 💼",
    category: "viec_lam",
    likes: 11400,
    comments: 310,
    bgGradient: "linear-gradient(135deg, #78350f, #f59e0b)",
  },
  {
    id: "v4",
    username: "vn_explorer",
    title: "Khám phá danh lam thắng cảnh qua lăng kính ngữ văn cổ học 🏔️ Làm sao dùng từ 'kỳ vĩ' để khắc họa trọn vẹn?",
    category: "danh_lam",
    likes: 19800,
    comments: 541,
    bgGradient: "linear-gradient(135deg, #4c1d95, #8b5cf6)",
  },
  {
    id: "v5",
    username: "travel_addict_vn",
    title: "Xu hướng 'Du lịch sinh thái' (Ecotourism) và tư duy thích ứng Adapt trong phát triển dịch vụ lưu trú bản địa ✈️",
    category: "du_lich",
    likes: 15400,
    comments: 298,
    bgGradient: "linear-gradient(135deg, #0c4a6e, #0284c7)",
  },
  {
    id: "v6",
    username: "service_elite",
    title: "Tối ưu hóa 'Trải nghiệm khách hàng' thông qua nghệ thuật giao tiếp hậu mãi chu đáo 🛎️",
    category: "dich_vu",
    likes: 9800,
    comments: 187,
    bgGradient: "linear-gradient(135deg, #831843, #db2777)",
  }
];
