import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SunburstBoxDirective } from '../../directives/sunburst-box.directive';
import { Router } from '@angular/router';
import { FriendService } from '../../services/friend.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChatUser, FriendStatus } from '../../models/chat.model';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RoughBoxDirective } from '../../directives/rough-box.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    SunburstBoxDirective,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    RoughBoxDirective,
    SunburstBoxDirective
  ],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() currentUser: { name: string; avatar: string } | null = null;
  searchForm = new FormGroup({
    searchTerm: new FormControl('')
  });
  searchResults$: Observable<ChatUser[]> | null = null;
  FriendStatus = FriendStatus;
  private destroy$ = new Subject<void>();

  constructor(
    private friendService: FriendService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.searchResults$ = this.searchForm.get('searchTerm')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => term ? this.friendService.searchFriends(term) : of([]))
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  viewProfile(user: ChatUser): void {
    this.router.navigate(['/profile', user.name]);
  }

  onProfile(): void {
    if (this.currentUser) {
      this.router.navigate(['/profile', this.currentUser.name]);
    }
  }

  onPendingFriend(): void {
    this.router.navigate(['/friends/pending']);
  }

  onChat(): void {
    this.router.navigate(['/chat']);
  }

  onLogout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/auth/login']);
  }
} 