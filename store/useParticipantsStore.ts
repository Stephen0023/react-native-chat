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
    { name: 'participants-storage' }
  )
);
