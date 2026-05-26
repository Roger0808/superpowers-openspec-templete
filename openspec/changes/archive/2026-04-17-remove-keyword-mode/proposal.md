# Proposal: remove-keyword-mode

## Why

系统曾支持「关键词」和「AI」两种归类模式，但 AI 模式已稳定上线并设为默认，keyword 模式从未在生产中推荐使用，继续保留造成双路径维护负担和用户界面的无效切换入口。

## What Changes

- **BREAKING** 移除 UI 上的关键词/AI 模式切换按钮（`LLMModeToggle` 组件）
- 移除 `useContentMapper.ts`（keyword 专用关键字映射和状态识别函数）
- 移除 `HomePage.vue` 中的 `buildChapters`、`splitContentBySections`、`mapSectionToChapter` 三个 keyword 专用函数
- 移除 `ParseMode` 类型定义（`'keyword' | 'llm'`）
- 移除 `handlePreviewConfirm` 中的 keyword 条件分支
- 简化 `generateReport` 中的 else fallback 分支为显式错误处理
- AI 归类失败时保持现有行为：显示错误提示，用户可重试

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

（无——现有 `content-classification` 规范描述的即为 AI 归类行为，本次变更仅移除实现层的 keyword 路径，规范行为不变）

## Impact

| 文件 | 变更类型 |
|------|----------|
| `src/components/common/LLMModeToggle.vue` | 删除 |
| `src/composables/useContentMapper.ts` | 删除 |
| `src/types/llm.ts` | 删除 `ParseMode` 类型 |
| `src/pages/HomePage.vue` | 删除 keyword 相关 import、ref、函数、模板绑定 |
