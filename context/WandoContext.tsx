import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WandoMessage } from '@/constants/wandoMessages';

const SEEN_KEY = '@auswando_wando_seen_v1';

type WandoContextType = {
  current: WandoMessage | null;
  say: (message: WandoMessage) => void;
  sayOnce: (message: WandoMessage) => void;
  dismiss: () => void;
  /** Dev-only: forgets which messages were already shown, so Wando introduces everything again. */
  resetSeen: () => Promise<void>;
};

const WandoContext = createContext<WandoContextType>({
  current: null,
  say: () => {},
  sayOnce: () => {},
  dismiss: () => {},
  resetSeen: async () => {},
});

export function WandoProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<WandoMessage[]>([]);
  const seen = useRef<Set<string>>(new Set());
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SEEN_KEY);
        if (raw) seen.current = new Set(JSON.parse(raw));
      } catch {}
      hydrated.current = true;
    })();
  }, []);

  function say(message: WandoMessage) {
    setQueue(q => (q.some(m => m.id === message.id) ? q : [...q, message]));
  }

  function sayOnce(message: WandoMessage) {
    if (!hydrated.current || seen.current.has(message.id)) return;
    seen.current.add(message.id);
    AsyncStorage.setItem(SEEN_KEY, JSON.stringify([...seen.current]));
    say(message);
  }

  function dismiss() {
    setQueue(q => q.slice(1));
  }

  async function resetSeen() {
    seen.current = new Set();
    await AsyncStorage.removeItem(SEEN_KEY);
    setQueue([]);
  }

  return (
    <WandoContext.Provider value={{ current: queue[0] ?? null, say, sayOnce, dismiss, resetSeen }}>
      {children}
    </WandoContext.Provider>
  );
}

export const useWando = () => useContext(WandoContext);
