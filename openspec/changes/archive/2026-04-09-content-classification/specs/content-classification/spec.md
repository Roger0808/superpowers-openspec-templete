# 内容归类功能规范

**创建日期**: 2026-04-03
**阶段**: Spec
**功能**: Excel/Word 内容智能归类

---

## MODIFIED Requirements

### Requirement: ExcelRow
系统**SHALL**复用 `src/types/excel.ts` 中已存在的 ExcelRow 接口。

```typescript
// 路径: src/types/excel.ts
interface ExcelRow {
  /** 会议时间点 */
  time: string
  /** 产品组名称 */
  productGroup: string
  /** 同步信息内容（Markdown 格式） */
  content: string
}
```

#### Scenario: 复用现有 ExcelRow 类型
- **WHEN** 需要解析 Excel 行数据
- **THEN** 使用 ExcelRow 接口，包含 time、productGroup、content 三个字段

---

## ADDED Requirements

### Requirement: ProductGroup 类型定义
系统**SHALL**定义 ProductGroup 类型，表示一级分类（产品组）枚举，包含 7 个枚举值。

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

/**
 * 产品组常量
 */
export const ProductGroup = {
  LAIFU: '来福商城' as ProductGroup,
  THIRD_PARTY: '三方项目' as ProductGroup,
  PROCUREMENT: '采购与集采管理' as ProductGroup,
  SUPPLY_CHAIN: '三方供应链' as ProductGroup,
  SALES_FINANCE: '销售与财务管理' as ProductGroup,
  BIDDING: '竞价平台与异常单' as ProductGroup,
  LOGISTICS: '履约监控与物流一体化' as ProductGroup,
}

/**
 * 产品组颜色配置
 */
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

#### Scenario: 创建产品组枚举
- **WHEN** 需要表示产品组分类
- **THEN** 使用 ProductGroup 类型，包含 7 个枚举值

#### Scenario: 使用产品组常量
- **WHEN** 需要引用产品组值
- **THEN** 使用 ProductGroup 常量对象（如 ProductGroup.LAIFU）

#### Scenario: 获取产品组颜色
- **WHEN** 需要根据产品组显示颜色
- **THEN** 使用 PRODUCT_GROUP_COLORS 常量对象

---

### Requirement: ClassificationStatus 类型定义
系统**SHALL**定义 ClassificationStatus 类型，表示二级分类（状态），包含 '已上线' 和 '开发中' 两个枚举值。

```typescript
// 路径: src/types/classification.ts

type ClassificationStatus = '已上线' | '开发中'

/**
 * 状态常量
 */
export const ClassificationStatus = {
  COMPLETED: '已上线' as ClassificationStatus,
  IN_PROGRESS: '开发中' as ClassificationStatus,
}

/**
 * 状态颜色配置
 */
export const STATUS_COLORS: Record<ClassificationStatus, string> = {
  '已上线': '#52c41a',
  '开发中': '#1890ff',
}
```

#### Scenario: 创建状态枚举
- **WHEN** 需要表示归类状态
- **THEN** 使用 ClassificationStatus 类型

#### Scenario: 获取状态颜色
- **WHEN** 需要根据状态显示颜色
- **THEN** 使用 STATUS_COLORS 常量对象

---

### Requirement: StatusTag 类型定义
系统**SHALL**定义 StatusTag 类型，表示状态标签枚举，合并全角/半角后支持 6 种标签值。

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

/**
 * 状态标签常量
 */
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

#### Scenario: 创建状态标签枚举
- **WHEN** 需要表示状态标签
- **THEN** 使用 StatusTag 类型，支持 9 种标签值

#### Scenario: 使用状态标签常量
- **WHEN** 需要引用状态标签
- **THEN** 使用 StatusTag 常量对象

---

### Requirement: ClassificationItem 接口定义
系统**SHALL**定义 ClassificationItem 接口，表示单条归类结果，包含 id、source、productGroup、status、tags、confidence、confirmed 等字段。

```typescript
// 路径: src/types/classification.ts

interface ClassificationItem {
  /** 唯一标识 */
  id: string
  /** 原始 Excel 行数据 */
  source: ExcelRow
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
- **WHEN** 需要表示单条归类结果
- **THEN** 使用 ClassificationItem 接口

#### Scenario: 归类项是否已确认
- **WHEN** 归类项被用户确认
- **THEN** 将 confirmed 设为 true，并记录 confirmedAt 时间戳

---

### Requirement: ClassificationStats 接口定义
系统**SHALL**定义 ClassificationStats 接口，表示归类统计信息。

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

#### Scenario: 创建归类统计
- **WHEN** 需要统计归类结果
- **THEN** 使用 ClassificationStats 接口

---

### Requirement: ClassificationResult 接口定义
系统**SHALL**定义 ClassificationResult 接口，表示归类结果集合。

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

#### Scenario: 创建归类结果
- **WHEN** 需要表示完整归类结果
- **THEN** 使用 ClassificationResult 接口

---

### Requirement: ClassificationRequest 接口定义
系统**SHALL**定义 ClassificationRequest 接口，表示归类请求参数。

```typescript
// 路径: src/types/classification.ts

