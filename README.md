

# DeepSeek-OCR-WebSite集成 DeepSeek-OCR 模型，提供多语言界面、实时流式识别、对象定位与取消控制等能力。
<img width="1540" height="913" alt="QQ_1761210498105" src="https://github.com/user-attachments/assets/5aa7db33-6c98-4701-b218-4a72b6e96a6f" />



</div>

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
| Node.js | 18+ |
| npm / pnpm | npm 9+（示例使用 npm） |
| GPU (建议) | NVIDIA / CUDA11+（可选） |

## 🚀 快速开始

### 1. 克隆项目

`bash
git clone https://github.com/<your-org>/DeepSeek-OCR-1.git
cd DeepSeek-OCR-1
`

### 2. 配置后端

`bash
# 创建虚拟环境（推荐）
python -m venv .venv
\\.venv\\Scripts\\activate # Windows

# 安装依赖
pip install -r requirements.txt

# 首次运行会自动下载/加载模型（耗时取决于网络）
python backend/main.py

# 默认监听地址： http://localhost:8000
`


> 说明：后端提供 REST 接口、SSE 流、任务取消 /api/ocr/cancel 等服务，并负责将识别结果写入 uploads/output。

### 3. 启动前端

cd frontend
npm install
npm run dev

# 默认开发端口： http://localhost:5173
`

前端会自动请求 http://localhost:8000 获取配置及流式数据，可在 .env 文件中自定义接口地址（如需部署到其他域名）。

### 4. 生产构建

`ash
npm run build
npm run preview # 预览打包结果
`

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

## 🧪 测试与验证

`ash
# 前端构建检查（示例）
npm run build --prefix frontend

# 根据需要补充单元测试 / E2E / Lint 任务
`

> 如接入 CI/CD，建议在流水线中增加前端 
pm run build 与后端单元测试脚本。

## 📁 运行目录说明

- uploads/input：上传文件存放位置。
- uploads/output：识别结果（文本/图片/Markdown）。
- ackend/logs：运行日志（如开启）。

## 🤝 贡献指南

1. Fork & clone 项目。
2. 创建特性分支 git checkout -b feature/xxx。
3. 提交变更并发起 Pull Request，简述目的与影响。
4. 在 PR 中附加相关截图或测试结果。

> 若需企业级定制或模型部署支持，请联系团队邮箱：support@example.com。

---

愿你在 DeepSeek-OCR 的世界里，探索图文理解的更多可能性！
