import {
  computed,
  defineComponent,
  h,
  useTemplateRef,
  type ComponentObjectPropsOptions,
  type DefineComponent,
  type PropType,
} from "vue";
import {
  useAdhesive,
  type UseAdhesiveOptions,
} from "../composables/useAdhesive.js";

type BaseProps = Omit<
  Partial<UseAdhesiveOptions>,
  | "outerClassName"
  | "innerClassName"
  | "initialClassName"
  | "fixedClassName"
  | "relativeClassName"
>;

/**
 * Props interface for the AdhesiveContainer component.
 *
 * Combines sticky positioning options with Vue component flexibility.
 * Uses Vue-specific naming conventions (e.g., outerClass instead of outerClassName).
 */
export interface AdhesiveContainerProps extends BaseProps {
  /** CSS class for the outer wrapper element. */
  outerClass?: UseAdhesiveOptions["outerClassName"];
  /** CSS class for the inner wrapper element. */
  innerClass?: UseAdhesiveOptions["innerClassName"];
  /** CSS class applied when the element is in its initial state. */
  initialClass?: UseAdhesiveOptions["initialClassName"];
  /** CSS class applied when the element is sticky. */
  fixedClass?: UseAdhesiveOptions["fixedClassName"];
  /** CSS class applied when the element reaches its boundary. */
  relativeClass?: UseAdhesiveOptions["relativeClassName"];
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
      boundingEl: {
        type: [Object, String] as PropType<
          AdhesiveContainerProps["boundingEl"]
        >,
        required: false,
      },
      enabled: {
        type: Boolean as PropType<AdhesiveContainerProps["enabled"]>,
        default: true,
      },
      offset: {
        type: Number as PropType<AdhesiveContainerProps["offset"]>,
        required: false,
      },
      position: {
        type: String as PropType<AdhesiveContainerProps["position"]>,
        required: false,
      },
      zIndex: {
        type: Number as PropType<AdhesiveContainerProps["zIndex"]>,
        required: false,
      },
      outerClass: {
        type: String as PropType<AdhesiveContainerProps["outerClass"]>,
        required: false,
      },
      innerClass: {
        type: String as PropType<AdhesiveContainerProps["innerClass"]>,
        required: false,
      },
      initialClass: {
        type: String as PropType<AdhesiveContainerProps["initialClass"]>,
        required: false,
      },
      fixedClass: {
        type: String as PropType<AdhesiveContainerProps["fixedClass"]>,
        required: false,
      },
      relativeClass: {
        type: String as PropType<AdhesiveContainerProps["relativeClass"]>,
        required: false,
      },
    } satisfies Required<ComponentObjectPropsOptions<AdhesiveContainerProps>>,
    setup(props, { slots }) {
      const targetRef = useTemplateRef<HTMLElement>("target");

      const options = computed<UseAdhesiveOptions>(() => ({
        boundingEl: props.boundingEl,
        enabled: props.enabled,
        offset: props.offset,
        position: props.position,
        zIndex: props.zIndex,
        outerClassName: props.outerClass,
        innerClassName: props.innerClass,
        initialClassName: props.initialClass,
        fixedClassName: props.fixedClass,
        relativeClassName: props.relativeClass,
      }));

      useAdhesive(targetRef, options);

      return () => h("div", { ref: "target" }, slots.default?.());
    },
  });
