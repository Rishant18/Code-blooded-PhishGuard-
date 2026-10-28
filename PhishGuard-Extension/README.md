# PhishGuard Chrome Extension

A browser extension port of **PhishGuard**, an Explainable Phishing Triage Engine designed to help users identify and analyze potentially malicious emails and URLs.

## Features

- **Popup Workstation:** A clean Cyber-SOC dark interface matching the PhishGuard web app.
- **Dual Mode (Backend + Standalone Offline):**
  - When the local PhishGuard backend (`http://127.0.0.1:8000`) is running, the extension connects to it for hybrid scoring using rules, an ML text classifier, and threat intelligence.
  - When the backend is unavailable, the extension falls back to its internal local engine, using heuristic rules, URL domain mismatch checks, suspicious TLD detection, typosquatting, and brand-impersonation analysis.
- **1-Click Test Scenarios:** Test the extension with built-in High Risk (Payroll Harvest), Suspicious (Invoice), and Benign (Meeting) email examples.
- **Context Menu Integration:** Select text on a webpage, right-click, and choose **Scan with PhishGuard**.
- **Webmail Integration (Gmail & Outlook):** Adds a Scan with PhishGuard button and inline risk badge to supported email reading panes.

---

## Download and Install the Extension

### Step 1: Download PhishGuard

1. Open the PhishGuard repository on GitHub:  
   https://github.com/Rishant18/Code-blooded-PhishGuard-
2. Click the green **Code** button.
3. Select **Download ZIP**.
4. Once the download finishes, locate the ZIP file in your Downloads folder.
5. Right-click the ZIP file and select **Extract All**.
6. Open the extracted project folder.

> **Important:** Make sure you download the repository containing the Chrome extension files. If the extension is stored in a subfolder, open that folder instead of selecting the entire repository.

### Step 2: Load the Extension into Google Chrome

1. Open Google Chrome.
2. Enter the following address in the address bar:

   ```text
   chrome://extensions/
   ```

3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Browse to the extracted `PhishGuard-Extension` folder (or the folder containing the extension's `manifest.json` file).
6. Select the folder and click **Select Folder**.

The PhishGuard extension should now appear on the Chrome Extensions page.

### Step 3: Pin PhishGuard to the Toolbar

1. Click the **Extensions** puzzle-piece icon in Chrome's toolbar.
2. Find **PhishGuard** in the list.
3. Click the pin icon beside it.

You can now access PhishGuard directly from your Chrome toolbar.

---

## How to Use PhishGuard

### 1. Scan an Email Using the Popup

1. Click the PhishGuard icon in the Chrome toolbar.
2. Open the popup workstation.
3. Choose one of the built-in test scenarios to verify that scanning works.
4. To analyze a real email, use the available scanning interface and provide the relevant email text or URL.

Review the risk score, risk classification, and explanation provided by the engine.

### 2. Scan Selected Text on a Webpage

1. Open a webpage containing suspicious text.
2. Select the text you want to analyze.
3. Right-click the selected text.
4. Choose **Scan with PhishGuard**.
5. Review the scan result presented by the extension.

### 3. Scan Emails in Gmail or Outlook

1. Open Gmail or Outlook in Chrome.
2. Open an email you want to inspect.
3. Look for the **Scan with PhishGuard** button or inline risk badge.
4. Click the scan button to analyze the email.
5. Review the resulting risk assessment before interacting with links or attachments.

*Note: Webmail integration depends on the extension's content scripts and supported page layouts. If the button does not appear, reload the email page and verify that the extension is enabled.*

---

## Connect to the PhishGuard Backend (Optional)

The extension can use its local engine when the backend is unavailable. To enable backend-powered analysis, start the PhishGuard backend.

### Step 1: Open PowerShell

Run the following commands, adjusting the project path if necessary:

```powershell
cd "C:\Users\devan\OneDrive\Documents\PhishGuard\PhishGuard\backend"
.\.venv\Scripts\uvicorn.exe app.main:app --reload
```

If your virtual environment or Uvicorn installation is located elsewhere, activate the correct environment and run the appropriate Uvicorn command.

### Step 2: Verify the Connection

1. Keep the backend terminal running.
2. Open Chrome and click the PhishGuard extension icon.
3. Check the backend status indicator.

When the connection succeeds, the indicator should display **Backend Online** with an emerald beacon.

If the backend is offline, the extension should use its local engine where supported.

---

## Troubleshooting

- **Load unpacked fails:** Select the directory containing `manifest.json`, not the ZIP file or an unrelated parent folder.
- **Extension does not appear:** Check `chrome://extensions/` and ensure the extension is enabled.
- **Gmail or Outlook scan button is missing:** Reload the page and confirm the extension has the required site access.
- **Backend Offline indicator:** Verify that the backend is running at `http://127.0.0.1:8000` and that the extension's API configuration matches the backend.
- **Extension errors:** Open `chrome://extensions/`, find PhishGuard, and click **Errors** if that option is available.

---

## Security Notice

PhishGuard is a phishing triage and analysis aid, not a guarantee that an email or URL is safe. Treat suspicious messages cautiously, and avoid opening unexpected links or attachments.

Only scan email content you are authorized to analyze. Review the project's privacy and data-handling behavior before sending email content to a backend or external threat-intelligence service.

---

## Project Goal

PhishGuard aims to make phishing detection more accessible by combining explainable rule-based analysis, machine-learning classification, and threat-intelligence checks in a convenient browser extension.