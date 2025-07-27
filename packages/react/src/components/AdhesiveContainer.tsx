import { useMemo, useRef, type ComponentProps } from "react";
import { useAdhesive, type UseAdhesiveOptions } from "../hooks/useAdhesive.js";

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
  boundingRef,
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
  const targetRef = useRef<HTMLDivElement>(null);

  const options = useMemo<UseAdhesiveOptions>(
    () => ({
      boundingRef,
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
      boundingRef,
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

  useAdhesive(targetRef, options);

  return (
    <div ref={targetRef} {...rest}>
      {children}
    </div>
  );
}
