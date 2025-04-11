import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TITLE, PHONE, EMAIL } from '../../constants/infor';
import { TranslationService } from '../../services/translation.service';
import { PATH_LOGIN } from '../../constants/paths';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatButtonModule
  ],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  TITLE = TITLE;
  PHONE = PHONE;
  EMAIL = EMAIL;
  userName: string = 'John Doe'; // Replace with actual user name from your auth service
  notifications: any[] = []; // Replace with your notification type

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private translationService: TranslationService
  ) {}

  getTranslation(key: string): string {
    return this.translationService.getTranslation(key);
  }

  openProfileDialog(): void {
    this.dialog.open(ProfileDialogComponent, {
      width: '500px',
      disableClose: true
    });
  }

  logout(): void {
    // Implement your logout logic here
    this.router.navigate(['/' + PATH_LOGIN]);
  }
}