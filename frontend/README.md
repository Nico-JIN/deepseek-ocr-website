# DeepSeek-OCR 前端

## 🎨 UI预览模式

即使不启动后端服务，也可以预览和体验前端界面！

### 快速启动

```bash
# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev

# 或使用启动脚本
start.bat  # Windows
./start.sh # Linux/Mac
```

浏览器访问：**http://localhost:3000**

### 预览模式说明

- ✅ **完整UI展示** - 所有界面元素正常显示
- ✅ **交互体验** - 可以选择文件、切换模式和格式
- ✅ **状态指示** - 右上角显示"UI预览模式"
- ❌ **OCR功能** - 需要启动后端才能使用

### 状态指示

界面右上角会显示当前状态：
- 🟢 **后端已连接** - 可以使用所有功能
- 🟡 **UI预览模式** - 仅用于UI预览

### 完整功能体验

如需体验完整的OCR功能，请先启动后端服务：

```bash
# 在另一个终端
cd ../backend
start.bat  # Windows
./start.sh # Linux/Mac
```

后端启动后，前端会自动检测并切换到"后端已连接"状态。

## 🛠️ 技术栈

- **React 18** - UI框架
- **Vite** - 构建工具
- **TailwindCSS** - 样式框架
- **Axios** - HTTP客户端
- **react-markdown** - Markdown渲染
- **react-dropzone** - 文件上传
- **lucide-react** - 图标库

## 📦 构建生产版本

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

## 🎯 功能特性

### UI组件
- **Header** - 页面头部，含状态指示器
- **FileUpload** - 文件拖拽上传
- **ConfigPanel** - 模式和格式配置
- **ResultDisplay** - 结果展示（支持Markdown）
- **LoadingSpinner** - 加载动画

### 设计特点
- 🎨 渐变背景动画
- 🪟 毛玻璃效果
- 📱 响应式设计
- ✨ 流畅交互动画
- 🌙 深色主题

## 🔧 配置

### 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=DeepSeek-OCR Experience
VITE_APP_VERSION=1.0.0
```

### Vite配置

`vite.config.js` 已配置API代理：

```js
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true
    }
  }
}
```

## 📖 项目结构

```
frontend/
├── src/
│   ├── components/      # React组件
│   │   ├── Header.jsx
│   │   ├── FileUpload.jsx
│   │   ├── ConfigPanel.jsx
│   │   ├── ResultDisplay.jsx
│   │   └── LoadingSpinner.jsx
│   ├── App.jsx         # 主应用
│   ├── main.jsx        # 入口
│   └── index.css       # 全局样式
├── public/             # 静态资源
├── index.html          # HTML模板
├── package.json        # 依赖配置
├── vite.config.js      # Vite配置
└── tailwind.config.js  # TailwindCSS配置
```

## 🐛 常见问题

**Q: 界面显示不正常？**
A: 确保已运行 `npm install` 安装所有依赖

**Q: 端口被占用？**
A: 修改 `vite.config.js` 中的 `port` 配置

**Q: 样式没有生效？**
A: 检查 `tailwind.config.js` 和 `postcss.config.js` 配置

## 📝 开发建议

1. **使用热重载** - Vite提供快速的热重载体验
2. **检查控制台** - 查看后端连接状态和错误信息
3. **响应式测试** - 使用浏览器开发者工具测试不同屏幕尺寸

---

**享受开发！** 🚀
