import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RoughBoxDirective } from '../../../directives/rough-box.directive';
import { WebSocketService } from '../../../services/websocket.service';
import { filter, Subscription, switchMap } from 'rxjs';
import { ChatUser, Message, FriendStatus, MessageTypingResponse } from '../../../models/chat.model';
import { MessageService } from '../../../services/message.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Route } from '@angular/router';
import { GifPickerComponent } from '../gif-picker/gif-picker.component';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RoughBoxDirective, GifPickerComponent],
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

  // Audio recording state
  isRecording = false;
  audioPreviewUrl: string | null = null;
  audioBlob: Blob | null = null;
  recordingTime = 0;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingInterval: any;

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
      this.messages = data.data.reverse();
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
    this.messageService.loadMessage(this.conversationId, nextPage, this.pageSize)
      .subscribe(data => {
        const newMessages = data.data.reverse();
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

  sendMessage(message: Message): void {
    if (!this.conversationId) return;
    this.messageService.sendMessage(message).subscribe(message => {
      this.shouldScroll = true;
    });
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
    this.wsService.publishTyping(this.conversationId, payload);
  }

  onGifSelected(gifUrl: string) {
    // Create a message with the GIF URL
    const message: Message = {
      content: gifUrl,
      type: 'GIF',
      conversationId: this.conversationId || '',
      replyTo: this.chatUser?.id || ''
    };
    this.sendMessage(message);
  }

  onGifPickerClose() {
    // Handle GIF picker close if needed
  }

  sendTextMessage(): void {
    if (!this.newMessage.trim() || !this.conversationId) return;

    const message: Message = {
      conversationId: this.conversationId || '',
      content: this.newMessage,
      type: 'TEXT'
    };

    this.sendMessage(message);
    this.newMessage = '';
  }

  startRecording() {
    this.isRecording = true;
    this.audioPreviewUrl = null;
    this.audioBlob = null;
    this.recordingTime = 0;
    this.audioChunks = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };
        this.mediaRecorder.onstop = () => {
          this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.audioPreviewUrl = URL.createObjectURL(this.audioBlob);
        };
        this.mediaRecorder.start();
        this.recordingInterval = setInterval(() => {
          this.recordingTime += 1000;
        }, 1000);
      })
      .catch(() => {
        this.isRecording = false;
        alert('Microphone access denied.');
      });
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      clearInterval(this.recordingInterval);
    }
  }

  cancelRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    this.isRecording = false;
    this.audioPreviewUrl = null;
    this.audioBlob = null;
    this.audioChunks = [];
    this.recordingTime = 0;
    clearInterval(this.recordingInterval);
  }

  sendAudioMessage() {
    if (!this.audioBlob || !this.conversationId) return;
    // You may want to upload the audioBlob to your server and get a URL
    // For demo, we'll use a local blob URL
    const senderId = this.userService.getIdOfUser();
    if (!senderId) return;
    const message: Message = {
      content: this.audioPreviewUrl || '', // Replace with uploaded URL in production
      type: 'AUDIO',
      senderId,
      receiverId: this.chatUser?.id || '',
      conversationId: this.conversationId || ''
    };
    this.sendMessage(message);
    this.audioPreviewUrl = null;
    this.audioBlob = null;
    this.audioChunks = [];
    this.recordingTime = 0;
  }
} 