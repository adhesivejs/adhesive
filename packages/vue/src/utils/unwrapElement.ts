import {
  toValue,
  type ComponentPublicInstance,
  type MaybeRefOrGetter,
} from "vue";

export type VueInstance = ComponentPublicInstance;

export type VueInstanceOrElement = VueInstance | HTMLElement;

export type MaybeVueInstanceOrElementOrSelector =
  | VueInstanceOrElement
  | string
  | null
  | undefined;

type UnwrapElementReturn = HTMLElement | string | null | undefined;

export function unwrapElement(
  instanceOrElOrSelectorRef: MaybeRefOrGetter<MaybeVueInstanceOrElementOrSelector>,
): UnwrapElementReturn {
  const instanceOrElOrSelectorValue = toValue(instanceOrElOrSelectorRef);
  return (
    (instanceOrElOrSelectorValue as VueInstance)?.$el ??
    instanceOrElOrSelectorValue
  );
}
