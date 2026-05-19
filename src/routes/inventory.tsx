import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, invStatus } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory")({ component: Inventory });

function Inventory() {
  const { state, setState } = useStore();
  const [filter, setFilter] = useState<"all" | "Raw Material" | "Finished Goods">("all");
  const [snapshot, setSnapshot] = useState<any[] | null>(null);

  const items = state.inventory.filter((i) => filter === "all" || i.category === filter);

  const update = (id: string, qty: number) => {
    setState((s) => ({ ...s, inventory: s.inventory.map((i) => i.id === id ? { ...i, quantity: qty } : i) }));
  };

  return (
    <div>
      <PageHeader
        title="Inventory Management"
        description="Raw materials and finished goods stock"
        actions={
          <Button variant="outline" onClick={() => { setSnapshot(state.inventory.map(i => ({ ...i, status: invStatus(i) }))); toast.success("Snapshot generated"); }}>
            <FileDown className="h-4 w-4 mr-1" /> Generate Snapshot
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Raw Material">Raw Materials</TabsTrigger>
          <TabsTrigger value="Finished Goods">Finished Goods</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>Name</TableHead>
                <TableHead>Category</TableHead><TableHead>Location</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => (
                <TableRow key={i.id} className={invStatus(i) === "Out of Stock" ? "bg-destructive/5" : invStatus(i) === "Low Stock" ? "bg-[color:var(--color-warning)]/10" : ""}>
                  <TableCell className="font-mono text-xs">{i.id}</TableCell>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{i.category}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{i.location}</TableCell>
                  <TableCell className="text-right">
                    <Input type="number" value={i.quantity} onChange={(e) => update(i.id, Number(e.target.value))} className="w-24 ml-auto text-right" />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{i.minStock}</TableCell>
                  <TableCell><StatusBadge status={invStatus(i)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {snapshot && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">Inventory Snapshot — {new Date().toLocaleString()}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSnapshot(null)}>Close</Button>
            </div>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-72">
{JSON.stringify(snapshot, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
