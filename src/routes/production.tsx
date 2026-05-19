import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, BatchStatus } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/production")({ component: Production });

const statuses: BatchStatus[] = ["Planned", "In Progress", "Completed", "Partial", "Scrapped", "Needs Review"];

function Production() {
  const { state, setState, addActivity } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    product: "", machine: "M-01", shift: "Morning", operator: "", rawLot: "", outputQty: 0,
  });

  const updateStatus = (id: string, status: BatchStatus) => {
    setState((s) => ({ ...s, batches: s.batches.map((b) => b.id === id ? { ...b, status } : b) }));
    addActivity(`Batch ${id} status → ${status}`);
    toast.success(`Batch ${id} → ${status}`);
  };

  const addNote = (id: string, note: string) => {
    setState((s) => ({ ...s, batches: s.batches.map((b) => b.id === id ? { ...b, notes: note } : b) }));
  };

  const submit = () => {
    if (!form.product || !form.operator) { toast.error("Product and Operator are required"); return; }
    const id = "B-" + (1000 + state.batches.length + 1);
    setState((s) => ({
      ...s,
      batches: [...s.batches, { id, ...form, outputQty: Number(form.outputQty), status: "Planned", notes: "", date: new Date().toISOString().slice(0, 10) } as any],
    }));
    addActivity(`New batch ${id} planned (${form.product})`);
    toast.success(`Batch ${id} created`);
    setOpen(false);
    setForm({ product: "", machine: "M-01", shift: "Morning", operator: "", rawLot: "", outputQty: 0 });
  };

  return (
    <div>
      <PageHeader
        title="Production Management"
        description="Plan, track and update production batches"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New Batch</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Production Batch</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="col-span-2"><Label>Product</Label>
                  <Select value={form.product} onValueChange={(v) => setForm({ ...form, product: v })}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {state.inventory.filter(i => i.category === "Finished Goods").map(i =>
                        <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Machine</Label>
                  <Select value={form.machine} onValueChange={(v) => setForm({ ...form, machine: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{state.machines.map(m => <SelectItem key={m.id} value={m.id}>{m.id} — {m.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Shift</Label>
                  <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["Morning","Evening","Night"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Operator</Label>
                  <Input value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} placeholder="Operator name" />
                </div>
                <div><Label>Raw Material Lot</Label>
                  <Input value={form.rawLot} onChange={(e) => setForm({ ...form, rawLot: e.target.value })} placeholder="RL-..." />
                </div>
                <div className="col-span-2"><Label>Planned Output Qty</Label>
                  <Input type="number" value={form.outputQty} onChange={(e) => setForm({ ...form, outputQty: Number(e.target.value) })} />
                </div>
              </div>
              <DialogFooter><Button onClick={submit}>Create Batch</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead><TableHead>Product</TableHead>
                <TableHead>Traceability</TableHead><TableHead>Operator</TableHead>
                <TableHead className="text-right">Output</TableHead>
                <TableHead>Status</TableHead><TableHead>Notes</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.id}</TableCell>
                  <TableCell>{b.product}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span>{b.rawLot}</span><ArrowRight className="h-3 w-3" />
                      <span>{b.machine}</span><ArrowRight className="h-3 w-3" />
                      <span>{b.shift}</span><ArrowRight className="h-3 w-3" />
                      <span className="text-foreground">{b.product}</span>
                    </div>
                  </TableCell>
                  <TableCell>{b.operator}</TableCell>
                  <TableCell className="text-right">{b.outputQty.toLocaleString()}</TableCell>
                  <TableCell>
                    <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v as BatchStatus)}>
                      <SelectTrigger className="h-8 w-[140px] border-0 p-0 bg-transparent"><StatusBadge status={b.status} /></SelectTrigger>
                      <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <Textarea defaultValue={b.notes} onBlur={(e) => addNote(b.id, e.target.value)} className="min-h-[36px] text-xs" placeholder="Operator notes…" />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
