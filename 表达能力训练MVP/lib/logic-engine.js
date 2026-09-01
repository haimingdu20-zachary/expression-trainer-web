/**
 * MVP 逻辑训练引擎
 * 不扩充词库，只根据句子结构和上下文判断表达阶段。
 */

const STRUCTURES = {
  prep: {
    label: '观点表达 PREP',
    stages: [
      { id: 'point', label: '结论', patterns: [/我认为|我觉得|我的观点|结论是|核心是|我支持|我不支持|我建议|我主张|应该|关键在于/] },
      { id: 'reason', label: '原因', patterns: [/因为|原因是|这是由于|主要是|第一|第二|首先|其次|一方面|另一方面/] },
      { id: 'example', label: '例子/证据', patterns: [/比如|例如|举个例子|曾经|上次|数据|从\s*\d|提升了|下降了|结果是|案例/] },
      { id: 'closing', label: '总结', patterns: [/所以|因此|总的来说|综上|换句话说|最终|下一步|建议大家|我希望/] }
    ]
  },
  briefing: {
    label: '工作汇报',
    stages: [
      { id: 'point', label: '结论', patterns: [/目前|结论是|进展是|结果是|本周|已经完成|还剩|核心情况/] },
      { id: 'reason', label: '数据/原因', patterns: [/因为|原因|数据|指标|达到|完成率|增长|下降|相比|主要问题/] },
      { id: 'example', label: '风险/案例', patterns: [/比如|例如|风险|案例|具体来看|其中|影响是|问题在于/] },
      { id: 'closing', label: '行动项', patterns: [/下一步|需要|计划|安排|负责人|截止|建议|请大家|行动/] }
    ]
  },
  interview: {
    label: '面试回答 STAR',
    stages: [
      { id: 'point', label: '情境/任务', patterns: [/当时|背景|在那段时间|我的任务|需要|负责|面对/] },
      { id: 'reason', label: '行动', patterns: [/我先|我负责|我采取|通过|协调|设计|分析|推动|执行/] },
      { id: 'example', label: '结果', patterns: [/最终|结果|完成|提升|降低|增长|节省|达成|获得/] },
      { id: 'closing', label: '复盘', patterns: [/这次让我|我学到|以后|复盘|如果再来一次|因此/] }
    ]
  },
  persuasion: {
    label: '说服表达',
    stages: [
      { id: 'point', label: '问题/主张', patterns: [/问题是|现在的情况|我建议|我们应该|不应该|核心问题|主张/] },
      { id: 'reason', label: '影响/原因', patterns: [/因为|导致|影响|代价|风险|如果不|原因/] },
      { id: 'example', label: '方案/证据', patterns: [/方案|比如|例如|数据|案例|可以通过|具体做法|验证/] },
      { id: 'closing', label: '行动/收益', patterns: [/所以|因此|收益|最终|下一步|请|建议|我们可以从|行动/] }
    ]
  },
  meeting: {
    label: '会议发言',
    stages: [
      { id: 'point', label: '回应/判断', patterns: [/针对|回应|我的判断|我认为|我同意|我不同意|问题是|核心是|目前/] },
      { id: 'reason', label: '理由/影响', patterns: [/因为|原因|影响|风险|会导致|主要在于|考虑到/] },
      { id: 'example', label: '方案/依据', patterns: [/比如|例如|数据|案例|方案|具体来看|可以先|建议采用/] },
      { id: 'closing', label: '决策/行动', patterns: [/所以|因此|我建议|需要决定|请确认|下一步|负责人|截止|推进/] }
    ]
  },
  impromptu: {
    label: '即兴表达',
    stages: [
      { id: 'point', label: '明确回答', patterns: [/我认为|我会|我的答案|我倾向于|关键是|简单说|结论是|首先/] },
      { id: 'reason', label: '两个理由', patterns: [/因为|第一|第二|一是|二是|主要有|原因/] },
      { id: 'example', label: '具体例子', patterns: [/比如|例如|举个例子|曾经|上次|假设|具体来说/] },
      { id: 'closing', label: '简短收尾', patterns: [/所以|因此|总的来说|最终|这就是|我的建议|简单总结/] }
    ]
  }
};

function getStructure(id) {
  return STRUCTURES[id] || STRUCTURES.prep;
}

function detectStages(text, structureId = 'prep') {
  const structure = getStructure(structureId);
  return structure.stages.map(stage => ({
    ...stage,
    detected: stage.patterns.some(pattern => pattern.test(text))
  }));
}

function chooseCue(stages, elapsedSec, text) {
  const firstMissing = stages.findIndex(stage => !stage.detected);

  if (firstMissing === 0 && (elapsedSec >= 12 || text.length >= 45)) {
    return { cue: '先说结论', type: 'stage', priority: 'high' };
  }
  if (firstMissing === 1 && text.length >= 25) {
    return { cue: '补一个原因', type: 'stage', priority: 'high' };
  }
  if (firstMissing === 2 && text.length >= 45) {
    return { cue: '来个例子', type: 'evidence', priority: 'medium' };
  }
  if (firstMissing === 3 && text.length >= 80) {
    return { cue: '开始收尾', type: 'stage', priority: 'medium' };
  }
  return { cue: '继续展开', type: 'neutral', priority: 'low' };
}

function analyzeLogic({ text = '', structureId = 'prep', elapsedSec = 0 } = {}) {
  const safeText = String(text || '').trim();
  const stages = detectStages(safeText, structureId);
  const detectedCount = stages.filter(stage => stage.detected).length;
  const cue = chooseCue(stages, elapsedSec, safeText);
  const structureScore = Math.round((detectedCount / stages.length) * 100);

  return {
    structureId,
    structureLabel: getStructure(structureId).label,
    stages: stages.map(({ id, label, detected }) => ({ id, label, detected })),
    currentStage: stages.find(stage => !stage.detected)?.id || 'complete',
    structureScore,
    cue,
    hasConclusion: stages[0]?.detected || false,
    hasReason: stages[1]?.detected || false,
    hasEvidence: stages[2]?.detected || false,
    hasClosing: stages[3]?.detected || false
  };
}

function measureDelivery({ durationSec = 0, totalWords = 0, pauseCount = 0, longestPauseMs = 0 } = {}) {
  const rate = durationSec > 0 ? Math.round((totalWords / durationSec) * 60) : 0;
  return { rate, pauseCount, longestPauseMs };
}

module.exports = { STRUCTURES, getStructure, analyzeLogic, measureDelivery };
