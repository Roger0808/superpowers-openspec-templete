# 内容归类功能规范

**创建日期**: 2026-04-03
**版本**: v1.0
**状态**: 已实现
**规范来源**: `openspec/changes/archive/2026-04-09-content-classification/specs/content-classification/spec.md`

---

## 1. 概述

内容归类功能将 Excel 周报数据通过 LLM 智能分类到 7 个产品组章节，并支持生成 Word 周报。

### 1.1 产品组（章节）映射

| 产品组 | 章节 ID | 说明 |
|--------|---------|------|
| 来福商城 | chapter-1 | 会员系统、额度、转赠、促销、C网售后 |
| 三方项目 (开发中) | chapter-2 | 三方对接、商城平台搭建、API对接 |
| 采购与集采管理 | chapter-3 | 采购管理、集采、SRM、商品池 |
| 三方供应链 | chapter-4 | 京东、丰享、盒马、华润、麦德龙、供应链 |
| 销售与财务管理 | chapter-5 | 销售管理、财务、售后、特批、对账、业绩 |
| 竞价平台与异常单 | chapter-6 | 竞价平台、异常单、配品 |
| 履约监控与物流一体化 | chapter-7 | 履约监控、物流、WMSX、快递、专车 |

---

## 2. 类型定义

### 2.1 ExcelRow（复用）

系统**SHALL**复用 `src/types/excel.ts` 中的 ExcelRow 接口。

```typescript
interface ExcelRow {
  /** 会议时间点 */
  time: string
  /** 产品组名称 */
  productGroup: string
  /** 同步信息内容（Markdown 格式） */
  content: string
}
```

---

### 2.2 ProductGroup

系统**SHALL**定义 ProductGroup 类型，表示一级分类（产品组）枚举。

```typescript
// 路径: src/types/classification.ts

type ProductGroup =
  | '来福商城'
  | '三方项目'
  | '采购与集采管理'
  | '三方供应链'
  | '销售与财务管理'
  | '竞价平台与异常单'
  | '履约监控与物流一体化'

export const ProductGroup = {
  LAIFU: '来福商城' as ProductGroup,
  THIRD_PARTY: '三方项目' as ProductGroup,
  PROCUREMENT: '采购与集采管理' as ProductGroup,
  SUPPLY_CHAIN: '三方供应链' as ProductGroup,
  SALES_FINANCE: '销售与财务管理' as ProductGroup,
  BIDDING: '竞价平台与异常单' as ProductGroup,
  LOGISTICS: '履约监控与物流一体化' as ProductGroup,
}

export const PRODUCT_GROUP_COLORS: Record<ProductGroup, string> = {
  '来福商城': '#1890ff',
  '三方项目': '#52c41a',
  '采购与集采管理': '#faad14',
  '三方供应链': '#f5222d',
  '销售与财务管理': '#722ed1',
  '竞价平台与异常单': '#eb2f96',
  '履约监控与物流一体化': '#13c2c2',
}
```

#### Scenario: 产品组枚举
- **WHEN** 需要表示产品组分类
- **THEN** 使用 ProductGroup 类型

#### Scenario: 产品组颜色
- **WHEN** 渲染产品组标签
- **THEN** 根据 PRODUCT_GROUP_COLORS 显示对应颜色

---

### 2.3 ClassificationStatus

系统**SHALL**定义 ClassificationStatus 类型，表示二级分类（状态）。

```typescript
// 路径: src/types/classification.ts

type ClassificationStatus = '已上线' | '开发中'

export const ClassificationStatus = {
  COMPLETED: '已上线' as ClassificationStatus,
  IN_PROGRESS: '开发中' as ClassificationStatus,
}

export const STATUS_COLORS: Record<ClassificationStatus, string> = {
  '已上线': '#52c41a',
  '开发中': '#1890ff',
}
```

---

### 2.4 StatusTag

系统**SHALL**定义 StatusTag 类型，表示状态标签枚举。

```typescript
// 路径: src/types/classification.ts

type StatusTag =
  | '[完结]'
  | '[变更]'
  | '[无变更]'
  | '[技术]'
  | '[采购]'
  | '[集采]'
  | '[财务]'
  | '[销售]'
  | '[售后]'

export const StatusTag = {
  COMPLETED: '[完结]' as StatusTag,
  CHANGED: '[变更]' as StatusTag,
  NO_CHANGE: '[无变更]' as StatusTag,
  TECH: '[技术]' as StatusTag,
  PROCUREMENT: '[采购]' as StatusTag,
  COLLECTION: '[集采]' as StatusTag,
  FINANCE: '[财务]' as StatusTag,
  SALES: '[销售]' as StatusTag,
  AFTER_SALES: '[售后]' as StatusTag,
}
```

