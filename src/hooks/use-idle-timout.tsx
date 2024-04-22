import { useEffect, useRef } from "react";

export function useIdleTimeout(
  enableOn: boolean,
  onIdle: () => void,
  idleTime = 60 * 5,
) {
  const lastState = useRef(enableOn);
  const counter = useRef(idleTime);

  useEffect(() => {
    if (lastState.current !== enableOn) {
      if (enableOn) {
        counter.current = idleTime;
      }
      lastState.current = enableOn;
    }

    if (!enableOn) return;

    const timer = setInterval(() => {
      counter.current--;
      if (counter.current <= 0) {
        onIdle();
      }
    }, 1000);

    // events to reset the counter
    const resetCounter = () => {
      counter.current = idleTime;
    };

    window.addEventListener("mousemove", resetCounter);
    window.addEventListener("keydown", resetCounter);

    return () => {
      clearInterval(timer);
      window.removeEventListener("mousemove", resetCounter);
      window.removeEventListener("keydown", resetCounter);
    };
  }, [enableOn, onIdle, idleTime]);
}
