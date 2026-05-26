/**
 * 报告导出 Composable
 *
 * 严格按照 OpenSpec 规范 03-api-specifications.md 实现
 *
 * 功能：
 * 1. Markdown 导出（UTF-8 with BOM）
 *
 * @see specs/03-api-specifications.md#5-导出-api
 */

import { ref } from 'vue'
import type { WeeklyReport } from '../types/report'

/**
 * 导出状态
 */
export interface ExportState {
  /** 是否正在导出 */
  isExporting: boolean
  /** 导出格式 */
  format: 'markdown' | null
  /** 错误信息 */
  error: string | null
}

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 包含时间戳 */
  includeTimestamp?: boolean
  /** 包含元数据 */
  includeMetadata?: boolean
}

/**
 * 报告导出 Composable
 */
export function useReportExporter() {
  const state = ref<ExportState>({
    isExporting: false,
    format: null,
    error: null
  })

  /**
   * 导出为 Markdown 格式
   * @param report - 周报数据
   * @param fileName - 文件名
   * @param options - 导出选项
   */
  async function exportMarkdown(
    report: WeeklyReport,
    fileName: string,
    options: ExportOptions = {}
  ): Promise<void> {
    state.value = { isExporting: true, format: 'markdown', error: null }

    try {
      const markdown = generateMarkdown(report, options)

      // 创建 Blob（UTF-8 with BOM，避免中文乱码）
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + markdown], { type: 'text/markdown;charset=utf-8' })

      // 触发下载
      downloadBlob(blob, fileName.endsWith('.md') ? fileName : `${fileName}.md`)

      state.value = { isExporting: false, format: null, error: null }
    } catch (error) {
      state.value = {
        isExporting: false,
        format: null,
        error: error instanceof Error ? error.message : 'Markdown 导出失败'
      }
      throw error
    }
  }

  /**
   * 生成 Markdown 内容
   */
  function generateMarkdown(report: WeeklyReport, options: ExportOptions = {}): string {
    let markdown = `# 产品周报\n\n`

    // 元数据
    if (options.includeMetadata !== false) {
      markdown += `**周期**: ${report.weekRange}\n`
      if (options.includeTimestamp !== false) {
        markdown += `**生成时间**: ${new Date(report.generatedAt).toLocaleString('zh-CN')}\n`
      }
      markdown += `\n`
    }

    markdown += `---\n\n`

    // 章节内容
    for (const chapter of report.chapters) {
      markdown += `## ${chapter.title}\n\n`

      if (chapter.items && chapter.items.length > 0) {
        // 按状态分组：已上线、开发中
        const completedItems = chapter.items.filter(item => item.status === 'completed')
        const inProgressItems = chapter.items.filter(item => item.status === 'in_progress')
        const plannedItems = chapter.items.filter(item => item.status === 'planned')

        // 已上线
        if (completedItems.length > 0) {
          markdown += `**已上线**\n`
          for (const item of completedItems) {
            markdown += `- ${item.statusText || ''}${item.title}`
            markdown += `\n`
          }
          markdown += `\n`
        }

        // 开发中
        if (inProgressItems.length > 0) {
          markdown += `**开发中**\n`
          for (const item of inProgressItems) {
            markdown += `- ${item.statusText || ''}${item.title}`
            markdown += `\n`
          }
          markdown += `\n`
        }

        // 计划中
        if (plannedItems.length > 0) {
          markdown += `**计划中**\n`
          for (const item of plannedItems) {
            markdown += `- ${item.statusText || ''}${item.title}`
            markdown += `\n`
          }
          markdown += `\n`
        }
      } else {
        markdown += `暂无内容\n`
      }

      markdown += `\n`
    }

    markdown += `\n---\n\n*本报告由 H5 周报系统自动生成*`

    return markdown
  }

  /**
   * 下载 Blob
   */
  function downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * 重置状态
   */
  function reset(): void {
    state.value = { isExporting: false, format: null, error: null }
  }

  return {
    state,
    exportMarkdown,
    reset
  }
}
