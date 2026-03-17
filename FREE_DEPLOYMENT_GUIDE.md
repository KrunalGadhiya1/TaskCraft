# TaskCraft - Free Deployment Guide

## Overview
This guide shows how to deploy TaskCraft (Spring Boot backend + React frontend + MySQL database) completely for FREE using cloud platforms.

## Option 1: Railway + Vercel (Recommended)

### 🚂 Backend + Database: Railway (Free Tier)
Railway provides free hosting for backend apps and MySQL databases.

#### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub account
3. Connect your GitHub account

#### Step 2: Deploy Backend
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your `TaskCraft` repository
3. Choose the `backend/` directory as the root
4. Set build settings:
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/taskcraft-backend-1.0.0.jar --server.port=$PORT --spring.profiles.active=prod`

#### Step 3: Add MySQL Database
1. In your Railway project, click "Add" → "Database" → "MySQL"
2. Railway will create a MySQL database automatically
3. Copy the database connection details

#### Step 4: Configure Environment Variables
In Railway project settings, add these environment variables:

```bash
# Database (from Railway MySQL)
DATABASE_URL=${{MYSQL_URL}}
DATABASE_USERNAME=${{MYSQL_USER}}
DATABASE_PASSWORD=${{MYSQL_PASSWORD}}

# JWT (generate a new secure secret)
JWT_SECRET=VGhpcy1pcy1hLW5ldy1zZWNyZXQtZm9yLXByb2R1Y3Rpb24tZW52aXJvbm1lbnQtand0LXNlY3JldA==
JWT_EXPIRATION_MS=86400000

# Email (optional - can skip for now)
MAIL_ENABLED=false

# Server
SERVER_PORT=${{PORT}}
SPRING_PROFILES_ACTIVE=prod
```

#### Step 5: Get Backend URL
After deployment, copy the Railway domain (e.g., `https://taskcraft-backend.up.railway.app`)

---

### ⚛️ Frontend: Vercel (Free)
Vercel provides free hosting for React apps.

#### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub account
3. Connect your GitHub account

#### Step 2: Deploy Frontend
1. Click "New Project" → "Import Git Repository"
2. Select your `TaskCraft` repository
3. Configure project:
   - **Root Directory:** `frontend/`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

#### Step 3: Configure Environment Variables
Add this environment variable in Vercel project settings:

```bash
VITE_API_BASE_URL=https://your-railway-backend-url/api
```

Replace `your-railway-backend-url` with the URL from Railway (without `/api`)

#### Step 4: Deploy
1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. Get the frontend URL (e.g., `https://taskcraft.vercel.app`)

---

## Option 2: Render (All-in-One Free Solution)

### 🛠️ Backend + Database + Frontend: Render
Render provides free tiers for web services and databases.

#### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account

#### Step 2: Create MySQL Database
1. Click "New" → "PostgreSQL" (Render doesn't have MySQL, but you can use PostgreSQL)
2. Or use a free MySQL service like PlanetScale (https://planetscale.com)

For this guide, let's use PlanetScale for MySQL:

1. Go to https://planetscale.com
2. Create free account
3. Create a new database
4. Get the connection string

#### Step 3: Deploy Backend
1. Click "New" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** `backend/`
   - **Runtime:** `Java`
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/taskcraft-backend-1.0.0.jar --server.port=$PORT --spring.profiles.active=prod`

#### Step 4: Configure Environment Variables
```bash
# Database (from PlanetScale)
DATABASE_URL=jdbc:mysql://your-planetscale-connection-string
DATABASE_USERNAME=your-planetscale-username
DATABASE_PASSWORD=your-planetscale-password

# JWT
JWT_SECRET=your-new-jwt-secret-base64
JWT_EXPIRATION_MS=86400000

# Email
MAIL_ENABLED=false

# Server
PORT=$PORT
SPRING_PROFILES_ACTIVE=prod
```

#### Step 5: Deploy Frontend
1. Click "New" → "Static Site"
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** `frontend/`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`

#### Step 6: Frontend Environment Variables
```bash
VITE_API_BASE_URL=https://your-render-backend-url/api
```

---

## Option 3: Heroku + Netlify (Alternative)

### 🟣 Backend: Heroku
1. Create Heroku account (https://heroku.com)
2. Install Heroku CLI
3. Deploy backend with `heroku create`
4. Add MySQL add-on: `heroku addons:create jawsdb:kitefin`
5. Set environment variables via Heroku dashboard

### 🌐 Frontend: Netlify
1. Create Netlify account (https://netlify.com)
2. Connect GitHub repo
3. Set root directory to `frontend/`
4. Add environment variable: `VITE_API_BASE_URL=https://your-heroku-app.herokuapp.com/api`

---

## Environment Variables Setup

### Generate JWT Secret
Run this command to generate a secure JWT secret:

```bash
# On Linux/Mac
openssl rand -base64 32

# Or use online generator: https://www.base64encode.org/
# Generate 32 random bytes and base64 encode
```

### Database URLs
- **Railway:** Automatically provided as `${{MYSQL_URL}}`
- **PlanetScale:** `mysql://username:password@host:port/database?sslaccept=strict`
- **Local MySQL:** `jdbc:mysql://localhost:3306/taskcraft_db?useSSL=false`

---

## Testing Deployment

1. **Backend Health Check:**
   ```bash
   curl https://your-backend-url/actuator/health
   ```

2. **Frontend Access:**
   - Open the frontend URL in browser
   - Try registering a new user
   - Check if API calls work

3. **Database Connection:**
   - Check application logs for database connection errors
   - Verify tables are created automatically

---

## Troubleshooting

### Common Issues:

1. **Port Issues:**
   - Use `$PORT` environment variable for dynamic port assignment

2. **Database Connection:**
   - Ensure SSL settings match your database provider
   - Check firewall settings

3. **CORS Issues:**
   - Add your frontend domain to backend CORS configuration

4. **Build Failures:**
   - Check build logs for Java/Node version compatibility
   - Ensure all dependencies are properly declared

### Free Tier Limitations:
- **Railway:** 512MB RAM, 1GB disk, sleeps after 24h inactivity
- **Vercel:** Unlimited bandwidth, but build minutes limited
- **Render:** 750 hours/month, sleeps after 15min inactivity
- **PlanetScale:** 1 database, 1GB storage, 100M row reads/month

---

## Cost Optimization

When your app grows beyond free tiers:

1. **Railway:** $5-10/month for persistent apps
2. **Vercel:** Free for personal projects
3. **Render:** $7/month for web services
4. **PlanetScale:** $0-29/month based on usage

Your TaskCraft project is now ready for free deployment! 🚀