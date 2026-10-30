// These samples have no service connection. All state and replies are local.
export const APP_IDS = ['xiaohongguo', 'knowledge-desk', 'side-income-studio', 'study-bloom', 'emberburrow'];
export const APPS = {
  xiaohongguo: { title: '小红果', label: '双人同步观影', icon: '🍎', accent: 'apple', intro: '一起按下播放，也一起停在喜欢的片刻。', prompts: ['怎么邀请朋友一起看？', '同步播放的规则是什么？'] },
  'knowledge-desk': { title: '藏宝库', label: '知识管理工作台', icon: '✦', accent: 'blue', intro: '让收藏过的知识，在需要时找得到、用得上。', prompts: ['怎样整理 RAG 资料？', '怎样把资料变成行动？'] },
  'side-income-studio': { title: '自有引力', label: '副业工作台', icon: '↗', accent: 'green', intro: '从一项小服务开始，看见投入，也看见下一步。', prompts: ['帮我拆解第一次试单', '怎样判断一份报价是否划算？'] },
  'study-bloom': { title: '貅知识', label: '个人学习花园', icon: '✿', accent: 'purple', intro: '从一个问题出发，长出自己的知识枝叶。', prompts: ['帮我规划学习路径', '怎么验证我真的学会了？'] },
  emberburrow: { title: '地底余烬', label: '探索挖矿', icon: '◆', accent: 'amber', intro: '再往地下走一步，或许就有新的发现。', prompts: ['我该怎么开始挖矿？', '采到的矿石有什么用？'] }
};
export const ARTICLES = [
  { id: 'rag', title: 'RAG 入门 · 从检索到回答', tag: 'AI 产品', body: '演示资料：RAG 先从资料库检索相关片段，再把片段作为上下文交给模型。学习时可以先画出导入、切分、检索、回答四步，并检查答案是否有依据。', action: '画一张四步流程图，标出每步的输入与输出。' },
  { id: 'acceptance', title: '需求验收 · 把描述变成检查点', tag: '产品方法', body: '演示资料：一条可验收的需求应该说明角色、前置条件、操作、成功反馈和异常处理。先用一个最小场景跑通，再补充边界条件。', action: '给登录功能写出一个成功场景和两个异常场景。' },
  { id: 'recall', title: '主动回忆 · 不看笔记讲一遍', tag: '学习方法', body: '演示资料：读完一段资料后合上页面，用自己的话复述。把说不清楚的地方记成问题，再回到原资料查证。', action: '用三句话解释一个新概念，然后列出仍不确定的部分。' }
];
export const OPPORTUNITIES = [
  { id: 'page', title: '小店介绍页', customer: '虚拟客户 A', price: 1800, cost: 120, hours: 12, detail: '交付一页介绍、服务列表和联系入口。' },
  { id: 'dashboard', title: '表格整理与看板', customer: '虚拟客户 B', price: 2600, cost: 160, hours: 18, detail: '整理示例表格，输出三项指标和一份说明。' },
  { id: 'sop', title: '内容工作流梳理', customer: '虚拟客户 C', price: 1200, cost: 80, hours: 8, detail: '梳理输入、步骤、检查点及交付模板。' }
];
export const NODES = [
  { title: '需求定义', detail: '先说清楚谁在什么场景遇到什么问题，再定义可验收的结果。', task: '给一个日常问题写出用户、场景和验收标准。', question: '哪一项最适合作为需求验收标准？', options: ['界面看起来很专业', '提交后显示成功反馈，列表出现新记录', '加入更多 AI 功能'], correct: 1 },
  { title: '流程与边界', detail: '明确起点、终点、角色与异常分支，让每一步都能继续。', task: '画一条主流程，再补两个失败分支。', question: '上传失败后，最需要补充什么？', options: ['只显示失败', '忽略失败继续', '解释原因并提供重试或取消'], correct: 2 },
  { title: 'AI 输入输出', detail: '给 AI 明确上下文、任务和输出结构，同时标记需要人工核对的内容。', task: '写一个输入与输出都有结构约束的提示词。', question: '哪一项有助于减少 AI 编造？', options: ['要求引用提供的资料，缺失时说明不知道', '要求永远给确定答案', '让回答越长越好'], correct: 0 },
  { title: '交互原型', detail: '用可操作的界面检查入口、反馈与状态，尽早发现流程断点。', task: '做出三个状态：初始、进行中和失败。', question: '原型验证最应该观察什么？', options: ['用了多少种颜色', '用户能否完成目标并理解反馈', '页面是否足够多'], correct: 1 },
  { title: '评测与验收', detail: '用固定用例比较结果，把通过与未通过的依据记录下来。', task: '准备三条正常用例和两条边界用例。', question: '如何判断一次迭代是否改善？', options: ['只看一次回答', '凭印象比较', '用相同测试集和指标比较前后结果'], correct: 2 },
  { title: '复盘与复用', detail: '把过程中的有效做法整理为模板，记录适用条件和局限。', task: '写下一个有效步骤、一个问题和下一次改进。', question: '什么更适合沉淀为可复用方法？', options: ['输入、步骤、检查点和适用边界', '仅保留最终截图', '只保留工具名称'], correct: 0 }
];

