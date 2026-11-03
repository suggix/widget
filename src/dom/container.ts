import { SuggixConfig, WidgetTab } from '../types';
import { getWidgetStyles } from './styles';
import { Launcher } from './launcher';
import { Messenger } from '../messenger';

export class WidgetContainer {
  private config: SuggixConfig;
  private hostElement: HTMLElement;
  private shadowRoot: ShadowRoot;
  private rootDiv: HTMLDivElement;
  private modalDiv: HTMLDivElement;
  private backdropDiv: HTMLDivElement;
  private iframe: HTMLIFrameElement;
  private launcher: Launcher | null = null;
  private messenger: Messenger;
  private isModalOpen = false;
  private keydownListener: (e: KeyboardEvent) => void;
  private triggerElements: Element[] = [];

  constructor(
    config: SuggixConfig,
    callbacks: {
      onOpen?: () => void;
      onClose?: () => void;
      onReady?: () => void;
      onUnreadChange?: (count: number) => void;
    }
  ) {
    this.config = config;

    // 1. Create root host element
    const existing = document.getElementById('suggix-widget-root');
    if (existing) {
      existing.remove();
    }

    this.hostElement = document.createElement('div');
    this.hostElement.id = 'suggix-widget-root';
    document.body.appendChild(this.hostElement);

    // 2. Attach open Shadow DOM
    this.shadowRoot = this.hostElement.attachShadow({ mode: 'open' });

    // 3. Inject scoped styles
    const styleTag = document.createElement('style');
    styleTag.textContent = getWidgetStyles(config);
    this.shadowRoot.appendChild(styleTag);

    // 4. Create root wrapper
    const pos = config.position || 'bottom-right';
    this.rootDiv = document.createElement('div');
    this.rootDiv.className = `suggix-root pos-${pos}`;
    this.shadowRoot.appendChild(this.rootDiv);

    // 5. Create mobile backdrop
    this.backdropDiv = document.createElement('div');
    this.backdropDiv.className = 'suggix-backdrop';
    this.backdropDiv.addEventListener('click', () => this.close());
    this.rootDiv.appendChild(this.backdropDiv);

    // 6. Create modal container
    this.modalDiv = document.createElement('div');
    this.modalDiv.className = 'suggix-modal';
    this.rootDiv.appendChild(this.modalDiv);

    // 7. Create iframe
    this.iframe = document.createElement('iframe');
    this.iframe.className = 'suggix-iframe';
    this.iframe.setAttribute('title', 'Suggix Feedback Widget');
    this.iframe.setAttribute('allow', 'clipboard-write');
    this.iframe.src = this.buildWidgetUrl();
    this.modalDiv.appendChild(this.iframe);

    // 8. Create Launcher (unless hideLauncher is true)
    if (!config.hideLauncher) {
      this.launcher = new Launcher(config, () => this.toggle());
      this.rootDiv.appendChild(this.launcher.element);
    }

    // 9. Messenger for postMessage communication
    this.messenger = new Messenger(this.iframe, config, (msg) => {
      switch (msg.type) {
        case 'suggix:close':
          this.close();
          break;
        case 'suggix:ready':
          callbacks.onReady?.();
          break;
        case 'suggix:unread':
          this.launcher?.setUnreadCount(msg.count);
          callbacks.onUnreadChange?.(msg.count);
          break;
      }
    });

    // 10. Bind ESC key to close
    this.keydownListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        this.close();
      }
    };
    window.addEventListener('keydown', this.keydownListener);

    // 11. Bind custom trigger elements if specified
    if (config.trigger) {
      this.bindTriggers(config.trigger);
    }
  }

  private buildWidgetUrl(): string {
    const base = this.config.baseUrl
      ? this.config.baseUrl.replace(/\/$/, '')
      : `https://${this.config.workspace}.suggix.com/widget`;

    const url = new URL(base, window.location.href);
    url.searchParams.set('utm_source', 'widget');

    if (this.config.theme) {
      url.searchParams.set('theme', this.config.theme);
    }
    if (this.config.defaultTab) {
      url.searchParams.set('tab', this.config.defaultTab);
    }
    if (this.config.user?.ssoToken) {
      url.searchParams.set('ssoToken', this.config.user.ssoToken);
    }

    return url.toString();
  }

  private bindTriggers(selector: string): void {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const handler = (e: Event) => {
          e.preventDefault();
          this.toggle();
        };
        el.addEventListener('click', handler);
        this.triggerElements.push(el);
      });
    } catch (err) {
      console.warn('[Suggix] Failed to bind trigger selector:', selector, err);
    }
  }

  public open(tab?: WidgetTab): void {
    if (this.isModalOpen) {
      if (tab) {
        this.messenger.sendSwitchTab(tab);
      }
      return;
    }

    this.isModalOpen = true;
    this.rootDiv.classList.add('suggix-open');
    this.messenger.sendOpen(tab);
    this.config.onOpen?.();
  }

  public close(): void {
    if (!this.isModalOpen) return;

    this.isModalOpen = false;
    this.rootDiv.classList.remove('suggix-open');
    this.messenger.sendClose();
    this.config.onClose?.();
  }

  public toggle(): void {
    if (this.isModalOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public isOpen(): boolean {
    return this.isModalOpen;
  }

  public getMessenger(): Messenger {
    return this.messenger;
  }

  public setUnreadCount(count: number): void {
    this.launcher?.setUnreadCount(count);
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.keydownListener);
    this.messenger.destroy();
    this.launcher?.destroy();
    this.hostElement.remove();
  }
}
