# Human Detection System - Complete Setup Guide

## Quick Start

### 1. Clone and Navigate
```bash
cd Detection
```

### 2. Backend Setup

#### Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### Create Database
```bash
# Using createdb command
createdb detection_db

# Or using psql
psql -U postgres
CREATE DATABASE detection_db;
CREATE USER detection_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE detection_db TO detection_user;
\q
```

#### Setup Python Environment
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Linux/macOS)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use any text editor
```

**Required .env configuration:**
```env
DATABASE_URL=postgresql://detection_user:secure_password@localhost:5432/detection_db
SECRET_KEY=generate-with-openssl-rand-hex-32
```

#### Run Backend
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify backend:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

# Run development server
npm run dev
```

**Verify frontend:**
- App: http://localhost:5173

---

## Detailed Setup Instructions

### System Requirements

- **Operating System:** Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **Python:** 3.10 or higher
- **Node.js:** 18.0 or higher
- **PostgreSQL:** 14.0 or higher
- **RAM:** 4GB minimum, 8GB recommended
- **Disk Space:** 2GB minimum

### Backend Configuration

#### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `SECRET_KEY` | Yes | - | JWT secret (use `openssl rand -hex 32`) |
| `ALGORITHM` | No | HS256 | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | 30 | Token expiration |
| `BACKEND_CORS_ORIGINS` | No | localhost | Allowed origins |
| `UPLOAD_DIR` | No | uploads | Upload directory |
| `MAX_UPLOAD_SIZE` | No | 10485760 | Max upload (bytes) |

#### Database Connection String Format
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Examples:**
```env
# Local development
DATABASE_URL=postgresql://postgres:password@localhost:5432/detection_db

# Remote server
DATABASE_URL=postgresql://user:pass@192.168.1.100:5432/detection_db

# Cloud (example)
DATABASE_URL=postgresql://user:pass@db.example.com:5432/detection_db
```

### Frontend Configuration

#### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | http://localhost:8000/api/v1 | Backend API URL |

**Production example:**
```env
VITE_API_URL=https://api.yourdomain.com/api/v1
```

---

## Testing the Setup

### 1. Test Backend API

```bash
# Health check
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","service":"Human Detection System"}

# List persons (should be empty initially)
curl http://localhost:8000/api/v1/persons

# Expected response:
# []
```

### 2. Test Frontend

1. Open http://localhost:5173
2. Navigate to different pages (Dashboard, Persons, Cameras, Logs)
3. Check browser console for errors

### 3. Create Test Data

**Using API docs (http://localhost:8000/docs):**

1. Click on "POST /api/v1/persons"
2. Click "Try it out"
3. Enter test data:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "employee_id": "EMP001",
  "department": "Engineering"
}
```
4. Click "Execute"

**Using curl:**
```bash
curl -X POST http://localhost:8000/api/v1/persons \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "employee_id": "EMP001"
  }'
```

---

## Troubleshooting

### Backend Issues

#### "ModuleNotFoundError: No module named 'app'"
```bash
# Make sure you're in the backend directory
cd backend

# Reinstall dependencies
pip install -r requirements.txt
```

#### "could not connect to server: Connection refused"
```bash
# Check if PostgreSQL is running
sudo service postgresql status  # Linux
brew services list  # macOS

# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql  # macOS
```

#### "FATAL: database 'detection_db' does not exist"
```bash
# Create the database
createdb detection_db
```

#### "FATAL: password authentication failed"
```bash
# Check your DATABASE_URL in .env
# Make sure username and password are correct
```

### Frontend Issues

#### "Failed to fetch" or CORS errors
```bash
# Check backend is running on port 8000
# Check VITE_API_URL in frontend/.env
# Verify CORS origins in backend/.env
```

#### "Cannot find module" errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

**Backend (port 8000):**
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
uvicorn app.main:app --reload --port 8001
```

**Frontend (port 5173):**
```bash
# Vite will automatically use next available port
# Or specify port in vite.config.ts
```

---

## Development Workflow

### Starting Development

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Making Changes

1. **Backend changes:** FastAPI auto-reloads on file changes
2. **Frontend changes:** Vite hot-reloads automatically
3. **Database schema changes:** Will need migration tools (future)

### Stopping Services

```bash
# Press Ctrl+C in each terminal
# Deactivate Python virtual environment
deactivate
```

---

## Next Steps

1. ✅ Backend API running
2. ✅ Frontend app running
3. ✅ Database connected
4. 🔄 Add sample data via API
5. 🔄 Test CRUD operations
6. 📋 Ready for Phase 2 (AI integration)

---

## Additional Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **React Router:** https://reactrouter.com/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **SQLAlchemy:** https://docs.sqlalchemy.org/

---

**For detailed code explanations, see PROJECT_DOCUMENTATION.md**
