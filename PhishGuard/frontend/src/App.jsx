import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function formatDate(value) {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function App() {
  const [emailText, setEmailText] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('analyse');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');

  async function refreshHistory() {
    try {
      const response = await fetch(`${API}/api/history`);
      if (!response.ok) throw new Error('History unavailable');
      const data = await response.json();
      setHistory(data.items || []);
    } catch {
      setHistory([]);
    }
  }

  useEffect(() => {
    fetch(`${API}/api/health`)
      .then((response) => {
        if (!response.ok) throw new Error('offline');
        return response.json();
      })
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
    refreshHistory();
  }, []);

  async function submitAnalysis(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    if (!file && !emailText.trim()) {
      setError('Paste an email message or choose an .eml file first.');
      return;
    }
    setLoading(true);
    try {
      let response;
      if (file) {
        const body = new FormData();
        body.append('file', file);
        response = await fetch(`${API}/api/analyse-file`, { method: 'POST', body });
      } else {
        response = await fetch(`${API}/api/analyse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email_text: emailText }),
        });
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Analysis failed. Check that the API is running.');
      setResult(data);
      setView('analyse');
      refreshHistory();
    } catch (err) {
      setError(err.message || 'Could not reach the analysis service.');
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    if (!window.confirm('Clear all locally stored analysis history?')) return;
    try {
      const response = await fetch(`${API}/api/history`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setHistory([]);
    } catch {
      setError('Could not clear history. Check the API connection.');
    }
  }

  function chooseFile(event) {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    if (selected) setEmailText('');
  }

  const scoreClass = result?.risk_score >= 60 ? 'high' : result?.risk_score >= 25 ? 'medium' : 'low';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setView('analyse'); }}>
          <img src="/favicon.svg" alt="" className="brand-mark" />
          <span>PhishGuard<small>EMAIL TRIAGE</small></span>
        </a>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          <button className={`nav-item ${view === 'analyse' ? 'active' : ''}`} onClick={() => setView('analyse')}>
            <span className="nav-rule" /> Analyse email
          </button>
          <button className={`nav-item ${view === 'history' ? 'active' : ''}`} onClick={() => { setView('history'); refreshHistory(); }}>
            <span className="nav-rule" /> Analysis history
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="service-row"><span className={`status-dot ${apiStatus}`} /> API {apiStatus === 'online' ? 'connected' : apiStatus === 'offline' ? 'unavailable' : 'checking'}</div>
          <p>Prototype build 0.1</p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {view === 'history' ? 'History' : 'Email analysis'}</div>
          <div className="topbar-note">Rule-based baseline</div>
        </header>

        <div className="page-content">
          {view === 'history' ? (
            <section>
              <div className="page-heading heading-row">
                <div><p className="eyebrow">RECORDS</p><h1>Analysis history</h1><p className="lede">Previously submitted messages stored by this local instance.</p></div>
                <button className="button button-secondary" onClick={clearHistory} disabled={!history.length}>Clear history</button>
              </div>
              <div className="panel table-panel">
                {history.length ? <div className="table-scroll"><table>
                  <thead><tr><th>TIME</th><th>SENDER</th><th>SUBJECT</th><th>SCORE</th><th>ASSESSMENT</th></tr></thead>
                  <tbody>{history.map((item) => <tr key={item.id}>
                    <td>{formatDate(item.created_at)}</td><td>{item.sender}</td><td>{item.subject}</td><td>{item.risk_score}/100</td>
                    <td><span className={`tag ${item.risk_score >= 60 ? 'tag-high' : item.risk_score >= 25 ? 'tag-medium' : 'tag-low'}`}>{item.verdict}</span></td>
                  </tr>)}</tbody>
                </table></div> : <div className="empty-state"><h3>No analyses recorded</h3><p>Submitted messages will appear here after the first analysis.</p><button className="button button-primary" onClick={() => setView('analyse')}>Analyse an email</button></div>}
                <p className="privacy-note">History is stored in the backend SQLite database. Do not submit sensitive or confidential email.</p>
              </div>
            </section>
          ) : (
            <>
              <section className="page-heading">
                <p className="eyebrow">EMAIL SECURITY / TRIAGE</p>
                <h1>Inspect a suspicious email</h1>
                <p className="lede">Review message indicators and the evidence behind a risk assessment before deciding what to do next.</p>
              </section>

              <div className="workspace-grid">
                <section className="panel input-panel">
                  <div className="panel-header"><div><h2>Message input</h2><p>Paste the message source or upload an email file.</p></div><span className="step-number">01</span></div>
                  <form onSubmit={submitAnalysis}>
                    <label className="field-label" htmlFor="email-content">EMAIL CONTENT</label>
                    <textarea id="email-content" value={emailText} onChange={(e) => { setEmailText(e.target.value); setFile(null); }} placeholder={'From: sender@example.com\nSubject: Please review this message\n\nPaste the email headers and body here...'} rows="12" />
                    <div className="or-divider"><span>OR UPLOAD SOURCE FILE</span></div>
                    <label className="file-picker">
                      <input type="file" accept=".eml,message/rfc822" onChange={chooseFile} />
                      <span className="file-name">{file ? file.name : 'Choose an .eml file'}</span>
                      <span className="file-hint">Maximum 1 MB</span>
                    </label>
                    {error && <div className="error-message" role="alert">{error}</div>}
                    <div className="form-footer"><p>Links are inspected as text only. They are not opened.</p><button className="button button-primary" type="submit" disabled={loading || apiStatus === 'offline'}>{loading ? 'Analysing…' : 'Analyse message'}</button></div>
                    {apiStatus === 'offline' && <p className="connection-help">The API is not responding. Start the FastAPI backend and refresh this page.</p>}
                  </form>
                </section>

                <section className="panel result-panel">
                  <div className="panel-header"><div><h2>Assessment</h2><p>Findings from the current analysis.</p></div><span className="step-number">02</span></div>
                  {!result ? (
                    <div className="result-placeholder">
                      <div className="placeholder-line short" /><div className="placeholder-line" /><div className="placeholder-box"><span>RESULTS WILL APPEAR HERE</span><p>Submit a message to see its risk score, triggered rules, and recommended next step.</p></div>
                      <div className="placeholder-line" /><div className="placeholder-line medium" />
                    </div>
                  ) : (
                    <div className="result-content">
                      <div className="result-summary">
                        <div><p className="field-label">RISK SCORE</p><div className={`score ${scoreClass}`}>{result.risk_score}<span>/100</span></div></div>
                        <span className={`tag tag-${scoreClass}`}>{result.verdict}</span>
                      </div>
                      <div className="score-track"><div className={`score-fill ${scoreClass}`} style={{ width: `${result.risk_score}%` }} /></div>
                      {result.ml && <section className="ml-card" aria-label="Machine learning estimate">
                        <div className="ml-card-heading"><div><p className="field-label">MACHINE-LEARNING ESTIMATE</p><h3>{result.ml.prediction}</h3></div><strong>{result.ml.phishing_probability}%</strong></div>
                        <div className="score-track"><div className={`score-fill ${result.ml.phishing_probability >= 60 ? 'high' : result.ml.phishing_probability >= 35 ? 'medium' : 'low'}`} style={{ width: `${result.ml.phishing_probability}%` }} /></div>
                        <p>{result.ml.model_name} · {result.ml.training_examples} bundled examples</p>
                        <p className="ml-caveat">{result.ml.model_note}</p>
                      </section>}
                      <div className="metadata"><div><span>FROM</span><strong>{result.sender}</strong></div><div><span>SUBJECT</span><strong>{result.subject}</strong></div></div>
                      <div className="recommendation"><span>RECOMMENDED ACTION</span><strong>{result.recommended_action}</strong><p>{result.summary}</p></div>
                      <div className="evidence-heading"><h3>Evidence</h3><span>{result.indicators.length} rule(s) triggered</span></div>
                      {result.indicators.length ? <div className="evidence-list">{result.indicators.map((indicator) => (
                        <article className="evidence-item" key={indicator.key}>
                          <div className="evidence-title"><h4>{indicator.title}</h4><span className={`severity severity-${indicator.severity}`}>{indicator.severity}</span></div>
                          <p>{indicator.explanation}</p><div className="evidence-quote">{indicator.evidence}</div>
                          <span className="points">+{indicator.points} points</span>
                        </article>
                      ))}</div> : <div className="no-findings">No configured warning rules were triggered. This does not prove the message is safe.</div>}
                      <details className="limitations"><summary>Method and limitations</summary><p>Method: {result.method}. The combined risk score blends the rule score with the experimental model estimate; it is not a calibrated probability.</p><ul>{result.limitations.map((item) => <li key={item}>{item}</li>)}</ul></details>
                    </div>
                  )}
                </section>
              </div>
              <section className="notice"><strong>Important</strong><p>This tool provides an advisory assessment, not a security guarantee. Verify sensitive requests through a trusted, separate channel. Do not open suspicious links based solely on this result.</p></section>
            </>
          )}
        </div>
        <footer className="footer"><span>PhishGuard</span><span>Explainable email triage prototype</span></footer>
      </main>
    </div>
  );
}

export default App;
