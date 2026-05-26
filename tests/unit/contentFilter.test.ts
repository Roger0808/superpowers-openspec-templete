/**
 * 内容过滤器单元测试
 * 大模型迭代 - v0.2
 */

import { describe, it, expect } from 'vitest'
import {
  applyFilter,
  filterBatch,
  isInProgressOrResearching,
  containsFutureContent,
  filterParenthetical,
  createDefaultFilterConfig
} from '../../src/utils/contentFilter'

describe('内容过滤器', () => {
  const defaultConfig = createDefaultFilterConfig()

  describe('规则1：过滤跟进中/调研中内容', () => {
    it('应过滤包含"跟进中"的内容', () => {
      const result = applyFilter('项目正在跟进中，预计下周完成', defaultConfig)
      expect(result.filtered).toBe(true)
      expect(result.reason).toBe('跟进中')
    })

    it('应过滤包含"调研中"的内容', () => {
      const result = applyFilter('需求调研中，尚未确定方案', defaultConfig)
      expect(result.filtered).toBe(true)
      expect(result.reason).toBe('调研中')
    })

    it('应过滤包含"进行中"的内容', () => {
      const result = applyFilter('开发进行中，预计本周上线', defaultConfig)
      expect(result.filtered).toBe(true)
      expect(result.reason).toBe('跟进中')
    })

    it('应保留正常内容', () => {
      const result = applyFilter('已完成首页改版上线', defaultConfig)
      expect(result.filtered).toBe(false)
      expect(result.content).toBe('已完成首页改版上线')
    })
  })

  describe('规则2：过滤周后内容', () => {
    it('应过滤包含"下周"的内容', () => {
      const result = applyFilter('下周计划上线新功能', defaultConfig)
      expect(result.filtered).toBe(true)
      expect(result.reason).toBe('周后内容')
    })

    it('应过滤包含"下月"的内容', () => {
      const result = applyFilter('下月安排评审会议', defaultConfig)
      expect(result.filtered).toBe(true)
      expect(result.reason).toBe('周后内容')
    })

    it('应过滤包含"后续"的内容', () => {
      const result = applyFilter('后续将由其他团队接手', defaultConfig)
      expect(result.filtered).toBe(true)
      expect(result.reason).toBe('周后内容')
    })

    it('应保留本周内容', () => {
      const result = applyFilter('本周已完成测试', defaultConfig)
      expect(result.filtered).toBe(false)
    })
  })

  describe('规则3：过滤括号内内容', () => {
    it('应过滤中文括号内容', () => {
      const result = applyFilter('已完成首页改版（3.27上线）', defaultConfig)
      expect(result.filtered).toBe(false)
      expect(result.content).toBe('已完成首页改版')
    })

    it('应过滤中文书名号内容', () => {
      const result = applyFilter('已完成《项目文档》整理', defaultConfig)
      expect(result.filtered).toBe(false)
      expect(result.content).toBe('已完成整理')
    })

    it('应过滤英文括号内容', () => {
      const result = applyFilter('已完成测试(internal)', defaultConfig)
      expect(result.filtered).toBe(false)
      expect(result.content).toBe('已完成测试')
    })

    it('应保留无括号内容', () => {
      const result = applyFilter('已完成首页改版上线', defaultConfig)
      expect(result.filtered).toBe(false)
      expect(result.content).toBe('已完成首页改版上线')
    })
  })

  describe('辅助函数', () => {
    it('isInProgressOrResearching 应正确判断', () => {
      expect(isInProgressOrResearching('项目跟进中')).toBe(true)
      expect(isInProgressOrResearching('需求调研中')).toBe(true)
      expect(isInProgressOrResearching('已完成上线')).toBe(false)
    })

    it('containsFutureContent 应正确判断', () => {
      expect(containsFutureContent('下周计划')).toBe(true)
      expect(containsFutureContent('下月安排')).toBe(true)
      expect(containsFutureContent('本周已完成')).toBe(false)
    })

    it('filterParenthetical 应正确过滤', () => {
      expect(filterParenthetical('内容（注释）')).toBe('内容')
      expect(filterParenthetical('内容【括号】')).toBe('内容')
      expect(filterParenthetical('内容(英文)')).toBe('内容')
    })
  })

  describe('批量过滤', () => {
    it('应正确批量过滤', () => {
      const contents = [
        '已完成首页改版',
        '项目调研中',
        '下周计划上线'
      ]
      const results = filterBatch(contents, defaultConfig)

      expect(results[0].filtered).toBe(false)
      expect(results[1].filtered).toBe(true)
      expect(results[2].filtered).toBe(true)
    })
  })
})
