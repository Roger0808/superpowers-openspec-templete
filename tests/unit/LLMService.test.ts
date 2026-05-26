/**
 * LLM 服务单元测试
 * 大模型迭代 - v0.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LLMService } from '../../src/services/LLMService'
import type { ChapterMeta } from '../../src/types/report'

// Mock fetch
global.fetch = vi.fn()

describe('LLMService', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    groupId: 'test-group-id',
    model: 'abab6-chat' as const,
    timeout: 30000,
    maxRetries: 1
  }

  const chapterMeta: ChapterMeta[] = [
    { id: 'chapter-1', title: '来福商城', keywords: ['来福'], productGroups: ['SALES 组'] },
    { id: 'chapter-2', title: '三方项目', keywords: ['三方'], productGroups: ['SALES 组'] }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('构造函数', () => {
    it('应正确初始化配置', () => {
      const service = new LLMService(mockConfig)
      expect(service.getConfig().apiKey).toBe('test-api-key')
      expect(service.getConfig().model).toBe('abab6-chat')
    })
  })

  describe('buildParsePrompt', () => {
    it('应生成正确的 prompt', () => {
      const service = new LLMService(mockConfig)
      const messages = service.buildParsePrompt('测试内容', 'SALES 组', chapterMeta)

      expect(messages).toHaveLength(2)
      expect(messages[0].role).toBe('system')
      expect(messages[1].role).toBe('user')
      expect(messages[1].content).toContain('SALES 组')
      expect(messages[1].content).toContain('测试内容')
    })
  })

  describe('parseResponse', () => {
    it('应正确解析有效响应', () => {
      const service = new LLMService(mockConfig)
      const mockResponse = {
        id: 'test-id',
        choices: [{
          message: {
            role: 'assistant',
            content: JSON.stringify({
              chapterId: 'chapter-1',
              chapterTitle: '来福商城',
              status: 'completed',
              statusText: '[完结]',
              deadline: '3.27',
              assignee: '张三',
              confidence: 0.95,
              processedContent: '已完成首页改版'
            })
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150
        }
      }

      const result = service.parseResponse(mockResponse as any)

      expect(result.chapterId).toBe('chapter-1')
      expect(result.status).toBe('completed')
      expect(result.confidence).toBe(0.95)
      expect(result.content).toBe('已完成首页改版')
    })

    it('应处理 markdown 代码块', () => {
      const service = new LLMService(mockConfig)
      const mockResponse = {
        id: 'test-id',
        choices: [{
          message: {
            role: 'assistant',
            content: '```json\n{"chapterId": "chapter-2", "status": "in_progress"}\n```'
          },
          finish_reason: 'stop'
        }],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 }
      }

      const result = service.parseResponse(mockResponse as any)
      expect(result.chapterId).toBe('chapter-2')
      expect(result.status).toBe('in_progress')
    })

    it('应处理无效 chapterId', () => {
      const service = new LLMService(mockConfig)
      const mockResponse = {
        id: 'test-id',
        choices: [{
          message: {
            role: 'assistant',
            content: '{"chapterId": "invalid", "status": "completed"}'
          },
          finish_reason: 'stop'
        }],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 }
      }

      const result = service.parseResponse(mockResponse as any)
      // 无效的 chapterId 应默认返回 chapter-1
      expect(result.chapterId).toBe('chapter-1')
    })
  })

  describe('validateConnection', () => {
    it('连接成功时返回 true', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'test' })
      } as Response)

      const service = new LLMService(mockConfig)
      const result = await service.validateConnection()
      expect(result).toBe(true)
    })

    it('连接失败时返回 false', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const service = new LLMService(mockConfig)
      const result = await service.validateConnection()
      expect(result).toBe(false)
    })
  })
})
