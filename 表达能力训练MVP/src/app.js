// 言序｜表达与思维训练 MVP

const SCENARIO_LABELS = {
  idea: '讲清一个想法',
  interview: '面试回答',
  briefing: '工作汇报 / 述职',
  meeting: '会议发言 / 推动决策',
  persuasion: '说服沟通 / 提案',
  impromptu: '即兴表达 / 随机回答'
};

const QUESTION_BANK = {
  idea: ['你最近想推动的一个想法是什么？为什么值得现在开始？', '如果只能用一分钟讲清一个复杂概念，你会先说什么？', '一个你坚持的判断，最有力的理由和例子分别是什么？'],
  interview: ['讲一次你解决困难的经历，你具体做了什么？', '你如何推动一次跨部门协作？最后带来了什么结果？', '说说一次没有达到预期的项目复盘，你后来改变了什么？'],
  briefing: ['请汇报一个项目的当前进展、主要风险和下一步计划。', '如果要争取一项资源，你会如何用结论和数据说明必要性？', '这季度最值得汇报的成果是什么？它带来了什么具体变化？'],
  meeting: ['你建议今天的会议做出什么决定？为什么？', '面对一个会议中的分歧，你会如何回应并推动共识？', '一个需要团队共识的问题，你会怎样提出方案并明确行动？'],
  persuasion: ['为什么现在应该改变这个流程？请说清影响和收益。', '如何说服团队尝试一个新工具？你的证据和行动是什么？', '一次需要争取支持的提案，你会如何让对方愿意行动？'],
  impromptu: ['你怎么看待远程办公？请先给出明确判断。', '最近学到的一个有用方法是什么？为什么值得推荐？', '如果重新选择一次，你会怎么做？请给出两个理由和一个例子。']
};

class ExpressionTrainer {
  constructor() {
    this.isRecording = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedTime = 0;
    this.pauseStart = null;
    this.timerInterval = null;
    this.fullText = '';
    this.sentences = [];
    this.stats = { fillers: 0, hedges: 0, vagueWords: 0, totalWords: 0, duration: 0 };
    this.lastFeedbackText = '';
    this.lastReport = '';
    this.lastCue = '';
    this.aiFeedbackInFlight = false;
    this.lastAIFeedbackAt = 0;
    this.session = {
      scenario: 'idea',
      topic: '',
      structureId: 'prep',
      targetSeconds: 60
    };
    this.logic = null;
    this.lastAttempt = null;
    this.comparisonBase = null;
    this.audioMetrics = { silenceStreakMs: 0, pauseCount: 0, longestPauseMs: 0 };
    this.questionIndex = 0;

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.btnStart = document.getElementById('btn-start');
    this.btnPaste = document.getElementById('btn-paste');
    this.btnPause = document.getElementById('btn-pause');
    this.btnResume = document.getElementById('btn-resume');
    this.btnStop = document.getElementById('btn-stop');
    this.btnReport = document.getElementById('btn-report');
    this.btnSettings = document.getElementById('btn-settings');
    this.btnCloseReport = document.getElementById('btn-close-report');
    this.btnClosePaste = document.getElementById('btn-close-paste');
    this.btnAnalyzePaste = document.getElementById('btn-analyze-paste');
    this.btnCopyText = document.getElementById('btn-copy-text');
    this.btnSaveText = document.getElementById('btn-save-text');
    this.btnClear = document.getElementById('btn-clear');
    this.btnCopyReport = document.getElementById('btn-copy-report');
    this.btnFollowup = document.getElementById('btn-followup');
    this.btnCompare = document.getElementById('btn-compare');
    this.sessionModal = document.getElementById('session-modal');
    this.compareModal = document.getElementById('compare-modal');
    this.compareBody = document.getElementById('compare-body');
    this.stageProgress = document.getElementById('stage-progress');
    this.coachCue = document.getElementById('coach-cue');
    this.statRate = document.getElementById('stat-rate');
    this.statPauses = document.getElementById('stat-pauses');
    this.pasteModal = document.getElementById('paste-modal');
    this.pasteTextarea = document.getElementById('paste-textarea');
    this.timer = document.getElementById('timer');
    this.subtitleScroll = document.getElementById('subtitle-scroll');
    this.subtitleContainer = document.getElementById('subtitle-container');
    this.feedbackContent = document.getElementById('feedback-content');
    this.questionText = document.getElementById('question-text');
    this.questionKicker = document.getElementById('question-kicker');
    this.btnNextQuestion = document.getElementById('btn-next-question');
    this.btnAIQuestion = document.getElementById('btn-ai-question');
    this.btnUseQuestion = document.getElementById('btn-use-question');
    this.reportModal = document.getElementById('report-modal');
    this.reportBody = document.getElementById('report-body');
    this.statFillers = document.getElementById('stat-fillers');
    this.statHedges = document.getElementById('stat-hedges');
    this.statVague = document.getElementById('stat-vague');
    this.statDensity = document.getElementById('stat-density');
  }

