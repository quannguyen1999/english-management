import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ChatUser, FriendStatus } from '../../models/chat.model';
import { UserService } from '../../services/user.service';
import { FriendService } from '../../services/friend.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { WebSocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {
  searchQuery: string = '';
  onlineUsers: ChatUser[] = [];
  recentChats: ChatUser[] = [];
  selectedChat: ChatUser | null = null;
  filteredUsers: ChatUser[] = [];
  isLoading: boolean = false;
  private searchSubject = new Subject<string>();
  FriendStatus = FriendStatus;

  @Input() openChats: ChatUser[] = [];
  @Output() userSelected = new EventEmitter<ChatUser>();

  constructor(
    private userService: UserService,
    private friendService: FriendService,
    private websocketService: WebSocketService
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
          id: user.userId || '',
          username: user.username || '',
          avatar: 'assets/avatars/default-avatar.png',
          online: false,
          friendStatus: this.mapFriendStatus(user.friendStatus || 'NONE', user.requestSentByMe || false),
          lastMessage: '',
          lastMessageTime: '',
          conversationId: user.conversationId || '',
          requestSentByMe: user.requestSentByMe || false
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.filteredUsers = [];
      }
    });
  }

  onChatSelect(chat: ChatUser): void {
    this.userSelected.emit(chat);    
  }

  isChatOpen(chat: ChatUser): boolean {
    return this.openChats.some(openChat => openChat.id === chat.id);
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  onSearch(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter') {
      if (!this.searchQuery.trim()) {
        this.filteredUsers = [];
        return;
      }
      this.searchSubject.next(this.searchQuery.trim());
    }
  }

  loadUsers(): void {
    if(localStorage.getItem('token')){
      this.friendService.loadFriend('').subscribe(chatUsers => {
        chatUsers.forEach(user => {
          this.websocketService.subscribeStatusUserOnline(user.userId || '');
        });
        this.onlineUsers = chatUsers.map(chatUser => {
          return this.convertToUser(chatUser);
        });
        this.recentChats = this.onlineUsers;
      });

      this.websocketService.statusUser$.subscribe(statusUser => {
        // console.log('statusUser: ', statusUser);
        const onlineUserIndex = this.onlineUsers.findIndex(u => u.id === statusUser.userId);
        // console.log('onlineUserIndex: ', onlineUserIndex);
        if (onlineUserIndex !== -1) {
          console.log('statusUser: ', statusUser);

          this.onlineUsers[onlineUserIndex].online = statusUser.online || false;
          console.log('this.onlineUsers[onlineUserIndex].isOnline: ', this.onlineUsers[onlineUserIndex].online);
        }
      });
    }
  }

  private convertToUser(chatUser: ChatUser): ChatUser {
    return {
      id: chatUser.id,
      username: chatUser.username,
      avatar: chatUser.avatar || 'assets/avatars/default-avatar.png',
      online: chatUser.online || false,
      friendStatus: chatUser.friendStatus || FriendStatus.NONE,
      lastMessage: chatUser.lastMessage || '',
      lastMessageTime: chatUser.lastMessageTime || '',
      conversationId: chatUser.conversationId || '',
      requestSentByMe: chatUser.requestSentByMe || false
    };
  }

  addFriend(chat: ChatUser): void {
    this.friendService.sendFriendRequest(chat.id).subscribe(() => {
      this.loadUsers();
    });
  }

  acceptFriendRequest(user: ChatUser | User): void {
    const userId = typeof user === 'object' && 'userId' in user ? user.userId : user.id;
    if (userId) {
      this.friendService.acceptFriendRequest(userId).subscribe(() => {
        this.loadUsers();
      });
    }
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
  }

  rejectFriendRequest(user: ChatUser): void {
    // Implementation for rejecting friend request
  }

  private mapFriendStatus(status: string, requestSentByMe: boolean): FriendStatus {
    switch (status) {
      case 'ACCEPTED': return FriendStatus.ACCEPTED;
      case 'PENDING': return requestSentByMe ? FriendStatus.PENDING_SENT : FriendStatus.PENDING_RECEIVED;
      case 'NONE':
      default: return FriendStatus.NONE;
    }
  }
}
