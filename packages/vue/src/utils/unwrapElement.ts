import {
  toValue,
  type ComponentPublicInstance,
  type ComputedRef,
  type TemplateRef,
} from "vue";

export type VueInstance = ComponentPublicInstance;

export type VueInstanceOrElement = VueInstance | HTMLElement;

export type TemplateOrComputedRef<T> = TemplateRef<T> | ComputedRef<T>;

type MaybeVueInstanceOrElementRef =
  | TemplateOrComputedRef<VueInstanceOrElement | null | undefined>
  | VueInstanceOrElement
  | null
  | undefined;

export function unwrapElement(
  value: MaybeVueInstanceOrElementRef,
): HTMLElement | null {
  const _value = toValue(value);
  if (isVueInstance(_value)) return _value.$el;
  return _value ?? null;
}

function isVueInstance(value: unknown): value is VueInstance {
  return (
    !!value &&
    typeof value === "object" &&
    "$el" in value &&
    typeof (value as VueInstance).$el === "object"
  );
}