  bindEvents() {
    this.btnStart.addEventListener('click', () => this.openSessionModal());
    document.getElementById('btn-confirm-session').addEventListener('click', () => this.confirmSession());
    document.getElementById('btn-cancel-session').addEventListener('click', () => this.sessionModal.classList.add('hidden'));
    document.getElementById('session-scenario').addEventListener('change', event => {
      const structureByScenario = {
        idea: 'prep', interview: 'interview', briefing: 'briefing',
        meeting: 'meeting', persuasion: 'persuasion', impromptu: 'impromptu'
      };
      this.questionIndex = 0;
      document.getElementById('session-structure').value = structureByScenario[event.target.value] || 'prep';
      this.renderQuestion(event.target.value);
    });
    this.btnNextQuestion.addEventListener('click', () => this.nextQuestion());
    this.btnAIQuestion.addEventListener('click', () => this.generateQuestion());
    this.btnUseQuestion.addEventListener('click', () => this.useQuestion());
    this.btnPaste.addEventListener('click', () => this.openPasteModal());
    this.btnPause.addEventListener('click', () => this.pauseRecording());
    this.btnResume.addEventListener('click', () => this.resumeRecording());
    this.btnStop.addEventListener('click', () => this.stopRecording());
    this.btnReport.addEventListener('click', () => this.generateReport());
    this.btnFollowup.addEventListener('click', () => this.requestFollowup());
    this.btnCompare.addEventListener('click', () => this.renderComparison());
    this.btnSettings.addEventListener('click', () => window.api.openSettings());
    document.getElementById('btn-prompt-editor').addEventListener('click', () => window.api.openPromptEditor());
    this.btnCloseReport.addEventListener('click', () => this.reportModal.classList.add('hidden'));
    this.btnCopyReport.addEventListener('click', () => {
      const reportText = this.reportBody.innerText;
      navigator.clipboard.writeText(reportText).then(() => {
        this.btnCopyReport.textContent = '✅ 已复制';
        setTimeout(() => { this.btnCopyReport.textContent = '📋 复制全文'; }, 2000);
      });
    });
    this.btnClosePaste.addEventListener('click', () => this.pasteModal.classList.add('hidden'));
    document.getElementById('btn-close-compare').addEventListener('click', () => this.compareModal.classList.add('hidden'));
    this.btnAnalyzePaste.addEventListener('click', () => this.analyzePastedText());
    this.btnCopyText.addEventListener('click', () => this.copyOriginalText());
    this.btnSaveText.addEventListener('click', () => this.saveOriginalText());
    this.btnClear.addEventListener('click', () => this.clearAll());
  }

  // ===== 录制控制 =====

  openSessionModal() {
    document.getElementById('session-topic').value = this.session.topic || '';
    document.getElementById('session-scenario').value = this.session.scenario || 'idea';
    document.getElementById('session-structure').value = this.session.structureId || 'prep';
    document.getElementById('session-duration').value = String(this.session.targetSeconds || 60);
    this.renderQuestion(this.session.scenario || 'idea');
    this.sessionModal.classList.remove('hidden');
    document.getElementById('session-topic').focus();
  }

  renderQuestion(scenario = this.session.scenario) {
    const questions = QUESTION_BANK[scenario] || QUESTION_BANK.idea;
    const question = questions[this.questionIndex % questions.length];
    this.questionKicker.textContent = `根据「${SCENARIO_LABELS[scenario] || scenario}」生成 · 本地题库`;
    this.questionText.textContent = question;
  }

