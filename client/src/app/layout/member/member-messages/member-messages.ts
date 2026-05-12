import { Component, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { MessageService } from '../../../core/services/message-service';
import { Message } from '../../../types/message';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-messages',
  imports: [DatePipe, TimeAgoPipe, FormsModule],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css',
})
export class MemberMessages implements OnInit {
  private memberService = inject(MemberService);
  private messageService = inject(MessageService);
  protected messages = signal<Message[]>([]);
  protected messssageContent = '';
  private messagesEndReference = viewChild<ElementRef<HTMLElement>>('messagesEndRef');

  constructor() {
    effect(() => {
      const currentMessages = this.messages();
      if (currentMessages.length) {
        this.scrollToBottom();
      }
    });
  }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    const memberId = this.memberService.member()?.id;
    if (!memberId) return;
    this.messageService.getMessageThread(memberId).subscribe({
      next: (messages) => {
        this.messages.set(
          messages.map((message) => ({
            ...message,
            currentUserSender: message.senderId != memberId,
          })),
        );
      },
    });
  }

  sendMessage() {
    const recipientId = this.memberService.member()?.id;
    if (!recipientId) return;
    this.messageService.sendMessage(recipientId, this.messssageContent).subscribe({
      next: (message) => {
        this.messages.update((messages) => {
          message.currentUserSender = true;
          return [...messages, message];
        });
        this.messssageContent = '';
      },
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesEndReference()!.nativeElement.scrollIntoView({ behavior: 'smooth' });
    });
  }
}
