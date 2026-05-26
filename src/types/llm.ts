/**
 * LLM 相关类型定义
 * 大模型迭代 - v0.2
 */

import type { ChapterId } from './report'

/**
 * LLM 解析请求
 */
export interface LLMParseRequest {
  /** Excel 行原始内容 */
  rawContent: string
  /** 产品组名称 */
  productGroup: string
  /** 会议时间点 */
  timePoint: string
}

/**
 * 过滤原因枚举
 */
export type FilterReason =
  | '跟进中'    // 规则1：跟进中、调研中
  | '调研中'    // 规则1：跟进中、调研中
  | '周后内容'  // 规则2：不汇报周后内容
  | '括号内'    // 规则3：括号内的内容
  | '需求调研阶段'  // 规则4：需求调研阶段

/**
 * 内容过滤结果
 */
export interface FilterResult {
  /** 是否被过滤 */
  filtered: boolean
  /** 过滤原因（如果被过滤） */
  reason?: FilterReason
  /** 过滤后的内容 */
  content?: string
}

/**
 * LLM 解析的内容数据
 */
export interface LLMContentData {
  /** 章节 ID */
  chapterId: ChapterId
  /** 章节标题 */
  chapterTitle: string
  /** 处理后的内容（过滤后） */
  content: string
  /** 状态：completed | in_progress | planned */
  status: 'completed' | 'in_progress' | 'planned'
  /** 状态标签文本 */
  statusText: string
  /** 截止时间（如有） */
  deadline?: string
  /** 负责人（如有） */
  assignee?: string
  /** 置信度 0-1 */
  confidence: number
}

/**
 * 单条内容 LLM 解析结果
 */
export interface LLMParseResult {
  /** 原始内容 */
  rawContent: string
  /** 解析状态 */
  status: 'success' | 'filtered' | 'error'
  /** 过滤原因（如果被过滤） */
  filterReason?: FilterReason
  /** 解析结果（如果成功） */
  data?: LLMContentData
  /** 错误信息（如果出错） */
  error?: string
}

/**
 * 内容过滤规则配置
 */
export interface FilterRuleConfig {
  /** 规则1：过滤跟进中内容 */
  filterInProgress: boolean
  /** 规则1：过滤调研中内容 */
  filterResearching: boolean
  /** 规则2：过滤周后内容 */
  filterFutureContent: boolean
  /** 规则3：过滤括号内内容 */
  filterParenthetical: boolean
  /** 当前周时间点（用于规则2判断） */
  currentWeekTimePoint: string
}

/**
 * MiniMax API 配置
 */
export interface MiniMaxConfig {
  /** API Key */
  apiKey: string
  /** Group ID */
  groupId: string
  /** 模型名称 */
  model: 'abab6-chat' | 'abab5.5-chat' | 'MiniMax-M2.7-highspeed'
  /** 请求超时 ms */
  timeout: number
  /** 最大重试次数 */
  maxRetries: number
}

/**
 * Chat 消息
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  sender_name?: string
  sender_type?: string
}

/**
 * Chat 选项
 */
export interface ChatOptions {
  temperature?: number
  max_tokens?: number
}

/**
 * Chat 响应
 */
export interface ChatResponse {
  id: string
  choices: {
    message: ChatMessage
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * LLM 错误类型
 */
export enum LLMErrorCode {
  /** API Key 无效或缺失 */
  AUTH_FAILED = 'AUTH_FAILED',
  /** 请求超时 */
  TIMEOUT = 'TIMEOUT',
  /** 速率限制 */
  RATE_LIMIT = 'RATE_LIMIT',
  /** 模型不存在 */
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  /** 服务端错误 */
  SERVER_ERROR = 'SERVER_ERROR',
  /** 网络错误 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** 解析错误 */
  PARSE_ERROR = 'PARSE_ERROR',
  /** 内容过滤 */
  CONTENT_FILTERED = 'CONTENT_FILTERED',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN'
}

/**
 * LLM 错误类
 */
export class LLMError extends Error {
  code: LLMErrorCode
  cause?: Error

  constructor(message: string, code: LLMErrorCode, cause?: Error) {
    super(message)
    this.name = 'LLMError'
    this.code = code
    this.cause = cause
  }
}

/**
 * LLM 连接状态
 */
export type LLMStatus = 'connected' | 'disconnected' | 'error' | 'parsing'
