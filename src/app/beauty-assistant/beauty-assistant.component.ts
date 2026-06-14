import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  standalone: true,
  selector: 'app-beauty-assistant',
  templateUrl: './beauty-assistant.component.html',
  styleUrls: ['./beauty-assistant.component.css'],
  imports: [CommonModule, FormsModule]
})
export class BeautyAssistantComponent {
  isExpanded = false;
  inputValue = '';
  messages: ChatMessage[] = [
    {
      sender: 'bot',
      text: 'Xin chào! Mình là Beauty Assistant. Bạn có thể hỏi về da dầu, da mụn hoặc kem chống nắng.'
    }
  ];

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  sendMessage() {
    const message = this.inputValue.trim();
    if (!message) {
      return;
    }

    this.messages.push({ sender: 'user', text: message });
    this.inputValue = '';
    this.scrollToBottom();

    const botReply = this.getReply(message);
    setTimeout(() => {
      this.messages.push({ sender: 'bot', text: botReply });
      this.scrollToBottom();
    }, 200);
  }

  private getReply(message: string) {
    const normalized = message.toLowerCase();

    if (normalized.includes('da dầu') || normalized.includes('dầu')) {
      return 'Da dầu thường cần sản phẩm kiểm soát nhờn, tẩy tế bào chết nhẹ nhàng và dưỡng ẩm không gây bí.';
    }

    if (normalized.includes('da mụn') || normalized.includes('mụn')) {
      return 'Da mụn nên dùng sữa rửa mặt dịu nhẹ, trị mụn chứa salicylic acid và dưỡng ẩm không dầu để cân bằng da.';
    }

    if (
      normalized.includes('kem chống nắng') ||
      normalized.includes('chống nắng') ||
      normalized.includes('spf')
    ) {
      return 'Kem chống nắng cần dùng hàng ngày với SPF 30+, thoa đủ lượng và thoa lại sau 2-3 giờ nếu bạn tiếp xúc với ánh nắng trực tiếp.';
    }

    return 'Mình chưa hiểu câu hỏi, bạn thử hỏi về da dầu, da mụn hoặc kem chống nắng nhé.';
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.assistant-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }
}
