"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Input, FormGroup, Label } from "@/components/ui/form";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || "فشل تسجيل الدخول");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl") || "/";
      router.push(callbackUrl);
    } catch (error) {
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-[#F5B942] to-[#E6A430] bg-clip-text text-transparent">
              H8 Exchange
            </span>
          </h1>
          <p className="text-gray-400">تسجيل الدخول</p>
        </div>

        <Card>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormGroup>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </FormGroup>

              <PrimaryButton
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </PrimaryButton>
            </form>

            <div className="mt-4 text-center text-sm text-gray-400">
              ليس لديك حساب؟{" "}
              <Link
                href="/auth/register"
                className="text-[#F5B942] hover:underline"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
