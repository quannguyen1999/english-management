import { Component, Input } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ContactsComponent } from '../../contacts/contacts.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { WebSocketService } from '../../../services/websocket.service';
import { FriendService } from '../../../services/friend.service';
import { UserService } from '../../../services/user.service';
import { SidebarService } from '../../../services/sidebar.service';
import { LoginService } from '../../../services/login.service';
import { ChatUser } from '../../../models/chat.model';
import { RoughBoxDirective } from '../../../directives/rough-box.directive';
@Component({
  selector: 'app-left-side-chat',
  imports: [
    MatIconModule,
    CommonModule,
    TranslateModule,
    ContactsComponent,
    RoughBoxDirective
  ],
  templateUrl: './left-side-chat.component.html',
  styleUrl: './left-side-chat.component.scss'
})
export class LeftSideChatComponent {

  selectedChat: ChatUser | null = null;

  @Input() openChat: boolean = false;

  constructor(
    private router: Router,
    private wsService: WebSocketService,
    private matIconRegistry: MatIconRegistry,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private friendService: FriendService,
    private userService: UserService,
    private sidebarService: SidebarService
  ) {
    // Register the custom icon set
    this.matIconRegistry.setDefaultFontSetClass('material-icons');
  }

  onLogout(): void {
    this.loginService.logout();
   }

  onProfile(): void {
    this.router.navigate(['/profile']);
  }

  onChatSelect(chat: ChatUser): void {
    this.selectedChat = { ...chat };
    this.router.navigate(['/chat', this.selectedChat?.conversationId]);
  }


 
}
