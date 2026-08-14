import { useState } from 'react'

// Hivework — Job Detail (Worker / non-owner view)
// Canonical, ported from hivework-job-detail-worker.html — see
// sessions/session-08.md for the full 11-state map and the JobDetail.tsx
// conditions each one maps to.
//
// Self-contained token block per Bug Fix Log #8 — does not rely on the
// external hivework-tokens.css at render time.
//
// `state` prop drives which of the 11 real states renders (see STATE_META
// below). Not yet wired to live JobDetail.tsx data — accepts a `job` prop
// for header content and a `state` prop for which ledger stage/panel to
// show, so this slots in once the real derived state (mySlotState,
// hasWallet, profileComplete, myApp, myRating, verifyError) is threaded
// through from the page component.

const STYLES = `
  .hw-jdw{
    --cream:#F7F5F1; --cream-deep:#EFEBE1; --ink:#1B1A1F; --ink-soft:#6B6874;
    --violet:#6C5CE7; --violet-deep:#5643D9;
    --mint:#2EC4B6; --coral:#FF6B5D; --butter:#FFC857;
    --line:#E7E3DA; --card:#FFFFFF;
    --radius:16px; --radius-sm:10px;
    background:var(--cream); color:var(--ink); font-family:'Inter',sans-serif;
    -webkit-font-smoothing:antialiased; padding-bottom:60px;
  }
  .hw-jdw *{box-sizing:border-box;}
  .hw-jdw h1,.hw-jdw h2,.hw-jdw h3{font-family:'Sora',sans-serif;margin:0;}
  .hw-jdw .mono{font-family:'JetBrains Mono',monospace;}
  .hw-jdw .wrap{max-width:520px;margin:0 auto;padding:20px 18px 0;}

  .hw-jdw .back-btn{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ink-soft);padding:4px 0 14px;cursor:pointer;background:none;border:none;}

  .hw-jdw .job-head{background:var(--ink);color:var(--cream);border-radius:var(--radius);padding:18px 18px 16px;margin-bottom:22px;}
  .hw-jdw .job-eyebrow{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#B9B3E0;margin-bottom:8px;}
  .hw-jdw .job-title{font-size:17px;font-weight:700;line-height:1.35;margin-bottom:10px;}
  .hw-jdw .job-figures{display:flex;justify-content:space-between;align-items:flex-end;}
  .hw-jdw .job-figures .amt{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:20px;color:#F4D584;}
  .hw-jdw .job-figures .amt span{font-size:12px;color:#B9B3E0;font-weight:500;}
  .hw-jdw .job-figures .who{font-size:12px;color:#B9B3E0;}

  .hw-jdw .ledger{position:relative;padding-left:26px;margin-bottom:24px;}
  .hw-jdw .ledger::before{content:'';position:absolute;left:8px;top:6px;bottom:6px;width:1.5px;background:var(--line);}
  .hw-jdw .entry{position:relative;padding-bottom:22px;}
  .hw-jdw .entry:last-child{padding-bottom:0;}
  .hw-jdw .entry-dot{position:absolute;left:-26px;top:2px;width:16px;height:16px;border-radius:50%;background:var(--cream);border:2px solid var(--line);z-index:2;}
  .hw-jdw .entry.done .entry-dot{background:var(--violet);border-color:var(--violet);}
  .hw-jdw .entry.current .entry-dot{background:var(--cream);border-color:var(--violet);box-shadow:0 0 0 3px rgba(108,92,231,.15);}
  .hw-jdw .entry.rejected .entry-dot{background:var(--coral);border-color:var(--coral);box-shadow:0 0 0 3px rgba(255,107,93,.15);}
  .hw-jdw .entry.upcoming{opacity:.4;}
  .hw-jdw .entry-time{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px;}
  .hw-jdw .entry-label{font-size:13.5px;font-weight:700;margin-bottom:2px;}
  .hw-jdw .entry.current .entry-label{color:var(--violet-deep);}
  .hw-jdw .entry.rejected .entry-label{color:var(--coral);}
  .hw-jdw .entry-note{font-size:12.5px;color:var(--ink-soft);line-height:1.4;}

  .hw-jdw .panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:18px;margin-top:10px;}
  .hw-jdw .panel-title{font-size:13px;font-weight:700;margin-bottom:8px;}
  .hw-jdw .field-label{font-size:11px;font-weight:600;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.03em;display:block;margin-bottom:6px;}
  .hw-jdw textarea{width:100%;border:1px solid var(--line);border-radius:var(--radius-sm);padding:11px;font-family:'Inter',sans-serif;font-size:13.5px;color:var(--ink);resize:vertical;min-height:100px;background:var(--cream-deep);}
  .hw-jdw textarea:focus{outline:2px solid var(--violet);outline-offset:1px;background:#fff;}
  .hw-jdw .sub-composer-hint{font-size:12px;color:var(--ink-soft);margin-bottom:14px;line-height:1.4;}
  .hw-jdw .sub-field{min-height:70px;}
  .hw-jdw .sub-field-sm{min-height:52px;}
  .hw-jdw .sub-soon-tag{text-transform:none;font-weight:600;color:var(--violet-deep);background:#EFEAFB;border-radius:100px;padding:2px 8px;font-size:10px;letter-spacing:0;margin-left:4px;}
  .hw-jdw .attach-disabled{opacity:.55;}
  .hw-jdw .attach-add-wide:disabled{cursor:not-allowed;opacity:.6;}
  .hw-jdw .counter-row{display:flex;justify-content:space-between;margin-top:6px;font-size:10.5px;color:var(--ink-soft);font-family:'JetBrains Mono',monospace;}

  .hw-jdw .btn{border:none;border-radius:var(--radius-sm);padding:12px 16px;font-weight:700;font-size:13.5px;font-family:'Inter',sans-serif;cursor:pointer;width:100%;margin-top:12px;}
  .hw-jdw .btn-primary{background:var(--violet);color:#fff;}
  .hw-jdw .btn-primary:disabled{background:var(--line);color:var(--ink-soft);cursor:not-allowed;}
  .hw-jdw .btn-primary:hover:not(:disabled){background:var(--violet-deep);}
  .hw-jdw .btn-ghost{background:transparent;border:1px solid var(--line);color:var(--ink);}
  .hw-jdw .btn-row{display:flex;gap:8px;}
  .hw-jdw .btn-row .btn{margin-top:0;}

  .hw-jdw .error-note{font-size:12px;color:var(--coral);margin-top:10px;line-height:1.5;}
  .hw-jdw .error-note a{color:var(--coral);font-weight:700;text-decoration:underline;cursor:pointer;}

  .hw-jdw .paid-strip{display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid var(--mint);border-radius:var(--radius-sm);padding:14px 16px;margin-top:10px;}
  .hw-jdw .paid-amt{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:22px;color:#1A9E92;}
  .hw-jdw .paid-amt span{font-size:12px;color:var(--ink-soft);font-weight:600;margin-left:4px;}
  .hw-jdw .paid-sub{font-size:11px;color:var(--ink-soft);text-align:right;font-family:'JetBrains Mono',monospace;}

  .hw-jdw .verified-strip{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--mint);border-radius:var(--radius-sm);padding:12px 14px;margin-top:10px;}
  .hw-jdw .verified-icon{width:22px;height:22px;border-radius:50%;background:var(--mint);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .hw-jdw .verified-text{font-size:12.5px;font-weight:600;color:#1A9E92;}

  .hw-jdw .rate-given{text-align:center;padding:4px 0;}
  .hw-jdw .rate-given .stars{color:var(--butter);font-size:20px;letter-spacing:3px;}
  .hw-jdw .rate-given p{font-size:13px;color:var(--ink-soft);margin:8px 0 0;line-height:1.5;}

  .hw-jdw .attach-list{display:flex;flex-direction:column;gap:8px;margin-top:8px;}
  .hw-jdw .attach-row2{display:flex;align-items:center;gap:10px;padding:9px 10px;background:var(--cream-deep);border:1px solid var(--line);border-radius:var(--radius-sm);}
  .hw-jdw .attach-icon{width:34px;height:34px;border-radius:8px;background:#fff;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
  .hw-jdw .attach-info{flex:1;min-width:0;}
  .hw-jdw .attach-name{font-size:12.5px;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .hw-jdw .attach-meta{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--ink-soft);margin-top:2px;}
  .hw-jdw .attach-row2.uploading .attach-meta{color:var(--violet-deep);}
  .hw-jdw .attach-progress-track{width:100%;height:3px;border-radius:2px;background:var(--line);margin-top:5px;overflow:hidden;}
  .hw-jdw .attach-progress-fill{width:64%;height:100%;background:var(--violet);}
  .hw-jdw .attach-x{width:20px;height:20px;border-radius:50%;border:none;background:transparent;color:var(--ink-soft);font-size:15px;cursor:pointer;flex-shrink:0;}
  .hw-jdw .attach-add-wide{width:100%;margin-top:8px;padding:10px;border-radius:var(--radius-sm);border:1.5px dashed var(--line);background:transparent;color:var(--ink-soft);font-size:12.5px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;}
  .hw-jdw .attach-hint{font-size:11px;color:var(--ink-soft);line-height:1.4;margin-top:8px;}

  .hw-jdw .stars{display:flex;gap:4px;margin:8px 0 12px;}
  .hw-jdw .star{font-size:22px;cursor:pointer;opacity:.25;background:none;border:none;padding:0;}
  .hw-jdw .star.filled{opacity:1;}
`

