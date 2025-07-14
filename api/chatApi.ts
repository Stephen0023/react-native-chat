// Simple chat API utility for fetching and sending messages
import type { Message } from '../store/useChatStore';
import type { Participant } from '../store/useParticipantsStore';

const API_BASE = 'https://dummy-chat-server.tribechat.com/api';

export const fetchLatestMessages = async (): Promise<Message[]> => {
  const res = await fetch(`${API_BASE}/messages/latest`);
  if (!res.ok) throw new Error('Failed to fetch latest messages');
  return res.json();
};

export const fetchAllMessages = async (): Promise<Message[]> => {
  const res = await fetch(`${API_BASE}/messages/all`);
  if (!res.ok) throw new Error('Failed to fetch all messages');
  return res.json();
};

export const sendMessage = async (text: string): Promise<Message> => {
  const res = await fetch(`${API_BASE}/messages/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
};

export const fetchParticipants = async (): Promise<Participant[]> => {
  const res = await fetch(`${API_BASE}/participants/all`);
  if (!res.ok) throw new Error('Failed to fetch participants');
  return res.json();
};
