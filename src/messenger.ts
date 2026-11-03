import {
  ChildToParentMessage,
  ParentToChildMessage,
  SuggixConfig,
  SuggixUser,
  WidgetTab,
} from './types';

export class Messenger {
  private iframe: HTMLIFrameElement;
  private config: SuggixConfig;
  private messageListener: (event: MessageEvent) => void;
  private onMessageCallback: (msg: ChildToParentMessage) => void;

  constructor(
    iframe: HTMLIFrameElement,
    config: SuggixConfig,
    onMessage: (msg: ChildToParentMessage) => void
  ) {
    this.iframe = iframe;
    this.config = config;
    this.onMessageCallback = onMessage;

    this.messageListener = (event: MessageEvent) => {
      // Validate that message is an object with a suggix type prefix
      const data = event.data;
      if (!data || typeof data !== 'object' || typeof data.type !== 'string') {
        return;
      }

      if (data.type.startsWith('suggix:')) {
        this.onMessageCallback(data as ChildToParentMessage);
      }
    };

    window.addEventListener('message', this.messageListener);
  }

  public postMessage(message: ParentToChildMessage): void {
    if (this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage(message, '*');
    }
  }

  public sendOpen(tab?: WidgetTab): void {
    this.postMessage({ type: 'suggix:open', tab });
  }

  public sendClose(): void {
    this.postMessage({ type: 'suggix:close' });
  }

  public sendSwitchTab(tab: WidgetTab): void {
    this.postMessage({ type: 'suggix:switch_tab', tab });
  }

  public sendIdentify(user: SuggixUser): void {
    this.postMessage({ type: 'suggix:identify', user });
  }

  public destroy(): void {
    window.removeEventListener('message', this.messageListener);
  }
}
