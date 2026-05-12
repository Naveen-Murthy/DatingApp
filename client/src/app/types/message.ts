export type Message = {
  id: string;
  senderId: string;
  senderDisplayName: string;
  senderImageUrl: string;
  recipientId: string;
  recipientDisplayName: string;
  recipientImageUrl: string;
  content: string;
  dateRead?: string;
  messageSent: string;
  currentUserSender?: boolean;
};

export class MessagesParams {
  pageNumber = 1;
  pageSize = 5;
  container = 'Inbox';
}
