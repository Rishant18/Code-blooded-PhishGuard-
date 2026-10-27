from __future__ import annotations

import email
import json
import re
import sqlite3
from datetime import datetime, timezone
from email import policy
from email.parser import BytesParser
from pathlib import Path
from typing import Any, Literal
from urllib.parse import urlparse

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.ml_detector import predict_email, train_model
from app.reputation import evaluate_reputation, extract_domain

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "phishguard.db"

app = FastAPI(
    title="PhishGuard API",
    description="Explainable email triage backend: Rules + ML + Reputation with human-in-the-loop analyst audit trail.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyseRequest(BaseModel):
    email_text: str = Field(min_length=5, max_length=200_000)


class AnalystActionRequest(BaseModel):
    action: Literal["ALLOW", "REVIEW", "QUARANTINE"]
    notes: str = Field(default="", max_length=1000)
    analyst_name: str = Field(default="Analyst-1", max_length=100)


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
                rule_score INTEGER NOT NULL DEFAULT 0,
                ml_score INTEGER NOT NULL DEFAULT 0,
                reputation_score INTEGER NOT NULL DEFAULT 0,
                recommended_action TEXT NOT NULL,
                analyst_action TEXT,
                analyst_notes TEXT,
                action_timestamp TEXT,
                analyst_name TEXT,
                indicators_json TEXT NOT NULL,
                email_excerpt TEXT NOT NULL
            )
        """)
        # Run safe migrations in case columns already exist
        existing_cols = [col[1] for col in conn.execute("PRAGMA table_info(analyses)").fetchall()]
        for col, col_type in [
            ("rule_score", "INTEGER NOT NULL DEFAULT 0"),
            ("ml_score", "INTEGER NOT NULL DEFAULT 0"),
            ("reputation_score", "INTEGER NOT NULL DEFAULT 0"),
            ("recommended_action", "TEXT DEFAULT 'REVIEW'"),
            ("analyst_action", "TEXT"),
            ("analyst_notes", "TEXT"),
            ("action_timestamp", "TEXT"),
            ("analyst_name", "TEXT"),
        ]:
            if col not in existing_cols:
                conn.execute(f"ALTER TABLE analyses ADD COLUMN {col} {col_type}")


@app.on_event("startup")
def startup() -> None:
    init_db()
    train_model()


def parse_email_text(raw: str) -> dict[str, str]:
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
    return cleaned[:50]


def analyse(raw: str) -> dict[str, Any]:
    parsed = parse_email_text(raw)
    text = f"{parsed['subject']}\n{parsed['body']}\n{parsed['raw']}".lower()
    urls = extract_urls(parsed["body"] + "\n" + parsed["raw"])
    
    rule_indicators: list[dict[str, Any]] = []
    rule_points = 0

    def add_rule(key: str, title: str, severity: str, points: int, evidence: str, explanation: str) -> None:
        nonlocal rule_points
        rule_indicators.append({
            "pillar": "Rules",
            "key": key,
            "title": title,
            "severity": severity,
            "points": points,
            "evidence": evidence,
            "explanation": explanation,
        })
        rule_points += points

    # --- Pillar 1: Heuristic Rule Checks ---
    urgency_terms = [
        "urgent", "immediately", "act now", "within 24 hours", "account suspended",
        "verify your account", "unusual activity", "final warning", "limited time",
    ]
    matched_urgency = next((term for term in urgency_terms if term in text), None)
    if matched_urgency:
        add_rule(
            "urgency", "Urgent or coercive pressure language", "medium", 25,
            f"Matched phrase: “{matched_urgency}”",
            "Coercive urgency pressures recipients to react quickly without verifying authenticity.",
        )

    credential_terms = ["password", "login", "sign in", "verify your identity", "credentials", "one-time password", "otp"]
    matched_credential = next((term for term in credential_terms if term in text), None)
    if matched_credential:
        add_rule(
            "credentials", "Credential solicitation detected", "high", 30,
            f"Matched term: “{matched_credential}”",
            "Direct solicitation of account access credentials or session tokens.",
        )

    financial_terms = ["gift card", "wire transfer", "payment overdue", "bank details", "update billing", "direct deposit"]
    matched_financial = next((term for term in financial_terms if term in text), None)
    if matched_financial:
        add_rule(
            "financial", "Financial diversion or payment lure", "high", 30,
            f"Matched term: “{matched_financial}”",
            "Requests to modify banking, payroll routing, or make non-standard fund transfers.",
        )

    # Sender vs Link Domain Mismatch Check
    sender_domain = extract_domain(parsed["sender"]) if parsed["sender"] else ""
    url_domains = [extract_domain(u) for u in urls if extract_domain(u)]
    
    if sender_domain and url_domains:
        mismatched = [d for d in url_domains if not (d == sender_domain or d.endswith("." + sender_domain) or sender_domain.endswith("." + d))]
        if mismatched:
            add_rule(
                "domain_mismatch", "Sender and destination domain mismatch", "medium", 25,
                f"Sender domain '{sender_domain}' differs from destination '{mismatched[0]}'",
                "The email originates from one organization domain while redirecting users to an unrelated domain.",
            )

    rule_score = min(100, rule_points)

    # --- Pillar 2: Explainable Machine Learning Model ---
    ml_result = predict_email(parsed["subject"], parsed["body"] or parsed["raw"])
    ml_score = ml_result["phishing_probability"]

    # --- Pillar 3: Reputation & Threat Intelligence ---
    rep_result = evaluate_reputation(sender_domain, urls)
    reputation_score = rep_result["reputation_score"]

    # --- Hybrid Score Blend ---
    # Formula: 35% Rules + 35% ML + 30% Threat Intel
    hybrid_score = round(
        (0.35 * rule_score) +
        (0.35 * ml_score) +
        (0.30 * reputation_score)
    )

    # High-confidence escalation rule:
    # If threat-intel flagged a known malicious host or IP, escalate score to at least 75
    if reputation_score >= 50:
        hybrid_score = max(hybrid_score, 75)

    final_score = min(100, max(0, hybrid_score))

    # Triage Decision Thresholds
    if final_score >= 60:
        action = "QUARANTINE"
        verdict = "High Risk"
    elif final_score >= 25:
        action = "REVIEW"
        verdict = "Needs Review"
    else:
        action = "ALLOW"
        verdict = "Lower Risk"

    # Combine all evidence into one unified auditable list
    all_indicators = list(rule_indicators)
    for ind in rep_result["indicators"]:
        all_indicators.append({
            "pillar": "Reputation",
            "key": ind["source"],
            "title": f"Threat Intel: {ind['source']}",
            "severity": ind["severity"],
            "points": ind["impact"],
            "evidence": ind["finding"],
            "explanation": "Signal flagged from domain heuristics or local threat intelligence blocklist.",
        })

    summary = (
        f"Assigned {action} with overall risk score {final_score}/100. "
        f"Signals: Rules ({rule_score}), ML Model ({ml_score}), Threat-Intel ({reputation_score})."
    )

    return {
        "sender": parsed["sender"] or "Not identified",
        "subject": parsed["subject"] or "No subject detected",
        "risk_score": final_score,
        "score_breakdown": {
            "rules": rule_score,
            "ml": ml_score,
            "reputation": reputation_score,
        },
        "verdict": verdict,
        "recommended_action": action,
        "summary": summary,
        "indicators": all_indicators,
        "ml_explainability": {
            "prediction": ml_result["prediction"],
            "top_features": ml_result.get("top_features", []),
        },
        "threat_intel": {
            "checked_domains": rep_result["checked_domains"],
            "intel_verdict": rep_result["intel_verdict"],
        },
        "urls": urls,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def save_result(result: dict[str, Any], raw: str) -> int:
    with connect_db() as conn:
        cur = conn.execute(
            """INSERT INTO analyses
               (created_at, sender, subject, risk_score, rule_score, ml_score, reputation_score,
                recommended_action, indicators_json, email_excerpt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                result["created_at"],
                result["sender"],
                result["subject"],
                result["risk_score"],
                result["score_breakdown"]["rules"],
                result["score_breakdown"]["ml"],
                result["score_breakdown"]["reputation"],
                result["recommended_action"],
                json.dumps(result["indicators"]),
                raw[:500],
            ),
        )
        return int(cur.lastrowid)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "PhishGuard Explainable Triage API"}


