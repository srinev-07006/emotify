# test_deepface.py
from deepface import DeepFace
result = DeepFace.analyze("dataset/test/happy/PrivateTest_95094.jpg", actions=["emotion"], enforce_detection=False)
print(result[0]["dominant_emotion"])