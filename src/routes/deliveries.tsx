import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, DeliveryStatus } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/deliveries")({ component: Deliveries });

function Deliveries() {
  const { state, setState, addActivity } = useStore();
  const [issueOpen, setIssueOpen] = useState<string | null>(null);
  const [issue, setIssue] = useState("");

  const so = (id: string) => state.sos.find(s => s.id === id);
  const client = (sid: string) => {
    const s = so(sid); if (!s) return "—";
    return state.clients.find(c => c.id === s.clientId)?.name ?? "—";
  };
  const address = (sid: string) => {
    const s = so(sid); if (!s) return "—";
    return state.clients.find(c => c.id === s.clientId)?.address ?? "—";
  };
  const load = (sid: string) => {
    const s = so(sid); if (!s) return "—";
    return `${s.quantity} × ${state.inventory.find(i => i.id === s.itemId)?.name ?? s.itemId}`;
  };

  const setStatus = (id: string, status: DeliveryStatus) => {
    setState((st) => ({
      ...st,
      deliveries: st.deliveries.map(d => d.id === id ? { ...d, status } : d),
      sos: status === "Delivered" ? st.sos.map(s => {
        const d = st.deliveries.find(x => x.id === id);
        return d && s.id === d.salesOrderId ? { ...s, status: "Delivered" as any } : s;
      }) : st.sos,
    }));
    addActivity(`Delivery ${id} → ${status}`);
    toast.success(`${id} → ${status}`);
  };

  const updateDriver = (id: string, driver: string) => {
    setState((s) => ({ ...s, deliveries: s.deliveries.map(d => d.id === id ? { ...d, driver } : d) }));
  };

  const logIssue = () => {
    if (!issueOpen) return;
    setState((s) => ({ ...s, deliveries: s.deliveries.map(d => d.id === issueOpen ? { ...d, status: "Issue", issueNotes: issue } : d) }));
    addActivity(`Delivery ${issueOpen} issue logged: ${issue}`);
    toast.error(`Issue logged on ${issueOpen}`);
    setIssueOpen(null); setIssue("");
  };

  return (
    <div>
      <PageHeader title="Delivery Management" description="Daily delivery manifests and driver assignments" />

      <Card>
        <CardHeader><CardTitle className="text-base">Today's Deliveries</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delivery</TableHead><TableHead>Client</TableHead><TableHead>Address</TableHead>
                <TableHead>Load</TableHead><TableHead>Driver</TableHead><TableHead>Status</TableHead>
                <TableHead>Notes</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.deliveries.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.id}</TableCell>
                  <TableCell>{client(d.salesOrderId)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[180px]">{address(d.salesOrderId)}</TableCell>
                  <TableCell className="text-sm">{load(d.salesOrderId)}</TableCell>
                  <TableCell><Input value={d.driver} onChange={(e) => updateDriver(d.id, e.target.value)} className="h-8 w-32" /></TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{d.issueNotes || "—"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {d.status === "Scheduled" && <Button size="sm" variant="outline" onClick={() => setStatus(d.id, "In Transit")}>Dispatch</Button>}
                    {d.status === "In Transit" && <Button size="sm" onClick={() => setStatus(d.id, "Delivered")}><Check className="h-3 w-3 mr-1" />Confirm</Button>}
                    {d.status !== "Delivered" && d.status !== "Issue" && (
                      <Button size="sm" variant="ghost" onClick={() => setIssueOpen(d.id)}><AlertTriangle className="h-3 w-3 mr-1" />Issue</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
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
