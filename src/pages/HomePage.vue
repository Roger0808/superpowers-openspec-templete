<template>
  <div class="home-page">
    <div class="container">
      <!-- 标题区 -->
      <header class="header">
        <h1 class="title">🦞 H5 周报生成器 <span class="version">v{{ version }}</span></h1>
        <p class="subtitle">基于 Excel 解析的智能周报工具 - 拖拽上传，自动生成</p>
      </header>

      <!-- 4 步流程指示器 -->
      <div class="steps">
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="step-number">1</div>
          <div class="step-title">上传 Excel 文件</div>
        </div>
        <div class="step-connector"></div>
        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <div class="step-number">2</div>
          <div class="step-title">数据预览</div>
        </div>
        <div class="step-connector"></div>
        <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
          <div class="step-number">3</div>
          <div class="step-title">选择模板</div>
        </div>
        <div class="step-connector"></div>
        <div class="step" :class="{ active: currentStep >= 4, completed: currentStep > 4 }">
          <div class="step-number">4</div>
          <div class="step-title">生成周报</div>
        </div>
      </div>

      <!-- 步骤 1：上传 Excel -->
      <section v-if="currentStep === 1" class="step-content">
        <div class="upload-section">
          <div class="upload-area" :class="{ dragover: isDragover }" @dragover.prevent="handleDragover" @dragleave.prevent="handleDragleave" @drop.prevent="handleDrop">
            <input ref="fileInputRef" type="file" class="file-input" accept=".xlsx,.xls,.csv" @change="handleFileSelect" />
            <div class="upload-content">
              <div class="upload-icon">📤</div>
              <p class="upload-text">点击或拖拽文件到此处上传</p>
              <p class="upload-hint">支持 .xlsx, .xls, .csv 格式</p>
              <p class="upload-hint">文件大小 < 10MB</p>
              <button class="upload-button" @click.stop="triggerFileInput">📁 选择文件</button>
            </div>
          </div>

          <!-- 上传状态 -->
          <div v-if="uploadStatus === 'uploading'" class="upload-status">
            <div class="loading-spinner"></div>
            <p>上传中...</p>
          </div>

          <div v-if="uploadStatus === 'parsing'" class="upload-status">
            <div class="loading-spinner"></div>
            <p>AI 解析中...</p>
            <ParseProgressBar
              :progress="parseProgress"
              :text="`正在解析第 ${Math.round(parseProgress)}%`"
            />
          </div>

          <div v-if="uploadStatus === 'error'" class="upload-status error">
            <div class="error-icon">❌</div>
            <p>{{ uploadError }}</p>
            <button class="retry-button" @click="resetUpload">重新上传</button>
          </div>
        </div>
      </section>

      <!-- 步骤 2：数据预览 -->
      <section v-if="currentStep === 2" class="step-content">
        <div class="preview-section">
          <h2 class="section-title">📊 数据预览</h2>
          <p class="section-hint">点击"开始归类"将使用 AI 进行过滤和分类</p>

          <div class="preview-actions top-actions">
            <button class="action-button secondary" @click="currentStep = 1">⬅️ 返回</button>
            <button class="action-button primary" @click="handlePreviewConfirm" :disabled="!parsedData?.rows?.length">
              开始归类 ➡️
            </button>
          </div>

          <!-- 产品组列表 -->
          <div v-if="parsedData?.rows" class="product-groups">
            <div v-for="(row, index) in parsedData.rows" :key="index" class="product-group-card">
              <div class="group-header">
                <h3 class="group-title">{{ row.productGroup }}</h3>
                <span class="group-time">{{ row.time }}</span>
              </div>
              <div class="group-content">
                <pre class="content-preview">{{ row.content }}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 步骤 3：选择模板 -->
      <section v-if="currentStep === 3" class="step-content">
        <div class="template-section">
          <h2 class="section-title">📋 选择模板</h2>
          <p class="section-hint">请选择周报模板或使用默认模板</p>
          
          <!-- 默认模板 -->
          <div class="template-card default" @click="selectTemplate('default')">
            <div class="template-icon">📄</div>
            <h3 class="template-title">默认模板</h3>
            <p class="template-desc">包含 7 个标准章节</p>
            <ul class="template-chapters">
              <li>来福商城与卡册</li>
              <li>三方对接项目</li>
              <li>采购与集采管理</li>
              <li>三方供应链</li>
              <li>销售与财务管理</li>
              <li>竞价平台与异常单</li>
              <li>履约监控与物流一体化</li>
            </ul>
            <button class="select-button" :class="{ selected: selectedTemplate === 'default' }">
              {{ selectedTemplate === 'default' ? '✅ 已选择' : '选择此模板' }}
            </button>
          </div>
          
          <div class="template-actions">
            <button class="action-button secondary" @click="currentStep = 2">⬅️ 返回</button>
            <button class="action-button primary" @click="generateReport" :disabled="!selectedTemplate">生成周报 ✨</button>
          </div>
        </div>
      </section>

      <!-- 步骤 4：生成周报 -->
      <section v-if="currentStep === 4" class="step-content">
        <div class="generate-section">
          <div class="loading-container">
            <div class="loading-spinner large"></div>
            <h2 class="generate-title">正在生成周报...</h2>
            <p class="generate-hint">请稍候，马上就好</p>
          </div>
        </div>
      </section>



      <!-- 页脚 -->
      <footer class="footer">
        <p>© 2026 周报系统 · Powered by Vue 3 + MiniMax Skills</p>
      </footer>

      <!-- 归类编辑弹窗 -->
      <ClassificationEditor
        v-if="editingItemForEditor"
        v-model="showEditDialog"
        :item="editingItemForEditor"
        :product-groups="PRODUCT_GROUP_ORDER"
        :statuses="STATUS_ORDER"
        :tags="ALL_TAGS"
        @save="handleClassificationSave"
        @cancel="showEditDialog = false"
      />
    </div>

    <!-- Loading 蒙版（放在 container 外面，覆盖整个页面） -->
    <div v-if="classificationLoading" class="classification-loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner large"></div>
        <p class="loading-text">🤔 AI 进度条...</p>
        <p class="loading-progress">
          {{ classificationProgress > 0 ? `正在处理: ${classificationCurrentGroup}` : '准备中...' }}
        </p>
        <p v-if="classificationTotal > 0" class="loading-count">
          {{ classificationProgress }} / {{ classificationTotal }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ParsedExcelData } from '../types/excel'
