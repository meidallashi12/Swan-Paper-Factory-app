import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/machines")({ component: ShiftsView });

// Schema has no Machine entity. This page now shows SHIFTs as the production-line scheduling resource.
function ShiftsView() {
  const { state } = useStore();

  return (
    <div>
      <PageHeader title="Shifts & Scheduling" description="Shift definitions and the orders/employees scheduled into each shift" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {state.shifts.map((sh) => {
          const orders = state.prodOrders.filter((p) => p.ShiftID === sh.ShiftID);
          const employees = state.employees.filter((e) => e.ShiftID === sh.ShiftID);
          return (
            <Card key={sh.ShiftID}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{sh.ShiftName} <span className="text-muted-foreground font-normal text-sm">— {sh.StartTime}–{sh.EndTime}</span></CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">{sh.ShiftDate} · {sh.ShiftID}</p>
                <div className="text-sm">
                  <p className="font-medium mt-2">Production Orders ({orders.length})</p>
                  <ul className="text-muted-foreground">{orders.map((o) => <li key={o.ProdOrderID}>• {o.ProdOrderID} — {state.products.find(p => p.ProductID === o.ProductID)?.Name}</li>)}</ul>
                  <p className="font-medium mt-3">Employees ({employees.length})</p>
                  <ul className="text-muted-foreground">{employees.map((e) => <li key={e.EmployeeID}>• {e.FullName} ({e.Role})</li>)}</ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">SHIFT table</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>ShiftID</TableHead><TableHead>Name</TableHead><TableHead>Date</TableHead>
              <TableHead>Start</TableHead><TableHead>End</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {state.shifts.map((s) => (
                <TableRow key={s.ShiftID}>
                  <TableCell className="font-mono text-xs">{s.ShiftID}</TableCell>
                  <TableCell className="font-medium">{s.ShiftName}</TableCell>
                  <TableCell>{s.ShiftDate}</TableCell>
                  <TableCell>{s.StartTime}</TableCell>
                  <TableCell>{s.EndTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
