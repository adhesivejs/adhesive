import {
  Adhesive,
  type AdhesiveOptions,
  type AdhesiveState,
} from "@adhesivejs/core";
import {
  onUnmounted,
  onWatcherCleanup,
  shallowRef,
  toRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from "vue";
import {
  unwrapElement,
  type TemplateOrComputedRef,
  type VueInstanceOrElement,
} from "../utils/unwrapElement.js";

/**
 * Configuration options for the useAdhesive composable.
 *
 * Extends the core AdhesiveOptions but omits targetEl since it's provided via the composable parameter.
 */
export type UseAdhesiveOptions = Partial<Omit<AdhesiveOptions, "targetEl">>;

/** Return type for the useAdhesive composable. */
export type UseAdhesiveReturn = {
  /** Current state of the Adhesive instance, or null if not initialized */
  state: Readonly<Ref<AdhesiveState | null>>;
};

/**
 * Vue composable for adding sticky positioning behavior to DOM elements.
 *
 * This composable automatically manages the lifecycle of a Adhesive instance,
 * handling initialization, updates, and cleanup. It integrates seamlessly
 * with Vue's reactivity system and component lifecycle.
 *
 * @param target - Vue template ref for the element that should become sticky
 * @param options - Reactive configuration options for sticky behavior
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useTemplateRef } from 'vue';
 * import { useAdhesive } from '@adhesivejs/vue';
 *
 * const targetRef = useTemplateRef('target');
 * const boundingRef = useTemplateRef('bounding');
 *
 * useAdhesive(
 *   targetRef,
 *   () => ({ boundingEl: boundingRef.value, position: 'top' })
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
 * const targetRef = useTemplateRef('target');
 * const enabled = ref(true);
 * const offset = ref(10);
 *
 * // Reactive options
 * useAdhesive(targetRef, () => ({
 *   position: 'top',
 *   enabled: enabled.value,
 *   offset: offset.value,
 * }));
 * </script>
 * ```
 */
export function useAdhesive(
  target: TemplateOrComputedRef<VueInstanceOrElement | null | undefined>,
  options?: MaybeRefOrGetter<UseAdhesiveOptions>,
): UseAdhesiveReturn {
  let adhesive: Adhesive | null = null;

  const adhesiveState = shallowRef<AdhesiveState | null>(null);

  const onStateChange = (newState: AdhesiveState) => {
    const optionsValue = toValue(options);

    adhesiveState.value = newState;
    optionsValue?.onStateChange?.(newState);
  };

  const cleanup = () => {
    adhesive?.cleanup();
    adhesive = null;
    adhesiveState.value = null;
  };

  const getValidatedOptions = () => {
    const optionsValue = toValue(options);

    const targetEl = unwrapElement(target);

    if (!targetEl) {
      throw new Error("@adhesivejs/vue: target element is not defined");
    }

    return {
      ...optionsValue,
      targetEl,
      onStateChange,
    } satisfies AdhesiveOptions;
  };

  watch(
    () => unwrapElement(target),
    (targetValue) => {
      if (!targetValue) return cleanup();

      adhesive ??= Adhesive.create(getValidatedOptions());

      onWatcherCleanup(cleanup);
    },
  );

  onUnmounted(cleanup);

  watch(
    () => toValue(options),
    () => adhesive?.replaceOptions(getValidatedOptions()),
  );

  return { state: toRef(() => adhesiveState.value) } as const;
}