// Stage the ledger renders — mirrors the real gating order in
// JobDetail.tsx's worker branch (wallet -> profile -> apply -> work -> paid).
const STAGES = [
  { key: 'verify',  label: 'Wallet verification', note: 'One-time 0.01π confirmation payment' },
  { key: 'profile', label: 'Profile complete',     note: "Skills, devices & languages on file" },
  { key: 'apply',   label: 'Application',          note: 'Cover note reviewed by client' },
  { key: 'work',    label: 'Work submission',      note: 'Findings submitted for review' },
  { key: 'paid',    label: 'Payment settled',      note: 'Funds released to your balance' },
]

// Submission composer (Section 27 — standard proof-of-work structure).
// The real API (/api/jobs/:id/submit-work) only ever accepts one field,
// `submission` (plain string) — there is no structured-report endpoint.
// This composer stays inside that real constraint: it presents 3-4
// labeled mini-fields in the UI, then concatenates them into one
// ###-headed string on submit, so the client-side view of the report
// (`s.submission` in the owner's ledger) still reads as one clean report.
// "Evidence" placeholder differs by job type since what counts as valid
// proof genuinely differs; classified from the job's free-text `cat` label.
function getSubmissionKind(catLabel) {
  const c = (catLabel || "").toLowerCase()
  if (c.includes("bug")) return "bug"
  if (c.includes("translat") || c.includes("localiz")) return "translation"
  return "feedback" // UI feedback, usability testing, content review, etc.
}

