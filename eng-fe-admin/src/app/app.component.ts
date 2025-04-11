import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { SidebarService } from './services/sidebar.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SideBarComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isExpanded = false;

  constructor(private sidebarService: SidebarService) {
    this.sidebarService.isExpanded$.subscribe(
      expanded => this.isExpanded = expanded
    );
  }

  isLoginPage(): boolean {
    return window.location.pathname === '/login' || window.location.pathname === '/register';
  }


}
