<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="visible" class="drawer-overlay" @click="handleOverlayClick">
        <div class="drawer-panel" :style="{ width: width }" @click.stop>
          <div class="drawer-header">
            <slot name="header">
              <span class="drawer-title">{{ title }}</span>
            </slot>
            <button class="drawer-close" @click="handleClose">✕</button>
          </div>
          <div class="drawer-content">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  title?: string
  width?: string
  overlayCloseable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '280px',
  overlayCloseable: true
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.overlayCloseable) {
    handleClose()
  }
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.drawer-panel {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
}

.drawer-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
}

.drawer-close:hover {
  background: #f5f5f5;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
}

/* 动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(-100%);
}

/* H5 适配 */
@media (max-width: 768px) {
  .drawer-panel {
    width: 85% !important;
    max-width: 320px;
  }

  .drawer-close {
    width: 44px;
    height: 44px;
  }
}
</style>
