/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// File paths for persistence database
const TASKS_DB_PATH = path.join(process.cwd(), "server", "tasks_db.json");
const POSTS_DB_PATH = path.join(process.cwd(), "server", "posts_db.json");

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized AI API client
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in the AI Studio Secrets panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Robust retry mechanism for calling generateContent to prevent temporary 503/429 errors from failing
async function generateContentWithRetry(params: any, maxRetries = 5, initialDelay = 500) {
  const aiClient = getGenAI();
  let delay = initialDelay;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await aiClient.models.generateContent(params);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      // If we hit RESOURCE_EXHAUSTED or quota limits on gemini-3.5-flash, dynamically switch model to gemini-3.1-flash-lite
      const isQuotaExceeded = 
        errorMessage.includes("RESOURCE_EXHAUSTED") || 
        errorMessage.includes("quota") || 
        errorMessage.includes("Quota exceeded") || 
        error?.status === "RESOURCE_EXHAUSTED" || 
        error?.code === 429;

      if (isQuotaExceeded && params.model === "gemini-3.5-flash") {
        console.warn(`[AI API] Quota exceeded for gemini-3.5-flash! Dynamically switching to fallback model gemini-3.1-flash-lite for self-healing processing.`);
        params.model = "gemini-3.1-flash-lite";
        // Reset delay and retries for the new fallback model to ensure maximum chances of success
        delay = initialDelay;
        attempt = 1; 
        continue;
      }

      const isTransient = 
        error?.status === "UNAVAILABLE" || 
        error?.code === 503 || 
        error?.status === 503 ||
        errorMessage.includes("503") || 
        errorMessage.includes("UNAVAILABLE") || 
        errorMessage.includes("high demand") ||
        errorMessage.includes("RESOURCE_EXHAUSTED") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("429");
        
      if (isTransient && attempt < maxRetries) {
        console.log(`[AI API] Retrying attempt ${attempt} in ${delay}ms... Status code description:`, errorMessage ? errorMessage.substring(0, 100) : "Busy");
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error("AI API call failed after multiple attempts/retries.");
}

// 1. Initial tasks data to serve immediately as a fast, robust fallback
import { initialTasks } from "./server/tasks_bank";

let dbTasks = [...initialTasks];
try {
  if (fs.existsSync(TASKS_DB_PATH)) {
    const raw = fs.readFileSync(TASKS_DB_PATH, "utf-8");
    dbTasks = JSON.parse(raw);
    console.log(`[Database Loaded]: ${dbTasks.length} tasks loaded from tasks_db.json.`);
  } else {
    // Make sure the server directory exists!
    const serverDir = path.join(process.cwd(), "server");
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true });
    }
    fs.writeFileSync(TASKS_DB_PATH, JSON.stringify(dbTasks, null, 2), "utf-8");
  }
} catch (e) {
  console.error("Error reading/writing tasks_db.json, falling back to static:", e);
}

// Replicate initial post feed with optional video and audio fields
const defaultVideoPosts = [
  {
    id: "v1",
    username: "tnuerslearnvietnamese",
    title: "Từ vựng chuyên ngành Giáo dục cực hay! 🎓 Thử ngay phương pháp ghép từ độc lạ.",
    category: "giao_duc",
    likes: 24500,
    comments: 892,
    bgGradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-writer-typing-on-a-typewriter-42323-large.mp4",
    audioUrl: ""
  },
  {
    id: "v2",
    username: "green_planet_vn",
    title: "Phân biệt 'Bảo tồn' vs 'Bảo vệ' trong sinh học và hệ sinh thái 🌿 Cùng học cách tư duy thay thế (Substitute).",
    category: "moi_truong",
    likes: 18200,
    comments: 421,
    bgGradient: "linear-gradient(135deg, #064e3b, #10b981)",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-student-studying-with-headphones-on-41589-large.mp4",
    audioUrl: ""
  },
  {
    id: "v3",
    username: "career_builder_viet",
    title: "Tái cấu trúc (Reverse/Rearrange) các bước tuyển dụng đạt hiệu quả tối đa lực lượng lao động 💼",
    category: "viec_lam",
    likes: 11400,
    comments: 310,
    bgGradient: "linear-gradient(135deg, #78350f, #f59e0b)",
    videoUrl: "",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "v4",
    username: "vn_explorer",
    title: "Khám phá danh lam thắng cảnh qua lăng kính ngữ văn cổ học 🏔️ Làm sao dùng từ 'kỳ vĩ' để khắc họa trọn vẹn?",
    category: "danh_lam",
    likes: 19800,
    comments: 541,
    bgGradient: "linear-gradient(135deg, #4c1d95, #8b5cf6)",
    videoUrl: "",
    audioUrl: ""
  },
  {
    id: "v5",
    username: "travel_addict_vn",
    title: "Xu hướng 'Du lịch sinh thái' (Ecotourism) và tư duy thích ứng Adapt trong phát triển dịch vụ lưu trú bản địa ✈️",
    category: "du_lich",
    likes: 15400,
    comments: 298,
    bgGradient: "linear-gradient(135deg, #0c4a6e, #0284c7)",
    videoUrl: "",
    audioUrl: ""
  },
  {
    id: "v6",
    username: "service_elite",
    title: "Tối ưu hóa 'Trải nghiệm khách hàng' thông qua nghệ thuật giao tiếp hậu mãi chu đáo 🛎️",
    category: "dich_vu",
    likes: 9800,
    comments: 187,
    bgGradient: "linear-gradient(135deg, #831843, #db2777)",
    videoUrl: "",
    audioUrl: ""
  }
];

let dbVideoPosts = [...defaultVideoPosts];
try {
  if (fs.existsSync(POSTS_DB_PATH)) {
    const raw = fs.readFileSync(POSTS_DB_PATH, "utf-8");
    dbVideoPosts = JSON.parse(raw);
    console.log(`[Database Loaded]: ${dbVideoPosts.length} video posts loaded from posts_db.json.`);
  } else {
    const serverDir = path.join(process.cwd(), "server");
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true });
    }
    fs.writeFileSync(POSTS_DB_PATH, JSON.stringify(dbVideoPosts, null, 2), "utf-8");
  }
} catch (e) {
  console.error("Error reading/writing posts_db.json, falling back to static:", e);
}

