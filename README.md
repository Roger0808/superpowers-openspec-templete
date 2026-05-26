# 🚀 Superpowers + OpenSpec 联合开发规范 (SDD 实践模板)

本项目是基于 **SDD (Specification-Driven Development，规范驱动开发)** 模式的工程实践模板。它深度融合了 **Superpowers 需求探索方法论** 与 **OpenSpec 变更规范管理工具**，为您提供了一套由 AI Agent 辅助的高质量、文档先行、规范且安全的敏捷开发工作流。

为了方便理解与参考，本项目内置了一个完整的 **「H5 周报生成与编辑系统」** 作为 SDD 的实践与迭代范例（采用 Vue 3 + TypeScript + Vite + Tailwind CSS 技术栈）。

---

## 📋 快速导航

- [1. 核心理念与工具链](#1-核心理念与工具链)
- [2. SDD 联合开发流程 (16 步)](#2-sdd-联合开发流程-16-步)
- [3. AI Agent (例如 Claude Code) 引导与操作指南](#3-ai-agent-例如-claude-code-引导与操作指南)
- [4. 内置案例架构参考 (H5 周报系统)](#4-内置案例架构参考-h5-周报系统)
- [5. 模板使用与快速上手](#5-模板使用与快速上手)

---

## 1. 核心理念与工具链

### 1.1 核心理念

> [!NOTE]
> - **规范先行**：先构思需求，编写规范文档与任务拆解，再进行代码实施。
> - **流程驱动**：严格按照 Superpowers 需求规划和 OpenSpec 变更阶段推进。
> - **文档即代码**：规范文件与项目源码同样是核心资产，随版本同步更新演进。
> - **持续验证**：在每一阶段执行单元测试、E2E 测试和手动测试，保障交付质量。

### 1.2 工具链分层

```
┌─────────────────────────────────────────────────────────┐
│               Superpowers (需求与方法论框架)             │
│   └── 步骤: Brainstorming ──► Writing Plans             │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               OpenSpec (规范与变更管理工具)              │
│   └── 步骤: new-change ──► continue-change ──► apply    │
│            ──► verify ──► sync-specs ──► archive        │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   Testing (多重自动化验证)               │
│   └── 工具: Vitest ──► Playwright (E2E) ──► 手动 Review │
└─────────────────────────────────────────────────────────┘
```

---

## 2. SDD 联合开发流程 (16 步)

### 2.0 开启新迭代的前置条件
**每次开启新迭代或开发新特性时，必须从 main 分支创建一个新的 feature 分支：**
```bash
git checkout main
git pull origin main
git checkout -b feature/<迭代名称>
```
> [!WARNING]
> 禁止直接在 main 分支上开发。所有迭代均需通过 feature 分支进行，并在归档及代码审查通过后以 Pull Request 形式合并。

### 2.1 联合流程概览表

| 阶段 | 步骤 | 命令/技能 | 输出/制品 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1: 需求探索**<br>(Superpowers) | 1 | `/superpowers:brainstorming` | `00-requirements-research-<变更>.md` | 深入调研痛点、现状与限制 |
| | 2 | `/superpowers:writing-plans` | `01-requirements`, `02-PRD`, `03-architecture`, `04-tasks` | 规划需求、原型与技术方案 |
| **Phase 2: 变更创建**<br>(OpenSpec) | 3 | `npx openspec new change <变更名>` | 初始化变更目录结构 | 在 `openspec/changes/` 下创建目录 |
| | 4 | `/openspec-new-change` | 启动变更工作流并创建制品清单 | - |
| | 5 | `/openspec-continue-change` | `openspec/changes/<变更名>/proposal.md` | 项目提案与大纲 |
| | 6 | `/openspec-continue-change` | `openspec/changes/<变更名>/design.md` | 架构与设计细节 |
| | 7 | `npx openspec instructions specs --change <变更名>` | `specs/` 目录规范生成 | 创建 API、组件、类型与测试规范 |
| | 8 | `/openspec-continue-change` | `openspec/changes/<变更名>/tasks.md` | 子任务及 TODO 清单 |
| **Phase 3: 实施** | 9 | `/openspec-apply-change` | 编写代码与实现逻辑 | 实际进入代码开发阶段 |
| **Phase 4: 验证** | 10 | `/openspec-verify-change` | `/openspec-verify-change` 报告 | 验证规范实现的完整性 |
| | 11 | `npm test` | 单元测试报告 | 检验核心逻辑正确性 |
| | 12 | `npm run test:e2e` | 端到端测试报告 | 模拟浏览器核心操作链路 |
| | 13 | 手动测试 | 查阅 `04-test-specifications.md` | Chrome DevTools 调试及移动端适配测试 |
| **Phase 5: 代码审查** | 14 | `Agent(superpowers:code-reviewer)`| 代码审查报告 | 提交前的人工/AI 交叉审查 |
| **Phase 6: 同步与归档**| 15 | `/openspec-sync-specs` | 更新 `openspec/specs/` | 将本次增量变更同步到主线规范中 |
| | 16 | `/openspec-archive-change` | 变更归档，移入归档目录 | 标志着本轮 SDD 迭代圆满结束 |

### 2.2 归档前置检查表
在执行最后一步 `/openspec-archive-change` 前，必须满足以下所有条件：
* [ ] 变更的所有 artifacts 状态在 `npx openspec status` 中均显示为 `done`。
* [ ] 代码成功编译构建，运行 `npm run build:check` 无 TypeScript 类型错误及打包异常。
* [ ] 运行 `/openspec-verify-change` 全通过，未出现任何遗漏。
* [ ] 单元测试 `npm test` 100% 通过。
* [ ] 跑通 E2E 测试 `npm run test:e2e`。
* [ ] 审查报告无 Critical 级别问题。

---

## 3. AI Agent (例如 Claude Code) 引导与操作指南

本指南供 AI 代理或开发者配合 IDE 终端工具（如 Claude Code, Cursor, Trae）进行开发时参考。

### 3.1 常用脚本命令
```bash
npm run dev          # 启动本地开发服务器 (默认端口 localhost:5173)
npm run build        # 生产环境打包编译，输出至 dist/
npm run build:check  # TypeScript 类型安全检查 + 生产环境打包
npm run lint         # 运行 ESLint 静态代码检查 (支持 --fix 自动修复)
npm run format       # 使用 Prettier 自动格式化代码
npm run test         # 启动 Vitest 单元测试
npm run test:coverage # 运行单元测试并生成覆盖率报告
npm run test:e2e     # 运行 Playwright E2E 测试 (需先启动 dev 服务器)
```

### 3.2 提交规范
Git 提交信息格式建议使用 Angular 规范：
```
<type>(<scope>): <subject>

例如：
feat(editor): 添加富文本与 Markdown 双模式编辑器
fix(upload): 修复移动端下拖拽文件解析失败的问题
docs: 整合 project.md 与 CLAUDE.md 至根目录 README.md
```

### 3.3 开发指导与注意事项
- **单例状态管理**：使用 Vue 3 响应式 `reactive()` 属性构建轻量化全局单例 Store，**无需**引入 Pinia。
- **组合式命名**：所有的业务 Composables 遵循 `use{Feature}` 命名格式并输出独立方法。
- **环境检查**：构建检查时请务必使用 `vue-tsc` 进行类型检查，而不是默认的 `tsc`。
- **静态部署**：由于本项目可能以静态方式部署在托管平台（如 GitHub Pages），请确保 `vite.config.ts` 中的 `base` 配置支持相对路径。

---

## 4. 内置案例架构参考 (H5 周报系统)

本项目内置的周报生成器为单页应用（SPA），包含了前四次迭代的完整 SDD 制品归档（位于 `openspec/changes/archive/`）。

### 4.1 目录结构
```
superpowers-openspec-templete/
├── src/                    # 示例前端应用源码
│   ├── components/         # 组件层 (分类归类、编辑器、通用组件)
│   ├── pages/              # 页面层 (首页 HomePage.vue、编辑页 EditorPage.vue)
│   ├── composables/        # 业务逻辑组合式函数
│   ├── services/           # 基础设施服务 (LLM 客户端代理等)
│   ├── types/              # TypeScript 类型声明
│   └── utils/              # 工具函数 (并发队列控制、内容过滤等)
├── openspec/               # OpenSpec 规范主目录
│   ├── specs/              # 主线规范（最新系统的组件、接口及测试规范）
│   ├── changes/            # 活跃的增量变更开发目录
│   │   └── archive/        # 历史已归档的迭代变更包 (包含 design, proposal, tasks)
│   └── docs/               # 首次开发时产生的全局需求、架构设计制品
├── scripts/                # 构建与脚本自动化目录 (包含周报脚本和版本控制)
├── skills/                 # AI Agent 导入的自动化 skills (周报飞书离线包)
└── tests/                  # 单元测试与端到端测试用例
```

### 4.2 H5 周报核心业务规则

#### 1. 七大固定章节结构
系统会固定将周报汇总并组织成七大章节：
1. **来福商城** (`chapter-1`)
2. **三方项目 (开发中)** (`chapter-2`)
3. **采购与集采管理** (`chapter-3`)
4. **三方供应链** (`chapter-4`)
5. **销售与财务管理** (`chapter-5`)
6. **竞价平台与异常单** (`chapter-6`)
7. **履约监控与物流一体化** (`chapter-7`)

#### 2. 内容自动过滤规则 (`useContentFilter.ts`)
在进行内容整理或利用 LLM 进行润色过滤时，必须严格遵守以下规则：
- **规则 1**：剔除任何包含 “跟进中” 或 “调研中” 的未决内容。
- **规则 2**：不汇报“周后内容”（即时间戳超出了当周汇报范围的数据）。
- **规则 3**：忽略括号中 `[]` 或 `【】` 的附加备注。

#### 3. LLM 智能分类与润色 (MiniMax 集成)
通过 `src/services/LLMService.ts` 接入 MiniMax 智能服务。若用户提供了 `VITE_MINIMAX_API_KEY` 及 `VITE_MINIMAX_MODEL_ID` 环境变量，应用可自动启动 AI 归类模式，并发对复杂的表格内容进行润色与排版，支持指数退避重试和并发流量控制。

---

## 5. 模板使用与快速上手

如果您需要在此模板基础上启动一个全新的 SDD 项目：

1. **克隆项目并配置环境**：
   ```bash
   git clone https://github.com/Roger0808/superpowers-openspec-templete.git my-new-project
   cd my-new-project
   npm install
   ```
2. **复制环境变量模板**：
   ```bash
   cp .env.example .env
   # 在 .env 中填入大模型服务商的 API Key (若需要运行 AI 服务)
   ```
3. **清理旧有示例（可选）**：
   您可以根据需要保留 `src/` 中的业务架构作为骨架，或将其替换为您的业务代码，同时清空 `openspec/changes/archive/` 下的旧归档，来开启一个全新的第一轮 SDD 迭代。
4. **开始第一轮迭代**：
   跟随 [SDD 联合开发流程](#2-sdd-联合开发流程-16-步) 开启您的需求探索！

---

## 🤝 参与贡献

1. Fork 本仓库。
2. 基于 `main` 分支拉出您的特性分支 (`git checkout -b feature/AmazingFeature`)。
3. 提交您的修改 (`git commit -m 'feat: Add some AmazingFeature'`)。
4. 推送分支 (`git push origin feature/AmazingFeature`)。
5. 提起一个 Pull Request。

---

## 📄 许可证
[MIT License](./LICENSE)
