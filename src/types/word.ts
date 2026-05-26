/**
 * Word 生成类型定义
 * 规范: openspec/changes/archive/2026-04-07-content-classification/specs/content-classification/spec.md
 */

import type { ProductGroup } from './classification'

/**
 * Word 产品组配置
 */
export interface WordProductGroup {
  /** 产品组名称 */
  name: ProductGroup
  /** 是否显示 */
  enabled: boolean
  /** 排序权重 */
  order: number
}

/**
 * Word 模板配置
 */
export interface WordTemplate {
  /** 模板名称 */
  name: string
  /** 模板版本 */
  version: string
  /** 产品组配置 */
  productGroups: WordProductGroup[]
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
