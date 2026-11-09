"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, ShieldCheck, User } from "lucide-react";

export default function TicketDetailPage() {
  const params = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTicket = () => {
    fetch(`/api/support/tickets/${params.id}`)
      .then((res) => res.json())
      .then(setTicket)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicket();
  }, [params.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      if (!res.ok) throw new Error("فشل إرسال الرد");
      setReply("");
      fetchTicket();
    } catch (err: any) {
      alert(err.message || "حدث خطأ");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>التذكرة غير موجودة أو تم إغلاقها.</p>
        <Link href="/dashboard/support" className="text-amber-400 text-xs font-bold hover:underline mt-2 inline-block">
          العودة لتذاكر الدعم
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/support"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400">{ticket.ticketNumber}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                {ticket.status}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white mt-0.5">{ticket.subject}</h1>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 space-y-4 max-h-[500px] overflow-y-auto">
        {ticket.messages?.map((m: any) => (
          <div
            key={m.id}
            className={`p-4 rounded-2xl max-w-[80%] ${
              m.isAdmin
                ? "bg-amber-500/10 border border-amber-500/20 text-white mr-auto"
                : "bg-white/5 border border-white/10 text-white ml-auto"
            }`}
          >
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold flex items-center gap-1 text-amber-400">
                {m.isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {m.isAdmin ? "فريق دعم H8 Exchange" : m.sender?.name || "أنت"}
              </span>
              <span className="text-[10px] text-gray-400">
                {new Date(m.createdAt).toLocaleTimeString("ar-EG")}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap text-gray-200">{m.message}</p>
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="اكتب ردك هنا..."
          className="flex-1 px-4 py-3 rounded-2xl bg-[#0E0E12] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={sending || !reply.trim()}
          className="px-6 py-3 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:brightness-110 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Send className="w-4 h-4 rtl:rotate-180" />
          <span>إرسال</span>
        </button>
      </form>
    </div>
  );
}
