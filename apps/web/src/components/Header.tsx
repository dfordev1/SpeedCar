import { Link, useLocation } from "react-router-dom";
import { useIdentity } from "../state/IdentityContext";

export function Header() {
  const { identity } = useIdentity();
  const location = useLocation();
  const onHome = location.pathname === "/";

  return (
    <div className="header">
      <h1>
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          SpeedCar
        </Link>
      </h1>
      <div className="row">
        {identity && !onHome && (
          <span className="pill">
            {identity.npub.slice(0, 12)}…
          </span>
        )}
        {identity && (
          <Link to="/settings" className="link-btn" style={{ textDecoration: "none" }}>
            Settings
          </Link>
        )}
      </div>
    </div>
  );
}
