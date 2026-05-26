/**
 * 模板管理 Composable
 * 
 * 严格按照 OpenSpec 规范 03-api-specifications.md 实现
 * 
 * 功能：
 * 1. 生成默认模板（7 个章节）
 * 2. 解析 Markdown 模板
 * 3. 模板持久化（localStorage）
 * 4. 加载/保存模板
 * 
 * @see specs/03-api-specifications.md#2-模板生成-api
 */

import { ref } from 'vue'
import type { ReportTemplate, TemplateChapter } from '../types/template'

/**
 * 模板管理 Composable
 */
export function useTemplateManager() {
  const templates = ref<ReportTemplate[]>([])
  const selectedTemplateId = ref<string | null>(null)
  const isLoading = ref(false)
  const saveError = ref<string | null>(null)

  /**
   * 生成默认模板（7 个章节）
   * @returns ReportTemplate - 默认模板
   */
  function generateDefaultTemplate(): ReportTemplate {
    return {
      id: 'default-template',
      name: '产品周报默认模板',
      chapters: [
        { id: 'chapter-1', title: '来福商城与卡册', order: 1, defaultContent: '' },
        { id: 'chapter-2', title: '三方对接项目', order: 2, defaultContent: '' },
        { id: 'chapter-3', title: '采购与集采管理', order: 3, defaultContent: '' },
        { id: 'chapter-4', title: '三方供应链', order: 4, defaultContent: '' },
        { id: 'chapter-5', title: '销售与财务管理', order: 5, defaultContent: '' },
        { id: 'chapter-6', title: '竞价平台与异常单', order: 6, defaultContent: '' },
        { id: 'chapter-7', title: '履约监控与物流一体化', order: 7, defaultContent: '' }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault: true
    }
  }

  /**
   * 解析 Markdown 模板
   * @param markdown - Markdown 格式的模板内容
   * @returns ReportTemplate - 解析后的模板
   */
  function parseTemplate(markdown: string): ReportTemplate {
    // 使用正则解析章节标题（支持 #### 和 ## 两种格式）
    const chapterRegex = /^(?:##|####)\s+\d+\.\s+(.+)/gm
    const chapters: TemplateChapter[] = []
    
    let match
    let order = 0
    while ((match = chapterRegex.exec(markdown)) !== null) {
      chapters.push({
        id: `chapter-${order}`,
        title: match[1].trim(),
        order: order++,
        defaultContent: ''
      })
    }
    
    // 如果没有解析到章节，使用默认模板
    if (chapters.length === 0) {
      console.log('[TemplateManager] 未解析到章节，使用默认模板')
      return generateDefaultTemplate()
    }
    
    return {
      id: generateId(),
      name: '自定义模板',
      chapters,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault: false
    }
  }

  /**
   * 从 localStorage 加载模板
   */
  function loadTemplates(): void {
    isLoading.value = true
    saveError.value = null
    
    try {
      const stored = localStorage.getItem('weekly-report-templates')
      if (stored) {
        templates.value = JSON.parse(stored)
      } else {
        // 没有存储的模板，使用默认模板
        templates.value = [generateDefaultTemplate()]
      }
      
      // 默认选中第一个模板
      if (templates.value.length > 0 && !selectedTemplateId.value) {
        selectedTemplateId.value = templates.value[0].id
      }
    } catch (error) {
      console.error('[TemplateManager] 加载模板失败:', error)
      saveError.value = '加载模板失败，使用默认模板'
      templates.value = [generateDefaultTemplate()]
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 保存模板到 localStorage
   */
  function saveTemplates(): void {
    try {
      localStorage.setItem('weekly-report-templates', JSON.stringify(templates.value))
    } catch (error) {
      console.error('[TemplateManager] 保存模板失败:', error)
      saveError.value = '保存模板失败'
    }
  }

  /**
   * 选择模板
   * @param templateId - 模板 ID
   */
  function selectTemplate(templateId: string): void {
    const template = templates.value.find(t => t.id === templateId)
    if (template) {
      selectedTemplateId.value = templateId
    }
  }

  /**
   * 添加模板
   * @param template - 模板对象
   */
  function addTemplate(template: ReportTemplate): void {
    templates.value.push(template)
    saveTemplates()
  }

  /**
   * 删除模板
   * @param templateId - 模板 ID
   */
  function deleteTemplate(templateId: string): void {
    const index = templates.value.findIndex(t => t.id === templateId)
    if (index !== -1) {
      // 不能删除默认模板
      if (templates.value[index].isDefault) {
        saveError.value = '不能删除默认模板'
        return
      }
      
      templates.value.splice(index, 1)
      saveTemplates()
      
      // 如果删除的是当前选中的模板，选中第一个
      if (selectedTemplateId.value === templateId && templates.value.length > 0) {
        selectedTemplateId.value = templates.value[0].id
      }
    }
  }

  /**
   * 获取当前选中的模板
   */
  function getSelectedTemplate(): ReportTemplate | null {
    return templates.value.find(t => t.id === selectedTemplateId.value) || null
  }

  /**
   * 清除模板
   */
  function clearTemplates(): void {
    templates.value = [generateDefaultTemplate()]
    selectedTemplateId.value = templates.value[0].id
    saveError.value = null
  }

  return {
    templates,
    selectedTemplateId,
    isLoading,
    saveError,
    generateDefaultTemplate,
    parseTemplate,
    loadTemplates,
    saveTemplates,
    selectTemplate,
    addTemplate,
    deleteTemplate,
    getSelectedTemplate,
    clearTemplates
  }
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
