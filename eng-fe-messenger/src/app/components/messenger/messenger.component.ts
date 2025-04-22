import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoughBoxDirective } from '../../directives';
import { ChatDetailComponent } from '../chat-detail/chat-detail.component';
import { HorizontalScrollDirective } from '../../directives/horizontal-scroll.directive';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RoughBoxDirective, 
    ChatDetailComponent,
    HorizontalScrollDirective
  ],
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent {
  searchQuery: string = '';
  
  onlineUsers: ChatUser[] = [
    {
      id: '1',
      name: 'Mai Huy H...',
      avatar: 'assets/avatars/user1.jpg', // Remove leading slash
      isOnline: true,
      lastMessage: 'okie fen',
      lastMessageTime: 'Apr 13'
    },
    {
      id: '2',
      name: 'Hồ Trịnh',
      avatar: 'assets/avatars/user1.jpg', // Remove leading slash
      isOnline: true,
      lastMessage: 'mới ok',
      lastMessageTime: 'Apr 10'
    },
    {
      id: '3',
      name: 'Bình Be',
      avatar: 'assets/avatars/user1.jpg', // Remove leading slash
      isOnline: true,
      lastMessage: 'See you tomorrow!',
      lastMessageTime: '15m'
    },
    {
      id: '4',
      name: 'Đăng Trường',
      avatar: 'assets/avatars/user1.jpg', // Remove leading slash
      isOnline: true,
      lastMessage: 'Thanks!',
      lastMessageTime: '1h'
    },
    {
      id: '5',
      name: 'Đăng Trường',
      avatar: 'assets/avatars/user1.jpg', // Remove leading slash
      isOnline: true,
      lastMessage: 'Thanks!',
      lastMessageTime: '1h'
    }
  ];

  recentChats: ChatUser[] = [
    {
      id: '5',
      name: 'Em 🌻',
      avatar: 'assets/avatars/user1.jpg', // Remove leading slash
      isOnline: false,
      lastMessage: 'E chuyển tiền môn',
      lastMessageTime: 'Tue'
    },
    {
      id: '6',
      name: 'Meta AI',
      avatar: 'assets/avatars/user1.jpg', // Remove leading slash
      isOnline: false,
      lastMessage: 'Meta AI sent a photo.',
      lastMessageTime: 'Apr 12'
    },
    {
      id: '7',
      name: 'Tran Duong Duong',
      avatar: 'assets/avatars/user1.jpg', // Remove leading slash
      isOnline: false,
      lastMessage: 'mới ok',
      lastMessageTime: 'Apr 10'
    },
    {
      id: '8',
      name: 'Alo 1234',
      avatar: 'assets/avatars/user1.jpg', // Remove leading slash
      isOnline: true,
      lastMessage: 'Đăng Trường đã rời...',
      lastMessageTime: 'Apr 09'
    },
    {
      id: '9',
      name: 'LAC - Buffet Lẩu Rau Nấm',
      avatar: 'assets/avatars/user1.jpg', // Remove leading slash
      isOnline: false,
      lastMessage: 'Dạ vâng, Lạc hỗ trợ giú...',
      lastMessageTime: 'Apr 04'
    }
  ];

  showUpdateNotice: boolean = true;

  onSearch(query: string): void {
    console.log('Searching:', query);
  }

  onNewChat(): void {
    console.log('New chat clicked');
  }

  onChatSelect(chat: ChatUser): void {
    console.log('Selected chat:', chat);
  }
} 