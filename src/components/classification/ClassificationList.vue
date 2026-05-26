<script setup lang="ts">
/**
 * 归类列表组件
 * 规范: openspec/changes/archive/2026-04-07-content-classification/specs/content-classification/spec.md
 */
import { computed, ref } from 'vue'
import type { ClassificationItem, ProductGroup, ClassificationStatus } from '@/types/classification'
import ClassificationItemCard from './ClassificationItemCard.vue'

interface Props {
  items: ClassificationItem[]
  editable?: boolean
  sortBy?: 'productGroup' | 'status' | 'confidence'
  sortOrder?: 'asc' | 'desc'
}

interface Emits {
  (e: 'edit', item: ClassificationItem): void
  (e: 'select', item: ClassificationItem): void
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  sortBy: 'productGroup',
  sortOrder: 'asc'
})

const emit = defineEmits<Emits>()

const currentSortBy = ref(props.sortBy)
const currentSortOrder = ref(props.sortOrder)

const sortedItems = computed(() => {
  const items = [...props.items]

  items.sort((a, b) => {
    let comparison = 0

    switch (currentSortBy.value) {
      case 'productGroup':
        comparison = a.productGroup.localeCompare(b.productGroup)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'confidence':
        comparison = a.confidence - b.confidence
        break
    }

    return currentSortOrder.value === 'asc' ? comparison : -comparison
  })

  return items
})

function toggleSort(field: 'productGroup' | 'status' | 'confidence') {
  if (currentSortBy.value === field) {
    currentSortOrder.value = currentSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    currentSortBy.value = field
    currentSortOrder.value = 'asc'
  }
}
</script>

<template>
  <div class="classification-list">
    <!-- Sort Bar -->
    <div class="sort-bar">
      <span class="sort-label">排序：</span>
      <el-button
        :type="currentSortBy === 'productGroup' ? 'primary' : 'default'"
        size="small"
        @click="toggleSort('productGroup')"
      >
        产品组
        <span v-if="currentSortBy === 'productGroup'">
          {{ currentSortOrder === 'asc' ? '↑' : '↓' }}
        </span>
      </el-button>
      <el-button
        :type="currentSortBy === 'status' ? 'primary' : 'default'"
        size="small"
        @click="toggleSort('status')"
      >
        状态
        <span v-if="currentSortBy === 'status'">
          {{ currentSortOrder === 'asc' ? '↑' : '↓' }}
        </span>
      </el-button>
      <el-button
        :type="currentSortBy === 'confidence' ? 'primary' : 'default'"
        size="small"
        @click="toggleSort('confidence')"
      >
        置信度
        <span v-if="currentSortBy === 'confidence'">
          {{ currentSortOrder === 'asc' ? '↑' : '↓' }}
        </span>
      </el-button>
    </div>

    <!-- Item List -->
    <div class="item-list">
      <ClassificationItemCard
        v-for="item in sortedItems"
        :key="item.id"
        :item="item"
        :editable="editable"
        @edit="emit('edit', item)"
        @select="emit('select', item)"
      />
    </div>

    <!-- Empty State -->
    <el-empty v-if="items.length === 0" description="暂无归类结果" />
  </div>
</template>

<style scoped>
.classification-list {
  min-height: 200px;
}

.sort-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.sort-label {
  color: #666;
  font-size: 14px;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
