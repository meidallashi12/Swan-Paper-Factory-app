import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/quality")({ component: Quality });

function Quality() {
  const { state, setState, addActivity } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ batchId: "", inspector: "", result: "Passed" as "Passed"|"Failed"|"Needs Review", defects: "" });

  const submit = () => {
    if (!form.batchId || !form.inspector) { toast.error("Batch and inspector required"); return; }
    const id = "QI-" + (state.inspections.length + 1).toString().padStart(2, "0");
    setState((s) => ({
      ...s,
      inspections: [...s.inspections, { id, ...form, date: new Date().toISOString().slice(0, 10) }],
      batches: s.batches.map(b => b.id === form.batchId
        ? { ...b, status: form.result === "Failed" ? "Scrapped" : form.result === "Needs Review" ? "Needs Review" : b.status }
        : b),
    }));
    addActivity(`Inspection ${id} on ${form.batchId} → ${form.result}`);
    if (form.result === "Failed") toast.error(`Batch ${form.batchId} scrapped`);
    else toast.success(`Inspection ${id} recorded`);
    setOpen(false);
    setForm({ batchId: "", inspector: "", result: "Passed", defects: "" });
  };

  return (
    <div>
      <PageHeader title="Quality Inspection" description="Inspect production batches and record findings" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New Inspection</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Quality Inspection</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2"><Label>Batch</Label>
                <Select value={form.batchId} onValueChange={(v) => setForm({ ...form, batchId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                  <SelectContent>{state.batches.map(b => <SelectItem key={b.id} value={b.id}>{b.id} — {b.product}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Inspector</Label><Input value={form.inspector} onChange={(e) => setForm({ ...form, inspector: e.target.value })} /></div>
              <div><Label>Result</Label>
                <Select value={form.result} onValueChange={(v) => setForm({ ...form, result: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Passed","Failed","Needs Review"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Defect notes</Label><Textarea value={form.defects} onChange={(e) => setForm({ ...form, defects: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={submit}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>QI</TableHead><TableHead>Batch</TableHead><TableHead>Inspector</TableHead>
              <TableHead>Result</TableHead><TableHead>Defects</TableHead><TableHead>Date</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {state.inspections.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.id}</TableCell>
                  <TableCell>{i.batchId}</TableCell>
                  <TableCell>{i.inspector}</TableCell>
                  <TableCell><StatusBadge status={i.result} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[260px]">{i.defects || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{i.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