const oldInitialTasks = [
  // TOPIC 1: danh_lam (Danh lam thắng cảnh)
  {
    id: "danh_lam_s",
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
    id: "danh_lam_c",
    topicId: "danh_lam",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Kết hợp từ gốc <span class='text-emerald-500 font-bold'>\"KỲ\"</span> (trong kỳ diệu/kỳ vĩ) với một tiếng khác để chỉ một công trình cảnh sắc vô cùng độc đáo, lạ mắt tự nhiên ban tặng:",
    placeholder: "Nhập một từ (ví dụ: kỳ quan, kỳ cảnh, kỳ thú)...",
    answers: ["kỳ quan", "kỳ cảnh", "kỳ tích", "kỳ thú"],
    successMsg: "Tuyệt hảo! Từ tố phản ánh đúng đặc tính độc đáo vô song của các kỳ quan thiên nhiên."
  },
  {
    id: "danh_lam_a",
    topicId: "danh_lam",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Thích ứng từ vựng: Để viết mô tả cho khu bảo tồn thiên nhiên hang động Phong Nha, hãy thích nghi từ <span class='text-amber-500 font-bold'>\"rộng lớn\"</span> thành một từ mang màu sắc bí ẩn, sâu thẳm phù hợp bối cảnh địa chất:",
    placeholder: "Nhập một từ (ví dụ: vô tận, thâm sâu, bao la, thăm thẳm)...",
    answers: ["thâm sâu", "u linh", "huyền bí", "vô tận", "bí ẩn", "thăm thẳm"],
    successMsg: "Quá phù hợp! Cảm giác sâu thẳm, huyền ảo hiện rõ qua từ ngữ tương thích cao."
  },
  {
    id: "danh_lam_m",
    topicId: "danh_lam",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify / Khuyếch đại sắc thái: Nâng cấp mức độ sầm uất hoặc hùng vĩ của từ <span class='text-rose-500 font-bold'>\"đẹp đẽ\"</span> khi mô tả đỉnh núi Fansipan cao chọc trời hoặc dốc núi quanh co:",
    placeholder: "Nhập một từ cực quy mô (ví dụ: hùng vĩ, tráng lệ, vĩ đại)...",
    answers: ["hùng vĩ", "tráng lệ", "vĩ đại", "bát ngát", "ngút ngàn", "tuyệt mỹ"],
    successMsg: "Kỳ diệu! Bạn đã khuyếch đại tính chất thiên nhiên lên tầm vóc sử thi tráng lệ."
  },
  {
    id: "danh_lam_p",
    topicId: "danh_lam",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Thử mang từ ngữ vốn thuộc lĩnh vực ẩm thực gia vị như <span class='text-cyan-500 font-bold'>\"nêm nếm\"</span> lồng ghép khéo léo vào câu biểu cảm về việc thiết tạo cảnh quan của tự nhiên:",
    placeholder: "Ví dụ: Thiên nhiên đã nêm nếm... (Nhập từ: nêm nếm)",
    answers: ["nêm nếm"],
    successMsg: "Rất văn nghệ! Chuyển đổi bối cảnh ẩm thực sang cấu tứ nghệ thuật hội họa tự nhiên tạo dấu ấn đậm nét."
  },
  {
    id: "danh_lam_e",
    topicId: "danh_lam",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Lược bỏ từ dư nghĩa: Rút gọn câu văn lặp từ <span class='text-pink-500 font-bold'>\"Danh lam thắng cảnh này thật sự rất vô cùng đẹp đẽ\"</span> bằng cách thay thế cụm từ phó từ lặp 'rất vô cùng đẹp đẽ' bằng duy nhất 1 từ súc tích sang trọng:",
    placeholder: "Nhập duy nhất 1 từ (ví dụ: tuyệt mỹ, mỹ lệ, tuyệt diệu)...",
    answers: ["tuyệt mỹ", "mỹ lệ", "tuyệt diễm", "tuyệt vời", "kinh diễm"],
    successMsg: "Cực kỳ tinh tế! Tránh lặp phó từ sáo rỗng giúp câu văn sắc bén hơn rất nhiều."
  },
  {
    id: "danh_lam_r",
    topicId: "danh_lam",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo ngữ: Đảo ngược thứ tự âm tiết của từ ghép ghép Hán Việt <span class='text-purple-500 font-bold'>\"SƠN THỦY\"</span> biểu đạt cho phong cảnh non nước hữu tình của một vùng thắng tích:",
    placeholder: "Nhập từ đảo ngược...",
    answers: ["thủy sơn"],
    successMsg: "Thơ mộng! 'Thủy sơn' là một biến thể đảo ngữ đầy cổ kính, thi cú đặc trưng của thơ phong cảnh."
  },
  {
    id: "danh_lam_q",
    topicId: "danh_lam",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Địa danh nào sau đây được UNESCO công nhận là <span class='text-red-500 font-bold'>\"Di sản thiên nhiên thế giới\"</span> đạt giá trị địa chất toàn cầu?",
    options: [
      "A. Vịnh Hạ Long",
      "B. Công viên nước Đầm Sen",
      "C. Đại lộ Nguyễn Huệ",
      "D. Đầm sen Tây Hồ"
    ],
    correctIndex: 0,
    successMsg: "Chính xác! Vịnh Hạ Long sở hữu vẻ đẹp kỳ vĩ của hàng ngàn đảo đá vôi, đạt danh hiệu danh giá này."
  },

  // TOPIC 2: du_lich (Du lịch)
  {
    id: "du_lich_s",
    topicId: "du_lich",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Tìm một cụm từ tiếng Việt thay thế trang trọng lịch thiệp hơn cho từ <span class='text-blue-500 font-bold'>\"đi chơi\"</span> trong bối cảnh lữ hành nghỉ dưỡng dằng dặc hằng năm:",
    placeholder: "Nhập cụm từ (ví dụ: du lịch, lữ hành, nghỉ dưỡng, du ngoạn)...",
    answers: ["du lịch", "lữ hành", "nghỉ dưỡng", "du ngoạn", "tham quan", "trải nghiệm"],
    successMsg: "Tuyệt đỉnh! Các từ ngữ này nâng tầm ý nghĩa hành trình khám phá, làm mượt ngôn từ."
  },
  {
    id: "du_lich_c",
    topicId: "du_lich",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Từ gốc <span class='text-teal-500 font-bold'>\"LỮ\"</span> chỉ người khách đi đường xa. Hãy kết hợp với một tiếng nữa để chỉ những người khách đồng hành chia sẻ những chuyến khám phá:",
    placeholder: "Nhập từ (ví dụ: lữ khách, bạn lữ, lữ hành)...",
    answers: ["lữ khách", "bạn lữ", "lữ hành", "lữ đoàn", "đồng lữ"],
    successMsg: "Rất đặc sắc! Những lữ khách hay bạn lữ luôn là cốt lõi của hành trình khám phá muôn nơi."
  },
  {
    id: "du_lich_a",
    topicId: "du_lich",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Adapt - Thích ứng: Phối hợp ghép từ liên quan đến chữ gốc <span class='text-yellow-500 font-bold'>\"bản địa\"</span> nhằm biểu diễn tính chân thực cao nhất khi ăn chung, sống cùng cư dân vùng cao lữ hành:",
    placeholder: "Nhập một cụm từ (ví dụ: văn hóa bản địa, ẩm thực bản địa, trải nghiệm bản địa)...",
    answers: ["văn hóa bản địa", "ẩm thực bản địa", "trải nghiệm bản địa", "đặc sản bản địa", "cư dân bản địa"],
    successMsg: "Tâm hồn xê dịch! Thẩm thấu sâu đậm văn hóa bản địa là đỉnh cao của du lịch trải nghiệm."
  },
  {
    id: "du_lich_m",
    topicId: "du_lich",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Thảo từ: Hãy sửa đổi từ bình dân mang màu tự phát <span class='text-purple-500 font-bold'>\"phượt\"</span> thành cụm danh từ vừa trẻ trung vừa mang khát khao lặn lội chinh phục độc đáo:",
    placeholder: "Nhập từ (ví dụ: phượt thủ, hành giả, nhà thám hiểm)...",
    answers: ["phượt thủ", "nhà địa lý", "nhà thám hiểm", "hành giả", "lữ hành giả"],
    successMsg: "Đầy cuốn hút! Thuật ngữ phượt thủ vừa dân dã vừa tràn ngập năng lượng xê dịch mãnh liệt."
  },
  {
    id: "du_lich_p",
    topicId: "du_lich",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Chuyển đổi thuật ngữ kĩ thuật bản đồ <span class='text-orange-500 font-bold'>\"định vị\"</span> sang câu văn dùng để tìm kiếm sự an nhiên sâu bên trong tâm hồn lữ khách tự tại:",
    placeholder: "Ví dụ: 'định vị' tâm hồn (Nhập từ: định vị)",
    answers: ["định vị"],
    successMsg: "Độ sáng tạo cao! Định vị chính mình giữa thiên nhiên bao la giúp xóa nhòa mọi mệt mỏi thường nhật."
  },
  {
    id: "du_lich_e",
    topicId: "du_lich",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Lược bớt lặp thừa: Sửa lại câu rườm rà <span class='text-pink-500 font-bold'>\"Chuyến đi hành trình này dự định sẽ kéo dài trong thời gian khoảng chu kỳ 3 ngày\"</span> thành một biểu thức ngắn gọn, tinh tế tối thiểu:",
    placeholder: "Nhập câu rút gọn rành mạch (ví dụ: Hành trình kéo dài 3 ngày)...",
    answers: ["hành trình kéo dài 3 ngày", "hành trình dự kiến 3 ngày", "hành trình này kéo dài 3 ngày", "chuyến đi kéo dài 3 ngày"],
    successMsg: "Cực kỳ súc tích! Văn phong dứt khoát tránh trùng lặp giúp thiết kế hành trình du lịch tối ưu."
  },
  {
    id: "du_lich_r",
    topicId: "du_lich",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo ngược: Hãy đảo vị trí các âm tiết của từ ghép quen thuộc <span class='text-indigo-500 font-bold'>\"TRẢI NGHIỆM\"</span> để biểu đạt khoảnh khắc lắng lòng suy tư chiêm nghiệm sau chuyển lữ hành đầy ý nghĩa:",
    placeholder: "Nhập từ đảo ngược...",
    answers: ["nghiệm trải"],
    successMsg: "Tuyệt hảo! 'Nghiệm trải' dẫu ít thấy hơn song tạo thanh thế trầm sâu sâu lắng của sự phản tư ngôn ngữ."
  },
  {
    id: "du_lich_q",
    topicId: "du_lich",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Mô hình du lịch nào dưới đây chú trọng hàng đầu vào yếu tố bảo bảo tồn tự nhiên kết hợp phát triển sinh kế bản địa?",
    options: [
      "A. Du lịch mua sắm hàng miễn thuế",
      "B. Du lịch sinh thái bền vững",
      "C. Khai thác khu nghỉ dưỡng cao cấp sân golf",
      "D. Trò chơi giải trí kĩ thuật số"
    ],
    correctIndex: 1,
    successMsg: "Chính xác! Du lịch sinh thái hướng tới bảo vệ di sản thiên nhiên và hỗ trợ người dân vùng cao."
  },

  // TOPIC 3: dich_vu (Dịch vụ)
  {
    id: "dich_vu_s",
    topicId: "dich_vu",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Tìm một từ đồng nghĩa biểu thị hoạt động <span class='text-rose-500 font-bold'>\"chăm sóc, bảo dưỡng hỗ trợ hệ thống sau khi bán hàng\"</span> của một thương hiệu dịch vụ tầm cỡ:",
    placeholder: "Nhập một từ (ví dụ: hậu mãi, bảo hành, chăm sóc khách hàng)...",
    answers: ["hậu mãi", "chăm sóc khách hàng", "bảo hành", "hỗ trợ sau bán hàng", "bảo dưỡng"],
    successMsg: "Cực kỳ chuẩn xác! Dịch vụ hậu mãi chu đáo là đòn bẩy uy tín hàng đầu nâng tầm doanh nghiệp."
  },
  {
    id: "dich_vu_c",
    topicId: "dich_vu",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Hãy ghép từ căn bản <span class='text-emerald-500 font-bold'>\"KHÁCH\"</span> với một âm tiết cuối để ám chỉ những đối tượng hàng dùng thân thiết, ủng hộ doanh nghiệp suốt dòng lịch sử:",
    placeholder: "Nhập một từ hai âm tiết (ví dụ: khách quen, khách ruột, khách quý)...",
    answers: ["khách quen", "khách quý", "khách ruột", "khách vip", "khách hàng"],
    successMsg: "Hữu tình trọn vẹn! Khách quen hay khách ruột là tài sản quý báu và cốt tử nhất của cơ sở dịch vụ."
  },
  {
    id: "dich_vu_a",
    topicId: "dich_vu",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Adapt - Việt hóa thích ứng: Chuyển cụm danh từ vay mượn của tiếng nước ngoài như <span class='text-blue-500 font-bold'>\"Feedback\"</span> của người sử dụng thành cụm từ thuần Việt nhã nhặn, tôn trọng nhất:",
    placeholder: "Nhập cụm từ phù hợp bối ảnh (ví dụ: ý kiến phản hồi, đánh giá phản hồi, góp ý)...",
    answers: ["ý kiến phản hồi", "góp ý", "phản hồi", "đánh giá", "nhận xét"],
    successMsg: "Rất lịch lãm! Lắng nghe các ý kiến phản hồi quý giá giúp doanh nghiệp gia tăng giá trị tức thời."
  },
  {
    id: "dich_vu_m",
    topicId: "dich_vu",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Cải biên cường độ: Hãy sửa sửa từ diễn tả thời gian giao hàng <span class='text-amber-500 font-bold'>\"nhanh chóng\"</span> thành một từ mang màu sắc khẩn trương tức khắc bậc nhất:",
    placeholder: "Nhập một từ (ví dụ: hỏa tốc, thần tốc, siêu tốc)...",
    answers: ["hỏa tốc", "thần tốc", "tức tốc", "ngay lập tức", "siêu tốc"],
    successMsg: "Đột phá! Những đơn vận chuyển hỏa tốc hay thần tốc là điểm sáng tạo lợi thế cạnh tranh dịch vụ mới."
  },
  {
    id: "dich_vu_p",
    topicId: "dich_vu",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Sử dụng từ ngữ mượn bên quân khí chiến thuật dã chiến <span class='text-purple-500 font-bold'>\"hậu cần\"</span> vào câu phục vụ sắp đặt tiệc tùng sự kiện khách sạn một cách trang trọng:",
    placeholder: "Nhập từ: hậu cần...",
    answers: ["hậu cần"],
    successMsg: "Tư duy sáng tạo tuyệt hảo! Ban hậu cần điều hướng mọi trải nghiệm thầm lặng đằng sau sự lấp lánh của sự kiện."
  },
  {
    id: "dich_vu_e",
    topicId: "dich_vu",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Loại trừ rườm rà: Sửa tiêu đề hướng dẫn dịch vụ lủng củng <span class='text-indigo-500 font-bold'>\"Chúng tôi hỗ trợ trợ giúp tháo gỡ khắc phục xử lý sự cố kĩ thuật\"</span> thành 1 câu tinh gọn đỉnh cao:",
    placeholder: "Nhập câu súc tích nhất (ví dụ: Hỗ trợ khắc phục sự cố kĩ thuật)...",
    answers: ["hỗ trợ khắc phục sự cố", "hỗ trợ xử lý sự cố", "xử lý sự cố kỹ thuật", "khắc phục sự cố kỹ thuật"],
    successMsg: "Súc tích vô cùng! Thông điệp rõ ràng giúp khách hàng bớt rối trí khi gặp trục trặc vận hành hệ thống."
  },
  {
    id: "dich_vu_r",
    topicId: "dich_vu",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo ngược chiều: Hãy đảo vị trí hai chữ của từ ghép mang tính kỹ thuật <span class='text-rose-500 font-bold'>\"VẬN HÀNH\"</span> để mở ra nghĩa về cơ hội chu chuyển linh hoạt:",
    placeholder: "Nhập từ đảo cấu trúc...",
    answers: ["hành vận"],
    successMsg: "Văn nghệ độc lạ! 'Hành vận' mở ra vận hội chu chuyển, mang ý thế chuyển mình đầy tiềm năng."
  },
  {
    id: "dich_vu_q",
    topicId: "dich_vu",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Yếu tố quyết định hàng đầu trong hành trình tối ưu hóa \"Trải nghiệm khách hàng\" (Customer Experience) là gì?",
    options: [
      "A. Giảm thiểu chi phí sản xuất bất kể chất lượng dịch vụ hành",
      "B. Tối ưu thời gian phản hồi và phụng sự khách với sự tận tâm",
      "C. Tắt mọi kênh hỗ trợ gọi trực tiếp của tổng đài",
      "D. Đổ tiền vào các chiến dịch quảng bá phóng đại thực tế"
    ],
    correctIndex: 1,
    successMsg: "Hoàn hảo! Dịch vụ khách hàng xuất sắc dựa trên sự thấu hiểu chân thành và hậu mãi tận hiến."
  },

  // TOPIC 4: moi_truong (Môi trường)
  {
    id: "moi_truong_s",
    topicId: "moi_truong",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "S - Thay thế từ vựng: Tìm một động từ đồng nghĩa, mạnh mẽ hơn để thế cho từ <span class='text-blue-500 font-bold'>\"ô nhiễm\"</span> khi nói về tình trạng rác bẩn trong nguồn nước:",
    placeholder: "Nhập một động từ đồng nghĩa mạnh...",
    answers: ["vấy bẩn", "nhiễm bẩn", "vẫn đục", "ung thối", "nhiễm độc"],
    successMsg: "Hành động tốt! Từ vựng gợi cảm giác mất vệ sinh nghiêm ngặt sẽ thúc giục ý thức bảo toàn cao hơn."
  },
  {
    id: "moi_truong_c",
    topicId: "moi_truong",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "C - Phép ghép từ: Kết hợp từ Hán Việt <span class='text-emerald-500 font-bold'>\"SINH THÁI\"</span> với một từ tiếng Việt phía sau để chỉ toàn quần thể chung sống bảo tồn tự nhiên:",
    placeholder: "Nhập một từ ghép chuẩn (ví dụ: hệ sinh thái, môi trường sinh thái)...",
    answers: ["hệ sinh thái", "khu sinh thái", "môi trường sinh thái", "cảnh quan sinh thái"],
    successMsg: "Chính xác tuyệt đối! Hệ sinh thái yên bình, dồi dào là nền tảng sống còn của mọi quần hệ muôn loài."
  },
  {
    id: "moi_truong_a",
    topicId: "moi_truong",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Adapt - Thích ứng xu hướng: Chuyển đổi khẩu ngữ đơn giản <span class='text-teal-500 font-bold'>\"tiết kiệm năng lượng\"</span> thành cụm thuật ngữ học thuật mới xanh sạch bền vững hơn:",
    placeholder: "Nhập cụm từ bắt kịp thời đại (ví dụ: năng lượng xanh, năng lượng tái tạo, tiêu dùng xanh)...",
    answers: ["năng lượng xanh", "năng lượng tái tạo", "tiêu dùng xanh", "năng lượng sạch", "tiêu dùng bền vững"],
    successMsg: "Thời đại mới! Nghiên cứu năng lượng tái tạo là giải pháp đột phá cứu rỗi toàn cục địa cầu khỏi hiệu ứng nhiệt."
  },
  {
    id: "moi_truong_m",
    topicId: "moi_truong",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Khuyếch đại tính khẩn thiết: Thay thế từ <span class='text-rose-500 font-bold'>\"ấm lên\"</span> trong hiện tượng 'trái đất ấm lên' bằng từ vựng mang sức báo động đỉnh điểm của bão lũ hạn hán thiên tai:",
    placeholder: "Nhập một từ diễn tả mức nặng nề (ví dụ: nóng lên, thiêu đốt, cực đoan)...",
    answers: ["nóng lên", "thiêu đốt", "cực đoan", "biến đổi khí hậu"],
    successMsg: "Xúc động mạnh! Trái đất đang nóng lên báo động đỏ ý thức thường trực của nhân loại toàn cầu."
  },
  {
    id: "moi_truong_p",
    topicId: "moi_truong",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Thử mượn thuật ngữ khoa học bên cấp cứu khẩn cấp <span class='text-purple-500 font-bold'>\"hồi sức\"</span> đặt trong câu văn mô tả tái tạo lại vùng đệm rạn san hô chết:",
    placeholder: "Ví dụ: 'hồi sức' rạn san hô (Nhập từ: hồi sức)",
    answers: ["hồi sức"],
    successMsg: "Quá sáng tạo! Hồi sức cho san hô biển khơi dựng lại đại dương dồi dào đa dạng sinh sinh."
  },
  {
    id: "moi_truong_e",
    topicId: "moi_truong",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Lược bớt lặp luộm thuộm: Rút gọn tối lược lời nhắc nhở <span class='text-amber-500 font-bold'>\"Chúng ta rất cần thiết phải dọn dẹp nhặt cho bằng sạch rác bẩn nơi đây nhé\"</span> thành một khẩu hiệu súc tích vô song dọn rách bảo vệ cảnh quan:",
    placeholder: "Nhập biểu khẩu hiệu gọn nhất (ví dụ: Chung tay dọn sạch rác)...",
    answers: ["hãy thu gom rác thải", "chung tay dọn sạch rác", "thu gom rác thải", "hãy dọn sạch rác"],
    successMsg: "Văn phong hiệu quả! Khẩu hiệu tinh giản bộc lộ tính hiệu triệu tức thì tới công chúng."
  },
  {
    id: "moi_truong_r",
    topicId: "moi_truong",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo chiều cấu trúc: Đảo ngược vị trí các chữ trong cụm danh từ bảo hộ sinh sống <span class='text-indigo-500 font-bold'>\"MÔI TRƯỜNG\"</span> để tạo nên một khái niệm học thuật cổ điển ám chỉ không gian trường năng lượng bao bọc:",
    placeholder: "Nhập đáp ứng từ đảo ngược âm tiết...",
    answers: ["trường môi"],
    successMsg: "Độc đáo cổ thi! 'Trường môi' tuy cổ lãng mạn phản ánh chính xác trường lực bảo bọc môi giới an bình quanh thực vật."
  },
  {
    id: "moi_truong_q",
    topicId: "moi_truong",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Khái niệm \"Đa dạng sinh học\" (Biodiversity) được hiểu đầy đủ nhất là gì?",
    options: [
      "A. Chỉ độc canh trồng cây gỗ keo đô thị hóa",
      "B. Sự phong phú và chung sống ổn định tự nhiên của vô vàn các loài sinh vật quý hiếm",
      "C. Việc dẹp bỏ rừng già làm quảng trường giải trí du kịch",
      "D. Đưa máy tự động hóa săn bắt thủy hải sinh"
    ],
    correctIndex: 1,
    successMsg: "Chính xác! Đa dạng bản sinh giữ vững sợi dây liên thông của chuỗi bảo toàn hệ sinh sinh."
  },

  // TOPIC 5: giao_duc (Giáo dục)
  {
    id: "giao_duc_s",
    topicId: "giao_duc",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Tìm viết một cụm từ tiếng Việt đồng nghĩa, nâng cao chuẩn khoa bảng hơn để thay cho từ <span class='text-blue-500 font-bold'>\"soạn cụ thể bài học để giảng\"</span>:",
    placeholder: "Nhập cụm từ trang trọng (ví dụ: soạn giáo án, biên soạn giáo trình)...",
    answers: ["soạn giáo án", "thiết kế giáo án", "biên soạn giáo trình", "phát triển chương trình", "hoạch định giáo trình"],
    successMsg: "Chính xác cao! Quy trình học chuẩn bị giáo án chất lượng cao quyết định mạch tư duy súc tích của học trò."
  },
  {
    id: "giao_duc_c",
    topicId: "giao_duc",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Kết hợp từ tố gốc Hán <span class='text-emerald-500 font-bold'>\"SINH\"</span> (trong sinh viên/học sinh) với một từ trước nó nhằm ám chỉ vai trò chủ thể ứng thí trong thi thố trường học pháp sư:",
    placeholder: "Nhập một từ tố hai tiếng (ví dụ: thí sinh, học sinh, giáo sinh)...",
    answers: ["thí sinh", "học sinh", "sinh viên", "tuyển sinh", "giáo sinh"],
    successMsg: "Tính ứng tuyệt mỹ! Thí sinh gánh vác sứ mệnh khoa bảng rèn đức luyện tài tạo nên sinh khí mới."
  },
  {
    id: "giao_duc_a",
    topicId: "giao_duc",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Adapt - Thích ứng đổi mới học đường: Hãy chuyển biến lối học tập cổ hủ bị động <span class='text-teal-500 font-bold'>\"nhồi nhét\"</span> thành một thuật ngữ đại diện cho phương châm học tập chủ động tiến bộ, nâng cao năng lực:",
    placeholder: "Nhập một cụm từ phản ánh năng năng (ví dụ: tự chủ học thuật, học tập chủ động, tự học)...",
    answers: ["tự chủ học thuật", "học tập chủ động", "tự học", "chủ động học tập", "tự học tự rèn"],
    successMsg: "Tuyệt mỹ! Quyền tự chủ học thuật / Tự học giải phóng tiềm năng sáng tạo của cả thầy lẫn trò."
  },
  {
    id: "giao_duc_m",
    topicId: "giao_duc",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Cường điệu danh hiệu: Nâng từ <span class='text-rose-500 font-bold'>\"trường dạy tốt đã đánh giá\"</span> lên mức học thuật chuyên nghiệp đại học thông qua thuật ngữ bảo chứng chất lượng thế giới:",
    placeholder: "Nhập từ chỉ nghiệp vụ thẩm định (ví dụ: kiểm định chất lượng, đạt chuẩn quốc gia)...",
    answers: ["kiểm định chất lượng", "trường chuẩn quốc gia", "trường chất lượng cao", "đạt chuẩn quốc tế"],
    successMsg: "Hoàn toàn chuẩn hóa! Kiểm định chất lượng quy chuẩn giúp trường học vững vàng thăng cấp học liệu."
  },
  {
    id: "giao_duc_p",
    topicId: "giao_duc",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Lôi cuốn thuật ngữ vật lý kỹ nghệ <span class='text-purple-500 font-bold'>\"gia tốc\"</span> vào câu cổ vũ động năng học tập nhanh vượt bậc của thanh niên Việt Nam hiện hữu:",
    placeholder: "Ví dụ: 'gia tốc' tri thức (Nhập từ: gia tốc)",
    answers: ["gia tốc"],
    successMsg: "Ấn tượng sâu rộng! Gia tốc hành trình tri thức dệt nên móng cầu vững chãi đưa quốc gia thăng thế."
  },
  {
    id: "giao_duc_e",
    topicId: "giao_duc",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Tinh lọc văn toán học: Thay đổi câu lặp từ <span class='text-amber-500 font-bold'>\"Hãy làm nốt các bài thi rồi gộp gộp gom dồn tụ lại hết nha\"</span> thành một từ ghép toán học hai âm tiết súc tích bộc lộ tính chất tích trữ đó:",
    placeholder: "Nhập một từ hai âm tiết biểu đạt gộp dồn (ví dụ: cộng dồn, gom tụ, tích tụ)...",
    answers: ["cộng dồn", "tích lũy", "tích dồn", "tổng kết"],
    successMsg: "Súc tích rành mạch! Cộng dồn điểm số rèn luyện giúp học sinh tích cực đua bơi phấn đấu học tập."
  },
  {
    id: "giao_duc_r",
    topicId: "giao_duc",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo ngữ tinh hoa: Hãy đảo ngược vị trí các chữ trong danh từ nòng cốt bệ phóng bảng vàng nghề dạy học: <span class='text-indigo-500 font-bold'>\"SƯ PHẠM\"</span> nhằm chiêm nghiệm nền khuôn phép hành vi đạo đức chuẩn mẫu mấu chốt:",
    placeholder: "Nhập từ đảo...",
    answers: ["phạm sư"],
    successMsg: "Sâu sắc văn lý! 'Phạm sư' là một từ cổ biểu chương khuôn phép rèn phẩm chất chuẩn vàng tinh anh chấn hưng giáo dục."
  },
  {
    id: "giao_duc_q",
    topicId: "giao_duc",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Theo quan điểm sư phạm hiện đại, hoạt động lồng ghép đa ngành, kết hợp liên thông kiến thức khoa học và đời sống gọi là gì?",
    options: [
      "A. Giáo trình rời rạc chuyên biệt biệt lập",
      "B. Chương trình giáo dục tích hợp đa chiều",
      "C. Đọc chép nguyên mẫu thụ động",
      "D. Thuyên chuyển học vị khẩn hỏa"
    ],
    correctIndex: 1,
    successMsg: "Rất vinh hạnh! Mô hình chương trình tích hợp đa chiều khai thông góc nhìn toàn nguyên của người học!"
  },

  // TOPIC 6: viec_lam (Việc làm)
  {
    id: "viec_lam_s",
    topicId: "viec_lam",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "S - Tìm thế từ ngữ vĩ mô: Tìm một cụm từ tiếng Việt thay thế cho cụm từ thô sơ <span class='text-blue-500 font-bold'>\"tìm kiếm gọi người vô công ty làm\"</span>:",
    placeholder: "Nhập cụm từ chuẩn thương trường (ví dụ: tuyển dụng nhân sự, chiêu mộ nhân tài)...",
    answers: ["tuyển dụng nhân sự", "thu hút tài năng", "chiêu mộ nhân tài", "tuyển dụng", "chiêu mộ"],
    successMsg: "Cực tốt! Định hình hoạt động tuyển dụng nhân sự phản ánh tầm cao của kỹ năng quản trị đãi ngộ."
  },
  {
    id: "viec_lam_c",
    topicId: "viec_lam",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "C - Ghép từ thế mạnh: Ghép chữ cốt lõi <span class='text-emerald-500 font-bold'>\"LAO ĐỘNG\"</span> với một từ ghép bổ trợ biểu thị toàn thể nguồn cung cống hiến giá trị thăng dư của đất nước:",
    placeholder: "Nhập một từ tố cụ thể (ví dụ: lực lượng lao động, người lao động, thị trường lao động)...",
    answers: ["người lao động", "lực lượng lao động", "thị trường lao động", "sức lao động"],
    successMsg: "Chính xác kỳ quan! Lực lượng lao động dồi dào, trí tuệ là nguồn năng lượng tối thượng cho đất nước cất cánh."
  },
  {
    id: "viec_lam_a",
    topicId: "viec_lam",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Adapt - Thích ứng cấu trúc: Thay thế từ mang sắc thái nặng nề <span class='text-teal-500 font-bold'>\"đuổi bớt nhân viên hàng loạt\"</span> thành thuật ngữ quản trị tái thiết lập đầy văn minh, tế nhị:",
    placeholder: "Nhập thuật ngữ kinh tế (ví dụ: tái cấu trúc nhân sự, cắt giảm nhân sự, tinh giản biên chế)...",
    answers: ["tái cấu trúc nhân sự", "cắt giảm nhân sự", "tinh giản biên chế", "tinh giản biên chế nhân sự"],
    successMsg: "Nhạy cảm sâu xa! Tái cấu trúc nhân sự vừa đúng bài toán khoa học vừa tôn trọng danh dự người hiến công."
  },
  {
    id: "viec_lam_m",
    topicId: "viec_lam",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Thử tối ưu hóa: Sửa từ thông dụng <span class='text-rose-500 font-bold'>\"tốc độ ra năng sản phẩm\"</span> thành từ chuyên nghiệp đong đếm sản lượng đầu ra tỉ mỉ:",
    placeholder: "Nhập từ chỉ hiệu hiệu (ví dụ: hiệu năng làm việc, hiệu suất lao động)...",
    answers: ["hiệu năng làm việc", "hiệu suất lao động", "năng suất lao động", "kết quả công việc", "hiệu suất công việc"],
    successMsg: "Tuyệt mĩ! Hiệu năng làm việc chuẩn xác minh định mọi cống hiến đóng góp công vụ."
  },
  {
    id: "viec_lam_p",
    topicId: "viec_lam",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Mượn thuật ngữ vẽ tranh thiết kế mỹ thuật <span class='text-purple-500 font-bold'>\"phác thảo\"</span> lồng tinh tế vào câu hoạch định các cột mốc thăng thế con đường sự nghiệp thăng hoa:",
    placeholder: "Ví dụ: 'phác thảo' tương lai (Nhập từ: phác thảo)",
    answers: ["phác thảo"],
    successMsg: "Sáng tạo tuyệt vời! Bản phác thảo sự nghiệp thăng hoa truyền năng lượng kiến thiết bền bỉ."
  },
  {
    id: "viec_lam_e",
    topicId: "viec_lam",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Rút gọn súc tích: Lược sạch các từ trùng nghĩa kéo dài của câu <span class='text-amber-500 font-bold'>\"Có tinh thần làm cố hết sức mình mài mặt bất kể đêm ngày thời gian vất vất vả\"</span> bằng 1 từ ghép bốn chữ sáng giá:",
    placeholder: "Nhập từ ghép bốn chữ (ví dụ: tận tụy công việc, tận tâm cống hiến, sẵn sàng cống hiến)...",
    answers: ["tận tụy công việc", "tận tâm cống hiến", "sẵn sàng cống hiến", "chịu khó chịu thương"],
    successMsg: "Chính xác tuyệt diệu! Sự tận tâm cống hiến bồi đắp chất thép bền bỉ làm bừng sáng mọi chân trời công việc."
  },
  {
    id: "viec_lam_r",
    topicId: "viec_lam",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo ngược cấu trúc: Hãy đảo ngữ vị trí chữ trong cụm từ cốt tủy vận hành kinh tế doanh nghiệp: <span class='text-indigo-500 font-bold'>\"NHÂN LỰC\"</span> để khơi mào dòng nghĩa chỉ năng lượng tiềm tàng của loài người:",
    placeholder: "Nhập từ đảo cực...",
    answers: ["lực nhân"],
    successMsg: "Lạ mắt thơ mộng! 'Lực nhân' tuy cổ định cách đầy dứt khoát động năng phi phàm sinh ra tự sâu bên trong con người."
  },
  {
    id: "viec_lam_q",
    topicId: "viec_lam",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Thị trường lao động (Labor Market) được hiểu chính xác nhất là gì?",
    options: [
      "A. Nơi thực hiện đàm phán nhập xuất khẩu hàng hóa gia dụng",
      "B. Nơi diễn ra quan phái quan hệ cung - cầu và giao dịch sức lao động kết nối doanh nghiệp và nhân sự",
      "C. Khu công nghiệp dệt may khép kín vùng biên",
      "D. Nơi thanh lý hợp đồng tài phiệt"
    ],
    correctIndex: 1,
    successMsg: "Rất vinh vinh! Sự lưu chuyển điều tiết linh động của thị trường lao động quyết định sức khỏe an sinh kinh tế."
  }
];

