import { useState } from "react";

const ROLES = [
  {
    id: "founder",
    title: "Founder / Owner",
    subtitle: "Full system access",
    color: "#1e3a5f",
    badge: "Executive",
    username: "owner",
    password: "swan2024",
    modules: ["Dashboard","Production","Inventory","Procurement","Sales Orders","Deliveries","Machine Downtime","Quality","Workforce","Reports"],
    description: "Complete oversight of all operations, approvals, and strategic reports.",
  },
  {
    id: "production",
    title: "Production Manager",
    subtitle: "Production & Quality",
    color: "#0f6e56",
    badge: "Production",
    username: "prodmgr",
    password: "prod123",
    modules: ["Dashboard","Production","Machine Downtime","Quality","Workforce","Shifts"],
    description: "Manages batches, machines, shifts, and quality inspections.",
  },
  {
    id: "machine_operator",
    title: "Machine Operator",
    subtitle: "Machine & Production",
    color: "#534AB7",
    badge: "Operator",
    username: "operator",
    password: "op123",
    modules: ["Dashboard","Production","Machine Downtime"],
    description: "Logs batch progress, operator notes, and machine downtime events.",
  },
  {
    id: "driver",
    title: "Delivery Driver",
    subtitle: "Delivery Management",
    color: "#BA7517",
    badge: "Driver",
    username: "driver",
    password: "drive123",
    modules: ["Dashboard","Deliveries"],
    description: "Views delivery manifests, confirms deliveries, and logs issues.",
  },
  {
    id: "packaging",
    title: "Packaging Worker",
    subtitle: "Inventory & Sales Orders",
    color: "#993C1D",
    badge: "Packaging",
    username: "packing",
    password: "pack123",
    modules: ["Dashboard","Inventory","Sales Orders"],
    description: "Monitors finished goods stock and packs sales orders for dispatch.",
  },
  {
    id: "inventory",
    title: "Inventory Manager",
    subtitle: "Stock Control",
    color: "#185FA5",
    badge: "Inventory",
    username: "inventory",
    password: "inv123",
    modules: ["Dashboard","Inventory","Procurement","Reports"],
    description: "Manages raw materials, finished goods, purchase order receiving.",
  },
  {
    id: "sales",
    title: "Sales Clerk",
    subtitle: "Sales & Orders",
    color: "#3B6D11",
    badge: "Sales",
    username: "sales",
    password: "sales123",
    modules: ["Dashboard","Sales Orders","Deliveries"],
    description: "Creates sales orders, assigns stock, and tracks order status.",
  },
  {
    id: "quality",
    title: "Quality Inspector",
    subtitle: "Quality Control",
    color: "#A32D2D",
    badge: "QC",
    username: "qc",
    password: "qc123",
    modules: ["Dashboard","Quality","Production"],
    description: "Records inspections, logs defects, and updates batch pass/fail status.",
  },
];

function Badge({ text, color }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      background: color + "18",
      color: color,
      border: `1px solid ${color}30`,
      borderRadius: 4,
      padding: "2px 7px",
    }}>{text}</span>
  );
}

