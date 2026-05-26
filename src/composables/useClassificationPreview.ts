/**
 * 归类预览 Hook
 * 规范: openspec/changes/content-classification/specs/llm/02-api-specifications.md
 */

import { computed, ref } from 'vue'
import type {
  ClassificationItem,
  ClassificationResult,
  ClassificationStats,
  ProductGroup,
  ClassificationStatus
} from '../types/classification'

/**
 * 排序类型
 */
export type SortBy = 'productGroup' | 'status' | 'confidence'
export type SortOrder = 'asc' | 'desc'

/**
 * 归类预览 Hook
 */
export function useClassificationPreview(result: ClassificationResult | null) {
  // 筛选状态
  const filterProductGroup = ref<ProductGroup | null>(null)
  const filterStatus = ref<ClassificationStatus | null>(null)
  const sortBy = ref<SortBy>('productGroup')
  const sortOrder = ref<SortOrder>('asc')
  const searchKeyword = ref('')

  /**
   * 获取过滤后的归类项
   */
  const filteredItems = computed(() => {
    if (!result) return []

    let items = [...result.items]

    // 按产品组筛选
    if (filterProductGroup.value) {
      items = items.filter(item => item.productGroup === filterProductGroup.value)
    }

    // 按状态筛选
    if (filterStatus.value) {
      items = items.filter(item => item.status === filterStatus.value)
    }

    // 搜索关键词
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      items = items.filter(item =>
        item.rawContent.toLowerCase().includes(keyword) ||
        item.productGroup.includes(keyword) ||
        item.keyInfo?.toLowerCase().includes(keyword)
      )
    }

    // 排序
    items.sort((a, b) => {
      let comparison = 0

      switch (sortBy.value) {
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

      return sortOrder.value === 'asc' ? comparison : -comparison
    })

    return items
  })

  /**
   * 按产品组分组的归类项
   */
  const groupedItems = computed((): Record<ProductGroup, ClassificationItem[]> => {
    if (!result) return {} as Record<ProductGroup, ClassificationItem[]>

    const groups: Record<ProductGroup, ClassificationItem[]> = {
      '来福商城与卡册': [],
      '三方对接项目': [],
      '采购与集采管理': [],
      '三方供应链': [],
      '销售与财务管理': [],
      '竞价平台与异常单': [],
      '履约监控与物流一体化': [],
    }

    filteredItems.value.forEach(item => {
      if (groups[item.productGroup]) {
        groups[item.productGroup].push(item)
      }
    })

    return groups
  })

  /**
   * 获取统计信息
   */
  const stats = computed((): ClassificationStats => {
    if (!result) {
      return {
        total: 0,
        confirmed: 0,
        pending: 0,
        byProductGroup: {} as Record<ProductGroup, number>,
        byStatus: {} as Record<ClassificationStatus, number>,
      }
    }

    return result.stats
  })

  /**
   * 按状态筛选
   */
  function filterByStatus(status: ClassificationStatus | null): void {
    filterStatus.value = status
  }

  /**
   * 按产品组筛选
   */
  function filterByProductGroup(group: ProductGroup | null): void {
    filterProductGroup.value = group
  }

  /**
   * 设置排序
   */
  function setSort(by: SortBy, order: SortOrder = 'asc'): void {
    sortBy.value = by
    sortOrder.value = order
  }

  /**
   * 切换排序方向
   */
  function toggleSortOrder(): void {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  /**
   * 设置搜索关键词
   */
  function setSearchKeyword(keyword: string): void {
    searchKeyword.value = keyword
  }

  /**
   * 清除所有筛选
   */
  function clearFilters(): void {
    filterProductGroup.value = null
    filterStatus.value = null
    searchKeyword.value = ''
  }

  /**
   * 获取产品组显示顺序
   */
  const productGroupOrder: ProductGroup[] = [
    '来福商城与卡册',
    '三方对接项目',
    '采购与集采管理',
    '三方供应链',
    '销售与财务管理',
    '竞价平台与异常单',
    '履约监控与物流一体化',
  ]

  /**
   * 获取状态显示顺序
   */
  const statusOrder: ClassificationStatus[] = [
    '已上线',
    '开发中',
  ]

  /**
   * 获取低置信度项（需要确认）
   */
  const lowConfidenceItems = computed(() => {
    return filteredItems.value.filter(item => item.confidence < 0.7 && !item.confirmed)
  })

  /**
   * 获取未确认项
   */
  const pendingItems = computed(() => {
    return filteredItems.value.filter(item => !item.confirmed)
  })

  /**
   * 获取已确认项
   */
  const confirmedItems = computed(() => {
    return filteredItems.value.filter(item => item.confirmed)
  })

  return {
    // 状态
    filterProductGroup,
    filterStatus,
    sortBy,
    sortOrder,
    searchKeyword,

    // 计算属性
    filteredItems,
    groupedItems,
    stats,
    lowConfidenceItems,
    pendingItems,
    confirmedItems,

    // 常量
    productGroupOrder,
    statusOrder,

    // 方法
    filterByStatus,
    filterByProductGroup,
    setSort,
    toggleSortOrder,
    setSearchKeyword,
    clearFilters,
  }
}
