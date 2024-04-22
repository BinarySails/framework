import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faSquareFull, faSpinner } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import {
  ButtonHTMLAttributes,
  Fragment,
  HTMLAttributes,
  forwardRef,
  useRef,
  useState,
} from "react";
import { Transition } from "@headlessui/react";
import {
  useFloating,
  flip,
  shift,
  useDismiss,
  offset,
  FloatingFocusManager,
  useInteractions,
  inline,
  arrow,
  FloatingArrow,
} from "@floating-ui/react";
import cn from "classnames";

interface ButtonProps {
  name?: string;
  icon?: {
    icon: IconDefinition;
    position?: "left" | "right";
  };
  className?: string;
  color?: string;
  style?: "default" | "accept" | "cancel" | "transparent" | "warning" | "muted";
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  ref?: React.ForwardedRef<HTMLButtonElement>;
  submit?: boolean;
  title?: string;
  loading?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  css?: HTMLAttributes<HTMLButtonElement>["style"];
}

function _FlatButton({
  name,
  icon = { icon: faSquareFull, position: "left" },
  className,
  style = "default",
  disabled = false,
  onClick,
  ref,
  submit = false,
  title,
  loading,
  children,
  css,
}: ButtonProps) {
  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) onClick?.(e);
  };

  if (style === "muted") {
    return <MutedButton {...{ children, disabled, className, onClick }} />;
  }

  return (
    <button
      ref={ref}
      title={title}
      style={css}
      className={classNames(
        {
          "bg-aqua text-white border-aqua": style === "accept",
          "bg-red-500 border-red-400 border-b-red-600 text-white hover:border-red-600":
            style === "cancel",
          "bg-transparent border-gray-400 border-b-gray-500":
            style === "transparent",
          "bg-orange-400 border-orange-400 border-b-orange-500 text-white hover:border-orange-500":
            style === "warning",
          "bg-white border-gray-400 border-b-gray-500 ": style === "default",
          "hover:border-gray-600 cursor-pointer": !disabled,
        },
        "border transition-all rounded-lg px-4 py-1 text-sm font-bold relative",
        "disabled:opacity-50",
        className,
      )}
      disabled={disabled}
      onClick={handleOnClick}
      type={submit ? "submit" : "button"}
      role="button"
    >
      {loading && (
        <div className="absolute top-0 left-0 flex flex-col justify-center items-center h-full w-full">
          <FontAwesomeIcon
            className="w-full text-center text-sm"
            icon={faSpinner}
            spin
          />
        </div>
      )}

      <div
        className={classNames("flex gap-1 items-center justify-center", {
          "opacity-0": loading,
        })}
      >
        {icon.icon !== faSquareFull && <FontAwesomeIcon icon={icon.icon} />}
        {!children ? Boolean(name) && <p>{name}</p> : children}
      </div>
    </button>
  );
}

export const FlatButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props: ButtonProps, ref) => <_FlatButton {...props} ref={ref} />,
);
FlatButton.displayName = "FlatButton";

export interface ButtonConfirmationProps {
  submit?: boolean;
  confirm?:
    | {
        enabled: true;
        message: React.ReactNode | React.ReactNode[];
      }
    | {
        enabled: false;
      };
}

export interface FlatButtonConfirmationProps
  extends ButtonProps,
    ButtonConfirmationProps {}

