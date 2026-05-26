---
tags: [工作/项目, 项目/H5-周报系统, 技术架构, 设计文档]
---

# 技术架构设计 - H5 周报系统

**创建时间**: 2026-03-28  
**版本**: v1.1  
**状态**: ✅ 已确认（2026-03-29）  
**项目**: H5 周报生成与编辑系统

---

## 1. 技术栈选型（✅ 已确认）

### 1.1 核心技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | Vue 3 | 3.5.30+ | Composition API + `<script setup>` |
| **构建工具** | Vite | 8.0.1+ | 快速开发和热更新 |
| **语言** | TypeScript | 5.9.3+ | 类型安全 |
| **UI 组件库** | Element Plus | 2.13.6+ | 桌面端组件 |
| **样式** | Tailwind CSS | 3.4.19+ | 原子化 CSS |
| **Excel 解析** | xlsx | 0.18.5+ | SheetJS 库 |
| **Markdown 处理** | marked | 15.0.7+ | Markdown 解析与渲染 |
| **编辑器** | Quill | 1.3.7+ | 轻量 Markdown 编辑器（~50KB） |

### 1.2 开发工具链

| 工具 | 用途 |
|------|------|
| vue-tsc | TypeScript 类型检查 |
| ESLint | 代码质量检查 |
| Prettier | 代码格式化 |
| Vitest | 单元测试框架 |
| @vue/test-utils | Vue 组件测试工具 |
| happy-dom / jsdom | 测试 DOM 环境 |

### 1.3 技术选型理由（✅ 已确认）

**Vue 3 + Vite**:
- ✅ 轻量快速，适合 H5 场景
- ✅ Composition API 便于逻辑复用
- ✅ 生态系统成熟，组件丰富

**Element Plus + Tailwind**:
- ✅ Element Plus 提供现成组件（上传、按钮、对话框）
- ✅ Tailwind 快速定制样式，支持响应式
- ✅ 两者可共存，Element 组件 + Tailwind 工具类

**xlsx (SheetJS)**:
- ✅ 浏览器端直接解析 Excel，无需后端
- ✅ 支持 `.xlsx` 格式
- ✅ 社区成熟，文档完善

**Quill 编辑器**（✅ 已确认）:
- ✅ 轻量（~50KB）
- ✅ 功能够用
- ✅ 移动端友好
- ✅ 支持 Markdown 语法

**marked**:
- ✅ 轻量快速的 Markdown 解析器
- ✅ 支持自定义渲染规则
- ✅ 便于导出和预览

---

## 2. 项目架构（✅ 已确认）

### 2.1 目录结构

```
h5-weekly-report/
├── docs/                        # 项目文档
│   ├── 00-requirements-research.md  # 需求调研
│   ├── 01-requirements.md       # 需求说明
│   ├── 02-PRD.md                # 产品需求文档
│   ├── 03-architecture.md       # 技术架构（本文档）
│   └── 04-tasks.md              # 任务分解
├── src/
│   ├── main.ts                  # 应用入口
│   ├── App.vue                  # 根组件
│   ├── components/              # 可复用组件
│   │   ├── UploadSection.vue    # Excel 上传组件
│   │   ├── DataPreview.vue      # 数据预览组件
│   │   ├── TemplateSelector.vue # 模板选择组件
│   │   ├── ReportEditor.vue     # 报告编辑器
│   │   └── ExportPanel.vue      # 导出面板
│   ├── composables/             # 组合式函数
│   │   ├── useExcelParser.ts    # Excel 解析逻辑
│   │   ├── useTemplateGenerator.ts # 模板生成
│   │   └── useAutoSave.ts       # 自动保存（每 30 秒）
│   ├── types/                   # TypeScript 类型定义
│   │   ├── excel.ts             # Excel 数据类型
│   │   ├── report.ts            # 周报类型
│   │   └── index.ts             # 类型导出
│   └── utils/                   # 工具函数
│       ├── markdownParser.ts    # Markdown 解析
│       └── exportUtils.ts       # 导出工具
├── package.json
└── vite.config.ts
```

---

## 3. 核心流程设计（✅ 已确认）

### 3.1 数据流

```
Excel 文件
   ↓
[上传解析] → useExcelParser.ts
   ↓
原始数据 → 映射逻辑 → 结构化数据
   ↓
[模板生成] → useTemplateGenerator.ts
   ↓
周报草稿 → 编辑器 → 用户编辑
   ↓
[自动保存] → localStorage（每 30 秒）
   ↓
[导出] → exportUtils.ts → 本周周报.md
```

