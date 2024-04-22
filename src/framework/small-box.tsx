import cn from "classnames";

import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function SmallBox({
  style = "default",
  children,
  className,
}: {
  style?: "default" | "accept" | "danger" | "warning";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-xs border rounded p-0.5",
        {
          "text-aqua bg-[#bafff8]": style === "default",
          "bg-[rgb(215,247,194)] text-[rgb(11,80,25)] ": style === "accept",
          "bg-[rgb(255,231,242)] text-[rgb(252,82,106)] ": style === "danger",
          "bg-[rgb(255,241,213)] text-[rgb(255,165,0)] ": style === "warning",
          "border-aqua/40": style === "default",
        },
        className,
      )}
    >
      {children}
    </div>
  );
}

export function IconBox({
  icon,
  title,
  text,
  reverse,
}: {
  icon: IconProp;
  title?: React.ReactNode;
  text: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="flex gap-5 items-center text-center">
      <div
        className="border border-gray-400 p-3 rounded-lg w-[50px] h-[50px]"
        role="figure"
      >
        <FontAwesomeIcon className="text-xl" icon={icon} />
      </div>
      <div
        className={cn("flex flex-col items-start justify-center", {
          "flex-col-reverse": reverse,
        })}
      >
        {title ? <div className="font-bold text-sm">{title}</div> : null}
        <div>{text}</div>
      </div>
    </div>
  );
}
