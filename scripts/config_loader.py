#!/usr/bin/env python3
"""
配置文件加载模块
支持从 YAML 配置文件和环境变量读取配置
"""

import os
import yaml
from pathlib import Path
from typing import Optional, Dict, Any


class Config:
    """配置管理类"""

    def __init__(self):
        self.config_file = self._get_config_file_path()
        self._config = self._load_config()

    def _get_config_file_path(self) -> Path:
        """获取配置文件路径"""
        # 首先检查环境变量
        env_path = os.environ.get('WEEKLY_REPORT_CONFIG')
        if env_path:
            return Path(env_path)

        # 检查多个可能的配置文件路径
        possible_paths = [
            # 1. 当前工作目录
            Path.cwd() / 'config.yaml',
            # 2. scripts 目录的父目录
            Path(__file__).parent.parent / 'config.yaml',
            # 3. Skill 目录（~/.trae-cn/skills/weekly-report-python）
            Path.home() / '.trae-cn' / 'skills' / 'weekly-report-python' / 'config.yaml',
            # 4. Workbuddy 目录（~/.workbuddy/skills/weekly-report-python）
            Path.home() / '.workbuddy' / 'skills' / 'weekly-report-python' / 'config.yaml',
            # 5. scripts 目录下
            Path(__file__).parent / 'config.yaml',
        ]

        for path in possible_paths:
            if path.exists():
                print(f"[Config] 找到配置文件: {path}")
                return path

        # 默认返回第一个路径（即使不存在）
        return possible_paths[1]

    def _load_config(self) -> Dict[str, Any]:
        """加载配置文件"""
        if not self.config_file.exists():
            return self._default_config()

        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f) or {}
            return config
        except Exception as e:
            print(f"[Config] 加载配置文件失败: {e}")
            return self._default_config()

    def _default_config(self) -> Dict[str, Any]:
        """默认配置"""
        return {
            'minimax': {
                'api_key': '',
                'base_url': 'https://api.minimaxi.com/anthropic',
                'model': 'MiniMax-M2.7-highspeed'
            },
            'report': {
                'default_title': '产品周报',
                'default_output_dir': '.'
            }
        }

    def get(self, key: str, default: Any = None) -> Any:
        """
        获取配置项，支持点号分隔的路径
        例如: get('minimax.api_key')
        """
        keys = key.split('.')
        value = self._config

        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default

        return value

    def get_api_key(self) -> Optional[str]:
        """
        获取 API Key，优先级：
        1. 环境变量 MINIMAX_API_KEY
        2. 配置文件 minimax.api_key
        3. 环境变量 ANTHROPIC_API_KEY
        """
        # 环境变量优先级最高
        env_key = os.environ.get('MINIMAX_API_KEY')
        if env_key:
            return env_key

        # 配置文件
        config_key = self.get('minimax.api_key')
        if config_key:
            return config_key

        # 兼容 Anthropic 环境变量
        return os.environ.get('ANTHROPIC_API_KEY')

    def get_base_url(self) -> str:
        """获取 API Base URL"""
        return self.get('minimax.base_url', 'https://api.minimaxi.com/anthropic')

    def get_model(self) -> str:
        """获取模型名称"""
        return self.get('minimax.model', 'MiniMax-M2.7-highspeed')

    def get_default_title(self) -> str:
        """获取默认周报标题"""
        return self.get('report.default_title', '产品周报')

    def get_default_output_dir(self) -> str:
        """获取默认输出目录"""
        return self.get('report.default_output_dir', '.')

    def save(self):
        """保存配置到文件"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                yaml.dump(self._config, f, allow_unicode=True, default_flow_style=False)
            return True
        except Exception as e:
            print(f"[Config] 保存配置文件失败: {e}")
            return False

    def set(self, key: str, value: Any):
        """
        设置配置项，支持点号分隔的路径
        例如: set('minimax.api_key', 'xxx')
        """
        keys = key.split('.')
        config = self._config

        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]

        config[keys[-1]] = value


# 全局配置实例
_config_instance: Optional[Config] = None


def get_config() -> Config:
    """获取全局配置实例"""
    global _config_instance
    if _config_instance is None:
        _config_instance = Config()
    return _config_instance


def reload_config():
    """重新加载配置"""
    global _config_instance
    _config_instance = Config()


if __name__ == '__main__':
    # 测试配置加载
    config = get_config()
    print(f"配置文件路径: {config.config_file}")
    print(f"API Key: {'已配置' if config.get_api_key() else '未配置'}")
    print(f"Base URL: {config.get_base_url()}")
    print(f"Model: {config.get_model()}")