// API: Get Current Live Tasks
app.get("/api/tasks/list", (req, res) => {
  res.json({ status: "success", data: dbTasks });
});

// API: Save/Update Task
app.post("/api/tasks/save", (req, res) => {
  const { task } = req.body;
  if (!task || !task.id) {
    return res.status(400).json({ status: "error", error: "Dữ liệu câu hỏi không hợp lệ." });
  }

  const index = dbTasks.findIndex((t) => t.id === task.id);
  if (index !== -1) {
    dbTasks[index] = task;
  } else {
    dbTasks.push(task);
  }

  try {
    fs.writeFileSync(TASKS_DB_PATH, JSON.stringify(dbTasks, null, 2), "utf-8");
  } catch (e) {
    console.error("Save tasks file error:", e);
  }

  res.json({ status: "success", data: task });
});

// API: Delete Task
app.post("/api/tasks/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ status: "error", error: "Thiếu ID câu hỏi." });
  }

  const initialLength = dbTasks.length;
  dbTasks = dbTasks.filter((t) => t.id !== id);

  if (dbTasks.length !== initialLength) {
    try {
      fs.writeFileSync(TASKS_DB_PATH, JSON.stringify(dbTasks, null, 2), "utf-8");
    } catch (e) {
      console.error("Save tasks file error:", e);
    }
    return res.json({ status: "success", message: `Đã xóa thành công câu hỏi ${id}` });
  } else {
    return res.status(404).json({ status: "error", error: "Không tìm thấy câu hỏi với ID tương ứng." });
  }
});

