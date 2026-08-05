import React, { useState } from "react";
import "./hivework-tokens.css";

/**
 * Hivework — App
 * Home / Browse / Post / Dashboard live in the top segmented nav.
 * Profile is reached via the avatar menu ("View profile").
 * Job Detail, Applicants, and the three history screens (Work / Jobs /
 * Withdrawals) are sub-screens reached by tapping into content, and use a
 * Back control instead of the segmented nav.
 *
 * "Dashboard" maps to the real `dashboard` route (WithdrawPanel +
 * ApplicationCard + JobCard, tab: 'worker' | 'client') — My Work / My Jobs
 * here is that same worker/client toggle, just labeled for the UI.
 *
 * Requires hivework-tokens.css to be imported somewhere in the app.
 */

const MAIN_SCREENS = ["home", "browse", "post", "dashboard"];
const NAV_LABELS = { home: "Home", browse: "Browse", post: "Post", dashboard: "Dashboard" };

const JOB_DATA = {
  mine: {
    cat: "Bug testing",
    title: "Test payment flow on Android",
    amt: "10π",
    applicants: "0",
    posted: "1m ago",
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
  { title: "Test flow on hivework multi worker job post", sub: "submitted · 7/6/2026", amt: "10π", positive: false },
  { title: "A test job from walterdanny00", sub: "completed · paid · 7/5/2026", amt: "1π", positive: true },
  { title: "This is a test job from walterdanny00", sub: "completed · paid · 7/5/2026", amt: "1π", positive: true },
  { title: "A test job from walterdanny00", sub: "completed · paid · 7/5/2026", amt: "1π", positive: true },
];

const JOBS_HISTORY = [
  { title: "Test payment flow on Android", sub: "1 applicant · in escrow", amt: "10π", positive: false },
  { title: "Localize onboarding copy", sub: "2 applicants · open", amt: "6π", positive: false },
  { title: "This is a test job", sub: "completed · closed 6/28/2026", amt: "5π", positive: true },
];

const WITHDRAWAL_HISTORY = [
  { title: "2π withdrawn", sub: "completed · to GB33VY…OFXX", amt: "1.99π", positive: true },
  { title: "1π withdrawn", sub: "completed · to GB33VY…OFXX", amt: "0.99π", positive: true },
  { title: "1π withdrawn", sub: "completed · to GB33VY…OFXX", amt: "0.99π", positive: true },
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

export default function HiveworkApp() {
  const [screen, setScreen] = useState("home");
  const [lastScreen, setLastScreen] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailKey, setDetailKey] = useState("mine");
  const [workView, setWorkView] = useState("mywork"); // 'mywork' | 'myjobs'
  const [category, setCategory] = useState("Bug");
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [testnetTipOpen, setTestnetTipOpen] = useState(false);

  const goTo = (id) => {
    setLastScreen(screen);
    setScreen(id);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };
  const openDetail = (key) => {
    setDetailKey(key);
    goTo("job-detail");
  };
  const goBack = () => goTo(lastScreen);
  const goBackToDashboard = () => goTo("dashboard");

  const job = JOB_DATA[detailKey];
  const showSegnav = MAIN_SCREENS.includes(screen);

  return (
    <>
      <style>{`
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
        .hw-app .avatar-btn{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--violet),var(--violet-deep));color:white;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;}

        .hw-app .profile-menu{position:absolute;top:64px;right:20px;width:228px;background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(27,26,31,.28);z-index:30;display:none;}
        .hw-app .profile-menu.open{display:block;}
        .hw-app .profile-menu .who{padding:16px;border-bottom:1px solid var(--line);}
        .hw-app .profile-menu .who .name{font-weight:700;font-size:14.5px;font-family:'Sora';}
        .hw-app .profile-menu .who .badges{display:flex;gap:6px;margin-top:9px;}
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
        .hw-app .cat-select{display:flex;gap:8px;}
        .hw-app .cat-opt{flex:1;padding:13px 6px;border-radius:14px;border:1.5px solid var(--line);text-align:center;font-size:12px;font-weight:600;color:var(--ink-soft);cursor:pointer;background:var(--card);}
        .hw-app .cat-opt.selected{border-color:var(--violet);background:#EFEAFB;color:var(--violet-deep);}
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

        .hw-app .segnav{display:flex;gap:3px;background:#EFECE5;border-radius:100px;padding:4px;margin:6px 24px 4px;position:sticky;top:0;z-index:8;}
        .hw-app .segnav button{flex:1;text-align:center;padding:9px 0;border-radius:100px;font-size:12.5px;font-weight:700;color:var(--ink-soft);cursor:pointer;background:none;border:none;}
        .hw-app .segnav button.active{background:var(--ink);color:white;}
      `}</style>

      <div className="hw-app">
        <div className="frame">
          <div className="scroll-area">
            <header>
              <div className="logo"><span className="logo-text">Hive<span className="accent">work</span></span>
                <span className="testnet-badge" onClick={(e) => { e.stopPropagation(); setTestnetTipOpen((o) => !o); }}>Testnet</span>
              </div>
              <div className="header-actions">
                <button className="icon-wrap" onClick={() => setMenuOpen((o) => !o)} aria-label="Notifications">
                  <BellIcon />
                  <div className="badge-dot"></div>
                </button>
                <button className="avatar-btn" onClick={() => setMenuOpen((o) => !o)}>O</button>
              </div>
            </header>
            {testnetTipOpen && (
              <div className="testnet-tip">Hivework is running on the Pi Testnet. Balances and payments shown are Test-Pi and carry no real-world value.</div>
            )}

            <div className={`profile-menu${menuOpen ? " open" : ""}`}>
              <div className="who">
                <div className="name">@Olawalt</div>
                <div className="badges">
                  <span className="chip chip-verified">Verified</span>
                  <span className="chip chip-gold">Gold</span>
                </div>
              </div>
              <div className="menu-item" onClick={() => goTo("profile")}>View profile</div>
              <div className="menu-item">Edit profile</div>
              <div className="menu-item">Wallet settings</div>
              <div className="menu-item">Notification settings</div>
              <div className="menu-item">Contact support</div>
              <div className="menu-item">Log out</div>
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
            {screen === "job-detail" && (
              <div className="screen active">
                <button className="back-btn" onClick={goBack}><BackIcon />Back</button>
                <div className="detail-hero">
                  <div className="detail-cat">{job.cat}</div>
                  <div className="detail-title">{job.title}</div>
                </div>
                <div className="detail-meta-row">
                  <div className="detail-meta"><div className="l">Budget</div><div className="v mono">{job.amt}</div></div>
                  <div className="detail-meta"><div className="l">Applicants</div><div className="v">{job.applicants}</div></div>
                  <div className="detail-meta"><div className="l">Posted</div><div className="v">{job.posted}</div></div>
                </div>
                <div className="detail-body"><p>{job.desc}</p></div>
                <div className="section-title">Requirements</div>
                <ul className="req-list">
                  {job.reqs.map((r) => (
                    <li key={r}><CheckIcon />{r}</li>
                  ))}
                </ul>
                <div className="section-title">Device & language</div>
                <div className="chip-row">
                  {job.chips.map((c) => (
                    <span className="chip-outline" key={c}>{c}</span>
                  ))}
                </div>
                <div className="sticky-cta">
                  <button className="btn">{job.cta}</button>
                </div>
              </div>
            )}

            {/* POST */}
            {screen === "post" && (
              <div className="screen active">
                <div className="page-head"><div className="kicker">New job</div><h1>Post a job.</h1></div>
                <div className="wizard-track">
                  <div className="wz-seg active"><div className="wz-dot">1</div><div className="wz-label">Basics</div></div>
                  <div className="wz-seg"><div className="wz-dot">2</div><div className="wz-label">Details</div></div>
                  <div className="wz-seg"><div className="wz-dot">3</div><div className="wz-label">Review</div></div>
                </div>
                <div className="field"><label>Job title</label><input placeholder="e.g. Test payment flow on Android" /></div>
                <div className="field">
                  <label>Category</label>
                  <div className="cat-select">
                    {["Bug", "UI", "Translation"].map((c) => (
                      <div
                        key={c}
                        className={`cat-opt${category === c ? " selected" : ""}`}
                        onClick={() => setCategory(c)}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="field"><label>Budget (Pi)</label><input placeholder="e.g. 5" /></div>
                <div className="field"><label>Description</label><textarea placeholder="Describe exactly what needs to be done..."></textarea></div>
                <button className="btn">Continue →</button>
              </div>
            )}

            {/* PROFILE */}
            {screen === "profile" && (
              <div className="screen active">
                <button className="back-btn" onClick={goBack} style={{ paddingTop: 20 }}><BackIcon />Back</button>
                <div className="cover">
                  <div className="big-avatar">O</div>
                  <div className="handle">@Olawalt</div>
                  <div className="bio">I am a tester</div>
                  <div className="badges-row"><span className="chip chip-verified">Verified</span><span className="chip chip-gold">Gold</span></div>
                </div>
                <div className="stat-pills">
                  <div className="stat-pill"><div className="n">17</div><div className="l">Jobs done</div></div>
                  <div className="stat-pill"><div className="n">4.3★</div><div className="l">Rating</div></div>
                  <div className="stat-pill"><div className="n">116π</div><div className="l">Earned</div></div>
                </div>
                <div className="section-title">Skills & devices</div>
                <div style={{ marginBottom: 24 }}>
                  <span className="skill-chip">Android tester</span>
                  <span className="skill-chip">Android</span>
                  <span className="skill-chip">iOS</span>
                  <span className="skill-chip">English</span>
                </div>
                <div className="section-title">Reviews (27)</div>
                <div className="review-row"><div className="review-top"><span>@walterdanny00</span><span className="stars">★★★★★</span></div><p>Full payment received</p></div>
                <div className="review-row"><div className="review-top"><span>@walterdanny00</span><span className="stars">★★★★</span></div><p>Good job, well done</p></div>
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
                      <button className="nudge-cta" onClick={() => goTo("profile")}>Finish →</button>
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
                    <div className="balance-card">
                      <div className="l">Available balance</div>
                      <div className="n">4π</div>
                      <div className="withdraw-row"><input placeholder="Amount (min 1π)" /><button>Withdraw</button></div>
                    </div>

                    <div className="section-title-row">
                      <div className="section-title" style={{ margin: 0 }}>Your work</div>
                      <button className="see-all" onClick={() => goTo("history-work")}>See all →</button>
                    </div>
                    {WORK_HISTORY.slice(0, 2).map((row) => (
                      <HistoryRow key={row.title} {...row} />
                    ))}

                    <div className="section-title-row" style={{ marginTop: 22 }}>
                      <div className="section-title" style={{ margin: 0 }}>Withdrawals</div>
                      <button className="see-all" onClick={() => goTo("history-withdrawals")}>See all →</button>
                    </div>
                    {WITHDRAWAL_HISTORY.slice(0, 2).map((row) => (
                      <HistoryRow key={row.title} {...row} />
                    ))}
                  </div>
                )}

                {workView === "myjobs" && (
                  <div>
                    <div className="section-title-row">
                      <div className="section-title" style={{ margin: 0 }}>Jobs you've posted</div>
                      <button className="see-all" onClick={() => goTo("history-jobs")}>See all →</button>
                    </div>

                    <div className="job-post-row">
                      <div className="jp-top"><h4>Test payment flow on Android</h4><span className="jp-amt">10π</span></div>
                      <div className="jp-status-row">
                        <span className="status-pill escrow">In escrow</span>
                        <span className="jp-applicants">1 applicant</span>
                      </div>
                      <div className="jp-divider"></div>
                      <button className="jp-manage" onClick={() => goTo("applicants")}>Review applicants →</button>
                    </div>

                    <div className="job-post-row">
                      <div className="jp-top"><h4>Localize onboarding copy</h4><span className="jp-amt">6π</span></div>
                      <div className="jp-status-row">
                        <span className="status-pill open">Open</span>
                        <span className="jp-applicants">2 applicants</span>
                      </div>
                      <div className="jp-divider"></div>
                      <button className="jp-manage" onClick={() => goTo("applicants")}>Review applicants →</button>
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
                {WORK_HISTORY.map((row) => (
                  <HistoryRow key={row.title} {...row} />
                ))}
              </div>
            )}

            {/* HISTORY: JOBS POSTED */}
            {screen === "history-jobs" && (
              <div className="screen active">
                <button className="back-btn" onClick={goBackToDashboard}><BackIcon />Back</button>
                <div className="page-head" style={{ paddingTop: 8 }}><h1 style={{ fontSize: 22 }}>Posted jobs</h1></div>
                {JOBS_HISTORY.map((row) => (
                  <HistoryRow key={row.title} {...row} />
                ))}
              </div>
            )}

            {/* HISTORY: WITHDRAWALS */}
            {screen === "history-withdrawals" && (
              <div className="screen active">
                <button className="back-btn" onClick={goBackToDashboard}><BackIcon />Back</button>
                <div className="page-head" style={{ paddingTop: 8 }}><h1 style={{ fontSize: 22 }}>Withdrawal history</h1></div>
                {WITHDRAWAL_HISTORY.map((row) => (
                  <HistoryRow key={row.title} {...row} />
                ))}
              </div>
            )}

            {/* APPLICANTS */}
            {screen === "applicants" && (
              <div className="screen active">
                <button className="back-btn" onClick={goBackToDashboard}><BackIcon />Back</button>
                <div className="page-head" style={{ paddingTop: 8 }}>
                  <div className="kicker">Test payment flow on Android</div>
                  <h1 style={{ fontSize: 24 }}>Applicants</h1>
                </div>
                <div className="applicant-row">
                  <div className="app-avatar">W</div>
                  <div className="app-info"><div className="n">@walterdanny00</div><div className="s">4.6★ · 42 jobs done</div></div>
                  <div className="app-actions">
                    <button className="app-btn approve">Approve</button>
                    <button className="app-btn decline">Decline</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
