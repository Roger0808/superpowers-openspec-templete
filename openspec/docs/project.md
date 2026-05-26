---
tags: [工作/项目, 项目/H5-周报系统, 项目规范, SDD 流程]
---

# H5 周报项目 - 项目规范与流程

**创建日期**: 2026-03-29
**版本**: v1.0
**项目**: H5 周报生成与编辑系统

---

## 📋 目录

1. [开发方法论](#1-开发方法论)
2. [SDD 完整流程](#2-sdd-完整流程)
3. [OpenSpec 技能命令](#3-openspec-技能命令)
4. [每步详细命令](#4-每步详细命令)
5. [归档前置条件](#5-归档前置条件)
6. [迭代复盘要点](#6-迭代复盘要点)

---

## 1. 开发方法论

本项目采用 **SDD (Specification-Driven Development)** 开发模式，结合 **Superpowers 框架** 和 **OpenSpec 规范**。

### 1.1 核心理念

- **规范先行**：先写规范文档，再写代码
- **流程驱动**：严格按照 Superpowers 流程执行
- **文档即代码**：规范文档与代码同等重要
- **持续验证**：每个阶段完成后验证是否符合规范

### 1.2 工具链

| 工具 | 用途 |
|------|------|
| Superpowers | AI 代理开发框架（方法论） |
| OpenSpec | 变更管理工具（CLI + 技能） |
| Claude Code | 代码生成与审查 |
| Git | 版本控制 |

### 1.3 安装命令

| 工具 | 安装命令 |
|------|----------|
| OpenSpec-cn | `npm install -g @studyzy/openspec-cn@latest` |
| Superpowers | 在 Claude Code 中运行 `/plugin install superpowers@claude-plugins-official` |

### 1.4 框架分层

```
Superpowers (方法论框架)
└── Brainstorming → Writing Plans → Code Review
                                    ↓
OpenSpec (变更管理工具)
└── new-change → continue-change → apply-change
                → verify-change → sync-specs → archive-change
                                    ↓
Testing (验证)
└── npm test → npm run test:e2e → 手动测试
```

---

## 2. SDD 完整流程

### 2.0 开始新迭代

**每次开启新迭代时，必须从 main 分支创建一个新的 feature 分支：**

```bash
git checkout main
git pull origin main
git checkout -b feature/<迭代名称>
```

> 禁止直接在 main 分支上进行功能开发。所有迭代都必须通过 feature 分支进行。

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Superpowers (方法论框架)                              │
│                                                                             │
│    Brainstorming ──► Writing Plans ──► Code Review                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OpenSpec (变更管理工具)                               │
│                                                                             │
│    new-change ──► continue-change ──► apply-change                           │
│                     (proposal)                       │                      │
│                     (design)                         ▼                      │
│                     (specs)                    verify-change                │
│                     (tasks)                         │                      │
│                                                   ▼                      │
│                                          sync-specs ──► archive-change    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Testing (验证)                                   │
│                                                                             │
│    npm test ──► npm run test:e2e ──► 手动测试                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 流程表（16步）

#### Phase 1: 需求探索（Superpowers）

| 步骤 | 命令/技能 | 输出 |
|------|-----------|------|
| 1 | `/superpowers:brainstorming` | 需求调研文档 |
| 2 | `/superpowers:writing-plans` | 01-04 需求文档 |

#### Phase 2: 变更创建（OpenSpec）

| 步骤 | 命令/技能 | 输出 |
|------|-----------|------|
| 3 | `npx openspec new change <变更名>` | 变更目录 |
| 4 | `/openspec-new-change` | 启动变更工作流 |
| 5 | `/openspec-continue-change` | proposal.md |
| 6 | `/openspec-continue-change` | design.md |
| 7 | `npx openspec instructions specs --change <变更名>` | specs/*.md |
| 8 | `/openspec-continue-change` | tasks.md |

#### Phase 3: 实施（OpenSpec）

| 步骤 | 命令/技能 | 输出 |
|------|-----------|------|
| 9 | `/openspec-apply-change` | 代码实现 |

#### Phase 4: 验证（OpenSpec + Testing）

| 步骤 | 命令/技能 | 输出 |
|------|-----------|------|
| 10 | `/openspec-verify-change` | 验证报告 |
| 11 | `npm test` | 单元测试 |
| 12 | `npm run test:e2e` | E2E测试 |
| 13 | 手动 | 阅读测试规范 + Chrome DevTools |

#### Phase 5: 代码审查（Superpowers）

| 步骤 | 命令/技能 | 输出 |
|------|-----------|------|
| 14 | `Agent(superpowers:code-reviewer)` | 审查报告 |

#### Phase 6: 完成归档（OpenSpec）

| 步骤 | 命令/技能 | 输出 |
|------|-----------|------|
| 15 | `/openspec-sync-specs` | 同步到主规范 |
| 16 | `/openspec-archive-change` | 归档完成 |

---

## 3. OpenSpec 技能命令

### 3.1 完整技能列表（10个）

| 技能命令 | 用途 |
|----------|------|
| `/openspec-explore` | 探索思路的思考伙伴 |
| `/openspec-new-change` | 开始新变更 |
| `/openspec-continue-change` | 创建下一个制品 |
| `/openspec-ff-change` | 快速跳过所有规划制品 |
| `/openspec-apply-change` | 实施任务（写代码） |
| `/openspec-verify-change` | 验证实施完整性 |
| `/openspec-sync-specs` | 同步增量规范到主线 |
| `/openspec-archive-change` | 归档已完成的变更 |
| `/openspec-bulk-archive-change` | 批量归档多个变更 |
| `/openspec-onboard` | 引导式入职 |

### 3.2 CLI 命令

| 命令 | 用途 |
|------|------|
| `npx openspec new change <变更名>` | 创建变更目录结构 |
| `npx openspec status --change <变更名>` | 查看变更状态 |
| `npx openspec list` | 列出所有变更 |
| `npx openspec archive <变更名>` | 归档变更 |

---

## 4. 每步详细命令

### Phase 1: 需求探索

#### 第1步：Brainstorming

```bash
# 阅读项目能力清单
cat openspec/docs/capabilities.md

# 执行技能
/superpowers:brainstorming
```

**输出**：`openspec/docs/00-requirements-research-<变更>.md`

---

#### 第2步：Writing Plans

```bash
# 执行技能
/superpowers:writing-plans
```

**输出**：
- `openspec/docs/01-requirements-<变更>.md`
- `openspec/docs/02-PRD-<变更>.md`
- `openspec/docs/03-architecture-<变更>.md`
- `openspec/docs/04-tasks-<变更>.md`

---

### Phase 2: 变更创建

#### 第3步：创建变更目录

```bash
# 创建变更目录结构
npx openspec new change <变更名>

# 验证
npx openspec status --change <变更名>
```

---

#### 第4步：OpenSpec New Change

```bash
# 启动变更工作流
/openspec-new-change
```

**输出**：启动变更工作流，创建 proposal.md 等制品

---

#### 第5步：Continue Change（proposal）

```bash
/openspec-continue-change
```

**输出**：`openspec/changes/<变更名>/proposal.md`

---

#### 第6步：Continue Change（design）

```bash
/openspec-continue-change
```

**输出**：`openspec/changes/<变更名>/design.md`

---

#### 第7步：Specs 生成

```bash
# 获取创建 specs 的指导
npx openspec instructions specs --change <变更名>

# 根据指导创建 specs 文档
# 例如：cp -r openspec/specs/<capability>/* openspec/changes/<变更名>/specs/

# 验证
npx openspec status --change <变更名> --json
```

**输出**：
- `openspec/changes/<变更名>/specs/01-type-definitions.md`
- `openspec/changes/<变更名>/specs/02-component-interfaces.md`
- `openspec/changes/<变更名>/specs/03-api-specifications.md`
- `openspec/changes/<变更名>/specs/04-test-specifications.md`

---

#### 第8步：Continue Change（tasks）

```bash
/openspec-continue-change
```

**输出**：`openspec/changes/<变更名>/tasks.md`

---

### Phase 3: 实施

#### 第9步：Apply Change

```bash
# 实施任务（写代码）
/openspec-apply-change

# 验证构建
npm run build:check
```

**输出**：代码实现

---

### Phase 4: 验证

#### 第10步：Verify Change

```bash
/openspec-verify-change
```

**输出**：验证报告

---

#### 第11步：单元测试

```bash
npm test
```

---

#### 第12步：端到端测试

```bash
# 新终端：启动开发服务器
npm run dev

# 运行 E2E 测试
npm run test:e2e
```

---

#### 第13步：手动测试

```bash
# 阅读测试规范
cat openspec/changes/<变更名>/specs/04-test-specifications.md

# 启动开发服务器
npm run dev
# 访问 http://localhost:5173

# 使用 Chrome DevTools 移动端模拟执行测试
```

---

### Phase 5: 代码审查

#### 第14步：Code Review

```bash
# 获取 SHA
BASE_SHA=$(git log --oneline | tail -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

# 执行 code-reviewer 子代理
Agent(superpowers:code-reviewer)
```

**输出**：审查报告

---

### Phase 6: 完成归档

#### 第15步：Sync Specs

```bash
/openspec-sync-specs
```

**输出**：同步 delta specs 到 `openspec/specs/<capability>/`

---

#### 第16步：Archive Change

```bash
/openspec-archive-change
```

**输出**：归档完成

**❌ 常见错误**：认为"合并到 main"是最后一步。归档才是 SDD 流程的最后一步。

---

## 5. 归档前置条件

执行第16步归档前必须全部满足：

| 条件 | 验证命令 |
|------|----------|
| 所有 artifacts 状态为 `done` | `npx openspec status --change <变更名> --json` |
| 代码实现完成 | `npm run build:check` |
| 验证通过 | `/openspec-verify-change` |
| 单元测试通过 | `npm test` |
| E2E 测试通过 | `npm run test:e2e` |
| 手动测试通过 | 手动确认 |
| Code Review 完成 | 审查报告无 Critical |

---

## 6. 迭代复盘要点

每次迭代后记录：

1. **流程执行情况**：哪些步骤被跳过？为什么？
2. **规范偏离**：是否有未按规范实现的内容？
3. **测试缺口**：哪些测试未执行？
4. **改进建议**：下次迭代如何避免同样问题？

---

## 📝 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-03-29 | v1.0 | 初始版本 |
| 2026-04-09 | v1.9 | 重构 project.md - 正确SDD流程：Superpowers需求探索 → OpenSpec变更创建 → 实施 → 验证 → CodeReview → 归档 |
| 2026-04-27 | v2.0 | AI 并行化处理优化与页面多余内容清理（parallel-ai-ui-optimization） |

---

**本文档用于记录项目开发规范和流程，供后续迭代参考**
