# 🚀 Backend Deployment Guide

## Quick Setup for Render

### 1. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `appointment-backend`
3. Description: `Appointment Management System Backend`
4. Make it Public
5. Click "Create repository"

### 2. Push to GitHub
```bash
cd "G:\Appointment Management System with Role-Based Workflow\backend"
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/appointment-backend.git
git push -u origin main
```

### 3. Deploy to Render
1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: `appointment-backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: `Free`
5. Environment Variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: `your_super_secret_key_change_this_in_production`
   - `NODE_ENV`: `production`

### 4. Your Backend URL
After deployment, your URL will be: `https://appointment-backend.onrender.com`

### 5. Test Health Check
Visit: `https://appointment-backend.onrender.com/api/health`
