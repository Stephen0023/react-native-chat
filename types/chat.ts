// Message and Participant type definitions for the chat app

export type Message = {
  uuid: string;
  text: string;
  authorUuid: string;
  sentAt: number;
  updatedAt?: number;
  imageUrl?: string;
  reactions?: any[] | Record<string, number>;
  replyToMessage?: string;
  attachments?: Array<{
    uuid: string;
    type: string;
    imageUrl?: string;
    url?: string;
  }>;
};

export type Participant = {
  uuid: string;
  name: string;
  avatarUrl?: string;
  jobTitle?: string;
  bio?: string;
  email?: string;
};

export type MessageGroup = {
  type: 'group';
  groupId: string;
  participant?: Participant;
  messages: Message[];
  key: string;
}; 