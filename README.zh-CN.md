# remark-tweet-card

[![npm version](https://img.shields.io/npm/v/remark-tweet-card)](https://www.npmjs.com/package/remark-tweet-card)
[![license](https://img.shields.io/npm/l/remark-tweet-card)](LICENSE)

一个 [Remark](https://github.com/remarkjs/remark) 插件，为 Markdown、MDX 嵌入推文卡片。通过推特公开的 syndication API 获取数据，无需 API Key 和部署后端服务。推文会在渲染时插入，非常适合 Astro 等 SSG/SSR 项目。

---

## 👀 效果预览

在 Markdown 中使用如下写法：

```markdown
[$tweet](1654079444816936969)

或

[$tweet](https://x.com/github/status/1654079444816936969)
```

构建后将渲染为一个完整的推文卡片包含头像、正文、媒体、引用推文、互动数据等。

---

## 🚚 安装

```shell
npm install remark-tweet-card
```

或

```shell
yarn add remark-tweet-card
```

## 🔦 使用方法

1. 导入

   和一般的 remark 插件一样，这里以 Astro 为例：

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

2. 引入全局样式

   ```css
   @import "remark-tweet-card/style.css";
   ```

---

## 🔧 配置项

```js
remarkTweetCard({
  // CSS 类名前缀（默认 'tweet-card'）
  prefix: "tweet-card",

  // API 请求超时时间，单位毫秒（默认 10000）
  timeout: 10000,

  // 自定义缓存实例，需实现 get/set/has（默认使用内部 Map）
  cache: new Map(),

  // 自定义推文数据获取器
  fetchTweet: async (id, { timeout, cache }) => {
    /* ... */
  },

  // 自定义完整推文卡片 HTML 渲染
  renderTweet: (tweet, { prefix }) => {
    /* 返回 HTML 字符串 */
  },

  // 自定义错误降级 HTML 渲染
  renderError: (url, { prefix }) => {
    /* 返回 HTML 字符串 */
  },

  // 推文不可用时显示的文本
  notFoundText: "Tweet not available.",

  // 降级链接文字
  viewOnXText: "View on X →",
});
```

---

## 🎨 自定义样式

提供了一份默认样式表，所有颜色通过 CSS 自定义属性控制。你只需覆盖以下变量即可实现一定程度的客制化：

| 变量               | 说明                  | 默认值（亮色）         |
| ------------------ | --------------------- | ---------------------- |
| `--tc-bg`          | 卡片背景色            | `#ffffff`              |
| `--tc-border`      | 边框颜色              | `#cfd9de`              |
| `--tc-text`        | 主文字色              | `#0f1419`              |
| `--tc-text-muted`  | 次要文字色            | `#536471`              |
| `--tc-link`        | 链接颜色              | `#1d9bf0`              |
| `--tc-primary`     | 主题色（按钮、hover） | `#1d9bf0`              |
| `--tc-verified`    | 认证徽章色            | `#1d9bf0`              |
| `--tc-font-family` | 字体                  | 系统字体栈             |
| `--tc-overlay`     | 视频播放按钮背景      | `rgba(0,0,0,0.65)`     |
| `--tc-hover-bg`    | hover 背景色          | `rgba(29,155,240,0.1)` |

### 深色模式

默认不提供深色样式，取决于项目的具体实现，你需要手动配置：

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

或

```css
.dark {
  --tc-bg: #16181c;
  --tc-border: #2f3336;
  --tc-text: #e7e9ea;
  --tc-text-muted: #71767b;
}
```

---

## 😎 高阶用法

### 自定义数据获取

如果你需要代理请求或添加额外的错误处理：

```js
import remarkTweetCard from 'remark-tweet-card';
import { fetchTweetData } from 'remark-tweet-card/api';

function myFetcher(id, { timeout, cache }) {
  // 通过你自己的代理获取数据
  const res = await fetch(`/api/tweet?id=${id}`);
  return res.ok ? res.json() : null;
}

remarkTweetCard({ fetchTweet: myFetcher })
```

### 自定义渲染

完全控制 HTML 输出：

```js
remarkTweetCard({
  renderTweet(tweet, { prefix }) {
    // 使用你自己的模板生成 HTML
    return `<blockquote class="${prefix}">${tweet.text}</blockquote>`;
  },
});
```

### 复用子模块

插件的内部模块也单独导出，方便复用：

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

## 💡 感谢

本项目受了 [react-tweet](https://github.com/vercel/react-tweet) 的启发。在具体代码上 DeepSeek V4 Pro 和 Claude Sonnet 4.6 完成了绝大多数工作，代码皆通过人类（我）审核。

---