interface ClassificationRequest {
  /** Excel 行数据列表 */
  rows: ExcelRow[]
  /** 是否自动确认（默认 false） */
  autoConfirm?: boolean
}
```

#### Scenario: 创建归类请求
- **WHEN** 需要发起归类请求
- **THEN** 使用 ClassificationRequest 接口

---

### Requirement: ClassificationError 接口定义
系统**SHALL**定义 ClassificationError 接口，表示归类错误信息。

```typescript
// 路径: src/types/classification.ts

interface ClassificationError {
  /** 错误类型 */
  type: 'PARSE_ERROR' | 'API_ERROR' | 'VALIDATION_ERROR'
  /** 错误消息 */
  message: string
  /** 原始数据 */
  row?: ExcelRow
  /** 错误时间 */
  timestamp: number
}
```

#### Scenario: 归类请求发生错误
- **WHEN** 归类过程中发生错误
- **THEN** 使用 ClassificationError 接口记录错误信息

---

### Requirement: ClassificationState 接口定义
系统**SHALL**定义 ClassificationState 接口，表示归类状态管理。

```typescript
// 路径: src/composables/useClassificationStore.ts

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

#### Scenario: 管理归类状态
- **WHEN** 需要管理归类相关状态
- **THEN** 使用 ClassificationState 接口

---

### Requirement: WordTemplate 接口定义
系统**SHALL**定义 WordTemplate 接口，表示 Word 模板配置。

```typescript
// 路径: src/types/word.ts

interface WordTemplate {
  /** 模板名称 */
  name: string
  /** 模板版本 */
  version: string
  /** 产品组配置 */
  productGroups: WordProductGroup[]
}

interface WordProductGroup {
  /** 产品组名称 */
  name: ProductGroup
  /** 是否显示 */
  enabled: boolean
  /** 排序权重 */
  order: number
}
```

#### Scenario: 创建 Word 模板配置
- **WHEN** 需要配置 Word 导出模板
- **THEN** 使用 WordTemplate 接口

---

### Requirement: WordExportOptions 接口定义
系统**SHALL**定义 WordExportOptions 接口，表示 Word 导出选项。

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

#### Scenario: 创建 Word 导出选项
- **WHEN** 需要配置 Word 导出参数
- **THEN** 使用 WordExportOptions 接口

---

### Requirement: 类型统一导出
系统**SHALL**从 classification.ts 导出所有归类相关类型。

```typescript
// 路径: src/types/classification.ts

export type {
  ClassificationItem,
  ClassificationResult,
  ClassificationRequest,
  ClassificationError,
  ClassificationStats,
  ClassificationState,
  ProductGroup,
  ClassificationStatus,
  StatusTag,
}

export {
  ProductGroup,
  ClassificationStatus,
  StatusTag,
  PRODUCT_GROUP_COLORS,
  STATUS_COLORS,
}
```

#### Scenario: 导出归类相关类型
- **WHEN** 其他模块需要使用归类类型
- **THEN** 从 classification.ts 导入相应类型

---

### Requirement: useClassificationStore 状态管理
系统**SHALL**提供 useClassificationStore Hook，用于归类状态管理。

**路径**: `src/composables/useClassificationStore.ts`

```typescript
// 状态
interface ClassificationState {
  rawData: ExcelRow[]
  result: ClassificationResult | null
  editingItem: ClassificationItem | null
  isLoading: boolean
  error: string | null
  exportOptions: WordExportOptions
}

// 方法
function setRawData(data: ExcelRow[]): void
async function classifyRows(rows: ExcelRow[]): Promise<ClassificationResult>
function confirmItem(id: string): void
function updateItem(id: string, updates: Partial<ClassificationItem>): void
```

#### Scenario: 设置原始数据
- **WHEN** 需要设置待归类的原始 Excel 数据
- **THEN** 调用 setRawData(data) 方法

#### Scenario: 执行归类
- **WHEN** 需要对 Excel 数据执行归类
- **THEN** 调用 classifyRows(rows) 方法，返回 ClassificationResult

#### Scenario: 归类流程
- **WHEN** 调用 classifyRows
- **THEN** 执行以下流程：
  1. 调用 LLMService.buildClassificationPrompt()
  2. 调用 LLMService.chat()
  3. 解析返回结果
  4. 更新 result 状态

#### Scenario: 确认归类项
- **WHEN** 用户确认某条归类结果
- **THEN** 调用 confirmItem(id) 方法，将该条 confirmed 设为 true

#### Scenario: 更新归类项
- **WHEN** 用户修改某条归类结果
- **THEN** 调用 updateItem(id, updates) 方法，更新对应字段

---

### Requirement: useWordGenerator Word 生成
系统**SHALL**提供 useWordGenerator Hook，用于 Word 文档生成。

**路径**: `src/composables/useWordGenerator.ts`

```typescript
async function generate(
  result: ClassificationResult,
  options?: WordExportOptions
): Promise<Blob>

async function exportToFile(blob: Blob, fileName: string): Promise<void>
```

