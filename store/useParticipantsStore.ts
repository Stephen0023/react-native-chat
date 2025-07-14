import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Participant = {
  uuid: string;
  name: string;
  avatarUrl?: string;
};

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
