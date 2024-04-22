import {
  autoPlacement,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import cn from "classnames";
import { Transition } from "@headlessui/react";
import { DeleteButton, IdTag } from "./menus";
import Link from "next/link";

function TableHeader({ headers }: { headers: string[] }) {
  return (
    <thead className="border-b">
      <tr className="text-black/25 text-sm">
        {headers.map((header) => (
          <th className="text-start py-2 font-normal" key={header}>
            {header}
          </th>
        ))}
        <th />
      </tr>
    </thead>
  );
}

export function TableItem<T>({
  id,
  values,
  onEdit,
  onDelete,
  actions,
  source,
}: {
  id: string;
  values: Row[];
  source?: T;
  onEdit?: () => void;
  onDelete?: () => void;
  actions: Action<T>[];
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isEditOpen,
    onOpenChange: setIsEditOpen,
    strategy: "fixed",
    middleware: [offset(5), autoPlacement()],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  return (
    <tr className="hover:bg-aqua/5 text-sm border-b last:border-none">
      {values.map(({ id, value, label }) => (
        <td className="py-2" key={`${id}-${String(value)}`}>
          {!label
            ? value
              ? String(value)
              : "-"
            : typeof label === "function"
              ? label(value)
              : label}
        </td>
      ))}
      <td>
        <button
          className="
          hover:bg-white hover:border hover:border-gray-400 hover:border-b-gray-600 
          flex justify-center items-center rounded-lg h-[25px] w-[30px] transition-all 
          focus:outline-none active:outline-none outline-none
          "
          ref={refs.setReference}
          {...getReferenceProps()}
          type="button"
        >
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
        <Transition
          show={isEditOpen}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="border border-gray-400 shadow-lg rounded-xl bg-white min-w-[130px]"
          >
            <div className="flex flex-col py-2">
              <div className="text-gray-400 font-bold uppercase text-[11px] px-3 py-1">
                Acciones
              </div>

              {!onEdit && !onDelete && actions.length === 0 ? (
                <div className="text-left text-md font-bold px-3 py-1 text-gray-300">
                  Sin acciones
                </div>
              ) : null}

              {onEdit ? (
                <button
                  className="text-left text-aqua text-md font-bold hover:bg-gray-100/80 hover:text-black/70 px-3 py-1"
                  onClick={onEdit}
                  type="button"
                >
                  Editar
                </button>
              ) : null}
              {onDelete ? (
                <DeleteButton
                  onConfirm={onDelete}
                  message="¿Estás seguro de que quieres eliminar este elemento?"
                />
              ) : null}

              {actions.map(
                ({ name, onClick, disabled, href, style = "default" }) => {
                  const isDisabled =
                    typeof disabled === "function"
                      ? disabled(values)
                      : disabled;

                  return href ? (
                    <Link
                      href={
                        typeof href === "string"
                          ? href
                          : href(values, id, source)
                      }
                      className={cn("text-left text-md font-bold px-3 py-1", {
                        "hover:bg-gray-100/80 hover:text-black/70": !isDisabled,
                        "text-gray-400": isDisabled,
                        "text-aqua": !isDisabled && style === "default",
                        "text-red-500": !isDisabled && style === "danger",
                      })}
                    >
                      {name}
                    </Link>
                  ) : (
                    <button
                      className={cn("text-left text-md font-bold px-3 py-1", {
                        "hover:bg-gray-100/80 hover:text-black/70": !isDisabled,
                        "text-gray-400": isDisabled,
                        "text-aqua": !isDisabled && style === "default",
                        "text-red-500": !isDisabled && style === "danger",
                      })}
                      disabled={isDisabled}
                      key={name}
                      onClick={() => {
                        if (!isDisabled) onClick?.(values, id, source);
                      }}
                      type="button"
                    >
                      {name}
                    </button>
                  );
                },
              )}
              <div className="px-3">
                <IdTag
                  id={id}
                  hideId
                  onClick={() => {
                    setIsEditOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        </Transition>
      </td>
    </tr>
  );
}

export type LabelType = string | React.ReactNode;

export interface RowBox<T> {
  id: string;
  source?: T;
  rows: Row[];
}

export interface Row {
  id: string;
  value?: unknown;
  label?: LabelType | ((value: unknown) => LabelType);
}

interface Action<T> {
  name: string;
  onClick?: (row: Row[], id: string, el?: T) => void;
  disabled?: boolean | ((row: Row[]) => boolean);
  href?: string | ((row: Row[], id: string, el?: T) => string);
  style?: "danger" | "default";
}

export function Table<T>({
  values,
  v,
  p,
  headers,
  onRowEdit,
  onRowDelete,
  actions,
}: {
  values?: Row[][];
  v?: RowBox<T>[];
  p?: () => Promise<RowBox<T>[]>;
  headers: string[];
  onRowEdit?: (row: Row[], index: number, id: string) => void;
  onRowDelete?: (row: Row[], index: number, id: string) => void;
  actions?: Action<T>[];
}) {
  if (!values && !v && !p)
    throw new Error("Either values or v must be provided");

  const [_v, setV] = useState<RowBox<T>[] | undefined>(undefined);
  const length = _v?.length || v?.length || values?.length || 0;

  useEffect(() => {
    if (p) {
      p().then((r) => {
        setV(r);
      });
    }
  }, [p]);

  return (
    <div className="w-full overflow-auto">
      <div className="flex rounded-xl bg-white">
        <table className="table table-auto w-full border-collapse">
          <TableHeader headers={headers} />
          <div className="mt-3" />
          <tbody>
            {length === 0 && (
              <div className="text-gray-500">Sin resultados</div>
            )}
            {(_v || v || values || []).map((_item, index) => {
              const item = Array.isArray(_item) ? _item : _item.rows;
              const id = Array.isArray(_item) ? String(index) : _item.id;
              const source = Array.isArray(_item) ? undefined : _item.source;

              return (
                <TableItem
                  id={id}
                  source={source}
                  actions={actions ? actions : []}
                  key={item.map((i) => i.id + String(i.value)).join("_")}
                  onDelete={
                    onRowDelete
                      ? () => {
                          onRowDelete(item, index, id);
                        }
                      : undefined
                  }
                  onEdit={
                    onRowEdit
                      ? () => {
                          onRowEdit(item, index, id);
                        }
                      : undefined
                  }
                  values={item}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        {length} {length === 1 ? "resultado" : "resultados"}
      </div>
    </div>
  );
}
