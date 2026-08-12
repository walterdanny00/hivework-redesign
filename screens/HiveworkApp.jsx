import React, { useState, useRef, useEffect } from "react";

/**
 * Hivework — App
 * Home / Browse / Post / Dashboard live in the top segmented nav.
 * Profile is reached via the avatar menu ("View profile").
 * Job Detail and the three history screens (Work / Jobs / Withdrawals) are
 * sub-screens reached by tapping into content, and use a Back control
 * instead of the segmented nav. Applicants review is NOT a separate screen —
 * it lives inline inside Job Detail's owner view (real JobDetail.tsx has no
 * dedicated route for it); "Review applicants" buttons open Job Detail.
 *
 * Bell and avatar are fully decoupled: avatar opens the profile menu, bell
 * opens its own notifications panel with a real unread-count badge and
 * mark-all-read-on-open. They used to share one `menuOpen` toggle — fixed.
 *
 * "Dashboard" maps to the real `dashboard` route (WithdrawPanel +
 * ApplicationCard + JobCard, tab: 'worker' | 'client') — My Work / My Jobs
 * here is that same worker/client toggle, just labeled for the UI.
 *
 * Fully self-contained — design tokens are inlined in this file's own
 * style block, no external hivework-tokens.css import needed.
 */

const MAIN_SCREENS = ["home", "browse", "post", "dashboard"];
const NAV_LABELS = { home: "Home", browse: "Browse", post: "Post", dashboard: "Dashboard" };

const JOB_DATA = {
  // isOwner: true for "mine"/"translate" — both appear in Dashboard's
  // "Jobs you've posted" list. "bug" is browsed via Browse — worker
  // perspective, isOwner: false.
  mine: {
    cat: "Bug testing",
    title: "Test payment flow on Android",
    amt: "10π",
    applicants: "0",
    posted: "1m ago",
    isOwner: true,
    desc: "Bug test job from @Olawalt. Test the payment flow end to end on Android and report anything that breaks, including screenshots and exact repro steps.",
    reqs: [
      "Test on a real Android device, not an emulator",
      "Submit a structured report with screenshots",
      "Complete within 48 hours of approval",
    ],
    chips: ["Android", "English"],
    cta: "Submit report →",
  },
  bug: {
    cat: "Bug testing",
    title: "This is a test job",
    amt: "10π",
    applicants: "0",
    posted: "1m ago",
    isOwner: false,
    // slotsTotal/slotsFilled/client are placeholder demo values for the
    // worker-view job header — not wired to real multi-worker backend data
    // for this job (the flat JOB_DATA object doesn't model slots per job).
    slotsTotal: 5,
    slotsFilled: 1,
    client: "@Olawalt",
    desc: "This is a bug test job from @Olawalt. Break things on purpose and report exactly what happened, with clear repro steps.",
    reqs: [
      "Test on a real device, not an emulator",
      "Submit a structured report with screenshots",
      "Complete within 48 hours of approval",
    ],
    chips: ["Android", "iOS", "English"],
    cta: "Apply now →",
  },
  translate: {
    cat: "Translation",
    title: "Localize onboarding copy",
    amt: "6π",
    applicants: "2",
    posted: "3 days ago",
    isOwner: true,
    desc: "Translate the onboarding flow copy (about 40 short strings) into your target language. Tone should stay casual and friendly, matching the English original.",
    reqs: [
      "Native or fluent speaker of the target language",
      "Familiar with mobile app UI copy conventions",
      "Delivered as a single spreadsheet",
    ],
    chips: ["Any device", "Swahili, Tagalog, or Vietnamese"],
    cta: "Apply now →",
  },
};

const WORK_HISTORY = [
  { title: "Test flow on hivework multi worker job post", sub: "submitted · 7/6/2026", amt: "10π", positive: false, date: "2026-07-06" },
  { title: "A test job from walterdanny00", sub: "completed · paid · 7/5/2026", amt: "1π", positive: true, date: "2026-07-05" },
  { title: "This is a test job from walterdanny00", sub: "completed · paid · 7/5/2026", amt: "1π", positive: true, date: "2026-07-05" },
  { title: "A test job from walterdanny00", sub: "completed · paid · 7/5/2026", amt: "1π", positive: true, date: "2026-07-05" },
  { title: "UI feedback on onboarding flow", sub: "completed · paid · 6/30/2026", amt: "3π", positive: true, date: "2026-06-30" },
  { title: "Bug bash — payment retry edge cases", sub: "completed · paid · 6/22/2026", amt: "8π", positive: true, date: "2026-06-22" },
];

const JOBS_HISTORY = [
  { title: "Test payment flow on Android", sub: "1 applicant · in escrow", amt: "10π", positive: false, date: null },
  { title: "Localize onboarding copy", sub: "2 applicants · open", amt: "6π", positive: false, date: null },
  { title: "This is a test job", sub: "completed · closed 6/28/2026", amt: "5π", positive: true, date: "2026-06-28" },
  { title: "Survey: worker satisfaction Q2", sub: "completed · closed 6/15/2026", amt: "4π", positive: true, date: "2026-06-15" },
  { title: "Usability pass on Post Job wizard", sub: "completed · closed 5/30/2026", amt: "7π", positive: true, date: "2026-05-30" },
];

// Shape now matches real WithdrawPanel.tsx/HistoryWithdrawals.tsx exactly:
// requested_amount/fee/net_amount/status/to_address. Flat fee=0.01π across
// every row is a demo simplification — the real API sources `fee` and
// `minWithdrawal` dynamically per-response (GET /api/withdrawals), not as a
// frontend constant, so this is illustrative, not a confirmed real number.
// Dates on the "dates" field are a filtering-demo assumption, same as the
// other two history lists — real rows only carry created_at.
const WITHDRAWAL_HISTORY = [
  { id: "w6", requested_amount: 1.5, fee: 0.01, net_amount: 1.49, status: "processing", to_address: null, date: "2026-08-10" },
  { id: "w1", requested_amount: 2, fee: 0.01, net_amount: 1.99, status: "completed", to_address: "GB33VYXXXXXXXXXXXXXXOFXX", date: "2026-08-07" },
  { id: "w2", requested_amount: 1, fee: 0.01, net_amount: 0.99, status: "completed", to_address: "GB33VYXXXXXXXXXXXXXXOFXX", date: "2026-08-01" },
  { id: "w3", requested_amount: 1, fee: 0.01, net_amount: 0.99, status: "failed", to_address: null, date: "2026-07-15" },
  { id: "w4", requested_amount: 3, fee: 0.01, net_amount: 2.99, status: "completed", to_address: "GB33VYXXXXXXXXXXXXXXOFXX", date: "2026-06-20" },
  { id: "w5", requested_amount: 1, fee: 0.01, net_amount: 0.99, status: "completed", to_address: "GB33VYXXXXXXXXXXXXXXOFXX", date: "2026-05-28" },
];
// Client refund-withdrawal demo rows — same shape as WITHDRAWAL_HISTORY,
// backs the 'refund' kind WithdrawPanel in the myjobs tab.
const REFUND_HISTORY = [
  { id: "r1", requested_amount: 1.4, fee: 0.01, net_amount: 1.39, status: "completed", to_address: "GB33VYXXXXXXXXXXXXXXOFXX", date: "2026-08-05" },
  { id: "r2", requested_amount: 1, fee: 0.01, net_amount: 0.99, status: "completed", to_address: "GB33VYXXXXXXXXXXXXXXOFXX", date: "2026-07-22" },
];
const WD_STATUS_LABEL = { queued: "queued", processing: "processing", completed: "completed", failed: "failed" };
function wdShortAddr(a) { if (!a) return ""; return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a; }
// ctx prefixes the mounted Contact Support instance key so the Dashboard
// mini-preview and the full History→Withdrawals page can both render the
// same row's failed state at once without a key collision (same fix as the
// profile-menu/job-detail instance-scoping already logged).
// ===== WithdrawPanel (Dashboard) — reconciled with real WithdrawPanel.tsx.
// React's controlled-input diffing preserves focus natively, so unlike the
// vanilla-JS shell this needs no direct-DOM-patch workaround for the live
// fee/net preview — a plain onChange + re-render is fine here.
function WithdrawPanel({ balance, minWithdrawal, fee, onWithdraw, kind = "earnings" }) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 'refund' kind = client withdrawing refunded escrow (closed/missed job
  // slots) — same balance/ledger/withdraw mechanics as 'earnings', reconciled
  // against real WithdrawPanel.tsx's isRefund copy branches.
  const isRefund = kind === "refund";

  const amt = Number(amount);
  const validAmt = amount !== "" && Number.isFinite(amt);
  const net = validAmt && amt > fee ? Number((amt - fee).toFixed(4)) : 0;
  const canSubmit = !submitting && validAmt && amt >= minWithdrawal && amt > fee && amt <= balance;

  function handleWithdraw() {
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMsg("");
    setMessage("");
    setTimeout(() => {
      onWithdraw(amt, fee);
      setSubmitting(false);
      setMessage("Withdrawal requested. It is being processed.");
      setAmount("");
    }, 500);
  }

  // Lets a reviewer see the error-copy path without a real failed API call —
  // same "Demo:" trigger-link convention session 11 used for wallet-connect
  // error states.
  function demoFail() { setErrorMsg("Could not request withdrawal."); setMessage(""); }

  return (
    <div className="balance-card">
      <div className="l">{isRefund ? "Refunded balance" : "Available balance"}</div>
      <div className="n">{balance}π</div>
      <div className="withdraw-row">
        <input
          placeholder={`Amount (min ${minWithdrawal}π)`}
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setErrorMsg(""); setMessage(""); }}
        />
        <button disabled={!canSubmit} onClick={handleWithdraw}>{submitting ? "Requesting…" : "Withdraw"}</button>
      </div>

      {validAmt && amt > fee && (
        <div className="wd-fee-note">Network fee {fee}π · you receive <strong>{net}π</strong></div>
      )}

      {balance >= minWithdrawal && (
        <button className="wd-max-link" onClick={() => { setAmount(String(balance)); setErrorMsg(""); setMessage(""); }}>
          Withdraw all ({balance}π)
        </button>
      )}

      {errorMsg && <div className="wd-err">{errorMsg}</div>}
      {message && <div className="wd-msg">{message}</div>}

      <div className="wd-note">
        {isRefund
          ? <>Refunds from closed or missed job slots are sent to your <strong>active Pi wallet</strong>. Make sure the wallet you want to receive to is the one unlocked in your Pi Browser before withdrawing.</>
          : <>Withdrawals are sent to your <strong>active Pi wallet</strong>. Make sure the wallet you want to receive to is the one unlocked in your Pi Browser before withdrawing.</>}
      </div>
      <button className="wd-demo-fail" onClick={demoFail}>Demo: simulate failed request</button>
    </div>
  );
}


function WithdrawalRow({ w }) {
  return (
    <div className="wd-item">
      <div className="wd-item-top">
        <span className="wd-amt">{w.requested_amount}π</span>
        <span className={`wd-status ${w.status}`}>{WD_STATUS_LABEL[w.status]}</span>
      </div>
      <div className="wd-item-sub">
        You received {w.net_amount}π (fee {w.fee}π)
        {w.status === "completed" && w.to_address && <> · to {wdShortAddr(w.to_address)}</>}
        {" · "}{new Date(w.date).toLocaleDateString()}
      </div>
      {w.status === "failed" && (
        <div className="wd-item-fail">
          This withdrawal didn't complete. If your balance wasn't restored, <HiveworkContactSupport label="contact support" subject={`Withdrawal failed (${w.id})`} />
        </div>
      )}
    </div>
  );
}

// Refund history uses the "Jobs you've posted" card language (border,
// radius, shadow) instead of WithdrawalRow's flat list-row style — on the
// myjobs tab, flat rows sandwiched between the refund WithdrawPanel card
// above and the job-post-row cards below read as visually disconnected;
// this ties the section together the way "Your work"/"Withdrawals" already
// read as one continuous flat list on the mywork tab.
function RefundRow({ w }) {
  return (
    <div className="refund-row">
      <div className="refund-row-top">
        <span className="refund-amt">{w.requested_amount}π refunded</span>
        <span className={`wd-status ${w.status}`}>{WD_STATUS_LABEL[w.status]}</span>
      </div>
      <div className="refund-sub">
        You received {w.net_amount}π (fee {w.fee}π)
        {w.status === "completed" && w.to_address && <> · to {wdShortAddr(w.to_address)}</>}
        {" · "}{new Date(w.date).toLocaleDateString()}
      </div>
      {w.status === "failed" && (
        <div className="wd-item-fail">
          This withdrawal didn't complete. If your balance wasn't restored, <HiveworkContactSupport label="contact support" subject={`Refund withdrawal failed (${w.id})`} />
        </div>
      )}
    </div>
  );
}

// Real app backs all 3 History lists with a shared cursor-pagination hook
// (usePaginatedList.ts) — this "Load more" affordance approximates that by
// revealing HIST_PAGE_SIZE more rows per tap, since there's no backend to
// page against in this mockup.
const HIST_PAGE_SIZE = 2;

