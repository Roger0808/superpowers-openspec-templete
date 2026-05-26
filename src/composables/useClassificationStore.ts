/**
 * 归类状态管理
 * 规范: openspec/changes/archive/2026-04-07-content-classification/specs/content-classification/spec.md
 */

import { MINIMAX_CONFIG } from '../config'

import { reactive, readonly } from 'vue'
import type {
  ClassificationState,
  ClassificationItem,
  ClassificationResult,
  ClassificationStats,
  ProductGroup,
  ClassificationStatus,
  StatusTag,
  WordExportOptions
} from '../types/classification'
import type { ExcelRow } from '../types/excel'
import { LLMService, createLLMService } from '../services/LLMService'
import {
  PRODUCT_GROUP_ORDER,
  STATUS_ORDER,
  BATCH_SIZE
} from '../types/classification'
import { runWithConcurrencyLimit } from '../utils/concurrency'

/**
 * 创建默认的分类统计
 */
function createDefaultStats(): ClassificationStats {
  const byProductGroup = {} as Record<ProductGroup, number>
  const byStatus = {} as Record<ClassificationStatus, number>

  PRODUCT_GROUP_ORDER.forEach(pg => {
    byProductGroup[pg] = 0
  })

  STATUS_ORDER.forEach(status => {
    byStatus[status] = 0
  })

  return {
    total: 0,
    confirmed: 0,
    pending: 0,
    byProductGroup,
    byStatus
  }
}

/**
 * 计算统计信息
 */
function calculateStats(items: ClassificationItem[]): ClassificationStats {
  const stats = createDefaultStats()

  stats.total = items.length

  items.forEach(item => {
    // 按产品组统计
    if (stats.byProductGroup[item.productGroup] !== undefined) {
      stats.byProductGroup[item.productGroup]++
    }

    // 按状态统计
    if (stats.byStatus[item.status] !== undefined) {
      stats.byStatus[item.status]++
    }

    // 确认统计
    if (item.confirmed) {
      stats.confirmed++
    } else {
      stats.pending++
    }
  })

  return stats
}

/**
 * 归类状态管理 Hook
 */
