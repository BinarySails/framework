import { useEffect, useState } from "react";

export type ScriptStatus = "loaded" | "error" | "idle";
export function useScript(src: string) {
  const [status, setStatus] = useState<ScriptStatus>("idle");

  useEffect(() => {
    if (!document || !window) return;

    const script = document.createElement("script");

    script.src = src;
    script.async = true;

    const onScriptLoad = () => {
      setStatus("loaded");
    };

    const onScriptError = () => {
      setStatus("error");
    };

    script.addEventListener("load", onScriptLoad);
    script.addEventListener("error", onScriptError);

    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", onScriptLoad);
      script.removeEventListener("error", onScriptError);
      document.body.removeChild(script);
      script.remove();
    };
  }, [src]);

  return { status };
}
