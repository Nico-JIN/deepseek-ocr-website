<<<<<<< HEAD
# DeepSeek-OCR 智能识别平台

基于 DeepSeek-OCR 模型的 OCR 识别平台，集成 FastAPI 后端与 React 前端，提供实时流式识别、多语言界面、对象定位等功能。
=======


# DeepSeek-OCR-WebSite集成 DeepSeek-OCR 模型，提供多语言界面、实时流式识别、对象定位与取消控制等能力。
<img width="1540" height="913" alt="QQ_1761210498105" src="https://github.com/user-attachments/assets/5aa7db33-6c98-4701-b218-4a72b6e96a6f" />


>>>>>>> 2a36962a272ac14d3d36c49c27ed6bb7170ec9d9

## 📋 项目简介

<<<<<<< HEAD
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
=======
## 🎯 项目亮点
<img width="1609" height="912" alt="QQ_1761210214977" src="https://github.com/user-attachments/assets/94d99033-6a17-4bef-8188-3053270f8bb0" />
- **多格式识别**：支持 Markdown、结构化 OCR、自由识别、图表解析、对象定位等多种输出。
- **实时流式体验**：识别进度通过 SSE 实时推送，页面即时更新文本与缩略图。
- **任务控制**：支持一键取消正在运行的识别任务，前后端联动及时反馈。
- **结果管理**：识别完成可一键复制、导出文本或下载标注图片。
- **国际化界面**：内置中/英双语切换，界面提示与提示词同步翻译。
- **UI 优化**：暗色玻璃拟态风格、左右等高布局、自适应滚动与图片预览。

## 🏗️ 架构总览

`
DeepSeek-OCR-1/
├── backend/ # FastAPI 后端服务
│ ├── main.py # 入口：API、SSE、任务管理
│ ├── ocr_service.py # 业务层：调度模型、处理多页 PDF
│ └── ... # 日志、配置、模型适配等
├── frontend/ # React + Vite 前端应用
│ ├── src/App.jsx # 主界面，上传、识别、结果展示
│ ├── src/components/ # Header 等功能组件
│ └── ... # 样式、静态资源
├── deepseek-ocr/ # 模型适配与推理封装
├── assets/ # 演示资源
├── uploads/ # 运行时上传/输出目录
├── requirements.txt # 后端依赖
└── READ.md # 本文档
`

## 🔧 环境依赖

| 组件 | 版本建议 |
|-----------------|---------------------------|
| Python | 3.12+ |
>>>>>>> 2a36962a272ac14d3d36c49c27ed6bb7170ec9d9
| Node.js | 18+ |
| CUDA | 11+ (推荐) |
| GPU内存 | 8GB+ (推荐) |

## 📦 安装步骤

### 1. 克隆项目

<<<<<<< HEAD
```bash
git clone https://github.com/your-repo/DeepSeek-OCR-1.git
=======
`bash
git clone https://github.com/<your-org>/DeepSeek-OCR-1.git
>>>>>>> 2a36962a272ac14d3d36c49c27ed6bb7170ec9d9
cd DeepSeek-OCR-1
```

### 2. 安装后端依赖

<<<<<<< HEAD
```bash
# 安装 Python 依赖（根目录）
=======
`bash
# 创建虚拟环境（推荐）
python -m venv .venv
\\.venv\\Scripts\\activate # Windows

# 安装依赖
>>>>>>> 2a36962a272ac14d3d36c49c27ed6bb7170ec9d9
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

<<<<<<< HEAD
### 3. 安装前端依赖

```bash
=======

> 说明：后端提供 REST 接口、SSE 流、任务取消 /api/ocr/cancel 等服务，并负责将识别结果写入 uploads/output。

### 3. 启动前端

>>>>>>> 2a36962a272ac14d3d36c49c27ed6bb7170ec9d9
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

<<<<<<< HEAD
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
=======
## 📦 功能详解
<img width="714" height="386" alt="QQ_1761210304449" src="https://github.com/user-attachments/assets/338db538-2d0c-4140-bfd1-7cf1e263c7a2" />

- **文件上传**：支持拖拽或点击上传，自动生成图片/PDF 预览。
- **模式选择**：提供 Tiny/Base/Gundam 等模型规格，按需组合分辨率与性能。
  ![Uploading QQ_1761210265802.png…]()

- **输出格式**：
 - Markdown 文档
 - OCR 布局文本
 - 自由识别（无布局）
 - 图表解析
 - 对象定位（返回标注图片）
- **自定义提示词**：按格式自动判断是否必填，并在切换时重置无效提示词。

  
- **识别控制**：
 - SSE 流式更新文本/图片缩略图
 - 右上角可一键终止正在运行的任务
- **结果展示**：
 - 文本区支持滚动浏览、Markdown 渲染、复制、导出
 - 图像区支持放大预览、下载标注图片
- **国际化 & 设置**：Header 下拉菜单切换中/英文，系统提示同步翻译。
>>>>>>> 2a36962a272ac14d3d36c49c27ed6bb7170ec9d9

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

<<<<<<< HEAD
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
=======
> 若需企业级定制或模型部署支持，请联系团队邮箱：support@example.com。
>>>>>>> 2a36962a272ac14d3d36c49c27ed6bb7170ec9d9

---

💡 **提示：** 首次运行需要下载模型，请耐心等待。如有问题，请查看上方常见问题或提交 Issue。
