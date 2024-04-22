import { useEffect, useState } from "react";
import {
  Field,
  FormBox,
  ModalBody,
  NeoModal,
  niceError,
  useModalFormControl,
} from "../framework";
import { notRevalidate, useClient } from "joger-api";
import toast from "react-hot-toast";
import { z } from "zod";

const Verification = z.object({
  name: z.string(),
  surname: z.string(),
  birthday: z.string(),
});

export function RequireDetails() {
  const [open, setOpen] = useState(false);
  const { formProps } = useModalFormControl();
  const { client } = useClient("user");

  const { data, mutate } = client.me.useSwr((f) => f.me())({
    onErrorRetry: notRevalidate(401),
  });

  useEffect(() => {
    if (!data) return;

    if (!data.name || !data.surname || !data.birthday) {
      setOpen(true);
    }
  }, [data]);

  const handleUpdateDetails = (data: Record<string, unknown>) => {
    const f = async () => {
      const r = await Verification.parseAsync(data);

      const result = await client.me.update(r).submit();
      await mutate(result);
    };

    toast.promise(f(), {
      loading: "Guardando...",
      success: "Guardado",
      error: niceError,
    });
  };

  return (
    <NeoModal open={open} onClose={() => {}}>
      <ModalBody>
        <FormBox
          {...formProps}
          onClose={() => {}}
          label="Completa tu perfil"
          cantCancel
          onSubmit={handleUpdateDetails}
        >
          <Field
            label={{
              label: "Nombre",
              mandatory: true,
            }}
            props={{}}
          />

          <Field
            label={{
              label: "Apellidos",
              mandatory: true,
            }}
            props={{}}
          />

          <Field
            label={{
              label: "Fecha de nacimiento",
              mandatory: true,
            }}
            props={{
              type: "date",
            }}
          />
        </FormBox>
      </ModalBody>
    </NeoModal>
  );
}
