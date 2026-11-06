import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface Preferences {
  defaultPage: string;
  tableRows: string;
  layoutDensity: string;
}

const DEFAULT_PREFERENCES: Preferences = {
  defaultPage: "/",
  tableRows: "10",
  layoutDensity: "comfortable",
};

const STORAGE_KEY = "bankvision_preferences";

interface SettingsContextType {
  preferences: Preferences;
  setPreferences: (preferences: Preferences) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

function getSavedPreferences(): Preferences {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return {
        ...DEFAULT_PREFERENCES,
        ...JSON.parse(saved),
      };
    }
  } catch (error) {
    console.error("Unable to load BankVision preferences:", error);
  }

  return DEFAULT_PREFERENCES;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(
    getSavedPreferences
  );

  useEffect(() => {
    const syncPreferences = () => {
      setPreferences(getSavedPreferences());
    };

    window.addEventListener("bankvision-preferences-updated", syncPreferences);

    return () => {
      window.removeEventListener(
        "bankvision-preferences-updated",
        syncPreferences
      );
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      "bankvision-compact",
      preferences.layoutDensity === "compact"
    );
  }, [preferences.layoutDensity]);

  return (
    <SettingsContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useAppSettings must be used inside SettingsProvider");
  }

  return context;
}