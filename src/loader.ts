import { Suggix } from './Suggix';
import { SuggixConfig, WidgetPosition, WidgetTab, WidgetTheme } from './types';

// Dispatcher for command queue (e.g. Suggix('init', {...}), Suggix('open'))
function handleCommand(args: IArguments | any[]) {
  const method = args[0];
  const params = Array.prototype.slice.call(args, 1);

  switch (method) {
    case 'init':
      Suggix.init(params[0]);
      break;
    case 'open':
      Suggix.open(params[0]);
      break;
    case 'close':
      Suggix.close();
      break;
    case 'toggle':
      Suggix.toggle();
      break;
    case 'identify':
      Suggix.identify(params[0]);
      break;
    case 'logout':
      Suggix.logout();
      break;
    case 'switchTab':
      Suggix.switchTab(params[0]);
      break;
    case 'destroy':
      Suggix.destroy();
      break;
    case 'hideLauncher':
      Suggix.hideLauncher();
      break;
    case 'showLauncher':
      Suggix.showLauncher();
      break;
    case 'setLauncherVisible':
      Suggix.setLauncherVisible(params[0]);
      break;
    case 'setAccentColor':
    case 'setColor':
      Suggix.setAccentColor(params[0]);
      break;
    default:
      console.warn(`[Suggix] Unknown method: "${method}"`);
  }
}

// Create wrapper callable function Suggix(...) with methods Suggix.init, etc.
const SuggixWrapper: any = function () {
  handleCommand(arguments);
};

// Copy methods to callable wrapper
SuggixWrapper.init = Suggix.init.bind(Suggix);
SuggixWrapper.open = Suggix.open.bind(Suggix);
SuggixWrapper.close = Suggix.close.bind(Suggix);
SuggixWrapper.toggle = Suggix.toggle.bind(Suggix);
SuggixWrapper.isOpen = Suggix.isOpen.bind(Suggix);
SuggixWrapper.identify = Suggix.identify.bind(Suggix);
SuggixWrapper.logout = Suggix.logout.bind(Suggix);
SuggixWrapper.switchTab = Suggix.switchTab.bind(Suggix);
SuggixWrapper.destroy = Suggix.destroy.bind(Suggix);
SuggixWrapper.hideLauncher = Suggix.hideLauncher.bind(Suggix);
SuggixWrapper.showLauncher = Suggix.showLauncher.bind(Suggix);
SuggixWrapper.setLauncherVisible = Suggix.setLauncherVisible.bind(Suggix);
SuggixWrapper.setAccentColor = Suggix.setAccentColor.bind(Suggix);
SuggixWrapper.setColor = Suggix.setColor.bind(Suggix);

// Flush existing queued calls if user pre-defined window.Suggix.q
if (typeof window !== 'undefined') {
  const existingQueue = (window.Suggix && window.Suggix.q) || [];

  window.Suggix = SuggixWrapper;

  if (Array.isArray(existingQueue) && existingQueue.length > 0) {
    existingQueue.forEach((queuedArgs: any[]) => {
      handleCommand(queuedArgs);
    });
  }
}

// Auto-detect and parse <script ... data-workspace="...">
function autoInitFromScriptTag(): void {
  if (typeof document === 'undefined') return;

  // Find the script tag that loaded this script
  let script = document.currentScript as HTMLScriptElement | null;
  if (!script) {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const s = scripts[i];
      if (s.src && (s.src.includes('widget.js') || s.hasAttribute('data-workspace'))) {
        script = s;
        break;
      }
    }
  }

  if (!script) return;

  const workspace = script.getAttribute('data-workspace');
  if (!workspace) return;

  const config: SuggixConfig = {
    workspace,
    baseUrl: script.getAttribute('data-base-url') || undefined,
    position: (script.getAttribute('data-position') as WidgetPosition) || undefined,
    accentColor: script.getAttribute('data-accent-color') || undefined,
    theme: (script.getAttribute('data-theme') as WidgetTheme) || undefined,
    defaultTab: (script.getAttribute('data-default-tab') as WidgetTab) || undefined,
    hideLauncher: script.getAttribute('data-hide-launcher') === 'true',
    trigger: script.getAttribute('data-trigger') || undefined,
  };

  const zIndexAttr = script.getAttribute('data-z-index');
  if (zIndexAttr) {
    const z = parseInt(zIndexAttr, 10);
    if (!isNaN(z)) config.zIndex = z;
  }

  Suggix.init(config);
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitFromScriptTag);
  } else {
    autoInitFromScriptTag();
  }
}

export default SuggixWrapper;
