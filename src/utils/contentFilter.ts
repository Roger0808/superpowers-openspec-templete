/**
 * 内容过滤工具函数
 * 大模型迭代 - v0.2
 *
 * 规则1：跟进中、调研中的内容不汇报
 * 规则2：不汇报周后内容
 * 规则3：括号内的内容不汇报
 */

import type { FilterReason, FilterRuleConfig, FilterResult } from '../types/llm'

/**
 * 跟进中/调研中关键词
 */
const IN_PROGRESS_KEYWORDS = [
  '跟进中', '调研中', '进行中', '处理中',
  '待确认', '待讨论', '待评审', '待排期',
  '暂缓', '暂停', '停滞'
]

/**
 * 周后内容关键词
 */
const FUTURE_KEYWORDS = [
  '下周', '下周计划', '下周安排',
  '下月', '下月计划', '下月安排',
  '后续', '以后', '将来', '未来'
]

/**
 * 需求调研阶段关键词
 */
const RESEARCH_PHASE_KEYWORDS = [
  '需求调研', '需求调研阶段', '需求调研中', '需求分析阶段',
  '调研阶段', '需求确认中', '需求评审中'
]

/**
 * 检查内容是否包含跟进中/调研中关键词
 * @param content - 原始内容
 * @returns 是否包含
 */
export function isInProgressOrResearching(content: string): boolean {
  return IN_PROGRESS_KEYWORDS.some(keyword => content.includes(keyword))
}

/**
 * 检查内容是否包含周后内容
 * @param content - 原始内容
 * @returns 是否包含
 */
export function containsFutureContent(content: string): boolean {
  return FUTURE_KEYWORDS.some(keyword => content.includes(keyword))
}

/**
 * 检查内容是否包含需求调研阶段关键词
 * @param content - 原始内容
 * @returns 是否包含
 */
export function isResearchPhase(content: string): boolean {
  return RESEARCH_PHASE_KEYWORDS.some(keyword => content.includes(keyword))
}

/**
 * 移除 @ 之后的所有内容
 * @param content - 原始内容
 * @returns 处理后的内容
 */
export function removeAfterAt(content: string): string {
  const atIndex = content.indexOf('@')
  if (atIndex !== -1) {
    return content.substring(0, atIndex).trim()
  }
  return content
}

/**
 * 过滤括号内容（中文和英文括号）
 * @param content - 原始内容
 * @returns 过滤后的内容
 */
export function filterParenthetical(content: string): string {
  // 过滤中文括号【】
  let result = content.replace(/【[^】]*】/g, '')
  // 过滤中文括号（）
  result = result.replace(/（[^）]*）/g, '')
  // 过滤英文括号()
  result = result.replace(/\([^)]*\)/g, '')
  // 过滤中文书名号《》
  result = result.replace(/《[^》]*》/g, '')
  return result.trim()
}

/**
 * 提取截止时间
 * @param content - 原始内容
 * @returns 截止时间字符串
 */
export function extractDeadline(content: string): string | undefined {
  // 匹配时间格式：3.24 上线、3.31 上线、4.2 上线
  const timePattern = /(\d{1,2}\.\d{1,2}\s*(?:上线|完成|评审|发布)?)/
  const match = content.match(timePattern)
  if (match) {
    return match[1].trim()
  }
  return undefined
}

/**
 * 提取负责人
 * @param content - 原始内容
 * @returns 负责人姓名
 */
export function extractAssignee(content: string): string | undefined {
  // 匹配 @姓名 格式
  const assigneePattern = /@([\u4e00-\u9fa5\w]+)/
  const match = content.match(assigneePattern)
  if (match) {
    return match[1]
  }
  return undefined
}

/**
 * 应用全部过滤规则
 * @param content - 原始内容
 * @param config - 过滤配置
 * @returns 过滤结果
 */
export function applyFilter(content: string, config: FilterRuleConfig): FilterResult {
  // 规则1：过滤跟进中/调研中内容
  if (config.filterInProgress) {
    if (content.includes('调研中')) {
      return {
        filtered: true,
        reason: '调研中'
      }
    }
    if (isInProgressOrResearching(content)) {
      return {
        filtered: true,
        reason: '跟进中'
      }
    }
  }

  // 规则2：过滤周后内容
  if (config.filterFutureContent && containsFutureContent(content)) {
    return {
      filtered: true,
      reason: '周后内容'
    }
  }

  let processedContent = content

  // 规则3：过滤括号内内容
  if (config.filterParenthetical) {
    processedContent = filterParenthetical(content)
    // 如果过滤后内容为空
    if (!processedContent || processedContent.length < 2) {
      return {
        filtered: true,
        reason: '括号内'
      }
    }
  }

  // 规则5：移除 @ 之后的内容
  processedContent = removeAfterAt(processedContent)

  // 检查过滤后是否还有有效内容
  if (!processedContent || processedContent.trim().length === 0) {
    return {
      filtered: true,
      reason: '括号内'
    }
  }

  return {
    filtered: false,
    content: processedContent.trim()
  }
}

/**
 * 批量过滤内容
 * @param contents - 内容列表
 * @param config - 过滤配置
 * @returns 过滤结果列表
 */
export function filterBatch(
  contents: string[],
  config: FilterRuleConfig
): FilterResult[] {
  return contents.map(content => applyFilter(content, config))
}

/**
 * 创建默认过滤配置
 * @param currentWeekTimePoint - 当前周时间点
 * @returns 过滤配置
 */
export function createDefaultFilterConfig(currentWeekTimePoint: string = ''): FilterRuleConfig {
  return {
    filterInProgress: true,
    filterResearching: true,
    filterFutureContent: true,
    filterParenthetical: true,
    currentWeekTimePoint
  }
}
