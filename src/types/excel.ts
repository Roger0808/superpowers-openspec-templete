/**
 * Excel 相关类型定义
 * 
 * 严格按照 OpenSpec 规范 01-type-definitions.md 实现
 * 
 * @see specs/01-type-definitions.md#1-excel-数据结构
 */

/**
 * Excel 行数据（解析后）
 */
export interface ExcelRow {
  /** 会议时间点 */
  time: string
  /** 产品组名称 */
  productGroup: string
  /** 同步信息内容（Markdown 格式） */
  content: string
}

/**
 * Excel 解析结果
 */
export interface ParsedExcelData {
  /** 文件名 */
  fileName: string
  /** Sheet 名称 */
  sheetName: string
  /** 解析的行数据 */
  rows: ExcelRow[]
  /** 解析时间戳 */
  parseTime: number
}