// API: Get MicroLearn Video/Audio Posts
app.get("/api/microlearn/list", (req, res) => {
  res.json({ status: "success", data: dbVideoPosts });
});

// API: Save/Update MicroLearn Post (Video and Audio parameters)
app.post("/api/microlearn/save", (req, res) => {
  const { post } = req.body;
  if (!post || !post.id) {
    return res.status(400).json({ status: "error", error: "Dữ liệu bài đăng không hợp lệ." });
  }

  const index = dbVideoPosts.findIndex((p) => p.id === post.id);
  if (index !== -1) {
    dbVideoPosts[index] = post;
  } else {
    dbVideoPosts.push(post);
  }

  try {
    fs.writeFileSync(POSTS_DB_PATH, JSON.stringify(dbVideoPosts, null, 2), "utf-8");
  } catch (e) {
    console.error("Save posts file error:", e);
  }

  res.json({ status: "success", data: post });
});

// API: Delete MicroLearn Post
app.post("/api/microlearn/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ status: "error", error: "Thiếu ID bài đăng." });
  }

  const initialLength = dbVideoPosts.length;
  dbVideoPosts = dbVideoPosts.filter((p) => p.id !== id);

  if (dbVideoPosts.length !== initialLength) {
    try {
      fs.writeFileSync(POSTS_DB_PATH, JSON.stringify(dbVideoPosts, null, 2), "utf-8");
    } catch (e) {
      console.error("Save posts file error:", e);
    }
    return res.json({ status: "success", message: `Đã xóa thành công bài đăng ${id}` });
  } else {
    return res.status(404).json({ status: "error", error: "Không tìm thấy bài đăng với ID tương ứng." });
  }
});

