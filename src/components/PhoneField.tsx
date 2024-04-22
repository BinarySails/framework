import { useState } from "react";
import type { CountryData, PhoneInputProps } from "react-phone-input-2";
import PhoneInput from "react-phone-input-2";
import es from "react-phone-input-2/lang/es.json";

type PhoneFieldProps = PhoneInputProps & {
  label: string;
  onPhoneChange?: (rawPhone: string, nicePhone: string) => void;
};

export function PhoneField({ label, ...props }: PhoneFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col w-full custom-input">
      <label
        className={`text-xs font-medium mb-1 self-start ${
          isFocused ? "text-black" : " text-gray-500/50"
        }`}
      >
        {label}
      </label>
      <PhoneInput
        country="mx"
        dropdownClass="bg-white border-gray border rounded-lg shadow-lg text-sm customscrollbar"
        inputProps={{
          className:
            "w-full rounded-lg border border-gray focus:border-black/50 border p-2 block w-full text-sm text-gray-900 rounded-lg focus:outline-none pl-16",
        }}
        localization={es}
        specialLabel=""
        {...props}
        onBlur={(
          event: React.FocusEvent<HTMLInputElement>,
          data: CountryData | Record<string, unknown>,
        ) => {
          props.onBlur?.(event, data);
          setIsFocused(false);
        }}
        onChange={(rawPhone, _data, _event, nicePhone) => {
          props.onPhoneChange?.(rawPhone, nicePhone);
          props.onChange?.(rawPhone, _data, _event, nicePhone);
        }}
        onFocus={(
          event: React.FocusEvent<HTMLInputElement>,
          data: CountryData | Record<string, unknown>,
        ) => {
          props.onFocus?.(event, data);
          setIsFocused(true);
        }}
      />
    </div>
  );
}
