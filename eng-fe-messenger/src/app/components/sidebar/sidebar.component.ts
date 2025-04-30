import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SunburstBoxDirective } from '../../directives/sunburst-box.directive';
import { RoughBoxDirective } from '../../directives/rough-box.directive';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  imports: [MatIcon, RoughBoxDirective, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
 constructor(
    private translate: TranslateService,
    private router: Router
  ) {}

  onLogout(): void {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }

  onProfile(): void {    
    // Navigate to login page
    this.router.navigate(['/profile']);
  }

  onChat(): void {    
    // Navigate to login page
    this.router.navigate(['/chat']);
  }


  onPendingFriends(): void {    
    // Navigate to login page
    this.router.navigate(['/friends/pending']);
  }

}
