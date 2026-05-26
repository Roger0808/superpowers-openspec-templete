# H5 适配 - 类型定义

**创建日期**: 2026-04-09
**版本**: v1.0
**功能**: H5 适配优化

---

## 1. 概述

H5 适配主要涉及 CSS 样式调整和新增 Drawer 组件，无新增业务类型定义。

---

## 2. Drawer 组件类型

### 2.1 Props

```typescript
interface DrawerProps {
  /** 控制显示 */
  visible: boolean
  /** 标题 */
  title?: string
  /** 宽度 */
  width?: string
  /** 点击遮罩是否关闭 */
  overlayCloseable?: boolean
}
```

### 2.2 Emits

```typescript
interface DrawerEmits {
  /** 更新 visible */
  (e: 'update:visible', value: boolean): void
  /** 关闭事件 */
  (e: 'close'): void
}
```

### 2.3 默认值

| 属性 | 默认值 |
|------|--------|
| title | '' |
| width | '280px' |
| overlayCloseable | true |

---

## 3. 响应式断点

```typescript
const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
}
```

---

## 4. 触控区域标准

```typescript
const TOUCH_TARGET = {
  minimum: 44, // 最小触控区域 px
  buttonHeight: 44,
  inputHeight: 44,
  toggleHeight: 32,
}
```

---

*本文档为 OpenSpec 类型定义阶段产出*
