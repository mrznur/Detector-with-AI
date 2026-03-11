# PostgreSQL Setup Guide - From Scratch to Connection

**Complete guide for installing PostgreSQL and connecting it to the Human Detection System**

---

## Table of Contents
1. [What is PostgreSQL?](#what-is-postgresql)
2. [Installation by Operating System](#installation-by-operating-system)
3. [Initial Configuration](#initial-configuration)
4. [Creating Database and User](#creating-database-and-user)
5. [Connecting to the App](#connecting-to-the-app)
6. [Verification and Testing](#verification-and-testing)
7. [Common Issues and Solutions](#common-issues-and-solutions)
8. [PostgreSQL Basics](#postgresql-basics)

---

## What is PostgreSQL?

PostgreSQL is a powerful, open-source relational database system. We use it to store:
- Person information (employees, visitors)
- Camera details
- Detection logs (who was detected, when, where)
- Face embeddings (AI recognition data)

**Why PostgreSQL?**
- Reliable and ACID compliant
- Excellent performance for complex queries
- Strong data integrity
- Free and open-source
- Great for production applications

---

## Installation by Operating System

### Windows Installation

#### Step 1: Download PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Choose the latest version (PostgreSQL 16.x recommended)
4. Download the Windows x86-64 installer

#### Step 2: Run Installer
1. Double-click the downloaded `.exe` file
2. Click "Next" through the welcome screen
3. **Installation Directory:** Keep default (`C:\Program Files\PostgreSQL\16`)
4. **Select Components:** Check all (PostgreSQL Server, pgAdmin 4, Command Line Tools)
5. **Data Directory:** Keep default (`C:\Program Files\PostgreSQL\16\data`)
6. **Password:** Enter a strong password for the `postgres` superuser
   - ⚠️ **IMPORTANT:** Remember this password! Write it down.
7. **Port:** Keep default `5432`
8. **Locale:** Keep default
9. Click "Next" and then "Finish"

#### Step 3: Verify Installation
```cmd
# Open Command Prompt (cmd)
psql --version

# Expected output:
# psql (PostgreSQL) 16.x
```

#### Step 4: Add to PATH (if needed)
If `psql --version` doesn't work:
1. Search for "Environment Variables" in Windows
2. Click "Environment Variables"
3. Under "System variables", find "Path"
4. Click "Edit"
5. Click "New"
6. Add: `C:\Program Files\PostgreSQL\16\bin`
7. Click "OK" on all windows
8. Restart Command Prompt

---

### macOS Installation

#### Method 1: Using Homebrew (Recommended)

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Verify installation
psql --version
```

#### Method 2: Using Postgres.app

1. Download from https://postgresapp.com/
2. Move Postgres.app to Applications folder
3. Double-click to start
4. Click "Initialize" to create a new server
5. Add to PATH:
```bash
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

### Linux Installation (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Start on boot

# Verify installation
psql --version

# Check service status
sudo systemctl status postgresql
```

---

## Initial Configuration

### Accessing PostgreSQL

#### Windows
```cmd
# Method 1: Using psql
psql -U postgres

# Method 2: Using pgAdmin 4
# Search for "pgAdmin 4" in Start Menu and open it
```

#### macOS/Linux
```bash
# Switch to postgres user (Linux)
sudo -u postgres psql

# Or directly (macOS with Homebrew)
psql postgres
```

### First Time Setup

When you first connect, you'll see:
```
postgres=#
```

This is the PostgreSQL command prompt.

---

## Creating Database and User

### Step-by-Step Database Setup

#### 1. Connect to PostgreSQL
```bash
# Windows
psql -U postgres

# macOS (Homebrew)
psql postgres

# Linux
sudo -u postgres psql
```

#### 2. Create Database
```sql
-- Create the database for our app
CREATE DATABASE detection_db;

-- Verify it was created
\l
```

You should see `detection_db` in the list.

#### 3. Create User (Recommended for Security)
```sql
-- Create a dedicated user for the app
CREATE USER detection_user WITH PASSWORD 'your_secure_password_here';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE detection_db TO detection_user;

-- For PostgreSQL 15+, also grant schema privileges
\c detection_db
GRANT ALL ON SCHEMA public TO detection_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO detection_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO detection_user;

-- Verify user was created
\du
```

#### 4. Test the New User
```bash
# Exit current session
\q

# Connect as new user
psql -U detection_user -d detection_db -h localhost

# If successful, you'll see:
# detection_db=>
```

---

## Connecting to the App

### Understanding the Connection String

Format:
```
postgresql://[username]:[password]@[host]:[port]/[database]
```

Components:
- **username:** Database user (e.g., `detection_user`)
- **password:** User's password
- **host:** Server address (`localhost` for local, or IP/domain for remote)
- **port:** PostgreSQL port (default: `5432`)
- **database:** Database name (e.g., `detection_db`)

### Configuration Steps

#### 1. Open Backend .env File
```bash
cd backend
nano .env  # or use any text editor
```

#### 2. Set DATABASE_URL

**Option A: Using dedicated user (Recommended)**
```env
DATABASE_URL=postgresql://detection_user:your_secure_password_here@localhost:5432/detection_db
```

**Option B: Using postgres superuser (Development only)**
```env
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/detection_db
```

**Option C: Remote database**
```env
DATABASE_URL=postgresql://detection_user:password@192.168.1.100:5432/detection_db
```

#### 3. Save the File

### Example .env File
```env
# Database Configuration
DATABASE_URL=postgresql://detection_user:MySecurePass123@localhost:5432/detection_db

# Security
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

---

## Verification and Testing

### Test 1: Direct Database Connection

```bash
# Test connection with psql
psql -U detection_user -d detection_db -h localhost

# If successful, you're connected!
# Try a simple query:
SELECT version();

# Exit
\q
```

### Test 2: Python Connection Test

Create a test file `backend/test_db.py`:

```python
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Testing connection to: {DATABASE_URL.split('@')[1]}")  # Hide password

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print("✅ Connection successful!")
        print(f"PostgreSQL version: {version}")
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

Run the test:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python test_db.py
```

### Test 3: Start the Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

Check the console output:
- ✅ No errors = Database connected successfully
- ❌ Errors = See troubleshooting section below

### Test 4: Check API Docs

1. Open http://localhost:8000/docs
2. Try the "GET /api/v1/persons" endpoint
3. Click "Try it out" → "Execute"
4. Should return `[]` (empty array) - this means database is working!

---

## Common Issues and Solutions

### Issue 1: "psql: command not found"

**Solution:**
- **Windows:** Add PostgreSQL bin folder to PATH (see installation steps)
- **macOS:** Install via Homebrew or add Postgres.app to PATH
- **Linux:** Install postgresql-client: `sudo apt install postgresql-client`

### Issue 2: "FATAL: password authentication failed"

**Causes:**
- Wrong password in DATABASE_URL
- User doesn't exist
- Wrong username

**Solution:**
```bash
# Reset password
sudo -u postgres psql
ALTER USER detection_user WITH PASSWORD 'new_password';
\q

# Update .env with new password
```

### Issue 3: "FATAL: database 'detection_db' does not exist"

**Solution:**
```bash
psql -U postgres
CREATE DATABASE detection_db;
\q
```

### Issue 4: "could not connect to server: Connection refused"

**Causes:**
- PostgreSQL service not running
- Wrong host or port

**Solution:**

**Windows:**
```cmd
# Check services
services.msc
# Look for "postgresql-x64-16" and start it
```

**macOS:**
```bash
brew services start postgresql@16
```

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### Issue 5: "FATAL: Peer authentication failed"

**Linux only** - PostgreSQL trying to use system user authentication.

**Solution:**
Edit PostgreSQL config:
```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Change this line:
# local   all   all   peer

# To:
local   all   all   md5

# Save and restart
sudo systemctl restart postgresql
```

### Issue 6: Port 5432 already in use

**Solution:**
```bash
# Find what's using the port
sudo lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Either stop that process or use different port
# In .env:
DATABASE_URL=postgresql://user:pass@localhost:5433/detection_db
```

---

## PostgreSQL Basics

### Useful Commands

#### psql Commands (inside psql prompt)

```sql
-- List all databases
\l

-- Connect to a database
\c detection_db

-- List all tables
\dt

-- Describe a table
\d persons

-- List all users
\du

-- Show current connection info
\conninfo

-- Execute SQL file
\i /path/to/file.sql

-- Quit
\q
```

#### SQL Commands

```sql
-- View all persons
SELECT * FROM persons;

-- Count records
SELECT COUNT(*) FROM presence_logs;

-- View recent logs
SELECT * FROM presence_logs ORDER BY detected_at DESC LIMIT 10;

-- Join query
SELECT p.name, c.name, pl.detected_at 
FROM presence_logs pl
JOIN persons p ON pl.person_id = p.id
JOIN cameras c ON pl.camera_id = c.id
LIMIT 10;

-- Delete all data (careful!)
TRUNCATE TABLE presence_logs CASCADE;
```

### Database Management

#### Backup Database
```bash
# Backup to file
pg_dump -U detection_user detection_db > backup.sql

# Backup with compression
pg_dump -U detection_user detection_db | gzip > backup.sql.gz
```

#### Restore Database
```bash
# Restore from file
psql -U detection_user detection_db < backup.sql

# Restore from compressed
gunzip -c backup.sql.gz | psql -U detection_user detection_db
```

#### Drop and Recreate (Fresh Start)
```bash
psql -U postgres

DROP DATABASE detection_db;
CREATE DATABASE detection_db;
GRANT ALL PRIVILEGES ON DATABASE detection_db TO detection_user;
\q
```

---

## Connection String Examples

### Local Development
```env
# Using localhost
DATABASE_URL=postgresql://detection_user:password@localhost:5432/detection_db

# Using 127.0.0.1
DATABASE_URL=postgresql://detection_user:password@127.0.0.1:5432/detection_db
```

### Remote Server
```env
# Using IP address
DATABASE_URL=postgresql://detection_user:password@192.168.1.100:5432/detection_db

# Using domain name
DATABASE_URL=postgresql://detection_user:password@db.example.com:5432/detection_db
```

### Cloud Providers

**Heroku:**
```env
DATABASE_URL=postgresql://user:pass@ec2-xx-xxx-xxx-xx.compute-1.amazonaws.com:5432/dbname
```

**AWS RDS:**
```env
DATABASE_URL=postgresql://admin:pass@mydb.xxxxxx.us-east-1.rds.amazonaws.com:5432/detection_db
```

**DigitalOcean:**
```env
DATABASE_URL=postgresql://doadmin:pass@db-postgresql-nyc3-xxxxx.ondigitalocean.com:25060/detection_db?sslmode=require
```

---

## Security Best Practices

### 1. Strong Passwords
```bash
# Generate secure password (Linux/macOS)
openssl rand -base64 32

# Or use a password manager
```

### 2. Don't Use Superuser in Production
```sql
-- Create limited user
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE detection_db TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

### 3. Never Commit .env Files
```bash
# Make sure .env is in .gitignore
echo ".env" >> .gitignore
```

### 4. Use SSL for Remote Connections
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

---

## Quick Reference Card

```bash
# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql@16  # macOS
# Windows: Start from Services

# Connect to database
psql -U detection_user -d detection_db -h localhost

# Create database
CREATE DATABASE detection_db;

# Create user
CREATE USER detection_user WITH PASSWORD 'password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE detection_db TO detection_user;

# List databases
\l

# List tables
\dt

# Exit
\q

# Backup
pg_dump -U detection_user detection_db > backup.sql

# Restore
psql -U detection_user detection_db < backup.sql
```

---

## Next Steps

1. ✅ PostgreSQL installed
2. ✅ Database created
3. ✅ User configured
4. ✅ Connection string in .env
5. ✅ Connection tested
6. 🚀 Ready to run the backend!

**Run the backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Check:** http://localhost:8000/docs

---

## Additional Resources

- **Official Documentation:** https://www.postgresql.org/docs/
- **PostgreSQL Tutorial:** https://www.postgresqltutorial.com/
- **pgAdmin Documentation:** https://www.pgadmin.org/docs/
- **SQLAlchemy + PostgreSQL:** https://docs.sqlalchemy.org/en/20/dialects/postgresql.html

---

**Need help? Check the troubleshooting section or refer to SETUP_GUIDE.md**
