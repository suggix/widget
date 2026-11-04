import { SuggixConfig } from '../types';

export class Launcher {
  public element: HTMLButtonElement;
  public badge: HTMLSpanElement;
  private isHidden = false;
  private onClickHandler: () => void;

  constructor(config: SuggixConfig, onClick: () => void) {
    this.onClickHandler = onClick;

    this.element = document.createElement('button');
    this.element.className = 'suggix-launcher';
    this.element.setAttribute('type', 'button');
    this.element.setAttribute('aria-label', 'Open Suggix feedback widget');

    const defaultIcon = `
      <div class="suggix-launcher-icon suggix-icon-default">
        <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H6l-2 2V4h16z"/>
        </svg>
      </div>
    `;

    const closeIcon = `
      <div class="suggix-launcher-icon suggix-icon-close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    `;

    this.badge = document.createElement('span');
    this.badge.className = 'suggix-badge';
    this.badge.textContent = '';

    this.element.innerHTML = `${defaultIcon}${closeIcon}`;
    this.element.appendChild(this.badge);

    if (config.accentColor) {
      this.setAccentColor(config.accentColor);
    }

    this.element.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onClickHandler();
    });
  }

  public hide(): void {
    if (this.isHidden) return;
    this.isHidden = true;
    this.element.classList.add('suggix-launcher-hidden');
  }

  public show(): void {
    if (!this.isHidden) return;
    this.isHidden = false;
    this.element.classList.remove('suggix-launcher-hidden');
  }

  public setVisible(visible: boolean): void {
    if (visible) {
      this.show();
    } else {
      this.hide();
    }
  }

  public getIsHidden(): boolean {
    return this.isHidden;
  }

  public setAccentColor(color: string): void {
    if (!color) return;
    this.element.style.setProperty('--suggix-accent', color);
    this.element.style.setProperty('--suggix-shadow', `${color}60`);
    this.element.style.setProperty('--suggix-shadow-hover', `${color}75`);
  }

  public setUnreadCount(count: number): void {
    if (count > 0) {
      this.badge.textContent = count > 99 ? '99+' : count.toString();
      this.badge.classList.add('visible');
    } else {
      this.badge.textContent = '';
      this.badge.classList.remove('visible');
    }
  }

  public destroy(): void {
    this.element.remove();
  }
}
