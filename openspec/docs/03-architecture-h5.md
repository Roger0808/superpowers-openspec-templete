# 技术架构 - H5 适配优化

**创建日期**: 2026-04-09
**版本**: v1.0
**迭代**: 二次迭代 - H5 适配优化

---

## 1. 技术方案

### 1.1 渐进增强策略

- **桌面端**：保持现有布局和代码不变
- **移动端**：通过 CSS 媒体查询 `@media (max-width: 768px)` 应用样式调整
- **不引入新依赖**：纯 CSS 实现，不增加包体积

### 1.2 新增组件

| 组件 | 说明 | 路径 |
|------|------|------|
| Drawer | 抽屉导航组件 | `src/components/common/Drawer.vue` |

---

## 2. 文件变更

### 2.1 新增文件

| 文件 | 说明 |
|------|------|
| `src/components/common/Drawer.vue` | 抽屉导航组件 |

### 2.2 修改文件

| 文件 | 改动 |
|------|------|
| `src/pages/HomePage.vue` | H5 样式（按钮 44px、间距调整） |
| `src/pages/EditorPage.vue` | 抽屉导航集成 |
| `src/components/classification/ClassificationPreview.vue` | 响应式 grid |
| `src/components/classification/ClassificationEditor.vue` | 全屏弹窗 |
| `src/components/common/ExportPanel.vue` | 卡片堆叠 |

---

## 3. Drawer 组件设计

### 3.1 接口

```typescript
interface Props {
  visible: boolean
  title?: string
  width?: string
  overlayCloseable?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}
```

### 3.2 功能
- 左侧滑出抽屉
- 点击遮罩关闭
- ESC 键关闭
- 响应式宽度（小屏 85%）

---

## 4. CSS 架构

### 4.1 媒体查询断点

```css
/* Tablet & Mobile */
@media (max-width: 768px) {
  /* H5 适配样式 */
}

/* Mobile only */
@media (max-width: 480px) {
  /* 归类编辑全屏弹窗 */
}
```

### 4.2 触控区域标准

| 元素 | 最小尺寸 |
|------|----------|
| 按钮 | 44px × 44px |
| 链接/点击区域 | 44px × 44px |
| 表单输入 | height: 44px |

---

## 5. iOS 兼容

### 5.1 防止自动缩放
表单输入元素添加 `font-size: 16px` 防止 iOS 自动缩放。

### 5.2 滚动
添加 `-webkit-overflow-scrolling: touch` 支持惯性滚动。

---

## 6. 测试计划

### 6.1 手动测试
- iPhone Safari
- 华为浏览器
- 小米浏览器
- Chrome DevTools 移动端模拟

### 6.2 验证清单
- [ ] 触控区域 ≥ 44px
- [ ] 无横向滚动
- [ ] 抽屉导航功能正常
- [ ] 全屏弹窗显示正常
- [ ] 桌面端功能不受影响

---

*本文档为 Architecture 阶段产出*
