import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatDetailComponent } from './chat-detail/chat-detail.component';
import { HorizontalScrollDirective } from '../../directives/horizontal-scroll.directive';
import { RoughBoxDirective } from '../../directives/rough-box.directive';

type FriendStatus = 'none' | 'friend' | 'pending_sent' | 'pending_received';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  friendStatus: FriendStatus;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RoughBoxDirective, 
    ChatDetailComponent,
    HorizontalScrollDirective
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  searchQuery: string = '';
  filteredUsers: ChatUser[] = [];
  selectedChat: ChatUser | null = null;
  
  onlineUsers: ChatUser[] = [
    {
      id: '1',
      name: 'Mai Huy H...',
      avatar: 'assets/avatars/user1.jpg',
      isOnline: true,
      friendStatus: 'friend',
      lastMessage: 'okie fen',
      lastMessageTime: 'Apr 13'
    },
    {
      id: '2',
      name: 'Hồ Trịnh',
      avatar: 'assets/avatars/user1.jpg',
      isOnline: true,
      friendStatus: 'none',
      lastMessage: 'mới ok',
      lastMessageTime: 'Apr 10'
    },
    {
      id: '3',
      name: 'Bình Be',
      avatar: 'assets/avatars/user1.jpg',
      isOnline: true,
      friendStatus: 'friend',
      lastMessage: 'See you tomorrow!',
      lastMessageTime: '15m'
    },
    {
      id: '4',
      name: 'Đăng Trường',
      avatar: 'assets/avatars/user1.jpg',
      isOnline: true,
      friendStatus: 'none',
      lastMessage: 'Thanks!',
      lastMessageTime: '1h'
    },
    {
      id: '5',
      name: 'Đăng Trường',
      avatar: 'assets/avatars/user1.jpg',
      isOnline: true,
      friendStatus: 'none',
      lastMessage: 'Thanks!',
      lastMessageTime: '1h'
    }
  ];

  recentChats: ChatUser[] = [
    {
      id: '5',
      name: 'Em 🌻',
      avatar: 'assets/avatars/user1.jpg',
      isOnline: false,
      friendStatus: 'friend',
      lastMessage: 'E chuyển tiền môn',
      lastMessageTime: 'Tue'
    },
    {
      id: '6',
      name: 'Meta AI',
      avatar: 'assets/avatars/user1.jpg',
      isOnline: false,
      friendStatus: 'friend',
      lastMessage: 'Meta AI sent a photo.',
      lastMessageTime: 'Apr 12'
    },
    {
      id: '7',
      name: 'Tran Duong Duong',
      avatar: 'assets/avatars/user1.jpg',
      isOnline: false,
      friendStatus: 'friend',
      lastMessage: 'mới ok',
      lastMessageTime: 'Apr 10'
    },
    {
      id: '8',
      name: 'Alo 1234',
      avatar: 'assets/avatars/user1.jpg',
      isOnline: true,
      friendStatus: 'friend',
      lastMessage: 'Đăng Trường đã rời...',
      lastMessageTime: 'Apr 09'
    },
    {
      id: '9',
      name: 'LAC - Buffet Lẩu Rau Nấm',
      avatar: 'assets/avatars/user1.jpg',
      isOnline: false,
      friendStatus: 'friend',
      lastMessage: 'Dạ vâng, Lạc hỗ trợ giú...',
      lastMessageTime: 'Apr 04'
    }
  ];

  showUpdateNotice: boolean = true;

  onSearch(query: string): void {
    this.searchQuery = query;
    if (!query) {
      this.filteredUsers = [];
      return;
    }

    // Combine online users and recent chats for searching
    const allUsers = [...this.onlineUsers, ...this.recentChats];
    
    // Filter users based on search query
    this.filteredUsers = allUsers.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      (user.lastMessage && user.lastMessage.toLowerCase().includes(query.toLowerCase()))
    );
  }

  addFriend(user: ChatUser): void {
    // Update in onlineUsers array
    const onlineUserIndex = this.onlineUsers.findIndex(u => u.id === user.id);
    if (onlineUserIndex !== -1) {
      this.onlineUsers[onlineUserIndex].friendStatus = 'pending_sent';
    }

    // Update in recentChats array
    const recentChatIndex = this.recentChats.findIndex(u => u.id === user.id);
    if (recentChatIndex !== -1) {
      this.recentChats[recentChatIndex].friendStatus = 'pending_sent';
    }

    // Refresh selected chat if it's the same user
    if (this.selectedChat?.id === user.id) {
      this.selectedChat = { ...this.selectedChat, friendStatus: 'pending_sent' };
    }
  }

  removeFriend(user: ChatUser): void {
    // Update in onlineUsers array
    const onlineUserIndex = this.onlineUsers.findIndex(u => u.id === user.id);
    if (onlineUserIndex !== -1) {
      this.onlineUsers[onlineUserIndex].friendStatus = 'none';
    }

    // Update in recentChats array
    const recentChatIndex = this.recentChats.findIndex(u => u.id === user.id);
    if (recentChatIndex !== -1) {
      this.recentChats[recentChatIndex].friendStatus = 'none';
    }

    // Refresh selected chat if it's the same user
    if (this.selectedChat?.id === user.id) {
      this.selectedChat = { ...this.selectedChat, friendStatus: 'none' };
    }
  }

  acceptFriendRequest(user: ChatUser): void {
    const targetUser = this.onlineUsers.find(u => u.id === user.id) || 
                      this.recentChats.find(u => u.id === user.id);
    if (targetUser) {
      targetUser.friendStatus = 'friend';
      // Refresh selected chat if it's the same user
      if (this.selectedChat?.id === user.id) {
        this.selectedChat = { ...targetUser };
      }
    }
  }

  rejectFriendRequest(user: ChatUser): void {
    const targetUser = this.onlineUsers.find(u => u.id === user.id) || 
                      this.recentChats.find(u => u.id === user.id);
    if (targetUser) {
      targetUser.friendStatus = 'none';
      // Refresh selected chat if it's the same user
      if (this.selectedChat?.id === user.id) {
        this.selectedChat = { ...targetUser };
      }
    }
  }

  onNewChat(): void {
    console.log('New chat clicked');
  }

  onChatSelect(chat: ChatUser): void {
    this.selectedChat = { ...chat };
  }
} 