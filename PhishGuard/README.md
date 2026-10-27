# PhishGuard

Explainable phishing triage prototype built with React + Vite and FastAPI.

## Features
- Paste email text or upload a `.eml` file
- Rule-based indicators with evidence and explanations
- Experimental TF-IDF + Logistic Regression email-text classifier
- Combined triage score with a separate ML probability estimate
- Transparent risk score and recommendation: Allow, Review, or Quarantine
- SQLite analysis history
- No fabricated dashboard metrics, reviews, or customer claims
- Does not open suspicious links or execute attachments

## Requirements
- Node.js 18+ (20+ recommended)
- Python 3.10+

## Run the backend

Windows PowerShell, from the project root:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

If PowerShell blocks activation, use `.\.venv\Scripts\python.exe -m python -m pip install -r requirements.txt` and `.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload`.

Backend runs at `http://127.0.0.1:8000`. API docs: `http://127.0.0.1:8000/docs`.

## Run the frontend

Open a second terminal from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`.

## Important notes
- The model is trained at backend startup using `backend/data/training_emails.csv`, a small synthetic demonstration dataset. It is a real scikit-learn model, but the bundled examples are not sufficient to claim real-world accuracy. Replace them with a properly licensed, representative labelled dataset and evaluate on a held-out test set before making performance claims.
- Scores are heuristic indicators, not a guarantee that an email is safe or malicious.
- The app stores submitted email text and analysis results locally in `backend/phishguard.db`. Avoid testing with private or sensitive emails.
- The default CORS policy allows the local Vite development server only. Configure CORS and deployment secrets before production.
- The quarantine recommendation is advisory only. This prototype does not connect to a mailbox or move/delete messages.
- No custom domain is connected by this starter. Configure and test the domain, HTTPS, favicon, and production deployment before launch.
