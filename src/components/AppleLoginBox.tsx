import { faApple } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";
import { useScript } from "../hooks/use-script";

const SCRIPT_URL =
  "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

export interface AppleLoginOptions {
  clientId: string;
  scope: string;
  redirectURI: string;
  state?: string;
  nonce?: string;
  usePopup: boolean;
}

export interface AppleLoginProps extends AppleLoginOptions {
  mode?: string;
  border?: boolean;
  borderRadius?: string;
  width?: string;
  height?: string;
}

interface AppleIdType {
  auth: {
    init: (options: AppleLoginOptions & { state: string }) => void;
    signIn: () => Promise<void>;
  };
}

declare const AppleID: AppleIdType;

function createState(): string {
  const state = new Uint32Array(10);
  window.crypto.getRandomValues(state);
  return Array.from(state, (dec) => dec.toString(16)).join("");
}

export function AppleLogin({
  onLogin,
  ...options
}: {
  onLogin: (params: { code: string; idToken: string; state: string }) => void;
} & AppleLoginProps) {
  const { status } = useScript(SCRIPT_URL);

  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (status !== "loaded") return;

    const state = options.state || createState();

    AppleID.auth.init({
      clientId: options.clientId,
      scope: options.scope,
      redirectURI: options.redirectURI,
      usePopup: options.usePopup,
      state,
    });
  }, [status]);

  // for some reason, the appleid likes to own a max width on the button
  useEffect(() => {
    if (!btn.current || status !== "loaded") return;

    const firstChild = btn.current.firstChild as HTMLButtonElement;

    if (!firstChild.style) return;

    firstChild.style.maxWidth = "";
  }, [status, btn.current?.firstChild]);

  useEffect(() => {
    if (!document || !window) return;

    const onSignIn = (_event: Event) => {
      const event = _event as CustomEvent;
      event.stopPropagation();

      const data = event.detail as {
        authorization: {
          code: string;
          id_token: string;
          state: string;
        };
      };

      onLogin({
        code: data.authorization.code,
        idToken: data.authorization.id_token,
        state: data.authorization.state,
      });
    };

    const onSignInFailure = (event: Event) => {
      event.stopPropagation();
    };

    document.addEventListener("AppleIDSignInOnSuccess", onSignIn);
    document.addEventListener("AppleIDSignInOnFailure", onSignInFailure);

    return () => {
      document.removeEventListener("AppleIDSignInOnSuccess", onSignIn);
      document.removeEventListener("AppleIDSignInOnFailure", onSignInFailure);
    };
  }, [onLogin]);

  const handleSignIn = () => {
    AppleID.auth.signIn().then((data) => {
      console.log(data);
    });
  };

  return (
    <div
      style={{
        width: "100%",
        height: "auto",
      }}
    >
      <button
        className="flex justify-center items-center gap-2 h-[40px] border border-black rounded-lg cursor-pointer w-full bg-white hover:bg-black/5 hover:shadow-[3px_3px_0_1px_#1fb5a6] hover:translate-y-[-4px] hover:translate-x-[-4px] transition-all duration-100"
        onClick={handleSignIn}
        ref={btn}
        type="button"
      >
        <FontAwesomeIcon icon={faApple} />
        <span>Iniciar sesión con Apple</span>
      </button>
    </div>
  );
}
