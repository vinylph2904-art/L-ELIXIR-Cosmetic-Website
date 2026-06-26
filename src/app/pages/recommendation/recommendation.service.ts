import { Injectable } from '@angular/core';
import { PRODUCTS } from '../../data/mock-products';
import { Product } from '../../data/product.model';

interface Ingredient {
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {

  constructor() { }

  // 1. LẤY HOẠT CHẤT THEO TRẠNG THÁI DA
  // Trích xuất đúng 2 hoạt chất theo loại da + 2 hoạt chất theo tình trạng da
  // Filter trùng và chèn B5/EGF làm backup nếu mảng bị trống
  getDynamicIngredients(skinType: string, problems: string[]): Ingredient[] {
    const skinTypeMap: { [key: string]: Ingredient[] } = {
      'Da dầu': [
        { name: 'Niacinamide (Vitamin B3)', description: 'Hỗ trợ kiểm soát dầu thừa, củng cố hàng rào bảo vệ da và giảm bóng nhờn.' },
        { name: 'Zinc PCA', description: 'Kiểm soát bã nhờn vượt trội, giữ bề mặt da thông thoáng và giảm sần sùi.' }
      ],
      'Da hỗn hợp': [
        { name: 'Niacinamide (Vitamin B3)', description: 'Cân bằng lượng dầu-nước giữa vùng chữ T và vùng chữ U trên gương mặt.' },
        { name: 'Hyaluronic Acid (HA)', description: 'Cấp nước nhẹ nhàng cho các vùng da khô mà không gây bí bách vùng đổ dầu.' }
      ],
      'Da khô': [
        { name: 'Hyaluronic Acid (HA)', description: 'Cấp nước đa tầng, giữ nước cho các tế bào da luôn căng mọng và mịn màng.' },
        { name: 'Ceramide', description: 'Khôi phục lipid, củng cố hàng rào bảo vệ da khỏi các tác nhân kích ứng bên ngoài.' }
      ],
      'Da nhạy cảm': [
        { name: 'Ceramide', description: 'Tái cấu trúc hàng rào bảo vệ, làm dịu da và giảm thiểu tình trạng kích ứng đỏ rát.' },
        { name: 'Rau má (Centella)', description: 'Làm dịu da cấp tốc, kháng viêm và phục hồi nhanh các tổn thương bề mặt.' }
      ]
    };

    const problemMap: { [key: string]: Ingredient[] } = {
      'Mụn': [
        { name: 'Salicylic Acid (BHA)', description: 'Làm sạch sâu lỗ chân lông, kháng viêm, giúp ngăn ngừa các loại mụn tái phát.' },
        { name: 'Tràm trà (Tea Tree)', description: 'Hoạt chất kháng khuẩn tự nhiên mạnh mẽ, làm dịu nhanh các nốt mụn sưng viêm.' }
      ],
      'Lỗ chân lông to': [
        { name: 'Witch Hazel (Phỉ)', description: 'Làm se da tự nhiên, hỗ trợ thu nhỏ lỗ chân lông và làm sạch cấu trúc bề mặt.' },
        { name: 'Zinc PCA', description: 'Kiểm soát bã nhờn vượt trội, giữ bề mặt da thông thoáng và giảm sần sùi.' }
      ],
      'Thâm nám': [
        { name: 'Vitamin C', description: 'Hoạt chất chống oxy hóa mạnh, mờ thâm mụn và ức chế hắc tố melanin giúp da trắng sáng.' },
        { name: 'Alpha Arbutin', description: 'Làm mờ các đốm nâu, tàn nhang và dưỡng trắng an toàn cho nền da.' }
      ],
      'Da xỉn màu': [
        { name: 'Glycolic Acid (AHA)', description: 'Tẩy tế bào chết nhẹ nhàng trên bề mặt, thúc đẩy tái tạo tế bào mới cho da sáng mịn.' },
        { name: 'Vitamin C', description: 'Hoạt chất chống oxy hóa mạnh, mờ thâm mụn và dưỡng sáng da rạng rỡ.' }
      ],
      'Lão hóa': [
        { name: 'Retinol', description: 'Thúc đẩy chu kỳ tái tạo da, kích thích sản sinh collagen làm mờ nếp nhăn chuyên sâu.' },
        { name: 'Peptide', description: 'Chuỗi axit amin củng cố độ đàn hồi, giúp nâng cơ tự nhiên và giảm tình trạng chảy xệ.' }
      ],
      'Thiếu ẩm': [
        { name: 'Hyaluronic Acid (HA)', description: 'Cấp nước đa tầng, giữ nước cho các tế bào da luôn căng mọng và ngậm nước mượt mà.' },
        { name: 'Glycerin', description: 'Hoạt chất hút ẩm kinh điển, khóa chặt phân tử nước để nuôi dưỡng tế bào da tối ưu.' }
      ]
    };

    let finalIngredients: Ingredient[] = [];
    if (skinTypeMap[skinType]) { finalIngredients.push(...skinTypeMap[skinType]); }

    let problemIngredients: Ingredient[] = [];
    problems.forEach(prob => {
      if (problemMap[prob]) { problemIngredients.push(...problemMap[prob]); }
    });

    problemIngredients = problemIngredients.filter(pItem => 
      !finalIngredients.some(fItem => fItem.name === pItem.name)
    );

    if (problemIngredients.length === 0) {
      problemIngredients = [
        { name: 'Vitamin B5 (Panthenol)', description: 'Xoa dịu làn da tổn thương, tăng cường khả năng phục hồi và tái tạo tế bào.' },
        { name: 'EGF (Yếu tố tăng trưởng)', description: 'Kích thích sửa chữa mô, củng cố độ mịn màng và giúp da khỏe mạnh từ gốc.' }
      ];
    }

    finalIngredients.push(...problemIngredients.slice(0, 2));
    return finalIngredients;
  }

  // 2. BIÊN SOẠN 3 Ô NỘI DUNG CHẨN ĐOÁN
  // Render data cho 3 block chính hiển thị trên giao diện Result
  // Ô 1: Sức khỏe nền (theo loại da)
  // Ô 2: Cơ chế bệnh lý (gộp chuỗi text liền mạch từ các vấn đề da)
  // Ô 3: Biện pháp bổ trợ (gộp các list từ LOẠI DA + VẤN ĐỀ DA)
  getDetailedAnalysis(skinType: string, problems: string[]): any[] {
    
    // Data Ô 1: Sức khỏe nền da
    const baseMap: { [key: string]: any } = {
      'Da dầu': {
        tag: 'SỨC KHỎE NỀN DA',
        title: `Phân tích tình trạng tăng tiết bã nhờn trên nền ${skinType}`,
        img: 'https://images.pexels.com/photos/3762466/pexels-photo-3762466.jpeg?auto=compress&cs=tinysrgb&w=800',
        content: `Hệ thống ghi nhận tuyến bã nhờn (Sebaceous Glands) của bạn đang hoạt động quá mức lipid thông thường. Khi lớp dầu thừa này không được giải phóng kịp thời, kết hợp với bụi mịn pm2.5 môi trường, nó sẽ tạo ra một lớp màng bít chặt cổ nang lông.`,
        highlight: `⚠️ Nguy cơ cao: Mất cân bằng hệ vi sinh trên da, tạo điều kiện lý tưởng cho vi khuẩn kị khí phát triển dẫn đến mụn tái phát.`
      },
      'Da khô': {
        tag: 'SỨC KHỎE NỀN DA',
        title: `Hao hụt hàng rào Lipid và hiện tượng mất nước qua biểu bì (TEWL) ở ${skinType}`,
        img: 'https://images.pexels.com/photos/3762466/pexels-photo-3762466.jpeg?auto=compress&cs=tinysrgb&w=800',
        content: `Làn da của bạn đang thiếu hụt nghiêm trọng Ceramide và các acid béo tự do trong lớp sừng. Hiện tượng mất nước qua biểu bì diễn ra liên tục khiến các liên kết tế bào bị bong tách, làm lộ ra các rãnh khuyết điểm, gây cảm giác căng rát nứt nẻ sau khi làm sạch.`,
        highlight: `⚠️ Nguy cơ cao: Da mất đi tấm khiên bảo vệ tự nhiên, đẩy nhanh tốc độ hình thành các nếp nhăn sâu (Lão hóa sớm).`
      },
      'Da hỗn hợp': {
        tag: 'SỨC KHỎE NỀN DA',
        title: `Bất đối sừng tuyến dầu và mất cân bằng độ ẩm cục bộ của ${skinType}`,
        img: 'https://images.pexels.com/photos/3762466/pexels-photo-3762466.jpeg?auto=compress&cs=tinysrgb&w=800',
        content: `Làn da phản ánh sự phân bổ không đồng đều của các thụ thể dầu. Vùng chữ T (Trán, mũi, cằm) tập trung mật độ tuyến bã dày đặc gây bóng loáng, trong khi vùng chữ U (hai bên má) lại bị thiếu nước trầm trọng do lớp màng ẩm mỏng, dẫn đến tình trạng vừa đổ dầu vừa bong tróc.`,
        highlight: `⚠️ Nguy cơ cao: Chọn sai sản phẩm đặc trị một vùng sẽ vô tình phá hủy cấu trúc của vùng da còn lại.`
      },
      'Da nhạy cảm': {
        tag: 'SỨC KHỎE NỀN DA',
        title: `Tình trạng tăng cảm tạng biểu bì và suy yếu màng miễn dịch nền ${skinType}`,
        img: 'https://images.pexels.com/photos/3762466/pexels-photo-3762466.jpeg?auto=compress&cs=tinysrgb&w=800',
        content: `Các đầu dây thần kinh dưới da của bạn đang tiếp xúc quá gần với môi trường do lớp sừng bị bào mòn hoặc do di truyền. Màng bảo vệ mỏng đến mức các hoạt chất nồng độ cao hoặc sự thay đổi thời tiết đột ngột dễ dàng kích hoạt hệ thống phản ứng viêm gây giãn mạch đỏ rát.`,
        highlight: `⚠️ Nguy cơ cao: Da liên tục rơi vào trạng thái viêm âm ỉ (Micro-inflammation), làm suy gamma nghiêm trọng khả năng tự phục hồi mô.`
      }
    };

    // Data Ô 2: Chi tiết nguyên nhân cơ chế bệnh lý
    const problemMap: { [key: string]: any } = {
      'Mụn': { title: 'Bẫy sừng hóa cổ nang lông và sự bùng phát của khuẩn viêm C.acnes', desc: 'Tình trạng mụn hiện tại hình thành từ chu kỳ thay da bị lỗi. Tế bào chết không tự bong ra mà dính chặt với bã nhờn dẻo tạo thành nút bít tắt (Comedone). Trong môi trường yếm khí này, vi khuẩn Cutibacterium acnes tiêu thụ bã nhờn, giải phóng acid béo tự do gây kích ứng và kích hoạt ổ sưng sần.' },
      'Thâm nám': { title: 'Sự tăng sản Melanin quá khích do tế bào Melanocytes bị kích động', desc: 'Dưới tác động của tia UV hoặc thay đổi nội tiết, nhà máy Melanocytes ở đáy thượng bì liên tục sản sinh hắc sắc tố Melanin rồi đẩy chúng lên bề mặt như một cơ chế "bảo vệ da". Tuy nhiên, việc phân bổ không đều tạo nên các cụm đốm nâu sậm, vết thâm mụn dai dẳng khó mờ.' },
      'Lỗ chân lông to': { title: 'Cơ chế giãn nở cơ học do áp lực dầu thừa và đứt gãy sợi đàn hồi', desc: 'Lỗ chân lông bị phình to ra do hai nguyên nhân bám đuổi: Một là lượng dầu liên tục đẩy qua thành nang lông buộc nó phải giãn rộng để thoát dịch; Hai là cấu trúc Collagen bao quanh thành nang lông bị suy yếu theo thời gian, khiến "miệng" lỗ chân homes mất khả năng đàn hồi co lại.' },
      'Da xỉn màu': { title: 'Chu kỳ sừng hóa bị đình trệ và hiệu ứng tán xạ ánh sáng kém trên lớp sừng', desc: 'Làn da mất đi độ bóng khỏe tự nhiên do lớp tế bào già cỗi không được dọn dẹp, tích tụ thành mảng dày trên bề mặt. Khi ánh sáng chiếu vào, thay vì phản chiếu đồng đều tạo độ căng mướt (Glowy), nó bị tán xạ hỗn loạn qua lớp tế bào thô ráp, tạo cảm giác xám xịt, mệt mỏi.' },
      'Lão hóa': { title: 'Sự suy thoái mạng lưới cấu trúc sợi Collagen và Elastin nội tại', desc: 'Ở cấp độ tế bào, tốc độ sụt giảm nguyên bào sợi diễn ra mạnh mẽ từ tuổi 25 khiến hệ nâng đỡ trung bì lỏng lax, tạo rãnh sâu và hiện tượng chảy xệ mô cơ mặt dưới áp lực của các gốc tự do.' },
      'Thiếu ẩm': { title: 'Sự đứt gãy mạng lưới kênh dẫn nước Aquaporin-3 và các nhân tố giữ ẩm NMFs', desc: 'Hệ thống phân bổ nước tự nhiên dưới da đang gặp sự cố. Dù bạn có thể bổ sung nước từ bên ngoài, nhưng các nhân tố giữ ẩm tự nhiên (NMFs) bên trong tế bào bị thiếu hụt nghiêm trọng khiến các phân tử nước không có điểm bám giữ, nhanh chóng bốc hơi để lại bề mặt thô sần, thiếu sức sống.' }
    };

    // Data Ô 3: Biện pháp bổ trợ 
    const lifestyleMap: { [key: string]: any } = {
      'Da dầu': {
        title: 'Cân bằng độ ẩm bằng nguồn nước nội sinh và thói quen tiết giảm nhờn',
        shouldEat: ['Uống tối thiểu 2 lít nước lọc sạch mỗi ngày', 'Dưa cucumber, ớt chuông, cà rốt', 'Cá hồi, các loại hạt chứa chất béo có lợi'],
        shouldAvoid: ['Mỡ động vật, các món chiên xào đậm vị', 'Thức ăn cay nóng kích thích bài tiết qua lỗ chân lông', 'Đồ uống chứa hàm lượng caffeine quá cao'],
        supplements: ['Viên uống Kẽm sinh học điều tiết bài tiết dầu thừa đầu ra', 'Vitamin A hỗ trợ quá trình sừng hóa khỏe mạnh', 'Viên uống cấp nước cân bằng ẩm mượt tự nhiên'],
        habits: ['Không lạm dụng giấy thấm dầu quá 3 lần/ngày', 'Rửa mặt bằng nước mát giúp ổn định nhiệt độ bề mặt', 'Vệ sinh cọ và bông mút trang điểm định kỳ hàng tuần']
      },
      'Da khô': {
        title: 'Cấp ẩm từ nguồn chất béo có lợi và khoa học bảo toàn màng lipid',
        shouldEat: ['Quả bơ tươi, quả óc chó, hạt hạnh nhân', 'Dầu oliu nguyên chất bổ sung vào khẩu phần ăn', 'Thực phẩm chứa dồi dào hàm lượng axit béo Omega-9'],
        shouldAvoid: ['Thức uống chứa chất lợi tiểu gây mất nước (cà phê, trà đặc)', 'Đồ ăn chứa hàm lượng muối mặn quá cao', 'Các loại nước uống có cồn gây khô mô cơ tế bào'],
        supplements: ['Viên uống Hyaluronic Acid ngậm nước đa tầng biểu bì', 'Ceramide đường uống khôi phục tấm khiên lipid màng sừng', 'Dầu hoa anh thảo làm dịu và giảm thô sần nứt nẻ'],
        habits: ['Thoa kem dưỡng khóa ẩm ngay trong vòng 3 phút sau rửa mặt', 'Đặt máy phun sương cấp ẩm ngay tại không gian làm việc', 'Tuyệt đối không rửa mặt bằng nguồn nước quá nóng rát']
      },
      'Da hỗn hợp': {
        title: 'Đồng bộ hóa ẩm đa vùng và cơ chế chăm sóc chuyên biệt cho da hỗn hợp',
        shouldEat: ['Các loại rau xanh đậm (cải bó xôi, súp lơ)', 'Trái cây dồi dào vitamin nhóm B', 'Các loại cá béo chứa lipid không bão hòa'],
        shouldAvoid: ['Các món ăn quá ngọt gây xáo trộn bài tiết tuyến dầu chữ T', 'Thức ăn nhanh, đồ ăn đóng hộp nhiều muối'],
        supplements: ['Viên uống Vitamin tổng hợp cân bằng chuyển hóa nội sinh', 'Omega-3 tinh khiết củng cố màng lipid vùng má'],
        habits: ['Thoa kem dưỡng ẩm dày hơn ở vùng má, mỏng nhẹ ở vùng chữ T', 'Sử dụng sữa rửa mặt gel dịu nhẹ, cân bằng ẩm-nước']
      },
      'Da nhạy cảm': {
        title: 'Chế độ dinh dưỡng kháng viêm hệ thống và tối giản ma sát vật lý',
        shouldEat: ['Đồ ăn thanh đạm, ưu tiên chế biến dạng hấp luộc', 'Thực phẩm giàu nhóm Vitamin B (yến mạch, chuối)', 'Súp lơ xanh, măng tây hỗ trợ củng cố thành mạch máu'],
        shouldAvoid: ['Các loại hải sản lạ, đồ ăn dễ kích ứng dị ứng', 'Thực phẩm lên men lâu ngày, đồ dưa muối', 'Thức ăn chứa nhiều chất tạo màu, bảo quan công nghiệp'],
        supplements: ['Viên uống Vitamin B Complex củng cố sức đề kháng màng sừng', 'Chiết xuất nghệ (Curcumin) giảm thiểu phản ứng viêm nhạy cảm', 'Dầu nhuyễn thể hỗ trợ làm dịu bề mặt tế bào mỏng yếu'],
        habits: ['Ngưng hoàn toàn thói quen dùng bông tẩy trang chà xát mạnh', 'Luôn test thử sản phẩm mới ở vùng quai hàm trong 24 tiếng', 'Thiền hoặc tập hít thở nhẹ nhàng điều hòa hệ thần kinh']
      },
      'Mụn': {
        title: 'Khoa học dinh dưỡng điều tiết mụn và thói quen bảo vệ nang lông',
        shouldEat: ['Thực phẩm giàu kẽm (hàu, các loại hạt)', 'Cá hồi, cá trích giàu Omega-3 kháng viêm', 'Uống trà xanh dồi dào EGCG xoa dịu biểu bì'],
        shouldAvoid: ['Sữa động vật và các chế phẩm từ sữa', 'Đồ ngọt tinh luyện, bánh kẹo, nước có ga', 'Thức ăn nhanh, đồ nhiều dầu mỡ (High-Glycemic)'],
        supplements: ['Viên uống Kẽm (Zinc) kiểm soát lượng bã nhờn dư thừa', 'Omega-3 tinh khiết giảm mức độ sưng sần nang lông'],
        habits: ['Thay vỏ gối định kỳ 2 lần/tuần', 'Tuyệt đối không tự ý nặn hoặc sờ tay lên mặt', 'Ngủ trước 22h30 giúp kiểm soát hormone Cortisol']
      },
      'Thâm nám': {
        title: 'Chống oxy hóa nội sinh phá vỡ sắc tố và quy tắc sinh hoạt kháng tia UV',
        shouldEat: ['Trái cây giàu Vitamin C (cam, chanh, bưởi)', 'Quả mọng (việt quất, dâu tây) chống gốc tự do', 'Cà chua, lựu đỏ chứa Lycopene chống nắng tự nhiên'],
        shouldAvoid: ['Rượu bia, cà phê và các chất kích thích mạnh', 'Thức ăn chứa nhiều gia vị cay nóng gây giãn mạch'],
        supplements: ['Viên uống Glutathione hoặc L-Cystine làm mờ hắc sắc tố từ gốc', 'Viên uống chống nắng chiết xuất dương xỉ bảo vệ da'],
        habits: ['Thoa lại kem chống nắng đều đặn sau mỗi 3 giờ', 'Hạn chế tối đa nhìn màn hình điện thoại trong bóng tối', 'Che chắn vật lý (nón rộng vành, kính râm) khi ra ngoài']
      },
      'Lỗ chân lông to': {
        title: 'Thu nhỏ cấu trúc nang lông cơ học và tiết giảm dòng chảy bã nhờn',
        shouldEat: ['Trái cây giàu Vitamin A, C, E tăng độ liên kết tế bào', 'Uống nhiều nước khoáng bổ sung vi chất'],
        shouldAvoid: ['Các thực phẩm cay nóng, cồn làm giãn mạch tăng tiết mồ hôi'],
        supplements: ['Viên uống Kẽm điều tiết dầu', 'Vitamin C hỗ trợ săn chắc màng collagen thành nang lông'],
        habits: ['Sử dụng tẩy tế bào chết chứa BHA nhẹ dịu định kỳ', 'Tránh dùng nước quá nóng rửa mặt làm giãn cơ học nang lông']
      },
      'Da xỉn màu': {
        title: 'Kích thích chu kỳ thay da sinh học và tối ưu độ phản xạ ánh sáng',
        shouldEat: ['Nước ép bưởi, cam, ổi dồi dào Vitamin C', 'Các loại rau xanh giàu sắt giúp tuần hoàn máu tốt'],
        shouldAvoid: ['Hút thuốc lá thụ động, đồ chiên rán bị oxy hóa nặng'],
        supplements: ['Vitamin C đường uống mờ thâm sáng da', 'Vitamin E tự nhiên tạo độ glow cho biểu bì'],
        habits: ['Tẩy tế bào chết đều đặn dọn dẹp lớp sừng già', 'Xịt khoáng cấp ẩm ngay khi làm việc lâu trước máy tính']
      },
      'Lão hóa': {
        title: 'Chế độ ăn chống Glycation tế bào và khoa học vận động kích thích Collagen',
        shouldEat: ['Nước hầm xương nguyên chất dồi dào Collagen', 'Các loại đậu và hạt ngũ cốc chứa Isoflavone', 'Trà matcha Nhật Bản chống oxy hóa tầng sâu'],
        shouldAvoid: ['Các món ăn chứa hàm lượng đường cao, kẹo ngọt', 'Món ăn chiên rán nhiều dầu, đồ nướng cháy cạnh'],
        supplements: ['Collagen Peptide sinh học hàm lượng cao khôi phục mật độ liên kết', 'Coenzyme Q10 tái tạo và bảo vệ năng lượng tế bào da'],
        habits: ['Massage nâng cơ hướng lên nhẹ nhàng khi thoa dưỡng chất', 'Tập thể dục đều đặn (Yoga, Cardio) tăng tuần hoàn máu', 'Đảm bảo giấc ngủ chất lượng và sâu từ 23h đến 2h sáng']
      },
      'Thiếu ẩm': {
        title: 'Tái tạo hệ thống liên kết nước tầng sâu và khóa chặt màng ẩm mượt',
        shouldEat: ['Uống nhiều nước lọc, nước dừa tươi', 'Ăn bơ tươi, các loại hạt ngậm béo có lợi Omega-9'],
        shouldAvoid: ['Đồ ăn chứa hàm lượng muối mặn gây rút nước mô tế bào', 'Cà phê, trà đặc kích thích mất nước qua bài tiết'],
        supplements: ['Viên uống cấp nước chuyên sâu Hyaluronic Acid', 'Ceramide hỗ trợ phục hồi màng ẩm từ bên trong'],
        habits: ['Sử dụng máy phun sương làm ẩm không khí phòng máy lạnh', 'Vỗ toner cấp nước đa tầng theo phương pháp nhiều lớp nhẹ']
      }
    };

    const selectedProblems = problems.length > 0 ? problems : [];
    
    let combinedShouldEat: string[] = [];
    let combinedShouldAvoid: string[] = [];
    let combinedSupplements: string[] = [];
    let combinedHabits: string[] = [];

    const lifestyleKeys = [skinType, ...selectedProblems];

    lifestyleKeys.forEach(key => {
      if (lifestyleMap[key]) {
        combinedShouldEat.push(...lifestyleMap[key].shouldEat);
        combinedShouldAvoid.push(...lifestyleMap[key].shouldAvoid);
        if (lifestyleMap[key].supplements) {
          combinedSupplements.push(...lifestyleMap[key].supplements);
        }
        combinedHabits.push(...lifestyleMap[key].habits);
      }
    });

    
    combinedShouldEat = [...new Set(combinedShouldEat)];
    combinedShouldAvoid = [...new Set(combinedShouldAvoid)];
    combinedSupplements = [...new Set(combinedSupplements)];
    combinedHabits = [...new Set(combinedHabits)];

    
    const structuredContent = 
      `🥦 CHẾ ĐỘ DINH DƯỠNG NÊN ĂN:\n• ${combinedShouldEat.slice(0, 5).join('\n• ')}\n\n` +
      `❌ THỰC PHẨM CẦN KIÊNG KỴ:\n• ${combinedShouldAvoid.slice(0, 5).join('\n• ')}\n\n` +
      `💊 THỰC PHẨM BỔ SUNG ĐẶC TRỊ:\n• ${combinedSupplements.slice(0, 5).join('\n• ')}\n\n` +
      `💤 THÓI QUEN SINH HOẠT & NGỦ NGHỈ:\n• ${combinedHabits.slice(0, 5).join('\n• ')}`;

    const article1 = baseMap[skinType] || baseMap['Da dầu'];
    
    let combinedProblemTitle = 'Phân tích cơ chế bệnh lý đa tầng';
    let combinedProblemContent = '';
    
    if (selectedProblems.length > 0) {
      combinedProblemTitle = 'Cơ chế: ' + selectedProblems.map(p => problemMap[p]?.title?.split(' và ')[0] || p).join(' + ');
      selectedProblems.forEach((p) => {
        if (problemMap[p]) {
          combinedProblemContent += `Tình trạng ${p}: ${problemMap[p].desc}\n\n`;
        }
      });
    } else {
      combinedProblemContent = 'Hệ thống không ghi nhận khuyết điểm bệnh lý nghiêm trọng trên bề mặt biểu bì. Quy trình can thiệp tập trung vào củng cố màng bảo vệ.';
    }

    const article2 = {
      tag: 'CƠ CHẾ BỆNH LÝ',
      title: combinedProblemTitle,
      img: 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=800',
      content: combinedProblemContent,
      highlight: `🎯 Tiêu điểm can thiệp: Phối hợp các hoạt chất đặc trị để tái cấu trúc tế bào diện rộng.`
    };

    const mainKey = selectedProblems.length > 0 ? selectedProblems[0] : skinType;
    const article3 = {
      tag: 'BIỆN PHÁP BỔ TRỢ',
      title: lifestyleMap[mainKey]?.title || 'Cân bằng dinh dưỡng nội sinh & Lối sống phục hồi',
      img: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      content: structuredContent,
      highlight: `💡 Lời khuyên vàng: Chế độ ăn uống lành mạnh và kiểm soát stress hỗ trợ tăng 40% hiệu quả hấp thu mỹ phẩm đặc trị.`
    };

    return [article1, article2, article3];
  }

  // 3. THUẬT TOÁN LỌC SẢN PHẨM KHUYẾN DÙNG
  getRecommendations(skinType: string, problems: string[]): { products: Product[], isRelaxed: boolean } {
    let isRelaxed = false;
    
    let filtered = PRODUCTS.filter(product => {
      const isSkinTypeMatch = product.targetSkinTypes.includes(skinType);
      const isProblemMatch = product.targetSkinProblems.some(prob => problems.includes(prob));
      return isSkinTypeMatch && (isProblemMatch || product.targetSkinProblems.length === 0);
    });

    if (filtered.length === 0) {
      isRelaxed = true;
      filtered = PRODUCTS.filter(product => product.targetSkinTypes.includes(skinType));
    }

    filtered = filtered.map(product => {
      let reason = `Phù hợp tối ưu cho nền ${skinType}.`;
      const matchingProblems = product.targetSkinProblems.filter(prob => problems.includes(prob));
      
      if (matchingProblems.length > 0) {
        reason = `Được chọn lọc đặc biệt vì giúp cải thiện trực tiếp tình trạng: ${matchingProblems.join(', ')}.`;
      } else if (isRelaxed) {
        reason = `Đề xuất cơ bản tốt nhất giúp bảo vệ và nuôi dưỡng nền ${skinType}.`;
      }
      
      (product as any).recommendationReason = reason;
      return product;
    });

    return { products: filtered, isRelaxed: isRelaxed };
  }
}