import { getUiLocale, setUiLocale } from './locale.js';
import { translateUiText } from './translate.js';
import { retranslateSplitFlaps } from '../splitFlap.js';

const LOCALE_KEY = 'gev-locale';
const SKIP =
  'script, style, textarea, .material-symbols-outlined, .gev-flap-text, #cesium-credits, .cesium-credit-lightbox, .cesium-widget-credits, [data-i18n-skip]';
const ATTRS = ['title', 'aria-label', 'placeholder', 'aria-valuetext', 'alt'];

const textSource = new WeakMap();
const attrSource = new WeakMap();
let applying = 0;

function readLocale() {
  try {
    return localStorage.getItem(LOCALE_KEY) === 'en' ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}

function skipped(node) {
  const element =
    node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return !element || Boolean(element.closest(SKIP));
}

function remember(map, key, current, translated) {
  const stored = map.get(key);
  if (stored == null) {
    map.set(key, current);
    return current;
  }
  if (current !== stored && current !== translated) map.set(key, current);
  return map.get(key);
}

function localizeText(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE || skipped(node)) return;
  const current = node.nodeValue;
  if (current == null) return;
  const stored = textSource.get(node);
  const translatedStored = stored == null ? null : translateUiText(stored);
  const source = remember(textSource, node, current, translatedStored);
  const next = getUiLocale() === 'zh' ? translateUiText(source) : source;
  if (current === next) return;
  applying += 1;
  node.nodeValue = next;
  applying -= 1;
}

function localizeAttrs(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE || skipped(element))
    return;
  let sources = attrSource.get(element);
  if (!sources) {
    sources = new Map();
    attrSource.set(element, sources);
  }
  for (const name of ATTRS) {
    if (!element.hasAttribute(name)) continue;
    const current = element.getAttribute(name);
    const stored = sources.get(name);
    const translatedStored = stored == null ? null : translateUiText(stored);
    const source = remember(sources, name, current, translatedStored);
    const next = getUiLocale() === 'zh' ? translateUiText(source) : source;
    if (current === next) continue;
    applying += 1;
    element.setAttribute(name, next);
    applying -= 1;
  }
}

function visit(node) {
  if (!node) return;
  if (node.nodeType === Node.TEXT_NODE) {
    localizeText(node);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE || skipped(node)) return;
  localizeAttrs(node);
  for (const child of node.childNodes) visit(child);
}

function paint(doc) {
  const locale = getUiLocale();
  doc.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  const button = doc.getElementById('gev-lang-toggle');
  if (button) {
    button.textContent = locale === 'zh' ? 'EN' : '中文';
    button.setAttribute(
      'aria-label',
      locale === 'zh' ? '切换为英文' : 'Switch to English',
    );
  }
  applying += 1;
  try {
    visit(doc.body);
    retranslateSplitFlaps();
  } finally {
    applying -= 1;
  }
}

/** Translate the live page and keep later UI updates in the selected language. */
export function installUiLocale(doc = document) {
  setUiLocale(readLocale());
  const button = doc.createElement('button');
  button.id = 'gev-lang-toggle';
  button.type = 'button';
  button.dataset.i18nSkip = '';
  doc.body.appendChild(button);
  button.addEventListener('click', () => {
    const locale = setUiLocale(getUiLocale() === 'zh' ? 'en' : 'zh');
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      /* Storage can be blocked; the choice still applies to this page. */
    }
    paint(doc);
  });
  const observer = new MutationObserver((records) => {
    if (applying) return;
    for (const record of records) {
      if (record.type === 'characterData') localizeText(record.target);
      else if (record.type === 'attributes') localizeAttrs(record.target);
      else {
        for (const node of record.addedNodes) visit(node);
      }
    }
  });
  observer.observe(doc.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS,
  });
  paint(doc);
  return () => observer.disconnect();
}
