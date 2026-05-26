<template>
  <nav class="chapter-nav" :class="{ compact }">
    <div class="chapter-nav-header">
      <h3 class="chapter-nav-title">📑 章节导航</h3>
    </div>
    
    <ul class="chapter-list">
      <li
        v-for="chapter in chapters"
        :key="chapter.chapterId"
        class="chapter-item"
        :class="{ 
          active: chapter.chapterId === currentChapterId,
          edited: isChapterEdited(chapter.chapterId)
        }"
        @click="handleChapterSelect(chapter.chapterId)"
      >
        <span class="chapter-status">
          <template v-if="chapter.chapterId === currentChapterId">➡️</template>
          <template v-else-if="isChapterEdited(chapter.chapterId)">✅</template>
          <template v-else>⬜</template>
        </span>
        <span class="chapter-title">{{ chapter.title }}</span>
        <span v-if="chapter.items?.length" class="chapter-count">
          ({{ chapter.items.length }})
        </span>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { ChapterContent, ChapterId } from '../../types/report'

// ========== Props ==========
const props = defineProps<{
  /** 章节列表 */
  chapters: ChapterContent[]
  /** 当前章节 ID */
  currentChapterId: ChapterId
  /** 是否紧凑模式 */
  compact?: boolean
}>()

// ========== Emits ==========
const emit = defineEmits<{
  /** 章节选择事件 */
  (e: 'chapter-select', chapterId: ChapterId): void
}>()

// ========== Methods ==========
const handleChapterSelect = (chapterId: ChapterId) => {
  emit('chapter-select', chapterId)
}

const isChapterEdited = (chapterId: ChapterId) => {
  const chapter = props.chapters.find(c => c.chapterId === chapterId)
  return chapter?.items && chapter.items.length > 0
}
</script>

<style scoped>
.chapter-nav {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chapter-nav-header {
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chapter-nav-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.chapter-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chapter-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-item:hover {
  background: #f9fafb;
}

.chapter-item.active {
  background: #f0f4ff;
  border-left: 3px solid #667eea;
}

.chapter-item.edited .chapter-title {
  color: #10b981;
}

.chapter-status {
  margin-right: 10px;
  font-size: 1.2rem;
}

.chapter-title {
  flex: 1;
  font-size: 0.95rem;
  color: #374151;
  transition: all 0.2s;
}

.chapter-item.active .chapter-title {
  color: #667eea;
  font-weight: 600;
}

.chapter-count {
  font-size: 0.85rem;
  color: #9ca3af;
  margin-left: 8px;
}

/* 紧凑模式 */
.chapter-nav.compact .chapter-nav-header {
  padding: 10px 15px;
}

.chapter-nav.compact .chapter-item {
  padding: 8px 15px;
}

.chapter-nav.compact .chapter-title {
  font-size: 0.85rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chapter-nav {
    border-radius: 8px;
  }
  
  .chapter-nav-header {
    padding: 12px 15px;
  }
  
  .chapter-nav-title {
    font-size: 1rem;
  }
  
  .chapter-item {
    padding: 10px 15px;
  }
  
  .chapter-title {
    font-size: 0.9rem;
  }
}
</style>
