import {
  FlatButton,
  ModalBody,
  ModalFooter,
  ModalHeader,
  MutedButton,
  NeoModal,
} from "../";
import { useState } from "react";
import { PrivacyPolicy, TermsAndConditions } from "./contracts";

export function Contracts({ hideRules }: { hideRules?: boolean }) {
  const [showContacts, setShowContacts] = useState<
    "privacy" | "terms" | undefined
  >();

  return (
    <>
      <NeoModal
        onClose={() => {
          setShowContacts(undefined);
        }}
        open={Boolean(showContacts)}
      >
        <ModalBody>
          <ModalHeader
            label={
              showContacts === "privacy"
                ? "Política de Privacidad"
                : "Términos y Condiciones"
            }
            onClose={() => {
              setShowContacts(undefined);
            }}
          />
          <div className="p-5 overflow-auto max-w-[95vw]">
            {showContacts === "privacy" ? (
              <PrivacyPolicy />
            ) : (
              <TermsAndConditions />
            )}
          </div>
          <ModalFooter className="justify-end">
            <FlatButton
              onClick={() => {
                setShowContacts(undefined);
              }}
              style="accept"
            >
              Aceptar
            </FlatButton>
          </ModalFooter>
        </ModalBody>
      </NeoModal>

      <div className="text-gray-400 text-xs">
        Al continuar, aceptas los{" "}
        <MutedButton
          className="text-aquaa-300"
          onClick={() => {
            setShowContacts("terms");
          }}
          type="button"
        >
          Términos y Condiciones
        </MutedButton>{" "}
        , la{" "}
        <MutedButton
          className="text-aquaa-300"
          onClick={() => {
            setShowContacts("privacy");
          }}
          type="button"
        >
          Política de Privacidad
        </MutedButton>{" "}
        {!hideRules && (
          <>
            y{" "}
            <MutedButton className="text-aquaa-300" type="button">
              Reglamento
            </MutedButton>{" "}
          </>
        )}
        del club.
      </div>
    </>
  );
}
