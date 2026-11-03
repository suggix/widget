# @suggix/widget

[![npm version](https://img.shields.io/npm/v/@suggix/widget.svg)](https://www.npmjs.com/package/@suggix/widget)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@suggix/widget)](https://bundlephobia.com/package/@suggix/widget)

The official embeddable feedback, roadmap, and changelog widget for [Suggix](https://suggix.com).

Collect customer feedback, announce product updates, and share roadmaps directly inside your SaaS web application with a single `<script>` tag or via the JavaScript/TypeScript SDK.

---

## ✨ Features

- **⚡️ Ultra Lightweight**: Zero runtime dependencies, gzip size under 4KB.
- **🛡️ 100% Style Isolation**: Built with Shadow DOM — immune to host website CSS resets (Bootstrap, Tailwind, etc.).
- **📱 Fully Responsive**: Floating card on desktop, adaptive bottom drawer on mobile devices.
- **🔄 Bidirectional `postMessage` Communication**: Real-time events, smooth close button handling, unread changelog badges.
- **🎨 Custom Branding**: Customize accent colors, positions (`bottom-right`, `bottom-left`), launcher icons, and themes.
- **🔑 SSO Authentication**: Seamlessly identify logged-in users and pass secure SSO tokens.
- **📦 Dual Distribution**: Use via CDN `<script>` tag or install via NPM for React, Vue, Next.js, and Angular.

---

## 🚀 Quick Start

### Option 1: Embed with `<script>` tag (CDN)

Add the following script before the closing `</body>` tag on any HTML page:

```html
<script
  src="https://cdn.jsdelivr.net/npm/@suggix/widget/dist/widget.js"
  data-workspace="your-workspace-slug"
  async
></script>
```

> Replace `your-workspace-slug` with your Suggix workspace subdomain (e.g., `acme`).

#### Customizing via `data-*` attributes:

```html
<script
  src="https://cdn.jsdelivr.net/npm/@suggix/widget/dist/widget.js"
  data-workspace="acme"
  data-position="bottom-right"
  data-accent-color="#3b82f6"
  data-default-tab="feedback"
  data-theme="auto"
  async
></script>
```

---

### Option 2: Install via NPM

```bash
# npm
npm install @suggix/widget

# pnpm
pnpm add @suggix/widget

# yarn
yarn add @suggix/widget
```

#### Vanilla JS / TypeScript

```typescript
import { Suggix } from '@suggix/widget';

Suggix.init({
  workspace: 'acme',
  position: 'bottom-right',
  accentColor: '#3b82f6',
});
```

#### React / Next.js

```tsx
import { useEffect } from 'react';
import { Suggix } from '@suggix/widget';

export function FeedbackWidget() {
  useEffect(() => {
    Suggix.init({
      workspace: 'acme',
      position: 'bottom-right',
    });

    return () => {
      Suggix.destroy();
    };
  }, []);

  return null;
}
```

#### Vue 3

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { Suggix } from '@suggix/widget';

onMounted(() => {
  Suggix.init({
    workspace: 'acme',
  });
});

onUnmounted(() => {
  Suggix.destroy();
});
</script>
```

---

## 📖 API Reference

### `Suggix.init(config)`
Initializes the widget with your configuration.

```typescript
Suggix.init({
  workspace: 'acme',
  position: 'bottom-right',
  theme: 'auto',
});
```

### `Suggix.open(tab?)`
Opens the feedback widget modal. Optionally specify which tab to open: `'feedback' | 'create' | 'changelog'`.

```typescript
// Open widget
Suggix.open();

// Open directly to the feedback submission form
Suggix.open('create');

// Open to the product updates / changelog
Suggix.open('changelog');
```

### `Suggix.close()`
Closes the widget modal.

```typescript
Suggix.close();
```

### `Suggix.toggle()`
Toggles the widget between open and closed.

```typescript
Suggix.toggle();
```

### `Suggix.isOpen(): boolean`
Returns `true` if the widget modal is currently open.

### `Suggix.identify(user)`
Passes current user identity or SSO token to automatically authenticate the user inside the widget.

```typescript
Suggix.identify({
  id: 'user_123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  ssoToken: 'your_jwt_sso_token',
});
```

### `Suggix.logout()`
Clears the current authenticated user session in the widget.

### `Suggix.destroy()`
Completely unmounts and removes the widget from the DOM.

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `workspace` | `string` | *(required)* | Your Suggix workspace subdomain/slug. |
| `baseUrl` | `string` | `https://${workspace}.suggix.com/widget` | Custom widget base URL (e.g. for development). |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Position of the launcher button and modal. |
| `offset` | `{ x?: number; y?: number }` | `{ x: 20, y: 20 }` | Pixel offset from screen edges. |
| `zIndex` | `number` | `999999` | Z-index of the widget container. |
| `accentColor` | `string` | Workspace color or `#3b82f6` | Background color of the floating launcher button. |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color theme. `'auto'` respects user OS preference. |
| `defaultTab` | `'feedback' \| 'create' \| 'changelog'` | `'feedback'` | Tab to display when the widget opens. |
| `hideLauncher` | `boolean` | `false` | If `true`, hides the default floating button. |
| `trigger` | `string` | `undefined` | CSS selector for custom elements that open the widget on click. |
| `user` | `SuggixUser` | `undefined` | Authenticated user information and SSO token. |
| `onOpen` | `() => void` | `undefined` | Callback fired when the widget modal opens. |
| `onClose` | `() => void` | `undefined` | Callback fired when the widget modal closes. |
| `onReady` | `() => void` | `undefined` | Callback fired when the iframe has loaded. |
| `onUnreadChange`| `(count: number) => void` | `undefined` | Callback fired when unread changelog count changes. |

---

## 🎯 Custom Trigger Elements

If you prefer using your own navigation button (e.g., "Give Feedback" in your app header) rather than the default floating circle:

```typescript
Suggix.init({
  workspace: 'acme',
  hideLauncher: true,
  trigger: '#header-feedback-btn', // Or '[data-suggix-trigger]'
});
```

```html
<button id="header-feedback-btn">Give Feedback</button>
```

---

## 🛠 Local Development & Testing

```bash
# Clone the repository
git clone https://github.com/suggix/widget.git
cd widget

# Install dependencies
npm install

# Build in watch mode
npm run dev

# Open test playground in browser
open index.html
```

---

## 📄 License

[MIT](LICENSE) © [Suggix](https://suggix.com)
