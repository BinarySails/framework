import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useEditableUseParams() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const editMultiple = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      newParams.set(key, value);
    });

    const url = new URL(window.location.href);
    url.search = newParams.toString();

    router.push(url.toString(), {
      scroll: false,
    });
  };

  return {
    edit: (key: string, value: string) => {
      editMultiple({ [key]: value });
    },
    editMultiple,
  };
}

export function useParamsState<T>(
  key: string,
  def: T,
  mapGet: (value: string) => T,
  mapSet: (value: T) => string,
) {
  const mutateParams = useEditableUseParams();
  const searchParams = useSearchParams();

  const u = useMemo(() => {
    const value = searchParams.get(key);
    if (value) {
      return mapGet(value);
    }
    return def;
  }, [searchParams, key, def, mapGet]);

  return [
    u,
    (value: T) => {
      mutateParams.edit(key, mapSet(value));
    },
  ] as const;
}
