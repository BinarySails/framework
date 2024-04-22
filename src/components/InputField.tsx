import { useEffect, useRef, useState } from "react";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { PhoneInputProps } from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

interface InputFieldProps {
  label: string;
  value?: string | number;
  type?: "underline" | "outline";
  accept?: "number" | "text" | "image" | "file" | "code" | "phone";
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCodeChange?: (code: string) => void;
  formatSize?: number | boolean;
  className?: string;
  phoneIsValid?: PhoneInputProps["isValid"];
  validField?: boolean;
}

export function InputField({
  label,
  value,
  accept = "text",
  onChange,
  onCodeChange,
  className,
  validField = true,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [touched, setTouched] = useState(false);
  const [digits, setDigits] = useState<{ value: string; position: number }[]>([
    { value: "", position: 0 },
    { value: "", position: 1 },
    { value: "", position: 2 },
    { value: "", position: 3 },
    { value: "", position: 4 },
    { value: "", position: 5 },
  ]);

  if (validField && touched) setTouched(false);

  useEffect(() => {
    if (accept === "image" && value) {
      setPreviewUrl(value as string);
    }
  }, []);

  const setDigit = (value: string, index: number) => {
    const newDigits = [...digits];

    for (let i = 0; i < value.length; i++) {
      newDigits[index + i] = {
        value: value[i],
        position: index + i,
      };
    }

    setDigits(newDigits);
    if (onCodeChange) {
      const code = newDigits.map((d) => d.value).join("");
      onCodeChange(code);
    }
  };

  const setMultipleDigits = (newValue: string, index: number) => {
    let addedValues = 0;

    if (newValue.length > 1) {
      const amount = Math.min(6, newValue.length);
      const toInsert = newValue
        .slice(0, amount)
        .split("")
        .map((v) => {
          const parsedValue = parseInt(v, 10);
          return isNaN(parsedValue) ? "" : String(parsedValue);
        })
        .join("");

      setDigit(toInsert, index);
      addedValues = toInsert.length;
    } else {
      setDigit(newValue, index);
      addedValues++;
    }

    const moveTo = Math.min(index + addedValues, 5);
    if (index < 5 && moveTo <= 5) {
      inputRefs.current[moveTo]?.focus();
    }

    if (index === 5 && index + addedValues === 6) {
      inputRefs.current[index]?.blur();
    }
  };

  const handleCodeChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.value;

    if (/^\d*$/.test(newValue)) {
      setMultipleDigits(newValue, index);
    }
  };

  const handleCodeKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const newDigits = [...digits];
      newDigits[index] = {
        value: "",
        position: index,
      };
      setDigits(newDigits);
      if (onCodeChange) {
        const code = newDigits.map((d) => d.value).join("");
        onCodeChange(code);
      }
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedValue = event.clipboardData.getData("text/plain");

    setMultipleDigits(pastedValue, 0);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewUrl(`${URL.createObjectURL(file)}`);
    }
    onChange?.(event);
  };

  let classNameSelector =
    "w-full rounded-lg border-aqua/50 border p-2 focus:outline-aqua ";
  if (accept === "file" || accept === "image")
    classNameSelector +=
      "file:mr-4 file:px-4 file:py-2 file:text-sm file:border-0 file:font-semibold file:text-aqua file:bg-aqua/10 hover:file:bg-aqua/30 hover:file:cursor-pointer block w-full text-sm text-gray-900 border border-aqua/30 rounded-lg cursor-pointer focus:outline-none";
  if (accept === "phone") classNameSelector += "pl-16";
  if (accept === "code") classNameSelector += "w-fit";
  classNameSelector += ` ${className}`;

  let typeSelector = "";
  if (accept === "file" || accept === "image") {
    typeSelector = "file";
  } else if (accept === "number") {
    typeSelector = "number";
  } else {
    typeSelector = "text";
  }

  return (
    <div
      className={`flex ${
        accept === "code" ? "w-fit" : "w-full"
      } flex-col custom-input`}
    >
      <label
        className={`text-xs font-medium mb-1 self-start ${
          isFocused ? "text-aqua" : " text-gray-500/50"
        }`}
      >
        {label}
      </label>
      {/* eslint-disable @next/next/no-img-element -- responsiveness */}
      {/* eslint-disable-next-line no-nested-ternary -- asd*/}
      {accept === "file" || accept === "image" ? (
        previewUrl ? (
          <img
            alt="Preview"
            className="min-w-[200px] max-w-[400px] max-h-72 h-auto mb-2 rounded-lg self-center"
            src={previewUrl}
          />
        ) : (
          <div className="flex flex-col text-gray-400 gap-3 p-8">
            <FontAwesomeIcon className="text-[100px]" icon={faUpload} />
            <p className="self-center text-sm">
              Sube una imagen para tu producto
            </p>
          </div>
        )
      ) : null}
      {/* eslint-disable-next-line no-nested-ternary -- if accept "code" - else if accept "phone" - else "text/number" input. */}
      {accept === "code" ? (
        <div className="flex flex-row w-fit gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            /* eslint-disable react/no-array-index-key -- in this case it's best to set key to index. */
            <input
              aria-label="code"
              autoComplete="one-time-code"
              className="border border-aqua/50 focus:outline-aqua rounded-lg p-2 w-8 text-center"
              key={index}
              maxLength={1}
              onBlur={() => {
                setIsFocused(false);
              }}
              onChange={(event) => {
                handleCodeChange(index, event);
              }}
              onFocus={(event) => {
                setIsFocused(true);
                event.currentTarget.select();
              }}
              onKeyDown={(event) => {
                handleCodeKeyDown(index, event);
              }}
              onPaste={handleCodePaste}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              type="tel"
              value={digits[index]?.value || ""}
            />
          ))}
        </div>
      ) : accept === "phone" ? (
        <>
          {/* TODO: replace with yup */}
          {Boolean(touched) && (
            <div className="flex items-center gap-1 w-full text-sm text-red-500 transition-all select-none">
              <FontAwesomeIcon icon={faCircleXmark} />
              <p className="">Número no válido</p>
            </div>
          )}
        </>
      ) : (
        <input
          accept={accept === "image" ? "image/*" : undefined}
          className={classNameSelector}
          onBlur={() => {
            setIsFocused(false);
          }}
          onChange={
            accept === "file" || accept === "image"
              ? handleFileChange
              : onChange
          }
          onFocus={() => {
            setIsFocused(true);
          }}
          type={typeSelector}
          //if accept is image, value is set to the preview instead of the file itself
          value={accept === "image" ? undefined : value}
        />
      )}
    </div>
  );
}