import type { LLMStatus, LLMParseResult } from '../types/llm'
import type { ChapterContent, ReportItem } from '../types/report'
import type { ClassificationItem, ClassificationResult } from '../types/classification'
import { ProductGroup, ClassificationStatus, StatusTag } from '../types/classification'
import { useExcelParser } from '../composables/useExcelParser'
import { useLLMParser } from '../composables/useLLMParser'
import { useReportStore } from '../composables/useReportStore'
import { useClassificationStore } from '../composables/useClassificationStore'
import LLMStatusBadge from '../components/common/LLMStatusBadge.vue'
import ParseProgressBar from '../components/common/ParseProgressBar.vue'
import ClassificationPreview from '../components/classification/ClassificationPreview.vue'
import ClassificationEditor from '../components/classification/ClassificationEditor.vue'
import { MINIMAX_CONFIG } from '../config'
import { VERSION } from '../version'

const router = useRouter()

// ========== 版本号 ==========
const version = VERSION

// ========== Excel 解析 ==========
const { parseExcel } = useExcelParser()
const { parseContent, initService, llmStatus, parseProgress } = useLLMParser()

// ========== 状态 ==========
const currentStep = ref(1)
const selectedTemplate = ref<string>('')
const parsedData = ref<ParsedExcelData | null>(null)
const uploadStatus = ref<'idle' | 'uploading' | 'parsing' | 'success' | 'error'>('idle')
const uploadError = ref<string>('')
const isDragover = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// LLM 状态
const isLLMReady = ref(false)

// ========== 归类状态 ==========
const classificationStore = useClassificationStore()
const classificationLoading = ref(false)
const classificationProgress = ref(0)
const classificationTotal = ref(0)
const classificationCurrentGroup = ref('')
const classificationResult = ref<ClassificationResult | null>(null)
const showEditDialog = ref(false)

