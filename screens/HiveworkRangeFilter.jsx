import React, { useState } from "react";

const STYLES = `
  :root{
    --cream:#F7F5F1; --ink:#1B1A1F; --ink-soft:#6B6874;
    --violet:#6C5CE7; --violet-deep:#5643D9;
    --mint:#2EC4B6; --coral:#FF6B5D; --butter:#FFC857;
    --line:#E7E3DA; --card:#FFFFFF; --danger:#E5484D;
  }
  .hrf-wrap *{box-sizing:border-box;}
  .hrf-wrap{font-family:'Inter',sans-serif;}

  .hrf-track{display:inline-flex;padding:4px;border-radius:100px;background:var(--cream);border:1px solid var(--line);gap:2px;}
  .hrf-seg{position:relative;padding:8px 16px;border-radius:100px;border:none;background:transparent;font-size:12.5px;font-weight:700;color:var(--ink-soft);cursor:pointer;font-family:'Inter';white-space:nowrap;transition:color .15s;}
  .hrf-seg.hrf-active{background:var(--violet);color:white;box-shadow:0 6px 14px -6px rgba(108,92,231,.55);}
  .hrf-seg:not(.hrf-active):hover{color:var(--ink);}
`;

const OPTIONS = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "all", label: "All" },
];

/**
 * Calendar-based date-range boundaries, deliberately not a rolling window:
 * "This week" = since this week's Monday 00:00 local.
 * "This month" = since the 1st of the current calendar month, 00:00 local.
 * A rolling 7/30-day window bleeds into the previous calendar period near
 * boundary days, which reads as wrong to a user expecting "this week" to
 * mean the calendar week — real code comment explains this explicitly.
 */
export function getRangeBoundary(key, now = new Date()) {
  if (key === "all") return null;

  if (key === "week") {
    const d = new Date(now);
    const day = d.getDay(); // 0 = Sunday
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

  return null;
}

/**
 * Reusable Range Filter — segmented "This week / This month / All" control,
 * shared by all three History pages.
 * Props:
 *   value    — current selected key ("week" | "month" | "all")
 *   onChange — called with the new key when a segment is tapped
 */
export default function HiveworkRangeFilter({ value, onChange }) {
  const [internal, setInternal] = useState(value || "week");
  const active = value !== undefined ? value : internal;

  function select(key) {
    if (onChange) onChange(key);
    else setInternal(key);
  }

  return (
    <div className="hrf-wrap">
      <style>{STYLES}</style>
      <div className="hrf-track" role="tablist" aria-label="Date range">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={active === o.key}
            className={`hrf-seg${active === o.key ? " hrf-active" : ""}`}
            onClick={() => select(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
