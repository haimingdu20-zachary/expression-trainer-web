const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeLogic, measureDelivery } = require('../lib/logic-engine');

test('按训练结构识别 STAR 阶段', () => {
  const result = analyzeLogic({
    structureId: 'interview',
    text: '当时项目需要在两周内完成。我先协调产品和研发。最终提前两天上线。这次让我学到要先说清目标。',
    elapsedSec: 45
  });

  assert.equal(result.structureScore, 100);
  assert.equal(result.hasConclusion, true);
  assert.equal(result.hasReason, true);
  assert.equal(result.hasEvidence, true);
  assert.equal(result.hasClosing, true);
});

test('交付指标计算语速和停顿', () => {
  assert.deepEqual(measureDelivery({ durationSec: 60, totalWords: 120, pauseCount: 3, longestPauseMs: 1400 }), {
    rate: 120,
    pauseCount: 3,
    longestPauseMs: 1400
  });
});
