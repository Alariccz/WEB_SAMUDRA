import * as React from "react";

export function useAwake(): [(el: HTMLElement | null) => void, boolean] {
  const [awake, setAwake] = React.useState(true);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const watch = React.useCallback((el: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    if (!el || typeof IntersectionObserver === "undefined") {
      setAwake(true);
      return;
    }
    observerRef.current = new IntersectionObserver(([entry]) => {
      setAwake(entry.isIntersecting);
    });
    observerRef.current.observe(el);
  }, []);

  React.useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return [watch, awake];
}