@app.post("/api/analyse")
def analyse_text(payload: AnalyseRequest) -> dict[str, Any]:
    result = analyse(payload.email_text)
    result["id"] = save_result(result, payload.email_text)
    return result


@app.post("/api/analyse-file")
async def analyse_file(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename or not file.filename.lower().endswith(".eml"):
        raise HTTPException(status_code=400, detail="Please upload a valid .eml file.")
    content = await file.read(1_000_001)
    if len(content) > 1_000_000:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 1 MB.")
    try:
        message = BytesParser(policy=policy.default).parsebytes(content)
        raw = message.as_string(policy=policy.default)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Could not parse this email file.") from exc
    result = analyse(raw)
    result["id"] = save_result(result, raw)
    return result


@app.post("/api/analyses/{analysis_id}/action")
def log_analyst_action(analysis_id: int, payload: AnalystActionRequest) -> dict[str, Any]:
    """Records human-in-the-loop analyst decisions and overrides with audit timestamp."""
    now_iso = datetime.now(timezone.utc).isoformat()
    with connect_db() as conn:
        cur = conn.execute("SELECT id, recommended_action FROM analyses WHERE id = ?", (analysis_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Analysis record not found.")

        conn.execute(
            """UPDATE analyses
               SET analyst_action = ?, analyst_notes = ?, action_timestamp = ?, analyst_name = ?
               WHERE id = ?""",
            (payload.action, payload.notes, now_iso, payload.analyst_name, analysis_id),
        )

    is_override = (payload.action != row["recommended_action"])

    return {
        "id": analysis_id,
        "recommended_action": row["recommended_action"],
        "analyst_action": payload.action,
        "is_override": is_override,
        "analyst_notes": payload.notes,
        "analyst_name": payload.analyst_name,
        "action_timestamp": now_iso,
        "message": "Analyst override logged to audit trail" if is_override else "Analyst confirmed recommendation",
    }


@app.get("/api/history")
def history(limit: int = 20) -> dict[str, Any]:
    limit = max(1, min(limit, 100))
    with connect_db() as conn:
        rows = conn.execute(
            """SELECT id, created_at, sender, subject, risk_score, rule_score, ml_score,
                      reputation_score, recommended_action, analyst_action, analyst_notes, action_timestamp
               FROM analyses ORDER BY id DESC LIMIT ?""",
            (limit,),
        ).fetchall()
    return {"items": [dict(row) for row in rows]}


@app.get("/api/demo-samples")
def demo_samples() -> dict[str, list[dict[str, str]]]:
    """Provides preloaded demo emails for seamless live hackathon presentations."""
    return {
        "samples": [
            {
                "id": "sample-quarantine",
                "label": "1. Urgent Payroll Harvest (High Risk)",
                "expected": "QUARANTINE",
                "text": (
                    "From: hr-support@payroll-portal-auth.live\n"
                    "Subject: Immediate Action Required: Confirm Direct Deposit Details\n\n"
                    "Your monthly payroll deposit has been temporarily frozen due to inconsistent banking details. "
                    "You must login to verify your identity and submit your credentials within 24 hours to prevent "
                    "payment cancellation.\n\n"
                    "Click here to update your direct deposit: https://secure-login-microsoft.xyz/auth\n"
                ),
            },
            {
                "id": "sample-review",
                "label": "2. External Vendor Invoice (Needs Review)",
                "expected": "REVIEW",
                "text": (
                    "From: accounts@partner-consulting.org\n"
                    "Subject: Q3 Consulting Services Invoice #8492\n\n"
                    "Hello team,\n\n"
                    "Attached is the itemized invoice for September deliverable milestones. "
                    "Please review the hours logged and process payment per net-30 terms.\n\n"
                    "Project tracker: https://partner-consulting.org/portal/invoices\n"
                ),
            },
            {
                "id": "sample-allow",
                "label": "3. Internal Team All-Hands (Lower Risk)",
                "expected": "ALLOW",
                "text": (
                    "From: communications@internal-company.com\n"
                    "Subject: Monthly All-Hands Meeting Agenda - October\n\n"
                    "Hi everyone,\n\n"
                    "Join us this Thursday at 3 PM for our monthly engineering town hall. "
                    "We will discuss product milestones, recent customer feedback, and quarterly targets.\n\n"
                    "See you all there,\nInternal Comms Team"
                ),
            },
        ]
    }


@app.delete("/api/history")
def clear_history() -> dict[str, bool]:
    with connect_db() as conn:
        conn.execute("DELETE FROM analyses")
    return {"cleared": True}
