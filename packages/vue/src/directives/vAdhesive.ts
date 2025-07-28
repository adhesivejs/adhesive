import Adhesive, {
  type AdhesiveOptions,
  type AdhesivePosition,
} from "@adhesivejs/core";
import { unwrapElement, type VueInstance } from "../utils/unwrapElement.js";
import type { DirectiveBinding, ObjectDirective } from "vue";

type AdhesiveDirectiveElement =
  | (VueInstance & { __adhesive__?: Adhesive | null })
  | (HTMLElement & { __adhesive__?: Adhesive | null });

type AdhesiveDirectiveValue = Omit<AdhesiveOptions, "targetEl"> | undefined;

type AdhesiveDirectiveModifiers = string;

type AdhesiveDirectiveArg = AdhesivePosition;

/**
 * Type definition for the v-adhesive directive binding.
 */
export type AdhesiveDirectiveBinding = DirectiveBinding<
  AdhesiveDirectiveValue,
  AdhesiveDirectiveModifiers,
  AdhesiveDirectiveArg
>;

/**
 * Type definition for the v-adhesive directive.
 */
export type AdhesiveDirective = ObjectDirective<
  AdhesiveDirectiveElement,
  AdhesiveDirectiveValue,
  AdhesiveDirectiveModifiers,
  AdhesiveDirectiveArg
>;

/**
 * Vue directive for making elements sticky with advanced positioning options.
 *
 * @example
 * ```vue
 * <!-- Basic usage -->
 * <div v-adhesive>Content to make sticky</div>
 *
 * <!-- With position argument -->
 * <div v-adhesive:bottom>Stick to bottom</div>
 *
 * <!-- With options -->
 * <div v-adhesive="{ offset: 20, zIndex: 999 }">Sticky with offset</div>
 *
 * <!-- With position and options -->
 * <div v-adhesive:top="{ offset: 10 }">Stick to top with offset</div>
 * ```
 */
export const vAdhesive: AdhesiveDirective = {
  mounted(el, binding) {
    const targetEl = unwrapElement(el);

    if (!targetEl) {
      throw new Error("@adhesivejs/vue: target element is not defined");
    }

    const options = binding.value;
    const position = binding.arg || options?.position;

    el.__adhesive__ ??= Adhesive.create({ ...options, targetEl, position });
  },
  unmounted(el) {
    el.__adhesive__?.cleanup();
    delete el.__adhesive__;
  },
  updated(el, binding) {
    const options = binding.value;
    const position = binding.arg || options?.position;

    el.__adhesive__?.updateOptions({ ...options, position });
  },
};