// API: Validate SCAMPER response with AI
app.post("/api/ai/validate", async (req, res) => {
  const { taskId, question, userAnswer, typeLabel, topicId } = req.body;

  if (!userAnswer || userAnswer.trim() === "") {
    return res.status(400).json({ status: "error", error: "Đáp án không thể để trống." });
  }

  try {
    const aiClient = getGenAI();
    
    const prompt = `
Bạn là một Giáo sư Ngôn ngữ học Tiếng Việt cực kỳ am hiểu và tâm huyết. Nhiệm vụ của bạn là đánh giá tính chuẩn xác tiếng Việt và độ sáng tạo của câu trả lời từ người học dựa trên phương pháp SCAMPER (Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse).

Bối cảnh:
- Chủ đề từ vựng: ${topicId || "chung"}
- Kỹ thuật: ${typeLabel}
- Yêu cầu câu hỏi: ${question}
- Câu trả lời của người học: "${userAnswer}"

Hãy đánh giá xem câu trả lời này:
1. Có đúng ngữ pháp/chính tả tiếng Việt không?
2. Có đáp ứng chính xác yêu cầu đề bài của kỹ thuật không?
3. Có mang ý nghĩa ngữ nghĩa phù hợp trong bối cảnh chủ đề không?

Trả về một phản hồi JSON có cấu trúc chính xác theo schema sau:
{
  "isValid": boolean (true nếu câu trả lời chấp nhận được hoặc sáng tạo, false nếu hoàn toàn lạc đề, sai nghĩa hoặc sai chính tả nặng),
  "explanation": "Nhận xét ngắn gọn, tinh tế bằng tiếng Việt (1-2 câu). Khen ngợi nếu hay, hoặc giải thích tỉ mỉ nếu chưa đúng và gợi ý từ vựng chuẩn hơn.",
  "xpEarned": number (10 nếu isValid là true, nếu cực kỳ đột phá có thể cho 15, ngược lại cho 0)
}
`;

    const validationSchema = {
      type: Type.OBJECT,
      properties: {
        isValid: {
          type: Type.BOOLEAN,
          description: "True if user answer is linguistically acceptable and answers the prompt correctly."
        },
        explanation: {
          type: Type.STRING,
          description: "Friendly and highly constructive Vietnamese explanation about the user's answer."
        },
        xpEarned: {
          type: Type.INTEGER,
          description: "XP score to award based on quality (normally 10, up to 15 for brilliant answers, 0 for wrong answers)."
        }
      },
      required: ["isValid", "explanation", "xpEarned"]
    };

    const result = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: validationSchema,
        temperature: 0.3,
      }
    });

    const textOutput = result.text;
    if (!textOutput) {
      throw new Error("Không nhận được phản hồi từ AI");
    }

    const jsonParsed = JSON.parse(textOutput.trim());
    res.json({ status: "success", data: jsonParsed });

  } catch (error: any) {
    console.error("AI Validation Error:", error);
    // Fallback locally to static checking if API key is not configured or fails
    const localTask = dbTasks.find(t => t.id === taskId);
    const acceptableAnswers = localTask && localTask.answers ? localTask.answers : [];
    
    const userClean = userAnswer.trim().toLowerCase();
    const isMatch = acceptableAnswers.some(ans => {
      const ansClean = ans.trim().toLowerCase();
      return userClean.includes(ansClean) || ansClean.includes(userClean);
    });

    if (isMatch) {
      return res.json({
        status: "success",
        data: {
          isValid: true,
          explanation: "Tuyệt vời! Đáp án của bạn hoàn toàn đồng điệu với ngân hàng từ vựng tinh chọn của hệ thống.",
          xpEarned: 10
        }
      });
    }
    
    res.json({
      status: "success",
      data: {
        isValid: false,
        explanation: `Hệ thống phân tích AI tạm thời bận (503). Đáp án chưa được ghi nhận trùng khớp, bạn hãy thử sử dụng một biến thể từ ngữ khác nhé!`,
        xpEarned: 0
      }
    });
  }
});

