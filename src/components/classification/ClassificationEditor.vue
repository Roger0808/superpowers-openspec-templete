<script setup lang="ts">
/**
 * 归类编辑组件
 * 规范: openspec/changes/archive/2026-04-07-content-classification/specs/content-classification/spec.md
 */
import { ref, watch, computed } from 'vue'
import type {
  ClassificationItem,
  ProductGroup,
  ClassificationStatus,
  StatusTag
} from '@/types/classification'
import {
  PRODUCT_GROUP_COLORS,
  STATUS_COLORS
} from '@/types/classification'

interface Props {
  modelValue: boolean
  item: ClassificationItem
  productGroups: readonly ProductGroup[]
  statuses: readonly ClassificationStatus[]
  tags: readonly StatusTag[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', item: ClassificationItem): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Form state
const form = ref({
  productGroup: props.item.productGroup,
  status: props.item.status,
  tags: [...props.item.tags],
  keyInfo: props.item.keyInfo || ''
})

// Watch for item changes
watch(() => props.item, (newItem) => {
  form.value = {
    productGroup: newItem.productGroup,
    status: newItem.status,
    tags: [...newItem.tags],
    keyInfo: newItem.keyInfo || ''
  }
}, { immediate: true })

function handleSave() {
  const updatedItem: ClassificationItem = {
    ...props.item,
    productGroup: form.value.productGroup,
    status: form.value.status,
    tags: form.value.tags,
    keyInfo: form.value.keyInfo || undefined
  }
  emit('save', updatedItem)
}

function handleCancel() {
  dialogVisible.value = false
}

function handleTagChange(tag: StatusTag, checked: boolean) {
  if (checked) {
    if (!form.value.tags.includes(tag)) {
      form.value.tags.push(tag)
    }
  } else {
    form.value.tags = form.value.tags.filter(t => t !== tag)
  }
}
</script>

<template>
  <el-dialog
    title="编辑归类"
    v-model="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
  >
    <!-- Original Content (Readonly) -->
    <div class="form-section">
      <label class="form-label">原始内容</label>
      <div class="original-content">{{ item.rawContent }}</div>
    </div>

    <!-- Product Group Select -->
    <div class="form-section">
      <label class="form-label">产品组</label>
      <el-select v-model="form.productGroup" class="full-width">
        <el-option
          v-for="pg in productGroups"
          :key="pg"
          :label="pg"
          :value="pg"
        >
          <span :style="{ color: PRODUCT_GROUP_COLORS[pg] }">{{ pg }}</span>
        </el-option>
      </el-select>
    </div>

    <!-- Status Select -->
    <div class="form-section">
      <label class="form-label">状态</label>
      <el-radio-group v-model="form.status">
        <el-radio
          v-for="status in statuses"
          :key="status"
          :label="status"
        >
          <span :style="{ color: STATUS_COLORS[status] }">{{ status }}</span>
        </el-radio>
      </el-radio-group>
    </div>

    <!-- Tags Checkbox Group -->
    <div class="form-section">
      <label class="form-label">状态标签</label>
      <el-checkbox-group v-model="form.tags">
        <el-checkbox
          v-for="tag in tags"
          :key="tag"
          :label="tag"
        >
          {{ tag }}
        </el-checkbox>
      </el-checkbox-group>
    </div>

    <!-- Key Info Input -->
    <div class="form-section">
      <label class="form-label">关键信息</label>
      <el-input
        v-model="form.keyInfo"
        placeholder="如：3.24已上线"
        clearable
      />
    </div>

    <!-- Footer -->
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-section {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.original-content {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  max-height: 120px;
  overflow-y: auto;
}

.full-width {
  width: 100%;
}

/* H5 适配 */
@media (max-width: 480px) {
  :deep(.el-dialog) {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    border-radius: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  :deep(.el-dialog__body) {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .form-section {
    margin-bottom: 20px;
  }

  .form-label {
    font-size: 14px;
    margin-bottom: 6px;
  }

  /* iOS 输入框 - 防止缩放 */
  :deep(.el-input__inner) {
    font-size: 16px;
  }

  /* 标签在移动端换行 */
  :deep(.el-checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