const SUBMISSION_EVIDENCE_HINT = {
  bug: "Exact repro steps, and what happened vs. what you expected.",
  translation: "Paste the original text alongside your translation.",
  feedback: "What you reviewed, and your specific verdict or findings.",
}

function composeSubmission({ what, evidence, environment, notes, kind }) {
  const parts = []
  if (what.trim()) parts.push(`### What was done\n${what.trim()}`)
  if (evidence.trim()) parts.push(`### Evidence\n${evidence.trim()}`)
  if (kind === "bug" && environment.trim()) parts.push(`### Environment\n${environment.trim()}`)
  if (notes.trim()) parts.push(`### Notes\n${notes.trim()}`)
  return parts.join("\n\n")
}

// state -> which stage index is "current", and whether that stage should
// render as the rejected (coral) treatment instead of violet.
// See session-08.md for the JobDetail.tsx condition each maps to.
const STATE_META = {
  wallet_off:         { stage: 0 },
  wallet_error:        { stage: 0 },
  wallet_verified:     { stage: 0 }, // brief confirmation before advancing — see handleVerifyWallet below
  profile_off:         { stage: 1 },
  ready:               { stage: 2 },
  form:                { stage: 2 },
  pending:             { stage: 2 },
  rejected:            { stage: 2, rejected: true }, // proposed — see session-08.md
  approved:            { stage: 3 },
  submitted:           { stage: 3 },
  completed_unrated:   { stage: 4 },
  completed_rated:     { stage: 4 },
}

