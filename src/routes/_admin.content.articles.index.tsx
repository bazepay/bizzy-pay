import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye } from "lucide-react";
import {
  articles,
  fmtRelative,
  fmtNum,
  articleStatusTone,
  type ArticleCategory,
  type ArticleStatus,
} from "@/lib/content-data";

export const Route = createFileRoute("/_admin/content/articles/")({
  component: ArticlesPage,
});

function ArticlesPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | ArticleCategory>("all");
  const [status, setStatus] = useState<"all" | ArticleStatus>("all");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return articles.filter((a) => {
      if (cat !== "all" && a.category !== cat) return false;
      if (status !== "all" && a.status !== status) return false;
      if (!term) return true;
      return (
        a.id.toLowerCase().includes(term) ||
        a.title.toLowerCase().includes(term) ||
        a.author.toLowerCase().includes(term) ||
        a.tags.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [q, cat, status]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles, tags or authors…" className="pl-8" />
        </div>
        <Select value={cat} onValueChange={(v) => setCat(v as typeof cat)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="Product">Product</SelectItem>
            <SelectItem value="Announcements">Announcements</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="Compliance">Compliance</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2" onClick={() => navigate({ to: "/content/articles/$id", params: { id: articles[0].id } })}>
          <Plus className="h-4 w-4" /> New article
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((a) => (
          <Link key={a.id} to="/content/articles/$id" params={{ id: a.id }}>
            <Card className="shadow-card hover:border-primary/40 transition-colors h-full">
              <div className={`h-24 rounded-t-lg bg-gradient-to-br ${a.coverColor}`} />
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
                  <Badge variant="outline" className={`text-[10px] capitalize ${articleStatusTone[a.status]}`}>{a.status}</Badge>
                </div>
                <h3 className="text-sm font-display font-bold leading-tight line-clamp-2">{a.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.excerpt}</p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
                  <span>{a.author} · {fmtRelative(a.updatedAt)}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Eye className="h-3 w-3" /> {fmtNum(a.views)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {rows.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-center text-sm text-muted-foreground py-10">No articles match your filters.</div>
        )}
      </div>
    </motion.div>
  );
}
