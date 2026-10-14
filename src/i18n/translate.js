import { UI_ZH } from './zh.js';

const PATTERNS = Object.freeze([
  [
    /^Google 3D Tiles unavailable \((.+)\)\. Loading the keyless globe\.\.\.$/,
    (detail) => `Google 3D 瓦片不可用（${detail}）。正在加载免密钥地球...`,
  ],
  [/^Error: (.+)$/, (detail) => `错误：${detail}`],
  [/^Flying to (.+)\.\.\.$/, (place) => `正在飞往 ${place}...`],
  [/^Restoring (.+)\.\.\.$/, (what) => `正在恢复${what}...`],
  [/^Loading (.+)\.\.\.$/, (what) => `正在加载${phrase(what)}...`],
  [/^Initializing (.+)\.\.\.$/, (what) => `正在初始化${phrase(what)}...`],
  [/^Configuring (.+)\.\.\.$/, (what) => `正在配置${phrase(what)}...`],
  [/^📍 Location: (.+)$/, (where) => `📍 位置：${where}`],
  [/^Landmark: (.+)$/, (where) => `地标：${where}`],
  [
    /^Current style: (.+) — click for next$/,
    (name) => `当前样式：${phrase(name)} — 点击切换下一个`,
  ],
  [
    /^Current cockpit vision style: (.+)\. Activate for next style\.$/,
    (name) => `当前座舱视觉：${phrase(name)}。点击切换下一种。`,
  ],
  [/^HDG (.+)$/, (value) => `航向 ${value}`],
  [/^PITCH (.+)$/, (value) => `俯仰 ${value}`],
  [/^FOV (.+)$/, (value) => `视场 ${value}`],
  [/^RANGE (.+)$/, (value) => `距离 ${value}`],
  [/^HGT (.+)$/, (value) => `高度 ${value}`],
  [/^FPS (.+)$/, (value) => `帧率 ${value}`],
  [/^BRG (.+)$/, (value) => `方位 ${value}`],
  [/^ΔN (.+)$/, (value) => `Δ北 ${value}`],
  [/^ΔE (.+)$/, (value) => `Δ东 ${value}`],
]);

function phrase(text) {
  return UI_ZH[text] || text;
}

/** Collapse internal whitespace so wrapped markup matches one dictionary entry. */
export function uiTextKey(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

/** Translate one visible string. Unknown copy is returned unchanged. */
export function translateUiText(text) {
  if (typeof text !== 'string' || text.length === 0) return text;
  const key = uiTextKey(text);
  if (!key || !/[A-Za-z]/.test(key)) return text;
  const exact = UI_ZH[key];
  const translated = exact || applyPattern(key);
  if (!translated || translated === key) return text;
  const leading = text.match(/^\s*/)[0];
  const trailing = text.match(/\s*$/)[0];
  if (leading.length + trailing.length >= text.length) return translated;
  return `${leading}${translated}${trailing}`;
}

function applyPattern(key) {
  for (const [pattern, render] of PATTERNS) {
    const match = key.match(pattern);
    if (match) return render(...match.slice(1));
  }
  return null;
}
