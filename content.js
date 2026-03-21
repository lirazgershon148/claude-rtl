/**
 * Claude RTL — Hebrew Text Fixer v1.2
 *
 * Uses TreeWalker to find Hebrew text nodes,
 * then applies RTL only to their direct parent.
 * Skips sidebar, nav, buttons, inputs, code blocks.
 * Uses position check to avoid touching sidebar elements.
 */

const HEBREW_REGEX = /[\u0590-\u05FF]/;

// Track processed elements
const processed = new WeakSet();

/**
 * Check if text contains meaningful Hebrew
 */
function hasHebrew(text) {
  if (!text || text.trim().length < 2) return false;
  return HEBREW_REGEX.test(text);
}

/**
 * Check if element should be skipped (sidebar, nav, input, code)
 */
function shouldSkip(el) {
  if (!el || !el.tagName) return true;

  const tag = el.tagName;

  // Skip code, inputs, scripts
  if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'KBD', 'SAMP',
       'INPUT', 'TEXTAREA', 'SELECT', 'SVG', 'CANVAS',
       'NOSCRIPT', 'IFRAME', 'BUTTON'].includes(tag)) {
    return true;
  }

  // Skip if inside nav, sidebar, input area, code block
  if (el.closest('nav, aside, button, [role="navigation"], [role="banner"], [contenteditable="true"], textarea, input, pre, code')) {
    return true;
  }

  // Skip elements that are likely sidebar (left side of page, < 350px from left)
  try {
    const rect = el.getBoundingClientRect();
    if (rect.left < 100 && rect.width < 350) return true;
  } catch (e) {}

  return false;
}

/**
 * Find the best parent to apply RTL to.
 * Walk up from text node to find a block-level element that holds the text.
 */
function findTextContainer(textNode) {
  let el = textNode.parentElement;
  if (!el) return null;

  // If parent is a small inline element (span, a, strong, em),
  // go up one more level to find the block container
  const inlineTags = new Set(['SPAN', 'A', 'STRONG', 'EM', 'B', 'I', 'U', 'MARK', 'SMALL', 'SUB', 'SUP']);

  let attempts = 0;
  while (el && inlineTags.has(el.tagName) && attempts < 3) {
    if (el.parentElement) {
      el = el.parentElement;
    } else {
      break;
    }
    attempts++;
  }

  return el;
}

/**
 * Main scan: find Hebrew text nodes and apply RTL to their container
 */
function scanForHebrew() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const text = node.textContent.trim();
        if (text.length < 2) return NodeFilter.FILTER_REJECT;
        if (!hasHebrew(text)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    const container = findTextContainer(textNode);

    if (!container) continue;
    if (processed.has(container)) continue;
    if (shouldSkip(container)) continue;

    // Apply RTL
    container.setAttribute('dir', 'rtl');
    container.style.textAlign = 'right';
    processed.add(container);

    // If this is a list item, also fix the parent ul/ol
    if (container.tagName === 'LI' && container.parentElement) {
      const list = container.parentElement;
      if ((list.tagName === 'UL' || list.tagName === 'OL') && !processed.has(list)) {
        list.setAttribute('dir', 'rtl');
        processed.add(list);
      }
    }
  }
}

/**
 * Watch for new messages (streaming responses)
 */
const observer = new MutationObserver((mutations) => {
  let shouldScan = false;

  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0 || mutation.type === 'characterData') {
      shouldScan = true;
      break;
    }
  }

  if (shouldScan) {
    requestAnimationFrame(() => scanForHebrew());
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});

// Initial scan
scanForHebrew();

// Re-scan for streaming and lazy-loaded content
setInterval(scanForHebrew, 1500);

console.log('[Claude RTL] v1.2 ready — TreeWalker Hebrew detection, response-only targeting');
