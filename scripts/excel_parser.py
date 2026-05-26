#!/usr/bin/env python3
"""
Excel 文件解析模块
解析包含三列数据的 Excel：会议时间点、产品组、同步信息内容
"""

import pandas as pd
from pathlib import Path
from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class ExcelRow:
    """Excel 行数据"""
    time: str
    product_group: str
    content: str


class ExcelParser:
    """Excel 文件解析器"""

    # 必需的列名
    REQUIRED_COLUMNS = ['会议时间点', '产品组', '同步信息内容']

    def __init__(self, file_path: str):
        self.file_path = Path(file_path)
        self.error_message: Optional[str] = None

    def validate_file(self) -> bool:
        """验证文件格式"""
        if not self.file_path.exists():
            self.error_message = f"文件不存在: {self.file_path}"
            return False

        if not self.file_path.suffix.lower() in ['.xlsx', '.xls', '.csv']:
            self.error_message = f"不支持的文件格式: {self.file_path.suffix}，请使用 .xlsx 或 .xls"
            return False

        # 检查文件大小（最大 10MB）
        if self.file_path.stat().st_size > 10 * 1024 * 1024:
            self.error_message = "文件大小不能超过 10MB"
            return False

        return True

    def parse(self) -> Optional[List[ExcelRow]]:
        """
        解析 Excel 文件
        优先查找"本周内容"Sheet，否则使用第一个 Sheet
        """
        if not self.validate_file():
            return None

        try:
            # 读取 Excel 文件
            if self.file_path.suffix.lower() == '.csv':
                df = pd.read_csv(self.file_path)
            else:
                # 获取所有 Sheet 名称
                xl = pd.ExcelFile(self.file_path)
                sheet_names = xl.sheet_names

                # 优先查找"本周内容"Sheet
                target_sheet = '本周内容'
                if target_sheet not in sheet_names:
                    target_sheet = sheet_names[0]
                    print(f"[ExcelParser] 未找到'本周内容'Sheet，使用第一个 Sheet: {target_sheet}")

                df = pd.read_excel(self.file_path, sheet_name=target_sheet)

            # 验证列名
            if not self._validate_columns(df):
                return None

            # 转换为 ExcelRow 列表
            rows = self._convert_to_rows(df)

            print(f"[ExcelParser] 成功解析 {len(rows)} 条数据")
            return rows

        except Exception as e:
            self.error_message = f"解析失败: {str(e)}"
            return None

    def _validate_columns(self, df: pd.DataFrame) -> bool:
        """验证必需的列是否存在"""
        columns = df.columns.tolist()
        missing_columns = [col for col in self.REQUIRED_COLUMNS if col not in columns]

        if missing_columns:
            self.error_message = (
                f"Excel 列名不匹配，缺少必需列: {', '.join(missing_columns)}\n"
                f"当前列名: {', '.join(columns)}"
            )
            return False

        return True

    def _convert_to_rows(self, df: pd.DataFrame) -> List[ExcelRow]:
        """将 DataFrame 转换为 ExcelRow 列表"""
        rows = []

        for _, row in df.iterrows():
            # 处理 NaN 值
            time = str(row['会议时间点']) if pd.notna(row['会议时间点']) else ''
            product_group = str(row['产品组']) if pd.notna(row['产品组']) else ''
            content = str(row['同步信息内容']) if pd.notna(row['同步信息内容']) else ''

            # 跳过空行
            if not product_group.strip() and not content.strip():
                continue

            rows.append(ExcelRow(
                time=time.strip(),
                product_group=product_group.strip(),
                content=content.strip()
            ))

        return rows

    def get_error(self) -> Optional[str]:
        """获取错误信息"""
        return self.error_message


def parse_excel(file_path: str) -> Optional[List[ExcelRow]]:
    """
    便捷函数：解析 Excel 文件

    Args:
        file_path: Excel 文件路径

    Returns:
        ExcelRow 列表，解析失败返回 None
    """
    parser = ExcelParser(file_path)
    return parser.parse()


if __name__ == '__main__':
    # 测试代码
    import sys

    if len(sys.argv) < 2:
        print("用法: python excel_parser.py <excel_file>")
        sys.exit(1)

    rows = parse_excel(sys.argv[1])
    if rows:
        print(f"\n成功解析 {len(rows)} 条数据:\n")
        for i, row in enumerate(rows[:5], 1):
            print(f"{i}. [{row.product_group}] {row.time}")
            print(f"   内容: {row.content[:100]}...\n")
    else:
        print(f"解析失败: {parser.get_error()}")
