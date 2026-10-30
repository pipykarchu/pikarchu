// Controller tests run the real event handlers with a minimal DOM surface.
// They verify interaction/state behavior, not browser layout or rendering.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as engine from '../public/projects/codex-samples/sample-state.mjs';

function openSample(id, shared = new Map()) {
  shared.set('formal-record', 'untouched');
  const handlers = {}, elements = {}, timers = [];
  const root = { innerHTML: '', contains: () => true };
  const element = selector => elements[selector] ||= { textContent: '', scrollTop: 0, scrollHeight: 100, value: '' };
  const storage = { getItem: k => shared.get(k) ?? null, setItem: (k, v) => shared.set(k, v), removeItem: k => shared.delete(k) };
  const blockNetwork = () => { throw new Error('A sample attempted a network request'); };
  const context = vm.createContext({
    ...engine,
    document: { body: { dataset: { app: id } }, hidden: false, addEventListener: (name, fn) => { handlers[name] = fn; }, querySelector: s => s === '#sample' ? root : element(s), querySelectorAll: () => [] },
    window: { localStorage: storage, confirm: () => true, setInterval: fn => timers.push(fn), fetch: blockNetwork },
    FormData: class { constructor(form) { this.values = form.values; } get(k) { return this.values[k] ?? null; } },
    fetch: blockNetwork, XMLHttpRequest: blockNetwork, WebSocket: blockNetwork, console
  });
  const source = readFileSync(new URL('../public/projects/codex-samples/sample.js', import.meta.url), 'utf8').replace(/^import[^;]+;\r?\n/, '');
  vm.runInContext(source, context, { timeout: 2000 });
  return {
    root, shared, storage, element, timers,
    click(action, data = {}) { handlers.click({ target: { closest: () => ({ dataset: { action, ...data }, disabled: false }) } }); },
    submit(id, values) { handlers.submit({ preventDefault() {}, target: { id, values } }); },
    changeProgress(value) { handlers.change({ target: { id: 'progress', value } }); },
    key(key) { handlers.keydown({ key, target: { closest: () => null }, preventDefault() {} }); },
    state() { return engine.loadState(id, storage); }
  };
}
test('all five controllers render the correct app and independent sample notice', () => {
  for (const id of engine.APP_IDS) {
    const app = openSample(id);
    assert.ok(app.root.innerHTML.includes(engine.APPS[id].title));
    assert.ok(app.root.innerHTML.includes('预设回答'));
    assert.ok(app.root.innerHTML.includes('不调用模型'));
  }
});
test('watch sample creates room, plays, seeks and shows a local preset answer', () => {
  const app = openSample('xiaohongguo');
  app.click('room'); app.click('play'); app.timers[0]();
  assert.equal(app.state().room, true); assert.equal(app.state().progress, 1);
  app.changeProgress(70); assert.equal(app.state().progress, 70);
  app.click('prompt', { index: '0' });
  assert.match(app.state().messages[0].a, /不会创建真实房间/);
});
test('knowledge search, note save and reload stay local and escape visitor HTML', () => {
  const app = openSample('knowledge-desk');
  app.submit('search-form', { query: 'RAG' }); assert.ok(app.root.innerHTML.includes('RAG 入门'));
  app.submit('note-form', { title: '<img src=x onerror=alert(1)>', body: '</textarea><script>alert(1)</script>' });
  assert.equal(app.state().notes.length, 1);
  assert.ok(app.root.innerHTML.includes('&lt;img'));
  assert.ok(!app.root.innerHTML.includes('<script>alert(1)</script>'));
  const reloaded = openSample('knowledge-desk', app.shared); assert.equal(reloaded.state().notes.length, 1);
});
test('income quote leads to virtual order and stage transition', () => {
  const app = openSample('side-income-studio');
  app.click('favorite', { id: 'page' }); assert.deepEqual(app.state().favorites, ['page']);
  app.submit('quote-form', { price: '1800', cost: '120', fee: '10', hours: '12' });
  app.click('trial'); assert.equal(app.state().trials[0].profit, 1500);
  app.click('deliver', { id: 'trial-0' }); assert.equal(app.state().trials[0].stage, '已交付');
  app.click('task', { index: '0' }); assert.deepEqual(app.state().tasks, [0]);
});
test('study supports goal, note, wrong answer and corrected answer without AI', () => {
  const app = openSample('study-bloom');
  app.submit('target-form', { target: '我的试用目标' }); app.submit('study-note-form', { note: '需求需要验收标准' });
  app.click('answer', { index: '0' }); assert.ok(app.root.innerHTML.includes('还差一点'));
  app.click('answer', { index: '1' }); assert.ok(app.root.innerHTML.includes('答对了'));
  assert.equal(app.state().target, '我的试用目标'); assert.equal(app.state().notes[0], '需求需要验收标准');
  app.submit('chat-form', { question: '规划学习路径' }); assert.match(app.state().messages[0].a, /预设样例/);
});
test('mine responds to keys and buttons without duplicating ore', () => {
  const app = openSample('emberburrow');
  app.key('ArrowRight'); const count = Object.values(app.state().bag).reduce((a, b) => a + b, 0);
  app.click('move', { dx: '-1', dy: '0' }); app.key('d');
  assert.equal(app.state().x, 2); assert.equal(Object.values(app.state().bag).reduce((a, b) => a + b, 0), count);
});
test('reset button removes only this sample and preserves a different sample plus formal records', () => {
  const shared = new Map(), first = openSample('study-bloom', shared), second = openSample('knowledge-desk', shared);
  first.submit('target-form', { target: '改过的目标' }); second.submit('note-form', { title: '保留', body: '另一个样品' });
  first.click('reset'); assert.equal(shared.has(engine.storageKey('study-bloom')), false);
  assert.equal(second.state().notes[0].title, '保留'); assert.equal(shared.get('formal-record'), 'untouched');
});
