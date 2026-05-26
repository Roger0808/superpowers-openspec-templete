/**
 * LLM 服务类
 * 大模型迭代 - v0.2
 *
 * 封装 MiniMax API 调用
 */

import type {
  MiniMaxConfig,
  ChatMessage,
  ChatResponse,
  ChatOptions,
  LLMContentData,
  LLMErrorCode
} from '../types/llm'
import { LLMError } from '../types/llm'
import type { ChapterMeta } from '../types/report'
import { ChapterId } from '../types/report'

/**
 * 默认 MiniMax API 配置
 */
const DEFAULT_CONFIG: Partial<MiniMaxConfig> = {
  model: 'abab6-chat',
  timeout: 30000,
  maxRetries: 3
}

/**
 * MiniMax API 端点 (旧模型 abab6/abab5.5)
 */
const API_ENDPOINT = 'https://api.minimax.chat/v1/text/chatcompletion_pro'

/**
 * MiniMax M2.7 API 端点 (Anthropic 兼容)
 */
const M2_API_ENDPOINT = 'https://api.minimaxi.com/anthropic/v1/messages'

/**
 * LLM 服务类
 */
export class LLMService {
  private config: MiniMaxConfig

  constructor(config: MiniMaxConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config } as MiniMaxConfig
  }

  /**
   * 发送聊天请求
   * @param messages - 消息列表
   * @param options - 生成选项
   */
  async chat(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<ChatResponse> {
    const { apiKey, model, timeout, maxRetries } = this.config

    if (!apiKey) {
      throw new LLMError(
        'API Key 未配置，请检查 .env 文件',
        'AUTH_FAILED' as LLMErrorCode
      )
    }

    // 判断是否使用 M2.7 API (Anthropic 兼容)
    const isM2Model = model && model.includes('M2')
    const endpoint = isM2Model ? M2_API_ENDPOINT : API_ENDPOINT

    let lastError: Error | null = null
    let retries = 0

    while (retries <= maxRetries) {
      try {
        let body: any
        let headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }

        if (isM2Model) {
          // M2.7 API (Anthropic 兼容格式)
          body = {
            model,
            messages: messages.map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            })),
            max_tokens: options?.max_tokens || 4096,
            temperature: options?.temperature || 0.7
          }
          // Anthropic API 使用 Bearer 认证
          headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        } else {
          // 旧 API 格式
          body = {
            model,
            messages,
            bot_setting: [{
              bot_name: '用户',
              content: '你是周报归类助手，负责将周报内容分类到正确的产品组'
            }],
            reply_constraints: {
              thinking_type: 'not_include',
              reply_language: 'Chinese',
              sender_type: 'BOT',
              sender_name: '用户'
            },
            ...options
          }
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(timeout)
        })

        if (!response.ok) {
          const errorText = await response.text()

          if (response.status === 401) {
            throw new LLMError('API 认证失败，请检查 API Key', 'AUTH_FAILED' as LLMErrorCode)
          }

          if (response.status === 429) {
            throw new LLMError('请求过于频繁，请稍后重试', 'RATE_LIMIT' as LLMErrorCode)
          }

          throw new LLMError(
            `API 错误: ${response.status} - ${errorText}`,
            'SERVER_ERROR' as LLMErrorCode
          )
        }

        const data = await response.json()
        console.log('[LLMService] M2.7 raw response:', JSON.stringify(data, null, 2))

        // M2.7 API 返回格式转换
        if (isM2Model && data.content) {
          // M2.7 返回 content 是一个数组，包含 thinking 和 text
          // text 是实际的回复内容，可能包含 JSON
          let text = ''
          if (Array.isArray(data.content)) {
            // 找到 type="text" 的项
            const textItem = data.content.find((c: any) => c.type === 'text')
            if (textItem) {
              text = textItem.text || ''
            }
          }

          // 清理 thinking 内容，提取 JSON
          text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

          return {
            id: data.id || `msg-${Date.now()}`,
            created: data.created || Date.now(),
            model: model,
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: text
              },
              finish_reason: data.stop_reason || 'stop'
            }],
            usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
          } as unknown as ChatResponse
        }

        return data as ChatResponse
      } catch (error) {
        if (error instanceof LLMError) {
          throw error
        }

        lastError = error as Error

        if (error instanceof DOMException && error.name === 'TimeoutError') {
          throw new LLMError('请求超时', 'TIMEOUT' as LLMErrorCode, lastError)
        }

        retries++
        if (retries <= maxRetries) {
          // 指数退避
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000))
        }
      }
    }

    throw new LLMError(
      `请求失败: ${lastError?.message}`,
      'NETWORK_ERROR' as LLMErrorCode,
      lastError || undefined
    )
  }

  /**
   * 构建解析 prompt
   * @param content - 原始内容
   * @param productGroup - 产品组
   * @param chapterMeta - 章节元数据
   */
  buildParsePrompt(
    content: string,
    productGroup: string,
    chapterMeta: ChapterMeta[]
  ): ChatMessage[] {
    const chapterList = chapterMeta
      .map((ch, idx) => `${idx + 1}. ${ch.title} (${ch.id})`)
      .join('\n')

    const systemPrompt = `你是一个专业的周报解析助手。你的任务是：
1. 将产品组的内容分类到正确的周报章节
2. 识别内容状态（已完成[completed]、进行中[in_progress]、计划中[planned]）
3. 提取状态标签（如[完结]、[无变更]、[新增]）
4. 提取截止时间和负责人（如有）

可用章节：
${chapterList}

请用 JSON 格式返回结果：
{
  "chapterId": "chapter-X",
  "chapterTitle": "章节标题",
  "status": "completed|in_progress|planned",
  "statusText": "状态标签",
  "deadline": "截止时间（如有）",
  "assignee": "负责人（如有）",
  "confidence": 0.0-1.0,
  "processedContent": "处理后的内容"
}

注意：
- 只返回 JSON，不要有其他文字
- 如果无法确定章节，返回 chapter-1
- deadline 只提取时间点，不需要"上线"等动词`

    const userMessage = `产品组：${productGroup}

内容：
${content}`

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  }

  /**
   * 解析 LLM 响应
   * @param response - LLM 响应
   */
  parseResponse(response: ChatResponse): LLMContentData {
    try {
      const message = response.choices[0]?.message?.content || '{}'

      // 尝试提取 JSON
      let jsonStr = message
      // 移除 markdown 代码块
      if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      }

      const data = JSON.parse(jsonStr)

      // 验证 chapterId 是否有效
      const validChapterIds = Object.values(ChapterId)
      const chapterId = validChapterIds.includes(data.chapterId as ChapterId)
        ? data.chapterId
        : ChapterId.LAIFU

      return {
        chapterId: chapterId as ChapterId,
        chapterTitle: data.chapterTitle || '来福商城',
        status: ['completed', 'in_progress', 'planned'].includes(data.status)
          ? data.status
          : 'in_progress',
        statusText: data.statusText || '',
        deadline: data.deadline,
        assignee: data.assignee,
        confidence: typeof data.confidence === 'number' ? data.confidence : 0.8,
        content: data.processedContent || data.content || ''
      }
    } catch (error) {
      throw new LLMError(
        `解析 LLM 响应失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PARSE_ERROR' as LLMErrorCode,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * 验证 API 连接
   */
  async validateConnection(): Promise<boolean> {
    try {
      const messages: ChatMessage[] = [
        { role: 'user', content: '你好' }
      ]
      const response = await this.chat(messages, { max_tokens: 10 })
      return !!response.id
    } catch {
      return false
    }
  }

  /**
   * 获取配置
   */
  getConfig(): MiniMaxConfig {
    return { ...this.config }
  }
}

/**
 * 创建 LLM 服务实例
 * @param config - MiniMax 配置
 */
export function createLLMService(config: MiniMaxConfig): LLMService {
  return new LLMService(config)
}
