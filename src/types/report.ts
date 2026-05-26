/**
 * 周报相关类型定义
 * 
 * 严格按照 OpenSpec 规范 01-type-definitions.md 实现
 * 
 * @see specs/01-type-definitions.md#2-周报数据结构
 */

/**
 * 章节 ID 类型
 */
export type ChapterId =
  | 'chapter-1'  // 来福商城与卡册
  | 'chapter-2'  // 三方对接项目
  | 'chapter-3'  // 采购与集采管理
  | 'chapter-4'  // 三方供应链
  | 'chapter-5'  // 销售与财务管理
  | 'chapter-6'  // 竞价平台与异常单
  | 'chapter-7'  // 履约监控与物流一体化

/**
 * 章节 ID 常量
 */
export const ChapterId = {
  LAIFU: 'chapter-1' as ChapterId,
  THIRD_PARTY: 'chapter-2' as ChapterId,
  PROCUREMENT: 'chapter-3' as ChapterId,
  SUPPLY_CHAIN: 'chapter-4' as ChapterId,
  SALES_FINANCE: 'chapter-5' as ChapterId,
  BIDDING: 'chapter-6' as ChapterId,
  LOGISTICS: 'chapter-7' as ChapterId,
}

/**
 * 内容状态
 */
export type ContentStatus = 'completed' | 'in_progress' | 'planned'

/**
 * 周报内容项
 */
export interface ReportItem {
  /** 唯一标识 */
  id: string
  /** 章节 ID */
  chapterId: ChapterId
  /** 标题（如：来福促销优化） */
  title: string
  /** 状态标签（如：已上线、开发中、需求调研阶段） */
  status: ContentStatus
  /** 状态文本（如：[完结]、[无变更]、[新增]） */
  statusText: string
  /** 上线时间/期望时间（如：3.24 上线） */
  deadline?: string
  /** 负责人（可选） */
  assignee?: string
  /** 原始内容（Markdown 格式） */
  sourceContent: string
  /** 来源产品组 */
  sourceProductGroup: string
  /** 排序号 */
  order: number
}

/**
 * 周报章节内容
 */
export interface ChapterContent {
  /** 章节 ID */
  chapterId: ChapterId
  /** 章节标题 */
  title: string
  /** 内容项列表 */
  items: ReportItem[]
  /** 章节备注（可选） */
  notes?: string
}

/**
 * 完整周报
 */
export interface WeeklyReport {
  /** 报告 ID */
  id: string
  /** 周期（如：2026-03-24 ~ 2026-03-30） */
  weekRange: string
  /** 生成时间 */
  generatedAt: number
  /** 章节内容 */
  chapters: ChapterContent[]
  /** 最后编辑时间 */
  lastEditedAt?: number
}

/**
 * 章节元数据（用于 LLM 解析）
 */
export interface ChapterMeta {
  /** 章节 ID */
  id: ChapterId
  /** 章节标题 */
  title: string
  /** 关键词列表 */
  keywords: string[]
  /** 所属产品组 */
  productGroups: string[]
}
