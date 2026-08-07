import React, { useState } from "react";

const STYLES = `
  :root{
    --cream:#F7F5F1; --ink:#1B1A1F; --ink-soft:#6B6874;
    --violet:#6C5CE7; --violet-deep:#5643D9;
    --mint:#2EC4B6; --coral:#FF6B5D; --butter:#FFC857;
    --line:#E7E3DA; --card:#FFFFFF; --danger:#E5484D;
  }
  .hcs-wrap *{box-sizing:border-box;}
  .hcs-wrap{font-family:'Inter',sans-serif;color:var(--ink);}

  .hcs-link{display:inline-flex;align-items:center;gap:6px;border:none;background:none;padding:0;cursor:pointer;font-family:'Inter';font-size:13.5px;font-weight:600;color:var(--violet);text-decoration:underline;text-underline-offset:2px;}
  .hcs-link:hover{color:var(--violet-deep);}

  .hcs-card{margin-top:10px;border:1px solid var(--line);background:var(--card);border-radius:16px;padding:16px;box-shadow:0 10px 24px -16px rgba(27,26,31,.18);animation:hcs-in .16s ease-out;}
  @keyframes hcs-in{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}

  .hcs-subject{display:inline-flex;align-items:center;font-size:11.5px;font-weight:600;color:var(--ink-soft);background:var(--cream);border:1px solid var(--line);border-radius:100px;padding:5px 11px;margin-bottom:12px;}
  .hcs-subject b{color:var(--ink);font-weight:700;margin-left:4px;}

  .hcs-title{font-family:'Sora',sans-serif;font-size:14.5px;font-weight:700;margin:0 0 10px;}

  .hcs-textarea{width:100%;padding:13px 14px;border-radius:12px;border:1px solid var(--line);background:var(--cream);font-size:14px;font-family:'Inter';resize:none;height:96px;line-height:1.5;}
  .hcs-textarea:focus{outline:none;border-color:var(--violet);background:var(--card);}

  .hcs-counter{font-size:11px;color:var(--ink-soft);text-align:right;margin-top:6px;}
  .hcs-counter.hcs-warn{color:var(--danger);}

  .hcs-actions{display:flex;gap:8px;margin-top:14px;}
  .hcs-send{flex:1;padding:12px;border-radius:100px;font-weight:700;font-size:13.5px;border:none;cursor:pointer;background:var(--violet);color:white;box-shadow:0 10px 20px -10px rgba(108,92,231,.5);}
  .hcs-send:disabled{background:var(--line);color:var(--ink-soft);box-shadow:none;cursor:not-allowed;}
  .hcs-send.hcs-sending{background:var(--violet-deep);}
  .hcs-cancel{padding:12px 18px;border-radius:100px;font-weight:700;font-size:13.5px;border:1px solid var(--line);background:var(--card);color:var(--ink-soft);cursor:pointer;}

  .hcs-result{display:flex;align-items:flex-start;gap:10px;padding:2px 0;}
  .hcs-result-icon{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .hcs-result-icon.hcs-ok{background:rgba(46,196,182,.15);color:var(--mint);}
  .hcs-result-icon.hcs-err{background:rgba(229,72,77,.12);color:var(--danger);}
  .hcs-result-text{font-size:13.5px;line-height:1.5;}
  .hcs-result-text b{display:block;font-weight:700;margin-bottom:2px;}
  .hcs-result-close{margin-top:12px;background:none;border:none;padding:0;font-size:12.5px;font-weight:600;color:var(--ink-soft);text-decoration:underline;cursor:pointer;}
  .hcs-retry{margin-top:12px;padding:10px 16px;border-radius:100px;font-weight:700;font-size:13px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer;}
`;

const MAX_LEN = 4000;

/**
 * Reusable inline Contact Support widget.
 * Collapsed: underlined text link. Expanded: in-place form, no navigation.
 * Props:
 *   subject  — optional context string, shown as "Re: {subject}"
 *   label    — link label when collapsed (default "Contact support")
 */
