# DeepSeek-OCR 智能识别平台

基于 DeepSeek-OCR 模型的 OCR 识别平台，集成 FastAPI 后端与 React 前端，提供实时流式识别、多语言界面、对象定位等功能。

## 📋 项目简介

一个开箱即用的 OCR 识别平台，支持：
- ✨ 多格式输出：Markdown、结构化 OCR、图表解析、对象定位
- 🚀 实时流式识别，进度实时推送
- 🌍 中英双语界面切换
- 🎯 任务取消控制
- 📄 支持图片与 PDF 文档识别

## 🔧 环境要求

| 组件 | 版本 |
|------|------|
| Python | 3.9+ |
| Node.js | 18+ |
| CUDA | 11+ (推荐) |
| GPU内存 | 8GB+ (推荐) |

## 📦 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/DeepSeek-OCR-1.git
cd DeepSeek-OCR-1
```

### 2. 安装后端依赖

```bash
# 安装 Python 依赖（根目录）
pip install -r requirements.txt

# 进入后端目录，安装后端特定依赖
cd backend
pip install -r requirements.txt
cd ..
```

**主要依赖包：**
- fastapi
- uvicorn
- torch
- transformers
- PyMuPDF
- Pillow

### 3. 安装前端依赖

```bash
cd frontend
npm install
cd ..
```

## 🤖 模型下载

模型存放位置：`DeepSeek-OCR-master/DeepSeek-OCR-hf/`

**方式一：手动下载**
1. 访问 [DeepSeek-OCR HuggingFace](https://huggingface.co/deepseek-ai/deepseek-ocr)
2. 下载模型文件到 `DeepSeek-OCR-master/DeepSeek-OCR-hf/` 目录

**方式二：自动下载**
- 首次启动后端时，程序会自动从 HuggingFace 下载模型（需要网络连接）
- 下载时间取决于网络速度（模型约几GB）

## 🚀 运行步骤

### 启动后端

**Windows:**
```bash
cd backend
start.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x start.sh
./start.sh
```

**或手动启动:**
```bash
cd backend
python main.py
```

后端默认运行在：`http://localhost:8000`

### 启动前端

**Windows:**
```bash
cd frontend
start.bat
```

**Linux/Mac:**
```bash
cd frontend
chmod +x start.sh
./start.sh
```

**或手动启动:**
```bash
cd frontend
npm run dev
```

前端默认运行在：`http://localhost:5173`

## 🎨 使用说明

1. 打开浏览器访问 `http://localhost:5173`
2. 上传图片或 PDF 文件
3. 选择识别模式和输出格式
4. 点击"开始识别"，实时查看识别结果
5. 识别完成后可复制、导出或下载结果

## ⚠️ 常见问题

### 1. 模型加载失败
**问题：** 启动后端时提示模型文件找不到  
**解决：**
- 检查 `DeepSeek-OCR-master/DeepSeek-OCR-hf/` 目录是否存在模型文件
- 确保网络连接正常，让程序自动下载模型
- 手动下载模型到指定目录

### 2. CUDA 内存不足
**问题：** 运行时报 "CUDA out of memory"  
**解决：**
- 降低输入图片分辨率
- 使用更小的模型规格
- 关闭其他占用 GPU 的程序
- 使用 CPU 模式运行（修改 `backend/ocr_service.py` 中的设备设置）

### 3. 端口已被占用
**问题：** 启动时提示端口 8000 或 5173 被占用  
**解决：**
```bash
# Windows 查找占用端口的进程
netstat -ano | findstr :8000
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -i :8000
kill -9 <进程ID>
```
或修改配置文件更换端口

### 4. 前端无法连接后端
**问题：** 前端显示连接错误  
**解决：**
- 确认后端已成功启动
- 检查防火墙设置
- 确认 `frontend/.env` 中的 API 地址配置正确

### 5. 依赖安装失败
**问题：** pip install 时报错  
**解决：**
```bash
# 使用清华镜像源
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 升级 pip
python -m pip install --upgrade pip
```

### 6. Node.js 依赖安装慢
**问题：** npm install 很慢或失败  
**解决：**
```bash
# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com

# 或使用 cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

## 📁 项目结构

```
DeepSeek-OCR-1/
├── backend/                 # FastAPI 后端
│   ├── main.py             # API 入口
│   ├── ocr_service.py      # OCR 服务
│   ├── start.bat           # Windows 启动脚本
│   └── start.sh            # Linux/Mac 启动脚本
├── frontend/               # React 前端
│   ├── src/                # 源代码
│   ├── start.bat           # Windows 启动脚本
│   └── start.sh            # Linux/Mac 启动脚本
├── DeepSeek-OCR-master/    # 模型文件目录
│   └── DeepSeek-OCR-hf/    # HuggingFace 模型
├── uploads/                # 上传文件目录
├── requirements.txt        # Python 依赖
└── README.md               # 项目文档
```

## 📄 许可证

详见 [LICENSE](./LICENSE) 文件

---

💡 **提示：** 首次运行需要下载模型，请耐心等待。如有问题，请查看上方常见问题或提交 Issue。
