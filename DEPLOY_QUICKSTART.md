# 🚀 Deployment Quickstart - Meeting Room System

## 📋 Deployment Checklist

### Phase 1: Git & GitHub (⏳ 5 mins)
- [ ] Tạo GitHub repo: https://github.com/new
- [ ] Add remote: `git remote add origin https://github.com/YOUR_USER/meeting-room-system.git`
- [ ] Push code: `git push -u origin main`
- [ ] Verify trên GitHub

### Phase 2: Render Setup (⏳ 10 mins)

#### Backend Service
- [ ] Vào https://dashboard.render.com
- [ ] "New +" → "Web Service"
- [ ] Connect GitHub repo
- [ ] Settings:
  - Name: `meeting-room-backend`
  - Environment: `Node`
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`

#### Frontend Service
- [ ] "New +" → "Static Site"
- [ ] Connect GitHub repo
- [ ] Settings:
  - Name: `meeting-room-frontend`
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Publish Directory: `build`

### Phase 3: Environment Variables (⏳ 5 mins)

#### Backend Env Vars
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://YOUR_DATABASE_USER:YOUR_DATABASE_PASSWORD@YOUR_DB_HOST:5432/YOUR_DATABASE_NAME
JWT_SECRET=generate-strong-random-string
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=https://meeting-room-backend.onrender.com/api/auth/google/callback
FRONTEND_URL=https://meeting-room-frontend.onrender.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=YOUR_GMAIL_ADDRESS@gmail.com
EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE
```

#### Frontend Env Vars
```
REACT_APP_API_URL=https://meeting-room-backend.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=286811980386-tll3a2eqm1o76fpp2bm7p7vshfd11cr3.apps.googleusercontent.com
```

### Phase 4: Final Configuration (⏳ 5 mins)

#### Update Google Console
1. Vào https://console.cloud.google.com
2. Credentials → OAuth 2.0 Client
3. Authorized redirect URIs - Add:
   ```
   https://meeting-room-backend.onrender.com/api/auth/google/callback
   ```

---

## 🔗 Endpoints Sau Deployment

**Frontend**: https://meeting-room-frontend.onrender.com
**Backend**: https://meeting-room-backend.onrender.com
**Database**: Render PostgreSQL

---

## 🧪 Testing

```bash
# Health Check
curl https://meeting-room-backend.onrender.com/health

# Google OAuth
curl https://meeting-room-backend.onrender.com/api/auth/google

# Frontend
https://meeting-room-frontend.onrender.com
→ Click "Đăng nhập với Google"
```

---

## 📞 Support

| Issue | Solution |
|-------|----------|
| Deploy fails | Check Render Logs → fix build errors |
| OAuth fails | Verify redirect URI in Google Console |
| API error | Check env vars in Render dashboard |
| Database error | Verify DATABASE_URL in env vars |

---

## ⏱️ Total Time: ~25 mins

**Status**: Ready to deploy! 🎉
