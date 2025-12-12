# 📝 Hướng Dẫn Push Code Lên GitHub

## Step 1: Tạo GitHub Repository

1. Vào https://github.com/new
2. Repository name: **meeting-room-system**
3. Description: Meeting Room Booking System
4. Chọn **Public**
5. Click **Create repository**

---

## Step 2: Copy GitHub Repository URL

Sau khi tạo, GitHub sẽ show:

```
https://github.com/YOUR_USERNAME/meeting-room-system.git
```

Copy URL này

---

## Step 3: Push Code (Run in Terminal)

```powershell
cd c:\Users\hungt\meeting-room-system

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/meeting-room-system.git

# Rename branch to main
git branch -M main

# Push code to GitHub
git push -u origin main
```

**Note**: Thay `YOUR_USERNAME` bằng GitHub username của bạn

---

## Step 4: Verify on GitHub

1. Vào https://github.com/YOUR_USERNAME/meeting-room-system
2. Phải thấy code của bạn được push lên
3. Lúc này Render có thể connect & deploy

---

## Troubleshooting

### Git authentication error?

Sử dụng GitHub Personal Access Token:

```powershell
git remote remove origin
git remote add origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/meeting-room-system.git
git push -u origin main
```

Lấy token tại: https://github.com/settings/tokens

---

**Sau khi push xong, báo tôi để deploy Render!** 🚀
