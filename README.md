# 🏢 Meeting Room Booking System

**Full-stack web application** cho phép quản lý phòng họp, đặt lịch họp, tích hợp Google Calendar & Email.

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Material-UI, React Router |
| **Backend** | Node.js, Express.js, Sequelize ORM |
| **Database** | PostgreSQL (Render) |
| **Authentication** | JWT + Google OAuth 2.0 |
| **Services** | Google Calendar API, Gmail SMTP |
| **Deployment** | Render.com |

---

## 🎯 Features

✅ **User Management**
- Register & Login (email/password)
- Google OAuth Authentication
- Role-based access (user, admin)

✅ **Room Management**
- Create, read, update, delete meeting rooms
- Room details (capacity, equipment, location)
- Check room availability

✅ **Meeting Management**
- Create & schedule meetings
- Add participants
- Google Calendar integration
- Email notifications

✅ **Admin Features**
- Manage users & rooms
- View analytics

---

## 🚀 Quick Start

### Local Development

```bash
# Backend
cd backend
npm install
npm run dev
# Runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### Production Deployment

See [DEPLOY_QUICKSTART.md](DEPLOY_QUICKSTART.md) for step-by-step guide.

---

## 📁 Project Structure

```
meeting-room-system/
├── backend/
│   ├── config/          # Database config
│   ├── controllers/      # API logic
│   ├── middleware/       # Auth middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Google, Email services
│   ├── .env            # Environment variables
│   └── server.js        # Entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   ├── services/    # API client
│   │   └── App.js       # Root component
│   └── .env            # Frontend env vars
└── docs/
    ├── DEPLOY_GUIDE.md
    ├── GOOGLE_SETUP_GUIDE.md
    └── CREDENTIALS_QUICK_REF.md
```

---

## 🔧 Setup Credentials

Before deployment, you need:

1. **Google OAuth** (Google Console)
   - Client ID
   - Client Secret

2. **Gmail** (myaccount.google.com)
   - App Password (for email notifications)

3. **Database** (Render)
   - PostgreSQL connection string

See [CREDENTIALS_QUICK_REF.md](CREDENTIALS_QUICK_REF.md) for details.

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Get Google OAuth URL
- `GET /api/auth/google/callback` - Google callback
- `GET /api/auth/me` - Get current user (requires auth)

### Rooms
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create room (admin)
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room (admin)
- `DELETE /api/rooms/:id` - Delete room (admin)
- `GET /api/rooms/check-availability` - Check availability

### Meetings
- `GET /api/meetings` - List meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/:id` - Get meeting details
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Cancel meeting
- `POST /api/meetings/:id/minutes` - Upload meeting minutes

### Users
- `GET /api/users` - List active users

---

## 🔐 Security Notes

- `.env` files are in `.gitignore` (not committed)
- JWT tokens expire after 7 days
- Google OAuth uses OpenID Connect
- Email passwords are app-specific tokens (not main password)
- CORS enabled only for authorized domains

---

## 📚 Documentation

- [Deployment Guide](DEPLOY_GUIDE.md)
- [Google Setup](GOOGLE_SETUP_GUIDE.md)
- [Credentials Reference](CREDENTIALS_QUICK_REF.md)
- [Integration Fixes](INTEGRATION_FIXES.md)

---

## 🤝 Contributing

This is a personal project. For issues or improvements, contact the developer.

---

## 📄 License

MIT License

---

## 👤 Developer

- **Email**: charliekhoinguyen@gmail.com
- **GitHub**: https://github.com/hungt
 - **Email**: YOUR_CONTACT_EMAIL@example.com
 - **GitHub**: https://github.com/hungt

---

**Happy Meeting! 🎉**
