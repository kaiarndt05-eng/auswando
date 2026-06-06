import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CountryId } from '@/constants/theme';
import { fetchProgress, pushProgress, ensureProfile } from '@/lib/sync';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = '@auswando_v1';

type CompletedSteps = Record<CountryId, string[]>;

export type AppState = {
  selectedCountry: CountryId;
  completedSteps: CompletedSteps;
  emigrationDate: string | null;
  onboardingSeen: boolean;
};

type AppContextType = AppState & {
  loaded: boolean;
  setCountry: (id: CountryId) => void;
  toggleStep: (country: CountryId, stepTitle: string) => void;
  setEmigrationDate: (date: string | null) => void;
  isStepDone: (country: CountryId, stepTitle: string) => boolean;
  markOnboardingSeen: () => void;
};

const defaultState: AppState = {
  selectedCountry: 'pt',
  completedSteps: { pt: [], es: [], ch: [] },
  emigrationDate: null,
  onboardingSeen: false,
};

const AppContext = createContext<AppContextType>({
  ...defaultState,
  loaded: false,
  setCountry: () => {},
  toggleStep: () => {},
  setEmigrationDate: () => {},
  isStepDone: () => false,
  markOnboardingSeen: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  // Load from AsyncStorage immediately, then sync from Supabase in background
  useEffect(() => {
    (async () => {
      // 1. Load local cache first → instant UI
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<AppState>;
          setState(prev => ({
            ...prev,
            selectedCountry: parsed.selectedCountry ?? prev.selectedCountry,
            completedSteps: { ...prev.completedSteps, ...parsed.completedSteps },
            emigrationDate: parsed.emigrationDate ?? null,
            onboardingSeen: parsed.onboardingSeen ?? false,
          }));
        } catch {}
      }
      setLoaded(true);

      // 2. Sync from Supabase in background (overrides local if different)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await ensureProfile(session.user.id, session.user.email);
      const remote = await fetchProgress(session.user.id);
      if (!remote) return;

      setState(prev => {
        const merged: AppState = {
          ...prev,
          selectedCountry: remote.selected_country,
          completedSteps: { ...prev.completedSteps, ...remote.completed_steps },
          emigrationDate: remote.emigration_date,
        };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      });
    })();
  }, []);

  function persist(next: AppState) {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    // Push to Supabase in the background — no await, no blocking
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) pushProgress(session.user.id, next);
    });
  }

  function setCountry(id: CountryId) {
    persist({ ...state, selectedCountry: id });
  }

  function toggleStep(country: CountryId, stepTitle: string) {
    const list = state.completedSteps[country];
    const next = list.includes(stepTitle)
      ? list.filter(t => t !== stepTitle)
      : [...list, stepTitle];
    persist({ ...state, completedSteps: { ...state.completedSteps, [country]: next } });
  }

  function setEmigrationDate(date: string | null) {
    persist({ ...state, emigrationDate: date });
  }

  function isStepDone(country: CountryId, stepTitle: string) {
    return state.completedSteps[country].includes(stepTitle);
  }

  function markOnboardingSeen() {
    persist({ ...state, onboardingSeen: true });
  }

  return (
    <AppContext.Provider value={{ ...state, loaded, setCountry, toggleStep, setEmigrationDate, isStepDone, markOnboardingSeen }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
