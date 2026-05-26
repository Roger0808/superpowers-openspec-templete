/**
 * MiniMax API 配置
 *
 * VITE_MINIMAX_API_KEY 和 VITE_MINIMAX_MODEL_ID 的配置优先级：
 * 1. .env 文件（本地覆盖，不提交到 git）
 * 2. 本文件（默认配置，随代码提交）
 */

export const MINIMAX_CONFIG = {
  apiKey: import.meta.env.VITE_MINIMAX_API_KEY || '',
  modelId: import.meta.env.VITE_MINIMAX_MODEL_ID || 'MiniMax-M2.7-highspeed',
}
