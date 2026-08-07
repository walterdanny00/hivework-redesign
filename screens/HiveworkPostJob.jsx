import { useState } from "react";

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

const STYLES = `
  :root{
    --cream:#F7F5F1; --ink:#1B1A1F; --ink-soft:#6B6874;
    --violet:#6C5CE7; --violet-deep:#5643D9;
    --mint:#2EC4B6; --coral:#FF6B5D; --butter:#FFC857;
    --line:#E7E3DA; --card:#FFFFFF; --danger:#E5484D;
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
// Renders its own search input + dropdown + chip list; parent owns the selected array.
function Combobox({ options, selected, onChange, placeholder }) {
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

export default function HiveworkPostJob() {
  const [step, setStep] = useState(1);

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
      <style>{STYLES}</style>
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
                  <Combobox options={DEVICE_OPTIONS} selected={devices} onChange={setDevices} placeholder="Type to search or add a device..." />
                </div>
                <div className="field">
                  <label>Language required <span style={{ fontWeight: 400, color: "var(--ink-soft)" }}>(optional)</span></label>
                  <Combobox options={LANGUAGE_OPTIONS} selected={languages} onChange={setLanguages} placeholder="Type to search or add a language..." />
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
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={() => goStep(3)}>&larr;</button>
                  <button
                    className="btn btn-primary"
                    onClick={() => alert("Pay & Post Job → triggers window.Pi.createPayment, unchanged from real flow")}
                  >
                    Pay {total}π & Post Job
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
