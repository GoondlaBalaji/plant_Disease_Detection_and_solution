import os
import io
import json
import time
import csv
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import tensorflow as tf

# ---------- Configuration ----------
ROOT = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(ROOT, "model")
TFLITE_MODEL_PATH = os.path.join(MODEL_DIR, "model.tflite")
LABELS_PATH = os.path.join(ROOT, "labels.json")
DATA_PATH = os.path.join(ROOT, "data.json")
LOG_DIR = os.path.join(ROOT, "logs")
os.makedirs(LOG_DIR, exist_ok=True)
PRED_LOG = os.path.join(LOG_DIR, "predictions.csv")

# Default input size (adjusted later from model)
input_shape = (224, 224)

MAX_CONTENT_LENGTH = 6 * 1024 * 1024  # 6 MB

# ---------- Initialize Flask ----------
app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
CORS(app)

# ---------- Load labels & solutions ----------
try:
    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        LABELS = json.load(f)
except Exception:
    LABELS = {}
    print("Warning: labels.json not found or invalid.")

try:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        DATA = json.load(f)
except Exception:
    DATA = {}
    print("Warning: data.json not found or invalid.")

# ---------- Load TFLite model ----------
if os.path.exists(TFLITE_MODEL_PATH):
    interpreter = tf.lite.Interpreter(model_path=TFLITE_MODEL_PATH)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    shape = input_details[0]['shape']
    if len(shape) >= 3:
        input_shape = (int(shape[1]), int(shape[2]))
    print("TFLite model loaded from", TFLITE_MODEL_PATH)
else:
    interpreter = None
    print("Error: model.tflite not found in model/ folder")

# ---------- Utility functions ----------
def preprocess_image_bytes(image_bytes, target_size=input_shape):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(target_size, Image.BILINEAR)
    arr = np.array(img).astype(np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)
    return arr


def predict_tflite(x):
    if interpreter is None:
        raise ValueError("TFLite interpreter not loaded")
    input_dtype = input_details[0]['dtype']
    x_to_set = x.astype(input_dtype)
    if np.issubdtype(input_dtype, np.integer):
        x_to_set = (x * 255).astype(input_dtype)
    interpreter.set_tensor(input_details[0]['index'], x_to_set)
    interpreter.invoke()
    out = interpreter.get_tensor(output_details[0]['index'])
    return np.array(out).reshape(-1)


def top_k_from_preds(preds, k=3):
    preds = np.array(preds)
    idxs = preds.argsort()[::-1][:k]
    results = []
    for i in idxs:
        prob = float(preds[i])
        label = LABELS.get(str(i), f"Class {i}")
        solution = DATA.get(label, "No solution available")
        results.append({
            "index": int(i),
            "label": label,
            "probability": prob,
            "solution": solution
        })
    return results


def log_prediction(entry):
    header = ["timestamp", "filename", "top1_label", "top1_prob", "all_json"]
    exists = os.path.exists(PRED_LOG)
    with open(PRED_LOG, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not exists:
            writer.writerow(header)
        writer.writerow([
            entry.get("ts"),
            entry.get("filename"),
            entry.get("top1_label"),
            entry.get("top1_prob"),
            json.dumps(entry.get("all"))
        ])

# ---------- Routes ----------
@app.route("/")
def index():
    try:
        return render_template("index.html")
    except Exception:
        return jsonify({"status": "backend running"})


@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "tflite_loaded": interpreter is not None,
        "input_shape": input_shape
    })


@app.route("/predict", methods=["POST"])
def predict():
    start = time.time()
    upload = request.files.get("image") or request.files.get("file")
    if upload is None or upload.filename == "":
        return jsonify({"error": "No file uploaded"}), 400

    try:
        img_bytes = upload.read()
        x = preprocess_image_bytes(img_bytes, target_size=input_shape)
    except Exception as e:
        return jsonify({"error": "failed to process image", "details": str(e)}), 400

    try:
        preds = predict_tflite(x)
    except Exception as e:
        return jsonify({"error": "prediction failed", "details": str(e)}), 500

    topk = top_k_from_preds(preds, k=3)
    resp = {
        "predictions": topk,
        "inference_time_s": round(time.time() - start, 3)
    }

    try:
        log_prediction({
            "ts": time.strftime("%Y-%m-%d %H:%M:%S"),
            "filename": upload.filename,
            "top1_label": topk[0]["label"],
            "top1_prob": topk[0]["probability"],
            "all": topk
        })
    except Exception:
        pass

    return jsonify(resp)

# ---------- Startup ----------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
