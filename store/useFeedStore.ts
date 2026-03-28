import { create } from 'zustand';
import { GenderMode } from '../types';

interface FeedState {
  activeFilter: 'all' | GenderMode;
  setFilter: (filter: 'all' | GenderMode) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  activeFilter: 'all',
  setFilter: (filter) => set({ activeFilter: filter }),
}));
