const SCENES = [
  { id: 'idea', icon: '◎', name: '讲清一个想法', short: '观点更清晰', structure: 'PREP', description: '观点 → 原因 → 例子/证据 → 总结', stages: ['观点', '原因', '例子/证据', '总结'], hint: '先说结论', subtext: '把你的判断先放出来，让听众知道你要说什么。', hints: ['先说结论', '补一个原因', '来个例子或证据', '用一句话收束'] },
  { id: 'interview', icon: '◒', name: '面试回答', short: '让经历有说服力', structure: 'STAR', description: '情境/任务 → 行动 → 结果 → 复盘', stages: ['情境/任务', '行动', '结果', '复盘'], hint: '先交代情境或任务', subtext: '不必完美，先把事情发生的背景说出来。', hints: ['先交代情境或任务', '说清你做了什么', '补充结果和数据', '说说复盘和经验'] },
  { id: 'work', icon: '▤', name: '工作汇报 / 述职', short: '结论先行', structure: '汇报结构', description: '结论 → 数据/原因 → 风险/案例 → 行动', stages: ['结论', '数据/原因', '风险/案例', '行动'], hint: '先说结论', subtext: '先告诉听众现在最重要的进展是什么。', hints: ['先说结论', '补数据或原因', '说明风险或案例', '明确下一步行动'] },
  { id: 'meeting', icon: '⌁', name: '会议发言', short: '推动一个决定', structure: '决策结构', description: '回应/判断 → 理由/影响 → 方案/依据 → 行动', stages: ['回应/判断', '理由/影响', '方案/依据', '行动'], hint: '先给出判断', subtext: '先回应眼前的问题，再展开你的理由。', hints: ['先给出判断', '说明理由和影响', '提出方案或依据', '明确决策和行动'] },
  { id: 'persuasion', icon: '◇', name: '说服沟通 / 提案', short: '让主张被听见', structure: '说服结构', description: '问题/主张 → 影响/原因 → 方案/证据 → 行动', stages: ['问题/主张', '影响/原因', '方案/证据', '行动'], hint: '先说问题或主张', subtext: '先让对方知道，你希望改变什么。', hints: ['先说问题或主张', '说明影响和原因', '补方案或证据', '说清行动和收益'] },
  { id: 'improv', icon: '✦', name: '即兴表达', short: '快速组织回答', structure: '即兴结构', description: '明确回答 → 两个理由 → 具体例子 → 简短收尾', stages: ['明确回答', '两个理由', '具体例子', '收尾'], hint: '先明确回答', subtext: '先回答，再展开。不要让听众猜你的立场。', hints: ['先明确回答', '补充两个理由', '给一个具体例子', '简短收尾'] }
];

const SCENE_PROMPTS = {
  idea: ['我为什么支持这个方案？', '一个值得坚持的工作习惯', '如何向新人解释一个复杂概念'],
  interview: ['讲一次你解决困难的经历', '你如何推动一次跨部门协作？', '一次没有达到预期的项目复盘'],
  work: ['本周项目进展与下一步计划', '一个需要争取资源的工作事项', '这季度最值得汇报的成果'],
  meeting: ['我建议今天决定什么？', '如何回应一个会议中的分歧？', '一个需要团队共识的问题'],
  persuasion: ['为什么现在应该改变这个流程？', '如何说服团队尝试一个新工具？', '一次需要争取支持的提案'],
  improv: ['你怎么看待远程办公？', '最近学到的一个有用方法', '如果重新选择一次，你会怎么做？']
};

const AI_QUESTION_BANK = {
  idea: ['你最近想推动的一个想法是什么？为什么值得现在开始？', '如果只能用一分钟讲清一个复杂概念，你会先说什么？', '一个你坚持的判断，最有力的理由和例子分别是什么？'],
  interview: ['讲一次你解决困难的经历，你具体做了什么？', '你如何推动一次跨部门协作？最后带来了什么结果？', '说说一次没有达到预期的项目复盘，你后来改变了什么？'],
  work: ['请汇报一个项目的当前进展、主要风险和下一步计划。', '如果要争取一项资源，你会如何用结论和数据说明必要性？', '这季度最值得汇报的成果是什么？它带来了什么具体变化？'],
  meeting: ['你建议今天的会议做出什么决定？为什么？', '面对一个会议中的分歧，你会如何回应并推动共识？', '一个需要团队共识的问题，你会怎样提出方案并明确行动？'],
  persuasion: ['为什么现在应该改变这个流程？请说清影响和收益。', '如何说服团队尝试一个新工具？你的证据和行动是什么？', '一次需要争取支持的提案，你会如何让对方愿意行动？'],
  improv: ['你怎么看待远程办公？请先给出明确判断。', '最近学到的一个有用方法是什么？为什么值得推荐？', '如果重新选择一次，你会怎么做？请给出两个理由和一个例子。']
};

const DURATIONS = [
  { value: 60, label: '1 分钟' },
  { value: 120, label: '2 分钟' },
  { value: 180, label: '3 分钟' },
  { value: 300, label: '5 分钟' }
];

const HISTORY_KEY = 'expression-practice-history';

