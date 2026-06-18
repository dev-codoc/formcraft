import { useEffect, useState, useRef, useCallback } from "react";

/**
 * Debounces a value — returns the value only after it stops changing
 * for `delay` ms. Useful for search inputs, live previews, etc.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounces a callback itself rather than a value — useful for autosave,
 * where you want to call `saveForm()` only after the user pauses editing.
 *
 * Usage:
 *   const debouncedSave = useDebouncedCallback((schema) => saveToServer(schema), 800);
 *   debouncedSave(updatedSchema); // call this on every change, fires once after pause
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Always keep latest callback without resetting the debounce timer
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}