export const ButtonConfirmation = forwardRef<
  HTMLButtonElement,
  ButtonConfirmationProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function ButtonConfirmation({ confirm, submit, ...props }, ref) {
  const [open, setOpen] = useState(false);

  const arrowRef = useRef(null);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [
      inline(),
      flip(),
      shift(),
      offset(10),
      arrow({
        element: arrowRef,
      }),
    ],
    strategy: "fixed",
    placement: "top",
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps, getReferenceProps } = useInteractions([dismiss]);

  return (
    <div
      ref={refs.setReference}
      {...getReferenceProps()}
      className="w-full relative"
    >
      <FloatingFocusManager
        context={context}
        initialFocus={-1}
        visuallyHiddenDismiss
      >
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
            style={floatingStyles}
            {...getFloatingProps()}
            className="bg-white border border-gray-400 rounded-lg shadow-lg flex flex-col"
          >
            <FloatingArrow
              className="fill-white [&>path:first-of-type]:stroke-gray-400"
              context={context}
              ref={arrowRef}
              strokeWidth={0.5}
            />
            <div className="p-4">
              {confirm?.enabled && <p>{confirm.message}</p>}
            </div>
            <div className="w-full border-t border-gray-200" />
            <div className="flex gap-2 ml-auto p-3">
              <_FlatButton
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancelar
              </_FlatButton>
              <_FlatButton
                style="accept"
                onClick={(ev) => {
                  setOpen(false);
                  props.onClick?.(ev);

                  if (submit) {
                    ev.currentTarget.form?.dispatchEvent(
                      new Event("submit", { cancelable: true, bubbles: true }),
                    );
                  }
                }}
              >
                Aceptar
              </_FlatButton>
            </div>
          </div>
        </Transition>
      </FloatingFocusManager>
      <button
        {...props}
        className="w-full"
        onClick={(ev) => {
          if (confirm?.enabled) setOpen(true);
          else props.onClick?.(ev);
        }}
        ref={ref}
        type={submit ? "submit" : "button"}
      />
    </div>
  );
});

export const FlatButtonConfirmation = forwardRef<
  HTMLButtonElement,
  FlatButtonConfirmationProps
>(function FlatButtonConfirmation({ children, confirm, ...props }, ref) {
  const [open, setOpen] = useState(false);

  const arrowRef = useRef(null);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [
      inline(),
      flip(),
      shift(),
      offset(10),
      arrow({
        element: arrowRef,
      }),
    ],
    strategy: "fixed",
    placement: "top",
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps, getReferenceProps } = useInteractions([dismiss]);

  return (
    <div
      ref={refs.setReference}
      {...getReferenceProps()}
      className="relative w-full"
    >
      <FloatingFocusManager
        context={context}
        initialFocus={-1}
        visuallyHiddenDismiss
      >
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
            style={floatingStyles}
            {...getFloatingProps()}
            className="bg-white border border-gray-400 rounded-lg shadow-lg flex flex-col"
          >
            <FloatingArrow
              className="fill-white [&>path:first-of-type]:stroke-gray-400"
              context={context}
              ref={arrowRef}
              strokeWidth={0.5}
            />
            <div className="p-4">
              {confirm?.enabled && <p>{confirm.message}</p>}
            </div>
            <div className="w-full border-t border-gray-200" />
            <div className="flex gap-2 ml-auto p-3">
              <_FlatButton
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancelar
              </_FlatButton>
              <_FlatButton
                style="accept"
                onClick={(ev) => {
                  setOpen(false);
                  props.onClick?.(ev);

                  if (props.submit) {
                    ev.currentTarget.form?.dispatchEvent(
                      new Event("submit", { cancelable: true, bubbles: true }),
                    );
                  }
                }}
              >
                Aceptar
              </_FlatButton>
            </div>
          </div>
        </Transition>
      </FloatingFocusManager>
      <_FlatButton
        {...props}
        ref={ref}
        onClick={(ev) => {
          if (confirm?.enabled) setOpen(true);
          else props.onClick?.(ev);
        }}
        submit={confirm?.enabled ? false : props.submit}
        className="w-full"
      >
        {children}
      </_FlatButton>
    </div>
  );
});

export function SimpleFlatButton({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  return (
    <button
      className="
                  w-full rounded-lg bg-notblack text-white py-1
                  hover:text-gray-200 hover:bg-red-500 transition-all
                  active:translate-y-0.5 active:shadow-xl active:translate-x-0.5
                  "
      type="button"
    >
      {children}
    </button>
  );
}

export function MutedButton({
  children,
  disabled,
  className,
  ...props
}: {
  children: React.ReactNode | React.ReactNode[];
  disabled?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "underline text-left",
        {
          "cursor-not-allowed text-gray-400": disabled,
          "text-aqua hover:text-aqua/80": !disabled,
        },
        className,
      )}
      {...props}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
