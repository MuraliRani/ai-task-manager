# 🚀 Deployment Guide for AI Task Manager

This guide provides comprehensive instructions for deploying the AI Task Manager application in different environments.

## 📋 Prerequisites

Before deploying, ensure you have:

- Docker and Docker Compose installed
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- PostgreSQL access (either local or cloud-based)
- Domain name (for production deployment)

## 🐳 Option 1: Docker Deployment (Recommended)

### Local Development Deployment

1. **Clone the repository** (if not already done):
```bash
git clone <repository-url>
cd ai-task-manager
```

2. **Set up environment variables**:
```bash
# Copy the production environment template
copy .env.prod .env

# Edit .env file with your actual values:
# - Add your Gemini API key
# - Update database credentials if needed
# - Set your domain URLs for production
```

3. **Deploy with Docker Compose**:
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

4. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Production Deployment

1. **Update environment variables for production**:
```env
# In .env file, update these for your domain:
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
NEXT_PUBLIC_WS_URL=wss://yourdomain.com/api/v1/ws
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

2. **Deploy to production server**:
```bash
# On your production server
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🌐 Option 2: Cloud Platform Deployment

### Heroku Deployment

1. **Install Heroku CLI** and login:
```bash
heroku login
```

2. **Create Heroku apps**:
```bash
# Create backend app
heroku create your-app-backend

# Create frontend app
heroku create your-app-frontend
```

3. **Set up environment variables**:
```bash
# Backend environment variables
heroku config:set DATABASE_URL=postgresql://user:pass@host:port/dbname -a your-app-backend
heroku config:set GEMINI_API_KEY=your_key_here -a your-app-backend
heroku config:set ALLOWED_ORIGINS=https://your-app-frontend.herokuapp.com -a your-app-backend

# Frontend environment variables
heroku config:set NEXT_PUBLIC_API_URL=https://your-app-backend.herokuapp.com/api/v1 -a your-app-frontend
heroku config:set NEXT_PUBLIC_WS_URL=wss://your-app-backend.herokuapp.com/api/v1/ws -a your-app-frontend
```

4. **Deploy**:
```bash
# Deploy backend
cd backend
git init
heroku git:remote -a your-app-backend
git add .
git commit -m "Deploy backend"
git push heroku main

# Deploy frontend
cd ../frontend
git init
heroku git:remote -a your-app-frontend
git add .
git commit -m "Deploy frontend"
git push heroku main
```

### Vercel + Railway Deployment

1. **Deploy Backend to Railway**:
   - Visit [Railway](https://railway.app)
   - Connect your GitHub repository
   - Deploy the backend folder
   - Add environment variables in Railway dashboard

2. **Deploy Frontend to Vercel**:
   - Visit [Vercel](https://vercel.com)
   - Connect your GitHub repository
   - Deploy the frontend folder
   - Add environment variables in Vercel dashboard

## 🖥️ Option 3: VPS/Server Deployment

### Ubuntu Server Setup

1. **Install Docker**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Clone and deploy**:
```bash
# Clone repository
git clone <your-repository-url>
cd ai-task-manager

# Set up environment
cp .env.prod .env
nano .env  # Edit with your values

# Deploy
sudo docker-compose -f docker-compose.prod.yml up --build -d
```

3. **Set up Nginx reverse proxy** (optional):
```bash
# Install Nginx
sudo apt install nginx

# Configure Nginx (create /etc/nginx/sites-available/ai-task-manager)
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/ai-task-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔧 Manual Deployment (Without Docker)

### Backend Deployment

1. **Set up Python environment**:
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt
```

2. **Set up environment variables**:
```bash
# Create .env file in backend directory
DATABASE_URL=postgresql://postgres:murali@2001@localhost:5432/taskdb
GEMINI_API_KEY=your_key_here
DEBUG=False
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000
```

3. **Start the backend**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Set up environment variables**:
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws
```

3. **Build and start**:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📊 Monitoring and Maintenance

### Health Checks

- Backend health: `http://your-domain:8000/health`
- Frontend health: Check if the homepage loads
- Database: Use PostgreSQL monitoring tools

### Logs

```bash
# Docker deployment logs
docker-compose -f docker-compose.prod.yml logs -f

# Individual service logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs postgres
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database**: Use strong passwords and consider cloud database services
3. **HTTPS**: Set up SSL certificates for production (Let's Encrypt recommended)
4. **Firewall**: Configure proper firewall rules
5. **Updates**: Keep Docker images and dependencies updated

## 🆘 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**:
   - Check if backend is running and accessible
   - Verify WebSocket URL in environment variables
   - Check firewall settings

2. **Database Connection Error**:
   - Verify PostgreSQL is running
   - Check database credentials in environment variables
   - Ensure database exists

3. **API Fetch Errors**:
   - Verify backend URL in frontend environment variables
   - Check CORS settings in backend
   - Ensure both services are running

4. **Build Failures**:
   - Check Docker is running
   - Verify all files are present
   - Check for syntax errors in Dockerfiles

### Getting Help

If you encounter issues:

1. Check the logs using the commands above
2. Verify all environment variables are set correctly
3. Ensure all required services are running
4. Check the GitHub issues page for similar problems

## 🎯 Quick Start Commands

```bash
# Quick local deployment
cp .env.prod .env
# Edit .env with your values
docker-compose -f docker-compose.prod.yml up --build -d

# Quick stop
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

Your AI Task Manager should now be deployed and accessible! 🎉