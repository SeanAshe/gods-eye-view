import assert from 'node:assert/strict';
import test from 'node:test';
import { UI_ZH } from './zh.js';
import { translateUiText } from './translate.js';

test('known chrome and dynamic status lines translate to Chinese', () => {
  assert.equal(translateUiText('DATA LAYERS'), '数据图层');
  assert.equal(translateUiText('  PLAY  '), '  播放  ');
  assert.equal(translateUiText('Initializing systems...'), '正在初始化系统...');
  assert.equal(translateUiText('Flying to Paris...'), '正在飞往 Paris...');
  assert.equal(
    translateUiText(
      'Google 3D Tiles unavailable (timeout). Loading the keyless globe...',
    ),
    'Google 3D 瓦片不可用（timeout）。正在加载免密钥地球...',
  );
  assert.equal(translateUiText('HDG 090'), '航向 090');
  assert.equal(translateUiText('Error: network'), '错误：network');
  assert.equal(
    translateUiText('Current style: NVG — click for next'),
    '当前样式：NVG — 点击切换下一个',
  );
});

test('unlisted copy, icon names, and measurements stay as written', () => {
  assert.equal(translateUiText('radar'), 'radar');
  assert.equal(translateUiText('United 245'), 'United 245');
  assert.equal(translateUiText('12.5 dB'), '12.5 dB');
  assert.equal(translateUiText(''), '');
});

test('dictionary entries are non-empty and unique', () => {
  const keys = Object.keys(UI_ZH);
  assert.equal(new Set(keys).size, keys.length);
  for (const [key, value] of Object.entries(UI_ZH)) {
    assert.equal(typeof value, 'string');
    assert.ok(value.trim(), key);
    assert.notEqual(value, key, key);
  }
});
