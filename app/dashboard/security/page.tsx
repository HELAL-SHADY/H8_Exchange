"use client";

import { useEffect, useState } from "react";
import { Shield, KeyRound, CheckCircle2, AlertTriangle, Smartphone } from "lucide-react";

export default function SecurityPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">مركز الأمان وحماية الحساب</h1>
        <p className="text-sm text-gray-400 mt-1">
          إجراءات الحماية المتقدمة والتحقق الثنائي لضمان أمان أرصدتك ومعاملاتك.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Account Integrity Card */}
        <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">حالة التحقق من الحساب</h3>
                <p className="text-xs text-gray-400">حماية العمليات وتأكيد هوية العميل</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              {profile?.isVerified ? "موثق بالكامل" : "حساب نشط"}
            </span>
          </div>
        </div>

        {/* 2FA Card */}
        <div className="p-6 rounded-3xl bg-[#0E0E12] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">التحقق بخطوتين (Two-Factor Authentication)</h3>
                <p className="text-xs text-gray-400">
                  تأمين عمليات السحب وتعديل البيانات الحساسة عبر تطبيق Google Authenticator
                </p>
              </div>
            </div>
            <span className="text-xs text-amber-400 font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
              مفعّل في العمليات الحساسة
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-gray-300 space-y-1">
            <p className="font-semibold text-amber-400">إرشادات الأمان المصرفي لدى H8 Exchange:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>لا تشارك كلمة مرورك أو بيانات دخولك مع أي شخص بما في ذلك موظفي الدعم.</li>
              <li>تأكد دائماً من وجود نطاق الموقع الرسمي https://h8-exchange.vercel.app قبل تسجيل الدخول.</li>
              <li>جميع المعاملات المالية مسجلة في سجل تدقيق لا مركزي غير قابل للتلاعب.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