// API: Get elegant, subtle hints for 'input' / SCAMPER tasks without spoiling answers
app.post("/api/ai/hint", async (req, res) => {
  const { taskId, question, typeLabel, topicId } = req.body;

  try {
    const aiClient = getGenAI();

    const localTask = dbTasks.find(t => t.id === taskId);
    const answersContext = localTask && localTask.answers && localTask.answers.length > 0
      ? `Danh sách đáp án tham khảo (Bí mật): ${localTask.answers.join(", ")}`
      : "";

    const prompt = `
Bạn là một Giáo sư Ngôn ngữ học Tiếng Việt cực kỳ am hiểu và tâm huyết. Nhiệm vụ của bạn là đưa ra một gợi ý (hint) tinh tế, súc tích và khơi gợi tư duy cho người học khi họ bị bí từ khi làm bài tập tiếng Việt.

Bối cảnh câu hỏi:
- Chủ đề từ vựng: ${topicId || "Chung"}
- Kỹ thuật nâng cao: ${typeLabel || "SCAMPER"}
- Câu hỏi chi tiết: ${question}
${answersContext ? `- ${answersContext}` : ""}

Yêu cầu khắt khe:
1. TUYỆT ĐỐI KHÔNG tiết lộ bất cứ đáp án chính xác hoặc viết hoàn chỉnh từ khóa câu trả lời ra.
2. Gợi ý đầy khéo léo thông qua mô tả chữ cái bắt đầu, từ đồng nghĩa xa, hoàn cảnh sử dụng hoặc số âm tiết của từ ngữ cần tìm.
3. Độ dài cực kỳ súc tích: Chỉ đúng 1-2 câu tiếng Việt ngắn gọn, tinh tế và mang tính động viên cao.

Trả về một đối tượng JSON có cấu trúc chính xác theo schema sau:
{
  "hint": "Nội dung gợi ý tiếng Việt tinh vi và đầy khích lệ"
}
`;

    const hintSchema = {
      type: Type.OBJECT,
      properties: {
        hint: {
          type: Type.STRING,
          description: "Subtle and sophisticated Vietnamese hint that inspires the candidate without revealing the answer words directly."
        }
      },
      required: ["hint"]
    };

    const result = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: hintSchema,
        temperature: 0.7,
      }
    });

    const textOutput = result.text;
    if (!textOutput) {
      throw new Error("Không nhận được gợi ý tinh tế từ AI");
    }

    const jsonParsed = JSON.parse(textOutput.trim());
    res.json({ status: "success", data: jsonParsed });

  } catch (error: any) {
    console.error("AI Hint Endpoint Error:", error);
    const localTask = dbTasks.find(t => t.id === taskId);
    let fallbackHint = "Hãy suy ngẫm về các từ có cấu tạo âm tiết tương tự dùng trong văn bản chính thống!";
    if (localTask && localTask.answers && localTask.answers.length > 0) {
      const firstA = localTask.answers[0];
      fallbackHint = `Gợi ý: Từ cần tìm có khoảng ${firstA.length} chữ cái, bắt đầu bằng chữ cái '${firstA.charAt(0).toUpperCase()}'.`;
    }
    res.json({
      status: "success",
      data: {
        hint: fallbackHint
      }
    });
  }
});

