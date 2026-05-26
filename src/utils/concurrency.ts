/**
 * 并发控制工具
 */

/**
 * 执行带有并发限制的异步任务
 * @param items 需要处理的数据数组
 * @param limit 最大并发数
 * @param taskFn 处理单个数据的异步函数
 * @param onProgress 进度回调函数，参数为已完成数量和总数量
 * @returns 包含所有处理结果的 Promise 数组
 */
export async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  taskFn: (item: T, index: number) => Promise<R>,
  onProgress?: (completed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let currentIndex = 0
  let completedCount = 0

  return new Promise((resolve, reject) => {
    if (items.length === 0) {
      resolve([])
      return
    }

    const runTask = async () => {
      // 获取当前需要处理的任务索引
      const index = currentIndex++
      if (index >= items.length) {
        return
      }

      try {
        // 执行任务并保存结果
        const result = await taskFn(items[index], index)
        results[index] = result
        completedCount++

        // 触发进度回调
        if (onProgress) {
          onProgress(completedCount, items.length)
        }

        // 如果还有未处理的任务，继续执行
        if (currentIndex < items.length) {
          runTask()
        } else if (completedCount === items.length) {
          // 所有任务完成
          resolve(results)
        }
      } catch (error) {
        reject(error)
      }
    }

    // 初始启动指定数量的并发任务
    const initialTasksCount = Math.min(limit, items.length)
    for (let i = 0; i < initialTasksCount; i++) {
      runTask()
    }
  })
}
