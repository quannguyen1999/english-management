import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RoughBoxDirective } from '../../../directives/rough-box.directive';
import { WebSocketService } from '../../../services/websocket.service';
import { Subscription } from 'rxjs';
import { ChatUser, Message, FriendStatus } from '../../../models/chat.model';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RoughBoxDirective],
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.scss']
})
export class ChatDetailComponent implements OnInit, OnDestroy {
  @Input() chatUser: ChatUser | null = null;
  @Input() currentUserId: string = '';
  
  messages: Message[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  private subscription: Subscription | null = null;

  constructor(private wsService: WebSocketService) {}

  ngOnInit(): void {
    if (this.chatUser) {
      this.loadMessages();
      this.subscription = this.wsService.messages$.subscribe(message => {
        if (message && message.conversationId === this.chatUser?.conversationId) {
          this.messages.push(message);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadMessages(): void {
    if (!this.chatUser?.conversationId) return;
    
    this.isLoading = true;
    // TODO: Implement message loading from API
    this.isLoading = false;
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.chatUser) return;

    const message: Partial<Message> = {
      content: this.newMessage,
      type: 'TEXT',
      senderId: this.currentUserId,
      receiverId: this.chatUser.id,
      conversationId: this.chatUser.conversationId || '',
      timestamp: new Date().toISOString(),
      status: 'SENT'
    };

    this.wsService.sendMessage(message);
    this.newMessage = '';
  }

  isMessageFromMe(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
} 