// 归类常量
const PRODUCT_GROUP_ORDER: ProductGroup[] = [
  '来福商城与卡册',
  '三方对接项目',
  '采购与集采管理',
  '三方供应链',
  '销售与财务管理',
  '竞价平台与异常单',
  '履约监控与物流一体化',
]

const STATUS_ORDER: ClassificationStatus[] = ['已上线', '开发中']

const ALL_TAGS: StatusTag[] = [
  '[完结]', '[变更]', '[无变更]', '[技术]',
  '[采购]', '[集采]', '[财务]', '[销售]', '[售后]'
]

// 编辑项（处理只读类型的转换）
const editingItemForEditor = computed(() => {
  const item = classificationStore.state.editingItem
  if (!item) return null
  return {
    ...item,
    tags: [...item.tags]
  } as ClassificationItem
})

// ========== LLM 初始化 ==========
const initLLM = () => {
  if (MINIMAX_CONFIG.apiKey) {
    isLLMReady.value = initService(MINIMAX_CONFIG.apiKey, '')
  } else {
    isLLMReady.value = false
  }
}

const { setReportData } = useReportStore()

// 初始化时尝试连接 LLM
initLLM()

// ========== 上传处理 ==========
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    await uploadFile(files[0])
  }
  // 重置 input 值，允许重复选择同一文件
  target.value = ''
}

const handleDragover = () => {
  isDragover.value = true
}

const handleDragleave = () => {
  isDragover.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragover.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    uploadFile(files[0])
  }
}

const uploadFile = async (file: File) => {
  uploadStatus.value = 'uploading'
  uploadError.value = ''

  try {
    // 验证文件格式
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      throw new Error('不支持的文件格式，请上传 .xlsx 文件')
    }

    // 验证文件大小
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('文件大小不能超过 10MB')
    }

    uploadStatus.value = 'parsing'

    // 使用 useExcelParser 解析 Excel
    parsedData.value = await parseExcel(file)

    // LLM 过滤和分类在"确认并继续"时统一处理
    // 此处只解析 Excel，不调用 LLM

    uploadStatus.value = 'success'
    currentStep.value = 2
  } catch (error) {
    uploadStatus.value = 'error'
    uploadError.value = error instanceof Error ? error.message : '解析失败'
  }
}

const resetUpload = () => {
  uploadStatus.value = 'idle'
  uploadError.value = ''
  parsedData.value = null
  classificationResult.value = null
  currentStep.value = 1
}

// ========== 归类处理 ==========
const handlePreviewConfirm = async () => {
  if (!parsedData.value?.rows.length) return

  console.log(`[归类] LLM 模式，使用模型: ${MINIMAX_CONFIG.modelId}`)
  console.log(`[归类] API Key 存在: ${!!MINIMAX_CONFIG.apiKey}`)

  classificationLoading.value = true
  classificationProgress.value = 0
  classificationTotal.value = parsedData.value.rows.length
  classificationCurrentGroup.value = ''
  try {
    // 初始化归类服务（使用相同的 LLM 配置）
    if (MINIMAX_CONFIG.apiKey) {
      classificationStore.initService(MINIMAX_CONFIG.apiKey, '', 180000)
      console.log('[归类] LLM 服务初始化成功')
    } else {
      console.warn('[归类] 未配置 API Key，无法使用 LLM 归类')
    }

    // 设置原始数据
    classificationStore.setRawData(parsedData.value.rows)

    // 执行归类（LLM 会同时完成过滤和分类）
    console.log('[归类] 开始调用 LLM 归类...')
    const result = await classificationStore.classifyRows(
      parsedData.value.rows,
      (current, total, groupName) => {
        classificationProgress.value = current
        classificationTotal.value = total
        classificationCurrentGroup.value = groupName
      }
    )
    console.log(`[归类] LLM 归类完成，共 ${result.items.length} 条结果`)
    classificationResult.value = result

    // 跳转到模板选择步骤
    currentStep.value = 3
  } catch (error) {
    console.error('归类失败:', error)
    // 归类失败时也允许继续
    classificationResult.value = null
    currentStep.value = 4
  } finally {
    classificationLoading.value = false
  }
}

const handleClassificationConfirm = () => {
  // 用户确认归类结果，跳转到模板选择
  currentStep.value = 4
}

