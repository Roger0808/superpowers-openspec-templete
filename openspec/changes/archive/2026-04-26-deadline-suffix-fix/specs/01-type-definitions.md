# Type Definitions: deadline-suffix-fix

## No Changes

本次变更不修改任何类型定义。

`ReportItem.deadline?: string` 字段定义保持不变，位于 `src/types/report.ts`。

该字段仍用于：
- 日期过滤逻辑（`useFilterRules.ts`）
- LLM 解析（`LLMService.ts`）

本次变更仅移除**展示层**的追加逻辑，不影响类型定义。
