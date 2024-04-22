import { useEffect } from "react";

export function useEscape(onEscape: () => void) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape();
      }
    };
    document.addEventListener("keydown", handle, false);

    return () => {
      document.removeEventListener("keydown", handle, false);
    };
  }, [onEscape]);
}
