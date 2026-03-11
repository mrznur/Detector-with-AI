# Face Detection System - Technical Documentation

## Overview

A comprehensive face recognition system built with FastAPI backend and React frontend, featuring person management, face enrollment, real-time verification, and presence logging.

## Architecture

### System Components

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │ ──HTTP─→│   Backend   │ ──SQL──→│  PostgreSQL │
│   (React)   │ ←─JSON──│  (FastAPI)  │ ←─Data──│  Database   │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ↓
                        ┌─────────────┐
                        │  DeepFace   │
                        │  (FaceNet)  │
                        └─────────────┘
```

### Technology Stack

**Backend:**
- FastAPI 0.104.1 - Modern async web framework
- SQLAlchemy 2.0.23 - ORM for database operations
- PostgreSQL 18.3.2 - Relational database
- DeepFace 0.0.93 - Face recognition library
- TensorFlow/tf-keras - Deep learning framework
- Pydantic - Data validation
- python-multipart - File upload handling

**Frontend:**
- React 19 - UI library
- React Router 7 - Routing
- TypeScript - Type safety
- Tailwind CSS - Styling
- Vite - Build tool
- react-icons - Icon library

## Database Schema

### persons
```sql
CREATE TABLE persons (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE,
    phone VARCHAR,
    employee_id VARCHAR UNIQUE,
    department VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### cameras
```sql
CREATE TABLE cameras (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    location VARCHAR,
    stream_url VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### face_embeddings
```sql
CREATE TABLE face_embeddings (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES persons(id) NOT NULL,
    embedding BYTEA NOT NULL,  -- 128-dimensional vector as binary
    embedding_version VARCHAR DEFAULT 'v1',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### presence_logs
```sql
CREATE TABLE presence_logs (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES persons(id) NOT NULL,
    camera_id INTEGER REFERENCES cameras(id) NOT NULL,
    detected_at TIMESTAMP DEFAULT NOW(),
    confidence_score FLOAT NOT NULL,
    is_spoofing_detected BOOLEAN DEFAULT FALSE,
    image_path VARCHAR,
    extra_data VARCHAR  -- JSON string for additional metadata
);
```

## Backend API

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

#### Persons API

**List Persons**
```http
GET /persons
Response: [
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "employee_id": "EMP001",
    "department": "Engineering",
    "created_at": "2026-03-12T10:00:00",
    "updated_at": "2026-03-12T10:00:00"
  }
]
```

**Create Person**
```http
POST /persons
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "employee_id": "EMP001",
  "department": "Engineering"
}

Response: {
  "id": 1,
  "name": "John Doe",
  ...
}
```

**Get Person**
```http
GET /persons/{id}
Response: { "id": 1, "name": "John Doe", ... }
```

**Update Person**
```http
PUT /persons/{id}
Content-Type: application/json

{
  "name": "John Smith",
  "department": "Management"
}
```

**Delete Person**
```http
DELETE /persons/{id}
Response: 204 No Content
```

#### Cameras API

**List Cameras**
```http
GET /cameras
Response: [
  {
    "id": 1,
    "name": "Main Entrance",
    "location": "Building A",
    "stream_url": "rtsp://camera1.local/stream",
    "is_active": true,
    "created_at": "2026-03-12T10:00:00"
  }
]
```

**Create Camera**
```http
POST /cameras
Content-Type: application/json

{
  "name": "Main Entrance",
  "location": "Building A",
  "stream_url": "rtsp://camera1.local/stream",
  "is_active": true
}
```

#### Face Recognition API

**Enroll Face**
```http
POST /faces/enroll/{person_id}
Content-Type: multipart/form-data

file: [image file]

Response: {
  "message": "Face enrolled successfully",
  "person_id": 2,
  "person_name": "John Doe",
  "embedding_id": 3
}
```

**Verify Face**
```http
POST /faces/verify
Content-Type: multipart/form-data

file: [image file]

Response (Match): {
  "match": true,
  "person_id": 2,
  "person_name": "John Doe",
  "confidence": 64.79,
  "message": "Matched with John Doe"
}

Response (No Match): {
  "match": false,
  "confidence": 45.23,
  "message": "Unknown person"
}
```

**Get Person Embeddings**
```http
GET /faces/person/{person_id}/embeddings
Response: {
  "person_id": 2,
  "embedding_count": 1,
  "embeddings": [
    {
      "id": 3,
      "created_at": "2026-03-12T10:00:00"
    }
  ]
}
```

#### Logs API

**List Logs**
```http
GET /logs
Response: [
  {
    "id": 1,
    "person_id": 2,
    "camera_id": 1,
    "detected_at": "2026-03-12T10:00:00",
    "confidence_score": 64.79,
    "is_spoofing_detected": false,
    "image_path": null,
    "extra_data": null
  }
]
```

**Create Log**
```http
POST /logs
Content-Type: application/json

{
  "person_id": 2,
  "camera_id": 1,
  "confidence_score": 64.79
}
```

## Face Recognition System

### FaceNet Model

**Architecture:**
- Model: FaceNet (Inception ResNet v1)
- Output: 128-dimensional embedding vector
- Framework: TensorFlow via DeepFace

**Embedding Process:**
1. Face detection in image
2. Face alignment and preprocessing
3. Forward pass through FaceNet
4. Extract 128-dimensional feature vector
5. Serialize to binary for database storage

### Similarity Calculation

**Method:** Cosine Similarity
```python
similarity = dot(embedding1, embedding2) / (norm(embedding1) * norm(embedding2))
```

**Threshold:** 0.6 (60%)
- Similarity ≥ 60%: Match
- Similarity < 60%: No match

### Face Service Implementation

```python
class FaceService:
    def extract_embedding(image_path: str) -> np.ndarray:
        """Extract 128-dim embedding from image"""
        
    def compare_faces(emb1: np.ndarray, emb2: np.ndarray) -> float:
        """Calculate cosine similarity (0-1)"""
        
    def serialize_embedding(embedding: np.ndarray) -> bytes:
        """Convert numpy array to binary"""
        
    def deserialize_embedding(embedding_bytes: bytes) -> np.ndarray:
        """Convert binary back to numpy array"""
```

## Frontend Architecture

### Routing Structure

```
/ (Dashboard)
├── /persons (Person Management)
├── /cameras (Camera Management)
├── /verification (Face Verification)
└── /logs (Presence Logs)
```

### Component Hierarchy

```
App (root.tsx)
├── Sidebar
└── Routes
    ├── Dashboard
    ├── Persons
    ├── Cameras
    ├── Verification
    └── Logs
```

### API Client

```typescript
// frontend/app/lib/api.ts
const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
  get: async (endpoint: string) => { ... },
  post: async (endpoint: string, data: any) => { ... },
  put: async (endpoint: string, data: any) => { ... },
  delete: async (endpoint: string) => { ... },
};
```

### State Management

- React useState for local component state
- useEffect for data fetching
- No global state management (simple app)

## Design System

### Colors
- **Primary**: Emerald Green (#10b981)
- **Background**: Warm beige/orange gradient
- **Cards**: White with 70% opacity, backdrop blur
- **Text**: Gray-800 for headers, Gray-600 for body
- **Sidebar**: Gray-800 background

### Typography
- **Headers**: Smooch Sans (Google Fonts)
- **Body**: Saira (Google Fonts)
- **Sizes**: 
  - Page headers: text-5xl
  - Sidebar title: text-3xl
  - Card titles: text-lg

### Layout
- **Max Width**: 1400px with mx-auto
- **Spacing**: Consistent padding (p-8 for pages, p-6 for cards)
- **Borders**: Rounded-2xl for cards, rounded-xl for buttons
- **Shadows**: shadow-lg for cards, hover:shadow-xl

## File Upload Flow

### Enrollment Flow
```
User selects file → Preview → Click "Enroll Face"
    ↓
FormData with file → POST /faces/enroll/{person_id}
    ↓
Backend saves to uploads/faces/ → Extract embedding
    ↓
Serialize embedding → Save to face_embeddings table
    ↓
Return success response
```

### Verification Flow
```
User selects file → Preview → Click "Verify Face"
    ↓
FormData with file → POST /faces/verify
    ↓
Backend saves temp file → Extract embedding
    ↓
Compare with all enrolled embeddings
    ↓
Find best match → Check threshold
    ↓
Return match result with confidence
```

## Security Considerations

### Current Implementation
- No authentication (development only)
- CORS enabled for localhost:5173
- File uploads limited to images
- SQL injection protected by SQLAlchemy ORM

### Production Requirements
- Add JWT authentication
- Implement rate limiting
- Add file size limits
- Validate file types server-side
- Use HTTPS
- Implement RBAC (Role-Based Access Control)
- Add audit logging
- Encrypt sensitive data

## Performance Optimization

### Backend
- Database indexes on foreign keys and timestamps
- Connection pooling via SQLAlchemy
- Async endpoints where applicable
- Face embedding caching (future)

### Frontend
- Code splitting via React Router
- Lazy loading of images
- Debounced search (future)
- Pagination for large lists (future)

## Testing

### Backend Testing
```bash
# Manual API testing
curl http://localhost:8000/api/v1/persons

# Test face enrollment
curl -X POST http://localhost:8000/api/v1/faces/enroll/2 \
  -F "file=@photo.jpg"

# Test face verification
curl -X POST http://localhost:8000/api/v1/faces/verify \
  -F "file=@test.jpg"
```

### Frontend Testing
- Manual testing via browser
- Check console for errors
- Verify API calls in Network tab

## Deployment

### Backend Deployment
1. Set production DATABASE_URL
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations (if using Alembic)
4. Start with Gunicorn: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`

### Frontend Deployment
1. Build: `npm run build`
2. Serve static files from `dist/` folder
3. Configure API_URL for production backend

### Database Migration
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head
```

## Known Issues & Limitations

1. **No authentication**: System is open to all users
2. **Single face per person**: Only one primary embedding stored
3. **No anti-spoofing**: Can be fooled by photos
4. **No live camera**: Only supports photo upload
5. **No real-time updates**: Manual refresh required

## Future Enhancements

### Phase 1: Live Camera Detection
- WebRTC integration for phone camera
- Real-time face detection
- Automatic logging to presence_logs
- WebSocket for live dashboard updates

### Phase 2: Advanced Features
- Multiple face embeddings per person
- Anti-spoofing detection
- Face quality assessment
- Batch enrollment
- Export logs to CSV

### Phase 3: Production Ready
- User authentication & authorization
- Multi-tenant support
- Advanced analytics
- Mobile app
- Cloud deployment

## Troubleshooting

### Common Issues

**Issue: Database connection failed**
```
Solution: Check PostgreSQL is running
$ pg_isready
$ psql -U detection_user -d detection_db
```

**Issue: Face detection failed**
```
Solution: Ensure image has clear, frontal face
- Good lighting
- Face not obscured
- Single face in image
- Minimum 100x100 pixels
```

**Issue: CORS error in frontend**
```
Solution: Verify backend CORS settings in main.py
origins = ["http://localhost:5173"]
```

**Issue: Module not found (backend)**
```
Solution: Activate virtual environment
$ source venv/bin/activate  # Linux/Mac
$ venv\Scripts\activate     # Windows
```

## Development Workflow

1. **Start PostgreSQL**
```bash
# Check status
pg_isready

# Start if needed
sudo service postgresql start  # Linux
brew services start postgresql # Mac
```

2. **Start Backend**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

3. **Start Frontend**
```bash
cd frontend
npm run dev
```

4. **Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## Support

For issues or questions, please check:
1. This documentation
2. API documentation at `/docs`
3. Console logs for errors
4. Database logs for SQL issues

---

**Last Updated:** March 12, 2026
**Version:** 1.0.0
**Status:** Development
