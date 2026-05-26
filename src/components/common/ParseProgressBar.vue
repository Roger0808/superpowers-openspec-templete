<template>
  <div class="parse-progress-bar">
    <div class="progress-info">
      <span class="progress-text">{{ text || defaultText }}</span>
      <span class="progress-percent">{{ progress }}%</span>
    </div>
    <div class="progress-track">
      <div
        class="progress-fill"
        :style="{ width: `${progress}%` }"
        :class="statusClass"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 当前进度 0-100 */
  progress: number
  /** 显示文字 */
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0
})

const defaultText = computed(() => {
  if (props.progress === 0) return '准备解析...'
  if (props.progress === 100) return '解析完成'
  return '正在解析...'
})

const statusClass = computed(() => {
  if (props.progress === 100) return 'status-success'
  if (props.progress > 50) return 'status-active'
  return 'status-normal'
})
</script>

<style scoped>
.parse-progress-bar {
  width: 100%;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.progress-text {
  color: #374151;
}

.progress-percent {
  color: #667eea;
  font-weight: 600;
}

.progress-track {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.status-normal {
  background: #667eea;
}

.status-active {
  background: #667eea;
}

.status-success {
  background: #10b981;
}
</style>
