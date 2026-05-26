/**
 * LLM 解析 Composable
 * 大模型迭代 - v0.2
 */

import { MINIMAX_CONFIG } from '../config'

import { ref, readonly, computed } from 'vue'
import type {
  LLMParseResult,
  FilterRuleConfig,
  LLMStatus
} from '../types/llm'
import type { ExcelRow } from '../types/excel'
import type { ChapterMeta } from '../types/report'
import { LLMService, createLLMService } from '../services/LLMService'
import { createDefaultFilterConfig } from '../utils/contentFilter'
import { LLMError } from '../types/llm'
import { runWithConcurrencyLimit } from '../utils/concurrency'

/**
 * 章节元数据（AI 归类 prompt 用）
 */
export const CHAPTER_META: ChapterMeta[] = [
  { id: 'chapter-1', title: '来福商城与卡册', keywords: ['来福', '卡册', '如意', 'C网'], productGroups: ['SALES 组'] },
  { id: 'chapter-2', title: '三方对接项目', keywords: ['三方对接', '三方项目'], productGroups: ['SALES 组'] },
  { id: 'chapter-3', title: '采购与集采管理', keywords: ['采购管理', '集采', 'SRM'], productGroups: ['ERP 组'] },
  { id: 'chapter-4', title: '三方供应链', keywords: ['三方供应链', '京东', '丰享', '盒马', '华润', '麦德龙'], productGroups: ['ERP 组'] },
  { id: 'chapter-5', title: '销售与财务管理', keywords: ['销售管理', '异常单', '财务管理', '售后', '特批', '业绩', '对账', '授信'], productGroups: ['ERP 组'] },
  { id: 'chapter-6', title: '竞价平台与异常单', keywords: ['竞价平台', '异常单', '配品'], productGroups: ['ERP 组'] },
  { id: 'chapter-7', title: '履约监控与物流一体化', keywords: ['履约监控', '物流一体化', 'WMSX', '本网履约', '快递', '专车', '人力包装'], productGroups: ['WMS 组'] }
]

/**
 * LLM 解析器 Composable
 */
export function useLLMParser() {
  // ========== 状态 ==========
  const isParsing = ref(false)
  const parseError = ref<string | null>(null)
  const parseProgress = ref(0)
  const llmStatus = ref<LLMStatus>('disconnected')
  const currentWeekTimePoint = ref('')

  // LLM 服务实例
  let llmService: LLMService | null = null

  // ========== 初始化 ==========
  function initService(apiKey: string, groupId: string): boolean {
    try {
      const modelId = MINIMAX_CONFIG.modelId
      llmService = createLLMService({
        apiKey,
        groupId,
        model: modelId as any,
        timeout: 30000,
        maxRetries: 3
      })
      llmStatus.value = 'connected'
      return true
    } catch (error) {
      parseError.value = error instanceof Error ? error.message : '初始化 LLM 服务失败'
      llmStatus.value = 'error'
      return false
    }
  }

  // ========== 核心方法 ==========

  /**
   * 解析 Excel 行数据
   * @param rows - Excel 行数据
   * @param config - 过滤配置（可选）
   */
  async function parseContent(
    rows: ExcelRow[],
    config?: FilterRuleConfig
  ): Promise<LLMParseResult[]> {
    const filterConfig = config || createDefaultFilterConfig(currentWeekTimePoint.value)

    isParsing.value = true
    parseError.value = null
    parseProgress.value = 0
    llmStatus.value = 'parsing'

    let results: LLMParseResult[] = []

    try {
      const CONCURRENCY_LIMIT = 3
      results = await runWithConcurrencyLimit(
        rows,
        CONCURRENCY_LIMIT,
        async (row) => {
          return await parseSingle(row.content, row.productGroup, filterConfig)
        },
        (completed, total) => {
          parseProgress.value = Math.round((completed / total) * 100)
        }
      )

      llmStatus.value = 'connected'
      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '解析失败'
      parseError.value = errorMessage
      llmStatus.value = 'error'

      // 发生错误时返回错误结果
      return rows.map(row => ({
        rawContent: row.content,
        status: 'error' as const,
        error: errorMessage
      }))
    } finally {
      isParsing.value = false
    }
  }

  /**
   * 解析单条内容
   */
  async function parseSingle(
    content: string,
    productGroup: string,
    config: FilterRuleConfig
  ): Promise<LLMParseResult> {
    // parseContent 只做章节分类，不过滤内容
    // 内容过滤在 classifyRows（AI 过滤）中进行

    // 如果没有 LLM 服务，返回默认结果
    if (!llmService) {
      return {
        rawContent: content,
        status: 'success',
        data: {
          chapterId: 'chapter-1',
          chapterTitle: '来福商城',
          content: content,
          status: 'in_progress',
          statusText: '',
          confidence: 0.5
        }
      }
    }

    // 调用 LLM 解析章节
    try {
      const messages = llmService.buildParsePrompt(
        content,
        productGroup,
        CHAPTER_META
      )

      const response = await llmService.chat(messages)
      const data = llmService.parseResponse(response)

      return {
        rawContent: content,
        status: 'success',
        data: {
          ...data,
          content: content  // 保持原始内容，不过滤
        }
      }
    } catch (error) {
      if (error instanceof LLMError) {
        return {
          rawContent: content,
          status: 'error',
          error: error.message
        }
      }
      throw error
    }
  }

  /**
   * 批量解析（带进度回调）
   */
  async function parseBatch(
    items: { content: string; productGroup: string }[],
    config: FilterRuleConfig,
    onProgress?: (progress: number) => void
  ): Promise<LLMParseResult[]> {
    isParsing.value = true
    parseError.value = null
    parseProgress.value = 0
    llmStatus.value = 'parsing'

    let results: LLMParseResult[] = []

    try {
      const CONCURRENCY_LIMIT = 3
      results = await runWithConcurrencyLimit(
        items,
        CONCURRENCY_LIMIT,
        async (item) => {
          return await parseSingle(item.content, item.productGroup, config)
        },
        (completed, total) => {
          const progress = Math.round((completed / total) * 100)
          parseProgress.value = progress
          onProgress?.(progress)
        }
      )

      llmStatus.value = 'connected'
      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '批量解析失败'
      parseError.value = errorMessage
      llmStatus.value = 'error'
      throw error
    } finally {
      isParsing.value = false
    }
  }

  /**
   * 验证 LLM 连接
   */
  async function validateConnection(): Promise<boolean> {
    if (!llmService) {
      return false
    }

    try {
      const connected = await llmService.validateConnection()
      llmStatus.value = connected ? 'connected' : 'error'
      return connected
    } catch {
      llmStatus.value = 'error'
      return false
    }
  }

  /**
   * 设置当前周时间点
   */
  function setCurrentWeek(timePoint: string) {
    currentWeekTimePoint.value = timePoint
  }

  /**
   * 获取过滤统计
   */
  const filterStats = computed(() => {
    return {
      total: 0,
      filtered: 0,
      success: 0,
      error: 0
    }
  })

  return {
    // 状态（只读）
    isParsing: readonly(isParsing),
    parseError: readonly(parseError),
    parseProgress: readonly(parseProgress),
    llmStatus: readonly(llmStatus),
    filterStats,

    // 方法
    initService,
    parseContent,
    parseSingle,
    parseBatch,
    validateConnection,
    setCurrentWeek
  }
}
