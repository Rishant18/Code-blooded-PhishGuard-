# PhishGuard Chrome Extension

A browser extension port of **PhishGuard**, an Explainable Phishing Triage Engine designed to help users identify and analyze potentially malicious emails and URLs.

## Features

- **Popup Workstation:** A clean Cyber-SOC dark interface matching the PhishGuard web app.
- **Dual Mode (Backend + Standalone Offline):**
  - When the PhishGuard backend (`http://127.0.0.1:8000`) is running locally, the extension connects to it for hybrid scoring using rules, an ML text classifier, and threat intelligence.
  - When the backend is unavailable, the extension falls back to its internal local engine, using heuristic rules, URL domain mismatch checks, suspicious TLD detection, typosquatting, and brand-impersonation analysis.
- **1-Click Test Scenarios:** Test the extension with built-in High Risk (Payroll Harvest), Suspicious (Invoice), and Benign (Meeting) email examples.
- **Context Menu Integration:** Select text on a webpage, right-click, and choose **Scan with PhishGuard**.
- **Webmail Integration (Gmail & Outlook):** Adds a Scan with PhishGuard button and inline risk badge to supported email reading panes.

---

## Download PhishGuard

**[Download PhishGuard Chrome Extension (ZIP)](YOUR_RELEASE_ASSET_LINK)**

Alternatively, visit the [PhishGuard GitHub Releases page](https://github.com/Rishant18/Code-blooded-PhishGuard-/releases) and download the latest extension ZIP under **Assets**.

### Download instructions

1. Click the download link above.
2. Save `PhishGuard-Extension.zip` to your computer.
3. Right-click the downloaded ZIP file and select **Extract All**.
4. Open the extracted folder and locate `manifest.json`.

> **Important:** The ZIP must contain the Chrome extension files. If `manifest.json` is inside a subfolder, select that subfolder during installation.

---

## Installation in Google Chrome

### Step 1: Open Chrome Extensions

1. Open Google Chrome.
2. Enter this address in the address bar:

   ```text
   chrome://extensions/
   ```

3. Enable **Developer mode** using the toggle in the top-right corner.

### Step 2: Load PhishGuard

1. Click **Load unpacked**.
2. Select the extracted extension folder containing `manifest.json`.
3. Click **Select Folder**.

PhishGuard should now appear on the Chrome Extensions page.

### Step 3: Pin the Extension

1. Click the **Extensions** puzzle-piece icon in Chrome's toolbar.
2. Find **PhishGuard**.
3. Click the pin icon beside it.

You can now open PhishGuard directly from your toolbar.

---

## How to Use PhishGuard

### 1. Scan an Email Using the Popup

1. Click the PhishGuard icon in Chrome's toolbar.
2. Open the popup workstation.
3. Select one of the built-in test scenarios to verify that scanning works.
4. To analyze an email, use the available scanning interface to provide the relevant email text or URL.

Review the risk score, classification, and explanation returned by the engine.

### 2. Scan Selected Text on a Webpage

1. Open a webpage containing suspicious text.
2. Select the text you want to analyze.
3. Right-click the selected text.
4. Choose **Scan with PhishGuard**.
5. Review the scan result.

### 3. Scan Emails in Gmail or Outlook

1. Open Gmail or Outlook in Chrome.
2. Open the email you want to inspect.
3. Look for the **Scan with PhishGuard** button or inline risk badge.
4. Click the scan button to analyze the email.
5. Review the risk assessment before interacting with links or attachments.

*Note: Webmail integration depends on the extension's content scripts, permissions, and supported page layouts. If the button does not appear, reload the email page and verify that the extension is enabled.*

---

## Connect to the PhishGuard Backend (Optional)

The extension can use its local engine when the backend is unavailable, where supported. To enable backend-powered analysis, start the PhishGuard backend.

### Step 1: Start the Backend

Open PowerShell and run the following commands, adjusting the path if necessary:

```powershell
cd "C:\Users\devan\OneDrive\Documents\PhishGuard\PhishGuard\backend"
.\.venv\Scripts\uvicorn.exe app.main:app --reload
```

Keep the terminal running while using the backend.

*Note: This command uses a local development path specific to the developer's computer. Other users must use their own project path and Python environment.*

### Step 2: Verify the Connection

1. Keep the backend terminal running.
2. Open Chrome and click the PhishGuard extension icon.
3. Check the backend status indicator.

When the connection succeeds, the indicator should display **Backend Online** with an emerald beacon.

If the backend is offline, the extension should use its local engine where supported.

**Important:** The address `127.0.0.1` refers to the computer running the browser. Other users cannot access your computer's local backend through that address. For remote judging, deploy the backend to a publicly accessible server and configure the extension to use its deployed API URL.

---

## Troubleshooting

- **Load unpacked fails:** Select the directory containing `manifest.json`, not the ZIP file or an unrelated parent folder.
- **Extension does not appear:** Open `chrome://extensions/` and ensure the extension is enabled.
- **Gmail or Outlook scan button is missing:** Reload the page and confirm that the extension has the required site access.
- **Backend Offline indicator:** Verify that the backend is running and that the extension's API configuration matches the backend URL.
- **Extension errors:** Open `chrome://extensions/`, find PhishGuard, and click **Errors** if available.
- **Download link does not work:** Confirm that the GitHub Release has been published and that the ZIP file is listed under its Assets.

---

## Security Notice

PhishGuard is a phishing triage and analysis aid, not a guarantee that an email or URL is safe. Treat suspicious messages cautiously and avoid opening unexpected links or attachments.

Only scan email content you are authorized to analyze. Review the project's privacy and data-handling behavior before sending email content to a backend or external threat-intelligence service.

Never include API keys, passwords, `.env` files, or other secrets in the downloadable ZIP or public repository.

---

## Project Goal

PhishGuard aims to make phishing detection more accessible by combining explainable rule-based analysis, machine-learning classification, and threat-intelligence checks in a convenient browser extension.