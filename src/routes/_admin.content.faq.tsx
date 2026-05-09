import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Plus, Pencil, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { faqs as initial, fmtRelative, type Faq } from "@/lib/content-data";

export const Route = createFileRoute("/_admin/content/faq")({
  component: FaqPage,
});

const CATEGORIES: Faq["category"][] = ["Account", "Wallet", "Cards", "Bill Pay", "Security", "Compliance"];

type Draft = { question: string; answer: string; category: Faq["category"]; status: Faq["status"] };
const empty: Draft = { question: "", answer: "", category: "Account", status: "draft" };

function FaqPage() {
  const [items, setItems] = useState<Faq[]>(initial);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | Faq["category"]>("all");
  const [editing, setEditing] = useState<Faq | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(empty);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((f) => {
      if (cat !== "all" && f.category !== cat) return false;
      if (!term) return true;
      return f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term);
    });
  }, [items, q, cat]);

  const grouped = useMemo(() => {
    const map = new Map<Faq["category"], Faq[]>();
    rows.forEach((f) => {
      if (!map.has(f.category)) map.set(f.category, []);
      map.get(f.category)!.push(f);
    });
    return Array.from(map.entries());
  }, [rows]);

  const openCreate = () => { setDraft(empty); setCreating(true); };
  const openEdit = (f: Faq) => {
    setEditing(f);
    setDraft({ question: f.question, answer: f.answer, category: f.category, status: f.status });
  };
  const close = () => { setCreating(false); setEditing(null); };

  const save = () => {
    if (!draft.question.trim() || !draft.answer.trim()) { toast.error("Question and answer are required"); return; }
    if (editing) {
      setItems((prev) => prev.map((f) => (f.id === editing.id ? { ...f, ...draft, updatedAt: new Date().toISOString() } : f)));
      toast.success("FAQ updated");
    } else {
      const id = `faq_${String(100 + items.length).padStart(3, "0")}`;
      setItems((prev) => [{ id, ...draft, helpful: 0, notHelpful: 0, updatedAt: new Date().toISOString() }, ...prev]);
      toast.success("FAQ created");
    }
    close();
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((f) => f.id !== id));
    toast.success("FAQ deleted");
  };

  const open = creating || !!editing;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search FAQ…" className="pl-8" />
        </div>
        <Select value={cat} onValueChange={(v) => setCat(v as typeof cat)}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New FAQ
        </Button>
      </div>

      <div className="space-y-4">
        {grouped.map(([category, list]) => (
          <Card key={category} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-display font-bold">{category}</h2>
                <span className="text-[11px] text-muted-foreground">{list.length} item{list.length === 1 ? "" : "s"}</span>
              </div>
              <Accordion type="multiple" className="w-full">
                {list.map((f) => {
                  const total = f.helpful + f.notHelpful;
                  const pct = total > 0 ? Math.round((f.helpful / total) * 100) : null;
                  return (
                    <AccordionItem key={f.id} value={f.id}>
                      <AccordionTrigger className="text-sm hover:no-underline">
                        <div className="flex items-center gap-2 flex-1 min-w-0 text-left">
                          <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${f.status === "published" ? "border-success/40 text-success" : "border-warning/40 text-warning"}`}>{f.status}</Badge>
                          <span className="truncate">{f.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-sm whitespace-pre-wrap text-muted-foreground">{f.answer}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-success" /> {f.helpful}</span>
                            <span className="flex items-center gap-1"><ThumbsDown className="h-3 w-3 text-destructive" /> {f.notHelpful}</span>
                            {pct !== null && <span className="font-mono">{pct}% helpful</span>}
                            <span>· updated {fmtRelative(f.updatedAt)}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(f)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => remove(f.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        ))}
        {grouped.length === 0 && (
          <Card className="shadow-card"><CardContent className="p-10 text-center text-sm text-muted-foreground">No FAQs match your filters.</CardContent></Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit FAQ" : "New FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="fq">Question</Label>
              <Input id="fq" value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fa">Answer</Label>
              <Textarea id="fa" value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} className="min-h-[120px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as Faq["category"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as Faq["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Create FAQ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
