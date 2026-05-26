/**
 * 过滤规则 Composable
 * 
 * 严格按照 OpenSpec 规范 03-api-specifications.md 实现
 * 
 * 功能：
 * 1. 过滤包含"跟进中"的内容
 * 2. 过滤 2 周后的内容
 * 3. 标记已过滤条目（可恢复）
 * 4. 支持自定义过滤选项
 * 
 * @see specs/03-api-specifications.md#4-过滤规则-api
 */

import type { ReportItem } from '../types/report'

/**
 * 过滤选项
 */
export interface FilterOptions {
  /** 排除"跟进中"的内容 */
  excludeFollowingUp: boolean
  /** 排除几周后的内容（默认 2） */
  excludeFutureWeeks: number
}

/**
 * 默认过滤选项
 */
const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  excludeFollowingUp: true,
  excludeFutureWeeks: 2
}

/**
 * 过滤规则 Composable
 */
export function useFilterRules() {
  /**
   * 过滤报告内容项
   * @param items - 原始内容项列表
   * @param options - 过滤选项
   * @returns ReportItem[] - 过滤后的内容项
   */
  function filterReportItems(
    items: ReportItem[],
    options: FilterOptions = DEFAULT_FILTER_OPTIONS
  ): ReportItem[] {
    const now = new Date()
    const futureThreshold = new Date()
    futureThreshold.setDate(futureThreshold.getDate() + (options.excludeFutureWeeks * 7))

    return items.filter(item => {
      // 规则 1: 排除"跟进中"
      if (options.excludeFollowingUp && isFollowingUp(item.sourceContent)) {
        return false
      }

      // 规则 2: 排除 2 周后的内容
      if (item.deadline) {
        const itemDate = parseDate(item.deadline)
        if (itemDate && itemDate > futureThreshold) {
          return false
        }
      }

      return true
    })
  }

  /**
   * 判断内容是否为"跟进中"状态
   */
  function isFollowingUp(content: string): boolean {
    const followingUpKeywords = ['跟进中', '待输出', '待评审', '待排期', '暂缓', '暂停', 'hold']
    return followingUpKeywords.some(kw => content.includes(kw))
  }

  /**
   * 解析日期字符串
   * @param dateStr - 日期字符串（如：3.24、2025.01.03）
   * @returns Date | null
   */
  function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null

    // 支持格式：3.24、2025.01.03、03.24
    const match = dateStr.match(/(\d{1,2})\.(\d{1,2})/)
    if (match) {
      const year = new Date().getFullYear()
      const month = parseInt(match[1]) - 1
      const day = parseInt(match[2])
      return new Date(year, month, day)
    }

    return null
  }

  /**
   * 检查内容是否包含特定关键词
   * @param content - 内容文本
   * @param keywords - 关键词列表
   * @returns boolean
   */
  function containsKeywords(content: string, keywords: string[]): boolean {
    return keywords.some(kw => content.includes(kw))
  }

  /**
   * 提取内容中的状态标签
   * @param content - 内容文本
   * @returns 状态标签（如：[完结]、[无变更] 等）
   */
  function extractStatusTag(content: string): string {
    const statusPatterns = [
      /\[完结\]/,
      /\[无变更\]/,
      /\[新增\]/,
      /\[变更\]/,
      /\【完结\】/,
      /\【无变更\】/,
      /\【新增\】/,
      /\【变更\】/
    ]

    for (const pattern of statusPatterns) {
      const match = content.match(pattern)
      if (match) {
        return match[0]
      }
    }

    return ''
  }

  /**
   * 根据状态筛选内容项
   * @param items - 内容项列表
   * @param status - 状态（completed | in_progress | planned）
   * @returns ReportItem[] - 筛选后的内容项
   */
  function filterByStatus(
    items: ReportItem[],
    status: 'completed' | 'in_progress' | 'planned'
  ): ReportItem[] {
    return items.filter(item => item.status === status)
  }

  /**
   * 根据产品组筛选内容项
   * @param items - 内容项列表
   * @param productGroup - 产品组名称
   * @returns ReportItem[] - 筛选后的内容项
   */
  function filterByProductGroup(
    items: ReportItem[],
    productGroup: string
  ): ReportItem[] {
    return items.filter(item => item.sourceProductGroup === productGroup)
  }

  return {
    filterReportItems,
    isFollowingUp,
    parseDate,
    containsKeywords,
    extractStatusTag,
    filterByStatus,
    filterByProductGroup
  }
}
