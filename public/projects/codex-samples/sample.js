import { APP_IDS, APPS, ARTICLES, OPPORTUNITIES, NODES, newState, loadState, saveState, resetState, quoteResult, cellType, moveMiner, answerQuiz, presetReply } from './sample-state.mjs';

const id = document.body.dataset.app;
if (!APP_IDS.includes(id)) throw new Error('Unknown sample');
const config = APPS[id];
const root = document.querySelector('#sample');
let storage = null;
try { storage = window.localStorage; } catch { /* Memory-only mode. */ }
let state = loadState(id, storage);
let persisted = storage !== null;
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const money = value => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value);
const time = value => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
const button = (label, action, extra = '') => `<button type="button" data-action="${action}" ${extra}>${label}</button>`;
const commit = () => { persisted = saveState(id, state, storage); };
const toast = text => { document.querySelector('#notice').textContent = text; };

function assistant() {
  return `<section class="panel assistant" aria-labelledby="assistant-heading">
    <div class="panel-heading"><div><span class="eyebrow">TRY A CONVERSATION</span><h2 id="assistant-heading">问问样品助手</h2></div><span class="chip">预设回答</span></div>
    <p class="muted">体验问答流程。回答来自预先写好的示例，不会调用 AI，也不会发送你的输入。</p>
    <div class="prompt-list">${config.prompts.map((q, i) => button(esc(q), 'prompt', `data-index="${i}" class="prompt"`)).join('')}</div>
    <div class="messages" aria-live="polite">${state.messages.length ? state.messages.map(m => `<div class="question">${esc(m.q)}</div><div class="reply"><span class="reply-label">模拟回答 · 预设内容</span><p>${esc(m.a)}</p></div>`).join('') : '<div class="chat-empty">选一个问题，看看这条产品流程怎样运转。</div>'}</div>
    <form id="chat-form" class="chat-form"><label class="sr-only" for="question">输入试用问题</label><input id="question" name="question" maxlength="200" required placeholder="也可以输入自己的问题，未收录的问题会提示…" autocomplete="off"><button type="submit" class="primary">查看模拟回答 ↗</button></form>
  </section>`;
}
function renderApple() {
  const scenes = ['果园的午后', '山间慢行', '雨后微光'];
  return `<div class="workspace split apple-layout"><section class="panel">
    <div class="panel-heading"><div><span class="eyebrow">WATCH TOGETHER</span><h2>一间小小放映室</h2></div><span class="chip">本地模拟双端</span></div>
    <div class="scene scene-${state.scene}"><span class="sun"></span><span class="hill hill-back"></span><span class="hill"></span><span class="scene-apple">🍎</span><div class="scene-caption"><span>生成式场景示意 · 无外部视频</span><h3>${scenes[state.scene]}</h3><span data-clock>${time(state.progress)}</span> / 3:00</div></div>
    <div class="play-controls">${button(state.playing ? '暂停' : '播放', 'play', `class="primary" id="play-toggle" ${!state.room ? 'disabled' : ''}`)}<input type="range" id="progress" min="0" max="180" step="1" value="${state.progress}" aria-label="模拟播放进度" ${!state.room ? 'disabled' : ''}>${button('换个场景', 'scene')}</div>
    <p class="muted small">先创建演示房间，再体验播放与拖动进度。右侧跟随端为本页模拟，没有真实连线。</p>
    </section><section class="panel"><span class="eyebrow">OUR LITTLE ROOM</span><h2>一起看到同一刻</h2><p class="muted">把房主、跟随者与播放状态放在一起。</p>
    ${state.room ? '<div class="room-code">DEMO · APPLE <span>演示房间</span></div>' : button('创建演示房间', 'room', 'class="primary wide"')}
    <div class="person"><span class="avatar">🍎</span><div><strong>你 · 房主</strong><p data-owner-status>${state.room ? (state.playing ? '播放中' : '已暂停') : '等待创建房间'}</p></div><b data-clock>${time(state.progress)}</b></div>
    <div class="person"><span class="avatar sheep">☁</span><div><strong>模拟朋友 · 跟随端</strong><p data-peer-status>${state.room ? '跟随房主状态' : '尚未加入'}</p></div><b data-peer-clock>${state.room ? time(state.progress) : '--:--'}</b></div>
    <div class="callout">同步预览由同一页的演示状态驱动。正式产品的跨设备连接不在此样品中运行。</div></section></div>`;
}
function renderKnowledge() {
  const all = [...ARTICLES, ...state.notes];
  const found = all.filter(a => `${a.title} ${a.body} ${a.tag}`.toLowerCase().includes(state.query.toLowerCase()));
  const selected = all.find(a => a.id === state.selected) || found[0];
  return `<div class="stats"><div><strong>${all.length}</strong><span>演示资料与试用笔记</span></div><div><strong>3</strong><span>知识主题</span></div><div><strong>本地</strong><span>搜索与保存</span></div></div><div class="workspace knowledge-layout">
    <section class="panel"><span class="eyebrow">YOUR SMALL LIBRARY</span><h2>翻一翻藏宝库</h2><form id="search-form" class="inline-form"><label class="sr-only" for="search">搜索演示资料</label><input id="search" name="query" type="search" maxlength="80" value="${esc(state.query)}" placeholder="试着搜索 RAG 或需求"><button type="submit">搜索</button></form>
    <div class="article-list">${found.length ? found.map(a => `<button type="button" class="article ${selected?.id === a.id ? 'selected' : ''}" data-action="article" data-id="${esc(a.id)}"><span class="eyebrow">${esc(a.tag)}</span><strong>${esc(a.title)}</strong><span>${esc(a.body.slice(0, 58))}…</span></button>`).join('') : '<p class="empty">没有找到，换一个关键词，或添加试用笔记。</p>'}</div></section>
    <section class="panel reading">${selected ? `<span class="eyebrow">${esc(selected.tag)}</span><h2>${esc(selected.title)}</h2><p class="reading-body">${esc(selected.body)}</p><div class="callout"><strong>把知识变成行动</strong><p>${esc(selected.action)}</p></div>` : '<h2>从一份笔记开始</h2>'}
    <form id="note-form"><h3>存一条自己的试用笔记</h3><label>标题<input name="title" maxlength="60" required placeholder="例如：我的 RAG 学习记录"></label><label>内容<textarea name="body" maxlength="1200" required rows="4" placeholder="记录想法，只会保存在这个浏览器的样品里。"></textarea></label><button type="submit" class="primary" ${state.notes.length >= 20 ? 'disabled' : ''}>${state.notes.length >= 20 ? '已达 20 条，可重置后继续' : '保存试用笔记'}</button></form></section></div>`;
}
function renderIncome() {
  const r = quoteResult(state.quote), tasks = ['选一个边界清楚的小服务', '写好交付清单与修改范围', '完成一次成本和工时试算', '建立虚拟试单并记录结果'];
  return `<div class="stats"><div><strong>${state.favorites.length}</strong><span>收藏的示例机会</span></div><div><strong>${state.trials.length}</strong><span>虚拟试单</span></div><div><strong>${state.tasks.length} / 4</strong><span>起步行动</span></div></div><div class="workspace split">
    <section class="panel"><span class="eyebrow">START SMALL</span><h2>先从一个小机会开始</h2><p class="muted">以下客户、需求和报价均为虚构样例，不会对外联系或接单。</p>
    <div class="opportunity-list">${OPPORTUNITIES.map(o => `<article class="opportunity"><div class="panel-heading"><span class="eyebrow">${o.customer}</span><span class="price">¥ ${money(o.price)}</span></div><h3>${o.title}</h3><p>${o.detail}</p><div class="button-row">${button(state.favorites.includes(o.id) ? '★ 已收藏' : '☆ 收藏', 'favorite', `data-id="${o.id}" aria-pressed="${state.favorites.includes(o.id)}"`)}${button('载入试算 ↗', 'quote', `data-id="${o.id}"`)}</div></article>`).join('')}</div>
    <h3>我的起步清单</h3><div class="task-list">${tasks.map((t, i) => button(`${state.tasks.includes(i) ? '☑' : '☐'} ${t}`, 'task', `data-index="${i}" aria-pressed="${state.tasks.includes(i)}"`)).join('')}</div></section>
    <section class="panel"><span class="eyebrow">MAKE THE NUMBERS CLEAR</span><h2>这份报价，值不值得做？</h2><form id="quote-form"><div class="field-grid">${[['price', '报价 / 元'], ['cost', '直接成本 / 元'], ['fee', '平台费率 / %'], ['hours', '预计工时 / 小时']].map(([name, label]) => `<label>${label}<input name="${name}" type="number" min="0" max="${name === 'fee' ? 100 : 1000000}" step="0.01" required value="${state.quote[name]}"></label>`).join('')}</div><button type="submit" class="primary">更新试算</button></form>
    <div class="profit"><span>预计净额</span><strong>¥ ${money(r.profit)}</strong><p>预计每小时 ${r.hourly === null ? '—（请填工时）' : `¥ ${money(r.hourly)}`}</p></div><p class="muted small">报价 − 直接成本 − 平台费；这是简化演示，未计税费等其他成本，不是实际收入。</p>${button('存为虚拟试单', 'trial', `class="wide" ${state.trials.length >= 12 ? 'disabled' : ''}`)}
    <h3>我的虚拟试单</h3>${state.trials.length ? state.trials.map(t => `<div class="trial"><div><strong>${esc(t.title)}</strong><p>报价 ¥ ${money(t.price)} · 预计净额 ¥ ${money(t.profit)}</p></div>${button(t.stage, 'deliver', `data-id="${t.id}" ${t.stage === '已交付' ? 'disabled' : ''}`)}</div>`).join('') : '<p class="empty">从上面的试算保存第一份虚拟试单。</p>'}</section></div>`;
}
function renderStudy() {
  const node = NODES[state.node], answer = state.answers[state.node];
  const passed = NODES.filter((n, i) => state.answers[i] === n.correct).length;
  return `<section class="panel target-panel"><div><span class="eyebrow">A LITTLE EVERY DAY</span><h2>今天，向目标靠近一点</h2></div><form id="target-form" class="inline-form"><label class="sr-only" for="target">学习目标</label><input id="target" name="target" maxlength="120" required value="${esc(state.target)}"><button type="submit">保存目标</button></form></section>
    <div class="workspace split"><section class="panel"><div class="panel-heading"><h2>我的学习枝叶</h2><span class="chip">${passed} / 6 参考题答对</span></div><div class="garden"><div class="garden-core">✿<span>AI 产品实践</span></div><div class="node-grid">${NODES.map((n, i) => `<button type="button" data-action="node" data-index="${i}" class="knowledge-node ${i === state.node ? 'selected' : ''} ${state.answers[i] === n.correct ? 'passed' : ''}"><span>${state.answers[i] === n.correct ? '✓' : `0${i + 1}`}</span><strong>${n.title}</strong></button>`).join('')}</div></div><p class="muted small">这里是固定的六节点示例框架。学习目标可编辑，路线与模拟回答不会调用模型重新生成。</p></section>
    <section class="panel"><span class="eyebrow">STEP ${state.node + 1} / 6</span><h2>${node.title}</h2><p class="reading-body">${node.detail}</p><div class="callout"><strong>动手小任务</strong><p>${node.task}</p></div><form id="study-note-form"><label>用自己的话记下来<textarea name="note" maxlength="1200" rows="3" placeholder="先不看说明，试着复述…">${esc(state.notes[state.node] || '')}</textarea></label><button type="submit">保存试用笔记</button></form><fieldset class="quiz"><legend>一道参考测验</legend><p>${node.question}</p>${node.options.map((o, i) => button(`${String.fromCharCode(65 + i)}. ${o}`, 'answer', `data-index="${i}" class="quiz-option ${answer === i ? 'chosen' : ''}" aria-pressed="${answer === i}"`)).join('')}${answer !== undefined ? `<div class="quiz-result ${answer === node.correct ? 'correct' : ''}">${answer === node.correct ? '答对了。再完成上面的小任务检查理解。' : `还差一点。参考答案是 ${String.fromCharCode(65 + node.correct)}，可以重新作答。`}</div>` : ''}</fieldset><p class="muted small">参考题成绩只反映本样品中的答题结果。</p></section></div>`;
}
function renderMine() {
  const symbols = { open: '·', stone: '▪', copper: '◆', crystal: '✦' }, names = { open: '通道', stone: '石块', copper: '铜矿', crystal: '晶石' };
  return `<div class="workspace mine-layout"><section class="panel mine-panel"><div class="panel-heading"><div><span class="eyebrow">ONE MORE STEP BELOW</span><h2>矿洞初探</h2></div><span class="chip">已行动 ${state.steps} 步</span></div><div class="mine-grid" role="group" aria-label="七乘七的演示矿洞">${Array.from({ length: 49 }, (_, i) => { const x = i % 7, y = Math.floor(i / 7), here = state.x === x && state.y === y, dug = state.dug.includes(`${x},${y}`) || cellType(x, y) === 'open', adjacent = Math.abs(state.x - x) + Math.abs(state.y - y) === 1, type = cellType(x, y); return `<button type="button" class="cell ${here ? 'miner' : dug ? 'dug' : type}" data-action="cell" data-x="${x}" data-y="${y}" aria-label="${x + 1}列${y + 1}行，${here ? '你的位置' : dug ? '通道' : names[type]}" ${!adjacent ? 'disabled' : ''}>${here ? '♟' : dug ? '·' : symbols[type]}</button>`; }).join('')}</div><p class="muted small">点击相邻格子，或使用方向键 / WASD。每种矿石只会拾取一次。</p></section>
    <section class="panel"><span class="eyebrow">YOUR POCKET FINDS</span><h2>这趟探索的收获</h2><div class="bag">${[['stone', '石块', '▪'], ['copper', '铜矿', '◆'], ['crystal', '晶石', '✦']].map(([key, label, symbol]) => `<div class="bag-item"><span class="ore-${key}">${symbol}</span><strong>${state.bag[key]}</strong><p>${label}</p></div>`).join('')}</div><div class="direction-pad">${button('↑', 'move', 'data-dx="0" data-dy="-1" aria-label="向上挖掘"')}${button('←', 'move', 'data-dx="-1" data-dy="0" aria-label="向左挖掘"')}${button('↓', 'move', 'data-dx="0" data-dy="1" aria-label="向下挖掘"')}${button('→', 'move', 'data-dx="1" data-dy="0" aria-label="向右挖掘"')}</div><div class="callout">独立的 7 × 7 样品地图，只体验移动、挖掘、拾取和背包。不会读取或改动正式游戏存档。</div></section></div>`;
}
const renderers = { xiaohongguo: renderApple, 'knowledge-desk': renderKnowledge, 'side-income-studio': renderIncome, 'study-bloom': renderStudy, emberburrow: renderMine };
function render() {
  document.body.dataset.accent = config.accent;
  document.title = `${config.title} · 独立试用样品`;
  root.innerHTML = `<header class="topbar"><a class="back-link" href="../../../#cat-work">← 返回个人作品集</a><span class="safety-label">独立样品 · 不调用模型</span>${button('重置当前样品', 'reset', 'class="reset-button"')}</header>
    <main><section class="hero"><div><div class="hero-kicker"><span>${config.icon}</span> ${config.label} / INTERACTIVE SAMPLE</div><h1>${config.title}<span>试用一下。</span></h1><p>${config.intro}</p></div><div class="sample-seal"><strong>0</strong><span>模型调用<br>你的额度不受影响</span></div></section>
    <nav class="sample-nav" aria-label="切换独立样品">${APP_IDS.map(key => `<a href="../${key}/index.html" ${id === key ? 'aria-current="page"' : ''}>${APPS[key].icon} ${APPS[key].title}</a>`).join('')}</nav>
    <div class="sample-notice"><span>✦ 虚拟数据</span><span>模拟回答已标注</span><span>${persisted ? '仅保存在此浏览器，可随时重置' : '浏览器存储不可用，本次操作仅临时保留'}</span></div>
    <div id="notice" class="notice" role="status" aria-live="polite"></div>${renderers[id]()}${assistant()}
    <footer>这是产品核心流程的独立样品，部分能力经过简化。<br>不登录、不上传，不连接正式数据、模型、Codex 或 ima。</footer></main>`;
}
function ask(question) {
  const q = question.trim().slice(0, 200);
  if (!q) return;
  state.messages.push({ q, a: presetReply(id, q) }); state.messages = state.messages.slice(-6);
  commit(); render();
  document.querySelector('.messages').scrollTop = document.querySelector('.messages').scrollHeight;
  toast('已展示预设回答，没有调用模型。');
}
function move(dx, dy) { const result = moveMiner(state, dx, dy); if (result.changed) { commit(); render(); } toast(result.message); }
document.addEventListener('click', event => {
  const el = event.target.closest('button[data-action]');
  if (!el || el.disabled) return;
  const action = el.dataset.action;
  if (action === 'reset') {
    if (!window.confirm('重置当前样品？只会清除这个样品的试用记录，不会影响其他样品或正式数据。')) return;
    state = resetState(id, storage); persisted = true; render(); toast('当前样品已恢复初始状态。'); return;
  }
  if (action === 'prompt') { ask(config.prompts[Number(el.dataset.index)]); return; }
  if (id === 'xiaohongguo') {
    if (action === 'room') state.room = true;
    if (action === 'play' && state.room) { if (state.progress >= 180) state.progress = 0; state.playing = !state.playing; }
    if (action === 'scene') { state.scene = (state.scene + 1) % 3; state.progress = 0; state.playing = false; }
  }
  if (id === 'knowledge-desk' && action === 'article') state.selected = el.dataset.id;
  if (id === 'side-income-studio') {
    if (action === 'favorite') state.favorites = state.favorites.includes(el.dataset.id) ? state.favorites.filter(x => x !== el.dataset.id) : [...state.favorites, el.dataset.id];
    if (action === 'quote') { const o = OPPORTUNITIES.find(o => o.id === el.dataset.id); if (o) state.quote = { price: o.price, cost: o.cost, fee: 10, hours: o.hours }; }
    if (action === 'task') { const n = Number(el.dataset.index); state.tasks = state.tasks.includes(n) ? state.tasks.filter(x => x !== n) : [...state.tasks, n]; }
    if (action === 'trial' && state.trials.length < 12) { const r = quoteResult(state.quote); state.trials.push({ id: `trial-${state.trials.length}`, title: `试用项目 ${state.trials.length + 1}`, price: r.price, profit: r.profit, stage: '沟通中' }); }
    if (action === 'deliver') { const t = state.trials.find(t => t.id === el.dataset.id); if (t) t.stage = '已交付'; }
  }
  if (id === 'study-bloom') {
    if (action === 'node') state.node = Number(el.dataset.index);
    if (action === 'answer') answerQuiz(state, Number(el.dataset.index));
  }
  if (id === 'emberburrow') {
    if (action === 'move') move(Number(el.dataset.dx), Number(el.dataset.dy));
    if (action === 'cell') move(Number(el.dataset.x) - state.x, Number(el.dataset.y) - state.y);
    return;
  }
  commit(); render();
});
document.addEventListener('submit', event => {
  const form = event.target;
  if (!form.id || !root.contains(form)) return;
  event.preventDefault();
  const data = new FormData(form);
  if (form.id === 'chat-form') { ask(String(data.get('question') || '')); return; }
  if (form.id === 'search-form') { state.query = String(data.get('query') || '').trim().slice(0, 80); const found = [...ARTICLES, ...state.notes].find(a => `${a.title} ${a.body} ${a.tag}`.toLowerCase().includes(state.query.toLowerCase())); state.selected = found?.id || ''; }
  if (form.id === 'note-form') {
    const title = String(data.get('title') || '').trim(), body = String(data.get('body') || '').trim();
    if (!title || !body) { toast('请填好标题和内容。'); return; }
    if (state.notes.length >= 20) return;
    const note = { id: `note-${state.notes.length}`, title: title.slice(0, 60), body: body.slice(0, 1200), tag: '我的试用笔记', action: '把这份笔记整理为下一步行动。' };
    state.notes.push(note); state.selected = note.id; state.query = '';
  }
  if (form.id === 'quote-form') for (const key of Object.keys(state.quote)) state.quote[key] = Number(data.get(key));
  if (form.id === 'target-form') { const target = String(data.get('target') || '').trim(); if (!target) { toast('请填写一个学习目标。'); return; } state.target = target.slice(0, 120); }
  if (form.id === 'study-note-form') state.notes[state.node] = String(data.get('note') || '').slice(0, 1200);
  commit(); render(); toast(form.id === 'search-form' ? '搜索完成。' : persisted ? '已保存到本浏览器的样品空间。' : '浏览器禁止保存，本次操作仅在当前页面临时保留。');
});
document.addEventListener('change', event => {
  if (id === 'xiaohongguo' && event.target.id === 'progress' && state.room) { state.progress = Number(event.target.value); commit(); render(); toast('模拟跟随端已更新到相同进度。'); }
});
document.addEventListener('keydown', event => {
  if (id !== 'emberburrow' || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, textarea, select, [contenteditable]')) return;
  const direction = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] }[event.key];
  if (direction) { event.preventDefault(); move(...direction); }
});
if (id === 'xiaohongguo') window.setInterval(() => {
  if (!state.playing || document.hidden) return;
  state.progress = Math.min(180, state.progress + 1);
  if (state.progress >= 180) state.playing = false;
  commit();
  document.querySelectorAll('[data-clock], [data-peer-clock]').forEach(el => { el.textContent = time(state.progress); });
  document.querySelector('#progress').value = state.progress;
  document.querySelector('#play-toggle').textContent = state.playing ? '暂停' : '播放';
  document.querySelector('[data-owner-status]').textContent = state.playing ? '播放中' : '已暂停';
}, 1000);
render();
