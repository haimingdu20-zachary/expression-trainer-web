const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLexicon, analyzeText } = require('../lib/lexicon');

loadLexicon();

test('识别填充词、犹豫词和笼统词', () => {
  const result = analyzeText('嗯，我觉得这个方案很好，然后我们可能还要再想想。');

  assert.ok(result.fillers.length >= 2);
  assert.ok(result.hedges.length >= 2);
  assert.ok(result.vagueWords.some(item => item.word === '很好'));
  assert.ok(result.suggestions.length > 0);
});
