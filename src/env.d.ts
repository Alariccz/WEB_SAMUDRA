// Official-style React + JSX ambient declarations
export = React;
export as namespace React;

declare namespace React {
  type ReactNode = any;
  type ReactElement<P = any, T = any> = any;
  type ElementType<P = any> = any;
  type ComponentType<P = any> = any;
  type FC<P = any> = (props: P & { children?: any }) => any;
  type Key = string | number;
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);

  interface RefObject<T = any> {
    current: T | null;
  }
  interface MutableRefObject<T = any> {
    current: T;
  }
  type ForwardedRef<T = any> = ((instance: T | null) => void) | MutableRefObject<T | null> | null;
  type Ref<T = any> = ForwardedRef<T>;
  type CSSProperties = Record<string, any>;

  interface Context<T> {
    Provider: (props: { value: T; children?: any }) => any;
    Consumer: any;
    displayName?: string;
  }

  interface SyntheticEvent<T = any, E = Event> {
    currentTarget: EventTarget & any;
    target: EventTarget & any;
    preventDefault(): void;
    stopPropagation(): void;
    nativeEvent: E;
  }
  interface MouseEvent<T = any> extends SyntheticEvent<T, globalThis.MouseEvent> {
    clientX: number;
    clientY: number;
    button: number;
  }
  interface TouchEvent<T = any> extends SyntheticEvent<T, globalThis.TouchEvent> {
    touches: TouchList;
    changedTouches: TouchList;
  }
  interface KeyboardEvent<T = any> extends SyntheticEvent<T, globalThis.KeyboardEvent> {
    key: string;
    code: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
  }
  interface FocusEvent<T = any> extends SyntheticEvent<T, globalThis.FocusEvent> {}
  interface ChangeEvent<T = any> extends SyntheticEvent<T> {
    target: EventTarget & any;
  }
  interface FormEvent<T = any> extends SyntheticEvent<T> {}
  interface PointerEvent<T = any> extends MouseEvent<T> {
    pointerId: number;
    pointerType: string;
  }

  interface HTMLAttributes<T = any> {
    children?: any;
    className?: string;
    id?: string;
    style?: CSSProperties;
    title?: string;
    role?: string;
    tabIndex?: number;
    hidden?: boolean;
    dir?: string;
    lang?: string;
    slot?: string;
    ref?: any;
    key?: any;
    onClick?: (e: MouseEvent<any>) => void;
    onDoubleClick?: (e: MouseEvent<any>) => void;
    onMouseEnter?: (e: MouseEvent<any>) => void;
    onMouseLeave?: (e: MouseEvent<any>) => void;
    onMouseDown?: (e: MouseEvent<any>) => void;
    onMouseUp?: (e: MouseEvent<any>) => void;
    onMouseMove?: (e: MouseEvent<any>) => void;
    onPointerDown?: (e: PointerEvent<any>) => void;
    onPointerMove?: (e: PointerEvent<any>) => void;
    onPointerUp?: (e: PointerEvent<any>) => void;
    onPointerCancel?: (e: PointerEvent<any>) => void;
    onTouchStart?: (e: TouchEvent<any>) => void;
    onTouchMove?: (e: TouchEvent<any>) => void;
    onTouchEnd?: (e: TouchEvent<any>) => void;
    onKeyDown?: (e: KeyboardEvent<any>) => void;
    onKeyUp?: (e: KeyboardEvent<any>) => void;
    onFocus?: (e: FocusEvent<any>) => void;
    onBlur?: (e: FocusEvent<any>) => void;
    onChange?: (e: ChangeEvent<any>) => void;
    onInput?: (e: FormEvent<any>) => void;
    onSubmit?: (e: FormEvent<any>) => void;
    onLoad?: (e: SyntheticEvent<any>) => void;
    onError?: (e: SyntheticEvent<any>) => void;
    onLoadedData?: (e: SyntheticEvent<any>) => void;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    "aria-hidden"?: boolean | "true" | "false";
    "aria-expanded"?: boolean | "true" | "false";
    "aria-controls"?: string;
    "aria-selected"?: boolean | "true" | "false";
    "aria-roledescription"?: string;
    "aria-modal"?: boolean | "true" | "false";
    "aria-current"?: any;
    "aria-pressed"?: any;
    "data-size"?: any;
    "data-kind"?: any;
    "data-layer"?: any;
    "data-part"?: any;
    "data-icon"?: any;
    "data-slot"?: any;
    "data-state"?: any;
    "data-sidebar"?: any;
    "data-active"?: any;
    "data-collapsible"?: any;
    "data-variant"?: any;
    "data-side"?: any;
    "data-mobile"?: any;
  }

  interface ButtonHTMLAttributes<T = any> extends HTMLAttributes<T> {
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    name?: string;
    value?: any;
  }
  interface InputHTMLAttributes<T = any> extends HTMLAttributes<T> {
    type?: string;
    value?: any;
    defaultValue?: any;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    checked?: boolean;
    name?: string;
    min?: number | string;
    max?: number | string;
    step?: number | string;
    autoComplete?: string;
  }
  interface LabelHTMLAttributes<T = any> extends HTMLAttributes<T> {
    htmlFor?: string;
  }
  interface AnchorHTMLAttributes<T = any> extends HTMLAttributes<T> {
    href?: string;
    target?: string;
    rel?: string;
    download?: any;
  }
  interface ImgHTMLAttributes<T = any> extends HTMLAttributes<T> {
    src?: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    loading?: "eager" | "lazy";
    decoding?: "async" | "auto" | "sync";
  }
  interface OlHTMLAttributes<T = any> extends HTMLAttributes<T> {
    reversed?: boolean;
    start?: number;
    type?: "1" | "a" | "A" | "i" | "I";
  }
  interface LiHTMLAttributes<T = any> extends HTMLAttributes<T> {
    value?: any;
  }
  interface SVGAttributes<T = any> extends HTMLAttributes<T> {
    viewBox?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeLinecap?: "butt" | "round" | "square" | "inherit";
    strokeLinejoin?: "miter" | "round" | "bevel" | "inherit";
    shapeRendering?: string;
    d?: string;
    cx?: number | string;
    cy?: number | string;
    r?: number | string;
    rx?: number | string;
    ry?: number | string;
    x?: number | string;
    y?: number | string;
    x1?: number | string;
    y1?: number | string;
    x2?: number | string;
    y2?: number | string;
    width?: number | string;
    height?: number | string;
    size?: number | string;
    color?: string;
    points?: string;
    transform?: string;
    xmlns?: string;
  }
  type SVGProps<T = any> = SVGAttributes<T>;
  type ComponentProps<T = any> = Record<string, any>;
  type ComponentPropsWithoutRef<T = any> = Record<string, any>;
  type ElementRef<T = any> = any;
  type ForwardRefExoticComponent<P = any> = ((props: P & { ref?: any; children?: any }) => any) & {
    displayName?: string;
  };

  function useState<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>];
  function useState<T = undefined>(): [T | undefined, Dispatch<SetStateAction<T | undefined>>];
  function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  function useLayoutEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  function useRef<T>(initialValue: T): MutableRefObject<T>;
  function useRef<T>(initialValue: T | null): MutableRefObject<T | null>;
  function useRef<T = undefined>(): MutableRefObject<T | undefined>;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  function useId(): string;
  function createContext<T>(defaultValue: T): Context<T>;
  function useContext<T>(context: Context<T>): T;
  function forwardRef<T = any, P = any>(
    render: (props: P & { children?: any }, ref: ForwardedRef<T>) => any
  ): ForwardRefExoticComponent<P & { ref?: Ref<T>; children?: any }>;
  function memo<P = any>(
    Component: (props: P) => any
  ): ((props: P & { children?: any }) => any) & { displayName?: string };
  const Fragment: (props: { children?: any }) => any;
  function createElement(type: any, props?: any, ...children: any[]): any;
  function cloneElement(element: any, props?: any, ...children: any[]): any;
  function isValidElement(object: any): boolean;

  namespace JSX {
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
}
