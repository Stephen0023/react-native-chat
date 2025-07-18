import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Participant } from '../types/chat';

type ParticipantsStore = {
  participants: Participant[];
  setParticipants: (ps: Participant[]) => void;
};

export const useParticipantsStore = create<ParticipantsStore>()(
  persist(
    (set) => ({
      participants: [],
      setParticipants: (ps) => set({ participants: ps }),
    }),
    {
      name: 'participants-storage',
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