// API: Generate a custom SCAMPER or QUIZ task dynamically based on Topic
app.post("/api/ai/generate-task", async (req, res) => {
  const { topicId, topicName } = req.body;

  try {
    const aiClient = getGenAI();

    const prompt = `
Tạo một bài tập rèn luyện (thử thách từ vựng tiếng Việt) mới mẻ về chủ đề "${topicName || "Chung"}" sử dụng một trong các kỹ thuật SCAMPER ngẫu nhiên (hoặc bài tập trắc nghiệm đa lựa chọn Quiz phù hợp).

Hãy luân phiên giữa:
- **Trắc nghiệm (Quiz)**: Hỏi về định nghĩa, sắc thái từ vựng, từ trái nghĩa, từ Hán Việt.
- **SCAMPER**:
  + Thay thế (Substitute - mã 'S'): Tìm từ đồng nghĩa/thay thế đắc ý.
  + Kết hợp (Combine - mã 'C'): Ghép âm tiết mới để tạo từ mới.
  + Thích ứng (Adapt - mã 'A'): Thay đổi từ ngữ để chuyển ngữ cảnh.
  + Sửa đổi/Phóng đại (Modify - mã 'M'): Cường điệu sắc thái hoặc thêm trạng từ chỉ mức độ.
  + Đặt vào mục đích khác (Put to other uses - mã 'P'): Dùng một từ chuyên môn trong bối cảnh đời thường.
  + Loại bỏ (Eliminate - mã 'E'): Bỏ một âm tiết hay một bộ phận để rút gọn súc tích.
  + Đảo ngược (Reverse - mã 'R'): Đảo trật tự chữ hoặc cấu trúc câu.

Trả về một đối tượng JSON đúng chuẩn schema sau để hiển thị tinh vi:
{
  "format": "quiz" hoặc "input",
  "typeCode": "một chữ cái duy nhất thể hiện kỹ thuật ví dụ: S, C, A, M, P, E, R, Q",
  "typeLabel": "Tên nhãn tiếng Việt tinh tế (ví dụ: 'S - Thay thế (Substitute)' hoặc 'Q - Trắc nghiệm ôn tập')",
  "question": "Câu hỏi rành mạch, có gợi ý rõ ràng và sử dụng thẻ HTML như <span class='text-red-500 font-bold'>\"từ ngữ\"</span> để nhấn mạnh sinh động.",
  "options": ["Mảng 4 đáp án dạng A, B, C, D nếu format là quiz, nếu format là input thì để trống mảng"],
  "correctIndex": "Số nguyên từ 0-3 chỉ vị trí đáp án đúng nếu format là quiz, nếu format là input thì để 0",
  "placeholder": "Gợi ý định dạng nhập ngắn gọn cho người dùng học nếu format là input",
  "answers": ["Một vài từ đồng nghĩa/đáp án gợi ý chấp nhận được viết thường nếu format là input"],
  "successMsg": "Lời khen ngợi văn vẻ kết hợp giải nghĩa thú vị về gốc tích ngôn ngữ học tiếng Việt này khi giải đúng."
}
`;

    const taskSchema = {
      type: Type.OBJECT,
      properties: {
        format: {
          type: Type.STRING,
          description: "Must be 'quiz' or 'input'"
        },
        typeCode: {
          type: Type.STRING,
          description: "One uppercase letter category for SCAMPER or Q"
        },
        typeLabel: {
          type: Type.STRING,
          description: "Vietnamese beautiful technique description"
        },
        question: {
          type: Type.STRING,
          description: "Formatted Vietnamese question string with highlights"
        },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "4 options for Quiz format, empty for Input"
        },
        correctIndex: {
          type: Type.INTEGER,
          description: "0 to 3 showing correct answer index"
        },
        placeholder: {
          type: Type.STRING,
          description: "Input instruction for user input"
        },
        answers: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Acceptable keyword variations for validation"
        },
        successMsg: {
          type: Type.STRING,
          description: "Vietnamese linguistic praise upon success"
        }
      },
      required: ["format", "typeCode", "typeLabel", "question", "successMsg"]
    };

    const result = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: taskSchema,
        temperature: 0.7,
      }
    });

    const textOutput = result.text;
    if (!textOutput) {
      throw new Error("Không nhận được phản hồi tạo thử thách từ AI");
    }

    const generatedTask = JSON.parse(textOutput.trim());
    // Give it a unique ID with random suffix
    generatedTask.id = `ai_${topicId}_${Date.now()}`;
    generatedTask.topicId = topicId;
    generatedTask.isAiGenerated = true;

    res.json({ status: "success", data: generatedTask });

  } catch (error: any) {
    console.error("AI Generate Task Error:", error);
    // Fallback to spawning a random offline task cloned with a new dynamic ID
    const matches = dbTasks.filter(t => t.topicId === topicId);
    const chosen = matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : dbTasks[Math.floor(Math.random() * dbTasks.length)];
    const clone = { ...chosen, id: `ai_local_${topicId}_${Date.now()}`, isAiGenerated: true, question: `[Ngoại tuyến] ${chosen.question}` };
    
    res.json({ status: "success", data: clone });
  }
});

