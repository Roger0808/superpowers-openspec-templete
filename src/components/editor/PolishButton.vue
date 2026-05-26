<template>
  <button
    class="polish-button"
    :class="{ loading: loading }"
    :disabled="disabled || loading"
    @click="handleClick"
    title="AI 润色内容"
  >
    <span v-if="loading" class="spinner"></span>
    <span v-else class="icon">✨</span>
    <span class="text">{{ loading ? '润色中...' : '润色' }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  /** 是否加载中 */
  loading?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

interface Emits {
  /** 点击润色 */
  'polish': [content: string]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false
})

const emit = defineEmits<Emits>()

function handleClick() {
  if (!props.loading && !props.disabled) {
    emit('polish', '')
  }
}
</script>

<style scoped>
.polish-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.polish-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.polish-button:active:not(:disabled) {
  transform: translateY(0);
}

.polish-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.polish-button.loading {
  background: #9ca3af;
}

.icon {
  font-size: 1rem;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
