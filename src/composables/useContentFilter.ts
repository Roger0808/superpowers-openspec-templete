/**
 * 内容过滤器 Composable
 * 大模型迭代 - v0.2
 */

import type { FilterRuleConfig, FilterResult } from '../types/llm'
import {
  applyFilter,
  filterBatch,
  isInProgressOrResearching,
  containsFutureContent,
  filterParenthetical,
  createDefaultFilterConfig
} from '../utils/contentFilter'

/**
 * 内容过滤器 Composable
 */
export function useContentFilter() {
  /**
   * 执行内容过滤
   * @param content - 待过滤内容
   * @param config - 过滤配置
   */
  function filter(content: string, config: FilterRuleConfig): FilterResult {
    return applyFilter(content, config)
  }

  /**
   * 批量过滤
   */
  function filterContentBatch(
    contents: string[],
    config: FilterRuleConfig
  ): FilterResult[] {
    return filterBatch(contents, config)
  }

  /**
   * 检查是否包含跟进中/调研中关键词
   */
  function checkInProgressOrResearching(content: string): boolean {
    return isInProgressOrResearching(content)
  }

  /**
   * 检查是否包含周后内容
   */
  function checkFutureContent(content: string): boolean {
    return containsFutureContent(content)
  }

  /**
   * 过滤括号内容
   */
  function removeParenthetical(content: string): string {
    return filterParenthetical(content)
  }

  /**
   * 创建默认过滤配置
   */
  function getDefaultConfig(currentWeek?: string): FilterRuleConfig {
    return createDefaultFilterConfig(currentWeek)
  }

  return {
    filter,
    filterContentBatch,
    checkInProgressOrResearching,
    checkFutureContent,
    removeParenthetical,
    getDefaultConfig
  }
}
