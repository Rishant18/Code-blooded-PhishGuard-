from __future__ import annotations

import re
from typing import Any
from urllib.parse import urlparse

SUSPICIOUS_TLDS = {
    "top", "xyz", "buzz", "click", "rest", "surf", "fit", "gq", "ml", "cf", "tk", "ga"
}

TARGETED_BRANDS = [
    "microsoft", "office365", "google", "paypal", "apple", "netflix",
    "chase", "wellsfargo", "amazon", "dropbox", "docuSign"
]

MOCK_INTEL_BLOCKLIST = {
    "domains": {
        "secure-login-microsoft.xyz",
        "verify-account-update.top",
        "paypal-resolution-center.click",
        "update-payment-portal.info",
        "payroll-portal-auth.live",
    },
    "ips": {
        "185.220.101.5",
        "194.26.29.112",
        "45.154.255.89",
    }
}


def extract_domain(hostname_or_url: str) -> str:
    """Normalize and extract hostname from raw URL, domain, or email address."""
    candidate = hostname_or_url.strip()
    if "@" in candidate:
        candidate = candidate.split("@")[-1]
    if not candidate.lower().startswith(("http://", "https://")):
        candidate = "http://" + candidate
    try:
        parsed = urlparse(candidate)
        return (parsed.hostname or "").lower()
    except Exception:
        return ""


def check_typosquatting(domain: str) -> list[str]:
    matches = []
    normalized = (
        domain.replace("0", "o")
              .replace("1", "l")
              .replace("vv", "w")
              .replace("5", "s")
    )
    for brand in TARGETED_BRANDS:
        if brand in normalized and brand not in domain:
            matches.append(f"Possible typosquatting/lookalike of '{brand}' in '{domain}'")
        elif brand in domain and not domain.endswith(f".{brand}.com") and domain != f"{brand}.com":
            matches.append(f"Brand keyword '{brand}' found in non-official domain '{domain}'")
    return matches


def evaluate_reputation(sender_domain: str, urls: list[str]) -> dict[str, Any]:
    indicators: list[dict[str, Any]] = []
    score = 0
    all_domains = set()

    if sender_domain:
        clean_sender = extract_domain(sender_domain)
        if clean_sender:
            all_domains.add(clean_sender)

    for url in urls:
        dom = extract_domain(url)
        if dom:
            all_domains.add(dom)

    for dom in all_domains:
        if dom in MOCK_INTEL_BLOCKLIST["domains"]:
            indicators.append({
                "source": "ThreatIntel-Feed",
                "severity": "high",
                "finding": f"Domain identified on threat blocklist: {dom}",
                "impact": 50,
            })
            score += 50

        if dom in MOCK_INTEL_BLOCKLIST["ips"]:
            indicators.append({
                "source": "ThreatIntel-Feed",
                "severity": "high",
                "finding": f"Host IP matches known malicious infrastructure: {dom}",
                "impact": 50,
            })
            score += 50

        parts = dom.split(".")
        if len(parts) >= 2:
            tld = parts[-1].lower()
            if tld in SUSPICIOUS_TLDS:
                indicators.append({
                    "source": "TLD-Heuristics",
                    "severity": "medium",
                    "finding": f"Domain utilizes high-abuse TLD (.{tld}): {dom}",
                    "impact": 25,
                })
                score += 25

        for issue in check_typosquatting(dom):
            indicators.append({
                "source": "Brand-Impersonation",
                "severity": "high",
                "finding": issue,
                "impact": 35,
            })
            score += 35

    final_reputation_score = min(100, score)

    return {
        "reputation_score": final_reputation_score,
        "checked_domains": sorted(list(all_domains)),
        "indicators": indicators,
        "intel_verdict": "Flagged" if final_reputation_score >= 50 else ("Suspicious" if final_reputation_score > 0 else "Clean"),
    }
