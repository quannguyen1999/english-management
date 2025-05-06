import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ChatUser, Message, MessageResponse, MessageResponsePage } from '../models/chat.model';
import { FriendSearchResponse, FriendRequest, FriendResponse, PendingFriend } from '../models/friend.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly BASE_URL_MESSAGES = `${environment.port}/chat-service/messages`;

  constructor(private http: HttpClient, private router: Router) {}

  sendMessage(message: Message): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(`${this.BASE_URL_MESSAGES}`, message)
      .pipe(
        map(response => response),
        catchError((error) => {
          if (error.status === 401) {
            localStorage.clear();
            sessionStorage.clear();
            this.router.navigate(['/login']);
          }
          throw error;
        })
      );
  }

  loadMessage(conversationId: string, page: number, size: number): Observable<MessageResponsePage> {
    return this.http.get<MessageResponsePage>(`${this.BASE_URL_MESSAGES}?conversationId=${conversationId}&page=${page}&size=${size}`);
  }

 
  
  
} 