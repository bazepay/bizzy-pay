import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, Scale, ArrowRight, ThumbsUp } from "lucide-react";
import {
  faqs,
  legalDocs,
  fmtRelative,
  fmtNum,
  legalStatusTone,
} from "@/lib/content-data";

export const Route = createFileRoute("/_admin/content/")({
  component: ContentOverview,
});

function ContentOverview() {
  const stats = useMemo(() => {
    const publishedFaqs = faqs.filter((f) => f.status === "published").length;
    const draftFaqs = faqs.filter((f) => f.status === "draft").length;
    const helpful = faqs.reduce((s, f) => s + f.helpful, 0);
    const activeLegalCount = legalDocs.filter((d) => d.status === "active").length;
    const draftLegal = legalDocs.filter((d) => d.status === "draft").length;
    return { publishedFaqs, draftFaqs, helpful, activeLegalCount, draftLegal };
  }, []);

  const recentFaqs = useMemo(
    () => [...faqs].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 6),
    []
  );
  const activeLegal = useMemo(() => legalDocs.filter((d) => d.status === "active"), []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Published FAQ" value={stats.publishedFaqs.toString()} sub={`${stats.draftFaqs} draft`} icon={HelpCircle} />
        <StatCard label="Helpful votes" value={fmtNum(stats.helpful)} sub="All-time" icon={ThumbsUp} />
        <StatCard label="Active legal docs" value={stats.activeLegalCount.toString()} sub={`${stats.draftLegal} draft`} icon={Scale} />
        <StatCard label="Total legal versions" value={legalDocs.length.toString()} sub="incl. superseded" icon={Scale} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-display font-bold">Recent FAQ updates</h2>
                <p className="text-xs text-muted-foreground">Latest edits to the help center</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/content/faq">Manage <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recentFaqs.map((f) => (
                <div key={f.id} className="py-2.5 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{f.question}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                      <Badge variant="outline" className="text-[10px]">{f.category}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{f.status}</Badge>
                      <span>· {fmtRelative(f.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono">{fmtNum(f.helpful)}</div>
                    <div className="text-[10px] text-muted-foreground">helpful</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-display font-bold flex items-center gap-2"><Scale className="h-4 w-4" /> Active legal</h2>
                <p className="text-xs text-muted-foreground">Currently in effect</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1 -mr-2">
                <Link to="/content/legal">Open <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <ul className="text-xs space-y-1.5">
              {activeLegal.map((d) => (
                <li key={d.id} className="flex items-center justify-between">
                  <span className="truncate pr-2">{d.name}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-muted-foreground">{d.version}</span>
                    <Badge variant="outline" className={`text-[10px] capitalize ${legalStatusTone[d.status]}`}>{d.status}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: typeof HelpCircle }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="text-base font-display font-bold leading-tight">{value}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</div>
      </CardContent>
    </Card>
  );
}
