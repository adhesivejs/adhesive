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

/**
 * Props interface for the AdhesiveContainer component.
 *
 * Combines sticky positioning options with Vue component flexibility.
 * Uses Vue-specific naming conventions (e.g., outerClass instead of outerClassName).
 */
export interface AdhesiveContainerProps extends BaseProps {
  /** CSS class for the outer wrapper element */
  outerClass?: UseAdhesiveOptions["outerClassName"];
  /** CSS class for the inner wrapper element */
  innerClass?: UseAdhesiveOptions["innerClassName"];
  /** CSS class applied when the element is in active (sticky) state */
  activeClass?: UseAdhesiveOptions["activeClassName"];
  /** CSS class applied when the element is in released (relative) state */
  releasedClass?: UseAdhesiveOptions["releasedClassName"];
}

/**
 * Vue component that automatically applies sticky positioning to its content.
 *
 * Provides a declarative way to create sticky elements in Vue applications.
 * Internally uses the useAdhesive composable to manage the sticky behavior.
 *
 * @example
 * ```vue
 * <template>
 *   <AdhesiveContainer position="top" :offset="20">
 *     <h1>Sticky Header</h1>
 *   </AdhesiveContainer>
 * </template>
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <AdhesiveContainer
 *     position="bottom"
 *     :offset="10"
 *     :z-index="1000"
 *     outer-class="my-sticky-outer"
 *     active-class="is-stuck"
 *   >
 *     <nav>Sticky Navigation</nav>
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
