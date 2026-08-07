import React, { useState, useRef, useEffect } from "react";

const DEVICES = ["Android", "iOS", "Web / Browser", "Desktop", "Any device"];
const LANGUAGES = [
  "English", "Mandarin Chinese", "Spanish", "Hindi", "Arabic", "Bengali", "Portuguese", "Russian", "French", "Urdu",
  "Indonesian", "German", "Japanese", "Swahili", "Vietnamese", "Turkish", "Tagalog", "Korean", "Italian", "Thai",
  "Persian", "Polish", "Ukrainian", "Dutch", "Romanian", "Greek", "Hungarian", "Hebrew", "Malay", "Amharic",
  "Yoruba", "Igbo", "Hausa", "Zulu", "Burmese", "Khmer", "Nepali", "Sinhala", "Punjabi", "Tamil",
];

const STYLES = `
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

// Shared searchable combobox used by Devices and Languages.
function Combobox({ options, selected, onChange, placeholder }) {
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

export default function HiveworkProfileComplete() {
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
  }

  function handleSkip() {
    // Skip → navigate(returnTo), unchanged from real flow
  }

  return (
    <>
      <style>{STYLES}</style>
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
            <Combobox
              options={DEVICES}
              selected={devices}
              onChange={setDevices}
              placeholder="Type to search or add a device..."
            />
          </div>

          <div className="hwpc-field">
            <label>Languages <span className="hwpc-opt">(optional)</span></label>
            <Combobox
              options={LANGUAGES}
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
