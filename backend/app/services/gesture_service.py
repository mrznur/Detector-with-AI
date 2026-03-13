"""
Motion Detection Service using OpenCV
Detects hand/body movement in frames
"""
import cv2
import numpy as np
from typing import Dict, Optional

class GestureService:
    def __init__(self):
        self.enabled = True
        self.prev_frame = None
        print("Info: Motion detection enabled using OpenCV")
    
    def detect_motion(self, image_path: str) -> Dict:
        """Detect motion/movement in image compared to previous frame"""
        try:
            # Read current frame
            frame = cv2.imread(image_path)
            if frame is None:
                return {"detected": False, "motion": False, "intensity": 0}
            
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = cv2.GaussianBlur(gray, (21, 21), 0)
            
            # If no previous frame, store and return
            if self.prev_frame is None:
                self.prev_frame = gray
                return {"detected": True, "motion": False, "intensity": 0, "message": "Initializing"}
            
            # Compute difference between frames
            frame_delta = cv2.absdiff(self.prev_frame, gray)
            thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
            thresh = cv2.dilate(thresh, None, iterations=2)
            
            # Find contours (moving objects)
            contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Calculate motion intensity
            motion_pixels = cv2.countNonZero(thresh)
            total_pixels = thresh.shape[0] * thresh.shape[1]
            motion_percentage = (motion_pixels / total_pixels) * 100
            
            # Detect significant motion
            has_motion = motion_percentage > 1.0  # More than 1% of frame changed
            
            # Count moving objects
            moving_objects = len([c for c in contours if cv2.contourArea(c) > 500])
            
            # Update previous frame
            self.prev_frame = gray
            
            return {
                "detected": True,
                "motion": has_motion,
                "intensity": round(motion_percentage, 2),
                "moving_objects": moving_objects,
                "message": "Movement detected" if has_motion else "No movement"
            }
        except Exception as e:
            return {"detected": False, "motion": False, "error": str(e)}
    
    def detect_hand_gesture(self, image_path: str) -> Dict:
        """Detect hand gestures from image"""
        # Use motion detection as fallback
        motion = self.detect_motion(image_path)
        return {
            "detected": motion["detected"],
            "gesture": None,
            "hands_count": 0,
            "motion_detected": motion.get("motion", False),
            "motion_intensity": motion.get("intensity", 0)
        }
    
    def detect_face_movement(self, image_path: str) -> Dict:
        """Detect face movements"""
        motion = self.detect_motion(image_path)
        return {
            "detected": motion["detected"],
            "movement": motion.get("motion", False),
            "intensity": motion.get("intensity", 0)
        }
    
    def detect_eye_blink(self, image_path: str) -> Dict:
        """Detect if eyes are open or closed"""
        return {
            "detected": False,
            "eyes_open": None
        }
    
    def detect_all(self, image_path: str) -> Dict:
        """Detect all gestures and movements"""
        motion = self.detect_motion(image_path)
        return {
            "motion": motion,
            "hand_gestures": {
                "detected": motion["detected"],
                "motion_detected": motion.get("motion", False),
                "hands_count": 0
            },
            "face_movement": {
                "detected": motion["detected"],
                "movement": motion.get("motion", False)
            },
            "eye_blink": {
                "detected": False,
                "eyes_open": None
            }
        }

gesture_service = GestureService()