const state = {
  sceneId: 'interview',
  duration: 180,
  topic: '',
  stageIndex: 0,
  isPaused: false,
  timeReached: false,
  seconds: 0,
  words: 0,
  fillers: 0,
  pauses: 0,
  transcript: [],
  attempt: 1,
  firstAttempt: null,
  followupIndex: 0,
  followupComplete: false,
  aiQuestionIndex: 0
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function currentScene() {
  return SCENES.find(scene => scene.id === state.sceneId) || SCENES[1];
}

function renderSceneOptions() {
  $('#scene-grid').innerHTML = SCENES.map(scene => `
    <button class="scene-option${scene.id === state.sceneId ? ' selected' : ''}" type="button" data-scene="${scene.id}" role="listitem" aria-pressed="${scene.id === state.sceneId}">
      <span class="scene-icon">${scene.icon}</span>
      <span class="scene-name">${scene.name}</span>
      <span class="scene-short">${scene.short}</span>
    </button>`).join('');
  $$('#scene-grid [data-scene]').forEach(button => button.addEventListener('click', () => {
    state.sceneId = button.dataset.scene;
    renderSceneOptions();
    renderStructure();
  }));
}

function renderDurationOptions() {
  $('#duration-options').innerHTML = DURATIONS.map(item => `
    <button class="duration-option${item.value === state.duration ? ' selected' : ''}" type="button" data-duration="${item.value}" aria-pressed="${item.value === state.duration}">${item.label}</button>`).join('');
  $$('#duration-options [data-duration]').forEach(button => button.addEventListener('click', () => {
    state.duration = Number(button.dataset.duration);
    renderDurationOptions();
  }));
}

function renderStructureOptions() {
  const select = $('#structure-select');
  select.innerHTML = SCENES.map(scene => `
    <option value="${scene.id}">${escapeHtml(scene.name)}：${escapeHtml(scene.structure)} · ${escapeHtml(scene.description)}</option>`).join('');
  select.value = state.sceneId;
}

function renderStructure() {
  const scene = currentScene();
  renderStructureOptions();
  $('#structure-name').textContent = scene.structure;
  $('#structure-description').textContent = scene.description;
  $('#workspace-structure').textContent = state.topic ? scene.structure : '等待开始';
  renderPromptSuggestions();
  renderAiQuestion();
  renderWorkspaceFeedback();
}

function renderAiQuestion() {
  const scene = currentScene();
  const questions = AI_QUESTION_BANK[scene.id] || [];
  const question = questions[state.aiQuestionIndex % questions.length] || '请分享一个你最近想讲清楚的问题。';
  $('#ai-question-kicker').textContent = `根据「${scene.name}」生成 · ${scene.structure}`;
  $('#ai-question').textContent = question;
}

function generateAiQuestion() {
  const questions = AI_QUESTION_BANK[currentScene().id] || [];
  state.aiQuestionIndex = (state.aiQuestionIndex + 1) % questions.length;
  renderAiQuestion();
  showToast('已生成一道新的练习题');
}

function useAiQuestion() {
  const questions = AI_QUESTION_BANK[currentScene().id] || [];
  const question = questions[state.aiQuestionIndex % questions.length];
  $('#topic-input').value = question;
  updateTopicCount();
  setView('setup');
  $('#topic-input').focus();
  showToast('已将问题带入本次练习');
}

function renderPromptSuggestions() {
  const prompts = SCENE_PROMPTS[state.sceneId] || [];
  $('#prompt-suggestions').innerHTML = prompts.map(prompt => `<button class="prompt-suggestion" type="button" data-prompt="${escapeHtml(prompt)}" role="listitem">${escapeHtml(prompt)} <span>↗</span></button>`).join('');
  $$('#prompt-suggestions [data-prompt]').forEach(button => button.addEventListener('click', () => {
    $('#topic-input').value = button.dataset.prompt;
    updateTopicCount();
    $('#topic-input').focus();
  }));
}

function renderPracticeSteps(target = state.stageIndex) {
  const scene = currentScene();
  $('#practice-steps').innerHTML = scene.stages.map((label, index) => `
    <div class="practice-step ${index < target ? 'done' : index === target ? 'current' : ''}">
      <span class="step-dot"></span><span>${label}</span>
    </div>`).join('');
}

function updateTopicCount() {
  const value = $('#topic-input').value;
  state.topic = value.trim();
  $('#topic-count').textContent = `${value.length} / 80`;
  $('#start-button').disabled = !state.topic;
  $('#workspace-structure').textContent = state.topic ? currentScene().structure : '等待开始';
  updateWorkspaceStats();
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateTimeProgress() {
  const progress = Math.min(100, Math.round((state.seconds / state.duration) * 100));
  $('#time-progress-fill').style.width = `${progress}%`;
}

function updateWorkspaceStats() {
  $('#workspace-vague-count').textContent = '0';
  $('#workspace-filler-count').textContent = String(state.fillers);
  $('#workspace-hesitation-count').textContent = '0';
  $('#workspace-density').textContent = state.words ? `${Math.max(72, 96 - state.fillers * 4)}%` : '--';
  $('#workspace-speed').textContent = state.seconds ? `${Math.round((state.words / state.seconds) * 60)}` : '--';
  $('#workspace-pause-count').textContent = String(state.pauses);
  const scene = currentScene();
  const completed = Math.min(state.stageIndex, scene.stages.length);
  const nextStage = scene.stages[completed] || '复盘';
  $('#workspace-next-step').textContent = state.topic ? (completed >= scene.stages.length ? '可结束并复盘' : `补充${nextStage}`) : '等待开始';
  renderWorkspaceFeedback();
}

function renderWorkspaceFeedback() {
  const container = $('#workspace-feedback');
  const practiceContainer = $('#practice-live-feedback');
  if (!container) return;
  const status = $('#workspace-feedback-status');
  const scene = currentScene();
  const completed = Math.min(state.stageIndex, scene.stages.length);
  if (!state.topic) {
    status.textContent = '等待开始';
    const emptyMarkup = '<div class="feedback-empty"><strong>还没有开始表达</strong><br />先选择一个问题或主题，开始后这里会实时提示下一步。</div>';
    container.innerHTML = emptyMarkup;
    if (practiceContainer) practiceContainer.innerHTML = '';
    return;
  }
  if (!state.transcript.length) {
    status.textContent = '待开始';
    const readyMarkup = `<div class="feedback-empty"><strong>主题已准备好</strong><br />点击“开始表达”，先完成「${escapeHtml(scene.stages[0])}」。</div>`;
    container.innerHTML = readyMarkup;
    if (practiceContainer) practiceContainer.innerHTML = '<small>开始表达后，这里会同步更新。</small>';
    return;
  }
  status.textContent = '分析中';
  const feedbackItems = [
    { label: '结构进度', value: `${completed} / ${scene.stages.length} 段`, note: completed >= scene.stages.length ? '结构已完整' : `下一步：${scene.stages[completed]}` },
    { label: '表达密度', value: `${Math.max(72, 96 - state.fillers * 4)}%`, note: state.fillers ? '少用“然后、就是”等填充词' : '目前表达比较集中' },
    { label: '节奏提醒', value: `${state.pauses} 次停顿`, note: state.pauses >= 2 ? '停顿节奏比较稳定' : '在结构切换处留半秒' }
  ];
  const feedbackMarkup = feedbackItems.map(item => `<div class="feedback-item"><div><span>${item.label}</span><strong>${item.value}</strong></div><small>${item.note}</small></div>`).join('');
  container.innerHTML = feedbackMarkup;
  if (practiceContainer) practiceContainer.innerHTML = `<div class="practice-feedback-title">实时分析</div>${feedbackMarkup}`;
}

function readHistory() {
  try {
    const records = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(records) ? records : [];
  } catch (error) {
    return [];
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function saveHistory(record) {
  try {
    const records = [record, ...readHistory()].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
  } catch (error) {
    showToast('本地记录暂时无法保存');
  }
}

function renderTrainingPlan(records, recentChange) {
  const record = records[0];
  const scene = SCENES.find(item => item.id === record.sceneId) || SCENES.find(item => item.name === record.scene) || currentScene();
  $('#plan-title').textContent = recentChange < 0 ? `稳住「${scene.name}」的表达结构` : `继续练习「${scene.name}」`;
  $('#plan-description').textContent = recentChange < 0
    ? '最近一次分数有回落，先沿用熟悉的主题，把结论和行动完整说完。'
    : `沿用“${record.topic}”，下一次重点练习${record.focus || '把结果说具体'}。`;
  $('#training-plan').classList.remove('is-hidden');
}

function renderHistory() {
  const records = readHistory();
  $('#history-count').textContent = `${records.length} 次练习`;
  if (!records.length) {
    $('#progress-summary').classList.add('is-hidden');
    $('#progress-panel').classList.add('is-hidden');
    $('#training-plan').classList.add('is-hidden');
    $('#history-list').innerHTML = '<div class="history-empty"><span>✦</span><h2>还没有训练记录</h2><p>完成第一次练习后，这里会留下你的表达轨迹。</p><button class="primary-button" type="button" data-action="back-to-setup">开始第一次练习 <span>→</span></button></div>';
    $('#history-list').querySelector('[data-action="back-to-setup"]').addEventListener('click', () => setView('setup'));
    return;
  }
  const scoredRecords = records.filter(record => Number.isFinite(Number(record.score)));
  if (!scoredRecords.length) {
    $('#progress-summary').classList.add('is-hidden');
    $('#progress-panel').classList.add('is-hidden');
    $('#training-plan').classList.add('is-hidden');
  }
  const scores = scoredRecords.map(record => Number(record.score));
  if (!scores.length) {
    $('#history-list').innerHTML = records.map(record => `
      <article class="history-item">
        <div class="history-item-main"><span class="history-date">${escapeHtml(record.date)}</span><h2>${escapeHtml(record.topic)}</h2><p>${escapeHtml(record.scene)} · ${escapeHtml(record.focus)}</p></div>
        <div class="history-item-score"><strong>—</strong><span>/ 100</span><small>暂无分数</small></div>
      </article>`).join('');
    return;
  }
  const average = Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
  const best = Math.max(...scores);
  const recentChange = scores.length > 1 ? scores[0] - scores[1] : 0;
  $('#summary-sessions').textContent = String(records.length);
  $('#summary-average').textContent = String(average);
  $('#summary-best').textContent = String(best);
  $('#summary-change').textContent = recentChange > 0 ? `+${recentChange}` : String(recentChange);
  $('#progress-summary').classList.remove('is-hidden');
  const trendRecords = scoredRecords.slice(0, 6).reverse();
  $('#progress-chart').innerHTML = trendRecords.map((record, index) => {
    const score = Math.max(0, Math.min(100, Number(record.score) || 0));
    return `<div class="progress-bar-column"><div class="progress-bar-value">${score}</div><div class="progress-bar-track"><i style="height: ${Math.max(score, 8)}%"></i></div><small>第 ${records.length - trendRecords.length + index + 1} 次</small></div>`;
  }).join('');
  $('#progress-caption').textContent = recentChange > 0 ? `最近一次比上一次高 ${recentChange} 分，继续保留这次的开场方式。` : recentChange < 0 ? `最近一次比上一次低 ${Math.abs(recentChange)} 分，先找回最稳定的表达结构。` : '最近两次分数持平，可以开始关注表达的具体程度。';
  $('#progress-panel').classList.remove('is-hidden');
  renderTrainingPlan(records, recentChange);
  $('#history-list').innerHTML = records.map(record => `
    <article class="history-item">
      <div class="history-item-main">
        <span class="history-date">${escapeHtml(record.date)}</span>
        <h2>${escapeHtml(record.topic)}</h2>
        <p>${escapeHtml(record.scene)} · ${escapeHtml(record.focus)}</p>
      </div>
      <div class="history-item-score"><strong>${escapeHtml(record.score)}</strong><span>/ 100</span><small>${escapeHtml(record.words)} 字 · ${escapeHtml(record.duration)}</small></div>
    </article>`).join('');
}

function renderLogicChain(scene, completed) {
  $('#logic-chain').innerHTML = scene.stages.map((label, index) => `
    <div class="logic-node ${index < completed ? 'done' : index === completed ? 'current' : ''}">
      <span class="logic-index">0${index + 1}</span>
      <strong>${label}</strong>
      <small>${index < completed ? '已覆盖' : index === completed ? '下一步' : '待补充'}</small>
    </div>`).join('<span class="logic-connector" aria-hidden="true">→</span>');
  const conclusionTime = Math.min(Math.max(state.seconds, 8), 15);
  $('#report-conclusion-time').textContent = formatTime(conclusionTime);
  $('#report-evidence-status').textContent = completed >= Math.min(3, scene.stages.length) ? '已出现' : '待补充';
  $('#report-focus').textContent = completed >= scene.stages.length ? '让结论更有力' : `补充${scene.stages[completed] || '具体结果'}`;
}

function renderRhythm(scene, completed) {
  const duration = Math.max(state.seconds, 42);
  const words = state.words || 86;
  const speed = Math.round((words / duration) * 60);
  const pausePattern = state.pauses >= 3 ? '停顿偏多' : state.pauses === 2 ? '节奏稳定' : '可再停顿';
  const emphasis = completed >= scene.stages.length ? '强调结果' : `强调${scene.stages[completed] || '结论'}`;
  const meter = Math.max(18, Math.min(100, Math.round((speed / 180) * 100)));
  $('#report-speed').textContent = String(speed);
  $('#report-pause-pattern').textContent = pausePattern;
  $('#report-emphasis').textContent = emphasis;
  $('#report-rhythm-meter').style.width = `${meter}%`;
  $('#report-rhythm-caption').textContent = speed > 155
    ? '语速略快，下一次在结构切换处多留半秒，让重点更容易被听见。'
    : state.pauses < 2
      ? '可以在结论和证据之间增加一次短停顿，让听众跟上你的思路。'
      : '当前节奏比较稳定，下一次继续把停顿留给真正重要的转折。';
}

function renderSentenceAnalysis(scene) {
  const lines = state.transcript;
  if (!lines.length) {
    $('#sentence-analysis').innerHTML = '<p class="sentence-empty">本次没有产生可分析的字幕句子，下一次可以先模拟说一句。</p>';
    return;
  }
  $('#sentence-analysis').innerHTML = lines.map((line, index) => {
    const stage = scene.stages[Math.min(index, scene.stages.length - 1)];
    const status = index < state.stageIndex ? '已覆盖' : '待确认';
    return `<div class="sentence-row"><span class="sentence-number">0${index + 1}</span><div class="sentence-copy"><p>${escapeHtml(line)}</p><small>${escapeHtml(stage)} · ${status}</small></div><span class="sentence-arrow">↗</span></div>`;
  }).join('');
}

function setView(view) {
  ['setup', 'practice', 'report', 'history'].forEach(name => $(`#${name}-view`).classList.toggle('is-hidden', name !== view));
  $('#workspace-view').classList.toggle('is-hidden', !['setup', 'workspace'].includes(view));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetSession() {
  state.stageIndex = 0;
  state.isPaused = false;
  state.timeReached = false;
  state.seconds = 0;
  state.words = 0;
  state.fillers = 0;
  state.pauses = 0;
  state.transcript = [];
  $('#timer').textContent = '00:00';
  $('#workspace-timer').textContent = '00:00';
  $('#timer').classList.remove('time-reached');
  updateTimeProgress();
  $('#recording-label').textContent = '表达中';
  $('#transcript').innerHTML = '<p class="transcript-placeholder">准备好后，按下开始表达</p>';
  $('#workspace-transcript').innerHTML = '<p>点击下方按钮开始表达</p>';
  $('#begin-expression-button').textContent = '🎙️ 开始表达';
  $('#begin-expression-button').disabled = false;
  $('#word-count').textContent = '0 字';
  $('#pause-count').textContent = '0 次停顿';
  $('#density-stat').textContent = '—';
  $('#filler-stat').textContent = '0';
  updateWorkspaceStats();
}

let timerId;
function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    if (!state.isPaused) {
      state.seconds += 1;
      if (state.seconds >= state.duration) {
        state.seconds = state.duration;
        state.timeReached = true;
        state.isPaused = true;
        $('#recording-label').textContent = '时间到';
        $('#timer').classList.add('time-reached');
        $('#pause-button').innerHTML = '<span>✓</span> 已到时长';
        showToast('目标时长已到，可以结束练习查看报告');
        clearInterval(timerId);
      }
      $('#timer').textContent = formatTime(state.seconds);
      $('#workspace-timer').textContent = formatTime(state.seconds);
      updateTimeProgress();
    }
  }, 1000);
}

function startPractice() {
  if (!state.topic) return showToast('先给这次练习写一个主题');
  state.attempt = 1;
  state.firstAttempt = null;
  resetSession();
  const scene = currentScene();
  $('#practice-scene').textContent = scene.name;
  $('#practice-topic').textContent = state.topic;
  $('#target-duration').textContent = formatTime(state.duration);
  $('#coach-hint').textContent = scene.hint;
  $('#coach-subtext').textContent = scene.subtext;
  renderPracticeSteps();
  setView('practice');
  startTimer();
  showToast('练习开始，跟着下一步表达即可');
}

const MOCK_LINES_BY_SCENE = {
  idea: [
    '我认为这个方案值得尝试，因为它能先解决当前最影响效率的问题。',
    '第一个原因是执行成本可控，团队不需要一次性改变所有流程。',
    '比如我们可以先在一个小项目里试运行，再根据结果调整。',
    '所以我的建议是先做小范围验证，再决定是否全面推进。'
  ],
  interview: [
    '当时项目需要在两周内完成，这是整个团队面对的关键任务。',
    '我先把任务拆成三个阶段，并主动协调了产品和研发同学。',
    '最后我们提前两天上线，交付周期缩短了约百分之二十。',
    '这次让我意识到，越复杂的项目越需要先把目标说清楚。'
  ],
  work: [
    '这周项目整体按计划推进，当前最重要的结果是核心流程已经上线。',
    '上线前我们完成了三轮验证，主要问题集中在协作交接和数据口径。',
    '经过调整，处理时间从两天缩短到一天，相关反馈也明显减少。',
    '下一步我会继续跟踪一周数据，再决定是否扩展到其他团队。'
  ],
  meeting: [
    '针对刚才的问题，我建议今天先确定一个试点范围。',
    '这样既能回应当前的交付压力，也不会一次性引入太大风险。',
    '我们可以用一周时间验证结果，再带着数据回来讨论。',
    '如果大家同意，今天就明确负责人和下一个检查时间。'
  ],
  persuasion: [
    '我建议我们现在调整这个流程，因为继续沿用会持续增加沟通成本。',
    '目前最明显的影响是重复确认变多，关键任务反而没有更快完成。',
    '可以先选择一个团队试用新流程，用实际结果验证投入是否值得。',
    '如果试点有效，我们再把经验整理成方案，逐步推广到其他团队。'
  ],
  improv: [
    '我会选择支持这个做法，因为它能让我们更快得到真实反馈。',
    '第一个理由是成本较低，第二个理由是调整空间更大。',
    '比如先让一个小团队试用，就能在扩大之前发现问题。',
    '所以我的回答是：先小范围尝试，再用结果决定下一步。'
  ]
};

const FOLLOWUP_QUESTIONS = {
  idea: [
    { type: 'AI 追问 · 模拟', question: '如果只能保留一个理由，哪个理由最能支撑你的观点？', response: '先挑一个最有解释力的理由，不要把所有背景都重新讲一遍。' },
    { type: 'AI 追问 · 模拟', question: '这个观点在什么情况下可能不成立？', response: '承认边界，再说明你为什么仍然坚持当前判断。' },
    { type: '反驳训练 · 模拟', question: '有人说“这只是你的个人偏好”，你会怎么回应？', response: '用一个具体例子或可观察的结果，把偏好翻译成依据。' }
  ],
  interview: [
    { type: 'AI 追问 · 模拟', question: '如果再来一次，你会在哪个行动上做得更好？', response: '先说一个可执行的改进动作，再说明它会带来什么变化。' },
    { type: 'AI 追问 · 模拟', question: '这个结果中，哪一部分最能证明你的贡献？', response: '把你的动作和结果一一对应，避免只说“我们完成了”。' },
    { type: '反驳训练 · 模拟', question: '如果面试官认为这只是团队功劳，你会怎么回应？', response: '先承认协作，再清楚说明你负责的关键环节。' }
  ],
  work: [
    { type: 'AI 追问 · 模拟', question: '这个结果对团队或业务带来的最大变化是什么？', response: '补充一个结果指标，让听众知道这件事为什么重要。' },
    { type: 'AI 追问 · 模拟', question: '如果资源减少一半，你会优先保留哪件事？', response: '用优先级回应，而不是重新罗列全部工作。' },
    { type: '反驳训练 · 模拟', question: '有人说“这个进展还不足以说明问题”，你怎么回应？', response: '承认现阶段边界，再给出下一步验证计划。' }
  ],
  meeting: [
    { type: 'AI 追问 · 模拟', question: '如果今天只能做一个决定，你建议现在定下什么？', response: '把建议说成一个明确动作，并点出不决定的成本。' },
    { type: 'AI 追问 · 模拟', question: '这个方案会影响谁，最需要提前同步谁？', response: '说清影响对象和同步动作，推动讨论进入执行。' },
    { type: '反驳训练 · 模拟', question: '有人不同意你的判断，你会先回应哪一个担忧？', response: '先复述对方的担忧，再用事实和方案回应。' }
  ],
  persuasion: [
    { type: 'AI 追问 · 模拟', question: '对方最可能担心什么，你准备如何回应？', response: '先接住对方的顾虑，再说明你的方案如何降低风险。' },
    { type: 'AI 追问 · 模拟', question: '如果对方暂时不接受，你希望他先做哪一步？', response: '把完整主张拆成一个低成本、可验证的下一步。' },
    { type: '反驳训练 · 模拟', question: '对方说“现在没有必要改变”，你会怎么回应？', response: '用变化的成本或错过的机会，回应“为什么是现在”。' }
  ],
  improv: [
    { type: 'AI 追问 · 模拟', question: '如果听众只记住一句话，你希望是哪一句？', response: '重新说一遍核心回答，让它成为这次表达的锚点。' },
    { type: 'AI 追问 · 模拟', question: '请用一个例子证明刚才的判断。', response: '选择最短、最具体的例子，不要再扩展新的分支。' },
    { type: '反驳训练 · 模拟', question: '如果有人立即提出相反观点，你先怎么接？', response: '先确认分歧点，再用一句理由稳住自己的立场。' }
  ]
};

function simulateSentence() {
  if (state.isPaused) return showToast('当前已暂停，继续后再说一句');
  const scene = currentScene();
  const lines = MOCK_LINES_BY_SCENE[scene.id] || MOCK_LINES_BY_SCENE.interview;
  const line = lines[Math.min(state.stageIndex, lines.length - 1)];
  const transcript = $('#transcript');
  const placeholder = transcript.querySelector('.transcript-placeholder');
  if (placeholder) placeholder.remove();
  $$('#transcript .active-line').forEach(lineElement => lineElement.classList.replace('active-line', 'old-line'));
  const lineElement = document.createElement('p');
  lineElement.className = 'active-line';
  lineElement.textContent = line;
  transcript.appendChild(lineElement);
  const workspaceTranscript = $('#workspace-transcript');
  if (workspaceTranscript) {
    workspaceTranscript.innerHTML = `<p>${escapeHtml(line)}</p>`;
  }
  state.transcript.push(line);
  state.words += line.replace(/[^\u4e00-\u9fff\w]/g, '').length;
  state.fillers += state.stageIndex === 1 ? 1 : 0;
  state.pauses += 1;
  state.stageIndex = Math.min(state.stageIndex + 1, scene.stages.length);
  $('#word-count').textContent = `${state.words} 字`;
  $('#pause-count').textContent = `${state.pauses} 次停顿`;
  $('#density-stat').textContent = `${Math.max(72, 96 - state.fillers * 4)}%`;
  $('#filler-stat').textContent = String(state.fillers);
  updateWorkspaceStats();
  renderPracticeSteps();
  const nextIndex = Math.min(state.stageIndex, scene.stages.length - 1);
  const hints = scene.hints || [];
  $('#coach-hint').textContent = state.stageIndex >= scene.stages.length ? '可以收尾了' : (hints[nextIndex] || scene.hint);
  $('#coach-subtext').textContent = state.stageIndex >= scene.stages.length ? '把最重要的一句话再收束一下。' : '继续往前说，下一步会在这里提醒你。';
  $('#begin-expression-button').textContent = state.stageIndex >= scene.stages.length ? '✓ 表达结构已完成' : '🎙️ 继续表达';
  $('#begin-expression-button').disabled = state.stageIndex >= scene.stages.length;
}

function finishPractice() {
  clearInterval(timerId);
  const scene = currentScene();
  const completed = Math.max(1, state.stageIndex);
  const score = Math.round((completed / scene.stages.length) * 100);
  if (state.attempt === 1) {
    state.firstAttempt = { score, words: state.words || 86, fillers: state.fillers || 2, completed };
  }
  $('#report-context').textContent = `${scene.name} · ${state.topic}`;
  $('#score-number').textContent = String(score);
  $('#score-meter-fill').style.width = `${score}%`;
  $('#score-caption').textContent = score >= 100 ? '四段结构完整，可以继续练习表达的锋利度。' : '已经有清晰骨架，继续把下一段说具体。';
  $('#completed-count').textContent = `${completed} / ${scene.stages.length} 已完成`;
  $('#report-stages').innerHTML = scene.stages.map((label, index) => `<div class="report-stage ${index < completed ? 'done' : ''}"><span class="check">${index < completed ? '✓' : '○'}</span><span>${label}</span></div>`).join('');
  renderLogicChain(scene, completed);
  renderRhythm(scene, completed);
  renderSentenceAnalysis(scene);
  $('#report-duration').textContent = formatTime(Math.max(state.seconds, 42));
  $('#report-words').textContent = String(state.words || 86);
  $('#report-fillers').textContent = String(state.fillers || 2);
  $('#report-longest-pause').textContent = state.pauses ? '1.4s' : '—';
  const defaultQuote = (MOCK_LINES_BY_SCENE[scene.id] || MOCK_LINES_BY_SCENE.interview)[0];
  $('#report-quote-text').textContent = state.transcript[0] || defaultQuote;
  $('#next-action-title').textContent = completed >= 3 ? '把收尾说得更有力' : '把下一段说具体';
  $('#next-action-description').textContent = completed >= 3 ? '最后不要只说“所以就这样”。用一句行动或结果，把这次表达稳稳收住。' : '不要停在“效果很好”。补上数字、时间或对方的变化，让你的行动真正落地。';
  if (state.attempt === 1) {
    saveHistory({
      date: '刚刚',
      scene: scene.name,
      sceneId: scene.id,
      topic: state.topic,
      score,
      words: state.words || 86,
      duration: formatTime(Math.max(state.seconds, 42)),
      focus: completed >= scene.stages.length ? '让结论更有力' : `补充${scene.stages[completed] || '具体结果'}`
    });
  }
  $('#followup-panel').classList.add('is-hidden');
  const comparisonPanel = $('#comparison-panel');
  if (state.attempt > 1 && state.firstAttempt) {
    const currentWords = state.words || 86;
    const currentFillers = state.fillers || 2;
    const scoreDelta = score - state.firstAttempt.score;
    const wordsDelta = currentWords - state.firstAttempt.words;
    const fillersDelta = currentFillers - state.firstAttempt.fillers;
    $('#comparison-before-score').textContent = String(state.firstAttempt.score);
    $('#comparison-score').textContent = `${score} / 100`;
    $('#comparison-score-delta').textContent = `${scoreDelta >= 0 ? '+' : ''}${scoreDelta} 分`;
    $('#comparison-before-words').textContent = `${state.firstAttempt.words} 字`;
    $('#comparison-words').textContent = `${currentWords} 字`;
    $('#comparison-words-delta').textContent = `${wordsDelta >= 0 ? '+' : ''}${wordsDelta} 字`;
    $('#comparison-before-fillers').textContent = String(state.firstAttempt.fillers);
    $('#comparison-fillers').textContent = String(currentFillers);
    $('#comparison-fillers-delta').textContent = `${fillersDelta <= 0 ? '' : '+'}${fillersDelta} 个`;
    $('#comparison-caption').textContent = scoreDelta > 0 ? '结构更完整了。下一次继续保留这次的开场方式。' : '先保留这次最清楚的一段，再逐步补齐其他阶段。';
    comparisonPanel.classList.remove('is-hidden');
  } else {
    comparisonPanel.classList.add('is-hidden');
  }
  setView('report');
}

function showFollowup() {
  const scene = currentScene();
  state.followupIndex = 0;
  state.followupComplete = false;
  renderFollowup(scene);
  $('#followup-panel').classList.remove('is-hidden');
  showToast('已生成一个针对本次场景的追问');
}

function showHistory() {
  clearInterval(timerId);
  renderHistory();
  setView('history');
}

function openSetup() {
  setView('setup');
}

function closeSetup() {
  setView('workspace');
}

function reportSummaryText() {
  return [
    '表达练习报告',
    `场景：${currentScene().name}`,
    `主题：${state.topic}`,
    `结构完整度：${$('#score-number').textContent} / 100`,
    `表达节奏：${$('#report-speed').textContent} 字 / 分钟`,
    `改进重点：${$('#report-focus').textContent}`,
    `下一步建议：${$('#next-action-title').textContent}`,
    `原话摘录：${$('#report-quote-text').textContent}`
  ].join('\n');
}

function reportData() {
  const scene = currentScene();
  return {
    version: '0.2',
    scene: { id: scene.id, name: scene.name, structure: scene.structure, stages: scene.stages },
    topic: state.topic,
    completedStages: Math.max(1, state.stageIndex),
    transcript: state.transcript,
    metrics: {
      duration: $('#report-duration').textContent,
      words: Number($('#report-words').textContent),
      fillers: Number($('#report-fillers').textContent),
      longestPause: $('#report-longest-pause').textContent,
      score: Number($('#score-number').textContent),
      speed: Number($('#report-speed').textContent)
    },
    insights: {
      focus: $('#report-focus').textContent,
      evidenceStatus: $('#report-evidence-status').textContent,
      rhythm: $('#report-pause-pattern').textContent,
      emphasis: $('#report-emphasis').textContent
    }
  };
}

function downloadReport() {
  try {
    const report = `${reportSummaryText()}\n\n表达结构：${currentScene().description}\n练习时长：${$('#report-duration').textContent}\n填充词：${$('#report-fillers').textContent}\n最长停顿：${$('#report-longest-pause').textContent}`;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const safeTopic = state.topic.replace(/[^\w\u4e00-\u9fff-]+/g, '-').slice(0, 24) || '表达练习';
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${safeTopic}-练习报告.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('报告已下载');
  } catch (error) {
    showToast('当前环境无法下载报告');
  }
}

function downloadJsonReport() {
  try {
    const blob = new Blob([JSON.stringify(reportData(), null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTopic = state.topic.replace(/[^\w\u4e00-\u9fff-]+/g, '-').slice(0, 24) || '表达练习';
    link.href = url;
    link.download = `${safeTopic}-结构化报告.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('JSON 报告已下载');
  } catch (error) {
    showToast('当前环境无法下载 JSON 报告');
  }
}

async function copyReport() {
  const summary = reportSummaryText();
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(summary);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = summary;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      if (!copied) throw new Error('copy failed');
    }
    showToast('报告摘要已复制');
  } catch (error) {
    showToast('当前环境无法复制，请手动记录报告内容');
  }
}

function applyTrainingPlan() {
  const record = readHistory()[0];
  if (!record) return setView('setup');
  const scene = SCENES.find(item => item.id === record.sceneId) || SCENES.find(item => item.name === record.scene);
  if (scene) state.sceneId = scene.id;
  $('#topic-input').value = record.topic || '';
  renderSceneOptions();
  renderStructure();
  updateTopicCount();
  setView('setup');
  showToast('已带入上次主题，可以开始下一次练习');
}

function renderFollowup(scene = currentScene()) {
  const rounds = FOLLOWUP_QUESTIONS[scene.id] || [];
  const round = rounds[state.followupIndex];
  if (!round || state.followupComplete) {
    $('#followup-kicker').textContent = '追问链路 · 已完成';
    $('#followup-round').textContent = '3 / 3 轮完成';
    $('#followup-question').textContent = '这条表达链路已经走完，下一次可以直接练习回应质疑。';
    $('#followup-answer').textContent = '你已经完成两轮追问和一轮反驳训练。回到练习设置，可以换一个真实主题继续。';
    $('#followup-next').textContent = '本轮已完成';
    $('#followup-next').disabled = true;
    return;
  }
  $('#followup-kicker').textContent = round.type;
  $('#followup-round').textContent = `第 ${state.followupIndex + 1} / ${rounds.length} 轮`;
  $('#followup-question').textContent = round.question;
  $('#followup-answer').textContent = `模拟回应提示：${round.response}`;
  $('#followup-next').disabled = false;
  $('#followup-next').textContent = state.followupIndex === rounds.length - 1 ? '模拟回答并完成' : '模拟回答并继续';
}

function advanceFollowup() {
  if (state.followupComplete) return;
  const rounds = FOLLOWUP_QUESTIONS[currentScene().id] || [];
  if (state.followupIndex >= rounds.length - 1) {
    state.followupComplete = true;
    renderFollowup();
    showToast('追问和反驳训练已完成');
    return;
  }
  state.followupIndex += 1;
  renderFollowup();
  showToast('已进入下一轮追问');
}

function startRerecord() {
  state.attempt = 2;
  resetSession();
  const scene = currentScene();
  $('#practice-scene').textContent = scene.name;
  $('#practice-topic').textContent = state.topic;
  $('#target-duration').textContent = formatTime(state.duration);
  $('#coach-hint').textContent = scene.hint;
  $('#coach-subtext').textContent = '这是第二次表达，试着把刚才的建议用进去。';
  renderPracticeSteps();
  setView('practice');
  startTimer();
  showToast('第二次练习开始，结束后会看到两次对比');
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('visible'), 2400);
}

function resetDemo() {
  clearInterval(timerId);
  state.sceneId = 'interview';
  state.duration = 180;
  state.attempt = 1;
  state.firstAttempt = null;
  state.followupIndex = 0;
  state.followupComplete = false;
  state.aiQuestionIndex = 0;
  $('#topic-input').value = '';
  updateTopicCount();
  renderSceneOptions();
  renderDurationOptions();
  renderStructure();
  setView('setup');
}

$('#topic-input').addEventListener('input', updateTopicCount);
$('#structure-select').addEventListener('change', event => {
  state.sceneId = event.target.value;
  renderSceneOptions();
  renderStructure();
});
$('#start-button').addEventListener('click', startPractice);
$('#simulate-button').addEventListener('click', simulateSentence);
$('#begin-expression-button').addEventListener('click', simulateSentence);
$('#end-button').addEventListener('click', finishPractice);
$('#pause-button').addEventListener('click', () => {
  if (state.timeReached) return showToast('目标时长已到，请结束练习查看报告');
  state.isPaused = !state.isPaused;
  $('#pause-button').innerHTML = state.isPaused ? '<span>▶</span> 继续' : '<span>Ⅱ</span> 暂停';
  $('#recording-label').textContent = state.isPaused ? '已暂停' : '表达中';
  showToast(state.isPaused ? '已暂停，想好后继续' : '继续表达');
});
document.addEventListener('keydown', event => {
  const practiceVisible = !$('#practice-view').classList.contains('is-hidden');
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && practiceVisible) {
    event.preventDefault();
    $('#simulate-button').click();
    return;
  }
  if (event.code === 'Space' && practiceVisible) {
    event.preventDefault();
    $('#pause-button').click();
  }
});
$$('[data-action="back-to-setup"]').forEach(button => button.addEventListener('click', () => {
  clearInterval(timerId);
  state.attempt = 1;
  state.firstAttempt = null;
  setView('setup');
}));
$$('[data-action="reset"]').forEach(button => button.addEventListener('click', resetDemo));
$$('[data-action="open-setup"]').forEach(button => button.addEventListener('click', openSetup));
$$('[data-action="close-setup"]').forEach(button => button.addEventListener('click', closeSetup));
$$('[data-action="generate-ai-question"]').forEach(button => button.addEventListener('click', generateAiQuestion));
$$('[data-action="use-ai-question"]').forEach(button => button.addEventListener('click', useAiQuestion));
$$('[data-action="show-history"]').forEach(button => button.addEventListener('click', showHistory));
$$('[data-action="apply-plan"]').forEach(button => button.addEventListener('click', applyTrainingPlan));
$$('[data-action="copy-report"]').forEach(button => button.addEventListener('click', copyReport));
$$('[data-action="download-report"]').forEach(button => button.addEventListener('click', downloadReport));
$$('[data-action="download-json"]').forEach(button => button.addEventListener('click', downloadJsonReport));
$$('[data-action="ask-followup"]').forEach(button => button.addEventListener('click', showFollowup));
$$('[data-action="start-rerecord"]').forEach(button => button.addEventListener('click', startRerecord));
$$('[data-action="next-followup"]').forEach(button => button.addEventListener('click', advanceFollowup));

renderSceneOptions();
renderDurationOptions();
renderStructure();
updateWorkspaceStats();