---

### 2.5 ClassificationItem

系统**SHALL**定义 ClassificationItem 接口，表示单条归类结果。

```typescript
// 路径: src/types/classification.ts

interface ClassificationItem {
  /** 唯一标识 */
  id: string
  /** 原始 Excel 行数据 */
  source: ExcelRow
  /** 章节 ID（用于生成周报） */
  chapterId?: string
  /** 章节标题 */
  chapterTitle?: string
  /** 一级分类（产品组） */
  productGroup: ProductGroup
  /** 二级分类（状态） */
  status: ClassificationStatus
  /** 状态标签列表 */
  tags: StatusTag[]
  /** 关键信息 */
  keyInfo?: string
  /** 置信度 0-1 */
  confidence: number
  /** 原始内容 */
  rawContent: string
  /** 是否已确认 */
  confirmed: boolean
  /** 确认时间 */
  confirmedAt?: number
}
```

#### Scenario: 创建归类项
- **WHEN** LLM 返回归类结果
- **THEN** 构建 ClassificationItem，包含完整的分类信息

#### Scenario: 确认归类项
- **WHEN** 用户确认某条归类结果
- **THEN** 将 confirmed 设为 true，并记录 confirmedAt 时间戳

---

### 2.6 ClassificationStats

```typescript
// 路径: src/types/classification.ts

interface ClassificationStats {
  /** 总数 */
  total: number
  /** 已确认数 */
  confirmed: number
  /** 待确认数 */
  pending: number
  /** 各产品组数量 */
  byProductGroup: Record<ProductGroup, number>
  /** 各状态数量 */
  byStatus: Record<ClassificationStatus, number>
}
```

---

### 2.7 ClassificationResult

```typescript
// 路径: src/types/classification.ts

interface ClassificationResult {
  /** 文件名 */
  fileName: string
  /** 归类时间 */
  classifiedAt: number
  /** 归类结果列表 */
  items: ClassificationItem[]
  /** 统计信息 */
  stats: ClassificationStats
  /** 原始数据 */
  rawData: ExcelRow[]
}
```

---

### 2.8 WordExportOptions

```typescript
// 路径: src/types/word.ts

interface WordExportOptions {
  /** 文件名 */
  fileName?: string
  /** 标题 */
  title?: string
  /** 日期 */
  date?: string
  /** 包含的产品组 */
  productGroups?: ProductGroup[]
  /** 是否包含时间 */
  includeTime?: boolean
}
```

---

## 3. 状态管理

### 3.1 ClassificationState

```typescript
// 路径: src/types/classification.ts

interface ClassificationState {
  /** 原始 Excel 数据 */
  rawData: ExcelRow[]
  /** 归类结果 */
  result: ClassificationResult | null
  /** 当前编辑项 */
  editingItem: ClassificationItem | null
  /** 加载状态 */
  isLoading: boolean
  /** 错误信息 */
  error: string | null
  /** 导出选项 */
  exportOptions: WordExportOptions
}
```

---

### 3.2 useClassificationStore

系统**SHALL**提供 useClassificationStore Hook，用于归类状态管理。

**路径**: `src/composables/useClassificationStore.ts`

```typescript
function useClassificationStore(): {
  state: Readonly<ClassificationState>

  /** 初始化 LLM 服务 */
  initService(apiKey: string, groupId: string, timeout?: number): boolean

  /** 设置原始数据 */
  setRawData(data: ExcelRow[]): void

  /** 执行归类 */
  classifyRows(
    rows: ExcelRow[],
    onProgress?: (current: number, total: number, groupName: string) => void
  ): Promise<ClassificationResult>

  /** 确认归类项 */
  confirmItem(id: string): void

  /** 更新归类项 */
  updateItem(id: string, updates: Partial<ClassificationItem>): void

  /** 设置当前编辑项 */
  setEditingItem(item: ClassificationItem | null): void

  /** 设置导出选项 */
  setExportOptions(options: WordExportOptions): void

  /** 重置状态 */
  reset(): void
}
```

