/* eslint-disable @typescript-eslint/no-non-null-assertion -- asd */
/* eslint-disable @typescript-eslint/prefer-optional-chain -- asd */
/* eslint-disable @typescript-eslint/no-unsafe-call -- asd */
import {
  faAngleDown,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useRef, useState } from "react";
import {
  useInteractions,
  useFloating,
  flip,
  shift,
  useDismiss,
  offset,
  FloatingArrow,
  arrow,
} from "@floating-ui/react";
import cn from "classnames";
import { Dropdown, DropdownOption, FormEntry, RawField } from "./forms";
import { Form } from "./forms";
import type {
  DateAsString,
  FilterBox,
  FilterEntry,
  Filterize,
} from "joger-api";
import { useImmer } from "use-immer";
import { niceDate } from "./utils";
import { Transition } from "@headlessui/react";

interface FiltersBarProps {
  label: string;
  fieldName: string;
  children?: React.ReactNode;
  onChange?: (fieldName: string, value: unknown, label: string) => void;
  onRemove?: (fieldName: string) => void;
  value?: FormEntry;
}

export function useFilter<T = unknown>() {
  const [filter, setFilter] = useImmer<FilterBox<T>>({});

  const addFilter = (key: string, value: FilterEntry<T>) => {
    setFilter((prev) => {
      if (!prev.value) (prev.value as unknown) = {};
      if (!prev.value![key]) prev.value![key] = [];

      prev.value![key].push(value);
    });
  };

  return {
    cleanFilters: () => {
      setFilter((prev) => {
        prev.value = undefined;
      });
    },
    removeAllFilters: (key: string) => {
      setFilter((prev) => {
        if (prev.value) prev.value[key] = [];
      });
    },
    removeFilter: (key: string, filterKey: string) => {
      setFilter((prev) => {
        if (prev.value && prev.value[key])
          prev.value[key].filter((v) => v.key !== filterKey);
      });
    },
    addFilter,
    setFilter: (
      key: string,
      value: FilterEntry<unknown> | FilterEntry<unknown>[],
    ) => {
      setFilter((prev) => {
        if (!prev.value) (prev.value as unknown) = {};
        if (Array.isArray(value)) prev.value![key] = value;
        else prev.value![key] = [value];
      });
    },
    filter,
    isFilterActive: (key: string, filterKey: string, val: string) => {
      if (!filter.value || !filter.value[key] || filter.value[key].length === 0)
        return true;

      const u: boolean | undefined = filter.value[key].some(
        (v) => v.key === filterKey && v.value === val,
      );

      return Boolean(u);
    },
  };
}