  nextQuestion(scenario = this.session.scenario) {
    const questions = QUESTION_BANK[scenario] || QUESTION_BANK.idea;
    this.questionIndex = (this.questionIndex + 1) % questions.length;
    this.renderQuestion(scenario);
  }

  async generateQuestion() {
    const originalLabel = this.btnAIQuestion.textContent;
    this.btnAIQuestion.disabled = true;
    this.btnAIQuestion.textContent = '生成中…';
    try {
      const structure = document.getElementById('session-structure').selectedOptions[0]?.textContent || '';
      const scenario = document.getElementById('session-scenario').selectedOptions[0]?.textContent || '';
      const topic = document.getElementById('session-topic').value.trim();
      const result = await window.api.getQuestion({ context: { scenario, structure, topic } });
      if (result.success && result.question) {
        this.questionKicker.textContent = `根据「${scenario}」生成 · AI教练`;
        this.questionText.textContent = result.question;
        return;
      }
      this.questionKicker.textContent = `AI未配置，已使用「${scenario}」本地题库`;
      this.nextQuestion(document.getElementById('session-scenario').value);
    } catch (error) {
      this.questionKicker.textContent = 'AI暂不可用，已使用本地题库';
      this.nextQuestion(document.getElementById('session-scenario').value);
    } finally {
      this.btnAIQuestion.disabled = false;
      this.btnAIQuestion.textContent = originalLabel;
    }
  }

  useQuestion() {
    const scenario = document.getElementById('session-scenario').value || this.session.scenario;
    const questions = QUESTION_BANK[scenario] || QUESTION_BANK.idea;
    const question = questions[this.questionIndex % questions.length];
    document.getElementById('session-topic').value = question;
    document.getElementById('session-topic').focus();
  }

  async confirmSession() {
    this.session = {
      scenario: document.getElementById('session-scenario').value,
      topic: document.getElementById('session-topic').value.trim(),
      structureId: document.getElementById('session-structure').value,
      targetSeconds: Number(document.getElementById('session-duration').value) || 60
    };
    this.sessionModal.classList.add('hidden');
    await this.startRecording();
  }

