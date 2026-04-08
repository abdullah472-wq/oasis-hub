import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { getGalleryImages, type GalleryImage } from "@/lib/gallery";
import { springIn } from "@/lib/animations";

type GalleryCategory = "all" | "campus" | "events" | "activities";

const categories: Array<{ value: GalleryCategory; bn: string; en: string }> = [
  { value: "all", bn: "সকল", en: "All" },
  { value: "campus", bn: "ক্যাম্পাস", en: "Campus" },
  { value: "events", bn: "অনুষ্ঠান", en: "Events" },
  { value: "activities", bn: "কার্যক্রম", en: "Activities" },
];

const Gallery = () => {
  const { t, lang } = useLanguage();
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGalleryImages()
      .then(setGalleryImages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const normalizedPhotos = galleryImages.map((item) => ({
    src: item.src,
    category: item.category === "event" ? "events" : item.category === "activity" ? "activities" : "campus",
    titleBn: item.titleBn,
    titleEn: item.titleEn,
  }));

  const filteredPhotos =
    filter === "all" ? normalizedPhotos : normalizedPhotos.filter((photo) => photo.category === filter);

  return (
    <div>
      <section className="relative flex h-48 items-center justify-center overflow-hidden bg-primary md:h-64">
        <motion.h1
          {...springIn}
          className="font-bengali text-primary-foreground"
          style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}
        >
          {t("গ্যালারি", "Gallery")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setFilter(category.value)}
                className={`rounded-full px-5 py-2 font-bengali text-sm font-medium transition-all ${
                  filter === category.value
                    ? "bg-primary text-primary-foreground shadow-[0_4px_0_0_#042f24]"
                    : "bg-secondary text-foreground hover:bg-accent/20"
                }`}
              >
                {lang === "bn" ? category.bn : category.en}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredPhotos.length === 0 ? (
            <p className="py-12 text-center font-bengali text-muted-foreground">
              {t("এখনও কোনো গ্যালারি ছবি প্রকাশ করা হয়নি", "No gallery images have been published yet")}
            </p>
          ) : (
            <div className="mx-auto columns-1 gap-6 sm:columns-2 lg:max-w-6xl lg:columns-3">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={`${photo.src}-${filter}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="mb-6 break-inside-avoid"
                >
                  <div className="group relative cursor-pointer overflow-hidden rounded-[2rem]">
                    <img
                      src={photo.src}
                      alt={lang === "bn" ? photo.titleBn : photo.titleEn}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/60 to-transparent p-6 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="font-bengali font-bold text-primary-foreground">
                        {lang === "bn" ? photo.titleBn : photo.titleEn}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