function Panel({ state, onVerifyWallet, onSetupProfile, onOpenApplyForm, onCancelApply, onSubmitApply,
                  coverNote, onCoverNoteChange, submitting, applying,
                  submissionKind, subWhat, onSubWhatChange, subEvidence, onSubEvidenceChange,
                  subEnvironment, onSubEnvironmentChange, subNotes, onSubNotesChange, canSubmitWork, onSubmitWork,
                  rateScore, onRateScore, rateComment, onRateCommentChange, onSubmitRating, ratingSubmitting,
                  myRating, verifyError, verifying }) {
  switch (state) {
    case 'wallet_off':
    case 'wallet_error':
      return (
        <div className="panel">
          <div className="panel-title">Verify your wallet</div>
          <div className="entry-note" style={{ marginBottom: 10 }}>
            A 0.01π confirmation payment tells us where to send earnings. One-time only.
          </div>
          <button className="btn btn-primary" disabled={verifying} onClick={onVerifyWallet}>
            {verifying ? 'Confirm in Pi Wallet...' : 'Verify wallet · 0.01π'}
          </button>
          {state === 'wallet_error' && verifyError && (
            <div className="error-note">{verifyError} <a>Contact support</a></div>
          )}
        </div>
      )

    // Brief confirmation shown after a successful verification payment,
    // before the ledger advances to the profile-complete stage. Generic
    // wording deliberately — Sentinel (separate security project) is kept
    // out of this design per standing decision.
    case 'wallet_verified':
      return (
        <div className="panel">
          <div className="verified-strip">
            <div className="verified-icon">✓</div>
            <div className="verified-text">Wallet verified</div>
          </div>
        </div>
      )

    case 'profile_off':
      return (
        <div className="panel">
          <div className="panel-title">Complete your profile</div>
          <div className="entry-note" style={{ marginBottom: 10 }}>
            Clients screen applicants by skill — yours isn't on file yet.
          </div>
          <button className="btn btn-primary" onClick={onSetupProfile}>Set up profile →</button>
        </div>
      )

    case 'ready':
      return (
        <div className="panel">
          <div className="panel-title">You meet the requirements</div>
          <div className="entry-note" style={{ marginBottom: 10 }}>
            Send a short note explaining why you're a fit for this job.
          </div>
          <button className="btn btn-primary" onClick={onOpenApplyForm}>Apply for this job</button>
        </div>
      )

    case 'form':
      return (
        <div className="panel">
          <div className="panel-title">Cover note</div>
          <label className="field-label">Why are you a fit?</label>
          <textarea
            placeholder="Why are you a good fit?"
            value={coverNote}
            onChange={e => onCoverNoteChange(e.target.value)}
          />
          <div className="btn-row" style={{ marginTop: 12 }}>
            <button className="btn btn-ghost" onClick={onCancelApply}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 2 }} disabled={applying || !coverNote?.trim()} onClick={onSubmitApply}>
              {applying ? 'Submitting...' : 'Submit application'}
            </button>
          </div>
        </div>
      )

    case 'pending':
      return (
        <div className="panel">
          <div className="panel-title">Awaiting client review</div>
          <div className="entry-note">The client has your application. You'll see this update the moment a slot opens up.</div>
        </div>
      )

    // Proposed — not a real render state in JobDetail.tsx today.
    // See session-08.md: myApp?.status === 'rejected' currently falls
    // through to the default Apply button in the live code.
    case 'rejected':
      return (
        <div className="panel">
          <div className="panel-title">Not selected this time</div>
          <div className="entry-note" style={{ marginBottom: 10 }}>
            The client chose another applicant. Keep your profile sharp — new jobs matching your skills come up often.
          </div>
          <button className="btn btn-primary">Browse more jobs</button>
        </div>
      )

    case 'approved':
      return (
        <div className="panel">
          <div className="panel-title">Submit your work</div>
          <div className="sub-composer-hint">A good submission has two parts — what you did, and the proof of it.</div>

          <label className="field-label">What was done</label>
          <textarea
            className="sub-field"
            placeholder="One or two lines tying your work back to what the job asked for."
            value={subWhat}
            onChange={e => onSubWhatChange(e.target.value)}
          />

          <label className="field-label" style={{ marginTop: 14 }}>Evidence</label>
          <textarea
            className="sub-field"
            placeholder={SUBMISSION_EVIDENCE_HINT[submissionKind]}
            value={subEvidence}
            onChange={e => onSubEvidenceChange(e.target.value)}
          />

          {submissionKind === 'bug' && (
            <>
              <label className="field-label" style={{ marginTop: 14 }}>Environment</label>
              <textarea
                className="sub-field sub-field-sm"
                placeholder="Device, OS, browser/app version — whatever made the bug reproducible."
                value={subEnvironment}
                onChange={e => onSubEnvironmentChange(e.target.value)}
              />
            </>
          )}

          <label className="field-label" style={{ marginTop: 14 }}>
            Notes <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--ink-soft)' }}>(optional)</span>
          </label>
          <textarea
            className="sub-field sub-field-sm"
            placeholder="Anything incomplete, or that needs the client's attention."
            value={subNotes}
            onChange={e => onSubNotesChange(e.target.value)}
          />

          <label className="field-label" style={{ marginTop: 16 }}>
            Attachments <span className="sub-soon-tag">Coming soon</span>
          </label>
          <div className="attach-list attach-disabled">
            <div className="attach-row2">
              <div className="attach-icon">🖼️</div>
              <div className="attach-info">
                <div className="attach-name">checkout-error.png</div>
                <div className="attach-meta">Preview only — not yet wired to a real upload</div>
              </div>
            </div>
          </div>
          <button className="attach-add-wide" disabled>+ Add photo or video</button>
          <div className="attach-hint">File attachments aren't live yet — for now, describe evidence in the fields above.</div>

          <button className="btn btn-primary" disabled={submitting || !canSubmitWork} onClick={onSubmitWork}>
            {submitting ? 'Submitting...' : 'Submit Work'}
          </button>
        </div>
      )

    case 'submitted':
      return (
        <div className="panel">
          <div className="panel-title">Awaiting payment release</div>
          <div className="entry-note">The client has your report and will release payment on review. No action needed.</div>
        </div>
      )

    case 'completed_unrated':
      return (
        <div className="panel">
          <div className="panel-title">Rate the client</div>
          <div className="stars">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} className={`star${n <= rateScore ? ' filled' : ''}`} onClick={() => onRateScore(n)}>⭐</button>
            ))}
          </div>
          <label className="field-label">Comment (optional)</label>
          <textarea
            placeholder="Clear instructions, paid promptly..."
            style={{ minHeight: 64 }}
            value={rateComment}
            onChange={e => onRateCommentChange(e.target.value)}
          />
          <button className="btn btn-primary" disabled={rateScore < 1 || ratingSubmitting} onClick={onSubmitRating}>
            {ratingSubmitting ? 'Submitting...' : 'Submit rating'}
          </button>
        </div>
      )

    case 'completed_rated':
      return (
        <div className="panel">
          <div className="rate-given">
            <div className="stars" style={{ justifyContent: 'center' }}>{'★'.repeat(myRating?.score || 5)}</div>
            <p>Thanks for the feedback.</p>
          </div>
        </div>
      )

    default:
      return null
  }
}

