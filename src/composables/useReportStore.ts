/**
 * 周报数据 Store
 *
 * 全局单例 Store，用于存储生成后的周报数据
 * 在 HomePage 生成周报，EditorPage 消费周报数据
 */

import { reactive, toRaw } from 'vue'
import type { ChapterContent, WeeklyReport } from '../types/report'

/**
 * 周报 Store 接口
 */
interface ReportStore {
  /** 周报是否已生成 */
  isGenerated: boolean
  /** 周报周期 */
  weekRange: string
  /** 生成时间 */
  generatedAt: number
  /** 章节内容列表 */
  chapters: ChapterContent[]
}

/**
 * 周报数据 Store（全局单例）
 */
const reportStore = reactive<ReportStore>({
  isGenerated: false,
  weekRange: '',
  generatedAt: 0,
  chapters: []
})

/**
 * 设置周报数据
 */
function setReportData(chapters: ChapterContent[], weekRange: string = '') {
  reportStore.chapters = chapters
  reportStore.weekRange = weekRange
  reportStore.generatedAt = Date.now()
  reportStore.isGenerated = true
}

/**
 * 获取周报数据（原始对象）
 */
function getReportData(): { chapters: ChapterContent[], weekRange: string, generatedAt: number } {
  return {
    chapters: toRaw(reportStore.chapters),
    weekRange: reportStore.weekRange,
    generatedAt: reportStore.generatedAt
  }
}

/**
 * 清空周报数据
 */
function clearReportData() {
  reportStore.isGenerated = false
  reportStore.weekRange = ''
  reportStore.generatedAt = 0
  reportStore.chapters = []
}

/**
 * 更新单个章节内容
 */
function updateChapterContent(chapterId: string, content: string) {
  const chapter = reportStore.chapters.find(c => c.chapterId === chapterId)
  if (chapter) {
    chapter.items = []
    // 将纯文本内容存储为 items
    if (content) {
      chapter.items = [{
        id: `${chapterId}-${Date.now()}`,
        chapterId: chapter.chapterId as any,
        title: chapter.title,
        status: 'in_progress' as const,
        statusText: '',
        sourceContent: content,
        sourceProductGroup: '',
        order: 0
      }]
    }
  }
}

/**
 * 检查是否已生成周报
 */
function isReportGenerated(): boolean {
  return reportStore.isGenerated
}

/**
 * useReportStore Composable
 */
export function useReportStore() {
  return {
    reportStore,
    setReportData,
    getReportData,
    clearReportData,
    updateChapterContent,
    isReportGenerated
  }
}
