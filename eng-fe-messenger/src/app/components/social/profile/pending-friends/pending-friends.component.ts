import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FriendService } from '../../../../services/friend.service';
import { PendingFriend } from '../../../../models/friend.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pending-friends',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, TranslateModule],
  templateUrl: './pending-friends.component.html'
})
export class PendingFriendsComponent implements OnInit {
  pendingRequests: PendingFriend[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private friendService: FriendService, private toastr: ToastrService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.isLoading = true;
    this.friendService.getPendingFriendRequests().subscribe({
      next: (requests) => {
        this.pendingRequests = requests;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  acceptRequest(userId: number): void {
    console.log(userId);
    this.friendService.acceptFriendRequest(userId).subscribe({
      next: () => {
        this.loadPendingRequests()
        this.toastr.warning(
          this.translate.instant('LOGIN.ADD_FRIEND_SUCCESS'),
          this.translate.instant('LOGIN.SUCCESS')
        );
      },
      error: (error) => this.error = error.message
    });
  }

  rejectRequest(userId: number): void {
    this.friendService.rejectFriendRequest(userId).subscribe({
      next: () => this.loadPendingRequests(),
      error: (error) => this.error = error.message
    });
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString();
  }
} 