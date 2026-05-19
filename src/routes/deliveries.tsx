import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, DeliveryStatus } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/deliveries")({ component: Deliveries });

function Deliveries() {
  const { state, setState, addActivity } = useStore();
  const [issueOpen, setIssueOpen] = useState<string | null>(null);
  const [issue, setIssue] = useState("");

  const so = (id: string) => state.salesOrders.find((s) => s.SalesOrderID === id);
  const customerForSO = (sid: string) => {
    const o = so(sid); if (!o) return null;
    return state.customers.find((c) => c.CustomerID === o.CustomerID) ?? null;
  };
  const loadForSO = (sid: string) => {
    const lines = state.containedIn.filter((c) => c.SalesOrderID === sid);
    return lines.map((ln) => `${ln.Quantity} × ${state.products.find((p) => p.ProductID === ln.ProductID)?.Name ?? ln.ProductID}`).join(", ") || "—";
  };
  const driverName = (id: string) => state.drivers.find((d) => d.DriverID === id)?.FullName ?? id;

  const setStatus = (id: string, DeliveryStatus: DeliveryStatus) => {
    setState((st) => ({
      ...st,
      deliveries: st.deliveries.map((d) => {
        if (d.DeliveryID !== id) return d;
        const today = new Date().toISOString().slice(0, 10);
        if (DeliveryStatus === "Dispatched") return { ...d, DeliveryStatus, DispatchedDate: d.DispatchedDate || today };
        if (DeliveryStatus === "Delivered") return { ...d, DeliveryStatus, DeliveredDate: today };
        return { ...d, DeliveryStatus };
      }),
      salesOrders: DeliveryStatus === "Delivered" ? st.salesOrders.map((s) => {
        const d = st.deliveries.find((x) => x.DeliveryID === id);
        return d && s.SalesOrderID === d.SalesOrderID ? { ...s, Status: "Delivered" as any } : s;
      }) : st.salesOrders,
    }));
    addActivity(`Delivery ${id} → ${DeliveryStatus}`);
    toast.success(`${id} → ${DeliveryStatus}`);
  };

  const updateDriver = (id: string, DriverID: string) => {
    setState((s) => ({ ...s, deliveries: s.deliveries.map((d) => d.DeliveryID === id ? { ...d, DriverID } : d) }));
  };
  const updatePlate = (id: string, VeichlePlate: string) => {
    setState((s) => ({ ...s, deliveries: s.deliveries.map((d) => d.DeliveryID === id ? { ...d, VeichlePlate } : d) }));
  };

  const logIssue = () => {
    if (!issueOpen) return;
    setState((s) => ({ ...s, deliveries: s.deliveries.map((d) => d.DeliveryID === issueOpen ? { ...d, DeliveryStatus: "Issue", IssueNotes: issue } : d) }));
    addActivity(`Delivery ${issueOpen} issue: ${issue}`);
    toast.error(`Issue logged on ${issueOpen}`);
    setIssueOpen(null); setIssue("");
  };

  return (
    <div>
      <PageHeader title="Delivery Management" description="Daily delivery manifests, driver assignments, status updates" />

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Drivers</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>DriverID</TableHead><TableHead>Name</TableHead><TableHead>License</TableHead><TableHead>Phone</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {state.drivers.map((d) => (
                <TableRow key={d.DriverID}>
                  <TableCell className="font-mono text-xs">{d.DriverID}</TableCell>
                  <TableCell className="font-medium">{d.FullName}</TableCell>
                  <TableCell>{d.LicenseNumber}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.Phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Deliveries</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DeliveryID</TableHead><TableHead>Customer</TableHead><TableHead>Address</TableHead>
                <TableHead>Load</TableHead><TableHead>Driver</TableHead><TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead><TableHead>Notes</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.deliveries.map((d) => {
                const cust = customerForSO(d.SalesOrderID);
                return (
                  <TableRow key={d.DeliveryID}>
                    <TableCell className="font-medium">{d.DeliveryID}</TableCell>
                    <TableCell>{cust?.Name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[180px]">{cust?.Attribute ?? "—"}</TableCell>
                    <TableCell className="text-sm">{loadForSO(d.SalesOrderID)}</TableCell>
                    <TableCell>
                      <Select value={d.DriverID} onValueChange={(v) => updateDriver(d.DeliveryID, v)}>
                        <SelectTrigger className="h-8 w-32 text-xs"><SelectValue>{driverName(d.DriverID)}</SelectValue></SelectTrigger>
                        <SelectContent>{state.drivers.map((dr) => <SelectItem key={dr.DriverID} value={dr.DriverID}>{dr.FullName}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Input value={d.VeichlePlate} onChange={(e) => updatePlate(d.DeliveryID, e.target.value)} className="h-8 w-24" /></TableCell>
                    <TableCell><StatusBadge status={d.DeliveryStatus} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{d.IssueNotes || "—"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {d.DeliveryStatus === "Scheduled" && <Button size="sm" variant="outline" onClick={() => setStatus(d.DeliveryID, "Dispatched")}>Dispatch</Button>}
                      {d.DeliveryStatus === "Dispatched" && <Button size="sm" onClick={() => setStatus(d.DeliveryID, "Delivered")}><Check className="h-3 w-3 mr-1" />Confirm</Button>}
                      {d.DeliveryStatus !== "Delivered" && d.DeliveryStatus !== "Issue" && (
                        <Button size="sm" variant="ghost" onClick={() => setIssueOpen(d.DeliveryID)}><AlertTriangle className="h-3 w-3 mr-1" />Issue</Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!issueOpen} onOpenChange={(o) => !o && setIssueOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log delivery issue — {issueOpen}</DialogTitle></DialogHeader>
          <Label>Describe the issue</Label>
          <Textarea value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="Customer not available, damaged packaging, vehicle breakdown…" />
          <DialogFooter><Button variant="destructive" onClick={logIssue}>Log Issue</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