export function Filter({
  label,
  children,
  onChange,
  onRemove,
  fieldName,
  ...props
}: FiltersBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [_value, setValue] = useState<FormEntry>();

  const value = props.value ?? _value;
  const active = Boolean(value);

  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: menuOpen,
    onOpenChange: setMenuOpen,
    middleware: [
      flip(),
      shift(),
      offset(8),
      arrow({
        element: arrowRef,
      }),
    ],
    placement: "bottom-start",
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  return (
    <div>
      <Transition
        as={Fragment}
        show={menuOpen}
        enter="transition-opacity duration-300 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-200"
        leave="transition-all duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-200"
        leaveTo="transform scale-95 opacity-0"
      >
        <div
          ref={refs.setFloating}
          {...getFloatingProps()}
          className="bg-white border border-gray-300 shadow-lg rounded-lg min-w-[250px] z-[10000]"
          style={floatingStyles}
        >
          <FloatingArrow
            className="fill-white [&>path:first-of-type]:stroke-gray-300"
            context={context}
            ref={arrowRef}
            strokeWidth={0.5}
          />
          <div className="p-2 px-3">
            <Form
              onSubmit={(_, v) => {
                setValue(v.field);
                setMenuOpen(false);
                onChange?.(
                  fieldName,
                  v.field.value,
                  v.field.label ?? String(v.field.value),
                );
              }}
            >
              <div className="flex flex-col gap-3">
                <div className="text-sm font-bold">Filtrar por {label}</div>
                {children}
                <div>
                  <button
                    className="bg-aqua text-white rounded-lg text-sm font-medium p-1 px-2 w-full"
                    type="submit"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </Transition>

      <button
        className={cn(
          "border border-gray-400 text-gray-600 rounded-xl text-xs p-1 px-2",
          {
            "border-solid": active,
            "border-dashed": !active,
          },
        )}
        onClick={(ev) => {
          setMenuOpen((prev) => !prev);
          refs.setReference(ev.currentTarget);
        }}
        type="button"
      >
        <div className="flex justify-center items-center gap-1">
          <div id="filter-button" ref={refs.setReference}>
            {active ? (
              <button
                onClick={(ev) => {
                  ev.stopPropagation();
                  setValue(undefined);
                  setMenuOpen(false);
                  onRemove?.(fieldName);
                }}
                type="button"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            ) : (
              <FontAwesomeIcon icon={faPlus} />
            )}
          </div>
          <div className="font-bold">{label}</div>
          {active ? (
            <div className="flex justify-center items-center gap-1">
              <div className="w-1 h-3 border-r border-r-gray-400" />
              <div className="text-aqua font-bold">
                {value?.label ??
                  ((value?.value as string | undefined) || "Ninguno")}
              </div>
              <FontAwesomeIcon className="mt-[1px]" icon={faAngleDown} />
            </div>
          ) : null}
        </div>
      </button>
    </div>
  );
}

