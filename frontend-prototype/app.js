const SCENES = [
  { id: 'idea', icon: '◎', name: '讲清一个想法', short: '观点更清晰', structure: 'PREP', description: '观点 → 原因 → 例子/证据 → 总结', stages: ['观点', '原因', '例子/证据', '总结'], hint: '先说结论', subtext: '把你的判断先放出来，让听众知道你要说什么。', hints: ['先说结论', '补一个原因', '来个例子或证据', '用一句话收束'] },
  { id: 'interview', icon: '◒', name: '面试回答', short: '让经历有说服力', structure: 'STAR', description: '情境/任务 → 行动 → 结果 → 复盘', stages: ['情境/任务', '行动', '结果', '复盘'], hint: '先交代情境或任务', subtext: '不必完美，先把事情发生的背景说出来。', hints: ['先交代情境或任务', '说清你做了什么', '补充结果和数据', '说说复盘和经验'] },
  { id: 'work', icon: '▤', name: '工作汇报 / 述职', short: '结论先行', structure: '汇报结构', description: '结论 → 数据/原因 → 风险/案例 → 行动', stages: ['结论', '数据/原因', '风险/案例', '行动'], hint: '先说结论', subtext: '先告诉听众现在最重要的进展是什么。', hints: ['先说结论', '补数据或原因', '说明风险或案例', '明确下一步行动'] },
  { id: 'meeting', icon: '⌁', name: '会议发言', short: '推动一个决定', structure: '决策结构', description: '回应/判断 → 理由/影响 → 方案/依据 → 行动', stages: ['回应/判断', '理由/影响', '方案/依据', '行动'], hint: '先给出判断', subtext: '先回应眼前的问题，再展开你的理由。', hints: ['先给出判断', '说明理由和影响', '提出方案或依据', '明确决策和行动'] },
  { id: 'persuasion', icon: '◇', name: '说服沟通 / 提案', short: '让主张被听见', structure: '说服结构', description: '问题/主张 → 影响/原因 → 方案/证据 → 行动', stages: ['问题/主张', '影响/原因', '方案/证据', '行动'], hint: '先说问题或主张', subtext: '先让对方知道，你希望改变什么。', hints: ['先说问题或主张', '说明影响和原因', '补方案或证据', '说清行动和收益'] },
  { id: 'improv', icon: '✦', name: '即兴表达', short: '快速组织回答', structure: '即兴结构', description: '明确回答 → 两个理由 → 具体例子 → 简短收尾', stages: ['明确回答', '两个理由', '具体例子', '收尾'], hint: '先明确回答', subtext: '先回答，再展开。不要让听众猜你的立场。', hints: ['先明确回答', '补充两个理由', '给一个具体例子', '简短收尾'] }
];

const DURATIONS = [
  { value: 60, label: '1 分钟' },
  { value: 120, label: '2 分钟' },
  { value: 180, label: '3 分钟' },
  { value: 300, label: '5 分钟' }
];

