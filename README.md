# Appfont - Ứng dụng quản lý phông chữ Shopify

Appfont là một ứng dụng Shopify mạnh mẽ cho phép chủ cửa hàng dễ dàng quản lý, tải lên và áp dụng các phông chữ tùy chỉnh hoặc phông chữ Google cho cửa hàng của họ. Ứng dụng này cung cấp khả năng kiểm soát chi tiết về cách phông chữ hiển thị trên các phần tử trang khác nhau và trên các trang cụ thể.

## Tính năng chính

- **Tải lên phông chữ tùy chỉnh**: Tải lên các tệp phông chữ WOFF, OTF, TTF của riêng bạn và áp dụng chúng cho cửa hàng của bạn.
- **Tích hợp Google Fonts**: Duyệt và chọn từ thư viện Google Fonts phong phú.
- **Áp dụng phông chữ theo phần tử**: Chỉ định phông chữ cho các phần tử HTML cụ thể (ví dụ: `h1`, `p`, `a`, `body`, `li`).
- **Cài đặt hiển thị**: Kiểm soát nơi phông chữ của bạn xuất hiện:
  - Hiển thị trên tất cả các trang.
  - Hiển thị trên các trang cụ thể (trang chủ, trang giỏ hàng, trang blog, trang sản phẩm, trang bộ sưu tập).
  - Hiển thị trên các URL tùy chỉnh.
- **Kích thước phông chữ tùy chỉnh**: Đặt kích thước phông chữ mặc định hoặc tùy chỉnh cho các phần tử đã chọn.
- **Xem trước phông chữ**: Xem trước phông chữ đã chọn với các ký tự viết hoa, viết thường, số và ký tự đặc biệt.
- **Chế độ chỉnh sửa**: Chỉnh sửa các cấu hình phông chữ hiện có.
- **Xóa phông chữ**: Xóa các phông chữ đã tải lên hoặc đã chọn.

## Công nghệ sử dụng

- **Backend**: [Gadget](https://gadget.dev/) - Nền tảng phát triển backend không mã/ít mã.
- **Frontend**:
  - [React](https://react.dev/) - Thư viện JavaScript để xây dựng giao diện người dùng.
  - [Shopify Polaris](https://polaris.shopify.com/) - Hệ thống thiết kế của Shopify cho các ứng dụng.
  - [Vite](https://vitejs.dev/) - Công cụ xây dựng frontend nhanh chóng.
- **Ngôn ngữ**: JavaScript, TypeScript, Liquid (cho Shopify Extension).

## Cài đặt và thiết lập

Để thiết lập và chạy dự án này cục bộ, hãy làm theo các bước sau:

### Điều kiện tiên quyết

- [Node.js](https://nodejs.org/): Đảm bảo bạn đã cài đặt Node.js (phiên bản 14 trở lên).
- [npm](https://www.npmjs.com/) hoặc [Yarn](https://yarnpkg.com/): Trình quản lý gói JavaScript.
- [ggt CLI](https://docs.gadget.dev/guides/local-development/ggt-cli): Công cụ dòng lệnh của Gadget.

### Các bước cài đặt

1.  **Clone repository**:

    ```powershell
    git clone https://github.com/luctananh/appfont.git
    cd appfont
    ```

2.  **Cài đặt ggt CLI (nếu chưa có)**:

    ```powershell
    npm install -g ggt@latest
    ```

    Hoặc nếu bạn dùng Yarn:

    ```powershell
    yarn global add ggt@latest
    ```

3.  **Cài đặt các dependencies của dự án**:
    Điều hướng đến thư mục gốc của dự án (nơi có `package.json` chính):

    ```powershell
    cd D:\Code\appfont-1\appfont
    npm install
    ```

    Hoặc nếu bạn dùng Yarn:

    ```powershell
    yarn install
    ```

4.  **Chạy máy chủ phát triển Gadget**:
    Từ thư mục gốc của dự án (`D:\Code\appfont-1`), chạy lệnh sau để khởi động máy chủ phát triển Gadget và đồng bộ hóa các tệp của bạn:
    ```powershell
    ggt dev ./appfont --app=appfont --env=development --allow-unknown-directory
    ```
    Lệnh này sẽ khởi động quá trình đồng bộ hóa với ứng dụng Gadget của bạn và cung cấp các URL để xem trước ứng dụng và truy cập trình chỉnh sửa Gadget.

## Cách sử dụng

Sau khi máy chủ phát triển đang chạy:

1.  **Truy cập ứng dụng**: Mở URL "Preview" được cung cấp bởi `ggt dev` trong trình duyệt của bạn.
2.  **Quản lý phông chữ**:
    - Sử dụng tab "Upload Font" để tải lên các tệp phông chữ tùy chỉnh của bạn.
    - Sử dụng tab "Google Fonts" để tìm kiếm và chọn phông chữ từ thư viện Google Fonts.
3.  **Cấu hình phông chữ**:
    - Chọn các phần tử HTML mà bạn muốn áp dụng phông chữ.
    - Đặt kích thước phông chữ tùy chỉnh nếu cần.
    - Cấu hình cài đặt hiển thị để kiểm soát nơi phông chữ của bạn sẽ xuất hiện trên cửa hàng Shopify.
4.  **Lưu và cập nhật**: Nhấp vào nút "Save" hoặc "Update" để áp dụng các thay đổi của bạn cho cửa hàng Shopify.

## Cấu trúc dự án

- `api/`: Chứa các hành động backend (actions) và định nghĩa mô hình (models) của Gadget.
  - `actions/`: Các tệp JavaScript định nghĩa các hành động API và logic nghiệp vụ.
  - `models/`: Định nghĩa schema cho các mô hình dữ liệu của Gadget.
- `web/`: Chứa mã frontend của ứng dụng React.
  - `components/`: Các thành phần React có thể tái sử dụng.
  - `routes/`: Các trang và tuyến đường chính của ứng dụng.
- `extensions/`: Chứa các tiện ích mở rộng của Shopify (ví dụ: `appfont-extension`).
- `shopify.app.toml`: Tệp cấu hình cho ứng dụng Shopify.
- `vite.config.mjs`: Cấu hình cho Vite.

## Đóng góp

Nếu bạn muốn đóng góp cho dự án này, vui lòng fork repository và tạo một pull request.

## Giấy phép

[Tùy chọn: Thêm thông tin giấy phép tại đây, ví dụ: MIT License]
