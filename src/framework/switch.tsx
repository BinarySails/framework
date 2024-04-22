import { Switch as S } from "@headlessui/react";
import cn from "classnames";

export function Switch({
  checked,
  onChange,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <S
      checked={checked}
      onChange={onChange}
      className={cn(
        "relative inline-flex h-6 min-w-11 w-11 items-center rounded-full transition",
        {
          "bg-aqua": checked,
          "bg-gray-200": !checked,
        },
      )}
    >
      <span className="sr-only">Enable notifications</span>
      <span
        className={`${
          checked ? "translate-x-6" : "translate-x-1"
        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
      />
    </S>
  );
}
