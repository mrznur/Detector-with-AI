# Face Detection System

A full-stack face recognition and presence detection system with real-time verification capabilities.

## Features

- **Person Management**: Create and manage registered persons with details
- **Face Enrollment**: Upload face photos to enroll persons in the system
- **Face Verification**: Upload photos to verify identity against enrolled faces
- **Presence Logging**: Track when and where persons are detected
- **Camera Management**: Register and manage detection cameras
- **Real-time Dashboard**: View system statistics and activity

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Database for storing persons, cameras, logs, and face embeddings
- **SQLAlchemy**: ORM for database operations
- **DeepFace**: AI-powered face recognition using FaceNet model
- **TensorFlow**: Deep learning framework for face embeddings

### Frontend
- **React**: UI library
- **React Router**: Client-side routing
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool

## Project Structure

```
Detection/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   │   ├── persons.py
│   │   │   ├── cameras.py
│   │   │   ├── faces.py
│   │   │   └── logs.py
│   │   ├── core/         # Core configuration
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── models/       # Database models
│   │   │   ├── person.py
│   │   │   ├── camera.py
│   │   │   ├── face_embedding.py
│   │   │   └── presence_log.py
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   │   └── face_service.py
│   │   └── main.py       # FastAPI app
│   ├── uploads/          # Uploaded face images
│   ├── .env              # Environment variables
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── components/   # Reusable components
│   │   ├── routes/       # Page components
│   │   │   ├── dashboard.tsx
│   │   │   ├── persons.tsx
│   │   │   ├── cameras.tsx
│   │   │   ├── verification.tsx
│   │   │   └── logs.tsx
│   │   ├── lib/          # Utilities
│   │   │   └── api.ts
│   │   └── root.tsx
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 18+

### Database Setup

1. Install PostgreSQL and create database:
```bash
createdb detection_db
```

2. Create database user:
```sql
CREATE USER detection_user WITH PASSWORD 'MySecurePass123';
GRANT ALL PRIVILEGES ON DATABASE detection_db TO detection_user;
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables in `backend/.env`:
```env
DATABASE_URL=postgresql://detection_user:MySecurePass123@localhost/detection_db
```

5. Start the backend server:
```bash
uvicorn app.main:app --reload
```

Backend will run at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

## Usage

### 1. Create a Person
- Navigate to "Persons" page
- Click "Add Person"
- Fill in required name and optional details:
  - **Name** (required): Full name of the person
  - **Age** (optional): Person's age
  - **Gender** (optional): Male, Female, or Other
  - **Employee ID** (optional): Unique identifier for workplace scenarios
- Click "Create Person"

### 2. Enroll Face
- On the Persons page, click "Enroll Face" for a person
- Upload a clear face photo
- Click "Upload" to save the face embedding

### 3. Verify Face
- Navigate to "Verification" page
- Upload a photo to verify
- Click "Verify Face"
- System will show if the face matches any enrolled person with confidence score

### 4. View Logs
- Navigate to "Logs" page
- View all detection events with timestamps and confidence scores

## API Endpoints

### Persons
- `GET /api/v1/persons` - List all persons
- `POST /api/v1/persons` - Create new person
- `GET /api/v1/persons/{id}` - Get person details
- `PUT /api/v1/persons/{id}` - Update person
- `DELETE /api/v1/persons/{id}` - Delete person

### Cameras
- `GET /api/v1/cameras` - List all cameras
- `POST /api/v1/cameras` - Register new camera
- `GET /api/v1/cameras/{id}` - Get camera details
- `PUT /api/v1/cameras/{id}` - Update camera
- `DELETE /api/v1/cameras/{id}` - Delete camera

### Face Recognition
- `POST /api/v1/faces/enroll/{person_id}` - Enroll face for person
- `POST /api/v1/faces/verify` - Verify face against enrolled persons
- `GET /api/v1/faces/person/{person_id}/embeddings` - Get person's face embeddings

### Logs
- `GET /api/v1/logs` - List all presence logs
- `POST /api/v1/logs` - Create presence log
- `GET /api/v1/logs/{id}` - Get log details

## Face Recognition Details

### Model
- **FaceNet**: 128-dimensional face embeddings
- **Similarity Threshold**: 60% for positive match
- **Comparison Method**: Cosine similarity

### How It Works
1. **Enrollment**: Extract 128-dimensional embedding vector from face photo and store in database
2. **Verification**: Extract embedding from test photo and compare with all enrolled embeddings
3. **Matching**: Calculate cosine similarity; match if similarity ≥ 60%

## Database Schema

### Tables
- **persons**: User information (name, age, gender, employee_id)
- **cameras**: Camera registration (name, location, stream_url, status)
- **face_embeddings**: Face embedding vectors (person_id, embedding binary, version)
- **presence_logs**: Detection events (person_id, camera_id, timestamp, confidence_score)

## Development

### Backend Testing
```bash
# Test API endpoints
curl http://localhost:8000/api/v1/persons
```

### Frontend Development
```bash
# Run with hot reload
npm run dev

# Build for production
npm run build
```

## Troubleshooting

### Backend Issues
- **Database connection error**: Check PostgreSQL is running and credentials in `.env`
- **Module not found**: Ensure virtual environment is activated and dependencies installed
- **Face detection fails**: Ensure uploaded image has a clear, visible face

### Frontend Issues
- **API connection error**: Verify backend is running at `http://localhost:8000`
- **CORS errors**: Backend has CORS enabled for `http://localhost:5173`

## Next Steps

- [ ] Implement live camera detection
- [ ] Add WebSocket for real-time updates
- [ ] Implement anti-spoofing detection
- [ ] Add user authentication
- [ ] Deploy to production

## License

MIT
