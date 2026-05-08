import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getNotes, type Note } from "@/lib/users-data";

export const Route = createFileRoute("/_admin/users/$id/notes")({
  component: NotesTab,
});

const TAG_TONE: Record<NonNullable<Note["tag"]>, string> = {
  fraud: "bg-destructive/10 text-destructive border-destructive/30",
  support: "bg-primary/10 text-primary border-primary/30",
  vip: "bg-gold/15 text-gold-foreground border-gold/30",
  compliance: "bg-warning/20 text-warning-foreground border-warning/40",
};

function NotesTab() {
  const { id } = Route.useParams();
  const initial = getNotes(id);
  const [notes, setNotes] = useState<Note[]>(initial);
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<NonNullable<Note["tag"]>>("support");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="shadow-card lg:col-span-1">
        <CardHeader className="pb-2"><CardTitle className="text-base">New note</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={tag} onValueChange={(v) => setTag(v as NonNullable<Note["tag"]>)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="fraud">Fraud</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>
          <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add an internal note…" />
          <Button
            disabled={body.trim().length < 4}
            onClick={() => {
              setNotes((prev) => [{ id: `n_${Date.now()}`, author: "You", body: body.trim(), at: "just now", tag }, ...prev]);
              setBody("");
              toast.success("Note added.");
            }}
            className="w-full"
          >
            Save note
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card lg:col-span-2">
        <CardHeader className="pb-2"><CardTitle className="text-base">{notes.length} notes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="p-3 rounded-md border bg-muted/20">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{n.author}</span>
                  {n.tag && <Badge variant="outline" className={`text-[10px] capitalize ${TAG_TONE[n.tag]}`}>{n.tag}</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">{n.at}</span>
              </div>
              <div className="text-sm text-foreground/90">{n.body}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
