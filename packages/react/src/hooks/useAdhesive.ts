import {
  Adhesive,
  type AdhesiveOptions,
  type AdhesiveState,
} from "@adhesivejs/core";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { unwrapElement } from "../utils/unwrapElement.js";

/**
 * Configuration options for the useAdhesive hook.
 *
 * Extends the core AdhesiveOptions but omits targetEl since it's provided via the hook parameter.
 * Adds React-specific boundingRef option for convenient ref-based boundary selection.
 */
export type UseAdhesiveOptions = Partial<Omit<AdhesiveOptions, "targetEl">> & {
  /** React ref for the element that defines sticky boundaries */
  boundingRef?: RefObject<HTMLElement | null>;
};

/** Return type for the useAdhesive hook. */
export type UseAdhesiveReturn = {
  /** Current state of the Adhesive instance, or null if not initialized */
  state: Readonly<AdhesiveState> | null;
};

/**
 * React hook for adding sticky positioning behavior to DOM elements.
 *
 * This hook automatically manages the lifecycle of a Adhesive instance,
 * handling initialization, updates, and cleanup. It integrates seamlessly
 * with React's ref system and component lifecycle.
 *
 * @param target - React ref for the element that should become sticky
 * @param options - Configuration options for sticky behavior
 *
 * @example
 * ```tsx
 * import { useRef } from 'react';
 * import { useAdhesive } from '@adhesivejs/react';
 *
 * function Component() {
 *   const targetRef = useRef<HTMLDivElement>(null);
 *   const boundingRef = useRef<HTMLDivElement>(null);
 *
 *   useAdhesive(
 *     targetRef,
 *     { boundingRef, position: 'top' }
 *   );
 *
 *   return (
 *     <div ref={boundingRef}>
 *       <div ref={targetRef}>Sticky content</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdhesive(
  target: RefObject<HTMLElement | null>,
  options?: UseAdhesiveOptions,
): UseAdhesiveReturn {
  const adhesive = useRef<Adhesive | null>(null);

  const [adhesiveState, setAdhesiveState] = useState<AdhesiveState | null>(
    null,
  );

  const onStateChange = (newState: AdhesiveState) => {
    setAdhesiveState(newState);
    options?.onStateChange?.(newState);
  };

  const cleanup = () => {
    adhesive.current?.cleanup();
    adhesive.current = null;
    setAdhesiveState(null);
  };

  const memoizedOptions = useMemo(
    () => options,
    [
      options?.boundingRef,
      options?.boundingEl,
      options?.enabled,
      options?.offset,
      options?.position,
      options?.zIndex,
      options?.outerClassName,
      options?.innerClassName,
      options?.initialClassName,
      options?.fixedClassName,
      options?.relativeClassName,
      options?.onStateChange,
    ],
  );

  const getValidatedOptions = () => {
    const optionsValue = memoizedOptions;

    const targetEl = unwrapElement(target);
    const boundingEl =
      unwrapElement(optionsValue?.boundingRef) ?? optionsValue?.boundingEl;

    if (!targetEl) {
      throw new Error("@adhesivejs/react: target element is not defined");
    }

    return {
      ...optionsValue,
      targetEl,
      boundingEl,
      onStateChange,
    } satisfies AdhesiveOptions;
  };

  useEffect(() => {
    if (!unwrapElement(target)) return cleanup();

    adhesive.current ??= Adhesive.create(getValidatedOptions());

    adhesive.current.getState();

    return cleanup;
  }, [unwrapElement(target)]);

  useEffect(() => {
    if (!unwrapElement(target)) return;

    adhesive.current?.replaceOptions(getValidatedOptions());
  }, [memoizedOptions]);

  return { state: adhesiveState } as const;
}
