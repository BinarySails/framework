import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppleLogin } from "./AppleLoginBox";
import { Button } from "./Button";
import { GoogleLoginBox } from "./GoogleLoginBox";
import { PhoneField } from "./PhoneField";
import { useImmer } from "use-immer";
import { useEffect, useState } from "react";
import type { LoginMethod } from "joger-api";
import { useClient } from "joger-api";
import { useSession } from "../contexts/session";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { InputField } from "./InputField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Field } from "../framework";
import { Contracts } from "./contracts-modal";

interface SmsData {
  rawNumber?: string;
  niceNumber?: string;
  code?: string;
}

type ProcessStep = "none" | "code-sent" | "finished";

export function Login({
  clientId,
  appleData,
  withPhone,
  onLogin,
  redirectTo,
  scopes,
  withAdminKey,
  removeHeader,
}: {
  onLogin?: () => void;
  redirectTo?: string;
  clientId: string;
  appleData: {
    clientId: string;
    redirectURI: string;
  };
  withPhone?: boolean;
  scopes?: string[];
  withAdminKey?: boolean;
  removeHeader?: boolean;
}) {
  const [smsData, setSmsData] = useImmer<SmsData>({});

  const [loading, setLoading] = useState(false);
  const [process, setProcess] = useState<ProcessStep>("none");
  const router = useRouter();

  const { client } = useClient();
  const session = useSession();

  useEffect(() => {
    // already logged in

    if (session.token) {
      if (redirectTo) router.push(redirectTo);
      onLogin?.();
    }
  }, [onLogin, router, session.token]);

  const handleLogin = (method: LoginMethod) => {
    setLoading(true);
    toast
      .promise(client.auth.login(method, scopes).submit(), {
        loading: "Iniciando sesión",
        success: ({ token }) => {
          setProcess("finished");
          session.init(token);

          if (redirectTo) router.push(redirectTo);
          onLogin?.();

          return "Inicio de sesión exitoso";
        },
        error: (err) => "Error al iniciar sesión: " + err,
      })
      .then()
      .finally(() => {
        setLoading(false);
      })
      .catch(console.error);
  };

  const handleGoogleLogin = (credential?: string, clientId?: string) => {
    if (!credential || !clientId) {
      toast.error("Error al iniciar sesión");
      return;
    }

    handleLogin({
      method: "google",
      data: {
        credential,
        client_id: clientId,
      },
    });
  };

  const handleAdminKeyLogin = (key: string) => {
    if (!key) return;
    if (!/(^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)/.test(key)) {
      toast.error("Llavero incorrecto.");
      return;
    }

    handleLogin({
      method: "admin_key",
      data: key,
    });
  };

  const handleCodeLogin = (overrideCode?: string) => {
    const code = overrideCode ?? smsData.code;
    if (!code || !smsData.rawNumber) {
      toast.error("Ingresa un código válido");
      return;
    }

    handleLogin({
      method: "sms",
      data: {
        code,
        to: `+${smsData.rawNumber}`,
      },
    });
  };

  const handleRequestCode = () => {
    if (loading) return;

    if (!smsData.rawNumber) {
      toast.error("Ingresa un número de teléfono válido");
      return;
    }

    setLoading(true);

    toast
      .promise(
        client.auth
          .requestSms({
            type: "sms",
            to: `+${smsData.rawNumber}`,
          })
          .submit(),
        {
          loading: "Enviando código",
          success: () => {
            setProcess("code-sent");
            return "Código enviado";
          },
          error: "Error al enviar código",
        },
      )
      .then()
      .finally(() => {
        setLoading(false);
      })
      .catch(console.error);
  };

  return (
    <GoogleOAuthProvider clientId={clientId} onScriptLoadError={console.error}>
      <div className="flex w-full min-h-[250px]">
        {process === "none" && (
          <div className="flex flex-col gap-5 justify-center w-full">
            {!removeHeader && (
              <div className="flex flex-col">
                <div className="text-2xl md:text-3xl font-bold">
                  ¡Bienvenido a <span className="text-aqua">Joger</span>!
                </div>
                <div className="text-xs text-gray-400">
                  Si aún no tienes una cuenta, se te creará una automáticamente
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <GoogleLoginBox
                onClick={(credentials) => {
                  handleGoogleLogin(
                    credentials.credential,
                    credentials.clientId,
                  );
                }}
              />
              <AppleLogin
                border
                clientId={appleData.clientId}
                height="40px"
                mode="center-align"
                onLogin={(token) => {
                  handleLogin({
                    method: "apple",
                    data: {
                      id_token: token.idToken,
                      state: token.state,
                      code: token.code,
                    },
                  });
                }}
                redirectURI={appleData.redirectURI}
                scope="email"
                usePopup
                width="100%"
              />
              {withPhone && (
                <>
                  <div className="flex justify-center items-center my-5 w-full">
                    <hr className="w-full border-black" />
                    <p className="mx-4 w-full text-sm font-semibold whitespace-nowrap">
                      o utiliza tu número de teléfono
                    </p>
                    <hr className="w-full border-black" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <PhoneField
                      label="Número de teléfono"
                      onEnterKeyPress={handleRequestCode}
                      onPhoneChange={(rawNumber, numberNice) => {
                        setSmsData((draft) => {
                          draft.niceNumber = numberNice;
                          draft.rawNumber = rawNumber;
                        });
                      }}
                    />
                    <Button
                      color="aqua"
                      disabled={
                        loading ||
                        !smsData.rawNumber ||
                        smsData.rawNumber.length < 12
                      }
                      name="Enviar código"
                      onClick={handleRequestCode}
                    />
                  </div>
                </>
              )}
            </div>

            {withAdminKey && (
              <div>
                <div className="flex gap-1 items-center">
                  <div className="w-1/2 border-t border-gray-400" />
                  <div className="text-gray-400">O</div>
                  <div className="w-1/2 border-t border-gray-400" />
                </div>
                <Field
                  label={{
                    label: "Clave de administrador",
                  }}
                  props={{
                    name: "",
                    placeholder: "Clave de administrador",
                    type: "password",
                    onKeyDown: (e) => {
                      if (e.key === "Enter") {
                        handleAdminKeyLogin(e.currentTarget.value);
                      }
                    },
                  }}
                />
              </div>
            )}

            <Contracts hideRules />
          </div>
        )}
        {process === "code-sent" && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 justify-between items-center w-full text-center">
              <p className="w-full text-xl font-bold text-center">
                Ingresa el código
              </p>
            </div>
            <div className="flex flex-col items-center py-12">
              <p>Hemos enviado un código de verificación </p>
              <span>
                al número{" "}
                <span className="px-1 font-semibold rounded bg-aqua/30 w-fit">
                  {smsData.niceNumber}
                </span>
              </span>
              <div className="flex flex-col gap-4 items-center p-8 w-full">
                <p>Ingresa el código a continuación:</p>
                <InputField
                  accept="code"
                  label="Código"
                  onCodeChange={(e: string) => {
                    setSmsData((draft) => {
                      draft.code = e;
                    });

                    if (e.length >= 6) {
                      handleCodeLogin(e);
                    }
                  }}
                  type="outline"
                />
                <button
                  className="flex gap-1 px-1 text-sm font-semibold rounded hover:cursor-pointer hover:text-aqua hover:bg-slate-100"
                  onClick={handleRequestCode}
                  type="button"
                >
                  Reenviar código
                </button>
              </div>
              <Button
                color="black"
                disabled={!smsData.code || smsData.code.length < 6}
                name="Ingresar"
                onClick={handleCodeLogin}
              />
              <button
                className="flex gap-1 justify-center items-center px-2 mt-2 text-sm font-semibold rounded text-aqua bg-slate-100 hover:bg-slate-200"
                onClick={() => {
                  setProcess("none");
                }}
                type="button"
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  onClick={() => {
                    setProcess("none");
                  }}
                />
                Regresa al menú principal
              </button>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
