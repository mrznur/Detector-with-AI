"""Motion detection using OpenCV frame differencing"""
import cv2
import numpy as np
from typing import Dict

class GestureService:
    def __init__(self):
        self.prev_frame = None

    def detect_motion(self, image_path: str) -> Dict:
        try:
            frame = cv2.imread(image_path)
            if frame is None:
                return {"detected": False, "motion": False, "intensity": 0}

            gray = cv2.GaussianBlur(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), (21, 21), 0)

            if self.prev_frame is None:
                self.prev_frame = gray
                return {"detected": True, "motion": False, "intensity": 0}

            thresh = cv2.dilate(
                cv2.threshold(cv2.absdiff(self.prev_frame, gray), 25, 255, cv2.THRESH_BINARY)[1],
                None, iterations=2
            )
            contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            motion_pct = (cv2.countNonZero(thresh) / (thresh.shape[0] * thresh.shape[1])) * 100
            has_motion = motion_pct > 1.0
            moving_objects = len([c for c in contours if cv2.contourArea(c) > 500])

            self.prev_frame = gray
            return {
                "detected": True,
                "motion": has_motion,
                "intensity": round(motion_pct, 2),
                "moving_objects": moving_objects,
                "message": "Movement detected" if has_motion else "No movement"
            }
        except Exception as e:
            return {"detected": False, "motion": False, "error": str(e)}

gesture_service = GestureService()
