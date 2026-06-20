import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  isLink?: boolean;
  linkUrl?: string;
}

interface ChatOption {
  text: string;
  nextId: string | null;
  link?: string;
}

interface QuestionNode {
  id: string;
  text: string;
  options: ChatOption[];
}

@Component({
  standalone: true,
  selector: 'app-beauty-assistant',
  templateUrl: './beauty-assistant.component.html',
  styleUrls: ['./beauty-assistant.component.css'],
  imports: [CommonModule, RouterModule, FormsModule]
})
export class BeautyAssistantComponent implements OnInit {
  isExpanded = false;
  showSessionPrompt = false;
  inputValue = '';
  
  currentQuestionId: string = 'q1';
  messages: ChatMessage[] = [];
  currentOptions: ChatOption[] = [];

  private decisionTree: { [key: string]: QuestionNode } = {
    'q1': {
      id: 'q1',
      text: 'Xin chào quý khách! L\'ELIXIR rất vui khi được phục vụ và đồng hành cùng hành trình nuôi dưỡng làn da của bạn. Để giúp bạn chọn được sản phẩm tương thích nhất, xin vui lòng cho L\'ELIXIR biết tình trạng da hiện tại quý khách đang bận tâm nhất là gì ạ?',
      options: [
        { text: 'Da dầu mụn & Lỗ chân lông to', nextId: 'q_oil_acne' },
        { text: 'Da thâm nám & Xỉn màu', nextId: 'q_pigment' },
        { text: 'Da khô ráp & Bong tróc thiếu nước', nextId: 'q_dry' },
        { text: 'Da nhạy cảm & Dễ kích ứng đỏ rát', nextId: 'q_sensitive' },
        { text: 'Tìm hiểu chính sách & Ưu đãi brand', nextId: 'q_policy' }
      ]
    },
    // NHÓM 1: DA DẦU MỤN
    'q_oil_acne': {
      id: 'q_oil_acne',
      text: 'Hệ thống ghi nhận nền da của bạn đang gặp tình trạng tăng tiết bã nhờn gây bít tắc cổ nang lông. Nhóm hoạt chất tối ưu nhất lúc này là Salicylic Acid (BHA) giúp làm sạch sâu bã dầu tích tụ và Zinc PCA kiểm soát nhờn.',
      options: [
        { text: '🛍️ Xem sản phẩm nhóm da dầu mụn', nextId: 'p_oil_acne' },
        { text: '📖 Hướng dẫn sử dụng hoạt chất dầu mụn', nextId: 'u_oil_acne' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    'p_oil_acne': {
      id: 'p_oil_acne',
      text: 'Các giải pháp cốt lõi cho da dầu mụn tại L\'ELIXIR:\n1. Sữa rửa mặt kiềm dầu Purifying Cleanser (Zinc PCA)\n2. Tinh chất đặc trị mụn Acne Defense Serum (BHA 2%)\n\nBạn có thể nhấp vào link phía dưới để xem chi tiết kết cấu sản phẩm:',
      options: [
        { text: '📖 Xem cách sử dụng nhóm này', nextId: 'u_oil_acne' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    'u_oil_acne': {
      id: 'u_oil_acne',
      text: 'Quy trình áp dụng chuẩn y khoa:\n- Buổi tối: Sau khi làm sạch, thoa 3-4 giọt Acne Defense Serum lên vùng da mụn/lỗ chân lông to.\n- Tần suất: 2-3 lần/tuần đầu để da làm quen, bắt buộc chống nắng kỹ vào ban ngày.',
      options: [
        { text: '🛍️ Xem bộ sản phẩm dầu mụn', nextId: 'p_oil_acne' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    // NHÓM 2: DA THÂM NÁM
    'q_pigment': {
      id: 'q_pigment',
      text: 'Nền da này cần các hoạt chất chống oxy hóa mạnh để ức chế hắc sắc tố (Melanin) chuyển dòng lên bề mặt da. Bộ đôi hoạt chất đề xuất là Vitamin C tinh khiết kết hợp Alpha Arbutin.',
      options: [
        { text: '🛍️ Xem sản phẩm nhóm thâm nám', nextId: 'p_pigment' },
        { text: '📖 Hướng dẫn sử dụng hoạt chất sáng da', nextId: 'u_pigment' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    'p_pigment': {
      id: 'p_pigment',
      text: 'Giải pháp mờ thâm sáng da chuyên sâu từ L\'ELIXIR:\n1. Serum mờ thâm Glow Booster Serum (Vitamin C & Alpha Arbutin)\n2. Kem chống nắng bảo vệ phổ rộng Sun Hydrator SPF 50+\n\nNhấp vào link phía dưới để khám phá chi tiết:',
      options: [
        { text: '📖 Xem cách sử dụng nhóm này', nextId: 'u_pigment' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    'u_pigment': {
      id: 'u_pigment',
      text: 'Quy trình phục hồi sắc tố:\n- Buổi sáng: Thoa Glow Booster Serum trước bước kem chống nắng để tăng màng lọc bảo vệ da.\n- Thoa lại kem chống nắng sau mỗi 3 giờ nếu làm việc trong môi trường ánh sáng mạnh.',
      options: [
        { text: '🛍️ Xem bộ sản phẩm thâm nám', nextId: 'p_pigment' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    // NHÓM 3: DA KHÔ RÁP
    'q_dry': {
      id: 'q_dry',
      text: 'Làn da của bạn đang thiếu hụt trầm trọng các lipid tự nhiên và nhân tố giữ ẩm tự nhiên (NMFs). Bạn cần bổ sung hoạt chất Hyaluronic Acid (HA) đa tầng để ngậm nước và Shea Butter để khóa màng ẩm.',
      options: [
        { text: '🛍️ Xem sản phẩm siêu cấp ẩm', nextId: 'p_dry' },
        { text: '📖 Hướng dẫn dưỡng ẩm chuẩn tầng', nextId: 'u_dry' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    'p_dry': {
      id: 'p_dry',
      text: 'Các sản phẩm cấp ẩm sâu, phục hồi màng ẩm L\'ELIXIR:\n1. Tinh chất siêu cấp nước HA Multi-Depth Serum\n2. Kem dưỡng khóa ẩm chuyên sâu Deep Moisture Cream\n\nNhấp vào link phía dưới để đặt mua sản phẩm:',
      options: [
        { text: '📖 Xem cách sử dụng nhóm này', nextId: 'u_dry' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    'u_dry': {
      id: 'u_dry',
      text: 'Quy trình cấp ẩm tối ưu:\n- Sử dụng HA Multi-Depth Serum ngay trên nền da còn ẩm (sau khi rửa mặt hoặc dùng toner) để tránh hiện tượng hút ẩm ngược.\n- Khóa lại ngay bằng một lớp mỏng Deep Moisture Cream để giữ nước trọn vẹn.',
      options: [
        { text: '🛍️ Xem bộ sản phẩm cấp ẩm', nextId: 'p_dry' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    // NHÓM 4: DA NHẠY CẢM
    'q_sensitive': {
      id: 'q_sensitive',
      text: 'Nền da nhạy cảm có lớp hàng rào bảo vệ da bị tổn thương, dễ phản ứng với môi trường bên ngoài. Hoạt chất làm dịu, chữa lành tối ưu nhất hiện tại là Vitamin B5 (Panthenol), Chiết xuất rau má (Centella) và Ceramide.',
      options: [
        { text: '🛍️ Xem sản phẩm phục hồi da yếu', nextId: 'p_sensitive' },
        { text: '📖 Hướng dẫn làm dịu da kích ứng', nextId: 'u_sensitive' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    'p_sensitive': {
      id: 'p_sensitive',
      text: 'Sản phẩm phục hồi, an toàn tuyệt đối cho da nhạy cảm L\'ELIXIR:\n1. Tinh chất phục hồi da chuyên sâu B5 Centella Calming Serum\n2. Sữa rửa mặt dịu nhẹ cân bằng pH Gentle Cleansing Gel\n\nNhấp vào link phía dưới để xem chi tiết độ lành tính:',
      options: [
        { text: '📖 Xem cách sử dụng nhóm này', nextId: 'u_sensitive' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    'u_sensitive': {
      id: 'u_sensitive',
      text: 'Quy trình phục hồi cho da nhạy cảm:\n- Tối giản chu trình dưỡng da, ngưng toàn bộ các sản phẩm peel hoặc treatment nặng.\n- Thoa B5 Centella Serum ngày 2 lần sáng và tối để củng cố lại cấu trúc hàng rào bảo vệ da nhanh chóng.',
      options: [
        { text: '🛍️ Xem bộ sản phẩm phục hồi', nextId: 'p_sensitive' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    // CHÍNH SÁCH VÀ ƯU ĐÃI
    'q_policy': {
      id: 'q_policy',
      text: 'L\'ELIXIR luôn cam kết đem lại giá trị chân thực và bảo vệ quyền lợi tối đa của quý khách hàng hằng ngày:',
      options: [
        { text: '📦 Chính sách bảo hành đổi trả khi kích ứng', nextId: 'policy_return' },
        { text: '🎁 Chương trình ưu đãi & Voucher hiện có', nextId: 'policy_gift' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    'policy_return': {
      id: 'policy_return',
      text: 'L\'ELIXIR cam kết bảo hành đổi trả hoặc hoàn tiền 100% trong vòng 7 ngày kể từ lúc nhận bưu kiện nếu da bạn có dấu hiệu kích ứng (Có hình ảnh/video mở hàng và xác nhận đỏ rát nhẹ). Bạn hoàn toàn yên tâm gửi gắm làn da nhé!',
      options: [
        { text: '🎁 Xem chương trình ưu đãi', nextId: 'policy_gift' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    },
    'policy_gift': {
      id: 'policy_gift',
      text: 'Ưu đãi đặc quyền hôm nay dành cho bạn:\n- Miễn phí vận chuyển toàn quốc cho tất cả mọi đơn hàng từ 300k trở lên.\n- Tặng thêm Sample Sữa rửa mặt kiềm dầu mini đi kèm cho đơn hàng bất kỳ.',
      options: [
        { text: '📦 Xem chính sách đổi trả', nextId: 'policy_return' },
        { text: '🔄 Quay lại danh mục chính', nextId: 'q1' }
      ]
    }
  };

  ngOnInit(): void {
    this.initFirstTimeChat();
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      const savedMessages = sessionStorage.getItem('elixir_assistant_messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (parsed && parsed.length > 1) {
          this.showSessionPrompt = true;
        }
      }
      this.scrollToBottom();
    }
  }

  private initFirstTimeChat(): void {
    const firstNode = this.decisionTree['q1'];
    this.messages = [{ sender: 'bot', text: firstNode.text }];
    this.currentOptions = firstNode.options;
    this.currentQuestionId = 'q1';
  }

  resumeSession(): void {
    const savedMessages = sessionStorage.getItem('elixir_assistant_messages');
    const savedQId = sessionStorage.getItem('elixir_assistant_qid');
    
    if (savedMessages && savedQId) {
      this.messages = JSON.parse(savedMessages);
      this.currentQuestionId = savedQId;
      this.currentOptions = this.decisionTree[this.currentQuestionId]?.options || [];
    }
    this.showSessionPrompt = false;
    this.scrollToBottom();
  }

  startFreshChat(): void {
    sessionStorage.removeItem('elixir_assistant_messages');
    sessionStorage.removeItem('elixir_assistant_qid');
    this.showSessionPrompt = false;
    this.initFirstTimeChat();
    this.scrollToBottom();
  }

  // LUỒNG CLICK CHỌN NÚT GỢI Ý TĨNH
  selectOption(option: ChatOption): void {
    this.messages.push({ sender: 'user', text: option.text });
    this.scrollToBottom();

    setTimeout(() => {
      if (option.nextId) {
        this.currentQuestionId = option.nextId;
        const nextNode = this.decisionTree[this.currentQuestionId];
        
        const isProductNode = ['p_oil_acne', 'p_pigment', 'p_dry', 'p_sensitive'].includes(this.currentQuestionId);
        if (isProductNode) {
          this.messages.push({ 
            sender: 'bot', 
            text: nextNode.text,
            isLink: true,
            linkUrl: '/products'
          });
        } else {
          this.messages.push({ sender: 'bot', text: nextNode.text });
        }
        
        this.currentOptions = nextNode.options;
        this.saveSessionState();
      }
      this.scrollToBottom();
    }, 400);
  }

  // LUỒNG GÕ CHỮ TỰ DO 
  sendMessage(): void {
    const message = this.inputValue.trim();
    if (!message) return;

    this.messages.push({ sender: 'user', text: message });
    this.inputValue = '';
    this.scrollToBottom();

    setTimeout(() => {
      const botReply = this.getReply(message);
      this.messages.push({ sender: 'bot', text: botReply });
      this.saveSessionState();
      this.scrollToBottom();
    }, 300);
  }

  private getReply(message: string): string {
    const normalized = message.toLowerCase();

    if (normalized.includes('da dầu') || normalized.includes('dầu') || normalized.includes('nhờn')) {
      return 'Da dầu mụn ưu tiên dùng Zinc PCA kiềm dầu, làm sạch sâu cổ nang lông với Salicylic Acid (BHA) và dưỡng ẩm kết cấu mỏng nhẹ nhé.';
    }
    if (normalized.includes('da mụn') || normalized.includes('mụn')) {
      return 'Đối với da mụn, khuyên dùng sữa rửa mặt pH dịu nhẹ 5.5, chấm mụn kháng viêm và hạn chế bôi kem dưỡng quá dày đặc gây bí tắc cổ nang lông.';
    }
    if (normalized.includes('thâm') || normalized.includes('nám') || normalized.includes('sáng da')) {
      return 'Để xử lý thâm nám hiệu quả, bạn nên phối hợp combo Vitamin C vào buổi sáng giúp tăng chống oxy hóa và Alpha Arbutin vào buổi tối nhằm cản đốm nâu.';
    }
    if (normalized.includes('da khô') || normalized.includes('khô ráp') || normalized.includes('bong tróc')) {
      return 'Nền da khô cần bổ sung Ceramide để khôi phục hàng rào bảo vệ da bị thiếu hụt, đồng thời sử dụng tinh chất ngậm nước HA đa tầng sâu.';
    }
    if (normalized.includes('nhạy cảm') || normalized.includes('kích ứng') || normalized.includes('đỏ rát')) {
      return 'Da nhạy cảm nên tối giản chu trình, ưu tiên phục hồi với Vitamin B5 (Panthenol) kết hợp chiết xuất rau má (Centella) dịu nhẹ lành tính.';
    }
    if (normalized.includes('đổi trả') || normalized.includes('hoàn tiền')) {
      return 'L\'ELIXIR cam kết bảo hành kích ứng đổi trả hoặc hoàn tiền 100% cực nhanh trong vòng 7 ngày kể từ lúc quý khách nhận được bưu kiện ạ!';
    }
    if (normalized.includes('khuyến mãi') || normalized.includes('ưu đãi') || normalized.includes('ship')) {
      return 'Hiện tại L\'ELIXIR áp dụng chính sách Freeship toàn quốc cho tất cả mọi đơn hàng từ 300k và tặng kèm sample sữa rửa mặt mini đó nhen.';
    }

    return 'L\'ELIXIR ghi nhận câu hỏi. Bạn có thể hỏi sâu về chăm sóc da dầu mụn, cấp ẩm da khô, phục hồi da nhạy cảm hoặc gấm chọn nhanh các nút gợi ý phía trên nha!';
  }

  private saveSessionState(): void {
    sessionStorage.setItem('elixir_assistant_messages', JSON.stringify(this.messages));
    sessionStorage.setItem('elixir_assistant_qid', this.currentQuestionId);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.assistant-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }
}