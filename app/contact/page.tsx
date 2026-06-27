"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { PrimaryButton } from "@/components/ui/button";
import { Input, FormGroup, Label, Textarea } from "@/components/ui/form";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Clock } from "lucide-react";

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("سيتم توصيل رسالتك للفريق. شكراً!");
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">تواصل معنا</h1>
            <p className="text-gray-400">
              فريقنا متاح للإجابة على جميع أسئلتك
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Telegram */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardContent className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-[#0088cc]" />
                  <h3 className="font-bold text-lg mb-2">Telegram</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    الدعم الفوري على Telegram
                  </p>
                  <a
                    href="https://t.me/HELAL_SHADY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0088cc] hover:underline font-semibold"
                  >
                    @HELAL_SHADY
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-[#F5B942]" />
                  <h3 className="font-bold text-lg mb-2">البريد الإلكتروني</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    أرسل لنا بريداً إلكترونياً
                  </p>
                  <a
                    href="mailto:support@h8exchange.com"
                    className="text-[#F5B942] hover:underline font-semibold"
                  >
                    support@h8exchange.com
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="font-bold text-lg mb-2">ساعات العمل</h3>
                  <p className="text-gray-500 text-sm">
                    متاح 24/7
                  </p>
                  <p className="text-[#F5B942] font-semibold mt-4">
                    دعم فوري
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <h2 className="text-2xl font-bold mb-6">أرسل رسالة</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormGroup>
                    <Label htmlFor="name">الاسم</Label>
                    <Input
                      id="name"
                      placeholder="أحمد محمد"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      placeholder="201000000000"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="subject">الموضوع</Label>
                    <Input
                      id="subject"
                      placeholder="موضوع الرسالة"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="message">الرسالة</Label>
                    <Textarea
                      id="message"
                      placeholder="اكتب رسالتك هنا..."
                      rows={6}
                      required
                    />
                  </FormGroup>

                  <PrimaryButton type="submit" className="w-full">
                    إرسال الرسالة
                  </PrimaryButton>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold mb-6">الأسئلة الشائعة</h2>
            <div className="space-y-4">
              {[
                {
                  q: "كم وقت معالجة الطلب؟",
                  a: "عادة ما يتم معالجة الطلب خلال 30 دقيقة",
                },
                {
                  q: "هل هناك رسوم إضافية؟",
                  a: "لا، جميع الرسوم شاملة في السعر المعروض",
                },
                {
                  q: "ماذا إذا حدثت مشكلة في التحويل؟",
                  a: "تواصل معنا فوراً على Telegram للحصول على الدعم",
                },
              ].map((faq, index) => (
                <Card key={index}>
                  <CardContent>
                    <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                    <p className="text-gray-400">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
