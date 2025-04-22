import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatMenuModule, MatIconModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'eng-fe-messenger';
  helpMenu = [
    { text: 'Help Center', icon: 'help' },
    { text: 'Contact Support', icon: 'contact_support' }
  ];
  notificationMenu = [
    { text: 'New Message', icon: 'message' },
    { text: 'System Update', icon: 'system_update' }
  ];
}
