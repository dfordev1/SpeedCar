import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIdentity } from "../state/IdentityContext";

export function Welcome() {
  const { identity, create, importKey } = useIdentity();
  const navigate = useNavigate();
  const [importOpen, setImportOpen] = useState(false);
  const [importValue, setImportValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    create();
    // Stay on welcome so user sees their role picker below
  };

  const handleImport = () => {
    setError(null);
    try {
      importKey(importValue);
      setImportOpen(false);
      setImportValue("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    }
  };

  if (!identity) {
    return (
      <div className="screen">
        <div className="stack">
          <h2 className="title">Welcome to SpeedCar.</h2>
          <p className="subtitle">
            A decentralized rideshare protocol. No accounts, no servers, no fees.
            Your key is your identity — it lives on this device.
          </p>
        </div>

        <div className="card stack">
          <button className="primary" onClick={handleCreate}>
            Create a new identity
          </button>
          <button onClick={() => setImportOpen((v) => !v)}>
            I already have one (import)
          </button>
          {importOpen && (
            <div className="stack">
              <textarea
                rows={3}
                placeholder="Paste your nsec1… or 64-char hex secret key"
                value={importValue}
                onChange={(e) => setImportValue(e.target.value)}
              />
              {error && <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p>}
              <button className="primary" onClick={handleImport}>
                Import
              </button>
            </div>
          )}
        </div>

        <p className="subtitle" style={{ fontSize: 12 }}>
          By continuing you accept that SpeedCar operates no servers, stores no
          personal data, and provides no guarantees. Ride at your own risk.
        </p>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="stack">
        <h2 className="title">Pick a role</h2>
        <p className="subtitle">
          You can switch any time. Drivers broadcast availability; riders request
          rides. Nothing is locked in.
        </p>
      </div>

      <div className="card stack">
        <button className="primary" onClick={() => navigate("/rider")}>
          I need a ride
        </button>
        <button onClick={() => navigate("/driver")}>I'm driving</button>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="subtitle">Your public key</span>
          <span className="pill">{identity.npub.slice(0, 14)}…</span>
        </div>
        <p className="mono">{identity.npub}</p>
      </div>
    </div>
  );
}
