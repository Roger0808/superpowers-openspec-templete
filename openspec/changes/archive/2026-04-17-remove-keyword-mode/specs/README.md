## No New Specs Required

本次变更为纯删除重构，不引入新能力，不修改既有规范行为。

**Modified Capabilities**: 无
- `content-classification` 规范定义的 AI 归类行为保持不变
- keyword 归类是实现层逻辑，从未在规范中定义
- 变更仅删除实现代码，不改变任何规范要求

**Removed Implementation** (不属于规范层面):
- `useContentMapper.ts`（keyword 专用映射函数）
- `LLMModeToggle.vue`（UI 切换组件）
- `buildChapters` / `splitContentBySections` / `mapSectionToChapter` 函数
- `ParseMode = 'keyword' | 'llm'` 类型
