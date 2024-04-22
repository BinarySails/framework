import {
  Fragment,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import cn from "classnames";
import { DAYS, extractValue } from "./utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTimes,
  faChevronDown,
  faImage,
  faFile,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import {
  FlatButton,
  FlatButtonConfirmation,
  FlatButtonConfirmationProps,
} from "../components/FlatButton";
import { useImmer } from "use-immer";
import {
  offset,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  flip,
  autoUpdate,
  useRole,
  useListNavigation,
  FloatingFocusManager,
} from "@floating-ui/react";
import PhoneInput from "react-phone-input-2";
import es from "react-phone-input-2/lang/es.json";
import { useDebounce } from "../hooks/use-debounce";
import { useEscape } from "../hooks/use-esc";
import { Transition, Dialog } from "@headlessui/react";

export function WeekDayPicker(props: {
  name?: string;
  handleOnChange?: (days: string[]) => void;
  value?: string[];
  singleDay?: boolean;
}) {
  const { getValue, setValue } = useForm();
  const entry = props.name ? getValue(props.name) : undefined;

  const pickedDays = props.value
    ? props.value
    : (entry?.value as string[] | undefined) ?? [];

  const handleOnChange = (days: string[]) => {
    props.handleOnChange?.(days);

    if (props.name)
      setValue(props.name, {
        value: days,
        label: days.join(", "),
      });
  };

  const handleClick = (day: string) => {
    let newDays = props.singleDay ? [] : [...pickedDays];
    if (pickedDays.includes(day)) {
      newDays = pickedDays.filter((it) => it !== day);
    } else {
      newDays.push(day);
    }

    handleOnChange(newDays);
  };

  return (
    <div className="flex w-full border border-gray-400 border-b-gray-500 rounded-lg justify-between">
      {DAYS.map((it) => (
        <button
          className={cn(
            "border-r border-black/20 hover:bg-aqua/40 cursor-pointer last:border-r-none text-center w-[14.28%] py-3",
            {
              "bg-aqua/20": pickedDays.includes(it),
            },
          )}
          key={it}
          onClick={() => {
            handleClick(it);
          }}
          type="button"
        >
          {it}
        </button>
      ))}
    </div>
  );
}

export interface FieldWrapperProps {
  label: string;
  description?: string;
  mandatory?: boolean;
  header?: ReactNode[] | ReactNode;
  className?: string;
}

export function FieldWrapper({
  label,
  children,
  description,
  mandatory,
  header,
  className,
}: FieldWrapperProps & { children: React.ReactNode }) {
  return (
    <div className={className}>
      <div className="py-1 w-full">
        <div className="flex justify-between items-center w-full">
          <div className="text-sm font-bold">
            {label}
            {mandatory ? <span className="text-red-500"> *</span> : null}
          </div>
          <div>{header}</div>
        </div>
        {description ? (
          <div className="w-4/5 text-xs text-gray-500">{description}</div>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

export interface ComboBoxFieldProps {
  options: { value: string; label?: string; as_component?: React.ReactNode }[];
  onAddClick?: (
    value: string,
  ) => Promise<{ value: string; label?: string } | void>;
  onChange?: (value: string, lable?: string, clear?: () => void) => void;
  onClear?: () => void;
  onQueryChange?: (value: string) => void;
  notFoundText?: string;
  placeholder?: string;
  filter?: (query: string, value: string, label?: string) => boolean;
  defaultValue?: string;
  defaultQuery?: string;
  disabled?: boolean;
  value?: string;
  label?: string;
  onClickShowAll?: boolean;
}

function _ComboboxField({
  options,
  onAddClick,
  onChange,
  onQueryChange,
  notFoundText,
  placeholder,
  defaultValue,
  defaultQuery,
  onClear,
  filter,
  disabled,
  value: valueFromProps,
  onClickShowAll,
  label: propsLabel,
}: ComboBoxFieldProps) {
  const [unManagedValue, setValue] = useState<string | undefined>(
    defaultValue?.trim() || undefined,
  );

  const value = valueFromProps ?? unManagedValue;

  const [open, setOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [_label, setLabel] = useState<string | null>(null);

  const label = propsLabel ?? _label;

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    strategy: "fixed",
    placement: "bottom",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip(),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${availableHeight - 20}px`,
          });
        },
      }),
    ],
  });

  const role = useRole(context, { role: "listbox" });
  const dismiss = useDismiss(context);
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex: hoverIndex,
    onNavigate: setHoverIndex,
    virtual: true,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    dismiss,
    role,
    listNav,
  ]);

  const [_query, setQuery] = useState<string | undefined>();

  const query =
    label || _query || (typeof _query === "undefined" ? defaultQuery : "");

  const availableOptions = options.filter((it) =>
    filter
      ? filter(query ?? "", it.value, it.label)
      : (it.label || it.value)
        .toLowerCase()
        .includes(query?.toLowerCase() ?? ""),
  );

  const handleOptionClick = (value: { value: string; label?: string }) => {
    setHoverIndex(null);
    if (setValue) setValue(value.value);
    //setQuery(value.label ?? value.value);
    setLabel(value.label ?? value.value);
    onQueryChange?.(value.label ?? value.value);
    setOpen(false);
    onChange?.(value.value, value.label, () => {
      setQuery("");
      if (setValue) setValue(undefined);
      setLabel(null);
      onQueryChange?.("");
      onClear?.();
    });
  };

  const buttonSliceShow =
    (query?.length ?? 0) > 15 ? `${query?.slice(0, 15)}...` : query;

  const withAddButton = Boolean(onAddClick);
  const indexWithAddButton = withAddButton && !value ? 1 : 0;

  return (
    <div
      ref={refs.setReference}
      {...getReferenceProps({
        onKeyDown: (e) => {
          if (e.key === "Enter" && hoverIndex !== null) {
            e.stopPropagation();
            e.preventDefault();
            if (withAddButton && !value && hoverIndex === 0) {
              onAddClick?.(query || "")?.then((r) => {
                if (typeof r === "object") {
                  handleOptionClick(r);
                }
              });
            } else {
              handleOptionClick(availableOptions[hoverIndex]);
            }
          }
        },
      })}
      className="w-full relative"
    >
      {Boolean(value) && (
        <div className="absolute right-0 top-0 p-1 px-2 h-[34px] hover:text-aqua transition-all active:scale-90">
          <button
            type="button"
            onClick={() => {
              setQuery("");
              if (setValue) setValue(undefined);
              setOpen(false);
              onClear?.();
              setLabel(null);
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
      <RawField
        autoComplete="off"
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          onQueryChange?.(e.target.value);
          setOpen(true);
          if (setValue) setValue(undefined);
          setLabel(null);

          if (value) {
            onClear?.();
            if (setValue) setValue(undefined);
            setLabel(null);
            setQuery("");
            onQueryChange?.("");
          }
        }}
        onFocus={() => {
          if (withAddButton) {
            if (!value) setOpen(true);
          }

          if (onClickShowAll) {
            setOpen(true);
          }
        }}
        placeholder={placeholder}
        value={query}
      />
      {open ? (
        <FloatingFocusManager
          context={context}
          initialFocus={-1}
          visuallyHiddenDismiss
        >
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="border border-gray-400 shadow-lg rounded-lg bg-white w-full overflow-auto z-50"
          >
            <div className="flex flex-col p-1 gap-2">
              {withAddButton && !value ? (
                <button
                  role="option"
                  className={cn(
                    "flex justify-start items-center gap-2 font-bold hover:bg-aqua hover:text-white rounded px-2 py-1",
                    {
                      ["bg-aqua text-white"]: hoverIndex === 0,
                    },
                  )}
                  ref={(node) => {
                    if (withAddButton && !value) {
                      listRef.current[0] = node;
                    }
                  }}
                  onClick={() => {
                    onAddClick?.(query || "")?.then((r) => {
                      if (typeof r === "object") {
                        handleOptionClick(r);
                      }
                    });
                  }}
                  type="button"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  {buttonSliceShow
                    ? `Agregar ${buttonSliceShow} como elemento nuevo`
                    : "Agregar un nuevo elemento"}
                </button>
              ) : null}
              {availableOptions.map((it, index) => (
                <button
                  role="option"
                  ref={(node) => {
                    listRef.current[index + indexWithAddButton] = node;
                  }}
                  className={cn(
                    "text-left hover:bg-aqua hover:text-white rounded px-4 py-1",
                    {
                      ["bg-aqua text-white"]:
                        hoverIndex === index + indexWithAddButton,
                    },
                  )}
                  key={it.value}
                  onClick={() => {
                    handleOptionClick(it);
                  }}
                  type="button"
                >
                  {it.as_component ? it.as_component : it.label ?? it.value}
                </button>
              ))}
              {availableOptions.length === 0 ? (
                <div className="px-4 py-1 text-gray-500">
                  {notFoundText ?? "No se encontraron resultados"}
                </div>
              ) : null}
            </div>
          </div>
        </FloatingFocusManager>
      ) : null}
    </div>
  );
}

export type ComboBoxFieldWithName = ComboBoxFieldProps & { name?: string };

export function ComboboxField({ name, ...props }: ComboBoxFieldWithName) {
  const { setValue, getValue } = useForm();

  const handleOnChange = (
    value: string,
    label?: string,
    clear?: () => void,
  ) => {
    if (name && setValue)
      setValue(name, {
        value,
        label,
      });
    props.onChange?.(value, label, clear);
  };

  return (
    // eslint-disable-next-line react/jsx-pascal-case -- a
    <_ComboboxField
      {...props}
      defaultValue={
        name && getValue ? getValue<string>(name)?.value : undefined
      }
      placeholder="Selecciona una opción"
      onChange={handleOnChange}
    />
  );
}

export type ComboboxFieldAsyncProps = Omit<ComboBoxFieldWithName, "options"> & {
  fetchOptions: (query: string) => Promise<{ value: string; label?: string }[]>;
  fetchDefaultValue?: (
    value: string,
  ) => Promise<{ value: string; label?: string } | undefined>;
  preFetchAll?: boolean;
};

export function UComboxFieldAsync({
  fetchOptions,
  preFetchAll,
  ...props
}: ComboboxFieldAsyncProps) {
  const [query, setQuery] = useState<string>("");
  const [options, setOptions] = useState<{ value: string; label?: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(preFetchAll) fetchOptions("").then(setOptions).catch(console.error);
  }, []);

  useDebounce(
    () => {
      if (query.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);

      fetchOptions(query)
        .then((data) => {
          setOptions(data);
        })
        .catch(console.error)
        .finally(() => {
          setLoading(false);
        });
    },
    500,
    [query],
  );

  return (
    // eslint-disable-next-line react/jsx-pascal-case -- a
    <_ComboboxField
      {...props}
      // we just return true because we filter at database
      filter={() => true}
      notFoundText={loading ? "Cargando..." : "No se encontraron resultados"}
      onQueryChange={setQuery}
      options={options}
    />
  );
}

export function ComboxFieldAsync({
  fetchOptions,
  fetchDefaultValue,
  name,
  ...props
}: ComboboxFieldAsyncProps) {
  const { setValue, getValue } = useForm();
  const value = name
    ? getValue<string>(name)
    : {
      value: props.value,
      label: props.label,
    };

  const [defaultValue, setDefaultValue] = useState<
    { value: string; label?: string } | undefined
  >(undefined);

  const v = useMemo(() => (name ? getValue<string>(name) : undefined), []);

  useEffect(() => {
    if (fetchDefaultValue && name && v?.value) {
      fetchDefaultValue(v.value)
        .then((value) => {
          if (value) {
            setDefaultValue(value);
          }
        })
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- not required
  }, [fetchDefaultValue, name]);

  if (fetchDefaultValue && !defaultValue && v?.value)
    return <RawField disabled placeholder="Cargando..." />;

  return (
    <UComboxFieldAsync
      fetchOptions={fetchOptions}
      name={name}
      {...props}
      defaultQuery={defaultValue?.label ?? value?.label ?? value?.value}
      defaultValue={value?.value}
      onChange={(value, label, clear) => {
        if (name && setValue)
          setValue(name, {
            value,
            label,
          });
        props?.onChange?.(value, label, clear);
      }}
    />
  );
}

export function UDropdown({
  options,
  props,
  className,
  onChange,
  value,
  withoutDefault,
}: {
  options: { id: string; label?: string }[];
  props: InputHTMLAttributes<HTMLSelectElement>;
  className?: string;
  onChange?: (value: string, label?: string) => void;
  value?: string;
  withoutDefault?: boolean;
}) {
  const ref = useRef<HTMLSelectElement>(null);

  // this come with a default value so we need to grab it
  useEffect(() => {
    if (ref.current && props.name) {
      const option = ref.current.selectedOptions[0] as
        | HTMLOptionElement
        | undefined;

      onChange?.(ref.current.value, option?.label);
    }
  }, [props.name]);

  return (
    <select
      className={cn(
        "p-1 min-h-[34px] w-full bg-white rounded-lg border border-gray-400 border-b-gray-500",
        className,
      )}
      {...props}
      onChange={(e) => {
        onChange?.(e.target.value, e.target.selectedOptions[0].label);
      }}
      ref={ref}
      value={value}
    >
      {withoutDefault ? (
        <option disabled selected value="">
          Selecciona una opción
        </option>
      ) : null}
      {options.map((it) => (
        <option key={it.id} value={it.id}>
          {it.label ?? it.id}
        </option>
      ))}
    </select>
  );
}

export type DropdownOption = { id: string; label?: string };

export function Dropdown({
  options,
  props,
  className,
  withoutDefault,
}: {
  options: DropdownOption[];
  props: InputHTMLAttributes<HTMLSelectElement>;
  className?: string;
  withoutDefault?: boolean;
}) {
  const ref = useRef<HTMLSelectElement>(null);
  const { proxyOnChange, getValue, setValue } = useForm();

  // this come with a default value so we need to grab it
  useEffect(() => {
    if (ref.current && props.name && !withoutDefault) {
      const option = ref.current.selectedOptions[0] as
        | HTMLOptionElement
        | undefined;

      setValue(props.name, {
        value: ref.current.value,
        label: option?.label,
        touched: false,
      });
    }
  }, [props.name]);

  return (
    <div className="relative min-h-[34px] w-full">
      <div className="absolute top-0 right-0 h-full p-1 px-2 touch-none pointer-events-none">
        <FontAwesomeIcon icon={faChevronDown} />
      </div>
      <select
        className={cn(
          "p-1 px-2 w-[inherit] h-[inherit] bg-white rounded-lg border border-gray-400 border-b-gray-500 appearance-none active:outline-none focus:outline-none",
          className,
        )}
        ref={ref}
        value={props.name ? getValue<string>(props.name)?.value : undefined}
        {...props}
        onChange={proxyOnChange(props)}
      >
        {withoutDefault ? (
          <option disabled selected value="">
            Selecciona una opción
          </option>
        ) : null}
        {options.map((it) => (
          <option key={it.id} value={it.id}>
            {it.label ?? it.id}
          </option>
        ))}
      </select>
    </div>
  );
}

export const MoneyField = forwardRef(function MoneyField(
  {
    label,
    props,
  }: {
    label: FieldWrapperProps;
    props: InputHTMLAttributes<HTMLInputElement>;
  },
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const { proxyOnChange, getValue } = useForm();

  const value =
    (props.value as string) ??
    (props.name ? getValue<string>(props.name)?.value : undefined);

  return (
    <FieldWrapper {...label}>
      <div className="p-1 px-2 w-full rounded-lg border border-gray-400 border-b-gray-500">
        <div className="flex gap-2 justify-start items-center">
          <div>MXN</div>
          <input
            className="w-full focus:outline-none"
            placeholder="0"
            type="number"
            {...props}
            onChange={proxyOnChange(props, Number)}
            value={value}
            ref={ref}
          />
        </div>
      </div>
    </FieldWrapper>
  );
});

export function RMoneyField(props: InputHTMLAttributes<HTMLInputElement>) {
  const { proxyOnChange, getValue } = useForm();

  return (
    <div className="h-[34px] p-1 px-2 w-full rounded-lg border border-gray-400 border-b-gray-500">
      <div className="flex gap-2 justify-start items-center">
        <div>MXN</div>
        <input
          className="w-full focus:outline-none"
          placeholder="0"
          type="number"
          {...props}
          onChange={proxyOnChange(props, Number)}
          value={props.name ? getValue<string>(props.name)?.value : props.value}
        />
      </div>
    </div>
  );
}

export function LabeledField({
  labelValue,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  labelValue: string;
}) {
  const { proxyOnChange, getValue } = useForm();

  return (
    <div
      className={cn(
        "h-[34px] p-1 px-2 w-full rounded-lg border border-gray-400 border-b-gray-500",
        {
          "opacity-30 cursor-not-allowed": props.disabled,
        },
      )}
    >
      <div
        className={cn("flex gap-2 justify-start items-center", {
          "cursor-not-allowed": props.disabled,
        })}
      >
        <div>{labelValue}</div>
        <input
          className={cn("w-full focus:outline-none", {
            "cursor-not-allowed": props.disabled,
          })}
          {...props}
          onChange={proxyOnChange(props, Number)}
          value={props.name ? getValue<string>(props.name)?.value : props.value}
        />
      </div>
    </div>
  );
}

export const RawField = forwardRef(function RawField(
  props: InputHTMLAttributes<HTMLInputElement>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const { proxyOnChange, getValue } = useForm();

  return (
    <input
      {...props}
      ref={ref}
      className={cn(
        "p-1 px-2 h-[34px] w-full rounded-lg border border-gray-400 border-b-gray-500 focus:outline-none",
        {
          ["bg-gray-100 cursor-not-allowed"]: props.disabled,
          ["bg-white"]: !props.disabled,
        },
        props.className,
      )}
      onChange={proxyOnChange(props)}
      value={props.name ? getValue<string>(props.name)?.value : props.value}
    />
  );
});

export function PhoneField({
  name,
  value,
  onChange,
  disabled,
}: {
  name?: string;
  value?: string;
  onChange?: (phone: string) => void;
  disabled?: boolean;
}) {
  const { setValue, getValue } = useForm();

  const _value = value
    ? value
    : name
      ? getValue<string>(name)?.value
      : undefined;

  const handleChange = (phone: string) => {
    onChange?.(phone);
    if (name) {
      setValue(name, {
        value: phone,
      });
    }
  };

  return (
    <PhoneInput
      buttonClass="border-r"
      containerClass={cn(
        "py-1 w-full rounded-lg border border-gray-400 border-b-gray-500",
        {
          ["bg-gray-200 cursor-not-allowed"]: disabled,
          ["bg-white"]: !disabled,
        },
      )}
      country="mx"
      dropdownClass="bg-white border rounded-lg text-sm"
      enableSearch
      inputProps={{
        className: "focus:outline-none ml-14 px-1",
      }}
      localization={es}
      onChange={(rawPhone) => {
        handleChange(`+${rawPhone}`);
      }}
      searchClass="bg-black"
      searchPlaceholder="Buscar"
      searchStyle={{
        border: "none",
      }}
      // we want empty values to be undefined
      value={_value}
      disabled={disabled}
    />
  );
}

export const Field = forwardRef(function Field(
  {
    label,
    props,
  }: {
    label: FieldWrapperProps;
    props: InputHTMLAttributes<HTMLInputElement>;
  },
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <FieldWrapper {...label}>
      <RawField ref={ref} {...props} />
    </FieldWrapper>
  );
});

export function FileField({
  mode = "file",
  ...props
}: { mode: "file" | "image" } & InputHTMLAttributes<HTMLInputElement>) {
  const { setValue, getValue } = useForm();

  const value = props.name ? getValue<string>(props.name)?.value : props.value;

  const section = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const handleClickToUpload = () => {
    input.current?.click();
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(e);

    if (props.name) {
      const file = e.target.files?.[0];
      if (file) {
        // URL.createObjectURL(file);

        setValue(props.name, {
          value: file,
          touched: true,
        });
      }
    }
  };

  const [isDropping, setIsDropping] = useState(false);

  useEffect(() => {
    if (!section.current) return;
    const node = section.current;

    const dragOver = (e: DragEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsDropping(true);
    };

    const dragEnter = (e: DragEvent) => {
      e.stopPropagation();
      e.preventDefault();

      setIsDropping(true);
    };

    const dragLeave = (e: DragEvent) => {
      e.stopPropagation();
      e.preventDefault();

      setIsDropping(false);
    };

    const dragDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDropping(false);

      if (e.dataTransfer) {
        const files = Array.from(e.dataTransfer.items)
          .filter((it) => it.kind === "file")
          .flatMap((it) => {
            const file = it.getAsFile();
            return file ?? [];
          });

        if (files.length > 0) {
          if (props.name)
            setValue(props.name, {
              value: files[0],
              touched: true,
            });
        }
      }
    };

    node.addEventListener("dragover", dragOver);
    node.addEventListener("dragenter", dragEnter);
    node.addEventListener("dragleave", dragLeave);
    node.addEventListener("drop", dragDrop);

    return () => {
      node.removeEventListener("dragover", dragOver);
      node.removeEventListener("dragenter", dragEnter);
      node.removeEventListener("dragleave", dragLeave);
      node.removeEventListener("drop", dragDrop);
    };
  }, []);

  return (
    <div
      className={cn("relative border p-5  border-dashed rounded-lg", {
        ["border-gray-400"]: !isDropping,
        ["bg-aqua/20"]: isDropping,
      })}
      ref={section}
    >
      {value ? (
        <div className="absolute right-0 top-0 p-2 flex gap-1">
          <FlatButton
            icon={{
              icon: faPencil,
            }}
            onClick={handleClickToUpload}
            css={{
              padding: "5px 10px",
            }}
          />
          <FlatButton
            icon={{
              icon: faTimes,
            }}
            css={{
              padding: "5px 10px",
            }}
            onClick={() => {
              if (props.name)
                setValue(props.name, {
                  value: undefined,
                  touched: false,
                });
            }}
          />
        </div>
      ) : null}
      <input
        accept={mode === "image" ? "image/*" : undefined}
        {...props}
        type="file"
        className="hidden"
        ref={input}
        onChange={handleOnChange}
      />

      {!value ? (
        <div className="flex flex-col gap-1 text-center text-gray-400">
          {mode === "image" ? (
            <FontAwesomeIcon icon={faImage} className="text-5xl" />
          ) : (
            <FontAwesomeIcon icon={faFile} className="text-5xl" />
          )}
          <div>
            <div className="text-sm">
              <button
                type="button"
                className="text-aqua"
                onClick={handleClickToUpload}
              >
                {mode === "image"
                  ? "Selecciona una imagen"
                  : "Selecciona un archivo"}
              </button>{" "}
              o arrástrala aquí
            </div>
            <div className="text-xs">Hasta 5mb</div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <img
            src={
              value instanceof File
                ? URL.createObjectURL(value as unknown as File)
                : (value as string)
            }
          />
        </div>
      )}
    </div>
  );
}

export function FormSeparator() {
  return <div className="my-3 border-b border-black/20" />;
}

export interface FormProps {
  defaultValues: Record<string, FormEntry>;
  onClose: () => void;
  open: boolean;
  openMode: "add" | "edit";
}

export function useModalFormControl(
  defaultAdd?: boolean,
  onClose?: () => void,
  onOpen?: () => void,
) {
  const [open, setOpen] = useState<"closed" | "add" | "edit">(
    defaultAdd ? "add" : "closed",
  );
  const [modalState, setModalState] = useImmer<Record<string, FormEntry>>({});

  const openWith = (data: Record<string, FormEntry>, mode?: "edit" | "add") => {
    setModalState(() => data);
    setTimeout(() => {
      setOpen(mode ?? "edit");
      onOpen?.();
    }, 1);
  };

  const handleOnClose = () => {
    onClose?.();
    setModalState({});
    setOpen("closed");
  };

  return {
    setOpen: (value: "closed" | "add" | "edit" | undefined) => {
      setOpen(value ?? "add");
      onOpen?.();
    },
    open,
    openWith,
    isOpen: open !== "closed",
    modalState,
    setModalState,
    close: handleOnClose,
    formProps: {
      defaultValues: modalState,
      onClose: handleOnClose,
      open: open !== "closed",
      openMode: open as "add" | "edit",
    } as FormProps,
  };
}

interface ContextProps {
  values: Record<string, FormEntry>;
  setValue: (id: string, value: FormEntry) => void;
}

const Context = createContext<ContextProps>({
  values: {},
  setValue: () => { },
});

export const Form = forwardRef<
  HTMLFormElement,
  {
    defaultValues?: Record<string, FormEntry>;
    children: React.ReactNode;
    onValuesChange?: (values: Record<string, FormEntry>) => void;
    onSubmit?: (
      values: Record<string, unknown>,
      complete: Record<string, FormEntry>,
    ) => void;
  }
>(function Form({ defaultValues, children, onValuesChange, onSubmit }, ref) {
  const [values, setValues] = useImmer<Record<string, FormEntry>>(
    defaultValues ?? {},
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const v = values as unknown as Record<string, Record<string, unknown>>;
        onSubmit?.(extractValue(v, "value"), values);
      }}
      ref={ref}
      className="w-full h-full"
    >
      <Context.Provider
        value={{
          values,
          setValue: (id, value) => {
            setValues((prev) => {
              prev[id] = value;
            });
            onValuesChange?.(values);
          },
        }}
      >
        {children}
      </Context.Provider>
    </form>
  );
});

export interface FormEntry<T = unknown> {
  value: T;
  label?: string;
  touched?: boolean;
}

export interface ModalFormProps extends ModalBoxProps {
  open: boolean;
}

export interface ModalBoxProps {
  label: string | React.ReactNode;
  onSubmit?: (
    values: Record<string, unknown>,
    complete: Record<string, FormEntry>,
  ) => void;
  defaultValues?: Record<string, FormEntry>;
  children: React.ReactNode;
  onClose: () => void;
  additionalButtons?: {
    confirm?: FlatButtonConfirmationProps;
    label: string;
    style: "default" | "accept";
    onClick?: (
      values: Record<string, unknown>,
      complete: Record<string, FormEntry>,
    ) => void;
    submit?: boolean;
    idTag?: string;
  }[];
  confirmProps?: FlatButtonConfirmationProps;
  cantCancel?: boolean;
}

export function FormBox({
  onSubmit,
  defaultValues,
  label,
  children,
  onClose,
  additionalButtons,
  confirmProps,
  cantCancel,
}: ModalBoxProps) {
  const [values, setValues] = useImmer<Record<string, FormEntry>>(
    defaultValues ?? {},
  );

  useEffect(() => {
    if (defaultValues) setValues(defaultValues);
  }, [defaultValues]);

  const handleCancel = () => {
    setValues({});
    onClose();
  };

  const handleSubmit = () => {
    const v = extractValue(values, "value", (v) => Boolean(v.touched));
    onSubmit?.(v, values);
  };

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      className="w-full h-full"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      ref={formRef}
    >
      <div className="flex justify-center items-center w-full h-full">
        <div
          className="flex flex-col h-fit w-[95vw] max-h-[90vh] bg-white rounded-xl md:w-[370px] lg:w-[500px] max-w-[100vw] shadow-xl"
          onClick={(e) => {
            e.stopPropagation();
          }}
          role="presentation"
        >
          <div className="flex justify-between items-center px-5 py-3 border-b border-black/20">
            <div className="text-xl font-bold">{label}</div>
            {!cantCancel && (
              <div>
                <button
                  onClick={handleCancel}
                  type="button"
                  className="active:scale-90"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            )}
          </div>
          <div className="flex overflow-auto flex-col gap-2 p-5">
            <Context.Provider
              value={{
                values,
                setValue: (id, value) => {
                  setValues((prev) => {
                    prev[id] = value;
                  });
                },
              }}
            >
              {children}
            </Context.Provider>
          </div>
          <div className="self-end w-full mt-auto">
            <div className="flex gap-2 justify-end items-center p-3 border-t border-black/20">
              <div className="text-xl font-bold">
                {!cantCancel && (
                  <FlatButton
                    name="Cancelar"
                    onClick={handleCancel}
                    style="default"
                  />
                )}
              </div>
              <div>
                <FlatButtonConfirmation
                  name="Guardar"
                  style="accept"
                  submit
                  {...confirmProps}
                />
              </div>
              {additionalButtons?.map((it) => (
                <div>
                  <FlatButtonConfirmation
                    name={it.label}
                    onClick={() => {
                      const v = extractValue(values, "value", (v) =>
                        Boolean(v.touched),
                      );
                      it.onClick?.(v, values);
                    }}
                    style={it.style}
                    {...it.confirm}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export function ModalForm({ onClose, open, ...props }: ModalFormProps) {
  useEscape(() => {
    if (open) {
      onClose?.();
    }
  });

  return (
    <Transition as={Fragment} show={open}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed top-0 left-0 flex justify-center items-center w-full h-full">
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
              className="fixed inset-0 bg-black/25 z-auto"
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
            <Dialog.Panel className="z-50">
              <FormBox {...props} onClose={onClose} />
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export function useForm() {
  const { values, setValue } = useContext(Context);

  const proxyOnChange =
    (
      props: InputHTMLAttributes<unknown>,
      preprocess?: (value: string) => unknown,
    ) =>
      (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
        props.onChange?.(e);
        if (props.name) {
          const target = e.target.value;
          let value: unknown;

          if (preprocess) {
            if (target.length === 0) {
              value = undefined;
            } else {
              value = preprocess(e.target.value);
            }
          } else {
            value = target;
          }

          if (setValue)
            setValue(props.name, {
              value,
              // @ts-expect-error -- we know it's there, otherwise will be just undefined
              label: e.target.selectedOptions?.[0]?.label ?? e.target.value,
              touched: true,
            });
        }
      };

  function getValue<T>(key: string) {
    return values[key] as FormEntry<T> | undefined;
  }

  return {
    values,
    getValue,
    setValue: (key: string, value: FormEntry) => {
      if (setValue)
        setValue(key, {
          touched: true,
          ...value,
        });
    },
    proxyOnChange,
  };
}

export function Checkbox({
  label,
  props,
}: {
  label: string;
  props?: InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <div className="text-aqua font-medium text-sm">
      <input type="checkbox" {...props} /> {label}
    </div>
  );
}

export function MCheckbox(props: {
  label: string;
  props?: InputHTMLAttributes<HTMLInputElement>;
}) {
  const { setValue, getValue } = useForm();

  return (
    <Checkbox
      {...props}
      props={{
        onChange: (e) => {
          props.props?.onChange?.(e);
          if (props.props?.name)
            setValue(props.props.name, {
              value: e.target.checked,
              touched: true,
            });
        },
        checked: props.props?.name
          ? getValue<boolean>(props.props.name)?.value
          : undefined,
        ...props.props,
      }}
    />
  );
}
