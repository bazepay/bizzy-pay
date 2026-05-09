import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Megaphone, HelpCircle, Scale, Eye, MousePointerClick, ArrowRight } from "lucide-react";
import {
  articles,
  banners,
  faqs,
  legalDocs,
  fmtRelative,
  fmtNum,
  articleStatusTone,
  bannerStatusTone,
  legalStatusTone,
} from "@/lib/content-data";

export const Route = createFileRoute("/_admin/content/")({
  component: ContentOverview,
});

function ContentOverview() {
  const stats = useMemo(() => {
    const published = articles.filter((a) => a.status === "published").length;
    const drafts = articles.filter((a) => a.status === "draft").length + faqs.filter((f) => f.status === "draft").length;
    const liveBanners = banners.filter((b) => b.status === "live").length;
    const totalViews = articles.reduce((s, a) => s + a.views, 0);
    const totalImpressions = banners.reduce((s, b) => s + b.impressions, 0);
    const totalClicks = banners.reduce((s, b) => s + b.clicks, 0);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    return { published, drafts, liveBanners, totalViews, totalImpressions, totalClicks, ctr };
  }, []);

  const recentArticles = useMemo(
    () => [...articles].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5),
    []
  );
  const liveBanners = useMemo(() => banners.filter((b) => b.status === "live").slice(0, 4), []);
  const activeLegal = useMemo(() => legalDocs.filter((d) => d.status === "active"), []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Published articles" value={stats.published.toString()} sub={`${stats.drafts} draft${stats.drafts === 1 ? "" : "s"}`} icon={FileText} />
        <StatCard label="Article views" value={fmtNum(stats.totalViews)} sub="All-time" icon={Eye} />
        <StatCard label="Live banners" value={stats.liveBanners.toString()} sub={`${banners.length} total`} icon={Megaphone} />
        <StatCard label="Banner impressions" value={fmtNum(stats.totalImpressions)} sub="All-time" icon={Eye} />
        <StatCard label="Banner CTR" value={`${stats.ctr.toFixed(2)}%`} sub={`${fmtNum(stats.totalClicks)} clicks`} icon={MousePointerClick} />
        <StatCard label="Active legal docs" value={activeLegal.length.toString()} sub={`${legalDocs.filter(d => d.status === "draft").length} draft`} icon={Scale} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-display font-bold">Recent articles</h2>
                <p className="text-xs text-muted-foreground">Latest edits and publications</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/content/articles">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recentArticles.map((a) => (
                <Link key={a.id} to="/content/articles/$id" params={{ id: a.id }} className="flex items-center gap-3 py-2.5 hover:bg-muted/40 -mx-2 px-2 rounded transition-colors">
                  <div className={`h-10 w-10 rounded-md bg-gradient-to-br ${a.coverColor} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{a.title}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
                      <Badge variant="outline" className={`text-[10px] capitalize ${articleStatusTone[a.status]}`}>{a.status}</Badge>
                      <span>· {a.author} · {fmtRelative(a.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono">{fmtNum(a.views)}</div>
                    <div className="text-[10px] text-muted-foreground">views</div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-display font-bold">Live banners</h2>
                <p className="text-xs text-muted-foreground">Currently shown in-app</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/content/banners">Manage <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="space-y-2">
              {liveBanners.map((b) => {
                const ctr = b.impressions > 0 ? (b.clicks / b.impressions) * 100 : 0;
                return (
                  <div key={b.id} className="rounded-md border border-border p-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-[10px] capitalize ${bannerStatusTone[b.status]}`}>{b.status}</Badge>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{b.placement}</span>
                    </div>
                    <div className="text-sm font-medium truncate">{b.title}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center justify-between mt-1">
                      <span>{fmtNum(b.impressions)} imp</span>
                      <span className="font-mono">{ctr.toFixed(2)}% CTR</span>
                    </div>
                  </div>
                );
              })}
              {liveBanners.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No live banners.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-display font-bold flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Help center FAQ</h2>
              <p className="text-xs text-muted-foreground">{faqs.filter(f => f.status === "published").length} published · {faqs.filter(f => f.status === "draft").length} draft</p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1">
              <Link to="/content/faq">Open <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-display font-bold flex items-center gap-2"><Scale className="h-4 w-4" /> Active legal documents</h2>
              <Button asChild variant="ghost" size="sm" className="gap-1 -mr-2">
                <Link to="/content/legal">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <ul className="text-xs space-y-1">
              {activeLegal.map((d) => (
                <li key={d.id} className="flex items-center justify-between">
                  <span>{d.name}</span>
                  <span className="flex items-center gap-2">
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

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: typeof FileText }) {
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
