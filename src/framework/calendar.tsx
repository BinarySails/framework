import type { UseFloatingReturn } from "@floating-ui/react";
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
import { useRef } from "react";

export function MiniCalendarMenu({
  children,
  open,
  onOpen,
  reference,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpen: (open: boolean) => void;
  reference?: Element | null;
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

  return open ? (
    <div
      ref={refs.setFloating}
      {...getFloatingProps()}
      className="border border-gray-400 shadow-lg rounded-lg bg-white min-w-[130px] z-[10000]"
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
      </div>
    </div>
  ) : null;
}

export function MiniCalendarMenuWithoutHook({
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
  return open ? (
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
  ) : null;
}
