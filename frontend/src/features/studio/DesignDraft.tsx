import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DesignState } from "./types";
import type { Studio3DDesign } from "./studio3d";

export interface DesignDraft {
  state: DesignState;
  blob: Blob;
  studio3d?: Studio3DDesign;
}

interface DesignDraftValue {
  draft: DesignDraft | null;
  setDraft: (draft: DesignDraft | null) => void;
  clearDraft: () => void;
}

const DesignDraftContext = createContext<DesignDraftValue | null>(null);

export function DesignDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<DesignDraft | null>(null);
  const previewUrl = useRef<string | null>(null);

  const setDraft = useCallback((next: DesignDraft | null) => {
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    }
    if (!next) {
      setDraftState(null);
      return;
    }
    const url = URL.createObjectURL(next.blob);
    previewUrl.current = url;
    setDraftState({
      state: { ...next.state, previewUrl: url },
      blob: next.blob,
      studio3d: next.studio3d,
    });
  }, []);

  const clearDraft = useCallback(() => setDraft(null), [setDraft]);

  useEffect(() => {
    return () => {
      if (previewUrl.current) {
        URL.revokeObjectURL(previewUrl.current);
        previewUrl.current = null;
      }
    };
  }, []);

  const value = useMemo<DesignDraftValue>(
    () => ({ draft, setDraft, clearDraft }),
    [draft, setDraft, clearDraft],
  );

  return <DesignDraftContext.Provider value={value}>{children}</DesignDraftContext.Provider>;
}

export function useDesignDraft(): DesignDraftValue {
  const context = useContext(DesignDraftContext);
  if (!context) throw new Error("useDesignDraft must be used inside DesignDraftProvider");
  return context;
}
