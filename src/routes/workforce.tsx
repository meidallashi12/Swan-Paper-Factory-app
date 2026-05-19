import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/workforce")({ component: Workforce });

function Workforce() {
  const { state } = useStore();

  return (
    <div>
      <PageHeader title="Workforce & Shifts" description="EMPLOYEE records grouped by SHIFT" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {state.shifts.map((sh) => {
          const team = state.employees.filter((e) => e.ShiftID === sh.ShiftID);
          return (
            <Card key={sh.ShiftID}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {sh.ShiftName} <Badge variant="secondary">{team.length}</Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">{sh.StartTime}–{sh.EndTime} · {sh.ShiftDate}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {team.map((e) => (
                    <li key={e.EmployeeID} className="flex justify-between border-b last:border-0 pb-1">
                      <span>{e.FullName}</span>
                      <span className="text-muted-foreground text-xs">{e.Role}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">All Employees</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>EmployeeID</TableHead><TableHead>Full Name</TableHead>
              <TableHead>Role</TableHead><TableHead>Shift</TableHead>
              <TableHead>Contact</TableHead><TableHead>Active Batches</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {state.employees.map((e) => {
                const sh = state.shifts.find((s) => s.ShiftID === e.ShiftID);
                const batches = state.batches.filter((b) => b.EmployeeID === e.EmployeeID);
                return (
                  <TableRow key={e.EmployeeID}>
                    <TableCell className="font-mono text-xs">{e.EmployeeID}</TableCell>
                    <TableCell className="font-medium">{e.FullName}</TableCell>
                    <TableCell>{e.Role}</TableCell>
                    <TableCell>{sh ? `${sh.ShiftName} (${sh.StartTime}–${sh.EndTime})` : e.ShiftID}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.ContactPhone}</TableCell>
                    <TableCell className="text-sm">
                      {batches.length === 0 ? <span className="text-muted-foreground">—</span> : batches.map((b) => b.BatchID).join(", ")}
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
