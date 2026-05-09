import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Eye, Save, Send, Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  articles,
  fmtRelative,
  fmtNum,
  articleStatusTone,
  type Article,
  type ArticleCategory,
  type ArticleStatus,
} from "@/lib/content-data";

export const Route = createFileRoute("/_admin/content/articles/$id")({
  loader: ({ params }) => {
    const article = articles.find((a) => a.id === params.id);
    if (!article) throw notFound();
    return { article };
  },
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h1 className="text-xl font-bold">Article not found</h1>
      <Button asChild className="mt-4"><Link to="/content/articles">Back to articles</Link></Button>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-destructive">{error.message}</div>
  ),
  component: ArticleEditorPage,
});

function ArticleEditorPage() {
  const { article: initial } = Route.useLoaderData() as { article: Article };
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Article>(initial);
  const [preview, setPreview] = useState(false);

  const update = <K extends keyof Article>(key: K, value: Article[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const save = () => toast.success(`Saved · ${draft.title}`);
  const publish = () => {
    setDraft((d) => ({ ...d, status: "published", publishedAt: new Date().toISOString() }));
    toast.success("Article published");
  };
  const archive = () => {
    setDraft((d) => ({ ...d, status: "archived" }));
    toast.success("Article archived");
  };
  const remove = () => {
    toast.success("Article deleted");
    navigate({ to: "/content/articles" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/content/articles" })} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-xl font-bold truncate">{draft.title || "Untitled"}</h2>
            <Badge variant="outline" className={`text-[10px] capitalize ${articleStatusTone[draft.status]}`}>{draft.status}</Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">{draft.id} · /{draft.slug}</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreview((v) => !v)}>
            <Eye className="h-4 w-4" /> {preview ? "Edit" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={save}>
            <Save className="h-4 w-4" /> Save
          </Button>
          {draft.status !== "published" && (
            <Button size="sm" className="gap-1.5" onClick={publish}>
              <Send className="h-4 w-4" /> Publish
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {preview ? (
            <Card className="shadow-card overflow-hidden">
              <div className={`h-40 bg-gradient-to-br ${draft.coverColor}`} />
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{draft.category}</Badge>
                  {draft.tags.map((t) => <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>)}
                </div>
                <h1 className="font-display text-2xl font-bold">{draft.title}</h1>
                <p className="text-sm text-muted-foreground italic">{draft.excerpt}</p>
                <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap">{draft.body}</div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card">
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="t">Title</Label>
                  <Input id="t" value={draft.title} onChange={(e) => update("title", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s">Slug</Label>
                  <Input id="s" value={draft.slug} onChange={(e) => update("slug", e.target.value)} className="font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ex">Excerpt</Label>
                  <Textarea id="ex" value={draft.excerpt} onChange={(e) => update("excerpt", e.target.value)} className="min-h-[60px]" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b">Body</Label>
                  <Textarea id="b" value={draft.body} onChange={(e) => update("body", e.target.value)} className="min-h-[260px] font-mono text-xs" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-display font-bold">Settings</h3>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={draft.category} onValueChange={(v) => update("category", v as ArticleCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Announcements">Announcements</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={draft.status} onValueChange={(v) => update("status", v as ArticleStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" value={draft.tags.join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-display font-bold mb-1">Stats</h3>
              <Field label="Author" value={draft.author} />
              <Field label="Views" value={fmtNum(draft.views)} mono />
              <Field label="Published" value={draft.publishedAt ? fmtRelative(draft.publishedAt) : "—"} />
              <Field label="Updated" value={fmtRelative(draft.updatedAt)} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-display font-bold mb-1">Danger zone</h3>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={archive}>
                <Archive className="h-4 w-4" /> Archive
              </Button>
              <Button size="sm" variant="destructive" className="w-full justify-start gap-2" onClick={remove}>
                <Trash2 className="h-4 w-4" /> Delete article
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono" : "font-medium"}>{value}</span>
    </div>
  );
}
