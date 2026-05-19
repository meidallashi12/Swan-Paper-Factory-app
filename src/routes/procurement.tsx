import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, POStatus } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, PackageCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/procurement")({ component: Procurement });

function Procurement() {
  const { state, setState, addActivity } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplierId: "S-01", itemId: "I-RM-01", quantity: 100, expectedDate: "" });

  const supplier = (id: string) => state.suppliers.find(s => s.id === id)?.name ?? id;
  const item = (id: string) => state.inventory.find(i => i.id === id)?.name ?? id;

  const setStatus = (id: string, status: POStatus) => {
    setState((s) => ({ ...s, pos: s.pos.map(p => p.id === id ? { ...p, status } : p) }));
    addActivity(`PO ${id} → ${status}`);
    toast.success(`${id} → ${status}`);
  };

  const receive = (id: string) => {
    const po = state.pos.find(p => p.id === id);
    if (!po) return;
    setState((s) => ({
      ...s,
      pos: s.pos.map(p => p.id === id ? { ...p, status: "Received" as POStatus } : p),
      inventory: s.inventory.map(i => i.id === po.itemId ? { ...i, quantity: i.quantity + po.quantity } : i),
    }));
    addActivity(`Received ${po.quantity} of ${item(po.itemId)} from ${supplier(po.supplierId)}`);
    toast.success(`Received ${po.quantity} units — inventory updated`);
  };

  const submit = () => {
    if (!form.expectedDate) { toast.error("Pick expected date"); return; }
    const id = "PO-" + (500 + state.pos.length + 1);
    setState((s) => ({ ...s, pos: [...s.pos, { id, ...form, status: "Draft" as POStatus }] }));
    addActivity(`PO ${id} drafted`);
    toast.success(`${id} created as Draft`);
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Procurement & Purchase Orders" description="Suppliers and raw material purchasing" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New PO</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2"><Label>Supplier</Label>
                <Select value={form.supplierId} onValueChange={(v) => setForm({ ...form, supplierId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{state.suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Material</Label>
                <Select value={form.itemId} onValueChange={(v) => setForm({ ...form, itemId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{state.inventory.filter(i => i.category === "Raw Material").map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
              <div><Label>Expected Date</Label><Input type="date" value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={submit}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {state.suppliers.map(s => (
          <Card key={s.id}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{s.name}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{s.contact}</p>
              <p className="mt-1">Rating: <span className="text-foreground font-medium">{s.rating} / 5</span></p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Purchase Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO</TableHead><TableHead>Supplier</TableHead><TableHead>Material</TableHead>
                <TableHead className="text-right">Qty</TableHead><TableHead>Expected</TableHead>
                <TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.pos.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>{supplier(p.supplierId)}</TableCell>
                  <TableCell>{item(p.itemId)}</TableCell>
                  <TableCell className="text-right">{p.quantity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.expectedDate}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-right space-x-1">
                    {p.status === "Pending Approval" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "Approved")}><Check className="h-3 w-3 mr-1" />Approve</Button>
                    )}
                    {p.status === "Draft" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "Pending Approval")}>Submit</Button>
                    )}
                    {p.status === "Approved" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "Ordered")}>Mark Ordered</Button>
                    )}
                    {(p.status === "Ordered" || p.status === "Partially Received") && (
                      <Button size="sm" onClick={() => receive(p.id)}><PackageCheck className="h-3 w-3 mr-1" />Receive</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
