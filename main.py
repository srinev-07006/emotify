import io
import base64
import tempfile
import os
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Preload DeepFace at startup so first request isn't slow
print("Loading DeepFace model...")
from deepface import DeepFace
# Warm up with a dummy call
import numpy as np
dummy = np.zeros((48, 48, 3), dtype=np.uint8)
dummy_path = "/tmp/dummy.jpg"
from PIL import Image as PILImage
PILImage.fromarray(dummy).save(dummy_path)
try:
    DeepFace.analyze(dummy_path, actions=["emotion"],
                     enforce_detection=False, detector_backend="skip")
except:
    pass
print("DeepFace model loaded.")

class ImageInput(BaseModel):
    image: str

@app.post("/predict")
def predict(data: ImageInput):
    try:
        img_bytes = base64.b64decode(data.image)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            img.save(tmp.name)
            tmp_path = tmp.name

        result = DeepFace.analyze(
            tmp_path,
            actions=["emotion"],
            enforce_detection=False,
            detector_backend="skip"
        )
        os.unlink(tmp_path)

        emotions = result[0]["emotion"]
        dominant = result[0]["dominant_emotion"]
        confidence = emotions[dominant] / 100

        return {
            "emotion": dominant,
            "confidence": round(confidence, 4),
            "all_scores": {k: round(v/100, 4) for k, v in emotions.items()}
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}