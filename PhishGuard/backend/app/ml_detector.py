from __future__ import annotations

import csv
from pathlib import Path
from typing import Any
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "training_emails.csv"
MODEL_PATH = BASE_DIR / "data" / "phishguard_model.joblib"

_model: Pipeline | None = None
_training_count = 0


def train_and_save_model() -> dict[str, Any]:
    """Trains the classifier and serializes it to disk using joblib."""
    global _model, _training_count
    texts: list[str] = []
    labels: list[str] = []

    with DATA_PATH.open("r", newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            texts.append(f"Subject: {row['subject']}\n{row['body']}")
            labels.append(row["label"])

    if len(set(labels)) < 2 or len(texts) < 10:
        raise RuntimeError("The ML training CSV must contain examples from both classes.")

    _model = Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            strip_accents="unicode",
            ngram_range=(1, 2),
            max_features=15000,
            sublinear_tf=True
        )),
        ("classifier", LogisticRegression(
            max_iter=1000,
            C=1.5,
            class_weight="balanced",
            random_state=42
        )),
    ])

    _model.fit(texts, labels)
    _training_count = len(texts)

    # Save to disk
    joblib.dump({"model": _model, "count": _training_count}, MODEL_PATH)
    print(f"[ML Engine] Model successfully trained on {_training_count} samples and cached to {MODEL_PATH.name}")

    return {"trained": True, "training_examples": _training_count, "classes": sorted(set(labels))}


def load_model() -> None:
    """Loads the cached model from disk. Only trains if cache does not exist."""
    global _model, _training_count
    if MODEL_PATH.exists():
        try:
            cached = joblib.load(MODEL_PATH)
            _model = cached["model"]
            _training_count = cached["count"]
            print(f"[ML Engine] Fast-loaded cached model from disk ({_training_count} samples).")
            return
        except Exception as e:
            print(f"[ML Engine] Cache invalid, retraining: {e}")
    train_and_save_model()


def extract_top_features(sample: str, top_k: int = 5) -> list[dict[str, Any]]:
    if _model is None:
        load_model()
    assert _model is not None

    tfidf: TfidfVectorizer = _model.named_steps["tfidf"]
    clf: LogisticRegression = _model.named_steps["classifier"]

    vector = tfidf.transform([sample])
    feature_names = tfidf.get_feature_names_out()

    classes = list(clf.classes_)
    phishing_index = classes.index("phishing")
    coefs = clf.coef_[0] if len(classes) == 2 and phishing_index == 1 else -clf.coef_[0]

    row = vector.tocoo()
    contributions = []
    for col_idx, tfidf_val in zip(row.col, row.data):
        weight = coefs[col_idx]
        impact = weight * tfidf_val
        if impact > 0:
            contributions.append({
                "term": feature_names[col_idx],
                "impact_score": round(float(impact), 3)
            })

    contributions.sort(key=lambda x: x["impact_score"], reverse=True)
    return contributions[:top_k]


def predict_email(subject: str, body: str) -> dict[str, Any]:
    if _model is None:
        load_model()
    assert _model is not None

    sample = f"Subject: {subject}\n{body}"
    probabilities = _model.predict_proba([sample])[0]
    classes = list(_model.named_steps["classifier"].classes_)
    phishing_index = classes.index("phishing")
    probability = float(probabilities[phishing_index])
    prediction = "Likely phishing" if probability >= 0.5 else "Likely legitimate"

    top_signals = extract_top_features(sample, top_k=5)

    return {
        "prediction": prediction,
        "phishing_probability": round(probability * 100),
        "top_features": top_signals,
        "training_examples": _training_count,
        "model_name": "TF-IDF + Logistic Regression (Serialized)",
        "model_note": "Cached pipeline with explainable term impact extraction.",
    }
