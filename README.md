# appfont

## Giới thiệu

**appfont** là package nội bộ phục vụ ứng dụng Gadget, môi trường phát triển cho tích hợp Shopify App, sử dụng React, Vite, TypeScript và hệ sinh thái Gadget/Shopify.

- **Nổi bật:**  
  - Dùng Gadget để phát triển app Shopify nhanh chóng  
  - UI hiện đại với Polaris, App Bridge  
  - Tổ chức theo workspace, hỗ trợ mở rộng qua `extensions/*`  

## Cấu trúc dự án

> **Lưu ý:** Danh sách file/thư mục dưới đây có thể chưa đầy đủ. Xem thêm tại [appfont/appfont trên GitHub](https://github.com/luctananh/appfont/tree/main/appfont)

```
appfont/
├── .env.development           # Biến môi trường cho dev
├── .gitignore, .ignore        # Quy tắc loại trừ git/node
├── accessControl/             # (có thể chứa logic quản lý truy cập)
├── api/                       # API layer cho app
├── extensions/                # Workspace cho extension
├── index.html                 # Entry HTML, mount vào #root, load web/main.jsx
├── package.json               # Thông tin & scripts cho package appfont
├── settings.gadget.ts         # Cấu hình Gadget app
├── shopify.app.development.toml
├── shopify.app.toml           # Cấu hình Shopify app (dev & prod)
├── vite.config.mjs            # Cấu hình build Vite
├── web/                       # Mã nguồn frontend chính (React)
├── yarn.lock                  # Quản lý phụ thuộc yarn
```

## Cài đặt & Phát triển

### Yêu cầu

- Node.js >= 18.x
- npm hoặc yarn
- Đăng ký Gadget & Shopify nếu chạy bản thật

### Cài đặt

```bash
npm install
```

### Phát triển

```bash
npm run dev
```
> App sẽ chạy trên Vite dev server với entry là `appfont/index.html`, mount React vào `<div id="root"></div>`, mã chính tại `web/main.jsx`.

### Build production

```bash
npm run build
```

## Scripts

- `build`: Build production với Vite (NODE_ENV=production vite build)

## Phụ thuộc chính

- **Frontend:**  
  - `react`, `react-dom`, `react-router`
  - `@shopify/polaris`, `@shopify/polaris-icons` (UI chuẩn Shopify)
  - `@shopify/app-bridge-react`, `@gadgetinc/react-shopify-app-bridge` (tích hợp Shopify App Bridge)
- **Gadget/Shopify:**  
  - `@gadget-client/appfont`, `gadget-server`
  - `shopify-api-node`  
- **Dev:**  
  - `typescript`, `vite`, `@vitejs/plugin-react-swc`, các @types

## Môi trường & cấu hình

- `.env.development`: Thiết lập biến môi trường dev (API key, endpoint, ...)
- `settings.gadget.ts`: Cấu hình runtime cho Gadget
- `shopify.app.toml`, `shopify.app.development.toml`: Cấu hình app Shopify cho các môi trường

## Extension Workspace

- Dự án hỗ trợ workspace theo Yarn/NPM với thư mục `extensions/*` để phát triển tính năng mở rộng cho appfont.

## Tài liệu & Liên kết

- [Gadget.dev](https://gadget.dev/docs)
- [Shopify Polaris](https://polaris.shopify.com/)
- [Shopify App Bridge](https://shopify.dev/docs/api/app-bridge)

## License

UNLICENSED – Package nội bộ, không phân phối công khai.

---
