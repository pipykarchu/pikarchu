import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { APP_IDS, APPS, NODES, storageKey, newState, loadState, saveState, resetState, normalizeState, quoteResult, moveMiner, answerQuiz, presetReply } from '../public/projects/codex-samples/sample-state.mjs';

const fakeStore = () => {
  const values = new Map([['formal-study', 'private-record']]);
  return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k), values };
};
test('all five samples use unique storage namespaces', () => {
  assert.equal(new Set(APP_IDS.map(storageKey)).size, 5);
  const store = fakeStore();
  for (const id of APP_IDS) assert.equal(saveState(id, newState(id), store), true);
  assert.equal(store.values.size, 6);
  assert.equal(store.values.get('formal-study'), 'private-record');
});
test('editing, reloading and resetting one sample preserves other samples and formal data', () => {
  const store = fakeStore(), a = newState('study-bloom'), b = newState('knowledge-desk');
  a.target = 'only visitor'; b.notes.push({ title: 'visitor note', body: 'local only' });
  saveState(a.app, a, store); saveState(b.app, b, store);
  assert.equal(loadState(a.app, store).target, 'only visitor');
  resetState(a.app, store);
  assert.equal(loadState(b.app, store).notes[0].title, 'visitor note');
  assert.equal(store.getItem('formal-study'), 'private-record');
  assert.equal(loadState(a.app, store).target, newState(a.app).target);
});
test('different browser stores cannot observe each other', () => {
  const first = fakeStore(), second = fakeStore(), state = newState('study-bloom');
  state.target = 'browser one'; saveState(state.app, state, first);
  assert.notEqual(loadState(state.app, second).target, 'browser one');
});
test('blocked, damaged and cross-app storage recover without clearing other data', () => {
  const store = fakeStore(); store.setItem(storageKey('study-bloom'), '{broken');
  assert.deepEqual(loadState('study-bloom', store), newState('study-bloom'));
  store.setItem(storageKey('study-bloom'), JSON.stringify(newState('knowledge-desk')));
  assert.deepEqual(loadState('study-bloom', store), newState('study-bloom'));
  const blocked = { getItem() { throw Error(); }, setItem() { throw Error(); }, removeItem() { throw Error(); } };
  assert.deepEqual(loadState('study-bloom', blocked), newState('study-bloom'));
  assert.equal(saveState('study-bloom', newState('study-bloom'), blocked), false);
  assert.equal(resetState('study-bloom', blocked).app, 'study-bloom');
  assert.equal(store.getItem('formal-study'), 'private-record');
});
test('profit calculation handles fees, losses, zero hours and invalid saved values', () => {
  assert.deepEqual(quoteResult({ price: 1800, cost: 120, fee: 10, hours: 12 }), { price: 1800, cost: 120, feeAmount: 180, profit: 1500, hourly: 125 });
  assert.equal(quoteResult({ price: 100, cost: 200, fee: 0, hours: 0 }).profit, -100);
  assert.equal(quoteResult({ price: 100, cost: 200, fee: 0, hours: 0 }).hourly, null);
  const raw = { ...newState('side-income-studio'), quote: { price: -8, cost: 'x', fee: 999, hours: -1 } };
  const clean = normalizeState('side-income-studio', raw);
  assert.equal(clean.quote.price, 0); assert.equal(clean.quote.fee, 100);
});
test('mining collects each tile once, blocks out-of-range and non-adjacent moves', () => {
  const s = newState('emberburrow');
  assert.equal(moveMiner(s, 1, 1).changed, false);
  assert.equal(moveMiner(s, 1, 0).changed, true);
  const count = Object.values(s.bag).reduce((a, b) => a + b, 0);
  moveMiner(s, -1, 0); moveMiner(s, 1, 0);
  assert.equal(Object.values(s.bag).reduce((a, b) => a + b, 0), count);
  s.x = 0; assert.equal(moveMiner(s, -1, 0).changed, false);
});
test('quiz records the latest answer and can recover from a wrong answer', () => {
  const s = newState('study-bloom');
  assert.equal(answerQuiz(s, 0), false); assert.equal(answerQuiz(s, NODES[0].correct), true);
  assert.equal(Object.keys(s.answers).length, 1);
  answerQuiz(s, 0); assert.equal(s.answers[0], 0);
  assert.equal(answerQuiz(s, 99), null);
});
test('playback always resumes paused, with valid progress', () => {
  const s = normalizeState('xiaohongguo', { ...newState('xiaohongguo'), playing: true, progress: 999 });
  assert.equal(s.playing, false); assert.equal(s.progress, 180);
});
test('all displayed assistant prompts have local preset replies; unknown questions are honest', () => {
  for (const id of APP_IDS) for (const q of APPS[id].prompts) {
    const reply = presetReply(id, q); assert.ok(reply.length > 30); assert.ok(!reply.includes('没有配置'));
  }
  assert.match(presetReply('study-bloom', '随机未知问题zxq'), /没有配置示例回答/);
});
test('oversized saved visitor data is limited on restore', () => {
  const s = newState('knowledge-desk');
  s.notes = Array.from({ length: 100 }, () => ({ title: 'x'.repeat(90), body: 'y'.repeat(2000) }));
  const r = normalizeState(s.app, s); assert.equal(r.notes.length, 20); assert.equal(r.notes[0].body.length, 1200);
});
test('entry points block network connections and contain only local executable resources', () => {
  for (const id of APP_IDS) {
    const html = readFileSync(new URL(`../public/projects/codex-samples/${id}/index.html`, import.meta.url), 'utf8');
    assert.ok(html.includes("connect-src 'none'")); assert.ok(html.includes("form-action 'none'"));
    assert.ok(html.includes(`data-app="${id}"`)); assert.ok(html.includes('../sample.js'));
    assert.doesNotMatch(html, /https?:\/\//i);
  }
  for (const name of ['sample.js', 'sample-state.mjs']) {
    const code = readFileSync(new URL(`../public/projects/codex-samples/${name}`, import.meta.url), 'utf8');
    assert.doesNotMatch(code, /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|modelContext)\b/);
    assert.doesNotMatch(code, /localStorage\.clear|storage\.clear|chatgpt\.site|\/api\//);
  }
});
