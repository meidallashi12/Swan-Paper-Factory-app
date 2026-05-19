import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, PackageCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/procurement")({ component: Procurement });

// Note: the schema has no PurchaseOrder entity, so this page manages SUPPLIER + RAWMATERIAL
// and provides a "Record Receipt" action that writes a new INVENTORYRECORD.
function Procurement() {
  const { state, setState, addActivity } = useStore();
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const [supForm, setSupForm] = useState({ CompanyName: "", PaymentTerms: "Net 30", Phone: "", Country: "Pakistan" });
  const [recForm, setRecForm] = useState({ MaterialID: "M-01", QtyOnHand: 100, WarehouseLoc: "WH-A" });

  const supplierName = (id: string) => state.suppliers.find((s) => s.SupplierID === id)?.CompanyName ?? id;

  const addSupplier = () => {
    if (!supForm.CompanyName) { toast.error("Company name required"); return; }
    const id = "S-" + (state.suppliers.length + 1).toString().padStart(2, "0");
    setState((s) => ({ ...s, suppliers: [...s.suppliers, { SupplierID: id, ...supForm }] }));
    addActivity(`Supplier ${supForm.CompanyName} added`);
    toast.success(`${id} added`);
    setSupplierOpen(false);
  };

  const recordReceipt = () => {
    const id = "IR-" + (state.inventory.length + 1).toString().padStart(2, "0");
    const today = new Date().toISOString().slice(0, 10);
    // increment qty for existing record at same location/material, else insert new row
    setState((s) => {
      const existing = s.inventory.find((i) => i.MaterialID === recForm.MaterialID && i.WarehouseLoc === recForm.WarehouseLoc);
      if (existing) {
        return {
          ...s,
          inventory: s.inventory.map((i) => i.InvRecordID === existing.InvRecordID
            ? { ...i, QtyOnHand: i.QtyOnHand + Number(recForm.QtyOnHand), LastUpdated: today } : i),
        };
      }
      return { ...s, inventory: [...s.inventory, { InvRecordID: id, ...recForm, QtyOnHand: Number(recForm.QtyOnHand), LastUpdated: today }] };
    });
    addActivity(`Received ${recForm.QtyOnHand} of ${recForm.MaterialID} at ${recForm.WarehouseLoc}`);
    toast.success(`Stock increased`);
    setReceiptOpen(false);
  };

  return (
    <div>
      <PageHeader title="Procurement" description="Suppliers, raw materials, and stock receipts" actions={
        <div className="flex gap-2">
          <Dialog open={supplierOpen} onOpenChange={setSupplierOpen}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-1" /> Add Supplier</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Supplier</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="col-span-2"><Label>Company Name</Label><Input value={supForm.CompanyName} onChange={(e) => setSupForm({ ...supForm, CompanyName: e.target.value })} /></div>
                <div><Label>Payment Terms</Label><Input value={supForm.PaymentTerms} onChange={(e) => setSupForm({ ...supForm, PaymentTerms: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={supForm.Phone} onChange={(e) => setSupForm({ ...supForm, Phone: e.target.value })} /></div>
                <div className="col-span-2"><Label>Country</Label><Input value={supForm.Country} onChange={(e) => setSupForm({ ...supForm, Country: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={addSupplier}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
            <DialogTrigger asChild><Button><PackageCheck className="h-4 w-4 mr-1" /> Record Receipt</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Material Receipt</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="col-span-2"><Label>Material</Label>
                  <Select value={recForm.MaterialID} onValueChange={(v) => setRecForm({ ...recForm, MaterialID: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{state.materials.map((m) => <SelectItem key={m.MaterialID} value={m.MaterialID}>{m.Name} ({supplierName(m.SupplierID)})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Quantity</Label><Input type="number" value={recForm.QtyOnHand} onChange={(e) => setRecForm({ ...recForm, QtyOnHand: Number(e.target.value) })} /></div>
                <div><Label>Warehouse</Label>
                  <Select value={recForm.WarehouseLoc} onValueChange={(v) => setRecForm({ ...recForm, WarehouseLoc: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["WH-A","WH-B","WH-C"].map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button onClick={recordReceipt}>Record</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      } />

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Suppliers</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>SupplierID</TableHead><TableHead>Company</TableHead>
              <TableHead>Country</TableHead><TableHead>Phone</TableHead><TableHead>Payment Terms</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {state.suppliers.map((s) => (
                <TableRow key={s.SupplierID}>
                  <TableCell className="font-mono text-xs">{s.SupplierID}</TableCell>
                  <TableCell className="font-medium">{s.CompanyName}</TableCell>
                  <TableCell>{s.Country}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.Phone}</TableCell>
                  <TableCell>{s.PaymentTerms}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Raw Materials</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>MaterialID</TableHead><TableHead>Name</TableHead>
              <TableHead>Supplier</TableHead><TableHead>UoM</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Reorder</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {state.materials.map((m) => (
                <TableRow key={m.MaterialID}>
                  <TableCell className="font-mono text-xs">{m.MaterialID}</TableCell>
                  <TableCell className="font-medium">{m.Name}</TableCell>
                  <TableCell>{supplierName(m.SupplierID)}</TableCell>
                  <TableCell>{m.UnitOfMeasure}</TableCell>
                  <TableCell className="text-right">Rs. {m.UnitCost}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{m.ReorderThreshhold}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
