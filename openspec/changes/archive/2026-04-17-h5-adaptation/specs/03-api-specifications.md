# H5 适配 - API 规范

**创建日期**: 2026-04-09
**版本**: v1.0
**功能**: H5 适配优化

---

## 1. 概述

H5 适配为纯前端 CSS 改动，不涉及 API 接口变更。

---

## 2. CSS 规范

### 2.1 媒体查询

```css
/* 移动端适配 */
@media (max-width: 768px) {
  /* 触控区域优化 */
  /* 间距调整 */
  /* 布局响应式 */
}

/* 手机端全屏 */
@media (max-width: 480px) {
  /* 归类编辑全屏弹窗 */
}
```

### 2.2 iOS 兼容

```css
/* 防止 iOS 自动缩放 */
input, select, textarea {
  font-size: 16px;
}

/* 惯性滚动 */
.scrollable {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

---

## 3. 组件 API

### 3.1 Drawer 组件

Drawer 组件无异步操作，纯同步展示。

---

*本文档为 OpenSpec API 规范阶段产出*
