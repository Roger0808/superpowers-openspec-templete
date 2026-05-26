# 变更提案：AI 并行化与页面多余内容优化

## Motivation

当前系统中 AI 调用（MiniMax API）在解析 Excel 数据时为串行执行。当数据量（产品组）较大时，用户等待时间随行数线性增长，体验较差。
同时，首页底部包含的“核心功能”区块在老用户日常使用中显得冗余，且占用较多屏幕垂直空间，干扰核心交互。

## What Changes

1. **AI 解析并行化**：引入并发控制工具，将串行调用的 AI 解析过程改为最大并发数为 3 的并行执行，缩短总解析时间。
2. **首页 UI 净化**：彻底删除 `HomePage.vue` 底部的 `<section class="features">` 区块及其相关 CSS 样式。

## Capabilities

### Modified Capabilities
- `content-classification`: 修改了内容分类和过滤时的解析方式，从串行变更为并行。
- `excel-parsing`: 提升了数据处理流程中的速度。

## Impact

- `src/utils/concurrency.ts`（新增并发控制）
- `src/composables/useClassificationStore.ts`（改造分类逻辑）
- `src/composables/useLLMParser.ts`（改造解析逻辑）
- `src/pages/HomePage.vue`（彻底移除 features 区块）
