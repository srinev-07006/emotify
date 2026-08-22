import io
import base64
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deepface import DeepFace
import tempfile, os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageInput(BaseModel):
    image: str

@app.post("/predict")
def predict(data: ImageInput):
    try:
        img_bytes = base64.b64decode(data.image)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # Save to temp file — DeepFace needs a file path
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            img.save(tmp.name)
            tmp_path = tmp.name

        result = DeepFace.analyze(
            tmp_path,
            actions=["emotion"],
            enforce_detection=False,
            detector_backend="opencv"  # change from default opencv
        )
        os.unlink(tmp_path)

        emotions = result[0]["emotion"]
        dominant = str(result[0]["dominant_emotion"])
        confidence = float(emotions[dominant]) / 100

        return {
            "emotion": dominant,
            "confidence": round(confidence, 4),
            "all_scores": {k: round(float(v) / 100, 4) for k, v in emotions.items()}
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "model": "deepface"}