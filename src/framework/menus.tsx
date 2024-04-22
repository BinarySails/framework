import {
  useInteractions,
  useFloating,
  flip,
  shift,
  useDismiss,
  offset,
  FloatingArrow,
  arrow,
  inline,
} from "@floating-ui/react";
import type { UseFloatingReturn } from "@floating-ui/react";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useRef, Fragment } from "react";
import Link from "next/link";
import cn from "classnames";
import { Dialog, Transition } from "@headlessui/react";
import { FlatButton } from "../components";

export function MiniMenu({
  children,
  open,
  onOpen,
  reference,
  options,
}: {
  children?: React.ReactNode;
  open: boolean;
  onOpen: (open: boolean) => void;
  reference?: Element | null;
  options?: {
    label: string;
    style?: "danger" | "default";
    data:
      | {
          mode: "link";
          href: string;
        }
      | {
          mode: "button";
          onClick: () => void;
        };
  }[];
}) {
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: onOpen,
    middleware: [
      inline(),
      flip(),
      shift(),
      offset(5),
      arrow({
        element: arrowRef,
      }),
    ],
    elements: {
      reference,
    },
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  return (
    <Transition
      show={open}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      as={Fragment}
    >
      <div
        ref={refs.setFloating}
        {...getFloatingProps()}
        className="border border-gray-400 shadow-lg rounded-lg bg-white min-w-[130px] z-40"
        style={floatingStyles}
      >
        <FloatingArrow
          className="fill-white [&>path:first-of-type]:stroke-gray-400"
          context={context}
          ref={arrowRef}
          strokeWidth={0.5}
        />
        <div className="flex flex-col py-2">
          <div className="text-gray-400 font-bold uppercase text-[11px] px-3 py-1">
            Acciones
          </div>
          {children}
          {options?.map((option) =>
            option.data.mode === "link" ? (
              <Link
                key={option.label}
                className={cn(
                  "py-1 px-3 font-bold text-left text-aqua text-md hover:bg-gray-100/80 hover:text-black/70",
                  {
                    "text-aqua": !option.style || option.style === "default",
                    "text-red-500": option.style === "danger",
                  },
                )}
                href={option.data.href}
                type="button"
              >
                {option.label}
              </Link>
            ) : (
              <button
                onClick={() => {
                  onOpen(false);
                  if (option.data.mode === "button") option.data.onClick();
                }}
                key={option.label}
                type="button"
                className={cn(
                  "py-1 px-3 font-bold text-left text-md hover:bg-gray-100/80 hover:text-black/70",
                  {
                    "text-aqua": !option.style || option.style === "default",
                    "text-red-500": option.style === "danger",
                  },
                )}
              >
                {option.label}
              </button>
            ),
          )}
        </div>
      </div>
    </Transition>
  );
}

export function MiniMenuWithoutHook({
  children,
  open,
  hookProps,
  arrowRef,
  getFloatingProps,
}: {
  children: React.ReactNode;
  open: boolean;
  hookProps: UseFloatingReturn;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  getFloatingProps: (
    userProps?: React.HTMLProps<HTMLElement>,
  ) => Record<string, unknown>;
}) {
  return (
    <Transition
      show={open}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      as={Fragment}
    >
      <div
        ref={hookProps.refs.setFloating}
        {...getFloatingProps()}
        className="border border-gray-400 shadow-lg rounded-lg bg-white min-w-[130px] z-[10000]"
        style={hookProps.floatingStyles}
      >
        <FloatingArrow
          className="fill-white [&>path:first-of-type]:stroke-gray-400"
          context={hookProps.context}
          ref={arrowRef}
          strokeWidth={0.5}
        />
        <div className="flex flex-col py-2">
          <div className="text-gray-400 font-bold uppercase text-[11px] px-3 py-1">
            Acciones
          </div>
          {children}
        </div>
      </div>
    </Transition>
  );
}

export function DeleteButton({
  onConfirm,
  message,
  children,
  title,
}: {
  onConfirm?: () => void;
  message?: string;
  children?: React.ReactNode;
  title?: string;
}) {
  const [open, setOpen] = useState(false);

  const handleOnDelete = () => {
    setOpen(false);
    onConfirm?.();
  };

  return (
    <>
      <Transition as={Fragment} show={open}>
        <Dialog onClose={() => setOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed top-0 left-0 w-full h-screen bg-black/25 z-50"
              aria-hidden="true"
            />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              className="fixed top-0 left-0 z-[60] p-5 w-full h-screen"
              onClick={() => setOpen(false)}
              role="presentation"
            >
              <div className="flex justify-center items-center w-full h-full">
                <div
                  className="flex flex-col h-fit max-h-[88vh] bg-white rounded-xl w-[500px] max-w-[100vw] shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  role="presentation"
                >
                  <div className="flex justify-between items-center px-5 py-3 border-b border-black/20">
                    <div className="text-xl font-bold">
                      <Dialog.Title>Confirmar Eliminación</Dialog.Title>
                    </div>
                    <div>
                      <button
                        onClick={() => setOpen(false)}
                        type="button"
                        className="active:scale-90"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  </div>
                  <div className="flex overflow-auto flex-col gap-5 p-5">
                    <div>{message}</div>
                  </div>
                  <div className="flex flex-col gap-5 px-5 py-3 border-t border-black/20">
                    <div className="flex gap-2 ml-auto">
                      <FlatButton
                        style="cancel"
                        name="Eliminar"
                        onClick={handleOnDelete}
                      />
                      <FlatButton
                        name="Cancelar"
                        onClick={() => setOpen(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>

      {children ? (
        <button
          onClick={() => {
            setOpen(true);
          }}
          type="button"
        >
          {children}
        </button>
      ) : (
        <button
          className="py-1 px-3 font-bold text-left text-red-500 text-md hover:bg-gray-100/80 hover:text-black/70"
          onClick={() => {
            setOpen(true);
          }}
          type="button"
        >
          <div className="flex justify-between items-center">
            {title ? title : "Eliminar"}
          </div>
        </button>
      )}
    </>
  );
}

export function IdTag({
  id,
  hideId,
  onClick,
}: {
  id: string;
  hideId?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className="text-xs text-gray-300"
      onClick={() => {
        void navigator.clipboard.writeText(id).then();
        onClick?.();
      }}
      type="button"
    >
      {hideId ? "Copiar Dev Id" : id}
    </button>
  );
}
