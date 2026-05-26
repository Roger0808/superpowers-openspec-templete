<script setup lang="ts">
/**
 * 归类统计组件
 * 规范: openspec/changes/archive/2026-04-07-content-classification/specs/content-classification/spec.md
 */
import { computed } from 'vue'
import type { ClassificationStats } from '@/types/classification'
import { PRODUCT_GROUP_ORDER, STATUS_ORDER } from '@/types/classification'

interface Props {
  stats: ClassificationStats
  showChart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showChart: false
})

const productGroupData = computed(() => {
  return PRODUCT_GROUP_ORDER.map(pg => ({
    name: pg,
    value: props.stats.byProductGroup[pg] || 0,
    percent: props.stats.total > 0
      ? Math.round(((props.stats.byProductGroup[pg] || 0) / props.stats.total) * 100)
      : 0
  }))
})

const statusData = computed(() => {
  return STATUS_ORDER.map(status => ({
    name: status,
    value: props.stats.byStatus[status] || 0,
    percent: props.stats.total > 0
      ? Math.round(((props.stats.byStatus[status] || 0) / props.stats.total) * 100)
      : 0
  }))
})
</script>

<template>
  <div class="classification-stats">
    <!-- Summary Cards -->
    <div class="stats-cards">
      <div class="stat-card total">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">总计</div>
      </div>
      <div class="stat-card confirmed">
        <div class="stat-value">{{ stats.confirmed }}</div>
        <div class="stat-label">已确认</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-value">{{ stats.pending }}</div>
        <div class="stat-label">待确认</div>
      </div>
    </div>

    <!-- Charts -->
    <div v-if="showChart" class="stats-charts">
      <!-- Product Group Distribution -->
      <div class="chart-section">
        <h4>产品组分布</h4>
        <div class="bar-chart">
          <div
            v-for="item in productGroupData"
            :key="item.name"
            class="bar-item"
          >
            <span class="bar-label">{{ item.name }}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: `${item.percent}%` }"
              ></div>
            </div>
            <span class="bar-value">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <!-- Status Distribution -->
      <div class="chart-section">
        <h4>状态分布</h4>
        <div class="pie-chart">
          <div
            v-for="item in statusData"
            :key="item.name"
            class="pie-item"
          >
            <span class="pie-label">{{ item.name }}</span>
            <span class="pie-value">{{ item.value }} ({{ item.percent }}%)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.classification-stats {
  margin-bottom: 16px;
}

.stats-cards {
  display: flex;
  gap: 16px;
}

.stat-card {
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat-card.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-card.confirmed {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
}

.stat-card.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.stats-charts {
  margin-top: 16px;
}

.chart-section {
  margin-bottom: 16px;
}

.chart-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-label {
  width: 100px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 4px;
  transition: width 0.3s;
}

.bar-value {
  width: 30px;
  font-size: 12px;
  color: #999;
}

.pie-chart {
  display: flex;
  gap: 24px;
}

.pie-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pie-label {
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.pie-value {
  font-size: 12px;
  color: #666;
}

/* H5 适配 */
@media (max-width: 768px) {
  .stats-cards {
    flex-direction: column;
    gap: 8px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>
