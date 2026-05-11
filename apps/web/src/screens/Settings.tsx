import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIdentity } from "../state/IdentityContext";
import { DEFAULT_RELAYS, loadRelays, saveRelays } from "../nostr/relays";

export function Settings() {
  const { identity, forget } = useIdentity();
  const navigate = useNavigate();
  const [showSecret, setShowSecret] = useState(false);
  const [relaysText, setRelaysText] = useState(() => loadRelays().join("\n"));
  const [saved, setSaved] = useState(false);

  if (!identity) return null;

  const handleSaveRelays = () => {
    const list = relaysText
      .split(/\s+/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("wss://") || s.startsWith("ws://"));
    saveRelays(list.length > 0 ? list : DEFAULT_RELAYS);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleResetRelays = () => {
    setRelaysText(DEFAULT_RELAYS.join("\n"));
    saveRelays(DEFAULT_RELAYS);
  };

  const handleForget = () => {
    const ok = confirm(
      "This will remove your identity from this device. If you have not " +
        "backed up your nsec you will not be able to restore it. Continue?",
    );
    if (!ok) return;
    forget();
    navigate("/");
  };

  return (
    <div className="screen">
      <div className="stack">
        <h2 className="title">Settings</h2>
        <p className="subtitle">Your identity, your relays. All local to this device.</p>
      </div>

      <div className="card stack">
        <h3 style={{ margin: 0 }}>Identity</h3>
        <p className="subtitle" style={{ margin: 0 }}>Public key (npub)</p>
        <p className="mono">{identity.npub}</p>

        <p className="subtitle" style={{ margin: "8px 0 0" }}>
          Secret key (nsec) — back this up somewhere safe
        </p>
        {showSecret ? (
          <p className="mono" style={{ color: "var(--danger)" }}>{identity.nsec}</p>
        ) : (
          <button onClick={() => setShowSecret(true)}>Reveal secret key</button>
        )}
      </div>

      <div className="card stack">
        <h3 style={{ margin: 0 }}>Relays</h3>
        <p className="subtitle" style={{ margin: 0 }}>
          Public Nostr relays used for discovery and signalling. One per line.
        </p>
        <textarea
          rows={6}
          value={relaysText}
          onChange={(e) => setRelaysText(e.target.value)}
        />
        <div className="row">
          <button className="primary" onClick={handleSaveRelays}>
            Save
          </button>
          <button onClick={handleResetRelays}>Reset to defaults</button>
          {saved && <span className="pill live">saved</span>}
        </div>
      </div>

      <div className="card stack">
        <h3 style={{ margin: 0, color: "var(--danger)" }}>Danger zone</h3>
        <button onClick={handleForget}>Forget identity on this device</button>
      </div>
    </div>
  );
}
