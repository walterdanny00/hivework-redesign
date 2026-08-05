import { useState } from "react";

const STAR_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const CHECK_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const TOTAL_SLOTS = 5;

const INITIAL_APPLICANTS = [
  { id: "a1", name: "@sam_k", rating: "4.8★", jobs: "31 jobs done" },
  { id: "a2", name: "@devMia", rating: "4.5★", jobs: "12 jobs done" },
];

const INITIAL_SLOTS = [
  { id: "s1", name: "@walterdanny00", rating: "4.6★", jobs: "42 jobs done", status: "completed", givenRating: 5, draftRating: 0 },
  { id: "s2", name: "@ola_t", rating: "4.9★", jobs: "18 jobs done", status: "completed", givenRating: null, draftRating: 0 },
  { id: "s3", name: "@kwame_b", rating: "4.2★", jobs: "9 jobs done", status: "progress", givenRating: null, draftRating: 0 },
  { id: "s4", name: "@leah_r", rating: "4.7★", jobs: "20 jobs done", status: "submitted", givenRating: null, draftRating: 0 },
];

const STATUS_LABEL = { completed: "Completed", progress: "In progress", submitted: "Submitted" };

const STYLES = `
  :root{
    --cream:#F7F5F1; --ink:#1B1A1F; --ink-soft:#6B6874;
    --violet:#6C5CE7; --violet-deep:#5643D9;
    --mint:#2EC4B6; --coral:#FF6B5D; --butter:#FFC857;
    --line:#E7E3DA; --card:#FFFFFF;
  }
  *{box-sizing:border-box;}
  html,body{height:100%;}
  body{margin:0;background:#EAE7DF;color:var(--ink);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
  .hivework-job-detail h1,.hivework-job-detail h2,.hivework-job-detail h3{font-family:'Sora',sans-serif;}
  .hivework-job-detail .mono{font-family:'JetBrains Mono',monospace;}
  .hivework-job-detail svg{display:block;}

  .hivework-job-detail .frame{width:100%;max-width:560px;margin:0 auto;background:var(--cream);position:relative;min-height:80vh;border-radius:0 0 28px 28px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(27,26,31,.3);}
  .hivework-job-detail .screen{padding:0 24px 40px;}

  .hivework-job-detail header{display:flex;align-items:center;justify-content:space-between;padding:24px 24px 4px;}
  .hivework-job-detail .logo{font-family:'Sora';font-weight:800;font-size:17px;}
  .hivework-job-detail .logo span{color:var(--violet);}
  .hivework-job-detail .avatar-btn{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--violet),var(--violet-deep));color:white;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;}

  .hivework-job-detail .back-btn{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ink-soft);padding:20px 0 4px;cursor:pointer;background:none;border:none;}
  .hivework-job-detail .detail-hero{padding:18px 0 4px;}
  .hivework-job-detail .detail-cat{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--violet-deep);margin-bottom:8px;}
  .hivework-job-detail .detail-title{font-family:'Sora';font-weight:800;font-size:24px;letter-spacing:-.5px;line-height:1.15;margin-bottom:14px;}
  .hivework-job-detail .detail-meta-row{display:flex;gap:22px;margin-bottom:22px;}
  .hivework-job-detail .detail-meta .l{font-size:10.5px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;}
  .hivework-job-detail .detail-meta .v{font-family:'JetBrains Mono';font-weight:700;font-size:16px;margin-top:2px;}

  .hivework-job-detail .slot-bar{display:flex;gap:4px;margin-bottom:10px;}
  .hivework-job-detail .slot-seg{flex:1;height:8px;border-radius:5px;background:var(--line);}
  .hivework-job-detail .slot-seg.completed{background:var(--mint);}
  .hivework-job-detail .slot-seg.progress{background:var(--violet);}
  .hivework-job-detail .slot-seg.submitted{background:var(--butter);}
  .hivework-job-detail .slot-summary{font-size:12.5px;color:var(--ink-soft);margin-bottom:24px;}
  .hivework-job-detail .slot-summary b{color:var(--ink);font-weight:700;}

  .hivework-job-detail .toggle-row{display:flex;gap:6px;background:#EFECE5;border-radius:100px;padding:5px;margin-bottom:20px;}
  .hivework-job-detail .toggle-btn{flex:1;text-align:center;padding:10px 6px;border-radius:100px;font-size:12.5px;font-weight:700;color:var(--ink-soft);cursor:pointer;background:none;border:none;}
  .hivework-job-detail .toggle-btn.active{background:var(--card);color:var(--ink);box-shadow:0 6px 16px -10px rgba(27,26,31,.25);}

  .hivework-job-detail .tab-card{background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:0 20px 40px -22px rgba(27,26,31,.2);padding:22px 20px;margin-bottom:26px;}

  .hivework-job-detail .ov-block{margin-bottom:22px;}
  .hivework-job-detail .ov-block:last-child{margin-bottom:0;}
  .hivework-job-detail .ov-label{font-size:11.5px;font-weight:700;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;}
  .hivework-job-detail .ov-block p{font-size:13.5px;color:var(--ink-soft);line-height:1.6;margin:0;}
  .hivework-job-detail .req-list{list-style:none;padding:0;margin:0;}
  .hivework-job-detail .req-list li{display:flex;gap:10px;font-size:13px;color:var(--ink);padding:9px 0;border-bottom:1px solid var(--line);align-items:flex-start;}
  .hivework-job-detail .req-list li:last-child{border-bottom:none;}
  .hivework-job-detail .req-list svg{flex-shrink:0;margin-top:2px;color:var(--mint);}
  .hivework-job-detail .chip-row{display:flex;gap:8px;flex-wrap:wrap;}
  .hivework-job-detail .chip-outline{border:1px solid var(--line);font-size:12px;font-weight:600;padding:6px 12px;border-radius:100px;color:var(--ink-soft);}

  .hivework-job-detail .applicant-row{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--line);}
  .hivework-job-detail .applicant-row:last-child{border-bottom:none;}
  .hivework-job-detail .avatar-sm{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--violet),var(--violet-deep));color:white;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .hivework-job-detail .app-info{flex:1;min-width:0;}
  .hivework-job-detail .app-info .n{font-weight:700;font-size:13.5px;}
  .hivework-job-detail .app-info .s{font-size:11.5px;color:var(--ink-soft);}
  .hivework-job-detail .app-actions{display:flex;gap:6px;flex-shrink:0;}
  .hivework-job-detail .app-btn{padding:8px 13px;border-radius:100px;font-size:11.5px;font-weight:700;border:none;cursor:pointer;}
  .hivework-job-detail .app-btn.approve{background:var(--violet);color:white;}
  .hivework-job-detail .app-btn.decline{background:#EFECE5;color:var(--ink-soft);}
  .hivework-job-detail .empty-note{font-size:12.5px;color:var(--ink-soft);padding:2px 0;}

  .hivework-job-detail .ledger{position:relative;padding-left:0;}
  .hivework-job-detail .ledger:before{content:"";position:absolute;left:19px;top:44px;bottom:14px;width:2px;background:var(--line);border-radius:2px;}
  .hivework-job-detail .ledger-item{position:relative;padding:16px 0;border-bottom:1px solid var(--line);}
  .hivework-job-detail .ledger-item:first-child{padding-top:0;}
  .hivework-job-detail .ledger-item:last-child{padding-bottom:0;border-bottom:none;}
  .hivework-job-detail .ledger-row{display:flex;align-items:center;gap:12px;}
  .hivework-job-detail .ledger-dot{width:38px;height:38px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;position:relative;z-index:1;border:3px solid var(--cream);}
  .hivework-job-detail .ledger-dot.completed{background:var(--mint);}
  .hivework-job-detail .ledger-dot.progress{background:linear-gradient(135deg,var(--violet),var(--violet-deep));}
  .hivework-job-detail .ledger-dot.submitted{background:var(--butter);color:#8A6512;}
  .hivework-job-detail .ledger-info{flex:1;min-width:0;}
  .hivework-job-detail .ledger-info .n{font-weight:700;font-size:13.5px;}
  .hivework-job-detail .ledger-info .s{font-size:11.5px;color:var(--ink-soft);margin-top:2px;}
  .hivework-job-detail .ledger-status{flex-shrink:0;font-size:10.5px;font-weight:700;padding:5px 11px;border-radius:100px;white-space:nowrap;}
  .hivework-job-detail .ledger-status.completed{background:#E4F8F6;color:#1A9E92;}
  .hivework-job-detail .ledger-status.progress{background:#EFEAFB;color:var(--violet-deep);}
  .hivework-job-detail .ledger-status.submitted{background:#FFF3DC;color:#B8860B;}

  .hivework-job-detail .rating-given{font-size:12px;color:var(--ink-soft);margin:14px 0 0 50px;}
  .hivework-job-detail .rating-given .stars{color:var(--butter);letter-spacing:1px;}
  .hivework-job-detail .rate-widget{margin:14px 0 0 50px;display:flex;align-items:center;gap:12px;}
  .hivework-job-detail .rate-stars{display:flex;gap:4px;cursor:pointer;}
  .hivework-job-detail .rate-stars svg{color:var(--line);}
  .hivework-job-detail .rate-stars svg.on{color:var(--butter);}
  .hivework-job-detail .rate-confirm{font-size:11.5px;font-weight:700;color:white;background:var(--violet);border:none;border-radius:100px;padding:7px 13px;cursor:pointer;opacity:.35;pointer-events:none;}
  .hivework-job-detail .rate-confirm.enabled{opacity:1;pointer-events:auto;}
  .hivework-job-detail .ledger-cta{margin:14px 0 0 50px;}
  .hivework-job-detail .ledger-cta .app-btn{background:var(--violet);color:white;}

  .hivework-job-detail .ledger-open{padding:14px 0;}
  .hivework-job-detail .ledger-open .ledger-row{gap:12px;}
  .hivework-job-detail .ledger-open .ledger-dot{background:var(--card);border:2px dashed var(--line);}
  .hivework-job-detail .ledger-open .label{font-size:12.5px;color:var(--ink-soft);}

  .hivework-job-detail .open-note{display:flex;gap:10px;background:#EFEAFB;border:1px solid #D9CFFB;border-radius:14px;padding:12px 14px;margin-top:18px;font-size:12.5px;color:var(--violet-deep);line-height:1.5;}
  .hivework-job-detail .open-note svg{flex-shrink:0;margin-top:1px;}
`;

