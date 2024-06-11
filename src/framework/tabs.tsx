import cn from "classnames";
import { useEffect, useState } from "react";

export function Tabs({
  tabs,
  children,
  initialTab,
  onChange,
  className,
  value,
  belowTabs,
  hideTabs,
}: {
  tabs: { id: string; label?: string; onClick?: () => void }[];
  children: React.ReactNode[];
  initialTab?: string;
  onChange?: (id: string, index: number) => void;
  className?: string;
  value?: string;
  belowTabs?: React.ReactNode | React.ReactNode[];
  hideTabs?: boolean;
}) {
  const [unManagedSelected, setUnManagedSelected] = useState(
    initialTab
      ? tabs.findIndex((it) => it.id === initialTab)
      : initialTab === "none"
        ? undefined
        : 0,
  );

  useEffect(() => {
    const _initialTab = initialTab ?? tabs[0].id;
    onChange?.(_initialTab, 0);
  }, []);

  const selected = value
    ? tabs.findIndex((it) => it.id === value)
    : unManagedSelected;

  const handleOnchange = (index: number) => {
    const tab = tabs[index];
    tab.onClick?.();
    setUnManagedSelected(index);
    onChange?.(tab.id, index);
  };

  const selectedTab = selected ? tabs[selected] : undefined;

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      <div className="flex flex-col gap-2">
        {!hideTabs && (
          <div className="flex gap-2">
            {tabs.map((it, index) => (
              <button
                className={cn("border rounded-lg w-full py-2 px-3 text-left", {
                  "text-aqua border-aqua": selected === index,
                  "text-black border-gray-400": selected !== index,
                })}
                key={it.id}
                onClick={() => {
                  handleOnchange(index);
                }}
                type="button"
              >
                {it.label ?? it.id}
              </button>
            ))}
          </div>
        )}
        {belowTabs ? <div>{belowTabs}</div> : null}
      </div>
      <div className="px-1">
        {typeof selected !== "undefined" ? (
          <div key={selectedTab?.id || "None"}>{children[selected]}</div>
        ) : null}
      </div>
    </div>
  );
}

export function Tab({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
