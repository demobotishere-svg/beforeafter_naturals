import cv2
import sys
import json
import os
import numpy as np

import mediapipe as mp

def analyze_video(video_path):
    if not os.path.exists(video_path):
        return {"error": f"File not found: {video_path}"}
        
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"error": f"Could not open video: {video_path}"}
        
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0:
        fps = 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Use Dual Haar Cascades to replace MediaPipe (which breaks on Python 3.12)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')
    
    scenes = []
    faces_detected = 0
    sharpness_scores = []
    
    prev_frame = None
    frame_idx = 0
    
    # Subsample frames to speed up analysis (e.g. check 3 frames per sec)
    subsample_rate = max(1, int(fps / 3))
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_idx % subsample_rate == 0:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Sharpness (Laplacian variance)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            sharpness_scores.append(float(laplacian_var))
            
            # Scene detection (absolute diff)
            if prev_frame is not None:
                diff = cv2.absdiff(gray, prev_frame)
                _, thresh = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)
                non_zero = np.count_nonzero(thresh)
                
                # 45% threshold to avoid H.264 keyframe false positives
                if non_zero > (gray.size * 0.45):  
                    scenes.append({
                        "timestamp": round(frame_idx / fps, 2),
                        "frame": frame_idx
                    })
            
            # Face detection (Frontal)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))
            faces_detected += len(faces)
            
            # Face detection (Profile - catches side-angles in the salon)
            profiles = profile_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))
            faces_detected += len(profiles)
                
            prev_frame = gray
            
        frame_idx += 1
            
    cap.release()
    
    avg_sharpness = sum(sharpness_scores) / len(sharpness_scores) if sharpness_scores else 0
    
    return {
        "duration": round(total_frames / fps, 2),
        "fps": fps,
        "scenes_detected": len(scenes),
        "scene_cuts": scenes,
        "face_presence_score": faces_detected,
        "average_sharpness": round(avg_sharpness, 2),
        "is_blurry": avg_sharpness < 100 # adjusted threshold
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No video paths provided"}))
        sys.exit(1)
        
    video_paths = sys.argv[1:]
    results = {}
    
    for i, path in enumerate(video_paths):
        # We assume the paths passed are ordered based on the pipeline
        role = "entering"
        if i == 1: role = "choosing"
        elif i == 2: role = "haircut"
        elif i == 3: role = "reveal"
        
        results[role] = analyze_video(path)
        
    print(json.dumps(results))

if __name__ == "__main__":
    main()
