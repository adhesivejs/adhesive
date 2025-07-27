import {
  computed,
  defineComponent,
  h,
  useTemplateRef,
  type DefineComponent,
  type PropType,
} from "vue";
import {
  useAdhesive,
  type UseAdhesiveOptions,
} from "../composables/useAdhesive.js";
import type { MaybeElementOrSelectorRef } from "../utils/unrefElement.js";

type BaseProps = Omit<
  Partial<UseAdhesiveOptions>,
  "outerClassName" | "innerClassName" | "activeClassName" | "releasedClassName"
>;

export interface AdhesiveContainerProps extends BaseProps {
  outerClass?: UseAdhesiveOptions["outerClassName"];
  innerClass?: UseAdhesiveOptions["innerClassName"];
  activeClass?: UseAdhesiveOptions["activeClassName"];
  releasedClass?: UseAdhesiveOptions["releasedClassName"];
}

/**
 * Automatically applies sticky positioning to its content.
 * Internally uses the `useAdhesive` composable.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { AdhesiveContainer } from '@adhesivejs/vue';
 * </script>
 *
 * <template>
 *   <AdhesiveContainer position="top">
 *     Content to make sticky
 *   </AdhesiveContainer>
 * </template>
 * ```
 */
export const AdhesiveContainer: DefineComponent<AdhesiveContainerProps> =
  defineComponent({
    name: "AdhesiveContainer",
    props: {
      boundingRef: {
        type: [Object, String] as PropType<MaybeElementOrSelectorRef>,
        required: false,
      },
      boundingEl: {
        type: [Object, String] as PropType<UseAdhesiveOptions["boundingEl"]>,
        required: false,
      },
      enabled: {
        type: Boolean as PropType<boolean>,
        default: true,
      },
      offset: {
        type: Number as PropType<number>,
        required: false,
      },
      position: {
        type: String as PropType<UseAdhesiveOptions["position"]>,
        required: false,
      },
      zIndex: {
        type: Number as PropType<number>,
        required: false,
      },
      outerClass: {
        type: String as PropType<string>,
        required: false,
      },
      innerClass: {
        type: String as PropType<string>,
        required: false,
      },
      activeClass: {
        type: String as PropType<string>,
        required: false,
      },
      releasedClass: {
        type: String as PropType<string>,
        required: false,
      },
    },
    setup(props, { slots }) {
      const targetRef = useTemplateRef<HTMLElement>("target");

      const options = computed<UseAdhesiveOptions>(() => ({
        boundingRef: props.boundingRef,
        boundingEl: props.boundingEl,
        enabled: props.enabled,
        offset: props.offset,
        position: props.position,
        zIndex: props.zIndex,
        outerClassName: props.outerClass,
        innerClassName: props.innerClass,
        activeClassName: props.activeClass,
        releasedClassName: props.releasedClass,
      }));

      useAdhesive(targetRef, options);

      return () => h("div", { ref: "target" }, slots.default?.());
    },
  });
