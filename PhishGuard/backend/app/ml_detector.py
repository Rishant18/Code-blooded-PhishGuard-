from __future__ import annotations

import csv
from pathlib import Path
from typing import Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "training_emails.csv"
_model: Pipeline | None = None
_training_count = 0


def train_model() -> dict[str, Any]:
    """Train the demo text classifier from the bundled labelled examples."""
    global _model, _training_count
    texts: list[str] = []
    labels: list[str] = []
    with DATA_PATH.open("r", newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            texts.append(f"Subject: {row['subject']}\n{row['body']}")
            labels.append(row["label"])
    if len(set(labels)) < 2 or len(texts) < 10:
        raise RuntimeError("The ML training CSV must contain at least 10 examples from both classes.")
    _model = Pipeline([
        ("tfidf", TfidfVectorizer(lowercase=True, strip_accents="unicode", ngram_range=(1, 2), max_features=12000, sublinear_tf=True)),
        ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)),
    ])
    _model.fit(texts, labels)
    _training_count = len(texts)
    return {"trained": True, "training_examples": _training_count, "classes": sorted(set(labels))}


def predict_email(subject: str, body: str) -> dict[str, Any]:
    if _model is None:
        train_model()
    assert _model is not None
    sample = f"Subject: {subject}\n{body}"
    probabilities = _model.predict_proba([sample])[0]
    classes = list(_model.named_steps["classifier"].classes_)
    phishing_index = classes.index("phishing")
    probability = float(probabilities[phishing_index])
    prediction = "Likely phishing" if probability >= 0.5 else "Likely legitimate"
    return {
        "prediction": prediction,
        "phishing_probability": round(probability * 100),
        "training_examples": _training_count,
        "model_name": "TF-IDF + Logistic Regression",
        "model_note": "Experimental demo model trained on bundled synthetic examples; not validated for real-world accuracy.",
    }
