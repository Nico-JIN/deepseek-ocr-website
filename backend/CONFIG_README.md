# DeepSeek-OCR 配置说明

## 概述

本项目支持从多个来源加载 DeepSeek-OCR 模型：
- **Huggingface**: 从 Huggingface Hub 下载模型
- **ModelScope**: 从 ModelScope 下载模型（国内访问更快）
- **Local**: 使用本地已下载的模型

## 配置文件位置

配置文件位于：`backend/config.yaml`

## 配置项说明

### 1. 模型配置 (model)

#### 模型来源 (source)
```yaml
model:
  source: "local"  # 可选: "huggingface" | "modelscope" | "local"
```

#### Huggingface 配置
```yaml
huggingface:
  model_name: "deepseek-ai/deepseek-ocr"
  # 可选：使用镜像加速（国内用户推荐）
  mirror: "https://hf-mirror.com"
```

**使用示例**:
```yaml
model:
  source: "huggingface"
  huggingface:
    model_name: "deepseek-ai/deepseek-ocr"
    mirror: "https://hf-mirror.com"  # 国内加速
```

#### ModelScope 配置
```yaml
modelscope:
  model_name: "deepseek-ai/deepseek-ocr"
```

**使用示例**:
```yaml
model:
  source: "modelscope"
  modelscope:
    model_name: "deepseek-ai/deepseek-ocr"
```

**注意**: 使用 ModelScope 需要先安装 modelscope 库：
```bash
pip install modelscope
```

#### 本地模型配置
```yaml
local:
  model_path: "D:\\models\\deepseek-ocr\\"  # Windows路径
  # model_path: "/path/to/models/deepseek-ocr/"  # Linux/Mac路径
```

**使用示例**:
```yaml
model:
  source: "local"
  local:
    model_path: "D:\\models\\deepseek-ocr\\"
```

### 2. 模型加载参数 (load_params)

```yaml
load_params:
  # 是否信任远程代码
  trust_remote_code: true
  
  # 是否使用 safetensors 格式
  use_safetensors: true
  
  # 注意力实现方式
  attn_implementation: "flash_attention_2"  # 或 "eager"
  
  # 数据类型
  torch_dtype: "bfloat16"  # 可选: "float32" | "float16" | "bfloat16"
  
  # 设备
  device: "cuda"  # 可选: "cuda" | "cpu"
  
  # GPU 设备ID（多卡时使用）
  cuda_visible_devices: "0"  # 单卡: "0", 多卡: "0,1"
```

#### 参数说明：

- **torch_dtype**: 
  - `bfloat16`: 推荐，平衡精度和显存
  - `float16`: 更省显存，但可能影响精度
  - `float32`: 最高精度，但显存占用大

- **device**:
  - `cuda`: 使用 GPU（推荐）
  - `cpu`: 使用 CPU（速度较慢）

- **cuda_visible_devices**:
  - 单卡：`"0"`
  - 多卡：`"0,1"` 或 `"0,1,2,3"`

### 3. 服务配置 (service)

```yaml
service:
  host: "0.0.0.0"
  port: 8000
  
  upload:
    max_file_size_mb: 100
    allowed_extensions: [".jpg", ".jpeg", ".png", ".pdf", ".bmp", ".tiff", ".webp"]
  
  timeout:
    default_seconds: 300
    per_page_seconds: 60
```

## 配置示例

### 示例 1: 使用本地模型（默认）

```yaml
model:
  source: "local"
  local:
    model_path: "D:\\models\\deepseek-ocr\\"
  load_params:
    trust_remote_code: true
    use_safetensors: true
    attn_implementation: "flash_attention_2"
    torch_dtype: "bfloat16"
    device: "cuda"
    cuda_visible_devices: "0"
```

### 示例 2: 使用 Huggingface（带镜像加速）

```yaml
model:
  source: "huggingface"
  huggingface:
    model_name: "deepseek-ai/deepseek-ocr"
    mirror: "https://hf-mirror.com"
  load_params:
    trust_remote_code: true
    use_safetensors: true
    attn_implementation: "flash_attention_2"
    torch_dtype: "bfloat16"
    device: "cuda"
    cuda_visible_devices: "0"
```

### 示例 3: 使用 ModelScope

```yaml
model:
  source: "modelscope"
  modelscope:
    model_name: "deepseek-ai/deepseek-ocr"
  load_params:
    trust_remote_code: true
    use_safetensors: true
    attn_implementation: "flash_attention_2"
    torch_dtype: "bfloat16"
    device: "cuda"
    cuda_visible_devices: "0"
```

### 示例 4: CPU 模式

```yaml
model:
  source: "local"
  local:
    model_path: "D:\\models\\deepseek-ocr\\"
  load_params:
    trust_remote_code: true
    use_safetensors: true
    attn_implementation: "eager"  # CPU不支持flash_attention_2
    torch_dtype: "float32"
    device: "cpu"
    cuda_visible_devices: "0"
```

## 切换模型源

1. 编辑 `backend/config.yaml`
2. 修改 `model.source` 为目标源
3. 配置对应源的参数
4. 重启后端服务

```bash
cd backend
python main.py
```

## 注意事项

1. **首次使用 Huggingface/ModelScope**: 第一次运行会自动下载模型，需要一定时间
2. **ModelScope 依赖**: 需要安装 `pip install modelscope`
3. **显存要求**: 
   - `bfloat16`: 约需 24GB 显存
   - `float16`: 约需 20GB 显存
   - 如果显存不足，考虑使用 CPU 模式（速度较慢）
4. **路径格式**: 
   - Windows: 使用双反斜杠 `\\` 或单正斜杠 `/`
   - Linux/Mac: 使用单正斜杠 `/`

## 前端优化

前端现在采用智能健康检查策略：
- 启动时检查一次后端连接
- 用户空闲 5 分钟后自动检查
- 提交任务前主动检查
- 避免频繁的定时轮询，节省资源

## 故障排查

### 问题：模型加载失败
- 检查配置文件格式是否正确
- 检查模型路径是否存在（本地模式）
- 检查网络连接（在线模式）
- 查看控制台错误信息

### 问题：显存不足
- 尝试降低 `torch_dtype` 为 `float16`
- 减小 `image_size` 参数
- 使用 CPU 模式

### 问题：ModelScope 导入错误
```bash
pip install modelscope
```

## 更新日志

- **2025-10-29**: 
  - 添加多模型源支持（Huggingface/ModelScope/Local）
  - 支持配置文件加载
  - 优化前端健康检查策略
