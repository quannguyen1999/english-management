import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Message, MessageStatusUserResponse, MessageTypingResponse } from '../models/chat.model';
import { Client } from '@stomp/stompjs';

interface WebSocketMessage {
  type: string;
  payload: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private isConnected = false;
  private readonly BASE_URL = `${environment.port}/chat-service`;
  public stompClient: Client | null = null;
  private subscriptions: any[] = [];
  private messageSubject = new Subject<Message>();
  public messages$ = this.messageSubject.asObservable();

  private typingSubject = new Subject<MessageTypingResponse>();
  public typing$ = this.typingSubject.asObservable();

  private statusUserSubject = new Subject<MessageStatusUserResponse>();
  public statusUser$ = this.statusUserSubject.asObservable();

  private connectionAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor() {
    if(localStorage.getItem('token')){
      this.connect();
    }
  }

  private connect(): void {
    const token = localStorage.getItem('token');
    
    this.stompClient = new Client({
      brokerURL: `${this.BASE_URL}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      // debug: function (str) {
      //   console.log('STOMP: ' + str);
      // },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectionTimeout: 10000,
  
      onConnect: (frame) => {
        console.log('STOMP connected:');
        this.isConnected = true;
      },
  
      onStompError: (frame) => {
        console.error('STOMP error:');
        this.isConnected = false;
        this.handleConnectionError();
      }
    });
  
    this.stompClient.onWebSocketClose = (event) => {
      this.isConnected = false;
      this.handleConnectionError();
    };
  
    this.stompClient.onWebSocketError = (event) => {
      console.error('WebSocket error:', event);
      this.isConnected = false;
      this.handleConnectionError();
    };
  
    this.stompClient.onDisconnect = (frame) => {
      console.log('STOMP disconnected:', frame);
      this.isConnected = false;
      this.handleConnectionError();
    };
  
    this.stompClient.activate();
  }

  private handleConnectionError() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];

    this.connectionAttempts++;

    if (this.connectionAttempts <= this.MAX_RECONNECT_ATTEMPTS) {
      console.log(`Attempting to reconnect (attempt ${this.connectionAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`);
      setTimeout(() => {
        this.connect();
      }, 5000);
    } else {
      console.error('Max reconnection attempts reached. Please refresh the page to try again.');
    }
  }

  public subscribeToConversation(conversationId: string) {
    if (!this.stompClient?.connected) {
      console.error('Cannot subscribe: WebSocket is not connected');
      return;
    }

    // Unsubscribe from existing subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];

    // Subscribe to conversation messages
    this.subscribeWithRetry(
      `/topic/conversations/${conversationId}`,
      (message) => {
        try {
          const messageData = JSON.parse(message.body);
          this.messageSubject.next(messageData);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    );
  }

  private subscribeWithRetry(destination: string, callback: (message: any) => void){
    try {
      const subscription = this.stompClient?.subscribe(destination, callback, {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      });
      if (subscription) {
        this.subscriptions.push(subscription);
      }
    } catch (error) {
      console.error(`Failed to subscribe to ${destination}:`, error);
    }
  }

  public subscribeToTyping(conversationId: string) {
    if (!this.stompClient?.connected) {
      console.error('Cannot subscribe: WebSocket is not connected');
      return;
    }

     // Subscribe to conversation messages
     return this.subscribeWithRetry(
      `/topic/conversations/${conversationId}/typing`,
      (data) => {
        try {
          const convert = JSON.parse(data.body);
          this.typingSubject.next(convert);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    );
  }

  public subscribeStatusUserOnline(userId: string) {
    if (!this.stompClient?.connected) {
      console.error('Cannot subscribe: WebSocket is not connected');
      return;
    }

    // console.log('subscribeStatusUserOnline: ', userId);
     // Subscribe to conversation messages
     return this.subscribeWithRetry(
      `/topic/user/${userId}/status`,
      (data) => {
        try {
          const convert = JSON.parse(data.body);
          this.statusUserSubject.next(convert);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    );
  }

  public publishStatusUser(userId: string, online: boolean) {
    if (!this.stompClient?.connected) {
      console.error('Cannot publish: WebSocket is not connected');
      return;
    }
    if(online){
      this.stompClient?.publish({
        destination: `/app/conversations/${userId}/status/online`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    }else{
      this.stompClient?.publish({
        destination: `/app/conversations/${userId}/status/offline`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    }
  }

  public publishTyping(conversationId: string, payload: Object) {
    if (!this.stompClient?.connected) {
      console.error('Cannot publish: WebSocket is not connected');
      return;
    }
    this.stompClient?.publish({
      destination: `/app/conversations/${conversationId}/typing`,
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }


  public sendMessage(message: Partial<Message>): void {
    if (!this.stompClient?.connected) {
      console.error('Cannot send message: WebSocket is not connected');
      return;
    }

    try {
      this.stompClient.publish({
        destination: `/app/conversations/${message.conversationId}/send`,
        body: JSON.stringify(message)
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  public markAsRead(messageId: string, conversationId: string): void {
    if (!this.stompClient?.connected) {
      console.error('Cannot mark as read: WebSocket is not connected');
      return;
    }

    try {
      this.stompClient.publish({
        destination: `/app/conversations/${conversationId}/messages/${messageId}/read`,
        body: JSON.stringify({ messageId, conversationId })
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  public markAsDelivered(messageId: string, conversationId: string): void {
    if (!this.stompClient?.connected) {
      console.error('Cannot mark as delivered: WebSocket is not connected');
      return;
    }

    try {
      this.stompClient.publish({
        destination: `/app/conversations/${conversationId}/messages/${messageId}/delivered`,
        body: JSON.stringify({ messageId, conversationId })
      });
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  }

  public addReaction(messageId: string, conversationId: string, reaction: string): void {
    if (!this.stompClient?.connected) {
      console.error('Cannot add reaction: WebSocket is not connected');
      return;
    }

    try {
      this.stompClient.publish({
        destination: `/app/conversations/${conversationId}/messages/${messageId}/reaction`,
        body: JSON.stringify({ messageId, conversationId, reaction })
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }

  public disconnect(): void {
    if (this.stompClient) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions = [];
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }
} 