### 3.2 组件层级

```
App.vue
├── Header.vue
├── UploadSection.vue
├── DataPreview.vue
├── TemplateSelector.vue
├── ReportEditor.vue
│   └── Quill Editor
└── ExportPanel.vue
```

---

## 4. 关键技术实现（✅ 已确认）

### 4.1 Excel 解析与映射

**实现逻辑**:
```typescript
// 1. 读取 Excel
const workbook = XLSX.read(file, { type: 'array' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// 2. 映射产品组到章节
const chapterMap = {
  'SHOP 组': ['1. 来福商城', '2. 三方项目'],
  'ERP 组': ['3. 采购与集采管理', '4. 三方供应链', 
             '5. 销售与财务管理', '6. 竞价平台与异常单'],
  'WMS 组': ['7. 履约监控与物流一体化']
};

// 3. 提取状态标签
const statusTags = ['完结', '无变更', '变更', '新增', '开发中', '调研中'];
```

### 4.2 模板生成

**实现逻辑**:
```typescript
// 1. 读取 MD 模板
const template = await readFile(templateFile);

// 2. 提取章节标题
const chapters = template.match(/^#+\s+(.+)/gm);

// 3. 生成周报结构
const report = {
  title: '本周周报',
  date: new Date(),
  chapters: chapters.map(chapter => ({
    title: chapter,
    content: mapExcelData(chapter)
  }))
};
```

### 4.3 自动保存

**实现逻辑**:
```typescript
// 每 30 秒自动保存
setInterval(() => {
  const content = editor.getContent();
  localStorage.setItem('weekly-report-draft', content);
}, 30000);
```

### 4.4 Markdown 导出

**实现逻辑**:
```typescript
// 导出为 Markdown 文件
const markdown = generateMarkdown(report);
const blob = new Blob([markdown], { type: 'text/markdown' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = '本周周报.md';
a.click();
```

---

## 5. 性能优化（✅ 已确认）

### 5.1 性能指标

| 指标 | 目标 | 实现方式 |
|------|------|---------|
| Excel 解析 | < 3 秒 | xlsx 库，浏览器端解析 |
| 页面加载 | < 2 秒 | Vite 构建，代码分割 |
| 导出 | < 5 秒 | Blob 直接生成，无需后端 |

### 5.2 移动端优化

- ✅ Quill 编辑器轻量（~50KB）
- ✅ 响应式布局（Tailwind CSS）
- ✅ 触摸友好的按钮尺寸
- ✅ 自动保存防丢失（每 30 秒）

---

## 6. 部署方案（✅ 已确认）

### 6.1 部署环境

| 项目 | 配置 |
|------|------|
| **内网地址** | http://192.168.1.245:18080/h5-weekly-report/ |
| **域名** | files.openpet.cn（已绑定，不需要管） |
| **部署方式** | 静态资源，无需后端 |
| **文件服务器目录** | `/home/roger/.openclaw/file-server/h5-weekly-report/` |

### 6.2 构建与部署流程

```bash
# 1. 安装依赖
npm install

# 2. 构建生产版本
npm run build

# 3. 部署到文件服务器
cp -r dist/* /home/roger/.openclaw/file-server/h5-weekly-report/
```

**注意**: 
- Nginx 配置已存在，不需要修改
- 文件服务器会自动提供 `http://192.168.1.245:18080/h5-weekly-report/` 访问

---

## 7. 测试策略（✅ 已确认）

### 7.1 测试类型

| 类型 | 工具 | 覆盖率目标 |
|------|------|-----------|
| 单元测试 | Vitest | > 70% |
| 组件测试 | @vue/test-utils | > 70% |
| E2E 测试 | （后续迭代） | - |

### 7.2 关键测试用例

- ✅ Excel 解析准确率 > 95%
- ✅ 数据映射正确性
- ✅ 模板生成完整性
- ✅ 导出文件格式正确
- ✅ 移动端兼容性

---

## 8. 变更记录

| 版本 | 日期 | 变更内容 | 状态 |
|------|------|----------|------|
| v1.0 | 2026-03-28 | 初始版本 | - |
| v1.1 | 2026-03-29 | 根据 02-PRD.md v1.1 更新，确认技术选型（Quill 编辑器） | ✅ 已确认 |

---

## ✅ 架构确认完成（2026-03-29）

**所有技术选型已确认，可以开始编写 Tasks！**

---

**下一步**: 03 确认 → 更新 04-tasks.md → 老馒头确认
