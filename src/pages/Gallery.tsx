import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { getGalleryImages, GalleryImage } from "@/lib/gallery";
import { springIn } from "@/lib/animations";

const categories = [
  { value: "all", bn: "সকল", en: "All" },
  { value: "campus", bn: "ক্যাম্পাস", en: "Campus" },
  { value: "events", bn: "অনুষ্ঠান", en: "Events" },
  { value: "activities", bn: "কার্যক্রম", en: "Activities" },
];

const defaultPhotos = [
  { src: "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=600", category: "campus", titleBn: "মূল ভবন", titleEn: "Main Building" },
  { src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600", category: "activities", titleBn: "ক্লাসরুম", titleEn: "Classroom" },
  { src: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600", category: "events", titleBn: "বার্ষিক অনুষ্ঠান", titleEn: "Annual Event" },
  { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600", category: "campus", titleBn: "লাইব্রেরি", titleEn: "Library" },
  { src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600", category: "activities", titleBn: "খেলাধুলা", titleEn: "Sports" },
  { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600", category: "events", titleBn: "পুরস্কার বিতরণী", titleEn: "Award Ceremony" },
  { src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600", category: "campus", titleBn: "ক্যাম্পাস প্রাঙ্গণ", titleEn: "Campus Ground" },
  { src: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600", category: "activities", titleBn: "সাংস্কৃতিক কর্মকাণ্ড", titleEn: "Cultural Activity" },
];

const Gallery = () => {
  const { t, lang } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGalleryImages()
      .then(setGalleryImages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const adminPhotos = galleryImages.map((g) => ({
    src: g.src,
    category: g.category,
    titleBn: g.titleBn,
    titleEn: g.titleEn,
  }));

  const allPhotos = [...adminPhotos, ...defaultPhotos];
  const filtered = filter === "all" ? allPhotos : allPhotos.filter((p) => p.category === filter);

  return (
    <div>
      <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
        <motion.h1 {...springIn} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {t("গ্যালারি", "Gallery")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-center flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`px-5 py-2 rounded-full font-bengali text-sm font-medium transition-all ${
                  filter === cat.value
                    ? "bg-primary text-primary-foreground shadow-[0_4px_0_0_#042f24]"
                    : "bg-secondary text-foreground hover:bg-accent/20"
                }`}
              >
                {lang === "bn" ? cat.bn : cat.en}
              </button>
            ))}
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 max-w-6xl mx-auto">
            {filtered.map((photo, i) => (
              <motion.div
                key={`${photo.src}-${filter}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="mb-6 break-inside-avoid"
              >
                <div className="rounded-[2rem] overflow-hidden group cursor-pointer relative">
                  <img src={photo.src} alt={lang === "bn" ? photo.titleBn : photo.titleEn} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="font-bengali text-primary-foreground font-bold">{lang === "bn" ? photo.titleBn : photo.titleEn}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