export default function HiveworkContactSupport({ subject, label = "Contact support" }) {
  const [state, setState] = useState("collapsed"); // collapsed | expanded | sending | success | error
  const [message, setMessage] = useState("");

  const remaining = MAX_LEN - message.length;
  const nearLimit = remaining <= 200;

  function expand() {
    setState("expanded");
  }

  function cancel() {
    setState("collapsed");
    setMessage("");
  }

  function send() {
    if (!message.trim()) return;
    setState("sending");
    // Send → POST /api/support, unchanged from real flow.
    // Simulated here for demo purposes.
    setTimeout(() => {
      const ok = Math.random() > 0.15;
      setState(ok ? "success" : "error");
    }, 900);
  }

  function reset() {
    setState("collapsed");
    setMessage("");
  }

  return (
    <div className="hcs-wrap">
      <style>{STYLES}</style>

      {state === "collapsed" && (
        <button type="button" className="hcs-link" onClick={expand}>
          {label}
        </button>
      )}

      {(state === "expanded" || state === "sending") && (
        <div className="hcs-card">
          {subject && (
            <div className="hcs-subject">
              Re: <b>{subject}</b>
            </div>
          )}
          <div className="hcs-title">Describe the issue and we'll follow up.</div>
          <textarea
            className="hcs-textarea"
            maxLength={MAX_LEN}
            placeholder="Describe the issue and we'll follow up."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={state === "sending"}
          />
          <div className={`hcs-counter${nearLimit ? " hcs-warn" : ""}`}>
            {message.length} / {MAX_LEN}
          </div>
          <div className="hcs-actions">
            <button
              type="button"
              className={`hcs-send${state === "sending" ? " hcs-sending" : ""}`}
              disabled={!message.trim() || state === "sending"}
              onClick={send}
            >
              {state === "sending" ? "Sending…" : "Send"}
            </button>
            <button type="button" className="hcs-cancel" onClick={cancel} disabled={state === "sending"}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {state === "success" && (
        <div className="hcs-card">
          <div className="hcs-result">
            <div className="hcs-result-icon hcs-ok">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div className="hcs-result-text">
              <b>Message sent.</b>
              We'll follow up by notification or Pi Browser message shortly.
            </div>
          </div>
          <button type="button" className="hcs-result-close" onClick={reset}>
            Close
          </button>
        </div>
      )}

      {state === "error" && (
        <div className="hcs-card">
          <div className="hcs-result">
            <div className="hcs-result-icon hcs-err">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
            </div>
            <div className="hcs-result-text">
              <b>Couldn't send your message.</b>
              Check your connection and try again.
            </div>
          </div>
          <button type="button" className="hcs-retry" onClick={() => setState("expanded")}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Demo harness — shows the widget in the 4 real usage contexts found in the
 * code sweep. Not part of the shipped component; for preview only.
 */
export function ContactSupportDemo() {
  const wrap = {
    maxWidth: 420,
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "'Inter',sans-serif",
    color: "var(--ink)",
  };
  const section = { marginBottom: 28 };
  const label = { fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".03em" };

  return (
    <div style={wrap}>
      <style>{`:root{--cream:#F7F5F1;--ink:#1B1A1F;--ink-soft:#6B6874;--violet:#6C5CE7;--violet-deep:#5643D9;--mint:#2EC4B6;--coral:#FF6B5D;--butter:#FFC857;--line:#E7E3DA;--card:#FFFFFF;--danger:#E5484D;} body{background:var(--cream);}`}</style>

      <div style={section}>
        <div style={label}>Layout.tsx — persistent</div>
        <HiveworkContactSupport label="Need help?" />
      </div>

      <div style={section}>
        <div style={label}>JobDetail.tsx — payment issue</div>
        <HiveworkContactSupport subject="Payment issue" />
      </div>

      <div style={section}>
        <div style={label}>JobDetail.tsx — wallet verification issue</div>
        <HiveworkContactSupport subject="Wallet verification issue" />
      </div>

      <div style={section}>
        <div style={label}>PostJob.tsx — posting payment issue</div>
        <HiveworkContactSupport subject="Posting payment issue" />
      </div>
    </div>
  );
}
