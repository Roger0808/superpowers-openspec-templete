<template>
  <div class="llm-status-badge" :class="statusClass">
    <span class="status-dot"></span>
    <span class="status-text">{{ statusText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LLMStatus } from '../../types/llm'

interface Props {
  status: LLMStatus
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  status: 'disconnected'
})

const statusClass = computed(() => `status-${props.status}`)

const statusText = computed(() => {
  if (props.text) return props.text

  switch (props.status) {
    case 'connected':
      return 'AI 就绪'
    case 'disconnected':
      return 'AI 未连接'
    case 'error':
      return 'AI 错误'
    case 'parsing':
      return 'AI 解析中...'
    default:
      return 'AI 未知'
  }
})
</script>

<style scoped>
.llm-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  background: #f3f4f6;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-connected {
  background: #d1fae5;
  color: #065f46;
}

.status-connected .status-dot {
  background: #10b981;
}

.status-disconnected {
  background: #f3f4f6;
  color: #6b7280;
}

.status-disconnected .status-dot {
  background: #9ca3af;
}

.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.status-error .status-dot {
  background: #ef4444;
}

.status-parsing {
  background: #dbeafe;
  color: #1e40af;
}

.status-parsing .status-dot {
  background: #3b82f6;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
