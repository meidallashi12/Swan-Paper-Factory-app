import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/reports")({ component: Reports });

function Reports() {
  const { state } = useStore();

  const totalOutputToday = state.batches.reduce((a, b) => a + b.outputQty, 0);
  const machineOutput = state.machines.map(m => ({
    name: m.id, output: state.batches.filter(b => b.machine === m.id).reduce((a, b) => a + b.outputQty, 0),
  }));
  const supplierPerf = state.suppliers.map(s => {
    const ps = state.pos.filter(p => p.supplierId === s.id);
    const recv = ps.filter(p => p.status === "Received").length;
    return { ...s, total: ps.length, received: recv, onTimeRate: ps.length ? Math.round((recv / ps.length) * 100) : 0 };
  });
  const deliveryPerf = {
    total: state.deliveries.length,
    delivered: state.deliveries.filter(d => d.status === "Delivered").length,
    issues: state.deliveries.filter(d => d.status === "Issue").length,
  };
  const utilization = state.machines.map(m => {
    const dt = state.downtimes.filter(d => d.machineId === m.id).length;
    return { name: m.id, util: Math.max(40, 100 - dt * 8) };
  });

  return (
    <div>
      <PageHeader title="Reports" description="Operational summaries and performance" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Today's Production</p><p className="text-2xl font-bold mt-1">{totalOutputToday.toLocaleString()} units</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Deliveries Completed</p><p className="text-2xl font-bold mt-1">{deliveryPerf.delivered}/{deliveryPerf.total}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Delivery Issues</p><p className="text-2xl font-bold mt-1 text-destructive">{deliveryPerf.issues}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Stock Turnover</p><p className="text-2xl font-bold mt-1">3.4×</p><p className="text-xs text-muted-foreground">placeholder</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Machine Output</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineOutput}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                <Bar dataKey="output" fill="var(--color-primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Production Line Utilization</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} unit="%" /><Tooltip />
                <Bar dataKey="util" fill="var(--color-success)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Supplier Performance</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead className="text-right">POs</TableHead><TableHead className="text-right">Received</TableHead><TableHead className="text-right">On-time</TableHead></TableRow></TableHeader>
              <TableBody>
                {supplierPerf.map(s => (
                  <TableRow key={s.id}><TableCell>{s.name}</TableCell><TableCell className="text-right">{s.total}</TableCell><TableCell className="text-right">{s.received}</TableCell><TableCell className="text-right">{s.onTimeRate}%</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Daily Production Summary</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Batch</TableHead><TableHead>Product</TableHead><TableHead>Machine</TableHead><TableHead className="text-right">Output</TableHead></TableRow></TableHeader>
              <TableBody>
                {state.batches.map(b => (
                  <TableRow key={b.id}><TableCell>{b.id}</TableCell><TableCell>{b.product}</TableCell><TableCell>{b.machine}</TableCell><TableCell className="text-right">{b.outputQty.toLocaleString()}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
