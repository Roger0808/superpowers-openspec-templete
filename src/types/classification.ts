/**
 * 归类功能类型定义
 * 规范: openspec/changes/archive/2026-04-07-content-classification/specs/content-classification/spec.md
 */

import type { ExcelRow } from './excel'

/**
 * 一级分类（产品组）
 */
export type ProductGroup =
  | '来福商城与卡册'
  | '三方对接项目'
  | '采购与集采管理'
  | '三方供应链'
  | '销售与财务管理'
  | '竞价平台与异常单'
  | '履约监控与物流一体化'

/**
 * 产品组常量
 */
export const ProductGroup = {
  LAIFU: '来福商城与卡册' as ProductGroup,
  THIRD_PARTY: '三方对接项目' as ProductGroup,
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
  '来福商城与卡册': '#1890ff',
  '三方对接项目': '#52c41a',
  '采购与集采管理': '#faad14',
  '三方供应链': '#f5222d',
  '销售与财务管理': '#722ed1',
  '竞价平台与异常单': '#eb2f96',
  '履约监控与物流一体化': '#13c2c2',
}

/**
 * 二级分类（状态）
 */
export type ClassificationStatus = '已上线' | '开发中'

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

/**
 * 状态标签
 */
export type StatusTag =
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

/**
 * 单条归类结果
 */
export interface ClassificationItem {
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

/**
 * 归类统计信息
 */
export interface ClassificationStats {
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

/**
 * 归类结果集合
 */
export interface ClassificationResult {
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

/**
 * 归类请求
 */
export interface ClassificationRequest {
  /** Excel 行数据列表 */
  rows: ExcelRow[]
  /** 是否自动确认（默认 false） */
  autoConfirm?: boolean
}

/**
 * 归类错误
 */
export interface ClassificationError {
  /** 错误类型 */
  type: 'PARSE_ERROR' | 'API_ERROR' | 'VALIDATION_ERROR'
  /** 错误消息 */
  message: string
  /** 原始数据 */
  row?: ExcelRow
  /** 错误时间 */
  timestamp: number
}

/**
 * 归类状态
 */
export interface ClassificationState {
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

/**
 * Word 导出选项
 */
export interface WordExportOptions {
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

/**
 * 常量定义
 */
export const PRODUCT_GROUP_ORDER: ProductGroup[] = [
  '来福商城与卡册',
  '三方对接项目',
  '采购与集采管理',
  '三方供应链',
  '销售与财务管理',
  '竞价平台与异常单',
  '履约监控与物流一体化',
]

export const STATUS_ORDER: ClassificationStatus[] = ['已上线', '开发中']

export const BATCH_SIZE = 20
export const MAX_RETRIES = 3
