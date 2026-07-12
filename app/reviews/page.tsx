"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface Review {
  id: string;
  user: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/reviews?limit=50");
        const data = await response.json();
        setReviews(data.reviews);
        setAvgRating(data.avgRating);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-400">{t("loading")}</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

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
            <h1 className="text-4xl font-bold mb-4">{t("userReviews")}</h1>
            <p className="text-gray-400">
              {t("userReviewsSubtitle")}
            </p>
          </motion.div>

          {/* Average Rating Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-gray-400 mb-4">{t("overallRating")}</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-5xl font-bold text-[#F5B942]">
                    {avgRating.toFixed(1)}
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={32}
                        className={
                          i < Math.round(avgRating)
                            ? "fill-[#F5B942] text-[#F5B942]"
                            : "text-gray-600"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-500 mt-4">
                  {t("fromNReviews").replace("{count}", reviews.length.toString())}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">{t("noReviewsYet")}</p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:border-[#F5B942] transition-colors">
                    <CardContent className="py-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {review.user.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleString(
                              "ar-EG"
                            )}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              className={
                                i < review.rating
                                  ? "fill-[#F5B942] text-[#F5B942]"
                                  : "text-gray-600"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {review.comment}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
