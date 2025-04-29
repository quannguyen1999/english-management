import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SunburstBoxDirective } from '../../directives/sunburst-box.directive';
import { RoughBoxDirective } from '../../directives/rough-box.directive';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChatUser, Post, SuggestedFriend, FriendStatus } from '../../models/chat.model';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-social',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss']
})
export class SocialComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;

  posts: Post[] = [
    {
      id: '1',
      content: 'Just finished my first marathon! 🏃‍♂️',
      author: {
        id: '2',
        name: 'Jane Smith',
        avatar: 'assets/images/avatars/avatar-2.png',
        isOnline: true,
        friendStatus: FriendStatus.ACCEPTED
      },
      timestamp: new Date(),
      likes: 42,
      comments: 8,
      shares: 3,
      image: 'assets/images/posts/marathon.jpg'
    },
    {
      id: '2',
      content: 'Beautiful sunset at the beach 🌅',
      author: {
        id: '3',
        name: 'Mike Johnson',
        avatar: 'assets/images/avatars/avatar-3.png',
        isOnline: false,
        friendStatus: FriendStatus.ACCEPTED
      },
      timestamp: new Date(),
      likes: 28,
      comments: 5,
      shares: 1,
      image: 'assets/images/posts/sunset.jpg'
    }
  ];

  suggestedFriends: SuggestedFriend[] = [
    {
      id: '4',
      name: 'Sarah Wilson',
      avatar: 'assets/images/avatars/avatar-4.png',
      mutualFriends: 5,
      friendStatus: FriendStatus.NONE
    },
    {
      id: '5',
      name: 'David Brown',
      avatar: 'assets/images/avatars/avatar-5.png',
      mutualFriends: 3,
      friendStatus: FriendStatus.PENDING_SENT
    }
  ];

  FriendStatus = FriendStatus;

  constructor(
    private translate: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize component
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  onLike(post: Post): void {
    post.likes++;
  }

  onComment(post: Post): void {
    post.comments++;
  }

  onShare(post: Post): void {
    post.shares++;
  }

  onAddFriend(friend: SuggestedFriend): void {
    friend.friendStatus = FriendStatus.PENDING_SENT;
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  sharePost(post: Post): void {
    post.shares++;
  }

  likePost(post: Post): void {
    post.likes++;
  }

  createPost(): void {
    // const newPost: Post = {
    //   id: Date.now().toString(),
    //   content: 'New post content',
    //   author: null,
    //   timestamp: new Date(),
    //   likes: 0,
    //   comments: 0,
    //   shares: 0
    // };
    // this.posts.unshift(newPost);
  }

  commentPost(post: Post): void {
    post.comments++;
  }
} 