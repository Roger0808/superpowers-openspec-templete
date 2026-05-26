<script setup lang="ts">
/**
 * 归类预览组件
 * 规范: openspec/changes/archive/2026-04-07-content-classification/specs/content-classification/spec.md
 */
import { computed } from 'vue'
import type { ClassificationResult, ClassificationItem } from '@/types/classification'
import ClassificationStats from './ClassificationStats.vue'
import ClassificationList from './ClassificationList.vue'

interface Props {
  result: ClassificationResult
  editable?: boolean
  showStats?: boolean
}

interface Emits {
  (e: 'confirm'): void
  (e: 'edit', item: ClassificationItem): void
  (e: 'back'): void
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  showStats: true
})

const emit = defineEmits<Emits>()

const stats = computed(() => props.result.stats)
</script>

<template>
  <div class="classification-preview">
    <!-- Header -->
    <div class="preview-header">
      <h2>归类结果预览</h2>
      <span class="file-name">{{ result.fileName || '未命名文件' }}</span>
    </div>

    <!-- Stats -->
    <ClassificationStats v-if="showStats" :stats="stats" />

    <!-- Filter Bar -->
    <div class="filter-bar">
      <span class="filter-label">共 {{ result.items.length }} 条</span>
      <span class="filter-separator">|</span>
      <span class="filter-label">已确认 {{ stats.confirmed }}</span>
      <span class="filter-separator">|</span>
      <span class="filter-label">待确认 {{ stats.pending }}</span>
    </div>

    <!-- Classification List -->
    <ClassificationList
      :items="result.items"
      :editable="editable"
      @edit="(item) => emit('edit', item)"
    />

    <!-- Footer -->
    <div class="preview-footer">
      <el-button @click="emit('back')">返回</el-button>
      <el-button type="primary" @click="emit('confirm')">确认归类结果</el-button>
    </div>
  </div>
</template>

<style scoped>
.classification-preview {
  padding: 16px;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.preview-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.file-name {
  color: #666;
  font-size: 14px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 16px;
}

.filter-label {
  color: #666;
  font-size: 14px;
}

.filter-separator {
  color: #ddd;
}

.preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

/* H5 适配 */
@media (max-width: 768px) {
  .classification-preview {
    padding: 12px;
  }

  /* 过滤栏横向滚动 */
  .filter-bar {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 8px;
  }

  .filter-label,
  .filter-separator {
    flex-shrink: 0;
    font-size: 12px;
  }

  /* 页脚按钮 */
  .preview-footer {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .preview-footer :deep(.el-button) {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }
}
</style>