function RoleCard({ role, selected, onSelect }) {
  const isSelected = selected?.id === role.id;
  return (
    <button
      onClick={() => onSelect(role)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        background: isSelected ? role.color + "10" : "white",
        border: `1.5px solid ${isSelected ? role.color : "#e2e8f0"}`,
        borderRadius: 10,
        padding: "10px 14px",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#1a2332" }}>{role.title}</span>
          <Badge text={role.badge} color={role.color} />
        </div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{role.subtitle}</div>
      </div>
      {isSelected && (
        <span style={{ color: role.color, fontSize: 16, fontWeight: 700 }}>v</span>
      )}
    </button>
  );
}

function LoginForm({ role, onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username === role.username && password === role.password) {
        onLogin(role);
      } else {
        setError("Invalid username or password. Check credentials below.");
        setLoading(false);
      }
    }, 700);
  }

  function fillDemo() {
    setUsername(role.username);
    setPassword(role.password);
    setError("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <button
        onClick={onBack}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#64748b", fontSize: 13, padding: "4px 0",
          display: "flex", alignItems: "center", gap: 4, width: "fit-content",
        }}
      >Back</button>

      <div style={{
        background: role.color + "0d",
        border: `1px solid ${role.color}25`,
        borderRadius: 10,
        padding: "14px 16px",
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2332" }}>{role.title}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{role.description}</div>
        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {role.modules.slice(0, 4).map(m => (
            <Badge key={m} text={m} color={role.color} />
          ))}
          {role.modules.length > 4 && (
            <span style={{ fontSize: 10, color: "#64748b", paddingTop: 2 }}>+{role.modules.length - 4} more</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder={`e.g. ${role.username}`}
            required
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 7,
              border: "1.5px solid #d1d5db", fontSize: 13, outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="password"
            required
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 7,
              border: "1.5px solid #d1d5db", fontSize: 13, outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fca5a5",
            borderRadius: 7, padding: "8px 12px", fontSize: 12, color: "#b91c1c",
          }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? "#94a3b8" : role.color,
            color: "white", border: "none", borderRadius: 8,
            padding: "11px", fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Signing in..." : `Sign in as ${role.title}`}
        </button>
      </form>

      <div style={{
        background: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: 8, padding: "10px 14px",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Demo credentials
        </div>
        <div style={{ fontSize: 12, color: "#374151", fontFamily: "monospace" }}>
          Username: <strong>{role.username}</strong><br />
          Password: <strong>{role.password}</strong>
        </div>
        <button
          onClick={fillDemo}
          style={{
            marginTop: 8, background: "white", border: "1px solid #d1d5db",
            borderRadius: 6, padding: "5px 10px", fontSize: 11,
            cursor: "pointer", color: "#374151",
          }}
        >Fill demo credentials</button>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const spfUrl = "https://paper-flow-ops.lovable.app/";

  const moduleLinks = {
    "Dashboard": spfUrl,
    "Production": spfUrl + "production",
    "Inventory": spfUrl + "inventory",
    "Procurement": spfUrl + "procurement",
    "Sales Orders": spfUrl + "sales",
    "Deliveries": spfUrl + "deliveries",
    "Machine Downtime": spfUrl + "machines",
    "Quality": spfUrl + "quality",
    "Workforce": spfUrl + "workforce",
    "Reports": spfUrl + "reports",
    "Shifts": spfUrl + "machines",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        background: user.color,
        borderRadius: 12,
        padding: "20px 22px",
        color: "white",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Signed in as</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{user.title}</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{user.description}</div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)",
              color: "white", borderRadius: 7, padding: "6px 12px", fontSize: 12,
              cursor: "pointer", fontWeight: 500,
            }}
          >Sign out</button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Your accessible modules
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
          {user.modules.map(mod => (
            <a
              key={mod}
              href={moduleLinks[mod] || spfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "white", border: `1.5px solid ${user.color}30`,
                borderRadius: 9, padding: "10px 12px",
                textDecoration: "none", color: "#1a2332",
                fontSize: 12, fontWeight: 500,
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: user.color, flexShrink: 0,
              }} />
              {mod}
            </a>
          ))}
        </div>
      </div>

      <div style={{
        background: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: 10, padding: "14px 16px",
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Open SPF-OMS System</div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
          Your role is <strong>{user.title}</strong>. In a real deployment, the system would show only your permitted modules automatically.
        </div>
        <a
          href={spfUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: user.color, color: "white",
            borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Open SPF-OMS
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState("select");
  const [selectedRole, setSelectedRole] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = ROLES.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.badge.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelectRole(role) {
    setSelectedRole(role);
    setStep("login");
  }

  function handleLogin(role) {
    setLoggedInUser(role);
    setStep("dashboard");
  }

  function handleLogout() {
    setLoggedInUser(null);
    setSelectedRole(null);
    setSearch("");
    setStep("select");
  }

  return (
    <div style={{
      minHeight: 520,
      background: "#f1f5f9",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "24px 12px",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 480,
        background: "white",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>
        <div style={{
          background: "#1e3a5f",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}>
          <div style={{
            width: 42, height: 42, background: "rgba(255,255,255,0.12)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 13, letterSpacing: "0.02em" }}>SPF</span>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>Swan Paper Fabrics</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Operations Management System
            </div>
          </div>
        </div>

        <div style={{ padding: "22px 24px" }}>
          {step === "select" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1a2332", marginBottom: 2 }}>Select your role</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Choose your position to access your permitted modules.</div>
              </div>
              <input
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: 7,
                  border: "1.5px solid #d1d5db", fontSize: 13,
                  outline: "none", boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 380, overflowY: "auto" }}>
                {filtered.map(role => (
                  <RoleCard key={role.id} role={role} selected={selectedRole} onSelect={handleSelectRole} />
                ))}
              </div>
            </div>
          )}

          {step === "login" && selectedRole && (
            <LoginForm
              role={selectedRole}
              onLogin={handleLogin}
              onBack={() => { setStep("select"); setSelectedRole(null); }}
            />
          )}

          {step === "dashboard" && loggedInUser && (
            <Dashboard user={loggedInUser} onLogout={handleLogout} />
          )}
        </div>

        <div style={{
          borderTop: "1px solid #f1f5f9",
          padding: "10px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>SPF-OMS v1.0 - University Prototype</span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>Swan Paper Fabrics 2024</span>
        </div>
      </div>
    </div>
  );
}