export function UFilter({
  label,
  children,
  onRemove,
  fieldName,
  value: _value,
  onApply,
}: FiltersBarProps & {
  value: {
    label?: string;
    value: unknown;
  };
  onApply?: (value: unknown) => boolean;
}) {
  const [active, setActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [value, setValue] = useState<FormEntry>();

  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: menuOpen,
    onOpenChange: setMenuOpen,
    middleware: [
      flip(),
      shift(),
      offset(8),
      arrow({
        element: arrowRef,
      }),
    ],
    placement: "bottom-start",
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  const handleOnApply = () => {
    const allow = onApply ? onApply(_value.value) : true;

    if (allow) {
      setActive(true);
      setMenuOpen(false);
      setValue(_value);
    }
  };

  return (
    <div>
      {menuOpen ? (
        <div
          ref={refs.setFloating}
          {...getFloatingProps()}
          className="bg-white border border-gray-300 shadow-lg rounded-lg min-w-[250px] z-[10000]"
          style={floatingStyles}
        >
          <FloatingArrow
            className="fill-white [&>path:first-of-type]:stroke-gray-300"
            context={context}
            ref={arrowRef}
            strokeWidth={0.5}
          />
          <div className="p-2 px-3">
            <div className="flex flex-col gap-3">
              <div className="text-sm font-bold">Filtrar por {label}</div>
              {children}
              <div>
                <button
                  className="bg-aqua text-white rounded-lg text-sm font-medium p-1 px-2 w-full"
                  type="submit"
                  onClick={handleOnApply}
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <button
        className={cn(
          "border border-gray-400 text-gray-600 rounded-xl text-xs p-1 px-2",
          {
            "border-solid": active,
            "border-dashed": !active,
          },
        )}
        onClick={(ev) => {
          setMenuOpen((prev) => !prev);
          refs.setReference(ev.currentTarget);
        }}
        type="button"
      >
        <div className="flex justify-center items-center gap-1">
          <div id="filter-button" ref={refs.setReference}>
            {active ? (
              <button
                onClick={(ev) => {
                  ev.stopPropagation();
                  setActive(false);
                  setMenuOpen(false);
                  onRemove?.(fieldName);
                }}
                type="button"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            ) : (
              <FontAwesomeIcon icon={faPlus} />
            )}
          </div>
          <div className="font-bold">{label}</div>
          {active ? (
            <div className="flex justify-center items-center gap-1">
              <div className="w-1 h-3 border-r border-r-gray-400" />
              <div className="text-aqua font-bold">
                {value?.label ??
                  ((value?.value as string | undefined) || "Ninguno")}
              </div>
              <FontAwesomeIcon className="mt-[1px]" icon={faAngleDown} />
            </div>
          ) : null}
        </div>
      </button>
    </div>
  );
}

export type DateFilterMode =
  | {
      mode: "last";
      value?: {
        amount?: number;
        unit?: "day" | "month";
      };
    }
  | {
      mode: "eq" | "gte" | "lt";
      value?: string;
    }
  | {
      mode: "between";
      value?: {
        from?: string;
        to?: string;
      };
    }
  | {
      mode: "today";
      value: true;
    };

export function DateFilter({
  onChange,
  onDelete,
  fieldName,
}: {
  onChange?: (v: DateFilterMode) => void;
  onDelete?: () => void;
  fieldName: string;
}) {
  const [mode, setMode] = useImmer<DateFilterMode>({
    mode: "today",
    value: true,
  });

  const options = [
    { id: "today", label: "hoy" },
    { id: "last", label: "está en los últimos" },
    { id: "eq", label: "es igual a" },
    { id: "between", label: "entre" },
    { id: "gte", label: "en esa fecha o después" },
    { id: "lt", label: "es anterior a" },
  ];

  const createLabel = () => {
    const prefix = options.find((o) => o.id === mode.mode)?.label;

    if (mode.mode === "last") {
      const amount = mode.value?.amount;
      const _unit = mode.value?.unit;
      const unit = _unit === "day" ? "días" : "meses";

      return `${prefix} ${amount} ${unit}`;
    } else if (mode.mode === "between") {
      const from = mode.value?.from;
      const to = mode.value?.to;

      return `${prefix} ${from} y ${to}`;
    } else if (mode.mode === "today") {
      return "Hoy " + niceDate(new Date());
    }

    return `${prefix} ${mode.value}`;
  };

  return (
    <UFilter
      fieldName={fieldName}
      label="Fecha"
      onApply={(v: DateFilterMode) => {
        if (v.mode === "today") {
          onChange?.(v);
          return true;
        }

        if (!v.value) return false;

        if (v.mode === "between") {
          onChange?.(v);
          return Boolean(v.value.from && v.value.to);
        } else if (v.mode === "last") {
          onChange?.(v);
          return Boolean(v.value.amount && v.value.unit);
        }

        const u = Boolean(v.value);
        if (u) onChange?.(v);

        return u;
      }}
      onRemove={() => {
        onDelete?.();
        setMode({
          mode: "today",
          value: true,
        });
      }}
      value={{
        value: mode,
        label: createLabel(),
      }}
    >
      <Dropdown
        className="text-xs min-h-[15px]"
        options={options}
        props={{
          onChange: (e) => {
            if (
              mode.mode !== "between" &&
              mode.mode !== "last" &&
              mode.mode !== "today"
            ) {
              setMode({
                mode: e.target.value as "eq" | "gte" | "lt",
                value: mode.value,
              });
            } else {
              setMode({
                mode: e.target.value as "last" | "between",
              });
            }
          },
          value: mode.mode,
        }}
      />

      {mode.mode === "last" && (
        <div className="flex gap-2 min-w-[200px] max-w-[250px]">
          <RawField
            onChange={(e) => {
              setMode((prev) => {
                const amount = Number(e.target.value);
                const unit = mode.value?.unit;

                prev.value = {
                  amount: amount || undefined,
                  unit: unit ?? "day",
                };
              });
            }}
            type="number"
            value={mode.value?.amount}
          />
          <Dropdown
            options={[
              { id: "day", label: "días" },
              { id: "month", label: "meses" },
            ]}
            props={{
              value: mode.value?.unit,
              onChange: (e) => {
                setMode((prev) => {
                  const unit = e.target.value as "day" | "month";
                  const amount = mode.value?.amount;
                  prev.value = {
                    amount,
                    unit,
                  };
                });
              },
            }}
          />
        </div>
      )}

      {mode.mode === "between" && (
        <div className="flex gap-2 min-w-[200px] max-w-[250px] items-center text-xs">
          <RawField
            onChange={(e) => {
              setMode((prev) => {
                prev.value = {
                  to: mode.value?.to,
                  from: e.target.value,
                };
              });
            }}
            type="date"
            value={mode.value?.from}
          />
          <div>y</div>
          <RawField
            onChange={(e) => {
              setMode((prev) => {
                prev.value = {
                  from: mode.value?.from,
                  to: e.target.value,
                };
              });
            }}
            type="date"
            value={mode.value?.to}
          />
        </div>
      )}

      {mode.mode !== "last" &&
        mode.mode !== "between" &&
        mode.mode !== "today" && (
          <RawField
            onChange={(e) => {
              setMode((prev) => {
                prev.value = e.target.value;
              });
            }}
            type="date"
            value={mode.value}
          />
        )}
    </UFilter>
  );
}

export function DropdownFilter({
  options,
  ...props
}: { options: DropdownOption[] } & Omit<FiltersBarProps, "children">) {
  return (
    <Filter {...props}>
      <Dropdown
        className="text-xs min-h-[15px]"
        options={options}
        props={{
          name: "field",
        }}
      />
    </Filter>
  );
}

export function onChangeDateFilteradapter(
  fieldName: string,
  removeAllFilters: (key: string) => void,
  addFilter: (key: string, value: FilterEntry<DateAsString>) => void,
) {
  const onChange = (filter: DateFilterMode) => {
    removeAllFilters(fieldName);
    if (filter.mode === "last") {
      const days = filter.value?.amount;
      const unit = filter.value?.unit;

      if (days && unit) {
        let date: Date;
        if (unit === "day") {
          date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        } else {
          date = new Date(Date.now() - days * 24 * 60 * 60 * 1000 * 7);
        }

        addFilter(fieldName, {
          key: "gte",
          value: date.toISOString() as DateAsString,
        });

        addFilter(fieldName, {
          key: "lte",
          value: new Date().toISOString() as DateAsString,
        });
      }
    } else if (filter.mode === "between") {
      const from = filter.value?.from;
      const to = filter.value?.to;
      if (from && to) {
        addFilter(fieldName, {
          key: "gte",
          value: new Date(`${from}T00:00:00.000`).toISOString() as DateAsString,
        });

        addFilter(fieldName, {
          key: "lte",
          value: new Date(`${to}T23:59:59.000`).toISOString() as DateAsString,
        });
      }
    } else if (filter.mode === "eq") {
      const value = filter.value;
      if (value) {
        addFilter(fieldName, {
          key: "gte",
          value: new Date(
            `${value}T00:00:00.000`,
          ).toISOString() as DateAsString,
        });

        addFilter(fieldName, {
          key: "lte",
          value: new Date(
            `${value}T23:59:59.000`,
          ).toISOString() as DateAsString,
        });
      }
    } else if (filter.mode === "today") {
      const date = new Date();
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);

      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      addFilter(fieldName, {
        key: "gte",
        value: date.toISOString() as DateAsString,
      });

      addFilter(fieldName, {
        key: "lt",
        value: nextDay.toISOString() as DateAsString,
      });
    } else {
      const value = filter.value;
      if (value) {
        addFilter(fieldName, {
          key: filter.mode,
          value: new Date(
            `${value}T00:00:00.000`,
          ).toISOString() as DateAsString,
        });
      }
    }
  };

  return {
    onChange,
    onDelete: () => {
      removeAllFilters(fieldName);
    },
  };
}
