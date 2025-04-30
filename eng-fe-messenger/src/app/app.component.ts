import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { HeaderService } from './services/header.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { filter } from 'rxjs/operators';
import { ProfileComponent } from "./components/social/profile/profile.component";
import { UserService } from './services/user.service';
import { User, UserProfile } from './models/user.model';
import { ContactsComponent } from "./components/contacts/contacts.component";
import { SunburstBoxDirective } from './directives/sunburst-box.directive';
import { AngerBoxDirective } from './directives/anger-box.directive';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from "./components/auth/login/login.component";
import { RoughBoxDirective } from './directives/rough-box.directive';
import { ChatUser, Message } from './models/chat.model';
import { MiniChatBoxComponent } from './components/mini-chat-box/mini-chat-box.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, ContactsComponent, ContactsComponent, RoughBoxDirective, MiniChatBoxComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLoggedIn: boolean = false;
  canShowSideBar: boolean = false;
  currentUser: UserProfile | null = null;

  openMiniChats: { user: ChatUser, messages: Message[], isOpen: boolean }[] = [];

  get openChats(): ChatUser[] {
    return this.openMiniChats
      .filter(chat => chat.isOpen)
      .map(chat => chat.user);
  }

  constructor(public headerService: HeaderService,
    private router: Router,
    private userService: UserService
  ) {
    if(localStorage.getItem('token') && localStorage.getItem('user') == null){
      this.userService.getUserProfile().subscribe((user) => {
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
      });
    }
    // Subscribe to router events to detect route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Check if current route is login page
      if(event.url.includes('/login') || event.url.includes('/register') || event.url.includes('/chat')){
        this.canShowSideBar = true
      } else{
        this.canShowSideBar = false
      }
    });
  }

  onChatSelect(chat: ChatUser): void {
    const existingChat = this.openMiniChats.find(c => c.user.id === chat.id);
    if (existingChat) {
      existingChat.isOpen = true;
    } else {
      this.openMiniChats.push({ user: chat, messages: [], isOpen: true });
    }
  }

  closeMiniChat(userId: string): void {
    const chatIndex = this.openMiniChats.findIndex(c => c.user.id === userId);
    if (chatIndex !== -1) {
      this.openMiniChats[chatIndex].isOpen = false;
    }
  }
}
