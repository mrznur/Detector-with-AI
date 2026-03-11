from deepface import DeepFace
import numpy as np
import cv2
import pickle
from pathlib import Path
from ..core.face_config import face_config

class FaceService:
    def __init__(self):
        # Use configuration for better accuracy
        self.model_name = face_config.MODEL_NAME
        self.detector_backend = face_config.DETECTOR_BACKEND
        self.align = face_config.ALIGN_FACES
        self.enforce_detection = face_config.ENFORCE_DETECTION
        
        # Load OpenCV face detector for preprocessing
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
    def preprocess_image(self, image_path: str) -> str:
        """Preprocess image using OpenCV for better quality"""
        img = cv2.imread(image_path)
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(100, 100)
        )
        
        if len(faces) == 0:
            raise Exception("No face detected in image")
        
        # Get the largest face
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        
        # Add padding around face
        padding = int(w * 0.2)
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(img.shape[1] - x, w + 2 * padding)
        h = min(img.shape[0] - y, h + 2 * padding)
        
        # Crop face
        face_img = img[y:y+h, x:x+w]
        
        # Enhance image quality
        # 1. Histogram equalization for better lighting
        lab = cv2.cvtColor(face_img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        enhanced = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
        
        # 2. Denoise
        enhanced = cv2.fastNlMeansDenoisingColored(enhanced, None, 10, 10, 7, 21)
        
        # 3. Sharpen
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        enhanced = cv2.filter2D(enhanced, -1, kernel)
        
        # Save preprocessed image
        preprocessed_path = str(Path(image_path).parent / f"preprocessed_{Path(image_path).name}")
        cv2.imwrite(preprocessed_path, enhanced)
        
        return preprocessed_path
        
    def extract_embedding(self, image_path: str) -> np.ndarray:
        """Extract face embedding from an image with OpenCV preprocessing"""
        try:
            # Preprocess image with OpenCV
            preprocessed_path = self.preprocess_image(image_path)
            
            # DeepFace will detect face and extract embedding
            embedding_obj = DeepFace.represent(
                img_path=preprocessed_path,
                model_name=self.model_name,
                detector_backend=self.detector_backend,
                enforce_detection=self.enforce_detection,
                align=self.align
            )
            
            # Clean up preprocessed image
            Path(preprocessed_path).unlink(missing_ok=True)
            
            # Return the embedding vector
            return np.array(embedding_obj[0]["embedding"])
        except Exception as e:
            raise Exception(f"Failed to extract face embedding: {str(e)}")
    
    def compare_faces(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Compare two face embeddings and return similarity score (0-1)"""
        # Normalize embeddings for better comparison
        embedding1_norm = embedding1 / np.linalg.norm(embedding1)
        embedding2_norm = embedding2 / np.linalg.norm(embedding2)
        
        # Calculate cosine similarity
        similarity = np.dot(embedding1_norm, embedding2_norm)
        return float(similarity)
    
    def serialize_embedding(self, embedding: np.ndarray) -> bytes:
        """Convert numpy array to bytes for database storage"""
        return pickle.dumps(embedding)
    
    def deserialize_embedding(self, embedding_bytes: bytes) -> np.ndarray:
        """Convert bytes back to numpy array"""
        return pickle.loads(embedding_bytes)

face_service = FaceService()
