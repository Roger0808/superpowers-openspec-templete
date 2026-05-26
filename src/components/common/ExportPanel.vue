<template>
  <div v-if="modelValue" class="export-overlay" @click="handleOverlayClick">
    <div class="export-panel" @click.stop>
      <div class="export-header">
        <h2 class="export-title">📥 导出周报</h2>
        <button class="close-button" @click="close">✕</button>
      </div>
      
      <div class="export-body">
        <!-- 导出格式选择 -->
        <div class="form-group">
          <label class="form-label">导出格式</label>
          <div class="format-options">
            <button
              type="button"
              class="format-option active"
              disabled
            >
              <div class="format-icon">📝</div>
              <div class="format-name">Markdown</div>
              <div class="format-desc">.md 文件</div>
            </button>
          </div>
        </div>
        
        <!-- 文件名输入 -->
        <div class="form-group">
          <label class="form-label">文件名</label>
          <input
            v-model="fileName"
            type="text"
            class="form-input"
            placeholder="周报_YYYY-MM-DD"
          />
        </div>
        
        <!-- 导出选项 -->
        <div class="form-group">
          <label class="form-label">导出选项</label>
          <div class="export-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="includeTimestamp" />
              <span>包含时间戳</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="includeMetadata" checked />
              <span>包含元数据</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="export-footer">
        <button class="action-button secondary" @click="close" :disabled="isExporting">
          取消
        </button>
        <button class="action-button primary" @click="handleExport" :disabled="isExporting">
          {{ isExporting ? '导出中...' : '导出' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// ========== Props ==========
const props = defineProps<{
  /** 是否显示导出面板 */
  modelValue: boolean
  /** 默认文件名 */
  defaultFileName?: string
  /** 是否正在导出 */
  isExporting?: boolean
}>()

// ========== Emits ==========
const emit = defineEmits<{
  /** 面板开关事件 */
  (e: 'update:modelValue', value: boolean): void
  /** 导出事件 */
  (e: 'export', format: 'markdown', fileName: string, options: ExportOptions): void
  /** 取消事件 */
  (e: 'cancel'): void
}>()

// ========== 类型 ==========
interface ExportOptions {
  includeTimestamp: boolean
  includeMetadata: boolean
}

// ========== 状态 ==========
const format = ref<'markdown'>('markdown')
const fileName = ref(props.defaultFileName || `周报_${new Date().toISOString().split('T')[0]}`)
const includeTimestamp = ref(false)
const includeMetadata = ref(true)

// ========== 监听 ==========
watch(() => props.defaultFileName, (newValue) => {
  if (newValue) {
    fileName.value = newValue
  }
})

// ========== 方法 ==========
const close = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleOverlayClick = () => {
  close()
}

const handleExport = () => {
  const options: ExportOptions = {
    includeTimestamp: includeTimestamp.value,
    includeMetadata: includeMetadata.value
  }
  
  emit('export', format.value, fileName.value, options)
}
</script>

<style scoped>
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
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.export-panel {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.export-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.export-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  color: #6b7280;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #111827;
}

.export-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.format-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.format-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.format-option:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.format-option.active {
  border-color: #667eea;
  background: #f0f4ff;
}

.format-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.format-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.format-desc {
  color: #6b7280;
  font-size: 0.85rem;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #374151;
  font-size: 0.95rem;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.export-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
}

.action-button {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
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

.action-button.secondary:hover:not(:disabled) {
  background: #d1d5db;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .export-panel {
    width: 95%;
    max-height: 85vh;
  }

  .format-options {
    grid-template-columns: 1fr;
  }

  .format-option {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
  }

  .format-icon {
    margin-bottom: 0;
  }

  .export-footer {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
  }
}

/* H5 适配 - 触控优化 */
@media (max-width: 480px) {
  .export-panel {
    width: 100%;
    max-width: none;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .export-header {
    padding: 16px;
  }

  .export-body {
    padding: 16px;
  }

  .close-button {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  /* iOS 输入框 - 防止缩放 */
  .form-input {
    font-size: 16px;
  }

  .export-footer {
    padding: 16px;
    border-radius: 0;
  }
}
</style>
