# 🚀 Deploy Lên Render.com - Step by Step

## 📋 Yêu Cầu Trước Khi Deploy

- [ ] GitHub Account (tạo nếu chưa có: https://github.com)
- [ ] Render Account (free tier: https://render.com)
- [ ] Git installed locally
- [ ] Project code hoàn chỉnh (✅ bạn đã có)

---

## 🔧 **STEP 1: Setup Git & Push Code to GitHub**

### 1.1 Tạo GitHub Repository

```
1. Vào https://github.com/new
2. Repository name: meeting-room-system
3. Description: Meeting Room Booking System
4. Public (hoặc Private tùy chọn)
5. Click "Create repository"
```

### 1.2 Setup Git Locally

```bash
cd c:\Users\hungt\meeting-room-system

# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Meeting room booking system"

# Add remote (thay YOUR_USERNAME & YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/meeting-room-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🎯 **STEP 2: Deploy Backend on Render**

### 2.1 Tạo Backend Service

```
1. Vào https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub account (if not connected)
4. Select repository: meeting-room-system
5. Settings:
   • Name: meeting-room-backend
   • Environment: Node
   • Region: Singapore (gần VN)
   • Branch: main
   • Root Directory: backend
   • Build Command: npm install
   • Start Command: npm start
6. Click "Create Web Service"
```

### 2.2 Setup Environment Variables (Backend)

Sau khi service tạo xong:

```
1. Dashboard → meeting-room-backend
2. Settings → Environment
3. Add variables:

BACKEND_VARIABLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...  (đã có từ Render)

JWT_SECRET=generate-strong-random-string-here
JWT_EXPIRE=7d

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=https://YOUR_BACKEND_URL/api/auth/google/callback

FRONTEND_URL=https://YOUR_FRONTEND_URL
GOOGLE_API_KEY=your-google-api-key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=YOUR_GMAIL_ADDRESS@gmail.com
EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE
```

### 2.3 Cấu hình Render Backend

Backend URL sẽ là: `https://meeting-room-backend.onrender.com`

Cập nhật GOOGLE_REDIRECT_URI:
```
https://meeting-room-backend.onrender.com/api/auth/google/callback
```

---

## 🎨 **STEP 3: Deploy Frontend on Render**

### 3.1 Tạo Frontend Service

```
1. Dashboard → Click "New +" → "Static Site"
2. Settings:
   • Name: meeting-room-frontend
   • Branch: main
   • Root Directory: frontend
   • Build Command: npm run build
   • Publish Directory: build
3. Click "Create Static Site"
```

### 3.2 Setup Environment Variables (Frontend)

```
1. Dashboard → meeting-room-frontend
2. Environment
3. Add variables:

REACT_APP_API_URL=https://meeting-room-backend.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

Frontend URL sẽ là: `https://meeting-room-frontend.onrender.com`

---

## 🔄 **STEP 4: Update Google OAuth Redirect URI**

Render backend URL có thể khác, cần update Google Console:

```
1. Google Cloud Console
2. Credentials → OAuth 2.0 Client IDs
3. Edit → Authorized redirect URIs
4. Add: https://YOUR_BACKEND_URL/api/auth/google/callback
5. Save
```

---

## 📝 **STEP 5: Prepare Files for Production**

### 5.1 Update backend/package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 5.2 Update .gitignore

Ensure .env is in .gitignore (already done ✓)

---

## 🧪 **STEP 6: Testing Deployment**

### Test Backend

```bash
curl https://your-backend-url/health
# Expected: {"status":"OK","message":"Server is running"}
```

### Test Google OAuth

```bash
curl https://your-backend-url/api/auth/google
# Expected: {"success":true,"url":"https://accounts.google..."}
```

### Test Frontend

```
Visit: https://your-frontend-url
# Should load React app
# Click "Đăng nhập với Google" to test OAuth flow
```

---

## 🆘 **Troubleshooting**

### Deploy Failed

```
Check Render Logs:
1. Dashboard → Service Name
2. Logs tab
3. Look for build/startup errors
```

### Database Connection Error

```
Verify:
• DATABASE_URL correct in Render env vars
• Database still running on Render
• Check Render PostgreSQL status
```

### Google OAuth Not Working

```
Check:
• GOOGLE_REDIRECT_URI matches Render backend URL
• Google Console has callback URL registered
• GOOGLE_CLIENT_ID & SECRET correct
```

### Frontend Can't Reach Backend

```
Check:
• REACT_APP_API_URL points to correct backend
• CORS enabled on backend
• Backend service is running
```

---

## 📊 **Deployment Summary**

```
┌─────────────────────────────────────────────┐
│         Deployment Architecture             │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (React)                           │
│  https://meeting-room-frontend.onrender.com │
│           ↓ API calls                       │
│  Backend (Node.js)                          │
│  https://meeting-room-backend.onrender.com  │
│           ↓ Database queries                │
│  PostgreSQL (Render)                        │
│  postgresql://...                           │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] GitHub repo created & code pushed
- [ ] Backend service created on Render
- [ ] Frontend service created on Render
- [ ] Environment variables set (backend)
- [ ] Environment variables set (frontend)
- [ ] Google OAuth redirect URI updated
- [ ] Backend deploy successful
- [ ] Frontend deploy successful
- [ ] Tested health endpoints
- [ ] Tested Google OAuth flow

---

## 🔗 Useful Links

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- GitHub: https://github.com
- Google Console: https://console.cloud.google.com

---

**Ready to deploy? Follow STEP 1-6 above! 🚀**
