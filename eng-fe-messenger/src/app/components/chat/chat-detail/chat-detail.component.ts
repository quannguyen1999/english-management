import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoughBoxDirective } from '../../../directives/rough-box.directive';
import { MessageRoughBoxDirective } from '../../../directives/message-rough-box.directive';
import { ImageBoxDirective } from '../../../directives/image-box.directive';
import { SunburstBoxDirective } from '../../../directives/sunburst-box.directive';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';
import { GifPickerComponent } from '../gif-picker/gif-picker.component';
import { HttpClientModule } from '@angular/common/http';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  isImage?: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  friendStatus: 'none' | 'friend' | 'pending_sent' | 'pending_received';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RoughBoxDirective, 
    MessageRoughBoxDirective, 
    ImageBoxDirective, 
    SunburstBoxDirective,
    PickerModule,
    PickerComponent,
    GifPickerComponent,
    HttpClientModule
  ],
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.scss']
})
export class ChatDetailComponent implements OnChanges {
  @Input() selectedChat: ChatUser | null = null;
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  currentUser = {
    name: 'Em 🌻',
    avatar: 'assets/avatars/user1.jpg',
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
      content: 'assets/avatars/user1.jpg',
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

  showEmojiPicker = false;
  showGifPicker = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedChat'] && changes['selectedChat'].currentValue) {
      // Update the current user info when selected chat changes
      this.currentUser = {
        name: this.selectedChat?.name || '',
        avatar: this.selectedChat?.avatar || '',
        isOnline: this.selectedChat?.isOnline || false
      };
    }
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedChat) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      content: this.newMessage,
      timestamp: new Date().toLocaleString(),
      isMe: true
    };
    
    this.messages.push(newMsg);
    this.newMessage = '';
    this.scrollToBottom();
  }

  canSendMessage(): boolean {
    return this.selectedChat?.friendStatus === 'friend';
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  onEmojiSelected(event: any) {
    this.newMessage += event.emoji.native;
    this.showEmojiPicker = false;
  }

  toggleGifPicker() {
    this.showGifPicker = !this.showGifPicker;
    this.showEmojiPicker = false;
  }

  onGifSelected(gifUrl: string) {
    if (!this.selectedChat) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      content: gifUrl,
      timestamp: new Date().toLocaleString(),
      isMe: true,
      isImage: true
    };
    
    this.messages.push(newMsg);
    this.scrollToBottom();
  }
} 