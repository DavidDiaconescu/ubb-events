import { useState } from "react";

/**
 * State for a small form: all fields in one object, a setter per field and a reset.
 * `reset()` restores the initial values; `reset(["title"])` restores only the given fields.
 */
export function useFormState<T extends object>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  function setField<K extends keyof T>(key: K, value: T[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function reset(keys?: (keyof T)[]) {
    if (!keys) {
      setValues(initialValues);
      return;
    }
    setValues((current) => {
      const next = { ...current };
      for (const key of keys) next[key] = initialValues[key];
      return next;
    });
  }

  return { values, setField, reset };
}
