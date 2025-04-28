import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RoughBoxDirective } from '../../../directives/rough-box.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserProfile, JwtPayload, PaginatedUserProfileResponse } from '../../../models/profile.model';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule,
    RoughBoxDirective,
    TranslateModule,
    FormsModule
  ]
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;
  isLoading = true;
  error: string | null = null;
  isCurrentUser = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const username = params['username'];
      if (username) {
        this.loadUserProfile(username);
      } else {
        const currentUsername = this.getCurrentUsername();
        if (currentUsername) {
          this.isCurrentUser = true;
          this.loadUserProfile(currentUsername);
        } else {
          this.error = this.translate.instant('PROFILE.LOGIN_REQUIRED');
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  private getCurrentUsername(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      return decodedToken.user;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private loadUserProfile(username: string) {
    this.isLoading = true;
    this.error = null;
    
    const apiUrl = this.isCurrentUser 
      ? `${environment.port}/chat-service/conversations/current-profile`
      : `${environment.port}/chat-service/conversations/friend-all?page=0&size=1&username=${username}`;

    this.http.get<PaginatedUserProfileResponse>(apiUrl)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.error = this.translate.instant('PROFILE.LOAD_ERROR');
          return of(null);
        })
      )
      .subscribe(profile => {
        this.isLoading = false;
        if (profile && Array.isArray(profile.data) && profile.data.length > 0) {
          this.userProfile = profile.data[0];
        } else {
          this.error = this.translate.instant('PROFILE.LOAD_ERROR');
          this.userProfile = null;
        }
      });
  }

  onAddFriend() {
    if (!this.userProfile) return;
    
    this.http.post(`${environment.port}/chat-service/conversations/friend-request`, {
      userId: this.userProfile.userId
    }).subscribe({
      next: () => {
        this.userProfile!.friendStatus = 'PENDING';
        this.userProfile!.requestSentByMe = true;
      },
      error: () => {
        this.error = this.translate.instant('PROFILE.ADD_FRIEND_ERROR');
      }
    });
  }

  onRemoveFriend() {
    if (!this.userProfile) return;
    
    this.http.delete(`${environment.port}/chat-service/conversations/friend/${this.userProfile.userId}`)
      .subscribe({
        next: () => {
          this.userProfile!.friendStatus = 'NONE';
        },
        error: () => {
          this.error = this.translate.instant('PROFILE.REMOVE_FRIEND_ERROR');
        }
      });
  }

  onMessage() {
    if (!this.userProfile) return;
    
    if (this.userProfile.hasConversation && this.userProfile.conversationId) {
      this.router.navigate(['/chat', this.userProfile.conversationId]);
    } else {
      this.http.post(`${environment.port}/chat-service/conversations`, {
        userId: this.userProfile.userId
      }).subscribe({
        next: (response: any) => {
          this.router.navigate(['/chat', response.conversationId]);
        },
        error: () => {
          this.error = this.translate.instant('PROFILE.CREATE_CONVERSATION_ERROR');
        }
      });
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }

  onChangePhoto(): void {
    // TODO: Implement photo upload functionality
    console.log('Change photo clicked');
  }

  onEditProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  onShareProfile(): void {
    if (!this.userProfile) return;
    const profileUrl = `${window.location.origin}/profile/${this.userProfile.username}`;
    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        // Show success message
        console.log('Profile URL copied to clipboard');
      })
      .catch(() => {
        this.error = this.translate.instant('PROFILE.SHARE_ERROR');
      });
  }

  onAcceptFriend() {
    if (!this.userProfile) return;
    
    this.http.post(`${environment.port}/chat-service/conversations/friend-request/accept`, {
      userId: this.userProfile.userId
    }).subscribe({
      next: () => {
        this.userProfile!.friendStatus = 'ACCEPTED';
      },
      error: () => {
        this.error = this.translate.instant('PROFILE.ACCEPT_FRIEND_ERROR');
      }
    });
  }

  onRejectFriend() {
    if (!this.userProfile) return;
    
    this.http.post(`${environment.port}/chat-service/conversations/friend-request/reject`, {
      userId: this.userProfile.userId
    }).subscribe({
      next: () => {
        this.userProfile!.friendStatus = 'REJECTED';
      },
      error: () => {
        this.error = this.translate.instant('PROFILE.REJECT_FRIEND_ERROR');
      }
    });
  }
} 