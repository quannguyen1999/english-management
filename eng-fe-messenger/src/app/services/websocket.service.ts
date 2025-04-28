import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Message } from '../models/chat.model';

interface WebSocketMessage {
  type: string;
  payload: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<WebSocketMessage> | null = null;
  private messageSubject = new BehaviorSubject<Message | null>(null);
  public messages$ = this.messageSubject.asObservable();

  constructor() {
    this.connect();
  }

  private connect(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found');
      return;
    }

    this.socket$ = webSocket<WebSocketMessage>({
      url: `${environment.port}/chat-service/ws`,
      protocol: ['access_token', token]
    });

    this.socket$.subscribe({
      next: (message) => {
        console.log('Received message:', message);
        this.messageSubject.next(message.payload);
      },
      error: (err) => {
        console.error('WebSocket error:', err);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      },
      complete: () => {
        console.log('WebSocket connection closed');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      }
    });
  }

  public sendMessage(message: Partial<Message>): void {
    if (this.socket$) {
      this.socket$.next({
        type: 'SEND_MESSAGE',
        payload: message
      });
    }
  }

  public markAsRead(messageId: string, conversationId: string): void {
    if (this.socket$) {
      this.socket$.next({
        type: 'MARK_AS_READ',
        payload: { messageId, conversationId }
      });
    }
  }

  public markAsDelivered(messageId: string, conversationId: string): void {
    if (this.socket$) {
      this.socket$.next({
        type: 'MARK_AS_DELIVERED',
        payload: { messageId, conversationId }
      });
    }
  }

  public addReaction(messageId: string, conversationId: string, reaction: string): void {
    if (this.socket$) {
      this.socket$.next({
        type: 'ADD_REACTION',
        payload: { messageId, conversationId, reaction }
      });
    }
  }

  public disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
  }
} 