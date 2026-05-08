import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getNumbers } from "@/lib/users-data";

export const Route = createFileRoute("/_admin/users/$id/numbers")({
  component: NumbersTab,
});

function NumbersTab() {
  const { id } = Route.useParams();
  const numbers = getNumbers(id);
  return (
    <Card className="shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Number</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Leased</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {numbers.map((n) => (
            <TableRow key={n.id}>
              <TableCell className="font-mono text-sm">{n.number}</TableCell>
              <TableCell>{n.country}</TableCell>
              <TableCell>{n.service}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-xs capitalize ${n.status === "active" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground"}`}>
                  {n.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{new Date(n.leasedAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
