// Simple chat API utility for fetching and sending messages
import type { Message} from '@/types/chat';
import type { Participant } from '@/types/chat';


const API_BASE = 'https://dummy-chat-server.tribechat.com/api';

export const fetchLatestMessages = async (): Promise<Message[]> => {
  const res = await fetch(`${API_BASE}/messages/latest`);
  const json  = await res.json()
  console.log("res",json)
  if (!res.ok) throw new Error('Failed to fetch latest messages');
  return json.reverse();
};

export const fetchAllMessages = async (): Promise<Message[]> => {
  const res = await fetch(`${API_BASE}/messages/all`);
  const json  = await res.json()
  // console.log("res",json)
  if (!res.ok) throw new Error('Failed to fetch all messages');
  return json.reverse();
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
    const json  = await res.json()
    console.log("participants",JSON.stringify(json))
  return json;
};

export const fetchOlderMessages = async (refMessageUuid: string): Promise<Message[]> => {
  const res = await fetch(`${API_BASE}/messages/older/${refMessageUuid}`);
  if (!res.ok) throw new Error('Failed to fetch older messages');
  return res.json();
};