#### Scenario: 初始化 LLM 服务
- **WHEN** 需要使用 LLM 进行归类
- **THEN** 调用 initService(apiKey, groupId, timeout) 初始化服务
- **RETURN** 成功返回 true，失败返回 false

#### Scenario: 执行归类
- **WHEN** 调用 classifyRows
- **THEN** 执行以下流程：
  1. 按产品组分批调用 LLM
  2. 预处理 content，过滤需求调研阶段分类
  3. 解析 LLM 返回的 JSON
  4. 过滤包含无效关键词的条目
  5. 计算统计信息
  6. 更新 result 状态

#### Scenario: 归类流程（详细）
- **WHEN** 用户提交 Excel 数据进行归类
- **THEN** 执行以下步骤：
  1. **预处理过滤**：删除需求调研阶段、需求分析阶段等分类下的所有条目
  2. **LLM 调用**：按产品组逐行调用 LLM，传递时间和内容
  3. **JSON 解析**：提取 LLM 返回的 JSON 数组
  4. **后处理过滤**：过滤包含"跟进中"、"调研中"、"下周计划"等关键词的条目
  5. **结果组装**：构建 ClassificationItem，计算统计
  6. **状态更新**：设置 result、rawData 等状态

#### Scenario: 确认归类项
- **WHEN** 用户确认某条归类结果
- **THEN** 调用 confirmItem(id)，将该条 confirmed 设为 true

#### Scenario: 更新归类项
- **WHEN** 用户修改某条归类结果
- **THEN** 调用 updateItem(id, updates)，更新对应字段

---

## 4. Word 生成

### 4.1 useWordGenerator

系统**SHALL**提供 useWordGenerator Hook，用于 Word 文档生成。

**路径**: `src/composables/useWordGenerator.ts`

```typescript
function useWordGenerator(): {
  /** 生成 Word 文档 */
  generate(result: ClassificationResult, options?: WordExportOptions): Promise<Blob>

  /** 导出文件 */
  exportToFile(blob: Blob, fileName: string): Promise<void>
}
```

#### Scenario: 生成 Word 文档
- **WHEN** 调用 generate(result, options)
- **THEN** 执行以下流程：
  1. 按产品组分组 items
  2. 生成标题（居中，32pt）
  3. 生成日期（居中，24pt）
  4. 生成统计信息
  5. 分页
  6. 按产品组生成内容，每个产品组下分"已上线"和"开发中"两个小节
  7. 生成落款"由 H5 周报系统自动生成"
  8. 返回 Word Blob

#### Scenario: 导出文件
- **WHEN** 调用 exportToFile(blob, fileName)
- **THEN** 创建下载链接，触发浏览器下载

---

## 5. 过滤规则

### 5.1 预处理过滤（分类级别）

系统**SHALL**在调用 LLM 前过滤整个分类。

**过滤的分类关键词**：
- 需求调研阶段
- 需求分析阶段
- 调研阶段
- 需求确认中
- 需求评审中
- PRD设计中
- 方案设计中
- 售前阶段

#### Scenario: 预处理过滤
- **WHEN** 解析 Excel content 时遇到需要过滤的分类标题
- **THEN** 跳过该分类下的所有条目，不传给 LLM

---

### 5.2 后处理过滤（条目级别）

系统**SHALL**在 LLM 返回结果后过滤无效条目。

**过滤关键词模式**：
```
需求调研、需求调研阶段、需求分析阶段、调研阶段、
需求确认中、需求评审中、需求评审、需求梳理、需求输出、
下周计划、下周、下月、后续、以后、将来、未来、
跟进中、调研中、进行中、处理中、待确认、待讨论、
待评审、待排期、暂缓、暂停、停滞、暂停中、
PRD设计、PRD中、方案设计中、售前阶段
```

#### Scenario: 后处理过滤
- **WHEN** 检查归类结果条目
- **THEN** 如果 rawContent 或 keyInfo 包含过滤关键词，则排除该条目

---

## 6. UI 组件

### 6.1 ClassificationPreview

**路径**: `src/components/classification/ClassificationPreview.vue`

```typescript
interface Props {
  result: ClassificationResult
  editable?: boolean
  showStats?: boolean
}

interface Emits {
  (e: 'confirm'): void
  (e: 'edit', item: ClassificationItem): void
  (e: 'back'): void
}
```

