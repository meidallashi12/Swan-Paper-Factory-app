import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, ProdOrderStatus } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/production")({ component: Production });

const statuses: ProdOrderStatus[] = ["Planned", "In Progress", "Completed", "Partial", "Scrapped", "Needs Review"];

function Production() {
  const { state, setState, addActivity } = useStore();
  const [orderOpen, setOrderOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState<string | null>(null); // ProdOrderID

  const [orderForm, setOrderForm] = useState({
    ProductID: "P-01", ShiftID: "SH-01", TargetQuantity: 1000, ScheduledDate: new Date().toISOString().slice(0, 10),
    materials: [] as string[],
  });
  const [batchForm, setBatchForm] = useState({ EmployeeID: "E-01", QtyProduced: 0, WasteQty: 0, StartTime: "", EndTime: "" });

  const productName = (id: string) => state.products.find((p) => p.ProductID === id)?.Name ?? id;
  const shiftLabel = (id: string) => {
    const s = state.shifts.find((x) => x.ShiftID === id);
    return s ? `${s.ShiftName} (${s.StartTime}–${s.EndTime})` : id;
  };
  const employeeName = (id: string) => state.employees.find((e) => e.EmployeeID === id)?.FullName ?? id;
  const operators = state.employees.filter((e) => e.Role === "Machine Operator");

  const updateStatus = (id: string, Status: ProdOrderStatus) => {
    setState((s) => ({ ...s, prodOrders: s.prodOrders.map((p) => p.ProdOrderID === id ? { ...p, Status } : p) }));
    addActivity(`Order ${id} → ${Status}`);
    toast.success(`${id} → ${Status}`);
  };

  const submitOrder = () => {
    const id = "PO-" + (1000 + state.prodOrders.length + 1);
    setState((s) => ({
      ...s,
      prodOrders: [...s.prodOrders, {
        ProdOrderID: id,
        ProductID: orderForm.ProductID,
        ShiftID: orderForm.ShiftID,
        TargetQuantity: Number(orderForm.TargetQuantity),
        ScheduledDate: orderForm.ScheduledDate,
        Status: "Planned",
      }],
      usedIn: [...s.usedIn, ...orderForm.materials.map((MaterialID) => ({ MaterialID, ProdOrderID: id }))],
    }));
    addActivity(`Production Order ${id} planned (${productName(orderForm.ProductID)})`);
    toast.success(`${id} created`);
    setOrderOpen(false);
    setOrderForm({ ProductID: "P-01", ShiftID: "SH-01", TargetQuantity: 1000, ScheduledDate: new Date().toISOString().slice(0, 10), materials: [] });
  };

  const submitBatch = () => {
    if (!batchOpen) return;
    const id = "B-" + (5000 + state.batches.length + 1);
    setState((s) => ({
      ...s,
      batches: [...s.batches, {
        BatchID: id, ProdOrderID: batchOpen, EmployeeID: batchForm.EmployeeID,
        QtyProduced: Number(batchForm.QtyProduced), WasteQty: Number(batchForm.WasteQty),
        StartTime: batchForm.StartTime, EndTime: batchForm.EndTime,
      }],
      prodOrders: s.prodOrders.map((p) => p.ProdOrderID === batchOpen ? { ...p, Status: "In Progress" } : p),
    }));
    addActivity(`Batch ${id} produced ${batchForm.QtyProduced} units for ${batchOpen}`);
    toast.success(`Batch ${id} logged`);
    setBatchOpen(null);
    setBatchForm({ EmployeeID: "E-01", QtyProduced: 0, WasteQty: 0, StartTime: "", EndTime: "" });
  };

  return (
    <div>
      <PageHeader
        title="Production Management"
        description="Production orders, their batches, and traceability"
        actions={
          <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New Production Order</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Production Order</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="col-span-2"><Label>Product</Label>
                  <Select value={orderForm.ProductID} onValueChange={(v) => setOrderForm({ ...orderForm, ProductID: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{state.products.map((p) => <SelectItem key={p.ProductID} value={p.ProductID}>{p.Name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Shift</Label>
                  <Select value={orderForm.ShiftID} onValueChange={(v) => setOrderForm({ ...orderForm, ShiftID: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{state.shifts.map((s) => <SelectItem key={s.ShiftID} value={s.ShiftID}>{s.ShiftName} {s.ShiftDate}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Target Qty</Label>
                  <Input type="number" value={orderForm.TargetQuantity} onChange={(e) => setOrderForm({ ...orderForm, TargetQuantity: Number(e.target.value) })} />
                </div>
                <div className="col-span-2"><Label>Scheduled Date</Label>
                  <Input type="date" value={orderForm.ScheduledDate} onChange={(e) => setOrderForm({ ...orderForm, ScheduledDate: e.target.value })} />
                </div>
                <div className="col-span-2"><Label>Raw Materials Used</Label>
                  <div className="border rounded p-2 max-h-40 overflow-auto space-y-1">
                    {state.materials.map((m) => (
                      <label key={m.MaterialID} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={orderForm.materials.includes(m.MaterialID)}
                          onChange={(e) => setOrderForm({
                            ...orderForm,
                            materials: e.target.checked
                              ? [...orderForm.materials, m.MaterialID]
                              : orderForm.materials.filter((x) => x !== m.MaterialID),
                          })}
                        />
                        {m.MaterialID} — {m.Name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter><Button onClick={submitOrder}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-4">
        {state.prodOrders.map((po) => {
          const batches = state.batches.filter((b) => b.ProdOrderID === po.ProdOrderID);
          const produced = batches.reduce((a, b) => a + b.QtyProduced, 0);
          const materials = state.usedIn.filter((u) => u.ProdOrderID === po.ProdOrderID).map((u) => u.MaterialID);
          return (
            <Card key={po.ProdOrderID}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {po.ProdOrderID} <span className="text-muted-foreground font-normal">— {productName(po.ProductID)}</span>
                    </CardTitle>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1">
                      <span>{materials.join(", ") || "no materials"}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{shiftLabel(po.ShiftID)}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-foreground">{productName(po.ProductID)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{produced.toLocaleString()} / {po.TargetQuantity.toLocaleString()} units</span>
                    <Select value={po.Status} onValueChange={(v) => updateStatus(po.ProdOrderID, v as ProdOrderStatus)}>
                      <SelectTrigger className="h-8 w-[140px] border-0 p-0 bg-transparent"><StatusBadge status={po.Status} /></SelectTrigger>
                      <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => setBatchOpen(po.ProdOrderID)}><Plus className="h-3 w-3 mr-1" /> Add Batch</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Batch</TableHead><TableHead>Operator</TableHead><TableHead>Start</TableHead>
                    <TableHead>End</TableHead><TableHead className="text-right">Produced</TableHead><TableHead className="text-right">Waste</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {batches.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-4">No batches yet</TableCell></TableRow>
                    ) : batches.map((b) => (
                      <TableRow key={b.BatchID}>
                        <TableCell className="font-medium">{b.BatchID}</TableCell>
                        <TableCell>{employeeName(b.EmployeeID)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{b.StartTime || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{b.EndTime || "—"}</TableCell>
                        <TableCell className="text-right">{b.QtyProduced.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-destructive">{b.WasteQty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!batchOpen} onOpenChange={(o) => !o && setBatchOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Production Batch — {batchOpen}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2"><Label>Operator</Label>
              <Select value={batchForm.EmployeeID} onValueChange={(v) => setBatchForm({ ...batchForm, EmployeeID: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{operators.map((o) => <SelectItem key={o.EmployeeID} value={o.EmployeeID}>{o.FullName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Start Time</Label><Input type="datetime-local" value={batchForm.StartTime} onChange={(e) => setBatchForm({ ...batchForm, StartTime: e.target.value })} /></div>
            <div><Label>End Time</Label><Input type="datetime-local" value={batchForm.EndTime} onChange={(e) => setBatchForm({ ...batchForm, EndTime: e.target.value })} /></div>
            <div><Label>Qty Produced</Label><Input type="number" value={batchForm.QtyProduced} onChange={(e) => setBatchForm({ ...batchForm, QtyProduced: Number(e.target.value) })} /></div>
            <div><Label>Waste Qty</Label><Input type="number" value={batchForm.WasteQty} onChange={(e) => setBatchForm({ ...batchForm, WasteQty: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter><Button onClick={submitBatch}>Log Batch</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
