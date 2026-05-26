# 头脑风暴 - 内容归类功能

**创建日期**: 2026-04-03
**阶段**: Brainstorming
**功能**: Excel/Word 内容智能归类

---

## 0. 代码复用分析

> ⚠️ **重要**：在开始设计新功能之前，必须先分析现有代码，避免重复造轮子。

### 0.1 可复用组件清单

| 组件 | 文件路径 | 功能 | 复用可行性 |
|------|----------|------|-----------|
| useExcelParser | `src/composables/useExcelParser.ts` | Excel 文件解析、列提取 | ✅ 直接复用 |
| LLMService | `src/services/LLMService.ts` | MiniMax API 调用、Prompt 构建 | ✅ 直接复用 |
| useLLMParser | `src/composables/useLLMParser.ts` | LLM 解析、过滤规则 | ⚠️ 需扩展 |
| useContentMapper | `src/composables/useContentMapper.ts` | 章节映射、状态识别、标签提取 | ⚠️ 需扩展 |
| types/excel.ts | `src/types/excel.ts` | ExcelRow、ParsedExcelData 类型 | ✅ 直接复用 |
| types/report.ts | `src/types/report.ts` | ChapterId、ContentStatus 类型 | ✅ 直接复用 |
| types/llm.ts | `src/types/llm.ts` | LLMContentData、LLMParseResult 类型 | ✅ 直接复用 |

### 0.2 现有能力分析

#### 已有能力

| 能力 | 来源 | 说明 |
|------|------|------|
| Excel 解析 | useExcelParser | 支持 `会议时间点`、`产品组`、`同步信息内容` 三列 |
| 章节定义 | useLLMParser.CHAPTER_META | 7 个章节（来福商城、三方项目等） |
| 状态识别 | useContentMapper.identifyStatus() | 支持 `completed/in_progress/planned` |
| 标签提取 | useContentMapper.extractStatusText() | 支持 `[完结]`、`[变更]`、`[无变更]` |
| LLM 调用 | LLMService | 支持 MiniMax API 的 chat、prompt 构建 |

#### 缺失能力

| 能力 | 说明 | 优先级 |
|------|------|--------|
| 归类预览 UI | 展示 LLM 归类结果，供用户确认 | 🔴 高 |
| 归类编辑 UI | 用户可修改 LLM 归类结果 | 🔴 高 |
| Word 生成 | 按 P2C 会议纪要格式生成 Word | 🔴 高 |
| 批量归类 | 一次处理多条数据 | 🟡 中 |
| 归类统计 | 展示归类结果分布 | 🟡 中 |

### 0.3 需要新增的组件

| 组件 | 文件路径 | 依赖 |
|------|----------|------|
| ClassificationPreview.vue | `src/components/classification/ClassificationPreview.vue` | 复用 ExcelRow、LLMContentData |
| ClassificationEditor.vue | `src/components/classification/ClassificationEditor.vue` | ClassificationPreview |
| useWordGenerator.ts | `src/composables/useWordGenerator.ts` | docx.js |
| useClassificationStore.ts | `src/composables/useClassificationStore.ts` | Pinia（已有） |

### 0.4 风险：跳过代码分析的后果

如果跳过代码分析阶段，可能导致：
- ❌ 重新实现 Excel 解析功能（已存在 `useExcelParser`）
- ❌ 重新实现 LLM 调用封装（已存在 `LLMService`）
- ❌ 重新定义章节类型（已存在 `ChapterId`）
- ❌ 重复劳动，浪费时间（预计浪费 2-4 小时）

### 0.5 复用策略

1. **直接复用**：Excel 类型、LLM 服务、章节定义
2. **扩展复用**：在 `useLLMParser` 基础上增加归类逻辑
3. **新增开发**：归类 UI、Word 生成（无现有实现）

---

## 1. 需求分析

### 1.1 用户痛点

| 痛点 | 描述 | 影响 |
|------|------|------|
| 手动归类耗时 | 需要将 Excel 中的会议内容手动分类到周报模板 | 每周重复工作，效率低 |
| 分类标准不统一 | 不同人归类方式不同，缺乏一致性 | 周报质量参差不齐 |
| 状态标签混乱 | [完结]/[变更]/[无变更] 等标签容易遗漏或错误 | 信息不准确 |
| 格式转换繁琐 | Excel → Word 需要大量复制粘贴 | 容易出错，格式丢失 |

### 1.2 当前解决方案

- 手动阅读 Excel 内容
- 根据产品组手动归类
- 手动添加状态标签
- 手动复制到 Word 模板

**缺点**：
- 耗时（约 30-60 分钟/周）
- 容易出错
- 依赖个人经验
- 无法复用历史归类结果

### 1.3 新方案能解决的问题

- **自动化归类**：大模型自动分析内容并归类到正确的产品组
- **智能状态识别**：自动识别 [完结]、[变更]、[无变更] 等状态
- **用户确认机制**：生成归类建议，用户确认后再执行
- **一键生成 Word**：归类确认后自动生成符合格式的周报

---

## 2. 推荐方案

### 方案 A：纯前端 + MiniMax API（推荐）

**架构**：
```
Excel 文件 → 前端解析（SheetJS） → MiniMax API 归类 → 用户确认 → 前端生成 Word（docx.js）
```

**优点**：
- 实现简单，无需后端
- 响应速度快，用户体验好
- 可以复用现有的 MiniMax API 集成
- 前端直接生成 Word，无需服务器

**缺点**：
- 大文件 Excel 可能有性能问题
- 需要用户确认每个归类结果

**依赖**：
- MiniMax API（已有）
- SheetJS（Excel 解析）
- docx.js（Word 生成）

**适用场景**：
- 数据量 < 1000 行
- 用户需要实时预览归类结果

