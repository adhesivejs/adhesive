import {
  toValue,
  type ComponentPublicInstance,
  type MaybeRefOrGetter,
  type TemplateRef,
} from "vue";

export type VueInstance = ComponentPublicInstance;

export type VueInstanceOrElement = VueInstance | HTMLElement;

export type MaybeTemplateRef<T> = TemplateRef<T> | T | null;

export type MaybeVueInstanceOrElementOrSelector =
  | VueInstanceOrElement
  | string
  | null
  | undefined;

type UnwrapElementReturn = HTMLElement | string | null | undefined;

export function unwrapElement(
  instanceOrElOrSelectorRef: MaybeRefOrGetter<MaybeVueInstanceOrElementOrSelector>,
): UnwrapElementReturn {
  const value = toValue(instanceOrElOrSelectorRef);
  if (isVueInstance(value)) return value.$el;
  return value;
}

function isVueInstance(value: unknown): value is VueInstance {
  return (
    !!value &&
    typeof value === "object" &&
    "$el" in value &&
    typeof (value as VueInstance).$el === "object"
  );
}
