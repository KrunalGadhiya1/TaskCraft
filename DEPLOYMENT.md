# TaskCraft - Deployment Guide

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Backend Setup

### 1. Environment Variables

Create a `.env` file in the `backend/` directory or set environment variables:

```bash
# Database
DATABASE_URL=jdbc:mysql://localhost:3306/taskcraft_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
DATABASE_USERNAME=your_db_username
DATABASE_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_base64_encoded_jwt_secret
JWT_EXPIRATION_MS=86400000

# Email (optional)
MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Server
SERVER_PORT=8080
```

### 2. Build and Run

```bash
cd backend
mvn clean package
java -jar target/taskcraft-backend-1.0.0.jar --spring.profiles.active=prod
```

## Frontend Setup

### 1. Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_BASE_URL=http://your-backend-url:8080/api
```

### 2. Build and Run

For development:
```bash
cd frontend
npm install
npm run dev
```

For production:
```bash
cd frontend
npm install
npm run build
# Serve the dist/ folder with any static server
```

## Docker Deployment (Optional)

### Backend Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/taskcraft-backend-1.0.0.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
```

### Frontend Dockerfile
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique JWT secrets for each environment
- Change default database credentials
- Enable SSL/TLS in production
- Use environment-specific configurations