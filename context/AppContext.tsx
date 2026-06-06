import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CountryId } from '@/constants/theme';

const STORAGE_KEY = '@auswando_v1';

type CompletedSteps = Record<CountryId, string[]>;

export type AppState = {
  selectedCountry: CountryId;
  completedSteps: CompletedSteps;
  emigrationDate: string | null; // 'YYYY-MM'
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

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<AppState>;
          setState({
            selectedCountry: parsed.selectedCountry ?? defaultState.selectedCountry,
            completedSteps: { ...defaultState.completedSteps, ...parsed.completedSteps },
            emigrationDate: parsed.emigrationDate ?? null,
            onboardingSeen: parsed.onboardingSeen ?? false,
          });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  function persist(next: AppState) {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
