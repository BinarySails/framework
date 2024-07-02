import { useCallback, useEffect, useState, useRef } from "react";

interface PollingOptions {
  interval: number;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

interface PollingResult<Data> {
  data: Data | null;
  loading: boolean;
  error: Error | null;
  cancel: () => void;
}

function usePolling<Data>(
  callback: () => Promise<Data>,
  options: PollingOptions,
): PollingResult<Data> {
  const { interval, onError, disabled } = options;
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // we use ref instead of state to avoid re-rendering
  const intervalId = useRef<NodeJS.Timeout>();

  // eslint-disable-next-line react-hooks/rules-of-hooks -- a
  const onErrorCallback = onError && useCallback(onError, []);
  const memoizedCallback = useCallback(callback, []);

  useEffect(() => {
    if (disabled) {
      return;
    }

    async function pollData() {
      try {
        const result = await memoizedCallback();
        setData(result);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
          if (onErrorCallback) {
            onErrorCallback(err);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    const pollInterval = setInterval(() => {
      void pollData().then();
    }, interval);

    intervalId.current = pollInterval;

    void pollData().then(); // Call immediately when hook is first used.

    return () => {
      clearInterval(pollInterval);
      intervalId.current = undefined;
    };
  }, [memoizedCallback, interval, onErrorCallback, disabled]);

  const cancel = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
  };

  return { data, loading, error, cancel };
}

export { usePolling };
