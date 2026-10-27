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
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            strip_accents="unicode",
            ngram_range=(1, 2),
            max_features=12000,
            sublinear_tf=True
        )),
        ("classifier", LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        )),
    ])
    _model.fit(texts, labels)
    _training_count = len(texts)
    return {"trained": True, "training_examples": _training_count, "classes": sorted(set(labels))}


def extract_top_features(sample: str, top_k: int = 5) -> list[dict[str, Any]]:
    """
    Extracts the highest-impact n-grams driving the phishing prediction.
    Provides human-readable explainability for ML decisions.
    """
    if _model is None:
        return []

    tfidf: TfidfVectorizer = _model.named_steps["tfidf"]
    clf: LogisticRegression = _model.named_steps["classifier"]

    # Transform current email sample
    vector = tfidf.transform([sample])
    feature_names = tfidf.get_feature_names_out()

    classes = list(clf.classes_)
    phishing_index = classes.index("phishing")
    coefs = clf.coef_[0] if len(classes) == 2 and phishing_index == 1 else -clf.coef_[0]

    # Calculate contribution = tfidf_weight * model_coefficient
    row = vector.tocoo()
    contributions = []
    for col_idx, tfidf_val in zip(row.col, row.data):
        weight = coefs[col_idx]
        impact = weight * tfidf_val
        if impact > 0:  # Positively correlates with phishing
            contributions.append({
                "term": feature_names[col_idx],
                "impact_score": round(float(impact), 3)
            })

    # Sort descending by positive impact
    contributions.sort(key=lambda x: x["impact_score"], reverse=True)
    return contributions[:top_k]


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

    top_signals = extract_top_features(sample, top_k=5)

    return {
        "prediction": prediction,
        "phishing_probability": round(probability * 100),
        "top_features": top_signals,
        "training_examples": _training_count,
        "model_name": "TF-IDF + Logistic Regression",
        "model_note": "Explainable model: feature weights highlight key phishing language cues.",
    }
