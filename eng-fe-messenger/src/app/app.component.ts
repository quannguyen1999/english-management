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
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  canShowSideBar: boolean = false;
  currentUser: UserProfile | null = null;

  constructor(public headerService: HeaderService,
    private router: Router,
    private userService: UserService
  ) {
    this.userService.getUserProfile().subscribe((user) => {
      this.currentUser = user;
    });
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
}