const handleClassificationEdit = (item: ClassificationItem) => {
  classificationStore.setEditingItem(item)
  showEditDialog.value = true
}

const handleClassificationSave = (updatedItem: ClassificationItem) => {
  classificationStore.updateItem(updatedItem.id, updatedItem)
  // 更新本地引用以触发响应式更新
  if (classificationResult.value) {
    const index = classificationResult.value.items.findIndex(i => i.id === updatedItem.id)
    if (index !== -1) {
      classificationResult.value.items[index] = updatedItem
    }
  }
  showEditDialog.value = false
}

// ========== 模板选择 ==========
const selectTemplate = (templateId: string) => {
  selectedTemplate.value = templateId
}

// ========== 生成周报 ==========
const generateReport = async () => {
  if (!parsedData.value) return

  currentStep.value = 4

  try {
    let chapters: ChapterContent[]
    let weekRange = ''

    // 如果有归类结果，使用归类结果构建章节
    if (!classificationStore.state.result?.items?.length) {
      uploadStatus.value = 'error'
      uploadError.value = '归类结果为空，请重新归类'
      currentStep.value = 2  // 跳回数据预览
      return
    }
    const items = classificationStore.state.result.items as ClassificationItem[]
    chapters = buildChaptersFromClassification([...items])
    weekRange = classificationStore.state.result.rawData.length > 0
      ? classificationStore.state.result.rawData[0].time : ''

    // 保存到 Store
    setReportData(chapters, weekRange)

    // 模拟生成延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 跳转到编辑页
    router.push('/editor')
  } catch (error) {
    uploadStatus.value = 'error'
    uploadError.value = '生成周报失败，请重试'
    currentStep.value = 4
  }
}

/**
 * 根据归类结果构建 7 个章节内容
 * 用于 LLM 归类模式
 */
function buildChaptersFromClassification(items: ClassificationItem[]): ChapterContent[] {
  // 初始化 7 个章节
  const chapterMap: Record<string, ChapterContent> = {
    'chapter-1': { chapterId: 'chapter-1', title: '来福商城与卡册', items: [] },
    'chapter-2': { chapterId: 'chapter-2', title: '三方对接项目', items: [] },
    'chapter-3': { chapterId: 'chapter-3', title: '采购与集采管理', items: [] },
    'chapter-4': { chapterId: 'chapter-4', title: '三方供应链', items: [] },
    'chapter-5': { chapterId: 'chapter-5', title: '销售与财务管理', items: [] },
    'chapter-6': { chapterId: 'chapter-6', title: '竞价平台与异常单', items: [] },
    'chapter-7': { chapterId: 'chapter-7', title: '履约监控与物流一体化', items: [] }
  }

  // 遍历归类结果，映射到对应章节
  items.forEach((item, index) => {
    const chapterId = item.chapterId || 'chapter-1'
    if (chapterMap[chapterId]) {
      const reportItem: ReportItem = {
        id: item.id,
        chapterId: chapterId as any,
        title: item.keyInfo || item.rawContent.substring(0, 50),
        status: item.status === '已上线' ? 'completed' : item.status === '开发中' ? 'in_progress' : 'planned',
        statusText: item.tags.join(''),
        deadline: item.source?.time || '',
        assignee: '',
        sourceContent: item.keyInfo || item.rawContent,
        sourceProductGroup: item.source?.productGroup || item.productGroup,
        order: index
      }
      chapterMap[chapterId].items.push(reportItem)
    }
  })

  // 返回章节数组
  return Object.values(chapterMap)
}