export default function HiveworkJobDetail() {
  const [activeTab, setActiveTab] = useState("overview");
  const [applicants, setApplicants] = useState(INITIAL_APPLICANTS);
  const [slots, setSlots] = useState(INITIAL_SLOTS);

  const openCount = TOTAL_SLOTS - slots.length;

  function approve(id) {
    const a = applicants.find((x) => x.id === id);
    if (!a) return;
    setApplicants((prev) => prev.filter((x) => x.id !== id));
    setSlots((prev) => [
      ...prev,
      { id: "slot-" + id, name: a.name, rating: a.rating, jobs: a.jobs, status: "progress", givenRating: null, draftRating: 0 },
    ]);
  }

  function decline(id) {
    setApplicants((prev) => prev.filter((x) => x.id !== id));
  }

  function setDraftRating(id, n) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, draftRating: n } : s)));
  }

  function confirmRating(id) {
    setSlots((prev) => prev.map((s) => (s.id === id && s.draftRating ? { ...s, givenRating: s.draftRating } : s)));
  }

  function markComplete(id) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, status: "completed" } : s)));
  }

  const counts = { completed: 0, progress: 0, submitted: 0 };
  slots.forEach((s) => counts[s.status]++);
  const summaryParts = [];
  if (counts.completed) summaryParts.push(`${counts.completed} completed`);
  if (counts.progress) summaryParts.push(`${counts.progress} in progress`);
  if (counts.submitted) summaryParts.push(`${counts.submitted} awaiting review`);

  return (
    <>
      <style>{STYLES}</style>
      <div className="hivework-job-detail">
        <div className="frame">
          <header>
            <div className="logo">Hive<span>work</span></div>
            <div className="avatar-btn">O</div>
          </header>

          <div className="screen">
            <button className="back-btn" onClick={() => window.history.back()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </button>

            <div className="detail-hero">
              <div className="detail-cat">Bug testing</div>
              <div className="detail-title">Test payment flow on Android</div>
            </div>

            <div className="detail-meta-row">
              <div className="detail-meta"><div className="l">Budget</div><div className="v mono">10π</div></div>
              <div className="detail-meta"><div className="l">Per slot</div><div className="v mono">2π</div></div>
              <div className="detail-meta"><div className="l">Posted</div><div className="v">2 days ago</div></div>
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
              <button className={"toggle-btn" + (activeTab === "overview" ? " active" : "")} onClick={() => setActiveTab("overview")}>
                Overview
              </button>
              <button className={"toggle-btn" + (activeTab === "applicants" ? " active" : "")} onClick={() => setActiveTab("applicants")}>
                Applicants ({applicants.length})
              </button>
              <button className={"toggle-btn" + (activeTab === "slots" ? " active" : "")} onClick={() => setActiveTab("slots")}>
                Slots
              </button>
            </div>

            {activeTab === "overview" && (
              <div className="tab-card">
                <div className="ov-block">
                  <div className="ov-label">Description</div>
                  <p>Test the payment flow end to end on Android and report anything that breaks, including screenshots and exact repro steps. Five testers needed across different device/OS combinations.</p>
                </div>
                <div className="ov-block">
                  <div className="ov-label">Requirements</div>
                  <ul className="req-list">
                    <li>{CHECK_ICON}Test on a real Android device, not an emulator</li>
                    <li>{CHECK_ICON}Submit a structured report with screenshots</li>
                    <li>{CHECK_ICON}Complete within 48 hours of approval</li>
                  </ul>
                </div>
                <div className="ov-block">
                  <div className="ov-label">Device & language</div>
                  <div className="chip-row">
                    <span className="chip-outline">Android</span>
                    <span className="chip-outline">English</span>
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
                      <div className="avatar-sm">{a.name[1].toUpperCase()}</div>
                      <div className="app-info">
                        <div className="n">{a.name}</div>
                        <div className="s">{a.rating} · {a.jobs}</div>
                      </div>
                      <div className="app-actions">
                        <button className="app-btn approve" onClick={() => approve(a.id)}>Approve</button>
                        <button className="app-btn decline" onClick={() => decline(a.id)}>Decline</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "slots" && (
              <div className="tab-card">
                <div className="ledger">
                  {slots.map((s) => (
                    <div className="ledger-item" key={s.id}>
                      <div className="ledger-row">
                        <div className={"ledger-dot " + s.status}>{s.name[1].toUpperCase()}</div>
                        <div className="ledger-info">
                          <div className="n">{s.name}</div>
                          <div className="s">{s.rating} · {s.jobs}</div>
                        </div>
                        <div className={"ledger-status " + s.status}>{STATUS_LABEL[s.status]}</div>
                      </div>

                      {s.status === "completed" && s.givenRating && (
                        <div className="rating-given">
                          <span className="stars">
                            {"★".repeat(s.givenRating)}{"☆".repeat(5 - s.givenRating)}
                          </span>{" "}
                          You rated this worker
                        </div>
                      )}

                      {s.status === "completed" && !s.givenRating && (
                        <div className="rate-widget">
                          <div className="rate-stars">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <span key={n} onClick={() => setDraftRating(s.id, n)} className={n <= s.draftRating ? "on" : ""}>
                                {STAR_ICON}
                              </span>
                            ))}
                          </div>
                          <button
                            className={"rate-confirm" + (s.draftRating ? " enabled" : "")}
                            onClick={() => confirmRating(s.id)}
                          >
                            Confirm rating
                          </button>
                        </div>
                      )}

                      {s.status === "submitted" && (
                        <div className="ledger-cta">
                          <button className="app-btn" onClick={() => markComplete(s.id)}>Mark reviewed & complete</button>
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
        </div>
      </div>
    </>
  );
}