  async startRecording() {
    const initResult = await window.api.initASR();
    if (!initResult.success) {
      this.showError(`语音识别启动失败: ${initResult.error}`);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      await this.audioContext.resume();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.audioProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      const silentOutput = this.audioContext.createGain();
      silentOutput.gain.value = 0;
      this.audioProcessor.onaudioprocess = async (e) => {
        if (!this.isRecording || this.isPaused) return;
        const samples = e.inputBuffer.getChannelData(0);
        this.updateAudioMetrics(samples);
        const result = await window.api.feedAudio(samples);
        if (result) this.handleASRResult(result);
      };
      source.connect(this.audioProcessor);
      // ScriptProcessor 需要连接到输出才能持续触发，但不能把麦克风声音回放造成啸叫。
      this.audioProcessor.connect(silentOutput);
      silentOutput.connect(this.audioContext.destination);
      this.mediaStream = stream;
    } catch (err) {
      await window.api.stopASR();
      this.showError(`麦克风访问失败: ${err.message}`);
      return;
    }

    this.isRecording = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.pausedTime = 0;
    this.fullText = '';
    this.sentences = [];
    this.resetStats();
    this.comparisonBase = this.lastAttempt;
    this.audioMetrics = { silenceStreakMs: 0, pauseCount: 0, longestPauseMs: 0 };
    this.subtitleContainer.innerHTML = '';
    this.btnCompare.classList.add('hidden');

    // UI
    this.btnStart.classList.add('hidden');
    this.btnPause.classList.remove('hidden');
    this.btnStop.classList.remove('hidden');
    this.btnReport.classList.add('hidden');
    this.btnResume.classList.add('hidden');
    this.timer.classList.add('active');

    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  pauseRecording() {
    this.isPaused = true;
    this.pauseStart = Date.now();
    this.btnPause.classList.add('hidden');
    this.btnResume.classList.remove('hidden');
    this.timer.classList.remove('active');
  }

  resumeRecording() {
    this.isPaused = false;
    this.pausedTime += Date.now() - this.pauseStart;
    this.pauseStart = null;
    this.btnResume.classList.add('hidden');
    this.btnPause.classList.remove('hidden');
    this.timer.classList.add('active');
  }

  async stopRecording() {
    if (!this.isRecording && !this.audioProcessor && !this.mediaStream) return;
    if (this.audioProcessor) { this.audioProcessor.disconnect(); this.audioProcessor = null; }
    if (this.audioContext) { this.audioContext.close(); this.audioContext = null; }
    if (this.mediaStream) { this.mediaStream.getTracks().forEach(t => t.stop()); this.mediaStream = null; }
    const stopResult = await window.api.stopASR();
    if (stopResult?.finalText && !this.fullText.endsWith(stopResult.finalText)) {
      await this.appendFinalSentence(stopResult.finalText);
    }
    this.isRecording = false;
    this.isPaused = false;

    clearInterval(this.timerInterval);
    let totalPaused = this.pausedTime;
    if (this.pauseStart) totalPaused += Date.now() - this.pauseStart;
    this.stats.duration = Math.floor((Date.now() - this.startTime - totalPaused) / 1000);
    this.stats.pauseCount = this.audioMetrics.pauseCount;
    this.stats.longestPauseMs = this.audioMetrics.longestPauseMs;
    this.stats.rate = this.stats.duration > 0 ? Math.round((this.stats.totalWords / this.stats.duration) * 60) : 0;
    await this.updateLogicGuidance();

    // UI：显示生成报告按钮，可翻阅字幕
    this.btnStop.classList.add('hidden');
    this.btnPause.classList.add('hidden');
    this.btnResume.classList.add('hidden');
    this.btnStart.classList.remove('hidden');
    this.timer.classList.remove('active');

    if (this.fullText.trim()) {
      this.btnReport.classList.remove('hidden');
      this.btnFollowup.classList.remove('hidden');
      this.btnCopyText.classList.remove('hidden');
      this.btnSaveText.classList.remove('hidden');
      this.btnClear.classList.remove('hidden');
      this.lastAttempt = this.makeAttempt();
      if (this.comparisonBase) this.btnCompare.classList.remove('hidden');
    }
  }

  // ===== ASR结果处理 =====

  handleASRResult({ text, isFinal }) {
    if (isFinal) {
      this.appendFinalSentence(text);

      // AI 只做低频语境反馈，本地逻辑教练负责即时提示
      if (this.fullText.length - this.lastFeedbackText.length >= 80 && Date.now() - this.lastAIFeedbackAt >= 10000) {
        this.requestRealtimeFeedback();
      }
    }
    this.renderSubtitle(text, isFinal);
  }

  async appendFinalSentence(text) {
    const sentence = String(text || '').trim();
    if (!sentence) return;
    this.sentences.push(sentence);
    this.fullText += sentence;
    await this.analyzeCurrentSentence(sentence);
    await this.updateLogicGuidance();
  }

  renderSubtitle(currentText, isFinal) {
    if (isFinal) {
      // 移除interim
      const interim = this.subtitleContainer.querySelector('.interim-line');
      if (interim) interim.remove();

      // 旧行变灰
      this.subtitleContainer.querySelectorAll('.subtitle-line:not(.old)').forEach(el => {
        el.classList.add('old');
      });

      // 新行
      const line = document.createElement('div');
      line.className = 'subtitle-line';
      line.innerHTML = this.highlightText(currentText);
      this.subtitleContainer.appendChild(line);
    } else {
      let interim = this.subtitleContainer.querySelector('.interim-line');
      if (!interim) {
        interim = document.createElement('div');
        interim.className = 'subtitle-line interim-line';
        this.subtitleContainer.appendChild(interim);
      }
      interim.textContent = currentText;
    }

    // 自动滚到底
    this.subtitleScroll.scrollTop = this.subtitleScroll.scrollHeight;
  }

  highlightText(text) {
    let result = text;
    const vagueWords = ['开心','难过','害怕','生气','不舒服','很好','很多','很快','很大','很小','好看','不好','喜欢','讨厌','觉得','想想'];
    vagueWords.forEach(w => {
      result = result.replace(new RegExp(w, 'g'), `<span class="vague">${w}</span>`);
    });
    const fillerPatterns = /(嗯|啊|呃|额|那个|就是|然后|这个|对吧|是吧|反正|基本上)/g;
    result = result.replace(fillerPatterns, '<span class="filler">$1</span>');
    const hedgePatterns = /(可能|也许|大概|应该|我觉得|好像|似乎|或许|不一定|差不多|感觉)/g;
    result = result.replace(hedgePatterns, '<span class="hedge">$1</span>');
    return result;
  }

  // ===== 分析 =====

  async analyzeCurrentSentence(text) {
    const analysis = await window.api.analyzeText(text);
    if (analysis) {
      this.stats.fillers += analysis.fillers.length;
      this.stats.hedges += analysis.hedges.length;
      this.stats.vagueWords += analysis.vagueWords.length;
      this.stats.totalWords += analysis.totalWords;
      this.updateStatsDisplay();
      // 碰到笼统词 → 立刻在反馈栏弹出替换建议
      if (analysis.vagueWords && analysis.vagueWords.length > 0) {
        analysis.vagueWords.forEach(item => {
          const alts = item.alternatives.slice(0, 3).join(' / ');
          this.addFeedbackItem(`「${item.word}」→ ${alts}`, 'vague');
        });
      }
      // 碰到填充词 → 弹提醒
      if (analysis.fillers && analysis.fillers.length >= 2) {
        const uniqueFillers = [...new Set(analysis.fillers.map(f => f.word))].slice(0, 3);
        this.addFeedbackItem(`填充词：${uniqueFillers.join('、')}——试试停顿`, 'filler');
      }
      // 碰到犹豫词 → 弹提醒
      if (analysis.hedges && analysis.hedges.length >= 1) {
        const uniqueHedges = [...new Set(analysis.hedges.map(h => h.word))].slice(0, 2);
        this.addFeedbackItem(`「${uniqueHedges.join('」「')}」→ 直接说`, 'hedge');
      }
    }
  }

  updateStatsDisplay() {
    this.statFillers.textContent = this.stats.fillers;
    this.statHedges.textContent = this.stats.hedges;
    this.statVague.textContent = this.stats.vagueWords;
    if (this.stats.totalWords > 0) {
      const density = ((this.stats.totalWords - this.stats.fillers - this.stats.hedges) / this.stats.totalWords * 100).toFixed(0);
      this.statDensity.textContent = density + '%';
    }
    if (this.statRate) this.statRate.textContent = this.stats.rate ? `${this.stats.rate}` : '--';
    if (this.statPauses) this.statPauses.textContent = `${this.stats.pauseCount || 0}`;
  }

  async updateLogicGuidance() {
    if (!this.fullText.trim() || !window.api.analyzeLogic) return;
    const elapsedSec = this.isRecording && this.startTime
      ? Math.floor((Date.now() - this.startTime - this.pausedTime) / 1000)
      : this.stats.duration || 0;
    const result = await window.api.analyzeLogic({
      text: this.fullText,
      structureId: this.session.structureId,
      elapsedSec
    });
    if (!result) return;
    this.logic = result;
    this.stats.logicScore = result.structureScore;
    this.stats.structureLabel = result.structureLabel;
    this.renderStageProgress(result);
    this.updateStatsDisplay();

    const cue = result.cue?.cue;
    if (cue && cue !== '继续展开' && cue !== this.lastCue) {
      this.lastCue = cue;
      this.coachCue.textContent = cue;
      this.addFeedbackItem(cue, 'coach');
    }
  }

  renderStageProgress(logic) {
    if (!this.stageProgress) return;
    this.stageProgress.innerHTML = '';
    logic.stages.forEach(stage => {
      const item = document.createElement('span');
      item.className = `stage-item ${stage.detected ? 'done' : ''}`;
      item.textContent = `${stage.detected ? '✓ ' : '○ '}${stage.label}`;
      this.stageProgress.appendChild(item);
    });
  }

  getSessionContext() {
    return {
      scenario: SCENARIO_LABELS[this.session.scenario] || this.session.scenario,
      scenarioId: this.session.scenario,
      topic: this.session.topic,
      structure: this.logic?.structureLabel || this.session.structureId,
      currentStage: this.logic?.currentStage || ''
    };
  }

  // ===== 实时反馈 =====

  async requestRealtimeFeedback() {
    if (this.aiFeedbackInFlight) return;
    this.lastFeedbackText = this.fullText;
    this.aiFeedbackInFlight = true;
    this.lastAIFeedbackAt = Date.now();
    try {
      const result = await window.api.getRealtimeFeedback({ text: this.fullText, context: this.getSessionContext() });
      if (result.success && result.feedback) {
        const lines = result.feedback.split('\n').filter(l => l.trim());
        lines.forEach(line => {
          const type = this.classifyFeedback(line.trim());
          this.addFeedbackItem(line.trim(), type);
        });
      }
    } finally {
      this.aiFeedbackInFlight = false;
    }
  }

  async requestFollowup() {
    if (!this.fullText.trim()) return;
    this.btnFollowup.disabled = true;
    this.btnFollowup.textContent = '⏳ 生成追问';
    try {
      const result = await window.api.getFollowupQuestion({
        text: this.fullText,
        context: this.getSessionContext()
      });
      if (result.success && result.question) {
        this.addFeedbackItem(`追问：${result.question}`, 'followup');
      } else {
        this.addFeedbackItem(`追问生成失败：${result.error || '请检查 AI 设置'}`, 'ai');
      }
    } finally {
      this.btnFollowup.disabled = false;
      this.btnFollowup.textContent = '❓ AI追问';
    }
  }

  classifyFeedback(text) {
    if (text === '✓' || text.includes('✓')) return 'good';
    // 填充词相关
    const fillerKeywords = ['嗯','啊','呃','那个','就是','然后','这个','对吧','是吧','反正','基本上','所以说'];
    if (fillerKeywords.some(w => text.includes(`「${w}」`))) return 'filler';
    // 犹豫词相关
    const hedgeKeywords = ['可能','也许','大概','应该','我觉得','好像','似乎','感觉','或许'];
    if (hedgeKeywords.some(w => text.includes(`「${w}」`))) return 'hedge';
    // 其他精准词替换
    if (text.includes('→')) return 'vague';
    return 'ai';
  }

  addFeedbackItem(text, type = 'ai') {
    // 去重：如果前3条已经有相同内容，跳过
    const existing = Array.from(this.feedbackContent.children).slice(0, 3);
    if (existing.some(el => el.textContent === text)) return;

    const item = document.createElement('div');
    item.className = `feedback-item type-${type}`;
    item.textContent = text;
    this.feedbackContent.insertBefore(item, this.feedbackContent.firstChild);
    while (this.feedbackContent.children.length > 12) {
      this.feedbackContent.removeChild(this.feedbackContent.lastChild);
    }
  }

  updateAudioMetrics(samples) {
    if (!samples || !samples.length) return;
    const sum = samples.reduce((acc, value) => acc + value * value, 0);
    const rms = Math.sqrt(sum / samples.length);
    const sampleRate = this.audioContext?.sampleRate || 16000;
    const frameMs = samples.length / sampleRate * 1000;
    if (rms < 0.015) {
      this.audioMetrics.silenceStreakMs += frameMs;
    } else {
      if (this.audioMetrics.silenceStreakMs >= 700) {
        this.audioMetrics.pauseCount += 1;
        this.audioMetrics.longestPauseMs = Math.max(this.audioMetrics.longestPauseMs, Math.round(this.audioMetrics.silenceStreakMs));
      }
      this.audioMetrics.silenceStreakMs = 0;
    }
    this.stats.pauseCount = this.audioMetrics.pauseCount;
    this.updateStatsDisplay();
  }

  makeAttempt() {
    return {
      createdAt: new Date().toISOString(),
      text: this.fullText,
      stats: JSON.parse(JSON.stringify(this.stats)),
      logic: this.logic ? JSON.parse(JSON.stringify(this.logic)) : null,
      session: { ...this.session }
    };
  }

  renderComparison() {
    if (!this.comparisonBase || !this.lastAttempt) return;
    const before = this.comparisonBase;
    const after = this.lastAttempt;
    const diff = (a, b) => (Number(b || 0) - Number(a || 0));
    const signed = value => `${value > 0 ? '+' : ''}${value}`;
    this.compareBody.innerHTML = `
      <div class="compare-grid">
        <div><div class="compare-label">第一次表达</div><div class="compare-text">${this.escapeHtml(before.text)}</div></div>
        <div><div class="compare-label">本次表达</div><div class="compare-text">${this.escapeHtml(after.text)}</div></div>
      </div>
      <div class="compare-metrics">
        <div>逻辑结构得分 <strong>${before.stats.logicScore || 0} → ${after.stats.logicScore || 0}</strong>（${signed(diff(before.stats.logicScore, after.stats.logicScore))}）</div>
        <div>表达密度 <strong>${before.stats.totalWords || 0} → ${after.stats.totalWords || 0}</strong></div>
        <div>填充词 <strong>${before.stats.fillers || 0} → ${after.stats.fillers || 0}</strong>（${signed(-diff(before.stats.fillers, after.stats.fillers))}）</div>
        <div>语速 <strong>${before.stats.rate || 0} → ${after.stats.rate || 0}</strong> 字/分钟</div>
      </div>`;
    this.compareModal.classList.remove('hidden');
  }

  escapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  // ===== 报告 =====

  async generateReport() {
    this.reportBody.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">正在生成报告...</p>';
    this.reportModal.classList.remove('hidden');

    const result = await window.api.getFinalReport({
      fullText: this.fullText,
      stats: { ...this.stats, ...this.getSessionContext() }
    });

    if (result.success) {
      this.lastReport = result.report;
      this.renderReport(result.report);
    } else {
      this.reportBody.innerHTML = `<p style="color:#ff6b6b;">生成失败: ${result.error}</p>`;
    }
  }

  renderReport(report) {
    // 先转义模型输出，再添加受控的 Markdown 标签，避免模型返回 HTML 造成注入。
    let html = this.escapeHtml(report)
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\|(.+)\|/g, (match) => {
        // 简单表格支持
        return match;
      })
      .replace(/\n/g, '<br>');

    this.reportBody.innerHTML = `
      <div style="text-align:right;margin-bottom:12px;">
        <button id="btn-save-report" style="background:#E5007E;color:#fff;border:none;border-radius:6px;padding:8px 14px;font-size:12px;cursor:pointer;">💾 保存为 Markdown</button>
      </div>
      ${html}
    `;

    document.getElementById('btn-save-report').addEventListener('click', () => this.saveReport());
  }

