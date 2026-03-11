"""
Face Recognition Configuration
Adjust these settings to balance accuracy vs speed
"""

class FaceRecognitionConfig:
    # Model Selection
    # Options: "VGG-Face" (most accurate), "Facenet" (fast), "ArcFace" (balanced)
    MODEL_NAME = "Facenet"  # Fast model for better performance
    
    # Detector Backend
    # Options: "opencv" (fast), "retinaface" (accurate), "mtcnn" (balanced)
    DETECTOR_BACKEND = "opencv"
    
    # Verification Threshold (0.0 to 1.0)
    # Higher = stricter matching, fewer false positives
    # Lower = looser matching, more false positives
    VERIFICATION_THRESHOLD = 0.65  # 65%
    
    # Face Alignment
    # True = Better accuracy, slightly slower
    # False = Faster, slightly less accurate
    ALIGN_FACES = False  # Disabled for speed
    
    # Enforce Detection
    # True = Reject images without clear faces
    # False = Try to process even unclear images
    ENFORCE_DETECTION = True
    
    # OpenCV Preprocessing
    # True = Better quality, slower
    # False = Faster processing
    USE_PREPROCESSING = False  # Disabled for speed

# Model Comparison:
# 
# VGG-Face:
#   - Accuracy: ★★★★★ (Best)
#   - Speed: ★★★☆☆ (Moderate)
#   - Use case: High security, accurate identification
#
# Facenet:
#   - Accuracy: ★★★★☆ (Good)
#   - Speed: ★★★★★ (Fastest)
#   - Use case: Real-time detection, speed priority
#
# ArcFace:
#   - Accuracy: ★★★★★ (Excellent)
#   - Speed: ★★★☆☆ (Moderate)
#   - Use case: Balanced accuracy and speed
#
# Facenet512:
#   - Accuracy: ★★★★☆ (Very Good)
#   - Speed: ★★★★☆ (Fast)
#   - Use case: Good balance

face_config = FaceRecognitionConfig()
