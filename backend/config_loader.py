"""配置文件加载器"""
import yaml
import os
from pathlib import Path
from typing import Dict, Any, Optional

class ConfigLoader:
    """配置加载器类"""
    
    def __init__(self, config_path: Optional[str] = None):
        """初始化配置加载器
        
        Args:
            config_path: 配置文件路径，默认为 backend/config.yaml
        """
        if config_path is None:
            config_path = Path(__file__).parent / "config.yaml"
        
        self.config_path = Path(config_path)
        self._config: Dict[str, Any] = {}
        self.load()
    
    def load(self) -> None:
        """加载配置文件"""
        if not self.config_path.exists():
            raise FileNotFoundError(f"配置文件不存在: {self.config_path}")
        
        with open(self.config_path, 'r', encoding='utf-8') as f:
            self._config = yaml.safe_load(f) or {}
        
        print(f"✅ 配置文件已加载: {self.config_path}")
    
    def get(self, key_path: str, default: Any = None) -> Any:
        """获取配置值
        
        Args:
            key_path: 配置键路径，使用点号分隔，如 "model.source"
            default: 默认值
            
        Returns:
            配置值
        """
        keys = key_path.split('.')
        value = self._config
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        
        return value
    
    def get_model_config(self) -> Dict[str, Any]:
        """获取模型配置
        
        Returns:
            包含模型源、路径和加载参数的字典
        """
        source = self.get('model.source', 'local')
        
        config = {
            'source': source,
            'load_params': self.get('model.load_params', {})
        }
        
        if source == 'huggingface':
            config['model_name'] = self.get('model.huggingface.model_name')
            config['mirror'] = self.get('model.huggingface.mirror')
        elif source == 'modelscope':
            config['model_name'] = self.get('model.modelscope.model_name')
        elif source == 'local':
            config['model_path'] = self.get('model.local.model_path')
        else:
            raise ValueError(f"不支持的模型源: {source}")
        
        return config
    
    def get_service_config(self) -> Dict[str, Any]:
        """获取服务配置"""
        return {
            'host': self.get('service.host', '0.0.0.0'),
            'port': self.get('service.port', 8000),
            'upload': self.get('service.upload', {}),
            'timeout': self.get('service.timeout', {})
        }

# 全局配置实例
_config_instance: Optional[ConfigLoader] = None

def get_config() -> ConfigLoader:
    """获取全局配置实例"""
    global _config_instance
    if _config_instance is None:
        _config_instance = ConfigLoader()
    return _config_instance

def reload_config() -> ConfigLoader:
    """重新加载配置"""
    global _config_instance
    _config_instance = ConfigLoader()
    return _config_instance
