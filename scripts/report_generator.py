#!/usr/bin/env python3
"""
Markdown 周报生成器
将分类后的内容生成为标准 Markdown 格式周报
"""

from typing import List, Dict
from datetime import datetime
from dataclasses import dataclass

from classifier import ClassifiedItem, CHAPTERS


@dataclass
class ReportOptions:
    """周报选项"""
    title: str = "产品周报"
    week_start: str = ""  # 周开始日期
    week_end: str = ""    # 周结束日期
    author: str = ""      # 作者
    include_deadline: bool = True  # 是否包含截止日期
    include_confidence: bool = False  # 是否包含置信度


class ReportGenerator:
    """周报生成器"""

    def __init__(self, options: ReportOptions = None):
        self.options = options or ReportOptions()

    def generate(self, items: List[ClassifiedItem]) -> str:
        """
        生成 Markdown 周报

        Args:
            items: 分类后的条目列表

        Returns:
            Markdown 格式的周报字符串
        """
        if not items:
            return "# 产品周报\n\n（本周无有效工作内容）"

        # 按章节分组
        grouped_items = self._group_by_chapter(items)

        # 构建周报
        lines = []

        # 标题
        lines.extend(self._build_header())

        # 统计信息
        lines.extend(self._build_stats(items))

        # 各章节内容
        for chapter in CHAPTERS:
            chapter_id = chapter['id']
            chapter_title = chapter['title']

            if chapter_id in grouped_items:
                lines.extend(self._build_chapter(chapter_title, grouped_items[chapter_id]))

        # 页脚
        lines.extend(self._build_footer())

        return '\n'.join(lines)

    def _build_header(self) -> List[str]:
        """构建标题部分"""
        lines = []

        # 主标题
        lines.append(f"# {self.options.title}")
        lines.append("")

        # 副标题信息
        if self.options.week_start and self.options.week_end:
            lines.append(f"**周期**: {self.options.week_start} ~ {self.options.week_end}")
            lines.append("")

        if self.options.author:
            lines.append(f"**编制人**: {self.options.author}")
            lines.append("")

        lines.append("---")
        lines.append("")

        return lines

    def _build_stats(self, items: List[ClassifiedItem]) -> List[str]:
        """构建统计信息"""
        lines = []

        total = len(items)
        completed = sum(1 for item in items if item.status == 'completed')
        in_progress = sum(1 for item in items if item.status == 'in_progress')
        planned = sum(1 for item in items if item.status == 'planned')

        lines.append("## 本周统计")
        lines.append("")
        lines.append(f"- **总计**: {total} 项")
        lines.append(f"- **已完成**: {completed} 项")
        lines.append(f"- **进行中**: {in_progress} 项")
        if planned > 0:
            lines.append(f"- **已计划**: {planned} 项")
        lines.append("")
        lines.append("---")
        lines.append("")

        return lines

    def _group_by_chapter(self, items: List[ClassifiedItem]) -> Dict[str, List[ClassifiedItem]]:
        """按章节分组"""
        grouped = {}

        for item in items:
            chapter_id = item.chapter_id
            if chapter_id not in grouped:
                grouped[chapter_id] = []
            grouped[chapter_id].append(item)

        return grouped

    def _build_chapter(self, chapter_title: str, items: List[ClassifiedItem]) -> List[str]:
        """构建单个章节"""
        lines = []

        lines.append(f"## {chapter_title}")
        lines.append("")

        # 按状态分组
        completed_items = [item for item in items if item.status == 'completed']
        in_progress_items = [item for item in items if item.status == 'in_progress']
        planned_items = [item for item in items if item.status == 'planned']

        # 已上线
        if completed_items:
            lines.append("**已上线**")
            lines.append("")
            for item in completed_items:
                lines.extend(self._build_item(item))
            lines.append("")

        # 开发中
        if in_progress_items:
            lines.append("**开发中**")
            lines.append("")
            for item in in_progress_items:
                lines.extend(self._build_item(item))
            lines.append("")

        # 计划中
        if planned_items:
            lines.append("**计划中**")
            lines.append("")
            for item in planned_items:
                lines.extend(self._build_item(item))
            lines.append("")

        return lines

    def _build_item(self, item: ClassifiedItem) -> List[str]:
        """构建单个条目"""
        lines = []

        # 状态标记（简洁版，不在条目前显示）
        lines.append(f"- {item.key_info}")

        return lines

    def _build_footer(self) -> List[str]:
        """构建页脚"""
        lines = []

        lines.append("---")
        lines.append("")
        lines.append(f"*Generated at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*")

        return lines

    def save_to_file(self, content: str, file_path: str) -> bool:
        """
        保存周报到文件

        Args:
            content: 周报内容
            file_path: 文件路径

        Returns:
            是否保存成功
        """
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[ReportGenerator] 周报已保存到: {file_path}")
            return True
        except Exception as e:
            print(f"[ReportGenerator] 保存失败: {e}")
            return False


def generate_report(items: List[ClassifiedItem], options: ReportOptions = None) -> str:
    """
    便捷函数：生成周报

    Args:
        items: 分类后的条目列表
        options: 周报选项

    Returns:
        Markdown 格式的周报字符串
    """
    generator = ReportGenerator(options)
    return generator.generate(items)


if __name__ == '__main__':
    # 测试代码
    from classifier import ClassifiedItem

    test_items = [
        ClassifiedItem(
            index=0,
            chapter_id='chapter-1',
            chapter_title='来福商城与卡册',
            status='completed',
            status_text='[完结]',
            key_info='salespc任务调度中心额度处理导出文件新增表头-3.24已上线',
            deadline='3.24',
            confidence=0.95,
            product_group='来福商城',
            raw_content='原始内容'
        ),
        ClassifiedItem(
            index=1,
            chapter_id='chapter-1',
            chapter_title='来福商城与卡册',
            status='in_progress',
            status_text='[进行中]',
            key_info='来福商城优化-新增额度主码、额度模板一键回收权限修改',
            deadline='4.2',
            confidence=0.9,
            product_group='来福商城',
            raw_content='原始内容'
        ),
        ClassifiedItem(
            index=2,
            chapter_id='chapter-3',
            chapter_title='采购与集采管理',
            status='completed',
            status_text='[完结]',
            key_info='SRM系统新增供应商准入流程-4.1上线',
            deadline='4.1',
            confidence=0.85,
            product_group='采购管理',
            raw_content='原始内容'
        ),
    ]

    options = ReportOptions(
        title="产品周报",
        week_start="2024-03-18",
        week_end="2024-03-24",
        author="张三"
    )

    report = generate_report(test_items, options)
    print(report)
