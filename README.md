# Face Detection System

A full-stack face recognition and presence detection system with real-time verification and gesture detection capabilities.

## Features

- **Person Management**: Create and manage registered persons
- **Face Enrollment**: Upload face photos to enroll persons
- **Live Camera Detection**: Real-time face recognition with webcam
- **Gesture Detection**: Hand gestures, face movements, eye blink detection
- **Face Verification**: Upload photos to verify identity
- **Dashboard**: View system statistics

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Database for persons, cameras, logs, and face embeddings
- **SQLAlchemy**: ORM for database operations
- **DeepFace**: AI-powered face recognition (FaceNet model)
- **MediaPipe**: Real-time gesture and movement detection
- **TensorFlow**: Deep learning framework

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
│   │   ├── core/         # Configuration
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   ├── uploads/          # Uploaded images
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── components/   # Reusable components
│   │   ├── routes/       # Page components
│   │   └── lib/          # Utilities
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 18+

### Database Setup

```bash
createdb detection_db
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Configure `backend/.env`:
```env
DATABASE_URL=postgresql://detection_user:MySecurePass123@localhost/detection_db
```

Start backend:
```bash
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
```

Configure `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

Start frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

## Usage

1. **Create Person**: Add person with name, age, gender, employee ID
2. **Enroll Face**: Upload clear face photo for person
3. **Live Detection**: Start camera, enable detection, see real-time results
4. **Gestures**: System automatically detects hand gestures, face movements, eye blinks

## Gesture Detection

**Hand Gestures**:
- Fist, Peace sign, Thumbs up, Pointing, Open palm

**Face Movements**:
- Head direction (left/right/forward)
- Smile detection

**Eye Detection**:
- Eyes open/closed
- Blink detection

## Configuration

Edit `backend/app/core/face_config.py` to adjust:
- Face recognition model (Facenet, VGG-Face, ArcFace)
- Verification threshold (default: 65%)
- Face detector backend
- Face alignment settings

## API Endpoints

- `GET /api/v1/persons` - List persons
- `POST /api/v1/persons` - Create person
- `DELETE /api/v1/persons/{id}` - Delete person
- `POST /api/v1/faces/enroll/{person_id}` - Enroll face
- `POST /api/v1/faces/verify` - Verify face + detect gestures
- `GET /api/v1/logs` - List detection logs

Full API docs: `http://localhost:8000/docs`

## Database Management

Clear all data:
```bash
cd backend
python clear_database.py
```

Fix cascade delete:
```bash
python fix_cascade_delete.py
```

## License

MIT
