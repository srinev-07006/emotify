# convert.py
import tensorflow as tf

# Try loading with compile=False to bypass config issues
model = tf.keras.models.load_model("best_model.keras", compile=False)

# Recompile and resave
model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.save("best_model_converted.keras")
print("Done")