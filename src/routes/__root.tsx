import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";

import appCss from "../styles.css?url";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { StoreProvider } from "@/lib/spf-store";
import { Toaster } from "@/components/ui/sonner";

// ── Role definitions ──────────────────────────────────────────────────────────

export const ROLES = [
  {
    id: "founder",
    title: "Founder / Owner",
    subtitle: "Full system access",
    color: "#1e3a5f",
    badge: "Executive",
    username: "owner",
    password: "swan2024",
    modules: ["Dashboard","Production","Inventory","Procurement","Sales Orders","Deliveries","Shifts","Quality","Workforce","Reports"],
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
    modules: ["Dashboard","Production","Shifts","Quality","Workforce"],
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
    modules: ["Dashboard","Production","Shifts"],
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

export type Role = typeof ROLES[number];

const SESSION_KEY = "spf_oms_session";

// ── Login screen ──────────────────────────────────────────────────────────────

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 10, fontWeight: 600,
      letterSpacing: "0.06em", textTransform: "uppercase" as const,
      background: color + "18", color, border: `1px solid ${color}30`,
      borderRadius: 4, padding: "2px 7px",
    }}>{text}</span>
  );
}

function RoleCard({ role, selected, onSelect }: { role: Role; selected: Role | null; onSelect: (r: Role) => void }) {
  const isSelected = selected?.id === role.id;
  return (
    <button
      onClick={() => onSelect(role)}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        textAlign: "left", background: isSelected ? role.color + "10" : "white",
        border: `1.5px solid ${isSelected ? role.color : "#e2e8f0"}`,
        borderRadius: 10, padding: "10px 14px", cursor: "pointer", transition: "all 0.15s",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#1a2332" }}>{role.title}</span>
          <Badge text={role.badge} color={role.color} />
        </div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{role.subtitle}</div>
      </div>
      {isSelected && <span style={{ color: role.color, fontSize: 15, fontWeight: 700 }}>✓</span>}
    </button>
  );
}

function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  const [step, setStep] = useState<"select" | "login">("select");
  const [selected, setSelected] = useState<Role | null>(null);
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = ROLES.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.badge.toLowerCase().includes(search.toLowerCase())
  );

  function selectRole(role: Role) { setSelected(role); setStep("login"); setUsername(""); setPassword(""); setError(""); }
  function goBack() { setStep("select"); }
  function fillDemo() { if (selected) { setUsername(selected.username); setPassword(selected.password); setError(""); } }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(""); setLoading(true);
    setTimeout(() => {
      if (username === selected.username && password === selected.password) {
        onLogin(selected);
      } else {
        setError("Invalid username or password.");
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#f1f5f9", display: "flex",
      alignItems: "flex-start", justifyContent: "center",
      padding: "32px 12px", fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 460, background: "white", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.09)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "#1e3a5f", padding: "18px 22px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.12)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 13 }}>SPF</span>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>Swan Paper Fabrics</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase" }}>Operations Management System</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 22px" }}>
          {step === "select" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1a2332", marginBottom: 2 }}>Select your role</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Choose your position to continue.</div>
              </div>
              <input
                type="text" placeholder="Search roles..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 380, overflowY: "auto" }}>
                {filtered.map(role => <RoleCard key={role.id} role={role} selected={selected} onSelect={selectRole} />)}
              </div>
            </div>
          )}

          {step === "login" && selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button onClick={goBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 13, padding: 0, textAlign: "left", width: "fit-content" }}>← Back</button>

              <div style={{ background: selected.color + "0d", border: `1px solid ${selected.color}25`, borderRadius: 10, padding: "13px 15px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2332" }}>{selected.title}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{selected.description}</div>
                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {selected.modules.slice(0, 4).map(m => <Badge key={m} text={m} color={selected.color} />)}
                  {selected.modules.length > 4 && <span style={{ fontSize: 10, color: "#64748b" }}>+{selected.modules.length - 4} more</span>}
                </div>
              </div>

              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder={`e.g. ${selected.username}`} required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 7, padding: "8px 12px", fontSize: 12, color: "#b91c1c" }}>{error}</div>}
                <button type="submit" disabled={loading}
                  style={{ background: loading ? "#94a3b8" : selected.color, color: "white", border: "none", borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Signing in..." : `Sign in as ${selected.title}`}
                </button>
              </form>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Demo credentials</div>
                <div style={{ fontSize: 12, color: "#374151", fontFamily: "monospace" }}>
                  Username: <strong>{selected.username}</strong><br />
                  Password: <strong>{selected.password}</strong>
                </div>
                <button onClick={fillDemo} style={{ marginTop: 7, background: "white", border: "1px solid #d1d5db", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", color: "#374151" }}>
                  Fill demo credentials
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "9px 22px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>SPF-OMS v1.0 - University Prototype</span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>Swan Paper Fabrics 2024</span>
        </div>
      </div>
    </div>
  );
}

// ── Root route ────────────────────────────────────────────────────────────────

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page did not load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SPF-OMS — Swan Paper Fabrics Operations" },
      { name: "description", content: "Operations Management System for Swan Paper Fabrics" },
      { property: "og:title", content: "SPF-OMS — Swan Paper Fabrics Operations" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [role, setRole] = useState<Role | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  function handleLogin(r: Role) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(r));
    setRole(r);
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    setRole(null);
  }

  if (!role) return <LoginScreen onLogin={handleLogin} />;

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background">
            <AppSidebar role={role} onLogout={handleLogout} />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="sticky top-0 z-10 h-14 flex items-center gap-3 border-b bg-card px-4">
                <SidebarTrigger />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">Operations Management System</span>
                  <span className="text-xs text-muted-foreground">Swan Paper Fabrics</span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    Logged in as <span className="font-medium text-foreground">{role.title}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-xs border rounded px-2 py-1 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                  >Sign out</button>
                </div>
              </header>
              <main className="flex-1 p-6 overflow-x-auto">
                <Outlet />
              </main>
            </div>
          </div>
          <Toaster richColors position="top-right" />
        </SidebarProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}
