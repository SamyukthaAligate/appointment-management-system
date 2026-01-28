# 🚀 Deployment Checklist

## Backend (Render)
- [ ] Create Render account
- [ ] Deploy backend service
- [ ] Set environment variables (MONGO_URI, JWT_SECRET)
- [ ] Note the backend URL

## Frontend (Netlify)
- [ ] Update .env.production with backend URL
- [ ] Build frontend: `npm run build`
- [ ] Deploy to Netlify (drag & drop or Git)
- [ ] Set environment variables in Netlify
- [ ] Test the live application

## Post-Deployment
- [ ] Test user registration/login
- [ ] Test appointment booking
- [ ] Test doctor dashboard
- [ ] Verify all API calls work
- [ ] Check error handling

## Environment Variables Needed
### Backend
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Your secret JWT key
- `NODE_ENV`: production

### Frontend
- `REACT_APP_API_URL`: Your deployed backend URL

## URLs Structure
- Frontend: https://your-app.netlify.app
- Backend: https://your-api.onrender.com
- API Endpoints: https://your-api.onrender.com/api/*
