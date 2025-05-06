import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';
import { ChatDetailComponent } from './chat-detail/chat-detail.component';
import { RoughBoxDirective } from '../../directives/rough-box.directive';
import { HorizontalScrollDirective } from '../../directives/horizontal-scroll.directive';
import { TranslateModule } from '@ngx-translate/core';
import { ChatUser, Message } from '../../models/chat.model';
import { MatButtonModule } from '@angular/material/button';
import { SunburstBoxDirective } from '../../directives/sunburst-box.directive';
import { ContactsComponent } from '../contacts/contacts.component';
import { MiniChatBoxComponent } from '../mini-chat-box/mini-chat-box.component';
import { FriendService } from '../../services/friend.service';

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
    RouterModule,
    TranslateModule,
    ContactsComponent
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  selectedChat: ChatUser | null = null;
  messages: Message[] = [];
  private subscription: Subscription | null = null;

  constructor(
    private router: Router,
    private wsService: WebSocketService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private friendService: FriendService
  ) {
    // Register the custom icon set
    this.matIconRegistry.setDefaultFontSetClass('material-icons');
  }

  ngOnInit(): void {
    this.subscription = this.wsService.messages$.subscribe(message => {
      if (message) {
        this.messages.push(message);
      }
    });

    this.route.params.subscribe(params => {
      if(params['idConversation']) {
        this.friendService.getChatUserByConversationId(params['idConversation']).subscribe(chatUser => {
          this.selectedChat = chatUser[0];
        });
      }
    });


  }

  onNewChat(): void {
    console.log('New chat clicked');
  }

  onChatSelect(chat: ChatUser): void {
    this.selectedChat = { ...chat };
    this.router.navigate(['/chat', this.selectedChat?.conversationId]);
  }

  onLogout(): void {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate to login page
    this.router.navigate(['/login']);
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

  addReaction(messageId: string, conversationId: string, reaction: string): void {
    this.wsService.addReaction(messageId, conversationId, reaction);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
} 