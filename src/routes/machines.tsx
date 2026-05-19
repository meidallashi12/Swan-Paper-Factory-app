import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, MachineStatus } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/machines")({ component: Machines });

const ms: MachineStatus[] = ["Running", "Idle", "Down", "Under Maintenance"];

function Machines() {
  const { state, setState, addActivity } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ machineId: "M-01", start: "", end: "", reason: "", operator: "", shift: "Morning" });

  const setMachineStatus = (id: string, status: MachineStatus) => {
    setState((s) => ({ ...s, machines: s.machines.map(m => m.id === id ? { ...m, status } : m) }));
    addActivity(`Machine ${id} → ${status}`);
    toast.success(`${id} → ${status}`);
  };

  const submit = () => {
    if (!form.start || !form.end || !form.reason) { toast.error("Fill all fields"); return; }
    const id = "DT-" + (state.downtimes.length + 1).toString().padStart(2, "0");
    setState((s) => ({ ...s, downtimes: [...s.downtimes, { id, ...form } as any] }));
    addActivity(`Downtime ${id} logged on ${form.machineId}`);
    toast.success(`Downtime ${id} logged`);
    setOpen(false);
  };

  // simple utilization: 100% - (downtime count * 5%) per machine
  const utilization = (mid: string) => {
    const dt = state.downtimes.filter(d => d.machineId === mid).length;
    return Math.max(40, 100 - dt * 8);
  };

  return (
    <div>
      <PageHeader title="Machine Downtime" description="Machine status, downtime log, utilization" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Log Downtime</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Machine Downtime</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2"><Label>Machine</Label>
                <Select value={form.machineId} onValueChange={(v) => setForm({ ...form, machineId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{state.machines.map(m => <SelectItem key={m.id} value={m.id}>{m.id} — {m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Start</Label><Input type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></div>
              <div><Label>End</Label><Input type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></div>
              <div><Label>Operator</Label><Input value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} /></div>
              <div><Label>Shift</Label>
                <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Morning","Evening","Night"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Reason</Label><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={submit}>Log</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {state.machines.map(m => (
          <Card key={m.id}>
            <CardContent className="p-4">
              <div className="text-xs font-mono text-muted-foreground">{m.id}</div>
              <div className="font-medium text-sm mt-0.5">{m.name}</div>
              <div className="mt-2"><StatusBadge status={m.status} /></div>
              <div className="mt-2 text-xs text-muted-foreground">Util: <span className="font-medium text-foreground">{utilization(m.id)}%</span></div>
              <Select value={m.status} onValueChange={(v) => setMachineStatus(m.id, v as MachineStatus)}>
                <SelectTrigger className="h-7 mt-2 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{ms.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Downtime History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Machine</TableHead><TableHead>Start</TableHead>
              <TableHead>End</TableHead><TableHead>Reason</TableHead><TableHead>Operator</TableHead><TableHead>Shift</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {state.downtimes.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.id}</TableCell>
                  <TableCell>{d.machineId}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.start}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.end}</TableCell>
                  <TableCell>{d.reason}</TableCell>
                  <TableCell>{d.operator}</TableCell>
                  <TableCell>{d.shift}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