#### Scenario: 渲染归类预览
- **WHEN** ClassificationPreview 组件渲染
- **THEN** 显示 Header（标题+统计卡片）、Filter Bar、ClassificationList、Footer（返回+确认按钮）

---

### 6.2 ClassificationEditor

**路径**: `src/components/classification/ClassificationEditor.vue`

```typescript
interface Props {
  item: ClassificationItem
  productGroups: ProductGroup[]
  statuses: ClassificationStatus[]
  tags: StatusTag[]
}

interface Emits {
  (e: 'save', item: ClassificationItem): void
  (e: 'cancel'): void
}
```

#### Scenario: 渲染编辑弹窗
- **WHEN** ClassificationEditor 弹窗打开
- **THEN** 显示原始内容（只读）、产品组选择、状态选择、标签复选框、关键信息输入

---

### 6.3 ClassificationList

**路径**: `src/components/classification/ClassificationList.vue`

```typescript
interface Props {
  items: ClassificationItem[]
  editable?: boolean
  sortBy?: 'productGroup' | 'status' | 'confidence'
  sortOrder?: 'asc' | 'desc'
}

interface Emits {
  (e: 'edit', item: ClassificationItem): void
  (e: 'select', item: ClassificationItem): void
}
```

---

### 6.4 ClassificationItemCard

**路径**: `src/components/classification/ClassificationItemCard.vue`

```typescript
interface Props {
  item: ClassificationItem
  editable?: boolean
  selected?: boolean
}

interface Emits {
  (e: 'edit'): void
  (e: 'select'): void
}
```

#### Scenario: 渲染归类卡片
- **WHEN** ClassificationItemCard 渲染
- **THEN** 显示产品组彩色标签、状态彩色标签、置信度条、原始内容（可折叠）、编辑按钮

---

### 6.5 ClassificationStats

**路径**: `src/components/classification/ClassificationStats.vue`

```typescript
interface Props {
  stats: ClassificationStats
  showChart?: boolean
}
```

#### Scenario: 渲染统计卡片
- **WHEN** ClassificationStats 渲染
- **THEN** 显示 Summary Cards（Total、Confirmed、Pending）

---

## 7. 常量定义

```typescript
// 路径: src/types/classification.ts

export const PRODUCT_GROUP_ORDER: ProductGroup[] = [
  '来福商城',
  '三方项目',
  '采购与集采管理',
  '三方供应链',
  '销售与财务管理',
  '竞价平台与异常单',
  '履约监控与物流一体化',
]

export const STATUS_ORDER: ClassificationStatus[] = ['已上线', '开发中']

export const BATCH_SIZE = 20
export const MAX_RETRIES = 3
```

---

## 8. LLM Prompt 模板

系统**SHALL**使用以下 Prompt 模板进行归类：

```
你是一个周报分类助手。请对以下内容进行过滤和章节分类。

【过滤规则 - 必须严格执行】
以下情况必须过滤（不返回该项）：
1. 包含"需求调研"、"需求调研阶段"、"需求分析阶段"、"调研阶段"、"需求确认中"、"需求评审中" → 过滤
2. 包含"下周计划"、"下周"、"下月"、"后续"、"以后"、"将来"、"未来" → 过滤
3. 包含"跟进中"、"调研中"、"进行中"、"处理中"、"待确认"、"待讨论" → 过滤
4. 包含"PRD设计"、"PRD中"、"方案设计中"、"售前阶段" → 过滤

【章节分类】
根据内容判断属于哪个章节：
1. 来福商城 (chapter-1)
2. 三方项目 (开发中) (chapter-2)
3. 采购与集采管理 (chapter-3)
4. 三方供应链 (chapter-4)
5. 销售与财务管理 (chapter-5)
6. 竞价平台与异常单 (chapter-6)
7. 履约监控与物流一体化 (chapter-7)

只需要返回 JSON 数组：
{"items":[{"index":0,"chapterId":"chapter-1","chapterTitle":"来福商城","status":"completed","statusText":"[完结]","keyInfo":"...","deadline":"3.24","confidence":0.95},...]}
```

---

## 9. 响应式布局

```typescript
const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
}
```

| 视口宽度 | 布局 |
|----------|------|
| < 480px | 1 列 |
| 768px - 1024px | 2 列 |
| > 1024px | 3 列 |

---

*本文档为正式规范，定义了内容归类功能的完整实现*
