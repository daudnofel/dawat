import { create } from 'zustand';
import { EventDraft, GenderMode } from '../types';

/**
 * DAW-37 — creation V2 tool identifiers.
 *
 * Matches the preview zones in `components/EventPreview.tsx` plus an
 * explicit `publish` slot for the final review sheet. The old wizard's
 * `currentStep / nextStep / prevStep / setStep` are deprecated but kept as
 * no-op stubs so the legacy step files don't crash while they're still on
 * disk — DAW-55 removes them for real.
 */
export type EditorToolId =
  | 'poster'
  | 'theme'
  | 'effect'
  | 'details'
  | 'audience'
  | 'publish';

interface EventStoreState {
  draft: EventDraft;

  // DAW-37 — editor tool state
  activeTool: EditorToolId | null;
  openTool: (tool: EditorToolId) => void;
  closeTool: () => void;

  updateDraft: (updates: Partial<EventDraft>) => void;
  reset: () => void;

  // ── Deprecated (DAW-55 will delete) ────────────────────────────────
  // Kept as stubs so the legacy step*.tsx files still compile until the
  // removal ticket lands. New code must not read or call these.
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
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
  // DAW-22 — 3-layer identity system
  poster_url: null,
  poster_type: null,
  poster_library_id: null,
  effect_id: null,
};

export const useEventStore = create<EventStoreState>((set) => ({
  draft: { ...INITIAL_DRAFT },

  // DAW-37 — editor tool state
  activeTool: null,
  openTool: (tool) => set({ activeTool: tool }),
  closeTool: () => set({ activeTool: null }),

  updateDraft: (updates) =>
    set((state) => ({ draft: { ...state.draft, ...updates } })),

  reset: () =>
    set({ draft: { ...INITIAL_DRAFT }, currentStep: 1, activeTool: null }),

  // ── Deprecated stubs (DAW-55) ──────────────────────────────────────
  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 6) })),
  prevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
}));
