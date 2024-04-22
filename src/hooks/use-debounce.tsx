import { useEffect } from "react";

export function useDebounce(fn: () => void, delay: number, args: unknown[]) {
  useEffect(() => {
    const handler = setTimeout(fn, delay);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps --- we don't need static check
  }, args);
}
