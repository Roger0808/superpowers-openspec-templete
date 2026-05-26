# 项目能力清单

**创建日期**: 2026-04-03
**版本**: v1.0
**项目**: H5 周报系统

> 📚 本文档记录项目的技术栈、已有组件和能力，供每次迭代时参考。
> ⚠️ **重要**：每次新迭代时，必须先阅读本文档，避免重复造轮子。

---

## 📋 目录

1. [技术栈清单](#1-技术栈清单)
2. [前端框架](#2-前端框架)
3. [UI 组件](#3-ui-组件)
4. [工具库](#4-工具库)
5. [业务组件](#5-业务组件)
6. [类型定义](#6-类型定义)
7. [API 服务](#7-api-服务)
8. [状态管理](#8-状态管理)
9. [迭代记录](#9-迭代记录)

---

## 1. 技术栈清单

### 1.1 核心技术栈

| 技术 | 版本 | 用途 | 文档位置 |
|------|------|------|----------|
| Vue 3 | ^3.4 | 前端框架 | - |
| TypeScript | ^5.3 | 类型系统 | - |
| Vite | ^5.0 | 构建工具 | - |
| Pinia | ^2.1 | 状态管理 | - |
| Vue Router | ^4.2 | 路由管理 | - |

### 1.2 Office 文档处理

| 技术 | 版本 | 用途 | 文档位置 |
|------|------|------|----------|
| xlsx (SheetJS) | ^0.20.0 | Excel 解析 | [useExcelParser.ts](file:///Users/yangjing/code/h5-weekly-report/src/composables/useExcelParser.ts) |
| docx | ^8.5.0 | Word 生成 | 待开发 |

### 1.3 AI/LLM 能力

| 技术 | 版本 | 用途 | 文档位置 |
|------|------|------|----------|
| MiniMax API | - | 大模型调用 | [LLMService.ts](file:///Users/yangjing/code/h5-weekly-report/src/services/LLMService.ts) |

### 1.4 样式

| 技术 | 版本 | 用途 |
|------|------|------|
| CSS | 原生 | 样式 |
| 原生 CSS 变量 | - | 主题配置 |

---

## 2. 前端框架

### 2.1 Vue 3 组合式 API

项目使用 **Vue 3 Composition API**，所有业务逻辑封装在 `composables` 目录。

**命名规范**：`use{功能名}.ts`

**示例**：
```typescript
// src/composables/useExcelParser.ts
export function useExcelParser() {
  // ...
}
```

---

## 3. UI 组件

### 3.1 通用组件

| 组件 | 路径 | 功能 |
|------|------|------|
| ChapterNav.vue | `src/components/common/ChapterNav.vue` | 章节导航 |
| ExportPanel.vue | `src/components/common/ExportPanel.vue` | 导出面板 |
| LLMModeToggle.vue | `src/components/common/LLMModeToggle.vue` | LLM 模式切换 |
| LLMStatusBadge.vue | `src/components/common/LLMStatusBadge.vue` | LLM 状态徽章 |
| ParseProgressBar.vue | `src/components/common/ParseProgressBar.vue` | 解析进度条 |

### 3.2 编辑器组件

| 组件 | 路径 | 功能 |
|------|------|------|
| MarkdownEditor.vue | `src/components/editor/MarkdownEditor.vue` | Markdown 编辑器 |
| PolishButton.vue | `src/components/editor/PolishButton.vue` | 润色按钮 |
| RichTextEditor.vue | `src/components/editor/RichTextEditor.vue` | 富文本编辑器 |

---

## 4. 工具库

### 4.1 内容处理

| 工具 | 路径 | 功能 |
|------|------|------|
| contentFilter.ts | `src/utils/contentFilter.ts` | 内容过滤规则 |
| 过滤规则 | - | 跟进中、调研中、周后内容、括号内内容 |

---

## 5. 业务组件（Composables）

### 5.1 Excel 处理

| 组件 | 路径 | 功能 | 优先级 |
|------|------|------|--------|
| useExcelParser | `src/composables/useExcelParser.ts` | Excel 解析 | ✅ 已有 |
| useFilterRules | `src/composables/useFilterRules.ts` | 过滤规则 | ✅ 已有 |

**能力**：
- ✅ 解析 `.xlsx`、`.xls` 文件
- ✅ 提取 `会议时间点`、`产品组`、`同步信息内容` 三列
- ✅ 支持"本周内容"Sheet（兼容 Sheet1）
- ✅ 文件大小校验（≤ 10MB）
- ✅ 列名校验

**缺失**：
- ❌ 批量处理
- ❌ 自定义列映射

---

### 5.2 LLM 处理

| 组件 | 路径 | 功能 | 优先级 |
|------|------|------|--------|
| LLMService | `src/services/LLMService.ts` | LLM 服务封装 | ✅ 已有 |
| useLLMParser | `src/composables/useLLMParser.ts` | LLM 解析器 | ✅ 已有 |
| useContentMapper | `src/composables/useContentMapper.ts` | 内容映射 | ✅ 已有 |
| useContentPolisher | `src/composables/useContentPolisher.ts` | 内容润色 | ✅ 已有 |

**能力**：
- ✅ MiniMax API 封装（chat、prompt 构建）
- ✅ 支持 `abab6-chat`、`abab5.5-chat` 模型
- ✅ 请求重试（指数退避）
- ✅ 超时处理
- ✅ 错误类型定义（LLMError、LLMErrorCode）
- ✅ 章节映射（7 个章节）
- ✅ 状态识别（completed、in_progress、planned）
- ✅ 状态标签提取（[完结]、[变更]、[无变更]）
- ✅ 截止时间提取
- ✅ 负责人提取

**缺失**：
- ❌ 归类预览 UI
- ❌ 归类编辑 UI
- ❌ 归类确认机制

---

### 5.3 报告生成

| 组件 | 路径 | 功能 | 优先级 |
|------|------|------|--------|
| useReportStore | `src/composables/useReportStore.ts` | 报告状态管理 | ✅ 已有 |
| useReportExporter | `src/composables/useReportExporter.ts` | 报告导出 | ✅ 已有 |
| useTemplateManager | `src/composables/useTemplateManager.ts` | 模板管理 | ✅ 已有 |
| useContentFilter | `src/composables/useContentFilter.ts` | 内容过滤 | ✅ 已有 |

**能力**：
- ✅ Pinia 状态管理
- ✅ Markdown 导出
- ✅ 模板管理
- ✅ 内容过滤

**缺失**：
- ❌ PDF 导出

---

### 5.4 内容归类（v0.3 新增）

| 组件 | 路径 | 功能 | 优先级 |
|------|------|------|--------|
| useClassificationStore | `src/composables/useClassificationStore.ts` | 归类状态管理 | 🔴 v0.3 |
| useWordGenerator | `src/composables/useWordGenerator.ts` | Word 生成 | 🔴 v0.3 |

**能力**（v0.3）：
- 🔄 Excel 内容智能归类（按产品组、状态、标签）
- 🔄 用户确认机制
- 🔄 归类结果编辑
- 🔄 Word 周报生成（P2C 格式）
- 🔄 文件导出

**类型定义**：
| 类型 | 路径 | 说明 |
|------|------|------|
| ClassificationItem | `src/types/classification.ts` | 归类项 |
| ClassificationResult | `src/types/classification.ts` | 归类结果 |
| ProductGroup | `src/types/classification.ts` | 产品组（7 个） |
| ClassificationStatus | `src/types/classification.ts` | 状态（已上线/开发中） |
| StatusTag | `src/types/classification.ts` | 状态标签 |
| WordTemplate | `src/types/word.ts` | Word 模板 |

**UI 组件**：
| 组件 | 路径 | 功能 |
|------|------|------|
| ClassificationPreview | `src/components/classification/ClassificationPreview.vue` | 归类预览 |
| ClassificationEditor | `src/components/classification/ClassificationEditor.vue` | 归类编辑 |
| ClassificationList | `src/components/classification/ClassificationList.vue` | 归类列表 |
| ClassificationItemCard | `src/components/classification/ClassificationItemCard.vue` | 归类卡片 |
| ClassificationStats | `src/components/classification/ClassificationStats.vue` | 归类统计 |

---

---

## 6. 类型定义

### 6.1 Excel 类型

| 类型 | 位置 | 说明 |
|------|------|------|
| ExcelRow | `src/types/excel.ts` | Excel 行数据 |
| ParsedExcelData | `src/types/excel.ts` | 解析结果 |

### 6.2 归类类型（v0.3 新增）

| 类型 | 位置 | 说明 |
|------|------|------|
| ClassificationItem | `src/types/classification.ts` | 归类项 |
| ClassificationResult | `src/types/classification.ts` | 归类结果 |
| ClassificationRequest | `src/types/classification.ts` | 归类请求 |
| ClassificationError | `src/types/classification.ts` | 归类错误 |
| ClassificationStats | `src/types/classification.ts` | 归类统计 |
| ClassificationState | `src/types/classification.ts` | 归类状态 |
| ProductGroup | `src/types/classification.ts` | 产品组类型 |
| ClassificationStatus | `src/types/classification.ts` | 状态类型 |
| StatusTag | `src/types/classification.ts` | 状态标签类型 |

### 6.3 Word 类型（v0.3 新增）

| 类型 | 位置 | 说明 |
|------|------|------|
| WordTemplate | `src/types/word.ts` | Word 模板配置 |
| WordExportOptions | `src/types/word.ts` | Word 导出选项 |
| WordProductGroup | `src/types/word.ts` | Word 产品组配置 |

### 6.4 报告类型

| 类型 | 位置 | 说明 |
|------|------|------|
| ChapterId | `src/types/report.ts` | 章节 ID（7 个章节） |
| ContentStatus | `src/types/report.ts` | 内容状态 |
| ReportItem | `src/types/report.ts` | 周报内容项 |
| ChapterContent | `src/types/report.ts` | 章节内容 |
| WeeklyReport | `src/types/report.ts` | 完整周报 |
| ChapterMeta | `src/types/report.ts` | 章节元数据 |

### 6.5 LLM 类型

| 类型 | 位置 | 说明 |
|------|------|------|
| LLMParseRequest | `src/types/llm.ts` | 解析请求 |
| LLMParseResult | `src/types/llm.ts` | 解析结果 |
| LLMContentData | `src/types/llm.ts` | 内容数据 |
| LLMError / LLMErrorCode | `src/types/llm.ts` | 错误类型 |
| MiniMaxConfig | `src/types/llm.ts` | API 配置 |

---

## 7. API 服务

### 7.1 MiniMax API

| 服务 | 端点 | 功能 |
|------|------|------|
| LLMService | `/text/chatcompletion_pro` | 对话完成 |

**配置**：
```typescript
interface MiniMaxConfig {
  apiKey: string
  groupId: string
  model: 'abab6-chat' | 'abab5.5-chat'
  timeout: number
  maxRetries: number
}
```

---

## 8. 状态管理

### 8.1 Pinia Store

| Store | 路径 | 功能 |
|-------|------|------|
| useReportStore | `src/composables/useReportStore.ts` | 周报状态 |

---

## 9. 迭代记录

### 9.1 v0.1（基础功能）

- ✅ Excel 上传和解析
- ✅ 关键词过滤
- ✅ Markdown 编辑器
- ✅ 模板管理
- ✅ 导出功能

### 9.2 v0.2（大模型迭代）

- ✅ LLM 服务层（MiniMax API）
- ✅ 内容过滤规则
- ✅ AI 智能解析
- ✅ HomePage 集成
- ✅ 内容润色功能
- ✅ 单元测试

### 9.3 v0.3（内容归类）- 已完成

- ✅ 归类类型定义（ClassificationItem、ProductGroup 等）
- ✅ 归类状态管理（useClassificationStore）
- ✅ Word 生成（useWordGenerator）
- ✅ 归类预览组件（ClassificationPreview）
- ✅ 归类列表组件（ClassificationList）
- ✅ 归类卡片组件（ClassificationItemCard）
- ✅ 归类统计组件（ClassificationStats）
- ✅ 归类编辑组件（ClassificationEditor）
- ⬜ 待运行时验证...

---

## 📝 更新日志

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-04-03 | v1.0 | 初始版本，记录项目能力清单 |
| 2026-04-03 | v1.1 | 新增 v0.3 内容归类能力：类型定义、API、UI 组件 |

---

---

## 10. 项目结构规范

### 10.1 目录结构

```
project-name/
├── src/
│   ├── components/          # 组件
│   │   ├── common/         # 通用组件
│   │   ├── layout/         # 布局组件
│   │   └── [feature]/      # 功能组件
│   ├── composables/        # 组合式函数
│   ├── pages/              # 页面组件
│   ├── types/              # 类型定义
│   ├── utils/              # 工具函数
│   ├── assets/             # 静态资源
│   └── main.ts             # 入口文件
├── openspec/
│   ├── specs/              # 项目级 OpenSpec 规范
│   │   ├── 01-type-definitions.md
│   │   ├── 02-component-interfaces.md
│   │   ├── 03-api-specifications.md
│   │   └── 04-test-specifications.md
│   ├── changes/            # 功能变更提案（新功能迭代时创建）
│   │   └── <change-name>/
│   │       ├── proposal.md
│   │       ├── design.md
│   │       ├── specs/
│   │       └── tasks.md
│   └── docs/               # 项目文档
│       ├── 00-requirements-research.md   # 需求调研
│       ├── 01-requirements.md            # 需求说明
│       ├── 02-PRD.md                   # 产品需求文档
│       ├── 03-architecture.md           # 技术架构
│       ├── 04-tasks.md                  # 任务分解
│       ├── project.md                   # 项目规范
│       └── capabilities.md              # 项目能力清单
├── tests/                  # 测试文件
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── project.md              # 项目规范入口
├── README.md               # 项目说明
├── CLAUDE.md              # Claude Code 指导
├── package.json
└── vite.config.ts
```

### 10.2 OpenSpec 文档版本

| 文档位置 | 版本 | 说明 |
|----------|------|------|
| `openspec/docs/00-04` | **v0.1 首次开发** | Superpowers 生成的规格文档 |
| `openspec/specs/` | **v0.1 项目级规范** | OpenSpec 技术规范，跨变更共享 |
| `openspec/changes/` | **v0.2+ 迭代规格** | 新功能变更提案，完成后归档到 archive |

### 10.3 文件命名规范

**组件**：PascalCase `UploadSection.vue`

**Composables**：camelCase `useExcelParser.ts`，以 `use` 开头

**类型定义**：PascalCase 或统一在 `types/report.ts`

**测试文件**：`*.test.ts` 或 `*.spec.ts`

---

## 11. 代码规范

### 11.1 Vue 组件规范

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 1. imports
import { ref, computed } from 'vue'

// 2. Props
interface Props {
  modelValue?: string
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false
})

// 3. Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 4. State
const localState = ref('')

// 5. Computed
const computedValue = computed(() => props.modelValue)

// 6. Methods
const handleAction = () => {
  // 方法实现
}

// 7. Lifecycle (如需要)
onMounted(() => {
  // 生命周期逻辑
})

// 8. Expose
defineExpose({
  // 暴露的方法
})
</script>

<style scoped>
/* 样式 */
</style>
```

### 11.2 TypeScript 规范

- 使用严格模式
- 所有变量和函数必须有类型
- 避免使用 `any`
- 使用接口定义对象类型

### 11.3 Git 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**type**：feat、fix、docs、style、refactor、test、chore

---

## 12. 共同规范

### 12.1 技能使用约定

| 功能 | 使用的技能 | 说明 |
|------|-----------|------|
| PDF 导出 | minimax-skills/pdf | MiniMax PDF 技能 |
| Excel 解析 | MiniMax API | 大模型智能解析 |
| 内容润色 | MiniMax API | 大模型内容优化 |

### 12.2 项目共识

- **语言**：所有文档、代码注释、提交信息均使用中文
- **规范遵循**：变更必须走 SDD 流程
- **API 选择**：优先使用 MiniMax API

---

## 13. 功能迭代流程

每次新功能迭代，使用 **OpenSpec CLI** 工具管理。

### 13.1 OpenSpec CLI 命令

```bash
# 查看所有变更
npx openspec list

# 查看变更状态
npx openspec status --change <变更名>

# 获取下一步指引
npx openspec instructions

# 校验变更
npx openspec validate <变更名>

# 归档完成的变更
npx openspec archive <变更名>
```

### 13.2 归档条件

- 文档 artifacts 完成（proposal, design, specs, tasks）
- 代码实现完成
- 测试通过
- 以上全部满足才能执行归档命令

---

## 14. 迭代记录（续）

### 14.1 v0.4（H5 适配）

- ✅ 抽屉导航组件（Drawer.vue）
- ✅ HomePage H5 适配
- ✅ EditorPage H5 适配（抽屉式导航）
- ✅ ClassificationPreview H5 适配
- ✅ ClassificationStats H5 适配
- ✅ ClassificationEditor H5 适配（全屏弹窗）
- ✅ ExportPanel H5 适配
- ⬜ 待测试验证...

---

*本文档为项目知识沉淀，每次迭代前必须阅读*
