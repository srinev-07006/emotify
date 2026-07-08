import io
import base64
import numpy as np
import tensorflow as tf
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Emotify", description="Emotion Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
print("Loading model...")
model = tf.keras.models.load_model("best_model.h5")
print("Model loaded successfully.")

# Must match train_data.class_indices from your training output:
# {'angry':0, 'disgust':1, 'fear':2, 'happy':3, 'neutral':4, 'sad':5, 'surprise':6}
EMOTIONS = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]

class ImageInput(BaseModel):
    image: str  # base64 encoded JPEG or PNG

def preprocess(b64_string: str) -> np.ndarray:
    img_bytes = base64.b64decode(b64_string)
    img = Image.open(io.BytesIO(img_bytes)).convert("L")  # grayscale
    img = img.resize((96, 96))
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = arr.reshape(1, 96, 96, 1)
    return arr

@app.post("/predict")
def predict(data: ImageInput):
    try:
        arr = preprocess(data.image)
        preds = model.predict(arr, verbose=0)[0]
        idx = int(np.argmax(preds))
        emotion = EMOTIONS[idx]
        confidence = round(float(preds[idx]), 4)
        all_scores = {e: round(float(p), 4) for e, p in zip(EMOTIONS, preds)}

        return {
            "emotion": emotion,
            "confidence": confidence,
            "all_scores": all_scores
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "model": "loaded"}