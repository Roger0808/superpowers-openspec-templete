# H5 周报生成与编辑系统

基于 Excel 解析的智能周报工具，支持手机/电脑编辑，一键导出 Markdown。

![Version](https://img.shields.io/badge/version-v0.2.0-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.5-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Progress](https://img.shields.io/badge/进度 -80\%-brightgreen.svg)

---

## 📋 快速导航

- [项目状态](#-项目状态)
- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [开发规范](#-开发规范)
- [访问地址](#-访问地址)

---

## 📊 项目状态

**当前版本**: v0.2.0
**总体进度**: 90% ✅
**开发阶段**: v0.2 大模型迭代完成

| 阶段 | 内容 | 状态 | 完成度 |
|------|------|------|--------|
| Phase 1 | 需求分析 | ✅ 完成 | 100% |
| Phase 2 | 核心功能 | ✅ 完成 | 100% |
| Phase 3 | 编辑器开发 | ✅ 完成 | 100% |
| Phase 4 | 导出与优化 | ✅ 完成 | 100% |
| v0.2 | 大模型迭代 | ✅ 完成 | 95% |

**开发方式**: SDD (Superpowers + OpenSpec)

---

## ✨ 功能特性

### 核心功能
- 📤 **Excel 拖拽上传** - 支持拖拽上传，自动解析周报数据
- 🤖 **AI 智能解析** (v0.2) - 基于 MiniMax API 的 LLM 解析
- 📊 **智能数据映射** - 自动映射产品组到 7 个章节
- 🎨 **模板生成** - 基于上周模板生成本周结构
- 📝 **双模式编辑** - 富文本 + Markdown 一键切换
- 📥 **多格式导出** - Markdown (MVP) / Word / PDF

### AI 智能解析 (v0.2)
- 🤖 **LLM 解析模式** - 切换为 AI 模式进行智能解析
- 🏷️ **内容过滤规则**：
  - 规则1：跟进中、调研中的内容不汇报
  - 规则2：不汇报周后内容
  - 规则3：括号内的内容不汇报
- ✨ **内容润色** - 一键优化周报文案
- 📈 **解析进度** - 实时显示解析进度

### 编辑器功能
- ✏️ **富文本编辑器** - 加粗/斜体/列表/标题
- 📝 **Markdown 编辑器** - 源码编辑 + 实时预览
- 📑 **章节导航** - 7 个章节快速切换
- 💾 **自动保存** - 每 30 秒自动保存防丢失

### 移动端优化
- 📱 **响应式布局** - 支持手机/平板/桌面
- 👆 **触摸友好** - 优化移动端交互体验
- 🎨 **折叠导航** - 移动端自动折叠侧边栏

---

## 🛠️ 技术栈

### 核心框架
| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.5.30+ | 前端框架 |
| Vite | 8.0.1+ | 构建工具 |
| TypeScript | 5.9.3+ | 类型安全 |

### UI 组件
| 技术 | 版本 | 用途 |
|------|------|------|
| Element Plus | 2.13.6+ | 组件库 |
| Tailwind CSS | 3.4.19+ | 样式框架 |
| Quill | 1.3.7+ | 富文本编辑器 |

### 核心依赖
| 技术 | 用途 |
|------|------|
| xlsx | Excel 解析 |
| marked | Markdown 渲染 |
| html2pdf.js | PDF 生成 |
| minimax-docx | Word 生成 |

### 开发工具
| 工具 | 用途 |
|------|------|
| Vitest | 单元测试 |
| ESLint | 代码检查 |
| Prettier | 代码格式化 |

---

## 🚀 快速开始

### 1. 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. 安装依赖
```bash
git clone https://github.com/Roger0808/h5-weekly-report.git
cd h5-weekly-report
npm install
```

### 3. 开发模式
```bash
npm run dev
```
访问 http://localhost:5173

### 4. 构建生产版本
```bash
npm run build
```

### 5. 部署
```bash
# 构建产物在 dist/ 目录
# 部署到文件服务器
cp -r dist/* /home/roger/.openclaw/file-server/h5-weekly-report/
```

---

## 📁 项目结构

```
h5-weekly-report/
├── src/
│   ├── components/
│   │   ├── Layout/         # 布局组件（4 个）
│   │   ├── editor/         # 编辑器组件（2 个）
│   │   ├── common/         # 通用组件（5 个）
│   │   ├── classification/ # 归类组件（v0.3 新增）
│   │   └── __tests__/      # 测试文件
│   ├── pages/              # 页面组件（2 个）
│   │   ├── HomePage.vue    # 首页
│   │   └── EditorPage.vue  # 编辑页
│   ├── composables/        # 组合式函数
│   ├── services/           # 服务层（LLMService 等）
│   ├── types/              # 类型定义
│   ├── utils/              # 工具函数
│   └── styles/             # 样式文件
├── openspec/               # OpenSpec 规范框架
│   ├── specs/              # 项目主规范
│   ├── changes/            # 变更（content-classification 等）
│   ├── docs/               # 提案和参考文档
│   └── README.md           # OpenSpec 使用指南
├── project.md              # 项目规范（Superpowers + OpenSpec）
├── capabilities.md         # 项目能力清单
├── README.md
├── package.json
└── vite.config.ts
```

---

## 📐 开发规范

本项目采用 **SDD (Specification-Driven Development)** 开发模式。

### 开发流程
```
Brainstorming → Writing Plans → Executing Plans → Code Review
     ↓              ↓                 ↓               ↓
  需求分析      文档编写          代码开发        代码审查
```

### 规范文档
详见 [`project.md`](./project.md)：
- Superpowers 框架流程
- OpenSpec 规范流程
- 代码规范（Vue/TypeScript/Git）
- 项目结构规范

### 提交规范
```
<type>(<scope>): <subject>

示例：
feat(editor): 添加 Markdown 编辑器组件
fix(upload): 修复移动端文件上传问题
docs: 更新 README.md
```

---

## 📍 访问地址

| 环境 | 地址 |
|------|------|
| **内网测试** | http://192.168.1.245:18080/h5-weekly-report/ |
| **进度追踪** | http://192.168.1.245:18080/h5-weekly-report-progress/ |
| **GitHub** | https://github.com/Roger0808/h5-weekly-report |

---

## 📝 变更日志

### v0.2.0 (2026-04-02) - 大模型迭代
- ✅ **LLM 服务层** - MiniMax API 封装
- ✅ **内容过滤规则** - 跟进中/调研中/周后/括号内内容过滤
- ✅ **AI 智能解析** - LLM 替代关键词解析
- ✅ **HomePage 集成** - 解析模式切换、进度显示
- ✅ **内容润色功能** - 一键优化周报文案
- ✅ **单元测试** - LLMService、contentFilter 测试

### v0.1.1 (2026-03-29)
- ✅ Phase 4 导出与优化完成（90%）
- ✅ 代码结构整理和归类
- ✅ 添加 project.md 规范文档
- ✅ 清理根目录配置文件

### v0.2.0 (2026-03-29)
- ✅ Phase 3 编辑器开发完成
- ✅ 富文本编辑器 + Markdown 编辑器
- ✅ 章节导航组件
- ✅ 自动保存功能

### v0.1.0 (2026-03-28)
- ✅ Phase 1-2 完成
- ✅ 核心功能开发
- ✅ OpenSpec 规范生成

---

## 📊 代码统计

| 类别 | 文件数 | 代码行数 |
|------|--------|----------|
| 组件 | 13 | ~2,500 |
| Composables | 3 | ~1,000 |
| 页面 | 2 | ~600 |
| 类型定义 | 1 | ~150 |
| 文档 | 12 | ~3,000 |
| **总计** | **31** | **~7,250** |

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License

---

## 📞 联系方式

**项目负责人**: 老馒头  
**开发团队**: 小 c (Claude Code) + 小 r (Research)  
**开发方式**: SDD (Superpowers + OpenSpec + Claude Code)

---

**最后更新**: 2026-04-02
**状态**: v0.2 大模型迭代完成 🚀