#### Scenario: 生成 Word 文档
- **WHEN** 需要将归类结果导出为 Word
- **THEN** 调用 generate(result, options) 方法，返回 Word Blob

#### Scenario: 导出文件
- **WHEN** 需要下载生成的 Word 文件
- **THEN** 调用 exportToFile(blob, fileName) 方法触发下载

---

### Requirement: ClassificationPreview 组件
系统**SHALL**提供 ClassificationPreview 组件，用于归类结果预览。

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

#### Scenario: 用户确认归类
- **WHEN** 用户点击确认按钮
- **THEN** 触发 'confirm' 事件

#### Scenario: 用户编辑归类项
- **WHEN** 用户点击某归类项的编辑按钮
- **THEN** 触发 'edit' 事件并传递该 ClassificationItem

---

### Requirement: ClassificationEditor 组件
系统**SHALL**提供 ClassificationEditor 组件，用于编辑单条归类项。

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

#### Scenario: 保存编辑
- **WHEN** 用户修改后点击保存
- **THEN** 触发 'save' 事件并传递更新后的 ClassificationItem

---

### Requirement: ClassificationList 组件
系统**SHALL**提供 ClassificationList 组件，用于归类项列表展示。

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

#### Scenario: 渲染归类列表
- **WHEN** ClassificationList 组件渲染
- **THEN** 显示 Sort Bar 和 ClassificationItemCard 列表（支持虚拟滚动）

#### Scenario: 排序归类项
- **WHEN** 用户选择排序字段和顺序
- **THEN** 按指定字段和顺序排序列表

---

### Requirement: ClassificationItemCard 组件
系统**SHALL**提供 ClassificationItemCard 组件，用于单条归类项的卡片展示。

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

#### Scenario: 产品组颜色
- **WHEN** 渲染产品组标签
- **THEN** 根据 PRODUCT_GROUP_COLORS 显示对应颜色：
  - 来福商城: #1890ff (蓝色)
  - 三方项目: #52c41a (绿色)
  - 采购与集采管理: #faad14 (橙色)
  - 三方供应链: #f5222d (红色)
  - 销售与财务管理: #722ed1 (紫色)
  - 竞价平台与异常单: #eb2f96 (粉色)
  - 履约监控与物流一体化: #13c2c2 (青色)

#### Scenario: 状态颜色
- **WHEN** 渲染状态标签
- **THEN** 根据 STATUS_COLORS 显示颜色：
  - 已上线: #52c41a (绿色)
  - 开发中: #1890ff (蓝色)

---

### Requirement: ClassificationStats 组件
系统**SHALL**提供 ClassificationStats 组件，用于归类统计展示。

**路径**: `src/components/classification/ClassificationStats.vue`

```typescript
interface Props {
  stats: ClassificationStats
  showChart?: boolean
}
```

#### Scenario: 渲染统计卡片
- **WHEN** ClassificationStats 渲染
- **THEN** 显示 Summary Cards（Total、Confirmed、Pending）和图表

---

### Requirement: 响应式设计
系统**SHALL**支持响应式布局，根据不同视口宽度显示不同列数。

```typescript
const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
}
```

#### Scenario: 移动端布局
- **WHEN** 视口宽度 < 480px
- **THEN** 显示 1 列布局

#### Scenario: 桌面布局
- **WHEN** 视口宽度 768px - 1024px
- **THEN** 显示 2 列网格布局

#### Scenario: 宽屏布局
- **WHEN** 视口宽度 > 1024px
- **THEN** 显示 3 列网格布局

---

### Requirement: 错误处理机制
系统**SHALL**提供错误处理机制，用于归类过程中的错误处理。

#### Scenario: 解析错误
- **WHEN** LLM 响应解析失败
- **THEN** 标记为 PARSE_ERROR，使用默认值，用户手动确认

#### Scenario: API 错误
- **WHEN** API 调用失败
- **THEN** 标记为 API_ERROR，记录错误信息，可重试

---

### Requirement: 降级策略
系统**SHALL**提供降级策略，当 LLM 不可用时使用关键词匹配。

#### Scenario: LLM 不可用
- **WHEN** LLM 服务不可用
- **THEN** 使用关键词匹配进行归类（复用 useContentMapper），标记置信度为 0.5，提示用户确认

---

### Requirement: 常量定义
系统**SHALL**预定义归类相关的常量值。

```typescript
const PRODUCT_GROUP_ORDER: ProductGroup[] = [
  '来福商城',
  '三方项目',
  '采购与集采管理',
  '三方供应链',
  '销售与财务管理',
  '竞价平台与异常单',
  '履约监控与物流一体化',
]

const STATUS_ORDER: ClassificationStatus[] = ['已上线', '开发中']

const BATCH_SIZE = 20
const MAX_RETRIES = 3
```

#### Scenario: 使用常量
- **WHEN** 需要排序或批量处理
- **THEN** 使用预定义的常量值

---

*本文档为 Spec 阶段产出，定义了内容归类功能的所有规范*
