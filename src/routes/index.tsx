import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore, invStatus } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import {
  Factory, AlertTriangle, ClipboardList, ShoppingCart, Wrench, Truck,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/")({ component: Dashboard });

function Stat({ icon: Icon, label, value, tone = "default" }: any) {
  const tones: Record<string, string> = {
    default: "text-foreground",
    success: "text-[color:var(--color-success)]",
    warning: "text-[color:var(--color-warning)]",
    danger: "text-destructive",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className={`mt-2 text-3xl font-bold ${tones[tone]}`}>{value}</p>
          </div>
          <div className="rounded-lg bg-secondary p-2"><Icon className="h-5 w-5 text-secondary-foreground" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { state } = useStore();
  const activeBatches = state.batches.filter((b) => b.status === "In Progress" || b.status === "Planned").length;
  const lowStock = state.inventory.filter((i) => invStatus(i) !== "Normal").length;
  const pendingSO = state.sos.filter((s) => s.status === "Pending" || s.status === "Confirmed").length;
  const openPO = state.pos.filter((p) => p.status !== "Received").length;
  const downMachines = state.machines.filter((m) => m.status === "Down" || m.status === "Under Maintenance").length;
  const todayDeliveries = state.deliveries.filter((d) => d.status !== "Delivered").length;

  const productionData = state.batches.map((b) => ({ name: b.id, output: b.outputQty }));
  const invData = state.inventory.slice(0, 6).map((i) => ({ name: i.name.split(" ")[0], qty: i.quantity, min: i.minStock }));
  const deliveryData = [
    { day: "Mon", onTime: 12, late: 1 }, { day: "Tue", onTime: 14, late: 2 },
    { day: "Wed", onTime: 11, late: 0 }, { day: "Thu", onTime: 15, late: 1 },
    { day: "Fri", onTime: 13, late: 3 }, { day: "Sat", onTime: 9, late: 1 },
  ];

  return (
    <div>
      <PageHeader title="Operations Dashboard" description="Live snapshot of factory operations" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Stat icon={Factory} label="Active Batches" value={activeBatches} />
        <Stat icon={AlertTriangle} label="Low Stock Items" value={lowStock} tone={lowStock ? "warning" : "success"} />
        <Stat icon={ClipboardList} label="Pending Sales" value={pendingSO} />
        <Stat icon={ShoppingCart} label="Open POs" value={openPO} />
        <Stat icon={Wrench} label="Machine Alerts" value={downMachines} tone={downMachines ? "danger" : "success"} />
        <Stat icon={Truck} label="Today's Deliveries" value={todayDeliveries} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Production Output (Recent Batches)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="output" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Inventory vs Minimum</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={invData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="qty" fill="var(--color-success)" />
                <Bar dataKey="min" fill="var(--color-warning)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Delivery Performance (last 6 days)</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deliveryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip /><Legend />
                <Line type="monotone" dataKey="onTime" stroke="var(--color-success)" strokeWidth={2} />
                <Line type="monotone" dataKey="late" stroke="var(--color-destructive)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {state.activity.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1">
                    <p>{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
