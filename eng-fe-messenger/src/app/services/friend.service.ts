import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ChatUser } from '../models/chat.model';
import { FriendSearchResponse, FriendRequest, FriendResponse, PendingFriend } from '../models/friend.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private readonly BASE_URL_FRIEND = `${environment.port}/chat-service/friends`;
  private readonly BASE_URL_CONVERSATIONS = `${environment.port}/chat-service/conversations`;

  constructor(private http: HttpClient, private router: Router) {}

  searchFriends(term: string): Observable<ChatUser[]> {
    return this.http
      .get<FriendSearchResponse>(`${this.BASE_URL_CONVERSATIONS}/friend-all?page=0&size=5&username=${term}`)
      .pipe(
        map(response => response.data.map(user => ({
          id: user.userId.toString(),
          userId: user.userId.toString(),
          username: user.username,  
          avatar: 'assets/avatars/default-avatar.png',
          online: false,
          friendStatus: user.friendStatus,
          conversationId: user.conversationId ? user.conversationId.toString() : '',
          requestSentByMe: user.requestSentByMe
        }))),
        catchError((error) => {
          if (error.status === 401) {
            localStorage.clear();
            sessionStorage.clear();
          }
          return of([]);
        })
      );
  }

  loadFriend(username: string): Observable<ChatUser[]> {
    return this.http
      .get<FriendSearchResponse>(`${this.BASE_URL_CONVERSATIONS}/load-friend?page=0&size=20&username=${username}`)
      .pipe(
        map(response => response.data.map(user => ({
          id: user.userId.toString(),
          userId: user.userId.toString(),
          username: user.username,
          avatar: 'assets/avatars/default-avatar.png',
          online: user.online || false,
          friendStatus: user.friendStatus,
          conversationId: user.conversationId ? user.conversationId.toString() : '',
          requestSentByMe: user.requestSentByMe
        }))),
        catchError((error) => {
          if (error.status === 401) {
            localStorage.clear();
            sessionStorage.clear();
            this.router.navigate(['/login']);
          }
          return of([]);
        })
      );
  }

  getChatUserByConversationId(conversationId: string): Observable<ChatUser[]> {
    return this.http.get<ChatUser[]>(`${this.BASE_URL_CONVERSATIONS}/load-id-conversation?conversationId=${conversationId}`);
  }

  getPendingFriendRequests(): Observable<PendingFriend[]> {
    return this.http.get<PendingFriend[]>(`${this.BASE_URL_FRIEND}/pending`);
  }

  acceptFriendRequest(userId: string): Observable<FriendResponse> {
    return this.http.get<FriendResponse>(`${this.BASE_URL_FRIEND}/accept?requestId=${userId}`);
  }

  rejectFriendRequest(userId: string): Observable<void> {
    return this.http.get<void>(`${this.BASE_URL_FRIEND}/reject?requestId=${userId}`, {});
  }

  sendFriendRequest(userId: string): Observable<FriendResponse> {
    return this.http.get<FriendResponse>(`${this.BASE_URL_FRIEND}/send?receiverId=${userId}`, {});
  }

  cancelFriendRequest(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL_FRIEND}?friendId=${userId}`, {});
  }

  uuidToNumber(uuid: string): bigint {
    const hex = uuid.replace(/-/g, '');
    return BigInt('0x' + hex);
  }
  
  
} 