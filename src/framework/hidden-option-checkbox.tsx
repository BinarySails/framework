import { useState } from "react";
import { Checkbox } from "./forms";

export function HiddenOptionCheckbox({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode | React.ReactNode[];
  label: string;
  onClick?: (value: boolean) => void;
}) {
  const [shown, setShown] = useState(false);

  return (
    <div>
      <Checkbox
        label={label}
        props={{
          onChange: () => {
            setShown(!shown);
            onClick?.(!shown);
          },
        }}
      />

      {shown && children}
    </div>
  );
}
