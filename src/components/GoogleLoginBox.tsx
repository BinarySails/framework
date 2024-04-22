import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useState } from "react";

export function GoogleLoginBox({
  onClick,
}: {
  onClick: (credentials: CredentialResponse) => void;
}) {
  const [box, setBox] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="group">
      <div className="relative">
        <div
          className="absolute z-10"
          style={{
            opacity: 0,
          }}
        >
          <GoogleLogin
            width={box?.offsetWidth || 500}
            onSuccess={onClick}
            size="large"
          />
        </div>
        <button
          className="flex justify-center items-center gap-2 h-[40px] border border-black rounded-lg cursor-pointer w-full bg-white group-hover:bg-black/5 group-hover:shadow-[3px_3px_0_1px_#1fb5a6] group-hover:translate-y-[-4px] group-hover:translate-x-[-4px] transition-all duration-100"
          type="button"
          ref={(c) => {
            setBox(c);
          }}
        >
          <FontAwesomeIcon icon={faGoogle} />
          <span>Iniciar sesión con Google</span>
        </button>
      </div>
    </div>
  );
}
