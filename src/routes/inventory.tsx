import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, rmStockState, productStock } from "@/lib/spf-store";
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
  const [tab, setTab] = useState<"rm" | "fg">("rm");
  const [snapshot, setSnapshot] = useState<any[] | null>(null);

  const updateQty = (InvRecordID: string, QtyOnHand: number) => {
    setState((s) => ({
      ...s,
      inventory: s.inventory.map((i) =>
        i.InvRecordID === InvRecordID ? { ...i, QtyOnHand, LastUpdated: new Date().toISOString().slice(0, 10) } : i,
      ),
    }));
  };

  const materialFor = (id: string) => state.materials.find((m) => m.MaterialID === id);

  const snapshotRows = state.inventory.map((ir) => {
    const m = materialFor(ir.MaterialID);
    return {
      InvRecordID: ir.InvRecordID, MaterialID: ir.MaterialID, Name: m?.Name, QtyOnHand: ir.QtyOnHand,
      Reorder: m?.ReorderThreshhold, WarehouseLoc: ir.WarehouseLoc, LastUpdated: ir.LastUpdated,
      Status: rmStockState(ir.QtyOnHand, m?.ReorderThreshhold ?? 0),
    };
  });

  return (
    <div>
      <PageHeader
        title="Inventory Management"
        description="Raw material inventory records (per schema) and derived finished-goods stock"
        actions={
          <Button variant="outline" onClick={() => { setSnapshot(snapshotRows); toast.success("Snapshot generated"); }}>
            <FileDown className="h-4 w-4 mr-1" /> Generate Snapshot
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="rm">Raw Materials (INVENTORYRECORD)</TabsTrigger>
          <TabsTrigger value="fg">Finished Goods (derived from batches)</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "rm" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>InvRecordID</TableHead><TableHead>Material</TableHead>
                  <TableHead>Warehouse</TableHead><TableHead>UoM</TableHead>
                  <TableHead className="text-right">QtyOnHand</TableHead>
                  <TableHead className="text-right">Reorder</TableHead>
                  <TableHead>LastUpdated</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.inventory.map((ir) => {
                  const m = materialFor(ir.MaterialID);
                  const status = rmStockState(ir.QtyOnHand, m?.ReorderThreshhold ?? 0);
                  return (
                    <TableRow key={ir.InvRecordID} className={status === "Out of Stock" ? "bg-destructive/5" : status === "Low Stock" ? "bg-[color:var(--color-warning)]/10" : ""}>
                      <TableCell className="font-mono text-xs">{ir.InvRecordID}</TableCell>
                      <TableCell className="font-medium">{m?.Name ?? ir.MaterialID} <span className="text-xs text-muted-foreground">({ir.MaterialID})</span></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ir.WarehouseLoc}</TableCell>
                      <TableCell className="text-sm">{m?.UnitOfMeasure ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Input type="number" value={ir.QtyOnHand} onChange={(e) => updateQty(ir.InvRecordID, Number(e.target.value))} className="w-24 ml-auto text-right" />
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{m?.ReorderThreshhold ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ir.LastUpdated}</TableCell>
                      <TableCell><StatusBadge status={status} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ProductID</TableHead><TableHead>Name</TableHead>
                  <TableHead>Type</TableHead><TableHead>Sheet Size</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Available Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.products.map((p) => {
                  const stock = productStock(state, p.ProductID);
                  return (
                    <TableRow key={p.ProductID}>
                      <TableCell className="font-mono text-xs">{p.ProductID}</TableCell>
                      <TableCell className="font-medium">{p.Name}</TableCell>
                      <TableCell>{p.Type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.SheetSize}</TableCell>
                      <TableCell className="text-right">Rs. {p.UnitPrice}</TableCell>
                      <TableCell className={`text-right font-medium ${stock <= 0 ? "text-destructive" : ""}`}>{stock.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
