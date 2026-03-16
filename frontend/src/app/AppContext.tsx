import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Workspace = { id: number; name: string; key: string; description?: string | null; ownerId: number };
export type Project = { id: number; name: string; key: string; description?: string | null; status: string; workspaceId: number; createdById: number };

type Selection = { workspace: Workspace | null; project: Project | null };

type AppContextValue = {
  selection: Selection;
  setWorkspace: (w: Workspace | null) => void;
  setProject: (p: Project | null) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "taskcraft_selection_v1";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = useState<Selection>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { workspace: null, project: null };
      const parsed = JSON.parse(raw) as Selection;
      return { workspace: parsed.workspace ?? null, project: parsed.project ?? null };
    } catch {
      return { workspace: null, project: null };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  }, [selection]);

  const value = useMemo<AppContextValue>(
    () => ({
      selection,
      setWorkspace(w) {
        setSelection((prev) => ({ workspace: w, project: w ? prev.project : null }));
      },
      setProject(p) {
        setSelection((prev) => ({ ...prev, project: p }));
      },
    }),
    [selection],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

