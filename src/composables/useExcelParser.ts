/**
 * Excel 文件解析 Composable
 * 
 * 严格按照 OpenSpec 规范 03-api-specifications.md 实现
 * 
 * 功能：
 * 1. 读取 .xlsx 文件（ArrayBuffer）
 * 2. 定位"本周内容"Sheet（兼容 Sheet1）
 * 3. 解析三列数据：会议时间点、产品组、同步信息内容
 * 4. 数据校验与清洗
 * 5. 错误处理（格式错误、缺失列）
 * 
 * @see specs/03-api-specifications.md#1-excel-解析-api
 */

import { ref } from 'vue'
import type { ExcelRow, ParsedExcelData } from '../types/excel'

/**
 * Excel 解析 Composable
 */
export function useExcelParser() {
  const isParsing = ref(false)
  const parseError = ref<string | null>(null)
  const parsedData = ref<ParsedExcelData | null>(null)

  /**
   * 解析 Excel 文件
   * @param file - Excel 文件
   * @returns Promise<ParsedExcelData> - 解析后的数据
   * @throws Error - 解析失败时抛出错误
   */
  async function parseExcel(file: File): Promise<ParsedExcelData> {
    isParsing.value = true
    parseError.value = null

    try {
      // 1. 验证文件格式
      validateFileFormat(file)

      // 2. 读取文件为 ArrayBuffer
      const arrayBuffer = await readFileAsArrayBuffer(file)

      // 3. 使用 xlsx 库解析
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      // 4. 定位"本周内容"Sheet（兼容 Sheet1）
      const worksheet = findTargetSheet(workbook)

      // 5. 转换为 JSON
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet)

      // 6. 验证列名
      validateColumns(jsonData)

      // 7. 映射到标准格式
      const rows = mapToExcelRows(jsonData)

      // 8. 返回解析结果
      const result: ParsedExcelData = {
        fileName: file.name,
        sheetName: worksheet['name'] || 'Sheet1',
        rows,
        parseTime: Date.now()
      }

      parsedData.value = result
      return result
    } catch (error) {
      parseError.value = error instanceof Error ? error.message : '解析失败'
      throw error
    } finally {
      isParsing.value = false
    }
  }

  /**
   * 验证文件格式
   */
  function validateFileFormat(file: File): void {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xlsx')) {
      throw new Error('不支持的文件格式，请上传 .xlsx 文件')
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('文件大小不能超过 10MB')
    }
  }

  /**
   * 读取文件为 ArrayBuffer
   */
  function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (result instanceof ArrayBuffer) {
          resolve(result)
        } else {
          reject(new Error('文件读取失败'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * 查找目标 Sheet（优先"本周内容"，兼容 Sheet1）
   */
  function findTargetSheet(workbook: any): any {
    // 优先查找"本周内容"
    let targetSheetName = '本周内容'
    let worksheet = workbook.Sheets[targetSheetName]

    // 如果找不到，使用第一个 Sheet
    if (!worksheet && workbook.SheetNames.length > 0) {
      targetSheetName = workbook.SheetNames[0]
      worksheet = workbook.Sheets[targetSheetName]
      console.log(`[ExcelParser] 未找到"本周内容"Sheet，使用第一个 Sheet: ${targetSheetName}`)
    }

    if (!worksheet) {
      const availableSheets = workbook.SheetNames.join(', ')
      throw new Error(`未找到"${targetSheetName}"Sheet。可用的 Sheet: ${availableSheets}`)
    }

    return worksheet
  }

  /**
   * 验证列名
   */
  function validateColumns(jsonData: any[]): void {
    if (jsonData.length === 0) {
      throw new Error('Excel 文件中没有数据')
    }

    const firstRow = jsonData[0]
    const requiredColumns = ['会议时间点', '产品组', '同步信息内容']

    const hasRequiredColumns = requiredColumns.every(col => 
      firstRow[col] !== undefined
    )

    if (!hasRequiredColumns) {
      const availableColumns = Object.keys(firstRow).join('、')
      throw new Error(
        `Excel 列名不匹配，需要包含：${requiredColumns.join('、')}。当前列名：${availableColumns}`
      )
    }
  }

  /**
   * 映射到 ExcelRow 格式
   */
  function mapToExcelRows(jsonData: any[]): ExcelRow[] {
    return jsonData.map((row: any) => ({
      time: row['会议时间点']?.toString() || '',
      productGroup: row['产品组']?.toString() || '',
      content: row['同步信息内容']?.toString() || ''
    }))
  }

  /**
   * 清除解析数据
   */
  function clearData() {
    parsedData.value = null
    parseError.value = null
  }

  return {
    isParsing,
    parseError,
    parsedData,
    parseExcel,
    clearData
  }
}
