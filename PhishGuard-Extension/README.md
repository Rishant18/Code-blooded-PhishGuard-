# PhishGuard Chrome Extension

A browser extension port of **PhishGuard** (Explainable Phishing Triage Engine).

## Features
- **Popup Workstation**: Clean Cyber-SOC dark interface matching the PhishGuard web app.
- **Dual Mode (Backend + Standalone Offline)**:
  - If your local PhishGuard backend (`http://127.0.0.1:8000`) is running, it connects seamlessly and provides full hybrid scoring: Rules + ML Text Classifier + Threat Intelligence.
  - If the backend is offline, the extension automatically falls back to an internal **Local Engine** (heuristic rules, URL domain mismatch checks, suspicious TLD detection, typosquatting & brand-impersonation analysis).
- **1-Click Test Scenarios**: High Risk (Payroll harvest), Suspicious (Invoice), and Benign meeting sample vectors built into the popup.
- **Context Menu Integration**: Right-click any selected text on any webpage -> **"Scan with PhishGuard"**.
- **Webmail Ingestion (Gmail & Outlook)**: Auto-injects a "Scan with PhishGuard" button and inline risk badge directly into Gmail and Outlook reading panes.

---

## How to Install into Google Chrome

1. Open Google Chrome and navigate to:
   ```
   chrome://extensions/
   ```
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click the **"Load unpacked"** button in the top-left corner.
4. Select the folder:
   ```
   C:\Users\devan\OneDrive\Documents\Chrome Extension
   ```
5. Click **Select Folder**.
6. Pin **PhishGuard** to your Chrome toolbar for easy access!

---

## Connecting with PhishGuard Backend (Optional for ML analysis)

1. Start your PhishGuard backend:
   ```powershell
   cd "C:\Users\devan\OneDrive\Documents\PhishGuard\PhishGuard\backend"
   .\.venv\Scripts\uvicorn.exe app.main:app --reload
   ```
2. Open the extension popup, and you will see the indicator change to **"Backend Online"** (emerald beacon).
