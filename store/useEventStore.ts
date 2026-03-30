import { create } from 'zustand';
import { EventDraft, GenderMode } from '../types';

interface EventStoreState {
  draft: EventDraft;
  currentStep: number;

  updateDraft: (updates: Partial<EventDraft>) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const INITIAL_DRAFT: EventDraft = {
  theme_id: '',
  title: '',
  host_name: '',
  org_id: null,
  description: '',
  date_time: null,
  date_tbd: false,
  location_name: '',
  location_address: '',
  location_lat: null,
  location_lng: null,
  is_location_hidden: false,
  is_halal_venue: false,
  price: 0,
  capacity: null,
  gender_mode: GenderMode.Mixed,
  is_id_required: false,
  custom_tags: [],
  rsvp_deadline: null,
  virtual_link: '',
  allow_plus_ones: false,
  max_plus_ones: 0,
};

export const useEventStore = create<EventStoreState>((set) => ({
  draft: { ...INITIAL_DRAFT },
  currentStep: 1,

  updateDraft: (updates) =>
    set((state) => ({ draft: { ...state.draft, ...updates } })),

  setStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),

  prevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  reset: () => set({ draft: { ...INITIAL_DRAFT }, currentStep: 1 }),
}));
