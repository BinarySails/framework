import { RRule } from "rrule";
import type { FormEntry } from "./forms";
import { z, ZodError } from "zod";

export const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
export const DAYS_ORDER_JS = ["D", "L", "M", "X", "J", "V", "S"];
export const COMPLETE_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export function rruleDaysFromStr(day: string) {
  switch (day) {
    case "L":
    case "MO":
      return RRule.MO;
    case "M":
    case "TU":
      return RRule.TU;
    case "X":
    case "WE":
      return RRule.WE;
    case "J":
    case "TH":
      return RRule.TH;
    case "V":
    case "FR":
      return RRule.FR;
    case "S":
    case "SA":
      return RRule.SA;
    case "D":
    case "SU":
      return RRule.SU;
    default:
      throw new Error("Invalid day: " + day);
  }
}

export function doubleDigitDayToDays(day: string) {
  switch (day) {
    case "MO":
      return "L";
    case "TU":
      return "M";
    case "WE":
      return "X";
    case "TH":
      return "J";
    case "FR":
      return "V";
    case "SA":
      return "S";
    case "SU":
      return "D";
    default:
      throw new Error("Invalid day");
  }
}

export function emptyToUndefined(s: string | undefined) {
  if (!s?.length) return undefined;
  return s;
}

export function stringToHexColor(str: string) {
  // Generate a hash from the input string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert the hash to a 24-bit color code (6 hexadecimal digits)
  const color = (hash & 0x00ffffff).toString(16).toUpperCase();

  // Ensure the color code has 6 digits by adding leading zeros if needed
  return `#${"0".repeat(6 - color.length)}${color}`;
}

export function niceDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(date).toLocaleString("default", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function niceTimeDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(date).toLocaleString("default", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...options,
  });
}

export function niceMoney(
  amount = 0,
  options?: Intl.NumberFormatOptions,
): string {
  return `MXN ${new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    ...options,
  }).format(amount / 100)}`;
}

export function toLocalISOString(_date: Date | string) {
  const date = new Date(_date);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, -1);
}

export function extractValue<T extends Record<string, unknown>>(
  formEntries: T,
  field: keyof T[Extract<keyof T, string>],
  evalFn?: (v: T[Extract<keyof T, string>]) => boolean,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key in formEntries) {
    const val = formEntries[key];
    if (evalFn && !evalFn(val)) continue;

    result[key] = val[field];
  }

  return result;
}

export function toFormEntries<T>(
  stringValues: T,
  values?: Record<string, string>,
): Record<string, FormEntry> {
  const result: Record<string, FormEntry> = {};

  for (const key in stringValues) {
    const formEntry: FormEntry = {
      value: stringValues[key],
      label: values?.[key],
    };
    result[key] = formEntry;
  }

  return result;
}

export function timeToDate(time: string): Date {
  const [h, m] = time.split(":");
  const d = new Date();
  d.setUTCHours(parseInt(h));
  d.setUTCMinutes(parseInt(m));
  return d;
}

export function dateToDate(date: string): Date {
  const [y, m, d] = date.split("-");
  const d2 = new Date();
  d2.setUTCFullYear(parseInt(y));
  d2.setUTCMonth(parseInt(m) - 1);
  d2.setUTCDate(parseInt(d));
  return d2;
}

export function timeToUtc(time: string): string {
  const [h, m] = time.split(":");
  const d = new Date();
  d.setHours(parseInt(h));
  d.setMinutes(parseInt(m));
  return d.toISOString().slice(11, 16);
}

export function timeToLocal(time: string): string {
  const [h, m] = time.split(":");
  const d = new Date();
  d.setUTCHours(parseInt(h));
  d.setUTCMinutes(parseInt(m));
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}:00`;
}

export function niceTime(
  time: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof time === "string" ? timeToDate(time) : time;
  return d.toLocaleTimeString("default", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...options,
  });
}

export function niceMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}h ${m}m`;
}

export function parseTxnType(type: string) {
  switch (type) {
    case "income":
      return "Ingreso";
    case "refund":
      return "Reembolso";
    case "expense":
      return "Egreso";
    default:
      return type;
  }
}

export function parseTxnMethod(method: string) {
  switch (method) {
    case "cash":
      return "Efectivo";
    case "card":
      return "Tarjeta";
    case "transfer":
      return "Transferencia";
    case "stripe":
      return "Joger.app";
    default:
      return method[0].toUpperCase() + method.slice(1);
  }
}

export function randomString(length = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = new Uint8Array(length);
  const random = window.crypto.getRandomValues(bytes);

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[random[i] % chars.length];
  }
  return result;
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function secondsToHm(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const formatted = `${hours}h ${minutes.toString().padStart(2, "0")}m`;

  return [formatted, hours, minutes] as const;
}

export function weekdayToIndexOne(weekday: number) {
  return weekday === 0 ? 7 : weekday;
}

export function indexOneToIndexZero(weekday: number) {
  // 1 -> 0
  // 2 -> 1
  // 2 -> 3
  // 3 -> 4

  return weekday === 7 ? 0 : weekday;
}

export function niceTimeDiff(to: Date | string, from: Date | string) {
  const t1 = new Date(to);
  const t2 = new Date(from);

  const diff = t1.getTime() - t2.getTime();

  const [time] = secondsToHm(diff / 1000);
  return time;
}

export function zodErrorToReadableMessage(error: z.ZodError) {
  const issue = error.issues[0];
  const path = issue.path
    .map((cut, index) => {
      let value = "";
      if (typeof cut === "number") value += `[${cut}]`;
      else value += `${cut}`;

      if (index !== issue.path.length - 1) value += ".";

      return value;
    })
    .join("");

  if (!path.length) return `${issue.message}`;

  if (issue.message === "Required") return `The field "${path}" is required`;

  return `${issue.message}`;
}

export function niceError(error: unknown) {
  if (
    error instanceof z.ZodError ||
    (error as { name: string }).name === "ZodError"
  )
    return zodErrorToReadableMessage(error as ZodError);
  if (error instanceof Error) return error.message;
  return String(error);
}

export function sumHour(from: number, amount: number): number {
  if (from + amount < 24) return from + amount;
  return from + amount - 24;
}

export function sumMinutes(from: number, amount: number): number {
  const [__, m] = secondsToHm(from * 3600 + amount * 60);
  return m;
}

export function createArrayChunks<T>(
  arr: T[],
  rule: (el: T) => string,
): Record<string, T[]> {
  const result: Record<string, T[]> = {};

  for (const el of arr) {
    const key = rule(el);
    if (!result[key]) result[key] = [];
    result[key].push(el);
  }

  return result;
}

export class DateBuilder {
  private date: Date;

  constructor(date?: Date | string) {
    this.date = new Date(date ?? new Date());
  }

  setDay(day: number) {
    this.date.setDate(day);
    return this;
  }

  setMonth(month: number) {
    this.date.setMonth(month);
    return this;
  }

  setYear(year: number) {
    this.date.setFullYear(year);
    return this;
  }

  setHours(hours: number) {
    this.date.setHours(hours);
    return this;
  }

  setMinutes(minutes: number) {
    this.date.setMinutes(minutes);
    return this;
  }

  setSeconds(seconds: number) {
    this.date.setSeconds(seconds);
    return this;
  }

  setMilliseconds(milliseconds: number) {
    this.date.setMilliseconds(milliseconds);
    return this;
  }

  build() {
    return this.date;
  }
}

export type OptionalField<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
