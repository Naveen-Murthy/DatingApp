import { inject, Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast-service';
import { IUser } from '../../types/user';
import { Message } from '../../types/message';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private hubUrl = environment.hubUrl;
  private toast = inject(ToastService);
  hubConnection?: HubConnection;
  onlineUsers = signal<string[]>([]);

  createHubConnection(user: IUser) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .catch((error) => console.log('Error establishing connection: ', error));

    this.hubConnection.on('UserIsOnline', (userId: string) => {
      this.onlineUsers.update((users) => [...users, userId]);
    });

    this.hubConnection.on('UserIsOffline', (userId: string) => {
      this.onlineUsers.update((users) => users.filter((x) => x !== userId));
    });

    this.hubConnection.on('GetOnlineUsers', (userIds: string[]) => {
      this.onlineUsers.set(userIds);
    });

    this.hubConnection.on('NewMessageReceived', (message: Message) => {
      this.toast.info(
        `New message from ${message.senderDisplayName}: ${message.content}`,
        10000,
        message.senderImageUrl,
        `/members/${message.senderId}/messages`,
      );
    });
  }

  stopConnection() {
    if (this.hubConnection?.state === 'Connected') {
      this.hubConnection.stop().catch((error) => console.log('Error stopping connection: ', error));
    }
  }
}
