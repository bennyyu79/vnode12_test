# CollabBoard

一款类似 Excalidraw 的在线协作白板 MVP 应用。使用 Vite + React + TypeScript 构建，支持手绘、矩形、箭头、文本等多种绘图工具。

## 快速开始

```bash
# 克隆项目
git clone https://github.com/bennyyu79/vnode12_test.git
cd vnode12_test

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 功能特性

- **手绘工具**：自由绘制，平滑连线
- **矩形工具**：拖拽绘制，实时预览
- **箭头工具**：拖拽绘制，带箭头标识
- **文本工具**：点击输入，Enter 确认
- **元素操作**：选择、拖拽移动、删除
- **样式设置**：6 色面板 + 4 档粗细选择
- **撤销/重做**：Ctrl+Z / Ctrl+Shift+Z，最多 50 步
- **自动保存**：localStorage 自动持久化
- **PNG 导出**：一键导出为图片下载

## 技术栈

- **前端框架**：Vite + React + TypeScript
- **样式方案**：Tailwind CSS v4
- **状态管理**：Zustand
- **渲染引擎**：HTML5 Canvas API

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` | 重做 |
| `Delete` / `Backspace` | 删除选中元素 |
| `Escape` | 取消选择 |

## 项目结构

```
vnode12_test/
├── src/
│   ├── components/          # 组件
│   │   ├── Canvas.tsx       # 画布组件（核心）
│   │   └── Toolbar.tsx      # 工具栏组件
│   ├── store/               # 状态管理
│   │   ├── index.ts         # 导出
│   │   ├── types.ts         # 类型定义
│   │   └── useStore.ts      # Zustand 状态管理
│   ├── App.tsx              # 根组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── scripts/ralph/           # Ralph 自动开发系统
├── prd.json                 # PRD 文档
└── package.json
```

## 使用 Ralph 自动开发

本项目使用 Ralph 系统进行自动化开发。运行 Ralph：

```bash
# 使用 Claude Code 运行
./scripts/ralph/ralph.sh --tool claude 15

# 使用 Amp 运行（默认）
./scripts/ralph/ralph.sh 15
```

Ralph 会自动完成 `prd.json` 中定义的用户故事，每次迭代完成一个故事。

## 构建

```bash
# 类型检查
npx tsc --noEmit

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 分支

- `main`：主分支
- `ralph/mvp-whiteboard`：Ralph 自动开发的 MVP 白板功能

## 许可证

MIT
