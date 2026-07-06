import { useState, useEffect } from "react";
import Globals from "../globals.js";

/**
 * Subscribe to a single state key. Returns [value, setter].
 * @param {string} key
 * @returns {[any, (value: any) => void]}
 */
export function useAppState(key) {
  const [value, setValue] = useState(() => Globals.state?.get(key));

  useEffect(() => {
    if (!Globals.state) return;
    const handler = () => {
      setValue(Globals.state?.get(key));
    };
    Globals.state.listeners.add(handler);
    return () => {
      Globals.state?.listeners.delete(handler);
    };
  }, [key]);

  const setter = (newValue) => {
    Globals.state?.update({ [key]: newValue });
  };

  return [value, setter];
}

/**
 * Subscribe to all state changes. Returns a shallow clone of state.values.
 * @returns {Object}
 */
export function useAllState() {
  const [values, setValues] = useState(() => ({ ...(Globals.state?.values ?? {}) }));

  useEffect(() => {
    if (!Globals.state) return;
    const handler = () => {
      setValues({ ...Globals.state.values });
    };
    Globals.state.listeners.add(handler);
    return () => {
      Globals.state?.listeners.delete(handler);
    };
  }, []);

  return values;
}