export const storageKey = id => {
  if (!APP_IDS.includes(id)) throw new Error('Unknown sample');
  return `pixiu-independent-sample:v1:${id}`;
};
export function newState(id) {
  storageKey(id);
  const common = { version: 1, app: id, messages: [] };
  if (id === 'xiaohongguo') return { ...common, room: false, playing: false, progress: 0, scene: 0 };
  if (id === 'knowledge-desk') return { ...common, query: '', selected: 'rag', notes: [] };
  if (id === 'side-income-studio') return { ...common, favorites: [], trials: [], tasks: [], quote: { price: 1800, cost: 120, fee: 10, hours: 12 } };
  if (id === 'study-bloom') return { ...common, target: '做出一个能验证用户需求的小作品', node: 0, notes: {}, answers: {} };
  return { ...common, x: 1, y: 1, dug: [], bag: { stone: 0, copper: 0, crystal: 0 }, steps: 0 };
}
const shortText = (value, limit = 1200) => typeof value === 'string' ? value.slice(0, limit) : '';
const numberIn = (value, low, high, fallback = low) => Number.isFinite(Number(value)) ? Math.min(high, Math.max(low, Number(value))) : fallback;
export function normalizeState(id, raw) {
  const s = newState(id);
  if (!raw || raw.version !== 1 || raw.app !== id) return s;
  s.messages = Array.isArray(raw.messages) ? raw.messages.filter(m => m && typeof m.q === 'string' && typeof m.a === 'string').slice(-6).map(m => ({ q: shortText(m.q, 200), a: shortText(m.a) })) : [];
  if (id === 'xiaohongguo') Object.assign(s, { room: raw.room === true, playing: false, progress: numberIn(raw.progress, 0, 180), scene: Math.round(numberIn(raw.scene, 0, 2)) });
  if (id === 'knowledge-desk') {
    s.query = shortText(raw.query, 80); s.selected = shortText(raw.selected, 80);
    s.notes = Array.isArray(raw.notes) ? raw.notes.slice(0, 20).filter(n => n && typeof n.title === 'string' && typeof n.body === 'string').map((n, i) => ({ id: `note-${i}`, title: shortText(n.title, 60), body: shortText(n.body), tag: '我的试用笔记', action: '把这份笔记整理为下一步行动。' })) : [];
  }
  if (id === 'side-income-studio') {
    s.favorites = Array.isArray(raw.favorites) ? raw.favorites.filter(x => OPPORTUNITIES.some(o => o.id === x)) : [];
    s.tasks = Array.isArray(raw.tasks) ? raw.tasks.filter(x => Number.isInteger(x) && x >= 0 && x < 4) : [];
    for (const k of Object.keys(s.quote)) s.quote[k] = numberIn(raw.quote?.[k], 0, k === 'fee' ? 100 : 1000000, s.quote[k]);
    s.trials = Array.isArray(raw.trials) ? raw.trials.slice(0, 12).filter(t => t && typeof t.title === 'string').map((t, i) => ({ id: `trial-${i}`, title: shortText(t.title, 60), price: numberIn(t.price, 0, 1000000), profit: numberIn(t.profit, -1000000, 1000000), stage: t.stage === '已交付' ? '已交付' : '沟通中' })) : [];
  }
  if (id === 'study-bloom') {
    s.target = shortText(raw.target, 120); s.node = Math.round(numberIn(raw.node, 0, NODES.length - 1));
    NODES.forEach((_, i) => { if (typeof raw.notes?.[i] === 'string') s.notes[i] = shortText(raw.notes[i]); if ([0, 1, 2].includes(raw.answers?.[i])) s.answers[i] = raw.answers[i]; });
  }
  if (id === 'emberburrow') {
    s.x = Math.round(numberIn(raw.x, 0, 6)); s.y = Math.round(numberIn(raw.y, 0, 6));
    s.dug = Array.isArray(raw.dug) ? [...new Set(raw.dug.filter(x => /^([0-6]),([0-6])$/.test(x)))].slice(0, 49) : [];
    for (const k of Object.keys(s.bag)) s.bag[k] = Math.floor(numberIn(raw.bag?.[k], 0, 49));
    s.steps = Math.floor(numberIn(raw.steps, 0, 1000000));
  }
  return s;
}
export function loadState(id, storage) {
  try { return normalizeState(id, JSON.parse(storage.getItem(storageKey(id)))); } catch { return newState(id); }
}
export function saveState(id, state, storage) {
  try { storage.setItem(storageKey(id), JSON.stringify(normalizeState(id, state))); return true; } catch { return false; }
}
export function resetState(id, storage) {
  try { storage.removeItem(storageKey(id)); } catch { /* A disabled store still permits an in-memory reset. */ }
  return newState(id);
}
export function quoteResult(quote) {
  const price = numberIn(quote.price, 0, 1000000), cost = numberIn(quote.cost, 0, 1000000), fee = numberIn(quote.fee, 0, 100);
  const hours = numberIn(quote.hours, 0, 1000000), profit = Math.round((price - cost - price * fee / 100) * 100) / 100;
  return { price, cost, feeAmount: Math.round(price * fee) / 100, profit, hourly: hours > 0 ? Math.round(profit / hours * 100) / 100 : null };
}
export const cellType = (x, y) => {
  if ((x === 1 && y === 1) || (x === 1 && y === 0) || (x === 0 && y === 1)) return 'open';
  if ((x * 7 + y * 3) % 13 === 0) return 'crystal';
  if ((x * 3 + y) % 4 === 0) return 'copper';
  return 'stone';
};
export function moveMiner(state, dx, dy) {
  if (Math.abs(dx) + Math.abs(dy) !== 1) return { changed: false, message: '请选择相邻的一格。' };
  const x = state.x + dx, y = state.y + dy;
  if (x < 0 || x > 6 || y < 0 || y > 6) return { changed: false, message: '到达地图边缘，换一个方向继续探索。' };
  const key = `${x},${y}`, type = cellType(x, y);
  let message = '走入已经探索过的通道。';
  if (type !== 'open' && !state.dug.includes(key)) { state.dug.push(key); state.bag[type] += 1; message = `挖到${{ stone: '石块', copper: '铜矿', crystal: '晶石' }[type]}，已收入背包。`; }
  state.x = x; state.y = y; state.steps += 1;
  return { changed: true, message };
}
export function answerQuiz(state, index) {
  if (![0, 1, 2].includes(index)) return null;
  state.answers[state.node] = index;
  return index === NODES[state.node].correct;
}
export function presetReply(id, question) {
  const q = String(question).trim();
  const replies = {
    xiaohongguo: /邀请|朋友|加入/.test(q) ? '示例流程是房主创建房间，把房间入口分享给朋友。当前样品只有本地模拟对端；你可以创建房间、播放、暂停和拖动进度，观察两侧状态如何对应。不会创建真实房间或发送邀请。' : /同步|播放|规则/.test(q) ? '房主控制播放、暂停和进度，跟随端接收同一状态。你看到的两个进度来自本页同一份演示状态，用于说明交互规则，并没有连接第二个人。' : null,
    'knowledge-desk': /RAG|检索/i.test(q) ? '可以先建立“导入、切分、检索、回答”四类笔记，给每份资料写一句用途。用左侧搜索 RAG，打开演示资料，再把自己的理解存成试用笔记。这里的内容和回答都是预置样例。' : /行动|整理|资料|知识/.test(q) ? '把资料整理成三项：它回答什么问题、哪些结论需要核实、下一步能做什么。试着添加一条笔记，再通过搜索找回来。这些操作只改变当前浏览器里的样品。' : null,
    'side-income-studio': /试单|第一次|拆解/.test(q) ? '样例步骤：先选一个边界清楚的小服务，写明交付物和修改次数；再估算工时与成本；最后从试算结果生成一份虚拟试单。不要把报价当成实际收入。样品不会联系客户或提交订单。' : /报价|利润|划算|成本/.test(q) ? '样例计算：报价 1800 元，直接成本 120 元，平台费率 10%，预计工时 12 小时，得到预计净额 1500 元、每小时 125 元。你可以修改右侧数字查看变化；这是简化估算，不含税费等其他成本。' : null,
    'study-bloom': /路径|规划|学习/.test(q) ? '示例路线：需求定义 → 流程与边界 → AI 输入输出 → 交互原型 → 评测与验收 → 复盘与复用。每一步都留下一个小产物，再用测验和实际操作检查理解；这份路线是预设样例，没有根据输入调用 AI 生成。' : /验证|学会|测验/.test(q) ? '先不用笔记复述概念，再做一个小任务，最后用验收标准检查结果。答对一道参考题只说明这一题通过，不等于掌握全部能力。你可以在样品里记笔记、答题和查看当前进度。' : null,
    emberburrow: /开始|怎么|挖矿/.test(q) ? '用方向按钮、方向键或 WASD 走向相邻格子，矿石会自动收入背包。点击相邻格也可以挖掘。这个独立小地图只保留在你的浏览器里，不会改动正式游戏存档。' : /矿石|背包|用/.test(q) ? '这个样品用于体验“移动—挖掘—拾取—背包”循环。石块、铜矿和晶石会单独计数；暂不提供合成或交易，重置后恢复初始地图。' : null
  };
  return replies[id] || '这个问题没有配置示例回答。请点击上方的示例问题体验；当前样品不调用真实模型，也不会把你输入的内容发送出去。';
}
