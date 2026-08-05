import React, { useState } from "react";
import "./hivework-tokens.css";

/**
 * Hivework — Onboarding
 * Route: `onboarding`. Reached from Landing's "Get started" (no intent) or
 * hero CTAs with ?intent=find / ?intent=post.
 *
 * In a real app, `piBrowserDetected` and `intent` should come from actual
 * environment detection and the URL query param, not props — they're left
 * as props here with sensible defaults so this drops in easily, and the
 * PreviewControls component (bottom of this file) exists only for
 * design review. Delete <PreviewControls /> and the two useState calls it
 * drives once this is wired to real detection.
 */

const KYC_DETAIL =
  "Browsing is open to everyone. Posting a job or applying to paid work requires a KYC-verified, Mainnet-migrated Pi Wallet — Pi's network doesn't support Pi transfers on unverified accounts. Haven't completed KYC yet? You can still explore Hivework, and we'll prompt you to verify when you're ready to post or apply.";

const SKILLS = ["Bug testing", "UI feedback", "Translation", "Android tester"];
const DEVICES = ["Android", "iOS"];

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
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

function WizardTrack({ step }) {
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

function ChipGroup({ options, selected, onToggle }) {
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

export default function HiveworkOnboarding({ piBrowserDetected: piBrowserProp = true, intent: intentProp = "none" }) {
  const [screen, setScreen] = useState("connect"); // 'connect' | 'profile' | 'notify' | 'routing'
  const [tosChecked, setTosChecked] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [skills, setSkills] = useState([]);
  const [devices, setDevices] = useState([]);

  // Preview-only state — see PreviewControls note below.
  const [piBrowserDetected, setPiBrowserDetected] = useState(piBrowserProp);
  const [intent, setIntent] = useState(intentProp);

  const goTo = (id) => {
    setScreen(id);
    window.scrollTo(0, 0);
  };

  const handleConnect = () => {
    if (!piBrowserDetected) {
      // real implementation: window.location = piBrowserDeepLink
      return;
    }
    setWalletConnected(true);
    setTimeout(() => goTo("profile"), 500);
  };

  const toggleSkill = (s) => setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const toggleDevice = (d) => setDevices((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const finishOnboarding = () => {
    goTo("routing");
    // In a real app this is where you'd route to Browse / Post / Home.
  };

  const routingCopy = {
    find: { title: "Taking you to Browse", sub: "Let's find you some work." },
    post: { title: "Taking you to Post a Job", sub: "Let's get your job listed." },
    none: { title: "Taking you to Home", sub: "Welcome to Hivework." },
  }[intent];

  return (
    <>
      <style>{`
        .hw-onboard *{box-sizing:border-box;}
        html,body{height:100%;}
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

        .hw-onboard .chip-group{display:flex;flex-wrap:wrap;gap:8px;}
        .hw-onboard .chip-toggle{padding:9px 15px;border-radius:100px;border:1.5px solid var(--line);background:var(--cream);font-size:12.5px;font-weight:600;color:var(--ink-soft);cursor:pointer;}
        .hw-onboard .chip-toggle.selected{border-color:var(--violet);background:#EFEAFB;color:var(--violet-deep);}

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

        .hw-onboard .preview-bar{max-width:560px;margin:16px auto 0;padding:12px 20px;border:1px dashed #B8B2A0;border-radius:12px;background:#F1EEE5;font-size:11.5px;color:var(--ink-soft);}
        .hw-onboard .preview-bar strong{color:var(--ink);}
        .hw-onboard .preview-row{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap;}
        .hw-onboard .preview-btn{font-size:11px;font-weight:700;padding:5px 10px;border-radius:100px;border:1px solid #B8B2A0;background:white;color:var(--ink-soft);cursor:pointer;}
        .hw-onboard .preview-btn.on{background:var(--ink);color:white;border-color:var(--ink);}
      `}</style>

      <div className="hw-onboard">
        <PreviewControls
          piBrowserDetected={piBrowserDetected}
          setPiBrowserDetected={setPiBrowserDetected}
          intent={intent}
          setIntent={setIntent}
        />

        <div className="frame">
          <header>
            <div className="logo">Hive<span>work</span></div>
          </header>

          <div className="pad">
            {/* CONNECT */}
            {screen === "connect" && (
              <div>
                <WizardTrack step={1} />
                <div className="step-head">
                  <h1>Connect your Pi Wallet</h1>
                  <p>Hivework uses the Pi Wallet for identity and escrow. We'll request your Pi username and payment permissions.</p>
                </div>

                <div className="wallet-card">
                  <div className="wallet-top">
                    <div className="wallet-pi">π</div>
                    <span className={`wallet-status${walletConnected ? " connected" : ""}`}>
                      {walletConnected ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <div className="wallet-label">Pi Wallet</div>
                  <div className="wallet-value">{walletConnected ? "@olawalt" : "Waiting for connection…"}</div>
                </div>

                <div className={`kyc-pill${kycOpen ? " open" : ""}`} onClick={() => setKycOpen((o) => !o)}>
                  <ShieldIcon />
                  <span>KYC required for paid activity — tap to learn more</span>
                  <ChevIcon open={kycOpen} />
                </div>
                <div className={`kyc-detail${kycOpen ? " open" : ""}`}>
                  <div className="kyc-detail-inner">{KYC_DETAIL}</div>
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

                <button className="btn btn-primary" disabled={!tosChecked} onClick={handleConnect}>
                  {piBrowserDetected ? "Connect with Pi Wallet" : "Open in Pi Browser"}
                </button>
                {!piBrowserDetected && (
                  <div className="pibrowser-note">The Pi SDK only works inside Pi Browser — open this page there to connect your wallet.</div>
                )}
              </div>
            )}

            {/* PROFILE */}
            {screen === "profile" && (
              <div>
                <button className="back-btn" onClick={() => goTo("connect")}><BackIcon />Back</button>
                <WizardTrack step={2} />
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
                    <ChipGroup options={SKILLS} selected={skills} onToggle={toggleSkill} />
                  </div>

                  <div className="pc-row">
                    <div className="pc-label">Devices · optional</div>
                    <ChipGroup options={DEVICES} selected={devices} onToggle={toggleDevice} />
                  </div>
                </div>

                <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => goTo("notify")}>Continue →</button>
                <button className="btn-text" onClick={() => goTo("notify")}>Skip for now</button>
              </div>
            )}

            {/* NOTIFY */}
            {screen === "notify" && (
              <div>
                <button className="back-btn" onClick={() => goTo("profile")}><BackIcon />Back</button>
                <WizardTrack step={3} />
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

            {/* ROUTING */}
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

/**
 * Preview-only controls for design review. Not part of the shipped
 * onboarding flow — remove this component (and the two useState calls
 * that feed it in HiveworkOnboarding) once piBrowserDetected/intent are
 * wired to real environment detection and the URL query string.
 */
function PreviewControls({ piBrowserDetected, setPiBrowserDetected, intent, setIntent }) {
  return (
    <div className="preview-bar">
      <strong>Preview controls</strong> — not part of the design, just for testing states.
      <div className="preview-row">
        Pi Browser:
        <button className={`preview-btn${piBrowserDetected ? " on" : ""}`} onClick={() => setPiBrowserDetected(true)}>Detected</button>
        <button className={`preview-btn${!piBrowserDetected ? " on" : ""}`} onClick={() => setPiBrowserDetected(false)}>Not detected</button>
      </div>
      <div className="preview-row">
        Intent from Landing:
        <button className={`preview-btn${intent === "none" ? " on" : ""}`} onClick={() => setIntent("none")}>None</button>
        <button className={`preview-btn${intent === "find" ? " on" : ""}`} onClick={() => setIntent("find")}>find</button>
        <button className={`preview-btn${intent === "post" ? " on" : ""}`} onClick={() => setIntent("post")}>post</button>
      </div>
    </div>
  );
}
