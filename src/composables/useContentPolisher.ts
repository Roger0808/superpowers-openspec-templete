/**
 * 内容润色 Composable
 * 大模型迭代 - v0.2
 */

import { ref, readonly } from 'vue'
import type { ChatMessage } from '../types/llm'
import { LLMService, createLLMService } from '../services/LLMService'
import { LLMError } from '../types/llm'

/**
 * 内容润色 Composable
 */
export function useContentPolisher() {
  const isPolishing = ref(false)
  const polishingError = ref<string | null>(null)
  let llmService: LLMService | null = null

  /**
   * 初始化服务
   */
  function initService(apiKey: string, groupId: string): boolean {
    try {
      llmService = createLLMService({
        apiKey,
        groupId,
        model: 'abab6-chat',
        timeout: 30000,
        maxRetries: 3
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * 润色内容
   * @param content - 原始内容
   * @returns 润色后的内容
   */
  async function polish(content: string): Promise<string> {
    if (!llmService) {
      throw new Error('LLM 服务未初始化')
    }

    isPolishing.value = true
    polishingError.value = null

    try {
      const systemPrompt = `你是一个专业的周报内容润色助手。请对输入的周报内容进行优化：
1. 语句通顺，无语法错误
2. 表达清晰，简洁专业
3. 格式规范，条理清晰
4. 保持原意不变

请直接返回润色后的内容，不要添加任何说明。`

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content }
      ]

      const response = await llmService.chat(messages, {
        max_tokens: 2000
      })

      const polished = response.choices[0]?.message?.content || content
      return polished.trim()
    } catch (error) {
      if (error instanceof LLMError) {
        polishingError.value = error.message
      } else {
        polishingError.value = error instanceof Error ? error.message : '润色失败'
      }
      throw error
    } finally {
      isPolishing.value = false
    }
  }

  /**
   * 批量润色
   * @param contents - 内容列表
   */
  async function polishBatch(contents: string[]): Promise<string[]> {
    const results: string[] = []

    for (const content of contents) {
      try {
        const polished = await polish(content)
        results.push(polished)
      } catch {
        // 失败时保留原内容
        results.push(content)
      }
    }

    return results
  }

  return {
    isPolishing: readonly(isPolishing),
    polishingError: readonly(polishingError),
    initService,
    polish,
    polishBatch
  }
}
