import React, { useState, useRef, useEffect } from "react";

const STYLES = `
  :root{
    --cream:#F7F5F1; --ink:#1B1A1F; --ink-soft:#6B6874;
    --violet:#6C5CE7; --violet-deep:#5643D9;
    --mint:#2EC4B6; --coral:#FF6B5D; --butter:#FFC857;
    --line:#E7E3DA; --card:#FFFFFF; --danger:#E5484D;
  }
  .hnb-wrap *{box-sizing:border-box;}
  .hnb-wrap{position:relative;font-family:'Inter',sans-serif;color:var(--ink);}

  .hnb-btn{position:relative;width:38px;height:38px;border-radius:12px;border:none;background:var(--card);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer;}
  .hnb-btn.hnb-open{border-color:var(--violet);}
  .hnb-btn svg{width:19px;height:19px;color:var(--ink);}

  .hnb-badge{position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;padding:0 4px;border-radius:100px;background:var(--coral);color:white;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid var(--cream);line-height:1;}

  .hnb-panel{position:absolute;top:calc(100% + 10px);right:0;width:320px;max-width:88vw;background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:0 20px 40px -18px rgba(27,26,31,.28);z-index:20;overflow:hidden;animation:hnb-in .15s ease-out;}
  @keyframes hnb-in{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}

  .hnb-panel-head{padding:14px 16px;border-bottom:1px solid var(--line);font-family:'Sora',sans-serif;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:space-between;}
  .hnb-panel-head span.hnb-count{font-family:'Inter';font-weight:600;font-size:11.5px;color:var(--ink-soft);}

  .hnb-list{max-height:340px;overflow-y:auto;}
  .hnb-item{display:flex;gap:10px;padding:13px 16px;border-bottom:1px solid var(--line);cursor:pointer;}
  .hnb-item:last-child{border-bottom:none;}
  .hnb-item:hover{background:var(--cream);}
  .hnb-item.hnb-unread{background:rgba(108,92,231,.05);}
  .hnb-item-dot{width:7px;height:7px;border-radius:50%;background:var(--violet);flex-shrink:0;margin-top:6px;}
  .hnb-item-dot.hnb-read{background:transparent;}
  .hnb-item-body{flex:1;min-width:0;}
  .hnb-item-title{font-size:13px;font-weight:700;margin-bottom:2px;}
  .hnb-item-text{font-size:12.5px;color:var(--ink-soft);line-height:1.45;margin-bottom:4px;}
  .hnb-item-time{font-size:11px;color:var(--ink-soft);}

  .hnb-empty{padding:44px 20px;text-align:center;}
  .hnb-empty-icon{width:40px;height:40px;border-radius:50%;background:var(--cream);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:var(--ink-soft);}
  .hnb-empty p{font-size:13px;color:var(--ink-soft);margin:0;}
`;

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function formatTime(minsAgo) {
  if (minsAgo < 60) return `${minsAgo}m ago`;
  const hrs = Math.round(minsAgo / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

/**
 * Reusable Notification Bell. Real component: separate dropdown panel (not
 * shared with the avatar/profile menu), real unread-count badge, 45s
 * polling (v1 — polling not push), mark-all-read on open, tap-to-navigate.
 * Props:
 *   notifications — array of { id, title, body, minsAgo, jobId, read }
 *   onNavigate    — called with jobId when a notification with a related job is tapped
 */
export default function HiveworkNotificationBell({ notifications: initial = [], onNavigate }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initial);
  const wrapRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 45s polling — v1 approach per real code comment, revisit once Pi SDK
  // push support is confirmed. Simulated here (no-op fetch placeholder).
  useEffect(() => {
    const interval = setInterval(() => {
      // GET /api/notifications/poll, unchanged from real flow
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  function togglePanel() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      // Optimistic mark-all-read, then confirmed with backend
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  function handleItemTap(n) {
    if (n.jobId && onNavigate) onNavigate(n.jobId);
    setOpen(false);
  }

  return (
    <div className="hnb-wrap" ref={wrapRef}>
      <style>{STYLES}</style>
      <button
        type="button"
        className={`hnb-btn${open ? " hnb-open" : ""}`}
        onClick={togglePanel}
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && <span className="hnb-badge">{badgeLabel}</span>}
      </button>

      {open && (
        <div className="hnb-panel">
          <div className="hnb-panel-head">
            Notifications
            <span className="hnb-count">{notifications.length}</span>
          </div>

          {notifications.length === 0 ? (
            <div className="hnb-empty">
              <div className="hnb-empty-icon">
                <BellIcon />
              </div>
              <p>No notifications yet.</p>
            </div>
          ) : (
            <div className="hnb-list">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`hnb-item${!n.read ? " hnb-unread" : ""}`}
                  onClick={() => handleItemTap(n)}
                >
                  <div className={`hnb-item-dot${n.read ? " hnb-read" : ""}`} />
                  <div className="hnb-item-body">
                    <div className="hnb-item-title">{n.title}</div>
                    <div className="hnb-item-text">{n.body}</div>
                    <div className="hnb-item-time">{formatTime(n.minsAgo)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
