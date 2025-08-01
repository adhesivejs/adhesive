import type { RefObject } from "react";

type MaybeRefObject =
  | RefObject<HTMLElement | null>
  | HTMLElement
  | null
  | undefined;

export function unwrapElement(value: MaybeRefObject): HTMLElement | null {
  if (isRefObject(value)) return value.current;
  return value ?? null;
}

function isRefObject(value: unknown): value is RefObject<HTMLElement | null> {
  return !!value && typeof value === "object" && "current" in value;
}