</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 标题区 */
.header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.version {
  font-size: 1rem;
  font-weight: normal;
  opacity: 0.7;
  margin-left: 12px;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* 步骤指示器 */
.steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #667eea;
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-title {
  font-size: 0.9rem;
  color: #6b7280;
  text-align: center;
}

.step.active .step-title {
  color: #667eea;
  font-weight: 600;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin: 0 10px;
}

/* 步骤内容区 */
.step-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.upload-area.dragover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-area:hover {
  border-color: #667eea;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.upload-text {
  font-size: 1.2rem;
  color: #374151;
  margin-bottom: 10px;
}

.upload-hint {
  color: #6b7280;
  margin-bottom: 5px;
}

.upload-button {
  margin-top: 20px;
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-button:hover {
  background: #5568d3;
}

/* 上传状态 */
.upload-status {
  text-align: center;
  padding: 20px;
}

.upload-status.error {
  color: #dc2626;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.retry-button {
  margin-top: 15px;
  padding: 10px 20px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* 加载动画 */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

.loading-spinner.large {
  width: 60px;
  height: 60px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 预览区域 */
.section-title {
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 10px;
}

.section-hint {
  color: #6b7280;
  margin-bottom: 30px;
}

.product-groups {
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
}

.product-group-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.group-title {
  font-size: 1.2rem;
  color: #111827;
}

.group-time {
  color: #6b7280;
  font-size: 0.9rem;
}

.parse-status-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
}

.parse-status-badge.success {
  background: #d1fae5;
  color: #065f46;
}

.parse-status-badge.filtered {
  background: #fee2e2;
  color: #991b1b;
}

.filter-reason {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 8px;
  font-style: italic;
}

.text-success {
  color: #10b981;
  font-weight: 600;
}

.text-filtered {
  color: #ef4444;
  font-weight: 600;
}

.content-preview {
  background: #f9fafb;
  padding: 15px;
  border-radius: 6px;
  font-size: 0.9rem;
  white-space: pre-wrap;
  color: #374151;
}

.preview-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.preview-actions.top-actions {
  margin-bottom: 25px;
  position: sticky;
  top: 0;
  background: white;
  padding: 10px 0;
  z-index: 10;
}

/* 模板选择 */
.template-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s;
  max-width: 400px;
  margin: 0 auto 30px;
}

.template-card.default {
  border-color: #667eea;
  background: #f0f4ff;
}

.template-card:hover {
  border-color: #667eea;
}

.template-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.template-title {
  font-size: 1.3rem;
  color: #111827;
  margin-bottom: 10px;
}

.template-desc {
  color: #6b7280;
  margin-bottom: 15px;
}

.template-chapters {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.template-chapters li {
  padding: 5px 0;
  color: #374151;
  font-size: 0.9rem;
}

.select-button {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.select-button.selected {
  background: #10b981;
}

.template-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

/* 通用按钮 */
.action-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.action-button.primary {
  background: #667eea;
  color: white;
}

.action-button.primary:hover:not(:disabled) {
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

/* 归类预览步骤 */
.classification-step {
  max-width: 100%;
}

.classification-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.classification-loading-overlay .loading-content {
  background: #fff;
  padding: 40px 60px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.classification-loading-overlay .loading-spinner {
  margin: 0 auto 20px;
}

.classification-loading-overlay .loading-text {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.classification-loading-overlay .loading-progress {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.classification-loading-overlay .loading-count {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

.no-classification {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

/* 生成区域 */
.generate-section {
  text-align: center;
  padding: 60px 20px;
}

.generate-title {
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 10px;
}

.generate-hint {
  color: #6b7280;
}



/* 页脚 */
.footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title {
    font-size: 1.8rem;
  }

  .steps {
    flex-direction: column;
    gap: 15px;
  }

  .step-connector {
    width: 2px;
    height: 20px;
    margin: 10px 0;
  }

  .step-content {
    padding: 20px;
  }

  /* H5 适配 - 上传区域 */
  .upload-area {
    padding: 48px 24px;
    border-width: 2px;
  }

  .upload-icon {
    font-size: 48px;
  }

  .upload-text {
    font-size: 16px;
  }

  /* H5 适配 - 按钮触控区域 */
  .action-button,
  .action-button.primary,
  .action-button.secondary {
    height: 44px;
    padding: 12px 24px;
    font-size: 16px;
  }

  .upload-button {
    height: 44px;
    padding: 12px 24px;
    font-size: 16px;
  }

  .select-button {
    height: 44px;
    font-size: 16px;
  }

  /* H5 适配 - 日期选择器 */
  .preview-actions {
    flex-direction: column;
    gap: 12px;
  }

  .preview-actions .action-button {
    width: 100%;
  }

  .template-actions {
    flex-direction: column;
    gap: 12px;
  }

  .template-actions .action-button {
    width: 100%;
  }


}
</style>
