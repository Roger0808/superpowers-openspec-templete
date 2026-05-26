# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

H5 Weekly Report System — an Excel-based intelligent weekly report tool with mobile/desktop editing and one-click Markdown export. Uses Vue 3 + TypeScript + Vite with SDD (Specification-Driven Development) methodology incorporating OpenSpec framework.

## Commands

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Production build to dist/
npm run build:check  # TypeScript check + production build
npm run lint         # ESLint check with auto-fix
npm run format       # Prettier formatting
npm run test         # Run unit tests with Vitest
npm run test:coverage # Run tests with coverage report
npm run deploy       # Build and deploy to GitHub Pages
```

## Architecture

### Routing
Two-page application: `/` (HomePage) for Excel upload/parsing, `/editor` (EditorPage) for editing/exporting. Data flows between pages via `useReportStore` reactive singleton.

### State Management
Uses Vue 3 `reactive()` for lightweight store pattern — NOT Pinia. See `src/composables/useReportStore.ts`. All composables follow `use{Feature}` naming convention.

### 7-Chapter Report Structure
The weekly report has 7 fixed chapters with IDs `chapter-1` through `chapter-7`:
1. 来福商城 (chapter-1)
2. 三方项目 (开发中) (chapter-2)
3. 采购与集采管理 (chapter-3)
4. 三方供应链 (chapter-4)
5. 销售与财务管理 (chapter-5)
6. 竞价平台与异常单 (chapter-6)
7. 履约监控与物流一体化 (chapter-7)

### Product Group to Chapter Mapping
Mapping logic is in `HomePage.vue` (`mapSectionToChapter` function):
- **SALES组** → chapter-1 (来福商城) by default; chapter-2 for 三方对接; chapter-4 for 京东/丰享/盒马/华润/麦德龙; chapter-6 for 竞价平台/异常单
- **ERP组** → chapter-3 by default; chapter-4 for 京东/丰享/盒马/华润/麦德龙/三方供应链; chapter-5 for 销售管理/财务管理/售后; chapter-6 for 竞价平台/异常单
- **WMS组** → chapter-7

### Key Composables
| Composable | Purpose |
|------------|---------|
| `useExcelParser` | Parse .xlsx files, extract meeting time/product group/content |
| `useLLMParser` | AI-powered content parsing via MiniMax API |
| `useContentMapper` | Map product groups to 7 chapter sections |
| `useContentPolisher` | One-click report text optimization |
| `useFilterRules` | Content filtering (exclude "跟进中", "调研中", post-week content, bracketed content) |
| `useReportStore` | Global report state (generated flag, chapters, week range) |

### LLM Integration
MiniMax API integration via `src/services/LLMService.ts`. Supports `abab6-chat` and `abab5.5-chat` models with retry logic and exponential backoff.

### Content Filtering Rules
In `useFilterRules.ts` and `useContentFilter.ts`:
1. Exclude content containing "跟进中" or "调研中"
2. Exclude post-week content (content from dates after the report week)
3. Exclude content within brackets `[]` or `【】`

### Export
Markdown export (MVP), Word generation via `docx` library, PDF via `html2pdf.js`.

## OpenSpec Framework

Project uses OpenSpec for specification-driven development:

| 目录 | 内容 | 说明 |
|------|------|------|
| `openspec/specs/` | 项目级规范 | Type definitions, API specs, component interfaces, test specs |
| `openspec/changes/` | 变更提案 | Feature change proposals（新功能迭代时创建） |
| `openspec/docs/01-04` | 首次开发规格文档 | **v0.1 初始开发**的 Superpowers 规格文档 |
| `openspec/docs/project.md` | 项目规范 | 流程、架构、代码规范 |
| `openspec/docs/capabilities.md` | 能力清单 | 已有技术栈和组件能力 |

### 首次开发规格文档（v0.1）

`openspec/docs/` 下的 01-04 文档是**首次开发**时用 Superpowers 创建的规格文档：

- `00-requirements-research.md` - 需求调研
- `01-requirements.md` - 需求说明
- `02-PRD.md` - 产品需求文档
- `03-architecture.md` - 技术架构
- `04-tasks.md` - 任务分解

### Superpowers + OpenSpec SDD 框架

本项目使用 **SDD (Specification-Driven Development)** 模式，Superpowers 和 OpenSpec 配合使用。

详见：[`openspec/docs/project.md`](openspec/docs/project.md) 中的「2. Superpowers + OpenSpec 联合流程」

## Development Notes

- Vue 3 Composition API with `<script setup>` syntax
- Tailwind CSS for styling alongside Element Plus components
- Quill editor for rich text editing
- `xlsx` (SheetJS) for browser-side Excel parsing — no backend required
- Auto-save every 30 seconds to localStorage
- Deploys as static files to GitHub Pages (`base: './'` in vite.config)
- `vue-tsc` (not `tsc`) for TypeScript type checking
