import { SuggixConfig, SuggixUser, WidgetTab } from './types';
import { WidgetContainer } from './dom/container';

class SuggixClient {
  private container: WidgetContainer | null = null;
  private config: SuggixConfig | null = null;

  /**
   * Initialize the Suggix widget with configuration options.
   */
  public init(config: SuggixConfig): void {
    if (!config || !config.workspace) {
      console.error('[Suggix] Missing required config property: "workspace"');
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    // Destroy existing instance if any
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }

    this.config = { ...config };

    this.container = new WidgetContainer(this.config, {
      onOpen: () => this.config?.onOpen?.(),
      onClose: () => this.config?.onClose?.(),
      onReady: () => this.config?.onReady?.(),
      onUnreadChange: (count) => this.config?.onUnreadChange?.(count),
    });
  }

  /**
   * Open the feedback widget modal.
   * @param tab Optional tab to switch to ('feedback' | 'create' | 'changelog')
   */
  public open(tab?: WidgetTab): void {
    if (!this.container) {
      console.warn('[Suggix] Suggix.init() must be called before opening the widget.');
      return;
    }
    this.container.open(tab);
  }

  /**
   * Close the feedback widget modal.
   */
  public close(): void {
    this.container?.close();
  }

  /**
   * Toggle the widget between open and closed states.
   */
  public toggle(): void {
    this.container?.toggle();
  }

  /**
   * Check if the widget is currently open.
   */
  public isOpen(): boolean {
    return this.container ? this.container.isOpen() : false;
  }

  /**
   * Identify current logged in user (for SSO login and user association).
   */
  public identify(user: SuggixUser): void {
    if (!this.container) {
      if (this.config) {
        this.config.user = user;
      }
      return;
    }
    this.container.getMessenger().sendIdentify(user);
  }

  /**
   * Log out the current user session in the widget.
   */
  public logout(): void {
    this.identify({});
  }

  /**
   * Switch active tab inside the widget.
   */
  public switchTab(tab: WidgetTab): void {
    if (this.container) {
      this.container.getMessenger().sendSwitchTab(tab);
    }
  }

  /**
   * Hide the floating launcher button.
   */
  public hideLauncher(): void {
    this.container?.hideLauncher();
  }

  /**
   * Show the floating launcher button.
   */
  public showLauncher(): void {
    this.container?.showLauncher();
  }

  /**
   * Set the floating launcher button visibility.
   */
  public setLauncherVisible(visible: boolean): void {
    this.container?.setLauncherVisible(visible);
  }

  /**
   * Cleanly destroy and remove the widget from DOM.
   */
  public destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
      this.config = null;
    }
  }
}

export const Suggix = new SuggixClient();
