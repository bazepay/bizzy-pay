import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Smartphone } from "lucide-react";
import { getEsims } from "@/lib/users-data";

export const Route = createFileRoute("/_admin/users/$id/esims")({
  component: EsimsTab,
});

function EsimsTab() {
  const { id } = Route.useParams();
  const esims = getEsims(id);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {esims.map((e) => {
        const pct = Math.min(100, (e.usedGb / e.dataGb) * 100);
        return (
          <Card key={e.id} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                {e.country}
              </CardTitle>
              <Badge variant="outline" className={`text-xs capitalize ${e.status === "active" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground"}`}>
                {e.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">{e.plan}</div>
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{e.usedGb} GB used</span>
                  <span>{e.dataGb} GB total</span>
                </div>
                <Progress value={pct} />
              </div>
              <div className="text-xs text-muted-foreground">Activated {new Date(e.activatedAt).toLocaleDateString()}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
