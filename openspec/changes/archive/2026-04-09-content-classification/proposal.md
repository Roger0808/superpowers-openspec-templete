# 提案 - 内容归类功能

**创建日期**: 2026-04-03
**阶段**: Proposal
**功能**: Excel/Word 内容智能归类

---

## Why

当前周报生成依赖手动归类：产品组负责人提供 Excel 会议记录，人工阅读内容、手动分类到周报模板、复制粘贴到 Word。整个过程耗时 30-60 分钟/周，且分类标准不统一、状态标签容易遗漏。

通过大模型自动分析 Excel 内容，智能归类到产品组/状态/标签，并支持用户确认和一键生成 Word，可将归类效率提升 90%+，实现标准化、规范化。

---

## What Changes

- **新增**：Excel 内容智能归类功能
  - 利用 MiniMax API 自动分析 Excel 内容
  - 智能识别产品组、状态、标签
  - 归类准确率目标 > 80%

- **新增**：归类结果预览与编辑
  - 生成归类建议供用户预览
  - 支持修改归类结果
  - 用户确认后再执行

- **新增**：Word 周报生成
  - 生成符合 P2C 会议纪要格式
  - 支持按产品组分章节
  - 支持状态标签显示

- **复用**：现有 Excel 解析、LLM 服务、章节映射、状态识别能力

---

## Capabilities

### New Capabilities

- **content-classification**: Excel/Word 内容智能归类能力
  - `specs/llm/01-type-definitions.md`: 类型定义
  - `specs/llm/02-api-specifications.md`: API 规范
  - `specs/llm/03-component-interfaces.md`: 组件接口

### Modified Capabilities

- 无

---

## Impact

**受影响的代码**：
- 新增 `src/types/classification.ts` - 归类类型定义
- 新增 `src/types/word.ts` - Word 生成类型定义
- 新增 `src/composables/useClassificationStore.ts` - 归类状态管理
- 新增 `src/composables/useWordGenerator.ts` - Word 生成
- 新增 `src/components/classification/*.vue` - 归类相关组件

**依赖**：
- `xlsx` (已存在) - Excel 解析
- `docx` (需安装) - Word 生成
- `LLMService.ts` (已存在) - MiniMax API

**部署**：
- 无后端依赖，纯前端实现

---

*本文档为 Proposal 阶段产出，待确认后进入 Spec 阶段*
