import { useRef, type ComponentProps } from "react";
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
  enabled = true,
  offset,
  position,
  zIndex,
  className,
  activeClassName,
  releasedClassName,
  children,
  ...rest
}: AdhesiveContainerProps) {
  const targetEl = useRef<HTMLDivElement>(null);

  useAdhesive(
    { target: targetEl },
    {
      enabled,
      offset,
      position,
      zIndex,
      className,
      activeClassName,
      releasedClassName,
    },
  );

  return (
    <div ref={targetEl} {...rest}>
      {children}
    </div>
  );
}
