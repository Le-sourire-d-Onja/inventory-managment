import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const localeDateOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
}

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function useStateParam<T extends string | null>(
  key: string,
  defaultValue: T = null as T
): [T, (value: T) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [value, setValue] = useState<T>(() => {
    const param = searchParams.get(key);
    return (param ?? defaultValue) as T;
  });

  // Sync URL param -> state (on mount or URL change)
  useEffect(() => {
    const param = searchParams.get(key);
    if ((param ?? "") !== value) {
      setValue((param ?? defaultValue) as T);
    }
  }, [searchParams.get(key)]); // React 18+ handles this safely

  const setParam = useCallback(
    (newValue: T) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (!newValue) {
        params.delete(key);
      } else {
        params.set(key, newValue);
      }
      router.replace(`?${params.toString()}`);
      setValue(newValue);
    },
    [key, searchParams, router]
  );

  return [value, setParam];
}