const NOTIFICATIONS = [
  { id: 1, title: "Application approved", body: "You were approved for \u201cTest payment flow on Android.\u201d", time: "2h ago", unread: true, jobKey: "mine" },
  { id: 2, title: "New applicant", body: "@walterdanny00 applied to \u201cLocalize onboarding copy.\u201d", time: "5h ago", unread: true, jobKey: "translate" },
  { id: 3, title: "Payment released", body: "1\u03c0 was released to your balance.", time: "1d ago", unread: false, jobKey: null },
];

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
  </svg>
);
const ChevIcon = ({ open }) => (
  <svg
    className="chev"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#8A6512"
    strokeWidth="2.5"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const BellIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

function HistoryRow({ title, sub, amt, positive }) {
  return (
    <div className="hist-row">
      <div>
        <h4>{title}</h4>
        <span className={`hist-sub${positive ? " pos" : ""}`}>{sub}</span>
      </div>
      <span className="hist-amt">{amt}</span>
    </div>
  );
}

function HistoryList({ rows, range, shown, onLoadMore, renderRow }) {
  const boundary = getRangeBoundary(range);
  const filtered = rows.filter((row) => !row.date || !boundary || new Date(row.date) >= boundary);
  const visible = filtered.slice(0, shown);
  const hasMore = filtered.length > shown;
  const render = renderRow || ((row) => <HistoryRow key={row.title} {...row} />);
  return (
    <>
      {visible.map(render)}
      {hasMore && (
        <button className="hist-load-more" onClick={onLoadMore}>Load more</button>
      )}
      {!hasMore && filtered.length === 0 && (
        <div className="hist-empty-more">Nothing here yet.</div>
      )}
    </>
  );
}

/* ===== Range Filter (canonical, ported from HiveworkRangeFilter.jsx) =====
   Used in all 3 History pages. Calendar-based boundaries, not rolling —
   "This week" = since Monday 00:00 local, "This month" = since the 1st. */

const HW_RANGE_OPTIONS = [
  { key: "all", label: "All time" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];

function getRangeBoundary(key, now = new Date()) {
  if (key === "week") {
    const d = new Date(now);
    const day = d.getDay(); // 0 = Sunday .. 6 = Saturday
    const diffToMonday = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - diffToMonday);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (key === "month") {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return null; // "all"
}

function HiveworkRangeFilter({ value, onChange }) {
  return (
    <div className="hw-range-filter">
      {HW_RANGE_OPTIONS.map((o) => (
        <button
          key={o.key}
          className={`hw-range-pill${value === o.key ? " active" : ""}`}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ===== Contact Support (canonical, ported from HiveworkContactSupport.jsx) =====
   Reusable inline widget: collapsed link -> in-place form with "Re: {subject}"
   context, 4000-char textarea, Send/Cancel. Simulated send — real call site
   is POST /api/support, not yet built backend-side. Real usage: Layout
   persistent link (here: Profile menu item), JobDetail wallet-verify error
   (worker view), PostJob payment error (not modeled in this shell's
   simplified wizard — remains a documented gap). */

function HiveworkContactSupport({ subject, label = "Contact support", startOpen = false, onCancel }) {
  const [open, setOpen] = useState(startOpen);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    // Send -> POST /api/support, unchanged from real flow
    setTimeout(() => { setSending(false); setSent(true); }, 500);
  }
  function handleCancel() {
    setOpen(false);
    setMessage("");
    setSent(false);
    // Modal call site (profile menu, see below) passes onCancel to also
    // dismiss the modal shell itself, not just collapse back to the link
    // state — the link state has nowhere to live once the modal closes.
    if (onCancel) onCancel();
  }

  if (sent) {
    return (
      <div className="hw-contact-sent">
        <CheckIcon /> Message sent — we'll get back to you soon.
      </div>
    );
  }
  if (!open) {
    return <a className="hw-contact-link" onClick={() => setOpen(true)}>{label}</a>;
  }
  return (
    <div className="hw-contact-form">
      <div className="hw-contact-re">Re: {subject}</div>
      <textarea
        maxLength={4000}
        placeholder="Describe the issue..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="hw-contact-counter">{message.length} / 4000</div>
      <div className="hw-contact-actions">
        <button className="hw-contact-cancel" onClick={handleCancel}>Cancel</button>
        <button className="hw-contact-send" disabled={!message.trim() || sending} onClick={handleSend}>
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}

const HW_RANGE_FILTER_STYLES = `
  .hw-app .hw-range-filter{display:flex;gap:6px;margin-bottom:18px;}
  .hw-app .hw-range-pill{padding:8px 14px;border-radius:100px;border:1.5px solid var(--line);background:var(--card);font-size:12.5px;font-weight:600;color:var(--ink-soft);cursor:pointer;}
  .hw-app .hw-range-pill.active{border-color:var(--violet);background:#EFEAFB;color:var(--violet-deep);}
`;

const HW_CONTACT_SUPPORT_STYLES = `
  .hw-app .hw-contact-link{font-size:13px;font-weight:600;color:var(--violet-deep);cursor:pointer;text-decoration:none;}
  .hw-app .menu-item .hw-contact-link{font-size:13px;font-weight:400;color:var(--ink-soft);}
  .hw-app .hw-contact-form{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin:4px 0;}
  .hw-app .menu-item .hw-contact-form{margin:0;border:none;background:none;padding:0;}
  .hw-app .cs-modal-overlay{position:fixed;inset:0;z-index:60;background:rgba(27,26,31,.45);}
  .hw-app .cs-modal{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);width:min(92vw,380px);background:var(--card);border-radius:20px;box-shadow:0 -20px 60px -15px rgba(27,26,31,.35);z-index:61;padding:20px;}
  .hw-app .cs-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
  .hw-app .cs-modal-head h3{font-size:16px;font-weight:800;margin:0;font-family:'Sora';}
  .hw-app .cs-modal-close{background:none;border:none;font-size:22px;line-height:1;color:var(--ink-soft);cursor:pointer;padding:0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;}
  .hw-app .cs-modal-close:hover{background:var(--cream);color:var(--ink);}
  .hw-app .cs-modal .hw-contact-form{margin:0;border:none;background:none;padding:0;}
  .hw-app .hw-contact-re{font-size:11.5px;font-weight:700;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;}
  .hw-app .hw-contact-form textarea{width:100%;border:1px solid var(--line);border-radius:10px;padding:10px;font-family:'Inter';font-size:13px;color:var(--ink);resize:vertical;min-height:70px;background:var(--cream);}
  .hw-app .hw-contact-counter{font-size:10.5px;color:var(--ink-soft);text-align:right;margin-top:4px;font-family:'JetBrains Mono';}
  .hw-app .hw-contact-actions{display:flex;gap:8px;margin-top:8px;}
  .hw-app .hw-contact-cancel{flex:1;background:#EFECE5;color:var(--ink-soft);border:none;border-radius:100px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;}
  .hw-app .hw-contact-send{flex:1;background:var(--violet);color:white;border:none;border-radius:100px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;}
  .hw-app .hw-contact-send:disabled{background:var(--line);color:var(--ink-soft);cursor:not-allowed;}
  .hw-app .hw-contact-sent{display:flex;align-items:center;gap:8px;font-size:12.5px;color:#1A9E92;font-weight:600;padding:4px 0;}
  .hw-app .hw-contact-sent svg{flex-shrink:0;}
`;

/* ===== Job Detail — Owner view (canonical, ported from HiveworkJobDetail.jsx) =====
   Tabbed Overview/Applicants/Slots + Close-unfilled-slots control + inline
   per-worker rating. Applicant/slot data is the canonical file's own demo
   set (real per-job applicant data isn't modeled anywhere in this shell) —
   title/category/budget/posted come from the clicked job via the `job` prop. */

const STAR_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const TOTAL_SLOTS = 5;
const TRUST_COLOR = { Gold: "var(--butter)", Silver: "#9CA3AF", Bronze: "#B45309", Unverified: "var(--ink-soft)" };

const INITIAL_APPLICANTS = [
  { id: "a1", name: "@sam_k", rating: 4.8, skills: ["Android testing", "Bug reports", "QA"], devices: ["Android"], trustBadge: "★ Gold", trustTier: "Gold",
    coverNote: "I've tested payment flows on 6 different Android devices for two other Pi apps — happy to send examples of past reports." },
  { id: "a2", name: "@devMia", rating: 4.5, skills: ["Android testing"], devices: ["Android"], trustBadge: "Silver", trustTier: "Silver",
    coverNote: "New to Hivework but have a Pixel 8 and a Galaxy S22 to test on — can turn this around same day." },
];

const INITIAL_SLOTS = [
  { id: "s1", name: "@walterdanny00", rating: 4.6, skills: ["Android testing", "Bug reports"], devices: ["Android"], trustBadge: "★ Gold", trustTier: "Gold",
    status: "completed", submission: "Tested on Pixel 7 + Samsung A54. Found one issue: payment confirmation screen flashes blank for ~1s on slow connections. Screenshots attached.", givenRating: 5, draftRating: 0 },
  { id: "s2", name: "@ola_t", rating: 4.9, skills: ["Android testing", "Translations"], devices: ["Android"], trustBadge: "★ Gold", trustTier: "Gold",
    status: "completed", submission: "No issues found on OnePlus 11. Full flow works end to end, retested 3 times.", givenRating: null, draftRating: 0 },
  { id: "s3", name: "@kwame_b", rating: 4.2, skills: ["Android testing"], devices: ["Android"], trustBadge: "Bronze", trustTier: "Bronze",
    status: "progress", submission: null, givenRating: null, draftRating: 0 },
  { id: "s4", name: "@leah_r", rating: 4.7, skills: ["Android testing", "QA"], devices: ["Android"], trustBadge: "Silver", trustTier: "Silver",
    status: "submitted", submission: "Confirmed the flow on a Moto G Power. Payment went through fine but the success toast is cut off on smaller screens — screenshot attached.", givenRating: null, draftRating: 0 },
];

const STATUS_LABEL = { completed: "Completed", progress: "In progress", submitted: "Submitted" };

const JOB_DETAIL_OWNER_STYLES = `
  .jdo .slot-bar{display:flex;gap:4px;margin-bottom:10px;}
  .jdo .slot-seg{flex:1;height:8px;border-radius:5px;background:var(--line);}
  .jdo .slot-seg.completed{background:var(--mint);}
  .jdo .slot-seg.progress{background:var(--violet);}
  .jdo .slot-seg.submitted{background:var(--butter);}
  .jdo .slot-summary{font-size:12.5px;color:var(--ink-soft);margin-bottom:24px;}
  .jdo .slot-summary b{color:var(--ink);font-weight:700;}
  .jdo .detail-sub{font-size:12.5px;color:var(--ink-soft);margin-bottom:18px;}
  .jdo .posted-row{display:flex;align-items:center;gap:8px;margin-bottom:20px;}
  .jdo .status-chip{font-size:11px;font-weight:700;padding:4px 10px;border-radius:100px;background:#FFF3DC;color:#B8860B;text-transform:capitalize;}
  .jdo .toggle-row{display:flex;gap:6px;background:#EFECE5;border-radius:100px;padding:5px;margin-bottom:20px;}
  .jdo .toggle-btn{flex:1;text-align:center;padding:10px 6px;border-radius:100px;font-size:12.5px;font-weight:700;color:var(--ink-soft);cursor:pointer;background:none;border:none;}
  .jdo .toggle-btn.active{background:var(--card);color:var(--ink);box-shadow:0 6px 16px -10px rgba(27,26,31,.25);}
  .jdo .tab-card{background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:0 20px 40px -22px rgba(27,26,31,.2);padding:22px 20px;margin-bottom:26px;}
  .jdo .ov-block{margin-bottom:22px;}
  .jdo .ov-block:last-child{margin-bottom:0;}
  .jdo .ov-label{font-size:11.5px;font-weight:700;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;}
  .jdo .ov-block p{font-size:13.5px;color:var(--ink-soft);line-height:1.6;margin:0;}
  .jdo .applicant-row{display:block;padding:16px 0;border-bottom:1px solid var(--line);}
  .jdo .applicant-row:last-child{border-bottom:none;}
  .jdo .app-top{display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;}
  .jdo .avatar-sm{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--violet),var(--violet-deep));color:white;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .jdo .app-info{flex:1;min-width:0;}
  .jdo .app-info .n{font-weight:700;font-size:13.5px;}
  .jdo .app-info .trust{font-size:11px;font-weight:700;margin-top:2px;}
  .jdo .app-rating{font-size:12px;color:var(--ink-soft);white-space:nowrap;flex-shrink:0;padding-top:2px;}
  .jdo .app-rating b{color:var(--ink);}
  .jdo .app-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;}
  .jdo .app-chip{font-size:11px;font-weight:600;padding:4px 10px;border-radius:100px;background:#EFECE5;color:var(--ink-soft);}
  .jdo .app-chip.device{background:#EFEAFB;color:var(--violet-deep);}
  .jdo .app-note{font-size:12.5px;color:var(--ink-soft);line-height:1.5;margin-bottom:12px;}
  .jdo .app-actions{display:flex;gap:6px;}
  .jdo .app-btn{padding:8px 13px;border-radius:100px;font-size:11.5px;font-weight:700;border:none;cursor:pointer;}
  .jdo .app-btn.approve{background:var(--violet);color:white;flex:1;}
  .jdo .app-btn.decline{background:#EFECE5;color:var(--ink-soft);}
  .jdo .app-btn.decline-confirm{background:var(--coral);color:white;flex:1;}
  .jdo .app-btn.decline-cancel{background:#EFECE5;color:var(--ink-soft);flex:1;}
  .jdo .app-btn.undo{background:#EFEAFB;color:var(--violet-deep);flex-shrink:0;}
  .jdo .empty-note{font-size:12.5px;color:var(--ink-soft);padding:2px 0;}
  .jdo .declined-section{margin-top:14px;border-top:1px solid var(--line);padding-top:12px;}
  .jdo .declined-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;padding:4px 2px;font-size:12.5px;font-weight:700;color:var(--ink-soft);cursor:pointer;}
  .jdo .declined-toggle .chevron{transition:transform .15s ease;}
  .jdo .declined-toggle .chevron.open{transform:rotate(180deg);}
  .jdo .declined-list{display:flex;flex-direction:column;gap:8px;margin-top:8px;}
  .jdo .declined-row{display:flex;align-items:center;gap:10px;padding:8px 10px;background:#F7F5F1;border-radius:12px;}
  .jdo .declined-row .avatar-sm.dim{opacity:.55;}
  .jdo .declined-info{flex:1;min-width:0;}
  .jdo .declined-info .n{font-size:13px;font-weight:600;color:var(--ink-soft);}
  .jdo .declined-info .trust.dim{font-size:11px;color:var(--ink-soft);opacity:.7;}
  .jdo .close-slots-card{background:#FDFBF7;border:1px dashed var(--line);border-radius:16px;padding:16px;margin-bottom:22px;}
  .jdo .close-slots-card .cs-label{font-size:12.5px;font-weight:700;margin-bottom:4px;}
  .jdo .close-slots-card .cs-sub{font-size:11.5px;color:var(--ink-soft);margin-bottom:12px;line-height:1.5;}
  .jdo .cs-row{display:flex;gap:10px;align-items:center;}
  .jdo .cs-input{width:52px;text-align:center;border:1px solid var(--line);border-radius:10px;padding:8px 6px;font-family:'JetBrains Mono';font-weight:700;font-size:13px;background:var(--card);}
  .jdo .cs-btn{flex:1;background:var(--ink);color:white;border:none;border-radius:100px;padding:9px 14px;font-size:12px;font-weight:700;cursor:pointer;}
  .jdo .ledger{position:relative;padding-left:0;}
  .jdo .ledger:before{content:"";position:absolute;left:19px;top:44px;bottom:14px;width:2px;background:var(--line);border-radius:2px;}
  .jdo .ledger-item{position:relative;padding:16px 0;border-bottom:1px solid var(--line);}
  .jdo .ledger-item:first-child{padding-top:0;}
  .jdo .ledger-item:last-child{padding-bottom:0;border-bottom:none;}
  .jdo .ledger-row{display:flex;align-items:center;gap:12px;}
  .jdo .ledger-dot{width:38px;height:38px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;position:relative;z-index:1;border:3px solid var(--cream);}
  .jdo .ledger-dot.completed{background:var(--mint);}
  .jdo .ledger-dot.progress{background:linear-gradient(135deg,var(--violet),var(--violet-deep));}
  .jdo .ledger-dot.submitted{background:var(--butter);color:#8A6512;}
  .jdo .ledger-info{flex:1;min-width:0;}
  .jdo .ledger-info .n{font-weight:700;font-size:13.5px;}
  .jdo .ledger-info .s{font-size:11.5px;color:var(--ink-soft);margin-top:2px;}
  .jdo .ledger-status{flex-shrink:0;font-size:10.5px;font-weight:700;padding:5px 11px;border-radius:100px;white-space:nowrap;}
  .jdo .ledger-status.completed{background:#E4F8F6;color:#1A9E92;}
  .jdo .ledger-status.progress{background:#EFEAFB;color:var(--violet-deep);}
  .jdo .ledger-status.submitted{background:#FFF3DC;color:#B8860B;}
  .jdo .ledger-submission{margin:12px 0 0 50px;background:#F7F5F1;border-radius:12px;padding:10px 12px;font-size:12.5px;color:var(--ink-soft);line-height:1.55;}
  .jdo .ledger-submission .lbl{font-size:10px;font-weight:700;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;}
  .jdo .rating-given{font-size:12px;color:var(--ink-soft);margin:12px 0 0 50px;}
  .jdo .rating-given .stars{color:var(--butter);letter-spacing:1px;}
  .jdo .rate-widget{margin:12px 0 0 50px;display:flex;align-items:center;gap:12px;}
  .jdo .rate-stars{display:flex;gap:4px;cursor:pointer;}
  .jdo .rate-stars svg{color:var(--line);}
  .jdo .rate-stars .on svg{color:var(--butter);}
  .jdo .rate-confirm{font-size:11.5px;font-weight:700;color:white;background:var(--violet);border:none;border-radius:100px;padding:7px 13px;cursor:pointer;opacity:.35;pointer-events:none;}
  .jdo .rate-confirm.enabled{opacity:1;pointer-events:auto;}
  .jdo .ledger-cta{margin:12px 0 0 50px;}
  .jdo .ledger-open{padding:14px 0;}
  .jdo .ledger-open .ledger-row{gap:12px;}
  .jdo .ledger-open .ledger-dot{background:var(--card);border:2px dashed var(--line);}
  .jdo .ledger-open .label{font-size:12.5px;color:var(--ink-soft);}
  .jdo .open-note{display:flex;gap:10px;background:#EFEAFB;border:1px solid #D9CFFB;border-radius:14px;padding:12px 14px;margin-top:18px;font-size:12.5px;color:var(--violet-deep);line-height:1.5;}
  .jdo .open-note svg{flex-shrink:0;margin-top:1px;}
`;

function JobDetailOwner({ job, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [applicants, setApplicants] = useState(INITIAL_APPLICANTS);
  const [declined, setDeclined] = useState([]);
  const [confirmingDeclineId, setConfirmingDeclineId] = useState(null);
  const [declinedExpanded, setDeclinedExpanded] = useState(false);
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [closeCount, setCloseCount] = useState(1);
  const [closeCountText, setCloseCountText] = useState("1");
  const [closing, setClosing] = useState(false);
  const [closedCount, setClosedCount] = useState(0);

  const openCount = TOTAL_SLOTS - slots.length - closedCount;
  const perSlotBudget = 2;

  function approve(id) {
    const a = applicants.find((x) => x.id === id);
    if (!a) return;
    setApplicants((prev) => prev.filter((x) => x.id !== id));
    setSlots((prev) => [...prev, { ...a, status: "progress", submission: null, givenRating: null, draftRating: 0 }]);
  }
  // Decline is a two-step inline confirm (see roadmap Section 16): clicking
  // "Decline" first arms a per-row confirm swap, a second click actually
  // declines. Declined applicants aren't removed outright -- they move into
  // a persistent, collapsed "Declined" section with an Undo, so an owner
  // checking back later still has a record of who they ruled out.
  function requestDecline(id) { setConfirmingDeclineId(id); }
  function cancelDecline() { setConfirmingDeclineId(null); }
  function confirmDecline(id) {
    const a = applicants.find((x) => x.id === id);
    if (!a) return;
    setApplicants((prev) => prev.filter((x) => x.id !== id));
    setDeclined((prev) => [...prev, a]);
    setConfirmingDeclineId(null);
  }
  function undoDecline(id) {
    const a = declined.find((x) => x.id === id);
    if (!a) return;
    setDeclined((prev) => prev.filter((x) => x.id !== id));
    setApplicants((prev) => [...prev, a]);
  }
  function setDraftRating(id, n) { setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, draftRating: n } : s))); }
  function confirmRating(id) { setSlots((prev) => prev.map((s) => (s.id === id && s.draftRating ? { ...s, givenRating: s.draftRating } : s))); }
  function markComplete(id) { setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, status: "completed" } : s))); }
  function closeSlots() {
    setClosing(true);
    setTimeout(() => {
      setClosedCount((prev) => prev + closeCount);
      setCloseCount(1);
      setCloseCountText("1");
      setClosing(false);
    }, 400);
  }
  function handleCloseCountChange(raw) {
    const digits = raw.replace(/[^0-9]/g, "");
    if (digits === "") { setCloseCountText(""); return; }
    const n = parseInt(digits, 10);
    const clamped = Math.max(1, Math.min(openCount, n));
    setCloseCount(clamped);
    setCloseCountText(String(clamped));
  }

  const counts = { completed: 0, progress: 0, submitted: 0 };
  slots.forEach((s) => counts[s.status]++);
  const summaryParts = [];
  if (counts.completed) summaryParts.push(`${counts.completed} completed`);
  if (counts.progress) summaryParts.push(`${counts.progress} in progress`);
  if (counts.submitted) summaryParts.push(`${counts.submitted} awaiting review`);

  return (
    <div className="jdo">
      <button className="back-btn" onClick={onBack}><BackIcon />Back</button>

      <div className="detail-hero">
        <div className="detail-cat">{job.cat}</div>
        <div className="detail-title">{job.title}</div>
      </div>

      <div className="detail-meta-row">
        <div className="detail-meta"><div className="l">Budget</div><div className="v mono">{job.amt}</div></div>
        <div className="detail-meta"><div className="l">Per slot</div><div className="v mono">{perSlotBudget}π</div></div>
        <div className="detail-meta"><div className="l">Posted</div><div className="v">{job.posted}</div></div>
      </div>
      <div className="detail-sub">
        👥 {slots.length}/{TOTAL_SLOTS} workers · {perSlotBudget}π each
      </div>

      <div className="posted-row">
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>Posted by @you</span>
        <span className="status-chip">in progress</span>
      </div>

      <div className="slot-bar">
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
          const slot = slots[i];
          return <div key={i} className={"slot-seg" + (slot ? " " + slot.status : "")} />;
        })}
      </div>
      <div className="slot-summary">
        <b>{slots.length} of {TOTAL_SLOTS} slots filled</b>
        {summaryParts.length ? " — " + summaryParts.join(", ") : ""}
      </div>

      <div className="toggle-row">
        <button className={"toggle-btn" + (activeTab === "overview" ? " active" : "")} onClick={() => setActiveTab("overview")}>Overview</button>
        <button className={"toggle-btn" + (activeTab === "applicants" ? " active" : "")} onClick={() => setActiveTab("applicants")}>Applicants ({applicants.length})</button>
        <button className={"toggle-btn" + (activeTab === "slots" ? " active" : "")} onClick={() => setActiveTab("slots")}>Slots</button>
      </div>

      {activeTab === "overview" && (
        <div className="tab-card">
          <div className="ov-block">
            <div className="ov-label">Description</div>
            <p>{job.desc}</p>
          </div>
          <div className="ov-block">
            <div className="ov-label">Requirements</div>
            <p>{job.reqs.join(" ")}</p>
          </div>
          <div className="ov-block">
            <div className="ov-label">Device & language</div>
            <div className="chip-row">
              {job.chips.map((c) => <span className="chip-outline" key={c}>{c}</span>)}
            </div>
          </div>
        </div>
      )}

      {activeTab === "applicants" && (
        <div className="tab-card">
          {applicants.length === 0 ? (
            <p className="empty-note">No pending applicants.</p>
          ) : (
            applicants.map((a) => (
              <div className="applicant-row" key={a.id}>
                <div className="app-top">
                  <div className="avatar-sm">{a.name[1].toUpperCase()}</div>
                  <div className="app-info">
                    <div className="n">{a.name}</div>
                    <div className="trust" style={{ color: TRUST_COLOR[a.trustTier] }}>{a.trustBadge}</div>
                  </div>
                  <div className="app-rating"><b>{a.rating}</b> ★</div>
                </div>
                <div className="app-chips">
                  {a.skills.slice(0, 3).map((s) => <span className="app-chip" key={s}>{s}</span>)}
                  {a.skills.length > 3 && <span className="app-chip">+{a.skills.length - 3} more</span>}
                  {a.devices.map((d) => <span className="app-chip device" key={d}>📱 {d}</span>)}
                </div>
                <p className="app-note">{a.coverNote}</p>
                <div className="app-actions">
                  {confirmingDeclineId === a.id ? (
                    <>
                      <button className="app-btn decline-confirm" onClick={() => confirmDecline(a.id)}>Sure?</button>
                      <button className="app-btn decline-cancel" onClick={cancelDecline}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="app-btn approve" onClick={() => approve(a.id)}>Approve & Assign</button>
                      <button className="app-btn decline" onClick={() => requestDecline(a.id)}>Decline</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          {declined.length > 0 && (
            <div className="declined-section">
              <button className="declined-toggle" onClick={() => setDeclinedExpanded((v) => !v)}>
                <span>Declined ({declined.length})</span>
                <span className={`chevron ${declinedExpanded ? "open" : ""}`}>⌄</span>
              </button>
              {declinedExpanded && (
                <div className="declined-list">
                  {declined.map((a) => (
                    <div className="declined-row" key={a.id}>
                      <div className="avatar-sm dim">{a.name[1].toUpperCase()}</div>
                      <div className="declined-info">
                        <div className="n">{a.name}</div>
                        <div className="trust dim">{a.trustBadge}</div>
                      </div>
                      <button className="app-btn undo" onClick={() => undoDecline(a.id)}>Undo</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "slots" && (
        <div className="tab-card">
          {openCount > 0 && (
            <div className="close-slots-card">
              <div className="cs-label">Close unfilled slots</div>
              <div className="cs-sub">{openCount} slot{openCount === 1 ? "" : "s"} still unfilled. Closing refunds {perSlotBudget}π per slot back to you.</div>
              <div className="cs-row">
                <input
                  className="cs-input"
                  type="text"
                  inputMode="numeric"
                  value={closeCountText}
                  onChange={(e) => handleCloseCountChange(e.target.value)}
                  onBlur={() => {
                    const n = parseInt(closeCountText, 10);
                    const clamped = isNaN(n) ? 1 : Math.max(1, Math.min(openCount, n));
                    setCloseCount(clamped);
                    setCloseCountText(String(clamped));
                  }}
                />
                <button className="cs-btn" disabled={closing} onClick={closeSlots}>
                  {closing ? "Closing…" : `Close ${closeCount} · refund ${(perSlotBudget * closeCount).toFixed(2)}π`}
                </button>
              </div>
            </div>
          )}

          <div className="ledger">
            {slots.map((s) => (
              <div className="ledger-item" key={s.id}>
                <div className="ledger-row">
                  <div className={"ledger-dot " + s.status}>{s.name[1].toUpperCase()}</div>
                  <div className="ledger-info">
                    <div className="n">{s.name}</div>
                    <div className="s" style={{ color: TRUST_COLOR[s.trustTier] }}>{s.trustBadge} · {s.rating}★</div>
                  </div>
                  <div className={"ledger-status " + s.status}>{STATUS_LABEL[s.status]}</div>
                </div>

                {s.submission && (
                  <div className="ledger-submission">
                    <div className="lbl">Work submission</div>
                    {s.submission}
                  </div>
                )}

                {s.status === "completed" && s.givenRating && (
                  <div className="rating-given">
                    <span className="stars">{"★".repeat(s.givenRating)}{"☆".repeat(5 - s.givenRating)}</span> You rated this worker
                  </div>
                )}

                {s.status === "completed" && !s.givenRating && (
                  <div className="rate-widget">
                    <div className="rate-stars">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} onClick={() => setDraftRating(s.id, n)} className={n <= s.draftRating ? "on" : ""}>{STAR_ICON}</span>
                      ))}
                    </div>
                    <button className={"rate-confirm" + (s.draftRating ? " enabled" : "")} onClick={() => confirmRating(s.id)}>Confirm rating</button>
                  </div>
                )}

                {s.status === "submitted" && (
                  <div className="ledger-cta">
                    <button className="app-btn" style={{ background: "var(--violet)", color: "white" }} onClick={() => markComplete(s.id)}>
                      Mark reviewed & complete — release {perSlotBudget}π
                    </button>
                  </div>
                )}
              </div>
            ))}

            {Array.from({ length: openCount }).map((_, i) => (
              <div className="ledger-item ledger-open" key={"open-" + i}>
                <div className="ledger-row">
                  <div className="ledger-dot" />
                  <div className="label">Open slot — awaiting an applicant</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {openCount > 0 && (
        <div className="open-note" style={{ display: "flex" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span>{openCount} slot{openCount > 1 ? "s" : ""} still open — approving an applicant fills one.</span>
        </div>
      )}
    </div>
  );
}


/* ===== Job Detail — Worker (non-owner) view (canonical, ported from
   HiveworkJobDetailWorker.jsx) — 11-state ledger, self-contained tokens
   under .hw-jdw. Renamed from default export to a plain function + de-scoped
   its own <style> tag is kept inline exactly as the canonical file does
   (harmless to have a second <style> block scoped to a different class). */

const HW_JDW_STYLES = `
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
`;

const HW_JDW_STAGES = [
  { key: 'verify',  label: 'Wallet verification', note: 'One-time 0.01π confirmation payment' },
  { key: 'profile', label: 'Profile complete',     note: "Skills, devices & languages on file" },
  { key: 'apply',   label: 'Application',          note: 'Cover note reviewed by client' },
  { key: 'work',    label: 'Work submission',      note: 'Findings submitted for review' },
  { key: 'paid',    label: 'Payment settled',      note: 'Funds released to your balance' },
];

const HW_JDW_STATE_META = {
  wallet_off:        { stage: 0 },
  wallet_error:       { stage: 0 },
  profile_off:        { stage: 1 },
  ready:              { stage: 2 },
  form:               { stage: 2 },
  pending:            { stage: 2 },
  rejected:           { stage: 2, rejected: true },
  approved:           { stage: 3 },
  submitted:          { stage: 3 },
  completed_unrated:  { stage: 4 },
  completed_rated:    { stage: 4 },
};

function JDWPanel({ state, onVerifyWallet, onSetupProfile, onOpenApplyForm, onCancelApply, onSubmitApply,
                  coverNote, onCoverNoteChange, submitting, applying,
                  submission, onSubmissionChange, onSubmitWork,
                  rateScore, onRateScore, rateComment, onRateCommentChange, onSubmitRating, ratingSubmitting,
                  myRating, verifyError }) {
  switch (state) {
    case 'wallet_off':
    case 'wallet_error':
      return (
        <div className="panel">
          <div className="panel-title">Verify your wallet</div>
          <div className="entry-note" style={{ marginBottom: 10 }}>
            A 0.01π confirmation payment tells us where to send earnings. One-time only.
          </div>
          <button className="btn btn-primary" onClick={onVerifyWallet}>Verify wallet · 0.01π</button>
          {state === 'wallet_error' && verifyError && (
            <div className="error-note">{verifyError} <HiveworkContactSupport label="Contact support" subject="Wallet verification failed" /></div>
          )}
        </div>
      );

    case 'profile_off':
      return (
        <div className="panel">
          <div className="panel-title">Complete your profile</div>
          <div className="entry-note" style={{ marginBottom: 10 }}>
            Clients screen applicants by skill — yours isn't on file yet.
          </div>
          <button className="btn btn-primary" onClick={onSetupProfile}>Set up profile →</button>
        </div>
      );

    case 'ready':
      return (
        <div className="panel">
          <div className="panel-title">You meet the requirements</div>
          <div className="entry-note" style={{ marginBottom: 10 }}>
            Send a short note explaining why you're a fit for this job.
          </div>
          <button className="btn btn-primary" onClick={onOpenApplyForm}>Apply for this job</button>
        </div>
      );

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
      );

    case 'pending':
      return (
        <div className="panel">
          <div className="panel-title">Awaiting client review</div>
          <div className="entry-note">The client has your application. You'll see this update the moment a slot opens up.</div>
        </div>
      );

    case 'rejected':
      return (
        <div className="panel">
          <div className="panel-title">Not selected this time</div>
          <div className="entry-note" style={{ marginBottom: 10 }}>
            The client chose another applicant. Keep your profile sharp — new jobs matching your skills come up often.
          </div>
          <button className="btn btn-primary">Browse more jobs</button>
        </div>
      );

    case 'approved':
      return (
        <div className="panel">
          <div className="panel-title">Submit your work</div>
          <label className="field-label">Report / findings</label>
          <textarea
            placeholder="Describe what you did, bugs found, translations completed, feedback given..."
            value={submission}
            onChange={e => onSubmissionChange(e.target.value)}
          />
          <div className="counter-row"><span>&nbsp;</span><span>{(submission || '').length} characters</span></div>

          <label className="field-label" style={{ marginTop: 16 }}>
            Attachments <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--ink-soft)' }}>(optional)</span>
          </label>
          <div className="attach-list">
            <div className="attach-row2">
              <div className="attach-icon">🖼️</div>
              <div className="attach-info">
                <div className="attach-name">checkout-error.png</div>
                <div className="attach-meta">2.1 MB · uploaded</div>
              </div>
              <button className="attach-x" aria-label="Remove attachment">×</button>
            </div>
          </div>
          <button className="attach-add-wide">+ Add photo or video</button>
          <div className="attach-hint">Up to 5 files, 25MB each.</div>

          <button className="btn btn-primary" disabled={submitting || !submission?.trim()} onClick={onSubmitWork}>
            {submitting ? 'Submitting...' : 'Submit Work'}
          </button>
        </div>
      );

    case 'submitted':
      return (
        <div className="panel">
          <div className="panel-title">Awaiting payment release</div>
          <div className="entry-note">The client has your report and will release payment on review. No action needed.</div>
        </div>
      );

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
      );

    case 'completed_rated':
      return (
        <div className="panel">
          <div className="rate-given">
            <div className="stars" style={{ justifyContent: 'center' }}>{'★'.repeat(myRating?.score || 5)}</div>
            <p>Thanks for the feedback.</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}

function JobDetailWorker({
  job,
  state = 'ready',
  onBack,
  onVerifyWallet,
  onSetupProfile,
  onSubmitApply,
  onSubmitWork,
  onSubmitRating,
  verifyError,
}) {
  const [coverNote, setCoverNote] = useState('');
  const [submission, setSubmission] = useState('');
  const [applying, setApplying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [rateScore, setRateScore] = useState(0);
  const [rateComment, setRateComment] = useState('');
  const [currentState, setCurrentState] = useState(state);

  const meta = HW_JDW_STATE_META[currentState] || HW_JDW_STATE_META.ready;
  const isPaid = meta.stage === 4;

  return (
    <div className="hw-jdw">
      <style>{HW_JDW_STYLES}</style>
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
          {HW_JDW_STAGES.map((stg, i) => {
            let cls = 'upcoming';
            if (meta.rejected && i === meta.stage) cls = 'rejected';
            else if (i < meta.stage) cls = 'done';
            else if (i === meta.stage) cls = 'current';
            const showPanel = cls === 'current' || cls === 'rejected';

            return (
              <div className={`entry ${cls}`} key={stg.key}>
                <div className="entry-dot" />
                <div className="entry-label">{stg.label}</div>
                <div className="entry-note">{stg.note}</div>
                {showPanel && (
                  <>
                    {isPaid && (
                      <div className="paid-strip">
                        <div className="paid-amt mono">{job.perSlot.toFixed(4)}<span>π</span></div>
                        <div className="paid-sub">SETTLED<br />→ withdraw from Dashboard</div>
                      </div>
                    )}
                    <JDWPanel
                      state={currentState}
                      verifyError={verifyError}
                      onVerifyWallet={onVerifyWallet}
                      onSetupProfile={onSetupProfile}
                      onOpenApplyForm={() => setCurrentState('form')}
                      onCancelApply={() => setCurrentState('ready')}
                      onSubmitApply={async () => {
                        setApplying(true);
                        try { await onSubmitApply?.(coverNote); } finally { setApplying(false); setCurrentState('pending'); }
                      }}
                      coverNote={coverNote}
                      onCoverNoteChange={setCoverNote}
                      applying={applying}
                      submission={submission}
                      onSubmissionChange={setSubmission}
                      submitting={submitting}
                      onSubmitWork={async () => {
                        setSubmitting(true);
                        try { await onSubmitWork?.(submission); } finally { setSubmitting(false); setCurrentState('submitted'); }
                      }}
                      rateScore={rateScore}
                      onRateScore={setRateScore}
                      rateComment={rateComment}
                      onRateCommentChange={setRateComment}
                      ratingSubmitting={ratingSubmitting}
                      onSubmitRating={async () => {
                        setRatingSubmitting(true);
                        try { await onSubmitRating?.({ score: rateScore, comment: rateComment }); } finally { setRatingSubmitting(false); setCurrentState('completed_rated'); }
                      }}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


/* ===== Post Job — 4-step wizard (canonical, ported from HiveworkPostJob.jsx) =====
   Basics/Details/Workers & Deadline/Review. Fully self-contained (own STYLES
   + :root token block, adds --danger not present in the shell's own root —
   harmless duplicate :root declaration, same convention as other canonical
   files). Renamed from default export to a plain function to avoid a
   duplicate default export in this file. */

const PLATFORM_FEE_RATE = 0.07;

const CATEGORY_OPTIONS = [
  {
    value: "bug-testing",
    label: "Bug Testing",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 9V7a3 3 0 1 1 6 0v2" />
        <rect x="6" y="9" width="12" height="10" rx="5" />
        <path d="M6 13H3M6 16.5 3.5 18M18 13h3M18 16.5l2.5 1.5M12 9v10M9 5 7.5 3.5M15 5l1.5-1.5" />
      </svg>
    ),
  },
  {
    value: "translation",
    label: "Translation",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
  },
  {
    value: "ui-ux-feedback",
    label: "UI/UX Feedback",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M3 9h18M8 20h8M12 17v3" />
      </svg>
    ),
  },
  {
    value: "usability-testing",
    label: "Usability Testing",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="m14.5 9.5-2 5-5 2 2-5z" />
      </svg>
    ),
  },
  {
    value: "content-review",
    label: "Content Review",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
        <path d="M14 3v5h5M8 13h8M8 17h5" />
      </svg>
    ),
  },
  {
    value: "survey-data-collection",
    label: "Survey / Data",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V10M11 20V4M18 20v-7" />
        <path d="M3 20h18" />
      </svg>
    ),
  },
  {
    value: "localization-testing",
    label: "Localization",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
];

const CATEGORY_LABELS = Object.fromEntries(CATEGORY_OPTIONS.map((c) => [c.value, c.label]));

const DEVICE_OPTIONS = ["Android", "iOS", "Web / Browser", "Desktop", "Any device"];
const LANGUAGE_OPTIONS = [
  "English", "Mandarin Chinese", "Spanish", "Hindi", "Arabic", "Bengali", "Portuguese", "Russian", "French", "Urdu",
  "Indonesian", "German", "Japanese", "Swahili", "Vietnamese", "Turkish", "Tagalog", "Korean", "Italian", "Thai",
  "Persian", "Polish", "Ukrainian", "Dutch", "Romanian", "Greek", "Hungarian", "Hebrew", "Malay", "Amharic",
  "Yoruba", "Igbo", "Hausa", "Zulu", "Burmese", "Khmer", "Nepali", "Sinhala", "Punjabi", "Tamil",
];

const WIZARD_STEPS = [
  { n: 1, label: "Basics" },
  { n: 2, label: "Details" },
  { n: 3, label: "Workers" },
  { n: 4, label: "Review" },
];

const POST_JOB_STYLES = `
  :root{
    --danger:#E5484D;
  }
  .hivework-post-job{color:var(--ink);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
  .hivework-post-job h1,.hivework-post-job h2,.hivework-post-job h3{font-family:'Sora',sans-serif;}
  .hivework-post-job svg{display:block;}

  .hivework-post-job .frame{width:100%;max-width:560px;margin:0 auto;background:var(--cream);position:relative;min-height:80vh;border-radius:0 0 28px 28px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(27,26,31,.3);}
  .hivework-post-job .scroll-area{padding:0 24px 60px;}

  .hivework-post-job .page-head{padding-top:26px;margin-bottom:22px;}
  .hivework-post-job .kicker{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--violet-deep);margin-bottom:6px;}
  .hivework-post-job .page-head h1{font-weight:800;font-size:24px;letter-spacing:-.5px;margin:0;}

  .hivework-post-job .wizard-track{display:flex;margin-bottom:28px;}
  .hivework-post-job .wz-seg{flex:1;text-align:center;position:relative;}
  .hivework-post-job .wz-seg:not(:last-child):after{content:"";position:absolute;top:12px;left:56%;width:88%;height:2px;background:var(--line);}
  .hivework-post-job .wz-seg.done:not(:last-child):after{background:var(--violet);}
  .hivework-post-job .wz-dot{width:24px;height:24px;border-radius:50%;background:var(--card);border:2px solid var(--line);margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--ink-soft);position:relative;z-index:1;}
  .hivework-post-job .wz-seg.done .wz-dot{background:var(--violet);border-color:var(--violet);color:white;}
  .hivework-post-job .wz-seg.active .wz-dot{border-color:var(--violet);color:var(--violet);}
  .hivework-post-job .wz-label{font-size:10px;color:var(--ink-soft);font-weight:600;}
  .hivework-post-job .wz-seg.active .wz-label{color:var(--ink);}

  .hivework-post-job .field{margin-bottom:18px;}
  .hivework-post-job .field label{font-size:13px;font-weight:600;display:block;margin-bottom:7px;}
  .hivework-post-job .field .hint{font-size:11.5px;color:var(--ink-soft);margin-top:6px;line-height:1.5;}
  .hivework-post-job .field .counter{font-size:11px;color:var(--ink-soft);text-align:right;margin-top:2px;}
  .hivework-post-job .field .counter.warn{color:var(--danger);}
  .hivework-post-job .field input,.hivework-post-job .field textarea,.hivework-post-job .field select{width:100%;padding:14px 16px;border-radius:14px;border:1px solid var(--line);background:var(--card);font-size:14px;font-family:'Inter';box-shadow:0 8px 18px -14px rgba(27,26,31,.1);appearance:none;}
  .hivework-post-job .field textarea{resize:none;height:88px;}

  .hivework-post-job .cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .hivework-post-job .cat-opt{padding:14px 8px 12px;border-radius:14px;border:1.5px solid var(--line);text-align:center;font-size:12px;font-weight:600;color:var(--ink-soft);cursor:pointer;line-height:1.3;display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--card);}
  .hivework-post-job .cat-opt svg{stroke:var(--ink-soft);}
  .hivework-post-job .cat-opt.selected{border-color:var(--violet);background:#EFEAFB;color:var(--violet-deep);}
  .hivework-post-job .cat-opt.selected svg{stroke:var(--violet-deep);}

  .hivework-post-job .fee-box{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;font-size:12.5px;color:var(--ink-soft);margin-top:8px;line-height:1.8;}
  .hivework-post-job .fee-box .row{display:flex;justify-content:space-between;}
  .hivework-post-job .fee-box .total{border-top:1px solid var(--line);margin-top:6px;padding-top:6px;font-weight:700;color:var(--ink);}
  .hivework-post-job .fee-box .total span:last-child{color:var(--violet-deep);}

  .hivework-post-job .worker-stepper{display:flex;align-items:center;gap:14px;}
  .hivework-post-job .worker-stepper button{width:44px;height:44px;border-radius:12px;border:1px solid var(--line);background:var(--card);font-size:18px;font-weight:700;color:var(--ink);}
  .hivework-post-job .worker-stepper .n{flex:1;text-align:center;font-family:'Sora';font-weight:800;font-size:22px;border:none;background:transparent;color:var(--ink);width:100%;}
  .hivework-post-job .worker-stepper .n::-webkit-outer-spin-button,.hivework-post-job .worker-stepper .n::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}

  .hivework-post-job .deadline-mode{display:flex;flex-direction:column;gap:8px;}
  .hivework-post-job .dl-opt{padding:14px 16px;border-radius:14px;border:1.5px solid var(--line);cursor:pointer;background:var(--card);}
  .hivework-post-job .dl-opt.selected{border-color:var(--violet);background:#EFEAFB;}
  .hivework-post-job .dl-opt .t{font-size:13.5px;font-weight:700;margin-bottom:2px;}
  .hivework-post-job .dl-opt .d{font-size:11.5px;color:var(--ink-soft);}

  .hivework-post-job .lang-combobox{position:relative;}
  .hivework-post-job .lang-dropdown{display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:0 16px 30px -16px rgba(27,26,31,.25);max-height:180px;overflow-y:auto;z-index:10;}
  .hivework-post-job .lang-dropdown.open{display:block;}
  .hivework-post-job .lang-opt{padding:11px 16px;font-size:13.5px;cursor:pointer;}
  .hivework-post-job .lang-opt:hover{background:var(--cream);}
  .hivework-post-job .lang-opt.empty{color:var(--ink-soft);cursor:default;}
  .hivework-post-job .lang-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);font-size:12px;font-weight:600;padding:6px 8px 6px 12px;border-radius:100px;color:var(--ink);background:var(--card);}
  .hivework-post-job .lang-chip button{border:none;background:var(--line);color:var(--ink-soft);width:18px;height:18px;border-radius:50%;font-size:12px;line-height:1;cursor:pointer;}
  .hivework-post-job .chip-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;}
  .hivework-post-job .chip-outline{border:1px solid var(--line);font-size:12px;font-weight:600;padding:6px 12px;border-radius:100px;color:var(--ink-soft);}

  .hivework-post-job .review-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;margin-bottom:14px;}
  .hivework-post-job .review-card .rc-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-soft);margin-bottom:6px;}
  .hivework-post-job .review-card .rc-val{font-weight:700;font-size:14.5px;}
  .hivework-post-job .review-card p{margin:0;font-size:13.5px;color:var(--ink-soft);line-height:1.6;}

  .hivework-post-job .btn-row{display:flex;gap:10px;}
  .hivework-post-job .btn{padding:16px;border-radius:100px;font-weight:700;font-size:15px;border:none;cursor:pointer;}
  .hivework-post-job .btn-primary{flex:1;background:var(--violet);color:white;box-shadow:0 14px 28px -10px rgba(108,92,231,.55);}
  .hivework-post-job .btn-ghost{background:var(--card);border:1px solid var(--line);color:var(--ink-soft);width:64px;}
  .hivework-post-job .err-msg{color:var(--danger);font-size:13px;margin-bottom:14px;}
`;

// Reusable searchable multi-select combobox used for Device and Language.
function PostJobCombobox({ options, selected, onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const q = query.trim();
  const ql = q.toLowerCase();
  const matches = options.filter((o) => !selected.includes(o) && o.toLowerCase().includes(ql)).slice(0, 8);
  const showAddCustom = q && !options.some((o) => o.toLowerCase() === ql) && !selected.includes(q);

  function select(value) {
    if (!selected.includes(value)) onChange([...selected, value]);
    setQuery("");
    setOpen(false);
  }

  function remove(value) {
    onChange(selected.filter((v) => v !== value));
  }

  return (
    <div className="lang-combobox" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <input
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
      />
      <div className={"lang-dropdown" + (open ? " open" : "")}>
        {matches.map((o) => (
          <div className="lang-opt" key={o} onMouseDown={() => select(o)}>{o}</div>
        ))}
        {showAddCustom && (
          <div className="lang-opt" onMouseDown={() => select(q)}>Add "{q}"</div>
        )}
        {!matches.length && !showAddCustom && (
          <div className="lang-opt empty">Start typing to search or add</div>
        )}
      </div>
      <div className="chip-row">
        {selected.map((v) => (
          <span className="lang-chip" key={v}>
            {v}
            <button type="button" onClick={() => remove(v)}>&times;</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function PostJobWizard() {
  const [step, setStep] = useState(1);
  // Payment-error state — mirrors real PostJob.tsx: window.Pi.createPayment
  // failing surfaces an inline error + ContactSupport anchor (PostJob.tsx:142,
  // subject "Job posting payment issue"). Previously not modeled in this
  // shell (documented gap, see HiveworkContactSupport's header comment);
  // reuses the same canonical HiveworkContactSupport component as every
  // other error-state call site in this file.
  const [paymentError, setPaymentError] = useState("");
  const [posting, setPosting] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("bug-testing");
  const [budgetStr, setBudgetStr] = useState("");

  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [devices, setDevices] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [workerCount, setWorkerCount] = useState(1);
  const [deadlineMode, setDeadlineMode] = useState("per_worker");
  const [slotDays, setSlotDays] = useState("3");
  const [deadlineDate, setDeadlineDate] = useState("");

  const budget = parseFloat(budgetStr) || 0;
  const fee = +(budget * PLATFORM_FEE_RATE).toFixed(4);
  const total = +(budget + fee).toFixed(4);
  const isMulti = workerCount > 1;
  const perSlotBudget = isMulti ? +(budget / workerCount).toFixed(4) : budget;

  function goStep(n) {
    setStep(n);
  }

  function handleWorkerInput(val) {
    const n = parseInt(val, 10);
    setWorkerCount(!n || n < 1 ? 1 : n);
  }

  return (
    <>
      <style>{POST_JOB_STYLES}</style>
      <div className="hivework-post-job">
        <div className="frame">
          <div className="scroll-area">
            <div className="page-head">
              <div className="kicker">New job</div>
              <h1>Post a job.</h1>
            </div>

            <div className="wizard-track">
              {WIZARD_STEPS.map((s) => (
                <div className={"wz-seg" + (s.n === step ? " active" : s.n < step ? " done" : "")} key={s.n}>
                  <div className="wz-dot">{s.n}</div>
                  <div className="wz-label">{s.label}</div>
                </div>
              ))}
            </div>

            {step === 1 && (
              <div>
                <div className="field">
                  <label>Job title</label>
                  <input placeholder="e.g. Test payment flow on Android" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="field">
                  <label>Category</label>
                  <div className="cat-grid">
                    {CATEGORY_OPTIONS.map((c) => (
                      <div
                        className={"cat-opt" + (category === c.value ? " selected" : "")}
                        key={c.value}
                        onClick={() => setCategory(c.value)}
                      >
                        {c.icon}
                        {c.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>{isMulti ? "Total budget, all workers combined (Pi)" : "Budget (Pi)"}</label>
                  <input type="number" min={1} placeholder="e.g. 5" value={budgetStr} onChange={(e) => setBudgetStr(e.target.value)} />
                  <div className="fee-box">
                    <div className="row"><span>Worker gets</span><span>{budget}π</span></div>
                    <div className="row"><span>Platform fee (7%)</span><span>{fee}π</span></div>
                    <div className="row total"><span>Total (escrow)</span><span>{total}π</span></div>
                  </div>
                </div>
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={() => goStep(2)}>Continue &rarr;</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="field">
                  <label>Description</label>
                  <textarea
                    maxLength={1000}
                    placeholder="Describe exactly what needs to be done..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div className={"counter" + (description.length > 900 ? " warn" : "")}>{description.length} / 1000</div>
                </div>
                <div className="field">
                  <label>Requirements</label>
                  <textarea
                    maxLength={500}
                    placeholder="What skills, device, or experience does the worker need?"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                  />
                  <div className={"counter" + (requirements.length > 450 ? " warn" : "")}>{requirements.length} / 500</div>
                </div>
                <div className="field">
                  <label>Device required <span style={{ fontWeight: 400, color: "var(--ink-soft)" }}>(optional)</span></label>
                  <PostJobCombobox options={DEVICE_OPTIONS} selected={devices} onChange={setDevices} placeholder="Type to search or add a device..." />
                </div>
                <div className="field">
                  <label>Language required <span style={{ fontWeight: 400, color: "var(--ink-soft)" }}>(optional)</span></label>
                  <PostJobCombobox options={LANGUAGE_OPTIONS} selected={languages} onChange={setLanguages} placeholder="Type to search or add a language..." />
                </div>
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={() => goStep(1)}>&larr;</button>
                  <button className="btn btn-primary" onClick={() => goStep(3)}>Continue &rarr;</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="field">
                  <label>Number of workers</label>
                  <div className="worker-stepper">
                    <button type="button" onClick={() => setWorkerCount((w) => Math.max(1, w - 1))}>&minus;</button>
                    <input className="n" type="number" min={1} value={workerCount} onChange={(e) => handleWorkerInput(e.target.value)} />
                    <button type="button" onClick={() => setWorkerCount((w) => w + 1)}>+</button>
                  </div>
                  <div className="hint">
                    {isMulti
                      ? `Budget splits evenly — each of ${workerCount} workers gets ${budget ? (budget / workerCount).toFixed(4) : "0"}π.`
                      : "Single worker gets the full budget."}
                  </div>
                </div>

                {isMulti && (
                  <>
                    <div className="field">
                      <label>Deadline type</label>
                      <div className="deadline-mode">
                        <div
                          className={"dl-opt" + (deadlineMode === "per_worker" ? " selected" : "")}
                          onClick={() => setDeadlineMode("per_worker")}
                        >
                          <div className="t">Per-worker deadline</div>
                          <div className="d">Each worker's countdown starts the moment they're approved.</div>
                        </div>
                        <div
                          className={"dl-opt" + (deadlineMode === "fixed" ? " selected" : "")}
                          onClick={() => setDeadlineMode("fixed")}
                        >
                          <div className="t">Shared deadline</div>
                          <div className="d">Every approved worker must finish by the same date.</div>
                        </div>
                      </div>
                    </div>
                    {deadlineMode === "per_worker" ? (
                      <div className="field">
                        <label>Days per worker</label>
                        <input type="number" min={1} placeholder="e.g. 3" value={slotDays} onChange={(e) => setSlotDays(e.target.value)} />
                      </div>
                    ) : (
                      <div className="field">
                        <label>Shared deadline date</label>
                        <input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} />
                      </div>
                    )}
                  </>
                )}

                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={() => goStep(2)}>&larr;</button>
                  <button className="btn btn-primary" onClick={() => goStep(4)}>Continue &rarr;</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="review-card">
                  <div className="rc-label">Job title</div>
                  <div className="rc-val">{title || "—"}</div>
                </div>
                <div className="review-card">
                  <div className="rc-label">Category</div>
                  <div className="rc-val">{CATEGORY_LABELS[category]}</div>
                </div>
                {isMulti && (
                  <div className="review-card">
                    <div className="rc-label">Workers</div>
                    <div className="rc-val">{workerCount} workers &middot; {perSlotBudget}π each</div>
                    <p style={{ marginTop: 6 }}>
                      {deadlineMode === "per_worker"
                        ? `Each worker has ${slotDays || "?"} day(s) from when they're approved.`
                        : `All workers must finish by ${deadlineDate || "(no date set)"}.`}
                    </p>
                  </div>
                )}
                <div className="review-card">
                  <div className="rc-label">Description</div>
                  <p>{description || "—"}</p>
                </div>
                <div className="review-card">
                  <div className="rc-label">Requirements</div>
                  <p>{requirements || "—"}</p>
                  {(devices.length > 0 || languages.length > 0) && (
                    <div className="chip-row">
                      {devices.map((d) => <span className="chip-outline" key={d}>{d}</span>)}
                      {languages.map((l) => <span className="chip-outline" key={l}>{l}</span>)}
                    </div>
                  )}
                </div>
                <div className="review-card">
                  <div className="rc-label" style={{ marginBottom: 10 }}>Payment breakdown</div>
                  <div className="fee-box" style={{ marginTop: 0, border: "none", padding: 0 }}>
                    <div className="row"><span>Worker budget</span><span>{budget}π</span></div>
                    <div className="row"><span>Platform fee (7%)</span><span>{fee}π</span></div>
                    <div className="row total"><span>Total (escrow)</span><span>{total}π</span></div>
                  </div>
                </div>
                {paymentError && (
                  <div className="error-note">
                    {paymentError} <HiveworkContactSupport label="Contact support" subject="Job posting payment issue" />
                  </div>
                )}

                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={() => goStep(3)}>&larr;</button>
                  <button
                    className="btn btn-primary"
                    disabled={posting}
                    onClick={() => {
                      setPaymentError("");
                      setPosting(true);
                      // Pay & Post Job → triggers window.Pi.createPayment, unchanged from real flow
                      setTimeout(() => setPosting(false), 500);
                    }}
                  >
                    {posting ? "Processing…" : `Pay ${total}π & Post Job`}
                  </button>
                </div>
                {!paymentError && (
                  <button
                    className="pj-demo-fail"
                    onClick={() => setPaymentError("Payment couldn't be completed.")}
                  >
                    Demo: simulate failed payment
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


/* ===== Landing — full standalone page (canonical, ported from
   HiveworkLandingScreen.jsx) — logged-out marketing page, real route "/".
   Renders without the shell's persistent header/segnav since it's a
   pre-login page in the real app. Self-contained tokens added (+ --radius,
   used by .cat-card) — original relied on the external hivework-tokens.css
   the same way the shell itself did before that bug was fixed. */

const HW_LANDING_STYLES = `
  :root{
    --cream:#F7F5F1; --ink:#1B1A1F; --ink-soft:#6B6874;
    --violet:#6C5CE7; --violet-deep:#5643D9;
    --mint:#2EC4B6; --coral:#FF6B5D; --butter:#FFC857;
    --line:#E7E3DA; --card:#FFFFFF; --radius:18px;
  }
  body{margin:0;background:var(--cream);}
  .hivework-landing *{box-sizing:border-box;}
  .hivework-landing{
    margin:0;
    background:var(--cream);
    color:var(--ink);
    font-family:'Inter',sans-serif;
    -webkit-font-smoothing:antialiased;
    scroll-behavior:smooth;
  }
  .hivework-landing h1,.hivework-landing h2,.hivework-landing h3{font-family:'Sora',sans-serif;}
  .hivework-landing .mono{font-family:'JetBrains Mono',monospace;}
  .hivework-landing a{color:inherit;text-decoration:none;}

  .hivework-landing nav{
    max-width:1180px;margin:0 auto;
    display:flex;align-items:center;justify-content:space-between;
    padding:24px 24px 0;position:relative;
  }
  .hivework-landing .logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:20px;}
  .hivework-landing .testnet-badge{font-family:'Inter';font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:4px 9px;border-radius:100px;background:var(--line);color:var(--ink-soft);cursor:pointer;}
  .hivework-landing .testnet-tip{position:absolute;top:60px;left:24px;max-width:280px;background:var(--ink);color:var(--cream);font-size:12px;line-height:1.5;padding:12px 14px;border-radius:14px;z-index:30;box-shadow:0 20px 40px -16px rgba(27,26,31,.35);}
  .hivework-landing .logo-mark{
    width:34px;height:34px;border-radius:10px;
    background:linear-gradient(135deg,var(--violet),var(--violet-deep));
    display:flex;align-items:center;justify-content:center;
    color:white;font-size:16px;flex-shrink:0;
  }
  .hivework-landing .nav-links{display:flex;gap:6px;align-items:center;}
  .hivework-landing .nav-links a{
    padding:9px 16px;border-radius:100px;font-weight:600;font-size:14.5px;color:var(--ink-soft);
    transition:background .15s,color .15s; cursor:pointer;
  }
  .hivework-landing .nav-links a:hover{background:#EFEBE3;color:var(--ink);}
  .hivework-landing .nav-cta{background:var(--ink);color:white!important;padding:10px 20px!important;}
  .hivework-landing .nav-cta:hover{background:var(--violet-deep)!important;color:white!important;}
  @media (max-width:820px){ .hivework-landing .nav-links a:not(.nav-cta){display:none;} }

  .hivework-landing .hero{
    max-width:1180px;margin:0 auto;
    display:grid;grid-template-columns:1.05fr 0.95fr;gap:40px;
    padding:64px 24px 40px;align-items:center;
  }
  @media (max-width:900px){ .hivework-landing .hero{grid-template-columns:1fr;padding-top:40px;} }

  .hivework-landing .eyebrow{
    display:inline-flex;align-items:center;gap:8px;
    background:#EFEAFB;color:var(--violet-deep);
    padding:7px 14px;border-radius:100px;font-size:13px;font-weight:600;
    margin-bottom:22px;
  }
  .hivework-landing .eyebrow-dot{
    width:7px;height:7px;border-radius:50%;background:var(--mint);flex-shrink:0;
    box-shadow:0 0 0 0 rgba(46,196,182,.5);animation:hw-pulse 2s infinite;
  }
  @keyframes hw-pulse{
    0%{box-shadow:0 0 0 0 rgba(46,196,182,.45);}
    70%{box-shadow:0 0 0 8px rgba(46,196,182,0);}
    100%{box-shadow:0 0 0 0 rgba(46,196,182,0);}
  }

  .hivework-landing .hero h1{
    font-size:clamp(36px,5vw,58px);
    line-height:1.04;font-weight:800;letter-spacing:-1.5px;margin:0 0 20px;
  }
  .hivework-landing .hero h1 .accent{color:var(--violet);}
  .hivework-landing .hero p.sub{
    font-size:17px;line-height:1.6;color:var(--ink-soft);max-width:460px;margin:0 0 32px;
  }
  .hivework-landing .hero-ctas{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:44px;}
  .hivework-landing .btn{
    padding:14px 26px;border-radius:100px;font-weight:600;font-size:15px;
    display:inline-flex;align-items:center;gap:8px;transition:transform .12s, box-shadow .12s;
    border:none;cursor:pointer;
  }
  .hivework-landing .btn:active{transform:scale(.97);}
  .hivework-landing .btn-primary{background:var(--violet);color:white;box-shadow:0 10px 24px -8px rgba(108,92,231,.55);}
  .hivework-landing .btn-primary:hover{background:var(--violet-deep);}
  .hivework-landing .btn-ghost{background:var(--card);color:var(--ink);border:1.5px solid var(--line);}
  .hivework-landing .btn-ghost:hover{border-color:var(--ink);}

  .hivework-landing .trust-row{display:flex;gap:28px;flex-wrap:wrap;}
  .hivework-landing .trust-item{display:flex;flex-direction:column;}
  .hivework-landing .trust-item .num{font-family:'Sora';font-weight:800;font-size:22px;}
  .hivework-landing .trust-item .label{font-size:12.5px;color:var(--ink-soft);}

  .hivework-landing .ticker-wrap{position:relative;height:420px;}
  .hivework-landing .ticker-card{
    position:absolute;left:0;right:0;background:var(--card);
    border-radius:18px;padding:18px 20px;
    box-shadow:0 20px 45px -18px rgba(27,26,31,.18);
    border:1px solid var(--line);
    display:flex;align-items:center;gap:14px;
    opacity:0;transform:translateY(14px);
  }
  .hivework-landing .ticker-icon{
    width:40px;height:40px;border-radius:12px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;font-size:18px;
  }
  .hivework-landing .ticker-body{flex:1;min-width:0;}
  .hivework-landing .ticker-title{font-weight:600;font-size:14.5px;margin-bottom:2px;}
  .hivework-landing .ticker-sub{font-size:12.5px;color:var(--ink-soft);}
  .hivework-landing .ticker-amount{font-family:'JetBrains Mono';font-weight:500;font-size:14px;flex-shrink:0;}

  .hivework-landing .t1{top:0;}
  .hivework-landing .t2{top:98px;}
  .hivework-landing .t3{top:196px;}
  .hivework-landing .t4{top:294px;}

  .hivework-landing .t1 .ticker-icon{background:#EFEAFB;color:var(--violet);}
  .hivework-landing .t2 .ticker-icon{background:#FFF3DC;color:#B8860B;}
  .hivework-landing .t3 .ticker-icon{background:#E4F8F6;color:#1A9E92;}
  .hivework-landing .t4 .ticker-icon{background:#E4F8F6;color:#1A9E92;}
  .hivework-landing .t2 .ticker-amount{color:#B8860B;}
  .hivework-landing .t3 .ticker-amount,.hivework-landing .t4 .ticker-amount{color:#1A9E92;}

  @keyframes hw-rise{
    0%{opacity:0;transform:translateY(18px);}
    8%{opacity:1;transform:translateY(0);}
    92%{opacity:1;transform:translateY(0);}
    100%{opacity:0;transform:translateY(-10px);}
  }
  .hivework-landing .t1{animation:hw-rise 7s ease-in-out infinite;}
  .hivework-landing .t2{animation:hw-rise 7s ease-in-out infinite 1.75s;}
  .hivework-landing .t3{animation:hw-rise 7s ease-in-out infinite 3.5s;}
  .hivework-landing .t4{animation:hw-rise 7s ease-in-out infinite 5.25s;}

  .hivework-landing .ticker-frame{
    position:absolute;inset:-16px -16px auto -16px;height:452px;
    border-radius:28px;background:linear-gradient(180deg,#EFEAFB 0%,transparent 60%);
    z-index:-1;
  }

  .hivework-landing .stats{
    max-width:1180px;margin:0 auto;padding:8px 24px 64px;
    display:grid;grid-template-columns:repeat(3,1fr);gap:16px;
  }
  @media (max-width:700px){ .hivework-landing .stats{grid-template-columns:1fr;} }
  .hivework-landing .stat-card{
    background:var(--card);border:1px solid var(--line);border-radius:18px;
    padding:22px 24px;
  }
  .hivework-landing .stat-card .num{font-family:'Sora';font-weight:800;font-size:30px;}
  .hivework-landing .stat-card .label{color:var(--ink-soft);font-size:13.5px;margin-top:2px;}

  .hivework-landing section{max-width:1180px;margin:0 auto;padding:20px 24px 72px;}
  .hivework-landing .section-head{margin-bottom:32px;}
  .hivework-landing .section-head .kicker{color:var(--violet);font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;}
  .hivework-landing .section-head h2{font-size:32px;font-weight:800;letter-spacing:-.6px;margin:0;}

  .hivework-landing .cat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
  @media (max-width:800px){ .hivework-landing .cat-grid{grid-template-columns:1fr;} }
  .hivework-landing .cat-card{
    background:var(--card);border:1px solid var(--line);border-radius:var(--radius);
    padding:26px;transition:transform .15s, box-shadow .15s;
  }
  .hivework-landing .cat-card:hover{transform:translateY(-4px);box-shadow:0 18px 36px -16px rgba(27,26,31,.14);}
  .hivework-landing .cat-blob{
    width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;
    font-size:22px;margin-bottom:18px;
  }
  .hivework-landing .cat-card:nth-child(1) .cat-blob{background:#FFE8E5;}
  .hivework-landing .cat-card:nth-child(2) .cat-blob{background:#FFF3DC;}
  .hivework-landing .cat-card:nth-child(3) .cat-blob{background:#E4F8F6;}
  .hivework-landing .cat-card h3{font-size:18px;margin:0 0 6px;font-weight:700;}
  .hivework-landing .cat-card p{color:var(--ink-soft);font-size:14px;margin:0 0 16px;line-height:1.5;}
  .hivework-landing .cat-card .open{
    font-size:13px;font-weight:600;color:var(--violet-deep);
    display:flex;align-items:center;gap:6px;
  }

  .hivework-landing .flow{background:var(--ink);border-radius:28px;padding:56px 44px;color:white;position:relative;overflow:hidden;}
  .hivework-landing .flow:before{
    content:"";position:absolute;top:-80px;right:-80px;width:280px;height:280px;
    border-radius:50%;background:radial-gradient(circle,rgba(108,92,231,.35),transparent 70%);
  }
  .hivework-landing .flow-head{margin-bottom:36px;position:relative;}
  .hivework-landing .flow-head .kicker{color:#B8A9FF;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;}
  .hivework-landing .flow-head h2{font-size:30px;font-weight:800;margin:0;letter-spacing:-.5px;}
  .hivework-landing .flow-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;position:relative;}
  @media (max-width:800px){ .hivework-landing .flow-steps{grid-template-columns:1fr;} }
  .hivework-landing .flow-step{border-left:2px solid rgba(255,255,255,.15);padding-left:20px;}
  .hivework-landing .flow-step .idx{font-family:'JetBrains Mono';color:#B8A9FF;font-size:13px;margin-bottom:10px;}
  .hivework-landing .flow-step h3{font-size:17px;margin:0 0 8px;font-weight:700;}
  .hivework-landing .flow-step p{color:#B4B1BC;font-size:14px;line-height:1.55;margin:0;}

  .hivework-landing footer{
    max-width:1180px;margin:0 auto;padding:40px 24px 60px;
    display:flex;justify-content:space-between;align-items:center;
    border-top:1px solid var(--line);color:var(--ink-soft);font-size:13.5px;flex-wrap:wrap;gap:16px;
  }
  .hivework-landing footer .logo{font-size:15px;}
  .hivework-landing footer .logo-mark{width:26px;height:26px;font-size:13px;border-radius:8px;}
`;

function HiveworkLandingScreen({ onGetStarted, onFindWork, onPostJob }) {
  const [testnetTipOpen, setTestnetTipOpen] = useState(false);
  return (
    <>
      <style>{HW_LANDING_STYLES}</style>

      <div className="hivework-landing">
        <nav>
          <div className="logo">
            <div className="logo-mark">π</div>Hivework
            <span className="testnet-badge" onClick={(e) => { e.stopPropagation(); setTestnetTipOpen((o) => !o); }}>Testnet</span>
          </div>
          {testnetTipOpen && (
            <div className="testnet-tip">Hivework is running on the Pi Testnet. Balances and payments shown are Test-Pi and carry no real-world value.</div>
          )}
          <div className="nav-links">
            <a onClick={onGetStarted}>Browse</a>
            <a onClick={onGetStarted}>Post a job</a>
            <a onClick={onGetStarted}>Dashboard</a>
            <a className="nav-cta" onClick={onGetStarted}>Get started</a>
          </div>
        </nav>

        <div className="hero">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span>Powered by Sentinel Trust Layer</div>
            <h1>Work gets done.<br />Pi gets <span className="accent">released</span>, instantly.</h1>
            <p className="sub">Hivework is the freelance and testing marketplace for the Pi ecosystem. Post a task, lock the budget in escrow, and pay the moment the work's approved — no invoices, no waiting.</p>
            <div className="hero-ctas">
              <button className="btn btn-primary" onClick={onFindWork}>Find work →</button>
              <button className="btn btn-ghost" onClick={onPostJob}>Post a job</button>
            </div>
            <div className="trust-row">
              <div className="trust-item"><span className="num">116π</span><span className="label">paid out this week</span></div>
              <div className="trust-item"><span className="num">7%</span><span className="label">platform fee</span></div>
              <div className="trust-item"><span className="num">3</span><span className="label">job categories</span></div>
            </div>
          </div>

          <div className="ticker-wrap">
            <div className="ticker-frame"></div>
            <div className="ticker-card t1">
              <div className="ticker-icon">📝</div>
              <div className="ticker-body">
                <div className="ticker-title">Job posted</div>
                <div className="ticker-sub">"Test payment flow on Android"</div>
              </div>
              <div className="ticker-amount mono">10π</div>
            </div>
            <div className="ticker-card t2">
              <div className="ticker-icon">🔒</div>
              <div className="ticker-body">
                <div className="ticker-title">Pi locked in escrow</div>
                <div className="ticker-sub">Held safely until work is approved</div>
              </div>
              <div className="ticker-amount mono">10π</div>
            </div>
            <div className="ticker-card t3">
              <div className="ticker-icon">✅</div>
              <div className="ticker-body">
                <div className="ticker-title">Worker approved</div>
                <div className="ticker-sub">@Olawalt · report submitted</div>
              </div>
              <div className="ticker-amount mono">10π</div>
            </div>
            <div className="ticker-card t4">
              <div className="ticker-icon">💸</div>
              <div className="ticker-body">
                <div className="ticker-title">Pi released to wallet</div>
                <div className="ticker-sub mono">GB33VY…OFXX</div>
              </div>
              <div className="ticker-amount mono">9.3π</div>
            </div>
          </div>
        </div>

        <section>
          <div className="section-head">
            <div className="kicker">Categories</div>
            <h2>Find the kind of work you're good at</h2>
          </div>
          <div className="cat-grid">
            <div className="cat-card">
              <div className="cat-blob">🐛</div>
              <h3>Bug testing</h3>
              <p>Break things on purpose. Report exactly what happened, on real devices.</p>
              <div className="open">1 open job →</div>
            </div>
            <div className="cat-card">
              <div className="cat-blob">🎨</div>
              <h3>UI feedback</h3>
              <p>Give developers a clear read on what's confusing before it ships.</p>
              <div className="open">0 open jobs →</div>
            </div>
            <div className="cat-card">
              <div className="cat-blob">🌍</div>
              <h3>Translation</h3>
              <p>Help apps speak your language, literally. Any device, any locale.</p>
              <div className="open">0 open jobs →</div>
            </div>
          </div>
        </section>

        <section>
          <div className="flow">
            <div className="flow-head">
              <div className="kicker">How escrow works</div>
              <h2>Three steps, no middleman holding your Pi longer than it has to</h2>
            </div>
            <div className="flow-steps">
              <div className="flow-step">
                <div className="idx">01 — post</div>
                <h3>Developer posts a job</h3>
                <p>Sets the task, requirements, and locks the Pi budget in escrow up front.</p>
              </div>
              <div className="flow-step">
                <div className="idx">02 — work</div>
                <h3>Pioneer applies and works</h3>
                <p>Claims the task, does the work, submits a structured report for review.</p>
              </div>
              <div className="flow-step">
                <div className="idx">03 — release</div>
                <h3>Approved and paid</h3>
                <p>Developer approves. Pi releases straight to the worker's wallet — instantly.</p>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div className="logo"><div className="logo-mark">π</div>Hivework</div>
          <div>© 2026 Hivework · Built for the Pi Network ecosystem</div>
        </footer>
      </div>
    </>
  );
}


/* ===== Real /onboarding (Profile Complete) — full standalone page
   (canonical, ported from HiveworkProfileComplete.jsx). Already
   self-contained (own :root block) — no external-CSS bug here. Renamed
   Combobox -> ProfileCompleteCombobox to avoid collision with
   PostJobCombobox. Save/Skip both call onDone — real flow is
   PUT /api/users/me/profile then navigate(returnTo); shell approximates
   returnTo via the onboardingIntent set by whichever CTA opened this. */

const HWPC_DEVICES = ["Android", "iOS", "Web / Browser", "Desktop", "Any device"];
const HWPC_LANGUAGES = [
  "English", "Mandarin Chinese", "Spanish", "Hindi", "Arabic", "Bengali", "Portuguese", "Russian", "French", "Urdu",
  "Indonesian", "German", "Japanese", "Swahili", "Vietnamese", "Turkish", "Tagalog", "Korean", "Italian", "Thai",
  "Persian", "Polish", "Ukrainian", "Dutch", "Romanian", "Greek", "Hungarian", "Hebrew", "Malay", "Amharic",
  "Yoruba", "Igbo", "Hausa", "Zulu", "Burmese", "Khmer", "Nepali", "Sinhala", "Punjabi", "Tamil",
];

const HWPC_STYLES = `
  :root{
    --cream:#F7F5F1; --ink:#1B1A1F; --ink-soft:#6B6874;
    --violet:#6C5CE7; --violet-deep:#5643D9;
    --mint:#2EC4B6; --coral:#FF6B5D; --butter:#FFC857;
    --line:#E7E3DA; --card:#FFFFFF; --danger:#E5484D;
  }
  .hwpc-frame{width:100%;max-width:560px;margin:0 auto;background:var(--cream);position:relative;min-height:100vh;font-family:'Inter',sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;}
  .hwpc-frame *{box-sizing:border-box;}
  .hwpc-frame h1{font-family:'Sora',sans-serif;}
  .hwpc-frame svg{display:block;}

  .hwpc-scroll{padding:0 24px 100px;}

  .hwpc-head{padding-top:44px;margin-bottom:28px;text-align:center;}
  .hwpc-head-icon{width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,var(--violet),var(--violet-deep));display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 14px 28px -12px rgba(108,92,231,.5);}
  .hwpc-head h1{font-weight:800;font-size:22px;letter-spacing:-.4px;margin:0 0 8px;}
  .hwpc-head p{font-size:13.5px;color:var(--ink-soft);line-height:1.6;max-width:320px;margin:0 auto;}

  .hwpc-err{color:var(--danger);font-size:13px;margin-bottom:16px;text-align:center;}

  .hwpc-field{margin-bottom:20px;}
  .hwpc-field label{font-size:13px;font-weight:600;display:block;margin-bottom:7px;}
  .hwpc-req{color:var(--coral);}
  .hwpc-opt{font-weight:400;color:var(--ink-soft);}
  .hwpc-hint{font-size:11.5px;color:var(--ink-soft);margin-top:6px;line-height:1.5;}
  .hwpc-counter{font-size:11px;color:var(--ink-soft);text-align:right;margin-top:2px;}
  .hwpc-counter.hwpc-warn{color:var(--danger);}
  .hwpc-field textarea{width:100%;padding:14px 16px;border-radius:14px;border:1px solid var(--line);background:var(--card);font-size:14px;font-family:'Inter';box-shadow:0 8px 18px -14px rgba(27,26,31,.1);resize:none;height:88px;}

  .hwpc-combobox{position:relative;padding:9px 10px;border-radius:14px;border:1px solid var(--line);background:var(--card);box-shadow:0 8px 18px -14px rgba(27,26,31,.1);display:flex;flex-wrap:wrap;gap:6px;align-items:center;}
  .hwpc-combobox.hwpc-empty-required{border-color:#F3C6C2;}
  .hwpc-combobox input{border:none;outline:none;background:transparent;font-size:14px;font-family:'Inter';flex:1;min-width:120px;padding:5px 4px;}
  .hwpc-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);font-size:12px;font-weight:600;padding:6px 8px 6px 12px;border-radius:100px;color:var(--ink);background:var(--cream);}
  .hwpc-chip button{border:none;background:var(--line);color:var(--ink-soft);width:16px;height:16px;border-radius:50%;font-size:11px;line-height:1;cursor:pointer;flex-shrink:0;}
  .hwpc-dropdown{display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:0 16px 30px -16px rgba(27,26,31,.25);max-height:180px;overflow-y:auto;z-index:10;}
  .hwpc-dropdown.hwpc-open{display:block;}
  .hwpc-dd-opt{padding:11px 16px;font-size:13.5px;cursor:pointer;}
  .hwpc-dd-opt:hover{background:var(--cream);}
  .hwpc-dd-opt.hwpc-empty{color:var(--ink-soft);cursor:default;}

  .hwpc-save-btn{width:100%;padding:16px;border-radius:100px;font-weight:700;font-size:15px;border:none;cursor:pointer;background:var(--violet);color:white;box-shadow:0 14px 28px -10px rgba(108,92,231,.55);margin-bottom:12px;}
  .hwpc-save-btn:disabled{background:var(--line);color:var(--ink-soft);box-shadow:none;cursor:not-allowed;}
  .hwpc-skip-hint{font-size:11.5px;color:var(--ink-soft);text-align:center;margin-bottom:10px;}
  .hwpc-skip-btn{width:100%;padding:14px;border-radius:100px;font-weight:700;font-size:14px;border:1px solid var(--line);background:var(--card);color:var(--ink-soft);cursor:pointer;}
`;

function ProfileCompleteCombobox({ options, selected, onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ql = query.trim().toLowerCase();
  const matches = options
    .filter((o) => !selected.includes(o) && o.toLowerCase().includes(ql))
    .slice(0, 8);
  const showCustomAdd =
    query.trim() && !options.some((o) => o.toLowerCase() === ql) && !selected.includes(query.trim());

  function addValue(value) {
    if (value && !selected.includes(value)) onChange([...selected, value]);
    setQuery("");
    setOpen(false);
  }

  function removeValue(value) {
    onChange(selected.filter((v) => v !== value));
  }

  return (
    <div className="hwpc-combobox" ref={wrapRef}>
      {selected.map((v) => (
        <span className="hwpc-chip" key={v}>
          {v}
          <button type="button" onClick={() => removeValue(v)}>&times;</button>
        </span>
      ))}
      <input
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
      />
      <div className={`hwpc-dropdown${open ? " hwpc-open" : ""}`}>
        {matches.length === 0 && !showCustomAdd && (
          <div className="hwpc-dd-opt hwpc-empty">Start typing to search or add</div>
        )}
        {matches.map((o) => (
          <div className="hwpc-dd-opt" key={o} onMouseDown={() => addValue(o)}>
            {o}
          </div>
        ))}
        {showCustomAdd && (
          <div className="hwpc-dd-opt" onMouseDown={() => addValue(query.trim())}>
            Add &quot;{query.trim()}&quot;
          </div>
        )}
      </div>
    </div>
  );
}

function HiveworkProfileCompleteScreen({ onDone }) {
  const [skills, setSkills] = useState([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [devices, setDevices] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [bio, setBio] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const canSave = skills.length > 0;

  function commitSkill() {
    const v = skillDraft.trim().replace(/,$/, "");
    if (v && !skills.includes(v)) setSkills([...skills, v]);
    setSkillDraft("");
  }

  function handleSkillKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitSkill();
    } else if (e.key === "Backspace" && !skillDraft && skills.length) {
      setSkills(skills.slice(0, -1));
    }
  }

  function removeSkill(s) {
    setSkills(skills.filter((x) => x !== s));
  }

  function handleSave() {
    if (!canSave) return;
    // Save Profile → PUT /api/users/me/profile, unchanged from real flow
    const payload = { skills, devices, languages, bio: bio.trim() };
    console.log("Save Profile payload", payload);
    onDone?.();
  }

  function handleSkip() {
    // Skip → navigate(returnTo), unchanged from real flow
    onDone?.();
  }

  return (
    <>
      <style>{HWPC_STYLES}</style>
      <div className="hwpc-frame">
        <div className="hwpc-scroll">
          <div className="hwpc-head">
            <div className="hwpc-head-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h1>Complete your profile.</h1>
            <p>Clients use your profile to decide who to hire. Add your skills to unlock applying for jobs.</p>
          </div>

          {errMsg && <div className="hwpc-err">{errMsg}</div>}

          <div className="hwpc-field">
            <label>Skills <span className="hwpc-req">*</span></label>
            <div className={`hwpc-combobox${skills.length === 0 ? " hwpc-empty-required" : ""}`}>
              {skills.map((s) => (
                <span className="hwpc-chip" key={s}>
                  {s}
                  <button type="button" onClick={() => removeSkill(s)}>&times;</button>
                </span>
              ))}
              <input
                value={skillDraft}
                placeholder="Type a skill and press Enter..."
                onChange={(e) => setSkillDraft(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                onBlur={commitSkill}
              />
            </div>
            <div className="hwpc-hint">e.g. Android testing, UI feedback, Bug reports</div>
          </div>

          <div className="hwpc-field">
            <label>Devices <span className="hwpc-opt">(optional)</span></label>
            <ProfileCompleteCombobox
              options={HWPC_DEVICES}
              selected={devices}
              onChange={setDevices}
              placeholder="Type to search or add a device..."
            />
          </div>

          <div className="hwpc-field">
            <label>Languages <span className="hwpc-opt">(optional)</span></label>
            <ProfileCompleteCombobox
              options={HWPC_LANGUAGES}
              selected={languages}
              onChange={setLanguages}
              placeholder="Type to search or add a language..."
            />
          </div>

          <div className="hwpc-field">
            <label>Bio <span className="hwpc-opt">(optional)</span></label>
            <textarea
              maxLength={200}
              placeholder="A short description of your experience..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className={`hwpc-counter${bio.length > 180 ? " hwpc-warn" : ""}`}>
              {bio.length} / 200
            </div>
          </div>

          <button className="hwpc-save-btn" disabled={!canSave} onClick={handleSave}>
            Save Profile
          </button>
          {!canSave && (
            <div className="hwpc-skip-hint">Add at least one skill to unlock applying for jobs.</div>
          )}
          <button className="hwpc-skip-btn" onClick={handleSkip}>
            Skip for now (you won't be able to apply yet)
          </button>
        </div>
      </div>
    </>
  );
}


/* ===== Welcome (Wallet-Connect Onboarding) — full standalone page
   (canonical, ported from HiveworkOnboarding.jsx). This is the PROPOSED
   3-step Connect/Profile/Notify flow reached from Landing's "Get started"
   and hero CTAs — distinct from HiveworkProfileCompleteScreen (the real
   `/onboarding` route, reached only from Dashboard's nudge). Per roadmap:
   this flow is a proposed product improvement, not a real-route redesign —
   no consent/KYC-disclosure step exists in the real app today.
   PreviewControls dropped per the file's own instructions ("delete once
   wired to real detection") — piBrowserDetected hardcoded true for this
   clickable demo; `intent` comes from the shell's onboardingIntent instead
   of internal preview state. Self-contained :root token block added (file
   had the same missing-external-CSS pattern Landing/the shell itself had). */

const HW_ONBOARD_KYC_DETAIL =
  "Browsing is open to everyone. Posting a job or applying to paid work requires a KYC-verified, Mainnet-migrated Pi Wallet — Pi's network doesn't support Pi transfers on unverified accounts. Haven't completed KYC yet? You can still explore Hivework, and we'll prompt you to verify when you're ready to post or apply.";

const HW_ONBOARD_SKILLS = ["Bug testing", "UI feedback", "Translation", "Android tester"];
const HW_ONBOARD_DEVICES = ["Android", "iOS"];

function HWOWizardTrack({ step }) {
  const labels = ["Connect", "Profile", "Notify"];
  return (
    <div className="wizard-track">
      {labels.map((label, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "active" : "";
        return (
          <div className={`wz-seg ${state}`} key={label}>
            <div className="wz-dot">{n < step ? "✓" : n}</div>
            <div className="wz-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function HWOChipGroup({ options, selected, onToggle }) {
  return (
    <div className="chip-group">
      {options.map((opt) => (
        <div
          key={opt}
          className={`chip-toggle${selected.includes(opt) ? " selected" : ""}`}
          onClick={() => onToggle(opt)}
        >
          {opt}
        </div>
      ))}
    </div>
  );
}

const HW_ONBOARD_STYLES = `
  :root{
    --cream:#F7F5F1; --ink:#1B1A1F; --ink-soft:#6B6874;
    --violet:#6C5CE7; --violet-deep:#5643D9;
    --mint:#2EC4B6; --coral:#FF6B5D; --butter:#FFC857;
    --line:#E7E3DA; --card:#FFFFFF;
  }
  .hw-onboard *{box-sizing:border-box;}
  .hw-onboard{margin:0;background:#EAE7DF;color:var(--ink);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
  .hw-onboard h1,.hw-onboard h2,.hw-onboard h3{font-family:'Sora',sans-serif;}
  .hw-onboard .mono{font-family:'JetBrains Mono',monospace;}

  .hw-onboard .frame{width:100%;max-width:560px;margin:0 auto;background:var(--cream);position:relative;min-height:80vh;border-radius:0 0 28px 28px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(27,26,31,.3);}
  .hw-onboard .pad{padding:0 24px 40px;}

  .hw-onboard header{padding:24px 24px 4px;}
  .hw-onboard .logo{font-family:'Sora';font-weight:800;font-size:17px;}
  .hw-onboard .logo span{color:var(--violet);}

  .hw-onboard .wizard-track{display:flex;margin:26px 0 30px;}
  .hw-onboard .wz-seg{flex:1;text-align:center;position:relative;}
  .hw-onboard .wz-seg:not(:last-child):after{content:"";position:absolute;top:12px;left:56%;width:88%;height:2px;background:var(--line);}
  .hw-onboard .wz-seg.done:not(:last-child):after{background:var(--violet);}
  .hw-onboard .wz-dot{width:24px;height:24px;border-radius:50%;background:var(--card);border:2px solid var(--line);margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--ink-soft);position:relative;z-index:1;}
  .hw-onboard .wz-seg.done .wz-dot{background:var(--violet);border-color:var(--violet);color:white;}
  .hw-onboard .wz-seg.active .wz-dot{border-color:var(--violet);color:var(--violet);}
  .hw-onboard .wz-label{font-size:10.5px;color:var(--ink-soft);font-weight:600;}
  .hw-onboard .wz-seg.active .wz-label{color:var(--ink);}

  .hw-onboard .step-head{margin-bottom:24px;}
  .hw-onboard .step-head h1{font-size:26px;font-weight:800;letter-spacing:-.6px;margin:0 0 8px;line-height:1.15;}
  .hw-onboard .step-head p{font-size:14px;color:var(--ink-soft);line-height:1.55;margin:0;}

  .hw-onboard .back-btn{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ink-soft);padding:22px 0 0;cursor:pointer;background:none;border:none;}

  .hw-onboard .wallet-card{background:linear-gradient(135deg,var(--violet),var(--violet-deep));border-radius:20px;padding:22px;color:white;margin-bottom:26px;position:relative;overflow:hidden;box-shadow:0 20px 40px -18px rgba(108,92,231,.5);}
  .hw-onboard .wallet-card:before{content:"";position:absolute;top:-50px;right:-50px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.15),transparent 70%);}
  .hw-onboard .wallet-top{display:flex;justify-content:space-between;align-items:flex-start;position:relative;}
  .hw-onboard .wallet-pi{width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-family:'Sora';font-weight:800;font-size:17px;}
  .hw-onboard .wallet-status{font-size:11px;font-weight:700;background:rgba(255,255,255,.15);padding:5px 11px;border-radius:100px;}
  .hw-onboard .wallet-status.connected{background:rgba(46,196,182,.35);}
  .hw-onboard .wallet-status.connecting{background:rgba(255,255,255,.15);}
  .hw-onboard .wallet-status.wc-err{background:rgba(255,107,93,.35);}
  .hw-onboard .wc-spin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;display:inline-block;vertical-align:-3px;margin-right:7px;animation:hwSpin .8s linear infinite;}
  .hw-onboard .wc-error-body{position:relative;margin-top:18px;background:rgba(255,255,255,.1);border-radius:14px;padding:14px;}
  .hw-onboard .wc-error-body h4{font-size:13.5px;font-weight:800;margin:0 0 4px;}
  .hw-onboard .wc-error-body p{font-size:12px;opacity:.85;line-height:1.5;margin:0;}
  .hw-onboard .wc-retry{margin-top:12px;background:rgba(255,255,255,.18);border:none;color:#fff;font-weight:700;font-size:12.5px;padding:9px 16px;border-radius:100px;cursor:pointer;}
  .hw-onboard .wc-demo-row{display:flex;gap:14px;justify-content:center;margin-top:10px;}
  .hw-onboard .wc-demo-link{font-size:11px;color:var(--ink-soft);opacity:.55;cursor:pointer;text-decoration:underline;}
  .hw-onboard .wallet-label{font-size:12px;opacity:.8;margin-top:22px;}
  .hw-onboard .wallet-value{font-family:'JetBrains Mono';font-size:15px;margin-top:3px;opacity:.95;}

  .hw-onboard .kyc-pill{display:flex;align-items:center;gap:10px;background:#FFF3DC;border:1px solid #F4DFA8;border-radius:100px;padding:10px 14px;margin:0 0 6px;cursor:pointer;}
  .hw-onboard .kyc-pill svg{color:#B8860B;flex-shrink:0;}
  .hw-onboard .kyc-pill span{font-size:12.5px;font-weight:700;color:#8A6512;flex:1;}
  .hw-onboard .kyc-detail{max-height:0;overflow:hidden;transition:max-height .25s ease;}
  .hw-onboard .kyc-detail.open{max-height:220px;}
  .hw-onboard .kyc-detail-inner{font-size:12px;color:var(--ink-soft);line-height:1.6;padding:12px 14px 18px;}

  .hw-onboard .testnet-note{font-size:11.5px;color:var(--ink-soft);margin:14px 2px 28px;line-height:1.5;}

  .hw-onboard .tos-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:18px;cursor:pointer;}
  .hw-onboard .tos-check{width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line);background:var(--card);flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:.15s;}
  .hw-onboard .tos-check.checked{background:var(--violet);border-color:var(--violet);}
  .hw-onboard .tos-row p{font-size:12.5px;color:var(--ink-soft);line-height:1.5;margin:0;}
  .hw-onboard .tos-row a{color:var(--violet-deep);font-weight:600;text-decoration:none;}

  .hw-onboard .btn{width:100%;padding:16px;border-radius:100px;font-weight:700;font-size:15px;border:none;cursor:pointer;transition:.15s;}
  .hw-onboard .btn-primary{background:var(--violet);color:white;box-shadow:0 14px 28px -10px rgba(108,92,231,.55);}
  .hw-onboard .btn-primary:disabled{background:#DCD8CD;color:#A7A296;box-shadow:none;cursor:not-allowed;}
  .hw-onboard .btn-text{background:none;border:none;color:var(--ink-soft);font-weight:600;font-size:13.5px;cursor:pointer;width:100%;padding:14px;text-align:center;}

  .hw-onboard .pibrowser-note{font-size:11.5px;color:var(--ink-soft);text-align:center;margin-top:12px;line-height:1.5;}

  .hw-onboard .profile-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:4px 22px;margin-bottom:26px;box-shadow:0 20px 40px -22px rgba(27,26,31,.2);}
  .hw-onboard .pc-row{padding:18px 0;border-bottom:1px solid var(--line);}
  .hw-onboard .pc-row:last-child{border-bottom:none;}
  .hw-onboard .pc-label{font-size:11.5px;font-weight:700;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px;}
  .hw-onboard .pc-identity{display:flex;align-items:center;gap:14px;}
  .hw-onboard .pp-avatar{width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,var(--violet),var(--violet-deep));color:white;font-weight:800;font-family:'Sora';font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .hw-onboard .pp-name{font-family:'JetBrains Mono';font-size:15px;font-weight:600;}
  .hw-onboard .pp-tag{font-size:11px;font-weight:700;color:var(--violet-deep);background:#EFEAFB;padding:4px 9px;border-radius:100px;display:inline-block;margin-top:4px;}
  .hw-onboard .pc-bio textarea{width:100%;border:none;background:none;padding:0;font-size:14px;font-family:'Inter';color:var(--ink);resize:none;height:44px;outline:none;}
  .hw-onboard .pc-bio textarea::placeholder{color:#A7A296;}

  .chip-group{display:flex;flex-wrap:wrap;gap:8px;}
  .chip-toggle{padding:9px 15px;border-radius:100px;border:1.5px solid var(--line);background:var(--cream);font-size:12.5px;font-weight:600;color:var(--ink-soft);cursor:pointer;}
  .chip-toggle.selected{border-color:var(--violet);background:#EFEAFB;color:var(--violet-deep);}

  .hw-onboard .notif-visual{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px;margin-bottom:26px;box-shadow:0 20px 40px -22px rgba(27,26,31,.2);}
  .hw-onboard .notif-row{display:flex;gap:12px;align-items:flex-start;padding:11px 0;border-bottom:1px solid var(--line);}
  .hw-onboard .notif-row:last-child{border-bottom:none;}
  .hw-onboard .notif-ic{width:30px;height:30px;border-radius:9px;background:#E4F8F6;color:#1A9E92;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;}
  .hw-onboard .notif-row div h4{margin:0 0 2px;font-size:13px;font-weight:700;}
  .hw-onboard .notif-row div p{margin:0;font-size:11.5px;color:var(--ink-soft);}

  .hw-onboard .routing{text-align:center;padding:60px 24px;}
  .hw-onboard .routing .spin{width:44px;height:44px;border-radius:50%;border:3px solid #EFEAFB;border-top-color:var(--violet);margin:0 auto 20px;animation:hwSpin .8s linear infinite;}
  @keyframes hwSpin{to{transform:rotate(360deg);}}
  .hw-onboard .routing h2{font-size:19px;font-weight:800;margin:0 0 6px;}
  .hw-onboard .routing p{font-size:13px;color:var(--ink-soft);margin:0;}
`;

function HiveworkOnboardingFlow({ intent = "none", onFinish }) {
  const [screen, setScreen] = useState("connect"); // 'connect' | 'profile' | 'notify' | 'routing'
  const [tosChecked, setTosChecked] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  // walletStatus: 'idle' | 'connecting' | 'connected' | 'no-pi-browser' | 'failed'
  const [walletStatus, setWalletStatus] = useState("idle");
  const [skills, setSkills] = useState([]);
  const [devices, setDevices] = useState([]);

  // Pi Browser is assumed present for this clickable demo — real detection
  // would replace this per the canonical file's own header comment.
  const piBrowserDetected = true;

  const goTo = (id) => {
    setScreen(id);
    window.scrollTo(0, 0);
  };

  // Real Pi.authenticate() (see lib/usePi.ts) is async and can fail — this
  // mirrors that with a simulated delay. forceOutcome lets the demo trigger
  // the two failure paths (real code today can't tell "Pi Browser missing"
  // from "not connected" — logged gap).
  //
  // `returning` mirrors what Dashboard.tsx already does for real: it never
  // gates a returning/complete-profile user behind profile+notify screens,
  // just shows a soft inline nudge banner instead. Real Pi.authenticate()
  // would return this on the user object; the demo link passes it directly
  // as an argument (not read off state) because this callback fires inside
  // a setTimeout — reading a state variable there instead of taking it as
  // a param is a stale-closure bug: the click that flips the flag and the
  // click that calls handleConnect happen in the same handler, before
  // React re-renders, so the delayed callback would still see the old value.
  const handleConnect = (forceOutcome = "connected", returning = false) => {
    if (!tosChecked || walletStatus === "connecting") return;
    setWalletStatus("connecting");
    setTimeout(() => {
      if (forceOutcome === "connected") {
        setWalletStatus("connected");
        setWalletConnected(true);
        setTimeout(() => goTo(returning ? "routing" : "profile"), 500);
      } else {
        setWalletStatus(forceOutcome); // 'no-pi-browser' | 'failed'
      }
    }, 1100);
  };

  const toggleSkill = (s) => setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const toggleDevice = (d) => setDevices((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const finishOnboarding = () => goTo("routing");

  useEffect(() => {
    if (screen === "routing") {
      const t = setTimeout(() => onFinish?.(), 1300);
      return () => clearTimeout(t);
    }
  }, [screen, onFinish]);

  const routingCopy = {
    find: { title: "Taking you to Browse", sub: "Let's find you some work." },
    post: { title: "Taking you to Post a Job", sub: "Let's get your job listed." },
    none: { title: "Taking you to Home", sub: "Welcome to Hivework." },
  }[intent];

  return (
    <>
      <style>{HW_ONBOARD_STYLES}</style>

      <div className="hw-onboard">
        <div className="frame">
          <header>
            <div className="logo">Hive<span>work</span></div>
          </header>

          <div className="pad">
            {screen === "connect" && (
              <div>
                <HWOWizardTrack step={1} />
                <div className="step-head">
                  <h1>Connect your Pi Wallet</h1>
                  <p>Hivework uses the Pi Wallet for identity and escrow. We'll request your Pi username and payment permissions.</p>
                </div>

                <div className="wallet-card">
                  <div className="wallet-top">
                    <div className="wallet-pi">π</div>
                    <span
                      className={`wallet-status${
                        walletStatus === "connected" ? " connected" :
                        walletStatus === "connecting" ? " connecting" :
                        (walletStatus === "no-pi-browser" || walletStatus === "failed") ? " wc-err" : ""
                      }`}
                    >
                      {walletStatus === "connected" ? "Connected" :
                        walletStatus === "connecting" ? "Connecting…" :
                        (walletStatus === "no-pi-browser" || walletStatus === "failed") ? "Connection issue" :
                        "Not connected"}
                    </span>
                  </div>
                  <div className="wallet-label">Pi Wallet</div>
                  <div className="wallet-value">
                    {walletStatus === "connecting" ? (<><span className="wc-spin" />Waiting on Pi Wallet…</>) :
                      walletStatus === "connected" ? "@olawalt" : "Waiting for connection…"}
                  </div>
                  {walletStatus === "no-pi-browser" && (
                    <div className="wc-error-body">
                      <h4>Pi Browser not detected</h4>
                      <p>Hivework needs to run inside Pi Browser to connect your wallet. Open this page from the Pi Browser app and try again.</p>
                      <button className="wc-retry" onClick={() => handleConnect("connected")}>Try again</button>
                    </div>
                  )}
                  {walletStatus === "failed" && (
                    <div className="wc-error-body">
                      <h4>Connection failed</h4>
                      <p>We couldn't reach your Pi Wallet. Check your connection and try again.</p>
                      <button className="wc-retry" onClick={() => handleConnect("connected")}>Retry</button>
                    </div>
                  )}
                </div>

                <div className={`kyc-pill${kycOpen ? " open" : ""}`} onClick={() => setKycOpen((o) => !o)}>
                  <ShieldIcon />
                  <span>KYC required for paid activity — tap to learn more</span>
                  <ChevIcon open={kycOpen} />
                </div>
                <div className={`kyc-detail${kycOpen ? " open" : ""}`}>
                  <div className="kyc-detail-inner">{HW_ONBOARD_KYC_DETAIL}</div>
                </div>

                <div className="testnet-note">Note: Hivework is currently on Pi Testnet — wallet activity here uses Test-Pi, not real Pi.</div>

                <div className="tos-row" onClick={() => setTosChecked((c) => !c)}>
                  <div className={`tos-check${tosChecked ? " checked" : ""}`}>
                    {tosChecked && <CheckIcon />}
                  </div>
                  <p>
                    I agree to the{" "}
                    <a href="#" onClick={(e) => e.stopPropagation()}>Terms of Service</a> and{" "}
                    <a href="#" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>.
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  disabled={!tosChecked || walletStatus === "connecting"}
                  onClick={() => handleConnect("connected")}
                >
                  {!piBrowserDetected ? "Open in Pi Browser" :
                    walletStatus === "connecting" ? "Connecting…" :
                    (walletStatus === "no-pi-browser" || walletStatus === "failed") ? "Retry connection" :
                    "Connect with Pi Wallet"}
                </button>
                {!piBrowserDetected && (
                  <div className="pibrowser-note">The Pi SDK only works inside Pi Browser — open this page there to connect your wallet.</div>
                )}
                {walletStatus === "idle" && tosChecked && (
                  <div className="wc-demo-row">
                    <span className="wc-demo-link" onClick={() => handleConnect("no-pi-browser")}>Demo: no Pi Browser</span>
                    <span className="wc-demo-link" onClick={() => handleConnect("failed")}>Demo: connection failed</span>
                    <span className="wc-demo-link" onClick={() => handleConnect("connected", true)}>Demo: returning user (skip setup)</span>
                  </div>
                )}
              </div>
            )}

            {screen === "profile" && (
              <div>
                <button className="back-btn" onClick={() => goTo("connect")}><BackIcon />Back</button>
                <HWOWizardTrack step={2} />
                <div className="step-head">
                  <h1>Set up your profile</h1>
                  <p>This helps us match you with the right jobs. You can always finish this later.</p>
                </div>

                <div className="profile-card">
                  <div className="pc-row pc-identity">
                    <div className="pp-avatar">O</div>
                    <div>
                      <div className="pp-name">@olawalt</div>
                      <span className="pp-tag">From Pi Wallet</span>
                    </div>
                  </div>

                  <div className="pc-row pc-bio">
                    <div className="pc-label">Bio · optional</div>
                    <textarea placeholder="A short line about what you do..." />
                  </div>

                  <div className="pc-row">
                    <div className="pc-label">Skills · optional</div>
                    <HWOChipGroup options={HW_ONBOARD_SKILLS} selected={skills} onToggle={toggleSkill} />
                  </div>

                  <div className="pc-row">
                    <div className="pc-label">Devices · optional</div>
                    <HWOChipGroup options={HW_ONBOARD_DEVICES} selected={devices} onToggle={toggleDevice} />
                  </div>
                </div>

                <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => goTo("notify")}>Continue →</button>
                <button className="btn-text" onClick={() => goTo("notify")}>Skip for now</button>
              </div>
            )}

            {screen === "notify" && (
              <div>
                <button className="back-btn" onClick={() => goTo("profile")}><BackIcon />Back</button>
                <HWOWizardTrack step={3} />
                <div className="step-head">
                  <h1>Stay in the loop</h1>
                  <p>Get notified the moment your work is approved or paid, or when someone applies to your job.</p>
                </div>

                <div className="notif-visual">
                  <div className="notif-row">
                    <div className="notif-ic">✓</div>
                    <div><h4>Work approved</h4><p>Know instantly when a job you applied to gets approved</p></div>
                  </div>
                  <div className="notif-row">
                    <div className="notif-ic">π</div>
                    <div><h4>Pi released</h4><p>Get notified the moment Pi lands in your wallet</p></div>
                  </div>
                  <div className="notif-row">
                    <div className="notif-ic">👤</div>
                    <div><h4>New applicant</h4><p>See when someone applies to a job you posted</p></div>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={finishOnboarding}>Enable notifications</button>
                <button className="btn-text" onClick={finishOnboarding}>Not now</button>
              </div>
            )}

            {screen === "routing" && (
              <div className="routing">
                <div className="spin"></div>
                <h2>{routingCopy.title}</h2>
                <p>{routingCopy.sub}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function HiveworkApp() {
  const [screen, setScreen] = useState("landing");
  const [lastScreen, setLastScreen] = useState("landing");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [onboardingIntent, setOnboardingIntent] = useState(null); // 'find' | 'post' | null
  const [workHistoryRange, setWorkHistoryRangeRaw] = useState("all");
  const [jobsHistoryRange, setJobsHistoryRangeRaw] = useState("all");
  const [withdrawalsHistoryRange, setWithdrawalsHistoryRangeRaw] = useState("all");
  const [workHistoryShown, setWorkHistoryShown] = useState(HIST_PAGE_SIZE);
  const [jobsHistoryShown, setJobsHistoryShown] = useState(HIST_PAGE_SIZE);
  const [withdrawalsHistoryShown, setWithdrawalsHistoryShown] = useState(HIST_PAGE_SIZE);
  const setWorkHistoryRange = (k) => { setWorkHistoryRangeRaw(k); setWorkHistoryShown(HIST_PAGE_SIZE); };
  const setJobsHistoryRange = (k) => { setJobsHistoryRangeRaw(k); setJobsHistoryShown(HIST_PAGE_SIZE); };
  const setWithdrawalsHistoryRange = (k) => { setWithdrawalsHistoryRangeRaw(k); setWithdrawalsHistoryShown(HIST_PAGE_SIZE); };
  const goToHistWork = () => { setWorkHistoryShown(HIST_PAGE_SIZE); goTo("history-work"); };
  const goToHistJobs = () => { setJobsHistoryShown(HIST_PAGE_SIZE); goTo("history-jobs"); };
  const goToHistWithdrawals = () => { setWithdrawalsHistoryShown(HIST_PAGE_SIZE); goTo("history-withdrawals"); };
  const [detailKey, setDetailKey] = useState("mine");
  const [workView, setWorkView] = useState("mywork"); // 'mywork' | 'myjobs'
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  // Real WithdrawPanel.tsx state — 'earnings' kind (worker balance).
  const [withdrawBalance, setWithdrawBalance] = useState(4);
  const [withdrawalHistory, setWithdrawalHistory] = useState(WITHDRAWAL_HISTORY);
  const WITHDRAW_MIN = 1;
  const WITHDRAW_FEE = 0.01; // demo simplification, see WITHDRAWAL_HISTORY comment above
  const handleWithdraw = (amt, fee) => {
    setWithdrawBalance((b) => Number((b - amt).toFixed(4)));
    setWithdrawalHistory((h) => [
      { id: `w${Date.now()}`, requested_amount: amt, fee, net_amount: Number((amt - fee).toFixed(4)), status: "queued", to_address: null, date: new Date().toISOString().slice(0, 10) },
      ...h,
    ]);
  };
  // Real WithdrawPanel.tsx 'refund' kind — client's refunded escrow balance
  // (closed/missed job slots). Real Dashboard.tsx only mounts this panel
  // when tracker.total_refunded > 0 — demo balance below stands in for that
  // check since this shell has no tracker object. Session 16-follow-up: was
  // flagged as a real gap, but the real app already has this built
  // (Dashboard.tsx:174) — this was purely a shell-demo gap, now closed.
  const [refundBalance, setRefundBalance] = useState(2.4);
  const [refundHistory, setRefundHistory] = useState(REFUND_HISTORY);
  const handleRefundWithdraw = (amt, fee) => {
    setRefundBalance((b) => Number((b - amt).toFixed(4)));
    setRefundHistory((h) => [
      { id: `r${Date.now()}`, requested_amount: amt, fee, net_amount: Number((amt - fee).toFixed(4)), status: "queued", to_address: null, date: new Date().toISOString().slice(0, 10) },
      ...h,
    ]);
  };
  const [testnetTipOpen, setTestnetTipOpen] = useState(false);
  // Real Profile.tsx toggles editing in place on the same page (own-profile
  // view only), sharing ProfileForm with real /onboarding — mirrored here
  // as a lightweight in-place edit mode reusing the same skill options.
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileBio, setProfileBio] = useState("I am a tester");
  const [profileBioDraft, setProfileBioDraft] = useState("I am a tester");
  const [profileSkills, setProfileSkills] = useState(["Android tester", "Android", "iOS", "English"]);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
  };
  const goToProfile = (edit) => {
    setProfileEditing(!!edit);
    setProfileBioDraft(profileBio);
    goTo("profile");
  };
  const pfToggleSkill = (s) =>
    setProfileSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const pfCancelEdit = () => setProfileEditing(false);
  const pfSaveEdit = () => {
    setProfileBio(profileBioDraft);
    setProfileEditing(false);
    showToast("Profile updated");
  };
  // Real product gap (roadmap Section 8): no log-out feature exists
  // anywhere in the live app — Layout.tsx stores a session token on
  // connect and nothing clears it. This is the redesign's proposed fill:
  // a client-side reset back to Landing. Real Layout.tsx has two navs with
  // different logged-out behavior (header nav hides Post Job/Dashboard/
  // Bell when disconnected; the bottom tab nav never hides anything) —
  // deliberately not replicated here. Confirmed with the user: logout
  // stays a hard reset to the full-page Landing screen (no header/segnav
  // at all), not a partial-nav browsing state. Nothing further to build.
  const hwLogout = () => {
    setMenuOpen(false);
    showToast("Logged out");
    goTo("landing");
  };

  const goTo = (id) => {
    setLastScreen(screen);
    setScreen(id);
    setMenuOpen(false);
    setNotifOpen(false);
    window.scrollTo(0, 0);
  };
  const openDetail = (key) => {
    setDetailKey(key);
    goTo("job-detail");
  };
  const goBack = () => goTo(lastScreen);
  const goBackToDashboard = () => goTo("dashboard");

  // Avatar opens the profile menu; bell opens its own notifications panel.
  // These used to share one `menuOpen` toggle (real bug — see roadmap
  // Section 7) — kept fully decoupled from here on.
  const toggleProfileMenu = () => {
    setNotifOpen(false);
    setMenuOpen((o) => !o);
  };
  const toggleNotifPanel = () => {
    setMenuOpen(false);
    setNotifOpen((o) => {
      const next = !o;
      if (next) {
        // Optimistic mark-all-read on open, matching HiveworkNotificationBell.
        setNotifications((list) => list.map((n) => ({ ...n, unread: false })));
      }
      return next;
    });
  };
  const unreadCount = notifications.filter((n) => n.unread).length;
  const closeMenus = () => { setMenuOpen(false); setNotifOpen(false); };
  const openFromNotification = (n) => {
    setNotifOpen(false);
    if (n.jobKey) openDetail(n.jobKey);
  };

  const job = JOB_DATA[detailKey];
  const showSegnav = MAIN_SCREENS.includes(screen);

  return (
    <>
      <style>{`
        :root{
          --cream:#F7F5F1; --ink:#1B1A1F; --ink-soft:#6B6874;
          --violet:#6C5CE7; --violet-deep:#5643D9;
          --mint:#2EC4B6; --coral:#FF6B5D; --butter:#FFC857;
          --line:#E7E3DA; --card:#FFFFFF;
        }
        .hw-app *{box-sizing:border-box;}
        html,body{height:100%;}
        .hw-app{margin:0;background:var(--cream);color:var(--ink);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
        .hw-app h1,.hw-app h2,.hw-app h3{font-family:'Sora',sans-serif;}
        .hw-app .mono{font-family:'JetBrains Mono',monospace;}
        .hw-app svg{display:block;}

        .hw-app .frame{width:100%;max-width:560px;margin:0 auto;background:var(--cream);position:relative;min-height:100vh;}
        .hw-app .scroll-area{padding-bottom:32px;}

        .hw-app header{display:flex;align-items:center;justify-content:space-between;padding:26px 24px 6px;position:relative;z-index:5;}
        .hw-app .logo{font-family:'Sora';font-weight:800;font-size:19px;letter-spacing:-.3px;display:flex;align-items:center;gap:8px;}
        .hw-app .logo .accent{color:var(--violet);}
        .hw-app .testnet-badge{font-family:'Inter';font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:4px 9px;border-radius:100px;background:var(--line);color:var(--ink-soft);cursor:pointer;}
        .hw-app .testnet-tip{position:absolute;top:64px;left:24px;max-width:280px;background:var(--ink);color:var(--cream);font-size:12px;line-height:1.5;padding:12px 14px;border-radius:14px;z-index:30;box-shadow:0 20px 40px -16px rgba(27,26,31,.35);}
        .hw-app .header-actions{display:flex;align-items:center;gap:16px;}
        .hw-app .icon-wrap{position:relative;cursor:pointer;color:var(--ink);background:none;border:none;padding:0;}
        .hw-app .badge-dot{position:absolute;top:-2px;right:-2px;width:8px;height:8px;border-radius:50%;background:var(--coral);border:2px solid var(--cream);}
        .hw-app .badge-dot.badge-count{width:auto;height:auto;min-width:15px;padding:1.5px 4px;border-radius:100px;font-size:9px;font-weight:800;line-height:1.3;color:white;top:-6px;right:-7px;text-align:center;}
        .hw-app .menu-overlay{position:fixed;inset:0;z-index:25;background:transparent;}
        .hw-app .notif-panel{position:absolute;top:64px;right:20px;width:290px;max-height:360px;overflow-y:auto;background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:0 30px 60px -20px rgba(27,26,31,.28);z-index:30;display:none;}
        .hw-app .notif-panel.open{display:block;}
        .hw-app .notif-head{padding:14px 16px;font-weight:700;font-size:13px;font-family:'Sora';border-bottom:1px solid var(--line);}
        .hw-app .notif-row{display:flex;gap:10px;padding:13px 16px;border-bottom:1px solid var(--line);}
        .hw-app .notif-row:last-child{border-bottom:none;}
        .hw-app .notif-row.clickable{cursor:pointer;}
        .hw-app .notif-row.unread{background:#F5F2FC;}
        .hw-app .notif-dot{width:7px;height:7px;border-radius:50%;background:var(--violet);flex-shrink:0;margin-top:5px;}
        .hw-app .notif-body{flex:1;min-width:0;}
        .hw-app .notif-title{font-weight:700;font-size:12.5px;margin-bottom:2px;}
        .hw-app .notif-text{font-size:12px;color:var(--ink-soft);line-height:1.4;}
        .hw-app .notif-time{font-size:10.5px;color:var(--ink-soft);margin-top:4px;}
        .hw-app .notif-empty{padding:34px 20px;text-align:center;color:var(--ink-soft);font-size:12.5px;}
        .hw-app .notif-empty-icon{width:40px;height:40px;border-radius:50%;background:var(--cream);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;opacity:.6;}
        .hw-app .avatar-btn{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--violet),var(--violet-deep));color:white;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;}

        .hw-app .profile-menu{position:absolute;top:64px;right:20px;width:228px;background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(27,26,31,.28);z-index:30;display:none;}
        .hw-app .profile-menu.open{display:block;}
        .hw-app .profile-menu .who{padding:16px;border-bottom:1px solid var(--line);}
        .hw-app .profile-menu .who .name{font-weight:700;font-size:14.5px;font-family:'Sora';}
        .hw-app .profile-menu .who .badges{display:flex;gap:6px;margin-top:9px;}
        .hw-app .hw-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:var(--ink);color:#fff;font-size:13px;font-weight:600;padding:12px 20px;border-radius:100px;box-shadow:0 20px 40px -18px rgba(27,26,31,.4);z-index:999;max-width:80%;text-align:center;}
        .hw-app .pf-edit-section{margin:20px 0;}
        .hw-app .pf-edit-label{font-size:11.5px;font-weight:700;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;}
        .hw-app .pf-actions{display:flex;gap:10px;margin-top:24px;}
        .hw-app .pf-actions .btn{flex:1;margin:0;}
        .hw-app .pf-actions .btn-ghost{background:var(--card);border:1px solid var(--line);color:var(--ink);}
        .hw-app .chip{font-size:10px;font-weight:600;padding:4px 9px;border-radius:100px;}
        .hw-app .chip-verified{background:#E4F8F6;color:#1A9E92;}
        .hw-app .chip-gold{background:#FFF3DC;color:#B8860B;}
        .hw-app .menu-item{padding:12px 16px;font-size:13px;color:var(--ink-soft);display:flex;align-items:center;gap:11px;cursor:pointer;border-bottom:1px solid var(--line);}
        .hw-app .menu-item:last-child{border-bottom:none;}
        .hw-app .menu-item:hover{background:var(--cream);color:var(--ink);}

        .hw-app .page-head{padding:16px 0 22px;}
        .hw-app .page-head .kicker{color:var(--violet-deep);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;}
        .hw-app .page-head h1{font-size:28px;font-weight:800;letter-spacing:-.7px;margin:0;line-height:1.1;}

        .hw-app .hero-block{margin-bottom:26px;}
        .hw-app .hero-label{color:var(--ink-soft);font-size:13px;margin-bottom:2px;}
        .hw-app .hero-num{font-family:'Sora';font-weight:800;font-size:52px;letter-spacing:-2px;line-height:1;}
        .hw-app .hero-num .unit{color:var(--violet);}
        .hw-app .hero-sub{color:var(--ink-soft);font-size:13px;margin-top:6px;}

        .hw-app .ticket{background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:0 20px 40px -22px rgba(27,26,31,.2);margin-bottom:28px;overflow:hidden;cursor:pointer;}
        .hw-app .ticket-main{padding:20px 20px 16px;display:flex;justify-content:space-between;align-items:flex-start;}
        .hw-app .ticket-cat{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--violet-deep);margin-bottom:6px;}
        .hw-app .ticket-title{font-family:'Sora';font-weight:700;font-size:16px;line-height:1.25;max-width:220px;}
        .hw-app .ticket-amt{font-family:'JetBrains Mono';font-weight:700;font-size:19px;color:var(--ink);}
        .hw-app .ticket-div{border-top:1.5px dashed var(--line);margin:0 20px;}
        .hw-app .ticket-stub{padding:14px 20px 18px;display:flex;justify-content:space-between;align-items:center;}
        .hw-app .stub-l{font-size:9.5px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.06em;}
        .hw-app .stub-v{font-size:12.5px;font-weight:700;margin-top:2px;}
        .hw-app .status-pill{background:#FFF3DC;color:#B8860B;font-size:11px;font-weight:700;padding:6px 12px;border-radius:100px;}
        .hw-app .status-pill.open{background:#E4F8F6;color:#1A9E92;}
        .hw-app .status-pill.escrow{background:#FFF3DC;color:#B8860B;}

        .hw-app .section-title{font-size:12.5px;font-weight:700;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;margin:0 0 12px;}
        .hw-app .section-title-row{display:flex;justify-content:space-between;align-items:center;margin:0 0 12px;}
        .hw-app .see-all{font-size:12px;font-weight:700;color:var(--violet-deep);cursor:pointer;background:none;border:none;}

        .hw-app .rec-item{display:flex;gap:14px;padding:15px 0;border-bottom:1px solid var(--line);cursor:pointer;}
        .hw-app .rec-item:last-child{border-bottom:none;}
        .hw-app .rec-bar{width:4px;border-radius:100px;flex-shrink:0;}
        .hw-app .rec-bar.bug{background:var(--coral);}
        .hw-app .rec-bar.tr{background:var(--mint);}
        .hw-app .rec-body{flex:1;min-width:0;}
        .hw-app .rec-cat{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-soft);margin-bottom:4px;}
        .hw-app .rec-body h4{margin:0 0 4px;font-size:14.5px;font-weight:700;}
        .hw-app .rec-body p{margin:0;font-size:12px;color:var(--ink-soft);}
        .hw-app .rec-amt{font-family:'JetBrains Mono';font-weight:700;font-size:15px;flex-shrink:0;align-self:center;color:var(--violet-deep);}

        .hw-app .tile-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px;}
        .hw-app .tile{border-radius:18px;padding:18px;position:relative;height:118px;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid var(--line);}
        .hw-app .tile:nth-child(1){background:#FFE8E5;}
        .hw-app .tile:nth-child(2){background:#FFF3DC;}
        .hw-app .tile:nth-child(3){background:#E4F8F6;grid-column:span 2;height:92px;flex-direction:row;align-items:center;justify-content:space-between;}
        .hw-app .tile .t-name{font-weight:700;font-size:14.5px;font-family:'Sora';color:var(--ink);}
        .hw-app .tile .t-count{font-size:11px;color:var(--ink-soft);margin-top:2px;}

        .hw-app .wizard-track{display:flex;margin-bottom:24px;}
        .hw-app .wz-seg{flex:1;text-align:center;position:relative;}
        .hw-app .wz-seg:not(:last-child):after{content:"";position:absolute;top:12px;left:56%;width:88%;height:2px;background:var(--line);}
        .hw-app .wz-seg.done:not(:last-child):after{background:var(--violet);}
        .hw-app .wz-dot{width:24px;height:24px;border-radius:50%;background:var(--card);border:2px solid var(--line);margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--ink-soft);position:relative;z-index:1;}
        .hw-app .wz-seg.done .wz-dot{background:var(--violet);border-color:var(--violet);color:white;}
        .hw-app .wz-seg.active .wz-dot{border-color:var(--violet);color:var(--violet);}
        .hw-app .wz-label{font-size:10.5px;color:var(--ink-soft);font-weight:600;}
        .hw-app .wz-seg.active .wz-label{color:var(--ink);}

        .hw-app .field{margin-bottom:18px;}
        .hw-app .field label{font-size:13px;font-weight:600;display:block;margin-bottom:7px;}
        .hw-app .field input,.hw-app .field textarea{width:100%;padding:14px 16px;border-radius:14px;border:1px solid var(--line);background:var(--card);font-size:14px;font-family:'Inter';box-shadow:0 8px 18px -14px rgba(27,26,31,.1);}
        .hw-app .field textarea{resize:none;height:88px;}
        .hw-app .btn{width:100%;padding:16px;border-radius:100px;font-weight:700;font-size:15px;border:none;background:var(--violet);color:white;box-shadow:0 14px 28px -10px rgba(108,92,231,.55);cursor:pointer;}

        .hw-app .cover{margin:0 -24px 0;padding:38px 24px 56px;background:linear-gradient(160deg,var(--violet),var(--violet-deep));color:white;border-radius:0 0 32px 32px;}
        .hw-app .cover .big-avatar{width:62px;height:62px;border-radius:50%;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:23px;font-family:'Sora';margin-bottom:14px;}
        .hw-app .cover .handle{font-family:'Sora';font-weight:800;font-size:19px;}
        .hw-app .cover .bio{font-size:13px;opacity:.85;margin-top:4px;}
        .hw-app .cover .badges-row{display:flex;gap:7px;margin-top:12px;}

        .hw-app .stat-pills{display:flex;gap:10px;margin:-38px 0 26px;position:relative;z-index:2;}
        .hw-app .stat-pill{flex:1;background:var(--card);border-radius:16px;padding:14px 10px;text-align:center;box-shadow:0 16px 30px -16px rgba(27,26,31,.2);}
        .hw-app .stat-pill .n{font-family:'Sora';font-weight:800;font-size:18px;}
        .hw-app .stat-pill .l{font-size:10px;color:var(--ink-soft);margin-top:2px;}

        .hw-app .skill-chip{display:inline-block;border:1px solid var(--line);font-size:12px;font-weight:600;padding:7px 13px;border-radius:100px;margin:0 7px 7px 0;}
        .hw-app .review-row{padding:14px 0;border-bottom:1px solid var(--line);}
        .hw-app .review-row:last-child{border-bottom:none;}
        .hw-app .review-top{display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:4px;}
        .hw-app .stars{color:var(--butter);font-size:12px;}
        .hw-app .review-row p{margin:0;font-size:12.5px;color:var(--ink-soft);}

        .hw-app .balance-card{background:var(--ink);border-radius:22px;padding:26px;color:white;margin-bottom:26px;position:relative;overflow:hidden;}
        .hw-app .balance-card:before{content:"";position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(108,92,231,.4),transparent 70%);}
        .hw-app .balance-card .l{font-size:12.5px;color:#B4B1BC;position:relative;}
        .hw-app .balance-card .n{font-family:'Sora';font-weight:800;font-size:36px;margin:6px 0 18px;position:relative;}
        .hw-app .withdraw-row{display:flex;gap:8px;position:relative;}
        .hw-app .withdraw-row input{flex:1;border:none;border-radius:100px;padding:12px 16px;font-size:13px;background:rgba(255,255,255,.12);color:white;}
        .hw-app .withdraw-row input::placeholder{color:#8B889A;}
        .hw-app .withdraw-row button{background:var(--violet);color:white;border:none;border-radius:100px;padding:12px 20px;font-weight:700;font-size:13px;cursor:pointer;}
        .hw-app .withdraw-row button:disabled{opacity:.5;}
        .hw-app .wd-fee-note{font-size:11.5px;color:#B4B1BC;margin-top:10px;position:relative;}
        .hw-app .wd-fee-note strong{color:white;}
        .hw-app .wd-max-link{background:none;border:none;color:#C9BFFF;font-size:11.5px;font-weight:700;cursor:pointer;padding:0;margin-top:8px;display:block;position:relative;}
        .hw-app .wd-note{font-size:11px;color:#8B889A;line-height:1.5;margin-top:14px;position:relative;}
        .hw-app .wd-note strong{color:#B4B1BC;}
        .hw-app .wd-err{color:#FF8A80;font-size:12.5px;margin-top:8px;position:relative;}
        .hw-app .wd-msg{color:#7EE0D3;font-size:12.5px;margin-top:8px;position:relative;}
        .hw-app .wd-demo-fail{background:none;border:none;color:#5F5C6B;font-size:10px;text-decoration:underline;cursor:pointer;padding:0;margin-top:12px;display:block;position:relative;}
        /* Post Job payment-error state — reuses .hw-jdw's error-note color
           language (var(--coral)); PostJobWizard has no dedicated wrapper
           class so this is scoped at .hw-app directly, harmless since
           .error-note/.pj-demo-fail aren't used elsewhere under .hw-app. */
        .hw-app .error-note{font-size:12px;color:var(--coral);margin:10px 0;line-height:1.5;}
        .hw-app .pj-demo-fail{background:none;border:none;color:#8B889A;font-size:10.5px;text-decoration:underline;cursor:pointer;padding:0;margin-top:10px;display:block;}
        /* Withdrawal history rows — shared by the Dashboard mini-preview and
           the full History→Withdrawals page. */
        .hw-app .wd-item{padding:14px 0;border-bottom:1px solid var(--line);}
        .hw-app .wd-item:last-child{border-bottom:none;}
        .hw-app .wd-item-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;}
        .hw-app .wd-amt{font-weight:700;font-size:13.5px;color:var(--ink);}
        .hw-app .wd-status{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;padding:3px 9px;border-radius:100px;}
        .hw-app .wd-status.queued,.hw-app .wd-status.processing{background:#EFEAFB;color:var(--violet-deep);}
        .hw-app .wd-status.completed{background:#E4F8F6;color:#1A9E92;}
        .hw-app .wd-status.failed{background:#FFE8E5;color:#D9463A;}
        .hw-app .wd-item-sub{font-size:12px;color:var(--ink-soft);}
        .hw-app .wd-item-fail{font-size:12px;color:var(--danger);margin-top:4px;}

        .hw-app .ledger{position:relative;padding-left:22px;}
        .hw-app .ledger:before{content:"";position:absolute;left:5px;top:6px;bottom:6px;width:1px;background:var(--line);}
        .hw-app .ledger-item{position:relative;padding-bottom:20px;}
        .hw-app .ledger-item:last-child{padding-bottom:0;}
        .hw-app .ledger-item:before{content:"";position:absolute;left:-22px;top:3px;width:11px;height:11px;border-radius:50%;background:var(--mint);border:3px solid var(--cream);}
        .hw-app .led-top{display:flex;justify-content:space-between;font-family:'JetBrains Mono';font-weight:600;font-size:14px;}
        .hw-app .led-sub{font-size:11.5px;color:var(--ink-soft);margin-top:2px;}

        .hw-app .back-btn{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ink-soft);padding:20px 0 4px;cursor:pointer;background:none;border:none;}
        .hw-app .detail-hero{padding:18px 0 4px;}
        .hw-app .detail-cat{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--violet-deep);margin-bottom:8px;}
        .hw-app .detail-title{font-family:'Sora';font-weight:800;font-size:24px;letter-spacing:-.5px;line-height:1.15;margin-bottom:14px;}
        .hw-app .detail-meta-row{display:flex;gap:18px;margin-bottom:22px;}
        .hw-app .detail-meta .l{font-size:10.5px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;}
        .hw-app .detail-meta .v{font-family:'JetBrains Mono';font-weight:700;font-size:16px;margin-top:2px;}
        .hw-app .detail-body p{font-size:13.5px;color:var(--ink-soft);line-height:1.6;margin-bottom:22px;}
        .hw-app .req-list{list-style:none;padding:0;margin:0 0 22px;}
        .hw-app .req-list li{display:flex;gap:10px;font-size:13px;color:var(--ink);padding:9px 0;border-bottom:1px solid var(--line);align-items:flex-start;}
        .hw-app .req-list li:last-child{border-bottom:none;}
        .hw-app .req-list svg{flex-shrink:0;margin-top:2px;color:var(--mint);}
        .hw-app .chip-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:26px;}
        .hw-app .chip-outline{border:1px solid var(--line);font-size:12px;font-weight:600;padding:6px 12px;border-radius:100px;color:var(--ink-soft);}
        .hw-app .sticky-cta{position:sticky;bottom:20px;padding-top:6px;}

        .hw-app .toggle-row{display:flex;gap:6px;background:#EFECE5;border-radius:100px;padding:5px;margin-bottom:22px;}
        .hw-app .toggle-btn{flex:1;text-align:center;padding:10px;border-radius:100px;font-size:13px;font-weight:700;color:var(--ink-soft);cursor:pointer;background:none;border:none;}
        .hw-app .toggle-btn.active{background:var(--card);color:var(--ink);box-shadow:0 6px 16px -10px rgba(27,26,31,.25);}

        .hw-app .job-post-row{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:14px;box-shadow:0 12px 26px -18px rgba(27,26,31,.14);}
        .hw-app .jp-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px;}
        .hw-app .jp-top h4{margin:0;font-size:15px;font-weight:700;line-height:1.3;}
        .hw-app .jp-amt{font-family:'JetBrains Mono';font-weight:700;color:var(--violet-deep);font-size:14px;flex-shrink:0;}
        .hw-app .jp-status-row{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
        .hw-app .jp-applicants{font-size:12px;color:var(--ink-soft);}
        .hw-app .jp-divider{border-top:1px solid var(--line);margin:0 -20px 14px;}
        .hw-app .jp-manage{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:#EFEAFB;color:var(--violet-deep);font-size:13px;font-weight:700;padding:11px;border-radius:100px;cursor:pointer;border:none;}
        /* Refund history rows — same card language as .job-post-row
           (border/radius/shadow) rather than .wd-item's flat list-row
           style, so the myjobs tab reads as one visual family instead of a
           flat list sandwiched between two card sections. */
        .hw-app .refund-row{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin-bottom:12px;box-shadow:0 12px 26px -18px rgba(27,26,31,.14);}
        .hw-app .refund-row-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
        .hw-app .refund-amt{font-family:'JetBrains Mono';font-weight:700;color:var(--violet-deep);font-size:14px;}
        .hw-app .refund-sub{font-size:12px;color:var(--ink-soft);}

        .hw-app .applicant-row{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--line);}
        .hw-app .applicant-row:last-child{border-bottom:none;}
        .hw-app .app-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--violet),var(--violet-deep));color:white;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .hw-app .app-info{flex:1;min-width:0;}
        .hw-app .app-info .n{font-weight:700;font-size:13.5px;}
        .hw-app .app-info .s{font-size:11.5px;color:var(--ink-soft);}
        .hw-app .app-actions{display:flex;gap:6px;flex-shrink:0;}
        .hw-app .app-btn{padding:8px 13px;border-radius:100px;font-size:11.5px;font-weight:700;border:none;cursor:pointer;}
        .hw-app .app-btn.approve{background:var(--violet);color:white;}
        .hw-app .app-btn.decline{background:#EFECE5;color:var(--ink-soft);}

        .hw-app .nudge-banner{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;background:#EFEAFB;border:1px solid #D9CFFB;border-radius:16px;padding:14px 16px;margin-bottom:20px;}
        .hw-app .nudge-title{font-size:13px;font-weight:700;color:var(--violet-deep);}
        .hw-app .nudge-sub{font-size:11.5px;color:var(--ink-soft);margin-top:2px;}
        .hw-app .nudge-actions{display:flex;align-items:center;gap:12px;flex-shrink:0;}
        .hw-app .nudge-cta{font-size:12.5px;font-weight:700;color:var(--violet-deep);cursor:pointer;white-space:nowrap;background:none;border:none;}
        .hw-app .nudge-dismiss{font-size:13px;color:var(--ink-soft);cursor:pointer;padding:2px;background:none;border:none;}

        .hw-app .hist-row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid var(--line);}
        .hw-app .hist-row h4{margin:0 0 4px;font-size:13.5px;font-weight:700;}
        .hw-app .hist-row .hist-sub{font-size:11.5px;color:var(--ink-soft);}
        .hw-app .hist-row .hist-sub.pos{color:#1A9E92;}
        .hw-app .hist-row .hist-amt{font-family:'JetBrains Mono';font-weight:700;font-size:14px;flex-shrink:0;}
        .hw-app .hist-load-more{display:block;width:100%;margin-top:14px;padding:12px;border-radius:100px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font-weight:600;font-size:13px;cursor:pointer;transition:border-color .15s,color .15s;}
        .hw-app .hist-load-more:hover{border-color:var(--violet);color:var(--violet-deep);}
        .hw-app .hist-empty-more{text-align:center;font-size:11.5px;color:var(--ink-soft);margin-top:14px;}

        .hw-app .segnav{display:flex;gap:3px;background:#EFECE5;border-radius:100px;padding:4px;margin:6px 24px 4px;position:sticky;top:0;z-index:8;}
        .hw-app .segnav button{flex:1;text-align:center;padding:9px 0;border-radius:100px;font-size:12.5px;font-weight:700;color:var(--ink-soft);cursor:pointer;background:none;border:none;}
        .hw-app .segnav button.active{background:var(--ink);color:white;}

        ${JOB_DETAIL_OWNER_STYLES}
        ${HW_RANGE_FILTER_STYLES}
        ${HW_CONTACT_SUPPORT_STYLES}
      `}</style>

      {screen === "landing" ? (
        <HiveworkLandingScreen
          onGetStarted={() => { setOnboardingIntent("none"); goTo("welcome"); }}
          onFindWork={() => { setOnboardingIntent("find"); goTo("welcome"); }}
          onPostJob={() => { setOnboardingIntent("post"); goTo("welcome"); }}
        />
      ) : screen === "welcome" ? (
        <HiveworkOnboardingFlow
          intent={onboardingIntent || "none"}
          onFinish={() => {
            if (onboardingIntent === "post") goTo("post");
            else if (onboardingIntent === "find") goTo("browse");
            else goTo("home");
          }}
        />
      ) : screen === "onboarding" ? (
        <HiveworkProfileCompleteScreen
          onDone={() => {
            if (onboardingIntent === "post") goTo("post");
            else if (onboardingIntent === "find") goTo("browse");
            else goTo("home");
          }}
        />
      ) : (
      <div className="hw-app">
        <div className="frame">
          <div className="scroll-area">
            <header>
              <div className="logo"><span className="logo-text">Hive<span className="accent">work</span></span>
                <span className="testnet-badge" onClick={(e) => { e.stopPropagation(); setTestnetTipOpen((o) => !o); }}>Testnet</span>
              </div>
              <div className="header-actions">
                <button className="icon-wrap" onClick={toggleNotifPanel} aria-label="Notifications">
                  <BellIcon />
                  {unreadCount > 0 && (
                    <div className="badge-dot badge-count">{unreadCount > 9 ? "9+" : unreadCount}</div>
                  )}
                </button>
                <button className="avatar-btn" onClick={toggleProfileMenu}>O</button>
              </div>
            </header>
            {testnetTipOpen && (
              <div className="testnet-tip">Hivework is running on the Pi Testnet. Balances and payments shown are Test-Pi and carry no real-world value.</div>
            )}

            {(menuOpen || notifOpen) && (
              <div className="menu-overlay" onClick={closeMenus}></div>
            )}

            <div className={`profile-menu${menuOpen ? " open" : ""}`}>
              <div className="who">
                <div className="name">@Olawalt</div>
                <div className="badges">
                  <span className="chip chip-verified">Verified</span>
                  <span className="chip chip-gold">Gold</span>
                </div>
              </div>
              <div className="menu-item" onClick={() => goToProfile(false)}>View profile</div>
              <div className="menu-item" onClick={() => goToProfile(true)}>Edit profile</div>
              <div className="menu-item" onClick={() => { setMenuOpen(false); showToast("Notification settings — coming soon"); }}>Notification settings</div>
              <div className="menu-item" onClick={() => { setMenuOpen(false); setContactModalOpen(true); }}>Contact support</div>
              <div className="menu-item" onClick={hwLogout}>Log out</div>
            </div>

            {contactModalOpen && (
              <>
                <div className="cs-modal-overlay" onClick={() => setContactModalOpen(false)}></div>
                <div className="cs-modal">
                  <div className="cs-modal-head">
                    <h3>Contact support</h3>
                    <button className="cs-modal-close" onClick={() => setContactModalOpen(false)} aria-label="Close">×</button>
                  </div>
                  <HiveworkContactSupport
                    subject="General inquiry"
                    startOpen
                    onCancel={() => setContactModalOpen(false)}
                  />
                </div>
              </>
            )}

            {toast && <div className="hw-toast show">{toast}</div>}

            <div className={`notif-panel${notifOpen ? " open" : ""}`}>
              <div className="notif-head">Notifications</div>
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <div className="notif-empty-icon"><BellIcon /></div>
                  <div>No notifications yet.</div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-row${n.unread ? " unread" : ""}${n.jobKey ? " clickable" : ""}`}
                    onClick={() => n.jobKey && openFromNotification(n)}
                  >
                    {n.unread && <div className="notif-dot"></div>}
                    <div className="notif-body">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-text">{n.body}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {showSegnav && (
              <nav className="segnav">
                {MAIN_SCREENS.map((id) => (
                  <button key={id} className={screen === id ? "active" : ""} onClick={() => goTo(id)}>
                    {NAV_LABELS[id]}
                  </button>
                ))}
              </nav>
            )}

            {/* HOME */}
            {screen === "home" && (
              <div className="screen active">
                <div className="page-head"><div className="kicker">Good afternoon</div><h1>Welcome back, Olawalt.</h1></div>

                <div className="hero-block">
                  <div className="hero-label">Total earned</div>
                  <div className="hero-num">116<span className="unit">π</span></div>
                  <div className="hero-sub">17 jobs done · 4.3★ average rating</div>
                </div>

                <div className="ticket" onClick={() => openDetail("mine")}>
                  <div className="ticket-main">
                    <div><div className="ticket-cat">Bug testing</div><div className="ticket-title">Test payment flow on Android</div></div>
                    <div className="ticket-amt">10π</div>
                  </div>
                  <div className="ticket-div"></div>
                  <div className="ticket-stub">
                    <div><div className="stub-l">Status</div><div className="stub-v">Escrow locked</div></div>
                    <span className="status-pill">Awaiting your report</span>
                  </div>
                </div>

                <div className="section-title">Recommended for you</div>
                <div className="rec-item" onClick={() => openDetail("translate")}>
                  <div className="rec-bar tr"></div>
                  <div className="rec-body"><div className="rec-cat">Translation</div><h4>Localize onboarding copy</h4><p>2 applicants · posted 3d ago</p></div>
                  <div className="rec-amt">6π</div>
                </div>
              </div>
            )}

            {/* BROWSE */}
            {screen === "browse" && (
              <div className="screen active">
                <div className="page-head"><div className="kicker">Explore</div><h1>Find work you're good at.</h1></div>
                <div className="tile-row">
                  <div className="tile"><div className="t-name">Bug testing</div><div className="t-count">1 open job</div></div>
                  <div className="tile"><div className="t-name">UI feedback</div><div className="t-count">0 open jobs</div></div>
                  <div className="tile"><div className="t-name">Translation</div><div className="t-count">0 open jobs</div></div>
                </div>
                <div className="section-title">Open now</div>
                <div className="rec-item" onClick={() => openDetail("bug")}>
                  <div className="rec-bar bug"></div>
                  <div className="rec-body"><div className="rec-cat">Bug testing</div><h4>This is a test job</h4><p>by @Olawalt · 1m ago</p></div>
                  <div className="rec-amt">10π</div>
                </div>
              </div>
            )}

            {/* JOB DETAIL */}
            {screen === "job-detail" && job.isOwner && (
              <div className="screen active">
                <JobDetailOwner job={job} onBack={goBack} />
              </div>
            )}
            {screen === "job-detail" && !job.isOwner && (
              <div className="screen active">
                <JobDetailWorker
                  job={{
                    eyebrow: `${job.cat} · Job`,
                    title: job.title,
                    client: job.client,
                    slotsFilled: job.slotsFilled,
                    slotsTotal: job.slotsTotal,
                    perSlot: parseFloat(job.amt),
                  }}
                  state="ready"
                  onBack={goBack}
                />
              </div>
            )}

            {/* POST */}
            {screen === "post" && (
              <div className="screen active">
                <PostJobWizard />
              </div>
            )}

            {/* PROFILE */}
            {screen === "profile" && (
              <div className="screen active">
                <button className="back-btn" onClick={goBack} style={{ paddingTop: 20 }}><BackIcon />Back</button>
                {profileEditing ? (
                  <>
                    <div className="cover">
                      <div className="big-avatar">O</div>
                      <div className="handle">@Olawalt</div>
                      <div className="badges-row"><span className="chip chip-verified">Verified</span><span className="chip chip-gold">Gold</span></div>
                    </div>
                    <div className="pf-edit-section">
                      <div className="pf-edit-label">Bio</div>
                      <div className="field">
                        <textarea
                          value={profileBioDraft}
                          onChange={(e) => setProfileBioDraft(e.target.value)}
                          placeholder="A short line about what you do..."
                        />
                      </div>
                    </div>
                    <div className="pf-edit-section">
                      <div className="pf-edit-label">Skills & devices</div>
                      <HWOChipGroup
                        options={["Android tester", "Android", "iOS", "English", "Bug testing", "UI feedback", "Translation"]}
                        selected={profileSkills}
                        onToggle={pfToggleSkill}
                      />
                    </div>
                    <div className="pf-actions">
                      <button className="btn btn-ghost" onClick={pfCancelEdit}>Cancel</button>
                      <button className="btn btn-primary" onClick={pfSaveEdit}>Save</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="cover">
                      <div className="big-avatar">O</div>
                      <div className="handle">@Olawalt</div>
                      <div className="bio">{profileBio}</div>
                      <div className="badges-row"><span className="chip chip-verified">Verified</span><span className="chip chip-gold">Gold</span></div>
                    </div>
                    <div className="stat-pills">
                      <div className="stat-pill"><div className="n">17</div><div className="l">Jobs done</div></div>
                      <div className="stat-pill"><div className="n">4.3★</div><div className="l">Rating</div></div>
                      <div className="stat-pill"><div className="n">116π</div><div className="l">Earned</div></div>
                    </div>
                    <div className="section-title">Skills & devices</div>
                    <div style={{ marginBottom: 24 }}>
                      {profileSkills.map((sk) => (
                        <span className="skill-chip" key={sk}>{sk}</span>
                      ))}
                    </div>
                    <div className="section-title">Reviews (27)</div>
                    <div className="review-row"><div className="review-top"><span>@walterdanny00</span><span className="stars">★★★★★</span></div><p>Full payment received</p></div>
                    <div className="review-row"><div className="review-top"><span>@walterdanny00</span><span className="stars">★★★★</span></div><p>Good job, well done</p></div>
                  </>
                )}
              </div>
            )}

            {/* DASHBOARD */}
            {screen === "dashboard" && (
              <div className="screen active">
                <div className="page-head"><div className="kicker">Wallet & jobs</div><h1>Dashboard.</h1></div>

                {!nudgeDismissed && (
                  <div className="nudge-banner">
                    <div className="nudge-text">
                      <div className="nudge-title">Finish setting up your profile</div>
                      <div className="nudge-sub">Add skills and devices to get better job matches.</div>
                    </div>
                    <div className="nudge-actions">
                      <button className="nudge-cta" onClick={() => { setOnboardingIntent(null); goTo("onboarding"); }}>Finish →</button>
                      <button className="nudge-dismiss" onClick={() => setNudgeDismissed(true)}>✕</button>
                    </div>
                  </div>
                )}

                <div className="toggle-row">
                  <button className={`toggle-btn${workView === "mywork" ? " active" : ""}`} onClick={() => setWorkView("mywork")}>My Work</button>
                  <button className={`toggle-btn${workView === "myjobs" ? " active" : ""}`} onClick={() => setWorkView("myjobs")}>My Jobs</button>
                </div>

                {workView === "mywork" && (
                  <div>
                    <WithdrawPanel balance={withdrawBalance} minWithdrawal={WITHDRAW_MIN} fee={WITHDRAW_FEE} onWithdraw={handleWithdraw} />

                    <div className="section-title-row">
                      <div className="section-title" style={{ margin: 0 }}>Your work</div>
                      <button className="see-all" onClick={goToHistWork}>See all →</button>
                    </div>
                    {WORK_HISTORY.slice(0, 2).map((row) => (
                      <HistoryRow key={row.title} {...row} />
                    ))}

                    <div className="section-title-row" style={{ marginTop: 22 }}>
                      <div className="section-title" style={{ margin: 0 }}>Withdrawals</div>
                      <button className="see-all" onClick={goToHistWithdrawals}>See all →</button>
                    </div>
                    {withdrawalHistory.slice(0, 3).map((w) => (
                      <WithdrawalRow key={w.id} w={w} />
                    ))}
                  </div>
                )}

                {workView === "myjobs" && (
                  <div>
                    {refundBalance > 0 && (
                      <>
                        <WithdrawPanel kind="refund" balance={refundBalance} minWithdrawal={WITHDRAW_MIN} fee={WITHDRAW_FEE} onWithdraw={handleRefundWithdraw} />
                        <div className="section-title-row">
                          <div className="section-title" style={{ margin: 0 }}>Refund history</div>
                        </div>
                        {refundHistory.slice(0, 2).map((w) => (
                          <RefundRow key={w.id} w={w} />
                        ))}
                      </>
                    )}

                    <div className="section-title-row" style={{ marginTop: refundBalance > 0 ? 22 : 0 }}>
                      <div className="section-title" style={{ margin: 0 }}>Jobs you've posted</div>
                      <button className="see-all" onClick={goToHistJobs}>See all →</button>
                    </div>

                    <div className="job-post-row">
                      <div className="jp-top"><h4>Test payment flow on Android</h4><span className="jp-amt">10π</span></div>
                      <div className="jp-status-row">
                        <span className="status-pill escrow">In escrow</span>
                        <span className="jp-applicants">1 applicant</span>
                      </div>
                      <div className="jp-divider"></div>
                      <button className="jp-manage" onClick={() => openDetail("mine")}>Review applicants →</button>
                    </div>

                    <div className="job-post-row">
                      <div className="jp-top"><h4>Localize onboarding copy</h4><span className="jp-amt">6π</span></div>
                      <div className="jp-status-row">
                        <span className="status-pill open">Open</span>
                        <span className="jp-applicants">2 applicants</span>
                      </div>
                      <div className="jp-divider"></div>
                      <button className="jp-manage" onClick={() => openDetail("translate")}>Review applicants →</button>
                    </div>

                    <button className="btn" style={{ marginTop: 10 }} onClick={() => goTo("post")}>Post a new job →</button>
                  </div>
                )}
              </div>
            )}

            {/* HISTORY: WORK */}
            {screen === "history-work" && (
              <div className="screen active">
                <button className="back-btn" onClick={goBackToDashboard}><BackIcon />Back</button>
                <div className="page-head" style={{ paddingTop: 8 }}><h1 style={{ fontSize: 22 }}>Work history</h1></div>
                <HiveworkRangeFilter value={workHistoryRange} onChange={setWorkHistoryRange} />
                <HistoryList
                  rows={WORK_HISTORY}
                  range={workHistoryRange}
                  shown={workHistoryShown}
                  onLoadMore={() => setWorkHistoryShown((n) => n + HIST_PAGE_SIZE)}
                />
              </div>
            )}

            {/* HISTORY: JOBS POSTED */}
            {screen === "history-jobs" && (
              <div className="screen active">
                <button className="back-btn" onClick={goBackToDashboard}><BackIcon />Back</button>
                <div className="page-head" style={{ paddingTop: 8 }}><h1 style={{ fontSize: 22 }}>Posted jobs</h1></div>
                <HiveworkRangeFilter value={jobsHistoryRange} onChange={setJobsHistoryRange} />
                <HistoryList
                  rows={JOBS_HISTORY}
                  range={jobsHistoryRange}
                  shown={jobsHistoryShown}
                  onLoadMore={() => setJobsHistoryShown((n) => n + HIST_PAGE_SIZE)}
                />
              </div>
            )}

            {/* HISTORY: WITHDRAWALS */}
            {screen === "history-withdrawals" && (
              <div className="screen active">
                <button className="back-btn" onClick={goBackToDashboard}><BackIcon />Back</button>
                <div className="page-head" style={{ paddingTop: 8 }}><h1 style={{ fontSize: 22 }}>Withdrawal history</h1></div>
                <HiveworkRangeFilter value={withdrawalsHistoryRange} onChange={setWithdrawalsHistoryRange} />
                <HistoryList
                  rows={withdrawalHistory}
                  range={withdrawalsHistoryRange}
                  shown={withdrawalsHistoryShown}
                  onLoadMore={() => setWithdrawalsHistoryShown((n) => n + HIST_PAGE_SIZE)}
                  renderRow={(w) => <WithdrawalRow key={w.id} w={w} />}
                />
              </div>
            )}

            {/* Applicants review now lives inline inside Job Detail's owner
                view (per real JobDetail.tsx — no separate route/screen).
                Swapping the canonical HiveworkJobDetail owner component in
                is the next recompile step; the flat job-detail screen above
                is a placeholder until then. */}

          </div>
        </div>
      </div>
      )}
    </>
  );
}
