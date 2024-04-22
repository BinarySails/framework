import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faSquareFull } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
interface ButtonProps {
  name?: string;
  icon?: {
    icon: IconDefinition;
    position?: "left" | "right";
  };
  className?: string;
  color?: string;
  style?: "flat" | "dropdownFilter" | "default";
  disabled?: boolean;
  onClick?: () => void;
  ref?: React.RefObject<HTMLButtonElement>;
  submit?: boolean;
}

export function Button({
  name,
  icon = { icon: faSquareFull, position: "left" },
  className,
  color = "black",
  style = "default",
  disabled = false,
  submit,
  onClick,
  ref,
}: ButtonProps) {
  return (
    <button
      className={classNames(className, "flex", {
        "flex-row-reverse": icon.position === "right",

        "flex gap-1 items-center justify-center bg-white border border-gray-400 border-b-gray-500 hover:border-gray-600 transition-all rounded-lg px-4 py-1 text-sm font-bold":
          style === "flat",
        "flex gap-1 text-red-500 items-center justify-center bg-white border border-red-500 border-b-red-600 hover:border-red-600 transition-all rounded-lg px-4 py-1 text-sm font-bold":
          style === "flat" && color === "red",

        "items-center rounded-lg gap-2 bg-gray-200 hover:bg-white border border-transparent hover:border-gray-300 hover:cursor-pointer text-xs p-2":
          style === "dropdownFilter",
        "w-full items-center justify-center rounded-lg p-2 font-semibold gap-2 text-white transition-all":
          style !== "dropdownFilter" && style !== "flat",

        [`ring-${color} bg-${color} focus:outline-${color} hover:outline-${color} bg-opacity-80 hover:bg-opacity-100`]:
          style === "default" && !disabled,
        "ring-gray-400 bg-gray-400/80 focus:outline-gray-400 cursor-not-allowed":
          style === "default" && disabled,
      })}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      type={submit ? "submit" : "button"}
    >
      {icon.icon !== faSquareFull && <FontAwesomeIcon icon={icon.icon} />}
      {Boolean(name) && <p>{name}</p>}
    </button>
  );
}
