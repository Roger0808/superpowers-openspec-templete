/**
 * 模板类型定义
 */

export interface TemplateChapter {
  id: string
  title: string
  order: number
  defaultContent?: string
}

export interface ReportTemplate {
  id: string
  name: string
  chapters: TemplateChapter[]
  createdAt: number
  updatedAt: number
  isDefault: boolean
}
