# Claude RTL — Hebrew Text Fixer

A lightweight Chrome extension that auto-detects Hebrew text in Claude's chat interface and applies right-to-left (RTL) alignment.

## What it does

When Claude responds in Hebrew, the text displays left-aligned (LTR) by default. This extension fixes that by:

1. Scanning the page for Hebrew text using a TreeWalker
2. Applying `dir="rtl"` and `text-align: right` to Hebrew text containers
3. Watching for new messages (including streaming responses) via MutationObserver
4. Properly handling bullet lists in RTL mode

The extension **only** targets text content in the chat area — it does not touch the sidebar, navigation, buttons, or input fields.

## Installation

1. Download or clone this repository
2. Open `chrome://extensions` in Chrome
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select the `claude-rtl` folder
6. Open [claude.ai](https://claude.ai) and start chatting in Hebrew

## Security

This extension has been audited and is fully transparent:

| Check | Result |
|-------|--------|
| Network calls (fetch, XHR, WebSocket) | None |
| Data storage (cookies, localStorage) | None |
| Sensitive data access (passwords, tokens) | None |
| Code injection (eval, innerHTML) | None |
| External script loading | None |
| Chrome API usage | None |
| Permissions | `activeTab` only |
| Runs on | `claude.ai` only |

**Total codebase: 208 lines across 3 files.** You can read every line in under 5 minutes.

The extension:
- Does NOT send any data anywhere
- Does NOT read passwords, cookies, or personal information
- Does NOT inject external scripts
- Does NOT access other tabs or websites
- Uses the minimal `activeTab` permission only

## Files

```
claude-rtl/
├── manifest.json    (23 lines — extension config, permissions)
├── content.js       (149 lines — Hebrew detection + RTL application)
├── rtl-fix.css      (36 lines — bullet list fixes for RTL)
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## How it works

The extension uses a `TreeWalker` to find text nodes containing Hebrew characters (Unicode range `\u0590-\u05FF`). When found, it applies RTL direction to the nearest block-level parent element.

Elements that are skipped:
- Sidebar and navigation (`nav`, `aside`, elements positioned < 100px from left)
- Buttons, inputs, and editable areas
- Code blocks (`pre`, `code`)
- Script and style tags

A `MutationObserver` watches for new content (streaming responses) and re-scans automatically.

## License

MIT

## Author

Built by [Liraz Gershon](https://lirazgershon.com) — UX/UI Designer
