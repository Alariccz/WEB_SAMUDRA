// Global ambient declarations (no top-level export so all declarations remain global)
declare namespace JSX {
  type Element = any;
  type ElementType = any;
  interface ElementClass {
    render: any;
  }
  interface ElementAttributesProperty {
    props: {};
  }
  interface ElementChildrenAttribute {
    children: {};
  }
  interface IntrinsicAttributes {
    key?: any;
    ref?: any;
    children?: any;
  }
  interface IntrinsicClassAttributes<T> {
    key?: any;
    ref?: any;
    children?: any;
  }
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare namespace NodeJS {
  type Timeout = ReturnType<typeof setTimeout>;
}

declare module "motion/react" {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module "@radix-ui/*" {
  const content: any;
  export default content;
  export const Root: any;
  export const Trigger: any;
  export const Content: any;
  export const Portal: any;
  export const Overlay: any;
  export const Close: any;
  export const Title: any;
  export const Description: any;
  export const Provider: any;
  export const Slot: any;
}

declare module "class-variance-authority" {
  export type VariantProps<T extends (...args: any) => any> = Record<string, any>;
  export function cva(base?: any, config?: any): (...args: any[]) => string;
}

declare module "@/components/hooks/use-mobile" {
  export function useIsMobile(): boolean;
}
