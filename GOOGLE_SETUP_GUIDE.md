# 🔐 Google OAuth & Email Setup Guide

## 📌 Tóm Tắt Credentials Cần Thiết

```
┌─────────────────────────────┬────────────────┬──────────────────┐
│ Credential                  │ Lấy từ đâu     │ Nhập ở file nào  │
├─────────────────────────────┼────────────────┼──────────────────┤
│ Google Client ID            │ Google Console │ .env + frontend/ │
│                             │                │ .env             │
├─────────────────────────────┼────────────────┼──────────────────┤
│ Google Client Secret        │ Google Console │ backend/.env     │
│                             │                │ (ONLY)           │
├─────────────────────────────┼────────────────┼──────────────────┤
│ Gmail App Password          │ Google Account │ backend/.env     │
│                             │ (2FA required) │                  │
├─────────────────────────────┼────────────────┼──────────────────┤
│ Google Redirect URI         │ Set in Console │ Google Console   │
│                             │                │ ONLY             │
└─────────────────────────────┴────────────────┴──────────────────┘
```

---

## 🚀 **Chi tiết Setup từng bước:**

### **1️⃣ Setup Google OAuth (Google Console)**

**A. Tạo Consent Screen:**
```
Google Cloud Console (console.cloud.google.com)
  ↓
APIs & Services
  ↓
OAuth consent screen
  ↓
External User Type → Create
  ↓
App name: "Meeting Room System"
User support email: [your-email@gmail.com]
Developer contact: [your-email@gmail.com]
  ↓
Scopes: Add or Remove Scopes
  ↓
Select these scopes:
  • https://www.googleapis.com/auth/userinfo.profile
  • https://www.googleapis.com/auth/userinfo.email
  • https://www.googleapis.com/auth/calendar
  • https://www.googleapis.com/auth/drive.file
  ↓
Test Users: Add Users ([your-email@gmail.com])
  ↓
Save
```

**B. Lấy Client ID & Secret:**
```
Google Cloud Console
  ↓
APIs & Services
  ↓
Credentials
  ↓
Create Credentials → OAuth 2.0 Client IDs
  ↓
Application Type: Web application
Name: "Meeting Room"
Authorized JavaScript origins: http://localhost:3000
Authorized redirect URIs: http://localhost:5000/api/auth/google/callback
  ↓
Create
  ↓
Copy:
  • Client ID (e.g., 123456-abc.apps.googleusercontent.com)
  • Client Secret (e.g., GOCSPX-xyz...)
```

---

### **2️⃣ Setup Gmail App Password**

**Điều kiện**: Phải bật 2-Step Verification trước

```
Google Account (myaccount.google.com)
  ↓
Security (menu trái)
  ↓
2-Step Verification (enable if not already)
  ↓
App passwords
  ↓
Select app: Mail
Select device: Windows Computer (or your device)
  ↓
Google generates 16-char password (e.g., "abcd efgh ijkl mnop")
  ↓
Copy này (bỏ dấu cách)
```

---

### **3️⃣ Cập nhật File Cấu hình**

**File 1: backend/.env**
```env
# Google OAuth - COPY từ Google Console
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Email - COPY từ Gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=YOUR_16_CHAR_APP_PASSWORD_NO_SPACES
```

**File 2: frontend/.env**
```env
# Google OAuth - SAME Client ID
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

---

## ✅ **Verification Checklist**

- [ ] Google Client ID lấy được từ Google Console
- [ ] Google Client Secret lấy được từ Google Console
- [ ] Gmail 2FA bật
- [ ] Gmail App Password lấy được
- [ ] backend/.env cập nhật 4 dòng Google/Email
- [ ] frontend/.env cập nhật Client ID
- [ ] Restart backend server (`npm run dev`)
- [ ] Restart frontend server (`npm start`)
- [ ] Test: Vào http://localhost:3000 → Click "Đăng nhập với Google"

---

## 🧪 **Testing OAuth Flow**

1. **Frontend**: http://localhost:3000/login
2. Click button **"Đăng nhập với Google"**
3. Redirect tới Google login → Đăng nhập
4. Approve permissions
5. Redirect về app → Auto-login → Dashboard

---

## 🆘 **Troubleshooting**

### ❌ "Invalid Client ID"
- Check Google Console: Client ID khớp?
- Check frontend/.env: Client ID cập nhật?
- Restart frontend

### ❌ "Redirect URI mismatch"
- Check Google Console: Redirect URI phải là `http://localhost:5000/api/auth/google/callback`
- Không được thêm `/` ở cuối

### ❌ "Can't send email"
- Check Gmail: 2FA bật chưa?
- Check Gmail: App Password lấy đúng?
- Check backend/.env: Email & Password cập nhật?
- Test: `TEST_EMAIL=true npm run dev` (nếu code support)

### ❌ "Client Secret invalid"
- Client Secret có cảm ứng? (Có thể bị reset)
- Tạo credential mới → Copy Secret mới
- Cập nhật .env → Restart backend

---

## 📌 **File Cần Cập nhật**

```
backend/.env (4 dòng)
  • GOOGLE_CLIENT_ID
  • GOOGLE_CLIENT_SECRET
  • EMAIL_USER
  • EMAIL_PASS

frontend/.env (1 dòng)
  • REACT_APP_GOOGLE_CLIENT_ID
```

---

## 🔒 **Security Notes**

⚠️ **NEVER commit .env file**
- .env đã thêm vào .gitignore ✅
- Lúc push code: .env sẽ bị ignore
- Teammate: Copy .env.example → Rename .env → Điền riêng của họ

✅ **Gmail App Password an toàn**
- Không phải password Gmail chính
- Chỉ dùng cho email app
- Có thể revoke bất kỳ lúc nào
- Generate password mới nếu cần

---

**Sau khi setup xong, reply tôi setup như thế nào để tôi test hoặc hỗ trợ thêm! 🚀**
