import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore, rmStockState, productStock } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Factory, AlertTriangle, ClipboardList, PackageCheck, Truck, Users } from "lucide-react";
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

  const activeOrders = state.prodOrders.filter((p) => p.Status === "In Progress" || p.Status === "Planned").length;
  const lowStockRM = state.inventory.filter((ir) => {
    const m = state.materials.find((mm) => mm.MaterialID === ir.MaterialID);
    return m && rmStockState(ir.QtyOnHand, m.ReorderThreshhold) !== "Normal";
  }).length;
  const pendingSO = state.salesOrders.filter((s) => s.Status === "Pending" || s.Status === "Confirmed").length;
  const completedBatchesToday = state.batches.length;
  const todayDeliveries = state.deliveries.filter((d) => d.DeliveryStatus !== "Delivered").length;
  const totalEmployees = state.employees.length;

  const productionData = state.batches.map((b) => ({ name: b.BatchID, output: b.QtyProduced, waste: b.WasteQty }));
  const invData = state.inventory.map((ir) => {
    const m = state.materials.find((mm) => mm.MaterialID === ir.MaterialID);
    return { name: m?.Name.split(" ")[0] ?? ir.MaterialID, qty: ir.QtyOnHand, reorder: m?.ReorderThreshhold ?? 0 };
  });
  const deliveryData = [
    { day: "Mon", onTime: 12, late: 1 }, { day: "Tue", onTime: 14, late: 2 },
    { day: "Wed", onTime: 11, late: 0 }, { day: "Thu", onTime: 15, late: 1 },
    { day: "Fri", onTime: 13, late: 3 }, { day: "Sat", onTime: 9, late: 1 },
  ];

  // finished goods snapshot for stat tile
  const fgStock = state.products.reduce((acc, p) => acc + Math.max(0, productStock(state, p.ProductID)), 0);

  return (
    <div>
      <PageHeader title="Operations Dashboard" description="Live snapshot of factory operations" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Stat icon={Factory} label="Active Prod Orders" value={activeOrders} />
        <Stat icon={AlertTriangle} label="Low/Out Materials" value={lowStockRM} tone={lowStockRM ? "warning" : "success"} />
        <Stat icon={ClipboardList} label="Pending Sales" value={pendingSO} />
        <Stat icon={PackageCheck} label="Batches Logged" value={completedBatchesToday} />
        <Stat icon={Truck} label="Open Deliveries" value={todayDeliveries} />
        <Stat icon={Users} label="Employees" value={totalEmployees} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Production Output by Batch</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="output" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="waste" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Raw Material vs Reorder</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={invData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="qty" fill="var(--color-success)" />
                <Bar dataKey="reorder" fill="var(--color-warning)" />
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
            <p className="mt-4 text-xs text-muted-foreground">FG units in stock (derived): <span className="font-medium text-foreground">{fgStock.toLocaleString()}</span></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
