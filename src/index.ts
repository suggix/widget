import { Suggix } from './Suggix';
import type {
  SuggixConfig,
  SuggixUser,
  WidgetTab,
  WidgetPosition,
  WidgetTheme,
} from './types';

export const init = Suggix.init.bind(Suggix);
export const open = Suggix.open.bind(Suggix);
export const close = Suggix.close.bind(Suggix);
export const toggle = Suggix.toggle.bind(Suggix);
export const identify = Suggix.identify.bind(Suggix);
export const logout = Suggix.logout.bind(Suggix);
export const destroy = Suggix.destroy.bind(Suggix);
export const isOpen = Suggix.isOpen.bind(Suggix);
export const hideLauncher = Suggix.hideLauncher.bind(Suggix);
export const showLauncher = Suggix.showLauncher.bind(Suggix);
export const setLauncherVisible = Suggix.setLauncherVisible.bind(Suggix);

export { Suggix };
export default Suggix;

export type {
  SuggixConfig,
  SuggixUser,
  WidgetTab,
  WidgetPosition,
  WidgetTheme,
};
