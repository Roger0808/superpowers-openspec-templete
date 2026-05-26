# Proposal: deadline-suffix-fix

## Why

每次生成周报时，每条条目末尾会被追加一个来自 Excel「时间」列的日期后缀（如 `[完结]来福促销优化-3.24` 中的 `-3.24`），导致周报格式冗余、可读性差。用户期望周报条目只包含状态标签和标题，不包含日期。

## What Changes

移除 `deadline` 字段在条目内容拼接时的追加逻辑，共涉及 3 个文件的 9 处代码：

- `src/pages/EditorPage.vue` — `currentChapterContent` 计算属性（3 处）
- `src/pages/EditorPage.vue` — `generateExportContent` 函数（3 处）
- `src/composables/useReportExporter.ts` — `generateMarkdown` 函数（3 处）

`ReportItem.deadline` 类型定义和 `useFilterRules.ts` 中的过滤逻辑保持不变（仍用于排除过期内容）。

## Capabilities

### Modified Capabilities

无。现有规范描述的行为不变，本次变更仅移除实现层的多余拼接逻辑。

## Impact

| 文件 | 变更类型 |
|------|----------|
| `src/pages/EditorPage.vue` | 修改 — 删除 6 处 deadline 追加 |
| `src/composables/useReportExporter.ts` | 修改 — 删除 3 处 deadline 追加 |
| `src/types/report.ts` | 无变更 — `deadline` 字段保留 |
| `src/composables/useFilterRules.ts` | 无变更 — 过滤逻辑保留 |