import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, SOStatus } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sales")({ component: Sales });

const flow: SOStatus[] = ["Pending", "Confirmed", "Packed", "Dispatched", "Delivered"];

function Sales() {
  const { state, setState, addActivity } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ clientId: "C-01", itemId: "I-FG-01", quantity: 100, deliveryDate: "" });

  const clientName = (id: string) => state.clients.find(c => c.id === id)?.name ?? id;
  const itemName = (id: string) => state.inventory.find(i => i.id === id)?.name ?? id;

  const advance = (id: string) => {
    const so = state.sos.find(s => s.id === id);
    if (!so) return;
    const idx = flow.indexOf(so.status);
    if (idx < 0 || idx >= flow.length - 1) return;
    const next = flow[idx + 1];

    // dispatch reduces stock
    if (next === "Dispatched") {
      const item = state.inventory.find(i => i.id === so.itemId);
      if (!item || item.quantity < so.quantity) { toast.error("Not enough finished goods stock"); return; }
      setState((s) => ({
        ...s,
        sos: s.sos.map(x => x.id === id ? { ...x, status: next } : x),
        inventory: s.inventory.map(i => i.id === so.itemId ? { ...i, quantity: i.quantity - so.quantity } : i),
        deliveries: [...s.deliveries, { id: "D-" + (200 + s.deliveries.length + 1), salesOrderId: id, driver: "Unassigned", status: "Scheduled", issueNotes: "", date: so.deliveryDate }],
      }));
      addActivity(`SO ${id} dispatched — ${so.quantity} units, stock reduced`);
    } else {
      setState((s) => ({ ...s, sos: s.sos.map(x => x.id === id ? { ...x, status: next } : x) }));
      addActivity(`SO ${id} → ${next}`);
    }
    toast.success(`${id} → ${next}`);
  };

  const assign = (id: string, batchId: string) => {
    setState((s) => ({ ...s, sos: s.sos.map(x => x.id === id ? { ...x, assignedBatch: batchId } : x) }));
    toast.success(`Assigned ${batchId} to ${id}`);
  };

  const submit = () => {
    if (!form.deliveryDate) { toast.error("Delivery date required"); return; }
    const id = "SO-" + (300 + state.sos.length + 1);
    setState((s) => ({ ...s, sos: [...s.sos, { id, ...form, status: "Pending" as SOStatus }] }));
    addActivity(`SO ${id} placed for ${clientName(form.clientId)}`);
    toast.success(`${id} created`);
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Sales Orders" description="Customer orders and finished goods allocation" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New Sales Order</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Sales Order</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2"><Label>Client</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{state.clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Product</Label>
                <Select value={form.itemId} onValueChange={(v) => setForm({ ...form, itemId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{state.inventory.filter(i => i.category === "Finished Goods").map(i => <SelectItem key={i.id} value={i.id}>{i.name} (stock: {i.quantity})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
              <div><Label>Delivery Date</Label><Input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} /></div>
            </div>
            {(() => {
              const stock = state.inventory.find(i => i.id === form.itemId)?.quantity ?? 0;
              return stock < form.quantity ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" /> Not enough stock ({stock} available)
                </div>
              ) : null;
            })()}
            <DialogFooter><Button onClick={submit}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {state.clients.map(c => (
          <Card key={c.id}><CardHeader className="pb-2"><CardTitle className="text-base">{c.name}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{c.address}</CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Sales Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SO</TableHead><TableHead>Client</TableHead><TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead><TableHead>Delivery</TableHead>
                <TableHead>Assigned Batch</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.sos.map(o => {
                const stock = state.inventory.find(i => i.id === o.itemId)?.quantity ?? 0;
                const lowStock = stock < o.quantity && o.status !== "Delivered" && o.status !== "Dispatched";
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell>{clientName(o.clientId)}</TableCell>
                    <TableCell>
                      {itemName(o.itemId)}
                      {lowStock && <div className="text-xs text-destructive flex items-center gap-1 mt-0.5"><AlertCircle className="h-3 w-3" />Stock: {stock}</div>}
                    </TableCell>
                    <TableCell className="text-right">{o.quantity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.deliveryDate}</TableCell>
                    <TableCell>
                      <Select value={o.assignedBatch ?? ""} onValueChange={(v) => assign(o.id, v)}>
                        <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Assign…" /></SelectTrigger>
                        <SelectContent>
                          {state.batches.filter(b => b.status === "Completed").map(b => <SelectItem key={b.id} value={b.id}>{b.id}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell className="text-right">
                      {o.status !== "Delivered" && o.status !== "Returned" && (
                        <Button size="sm" variant="outline" onClick={() => advance(o.id)}>
                          → {flow[flow.indexOf(o.status) + 1] ?? "Done"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
