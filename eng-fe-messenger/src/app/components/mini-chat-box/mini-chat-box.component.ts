import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatUser, Message } from '../../models/chat.model';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RoughBoxDirective } from '../../directives/rough-box.directive';

@Component({
  selector: 'app-mini-chat-box',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, RoughBoxDirective],
  templateUrl: './mini-chat-box.component.html',
  styleUrls: ['./mini-chat-box.component.scss']
})
export class MiniChatBoxComponent {
  @Input() user!: ChatUser;
  @Input() messages: Message[] = [];
  @Input() isOpen: boolean = true;
  @Output() close = new EventEmitter<void>();

  newMessage: string = '';

  sendMessage() {
    if (this.newMessage.trim()) {
      // Emit or handle sending message logic here
      this.newMessage = '';
    }
  }

  onClose() {
    this.close.emit();
  }
} 