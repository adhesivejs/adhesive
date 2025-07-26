import { Adhesive, type AdhesiveOptions } from "@adhesivejs/core";
import {
  onUnmounted,
  shallowRef,
  toValue,
  watchPostEffect,
  type MaybeRefOrGetter,
} from "vue";
import {
  unrefElement,
  type MaybeComputedElementRef,
} from "../utils/unrefElement.js";

/**
 * Template ref objects for Vue elements used by the Adhesive composable.
 */
export interface UseAdhesiveTemplateRefs {
  /** Vue template ref or element that should become sticky */
  target: MaybeComputedElementRef;
  /** Optional Vue template ref or element that defines sticky boundaries */
  bounding?: MaybeComputedElementRef;
}

/**
 * Configuration options for the `useAdhesive` composable.
 * Excludes `targetEl` and `boundingEl` since they're provided via template refs.
 */
export type UseAdhesiveOptions = Partial<Omit<AdhesiveOptions, "targetEl">>;

/**
 * Vue composable for adding sticky positioning behavior to DOM elements.
 *
 * This composable automatically manages the lifecycle of a Adhesive instance,
 * handling initialization, updates, and cleanup. It integrates seamlessly
 * with Vue's reactivity system and component lifecycle.
 *
 * @param templateRefs - Object containing Vue refs for target and optional bounding elements
 * @param options - Reactive configuration options for sticky behavior (excluding element references)
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useTemplateRef } from 'vue';
 * import { useAdhesive } from '@adhesivejs/vue';
 *
 * const targetEl = useTemplateRef('target');
 * const boundingEl = useTemplateRef('bounding');
 *
 * useAdhesive(
 *   { target: targetEl, bounding: boundingEl },
 *   { position: 'top' }
 * );
 * </script>
 *
 * <template>
 *   <div ref="bounding" style="height: 200vh">
 *     <div ref="target">Sticky content</div>
 *   </div>
 * </template>
 * ```
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { useAdhesive } from '@adhesivejs/vue';
 *
 * const targetEl = useTemplateRef('sticky');
 * const enabled = ref(true);
 * const offset = ref(10);
 *
 * // Reactive options
 * useAdhesive({ target: targetEl }, () => ({
 *   position: 'top'
 *   enabled: enabled.value,
 *   offset: offset.value,
 * }));
 * </script>
 * ```
 */
export function useAdhesive(
  templateRefs: UseAdhesiveTemplateRefs,
  options?: MaybeRefOrGetter<UseAdhesiveOptions>,
) {
  const adhesive = shallowRef<Adhesive>();

  watchPostEffect(() => {
    const optionsValue = toValue(options);

    const _targetEl = unrefElement(templateRefs.target);
    const _boundingEl =
      unrefElement(templateRefs.bounding) ?? optionsValue?.boundingEl;

    if (!_targetEl) {
      throw new Error("@adhesivejs/vue: sticky element is not defined");
    }

    const _options = {
      ...optionsValue,
      targetEl: _targetEl,
      boundingEl: _boundingEl,
    } satisfies AdhesiveOptions;

    if (adhesive.value) {
      adhesive.value.updateOptions(_options);
      return;
    }

    adhesive.value ??= Adhesive.create(_options);
  });

  onUnmounted(() => {
    adhesive.value?.cleanup();
    adhesive.value = undefined;
  });
}
