import { create } from 'zustand';
import { EventDraft, GenderMode } from '../types';

/**
 * DAW-37 / DAW-55 — creation V2 store.
 *
 * The preview-led editor drives every field via `updateDraft`, and the
 * active tool sheet is tracked so the editor canvas can highlight / dim
 * the corresponding zone. `EditorToolId` matches the preview zones in
 * `components/EventPreview.tsx` plus an explicit `publish` slot for the
 * final review sheet.
 *
 * DAW-55 removed the legacy wizard `currentStep / nextStep / prevStep /
 * setStep` stubs along with the 6 step files that relied on them.
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

  reset: () => set({ draft: { ...INITIAL_DRAFT }, activeTool: null }),
}));
