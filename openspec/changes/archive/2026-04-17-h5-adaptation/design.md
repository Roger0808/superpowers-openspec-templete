# H5 适配优化 - Design

**创建日期**: 2026-04-09
**变更**: h5-adaptation
**版本**: v1.0

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
| `src/components/classification/ClassificationStats.vue` | 统计卡片垂直堆叠 |
| `src/components/classification/ClassificationEditor.vue` | 全屏弹窗 |
| `src/components/common/ExportPanel.vue` | 全屏模式 + 卡片堆叠 |

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
- 响应式宽度（小屏 85%，最大 320px）
- CSS transition 动画

---

## 4. 页面适配详情

### 4.1 首页 (HomePage)

**H5 改动**:
- 按钮高度 44px
- 上传区域 padding 增大
- 日期选择器间距调整

**CSS**:
```css
@media (max-width: 768px) {
  .upload-button { height: 44px; }
  .upload-zone { padding: 24px; }
}
```

### 4.2 编辑页 (EditorPage)

**H5 改动**:
- 侧边栏隐藏（`display: none`）
- 顶部添加汉堡菜单按钮
- 点击汉堡打开 Drawer 抽屉
- 抽屉内复用 ChapterNav 组件

**CSS**:
```css
@media (max-width: 768px) {
  .sidebar { display: none; }
  .header-hamburger { display: flex; }
}
```

### 4.3 归类预览 (ClassificationPreview)

**H5 改动**:
- 统计卡片垂直堆叠
- 过滤栏横向滚动
- 页脚按钮堆叠

### 4.4 归类编辑 (ClassificationEditor)

**H5 改动**:
- 小屏（< 480px）全屏弹窗
- `el-dialog` 覆盖样式

**CSS**:
```css
@media (max-width: 480px) {
  :deep(.el-dialog) {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    margin: 0;
  }
}
```

### 4.5 导出面板 (ExportPanel)

**H5 改动**:
- 85% 宽度面板（桌面）
- 全屏模式（< 480px）
- 格式卡片垂直堆叠
- 按钮高度 48px

---

## 5. CSS 架构

### 5.1 媒体查询断点

```css
/* Tablet & Mobile */
@media (max-width: 768px) {
  /* H5 适配样式 */
}

/* Mobile only */
@media (max-width: 480px) {
  /* 归类编辑全屏弹窗、导出面板全屏 */
}
```

### 5.2 触控区域标准

| 元素 | 最小尺寸 |
|------|----------|
| 按钮 | 44px × 44px |
| 链接/点击区域 | 44px × 44px |
| 表单输入 | height: 44px |

---

## 6. iOS 兼容

### 6.1 防止自动缩放
表单输入元素添加 `font-size: 16px` 防止 iOS 自动缩放。

### 6.2 滚动
添加 `-webkit-overflow-scrolling: touch` 支持惯性滚动。

---

## 7. 组件目录结构

```
src/
├── components/
│   └── common/
│       ├── Drawer.vue          # 新增
│       └── ExportPanel.vue     # 修改
├── pages/
│   ├── HomePage.vue            # 修改
│   └── EditorPage.vue          # 修改
└── components/
    └── classification/
        ├── ClassificationPreview.vue  # 修改
        ├── ClassificationStats.vue    # 修改
        └── ClassificationEditor.vue   # 修改
```

---

*本文档为 Design 阶段产出*
