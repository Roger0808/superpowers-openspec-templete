<script setup lang="ts">
/**
 * 归类项卡片组件
 * 规范: openspec/changes/archive/2026-04-07-content-classification/specs/content-classification/spec.md
 */
import { ref, computed } from 'vue'
import type { ClassificationItem } from '@/types/classification'
import { PRODUCT_GROUP_COLORS, STATUS_COLORS } from '@/types/classification'

export interface Props {
  item: ClassificationItem
  editable?: boolean
  selected?: boolean
}

interface Emits {
  (e: 'edit'): void
  (e: 'select'): void
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  selected: false
})

const emit = defineEmits<Emits>()

const isExpanded = ref(false)

const productGroupColor = computed(() => {
  return PRODUCT_GROUP_COLORS[props.item.productGroup] || '#999'
})

const statusColor = computed(() => {
  return STATUS_COLORS[props.item.status] || '#999'
})

const confidencePercent = computed(() => {
  return Math.round(props.item.confidence * 100)
})

const tagsText = computed(() => {
  return props.item.tags.join('、')
})
</script>

<template>
  <div
    class="classification-item-card"
    :class="{ selected, confirmed: item.confirmed }"
    @click="emit('select')"
  >
    <!-- Header -->
    <div class="card-header">
      <el-tag :color="productGroupColor" size="small">
        {{ item.productGroup }}
      </el-tag>
      <el-tag :color="statusColor" size="small" effect="dark">
        {{ item.status }}
      </el-tag>
      <div class="confidence-bar">
        <div class="confidence-fill" :style="{ width: `${confidencePercent}%` }"></div>
        <span class="confidence-text">{{ confidencePercent }}%</span>
      </div>
    </div>

    <!-- Content -->
    <div class="card-content" :class="{ expanded: isExpanded }">
      <div class="raw-content" @click.stop="isExpanded = !isExpanded">
        <!-- 优先显示 AI 提取的关键信息，展开后显示原始内容 -->
        <span v-if="!isExpanded || !item.keyInfo" class="content-text">
          {{ item.keyInfo || item.rawContent }}
        </span>
        <span v-if="isExpanded && item.keyInfo && item.rawContent !== item.keyInfo" class="content-text raw">
          原文：{{ item.rawContent }}
        </span>
        <span v-if="!isExpanded && (item.keyInfo?.length || 0) > 60" class="expand-hint">
          展开
        </span>
      </div>

      <!-- Tags -->
      <div v-if="tagsText" class="tags-row">
        <el-tag size="small" type="info">{{ tagsText }}</el-tag>
      </div>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <span v-if="item.confirmed" class="confirmed-badge">
        <el-icon><Check /></el-icon>
        已确认
      </span>
      <span v-else class="pending-badge">待确认</span>

      <el-button
        v-if="editable"
        type="primary"
        size="small"
        text
        @click.stop="emit('edit')"
      >
        编辑
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Check } from '@element-plus/icons-vue'
export default {
  components: { Check }
}
</script>

<style scoped>
.classification-item-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.classification-item-card:hover {
  border-color: #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.classification-item-card.selected {
  border-color: #409eff;
  background: #f0f7ff;
}

.classification-item-card.confirmed {
  background: #f6fff0;
  border-color: #b3e19d;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.confidence-bar {
  flex: 1;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  position: relative;
  margin-left: auto;
  max-width: 80px;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #67c23a, #409eff);
  border-radius: 2px;
  transition: width 0.3s;
}

.confidence-text {
  position: absolute;
  right: -28px;
  top: -4px;
  font-size: 10px;
  color: #999;
}

.card-content {
  font-size: 14px;
  line-height: 1.6;
}

.raw-content {
  color: #333;
  cursor: pointer;
}

.content-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.expanded .content-text {
  display: block;
  -webkit-line-clamp: unset;
}

/* 原文始终截断，不随展开而全量显示 */
.expanded .content-text.raw {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #999;
  font-size: 12px;
}

.expand-hint {
  color: #409eff;
  font-size: 12px;
  margin-left: 8px;
}

.tags-row {
  margin-top: 8px;
}

.key-info {
  margin-top: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.key-info-label {
  color: #666;
}

.key-info-value {
  color: #333;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.confirmed-badge,
.pending-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.confirmed-badge {
  color: #67c23a;
}

.pending-badge {
  color: #e6a23c;
}
</style>