export default function HiveworkJobDetailWorker({
  job = {
    eyebrow: 'UI Testing · Job #4471',
    title: 'Test checkout flow on iOS — 5 workers needed',
    client: '@client_mara',
    cat: 'Usability Testing',
    slotsFilled: 3,
    slotsTotal: 5,
    perSlot: 3.7000,
  },
  state = 'approved',
  onBack,
  onVerifyWallet,
  onSetupProfile,
  onSubmitApply,
  onSubmitWork,
  onSubmitRating,
  verifyError,
}) {
  const [coverNote, setCoverNote] = useState('')
  // Structured submission composer (Section 27) — 4 mini-fields, concatenated
  // into one string on submit; the real API only ever accepts one field.
  const [subWhat, setSubWhat] = useState('')
  const [subEvidence, setSubEvidence] = useState('')
  const [subEnvironment, setSubEnvironment] = useState('')
  const [subNotes, setSubNotes] = useState('')
  const submissionKind = getSubmissionKind(job.cat)
  const submission = composeSubmission({ what: subWhat, evidence: subEvidence, environment: subEnvironment, notes: subNotes, kind: submissionKind })
  const canSubmitWork = subWhat.trim().length > 0 && subEvidence.trim().length > 0
  const [applying, setApplying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [rateScore, setRateScore] = useState(0)
  const [rateComment, setRateComment] = useState('')
  const [currentState, setCurrentState] = useState(state)
  const [verifying, setVerifying] = useState(false)

  // Mirrors the real handleVerifyWallet flow in JobDetail.tsx: button shows
  // "Confirm in Pi Wallet..." while awaiting payment confirmation, then a
  // brief wallet_verified confirmation before advancing. In the demo file
  // this always advances to profile_off next — the real component would
  // instead branch on the already-fetched profileComplete value.
  const handleVerifyWallet = async () => {
    setVerifying(true)
    try {
      await onVerifyWallet?.()
      setCurrentState('wallet_verified')
      setTimeout(() => setCurrentState('profile_off'), 1400)
    } finally {
      setVerifying(false)
    }
  }

  const meta = STATE_META[currentState] || STATE_META.approved
  const isPaid = meta.stage === 4

  return (
    <div className="hw-jdw">
      <style>{STYLES}</style>
      <div className="wrap">
        <button className="back-btn" onClick={onBack}>← Back to jobs</button>

        <div className="job-head">
          <div className="job-eyebrow">{job.eyebrow}</div>
          <div className="job-title">{job.title}</div>
          <div className="job-figures">
            <div className="who">{job.client} · {job.slotsFilled}/{job.slotsTotal} workers</div>
            <div className="amt mono">{job.perSlot.toFixed(4)}<span> π / slot</span></div>
          </div>
        </div>

        <div className="ledger">
          {STAGES.map((stage, i) => {
            let cls = 'upcoming'
            if (meta.rejected && i === meta.stage) cls = 'rejected'
            else if (i < meta.stage) cls = 'done'
            else if (i === meta.stage) cls = 'current'
            const showPanel = cls === 'current' || cls === 'rejected'

            return (
              <div className={`entry ${cls}`} key={stage.key}>
                <div className="entry-dot" />
                <div className="entry-time">{cls === 'done' || cls === 'current' || cls === 'rejected' ? '—' : '—'}</div>
                <div className="entry-label">{stage.label}</div>
                <div className="entry-note">{stage.note}</div>
                {showPanel && (
                  <>
                    {isPaid && meta.stage === 4 && currentState !== 'completed_rated' && (
                      <div className="paid-strip">
                        <div className="paid-amt mono">{job.perSlot.toFixed(4)}<span>π</span></div>
                        <div className="paid-sub">SETTLED<br />→ withdraw from Dashboard</div>
                      </div>
                    )}
                    {isPaid && currentState === 'completed_rated' && (
                      <div className="paid-strip">
                        <div className="paid-amt mono">{job.perSlot.toFixed(4)}<span>π</span></div>
                        <div className="paid-sub">SETTLED<br />→ withdraw from Dashboard</div>
                      </div>
                    )}
                    <Panel
                      state={currentState}
                      verifyError={verifyError}
                      verifying={verifying}
                      onVerifyWallet={handleVerifyWallet}
                      onSetupProfile={onSetupProfile}
                      onOpenApplyForm={() => setCurrentState('form')}
                      onCancelApply={() => setCurrentState('ready')}
                      onSubmitApply={async () => {
                        setApplying(true)
                        try { await onSubmitApply?.(coverNote) } finally { setApplying(false); setCurrentState('pending') }
                      }}
                      coverNote={coverNote}
                      onCoverNoteChange={setCoverNote}
                      applying={applying}
                      submissionKind={submissionKind}
                      subWhat={subWhat} onSubWhatChange={setSubWhat}
                      subEvidence={subEvidence} onSubEvidenceChange={setSubEvidence}
                      subEnvironment={subEnvironment} onSubEnvironmentChange={setSubEnvironment}
                      subNotes={subNotes} onSubNotesChange={setSubNotes}
                      canSubmitWork={canSubmitWork}
                      submitting={submitting}
                      onSubmitWork={async () => {
                        setSubmitting(true)
                        try { await onSubmitWork?.(submission) } finally { setSubmitting(false); setCurrentState('submitted') }
                      }}
                      rateScore={rateScore}
                      onRateScore={setRateScore}
                      rateComment={rateComment}
                      onRateCommentChange={setRateComment}
                      ratingSubmitting={ratingSubmitting}
                      onSubmitRating={async () => {
                        setRatingSubmitting(true)
                        try { await onSubmitRating?.({ score: rateScore, comment: rateComment }) } finally { setRatingSubmitting(false); setCurrentState('completed_rated') }
                      }}
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