---

### 方案 B：后端 Node.js 服务

**架构**：
```
Excel 文件 → 上传到后端 → Node.js 处理 → MiniMax API 归类 → 返回结果 → 前端确认 → 后端生成 Word
```

**优点**：
- 处理大文件能力强
- 可以缓存归类结果
- 更安全（API Key 在后端）

**缺点**：
- 需要搭建后端服务
- 增加部署复杂度
- 用户无法实时预览

**依赖**：
- Node.js 后端服务
- MiniMax API
- xlsx Python 库（Excel 处理）

**适用场景**：
- 数据量 > 1000 行
- 需要服务端处理

---

### 方案 C：结合 MiniMax Skills（长期规划）

**架构**：
```
Excel 文件 → minimax-xlsx 解析 → MiniMax 模型归类 → minimax-docx 生成 Word
```

**优点**：
- 使用官方 Skills，稳定性高
- 支持复杂 Excel 格式
- Word 格式控制精准

**缺点**：
- 需要本地部署 Python 环境
- 集成复杂度高
- 当前项目结构不适合

**依赖**：
- MiniMax Skills 仓库
- Python 3.9+
- 相关 Python 库

**适用场景**：
- 企业内部部署
- 需要处理复杂 Excel/Word 格式

---

### 方案选择

**推荐方案 A（纯前端 + MiniMax API）**

理由：
1. 项目当前是纯前端架构，无需引入后端复杂度
2. 现有的 `LLMService.ts` 可以直接复用
3. 用户量不大，数据量可控
4. 可以快速迭代验证

**后续可升级到方案 C**，当用户量和数据复杂度增加时。

---

## 3. 技术风险

### 3.1 风险清单

| 风险 | 描述 | 等级 | Mitigation |
|------|------|------|------------|
| 归类准确性 | 大模型归类结果可能不符合预期 | 中 | 用户确认机制，错误可手动修正 |
| API 调用成本 | 每次归类都需要调用 API | 中 | 批量处理，减少 API 调用次数 |
| Excel 格式兼容 | 不同 Excel 格式可能导致解析失败 | 低 | 提供模板下载，统一格式 |
| Word 格式丢失 | 生成的 Word 格式可能与模板不一致 | 中 | 使用稳定的 docx.js 库 |
| 大数据量性能 | Excel 数据量过大导致前端卡顿 | 低 | 分页处理，虚拟滚动 |

### 3.2 关键决策

1. **归类粒度**：先按产品组归类，状态标签作为附加信息
2. **确认机制**：每类产品组显示归类预览，用户可修改
3. **Word 生成时机**：用户确认归类结果后生成
4. **错误处理**：归类失败的内容保留原样，不强制归类

---

## 4. 归类维度设计

### 4.1 一级分类（产品组）

基于 `📅 P2C 会议纪要 (3.30).md`：

| 产品组 | 说明 |
|--------|------|
| 来福商城 | 来福商城相关项目 |
| 三方项目 | 第三方合作项目 |
| 采购与集采管理 | 采购、集采相关 |
| 三方供应链 | 供应链对接 |
| 销售与财务管理 | 销售、财务相关 |
| 竞价平台与异常单 | 竞价、异常处理 |
| 履约监控与物流一体化 | 物流、履约相关 |

### 4.2 二级分类（状态）

| 状态 | 说明 |
|------|------|
| 已上线 | 已完成并发布 |
| 开发中 | 正在开发中 |

### 4.3 状态标签

| 标签 | 说明 | 示例 |
|------|------|------|
| [完结] / 【完结】 | 已完成 | [完结]-salespc——任务调度中心 |
| [变更] / 【变更】 | 变更中 | [变更]-来福商城优化 |
| [无变更] / 【无变更】 | 无变更 | [无变更]-中移物联网 |
| [技术] | 技术相关 | 【技术】【下线老W】 |
| [采购] / [集采] | 采购/集采 | 【采购】统一商品池 |
| [财务] | 财务相关 | 【财务】线下业绩 |
| [销售] / [售后] | 销售/售后 | 【销售】特批工单3.0 |

### 4.4 关键信息提取

| 信息 | 说明 | 示例 |
|------|------|------|
| 上线时间 | 项目上线日期 | 3.24已上线、4.2上线 |
| 进度描述 | 当前进度 | 测试中、联调中、需求评审中 |
| 项目名称 | 具体项目名称 | 来福促销优化、销售订单查询 |

---

## 5. 大模型 Prompt 设计

### 5.1 归类 Prompt 策略

```
角色：你是一个专业的周报归类助手

任务：将 Excel 中的会议内容归类到正确的分类中

输入：
- Excel 内容（产品组、同步信息内容）
- 归类维度定义（一级分类、二级分类、状态标签）

输出要求：
1. 一级分类：根据内容判断属于哪个产品组
2. 二级分类：判断是"已上线"还是"开发中"
3. 状态标签：识别 [完结]、[变更]、[无变更] 等
4. 关键信息：提取上线时间、进度描述、项目名称

注意事项：
- 如果无法确定分类，返回"待定"并说明原因
- 优先匹配已知的产品组名称
- 状态标签只识别明确的标记
```

### 5.2 批量处理策略

- 单次 API 调用处理 10-20 条数据
- 避免单次请求数据量过大
- 支持断点续传

---

## 6. 下一步

1. ✅ Brainstorming 完成
2. ⬜ Writing Plans：编写 proposal.md
3. ⬜ Alignment：确认方向和范围
4. ⬜ Spec：编写详细规范
5. ⬜ Tasks：任务分解
6. ⬜ Implementation：开发实现

---

*本文档为 Brainstorming 阶段产出，待确认后进入下一阶段*
