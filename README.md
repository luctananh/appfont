# appfont

## Giới thiệu

**appfont** là một package nội bộ phục vụ cho ứng dụng Gadget appfont trong môi trường phát triển (Development environment). Dự án sử dụng React, Vite, và tích hợp sâu với hệ sinh thái Shopify (Polaris, App Bridge, Shopify API).

## Tính năng chính

- Phát triển frontend với React.
- Sử dụng Polaris và các component Shopify cho UI hiện đại.
- Hỗ trợ tích hợp App Bridge react và API Shopify cho ứng dụng Shopify App.
- Quản lý và build dự án bằng Vite, TypeScript.

## Cài đặt & Phát triển

### Yêu cầu

- Node.js >= 18.x
- npm >= 9.x (hoặc yarn/pnpm)
- Quyền truy cập vào môi trường Gadget liên quan

### Cài đặt

```bash
npm install
```
### Phát triển
```bash
npm run dev
```
### Build production
```bash
npm run build
```
### Cấu trúc dự án
- appfont/: Source code chính của package appfont
- node_modules/: Thư viện phụ thuộc
- package.json: Thông tin và cấu hình package
- package-lock.json: Quản lý versions phụ thuộc
### Scripts
- build: Build production sử dụng Vite
### Phụ thuộc chính
- @gadgetinc/react
- @gadgetinc/react-shopify-app-bridge
- @shopify/app-bridge-react
- @shopify/polaris
- @shopify/polaris-icons
- shopify-api-node
- react, react-dom, react-router
