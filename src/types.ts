export type WidgetTab = 'feedback' | 'create' | 'changelog';
export type WidgetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type WidgetTheme = 'light' | 'dark' | 'auto';

export interface SuggixUser {
  id?: string | number;
  name?: string;
  email?: string;
  avatar?: string;
  ssoToken?: string;
  [key: string]: any;
}

export interface SuggixConfig {
  /**
   * Your Suggix workspace domain or slug (e.g. "my-project").
   * Resolves by default to https://${workspace}.suggix.com/widget
   */
  workspace: string;

  /**
   * Custom widget base URL (useful for local development or custom domains).
   * E.g. "http://your-projects.suggix.localhost:4000/widget"
   */
  baseUrl?: string;

  /**
   * Position of the launcher button and popup modal.
   * @default 'bottom-right'
   */
  position?: WidgetPosition;

  /**
   * Pixel offset from screen edge.
   * @default { x: 20, y: 20 }
   */
  offset?: {
    x?: number;
    y?: number;
  };

  /**
   * Z-index of the widget container.
   * @default 999999
   */
  zIndex?: number;

  /**
   * Theme mode: 'light', 'dark', or 'auto' (system preference).
   * @default 'auto'
   */
  theme?: WidgetTheme;

  /**
   * Default active tab when the widget opens: 'feedback' | 'create' | 'changelog'.
   * @default 'feedback'
   */
  defaultTab?: WidgetTab;

  /**
   * If true, the floating launcher button will not be shown.
   * You can open the widget programmatically or via a `trigger` selector.
   * @default false
   */
  hideLauncher?: boolean;

  /**
   * Automatically hide the floating launcher button when scrolling down,
   * and show it again when scrolling up.
   * @default false
   */
  autoHideOnScroll?: boolean;

  /**
   * CSS selector for custom elements that should open the widget when clicked.
   * E.g. "#feedback-btn" or "[data-suggix-trigger]"
   */
  trigger?: string;

  /**
   * Current user identity for SSO authentication or auto-fill.
   */
  user?: SuggixUser;

  /**
   * Callback fired when the widget modal opens.
   */
  onOpen?: () => void;

  /**
   * Callback fired when the widget modal closes.
   */
  onClose?: () => void;

  /**
   * Callback fired when the iframe has loaded and is ready.
   */
  onReady?: () => void;

  /**
   * Callback fired when unread changelog count changes.
   */
  onUnreadChange?: (count: number) => void;
}

export type ChildToParentMessage =
  | { type: 'suggix:close' }
  | { type: 'suggix:ready'; brandColor?: string; workspaceName?: string }
  | { type: 'suggix:theme'; brandColor?: string }
  | { type: 'suggix:unread'; count: number }
  | { type: 'suggix:resize'; height?: number; width?: number };

export type ParentToChildMessage =
  | { type: 'suggix:open'; tab?: WidgetTab }
  | { type: 'suggix:close' }
  | { type: 'suggix:switch_tab'; tab: WidgetTab }
  | { type: 'suggix:identify'; user: SuggixUser };

declare global {
  interface Window {
    Suggix?: any;
  }
}
