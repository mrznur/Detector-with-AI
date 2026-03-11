from deepface import DeepFace
import numpy as np
import cv2
import pickle
from pathlib import Path
from PIL import Image
import pillow_heif
from ..core.face_config import face_config

class FaceService:
    def __init__(self):
        # Use configuration
        self.model_name = face_config.MODEL_NAME
        self.detector_backend = face_config.DETECTOR_BACKEND
        self.align = face_config.ALIGN_FACES
        self.enforce_detection = face_config.ENFORCE_DETECTION
        self.use_preprocessing = face_config.USE_PREPROCESSING
        
        # Register HEIF opener with Pillow
        pillow_heif.register_heif_opener()
        
        # Load OpenCV face detector only if preprocessing is enabled
        if self.use_preprocessing:
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
    
    def convert_heic_to_jpg(self, image_path: str) -> str:
        """Convert any image format (HEIC, PNG, WebP, etc.) to JPEG for consistent processing"""
        path = Path(image_path)
        
        # Check if conversion is needed
        if path.suffix.lower() not in ['.jpg', '.jpeg']:
            try:
                # Open image (supports HEIC, PNG, WebP, BMP, TIFF, etc.)
                img = Image.open(image_path)
                
                # Convert to RGB if necessary (handles PNG transparency, RGBA, etc.)
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Create white background for transparent images
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Save as JPEG
                jpg_path = path.with_suffix('.jpg')
                img.save(jpg_path, 'JPEG', quality=95)
                
                return str(jpg_path)
            except Exception as e:
                raise Exception(f"Failed to convert image to JPEG: {str(e)}")
        
        return image_path
        
    def preprocess_image(self, image_path: str) -> str:
        """Lightweight preprocessing for better quality"""
        img = cv2.imread(image_path)
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(100, 100))
        
        if len(faces) == 0:
            return image_path  # Return original if no face detected
        
        # Get the largest face and crop
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        padding = int(w * 0.1)
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(img.shape[1] - x, w + 2 * padding)
        h = min(img.shape[0] - y, h + 2 * padding)
        
        face_img = img[y:y+h, x:x+w]
        
        # Save cropped image
        preprocessed_path = str(Path(image_path).parent / f"preprocessed_{Path(image_path).name}")
        cv2.imwrite(preprocessed_path, face_img)
        
        return preprocessed_path
        
    def extract_embedding(self, image_path: str) -> np.ndarray:
        """Extract face embedding with universal image format support"""
        try:
            # Convert any image format to JPG for consistent processing
            image_path = self.convert_heic_to_jpg(image_path)
            
            # Optional preprocessing
            if self.use_preprocessing:
                image_path = self.preprocess_image(image_path)
            
            # Extract embedding
            embedding_obj = DeepFace.represent(
                img_path=image_path,
                model_name=self.model_name,
                detector_backend=self.detector_backend,
                enforce_detection=self.enforce_detection,
                align=self.align
            )
            
            # Clean up preprocessed image if created
            if self.use_preprocessing and "preprocessed_" in image_path:
                Path(image_path).unlink(missing_ok=True)
            
            return np.array(embedding_obj[0]["embedding"])
        except Exception as e:
            raise Exception(f"Failed to extract face embedding: {str(e)}")
    
    def compare_faces(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Compare two face embeddings - optimized"""
        # Normalize embeddings
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        # Cosine similarity
        similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
        return float(similarity)
    
    def serialize_embedding(self, embedding: np.ndarray) -> bytes:
        """Convert numpy array to bytes for database storage"""
        return pickle.dumps(embedding)
    
    def deserialize_embedding(self, embedding_bytes: bytes) -> np.ndarray:
        """Convert bytes back to numpy array"""
        return pickle.loads(embedding_bytes)

face_service = FaceService()
