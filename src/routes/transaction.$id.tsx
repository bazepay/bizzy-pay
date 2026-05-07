import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Download, Share2, CheckCircle2 } from "lucide-react";
import { mockTransactions, formatMoney } from "@/lib/mock";
import { PhoneFrame } from "@/components/phone-frame";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/transaction/$id")({
  component: TxnDetail,
});

function TxnDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const t = mockTransactions.find((x) => x.id === id);

  if (!t) return (
    <PhoneFrame>
      <div className="p-8 text-center">Transaction not found <Link to="/_app/wallet" className="text-primary">Back</Link></div>
    </PhoneFrame>
  );

  return (
    <PhoneFrame>
      <div className="min-h-screen md:h-[860px] bg-background">
        <header className="px-6 pt-12 pb-4 flex items-center gap-4">
          <button onClick={() => router.history.back()} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg">Receipt</h1>
        </header>

        <div className="px-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/15 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{t.type === "credit" ? "Received" : "Paid"}</p>
            <p className="font-display font-bold text-3xl mt-1">{formatMoney(t.amount, t.currency)}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.title}</p>
          </div>

          <div className="bg-card rounded-2xl p-5 space-y-3 text-sm">
            <Detail k="Reference" v={t.id.toUpperCase()} />
            <Detail k="Description" v={t.subtitle} />
            <Detail k="Status" v={t.status} />
            <Detail k="Date" v={new Date(t.date).toLocaleString()} />
            <Detail k="Type" v={t.category} />
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1 h-11 rounded-2xl">
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
            <Button variant="outline" className="flex-1 h-11 rounded-2xl">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold capitalize text-right">{v}</span>
    </div>
  );
}
