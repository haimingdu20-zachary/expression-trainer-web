const fs = require('fs');
const path = require('path');

const appRoot = path.join(__dirname, '..');
const modelDir = path.join(appRoot, 'models', 'sherpa-onnx-streaming-paraformer-bilingual-zh-en');
const requiredModels = ['encoder.int8.onnx', 'decoder.int8.onnx', 'tokens.txt'];

console.log(`[doctor] Node.js ${process.versions.node}`);
try {
  require.resolve('electron', { paths: [appRoot] });
  console.log('[doctor] Electron 依赖：已安装');
} catch (error) {
  console.error('[doctor] Electron 依赖：未安装，请先执行 npm install');
  process.exitCode = 1;
}

try {
  require.resolve('sherpa-onnx-node', { paths: [appRoot] });
  console.log('[doctor] Sherpa-ONNX 依赖：已安装');
} catch (error) {
  console.error('[doctor] Sherpa-ONNX 依赖：未安装，请先执行 npm install');
  process.exitCode = 1;
}

const missingModels = requiredModels.filter(file => !fs.existsSync(path.join(modelDir, file)));
if (missingModels.length) {
  console.error(`[doctor] ASR 模型：缺少 ${missingModels.join('、')}，请按 models/README.md 下载`);
  process.exitCode = 1;
} else {
  console.log('[doctor] ASR 模型：已就绪');
}
