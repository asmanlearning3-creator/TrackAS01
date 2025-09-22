# TrackAS Deployment Guide

## 🚀 Production Deployment Options

### 1. Vercel Deployment (Recommended)

#### Prerequisites
- Vercel account
- GitHub repository connected
- Environment variables configured

#### Steps
1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=your-supabase-url
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
     VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
     VITE_RAZORPAY_KEY_SECRET=your-razorpay-key-secret
     ```

3. **Automatic Deployment**
   - Push to `main` branch triggers automatic deployment
   - Preview deployments for pull requests

### 2. Netlify Deployment

#### Steps
1. **Connect Repository**
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add the same variables as Vercel

### 3. Docker Deployment

#### Local Development
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the application
open http://localhost
```

#### Production Server
```bash
# Build production image
docker build -t trackas:latest .

# Run production container
docker run -d -p 80:80 \
  -e VITE_SUPABASE_URL=your-supabase-url \
  -e VITE_SUPABASE_ANON_KEY=your-supabase-anon-key \
  trackas:latest
```

### 4. Traditional Server Deployment

#### Prerequisites
- Node.js 18+
- Nginx (optional, for reverse proxy)
- PM2 (for process management)

#### Steps
1. **Build the Application**
   ```bash
   npm install
   npm run build
   ```

2. **Serve with PM2**
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Serve the built files
   pm2 serve dist 3000 --name "trackas"
   ```

3. **Configure Nginx** (Optional)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 Environment Setup

### Required Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Payment Gateway (Razorpay)
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
VITE_RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Communication APIs
VITE_WHATSAPP_API_URL=your-whatsapp-api-url
VITE_SMS_API_URL=your-sms-api-url

# AI Services
VITE_OPENAI_API_KEY=your-openai-api-key
```

### Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get URL and anon key

2. **Run Migrations**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link to your project
   supabase link --project-ref your-project-ref

   # Run migrations
   supabase db push
   ```

## 📊 Performance Optimization

### Build Optimization
- ✅ Code splitting implemented
- ✅ Tree shaking enabled
- ✅ Gzip compression configured
- ✅ Static asset caching optimized

### Monitoring
- Add Google Analytics
- Set up error tracking (Sentry)
- Monitor performance metrics
- Set up uptime monitoring

## 🔒 Security Checklist

- ✅ HTTPS enabled
- ✅ Security headers configured
- ✅ Environment variables secured
- ✅ CORS properly configured
- ✅ Input validation implemented
- ✅ Rate limiting configured

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variables Not Loading**
   - Ensure variables start with `VITE_`
   - Check deployment platform configuration
   - Verify variable names match exactly

3. **Database Connection Issues**
   - Verify Supabase URL and key
   - Check network connectivity
   - Review database permissions

### Support
- Check logs in deployment platform
- Review browser console for errors
- Test API endpoints independently

## 📈 Scaling Considerations

- Use CDN for static assets
- Implement database connection pooling
- Set up horizontal scaling
- Monitor resource usage
- Implement caching strategies

---

**Ready to deploy! 🚀**

Choose your preferred deployment method and follow the steps above. The application is production-ready with all necessary configurations.
