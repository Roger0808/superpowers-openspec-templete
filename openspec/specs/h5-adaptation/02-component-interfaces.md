# H5 适配 - 组件接口

**创建日期**: 2026-04-09
**版本**: v1.0
**功能**: H5 适配优化

---

## 1. 新增组件

### 1.1 Drawer 抽屉组件

**路径**: `src/components/common/Drawer.vue`

**功能**: 左侧滑出的抽屉导航容器

**接口**:

```vue
<template>
  <Drawer
    v-model:visible="drawerVisible"
    title="章节导航"
    width="280px"
    @close="handleClose"
  >
    <ChapterNav />
  </Drawer>
</template>
```

**Props**:
| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| visible | boolean | 是 | 控制显示 |
| title | string | 否 | 标题 |
| width | string | 否 | 宽度，默认 280px |
| overlayCloseable | boolean | 否 | 点击遮罩关闭，默认 true |

**Emits**:
| 事件 | 参数 | 说明 |
|------|------|------|
| update:visible | boolean | 双向绑定 |
| close | - | 关闭时触发 |

**Slots**:
| 插槽 | 说明 |
|------|------|
| default | 抽屉内容 |
| header | 自定义头部 |

---

## 2. 样式接口

### 2.1 H5 适配样式（所有页面）

所有 H5 适配样式通过 `@media` 媒体查询实现：

```css
/* Tablet & Mobile (< 768px) */
@media (max-width: 768px) {
  /* 触控区域调整 */
  /* 间距调整 */
  /* 布局适配 */
}

/* Mobile only (< 480px) */
@media (max-width: 480px) {
  /* 全屏弹窗 */
}
```

---

## 3. 现有组件样式变更

### 3.1 HomePage.vue

| 元素 | 桌面 | H5 (< 768px) |
|------|------|---------------|
| 上传区域 padding | 40px | 48px |
| 按钮高度 | 36px | 44px |
| 日期选择器 | 横向 | 垂直堆叠 |

### 3.2 EditorPage.vue

| 元素 | 桌面 | H5 (< 768px) |
|------|------|---------------|
| 侧边栏 | 显示 | 隐藏 |
| 汉堡按钮 | 隐藏 | 显示 |
| 编辑区 | 双栏 | 单栏 |

### 3.3 ClassificationPreview.vue

| 元素 | 桌面 | H5 (< 768px) |
|------|------|---------------|
| 统计卡片 | 3 列 | 垂直堆叠 |
| 过滤栏 | 换行 | 横向滚动 |
| 内容卡片 | 3 列 | auto-fill |

### 3.4 ClassificationEditor.vue

| 元素 | 桌面 | H5 (< 480px) |
|------|------|---------------|
| 弹窗 | 居中弹窗 | 全屏 |
| 宽度 | 500px | 100% |
| 表单间距 | 16px | 20px |

### 3.5 ExportPanel.vue

| 元素 | 桌面 | H5 (< 768px) |
|------|------|---------------|
| 格式卡片 | 横向 | 垂直堆叠 |
| 导出按钮 | 正常 | 全宽 48px |

---

*本文档为 OpenSpec 组件接口阶段产出*
