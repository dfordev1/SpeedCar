import { Routes, Route, Navigate } from "react-router-dom";
import { Welcome } from "./screens/Welcome";
import { Rider } from "./screens/Rider";
import { Driver } from "./screens/Driver";
import { Settings } from "./screens/Settings";
import { IdentityProvider, useIdentity } from "./state/IdentityContext";
import { Header } from "./components/Header";

function RequireIdentity({ children }: { children: JSX.Element }) {
  const { identity } = useIdentity();
  if (!identity) return <Navigate to="/" replace />;
  return children;
}

export function App() {
  return (
    <IdentityProvider>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route
            path="/rider"
            element={
              <RequireIdentity>
                <Rider />
              </RequireIdentity>
            }
          />
          <Route
            path="/driver"
            element={
              <RequireIdentity>
                <Driver />
              </RequireIdentity>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireIdentity>
                <Settings />
              </RequireIdentity>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </IdentityProvider>
  );
}