  async saveReport() {
    if (!this.lastReport) return;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    const markdown = `# 表达训练报告\n\n**日期**: ${dateStr}  \n**时长**: ${this.stats.duration}秒  \n**总字数**: ${this.stats.totalWords}  \n\n---\n\n## 完整原文\n\n${this.fullText}\n\n---\n\n${this.lastReport}`;
    const filename = `表达训练-${dateStr}-${timeStr}.md`;

    try {
      const result = await window.api.saveFile(markdown, filename);
      if (result.success) {
        const btn = document.getElementById('btn-save-report');
        btn.textContent = '✓ 已保存';
        btn.style.background = '#333';
        setTimeout(() => { btn.textContent = '💾 保存为 Markdown'; btn.style.background = '#E5007E'; }, 2000);
      }
    } catch (e) {
      alert('保存失败: ' + e.message);
    }
  }

  // ===== 工具 =====

  updateTimer() {
    let totalPaused = this.pausedTime;
    if (this.pauseStart) totalPaused += Date.now() - this.pauseStart;
    const elapsed = Math.floor((Date.now() - this.startTime - totalPaused) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    this.timer.textContent = `${minutes}:${seconds}`;
  }

  resetStats() {
    this.stats = {
      fillers: 0, hedges: 0, vagueWords: 0, totalWords: 0, duration: 0,
      rate: 0, pauseCount: 0, longestPauseMs: 0, logicScore: 0,
      structureLabel: '', scenario: SCENARIO_LABELS[this.session.scenario] || this.session.scenario, topic: this.session.topic
    };
    this.logic = null;
    this.lastCue = '';
    if (this.stageProgress) this.stageProgress.innerHTML = '';
    if (this.coachCue) this.coachCue.textContent = '等待开始';
    this.updateStatsDisplay();
    this.feedbackContent.innerHTML = '';
  }

  showError(msg) {
    const line = document.createElement('div');
    line.className = 'subtitle-line';
    line.style.color = '#ff6b6b';
    line.textContent = msg;
    this.subtitleContainer.appendChild(line);
  }

  // ===== 复制 & 保存原文 & 清空 =====

  copyOriginalText() {
    if (!this.fullText.trim()) return;
    navigator.clipboard.writeText(this.fullText).then(() => {
      this.btnCopyText.textContent = '✓ 已复制';
      setTimeout(() => { this.btnCopyText.textContent = '📋 复制'; }, 1500);
    });
  }

  async saveOriginalText() {
    if (!this.fullText.trim()) return;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    const markdown = `# 表达训练原文\n\n**日期**: ${dateStr}\n\n---\n\n${this.fullText}`;
    const filename = `原文-${dateStr}-${timeStr}.md`;

    try {
      const result = await window.api.saveFile(markdown, filename);
      if (result.success) {
        this.btnSaveText.textContent = '✓ 已保存';
        setTimeout(() => { this.btnSaveText.textContent = '💾 保存'; }, 2000);
      }
    } catch (e) {
      alert('保存失败: ' + e.message);
    }
  }

  clearAll() {
    this.fullText = '';
    this.sentences = [];
    this.lastReport = '';
    this.lastAttempt = null;
    this.comparisonBase = null;
    this.subtitleContainer.innerHTML = '<div class="subtitle-line hint">点击下方按钮开始说话</div>';
    this.feedbackContent.innerHTML = '';
    this.resetStats();
    this.timer.textContent = '00:00';
    this.timer.classList.remove('active');
    this.btnReport.classList.add('hidden');
    this.btnCopyText.classList.add('hidden');
    this.btnSaveText.classList.add('hidden');
    this.btnClear.classList.add('hidden');
    this.btnFollowup.classList.add('hidden');
    this.btnCompare.classList.add('hidden');
  }

  // ===== 粘贴逐字稿分析 =====

  openPasteModal() {
    this.pasteTextarea.value = '';
    this.pasteModal.classList.remove('hidden');
    this.pasteTextarea.focus();
  }

  async analyzePastedText() {
    const text = this.pasteTextarea.value.trim();
    if (!text) return;

    // 关闭粘贴弹窗
    this.pasteModal.classList.add('hidden');

    // 把文本显示到字幕区（高亮标记）
    this.subtitleContainer.innerHTML = '';
    this.fullText = text;
    this.resetStats();

    // 按句号/问号/感叹号/换行分句
    const sentences = text.split(/(?<=[。！？\n])/g).filter(s => s.trim());
    this.sentences = sentences;

    for (const sentence of sentences) {
      const line = document.createElement('div');
      line.className = 'subtitle-line';
      line.innerHTML = this.highlightText(sentence.trim());
      this.subtitleContainer.appendChild(line);

      // 词库分析
      const analysis = await window.api.analyzeText(sentence);
      if (analysis) {
        this.stats.fillers += analysis.fillers.length;
        this.stats.hedges += analysis.hedges.length;
        this.stats.vagueWords += analysis.vagueWords.length;
        this.stats.totalWords += analysis.totalWords;
      }
    }

    this.stats.duration = 0; // 粘贴模式没有时长
    this.updateStatsDisplay();
    await this.updateLogicGuidance();

    // 显示操作按钮
    this.btnReport.classList.remove('hidden');
    this.btnFollowup.classList.remove('hidden');
    this.btnCopyText.classList.remove('hidden');
    this.btnSaveText.classList.remove('hidden');
    this.btnClear.classList.remove('hidden');

    // 请求AI语境化反馈
    this.requestRealtimeFeedback();
  }
}

document.addEventListener('DOMContentLoaded', () => { new ExpressionTrainer(); });
