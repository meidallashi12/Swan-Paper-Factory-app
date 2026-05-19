import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/spf-store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/workforce")({ component: Workforce });

function Workforce() {
  const { state } = useStore();
  const shifts = ["Morning", "Evening", "Night"] as const;

  return (
    <div>
      <PageHeader title="Workforce & Shifts" description="Operator assignments by shift and machine" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {shifts.map(sh => (
          <Card key={sh}>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">{sh} Shift <Badge variant="secondary">{state.operators.filter(o => o.shift === sh).length}</Badge></CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {state.operators.filter(o => o.shift === sh).map(o => (
                  <li key={o.id} className="flex justify-between border-b last:border-0 pb-1">
                    <span>{o.name}</span>
                    <span className="text-muted-foreground">{o.machine}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Operator → Machine → Batch</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Operator</TableHead><TableHead>Shift</TableHead><TableHead>Machine</TableHead><TableHead>Active Batches</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {state.operators.map(o => {
                const batches = state.batches.filter(b => b.operator === o.name);
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell>{o.shift}</TableCell>
                    <TableCell>{o.machine}</TableCell>
                    <TableCell className="text-sm">
                      {batches.length === 0 ? <span className="text-muted-foreground">—</span> :
                        batches.map(b => b.id).join(", ")}
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
