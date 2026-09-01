# 表达练习室｜表达与思维训练

一个帮助用户把想法、经历和工作内容讲清楚的表达训练产品。

## 在线体验

- [打开网页版](https://svf9v5n51r2vvjbq6qkeu.apigateway-cn-beijing.volceapi.com/)

网页版 MVP 支持：

- 选择训练场景、表达结构和目标时长；
- 浏览器麦克风录音与实时字幕；
- 笼统词、填充词、犹豫词分析；
- 表达密度、语速、停顿统计；
- 训练复盘、历史记录和报告下载。

## 本地运行网页版

进入网页目录后，用静态服务器打开。麦克风和浏览器语音识别建议使用 HTTPS 或 `localhost`，推荐最新版 Chrome / Edge。

```bash
cd frontend-prototype
python3 -m http.server 4173
```

然后访问 <http://localhost:4173>。

## 项目结构

```text
frontend-prototype/       # 可部署的网页版 MVP
表达能力训练MVP/           # Electron + Sherpa-ONNX 桌面版
第一阶段技术开发文档...     # 产品反推与核心交互定义
第三阶段技术适配声明...     # 生产化技术路线
第三阶段技术开发文档...     # 生产化实现说明
```

## 当前版本边界

- 网页版训练记录和录音默认保存在当前浏览器本地；
- 网页版 AI 出题当前使用本地题库，不在前端暴露模型密钥；
- 正式账号、跨设备同步、云端 AI 代理和对象存储仍属于后续开发内容；
- Electron 版的 ASR 模型文件较大，不提交到 Git。

## 分支

- `phase-1-product-prototype`：产品原型
- `phase-2-frontend-interaction`：前端交互
- `phase-3-production`：生产化与网页版 MVP

## 开源说明

本项目以 MIT License 开源。请勿将 API Key、云平台密钥、个人录音或 ASR 模型文件提交到仓库。

