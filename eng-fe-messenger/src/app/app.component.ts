import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { HeaderService } from './services/header.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <app-header 
      *ngIf="headerService.showHeader$ | async"
      [currentUser]="currentUser"
      class="app-header">
    </app-header>
    <main 
      class="min-h-screen bg-gray-50"
      [class.pt-16]="headerService.showHeader$ | async"
      [class.pt-0]="!(headerService.showHeader$ | async)">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    main {
      min-height: 100vh;
      background-color: rgb(249, 250, 251);
    }
    .app-header {
      opacity: 0;
      animation: fadeIn 0.3s ease forwards;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `]
})
export class AppComponent {
  currentUser = {
    name: 'John Doe',
    avatar: 'assets/avatars/user1.jpg'
  };

  constructor(public headerService: HeaderService) {}
}
