# Design: deadline-suffix-fix

## Problem

`deadline` 字段（来自 Excel「时间」列）在生成周报条目内容时被追加到标题末尾，导致输出如：

```markdown
- [完结]来福促销优化-3.24
```

而非预期的：

```markdown
- [完结]来福促销优化
```

## Root Cause

`ReportItem.deadline` 字段在以下 3 处被拼接到内容字符串：

1. `EditorPage.vue` — `currentChapterContent`（用于实时编辑预览）
2. `EditorPage.vue` — `generateExportContent`（用于导出内容生成）
3. `useReportExporter.ts` — `generateMarkdown`（用于 Markdown 导出）

每处都有 3 个状态分组（已上线 / 开发中 / 计划中），共 9 处 `if (item.deadline)` 块。

## Solution

删除所有 9 处 `if (item.deadline) { content += `-${item.deadline}` }` 代码块，保留字段定义和过滤逻辑。

### Code Changes

**`src/pages/EditorPage.vue` — currentChapterContent**

Before:
```typescript
completedItems.forEach(item => {
  content += `- ${item.statusText || ''}${item.title}`
  if (item.deadline) {
    content += `-${item.deadline}`
  }
  content += `\n`
})
```

After:
```typescript
completedItems.forEach(item => {
  content += `- ${item.statusText || ''}${item.title}\n`
})
```

**`src/pages/EditorPage.vue` — generateExportContent**

Same pattern as above — 3 groups (completed, inProgress, planned).

**`src/composables/useReportExporter.ts` — generateMarkdown**

Same pattern — 3 groups, variable name is `markdown` instead of `content`.

### What Is Preserved

- `ReportItem.deadline?: string` 类型定义（`src/types/report.ts`）
- `useFilterRules.ts` 中的日期过滤逻辑（用于排除过期内容）
- `LLMService.ts` 中的 deadline 解析

## Verification

```bash
# 1. 代码无 deadline 追加残留
grep -r "\.deadline" src/pages/EditorPage.vue src/composables/useReportExporter.ts
# 预期：无匹配

# 2. 单元测试通过
npm test
# 预期：23/23 passing

# 3. 构建通过（main 分支既有 TS 错误可忽略）
npm run build:check
```