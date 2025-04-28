import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';
import { ChatDetailComponent } from './chat-detail/chat-detail.component';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RoughBoxDirective } from '../../directives/rough-box.directive';
import { UserService } from '../../services/user.service';
import { HorizontalScrollDirective } from '../../directives/horizontal-scroll.directive';
import { FriendService } from '../../services/friend.service';
import { TranslateModule } from '@ngx-translate/core';
import { ChatUser, Conversation, Message, FriendStatus } from '../../models/chat.model';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule,
    MatButtonModule,
    RoughBoxDirective, 
    ChatDetailComponent,
    HorizontalScrollDirective,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  filteredUsers: ChatUser[] = [];
  private searchSubject = new Subject<string>();
  isLoading: boolean = false;
  selectedChat: ChatUser | null = null;
  currentUserId: string = '';
  
  onlineUsers: ChatUser[] = [];
  recentChats: ChatUser[] = [];
  showUpdateNotice: boolean = true;

  messages: Message[] = [];
  newMessage = '';
  private subscription: Subscription | null = null;

  FriendStatus = FriendStatus;

  users: User[] = [];

  constructor(
    private userService: UserService,
    private friendService: FriendService,
    private router: Router,
    private wsService: WebSocketService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.isLoading = true;
        return this.userService.searchUsers(query);
      })
    ).subscribe({
      next: (response) => {
        this.filteredUsers = response.data.map(user => ({
          id: user.userId,
          name: user.username,
          avatar: 'assets/avatars/user1.jpg',
          isOnline: false,
          friendStatus: this.mapFriendStatus(user.friendStatus, user.requestSentByMe),
          lastMessage: '',
          lastMessageTime: '',
          conversationId: user.conversationId,
          requestSentByMe: user.requestSentByMe
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.filteredUsers = [];
      }
    });

    // Register the custom icon set
    this.matIconRegistry.setDefaultFontSetClass('material-icons');
  }

  ngOnInit(): void {
    this.loadUsers();
    this.subscription = this.wsService.messages$.subscribe(message => {
      if (message) {
        this.messages.push(message);
      }
    });
  }

  onSearch(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    console.log(keyboardEvent.key)
    if (keyboardEvent.key === 'Enter') {
      if (!this.searchQuery.trim()) {
        this.filteredUsers = [];
        return;
      }
      this.searchSubject.next(this.searchQuery.trim());
    }
  }

  loadUsers(): void {
    this.friendService.searchFriends('').subscribe(chatUsers => {
      this.users = chatUsers.map(chatUser => this.convertToUser(chatUser));
    });
  }

  private convertToUser(chatUser: ChatUser): User {
    return {
      id: chatUser.id,
      userId: chatUser.id,
      username: chatUser.name,
      email: '',
      fullName: chatUser.name,
      avatar: chatUser.avatar,
      role: 'USER',
      isOnline: chatUser.isOnline,
      lastSeen: new Date(),
      requestSentByMe: chatUser.requestSentByMe || false,
      friendStatus: chatUser.friendStatus || 'NONE',
      conversationId: chatUser.conversationId || ''
    };
  }

  sendFriendRequest(user: User): void {
    this.friendService.sendFriendRequest(parseInt(user.id)).subscribe(() => {
      this.loadUsers();
    });
  }

  addFriend(chat: ChatUser): void {
    this.friendService.sendFriendRequest(parseInt(chat.id)).subscribe(() => {
      this.loadUsers();
    });
  }

  acceptFriendRequest(user: ChatUser | User): void {
    const userId = typeof user === 'object' && 'userId' in user ? user.userId : user.id;
    this.friendService.acceptFriendRequest(parseInt(userId)).subscribe(() => {
      this.loadUsers();
    });
  }

  viewProfile(user: User): void {
    this.router.navigate(['/profile', user.username]);
  }

  removeFriend(user: ChatUser): void {
    // Update in onlineUsers array
    const onlineUserIndex = this.onlineUsers.findIndex(u => u.id === user.id);
    if (onlineUserIndex !== -1) {
      this.onlineUsers[onlineUserIndex].friendStatus = FriendStatus.NONE;
    }

    // Update in recentChats array
    const recentChatIndex = this.recentChats.findIndex(u => u.id === user.id);
    if (recentChatIndex !== -1) {
      this.recentChats[recentChatIndex].friendStatus = FriendStatus.NONE;
    }

    // Refresh selected chat if it's the same user
    if (this.selectedChat?.id === user.id) {
      this.selectedChat = { ...this.selectedChat, friendStatus: FriendStatus.NONE };
    }
  }

  rejectFriendRequest(user: ChatUser): void {
    const targetUser = this.onlineUsers.find(u => u.id === user.id) || 
                      this.recentChats.find(u => u.id === user.id);
    if (targetUser) {
      targetUser.friendStatus = FriendStatus.NONE;
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
    
    // If this is a friend from search results, clear search and return to friends list
    if (this.searchQuery && chat.friendStatus === FriendStatus.ACCEPTED) {
      this.searchQuery = '';
      this.filteredUsers = [];
      this.loadUsers(); // Refresh the friends list
    }
  }

  onLogout(): void {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }

  private mapFriendStatus(status: string, requestSentByMe: boolean): FriendStatus {
    switch (status) {
      case 'ACCEPTED': return FriendStatus.ACCEPTED;
      case 'PENDING': return requestSentByMe ? FriendStatus.PENDING_SENT : FriendStatus.PENDING_RECEIVED;
      case 'NONE':
      default: return FriendStatus.NONE;
    }
  }

  sendMessage(content: string): void {
    if (content.trim()) {
      this.wsService.sendMessage({
        content: content,
        type: 'TEXT'
      });
    }
  }

  onProfile(): void {
    this.router.navigate(['/profile']);
  }

  markAsRead(messageId: string, conversationId: string): void {
    this.wsService.markAsRead(messageId, conversationId);
  }

  markAsDelivered(messageId: string, conversationId: string): void {
    this.wsService.markAsDelivered(messageId, conversationId);
  }

  addReaction(messageId: string, conversationId: string, reaction: string): void {
    this.wsService.addReaction(messageId, conversationId, reaction);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
} 