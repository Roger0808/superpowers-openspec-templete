## Context

系统当前支持「关键词」（keyword）和「AI」（llm）两种归类模式，默认 llm。keyword 模式依赖 `useContentMapper.ts` 中的硬编码关键字规则，仅在 `handlePreviewConfirm` 的条件分支中调用。

本次变更是纯删除型重构，不引入新功能或新架构模式。

**约束：**
- AI 归类行为完全不变
- 不修改 LLM 调用参数、prompt 或过滤逻辑
- 不改变现有 API 接口和数据流

## Goals / Non-Goals

**Goals:**
- 删除 keyword 归类路径的所有代码
- 删除 `LLMModeToggle` UI 组件
- 删除 `useContentMapper.ts`
- 删除 `buildChapters`、`splitContentBySections`、`mapSectionToChapter` 三个函数
- 构建和测试均通过

**Non-Goals:**
- 不修改 AI 归类逻辑
- 不新增单元测试（keyword 函数无测试，AI 路径有测试覆盖）
- 不修改 `openspec/docs/` 下已创建的 01-04 需求文档（已完成提交）

## Decisions

### 1. 删除 `LLMModeToggle.vue` 而非隐藏

keyword 模式完全废弃，YAGNI 原则适用。若日后需恢复，可从 git 历史找回。

### 2. `generateReport` 的 else 分支改为显式错误

**之前**：无 AI 归类结果时 fallback 到 `buildChapters(rows)` 走 keyword 路径
**之后**：无 AI 归类结果时显示错误，返回步骤 3 让用户重新归类

理由：不再有 keyword fallback，若归类结果为空应视为异常而非正常流程。

### 3. 不修改 `ParseMode` 类型所在的 `llm.ts` 其他内容

`llm.ts` 还包含 `LLMStatus`、`LLMErrorCode` 等与 AI 路径相关的类型，这些保留。只删除第 187-188 行的 `ParseMode = 'keyword' | 'llm'`。

## Risks / Trade-offs

| 风险 | 说明 | 缓解 |
|------|------|------|
| 遗漏 import 残留 | HomePage.vue 多处引用 import，删除时可能遗漏 | 每步后执行 `npm run build:check` |
| `buildChaptersFromClassification` 覆盖不足 | 确认 AI 路径已能处理所有原 keyword 场景 | AI 路径已有产品组→章节映射 prompt，覆盖充分 |
| AI 归类失败时体验 | 现有 retry 机制保持不变 | 无需修改 |
