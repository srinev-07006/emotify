import io
import base64
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading FER model...")
from fer import FER
detector = FER(mtcnn=False)
print("FER model loaded.")

class ImageInput(BaseModel):
    image: str

@app.post("/predict")
def predict(data: ImageInput):
    try:
        img_bytes = base64.b64decode(data.image)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img_array = np.array(img)
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

        result = detector.detect_emotions(img_bgr)

        if not result:
            # No face detected — analyze full image anyway
            emotions_raw = detector.predict_emotions(img_bgr, logits=False)
            if emotions_raw is not None:
                emotion_labels = ['angry','disgust','fear','happy','sad','surprise','neutral']
                scores = {emotion_labels[i]: float(emotions_raw[i]) for i in range(len(emotion_labels))}
                dominant = max(scores, key=scores.get)
            else:
                return {"emotion": "neutral", "confidence": 0.5, "all_scores": {}}
        else:
            scores = result[0]["emotions"]
            dominant = max(scores, key=scores.get)

        return {
            "emotion": dominant,
            "confidence": round(float(scores[dominant]), 4),
            "all_scores": {k: round(float(v), 4) for k, v in scores.items()}
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}