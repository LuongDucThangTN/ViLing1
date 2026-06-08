export interface Task {
  id: string;
  topicId: string;
  format: "input" | "quiz";
  typeCode: string;
  typeLabel: string;
  question: string;
  placeholder?: string;
  answers?: string[];
  options?: string[];
  correctIndex?: number;
  successMsg: string;
  isAiGenerated?: boolean;
}

export const initialTasks: Task[] = [
  // ==========================================
  // TOPIC 1: danh_lam (Danh lam thắng cảnh)
  // ==========================================
  {
    id: "danh_lam_s1",
    topicId: "danh_lam",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Tìm một từ đồng nghĩa trang trọng và đắt giá hơn để thế vị cho cụm từ thô <span class='text-purple-500 font-bold'>\"cảnh đẹp\"</span> khi vẽ tả cảnh sắc phi phàm của kỳ văn tự nhiên:",
    placeholder: "Nhập một từ tinh tế (ví dụ: mỹ cảnh, thắng cảnh, kỳ quan, tuyệt cảnh)...",
    answers: ["thắng cảnh", "mỹ cảnh", "tuyệt cảnh", "kỳ kỳ quan", "cảnh quan", "tuyệt mỹ", "kỳ quan"],
    successMsg: "Xuất sắc! Việc thay thế từ ngữ nôm na bằng từ ngữ Hán-Việt đắt giá giúp câu văn trở nên thơ mộng, lộng lẫy hơn."
  },
  {
    id: "danh_lam_s2",
    topicId: "danh_lam",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế từ vựng quen thuộc: Đổi từ chỉ non cao <span class='text-purple-500 font-bold'>\"núi non\"</span> sang từ ghép mang cấu trúc cổ điển, tao nhã hơn khi mô tả hệ núi đá vôi kỳ vĩ:",
    placeholder: "Ví dụ: sơn hà, quần sơn, thế núi, sơn lâm...",
    answers: ["sơn lăng", "quần sơn", "thế núi", "sơn lâm", "sơn hà", "trùng điệp"],
    successMsg: "Hoàn hảo! Từ tố 'sơn' mang sắc thái uy nghi, lột tả sâu đậm bản lĩnh của vạn thạch cổ kính."
  },
  {
    id: "danh_lam_s3",
    topicId: "danh_lam",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế danh từ: Để tinh tế hóa từ <span class='text-purple-500 font-bold'>\"hang động\"</span> thô sơ khi viết về tiên cảnh Phong Nha - Kẻ Bàng, bạn sẽ thế vào bằng từ nào?",
    placeholder: "Nhập một từ Hán Việt tinh lọc (ví dụ: thạch động, mật động, u động)...",
    answers: ["thạch động", "mật động", "u động", "kỳ động", "tiên động"],
    successMsg: "Lãng mạn vô cùng! 'Thạch động' gợi ảo ảnh của thạch nhũ kết tụ qua hàng triệu chu kỳ vũ trụ."
  },
  {
    id: "danh_lam_c1",
    topicId: "danh_lam",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Kết hợp từ tố gốc <span class='text-emerald-500 font-bold'>\"KỲ\"</span> (mang tính độc đáo vô song) với một tiếng khác chỉ vẻ đẹp lẫm liệt tự nhiên dâng tặng để tạo ra thực thể kiến tạo hùng vĩ:",
    placeholder: "Nhập một từ hai âm tiết (ví dụ: kỳ quan, kỳ cảnh, kỳ thú)...",
    answers: ["kỳ quan", "kỳ cảnh", "kỳ thú", "kỳ diệu", "kỳ vĩ"],
    successMsg: "Tuyệt mỹ! Sự kết đôi tạo lập bức tranh kỳ vĩ, khẳng định sự diễm lệ riêng biệt của kỳ quan thiên tạo."
  },
  {
    id: "danh_lam_c2",
    topicId: "danh_lam",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Giao phối từ vựng: Kết hợp từ tố Hán Việt <span class='text-emerald-500 font-bold'>\"THIÊN\"</span> (trời/vũ trụ) đứng trước một từ chỉ quá trình thiết lập tạo dựng để ngợi ca thắng cảnh tự nhiên:",
    placeholder: "Nhập từ hai âm tiết (ví dụ: thiên tạo, thiên đường, thiên sứ)...",
    answers: ["thiên tạo", "thiên đường", "thiên tạo hóa", "thiên cảnh"],
    successMsg: "Tuyệt diệu! 'Thiên tạo' làm nổi bật ưu thế độc tôn không có dấu vết nhân tạo trần tục."
  },
  {
    id: "danh_lam_c3",
    topicId: "danh_lam",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Phối giao cảnh trí: Kết hợp từ chỉ núi non <span class='text-emerald-500 font-bold'>\"SƠN\"</span> đi đôi cùng từ chỉ nguồn nước <span class='text-emerald-500 font-bold'>\"THỦY\"</span> để biểu đạt trọn vẹn sự tương thông âm dương của non nước:",
    placeholder: "Nhập từ ghép ghép đôi quen thuộc...",
    answers: ["sơn thủy", "sơn thuỷ"],
    successMsg: "Chuẩn xác tuyệt đỉnh! Bức họa sơn thủy hữu tình chính là tinh hoa triết mỹ của cảnh quan văn hóa Đông phương."
  },
  {
    id: "danh_lam_a1",
    topicId: "danh_lam",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Hấp thụ bối cảnh: Sửa đổi tính từ đơn sơ <span class='text-amber-500 font-bold'>\"rộng lớn\"</span> cho thích nghi cao nhất với độ sâu lắng bí ẩn trong lòng đất của các thạch động tự nhiên:",
    placeholder: "Nhập một từ sâu lắng (ví dụ: thâm sâu, vô tận, thăm thẳm, bao la)...",
    answers: ["thâm sâu", "bao la", "thăm thẳm", "vô tận", "u linh", "bí ẩn"],
    successMsg: "Quá tài tình! 'Thâm sâu' hay 'thăm thẳm' tăng cường cảm giác cổ sơ, bí ẩn kích thích trí tò mò lữ khách."
  },
  {
    id: "danh_lam_a2",
    topicId: "danh_lam",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Hấp thụ trầm tích thời gian: Biến chuyển từ <span class='text-amber-500 font-bold'>\"lâu năm\"</span> sang một tính từ trang kính cổ lâu, tương thích tuyệt đối khi miêu tả đền đài tích cổ xưa rêu phong:",
    placeholder: "Nhập từ tương thích bối cổ (ví dụ: cổ kính, ngàn năm, vạn niên, hoang cổ)...",
    answers: ["cổ kính", "ngàn năm", "hoang cổ", "trầm cổ", "rêu phong"],
    successMsg: "Khí khái phi phàm! Sự thích nghi ngôn từ này khiến công trình danh thắng toát lên khí chất trầm hùng, thâm nghiêm."
  },
  {
    id: "danh_lam_a3",
    topicId: "danh_lam",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Thích nghi khí tượng: Để viết về sương mờ sáng sớm vắt ngang sườn núi Cao Bằng, hãy biến đổi từ <span class='text-amber-500 font-bold'>\"sương mù\"</span> thành một thực thể diễm lệ hơn:",
    placeholder: "Nhập từ bay bổng mỹ học (ví dụ: sương lam, vân hải, khói sương)...",
    answers: ["sương lam", "vân hải", "khói sương", "ảo ảnh"],
    successMsg: "Tuyệt hảo! 'Sương lam' đại diện cho làn khói núi xanh mướt đầy chất họa lãng mạn."
  },
  {
    id: "danh_lam_m1",
    topicId: "danh_lam",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify / Khuyếch đại mức độ: Hãy nâng tầm cường đạo tuyệt mĩ của từ đơn điệu <span class='text-rose-500 font-bold'>\"đẹp\"</span> lên thành một từ ghép cực kỳ cao quý, vĩ mô vô tận diễn tả kỳ cảnh:",
    placeholder: "Nhập từ quy mô (ví dụ: hùng vĩ, tráng lệ, mỹ lệ, tuyệt mỹ)...",
    answers: ["hùng vĩ", "tráng lệ", "mỹ lệ", "tuyệt mỹ", "nguy nga", "hùng vĩ tráng lệ"],
    successMsg: "Hoàn toàn chinh phục! Sắc thái khuyếch đại đưa tả cảnh lên đỉnh thế mỹ cảm điện ảnh."
  },
  {
    id: "danh_lam_m2",
    topicId: "danh_lam",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify / Kéo căng định lượng: Nâng tầm chiều cao của dốc đá quanh co sườn núi từ từ thô <span class='text-rose-500 font-bold'>\"cao nhiều\"</span> thành một tính từ chỉ tính chất dựng đứng oai vệ chót vót chạm tới mây xanh:",
    placeholder: "Nhập từ cực độ (ví dụ: chót vót, chọc trời, chất ngất, ngút ngàn, uy nghiêm)...",
    answers: ["chót vót", "chọc trời", "chất ngất", "ngút ngàn", "uy nghiêm"],
    successMsg: "Cực kỳ lôi cuốn! Trực cảm chiều cao chất ngất dựng xây niềm bái phục trước uy linh của tạo hóa."
  },
  {
    id: "danh_lam_m3",
    topicId: "danh_lam",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Thổi hồn chiều sâu: Biến từ chỉ màu nước hồ Ba Bể bình thường <span class='text-rose-500 font-bold'>\"xanh trong\"</span> thành một sắc thái báu ngọc óng ánh chiều sâu kỳ tuyệt:",
    placeholder: "Nhập tính từ gợi báu ngọc (ví dụ: xanh ngọc bích, ngọc bích, lam ngọc, xanh biếc xanh)...",
    answers: ["ngọc bích", "lam ngọc", "xanh ngọc bích", "biếc xanh"],
    successMsg: "Quá diễm kiều! Nước xanh ngọc bích như viên linh ngọc mà đất trời chôn giấu giữa trùng ngàn sơn lâm."
  },
  {
    id: "danh_lam_p1",
    topicId: "danh_lam",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Mang từ ngữ nghệ thuật ẩm thực gia vị là <span class='text-cyan-500 font-bold'>\"nêm nếm\"</span> thổi hồn sang câu cảm thán về quá trình thiên tạo thiết kế dệt nên non sông di sản cảnh trí:",
    placeholder: "Nhập đúng từ khóa 'nêm nếm' để kiểm thử kết cấu ứng biểu cảm...",
    answers: ["nêm nếm", "nêm nếm gia vị"],
    successMsg: "Cảm quan nghệ thuật độc lạ! Sự nêm nếm hoa trái, sương sa của tạo hóa mang đến chiều sâu nhân gian cho danh thắng tự tại."
  },
  {
    id: "danh_lam_p2",
    topicId: "danh_lam",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Di tản thuật ngữ kiến trúc đồ họa <span class='text-cyan-500 font-bold'>\"phác thảo\"</span> thành bản năng mô tả hành động định hình cấu trúc non nước kỳ vĩ từ thuở sơ khai của mẹ thiên nhiên:",
    placeholder: "Nhập đúng từ khóa 'phác thảo'...",
    answers: ["phác thảo", "bản phác thảo"],
    successMsg: "Ý thức thiết kế sắc sảo! Phác thảo bức họa giang sơn tuyệt mỹ giúp người xem cảm nhận được linh tính trong đá vôi và dòng nước."
  },
  {
    id: "danh_lam_e1",
    topicId: "danh_lam",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Lược bớt lặp phó từ: Thanh giản câu trùng lặp <span class='text-pink-500 font-bold'>\"Danh thắng cảnh này thật là quá sức cực kỳ vô bờ đẹp rực rỡ vô ngần\"</span> bằng duy nhất một tính từ Hán Việt tôn quý súc nén bao quát hết nghĩa:",
    placeholder: "Nhập duy nhất một từ hoa mỹ nhã mật (ví dụ: tuyệt mỹ, mỹ lệ, kinh diễm, tuyệt diễm)...",
    answers: ["tuyệt mỹ", "mỹ lệ", "kinh diễm", "tuyệt diễm", "tuyệt thần"],
    successMsg: "Trọng tài súc tích! Sự bớt xén rườm rà phó từ giúp ý niệm tuyệt mỹ thăng vọt lên tức thì."
  },
  {
    id: "danh_lam_e2",
    topicId: "danh_lam",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Gọt sạch rậm rì: Tinh giản cụm từ có phần dư từ <span class='text-pink-500 font-bold'>\"các vách dốc thạch tường bằng khối đá vôi dựng đứng cheo leo\"</span> thành cụm từ ngắn gồm hai hoặc ba âm tiết rõ rệt nhất:",
    placeholder: "Nhập cụm từ súc nén (ví dụ: vách đá vôi, vách đá, vách thạch)...",
    answers: ["vách đá vôi", "vách đá", "vách núi"],
    successMsg: "Súc tích vô song! Sự cô nén câu chữ giải phóng thị lực người đọc, rèn tinh lực viết súc tích sắc lẹm."
  },
  {
    id: "danh_lam_r1",
    topicId: "danh_lam",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo ngữ: Thực chất của phép nghịch đảo âm tiết trong phong cảnh thi ca cổ. Hãy đảo ngược vị trí hai tiếng của từ ghép <span class='text-indigo-500 font-bold'>\"SƠN THỦY\"</span> biểu đạm một cách cổ điệu thâm vi dào dạt:",
    placeholder: "Nhập từ hai tiếng đảo ngược...",
    answers: ["thủy sơn", "thuỷ sơn"],
    successMsg: "Ý vị lãng tử! Bát ngát thủy sơn mở ra bức mành gấm của sương núi phủ che đầy thi vị cổ văn."
  },
  {
    id: "danh_lam_r2",
    topicId: "danh_lam",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo trật tự không gian: Đảo vị thế hai chữ của từ ghép danh từ thời thế <span class='text-indigo-500 font-bold'>\"THIÊN ĐỊA\"</span> chỉ không gian vũ trụ núi đồi rộng lớn nơi danh thắng:",
    placeholder: "Nhập từ nghịch đảo...",
    answers: ["địa thiên"],
    successMsg: "Khai mở nhãn quan mới! Từ 'địa thiên' phản chiếu cái nhìn sâu thẳm vững chãi từ mặt đất hướng thượng vươn cao lên bầu trời."
  },
  {
    id: "danh_lam_q1",
    topicId: "danh_lam",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Điểm đặc trưng xuất chúng về mặt địa chất kiến tạo của Công viên địa chất toàn cầu cao nguyên đá Đồng Văn là gì?",
    options: [
      "A. Những sa mạc cát đỏ trải dài vô tận",
      "B. Hoang mạc đá vôi u thâm thẳm xen kẽ các thung lũng kiến tạo sụt lún cổ đại kỳ vĩ",
      "C. Các rừng ngập mặn đầm lầy nguyên sơ bờ biển",
      "D. Đầm hồ nhân tạo phục vụ nông nghiệp lúa nước"
    ],
    correctIndex: 1,
    successMsg: "Tuyệt hảo! Cao nguyên đá Đồng Văn là tuyệt phẩm u cổ thâm sâu của địa văn vôi đặc hữu toàn cầu."
  },
  {
    id: "danh_lam_q2",
    topicId: "danh_lam",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Địa hình karst đặc sắc tạo dựng nên muôn hình thạch nhũ lung linh thuộc khối danh thắng nổi danh thế giới nào của Việt Nam?",
    options: [
      "A. Quần thể danh thắng Tràng An",
      "B. Quảng trường Ba Đình hoa lịch",
      "C. Bãi đá cổ Sa Pa rực nắng",
      "D. Đỉnh đèo Hải Vân mây phủ"
    ],
    correctIndex: 0,
    successMsg: "Hoàn hảo! Tràng An sở hữu mỹ cảnh karst kết đôi sủng cảnh thiên nhiên tạo tác vô song quý báu."
  },

  // ==========================================
  // TOPIC 2: du_lich (Du lịch)
  // ==========================================
  {
    id: "du_lich_s1",
    topicId: "du_lich",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế từ ngữ có tính chất khẩu ngữ: Sửa từ nôm na <span class='text-purple-500 font-bold'>\"đi chơi\"</span> thành cụm từ nâng cấp tinh tế biểu thị chuyến lữ du nhã nhặn tự do phóng khoáng:",
    placeholder: "Nhập cụm từ tao nhã (ví dụ: du ngoạn, lữ hành, du ngoạn, nghỉ dưỡng)...",
    answers: ["du ngoạn", "lữ hành", "nghỉ dưỡng", "chu du", "trải nghiệm", "du lịch"],
    successMsg: "Tuyệt mỹ! Du ngoạn hay lữ hành tái tạo tư duy phóng dật lãng tử của một tâm hồn xê dịch."
  },
  {
    id: "du_lich_s2",
    topicId: "du_lich",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế danh từ hạ cấp: Tìm một từ vựng chỉ địa điểm nghỉ ngơi lịch thiệp thế vị cho từ gốc dân dã dường như thiếu sang trọng là từ <span class='text-purple-500 font-bold'>\"chỗ ngủ\"</span>:",
    placeholder: "Nhập từ lưu trú tao nhã (ví dụ: điểm lưu trú, cơ sớ lưu trú, phòng nghỉ)...",
    answers: ["điểm lưu trú", "cơ sở lưu trú", "phòng nghỉ", "resort", "lưu trú", "điểm nghỉ dưỡng"],
    successMsg: "Chuẩn xác sang trọng! Chữ dùng tinh tươm làm đẹp thêm hành trình cho lữ khách dặc dài."
  },
  {
    id: "du_lich_s3",
    topicId: "du_lich",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế từ địa phương: Chuyển đổi tên gọi quà cáp bèo hoang như <span class='text-purple-500 font-bold'>\"đồ ăn mua về\"</span> thành từ khóa nâng tầm giá trị đặc vị văn hóa bản lữ:",
    placeholder: "Nhập một danh từ sang trọng (ví dụ: đặc sản, sản vật, quà lưu niệm)...",
    answers: ["đặc sản", "sản vật", "quà lưu niệm", "đặc sản bản địa"],
    successMsg: "Trí óc sắc bén! Trình bày 'sản vật' mở ra niềm kiêu hãnh của giang sơn thổ nhưỡng tự nhiên ban tặng."
  },
  {
    id: "du_lich_c1",
    topicId: "du_lich",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Từ tố gốc Hán Việt <span class='text-emerald-500 font-bold'>\"LỮ\"</span> có nghĩa là khách đường xa đi dặm dài. Ghép với một tiếng nữa đằng sau ám chỉ người phượt hành phiêu lãng thấu hiểu thiên nhiên:",
    placeholder: "Nhập từ hai tiếng (ví dụ: lữ khách, lữ hành, bạn lữ)...",
    answers: ["lữ khách", "lữ hành", "bạn lữ", "đồng lữ"],
    successMsg: "Tuyệt diệu! Sự lắp ghép mở lối tư duy thi hóa đời thực xê dịch, tô đậm bóng hình kẻ phiêu lãng lãng tử."
  },
  {
    id: "du_lich_c2",
    topicId: "du_lich",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Phối hợp gốc từ: Ghép từ chỉ hoạt động di chuyển viễn hành trải nghiệm <span class='text-emerald-500 font-bold'>\"DU\"</span> kết đôi cùng danh từ chỉ người đi chung thấu ngộ nhân sinh:",
    placeholder: "Nhập từ hai tiếng biểu cảm (ví dụ: du khách, du mục, du tử)...",
    answers: ["du khách", "du mục", "du hành", "du tử"],
    successMsg: "Hòa nhịp ngôn từ! Những du khách văn minh mang đến cho đất trời bản địa sự dung nạp đa văn hóa đẹp đẽ."
  },
  {
    id: "du_lich_c3",
    topicId: "du_lich",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Gắn kết ngôn hành: Phối sáp gốc từ di năng vận hành <span class='text-emerald-500 font-bold'>\"HÀNH\"</span> với một từ biểu thị tư trang gọn nhẹ cần mang theo bên người xê dịch suốt dọc đường trường:",
    placeholder: "Nhập từ hai tiếng (ví dụ: hành trang, hành lý, hành trang cuộc đời)...",
    answers: ["hành trang", "hành lý"],
    successMsg: "Quá diệu hợp! Hành trang giản gọn là kim chỉ nam tối thượng của phong cách du lịch tối giản tự do."
  },
  {
    id: "du_lich_a1",
    topicId: "du_lich",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Adapt - Hấp ứng văn hóa: Gia tăng tính thích nghi bằng cách phối hợp từ tố <span class='text-amber-500 font-bold'>\"bản địa\"</span> làm sao nhấn mạnh chiều sâu trải nghiệm sống hòa lẫn cùng người đồng bào vùng cao:",
    placeholder: "Nhập một cụm từ (ví dụ: văn hóa bản địa, trải nghiệm bản địa, tập tục bản địa)...",
    answers: ["văn hóa bản địa", "trải nghiệm bản địa", "tập tục bản địa", "cư dân bản địa"],
    successMsg: "Quá sâu sắc! Việc đắm mình vào văn hóa bản địa đánh thức ngũ quan trải nghiệm chân chất chân thực nhất."
  },
  {
    id: "du_lich_a2",
    topicId: "du_lich",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Thích ứng ngoại vụ: Thử chuyển hóa khái niệm mang bóng đen đơn lập <span class='text-amber-500 font-bold'>\"mang lều ra rừng ngủ\"</span> thành thuật ngữ mang tinh thần lữ hành thể chất hòa mình hiện đại xanh hữu hảo:",
    placeholder: "Nhập một cụm từ (ví dụ: cắm trại dã ngoại, cắm trại, dã ngoại sinh thái)...",
    answers: ["cắm trại", "dã ngoại", "cắm trại dã ngoại", "trekking"],
    successMsg: "Tinh gọn thời thượng! Lối cắm trại dã ngoại lành mạnh giúp ta tái định vị lại nhịp thở thong thả của chính mình."
  },
  {
    id: "du_lich_a3",
    topicId: "du_lich",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Hấp thụ không gian: Sắp đặt từ <span class='text-amber-500 font-bold'>\"đường đi cụ thể\"</span> thành thuật ngữ bản đồ kĩ năng biểu đạt bản vẽ lộ dặm tinh chuyên khoa học:",
    placeholder: "Nhập một từ vựng chuyên ngành (ví dụ: lộ trình, hành trình, tuyến trình)...",
    answers: ["lộ trình", "hành trình", "tuyến trình", "bản đồ tuyến"],
    successMsg: "Rất chuyên nghiệp! Thiết thảo lộ trình rành mạch bớt đi nguy hiểm rắp ranh dọc đường vạn lý sơn hà."
  },
  {
    id: "du_lich_m1",
    topicId: "du_lich",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Cường sắc thái xê dịch: Hãy sửa tính từ chỉ hành xê bụi bằng phương tiện xe máy rủi ro <span class='text-rose-500 font-bold'>\"phượt\"</span> thành cụm danh xưng đầy nhiệt huyết lãng du ngông cuồng sành sõi:",
    placeholder: "Nhập từ khí khái (ví dụ: phượt thủ, hành giả lãng du, phượt khách)...",
    answers: ["phượt thủ", "nhà lữ hành bụi", "phượt khách"],
    successMsg: "Hào mang khí chất! 'Phượt thủ' trẻ trung mang khát vọng ôm trọn gió núi, trăng ngàn trong mắt."
  },
  {
    id: "du_lich_m2",
    topicId: "du_lich",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify / Khuyếch trương quy mô: Chuyển sắc thái động từ đi dạo đơn giản <span class='text-rose-500 font-bold'>\"đi dạo loanh quanh nhiều nơi\"</span> thành đại ngã từ ghép Hán Việt rộng lớn khoáng đạt:",
    placeholder: "Nhập từ quy mô lãng du (ví dụ: chu du, chu du thiên hạ, đi vạn lý)...",
    answers: ["chu du", "chu du thiên hạ", "bôn ba xê dịch", "khắp thế gian"],
    successMsg: "Đầy dũng lượng quả cảm! 'Chu du' mở mang bờ cõi trí nạp rộng lớn và khơi dậy đam mê chinh phục khôn cùng."
  },
  {
    id: "du_lich_m3",
    topicId: "du_lich",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Phóng đại khoái cảm: Nâng tầm mỹ từ sảng khoái tầm thường là <span class='text-rose-500 font-bold'>\"vui thích\"</span> khi ngắm bình minh trên đỉnh mây biển Tà Xùa đến trạng thái tuyệt đỉnh say mê, bay bổng siêu trần:",
    placeholder: "Nhập một từ thăng tối thượng (ví dụ: mê mẩn, thăng hoa, rúng động, say đắm)...",
    answers: ["mê mẩn", "thăng hoa", "say đắm", "rúng động", "hớp hồn"],
    successMsg: "Cảm nhận tinh xảo! Thăng hoa trước mỹ cảnh mây biển đem lại dũng lượng sảng khoái, gột rửa u sầu."
  },
  {
    id: "du_lich_p1",
    topicId: "du_lich",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Sử dụng từ ngữ mượn bên lĩnh vực điều hướng kĩ thuật số là <span class='text-cyan-500 font-bold'>\"định vị\"</span> đem dệt thành một câu tinh tươm nhằm diễn tả hoạt động tìm thấy hạnh phúc tĩnh tịch thâm sâu của tâm hồn lữ khách:",
    placeholder: "Nhập chuẩn từ khóa 'định vị'...",
    answers: ["định vị", "tự định vị", "định vị bản thân"],
    successMsg: "Lý thú triết mỹ! Định vị chính tâm thức lặng im của bản thân giữa dòng thiên nhiên hùng vi giúp cân bằng vạn sự bão giông cuộc sống."
  },
  {
    id: "du_lich_p2",
    topicId: "du_lich",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Lôi kéo động từ sinh học tiến cứu <span class='text-cyan-500 font-bold'>\"đột biến\"</span> áp đặt vào bối cảnh thiết thảo một sự thay đổi ngoạn mục đầy tự hào dũng khí của hành trình xuy hành du lịch mạo hiểm:",
    placeholder: "Nhập đúng từ khóa 'đột biến'...",
    answers: ["đột biến", "sự đột biến"],
    successMsg: "Sử dụng cực thông minh! Tạo dựng một chặng đột biến lộ trình giúp giải tỏa định kiến rập khuôn, gieo mầm trải nghiệm kỳ tuyệt."
  },
  {
    id: "du_lich_e1",
    topicId: "du_lich",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Loại bỏ lặp nghĩa: Hãy cắt giũa câu có nhiều lỗ hổng rề rà vô bờ bến sau: <span class='text-pink-500 font-bold'>\"Chuyến đi chu du lữ hành này chúng tôi dự tính thiết lập sẽ kéo dài khoảng mốc trong chu kỳ là 3 ngày tất cả\"</span> thành một biểu thức súc nén tối giản:",
    placeholder: "Nhập câu gọn rành rọt (ví dụ: Hành trình kéo dài 3 ngày)...",
    answers: ["hành trình kéo dài 3 ngày", "chuyến đi kéo dài 3 ngày", "hành trình 3 ngày", "hịch trình dự tính 3 ngày"],
    successMsg: "Tinh sạch ngôn từ! Câu chữ dứt nén làm tăng tính dứt khoát khí khái phán đoán quyết liệt của đoàn đi."
  },
  {
    id: "du_lich_e2",
    topicId: "du_lich",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Lược bớt lặp cụm phụ: Hãy tinh lọc từ ngữ thô <span class='text-pink-500 font-bold'>\"các phương thức trợ giúp ăn uống chuẩn bị đi đường xung quanh phía sau\"</span> thành một danh từ Hán Việt đơn trị có gốc rễ thầm lặng chu tất:",
    placeholder: "Nhập từ cô nén sâu sắc chuẩn (ví dụ: hậu cần, dịch vụ hậu cần)...",
    answers: ["hậu cần", "dịch vụ hậu cần", "chuẩn bị", "nhu yếu phẩm"],
    successMsg: "Tuyệt mỹ tối giản! Nâng lên chữ 'hậu cần' thâu nghĩa biểu ý sự lo liệu thầm lặng dốc sức dặc dài."
  },
  {
    id: "du_lich_r1",
    topicId: "du_lich",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo trật tự ngôn ngữ: Hãy đảo chiều các âm tố của nhãn từ <span class='text-indigo-500 font-bold'>\"TRẢI NGHIỆM\"</span> để hé mở trạng thái tư duy chững lại, hoài ngẫm sâu hơn về tri lý chuyến lữ dã gian nan nhưng huy hoàng:",
    placeholder: "Nhập biến thể đảo âm...",
    answers: ["nghiệm trải"],
    successMsg: "Khám phá thần tình! 'Nghiệm trải' tuy hiếm thấy hơn song chứa đựng sức nặng ghê gớm của quá trình tự phản tư sâu cội nguồn nhân sinh quan."
  },
  {
    id: "du_lich_r2",
    topicId: "du_lich",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo ngược lý luận: Thay vị thế hai chữ của từ ghép lữ hành <span class='text-indigo-500 font-bold'>\"HÀNH TRÌNH\"</span> để mở ra nghĩa biến thể của thư lữ thong thả đĩnh đạc:",
    placeholder: "Nhập từ nghịch đảo...",
    answers: ["trình hành"],
    successMsg: "Văn nhân phong cách! 'Trình hành' là biến thể cổ phong đại diện cho hành trạng dời chân một cách đàng hoàng vinh hoa văn vật."
  },
  {
    id: "du_lich_q1",
    topicId: "du_lich",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Trụ cột nòng cốt định nghĩa lối du lịch \"Bền vững\" (Sustainable Tourism) là gì?",
    options: [
      "A. Đổ tiền xây dựng khách bạt ngàn các khu mua sắm nhếch nhác",
      "B. Tối ưu trải nghiệm lữ khách đồng thời gìn giữ bền vững hệ sinh thái tự nhiên và nâng đỡ kinh tế truyền thống bản xứ",
      "C. Tận thu tài nguyên rừng bản lữ nhằm giảm chi phí vận chuyển đường bộ",
      "D. Cho phép can thiệp cải tạo thô bạo vào địa mạo karst di sản địa phương"
    ],
    correctIndex: 1,
    successMsg: "Tuyệt hảo! Du lịch bảo tồn bền vững đắp bồi nguồn năng lượng sinh tồn vạn niên cho vùng đất."
  },
  {
    id: "du_lich_q2",
    topicId: "du_lich",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Lối ở trọ sống cùng, trải nghiệm đời thường cùng nhà nông bản xứ được gọi bằng thuật ngữ lữ du phổ cập nào?",
    options: [
      "A. Hotel cao cấp bao trọn gói",
      "B. Homestay bản dã hữu tình",
      "C. Cắm trại dại dột tự phát",
      "D. Du lữ dã ngoại bến cảng"
    ],
    correctIndex: 1,
    successMsg: "Rất vinh hạnh! Mô hình Homestay dung dị là cầu nối ngắn nhất thấu chạm phong vị nguyên bản đời sống."
  },

  // ==========================================
  // TOPIC 3: dich_vu (Dịch vụ)
  // ==========================================
  {
    id: "dich_vu_s1",
    topicId: "dich_vu",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế từ ngữ chuyên môn: Tìm từ ghép đồng sinh nho nhã thế chỗ cho cụm từ nôm <span class='text-rose-500 font-bold'>\"chăm sóc bảo dượng sau khi mua hàng\"</span> nhằm gia tăng tính chuyên nghiệp tuyệt hảo:",
    placeholder: "Nhập tử chuẩn dịch vụ (ví dụ: hậu mãi, bảo hành, chăm sóc khách hàng)...",
    answers: ["hậu mãi", "chăm sóc khách hàng", "bảo hành", "bảo dưỡng"],
    successMsg: "Hành xử văn minh! Hậu mãi chu đáo xây chắc lòng tin và sự tôn phục thủy chung tự đáy lòng từ họ dành cho cơ sở."
  },
  {
    id: "dich_vu_s2",
    topicId: "dich_vu",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế cụm hành vi thô thiển: Đổi cụm từ có sắc thái thực dụng <span class='text-rose-500 font-bold'>\"trả tiền dịch vụ\"</span> thành từ ghép thuật ngữ tài chính mượt mà, văn nhã hơn:",
    placeholder: "Nhập một từ hai âm tiết (ví dụ: thanh toán, tất toán, chi trả)...",
    answers: ["thanh toán", "tất toán", "chi trả", "thanh khoản"],
    successMsg: "Chuẩn xác thương trường! 'Thanh toán' nhã tiệp khơi gợi ý chí sòng phẳng và tôn trọng luật chơi trao đổi."
  },
  {
    id: "dich_vu_s3",
    topicId: "dich_vu",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế nhãn danh xưng: Thay đổi từ vựng chỉ nhân sự phục vụ giản thô <span class='text-rose-500 font-bold'>\"người giúp việc khách sạn\"</span> thành danh xưng sang trọng bậc nhất phương Tây quy chuẩn học thuật:",
    placeholder: "Nhập từ khóa danh giá (ví dụ: quản gia, nhân sự buồng phòng, concierge)...",
    answers: ["quản gia", "quản gia cao cấp", "concierge", "nhân sự phục vụ", "quản lý phòng"],
    successMsg: "Tô bồi giá trị! Khác biệt danh xưng thể hiện sự tôn quý xuất thần của nghệ thuật phục vụ thượng đỉnh."
  },
  {
    id: "dich_vu_c1",
    topicId: "dich_vu",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Kết hợp từ tố nòng cốt <span class='text-emerald-500 font-bold'>\"KHÁCH\"</span> kết giao cùng một từ tố biểu sắc thái thân thương, quen quyến luyến lâu bền tạo nên đối tượng ủng hộ nòng cốt dòng chảy sự nghiệp thương gia:",
    placeholder: "Nhập từ ghép hai tiếng (ví dụ: khách quen, khách ruột, khách quý)...",
    answers: ["khách quen", "khách quý", "khách ruột"],
    successMsg: "Hữu thấu chân tình! Khách ruột gánh vác sứ mạng chống đỡ con thuyền thương mại của bạn vượt bão giông thị trường."
  },
  {
    id: "dich_vu_c2",
    topicId: "dich_vu",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Kết hợp mỹ cảm: Phối sọ từ tố chỉ tấm lòng rộng mở ấm áp <span class='text-emerald-500 font-bold'>\"TÂM\"</span> đan sáp cùng chữ chỉ nỗ lực phụng dưỡng tối cường làm say đắm khách lữ:",
    placeholder: "Nhập ghép đôi hai tiếng đắp bồi (ví dụ: tận tâm, tận hiến, chân tâm)...",
    answers: ["tận tâm", "chân tâm", "tâm huyết", "thành tâm"],
    successMsg: "Cung kính mến chu! Tận tâm là bửu bối thần thông bẻ gãy mọi bức tường băng nghi kỵ của người mua bỡ ngỡ."
  },
  {
    id: "dich_vu_c3",
    topicId: "dich_vu",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Kết đôi nỗ lực hành vi: Phối giao chữ đứng đầu <span class='text-emerald-500 font-bold'>\"PHÂN\"</span> làm sao đứng đôi với từ <span class='text-emerald-500 font-bold'>\"PHỐI\"</span> tạo lập hệ thống vận hành luân chuyển hàng hóa tới tay khách tối ưu:",
    placeholder: "Nhập từ ghép ghép liền...",
    answers: ["phân phối"],
    successMsg: "Chính xác cao độ! Thiết kế hệ thống phân phối thông minh rút ngắn hành trình trải nghiệm rườm rà một cách ngoạn mục."
  },
  {
    id: "dich_vu_a1",
    topicId: "dich_vu",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Adapt - Việt hóa thích ứng cao: Thử gột sạch từ mượn ngoại lai Anh ngữ là <span class='text-amber-500 font-bold'>\"Feedback\"</span> thành một cụm từ tiếng Việt nho nhã, lịch tiệp bộc lộ rõ ý chí sẵn lòng tiếp thu học hỏi chỉnh sửa:",
    placeholder: "Nhập cụm từ phù hợp (ví dụ: ý kiến phản hồi, đánh giá đóng góp, góp ý)...",
    answers: ["ý kiến phản hồi", "góp ý", "đánh giá", "nhận xét", "phản hồi"],
    successMsg: "Sự lịch lãm tuyệt vời! Lắng nghe các ý kiến phản hồi chân mộc là nền tảng cốt tủy để hoàn thiện sản phẩm từng giờ."
  },
  {
    id: "dich_vu_a2",
    topicId: "dich_vu",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Thích nghi giao diện: Chuyển biến tinh tế khái niệm mộc độc <span class='text-amber-500 font-bold'>\"bán tại cửa hàng nhỏ lẻ\"</span> thành thuật ngữ hạ tầng thương mại văn minh, có tính bảo chứng cao:",
    placeholder: "Nhập cụm từ sang trọng chuyên nghiệp (ví dụ: tại điểm bán trực tiếp, quầy trải nghiệm)...",
    answers: ["điểm bán trực tiếp", "trực tiếp", "quầy bán lẻ", " showroom"],
    successMsg: "Chuẩn chỉnh chuyên nghiệp! Kiến tạo không gian trực tiếp tạo dựng sự yên lòng vững bền nơi khách hàng."
  },
  {
    id: "dich_vu_a3",
    topicId: "dich_vu",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Thích nghi dòng chảy công nghệ số: Thập kỷ vạn vật kết nối, hãy chuyển biến từ bình thường <span class='text-amber-500 font-bold'>\"bán qua mạng\"</span> thành thuật ngữ trang trọng chỉ tiến trình giao thương điện tử:",
    placeholder: "Nhập thuật ngữ kinh tế hiện đại (ví dụ: thương mại điện tử, trực tuyến, kênh số hóa)...",
    answers: ["thương mại điện tử", " trực tuyến", " kênh kỹ thuật số"],
    successMsg: "Phát kiến thức thời! Thương mại điện tử xóa nhòa mọi biên cương ngăn trở địa lý, đưa dịch vụ thăng hạng."
  },
  {
    id: "dich_vu_m1",
    topicId: "dich_vu",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Khuyếch đại tốc độ xử lý: Hãy sửa đổi từ tốc độ thô như <span class='text-rose-500 font-bold'>\"nhanh chóng\"</span> thành một từ sắc bén, diễn tả ý chí phản ứng thần tốc, khẩn trương nhất của ban điều hành:",
    placeholder: "Nhập từ chỉ tốc độ đỉnh cực (ví dụ: hỏa tốc, thần tốc, tức tốc, tức khắc)...",
    answers: ["hỏa tốc", "thần tốc", "tức tốc", "ngay lập tức", "siêu tốc"],
    successMsg: "Quyết đoán phi thường! Dịch vụ hỏa tốc dập tắt mọi bức xúc khát khao của người dùng trong phút chốc."
  },
  {
    id: "dich_vu_m2",
    topicId: "dich_vu",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Khuyếch đại phẩm cấp thương nhân: Chuyển biến từ đánh giá chung chung <span class='text-rose-500 font-bold'>\"tốt\"</span> thành một tính từ chỉ phẩm chất dịch vụ thượng hạng, có đẳng cấp cực phẩm tối ưu:",
    placeholder: "Nhập mỹ từ phẩm chất siêu vi (ví dụ: tuyệt hảo, thượng hạng, hoàn mỹ, tối ưu)...",
    answers: ["tuyệt hảo", "thượng hạng", "hoàn mỹ", "tối ưu", "xuất sắc"],
    successMsg: "Nâng phong thái thương hiệu! Việc hướng tới sự phục vụ tuyệt hảo kiến tạo rào cản độc quyền vô hình vững vàng."
  },
  {
    id: "dich_vu_m3",
    topicId: "dich_vu",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Khuyếch trương số lượng: Hãy cường thịnh hóa từ chỉ thực trạng mua hàng nhộn nhịp <span class='text-rose-500 font-bold'>\"nhiều người mua\"</span> thành một tính từ Hán Việt biểu thị bối cảnh tấp nập sầm uất đầy hào sảng tài lộc:",
    placeholder: "Nhập từ phồn vinh (ví dụ: sầm uất, tấp nập, quá tải, thịnh vượng)...",
    answers: ["sầm uất", "tấp nập", "phồn vinh", "thịnh vượng"],
    successMsg: "Đầy sinh khí thương nghiệp! Sức sầm uất tấp nập lôi kéo thêm hiệu ứng đám đông, thúc giục vạn đơn."
  },
  {
    id: "dich_vu_p1",
    topicId: "dich_vu",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Vận chuyển khôn ngoan thuật ngữ mượn bên bối dã chiến quân nhu binh vận <span class='text-cyan-500 font-bold'>\"hậu cần\"</span> vào câu văn hướng dẫn thiết tạo tiệc cưới dịch vụ cao sạn sang trọng:",
    placeholder: "Nhập đúng từ khóa 'hậu cần'...",
    answers: ["hậu cần", "đội hậu cần"],
    successMsg: "Ứng dụng rất đắt! Sự chuẩn bị hậu cần tỉ mỉ đằng sau hậu trường rực sáng thêu hoa dệt gấm cho thành tựu sự kiện lung linh."
  },
  {
    id: "dich_vu_p2",
    topicId: "dich_vu",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Di tản thuật ngữ thuộc sân khấu điện ảnh như <span class='text-cyan-500 font-bold'>\"kịch bản\"</span> áp vào quy chuẩn từng bước lời chào, cử chỉ khoa học của nhân sự khi đón đưa thượng lữ vô sảnh:",
    placeholder: "Nhập đúng từ khóa 'kịch bản'...",
    answers: ["kịch bản", "kịch bản dịch vụ", "kịch bản tư vấn"],
    successMsg: "Ý thức chuẩn hóa ưu việt! Thiết kế kịch bản giao thiệp tinh vi giúp giảm thiểu tuyệt đối sai lỗi vụng dại của nhân tố mới sinh."
  },
  {
    id: "dich_vu_e1",
    topicId: "dich_vu",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Cạo bóng rườm rà: Sửa câu tiêu đề lủng củng nhiều lỗ đen lặp từ: <span class='text-pink-500 font-bold'>\"Mọi nhân sự cần dốc toàn tâm tâm can hỗ trợ trợ giúp chữa lỗi hỏng hóc sự cố\"</span> thành cụm dứt khoát tối giản tinh tế:",
    placeholder: "Nhập cụm nén súc tích (ví dụ: Hỗ trợ khắc phục sự cố kĩ thuật)...",
    answers: ["hỗ trợ khắc phục sự cố", "khắc phục sự cố kĩ thuật", "xử lý sự cố", "khắc phục sự cố"],
    successMsg: "Tinh sạch vô biên! Văn phong gãy gọn trực diện giúp làm bớt đi sự rối trí của thượng khách đang bất an."
  },
  {
    id: "dich_vu_e2",
    topicId: "dich_vu",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Tước bỏ lặp danh: Sắp xếp gọn các từ đồng mục tiêu <span class='text-pink-500 font-bold'>\"các hóa đơn giấy tờ chứng từ ghi nợ nần\"</span> thành duy nhất một từ ghép toàn sắc trang nhã, bao quát luật pháp:",
    placeholder: "Nhập từ cô đọng chuẩn tài chính (ví dụ: chứng từ, hóa đơn)...",
    answers: ["chứng từ", "hóa đơn", "hóa đơn chứng từ", "hồ sơ tài chính"],
    successMsg: "Thừa nhận súc nén! Sự định danh 'chứng từ' chuẩn chỉ gạt bỏ tơ vương tranh chấp, chứng thực uy tín đôi bên sòng phẳng."
  },
  {
    id: "dich_vu_r1",
    topicId: "dich_vu",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo nghĩa thế thủ: Biến đổi cấu trúc quen thuộc của động từ kỹ nghệ <span class='text-indigo-500 font-bold'>\"VẬN HÀNH\"</span> thành biểu từ đảo âm tiết nhằm mở mang vận hội di chuyển linh hoạt:",
    placeholder: "Nhập từ khóa đảo ngược...",
    answers: ["hành vận"],
    successMsg: "Nhạy sắc thơ tài! 'Hành vận' toát lên nhịp hỷ xả chu lưu của cơ hội dệt nên vóc dáng thương đạo thanh nhã tự tại."
  },
  {
    id: "dich_vu_r2",
    topicId: "dich_vu",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo trật tự lề thói: Thay đổi vị trí hai chữ của thực danh lữ hành ứng xử <span class='text-indigo-500 font-bold'>\"TÁC PHONG\"</span> thành từ ghép đảo âm chỉ phong cốt hành vi dứt khoát:",
    placeholder: "Nhập từ nghịch biến đáo ứng...",
    answers: ["phong tác"],
    successMsg: "Ý niệm tinh ranh cổ phong! 'Phong tác' vừa toát khí chất hành sự rạch ròi vừa gợi thế chuyển động đẹp mắt."
  },
  {
    id: "dich_vu_q1",
    topicId: "dich_vu",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Trọng tâm triết lý của mô hình phụng sự tân tiến \"Lấy khách hàng làm trung tâm\" (Customer-Centric) hướng đến điều gì?",
    options: [
      "A. Gia tăng tần suất quảng đại dối gian",
      "B. Đồng thấu chân cảm nỗi đau, thấu hiểu khát khao thầm kín và dốc lòng kiến thiết tối ưu trải nghiệm khách",
      "C. Cố gắng dập các kênh phàn nàn của khách hàng nhanh nhất",
      "D. Đóng gói ép mua cưỡng bách các gói bổ trợ phi lý"
    ],
    correctIndex: 1,
    successMsg: "Tuyệt mỹ tôn vinh! Thấu ngộ nỗi sợ hãi thầm kín của khách giúp tạo dựng sự phụng sự bền vững muôn đời."
  },
  {
    id: "dich_vu_q2",
    topicId: "dich_vu",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Trong quản lý chất lượng dịch vụ vận chuyển, thuật ngữ \"SLA\" hướng tới cam kết điều cốt lõi nào?",
    options: [
      "A. Giảm giá trị hợp đồng khi có thiên tai khẩn hỏa",
      "B. Cam kết chuẩn mực chất lượng phản hồi hỗ trợ và thời gian vận hành chính xác rành mạch",
      "C. Miễn hoàn toàn trách nhiệm pháp lý khi thất thoát tài sản",
      "D. Kêu gọi vốn đầu tư công vụ từ ngân hàng mạo hiểm"
    ],
    correctIndex: 1,
    successMsg: "Sắc bén rạch ròi! SLA thiết lập chiếc cân công lý đo lường uy tin, giải phóng mọi ngờ vực ban đầu."
  },

  // ==========================================
  // TOPIC 4: moi_truong (Môi trường)
  // ==========================================
  {
    id: "moi_truong_s1",
    topicId: "moi_truong",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế từ ngữ thiếu sắc cảnh giác: Tìm một tự vệ động từ gợi tả sắc thái trực cảm nặng nề gớm ghiếc biến thế cho từ <span class='text-blue-500 font-bold'>\"ô nhiễm\"</span> khi miêu tả nước sông ngập ngụa nhựa:",
    placeholder: "Nhập động từ lột tả sắc tàn (ví dụ: vấy bẩn, vẩn đục, nhiễm độc, hoại tử)...",
    answers: ["vấy bẩn", "vẩn đục", "nhiễm độc", "nhiễm bẩn", "hoại tử"],
    successMsg: "Tâm lý rúng động! Trực cảm gớm ghiếc lay tỉnh lương năng, thôi thúc ý niệm thanh gột bảo trợ tự nhiên tức khắc."
  },
  {
    id: "moi_truong_s2",
    topicId: "moi_truong",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay vì nói lặp từ tẻ nhạt <span class='text-blue-500 font-bold'>\"thiên nhiên hoang dã tự nhiên\"</span>, hãy tìm một tính từ mô tả trọn vẹn trạng thái chưa bị bàn tay trần tục xâm chiếm cải tạo:",
    placeholder: "Nhập một tính từ cô đọng (ví dụ: nguyên sơ, hoang sơ, nguyên bản, cổ sơ)...",
    answers: ["nguyên sơ", "hoang sơ", "nguyên bản", "cổ sơ", "thuần khiết"],
    successMsg: "Chính xác tuyệt diệu! Nhãn từ 'nguyên sơ' trả lại cho rừng xanh tấm áo choàng tiên tổ uy nghi hùng vĩ."
  },
  {
    id: "moi_truong_s3",
    topicId: "moi_truong",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế danh từ: Bạn hãy nâng tầm cụm danh từ báo động thiên tai <span class='text-blue-500 font-bold'>\"bão to hạn hán khốc liệt\"</span> bằng duy nhất một đại danh từ chỉ các tác động xấu từ trời đất dội xuống:",
    placeholder: "Nhập từ khóa vĩ mô (ví dụ: thiên tai, biến động, tai ương khí hậu)...",
    answers: ["thiên tai", "tai ương", "biến động khí hậu", "tai kiếp"],
    successMsg: "Phán đoán sắc sảo! Thiên tai giáng họa thức tỉnh sự thích nghi dẻo bền và hạn chế ảo vọng kiểm soát vạn vật."
  },
  {
    id: "moi_truong_c1",
    topicId: "moi_truong",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Kết giao từ tố học thuật Hán Việt <span class='text-emerald-500 font-bold'>\"SINH THÁI\"</span> đi song hành cùng một tiếng sau bộc lộ tinh cốt toàn thể mạng rễ muôn loài che chở san sẻ sự sinh trưởng dập dờn:",
    placeholder: "Nhập từ hai tiếng (ví dụ: hệ sinh thái, khu sinh thái, cảnh quan sinh thái)...",
    answers: ["hệ sinh thái", "khu sinh thái", "cảnh quan sinh thái"],
    successMsg: "Liên mạch vạn sự! Vẽ nên 'hệ sinh thái' là thấu triệt sự nối liền huyền diệu giữa con sâu, lá cây với mạch ngầm đất cổ."
  },
  {
    id: "moi_truong_c2",
    topicId: "moi_truong",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Giao thoa sắc màu hành động: Ghép từ chỉ hoạt động bảo tồn sinh học tươi trẻ <span class='text-emerald-500 font-bold'>\"XANH\"</span> đứng đôi cùng danh từ chỉ động lượng phát triển đất nước vững chãi:",
    placeholder: "Nhập từ ghép ghép hai âm tiết học thuật (ví dụ: kinh tế xanh, tăng trưởng xanh, năng lượng xanh)...",
    answers: ["kinh tế xanh", "tăng trưởng xanh", "năng lượng xanh", "tiêu dùng xanh"],
    successMsg: "Thời cuộc bứt phá! Phối kết kinh tế xanh dọn sạch vết nhơ công khoa thô lậu, mở ngõ kỷ nguyên công nghệ hữu hòa."
  },
  {
    id: "moi_truong_c3",
    topicId: "moi_truong",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Tích tụ vạn tượng: Kết hợp âm tiết mẹ sự sống <span class='text-emerald-500 font-bold'>\"THỦY\"</span> kết giao cùng từ đứng sau bộc lộ chu kỳ chuyển luân chảy trôi không dứt của nguồn nước đất trời:",
    placeholder: "Nhập từ ghép chỉ sự lưu hồ (ví dụ: thủy triều, thủy trình, thủy văn, thủy hệ)...",
    answers: ["thủ triều", "thủy triều", "thủy văn", "thủy trình", "thủy hệ", "vòng tuần hoàn nước"],
    successMsg: "Dữ dội thơ ca! Thủy văn hay thủy triều hiển hóa cái đập nhịp mênh mông, huyền bí của đại dương dâng tràn."
  },
  {
    id: "moi_truong_a1",
    topicId: "moi_truong",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Adapt - Thích ứng bảo hiến: Thử gột rửa từ khóa đơn nôm <span class='text-teal-500 font-bold'>\"tiết kiệm củi lửa điện nước\"</span> thành một thuật ngữ học đường cao nhã, bắt kịp xu thế bảo vệ địa cầu:",
    placeholder: "Nhập cụm từ hiện đại biểu trưng (ví dụ: năng lượng tái tạo, tiêu dùng bền vững, tiêu dùng xanh)...",
    answers: ["tiêu dùng bền vững", "năng lượng tái tạo", "tiêu dùng xanh", "năng lượng xanh", "tiết kiệm năng lượng"],
    successMsg: "Sáng kiến bộc phát! Tiêu dùng bền vững bớt đi gánh nặng thô kiệt dồn lên vai các thế hệ chắt chiu mai sau."
  },
  {
    id: "moi_truong_a2",
    topicId: "moi_truong",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Gắn kết thích nghi dẻo dai: Nhào nặn từ nôm <span class='text-teal-500 font-bold'>\"sống dai dẳng trước bão lụt\"</span> thành một thuật ngữ đại diện cho khả năng thích ứng dẻo dai, hồi phục nhanh của hệ sinh quyển tự nhiên:",
    placeholder: "Nhập thuật ngữ sinh thái học (ví dụ: khả năng chống chịu, thích ứng dẻo dai, dẻo bền)...",
    answers: ["thích ứng khí hậu", "khả năng chống chịu", "tính chống chịu", "tính dẻo dai"],
    successMsg: "Vô cùng sắc bén! Phát triển tính chống chịu giúp quần quần sinh vật vượt ngõ hẹp tai kiếp đầy bản năng kiên cường."
  },
  {
    id: "moi_truong_a3",
    topicId: "moi_truong",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Hấp thụ thử thách sinh quyển: Thích ứng từ khóa thổ lí <span class='text-teal-500 font-bold'>\"nước bị pha nhiều muối biển\"</span> thành một thuật ngữ địa chất chỉ vấn nạn xâm lấn của đại dương nơi vựa lúa miền Tây:",
    placeholder: "Nhập đúng cụm từ địa chất đặc trưng (ví dụ: xâm nhập mặn, nhiễm mặn, triều mặn)...",
    answers: ["xâm nhập mặn", "nhiễm mặn", "triều cường nhiễm mặn"],
    successMsg: "Báo động nhạy cảm! Nhận thức tai nạn xâm nhập mặn giúp định hướng hành động lai tạo giống dẻo bền cứu nguy nền lúa gặt."
  },
  {
    id: "moi_truong_m1",
    topicId: "moi_truong",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify / Khuyếch trương cấp độ nhiệt: Nâng tầm báo động của hiện tượng mòn nhạt là <span class='text-rose-500 font-bold'>\"ấm lên\"</span> trong 'trái đất ấm lên' thành một trạng từ/mỹ từ chỉ sự thiêu đốt rực lửa đáng sợ:",
    placeholder: "Nhập từ ngữ thiêu rụi báo nguy cực độ (ví dụ: bùng cháy, thiêu đốt, cực đoan, nóng lên)...",
    answers: ["nóng lên", "thiêu đốt", "cực đoan", "biến đổi khí hậu"],
    successMsg: "Tâm lý dốc lòng! Sự thiêu đốt khí quyển đang kêu gọi ráo riết hành động xả bớt khí độc từ vạn nhà máy."
  },
  {
    id: "moi_truong_m2",
    topicId: "moi_truong",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Khuyếch trương cảnh trị lành ẩm: Sửa từ miêu tả cánh rừng thô thô là <span class='text-rose-500 font-bold'>\"rộng nhiều\"</span> thành đại ngã phong diễm ngợp ngắt tầm mắt phóng tít tắp, căng tràn sinh khí thở của đại ngàn xanh:",
    placeholder: "Nhập từ đại ngàn (ví dụ: ngút ngàn xanh, bạt ngàn xanh, ngút ngàn, đại ngàn vô tận)...",
    answers: ["ngút ngàn xanh", "bạt ngàn xanh", "ngút ngàn", "vô tận", "đại ngàn"],
    successMsg: "Trực giác hùng vĩ! Cánh rừng ngút ngàn xanh là thành trì linh liêng giữ nước, lọc bụi, đỡ che muôn loại sinh linh."
  },
  {
    id: "moi_truong_m3",
    topicId: "moi_truong",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Cường điệu hóa sự mô tả nguy tuyệt chủng: Nâng sắc cảnh nguy hoại của loài sinh vật hiếm từ từ rụt rè <span class='text-rose-500 font-bold'>\"gần hết rồi\"</span> thành thuật ngữ báo động đỏ danh giá tuyệt đường tồn lập:",
    placeholder: "Nhập thuật ngữ sách đỏ lâm nguy (ví dụ: nguy cấp, đe dọa trực diện, tuyệt chủng)...",
    answers: ["tuyệt chủng", "nguy cấp", "đứng trước bờ vực tuyệt chủng", "lâm nguy cực kỳ cấp cận"],
    successMsg: "Quyết định nhân ái! Cứu lấy những thực thể đứng trước bờ vực tuyệt chủng để giữ vẹn nhịp cân đối trường tồn san sẻ sự sống địa quyển."
  },
  {
    id: "moi_truong_p1",
    topicId: "moi_truong",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Lôi cuốn di chuyển thuật ngữ thuộc phòng chăm sóc lâm sàng cứu mạng y đức <span class='text-cyan-500 font-bold'>\"hồi sức\"</span> đặt lên câu cảm nhân phục hưng những dải san hô chết rụi do triều mặn khí quyển:",
    placeholder: "Nhập đúng từ khóa 'hồi sức' để kiểm tra bối biến đổi nghệ thuật...",
    answers: ["hồi sức", "sự hồi sức", "đang hồi sức"],
    successMsg: "Ý niệm thi họa nhân sinh! Hồi sức cho san hô biển là nỗ lực gom mộng cho mẹ đại dương xanh dạt dào sinh năng lộng lẫy."
  },
  {
    id: "moi_truong_p2",
    topicId: "moi_truong",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Mang từ khóa thuộc pháp luật là <span class='text-cyan-500 font-bold'>\"quyền công dân\"</span> ghép ứng trong câu văn tuyên xưng vị thế thiêng liêng của một sinh thể tự nhiên như cỏ cây, muông thú có quyền sống sinh trưởng yên bình vô hạn:",
    placeholder: "Nhập đúng ba chữ 'quyền tự nhiên' hay 'quyền sinh tồn'...",
    answers: ["quyền tự nhiên", "quyền sinh tồn", "quyền thiên nhiên"],
    successMsg: "Quá vinh quang triết học! Bảo hộ quyền sinh tồn của muông thú thể hiện một tầm vóc nhân bản thượng thừa bớt đi vị kỷ giống nanh loài người."
  },
  {
    id: "moi_truong_e1",
    topicId: "moi_truong",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Thiết lập súc nén tối tối thượng: Thanh giảm lời hú gọi dài rậm đen sau: <span class='text-pink-500 font-bold'>\"Tất thảy chúng ta ở đây vô cùng rất cần thiết phải đồng lo dọn sạch sẽ hết rác bẩn\"</span> thành khẩu hiệu tinh gọn mác-két-tinh dứt khoát hữu ái:",
    placeholder: "Nhập khẩu gọn nhất (ví dụ: hãy dọn sạch rác, chung tay dọn sạch rác, dọn rác cứu trái đất)...",
    answers: ["hãy dọn sạch rác", "chung tay dọn sạch rác", "dọn rác", "hành động vì môi trường"],
    successMsg: "Hiệu quả tức tốc! Lời hiệu lực súc gọn có sức truyền năng năng lượng đánh thúc muôn bàn tay lao xao ngay tắp lự."
  },
  {
    id: "moi_truong_e2",
    topicId: "moi_truong",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Tiệt trừ phụ lặp: Hãy nén cụm <span class='text-pink-500 font-bold'>\"các loại khí dơ hơi độc thải hư hại thoát ra từ ống pô nung\"</span> thành duy nhất một từ ghép hai chữ có tính chất khoa học, đại diện toàn quyền:",
    placeholder: "Nhập từ chỉ khí ô nhiễm (ví dụ: khí thải, khói thải, khí dơ)...",
    answers: ["khí thải", "khói thải", "khí dơ"],
    successMsg: "Xác thực khoa học! Định lượng chính xác dòng khí thải giúp xã hội kiểm thắt khí CO2 hướng về mốc Net Zero vinh quang."
  },
  {
    id: "moi_truong_r1",
    topicId: "moi_truong",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo ngược trật tự không gian: Hãy xoay đổi vị thế hai chữ của danh từ bao hộ vây quanh sinh sinh là từ <span class='text-indigo-500 font-bold'>\"MÔI TRƯỜNG\"</span> để mở ra từ cổ chỉ trường lực dung mộc:",
    placeholder: "Nhập biến điệu âm tiết nghịch đảo...",
    answers: ["trường môi"],
    successMsg: "Ẩn tàng triết ý! 'Trường môi' thấu gợi ý niệm về một trường năng lượng mỡ màu nuôi nấng bảo toàn linh khí thiên nhiên."
  },
  {
    id: "moi_truong_r2",
    topicId: "moi_truong",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo nhịp chảy: Hãy đảo ngược vị trí hai tiếng của từ ghép <span class='text-indigo-500 font-bold'>\"TUẦN HOÀN\"</span> để tái ngụ ý trạng thái quay lộn thâm trầm vĩnh hằng của tạo hóa dệt rễ mầm xanh mướt mát:",
    placeholder: "Nhập từ khóa nghịch đảo âm môn...",
    answers: ["hoàn tuần"],
    successMsg: "Thơ mộng kỳ khôi! Trạng thái hoàn tuần đưa nhựa sống chảy trôi rồi lại dội về bất tận giữa thâm u đất cổ đất thiêng."
  },
  {
    id: "moi_truong_q1",
    topicId: "moi_truong",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Khái niệm khoa học \"Đa dạng sinh học\" (Biodiversity) được định nghĩa đầy đủ nhất bằng bối cảnh nào?",
    options: [
      "A. Việc độc canh rầm rộ duy nhất loài bạch đàn cao sản phủ xanh đồi trọc",
      "B. Sự chung sống phong phú, tự do và kết nối ổn định của muôn loài sinh vật, thực vật quý hiếm trong một hệ thống sinh cảnh tự tại",
      "C. Việc dọn sạch san hô để xây dựng cảng tránh bão cho ngư lữ lười biếng",
      "D. Đưa máy bay phun hóa chất diệt cỏ rậm rì phủ địa đới"
    ],
    correctIndex: 1,
    successMsg: "Hoàn hảo nhân sinh! Đa dạng bản sinh giữ sợi dây liên liên tương ngộ thông dòng bền lâu nuôi dưỡng muôn đời đời sinh dưỡng."
  },
  {
    id: "moi_truong_q2",
    topicId: "moi_truong",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Hiện tượng địa chất cực hại nào phát khởi to lớn bởi việc xói lở vùng rừng nguồn dặc dải khi bão lũ ập xuống?",
    options: [
      "A. Sương lam khói núi phủ che",
      "B. Lũ quét khủng khiếp kèm sạt lở bùn đất thảm khốc",
      "C. Đầm lầy mặn xâm lân nông trang lúa chín",
      "D. Hiện tượng vân hải rực rỡ nắng vàng"
    ],
    correctIndex: 1,
    successMsg: "Yên chí chuẩn xác! Sạt lở bùn đá tàn phá thảm khốc nhắc nhở ta tầm quan trọng tối vĩ của việc trồng rễ đan xen bảo vệ rừng đầu nguồn."
  },

  // ==========================================
  // TOPIC 5: giao_duc (Giáo dục)
  // ==========================================
  {
    id: "giao_duc_s1",
    topicId: "giao_duc",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế ngôn từ thô sơ bản năng: Tìm cụm danh từ chuyên nghiệp, lịch tiệp thế cho cụm <span class='text-blue-500 font-bold'>\"soạn cụ thể bài học để giảng\"</span> nhằm tôn vinh đức tin học thuật chuyên nghiệp:",
    placeholder: "Nhập một thuật ngữ học đường (ví dụ: soạn giáo án, biên soạn bài giảng, thiết kế bài học)...",
    answers: ["soạn giáo án", "biên soạn bài giảng", "thiết kế giáo án", "thiết kế bài học"],
    successMsg: "Tuyệt đỉnh! Soạn giáo án chính là thiết thảo hành trình tri thức dẫn dắt tâm hồn học trò qua vạn bậc tinh hoa."
  },
  {
    id: "giao_duc_s2",
    topicId: "giao_duc",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế nhãn sự kiện học đường: Nhào nặn cụm từ sinh hoạt nôm sơ <span class='text-blue-500 font-bold'>\"học sinh đi học lại sau hè\"</span> thành đại mỹ tự cổ kính tưng bừng lòng hỷ hân hoa phượng rộn ràng:",
    placeholder: "Nhập một động từ trang kính (ví dụ: tựu trường, khai giảng, nhập học)...",
    answers: ["tựu trường", "khai giảng", "nhập học"],
    successMsg: "Sắc màu rực rỡ! Ngày tựu trường thắp lên động năng dấn bước của bao tâm hồn non tơ thèm hương mực giấy mới."
  },
  {
    id: "giao_duc_s3",
    topicId: "giao_duc",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế danh hào: Nâng cấp cách gọi thông tục <span class='text-blue-500 font-bold'>\"thầy cô giáo dạy nhiều năm rồi\"</span> thành một mỹ xưng tôn kính cao quý tri ân bậc hiến thân thầm lặng suốt cuộc đời:",
    placeholder: "Nhập một danh từ tôn kính (ví dụ: nhà giáo ưu tú, bực hiền sư, người dẫn lộ rực lãng)...",
    answers: ["nhà giáo ưu tú", "nhà giáo nhân dân", "bậc hiền sư", "người thầy ưu tú"],
    successMsg: "Kính ái dào dạt! Bậc giáo đức nhân văn là nguồn sáng gieo hy ước vạn năm giữ vẹn mạch học học vô tận."
  },
  {
    id: "giao_duc_c1",
    topicId: "giao_duc",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Kết hợp từ tố gốc danh khoa cử <span class='text-emerald-500 font-bold'>\"SINH\"</span> (người học) ghép một chữ chỉ vị thế thử thách đầy dũng lực đối đầu để ứng thị ngôi trạng vị thi bảng:",
    placeholder: "Nhập từ hai chữ (ví dụ: thí sinh, tuyển sinh, giáo sinh)...",
    answers: ["thí sinh", "tuyển sinh", "giáo sinh"],
    successMsg: "Tâm thế oai nghiêm! Thí sinh gánh vác khát khao lập đức đạt ngôn hiển danh chốn học hiệu."
  },
  {
    id: "giao_duc_c2",
    topicId: "giao_duc",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Giao sáp học giới: Ghép từ chỉ hoạt động tiếp thu học hỏi <span class='text-emerald-500 font-bold'>\"HỌC\"</span> đi đôi đan cài từ chỉ nền nếp khuôn mẫu bao bọc rực lịch bính tôn nghiêm:",
    placeholder: "Nhập từ ghép hai tiếng tôn quý (ví dụ: học đường, học học, học hiệu, học giới)...",
    answers: ["học đường", "học hiệu", "học học", "học phong", "học thuật"],
    successMsg: "Cực kỳ chuẩn xác! Nơi học đường thắp sáng đức tin hiền tế, dung dưỡng trí lực, bớt đi vị dục thắp sáng thiện lương."
  },
  {
    id: "giao_duc_c3",
    topicId: "giao_duc",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Kết đôi lý luận bản chất: Kết hợp âm tố chỉ nỗ lực trao truyền <span class='text-emerald-500 font-bold'>\"GIÁO\"</span> san sáp cùng từ tố chỉ quá trình rèn đúc nhân tài dẻo dai bộc bách hiển lộ tinh diễm:",
    placeholder: "Nhập từ hai chữ quen thuộc nhất...",
    answers: ["giáo dục"],
    successMsg: "Khải huyền vinh quang! Sứ mạng của hai chữ 'giáo dục' đỉnh đỉnh là giải thoát xiềng xích ngu tối, rèn năng khả biến đổi nhân tinh xã hội."
  },
  {
    id: "giao_duc_a1",
    topicId: "giao_duc",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Adapt - Thích ứng tân lý học đường: Tìm cách chuyển biến lối học tập cổ hủ nặng gánh <span class='text-teal-500 font-bold'>\"nhồi sọ học thuộc\"</span> thành một thuật ngữ hiện đại thể thể hiện tính tự cường tư duy tìm kiếm khám phá báu thư của học sinh tuyển sinh:",
    placeholder: "Nhập cụm từ chỉ hoạt động tiến bộ (ví dụ: tự học tự chất vấn, học chủ động, tự chủ học thuật)...",
    answers: ["học tập chủ động", "tự học", "học chủ động", "đổi mới giáo dục", "tự chủ học thuật"],
    successMsg: "Ưu tú vượt bậc! Lấy thế 'học tập chủ động' làm sao biến người học thành chiến binh dũng mãnh, điêu luyện giải quyết vạn bài toán lớn."
  },
  {
    id: "giao_duc_a2",
    topicId: "giao_duc",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Thích ứng công cụ tương lai: Nhào nặn thuật chỉ vật thể trung gian <span class='text-teal-500 font-bold'>\"sách vở bài tập bình thường\"</span> thành cụm thuật học số hóa đám mây liên thông vượt tầm biên thùy địa giới:",
    placeholder: "Nhập cụm từ số học hiện đại (ví dụ: học liệu số, sách số, học trực tuyến)...",
    answers: ["học liệu số", "sách điện tử", " bài giảng trực tuyến", "học liệu"],
    successMsg: "Đột phá ngoạn mục! Học liệu số giải phòng sức nặng vai học sinh, cho phép tiếp rọi mỏ quặng kho tàng tinh túy tức thời."
  },
  {
    id: "giao_duc_a3",
    topicId: "giao_duc",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Thích nghi khảo thí công minh: Biến dải chữ <span class='text-teal-500 font-bold'>\"chấm điểm qua loa\"</span> thành một thuật ngữ trang trọng minh chứng quy trình phân định chất lực học trò khoa học khách quan:",
    placeholder: "Nhập một cụm từ chuyên môn (ví dụ: kiểm tra đánh giá, đánh giá năng lực, khảo thí)...",
    answers: ["kiểm tra đánh giá", "đánh giá năng lực", "khảo thí", "thẩm định chất học"],
    successMsg: "Cực kỳ chuẩn xác! Đánh giá năng lực đa dạng chiều kích giải phóng học sỹ khỏi những cuộc đua điểm số khô khan vô bổ."
  },
  {
    id: "giao_duc_m1",
    topicId: "giao_duc",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Khuyếch trương danh giá trường thi: Sắp xếp định nghĩa cho cụm từ <span class='text-rose-500 font-bold'>\"trường đạt đánh giá dạy tốt\"</span> dồn đúc thành một danh xưng cao nhã chuyên lý có sức nặng chứng thế bậc nhất nước nhà:",
    placeholder: "Nhập một từ chỉ quy chuẩn kiểm định (ví dụ: đạt chuẩn quốc gia, trường đạt chuẩn quốc gia)...",
    answers: ["đạt chuẩn quốc gia", "trường chuẩn quốc gia", " kiểm định giáo án chuẩn"],
    successMsg: "Rất vinh hạnh! Ngôi học hiệu trường chuẩn quốc gia bảo chứng cho môi dưỡng rèn tài hiền, chắt chiu vạn ước mơ nở hoa rực mộng."
  },
  {
    id: "giao_duc_m2",
    topicId: "giao_duc",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify / Khuyếch trương trí lực hiền tài: Thay thế tính từ trí não <span class='text-rose-500 font-bold'>\"học thuộc lòng tốt\"</span> thành mỹ từ biểu trưng bối cảnh tư duy thấu cốt, am sâu thấu chạm cốt lõi uyên bác nhất:",
    placeholder: "Nhập thâm cổ từ phẩm (ví dụ: uyên bác, thông tuệ, trí dũng, xuất chúng)...",
    answers: ["uyên bác", "thông tuệ", "trí dũng", "xuất chúng"],
    successMsg: "Cực kỳ tôn tôn nhã! Tinh thần uyên bác kích hoạt trí tò mò ngàn năm đi sâu dặc dài dấn thân cống hiến cho học học nhân loại."
  },
  {
    id: "giao_duc_m3",
    topicId: "giao_duc",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Thể nghiệm phóng vĩ quy mô đại học: Hãy nâng tầm mục tiêu của việc giảng bài đơn lập từ cụm <span class='text-rose-500 font-bold'>\"biết làm mấy chữ\"</span> thành triết học hành động làm nổi bật vai trò công dân lớn khôn sẵn sàng bước ra thế giới sải cánh rộng rạng:",
    placeholder: "Nhập định đới từ thế giới (ví dụ: hội nhập quốc tế, phát triển toàn diện)...",
    answers: ["hội nhập quốc tế", "phát triển toàn diện", "công dân toàn cầu"],
    successMsg: "Vĩ mô tráng chí! Định hướng trở thành công dân toàn cầu chấn hưng vị thế tinh hoa sơn hà Việt Nam trên bản đồ trí thuật."
  },
  {
    id: "giao_duc_p1",
    topicId: "giao_duc",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Lôi cuốn di chuyển thuật ngữ cơ học vật lý truyền hạt <span class='text-cyan-500 font-bold'>\"gia tốc\"</span> dệt thành câu rực lửa nói chung về động lực tìm dồi bồi đắp tri kiến khoa bảng của thanh niên:",
    placeholder: "Nhập đúng từ 'gia tốc' để kết cấu cảm xướng...",
    answers: ["gia tốc", "gia tốc tri thức"],
    successMsg: "Cực kỳ sáng tạo! Sức gia tốc của tri tri giúp vạch lập tương lai bứt phá, cắt bỏ gông xích thủ cựu chắp cánh ván dặm hành trình lớn dậy."
  },
  {
    id: "giao_duc_p2",
    topicId: "giao_duc",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Chuyển ý từ đo đạc áp suất kỹ thuật răn <span class='text-cyan-500 font-bold'>\"áp lực đẩy hạt\"</span> mang ứng dụng tả sức ép lớn vùn vụt từ thi thố, vọng của học đường dội lên học sinh tinh tế:",
    placeholder: "Nhập chuẩn từ khóa 'áp lực'...",
    answers: ["áp lực", "áp lực học tập", "áp lực thi cử"],
    successMsg: "Sắc sảo tâm lý học! Hòa chuyển áp lực thành động lực chưng cất nên bản lĩnh kiên cường vươn cao bái rợp vinh hoa."
  },
  {
    id: "giao_duc_e1",
    topicId: "giao_duc",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Cô đọng súc tích tính học: Rút lại đoạn rườm rà lặp rậm <span class='text-pink-500 font-bold'>\"lê đôi chân đi lặp từng niên chế thời khóa hết bài kiểm tra gom cộng lại các ngày học đã dồn tụ\"</span> thành duy nhất từ thuật toán hai tiếng học tập:",
    placeholder: "Nhập một mộc từ (ví dụ: cộng dồn, tích lũy, tích tụ)...",
    answers: ["cộng dồn", "tích lũy", "tổng kết", "tích tụ"],
    successMsg: "Thăng hoa súc nén! Giá trị 'tích lũy' bồi đắp báu thư tri thức theo từng ngày gượng công cho tới ngày rực hỷ vinh danh."
  },
  {
    id: "giao_duc_e2",
    topicId: "giao_duc",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Cắt bỏ lặp biểu cảm: Khuyên giảm cụm từ lặp gượng rạc bóng <span class='text-pink-500 font-bold'>\"Các lối phương pháp gượng tột bục học cách ép dạy\"</span> thành từ ghép gọn nhất phản ánh lối thiết thảo rèn luyện tự nhiên phi bách ép:",
    placeholder: "Nhập cụm từ súc sắc (ví dụ: tự học, tự đào tạo, tự giác)...",
    answers: ["tự học", "tự đào tạo", "tự giác"],
    successMsg: "Ưu thế súc tích! Sự tự học giải giải phóng năng năng cốt vương khảm đầy tiềm tàng oai dũng khai mỏ tri kiến."
  },
  {
    id: "giao_duc_r1",
    topicId: "giao_duc",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo vị thế sư đạo tôn đức: Hãy nghịch biến cấu trúc của từ ghép có vị thể sừng sững bệ phóng nhân học là <span class='text-indigo-500 font-bold'>\"SƯ PHẠM\"</span> để hé nhìn vẻ đẹp đạo đức chuẩn chỉ lâu dòng của nghệ thuật dạy hành bảo rèn:",
    placeholder: "Nhập từ khóa đảo ngược...",
    answers: ["phạm sư"],
    successMsg: "Lý thú thi ca vạn năm! 'Phạm sư' cổ rực rỡ tượng trưng bọc bách của khuôn vàng thước ngọc đức thiện tài học của người cầm lối rọi sáng giang hà."
  },
  {
    id: "giao_duc_r2",
    topicId: "giao_duc",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo lộn tri giác: Đảo vị thế hai tiếng của danh từ biểu thị tư học và năng hành là từ <span class='text-indigo-500 font-bold'>\"TRI THỨC\"</span> thành từ cổ phản ánh sự hiếu kỳ của ý niệm nhìn thấu tỏ rỏ sinh linh:",
    placeholder: "Nhập âm nghịch biến đáo...",
    answers: ["thức tri"],
    successMsg: "Khí lượng thâm vi! 'Thức tri' dẫn dắt cái nhìn thấu đáo vượt ngoài khuôn mẫu chữ nghĩa định dạng nhạt mòn rập khuôn."
  },
  {
    id: "giao_duc_q1",
    topicId: "giao_duc",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Quan điểm giáo dục hiện đại tiên phong của phương pháp dạy \"Tích hợp\" (Integrated Learning) là thế nào?",
    options: [
      "A. Đứng tách bạch cô lập từng chuyên môn, học chép nộp bài",
      "B. Phá vỡ biên cương của từng môn học đơn độc, tạo dựng dòng chảy gắn kết mật thiết đa ngành tương hỗ thế đạo",
      "C. Tắt mọi hoạt động ngoại thi ứng thực địa",
      "D. Cho phép tuyển dụng giáo sinh bừa bãi khi chưa thẩm lực chuẩn sư"
    ],
    correctIndex: 1,
    successMsg: "Chính xác vẻ vang! Tiếp rọi tư duy tích hợp đa chiều khai thông góc nhìn toàn thể minh minh của con trẻ bước ra trường lớn."
  },
  {
    id: "giao_duc_q2",
    topicId: "giao_duc",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Theo quy chuẩn thẩm giám thế kỷ mới, kỹ năng cốt yếu nào nâng đỡ năng lực kiến thiết bản sinh của học sỹ?",
    options: [
      "A. Học thuộc mọi đáp án mẫu rập rập",
      "B. Tư duy phản biện, kỹ năng đồng cảm, giải quyết vấn đề thực sinh và năng lực tự học dẻo dai",
      "C. Ép rập khuôn suy niệm theo lời tiền bối duy nhất",
      "D. Đi thi lấy trạng điểm cao bằng mọi ngã"
    ],
    correctIndex: 1,
    successMsg: "Tuyệt hảo vinh danh! Tư duy tự chủ phản biện dọn sạch định kiến nhạt mòn đưa con người bước chân vào nếp sống khai mở thực chất."
  },

  // ==========================================
  // TOPIC 6: viec_lam (Việc làm)
  // ==========================================
  {
    id: "viec_lam_s1",
    topicId: "viec_lam",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế từ vựng nôm sơ: Chuyển cụm thô dân <span class='text-blue-500 font-bold'>\"đăng bài gọi người vào làm việc\"</span> thành cụm từ ghép Hán Việt cao ngôn sang trọng biểu sắc thái cầu hiền sĩ của doanh nghiệp lớn:",
    placeholder: "Nhập một cụm từ (ví dụ: tuyển dụng nhân sự, chiêu mộ nhân tài, thu hút tài năng)...",
    answers: ["tuyển dụng nhân sự", "chiêu mộ nhân tài", "thu hút tài năng", "tuyển dụng", "chiêu mộ"],
    successMsg: "Cực kỳ chuẩn mực! 'Chiêu mộ nhân tài' biểu thị sự trân trọng chân thành đối với chất xám và năng khí của hiền sĩ."
  },
  {
    id: "viec_lam_s2",
    topicId: "viec_lam",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế nhãn danh thu nhập: Thay từ ngữ có sắc mộc mạc <span class='text-blue-500 font-bold'>\"tiền lương công ngày\"</span> thành từ Hán Việt biểu thị bổng lộc trang kính, đãi ngộ vinh hoa tương xứng hiến công:",
    placeholder: "Nhập từ chỉ đãi đãi ngộ (ví dụ: thù lao, bổng lộc, phụ cấp, đãi ngộ)...",
    answers: ["thù lao", "bổng lộc", "phụ cấp", "đãi ngộ", "lương bổng"],
    successMsg: "Bảo toàn vị thế hiển vinh! Đắp bồi hệ thù lao đãi ngộ tương sứng giải phóng sức trẻ sáng tạo rực rỡ không mệt mỏi."
  },
  {
    id: "viec_lam_s3",
    topicId: "viec_lam",
    format: "input",
    typeCode: "S",
    typeLabel: "S - Thay thế (Substitute)",
    question: "Thay thế động từ: Tìm một từ ghép chuyên lý trang trọng thế vị cho từ khẩu ngữ có phần sỗ sàng <span class='text-blue-500 font-bold'>\"đuổi bớt nhân sự hàng loạt\"</span> nhằm xoa dịu tổn thương nhân văn:",
    placeholder: "Nhập thuật quản trị (ví dụ: tinh giản biên chế, cắt giảm nhân sự, tái cấu trúc nhân sự)...",
    answers: ["tinh giản biên chế", "cắt giảm nhân sự", "tái cấu trúc nhân sự"],
    successMsg: "Văn hóa quản trị ưu tú! Sự 'tinh giản biên chế' vừa đảm bảo sinh tồn của tổ chức vừa bảo lưu danh vị cho người dời bước."
  },
  {
    id: "viec_lam_c1",
    topicId: "viec_lam",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Kết hợp từ chỉ hoạt động sản sinh cống hiến tôn quý <span class='text-emerald-500 font-bold'>\"LAO ĐỘNG\"</span> ghép sáp cùng một từ trước nó nhằm ám chỉ toàn quần động năng con người đóng góp sức mình dệt gấm thặng dư sơn hà:",
    placeholder: "Nhập cụm từ ghép hai/ba tiếng (ví dụ: lực lượng lao động, người lao động, thị trường lao động)...",
    answers: ["lực lượng lao động", "người lao động", "thị trường lao động", "sức lao động"],
    successMsg: "Tuyệt hảo! Lực lượng lao động dồi dào, sắc bén là rường cột kiến tạo tương lai cất cánh cho giang sơn đất rộng."
  },
  {
    id: "viec_lam_c2",
    topicId: "viec_lam",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Phối ghép quản năng: Kết hợp từ gốc đầu lập ước mưu trí <span class='text-emerald-500 font-bold'>\"HOẠCH\"</span> đi liền cùng từ biểu thị lối điều chỉnh rạch ròi đường đi nước bước thăng quang lâu dài của doanh xí nghiệp:",
    placeholder: "Nhập từ hai từ (ví dụ: hoạch định, kế hoạch, quy hoạch)...",
    answers: ["hoạch định", "kế hoạch", "quy hoạch"],
    successMsg: "Trọng tài lý luận! Hoạch định chiến lược thông suốt bớt đi vạn dặm quanh co phí tổn sinh lực của cả hệ thống."
  },
  {
    id: "viec_lam_c3",
    topicId: "viec_lam",
    format: "input",
    typeCode: "C",
    typeLabel: "C - Kết hợp (Combine)",
    question: "Kết đôi nguồn báu: Kết hợp từ tố gốc <span class='text-emerald-500 font-bold'>\"NHÂN\"</span> (con người) đứng vai cùng âm chỉ của cải tiềm ẩn tối ưu <span class='text-emerald-500 font-bold'>\"LỰC\"</span> nhằm xây dựng lực lượng nòng cốt:",
    placeholder: "Nhập từ ghép hai chữ phổ thông nhất...",
    answers: ["nhân lực", "nguồn nhân lực"],
    successMsg: "Hòa vinh báu địa! Quản trị nguồn nhân lực khéo léo bộc khai mỏ sinh năng khổng lồ đưa doanh nghiệp thăng ngôi báu thị trường."
  },
  {
    id: "viec_lam_a1",
    topicId: "viec_lam",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Adapt - Thích nghi đổi mới văn phòng: Chuyển hóa thói quen cũ kỹ từ cụm <span class='text-teal-500 font-bold'>\"mài mặt tại cơ quan từ sáng đến khuya\"</span> thành lối làm việc công nghệ linh hoạt tiên phong kỷ nguyên số hóa:",
    placeholder: "Nhập một thuật ngữ nghề (ví dụ: làm việc từ xa, văn phòng số, làm việc kết hợp)...",
    answers: ["làm việc từ xa", "làm việc kết hợp", " văn phòng ảo", "làm việc online"],
    successMsg: "Cực kỳ thời thượng! Sáng kiến làm việc từ xa giải phóng thời lượng mỏi mệt tàu xe, khơi dậy tinh sáng tạo phóng dật tối đa."
  },
  {
    id: "viec_lam_a2",
    topicId: "viec_lam",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Thích ứng hồ sơ tài danh: Thay thế nhãn thư mang sắc học sinh như <span class='text-teal-500 font-bold'>\"bản báo cáo kết quả cá nhân\"</span> thành thuật ngữ sang trọng trình năng của hiền khách ứng tuyển gõ cửa vinh hoa:",
    placeholder: "Nhập thuật ngữ kinh tế (ví dụ: hồ sơ năng lực, sơ yếu lý lịch, CV chuyên nghiệp)...",
    answers: ["hồ sơ năng lực", "sơ yếu lý lịch", "hồ sơ ứng tuyển", "portfolio", "cv"],
    successMsg: "Chuẩn phẩm sành sõi! Thiết kế hồ sơ năng lực diễm lệ, sắc cấu rõ rệt là chìa khóa vàng khơi mở cánh cổng quyền uy bổng lộc."
  },
  {
    id: "viec_lam_a3",
    topicId: "viec_lam",
    format: "input",
    typeCode: "A",
    typeLabel: "A - Thích nghi (Adapt)",
    question: "Thích nghi thâu nhập báu thư: Để thích ứng với lối tuyển dụng nhân văn thời đại AI, hãy biến chuyển từ khóa mang sắc lạnh lùng <span class='text-teal-500 font-bold'>\"kiểm tra khuyết điểm cũ\"</span> thành hành vi nhân đạo, tìm kiếm sự phát triển đồng hành:",
    placeholder: "Nhập cụm từ (ví dụ: đánh giá hiệu suất, đánh giá năng lực, tham vấn sự nghiệp)...",
    answers: ["đánh giá hiệu suất", "đánh giá năng lực", "tham vấn sự nghiệp"],
    successMsg: "Tâm lý dốc lòng! Ý văn tiến bộ gieo niềm an lòng hiến công bồi đắp văn hóa một lòng trung trinh phụng sự."
  },
  {
    id: "viec_lam_m1",
    topicId: "viec_lam",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Cường điệu năng suất: Sửa từ chỉ cường mức bận bịu <span class='text-rose-500 font-bold'>\"làm việc tốn thời gian ra sản phẩm\"</span> thành từ quản trị đo lường hiệu năng thặng dư sắc sảo nhất:",
    placeholder: "Nhập từ đo đạc đắt đỏ (ví dụ: năng suất lao động, hiệu suất lao động, hiệu suất công việc)...",
    answers: ["năng suất lao động", "hiệu suất lao động", "hiệu suất công việc", "hiệu năng công việc"],
    successMsg: "Xác đáng vô song! Đo đạc năng suất lao động khoa học giải phóng con người khỏi lối thiêu sinh lực bừa bãi không hồi hướng."
  },
  {
    id: "viec_lam_m2",
    topicId: "viec_lam",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify - Khuyếch trương tinh thần hào sảng: Thay đổi sắc thái từ <span class='text-rose-500 font-bold'>\"bận tối mắt tối mũi vì việc\"</span> thành tính từ chỉ tinh thần xông pha dốc lực oai hùng của chiến binh cống hiến doanh thương phi thường:",
    placeholder: "Nhập mỹ từ xả thân quý giá (ví dụ: tất bật, quả cảm cống hiến, tràn trề động lực, bền bỉ)...",
    answers: ["tất bật", "bền bỉ", "tỏa sáng", "nỗ lực hết mình", "cống hiến hết mình"],
    successMsg: "Khí khái vinh thăng! Sự bền bỉ dấn bước gặt về mâm vàng quả ngọt, xây dắp đỉnh tháp sự nghiệp chói ngời."
  },
  {
    id: "viec_lam_m3",
    topicId: "viec_lam",
    format: "input",
    typeCode: "M",
    typeLabel: "M - Sửa đổi / Khuyếch đại (Modify)",
    question: "Modify / Khuyếch trương quy mô đãi ngộ: Hãy sửa đổi từ <span class='text-rose-500 font-bold'>\"phát chút ít lương thưởng\"</span> thành thuật quy tổng đãi thế hệ mới phản ánh toàn diện vinh hoa hạnh phúc tinh thần lẫn vật chất người hiến cống:",
    placeholder: "Nhập cụm từ quản trị phúc lợi (ví dụ: tổng đãi ngộ, chế độ phúc lợi, đãi ngộ toàn diện)...",
    answers: ["chế độ phúc lợi", "tổng đãi ngộ", "đãi ngộ toàn diện", "phúc lợi xã hội"],
    successMsg: "Giải pháp nhân ái xuất chúng! Đắp xây một chế độ phúc lợi tối vi đưa doanh nghiệp lên nấc thánh địa quy tụ hiền sĩ láng du giang hồ."
  },
  {
    id: "viec_lam_p1",
    topicId: "viec_lam",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Lôi cuốn đem từ gốc mang sắc nghệ thuật tạo hình hội họa là <span class='text-cyan-500 font-bold'>\"phác thảo\"</span> lồng tinh vi vào câu văn định vị các hoài ước lớn, mốc thăng thế con lộ công danh mai sau:",
    placeholder: "Nhập từ khóa 'phác thảo' để kiểm tra bối cảnh định dạng...",
    answers: ["phác thảo", "phác thảo tương lai", "bản phác thảo"],
    successMsg: "Quá diệu hợp thi họa! Phác thảo bản đồ sự nghiệp giúp ta bớt đi sợ hãi mịt mùng khi đối bóng cùng mây gió cuộc đời."
  },
  {
    id: "viec_lam_p2",
    topicId: "viec_lam",
    format: "input",
    typeCode: "P",
    typeLabel: "P - Đa dạng bối cảnh (Put to other uses)",
    question: "Put to other uses: Chuyển làn danh từ nông thổ chăm trồng cây lúa <span class='text-cyan-500 font-bold'>\"vun xới\"</span> lồng khéo trong câu văn miêu tả nỗ lực đắp bồi, thêu hoa bảo hộ văn cốt doanh thương tôn kính dẻo bền:",
    placeholder: "Nhập đúng từ khóa 'vun xới'...",
    answers: ["vun xới", "vun xới văn hóa", "đang vun xới"],
    successMsg: "Ý vị thâm cổ! Vun xới mảnh đất văn hóa doanh nghiệp giữ kết nối chặt bền giữa ngàn trái tim hiền cống thắp lửa một nhà."
  },
  {
    id: "viec_lam_e1",
    topicId: "viec_lam",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Cô đọng tối giản ngôn hành: Cạo sạch các từ lặp nghĩa rề rà sáo mòn của dải chữ sau: <span class='text-pink-500 font-bold'>\"Ý chí có tinh tinh dốc sức hết mình làm cố chết bất kể đêm đêm ngày vắng cực nhọc dặc dài vất vả\"</span> thành cụm bốn chữ Hán Việt quý giá nhất:",
    placeholder: "Nhập bốn chữ Hán Việt tinh anh (ví dụ: tận tụy công việc, tận tâm cống hiến, xả thân cống hiến)...",
    answers: ["tận tụy công việc", "tận tâm cống hiến", "xả thân cống hiến", "tận tụy cống hiến"],
    successMsg: "Tâm hồn thép mài! Đức tận tâm cống hiến lập nên nấc thang bất hủ vinh danh bảng tên lẫy lừng của bạn nơi đại hội."
  },
  {
    id: "viec_lam_e2",
    topicId: "viec_lam",
    format: "input",
    typeCode: "E",
    typeLabel: "E - Lược bỏ (Eliminate)",
    question: "Eliminate - Loại trừ rậm rì danh tự: Rút súc dải từ <span class='text-pink-500 font-bold'>\"người cầm trịch quyền uy đứng đầu các bộ máy chi nhánh quản lý hãng\"</span> thành một từ ghép ghép rạch lẹm, mang tính tối giản cao nhã nhất:",
    placeholder: "Nhập một danh hiệu ban tối cao (ví dụ: ban quản lý, ban lãnh đạo, ban giám đốc)...",
    answers: ["ban lãnh đạo", "ban quản lý", "ban giám đốc"],
    successMsg: "Tuyệt đỉnh tinh giản! Gợi mở vai trò ban lãnh đạo chu toàn quyết nghị vững đưa con thuyền tiến băng thâu vạn thắng lợi."
  },
  {
    id: "viec_lam_r1",
    topicId: "viec_lam",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo ngược trật tự không gian lực: Nghịch đảo kết cấu hai chữ quen thuộc chỉ nguồn báu con người là từ <span class='text-indigo-500 font-bold'>\"NHÂN LỰC\"</span> để thức tỉnh động thế năng lượng tiềm tàng của loài người:",
    placeholder: "Nhập hai tiếng đảo âm tiết nghịch vị...",
    answers: ["lực nhân"],
    successMsg: "Huyền thoại độc môn! 'Lực nhân' tuy cổ song đại diện cho thứ nội lực oai dũng, sung mãn tự sinh trưởng từ tầng sâu cội linh hồn kẻ lao động sáng tạo."
  },
  {
    id: "viec_lam_r2",
    topicId: "viec_lam",
    format: "input",
    typeCode: "R",
    typeLabel: "R - Đảo ngược (Reverse)",
    question: "Reverse - Đảo ngược ý bồi hoàn: Hãy đảo chiều tiếng của từ ghép chỉ cống hiến thầm lặng là từ <span class='text-indigo-500 font-bold'>\"PHỤNG SỰ\"</span> nhằm chiêm nghiệm phản tư sâu sắc lối sống trọn nghĩa nhân văn vì chúng đời:",
    placeholder: "Nhập âm nghịch đảo...",
    answers: ["sự phụng"],
    successMsg: "Phố cổ diễm cú! 'Sự phụng' biểu đạt cho ý thức hành sự hướng thiện tối thượng, dọn sạch tính lôi thối vị ích tham lam của bản ngã mòn rũ."
  },
  {
    id: "viec_lam_q1",
    topicId: "viec_lam",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Thanh vị cốt tủy của \"Thị trường lao động\" (Labor Market) được định nghĩa rạch ròi bằng thực tế bối cảnh nào thị trường?",
    options: [
      "A. Nơi diễn ra các phiên thương thảo mua bán trái phiếu tài phiệt khép kín",
      "B. Nơi gặp gỡ, dung hợp cung - cầu của sức lao động, thực thi trao đổi giá trị thặng dư giữa người cần cống hiến và doanh nghiệp chào tuyển dụng",
      "C. Nơi cưỡng ép nhân sự làm việc bất kể luật pháp lề thói",
      "D. Các hội chợ triển lãm sản phẩm gốm sứ trang trang"
    ],
    correctIndex: 1,
    successMsg: "Chính xác vẻ vang! Sự chu chuyển sôi động của dòng thị trường lao động phản ánh sinh lực dẻo bền của toàn cục quốc gia phát triển."
  },
  {
    id: "viec_lam_q2",
    topicId: "viec_lam",
    format: "quiz",
    typeCode: "Q",
    typeLabel: "Q - Trắc nghiệm ôn tập",
    question: "Chỉ số hoàn thành công vụ \"KPI\" (Key Performance Indicator) hướng tới vai trò thực tế thiết yếu nào của ban quản lý?",
    options: [
      "A. Giảm bớt số tiền thù lao đãi đãi ngộ của chiến binh lao động",
      "B. Đo lường khách quan, khoa học hiệu năng thực chất công việc của từng cá nhân nhằm thăng thù thù lao công chính",
      "C. Ép rập khuôn giờ đi đứng đến từng giây",
      "D. Chuyển thuyên hoàn vội vã nhân sự không xin phép"
    ],
    correctIndex: 1,
    successMsg: "Tuyệt đỉnh tôn vinh! KPI công chính giải phóng vạn sự thiên kiến cá nhân bẩn thỉu, đưa vinh hoa về tay người dốc dốc lòng cống hiến thực tính!"
  }
];
