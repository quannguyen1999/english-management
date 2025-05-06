import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RoughBoxDirective } from '../../../directives/rough-box.directive';
import { WebSocketService } from '../../../services/websocket.service';
import { filter, Subscription, switchMap } from 'rxjs';
import { ChatUser, Message, FriendStatus } from '../../../models/chat.model';
import { MessageService } from '../../../services/message.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Route } from '@angular/router';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RoughBoxDirective],
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.scss']
})
export class ChatDetailComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  messages: Message[] = [];
  newMessage: string = '';
  conversationId : string = '';
  isLoading: boolean = false;
  private subscription: Subscription | null = null;
  private shouldScroll = false;
  @Input() chatUser: ChatUser | null = null;

  // Infinite scroll state
  currentPage = 0;
  pageSize = 20;
  allMessagesLoaded = false;
  isFetching = false;

  // Typing indicator state
  isOtherUserTyping = false;
  typingUserName: string | null = null;
  private typingSubscription: Subscription | any;
  private typingTimeout: any;

  constructor(
    private wsService: WebSocketService, 
    private messageService: MessageService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        this.conversationId = params['idConversation'];
        this.loadMessages();
        this.wsService.subscribeToConversation(this.conversationId || '');
        
        return this.wsService.messages$;
      }),
      filter(message => message && message.conversationId === this.conversationId)
    ).subscribe(message => {
      this.messages.push(message);
      this.shouldScroll = true;
    });
    this.wsService.subscribeToTyping(this.conversationId || '');

    this.wsService.typing$.subscribe(data => {  
      try {
        // Ignore own typing events
        if (data.userId === this.userService.getIdOfUser()) return;
        this.isOtherUserTyping = !!data.typing;
        this.typingUserName = data.username || null;
        if (this.isOtherUserTyping) {
            if (this.typingTimeout) clearTimeout(this.typingTimeout);
                this.typingTimeout = setTimeout(() => {
                  this.isOtherUserTyping = false;
                  this.typingUserName = null;
            }, 3000);
        }
      } catch (e) {}
    });
  }
  

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  private scrollToBottom(): void {
    try {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  private loadMessages(): void {
    this.isLoading = true;
    this.messageService.loadMessage(this.conversationId || '', 0, this.pageSize).subscribe(data => {
      this.messages = data.data;
      this.isLoading = false;
      this.shouldScroll = true;
      this.currentPage = 0;
      this.allMessagesLoaded = data.data.length < this.pageSize;
    });
  }

  onScroll() {
    const element = this.messagesContainer.nativeElement;
    if (element.scrollTop === 0 && !this.isFetching && !this.allMessagesLoaded) {
      this.fetchOlderMessages();
    }
  }

  fetchOlderMessages() {
    if (!this.conversationId) return;
    this.isFetching = true;
    const nextPage = this.currentPage + 1;
    const prevScrollHeight = this.messagesContainer.nativeElement.scrollHeight;
    this.messageService.loadMessage(this.conversationId, nextPage * this.pageSize, this.pageSize)
      .subscribe(data => {
        const newMessages = data.data;
        if (newMessages.length === 0) {
          this.allMessagesLoaded = true;
        } else {
          this.messages = [...newMessages, ...this.messages];
          this.currentPage = nextPage;
          // Restore scroll position after prepending
          setTimeout(() => {
            const element = this.messagesContainer.nativeElement;
            element.scrollTop = element.scrollHeight - prevScrollHeight;
          });
        }
        this.isFetching = false;
      }, () => {
        this.isFetching = false;
      });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.conversationId) return;

    const message: Message = {
      content: this.newMessage,
      type: 'TEXT',
      conversationId: this.conversationId || ''
    };
    this.messageService.sendMessage(message).subscribe(message => {
      this.shouldScroll = true;
    });
    this.newMessage = '';
  }

  isMessageFromMe(message: Message): boolean {
    return message.senderId === this.userService.getIdOfUser();
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Send typing event
  onTyping() {
    if (!this.conversationId) return;
    const payload = {
      userId: this.userService.getIdOfUser(),
      username: this.userService.getCurrentUsername(),
      typing: true
    };
    this.wsService.stompClient?.publish({
      destination: `/app/conversations/${this.conversationId}/typing`,
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
} 