import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Snowflake, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getCards } from "@/lib/users-data";

export const Route = createFileRoute("/_admin/users/$id/cards")({
  component: CardsTab,
});

function CardsTab() {
  const { id } = Route.useParams();
  const cards = getCards(id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((c) => (
        <Card key={c.id} className="shadow-card overflow-hidden">
          <div className="bg-gradient-primary p-5 text-primary-foreground">
            <div className="flex items-center justify-between">
              <CreditCard className="h-6 w-6" />
              <span className="font-display text-sm opacity-90">{c.brand}</span>
            </div>
            <div className="font-mono text-lg mt-6 tracking-widest">•••• •••• •••• {c.last4}</div>
            <div className="text-xs opacity-80 mt-1">Issued {new Date(c.issuedAt).toLocaleDateString()}</div>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={`capitalize text-xs ${c.status === "active" ? "bg-success/15 text-success border-success/30" : c.status === "frozen" ? "bg-warning/20 text-warning-foreground border-warning/40" : "bg-muted text-muted-foreground"}`}>
                {c.status}
              </Badge>
              <span className="font-mono text-xs">{c.id}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Balance</div>
                <div className="font-mono">${c.balanceUsd.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Spend (30d)</div>
                <div className="font-mono">${c.spendUsd.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success(`Card ${c.last4} ${c.status === "frozen" ? "unfrozen" : "frozen"}.`)}>
                <Snowflake className="h-3.5 w-3.5 mr-1.5" />
                {c.status === "frozen" ? "Unfreeze" : "Freeze"}
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-destructive" onClick={() => toast.success(`Card ${c.last4} terminated.`)}>
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Terminate
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
