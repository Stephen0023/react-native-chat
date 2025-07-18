import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Participant } from '../types/chat';

type ChatStore = {
  messages: Message[];
  participants: Participant[];
  sessionUuid: string | null;
  lastMessageUpdateTime: number | null;
  lastParticipantUpdateTime: number | null;
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  setParticipants: (ps: Participant[]) => void;
  setSessionUuid: (uuid: string | null) => void;
  setTimestamps: (msgTime: number | null, partTime: number | null) => void;
  resetStore: () => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      participants: [],
      sessionUuid: null,
      lastMessageUpdateTime: null,
      lastParticipantUpdateTime: null,
      setMessages: (msgs) => set({ messages: msgs }),
      addMessage: (msg) => set((state) => ({ messages: [msg, ...state.messages] })),
      setParticipants: (ps) => set({ participants: ps }),
      setSessionUuid: (uuid) => set({ sessionUuid: uuid }),
      setTimestamps: (msgTime, partTime) => set({ lastMessageUpdateTime: msgTime, lastParticipantUpdateTime: partTime }),
      resetStore: () => set({
        messages: [],
        participants: [],
        sessionUuid: null,
        lastMessageUpdateTime: null,
        lastParticipantUpdateTime: null,
      }),
    }),
    {
      name: 'chat-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
