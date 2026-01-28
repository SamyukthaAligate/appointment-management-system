# 🚀 Frontend Deployment Guide

## Quick Setup for Netlify

### 1. Update Backend URL
Edit `.env.production`:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### 2. Build for Production
```bash
cd "G:\Appointment Management System with Role-Based Workflow\frontend"
npm run build
```

### 3. Deploy to Netlify

#### Method A: Drag & Drop (Easiest)
1. Go to https://app.netlify.com/teams/samyuktha-steam/projects
2. Drag the entire `build` folder to the deployment area
3. Your site will be live instantly!

#### Method B: Git Integration
1. Create GitHub repository: `appointment-frontend`
2. Push frontend code to GitHub
3. In Netlify: "New site from Git" → Connect repo
4. Settings:
   - Build command: `npm run build`
   - Publish directory: `build`

### 4. Set Environment Variables in Netlify
1. Go to Site settings → Environment variables
2. Add: `REACT_APP_API_URL` = `https://your-backend-url.onrender.com`

### 5. Your Frontend URL
After deployment: `https://your-app-name.netlify.app`

### 6. Test the App
- Visit your Netlify URL
- Test user registration
- Test appointment booking
- Test doctor dashboard
