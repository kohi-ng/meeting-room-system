# 📋 Google Setup - Quick Reference

## 🎯 Cần Điền Gì?

### Backend Setup (backend/.env)

```env
# ⭐ BẮTBUỘC: Lấy từ Google Console
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
                 ^ Thay đổi đây!

GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
                    ^ Thay đổi đây! (Secret của riêng bạn)

# ⭐ BẮTBUỘC: Lấy từ Gmail App Passwords
EMAIL_USER=YOUR_GMAIL_ADDRESS@gmail.com
           ^ Thay đổi đây!

EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE
           ^ Thay đổi đây! (16 ký tự)
```

### Frontend Setup (frontend/.env)

```env
# ⭐ BẮTBUỘC: Phải giống backend
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
                           ^ Thay đổi đây! (Giống backend)
```

---

## 📌 Credential Nào Từ Đâu?

| Credential | Lấy Từ | Hướng Dẫn |
|-----------|--------|---------|
| **Client ID** | https://console.cloud.google.com → Credentials | Dạng: `xxx-yyy.apps.googleusercontent.com` |
| **Client Secret** | https://console.cloud.google.com → Credentials | Dạng: `GOCSPX-xyz...` |
| **Email User** | Gmail của bạn | Ví dụ: `myemail@gmail.com` |
| **App Password** | https://myaccount.google.com → Security → App passwords | 16 ký tự, tạo cho Mail app |

---

## ✅ Checklist Trước Khi Test

- [ ] Có Google Account?
- [ ] Bật 2-Step Verification?
- [ ] Vào Google Console tạo Project?
- [ ] Setup OAuth Consent Screen?
- [ ] Lấy Client ID?
- [ ] Lấy Client Secret?
- [ ] Lấy App Password từ Gmail?
- [ ] Cập nhật backend/.env (4 dòng)?
- [ ] Cập nhật frontend/.env (1 dòng)?
- [ ] Restart backend server?
- [ ] Restart frontend server?

---

## 🧪 Cách Test

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Mong thấy: ✅ Server is running on port 5000

# Terminal 2: Frontend (folder khác)
cd frontend
npm start
# Mong thấy: Compiled successfully!
# Tự động mở http://localhost:3000

# Browser:
# 1. Nhấp "Đăng nhập với Google"
# 2. Đăng nhập Google
# 3. Approve permissions
# 4. Nên redirect lại app + auto-login
```

---

## 🚨 Thường Gặp Lỗi

### Lỗi 1: "Invalid Client ID"
```
Nguyên nhân: Client ID sai/chưa cập nhật
Giải pháp:
  1. Kiểm tra Google Console: Credentials → OAuth 2.0 Client IDs
  2. Copy Client ID chính xác (không thêm/bớt ký tự)
  3. Cập nhật backend/.env + frontend/.env
  4. Restart cả backend + frontend
```

### Lỗi 2: "Redirect URI mismatch"
```
Nguyên nhân: Redirect URL không khớp
Giải pháp:
  Google Console → Credentials → OAuth 2.0 Client
    → Authorized redirect URIs phải chính xác:
    http://localhost:5000/api/auth/google/callback
    (Không được thêm / ở cuối hoặc dấu cách)
```

### Lỗi 3: "Invalid Client Secret"
```
Nguyên nhân: Secret sai hoặc hết hạn
Giải pháp:
  1. Google Console → Credentials → OAuth 2.0 Client
  2. Xóa Client cũ
  3. Tạo Client mới
  4. Copy Secret mới
  5. Cập nhật backend/.env
  6. Restart backend
```

### Lỗi 4: Email không gửi được
```
Nguyên nhân: Gmail App Password sai/chưa setup
Giải pháp:
  1. Kiểm tra Gmail 2FA bật chưa
     https://myaccount.google.com → Security → 2-Step Verification
  2. Vào App passwords
  3. Tạo mới: Select app = Mail, device = Windows Computer
  4. Copy 16 ký tự (bỏ dấu cách)
  5. Cập nhật EMAIL_PASS trong backend/.env
  6. Restart backend
```

---

## 💡 Tips

- **Credentials có hiệu lực**: Vĩnh viễn (trừ App Password có thể revoke)
- **Environment**: Hiện tại setup cho `localhost` → Chỉ dùng local
- **Production**: Cần cấu hình lại khi deploy (sẽ hướng dẫn sau)
- **Security**: Không bao giờ commit .env → Đã có .gitignore ✅

---

**Bạn đã setup xong 4 items trên chưa? 👆**
