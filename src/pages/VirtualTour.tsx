import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { getVirtualTours, VirtualTour } from "@/lib/virtualTour";
import { springIn } from "@/lib/animations";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const VirtualTour = () => {
  const { t, lang } = useLanguage();
  const [tours, setTours] = useState<VirtualTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getVirtualTours()
      .then(setTours)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % tours.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + tours.length) % tours.length);
  };

  return (
    <div>
      <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
        <motion.h1 {...springIn} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {t("ভার্চুয়াল ট্যুর", "Virtual Tour")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎥</div>
              <p className="font-bengali text-muted-foreground text-lg">
                {t("ভার্চুয়াল ট্যুর শীঘ্রই আসছে!", "Virtual tour coming soon!")}
              </p>
              <p className="font-bengali text-sm text-muted-foreground mt-2">
                {t("আমাদের ক্যাম্পাস ঘুরে দেখার জন্য লাইভ ভিডিও দেখুন", "Check out our live campus tour video")}
              </p>
            </div>
          ) : (
            <div>
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-card">
                {tours[currentIndex].videoUrl ? (
                  <iframe
                    src={tours[currentIndex].videoUrl}
                    title={lang === "bn" ? tours[currentIndex].title : tours[currentIndex].titleEn || tours[currentIndex].title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : tours[currentIndex].imageUrl ? (
                  <img
                    src={tours[currentIndex].imageUrl}
                    alt={lang === "bn" ? tours[currentIndex].title : tours[currentIndex].titleEn || tours[currentIndex].title}
                    className="w-full h-full object-cover"
                  />
                ) : null}

                {tours.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              <div className="mt-6 text-center">
                <h2 className="font-bengali text-xl font-bold text-foreground">
                  {lang === "bn" ? tours[currentIndex].title : tours[currentIndex].titleEn || tours[currentIndex].title}
                </h2>
                {tours[currentIndex].description && (
                  <p className="font-bengali text-muted-foreground mt-2">
                    {lang === "bn" ? tours[currentIndex].description : tours[currentIndex].descriptionEn || tours[currentIndex].description}
                  </p>
                )}
              </div>

              {tours.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {tours.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentIndex === i ? "bg-primary w-8" : "bg-secondary"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VirtualTour;
