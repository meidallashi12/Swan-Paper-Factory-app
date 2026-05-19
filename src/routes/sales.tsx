import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, SOStatus, productStock } from "@/lib/spf-store";
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
  const [form, setForm] = useState({
    CustomerID: "C-01", ProductID: "P-01", Quantity: 100, DeliveryDate: "",
  });

  const customerName = (id: string) => state.customers.find((c) => c.CustomerID === id)?.Name ?? id;
  const productName = (id: string) => state.products.find((p) => p.ProductID === id)?.Name ?? id;
  const productPrice = (id: string) => state.products.find((p) => p.ProductID === id)?.UnitPrice ?? 0;

  const advance = (id: string) => {
    const so = state.salesOrders.find((s) => s.SalesOrderID === id);
    if (!so) return;
    const idx = flow.indexOf(so.Status);
    if (idx < 0 || idx >= flow.length - 1) return;
    const next = flow[idx + 1];

    if (next === "Dispatched") {
      // verify stock for each line item
      const lines = state.containedIn.filter((c) => c.SalesOrderID === id);
      for (const ln of lines) {
        if (productStock(state, ln.ProductID) < ln.Quantity) {
          toast.error(`Not enough stock for ${productName(ln.ProductID)}`);
          return;
        }
      }
      setState((s) => ({
        ...s,
        salesOrders: s.salesOrders.map((x) => x.SalesOrderID === id ? { ...x, Status: next } : x),
        deliveries: [...s.deliveries, {
          DeliveryID: "DL-" + (200 + s.deliveries.length + 1),
          SalesOrderID: id,
          DriverID: s.drivers[0]?.DriverID ?? "",
          DispatchedDate: new Date().toISOString().slice(0, 10),
          DeliveredDate: "",
          DeliveryStatus: "Scheduled",
          VeichlePlate: "TBD",
        }],
      }));
      addActivity(`SO ${id} dispatched — stock deducted from finished goods`);
    } else {
      setState((s) => ({ ...s, salesOrders: s.salesOrders.map((x) => x.SalesOrderID === id ? { ...x, Status: next } : x) }));
      addActivity(`SO ${id} → ${next}`);
    }
    toast.success(`${id} → ${next}`);
  };

  const submit = () => {
    if (!form.DeliveryDate) { toast.error("Delivery date required"); return; }
    const id = "SO-" + (300 + state.salesOrders.length + 1);
    const total = form.Quantity * productPrice(form.ProductID);
    setState((s) => ({
      ...s,
      salesOrders: [...s.salesOrders, {
        SalesOrderID: id, CustomerID: form.CustomerID, Status: "Pending",
        TotalValueD: total, OrderDate: new Date().toISOString().slice(0, 10), DeliveryDate: form.DeliveryDate,
      }],
      containedIn: [...s.containedIn, { ProductID: form.ProductID, SalesOrderID: id, Quantity: Number(form.Quantity) }],
    }));
    addActivity(`SO ${id} placed for ${customerName(form.CustomerID)}`);
    toast.success(`${id} created (Rs. ${total.toLocaleString()})`);
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Sales Orders" description="Customer sales orders with finished-goods line items" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New Sales Order</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Sales Order</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2"><Label>Customer</Label>
                <Select value={form.CustomerID} onValueChange={(v) => setForm({ ...form, CustomerID: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{state.customers.map((c) => <SelectItem key={c.CustomerID} value={c.CustomerID}>{c.Name} ({c.Type})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Product</Label>
                <Select value={form.ProductID} onValueChange={(v) => setForm({ ...form, ProductID: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{state.products.map((p) => <SelectItem key={p.ProductID} value={p.ProductID}>{p.Name} (stock: {productStock(state, p.ProductID)})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Quantity</Label><Input type="number" value={form.Quantity} onChange={(e) => setForm({ ...form, Quantity: Number(e.target.value) })} /></div>
              <div><Label>Delivery Date</Label><Input type="date" value={form.DeliveryDate} onChange={(e) => setForm({ ...form, DeliveryDate: e.target.value })} /></div>
            </div>
            {productStock(state, form.ProductID) < form.Quantity && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> Not enough stock (available: {productStock(state, form.ProductID)})
              </div>
            )}
            <p className="text-sm text-muted-foreground">Estimated total: <span className="font-medium text-foreground">Rs. {(form.Quantity * productPrice(form.ProductID)).toLocaleString()}</span></p>
            <DialogFooter><Button onClick={submit}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Customers</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead>
              <TableHead>Attribute</TableHead><TableHead>Payment Terms</TableHead><TableHead>Contact</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {state.customers.map((c) => (
                <TableRow key={c.CustomerID}>
                  <TableCell className="font-mono text-xs">{c.CustomerID}</TableCell>
                  <TableCell className="font-medium">{c.Name}</TableCell>
                  <TableCell>{c.Type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.Attribute}</TableCell>
                  <TableCell>{c.PaymentTerms}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.ContactPhone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Sales Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SO</TableHead><TableHead>Customer</TableHead><TableHead>Line Items</TableHead>
                <TableHead>Order Date</TableHead><TableHead>Delivery</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.salesOrders.map((o) => {
                const lines = state.containedIn.filter((c) => c.SalesOrderID === o.SalesOrderID);
                const shortage = lines.some((ln) => productStock(state, ln.ProductID) < ln.Quantity)
                  && o.Status !== "Dispatched" && o.Status !== "Delivered";
                return (
                  <TableRow key={o.SalesOrderID}>
                    <TableCell className="font-medium">{o.SalesOrderID}</TableCell>
                    <TableCell>{customerName(o.CustomerID)}</TableCell>
                    <TableCell className="text-sm">
                      {lines.map((ln) => (
                        <div key={ln.ProductID}>{ln.Quantity} × {productName(ln.ProductID)}</div>
                      ))}
                      {shortage && <div className="text-xs text-destructive flex items-center gap-1 mt-0.5"><AlertCircle className="h-3 w-3" /> Stock shortage</div>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.OrderDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.DeliveryDate}</TableCell>
                    <TableCell className="text-right">Rs. {o.TotalValueD.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={o.Status} /></TableCell>
                    <TableCell className="text-right">
                      {o.Status !== "Delivered" && o.Status !== "Returned" && (
                        <Button size="sm" variant="outline" onClick={() => advance(o.SalesOrderID)}>
                          → {flow[flow.indexOf(o.Status) + 1] ?? "Done"}
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