const state = {
  sceneId: 'interview',
  duration: 180,
  topic: '',
  stageIndex: 0,
  isPaused: false,
  seconds: 0,
  words: 0,
  fillers: 0,
  pauses: 0,
  transcript: [],
  attempt: 1,
  firstAttempt: null
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

function renderStructure() {
  const scene = currentScene();
  $('#structure-name').textContent = scene.structure;
  $('#structure-description').textContent = scene.description;
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
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function setView(view) {
  ['setup', 'practice', 'report'].forEach(name => $(`#${name}-view`).classList.toggle('is-hidden', name !== view));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetSession() {
  state.stageIndex = 0;
  state.isPaused = false;
  state.seconds = 0;
  state.words = 0;
  state.fillers = 0;
  state.pauses = 0;
  state.transcript = [];
  $('#timer').textContent = '00:00';
  $('#recording-label').textContent = '表达中';
  $('#transcript').innerHTML = '<p class="transcript-placeholder">准备好后，按下开始表达</p>';
  $('#word-count').textContent = '0 字';
  $('#pause-count').textContent = '0 次停顿';
  $('#density-stat').textContent = '—';
  $('#filler-stat').textContent = '0';
}

let timerId;
function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    if (!state.isPaused) {
      state.seconds += 1;
      $('#timer').textContent = formatTime(state.seconds);
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
  $('#coach-hint').textContent = scene.hint;
  $('#coach-subtext').textContent = scene.subtext;
  renderPracticeSteps();
  setView('practice');
  startTimer();
  showToast('练习开始，跟着下一步表达即可');
}

const MOCK_LINES = [
  '当时项目需要在两周内完成，这是整个团队面对的关键任务。',
  '我先把任务拆成三个阶段，并主动协调了产品和研发同学。',
  '最后我们提前两天上线，交付周期缩短了约百分之二十。',
  '这次让我意识到，越复杂的项目越需要先把目标说清楚。'
];

const FOLLOWUP_QUESTIONS = {
  idea: '如果只能保留一个理由，哪个理由最能支撑你的观点？',
  interview: '如果再来一次，你会在哪个行动上做得更好？',
  work: '这个结果对团队或业务带来的最大变化是什么？',
  meeting: '如果今天只能做一个决定，你建议现在定下什么？',
  persuasion: '对方最可能担心什么，你准备如何回应？',
  improv: '如果听众只记住一句话，你希望是哪一句？'
};

function simulateSentence() {
  if (state.isPaused) return showToast('当前已暂停，继续后再说一句');
  const scene = currentScene();
  const line = MOCK_LINES[Math.min(state.stageIndex, MOCK_LINES.length - 1)];
  const transcript = $('#transcript');
  const placeholder = transcript.querySelector('.transcript-placeholder');
  if (placeholder) placeholder.remove();
  $$('#transcript .active-line').forEach(lineElement => lineElement.classList.replace('active-line', 'old-line'));
  const lineElement = document.createElement('p');
  lineElement.className = 'active-line';
  lineElement.textContent = line;
  transcript.appendChild(lineElement);
  state.transcript.push(line);
  state.words += line.replace(/[^\u4e00-\u9fff\w]/g, '').length;
  state.fillers += state.stageIndex === 1 ? 1 : 0;
  state.pauses += 1;
  state.stageIndex = Math.min(state.stageIndex + 1, scene.stages.length);
  $('#word-count').textContent = `${state.words} 字`;
  $('#pause-count').textContent = `${state.pauses} 次停顿`;
  $('#density-stat').textContent = `${Math.max(72, 96 - state.fillers * 4)}%`;
  $('#filler-stat').textContent = String(state.fillers);
  renderPracticeSteps();
  const nextIndex = Math.min(state.stageIndex, scene.stages.length - 1);
  const hints = scene.hints || [];
  $('#coach-hint').textContent = state.stageIndex >= scene.stages.length ? '可以收尾了' : (hints[nextIndex] || scene.hint);
  $('#coach-subtext').textContent = state.stageIndex >= scene.stages.length ? '把最重要的一句话再收束一下。' : '继续往前说，下一步会在这里提醒你。';
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
  $('#report-duration').textContent = formatTime(Math.max(state.seconds, 42));
  $('#report-words').textContent = String(state.words || 86);
  $('#report-fillers').textContent = String(state.fillers || 2);
  $('#report-longest-pause').textContent = state.pauses ? '1.4s' : '—';
  $('#report-quote-text').textContent = state.transcript[0] || '当时项目需要在两周内完成，这是整个团队面对的关键任务。';
  $('#next-action-title').textContent = completed >= 3 ? '把收尾说得更有力' : '把下一段说具体';
  $('#next-action-description').textContent = completed >= 3 ? '最后不要只说“所以就这样”。用一句行动或结果，把这次表达稳稳收住。' : '不要停在“效果很好”。补上数字、时间或对方的变化，让你的行动真正落地。';
  $('#followup-panel').classList.add('is-hidden');
  const comparisonPanel = $('#comparison-panel');
  if (state.attempt > 1 && state.firstAttempt) {
    const scoreDelta = score - state.firstAttempt.score;
    const wordsDelta = (state.words || 86) - state.firstAttempt.words;
    const fillersDelta = (state.fillers || 2) - state.firstAttempt.fillers;
    $('#comparison-score').textContent = `${score} / 100`;
    $('#comparison-score-delta').textContent = `${scoreDelta >= 0 ? '+' : ''}${scoreDelta} 分`;
    $('#comparison-words').textContent = `${state.words || 86} 字`;
    $('#comparison-words-delta').textContent = `${wordsDelta >= 0 ? '+' : ''}${wordsDelta} 字`;
    $('#comparison-fillers').textContent = String(state.fillers || 2);
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
  $('#followup-question').textContent = FOLLOWUP_QUESTIONS[scene.id] || '如果再来一次，你会把哪一段说得更具体？';
  $('#followup-answer').textContent = '这是本地演示中的模拟追问。下一次可以直接回答它，让你的表达从复盘走向更具体的判断。';
  $('#followup-panel').classList.remove('is-hidden');
  showToast('已生成一个针对本次场景的追问');
}

function startRerecord() {
  state.attempt = 2;
  resetSession();
  const scene = currentScene();
  $('#practice-scene').textContent = scene.name;
  $('#practice-topic').textContent = state.topic;
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
  $('#topic-input').value = '';
  updateTopicCount();
  renderSceneOptions();
  renderDurationOptions();
  renderStructure();
  setView('setup');
}

$('#topic-input').addEventListener('input', updateTopicCount);
$('#start-button').addEventListener('click', startPractice);
$('#simulate-button').addEventListener('click', simulateSentence);
$('#end-button').addEventListener('click', finishPractice);
$('#pause-button').addEventListener('click', () => {
  state.isPaused = !state.isPaused;
  $('#pause-button').innerHTML = state.isPaused ? '<span>▶</span> 继续' : '<span>Ⅱ</span> 暂停';
  $('#recording-label').textContent = state.isPaused ? '已暂停' : '表达中';
  showToast(state.isPaused ? '已暂停，想好后继续' : '继续表达');
});
document.addEventListener('keydown', event => {
  if (event.code === 'Space' && !$('#practice-view').classList.contains('is-hidden')) {
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
$$('[data-action="ask-followup"]').forEach(button => button.addEventListener('click', showFollowup));
$$('[data-action="start-rerecord"]').forEach(button => button.addEventListener('click', startRerecord));

renderSceneOptions();
renderDurationOptions();
renderStructure();
