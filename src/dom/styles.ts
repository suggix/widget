import { SuggixConfig } from '../types';

export function getWidgetStyles(config: SuggixConfig): string {
  const accent = config.accentColor || '#3b82f6';
  const zIndex = config.zIndex ?? 999999;
  const offsetX = config.offset?.x ?? 20;
  const offsetY = config.offset?.y ?? 20;

  return `
    :host {
      all: initial;
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      z-index: ${zIndex};
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .suggix-root {
      position: fixed;
      z-index: ${zIndex};
      pointer-events: none;
    }

    /* Position: bottom-right */
    .pos-bottom-right {
      bottom: ${offsetY}px;
      right: ${offsetX}px;
    }
    .pos-bottom-right .suggix-modal {
      bottom: 74px;
      right: 0;
      transform-origin: bottom right;
    }

    /* Position: bottom-left */
    .pos-bottom-left {
      bottom: ${offsetY}px;
      left: ${offsetX}px;
    }
    .pos-bottom-left .suggix-modal {
      bottom: 74px;
      left: 0;
      transform-origin: bottom left;
    }

    /* Position: top-right */
    .pos-top-right {
      top: ${offsetY}px;
      right: ${offsetX}px;
    }
    .pos-top-right .suggix-modal {
      top: 74px;
      right: 0;
      transform-origin: top right;
    }

    /* Position: top-left */
    .pos-top-left {
      top: ${offsetY}px;
      left: ${offsetX}px;
    }
    .pos-top-left .suggix-modal {
      top: 74px;
      left: 0;
      transform-origin: top left;
    }

    /* Floating Launcher Button */
    .suggix-launcher {
      position: relative;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: ${accent};
      color: #ffffff;
      border: none;
      outline: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08);
      pointer-events: auto;
      user-select: none;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, background-color 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }

    .suggix-launcher:hover {
      transform: scale(1.06);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24), 0 3px 8px rgba(0, 0, 0, 0.12);
    }

    .suggix-launcher:active {
      transform: scale(0.95);
    }

    .suggix-launcher-icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }

    .suggix-launcher-icon svg {
      width: 26px;
      height: 26px;
      fill: currentColor;
    }

    .suggix-icon-default {
      display: block;
    }
    .suggix-icon-close {
      display: none;
    }

    .suggix-open .suggix-icon-default {
      display: none;
    }
    .suggix-open .suggix-icon-close {
      display: block;
      transform: rotate(90deg);
      animation: suggix-spin 0.25s ease forwards;
    }

    @keyframes suggix-spin {
      from { transform: rotate(0deg); opacity: 0; }
      to { transform: rotate(90deg); opacity: 1; }
    }

    /* Unread Badge */
    .suggix-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background-color: #ef4444;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      line-height: 18px;
      text-align: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
      display: none;
      animation: suggix-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .suggix-badge.visible {
      display: block;
    }

    @keyframes suggix-pop {
      0% { transform: scale(0); }
      70% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }

    /* Iframe Modal Container */
    .suggix-modal {
      position: absolute;
      width: 400px;
      height: 680px;
      max-height: calc(100vh - 100px);
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 16px 48px -8px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.08);
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transform: translateY(16px) scale(0.96);
      transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                  visibility 0.22s;
    }

    .suggix-open .suggix-modal {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    /* Iframe Element */
    .suggix-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      background: transparent;
    }

    /* Mobile Backdrop */
    .suggix-backdrop {
      display: none;
    }

    /* Mobile Responsive Adaptation */
    @media (max-width: 480px) {
      .suggix-root {
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
      }

      .suggix-backdrop {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.45);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.25s ease, visibility 0.25s;
        pointer-events: none;
        display: block;
      }

      .suggix-open .suggix-backdrop {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      .suggix-modal {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100% !important;
        max-height: 100% !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        transform: translateY(100%) !important;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      .suggix-open .suggix-modal {
        transform: translateY(0) !important;
      }

      .suggix-open .suggix-launcher {
        display: none !important;
      }
    }
  `;
}
