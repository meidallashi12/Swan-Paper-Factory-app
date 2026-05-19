import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/reports")({ component: Reports });

function Reports() {
  const { state } = useStore();

  const totalOutput = state.batches.reduce((a, b) => a + b.QtyProduced, 0);
  const totalWaste = state.batches.reduce((a, b) => a + b.WasteQty, 0);

  const productOutput = state.products.map((p) => {
    const orders = state.prodOrders.filter((o) => o.ProductID === p.ProductID).map((o) => o.ProdOrderID);
    const out = state.batches.filter((b) => orders.includes(b.ProdOrderID)).reduce((a, b) => a + b.QtyProduced, 0);
    return { name: p.Name.split(" ")[0], output: out };
  });

  const supplierPerf = state.suppliers.map((s) => {
    const mats = state.materials.filter((m) => m.SupplierID === s.SupplierID);
    const matIds = mats.map((m) => m.MaterialID);
    const records = state.inventory.filter((ir) => matIds.includes(ir.MaterialID));
    const totalOnHand = records.reduce((a, r) => a + r.QtyOnHand, 0);
    return { ...s, materials: mats.length, totalOnHand };
  });

  const deliveryPerf = {
    total: state.deliveries.length,
    delivered: state.deliveries.filter((d) => d.DeliveryStatus === "Delivered").length,
    issues: state.deliveries.filter((d) => d.DeliveryStatus === "Issue").length,
  };

  const utilizationByShift = state.shifts.map((sh) => {
    const orders = state.prodOrders.filter((o) => o.ShiftID === sh.ShiftID);
    const completed = orders.filter((o) => o.Status === "Completed").length;
    const util = orders.length ? Math.round((completed / orders.length) * 100) : 0;
    return { name: sh.ShiftName, util };
  });

  return (
    <div>
      <PageHeader title="Reports" description="Operational summaries and performance" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Total Production</p><p className="text-2xl font-bold mt-1">{totalOutput.toLocaleString()} units</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Waste Logged</p><p className="text-2xl font-bold mt-1 text-destructive">{totalWaste}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Deliveries Completed</p><p className="text-2xl font-bold mt-1">{deliveryPerf.delivered}/{deliveryPerf.total}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Stock Turnover</p><p className="text-2xl font-bold mt-1">3.4×</p><p className="text-xs text-muted-foreground">placeholder</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Output by Product</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productOutput}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                <Bar dataKey="output" fill="var(--color-primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Shift Order-Completion Rate</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationByShift}>
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
              <TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead className="text-right">Materials</TableHead><TableHead className="text-right">Total On-hand</TableHead></TableRow></TableHeader>
              <TableBody>
                {supplierPerf.map((s) => (
                  <TableRow key={s.SupplierID}>
                    <TableCell>{s.CompanyName}</TableCell>
                    <TableCell className="text-right">{s.materials}</TableCell>
                    <TableCell className="text-right">{s.totalOnHand.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Daily Production Summary</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Batch</TableHead><TableHead>Order</TableHead><TableHead className="text-right">Produced</TableHead><TableHead className="text-right">Waste</TableHead></TableRow></TableHeader>
              <TableBody>
                {state.batches.map((b) => (
                  <TableRow key={b.BatchID}>
                    <TableCell>{b.BatchID}</TableCell>
                    <TableCell>{b.ProdOrderID}</TableCell>
                    <TableCell className="text-right">{b.QtyProduced.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-destructive">{b.WasteQty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
