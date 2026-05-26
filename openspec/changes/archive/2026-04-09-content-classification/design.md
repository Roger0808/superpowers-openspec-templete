# 设计文档 - 内容归类功能

**创建日期**: 2026-04-03
**阶段**: Design
**功能**: Excel/Word 内容智能归类

---

## Context

### 背景

当前周报生成流程依赖手动归类：
1. 产品组负责人提供 Excel 会议记录
2. 人工阅读 Excel 内容
3. 手动分类到周报模板
4. 复制粘贴到 Word

**问题**：
- 手动归类耗时（30-60 分钟/周）
- 分类标准不统一
- 状态标签容易遗漏
- 格式转换繁琐

### 现状

- 已实现 Excel 解析（`useExcelParser.ts`）
- 已实现 LLM 服务（`LLMService.ts`）
- 已实现章节映射（`useContentMapper.ts`）
- **缺失**：归类 UI、Word 生成

---

## Goals / Non-Goals

### Goals

1. **自动化归类**
   - 利用大模型自动分析 Excel 内容
   - 智能识别产品组、状态、标签
   - 归类准确率 > 80%

2. **用户确认机制**
   - 生成归类建议供用户预览
   - 支持修改归类结果
   - 确认后再执行

3. **一键生成 Word**
   - 生成符合 P2C 会议纪要格式
   - 支持按产品组分章节
   - 支持状态标签显示

4. **性能要求**
   - 处理 100 条数据 < 10 秒
   - 操作步骤 ≤ 5 步

### Non-Goals

- 不支持 PDF 导出
- 不支持批量处理多个 Excel
- 不支持历史周报管理
- 不支持多语言

---

## Decisions

### 决策 1: 技术选型

**选择**：纯前端 + MiniMax API

**理由**：
- 项目当前是纯前端架构
- 可复用现有 `LLMService.ts`
- 无需搭建后端服务
- 可快速迭代验证

**备选方案**：
- 后端 Node.js：增加复杂度，适合大数据量
- MiniMax Skills：企业部署，适合复杂格式

### 决策 2: 代码复用

**复用组件**：
| 组件 | 路径 | 复用方式 |
|------|------|---------|
| useExcelParser | `src/composables/` | 直接复用 |
| LLMService | `src/services/` | 直接复用 |
| useContentMapper | `src/composables/` | 扩展复用 |
| ExcelRow | `src/types/excel.ts` | 直接复用 |

**新增组件**：
| 组件 | 路径 | 说明 |
|------|------|------|
| useClassificationStore | `src/composables/` | 归类状态管理 |
| useWordGenerator | `src/composables/` | Word 生成 |
| ClassificationPreview | `src/components/` | 归类预览 |
| ClassificationEditor | `src/components/` | 归类编辑 |

### 决策 3: 归类维度

**一级分类（产品组）**：

| 产品组 | 说明 |
|--------|------|
| 来福商城 | 来福商城相关项目 |
| 三方项目 | 第三方合作项目 |
| 采购与集采管理 | 采购、集采相关 |
| 三方供应链 | 供应链对接 |
| 销售与财务管理 | 销售、财务、售后 |
| 竞价平台与异常单 | 竞价、异常处理 |
| 履约监控与物流一体化 | 物流、履约相关 |

**二级分类（状态）**：

| 状态 | 说明 |
|------|------|
| 已上线 | 已完成并发布 |
| 开发中 | 正在开发中 |

**状态标签**：

| 标签 | 说明 |
|------|------|
| [完结] / 【完结】 | 已完成 |
| [变更] / 【变更】 | 变更中 |
| [无变更] / 【无变更】 | 无变更 |
| [技术] | 技术相关 |
| [采购] / [集采] | 采购/集采 |
| [财务] | 财务相关 |
| [销售] / [售后] | 销售/售后 |

### 决策 4: Word 格式

**格式要求**：严格遵循 `📅 P2C 会议纪要 (3.30).md`

```
# {产品组名称}

## 已上线
- [完结]-项目名称 | 上线时间 | 关键信息

## 开发中
- [变更]-项目名称 | 进度 | 关键信息
```

### 决策 5: LLM Prompt 设计

**Prompt 策略**：
- 批量处理（10-20 条/次）
- 支持 JSON 返回
- 置信度评分
- 支持"待定"状态

---

## Risks / Trade-offs

### 风险 1: 归类准确性

**风险描述**：大模型归类结果可能不符合预期

**影响**：中等 - 需要人工修正

** Mitigation**：
- 用户确认机制
- 支持手动修改
- 置信度显示

### 风险 2: API 调用成本

**风险描述**：每次归类都需要调用 API

**影响**：中等 - 成本可控

** Mitigation**：
- 批量处理，减少调用次数
- 缓存归类结果
- 支持本地关键词匹配降级

### 风险 3: Excel 格式兼容性

**风险描述**：不同 Excel 格式可能导致解析失败

**影响**：低 - 可提供模板

** Mitigation**：
- 提供标准模板下载
- 列名校验
- 友好的错误提示

### 权衡

| 权衡点 | 选择 | 理由 |
|--------|------|------|
| 实时预览 vs 批量处理 | 实时预览 | 用户体验优先 |
| 自动化 vs 准确性 | 自动化 + 用户确认 | 平衡效率和准确 |
| 前端 vs 后端 | 前端 | 简单、快速 |

---

## 实现计划

### Phase 1: 类型定义（1 天）

- `src/types/classification.ts` - 归类类型
- `src/types/word.ts` - Word 类型

### Phase 2: API 实现（1 天）

- `src/composables/useClassificationStore.ts` - 归类状态
- `src/composables/useWordGenerator.ts` - Word 生成

### Phase 3: 组件实现（2 天）

- `ClassificationPreview.vue` - 归类预览
- `ClassificationList.vue` - 归类列表
- `ClassificationItemCard.vue` - 归类卡片
- `ClassificationStats.vue` - 归类统计
- `ClassificationEditor.vue` - 归类编辑

### Phase 4: 集成测试（1 天）

- 端到端测试
- Bug 修复
- 文档更新

**总计**：5-6 天

---

## 参考

- **Proposal**: `proposal.md`
- **Specs**: `specs/llm/`
- **Tasks**: `tasks.md`
- **项目能力清单**: `../../capabilities.md`
- **参考格式**: `../../📅 P2C 会议纪要 (3.30).md`

---

*本文档为 Design 阶段产出，为 Implementation 提供设计指导*
