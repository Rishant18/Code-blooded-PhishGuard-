from __future__ import annotations

import email
import json
import re
import sqlite3
from datetime import datetime, timezone
from email import policy
from email.parser import BytesParser
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.ml_detector import predict_email, train_model

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "phishguard.db"

app = FastAPI(
    title="PhishGuard API",
    description="Explainable email triage prototype. Results are heuristic and advisory.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


class AnalyseRequest(BaseModel):
    email_text: str = Field(min_length=5, max_length=200_000)


def connect_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with connect_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                sender TEXT,
                subject TEXT,
                risk_score INTEGER NOT NULL,
                verdict TEXT NOT NULL,
                indicators_json TEXT NOT NULL,
                email_excerpt TEXT NOT NULL
            )
        """)


@app.on_event("startup")
def startup() -> None:
    init_db()
    train_model()


def parse_email_text(raw: str) -> dict[str, str]:
    # Parse standard headers when present; pasted plain text is also supported.
    msg = email.message_from_string(raw, policy=policy.default)
    sender = str(msg.get("From", "")).strip()
    subject = str(msg.get("Subject", "")).strip()

    body = ""
    if msg.is_multipart():
        chunks = []
        for part in msg.walk():
            if part.get_content_type() == "text/plain" and not part.get_filename():
                try:
                    chunks.append(part.get_content())
                except Exception:
                    continue
        body = "\n".join(chunks)
    else:
        try:
            payload = msg.get_content()
            body = payload if isinstance(payload, str) else str(payload)
        except Exception:
            body = raw

    # For plain text without parseable mail headers, analyse the full text.
    if not body.strip() or (not sender and not subject):
        body = raw

    return {"sender": sender, "subject": subject, "body": body, "raw": raw}


def extract_urls(text: str) -> list[str]:
    found = re.findall(r"""(?i)\b(?:https?://|www\.)[^\s<>"'()\]]+""", text)
    cleaned = []
    for item in found:
        url = item.rstrip(".,;:!?")
        if url not in cleaned:
            cleaned.append(url)
    return cleaned[:100]


def host_from_url(url: str) -> str:
    candidate = url if url.lower().startswith(("http://", "https://")) else "http://" + url
    try:
        return (urlparse(candidate).hostname or "").lower()
    except ValueError:
        return ""


def analyse(raw: str) -> dict[str, Any]:
    parsed = parse_email_text(raw)
    text = f"{parsed['subject']}\n{parsed['body']}\n{parsed['raw']}".lower()
    urls = extract_urls(parsed["body"] + "\n" + parsed["raw"])
    indicators: list[dict[str, Any]] = []
    score = 0

    def add(key: str, title: str, severity: str, points: int, evidence: str, explanation: str) -> None:
        nonlocal score
        indicators.append({
            "key": key,
            "title": title,
            "severity": severity,
            "points": points,
            "evidence": evidence,
            "explanation": explanation,
        })
        score += points

    urgency_terms = [
        "urgent", "immediately", "act now", "within 24 hours", "account suspended",
        "verify your account", "unusual activity", "final warning", "limited time",
    ]
    matched_urgency = next((term for term in urgency_terms if term in text), None)
    if matched_urgency:
        add(
            "urgency", "Urgent or pressure-based language", "medium", 18,
            f"Matched phrase: “{matched_urgency}”",
            "Pressure language can be used to rush a recipient into acting before checking a message.",
        )

    credential_terms = ["password", "login", "sign in", "verify your identity", "credentials", "one-time password", "otp"]
    matched_credential = next((term for term in credential_terms if term in text), None)
    if matched_credential:
        add(
            "credentials", "Credential-related request", "medium", 20,
            f"Matched term: “{matched_credential}”",
            "Requests involving credentials or identity verification deserve careful review, especially when paired with links.",
        )

    if urls:
        add(
            "links", "Contains web links", "low", min(12, 4 + len(urls) * 2),
            f"{len(urls)} URL(s) found: " + ", ".join(urls[:3]),
            "Links are not inherently malicious. Check the destination and whether it matches the claimed sender before visiting.",
        )

    suspicious_url_findings = []
    for url in urls:
        host = host_from_url(url)
        if not host:
            continue
        reasons = []
        if host.startswith("xn--") or ".xn--" in host:
            reasons.append("internationalized/punycode hostname")
        if re.match(r"^\d{1,3}(?:\.\d{1,3}){3}$", host):
            reasons.append("IP-address hostname")
        if len(host) > 45:
            reasons.append("unusually long hostname")
        if host.count("-") >= 3:
            reasons.append("multiple hyphens in hostname")
        if reasons:
            suspicious_url_findings.append(f"{host}: {', '.join(reasons)}")
    if suspicious_url_findings:
        add(
            "url_shape", "Potentially unusual URL structure", "high", 24,
            "; ".join(suspicious_url_findings[:3]),
            "Some phishing links use unusual hostnames. This is a structural warning, not proof that a URL is malicious.",
        )

    if re.search(r"(?i)\b(?:gift card|wire transfer|payment overdue|bank details|update payment)\b", text):
        match = re.search(r"(?i)\b(?:gift card|wire transfer|payment overdue|bank details|update payment)\b", text)
        add(
            "payment", "Payment or financial pressure", "medium", 18,
            f"Matched phrase: “{match.group(0)}”",
            "Unexpected payment instructions or requests for financial details should be verified through a separate trusted channel.",
        )

    if parsed["sender"]:
        sender_host_match = re.search(r"@([A-Za-z0-9.-]+\.[A-Za-z]{2,})", parsed["sender"])
        sender_host = sender_host_match.group(1).lower() if sender_host_match else ""
        link_hosts = [host_from_url(url) for url in urls]
        link_hosts = [host for host in link_hosts if host]
        if sender_host and link_hosts and not any(
            host == sender_host or host.endswith("." + sender_host) or sender_host.endswith("." + host)
            for host in link_hosts
        ):
            add(
                "sender_link_mismatch", "Sender and link domains differ", "medium", 18,
                f"Sender domain: {sender_host}; link domain(s): {', '.join(link_hosts[:3])}",
                "A mismatch can be legitimate, but it is worth checking whether the link belongs to the organisation the email claims to represent.",
            )

    # Preserve the rule score and add an experimental ML estimate. The combined
    # score is a transparent blend, not a calibrated probability.
    rule_score = min(100, score)
ml_result = predict_email(parsed["subject"], parsed["body"] or parsed["raw"])

combined_score = round(
    0.55 * ml_result["phishing_probability"]
    + 0.45 * rule_score
)

# Escalate emails with multiple independent warning indicators.
if len(indicators) >= 3 and rule_score >= 40:
    combined_score = max(combined_score, 60)

score = min(100, combined_score)
    if score >= 60:
        verdict, action = "High risk", "Quarantine"
    elif score >= 25:
        verdict, action = "Needs review", "Review"
    else:
        verdict, action = "Lower risk", "Allow"

    if not indicators:
        summary = "No configured warning rules were triggered. Review the ML estimate too; absence of rule matches does not establish safety."
    else:
        summary = f"{len(indicators)} rule indicator(s) were triggered. The overall score also incorporates the experimental ML estimate. Review the evidence before taking action."

    return {
        "sender": parsed["sender"] or "Not identified",
        "subject": parsed["subject"] or "No subject detected",
        "risk_score": score,
        "rule_score": rule_score,
        "ml": ml_result,
        "verdict": verdict,
        "recommended_action": action,
        "summary": summary,
        "indicators": indicators,
        "urls": urls,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "method": "TF-IDF + Logistic Regression with rule-based indicators",
        "limitations": [
            "This is a heuristic prototype, not a guarantee of safety or maliciousness.",
            "The current version does not query external threat-intelligence services.",
            "The ML model is trained on bundled synthetic demonstration examples and has not been validated for real-world accuracy.",
            "The combined score is an experimental blend, not a calibrated probability.",
            "No links are opened and no attachments are executed.",
        ],
    }


def save_result(result: dict[str, Any], raw: str) -> int:
    with connect_db() as conn:
        cur = conn.execute(
            """INSERT INTO analyses
               (created_at, sender, subject, risk_score, verdict, indicators_json, email_excerpt)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                result["created_at"], result["sender"], result["subject"],
                result["risk_score"], result["verdict"],
                json.dumps(result["indicators"]), raw[:500],
            ),
        )
        return int(cur.lastrowid)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "PhishGuard API"}


@app.post("/api/analyse")
def analyse_text(payload: AnalyseRequest) -> dict[str, Any]:
    result = analyse(payload.email_text)
    result["id"] = save_result(result, payload.email_text)
    return result


@app.post("/api/analyse-file")
async def analyse_file(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename or not file.filename.lower().endswith(".eml"):
        raise HTTPException(status_code=400, detail="Please upload an .eml file.")
    content = await file.read(1_000_001)
    if len(content) > 1_000_000:
        raise HTTPException(status_code=413, detail="File is too large. Maximum size is 1 MB.")
    try:
        message = BytesParser(policy=policy.default).parsebytes(content)
        raw = message.as_string(policy=policy.default)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Could not parse this email file.") from exc
    result = analyse(raw)
    result["id"] = save_result(result, raw)
    return result


@app.get("/api/history")
def history(limit: int = 20) -> dict[str, Any]:
    limit = max(1, min(limit, 100))
    with connect_db() as conn:
        rows = conn.execute(
            """SELECT id, created_at, sender, subject, risk_score, verdict
               FROM analyses ORDER BY id DESC LIMIT ?""",
            (limit,),
        ).fetchall()
    return {"items": [dict(row) for row in rows]}


@app.delete("/api/history")
def clear_history() -> dict[str, bool]:
    with connect_db() as conn:
        conn.execute("DELETE FROM analyses")
    return {"cleared": True}
