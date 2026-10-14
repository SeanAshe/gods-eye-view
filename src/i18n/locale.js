let locale = 'zh';

/** Active UI language. `zh` is the default. */
export function getUiLocale() {
  return locale;
}

/** @param {'zh' | 'en'} next */
export function setUiLocale(next) {
  locale = next === 'en' ? 'en' : 'zh';
  return locale;
}
