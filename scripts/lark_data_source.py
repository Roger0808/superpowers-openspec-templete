#!/usr/bin/env python3
"""
飞书数据源模块
从飞书电子表格读取周报数据，支持自动获取最新日期内容
"""

import subprocess
import json
import re
from typing import List, Optional, Dict, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta


@dataclass
class LarkRow:
    """从飞书读取的行数据"""
    time: str
    product_group: str
    content: str
    module: str = ""
    status: str = ""


@dataclass
class SheetInfo:
    """Sheet 信息"""
    sheet_id: str
    title: str
    row_count: int


class LarkDataSource:
    """飞书数据源"""

    SHEET_MAP = {
        'sales': 'bee36a',
        'erp': 'cYzkpc',
        'wms': 'am9zMz',
    }

    GROUP_NAMES = {
        'bee36a': 'Sales组',
        'cYzkpc': 'ERP组',
        'am9zMz': 'WMS组',
    }

    def __init__(self, spreadsheet_token: str, sheet_ids: Optional[List[str]] = None):
        self.spreadsheet_token = spreadsheet_token
        self.sheet_ids = sheet_ids or list(self.SHEET_MAP.values())

    def fetch_data(
        self,
        product_groups: Optional[List[str]] = None,
        fetch_latest_only: bool = True
    ) -> List[LarkRow]:
        """
        从飞书获取数据

        Args:
            product_groups: 要获取的产品组列表，默认 SALES组、ERP组、WMS组
            fetch_latest_only: 是否只获取最新日期的数据

        Returns:
            LarkRow 列表
        """
        groups_to_fetch = self._parse_groups(product_groups)

        all_rows = []
        latest_date = None

        for sheet_id in groups_to_fetch:
            rows, sheet_date = self._fetch_from_sheet(sheet_id)
            if rows:
                all_rows.extend(rows)
                if latest_date is None or sheet_date > latest_date:
                    latest_date = sheet_date

        if not all_rows:
            return []

        if fetch_latest_only and latest_date:
            all_rows = self._filter_by_date(all_rows, latest_date)

        return all_rows

    def _parse_groups(self, groups: Optional[List[str]]) -> List[str]:
        """解析产品组列表，返回 sheet_id 列表"""
        if not groups:
            return list(self.GROUP_NAMES.keys())

        result = []
        for g in groups:
            g_lower = g.lower().replace('组', '')
            if g_lower in self.SHEET_MAP:
                result.append(self.SHEET_MAP[g_lower])
            else:
                for sheet_id, title in self.GROUP_NAMES.items():
                    if g in title or g_lower in title.lower():
                        result.append(sheet_id)
                        break

        return result if result else list(self.SHEET_MAP.values())

    def _fetch_from_sheet(self, sheet_id: str) -> Tuple[List[LarkRow], Optional[str]]:
        """从单个 Sheet 读取数据"""
        try:
            result = subprocess.run(
                [
                    'npx', 'lark-cli', 'sheets', '+read',
                    '--spreadsheet-token', self.spreadsheet_token,
                    '--sheet-id', sheet_id,
                    '--as', 'user'
                ],
                capture_output=True,
                text=True,
                timeout=60
            )

            if result.returncode != 0:
                print(f"[LarkDataSource] 读取 Sheet {sheet_id} 失败: {result.stderr}")
                return [], None

            output = result.stdout
            if not output.strip().startswith('{'):
                for line in output.split('\n'):
                    if line.strip().startswith('{'):
                        output = line
                        break

            try:
                data = json.loads(output)
            except json.JSONDecodeError:
                print(f"[LarkDataSource] JSON 解析失败，输出: {output[:200]}")
                return [], None

            if not data.get('ok'):
                print(f"[LarkDataSource] API 返回错误: {data}")
                return [], None

            values = data.get('data', {}).get('valueRange', {}).get('values', [])
            group_name = self.GROUP_NAMES.get(sheet_id, sheet_id)

            return self._parse_values(values, sheet_id, group_name)

        except subprocess.TimeoutExpired:
            print(f"[LarkDataSource] 读取 Sheet {sheet_id} 超时")
            return [], None
        except Exception as e:
            print(f"[LarkDataSource] 读取 Sheet {sheet_id} 异常: {e}")
            return [], None

    def _parse_values(
        self,
        values: List[List[Any]],
        sheet_id: str,
        group_name: str
    ) -> Tuple[List[LarkRow], Optional[str]]:
        """解析 Sheet 数据"""
        if not values or len(values) < 2:
            return [], None

        rows = []
        latest_report_date = None
        current_date = None

        for i in range(2, len(values)):
            row = values[i]
            if not row or len(row) < 2:
                continue

            date_val = row[0] if len(row) > 0 else None
            module = str(row[1]).strip() if len(row) > 1 and row[1] else ""

            if isinstance(date_val, (int, float)):
                current_date = self._excel_date_to_string(date_val)
                if latest_report_date is None or current_date > latest_report_date:
                    latest_report_date = current_date
            elif isinstance(date_val, str) and date_val:
                current_date = date_val
                if latest_report_date is None or current_date > latest_report_date:
                    latest_report_date = current_date

            for col_idx in [2, 3, 4]:
                if len(row) > col_idx and row[col_idx]:
                    content = self._clean_cell_content(row[col_idx])
                    if content and content not in ['None', 'nan', '']:
                        status = self._get_status_from_column(col_idx)
                        rows.append(LarkRow(
                            time=current_date or "",
                            product_group=group_name,
                            content=content,
                            module=module,
                            status=status
                        ))

        return rows, latest_report_date

    def _clean_cell_content(self, content: Any) -> str:
        """清理单元格内容，过滤富文本格式"""
        if isinstance(content, str):
            return content.strip()
        elif isinstance(content, list):
            text_parts = []
            for item in content:
                if isinstance(item, dict):
                    text = item.get('text', '')
                    if text:
                        text_parts.append(str(text))
                elif isinstance(item, str):
                    text_parts.append(item)
            return ''.join(text_parts).strip()
        return str(content) if content else ""

    def _get_status_from_column(self, col_idx: int) -> str:
        """根据列索引获取状态"""
        status_map = {
            2: "已完成",
            3: "开发中",
            4: "调研中"
        }
        return status_map.get(col_idx, "")

    def _excel_date_to_string(self, serial_number: float) -> str:
        """将 Excel 日期序列号转换为日期字符串"""
        try:
            if serial_number > 60:
                serial_number -= 1
            delta = timedelta(days=int(serial_number) - 2)
            excel_epoch = datetime(1899, 12, 30)
            dt = excel_epoch + delta
            return dt.strftime('%Y-%m-%d')
        except:
            return str(serial_number)

    def _filter_by_date(self, rows: List[LarkRow], target_date: str) -> List[LarkRow]:
        """按日期过滤，只保留目标日期的记录"""
        return [r for r in rows if r.time == target_date]

    def get_latest_date(self, rows: List[LarkRow]) -> Optional[str]:
        """获取最新日期"""
        dates = [r.time for r in rows if r.time]
        return max(dates) if dates else None

    def get_sheet_info(self, sheet_id: str) -> Optional[SheetInfo]:
        """获取 Sheet 信息"""
        try:
            result = subprocess.run(
                [
                    'npx', 'lark-cli', 'sheets', '+info',
                    '--spreadsheet-token', self.spreadsheet_token,
                    '--as', 'user'
                ],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode != 0:
                return None

            output = result.stdout
            if not output.strip().startswith('{'):
                for line in output.split('\n'):
                    if line.strip().startswith('{'):
                        output = line
                        break

            data = json.loads(output)
            sheets = data.get('data', {}).get('sheets', {}).get('sheets', [])

            for sheet in sheets:
                if sheet.get('sheet_id') == sheet_id:
                    return SheetInfo(
                        sheet_id=sheet_id,
                        title=sheet.get('title', ''),
                        row_count=sheet.get('grid_properties', {}).get('row_count', 0)
                    )

            return None
        except:
            return None

    def list_sheets(self) -> List[SheetInfo]:
        """列出所有 Sheet"""
        try:
            result = subprocess.run(
                [
                    'npx', 'lark-cli', 'sheets', '+info',
                    '--spreadsheet-token', self.spreadsheet_token,
                    '--as', 'user'
                ],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode != 0:
                return []

            output = result.stdout
            if not output.strip().startswith('{'):
                for line in output.split('\n'):
                    if line.strip().startswith('{'):
                        output = line
                        break

            data = json.loads(output)
            sheets = data.get('data', {}).get('sheets', {}).get('sheets', [])

            return [
                SheetInfo(
                    sheet_id=s.get('sheet_id', ''),
                    title=s.get('title', ''),
                    row_count=s.get('grid_properties', {}).get('row_count', 0)
                )
                for s in sheets
                if s.get('sheet_id')
            ]
        except:
            return []


def fetch_from_lark(
    spreadsheet_token: str,
    sheet_ids: Optional[List[str]] = None,
    product_groups: Optional[List[str]] = None,
    fetch_latest_only: bool = True
) -> List[LarkRow]:
    """
    便捷函数：从飞书获取数据

    Args:
        spreadsheet_token: 电子表格 token
        sheet_ids: Sheet ID 列表
        product_groups: 产品组列表
        fetch_latest_only: 是否只获取最新日期

    Returns:
        LarkRow 列表
    """
    source = LarkDataSource(spreadsheet_token, sheet_ids)
    return source.fetch_data(product_groups, fetch_latest_only)


def parse_wiki_url(url: str) -> Tuple[str, Optional[str]]:
    """
    从飞书 Wiki URL 解析 spreadsheet token 和 sheet id

    Args:
        url: 飞书 Wiki URL

    Returns:
        (spreadsheet_token, sheet_id) 元组
    """
    sheet_id = None

    sheet_match = re.search(r'sheet=([a-zA-Z0-9]+)', url)
    if sheet_match:
        sheet_id = sheet_match.group(1)

    token_match = re.search(r'/wiki/([a-zA-Z0-9]+)', url)
    if not token_match:
        token_match = re.search(r'/sheets/([a-zA-Z0-9]+)', url)

    if token_match:
        wiki_token = token_match.group(1)
        try:
            result = subprocess.run(
                [
                    'npx', 'lark-cli', 'wiki', 'spaces', 'get_node',
                    '--params', f'{{"token":"{wiki_token}"}}',
                    '--as', 'user'
                ],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                output = result.stdout
                if not output.strip().startswith('{'):
                    for line in output.split('\n'):
                        if line.strip().startswith('{'):
                            output = line
                            break
                data = json.loads(output)
                node = data.get('data', {}).get('node', {})
                obj_token = node.get('obj_token')
                if obj_token:
                    return obj_token, sheet_id
        except:
            pass

    return wiki_token or "", sheet_id


if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("用法: python lark_data_source.py <spreadsheet_token> [sheet_ids...]")
        sys.exit(1)

    token = sys.argv[1]
    sheet_ids = sys.argv[2:] if len(sys.argv) > 2 else None

    source = LarkDataSource(token, sheet_ids)

    print("=" * 60)
    print("飞书数据源测试")
    print("=" * 60)

    print("\n[1] 列出所有 Sheet:")
    sheets = source.list_sheets()
    for s in sheets:
        print(f"  - {s.title} ({s.sheet_id}): {s.row_count} 行")

    print("\n[2] 获取数据（最新日期）:")
    rows = source.fetch_data(fetch_latest_only=True)

    if rows:
        latest_date = source.get_latest_date(rows)
        print(f"  最新日期: {latest_date}")
        print(f"  共 {len(rows)} 条记录")

        print("\n[3] 按产品组统计:")
        from collections import Counter
        groups = Counter(r.product_group for r in rows)
        for g, c in groups.items():
            print(f"  - {g}: {c} 条")
    else:
        print("  无数据")

    print("=" * 60)
