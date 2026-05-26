<template>
  <div class="editor-page">
    <!-- 顶部导航栏 -->
    <header class="editor-header">
      <div class="header-left">
        <!-- 汉堡按钮（小屏显示） -->
        <button class="hamburger-button" @click="openDrawer">
          ☰
        </button>
        <button class="back-button" @click="handleBack">
          ⬅️
        </button>
        <h1 class="page-title">周报编辑</h1>
      </div>

      <div class="header-right">
        <button class="export-button" @click="showExportPanel = true">
          📥 导出
        </button>
      </div>
    </header>
    
    <!-- 主体内容 -->
    <div class="editor-body">
      <!-- 左侧章节导航（小屏隐藏，使用抽屉） -->
      <aside class="sidebar chapter-nav-sidebar">
        <ChapterNav
          :chapters="chapters"
          :current-chapter-id="currentChapterId"
          :compact="isMobile"
          @chapter-select="handleChapterSelect"
        />
      </aside>

      <!-- 抽屉导航（小屏） -->
      <Drawer
        v-model:visible="drawerVisible"
        title="章节导航"
        width="280px"
        @close="closeDrawer"
      >
        <ChapterNav
          :chapters="chapters"
          :current-chapter-id="currentChapterId"
          :compact="false"
          @chapter-select="handleChapterSelect"
        />
      </Drawer>
      
      <!-- 右侧编辑器 -->
      <main class="editor-main">
        <div class="editor-with-preview">
          <div class="editor-pane">
            <CodeMirrorEditor
              v-model="currentChapterContent"
              placeholder="请输入 Markdown 内容..."
            />
          </div>
          <div class="preview-pane">
            <div class="preview-header">预览</div>
            <div class="preview-content markdown-body" v-html="renderedContent"></div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- 导出面板 -->
    <div v-if="showExportPanel" class="export-overlay" @click="showExportPanel = false">
      <div class="export-panel" @click.stop>
        <h2 class="export-title">📥 导出周报</h2>
        
        <div class="export-form">
          <div class="form-group">
            <label class="form-label">导出格式</label>
            <select v-model="exportFormat" class="form-select">
              <option value="markdown">Markdown (.md)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">文件名</label>
            <input
              v-model="exportFileName"
              type="text"
              class="form-input"
              placeholder="周报_YYYY-MM-DD"
            />
          </div>
        </div>
        
        <div class="export-actions">
          <button class="action-button secondary" @click="showExportPanel = false">
            取消
          </button>
          <button class="action-button primary" @click="handleExport" :disabled="isExporting">
            {{ isExporting ? '导出中...' : '导出' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import ChapterNav from '../components/common/ChapterNav.vue'
import CodeMirrorEditor from '../components/editor/CodeMirrorEditor.vue'
import Drawer from '../components/common/Drawer.vue'
import type { ChapterId, ChapterContent, WeeklyReport } from '../types/report'
import { useReportStore } from '../composables/useReportStore'
import { useReportExporter } from '../composables/useReportExporter'

const router = useRouter()

// ========== 状态 ==========
const currentChapterId = ref<ChapterId>('chapter-1')
const showExportPanel = ref(false)
const exportFormat = ref<'markdown'>('markdown')
const exportFileName = ref(`周报_${new Date().toISOString().split('T')[0]}`)
const isExporting = ref(false)
const isMobile = ref(false)
const drawerVisible = ref(false)

const openDrawer = () => {
  drawerVisible.value = true
}

const closeDrawer = () => {
  drawerVisible.value = false
}

const handleChapterSelect = (chapterId: ChapterId) => {
  currentChapterId.value = chapterId
  closeDrawer()
}

// 从 Store 获取章节数据
const { reportStore } = useReportStore()
const { exportMarkdown } = useReportExporter()

// 章节数据 - 优先从 Store 获取，否则使用默认值
const chapters = ref<ChapterContent[]>(
  reportStore.isGenerated
    ? reportStore.chapters
    : [
        { chapterId: 'chapter-1', title: '来福商城与卡册', items: [] },
        { chapterId: 'chapter-2', title: '三方对接项目', items: [] },
        { chapterId: 'chapter-3', title: '采购与集采管理', items: [] },
        { chapterId: 'chapter-4', title: '三方供应链', items: [] },
        { chapterId: 'chapter-5', title: '销售与财务管理', items: [] },
        { chapterId: 'chapter-6', title: '竞价平台与异常单', items: [] },
        { chapterId: 'chapter-7', title: '履约监控与物流一体化', items: [] }
      ]
)

// 章节内容存储
const chapterContents = reactive<Record<string, string>>({
  'chapter-1': '',
  'chapter-2': '',
  'chapter-3': '',
  'chapter-4': '',
  'chapter-5': '',
  'chapter-6': '',
  'chapter-7': ''
})

// ========== 计算属性 ==========
// 从 Store 的 chapters 中获取当前章节的内容
const currentChapterContent = computed({
  get: () => {
    const chapter = reportStore.chapters.find(c => c.chapterId === currentChapterId.value)
    if (chapter && chapter.items.length > 0) {
      // 按状态分组
      const completedItems = chapter.items.filter(item => item.status === 'completed')
      const inProgressItems = chapter.items.filter(item => item.status === 'in_progress')
      const plannedItems = chapter.items.filter(item => item.status === 'planned')
      let content = ''

      if (completedItems.length > 0) {
        content += `**已上线**\n`
        completedItems.forEach(item => {
          content += `- ${item.statusText || ''}${item.title}\n`
        })
        content += `\n`
      }

      if (inProgressItems.length > 0) {
        content += `**开发中**\n`
        inProgressItems.forEach(item => {
          content += `- ${item.statusText || ''}${item.title}\n`
        })
        content += `\n`
      }

      if (plannedItems.length > 0) {
        content += `**计划中**\n`
        plannedItems.forEach(item => {
          content += `- ${item.statusText || ''}${item.title}\n`
        })
        content += `\n`
      }

      return content.trim()
    }
    return chapterContents[currentChapterId.value] || ''
  },
  set: (value: string) => {
    chapterContents[currentChapterId.value] = value
  }
})

// Markdown 渲染结果
const renderedContent = computed(() => {
  const content = currentChapterContent.value
  if (!content) return ''
  return marked(content)
})

// ========== 生命周期 ==========
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // 如果 Store 中有数据，同步到本地 chapters
  if (reportStore.isGenerated && reportStore.chapters.length > 0) {
    chapters.value = reportStore.chapters
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// ========== 方法 ==========
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const handleBack = () => {
  router.push('/')
}

const handleExport = async () => {
  isExporting.value = true

  try {
    const report: WeeklyReport = {
      id: `report-${Date.now()}`,
      weekRange: reportStore.weekRange || '',
      generatedAt: Date.now(),
      chapters: reportStore.chapters
    }

    const fileName = exportFileName.value

    if (exportFormat.value === 'markdown') {
      await exportMarkdown(report, fileName)
    }

    showExportPanel.value = false
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}

const generateExportContent = (): string => {
  let content = `# 产品周报\n\n`
  content += `**周期**: ${reportStore.weekRange || new Date().toLocaleDateString('zh-CN')}\n`
  content += `**生成时间**: ${new Date().toLocaleString('zh-CN')}\n\n`
  content += `---\n\n`

  for (const chapter of reportStore.chapters) {
    content += `## ${chapter.title}\n\n`

    if (chapter.items && chapter.items.length > 0) {
      // 按状态分组
      const completedItems = chapter.items.filter(item => item.status === 'completed')
      const inProgressItems = chapter.items.filter(item => item.status === 'in_progress')
      const plannedItems = chapter.items.filter(item => item.status === 'planned')

      if (completedItems.length > 0) {
        content += `**已上线**\n`
        completedItems.forEach(item => {
          content += `- ${item.statusText || ''}${item.title}\n`
        })
        content += `\n`
      }

      if (inProgressItems.length > 0) {
        content += `**开发中**\n`
        inProgressItems.forEach(item => {
          content += `- ${item.statusText || ''}${item.title}\n`
        })
        content += `\n`
      }

      if (plannedItems.length > 0) {
        content += `**计划中**\n`
        plannedItems.forEach(item => {
          content += `- ${item.statusText || ''}${item.title}\n`
        })
        content += `\n`
      }
    } else {
      content += `暂无内容\n`
    }

    content += `\n`
  }

  content += `\n---\n\n*本报告由 H5 周报系统自动生成*`

  return content
}

const downloadFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.editor-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9fafb;
}

/* 顶部导航栏 */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-button {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.back-button:hover {
  background: #e5e7eb;
}

.page-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.mode-switch {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.export-button {
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.export-button:hover {
  background: #059669;
}

.export-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 主体内容 */
.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  padding: 20px;
  border-right: 1px solid #e5e7eb;
  background: white;
  overflow-y: auto;
}

.editor-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.editor-with-preview {
  display: flex;
  height: 100%;
  gap: 20px;
}

.editor-pane {
  flex: 1;
  min-width: 0;
}

.preview-pane {
  flex: 1;
  min-width: 0;
  border-left: 1px solid #e5e7eb;
  padding-left: 20px;
  overflow-y: auto;
}

.preview-header {
  font-weight: 600;
  margin-bottom: 10px;
  color: #374151;
}

.preview-content {
  font-size: 14px;
  line-height: 1.6;
}

/* 导出面板 */
.export-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.export-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  min-width: 400px;
  max-width: 500px;
}

.export-title {
  font-size: 1.5rem;
  color: #111827;
  margin: 0 0 25px;
}

.export-form {
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-select,
.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

.form-select:focus,
.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.export-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.action-button {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.action-button.primary {
  background: #667eea;
  color: white;
}

.action-button.primary:hover {
  background: #5568d3;
}

.action-button.secondary {
  background: #e5e7eb;
  color: #374151;
}

.action-button.secondary:hover {
  background: #d1d5db;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .editor-header {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 15px;
  }

  .header-left {
    width: auto;
    justify-content: flex-start;
  }

  .header-center,
  .header-right {
    width: 100%;
    justify-content: center;
  }

  /* 汉堡按钮 */
  .hamburger-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    background: transparent;
    font-size: 24px;
    cursor: pointer;
    border-radius: 4px;
    margin-right: 8px;
  }

  .hamburger-button:hover {
    background: #f3f4f6;
  }

  .back-button {
    width: 44px;
    height: 44px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .editor-body {
    flex-direction: column;
  }

  /* 隐藏原有侧边栏（小屏用抽屉） */
  .chapter-nav-sidebar {
    display: none;
  }

  .editor-main {
    padding: 15px;
  }

  .export-panel {
    min-width: auto;
    width: 90%;
    max-width: none;
    padding: 20px;
  }
}
</style>
