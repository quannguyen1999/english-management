import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoughBoxDirective } from '../../directives';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
}

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RoughBoxDirective],
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent {
  searchQuery: string = '';
  
  users: ChatUser[] = [
    {
      id: '1',
      name: 'Mai Huy H...',
      avatar: '/assets/avatars/user1.jpg',
      isOnline: true,
      lastMessage: 'Hello there!',
      lastMessageTime: '2m'
    },
    {
      id: '2',
      name: 'Hồ Trịnh',
      avatar: '/assets/avatars/user2.jpg',
      isOnline: true,
      lastMessage: 'How are you?',
      lastMessageTime: '5m'
    },
    {
      id: '3',
      name: 'Bình Be',
      avatar: '/assets/avatars/user3.jpg',
      isOnline: true,
      lastMessage: 'See you tomorrow!',
      lastMessageTime: '15m'
    },
    {
      id: '4',
      name: 'Quốc Duy',
      avatar: '/assets/avatars/user4.jpg',
      isOnline: true,
      lastMessage: 'Thanks!',
      lastMessageTime: '1h'
    }
  ];

  recentChats: ChatUser[] = [
    {
      id: '5',
      name: 'Em 🌻',
      avatar: '/assets/avatars/default.jpg',
      isOnline: false,
      lastMessage: 'E chuyển tiền môn',
      lastMessageTime: 'Tue'
    },
    {
      id: '6',
      name: 'Mai Huy Hoàng',
      avatar: '/assets/avatars/user1.jpg',
      isOnline: true,
      lastMessage: 'okie fen',
      lastMessageTime: 'Apr 13'
    },
    // Add more recent chats as needed
  ];

  onSearch(query: string): void {
    console.log('Searching:', query);
  }

  onNewChat(): void {
    console.log('New chat clicked');
  }
} 