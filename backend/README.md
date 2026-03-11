# Human Detection System - Backend

FastAPI backend for human detection, face recognition, and presence tracking system.

## Environment Setup

### Prerequisites
- Python 3.10 or higher
- PostgreSQL 14 or higher
- pip (Python package manager)
- Virtual environment tool (venv or virtualenv)

### Required Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/detection_db

# Security
SECRET_KEY=your-secret-key-change-in-production-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Origins (comma-separated)
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# File Upload
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
```

### Environment Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dbname` |
| `SECRET_KEY` | JWT secret key for authentication | Generate with `openssl rand -hex 32` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `30` |
| `BACKEND_CORS_ORIGINS` | Allowed frontend origins | `["http://localhost:5173"]` |
| `UPLOAD_DIR` | Directory for file uploads | `uploads` |
| `MAX_UPLOAD_SIZE` | Max upload size in bytes | `10485760` (10MB) |

### PostgreSQL Setup

1. **Install PostgreSQL**
   - Ubuntu/Debian: `sudo apt install postgresql postgresql-contrib`
   - macOS: `brew install postgresql`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Create Database**
   ```bash
   # Start PostgreSQL service
   sudo service postgresql start  # Linux
   brew services start postgresql  # macOS
   
   # Create database
   createdb detection_db
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE detection_db;
   CREATE USER detection_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE detection_db TO detection_user;
   \q
   ```

3. **Update DATABASE_URL**
   ```env
   DATABASE_URL=postgresql://detection_user:your_password@localhost:5432/detection_db
   ```

### Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Dependencies Explained

```txt
fastapi==0.109.0              # Modern web framework
uvicorn[standard]==0.27.0     # ASGI server with WebSocket support
sqlalchemy==2.0.25            # ORM for database operations
psycopg2-binary==2.9.9        # PostgreSQL adapter
python-dotenv==1.0.0          # Load environment variables
pydantic==2.5.3               # Data validation
pydantic-settings==2.1.0      # Settings management
alembic==1.13.1               # Database migrations
email-validator==2.1.0        # Email validation for Pydantic
```

## Project Structure

```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   ├── persons.py
│   │   ├── cameras.py
│   │   └── logs.py
│   ├── core/             # Core configuration
│   │   ├── config.py
│   │   └── database.py
│   ├── models/           # SQLAlchemy models
│   │   ├── person.py
│   │   ├── camera.py
│   │   ├── presence_log.py
│   │   └── face_embedding.py
│   ├── schemas/          # Pydantic schemas
│   │   ├── person.py
│   │   ├── camera.py
│   │   └── presence_log.py
│   ├── services/         # Business logic (future AI services)
│   └── main.py           # FastAPI application
├── requirements.txt
├── .env
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Database

Update `.env` file with your PostgreSQL credentials:

```
DATABASE_URL=postgresql://username:password@localhost:5432/detection_db
SECRET_KEY=your-secret-key-here
```

### 3. Create Database

```bash
# Using psql
createdb detection_db

# Or using PostgreSQL client
psql -U postgres
CREATE DATABASE detection_db;
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Persons
- `GET /api/v1/persons` - List all persons
- `GET /api/v1/persons/{id}` - Get person by ID
- `POST /api/v1/persons` - Create new person
- `PUT /api/v1/persons/{id}` - Update person
- `DELETE /api/v1/persons/{id}` - Delete person

### Cameras
- `GET /api/v1/cameras` - List all cameras
- `GET /api/v1/cameras/{id}` - Get camera by ID
- `POST /api/v1/cameras` - Register new camera
- `PUT /api/v1/cameras/{id}` - Update camera
- `DELETE /api/v1/cameras/{id}` - Delete camera
- `POST /api/v1/cameras/{id}/heartbeat` - Update camera last seen

### Presence Logs
- `GET /api/v1/logs` - List presence logs (with filters)
- `GET /api/v1/logs/{id}` - Get log by ID
- `POST /api/v1/logs` - Create new detection log
- `GET /api/v1/logs/stats/daily` - Get daily statistics

## Database Models

### Person
Stores registered individuals:
- Basic info: name, email, phone, employee_id, department
- Status tracking: is_active, created_at, updated_at
- Relationships: face_embeddings, presence_logs

### Camera
Manages surveillance cameras:
- Camera info: name, location, stream_url, camera_type
- Technical specs: fps, resolution
- Location: latitude, longitude (optional)
- Status: is_active, last_seen
- Relationships: presence_logs

### PresenceLog
Records detection events:
- Detection info: person_id, camera_id, detected_at
- AI metrics: confidence_score, is_spoofing_detected
- Optional: image_path, metadata (JSON)
- Relationships: person, camera

### FaceEmbedding
Stores face recognition vectors:
- Embedding data: binary numpy array
- Metadata: embedding_version, is_primary
- Relationships: person

## Future Enhancements

### Phase 1 (Current - Base API)
✅ CRUD operations for persons, cameras, logs
✅ Database schema with relationships
✅ API documentation

### Phase 2 (AI Integration)
- Face detection service (YOLO/MediaPipe)
- Face recognition service (InsightFace/FaceNet)
- Embedding storage and search (KD-Tree/FAISS)
- Liveness detection (anti-spoofing)

### Phase 3 (Advanced Features)
- Real-time camera stream processing
- WebSocket for live updates
- Analytics dashboard data
- Movement tracking across cameras
- Anomaly detection

### Phase 4 (Optimization)
- Redis caching for embeddings
- Background task queue (Celery)
- Database indexing optimization
- API rate limiting

## Development Notes

- All timestamps are in UTC
- Embeddings stored as binary (numpy arrays)
- Privacy-first: no raw images stored (only paths)
- Confidence scores: 0.0 to 1.0 range
- Camera types: ip_camera, phone, webcam
