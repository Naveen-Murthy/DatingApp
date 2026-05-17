import {
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { MessageService } from '../../../core/services/message-service';
import { Message } from '../../../types/message';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';
import { FormsModule } from '@angular/forms';
import { PresenceService } from '../../../core/services/presence-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-messages',
  imports: [DatePipe, TimeAgoPipe, FormsModule],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css',
})
export class MemberMessages implements OnInit, OnDestroy {
  private memberService = inject(MemberService);
  protected messageService = inject(MessageService);
  protected presenceService = inject(PresenceService);
  private router = inject(ActivatedRoute);
  messageContent = signal<string>('');
  private messagesEndReference = viewChild<ElementRef<HTMLElement>>('messagesEndRef');

  constructor() {
    effect(() => {
      const currentMessages = this.messageService.messageThread();
      if (currentMessages.length) {
        this.scrollToBottom();
      }
    });
  }

  ngOnInit(): void {
    this.router.parent?.paramMap.subscribe({
      next: (params) => {
        const otherUserId = params.get('id');
        if (!otherUserId) throw new Error('Cannot find other user id');
        this.messageService.createHubConnection(otherUserId);
      },
    });
  }

  sendMessage() {
    const recipientId = this.memberService.member()?.id;
    if (!recipientId) return;
    this.messageService.sendMessage(recipientId, this.messageContent())?.then(() => {
      this.messageContent.set('');
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesEndReference()!.nativeElement.scrollIntoView({ behavior: 'smooth' });
    });
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }
}
