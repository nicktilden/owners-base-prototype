import { useLayoutEffect, useRef } from "react";
import { resetToolTabScrollLayout } from "@/utils/resetToolTabScroll";

/**
 * After the active tab key changes, scroll the shell and in-tab table/grid viewports to the origin.
 * Runs again on the next animation frames so AG Grid and other deferred layouts can attach before we reset.
 */
export function useResetScrollOnTabChange(activeTabKey: string): void {
  const rafIdsRef = useRef<number[]>([]);

  useLayoutEffect(() => {
    resetToolTabScrollLayout();
    rafIdsRef.current = [];
    rafIdsRef.current.push(
      requestAnimationFrame(() => {
        resetToolTabScrollLayout();
        rafIdsRef.current.push(requestAnimationFrame(() => resetToolTabScrollLayout()));
      })
    );
    return () => {
      for (const id of rafIdsRef.current) {
        cancelAnimationFrame(id);
      }
    };
  }, [activeTabKey]);
}
