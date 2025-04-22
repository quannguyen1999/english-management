import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoughBoxDirective } from '../../directives';
import { MessageRoughBoxDirective } from '../../directives/message-rough-box.directive';
interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  isImage?: boolean;
}

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RoughBoxDirective, MessageRoughBoxDirective],
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.scss']
})
export class ChatDetailComponent {
  currentUser = {
    name: 'Em 🌻',
    avatar: 'assets/avatars/user1.jpg', // Remove leading slash
    isOnline: true
  };

  newMessage: string = '';
  
  messages: ChatMessage[] = [
    {
      id: '1',
      content: 'À đám cưới 2 người đó thì sang x10 lần đám cưới này luôn á anh',
      timestamp: 'APR 05, 3:40 PM',
      isMe: false
    },
    {
      id: '2',
      content: 'Giờ e học á ❤️',
      timestamp: 'APR 05, 3:41 PM',
      isMe: false
    },
    {
      id: '3',
      content: 'You may not see messages in this chat until you update your app.',
      timestamp: 'APR 05, 3:42 PM',
      isMe: true
    },
    {
      id: '4',
      content: '/assets/chat/sample-image.jpg',
      timestamp: 'APR 05, 11:03 PM',
      isMe: false,
      isImage: true
    },
    {
      id: '5',
      content: 'Giận',
      timestamp: 'APR 05, 11:04 PM',
      isMe: false
    },
    {
      id: '6',
      content: 'đã hic có mờ',
      timestamp: 'APR 05, 11:05 PM',
      isMe: true
    },
    {
      id: '7',
      content: 'tại thằng iphone này nó bị nựng xỉu',
      timestamp: 'APR 05, 11:06 PM',
      isMe: true
    }
  ];

  sendMessage() {
    if (!this.newMessage.trim()) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      content: this.newMessage,
      timestamp: new Date().toLocaleString(),
      isMe: true
    };
    
    this.messages.push(newMsg);
    this.newMessage = '';
  }
} 