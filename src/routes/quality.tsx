import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, QCResult } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/quality")({ component: Quality });

function Quality() {
  const { state, setState, addActivity } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ BatchID: "", InspectorID: "E-04", Result: "Passed" as QCResult, DefectNotes: "" });

  const inspectors = state.employees.filter((e) => e.Role === "Quality Inspector");
  const inspectorName = (id: string) => state.employees.find((e) => e.EmployeeID === id)?.FullName ?? id;

  const submit = () => {
    if (!form.BatchID) { toast.error("Pick a batch"); return; }
    const id = "QC-" + (state.qcs.length + 1).toString().padStart(2, "0");
    const batch = state.batches.find((b) => b.BatchID === form.BatchID);
    setState((s) => ({
      ...s,
      qcs: [...s.qcs, {
        QualityCheckID: id, BatchID: form.BatchID,
        CheckedAt: new Date().toISOString().slice(0, 10),
        DefectNotes: form.DefectNotes, Result: form.Result,
      }],
      // failed inspections roll up to the parent production order
      prodOrders: batch ? s.prodOrders.map((p) =>
        p.ProdOrderID === batch.ProdOrderID
          ? { ...p, Status: form.Result === "Failed" ? "Scrapped" : form.Result === "Needs Review" ? "Needs Review" : p.Status }
          : p,
      ) : s.prodOrders,
    }));
    addActivity(`QC ${id} on ${form.BatchID} → ${form.Result} (by ${inspectorName(form.InspectorID)})`);
    if (form.Result === "Failed") toast.error(`Parent order scrapped`);
    else toast.success(`Inspection ${id} recorded`);
    setOpen(false);
    setForm({ BatchID: "", InspectorID: "E-04", Result: "Passed", DefectNotes: "" });
  };

  return (
    <div>
      <PageHeader title="Quality Inspection" description="QUALITYCHECK records against PRODUCTIONBATCH" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New Inspection</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Quality Check</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2"><Label>Batch</Label>
                <Select value={form.BatchID} onValueChange={(v) => setForm({ ...form, BatchID: v })}>
                  <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                  <SelectContent>{state.batches.map((b) => <SelectItem key={b.BatchID} value={b.BatchID}>{b.BatchID} ({b.ProdOrderID})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Inspector</Label>
                <Select value={form.InspectorID} onValueChange={(v) => setForm({ ...form, InspectorID: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{inspectors.map((i) => <SelectItem key={i.EmployeeID} value={i.EmployeeID}>{i.FullName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Result</Label>
                <Select value={form.Result} onValueChange={(v) => setForm({ ...form, Result: v as QCResult })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Passed", "Failed", "Needs Review"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Defect Notes</Label>
                <Textarea value={form.DefectNotes} onChange={(e) => setForm({ ...form, DefectNotes: e.target.value })} />
              </div>
            </div>
            <DialogFooter><Button onClick={submit}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>QualityCheckID</TableHead><TableHead>BatchID</TableHead>
              <TableHead>Result</TableHead><TableHead>Defects</TableHead><TableHead>CheckedAt</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {state.qcs.map((q) => (
                <TableRow key={q.QualityCheckID}>
                  <TableCell className="font-medium">{q.QualityCheckID}</TableCell>
                  <TableCell>{q.BatchID}</TableCell>
                  <TableCell><StatusBadge status={q.Result} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[260px]">{q.DefectNotes || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{q.CheckedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
