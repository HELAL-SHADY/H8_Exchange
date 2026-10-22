"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Input, FormGroup, Label } from "@/components/ui/form";
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";

type Step = "REQUEST_CODE" | "VERIFY_CODE" | "NEW_PASSWORD" | "SUCCESS";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("REQUEST_CODE");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState("");

  // Countdown timer for resending code
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Request Code
  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessInfo("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ أثناء إرسال الكود");
      }

      setSuccessInfo(data.message || "تم إرسال كود التحقق بنجاح");
      setResendCooldown(60);
      setStep("VERIFY_CODE");
    } catch (err: any) {
      setError(err.message || "فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.trim().length !== 6) {
      setError("يرجى إدخال كود التحقق المكون من 6 أرقام");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessInfo("");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "كود التحقق غير صحيح");
      }

      setStep("NEW_PASSWORD");
    } catch (err: any) {
      setError(err.message || "فشل التحقق من الكود");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: code.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل إعادة تعيين كلمة المرور");
      }

      setStep("SUCCESS");
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تعيين كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Platform Title */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-[#F5B942] to-[#E6A430] bg-clip-text text-transparent">
                H8 Exchange
              </span>
            </h1>
          </Link>
          <p className="text-gray-400 text-sm">استعادة كلمة المرور</p>
        </div>

        <Card>
          <CardContent>
            {/* Step Indicators */}
            {step !== "SUCCESS" && (
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2D2D2D] text-xs">
                <div
                  className={`flex items-center gap-1.5 ${
                    step === "REQUEST_CODE"
                      ? "text-[#F5B942] font-bold"
                      : "text-gray-400"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      step === "REQUEST_CODE"
                        ? "bg-[#F5B942] text-black font-bold"
                        : "bg-[#2D2D2D] text-gray-300"
                    }`}
                  >
                    1
                  </span>
                  <span>البريد</span>
                </div>

                <div className="flex-1 h-[2px] bg-[#2D2D2D] mx-2" />

                <div
                  className={`flex items-center gap-1.5 ${
                    step === "VERIFY_CODE"
                      ? "text-[#F5B942] font-bold"
                      : "text-gray-400"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      step === "VERIFY_CODE"
                        ? "bg-[#F5B942] text-black font-bold"
                        : "bg-[#2D2D2D] text-gray-300"
                    }`}
                  >
                    2
                  </span>
                  <span>الكود</span>
                </div>

                <div className="flex-1 h-[2px] bg-[#2D2D2D] mx-2" />

                <div
                  className={`flex items-center gap-1.5 ${
                    step === "NEW_PASSWORD"
                      ? "text-[#F5B942] font-bold"
                      : "text-gray-400"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      step === "NEW_PASSWORD"
                        ? "bg-[#F5B942] text-black font-bold"
                        : "bg-[#2D2D2D] text-gray-300"
                    }`}
                  >
                    3
                  </span>
                  <span>كلمة المرور</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Success Info Message */}
            {successInfo && step === "VERIFY_CODE" && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-emerald-600/20 border border-emerald-500 rounded-lg text-emerald-400 text-sm"
              >
                {successInfo}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* STEP 1: Request Code */}
              {step === "REQUEST_CODE" && (
                <motion.form
                  key="step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleRequestCode}
                  className="space-y-4"
                >
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[#F5B942]/10 rounded-full flex items-center justify-center text-[#F5B942]">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">
                      أدخل بريدك الإلكتروني
                    </h2>
                    <p className="text-sm text-gray-400">
                      سنرسل لك كود تحقق سري لإعادة تعيين كلمة المرور
                    </p>
                  </div>

                  <FormGroup>
                    <Label htmlFor="email">البريد الإلكتروني المسجل</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </FormGroup>

                  <PrimaryButton
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "جاري الإرسال..." : "إرسال كود التحقق"}
                  </PrimaryButton>

                  <div className="mt-4 text-center">
                    <Link
                      href="/auth/login"
                      className="text-sm text-gray-400 hover:text-[#F5B942] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                      العودة لتسجيل الدخول
                    </Link>
                  </div>
                </motion.form>
              )}

              {/* STEP 2: Verify Code */}
              {step === "VERIFY_CODE" && (
                <motion.form
                  key="step-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleVerifyCode}
                  className="space-y-4"
                >
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[#F5B942]/10 rounded-full flex items-center justify-center text-[#F5B942]">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">
                      أدخل كود التحقق
                    </h2>
                    <p className="text-sm text-gray-400">
                      تم إرسال كود مكون من 6 أرقام إلى:
                    </p>
                    <p className="text-sm font-semibold text-[#F5B942] mt-0.5">
                      {email}
                    </p>
                  </div>

                  <FormGroup>
                    <Label htmlFor="code" className="text-center block">
                      كود التحقق (6 أرقام)
                    </Label>
                    <input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={code}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setCode(val);
                      }}
                      className="w-full text-center text-3xl font-mono tracking-widest px-4 py-3.5 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-[#F5B942] placeholder-gray-600 focus:outline-none focus:border-[#F5B942]/70 focus:bg-white/[0.07] focus:ring-4 focus:ring-[#F5B942]/15 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                      required
                      autoFocus
                    />
                  </FormGroup>

                  <PrimaryButton
                    type="submit"
                    className="w-full"
                    disabled={loading || code.trim().length !== 6}
                  >
                    {loading ? "جاري التحقق..." : "تأكيد ومتابعة"}
                  </PrimaryButton>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("REQUEST_CODE");
                        setError("");
                      }}
                      className="hover:text-white transition-colors"
                    >
                      تغيير البريد الإلكتروني
                    </button>

                    {resendCooldown > 0 ? (
                      <span className="text-gray-500">
                        إعادة الإرسال بعد ({resendCooldown} ثانية)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestCode()}
                        disabled={loading}
                        className="text-[#F5B942] hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        إعادة إرسال الكود
                      </button>
                    )}
                  </div>
                </motion.form>
              )}

              {/* STEP 3: Set New Password */}
              {step === "NEW_PASSWORD" && (
                <motion.form
                  key="step-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                >
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[#F5B942]/10 rounded-full flex items-center justify-center text-[#F5B942]">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">
                      تعيين كلمة مرور جديدة
                    </h2>
                    <p className="text-sm text-gray-400">
                      أدخل كلمة المرور الجديدة لحسابك
                    </p>
                  </div>

                  <FormGroup>
                    <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      يجب أن تكون 8 أحرف على الأقل
                    </p>
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormGroup>

                  <PrimaryButton
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "جاري التحديث..." : "حفظ كلمة المرور الجديدة"}
                  </PrimaryButton>
                </motion.form>
              )}

              {/* STEP 4: Success Screen */}
              {step === "SUCCESS" && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4 space-y-4"
                >
                  <div className="w-16 h-16 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-10 h-10" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      تم تغيير كلمة المرور بنجاح!
                    </h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      تم تحديث كلمة المرور الخاصة بحسابك بنجاح. يمكنك الآن تسجيل
                      الدخول باستخدام كلمة المرور الجديدة.
                    </p>
                  </div>

                  <div className="pt-2">
                    <PrimaryButton
                      type="button"
                      className="w-full"
                      onClick={() => router.push("/auth/login?reset=success")}
                    >
                      تسجيل الدخول الآن
                    </PrimaryButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
