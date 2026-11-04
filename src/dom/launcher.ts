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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      </div>
    `;

    const closeIcon = `
      <div class="suggix-launcher-icon suggix-icon-close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    `;

    this.badge = document.createElement('span');
    this.badge.className = 'suggix-badge';
    this.badge.textContent = '';

    this.element.innerHTML = `${defaultIcon}${closeIcon}`;
    this.element.appendChild(this.badge);

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
