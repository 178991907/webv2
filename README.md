# 英语全科启蒙导航 (Worker 究极对齐版) 🚀

这是一个专为“英语全科启蒙”设计的门户导航网站，现已全面升级为 **Cloudflare Worker + 边缘计算** 架构。

## ✨ 核心特性

- **⚡ 边缘渲染 (SSR)**：全站逻辑集成在 `_worker.js` 中，在全球边缘节点瞬间加载，无需传统的 Node.js 服务器。
- **📦 KV 云持久化**：使用 Cloudflare KV 存储数据。读性能极强，摆脱对传统 SQL 数据库的依赖。
- **🎨 顶级多维视觉系统**：
  - **5 套外观模式**：支持玻璃拟态 (Glassmorphism)、柔和纸张 (Paper)、极简专业 (Minimal)、亮色与暗色。
  - **6 套品牌配色**：内置经典蓝、清新绿、极客紫、活力橙、樱花粉、深空灰 6 套全域调色方案。
  - **CSS 变量联动**：所有的视觉效果均通过 Worker 内部集成的样式引擎动态注入。
- **🛠️ 全功能 Admin SPA**：
  - **路径**：`/admin` (受 `ADMIN_PASSWORD` 保护)。
  - **后台管理**：支持分类的增删改及排序、链接的增删改及物理排序、网站设置（标题/Logo/版权/搜索开关）的实时保存。
- **🔍 高效检索**：主页内置前端实时搜索过滤，毫秒级响应。

---

## 🛠️ 技术栈

- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Storage**: [Cloudflare KV](https://developers.cloudflare.com/kv/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Visuals**: CSS Variables + HTML Template Literals

---

## 🚀 快速开始

### 1. 本地预览
确保您已安装 Node.js：
```bash
# 运行本地开发环境
npx wrangler dev _worker.js --port 9003 --persist-to .wrangler/state/v3/kv
```
访问 `http://localhost:9003` 即可看到效果。

### 2. 部署至 Cloudflare
请确保您的 `wrangler.toml` 中 KV 绑定名名为 `DB` 或 `KV`：
```toml
[[kv_namespaces]]
binding = "KV"   # 或 "DB"
id = "您的-KV-空间-ID"
```
执行发布：
```bash
npx wrangler deploy
```

---

## ⚙️ 环境变量与数据恢复

| 变量名 | 说明 | 默认值 |
| :--- | :--- | :--- |
| `ADMIN_PASSWORD` | 管理后台密码 | `admin` |
| `DB` / `KV` | KV 空间绑定名 | 必须设置 |

### 数据同步 (Data Sync)
1. 访问 `/admin` 并登录。
2. 点击 **“内容同步”** 选项卡。
3. 点击 **“从迁移文件导入数据”**，系统会自动读取本地 `migration-data.json` 并覆盖到云端的 KV 存储中。

---

## 📋 目录架构
- `_worker.js`: **[核心]** 集成了路由、鉴权、渲染及管理逻辑的单文件。
- `wrangler.toml`: Cloudflare 部署配置文件。
- `migration-data.json`: 原始导出数据，用于快速初始化内容。

---
*Created with ❤️ for All-Subject English Enlightenment*
