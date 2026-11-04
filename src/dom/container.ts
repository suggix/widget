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
  private scrollListener: ((e: Event) => void) | null = null;
  private popstateListener: (() => void) | null = null;
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
    const noLauncherClass = config.hideLauncher ? 'suggix-no-launcher' : '';
    this.rootDiv = document.createElement('div');
    this.rootDiv.className = `suggix-root pos-${pos} ${noLauncherClass}`.trim();
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

    // 6.1 Create skeleton placeholder
    const skeletonWrapper = document.createElement('div');
    skeletonWrapper.className = 'suggix-skeleton-wrapper';
    skeletonWrapper.innerHTML = `
      <div class="suggix-sk-header">
        <div class="suggix-sk-avatar suggix-sk-shimmer"></div>
        <div class="suggix-sk-title suggix-sk-shimmer"></div>
        <div class="suggix-sk-sub1 suggix-sk-shimmer"></div>
        <div class="suggix-sk-sub2 suggix-sk-shimmer"></div>
      </div>
      <div class="suggix-sk-toolbar">
        <div class="suggix-sk-search suggix-sk-shimmer"></div>
        <div class="suggix-sk-chips">
          <div class="suggix-sk-chip suggix-sk-shimmer"></div>
          <div class="suggix-sk-chip suggix-sk-shimmer"></div>
          <div class="suggix-sk-chip suggix-sk-shimmer"></div>
        </div>
      </div>
      <div class="suggix-sk-cards">
        <div class="suggix-sk-card">
          <div class="suggix-sk-vote suggix-sk-shimmer"></div>
          <div class="suggix-sk-lines">
            <div class="suggix-sk-line1 suggix-sk-shimmer"></div>
            <div class="suggix-sk-line2 suggix-sk-shimmer"></div>
          </div>
        </div>
        <div class="suggix-sk-card">
          <div class="suggix-sk-vote suggix-sk-shimmer"></div>
          <div class="suggix-sk-lines">
            <div class="suggix-sk-line1 suggix-sk-shimmer"></div>
            <div class="suggix-sk-line2 suggix-sk-shimmer"></div>
          </div>
        </div>
        <div class="suggix-sk-card">
          <div class="suggix-sk-vote suggix-sk-shimmer"></div>
          <div class="suggix-sk-lines">
            <div class="suggix-sk-line1 suggix-sk-shimmer"></div>
            <div class="suggix-sk-line2 suggix-sk-shimmer"></div>
          </div>
        </div>
      </div>
      <div class="suggix-sk-bottom">
        <div class="suggix-sk-nav-item suggix-sk-shimmer"></div>
        <div class="suggix-sk-nav-item suggix-sk-shimmer"></div>
        <div class="suggix-sk-nav-item suggix-sk-shimmer"></div>
      </div>
    `;
    this.modalDiv.appendChild(skeletonWrapper);

    // 7. Create iframe
    this.iframe = document.createElement('iframe');
    this.iframe.className = 'suggix-iframe';
    this.iframe.setAttribute('title', 'Suggix Feedback Widget');
    this.iframe.setAttribute('allow', 'clipboard-write');
    this.iframe.src = this.buildWidgetUrl();
    this.modalDiv.appendChild(this.iframe);

    const markLoaded = () => {
      this.modalDiv.classList.add('suggix-loaded');
    };
    this.iframe.addEventListener('load', markLoaded);

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
          markLoaded();
          if (msg.brandColor) {
            this.setAccentColor(msg.brandColor);
          }
          callbacks.onReady?.();
          break;
        case 'suggix:theme':
          if (msg.brandColor) {
            this.setAccentColor(msg.brandColor);
          }
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

    // 12. Auto-hide launcher on scroll if enabled
    if (config.autoHideOnScroll && !config.hideLauncher) {
      this.initScrollListener();
    }
  }

  private initScrollListener(): void {
    const lastScrollTops = new WeakMap<EventTarget, number>();
    let accumulatedDelta = 0;
    let lastTargetTop = 0;
    let ticking = false;

    this.scrollListener = (event: Event) => {
      // Never hide or change launcher visibility when modal is open
      if (this.isModalOpen) return;

      const target = event.target as HTMLElement | Document;
      if (!target) return;

      let currentTop = 0;
      if (target === document || target === window) {
        currentTop = window.scrollY || document.documentElement.scrollTop || 0;
      } else if ('scrollTop' in target) {
        currentTop = (target as HTMLElement).scrollTop;
      } else {
        return;
      }

      const prevTop = lastScrollTops.get(target) ?? currentTop;
      const delta = currentTop - prevTop;
      lastScrollTops.set(target, currentTop);

      accumulatedDelta += delta;
      lastTargetTop = currentTop;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (this.isModalOpen) {
            accumulatedDelta = 0;
            ticking = false;
            return;
          }

          // Near top: always restore launcher visibility
          if (lastTargetTop <= 30) {
            this.showLauncher();
          } else if (accumulatedDelta > 10 && lastTargetTop > 60) {
            // Scrolling down -> hide launcher
            this.hideLauncher();
          } else if (accumulatedDelta < -10) {
            // Scrolling up -> show launcher
            this.showLauncher();
          }

          accumulatedDelta = 0;
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use capture phase to catch scroll events from any nested scroll container
    window.addEventListener('scroll', this.scrollListener, { capture: true, passive: true });

    // Show launcher again when browser navigation / URL change occurs
    this.popstateListener = () => {
      this.showLauncher();
    };
    window.addEventListener('popstate', this.popstateListener);
  }

  public hideLauncher(): void {
    if (this.isModalOpen) return;
    this.launcher?.hide();
  }

  public showLauncher(): void {
    this.launcher?.show();
  }

  public setLauncherVisible(visible: boolean): void {
    if (visible) {
      this.showLauncher();
    } else {
      this.hideLauncher();
    }
  }

  public setAccentColor(color: string): void {
    if (!color) return;
    this.config.accentColor = color;
    this.launcher?.setAccentColor(color);
  }

  private buildWidgetUrl(): string {
    const base = this.config.baseUrl
      ? this.config.baseUrl.replace(/\/$/, '')
      : `https://${this.config.workspace}.suggix.com/widget`;

    const url = new URL(base, window.location.href);
    url.searchParams.set('utm_source', 'widget');
    url.searchParams.set('embed', 'true');

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
    this.showLauncher(); // Ensure launcher is visible so close button displays
    this.rootDiv.classList.add('suggix-open');
    this.messenger.sendOpen(tab);
    this.config.onOpen?.();
  }

  public close(): void {
    if (!this.isModalOpen) return;

    this.isModalOpen = false;
    this.rootDiv.classList.remove('suggix-open');
    this.showLauncher(); // Restore launcher on close
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
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener, { capture: true });
      this.scrollListener = null;
    }
    if (this.popstateListener) {
      window.removeEventListener('popstate', this.popstateListener);
      this.popstateListener = null;
    }
    window.removeEventListener('keydown', this.keydownListener);
    this.messenger.destroy();
    this.launcher?.destroy();
    this.hostElement.remove();
  }
}
