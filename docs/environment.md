# Môi trường phát triển CubSol

## Phiên bản chuẩn

| Công cụ | Phiên bản |
|---|---|
| Node.js | `22.19.0` tham chiếu, tối thiểu `22.13.0` |
| pnpm | `11.9.0` |
| Git | `2.51.0` hoặc mới hơn |
| GitHub CLI | `2.96.0` hoặc mới hơn, chỉ cần khi publish |

`package.json`, `.node-version` và CI là nguồn xác định phiên bản. Corepack cung
cấp pnpm theo trường `packageManager` trong `package.json`.

## Kiểm tra nhanh

Mở PowerShell mới tại repository:

```powershell
node --version
pnpm --version
git --version
gh auth status
pnpm doctor
```

`pnpm doctor` thất bại khi thiếu Node, pnpm hoặc Git. GitHub CLI là tùy chọn đối
với phát triển local nên chỉ tạo cảnh báo.

## Windows PATH

Các thư mục cần có trong User PATH:

```text
C:\Program Files\nodejs
C:\Program Files\Git\cmd
C:\Program Files\GitHub CLI
C:\Users\<user>\AppData\Local\Programs\Corepack
```

Không thêm runtime tạm của Codex vào PATH hệ thống. Sau khi thay đổi PATH, đóng
terminal cũ và mở terminal mới.

## Package store

`.npmrc` đặt pnpm store tại `.pnpm-store` để môi trường sandbox và CI có hành vi
nhất quán. `node_modules`, `.pnpm-store`, `.vinext`, `.wrangler` và `dist` đều
không được commit.

## OneDrive

Repository chính hiện nằm tại `E:\cubsol`, ngoài OneDrive. Nếu tạo thêm clone
trong thư mục đồng bộ, hàng chục nghìn file dependency có thể làm chậm
watch/build; không đồng bộ `node_modules` và `.pnpm-store`.

Không xóa hay di chuyển workspace khi chưa có bản sao và chưa cập nhật remote.

## WSL

CubSol không yêu cầu WSL. Nếu `wsl --status` báo `E_ACCESSDENIED`, tiếp tục dùng
PowerShell; không cần bật dịch vụ hoặc thay đổi Windows Features chỉ để chạy dự
án này.
