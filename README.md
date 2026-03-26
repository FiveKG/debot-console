# Debot Console

Debot 系统前端仪表盘。信号列表、交易记录、持仓监控、叙事追踪、配置管理。

## 技术栈

- **Next.js** — React 全栈框架
- **Tailwind CSS + shadcn/ui** — UI 组件
- **TypeScript** — 类型安全

## 安装

```bash
npm install
```

## 运行

```bash
# 开发
npm run dev

# 构建 + 启动
npm run build && npm start
```

默认端口 8080。

## 页面

| 页面 | 说明 |
|------|------|
| `/` | Dashboard — 统计概览 |
| `/signals` | 信号列表 — 状态筛选、分析日志时间线 |
| `/trades` | 交易记录 |
| `/positions` | 持仓监控 |
| `/narratives` | 叙事追踪 |
| `/config` | 配置管理 — Finder 设置、账号管理、Engine 规则 |

## API 对接

- Engine API: `localhost:3002`（信号/交易/统计/配置）
- Finder API: `localhost:3001`（账号/爬取配置/状态）

配置在 `src/lib/api.ts` 中修改。
