# remark-tweet-card

[![npm version](https://img.shields.io/npm/v/remark-tweet-card)](https://www.npmjs.com/package/remark-tweet-card)
[![license](https://img.shields.io/npm/l/remark-tweet-card)](LICENSE)

A [Remark](https://github.com/remarkjs/remark) plugin to embed tweet cards in Markdown and MDX. It fetches data via Twitter's public syndication API — no API key or backend service required. Tweets are rendered at build time, making it ideal for SSG/SSR projects like Astro.

📖 [中文文档](https://github.com/Talaxy009/remark-tweet-card/blob/main/README.zh-CN.md)

---

## 👀 Preview

Use the following syntax in Markdown:

```markdown
[$tweet](1654079444816936969)

or

[$tweet](https://x.com/github/status/1654079444816936969)
```

After building, it renders as a full tweet card including avatar, body, media, quoted tweets, engagement metrics, and more.

---

## 🚚 Installation

```shell
npm install remark-tweet-card
```

or

```shell
yarn add remark-tweet-card
```

## 🔦 Usage

1. Import

   Same as any remark plugin. Here's an example with Astro:

   ```js
   // astro.config.js
   import { unified } from "@astrojs/markdown-remark";
   import remarkTweetCard from "remark-tweet-card";

   export default defineConfig({
     markdown: {
       processor: unified({
         remarkPlugins: [remarkTweetCard],
       }),
     },
   });
   ```

2. Import global styles

   ```css
   @import "remark-tweet-card/style.css";
   ```

---

## 🔧 Configuration

```js
remarkTweetCard({
  // CSS class prefix (default: 'tweet-card')
  prefix: "tweet-card",

  // API request timeout in milliseconds (default: 10000)
  timeout: 10000,

  // Custom cache instance, must implement get/set/has (default: internal Map)
  cache: new Map(),

  // Custom tweet data fetcher
  fetchTweet: async (id, { timeout, cache }) => {
    /* ... */
  },

  // Custom full tweet card HTML renderer
  renderTweet: (tweet, { prefix }) => {
    /* return HTML string */
  },

  // Custom error fallback HTML renderer
  renderError: (url, { prefix }) => {
    /* return HTML string */
  },

  // Text displayed when tweet is unavailable
  notFoundText: "Tweet not available.",

  // Fallback link text
  viewOnXText: "View on X →",
});
```

---

## 🎨 Custom Styles

A default stylesheet is provided, with all colors controlled via CSS custom properties. Override the following variables to customize the appearance:

| Variable           | Description               | Default (light)        |
| ------------------ | ------------------------- | ---------------------- |
| `--tc-bg`          | Card background           | `#ffffff`              |
| `--tc-border`      | Border color              | `#cfd9de`              |
| `--tc-text`        | Primary text color        | `#0f1419`              |
| `--tc-text-muted`  | Muted text color          | `#536471`              |
| `--tc-link`        | Link color                | `#1d9bf0`              |
| `--tc-primary`     | Primary color (buttons, hover) | `#1d9bf0`              |
| `--tc-verified`    | Verified badge color      | `#1d9bf0`              |
| `--tc-font-family` | Font family               | System font stack      |
| `--tc-overlay`     | Video play button background | `rgba(0,0,0,0.65)`     |
| `--tc-hover-bg`    | Hover background          | `rgba(29,155,240,0.1)` |

### Dark Mode

Dark styles are not included by default. Configure them based on your project's needs:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --tc-bg: #16181c;
    --tc-border: #2f3336;
    --tc-text: #e7e9ea;
    --tc-text-muted: #71767b;
  }
}
```

or

```css
.dark {
  --tc-bg: #16181c;
  --tc-border: #2f3336;
  --tc-text: #e7e9ea;
  --tc-text-muted: #71767b;
}
```

---

## 😎 Advanced Usage

### Custom Data Fetching

If you need to proxy requests or add extra error handling:

```js
import remarkTweetCard from 'remark-tweet-card';
import { fetchTweetData } from 'remark-tweet-card/api';

function myFetcher(id, { timeout, cache }) {
  // Fetch data through your own proxy
  const res = await fetch(`/api/tweet?id=${id}`);
  return res.ok ? res.json() : null;
}

remarkTweetCard({ fetchTweet: myFetcher })
```

### Custom Rendering

Take full control of the HTML output:

```js
remarkTweetCard({
  renderTweet(tweet, { prefix }) {
    // Generate HTML with your own template
    return `<blockquote class="${prefix}">${tweet.text}</blockquote>`;
  },
});
```

### Reusing Submodules

The plugin's internal modules are also exported individually for easy reuse:

```js
import {
  extractTweetId,
  fetchTweetData,
  clearCache,
} from "remark-tweet-card/api";
import { buildTweetHTML, buildErrorHTML } from "remark-tweet-card/html";
import { formatDate, formatCount } from "remark-tweet-card/utils";

const id = extractTweetId("https://x.com/user/status/123456");
const tweet = await fetchTweetData(id, { timeout: 5000 });
const html = tweet ? buildTweetHTML(tweet, { prefix: "tweet-card" }) : "";
```

---

## 💡 Credits

This project is inspired by [react-tweet](https://github.com/vercel/react-tweet). The vast majority of the code was written by DeepSeek V4 Pro and Claude Sonnet 4.6, with all code reviewed by a human (me).

---
