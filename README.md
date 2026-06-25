<p align="center">
  <img src="https://img.shields.io/npm/v/remark-tweet-card?style=flat-square&label=version" alt="npm version">
  <img src="https://img.shields.io/npm/l/remark-tweet-card?style=flat-square" alt="license">
</p>

<h1 align="center">remark-tweet-card</h1>

<p align="center">
  <em>Embed beautiful tweet cards in Markdown &amp; MDX</em>
</p>

<p align="center">
  <a href="https://remark-tweet-card.talaxy.site/demo">🎨 Demo</a>
  ·
  <a href="https://remark-tweet-card.talaxy.site/docs-en">📖 English Docs</a>
  ·
  <a href="https://remark-tweet-card.talaxy.site/docs-en">📖 中文文档</a>
</p>

---

## ✨ Features

- 🪪 **No API key needed** — Uses Twitter's public syndication API
- ⚡ **Build-time rendering** — Perfect for SSG/SSR projects like Astro
- 🎨 **Full tweet card** — Avatar, body, media, quoted tweets, engagement metrics, and more

---

## 📦 Installation

```bash
npm install remark-tweet-card
```

---

## 🚀 Usage

Use the following syntax in your Markdown / MDX files:

```markdown
[$tweet](1654079444816936969)
```

Or with a full URL:

```markdown
[$tweet](https://x.com/github/status/1654079444816936969)
```

After building, each tweet is rendered as a full card including avatar, body, media, quoted tweets, engagement metrics, and more.

---

## ❤️ Credits

This project is inspired by [react-tweet](https://github.com/vercel/react-tweet). The vast majority of the code was written by DeepSeek V4 Pro and Claude Sonnet 4.6, with all code reviewed by a human (me).

---
