# My Work Item Frontend Demo

此專案為 Vue 3 + Vite 的前端 Demo，實作登入、權限導向與 Work Item 管理流程。

## 技術堆疊

- Vue 3
- Vite
- Vue Router
- Pinia

## 環境需求

- Node.js 20+（含 npm）

## 啟動方式

```bash
npm install
npm run dev
```

## 環境設定

專案使用 `.env` 控制 API 環境，已內建 `local/dev` 切換。

```env
VITE_API_TARGET=local
VITE_API_LOCAL_URL=http://localhost:5284
VITE_API_DEV_URL=http://localhost:5284
```

說明：
- `VITE_API_TARGET=local`：使用 `VITE_API_LOCAL_URL`
- `VITE_API_TARGET=dev`：使用 `VITE_API_DEV_URL`

API Base URL 設定在 [src/config.js](src/config.js)。

## 目前功能

- 登入（JWT）
- 依角色顯示功能（Admin 與 User）
- Work Item 清單
- 單筆確認、批次確認、單筆撤銷
- 查看詳情
- Admin 可在 Work Item 頁面執行新增 / 修改 / 刪除
- 全域 Toast 通知與自訂確認視窗（非瀏覽器預設 alert/confirm）

## 已串接 API

Auth:
- `POST /api/Auth/Login`
- `GET /api/Auth/Profile`

Work Item:
- `GET /api/WorkItem/GetListWorkItem`
- `POST /api/WorkItem/GetWorkItemDetail`
- `POST /api/WorkItem/BatchWorkItemConfirm`
- `POST /api/WorkItem/BatchWorkItemCancel`
- `POST /api/WorkItem/CreateWorkItem`
- `POST /api/WorkItem/UpdateWorkItem`
- `POST /api/WorkItem/DeleteWorkItem`

## 專案結構（重點）

```txt
src/
  components/      # 共用 UI（Toast / ConfirmDialog）
  router/          # 路由與登入守衛
  services/        # API wrapper 與各 domain service
  stores/          # Pinia state（auth / workItems / ui）
  views/           # 頁面（Login / Home / WorkItem）
  config.js        # API 環境切換設定
```

## 常用指令

- `npm run dev`：啟動開發伺服器
- `npm run build`：建置正式版
- `npm run preview`：預覽建置結果
