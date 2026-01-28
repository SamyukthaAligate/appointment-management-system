# 🚀 Quick Deployment Commands

## Backend (Render)
```bash
cd "G:\Appointment Management System with Role-Based Workflow\backend"

# Initialize Git
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create GitHub repo first, then:
git remote add origin https://github.com/YOUR_USERNAME/appointment-backend.git
git push -u origin main
```

## Frontend (Netlify)
```bash
cd "G:\Appointment Management System with Role-Based Workflow\frontend"

# Update .env.production with your backend URL
# Then rebuild:
npm run build

# Deploy via drag & drop to Netlify
# Or connect GitHub repo
```

## Environment Variables Needed

### Backend (Render)
- MONGO_URI=mongodb+srv://...
- JWT_SECRET=your_secret_key
- NODE_ENV=production

### Frontend (Netlify)
- REACT_APP_API_URL=https://your-backend.onrender.com

## URLs After Deployment
- Backend: https://your-backend.onrender.com
- Frontend: https://your-frontend.netlify.app
- Health Check: https://your-backend.onrender.com/api/health