export function useClassificationStore() {
  // 状态
  const state = reactive<ClassificationState>({
    rawData: [],
    result: null,
    editingItem: null,
    isLoading: false,
    error: null,
    exportOptions: {}
  })

  // LLM 服务实例
  let llmService: LLMService | null = null

  // ========== 初始化 ==========

  /**
   * 初始化 LLM 服务
   */
  function initService(apiKey: string, groupId: string, timeout: number = 30000): boolean {
    try {
      const modelId = MINIMAX_CONFIG.modelId
      console.log(`[ClassificationStore] 初始化 LLM，模型: ${modelId}`)
      llmService = createLLMService({
        apiKey,
        groupId,
        model: modelId as any,
        timeout,
        maxRetries: 3
      })
      return true
    } catch (error) {
      state.error = error instanceof Error ? error.message : '初始化 LLM 服务失败'
      return false
    }
  }

  // ========== 方法 ==========

  /**
   * 设置原始数据
   */
  function setRawData(data: ExcelRow[]): void {
    state.rawData = data
    state.error = null
  }

  /**
   * 构建归类 Prompt（过滤 + 章节分类）
   */
  /**
   * 预处理 content：删除需要过滤的分类下的条目
   * 直接把"需求调研阶段"等分类下的所有条目删除，不传给 LLM
   */
  function preprocessContentWithCategory(content: string): string {
    const lines = content.split('\n')
    let currentCategory = ''
    const processedLines: string[] = []

    // 需要过滤的分类关键词
    const filterCategoryKeywords = ['需求调研阶段', '需求分析阶段', '调研阶段', '需求确认中', '需求评审中', 'PRD设计中', '方案设计中', '售前阶段']

    // 匹配分类标题的正则：数字+点+分类名 或 无序列表+分类名
    const categoryPattern = /^[\d一二三四五六七]+[.、]\s*(.+?)\s*$/
    // 匹配条目：[]开头（带状态标签）的行
    const itemPattern = /^\s*\[/

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      // 检查是否是分类标题
      const categoryMatch = trimmedLine.match(categoryPattern)
      if (categoryMatch && !itemPattern.test(trimmedLine)) {
        const title = categoryMatch[1].trim()
        // 检查这个分类是否需要过滤
        const shouldFilterThisCategory = filterCategoryKeywords.some(keyword =>
          title.includes(keyword)
        )
        if (shouldFilterThisCategory) {
          currentCategory = '__FILTER__' + title
          console.log(`[ClassificationStore] 预处理过滤分类: ${title}`)
        } else {
          currentCategory = title
        }
        continue
      }

      // 如果当前分类被标记为过滤，跳过所有条目
      if (currentCategory.startsWith('__FILTER__')) {
        continue
      }

      // 保留其他内容
      processedLines.push(trimmedLine)
    }

    return processedLines.join('\n')
  }

  /**
   * 检查内容是否包含需要过滤的关键词
   */
  function containsFilterKeyword(content: string): boolean {
    const filterPatterns = [
      '需求调研', '需求调研阶段', '需求分析阶段', '调研阶段',
      '需求确认中', '需求评审中', '需求评审', '需求梳理',
      '下周计划', '下周', '下月', '后续', '以后', '将来', '未来',
      '跟进中', '调研中', '进行中', '处理中', '待确认', '待讨论',
      '待评审', '待排期', '暂缓', '暂停', '停滞', '暂停中',
      'PRD设计', 'PRD中', '方案设计中', '需求输出', '售前阶段'
    ]
    return filterPatterns.some(pattern => content.includes(pattern))
  }

  /**
   * 过滤归类结果中的无效项
   */
  function filterClassifiedItems(items: ClassificationItem[]): ClassificationItem[] {
    return items.filter(item => {
      const rawContent = item.rawContent || ''
      const keyInfo = item.keyInfo || ''
      // 如果原始内容或关键信息包含过滤词，则排除
      if (containsFilterKeyword(rawContent) || containsFilterKeyword(keyInfo)) {
        console.log(`[ClassificationStore] 后处理过滤: ${keyInfo || rawContent.substring(0, 50)}`)
        return false
      }
      return true
    })
  }

  function buildClassificationPrompt(rows: ExcelRow[]): string {
    const prompt = `你是一个周报分类助手。请对以下内容进行过滤和章节分类。

【过滤规则 - 必须严格执行，违者后果自负】
以下情况必须过滤（不返回该项），即使内容看起来很重要也必须过滤：
1. 包含"需求调研"、"需求调研阶段"、"需求分析阶段"、"调研阶段"、"需求确认中"、"需求评审中"、"需求评审"、"需求梳理"、"需求输出" → 过滤（注意：只要包含"需求调研"四个字就必须过滤）
2. 包含"下周计划"、"下周"、"下月"、"后续"、"以后"、"将来"、"未来"（二周后及更远的内容）→ 过滤
3. 包含"跟进中"、"调研中"、"进行中"、"处理中"、"待确认"、"待讨论"、"待评审"、"待排期"、"暂缓"、"暂停"、"停滞"、"暂停中" → 过滤
4. 包含"PRD设计"、"PRD中"、"方案设计中"、"售前阶段" → 过滤
5. 包含"@xxx"格式的，@及之后的内容需要删除后再判断是否过滤

【章节分类】
根据内容判断属于哪个章节：
1. 来福商城与卡册 (chapter-1) - 来福、卡册、如意、C网、会员系统、额度、转赠、促销
2. 三方对接项目 (chapter-2) - 三方对接、商城平台搭建、API对接
3. 采购与集采管理 (chapter-3) - 采购管理、集采、SRM、商品池
4. 三方供应链 (chapter-4) - 京东、丰享、盒马、华润、麦德龙、供应链
5. 销售与财务管理 (chapter-5) - 销售管理、财务、售后、特批、对账、业绩
6. 竞价平台与异常单 (chapter-6) - 竞价平台、异常单、配品
7. 履约监控与物流一体化 (chapter-7) - 履约监控、物流、WMSX、快递、专车

只需要返回 JSON 数组，不要输出思考过程：
{"items":[{"index":0,"chapterId":"chapter-1","chapterTitle":"来福商城","status":"completed","statusText":"[完结]","keyInfo":"salespc任务调度中心额度处理导出文件新增表头-3.24已上线","deadline":"3.24","confidence":0.95},{"index":1,"chapterId":"chapter-3","chapterTitle":"采购与集采管理","status":"in_progress","statusText":"[变更]","keyInfo":"来福商城优化-新增额度主码、额度模板一键回收权限修改-4.2上线","deadline":"4.2","confidence":0.9}]}

重要：keyInfo 必须包含完整内容，包括：
- 原始条目中的所有关键信息
- 日期信息（如"3.24已上线"、"4.2上线"、"预计4月初"等）
- 不要截断，不要简化，保持原文格式

deadline 只提取日期数字部分（如"3.24"、"4.2"、"4月初"），如果没有明确日期则为空字符串

注意：
- 直接返回 JSON，不要解释
- 只返回需要保留的内容，过滤掉的不返回
- @xxx 格式中 @及之后的内容需要删除
- status 可选值：completed / in_progress / planned
- statusText 可选值：[完结]、[无变更]、[新增]、[变更]、[技术]等`

    return prompt
  }

  /**
   * 执行归类（按产品组分批调用 LLM）
   * @param rows - Excel 行数据
   * @param onProgress - 进度回调 (current: number, total: number, groupName: string) => void
   */
  async function classifyRows(
    rows: ExcelRow[],
    onProgress?: (current: number, total: number, groupName: string) => void
  ): Promise<ClassificationResult> {
    if (!llmService) {
      throw new Error('LLM 服务未初始化，请先调用 initService')
    }

    state.isLoading = true
    state.error = null

    const allItems: ClassificationItem[] = []

    try {
      // 定义单个产品组的处理任务
      const processRowTask = async (row: ExcelRow, index: number): Promise<ClassificationItem[]> => {
        console.log(`[ClassificationStore] 处理第 ${index + 1}/${rows.length} 个产品组: ${row.productGroup}`)

        // 触发进度回调 (使用总进度，所以这里在并发控制内部触发不太好，我们改用 onProgress)
        // onProgress 回调在 runWithConcurrencyLimit 中统一处理

        // 构建单行内容的 Prompt
        const systemPrompt = buildClassificationPrompt(rows)
        // 预处理 content，为条目添加分类前缀（如 [需求调研阶段]）
        const processedContent = preprocessContentWithCategory(row.content)
        const userContent = `时间: ${row.time}\n产品组: ${row.productGroup}\n内容: ${processedContent}`

        // 调用 LLM
        const response = await llmService!.chat([
          { role: 'system', content: systemPrompt, sender_name: '用户', sender_type: 'USER' },
          { role: 'user', content: userContent, sender_name: '用户', sender_type: 'USER' }
        ], { max_tokens: 16384 })

        // 解析响应
        const content = response.choices?.[0]?.message?.content || ''

        // 提取 JSON
        let itemsArray: any[] = []
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        try {
          const parsed = JSON.parse(cleanedContent)
          if (Array.isArray(parsed)) {
            itemsArray = parsed
          } else if (parsed.items) {
            itemsArray = parsed.items
          }
        } catch {
          const arrayMatch = cleanedContent.match(/\[[\s\S]*\]/)
          if (arrayMatch) {
            try {
              const parsed = JSON.parse(arrayMatch[0])
              if (Array.isArray(parsed)) {
                itemsArray = parsed
              }
            } catch {
              console.error(`[ClassificationStore] JSON 解析失败 (${index + 1})`)
            }
          }
        }

        // 构建归类结果
        const rowItems: ClassificationItem[] = itemsArray.map((item: any, idx: number) => {
          const chapterTitle = item.chapterTitle as string || row.productGroup
          // LLM 返回的 status: completed -> 已上线, in_progress -> 开发中
          let status: ClassificationStatus = '已上线'
          if (item.status === 'in_progress' || item.status === 'planned') {
            status = '开发中'
          }
          return {
            id: `classification-${Date.now()}-${index}-${idx}`, // 添加 index 避免并发时 id 冲突
            source: row,
            chapterId: item.chapterId,
            chapterTitle,
            productGroup: chapterTitle as ProductGroup,
            status,
            tags: (item.tags || []) as StatusTag[],
            keyInfo: item.keyInfo,
            confidence: item.confidence ?? 0.5,
            rawContent: row.content,
            confirmed: false
          }
        })

        console.log(`[ClassificationStore] 第 ${index + 1}/${rows.length} 个产品组归类完成，新增 ${rowItems.length} 条`)
        return rowItems
      }

      // 执行并发处理 (最大并发数为 3)
      const CONCURRENCY_LIMIT = 3
      const resultsArray = await runWithConcurrencyLimit(
        rows,
        CONCURRENCY_LIMIT,
        processRowTask,
        (completed, total) => {
          // 在并发中，很难确定当前正在处理哪个具体的 groupName，所以传递一个正在处理的信息或者空字符串
          onProgress?.(completed, total, `处理中... (${completed}/${total})`)
        }
      )

      // 扁平化结果数组
      for (const rowItems of resultsArray) {
        allItems.push(...rowItems)
      }

      // 计算统计
      const stats = calculateStats(allItems)

      const classificationResult: ClassificationResult = {
        fileName: '',
        classifiedAt: Date.now(),
        items: allItems,
        stats,
        rawData: rows
      }

      state.result = classificationResult
      return classificationResult

    } catch (error) {
      const message = error instanceof Error ? error.message : '归类失败'
      state.error = message
      throw error
    } finally {
      state.isLoading = false
    }
  }

  /**
   * 确认归类项
   */
  function confirmItem(id: string): void {
    if (!state.result) return

    const item = state.result.items.find(item => item.id === id)
    if (item) {
      item.confirmed = true
      item.confirmedAt = Date.now()

      // 更新统计
      state.result.stats = calculateStats(state.result.items)
    }
  }

  /**
   * 更新归类项
   */
  function updateItem(id: string, updates: Partial<ClassificationItem>): void {
    if (!state.result) return

    const item = state.result.items.find(item => item.id === id)
    if (item) {
      Object.assign(item, updates)

      // 更新统计
      state.result.stats = calculateStats(state.result.items)
    }
  }

  /**
   * 设置当前编辑项
   */
  function setEditingItem(item: ClassificationItem | null): void {
    state.editingItem = item
  }

  /**
   * 设置导出选项
   */
  function setExportOptions(options: WordExportOptions): void {
    state.exportOptions = options
  }

  /**
   * 重置状态
   */
  function reset(): void {
    state.rawData = []
    state.result = null
    state.editingItem = null
    state.isLoading = false
    state.error = null
    state.exportOptions = {}
  }

  return {
    // 状态（只读）
    state: readonly(state),

    // 方法
    initService,
    setRawData,
    classifyRows,
    confirmItem,
    updateItem,
    setEditingItem,
    setExportOptions,
    reset
  }
}
