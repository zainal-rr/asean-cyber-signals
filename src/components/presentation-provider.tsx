"use client";

import * as React from "react";

type PresentationContextValue = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

const STORAGE_KEY = "presentation-mode";
const CHANGE_EVENT = "asean-presentation-mode-change";

const PresentationContext = React.createContext<PresentationContextValue | null>(
  null,
);

export function PresentationProvider({ children }: { children: React.ReactNode }) {
  const enabled = React.useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener(CHANGE_EVENT, onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener(CHANGE_EVENT, onStoreChange);
      };
    },
    () => sessionStorage.getItem(STORAGE_KEY) === "true",
    () => false,
  );

  const setEnabled = React.useCallback((next: boolean) => {
    sessionStorage.setItem(STORAGE_KEY, String(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return (
    <PresentationContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentationMode() {
  const value = React.useContext(PresentationContext);
  if (!value) {
    throw new Error("usePresentationMode must be used within PresentationProvider");
  }
  return value;
}
