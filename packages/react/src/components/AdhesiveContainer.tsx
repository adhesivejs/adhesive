import { useMemo, useRef, type ComponentProps } from "react";
import {
  useAdhesive,
  type UseAdhesiveElements,
  type UseAdhesiveOptions,
} from "../hooks/useAdhesive.js";

export type AdhesiveContainerProps = Partial<UseAdhesiveOptions> &
  ComponentProps<"div">;

/**
 * Automatically applies sticky positioning to its content.
 * Internally uses the `useAdhesive` hook.
 *
 * @example
 * ```tsx
 * <AdhesiveContainer position="top">
 *   Content to make sticky
 * </AdhesiveContainer>
 * ```
 */
export function AdhesiveContainer({
  boundingEl,
  enabled = true,
  offset,
  position,
  zIndex,
  outerClassName,
  innerClassName,
  activeClassName,
  releasedClassName,
  children,
  ...rest
}: AdhesiveContainerProps) {
  const targetEl = useRef<HTMLDivElement>(null);

  const elements = useMemo<UseAdhesiveElements>(
    () => ({ target: targetEl }),
    [],
  );

  const options = useMemo<UseAdhesiveOptions>(
    () => ({
      boundingEl,
      enabled,
      offset,
      position,
      zIndex,
      outerClassName,
      innerClassName,
      activeClassName,
      releasedClassName,
    }),
    [
      boundingEl,
      enabled,
      offset,
      position,
      zIndex,
      outerClassName,
      innerClassName,
      activeClassName,
      releasedClassName,
    ],
  );

  useAdhesive(elements, options);

  return (
    <div ref={targetEl} {...rest}>
      {children}
    </div>
  );
}
