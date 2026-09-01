const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // 设置
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  openSettings: () => ipcRenderer.invoke('open-settings'),

  // Prompt编辑器
  openPromptEditor: () => ipcRenderer.invoke('open-prompt-editor'),
  getCustomPrompt: () => ipcRenderer.invoke('get-custom-prompt'),
  saveCustomPrompt: (data) => ipcRenderer.invoke('save-custom-prompt', data),
  closeWindow: () => ipcRenderer.invoke('close-current-window'),

  // 语音识别 - 使用 Web Audio 方案
  initASR: () => ipcRenderer.invoke('init-asr'),
  feedAudio: (samples) => ipcRenderer.invoke('feed-audio', Array.from(samples)),
  stopASR: () => ipcRenderer.invoke('stop-asr'),
  onASRResult: (callback) => {
    ipcRenderer.on('asr-result', (event, data) => callback(data));
  },
  removeASRListener: () => {
    ipcRenderer.removeAllListeners('asr-result');
  },

  // 词库分析
  analyzeText: (text) => ipcRenderer.invoke('analyze-text', text),
  analyzeLogic: (data) => ipcRenderer.invoke('analyze-logic', data),

  // AI反馈
  getRealtimeFeedback: (data) => ipcRenderer.invoke('get-realtime-feedback', data),
  getFollowupQuestion: (data) => ipcRenderer.invoke('get-followup-question', data),
  getQuestion: (data) => ipcRenderer.invoke('get-question', data),
  getFinalReport: (data) => ipcRenderer.invoke('get-final-report', data),
  testLLMConnection: (settings) => ipcRenderer.invoke('test-llm-connection', settings),

  // 文件保存
  saveFile: (content, filename) => ipcRenderer.invoke('save-file', content, filename),
});