// API: Generate a specific SCAMPER task by slot dynamically based on Topic, Type and Index
app.post("/api/ai/generate-task-by-slot", async (req, res) => {
  const { topicId, typeCode, index, topicName, difficulty } = req.body;

  if (!topicId || !typeCode || !index) {
    return res.status(400).json({ status: "error", message: "Thiếu thông tin yêu cầu" });
  }

  try {
    const aiClient = getGenAI();
    
    // Detailed prompts per SCAMPER code to target highly specific questions
    const scamperDescriptions: Record<string, string> = {
      S: "Substitute - Thay thế phó từ, tính từ hoặc danh từ thông thường bằng một từ Hán-Việt tinh tế, trang nhã để tăng mỹ cảm của văn mô tả.",
      C: "Combine - Kết hợp hai yếu tố ngôn từ, ghép từ tố cũ với từ tố mới hoặc ghép hai đặc tính để tạo lập một từ ghép giàu sức biểu đạt.",
      A: "Adapt - Thích ứng: Đưa thuật ngữ khoa học, lịch sử, nhân sinh vào bối cảnh tự nhiên hoặc chuyên đề để tạo màu sắc thi vị hóa.",
      M: "Modify - Cải biên / Khuyếch đại: Kéo giãn định lượng không gian, phóng đại thuộc tính vật lý, tăng cường sắc thái biểu cảm sâu sắc.",
      P: "Put to other uses - Đặt vào bối cảnh mới / Đa dụng: Cho sự vật có linh tính như tri âm tri kỷ, nhân hóa tinh tế hoặc đưa phó từ ẩm thực, kiến trúc vào mô tả.",
      E: "Eliminate - Loại bỏ: Rút gọn các từ đồng nghĩa trùng lắp, phó từ thừa thãi để làm câu văn súc tích, đắt giá, dồi dào cô đọng.",
      R: "Reverse - Đảo ngược / Đảo ngữ: Biến đổi vị trí các từ ghép, pháo ngữ pháp để kiến tạo cấu trúc lôi cuốn đầy nhạc điệu.",
      Q: "Quiz - Trắc nghiệm ôn tập tri thức ngôn ngữ học chuyên sâu, kiểm tra ngữ nghĩa, từ loại, thành ngữ tục ngữ thuộc chủ đề."
    };

    const description = scamperDescriptions[typeCode] || "Thử thách rèn luyện từ vựng tư duy sáng tạo";

    let difficultyInstruction = "";
    if (difficulty === "easy" || !difficulty) {
      difficultyInstruction = `Bài tập ở Cấp độ: DỄ (Dành cho sơ cấp). Sử dụng từ ngữ quen thuộc, bối cảnh đơn giản, dễ liên tưởng. Đột phá nhỏ nhưng hiệu quả rõ nét. Gợi ý từ đồng nghĩa rõ ràng hơn.`;
    } else if (difficulty === "medium") {
      difficultyInstruction = `Bài tập ở Cấp độ: TRUNG BÌNH (Dành cho trung cấp). Đòi hỏi tư duy liên kết sâu sắc, bối cảnh văn chương giàu tính nghệ thuật hơn. Các từ gốc cần thay thế tinh xảo hơn.`;
    } else if (difficulty === "hard") {
      difficultyInstruction = `Bài tập ở Cấp độ: KHÓ (Dành cho bác học, chuyên sâu). Bối cảnh học thuật cao độ, từ vựng cổ phong, Hán Việt hiếm hoặc chuyên sâu, hoặc quy luật đảo ngữ/lược từ cực kỳ thử thách. Phân tích thành công đòi hỏi vốn từ cổ điển đồ sộ.`;
    }

    const prompt = `
Bạn là một Giáo sư Ngôn ngữ học Tiếng Việt hàn lâm xuất chúng. Hãy tạo một bài tập rèn luyện (thử thách từ vựng tiếng Việt) độc bản thứ ${index} thuộc kỹ thuật "${description}" dành cho chủ đề "${topicName || "Chung"}".

${difficultyInstruction}

Yêu cầu cụ thể của đề bài:
1. Đề bài phải cực kỳ mượt mà, văn phong sư phạm học thuật tinh tế nhưng dễ hiểu, truyền cảm hứng mạnh mẽ.
2. Với định dạng "input": Đặt ra một câu mẫu hoặc bối cảnh cần cải tiến từ vựng, bôi đậm từ gốc bằng thẻ HTML như <span class='text-purple-500 font-bold'>\"từ gốc\"</span> (dùng màu phù hợp với kỹ thuật: tím cho S, xanh lá cho C, vàng cam cho A, hồng đỏ cho M, xanh lam cho P, hồng cho E, tím cho R). Yêu cầu người học tìm từ/âm tiết hoàn hảo khác thay thế, kết hợp hay cải tiến nó theo đúng tinh thần SCAMPER.
3. Với định dạng "quiz" (đặc biệt khi typeCode là Q): Thiết lập 1 câu hỏi trắc nghiệm chọn đáp án đúng nhất (A, B, C, D) kiểm tra vốn từ hoặc sự chuyển hóa sắc thái.
4. Tránh lặp lại chính xác các bài tập mẫu đã có trong hệ thống và phải đảm bảo câu hỏi có tính thực tế cao.

Hãy trả về một đối tượng JSON đúng chuẩn schema sau:
{
  "format": "${typeCode === "Q" ? "quiz" : "input"}",
  "typeCode": "${typeCode}",
  "typeLabel": "${typeCode === "S" ? "S - Thay thế (Substitute)" : 
                 typeCode === "C" ? "C - Kết hợp (Combine)" : 
                 typeCode === "A" ? "A - Thích nghi (Adapt)" : 
                 typeCode === "M" ? "M - Cải biên (Modify)" : 
                 typeCode === "P" ? "P - Bối cảnh mới (Put to other uses)" : 
                 typeCode === "E" ? "E - Lược bỏ (Eliminate)" : 
                 typeCode === "R" ? "R - Đảo ngược (Reverse)" : "Q - Trắc nghiệm (Quiz)"}",
  "question": "Câu hỏi rành mạch chỉ rõ nhiệm vụ luyện từ vựng Việt Ngữ tinh xảo...",
  "options": ["Mảng 4 đáp án dạng A, B, C, D nếu format là quiz, nếu format là input thì để trống mảng"],
  "correctIndex": "Số nguyên từ 0-3 chỉ vị trí đáp án đúng nếu format là quiz, ngược lại để 0",
  "placeholder": "Gợi ý định dạng nhập từ vựng cho người học nếu format là input",
  "answers": ["Mảng danh sách các từ khóa đồng nghĩa/thứ nguyên đáp án tiếng Việt viết thường, súc tích có thể chấp nhận được của ô nhập liệu (ví dụ: ['tuyệt diệu', 'tuyệt mỹ', 'mỹ lệ'])"],
  "successMsg": "Lời phân tích ngữ pháp ngôn học ngợi khen hào sảng, uyên bác và truyền lửa khi người học giải quyết chính xác thử thách này."
}
`;

    const taskSchema = {
      type: Type.OBJECT,
      properties: {
        format: { type: Type.STRING, description: "Must be 'quiz' or 'input'" },
        typeCode: { type: Type.STRING, description: "One uppercase letter category" },
        typeLabel: { type: Type.STRING, description: "Vietnamese technique description" },
        question: { type: Type.STRING, description: "Formatted question string with HTML spans for highlights" },
        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 options for Quiz format, empty for input" },
        correctIndex: { type: Type.INTEGER, description: "0 to 3 showing correct answer index" },
        placeholder: { type: Type.STRING, description: "Input instruction placeholder" },
        answers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Acceptable keyword variations in lowercase" },
        successMsg: { type: Type.STRING, description: "Linguistic explanation praise on success" }
      },
      required: ["format", "typeCode", "typeLabel", "question", "successMsg"]
    };

    const result = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: taskSchema,
        temperature: 0.7,
      }
    });

    const textOutput = result.text;
    if (!textOutput) {
      throw new Error("Không nhận được phản hồi tạo thử thách từ AI");
    }

    const generatedTask = JSON.parse(textOutput.trim());
    generatedTask.id = `${topicId}_${typeCode.toLowerCase()}${index}`;
    generatedTask.topicId = topicId;
    generatedTask.isAiGenerated = true;

    res.json({ status: "success", data: generatedTask });

  } catch (error: any) {
    console.error("AI Generate Slot Task Error:", error);
    // Dynamic fallback generation based on requested parameters
    const code = typeCode.toUpperCase();
    const isQuiz = code === "Q" || code === "QUIZ";
    const fallbackTask = {
      id: `${topicId}_${typeCode.toLowerCase()}${index}`,
      topicId: topicId,
      format: isQuiz ? "quiz" : "input",
      typeCode: code,
      typeLabel: code === "S" ? "S - Thay thế (Substitute)" :
                 code === "C" ? "C - Kết hợp (Combine)" :
                 code === "A" ? "A - Thích nghi (Adapt)" :
                 code === "M" ? "M - Cải biên (Modify)" :
                 code === "P" ? "P - Bối cảnh mới (Put to other uses)" :
                 code === "E" ? "E - Lược bỏ (Eliminate)" :
                 code === "R" ? "R - Đảo ngược (Reverse)" : "Q - Trắc nghiệm (Quiz)",
      question: `Thử thách sơ cua dự phòng cho Bài ${index} kỹ thuật ${code}. Tìm từ ghép thích hợp cho chủ đề này cải tiến sắc thái từ vựng:`,
      placeholder: isQuiz ? undefined : "Nhập câu trả lời phong phú...",
      options: isQuiz ? ["Xét đoán khoa học", "Đáp án ngữ nghĩa học", "Tinh tế nghệ thuật", "Tinh xảo ngôn từ"] : undefined,
      correctIndex: isQuiz ? 1 : undefined,
      answers: isQuiz ? undefined : ["đúng", "chính xác", "tuyệt vời", "tuyệt diệu", "mỹ cảnh", "thương lượng"],
      successMsg: "Hoàn hảo! Bạn đã chinh phục tuyệt hảo bằng năng lực tự thân kiên cường.",
      isAiGenerated: true
    };

    res.json({ status: "success", data: fallbackTask });
  }
});


// ----------------- VITE ENDPOINT OR PRODUCTION STATIC SERVING -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running smoothly on http://localhost:${PORT}`);
  });
}

startServer();
