import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, Newspaper, Plus, Trash2, Calendar, Users, Image, FileText, Upload } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { uploadImage } from "@/lib/upload";
import { saveNewsToFirestore, getNewsFromFirestore, deleteNewsFromFirestore, NewsPost } from "@/lib/news";
import { saveGalleryImage, getGalleryImages, deleteGalleryImage, GalleryImage } from "@/lib/gallery";
import { saveEvent, getEvents, deleteEvent, Event } from "@/lib/events";
import { getAdmissions, deleteAdmission, AdmissionForm } from "@/lib/admission";
import { saveNotice, getNotices, deleteNotice, uploadPdf, Notice } from "@/lib/notices";
import { saveResult, getResults, deleteResult, uploadResultPdf, Result } from "@/lib/results";
import { getAllReviews, approveReview, deleteReview, Review } from "@/lib/reviews";
import { addTeacher, getTeachers, deleteTeacher, uploadTeacherImage, Teacher } from "@/lib/teachers";
import { addVirtualTour, getVirtualTours, deleteVirtualTour, VirtualTour } from "@/lib/virtualTour";

const ADMIN_PASSWORD = "oasis2026";

const Admin = () => {
  const { t, lang } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newPost, setNewPost] = useState({ titleBn: "", titleEn: "", excerptBn: "", excerptEn: "" });
  const [newsImage, setNewsImage] = useState<File | null>(null);

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [newGallery, setNewGallery] = useState({ titleBn: "", titleEn: "", category: "campus" });
  const [galleryImage, setGalleryImage] = useState<File | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ titleBn: "", titleEn: "", startDate: "", endDate: "", type: "event" as const, descriptionBn: "", descriptionEn: "" });

  const [admissions, setAdmissions] = useState<AdmissionForm[]>([]);
  const [activeTab, setActiveTab] = useState<"news" | "gallery" | "events" | "admissions" | "notices" | "results">("news");

  const [notices, setNotices] = useState<Notice[]>([]);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [newNotice, setNewNotice] = useState({ titleBn: "", titleEn: "", descriptionBn: "", descriptionEn: "" });
  const [noticePdf, setNoticePdf] = useState<File | null>(null);

  const [results, setResults] = useState<Result[]>([]);
  const [showResultForm, setShowResultForm] = useState(false);
  const [newResult, setNewResult] = useState({ exam: "", examEn: "", className: "", classNameEn: "", campus: "both" as "boys" | "girls" | "both" });
  const [resultPdf, setResultPdf] = useState<File | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: "", nameEn: "", designation: "", designationEn: "", campus: "boys" as "boys" | "girls" });
  const [teacherImage, setTeacherImage] = useState<File | null>(null);

  const [virtualTours, setVirtualTours] = useState<VirtualTour[]>([]);
  const [showTourForm, setShowTourForm] = useState(false);
  const [newTour, setNewTour] = useState({ title: "", titleEn: "", description: "", descriptionEn: "", videoUrl: "" });

  useEffect(() => {
    const saved = localStorage.getItem("admin_auth");
    if (saved === "true") setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getNewsFromFirestore().then(setNewsPosts).catch(console.error);
      getGalleryImages().then(setGalleryImages).catch(console.error);
      getEvents().then(setEvents).catch(console.error);
      getAdmissions().then(setAdmissions).catch(console.error);
      getNotices().then(setNotices).catch(console.error);
      getResults().then(setResults).catch(console.error);
      getAllReviews().then(setReviews).catch(console.error);
      getTeachers().then(setTeachers).catch(console.error);
      getVirtualTours().then(setVirtualTours).catch(console.error);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      setError("");
    } else {
      setError(t("ভুল পাসওয়ার্ড", "Incorrect password"));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage({ type: "", text: "" });
    try {
      let imageUrl = "";
      if (newsImage) imageUrl = await uploadImage(newsImage);
      const post = await saveNewsToFirestore({
        titleBn: newPost.titleBn,
        titleEn: newPost.titleEn,
        excerptBn: newPost.excerptBn,
        excerptEn: newPost.excerptEn,
        date: new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" }),
        imageUrl,
      });
      setNewsPosts([post, ...newsPosts]);
      setMessage({ type: "success", text: t("সংবাদ প্রকাশিত হয়েছে!", "News published!") });
      setNewPost({ titleBn: "", titleEn: "", excerptBn: "", excerptEn: "" });
      setNewsImage(null);
      setShowNewsForm(false);
    } catch {
      setMessage({ type: "error", text: "Failed to publish news" });
    }
    setUploading(false);
  };

  const handleDeleteNews = async (id: string) => {
    try {
      await deleteNewsFromFirestore(id);
      setNewsPosts(newsPosts.filter((p) => p.id !== id));
    } catch {
      setMessage({ type: "error", text: "Failed to delete news" });
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryImage) return;
    setUploading(true);
    setMessage({ type: "", text: "" });
    try {
      const imageUrl = await uploadImage(galleryImage);
      const img = await saveGalleryImage({
        src: imageUrl,
        titleBn: newGallery.titleBn,
        titleEn: newGallery.titleEn,
        category: newGallery.category,
      });
      setGalleryImages([img, ...galleryImages]);
      setMessage({ type: "success", text: t("ছবি যোগ হয়েছে!", "Image added!") });
      setNewGallery({ titleBn: "", titleEn: "", category: "campus" });
      setGalleryImage(null);
      setShowGalleryForm(false);
    } catch {
      setMessage({ type: "error", text: "Failed to upload image" });
    }
    setUploading(false);
  };

  const handleDeleteGallery = async (id: string) => {
    try {
      await deleteGalleryImage(id);
      setGalleryImages(galleryImages.filter((g) => g.id !== id));
    } catch {
      setMessage({ type: "error", text: "Failed to delete image" });
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage({ type: "", text: "" });
    try {
      const event = await saveEvent({
        titleBn: newEvent.titleBn,
        titleEn: newEvent.titleEn,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate || newEvent.startDate,
        type: newEvent.type,
        descriptionBn: newEvent.descriptionBn,
        descriptionEn: newEvent.descriptionEn,
      });
      setEvents([...events, event].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
      setMessage({ type: "success", text: t("ইভেন্ট যোগ হয়েছে!", "Event added!") });
      setNewEvent({ titleBn: "", titleEn: "", startDate: "", endDate: "", type: "event", descriptionBn: "", descriptionEn: "" });
      setShowEventForm(false);
    } catch {
      setMessage({ type: "error", text: "Failed to add event" });
    }
    setUploading(false);
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents(events.filter((e) => e.id !== id));
    } catch {
      setMessage({ type: "error", text: "Failed to delete event" });
    }
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage({ type: "", text: "" });
    try {
      let pdfUrl = "";
      if (noticePdf) pdfUrl = await uploadPdf(noticePdf);
      const notice = await saveNotice({
        titleBn: newNotice.titleBn,
        titleEn: newNotice.titleEn,
        descriptionBn: newNotice.descriptionBn,
        descriptionEn: newNotice.descriptionEn,
        pdfUrl: pdfUrl || undefined,
      });
      setNotices([notice, ...notices]);
      setMessage({ type: "success", text: t("নোটিশ প্রকাশিত!", "Notice published!") });
      setNewNotice({ titleBn: "", titleEn: "", descriptionBn: "", descriptionEn: "" });
      setNoticePdf(null);
      setShowNoticeForm(false);
    } catch {
      setMessage({ type: "error", text: "Failed to publish notice" });
    }
    setUploading(false);
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await deleteNotice(id);
      setNotices(notices.filter((n) => n.id !== id));
    } catch {
      setMessage({ type: "error", text: "Failed to delete notice" });
    }
  };

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage({ type: "", text: "" });
    try {
      let pdfUrl = "";
      if (resultPdf) pdfUrl = await uploadResultPdf(resultPdf);
      const result = await saveResult({
        exam: newResult.exam,
        examEn: newResult.examEn,
        className: newResult.className,
        classNameEn: newResult.classNameEn,
        campus: newResult.campus,
        pdfUrl: pdfUrl || undefined,
      });
      setResults([result, ...results]);
      setMessage({ type: "success", text: t("ফলাফল যোগ হয়েছে!", "Result added!") });
      setNewResult({ exam: "", examEn: "", className: "", classNameEn: "", campus: "both" });
      setResultPdf(null);
      setShowResultForm(false);
    } catch {
      setMessage({ type: "error", text: "Failed to add result" });
    }
    setUploading(false);
  };

  const handleDeleteResult = async (id: string) => {
    try {
      await deleteResult(id);
      setResults(results.filter((r) => r.id !== id));
    } catch {
      setMessage({ type: "error", text: "Failed to delete result" });
    }
  };

  const handleApproveReview = async (id: string) => {
    try {
      await approveReview(id);
      setReviews(reviews.map(r => r.id === id ? { ...r, approved: true } : r));
      setMessage({ type: "success", text: t("Review approved!", "Review approved!") });
    } catch {
      setMessage({ type: "error", text: "Failed to approve review" });
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await deleteReview(id);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch {
      setMessage({ type: "error", text: "Failed to delete review" });
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage({ type: "", text: "" });
    try {
      let imageUrl = "";
      if (teacherImage) imageUrl = await uploadTeacherImage(teacherImage);
      const teacher = await addTeacher({
        name: newTeacher.name,
        nameEn: newTeacher.nameEn,
        designation: newTeacher.designation,
        designationEn: newTeacher.designationEn,
        campus: newTeacher.campus,
        imageUrl: imageUrl || undefined,
      });
      setTeachers([teacher, ...teachers]);
      setMessage({ type: "success", text: t("শিক্ষক যোগ হয়েছে!", "Teacher added!") });
      setNewTeacher({ name: "", nameEn: "", designation: "", designationEn: "", campus: "boys" });
      setTeacherImage(null);
      setShowTeacherForm(false);
    } catch {
      setMessage({ type: "error", text: "Failed to add teacher" });
    }
    setUploading(false);
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      await deleteTeacher(id);
      setTeachers(teachers.filter((t) => t.id !== id));
    } catch {
      setMessage({ type: "error", text: "Failed to delete teacher" });
    }
  };

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage({ type: "", text: "" });
    try {
      const tour = await addVirtualTour({
        title: newTour.title,
        titleEn: newTour.titleEn,
        description: newTour.description,
        descriptionEn: newTour.descriptionEn,
        videoUrl: newTour.videoUrl || undefined,
      });
      setVirtualTours([tour, ...virtualTours]);
      setMessage({ type: "success", text: t("ভার্চুয়াল ট্যুর যোগ হয়েছে!", "Virtual Tour added!") });
      setNewTour({ title: "", titleEn: "", description: "", descriptionEn: "", videoUrl: "" });
      setShowTourForm(false);
    } catch {
      setMessage({ type: "error", text: "Failed to add virtual tour" });
    }
    setUploading(false);
  };

  const handleDeleteTour = async (id: string) => {
    try {
      await deleteVirtualTour(id);
      setVirtualTours(virtualTours.filter((t) => t.id !== id));
    } catch {
      setMessage({ type: "error", text: "Failed to delete virtual tour" });
    }
  };

  const handleDeleteAdmission = async (id: string) => {
    try {
      await deleteAdmission(id);
      setAdmissions(admissions.filter((a) => a.id !== id));
    } catch {
      setMessage({ type: "error", text: "Failed to delete admission" });
    }
  };

  if (!isAuthenticated) {
    return (
      <div>
        <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
          <motion.h1 {...{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}>
            {t("অ্যাডমিন প্যানেল", "Admin Panel")}
          </motion.h1>
          <WaveDivider className="absolute bottom-0" />
        </section>
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-md">
            <form onSubmit={handleLogin} className="card-institutional p-8">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-bengali text-xl font-bold">{t("লগইন করুন", "Login Required")}</h2>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("পাসওয়ার্ড", "Password")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background mb-4"
              />
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full squishy-button">
                {t("লগইন", "Login")}
              </motion.button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
        <motion.h1 {...{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-bengali text-primary-foreground" style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}>
          {t("অ্যাডমিন প্যানেল", "Admin Panel")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-end mb-4">
            <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">
              {t("লগআউট", "Logout")}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: "news", label: t("সংবাদ", "News"), icon: Newspaper },
              { key: "gallery", label: t("গ্যালারি", "Gallery"), icon: Image },
              { key: "events", label: t("ইভেন্ট", "Events"), icon: Calendar },
              { key: "notices", label: t("নোটিশ", "Notices"), icon: FileText },
              { key: "results", label: t("ফলাফল", "Results"), icon: FileText },
              { key: "reviews", label: t("রিভিউ", "Reviews"), icon: Users },
              { key: "teachers", label: t("শিক্ষক", "Teachers"), icon: Users },
              { key: "tours", label: t("ভার্চুয়াল ট্যুর", "Virtual Tours"), icon: Users },
              { key: "admissions", label: t("ভর্তি", "Admissions"), icon: Users },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-6 ${message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
            >
              {message.text}
            </motion.div>
          )}

          <div className="card-institutional p-8">
            {activeTab === "news" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bengali text-xl font-bold flex items-center gap-2">
                    <Newspaper className="w-5 h-5" />
                    {t("সংবাদ", "News")}
                  </h2>
                  <button onClick={() => setShowNewsForm(!showNewsForm)} className="squishy-button-outline flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" />
                    {t("নতুন", "New")}
                  </button>
                </div>
                {newsPosts.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {newsPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-bengali font-medium truncate">{lang === "bn" ? post.titleBn : post.titleEn}</p>
                          <p className="text-xs text-muted-foreground">{post.date}</p>
                        </div>
                        <button onClick={() => handleDeleteNews(post.id!)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {showNewsForm && (
                  <form onSubmit={handleNewsSubmit} className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("শিরোনাম (বাংলা)", "Title (Bangla)")}</label>
                        <input type="text" value={newPost.titleBn} onChange={(e) => setNewPost({ ...newPost, titleBn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("শিরোনাম (English)", "Title (English)")}</label>
                        <input type="text" value={newPost.titleEn} onChange={(e) => setNewPost({ ...newPost, titleEn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("বিবরণ", "Description")}</label>
                        <textarea value={newPost.excerptBn} onChange={(e) => setNewPost({ ...newPost, excerptBn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" rows={2} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("বিবরণ (English)", "Description (English)")}</label>
                        <textarea value={newPost.excerptEn} onChange={(e) => setNewPost({ ...newPost, excerptEn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" rows={2} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("ছবি (ঐচ্ছিক)", "Image (Optional)")}</label>
                      <input type="file" accept="image/*" onChange={(e) => setNewsImage(e.target.files?.[0] || null)} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={uploading} className="w-full squishy-button disabled:opacity-50">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t("প্রকাশ", "Publish")}
                    </motion.button>
                  </form>
                )}
              </div>
            )}

            {activeTab === "gallery" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bengali text-xl font-bold flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    {t("গ্যালারি", "Gallery")}
                  </h2>
                  <button onClick={() => setShowGalleryForm(!showGalleryForm)} className="squishy-button-outline flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" />
                    {t("নতুন", "New")}
                  </button>
                </div>
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {galleryImages.map((img) => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden">
                        <img src={img.src} alt={lang === "bn" ? img.titleBn : img.titleEn} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => handleDeleteGallery(img.id!)} className="p-2 bg-red-500 text-white rounded-full">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-center p-1 bg-black/50 text-white">{lang === "bn" ? img.titleBn : img.titleEn}</p>
                      </div>
                    ))}
                  </div>
                )}
                {showGalleryForm && (
                  <form onSubmit={handleGallerySubmit} className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("শিরোনাম", "Title")}</label>
                        <input type="text" value={newGallery.titleBn} onChange={(e) => setNewGallery({ ...newGallery, titleBn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("শিরোনাম (English)", "Title (English)")}</label>
                        <input type="text" value={newGallery.titleEn} onChange={(e) => setNewGallery({ ...newGallery, titleEn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("ক্যাটাগরি", "Category")}</label>
                      <select value={newGallery.category} onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background">
                        <option value="campus">{t("ক্যাম্পাস", "Campus")}</option>
                        <option value="events">{t("অনুষ্ঠান", "Events")}</option>
                        <option value="activities">{t("কার্যক্রম", "Activities")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("ছবি", "Image")}</label>
                      <input type="file" accept="image/*" onChange={(e) => setGalleryImage(e.target.files?.[0] || null)} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground" required />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={uploading} className="w-full squishy-button disabled:opacity-50">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t("আপলোড", "Upload")}
                    </motion.button>
                  </form>
                )}
              </div>
            )}

            {activeTab === "events" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bengali text-xl font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {t("ইভেন্ট", "Events")}
                  </h2>
                  <button onClick={() => setShowEventForm(!showEventForm)} className="squishy-button-outline flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" />
                    {t("নতুন", "New")}
                  </button>
                </div>
                {events.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-bengali font-medium">{lang === "bn" ? event.titleBn : event.titleEn}</p>
                          <p className="text-xs text-muted-foreground">{event.date} • {event.type}</p>
                        </div>
                        <button onClick={() => handleDeleteEvent(event.id!)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {showEventForm && (
                  <form onSubmit={handleEventSubmit} className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("শিরোনাম", "Title")}</label>
                        <input type="text" value={newEvent.titleBn} onChange={(e) => setNewEvent({ ...newEvent, titleBn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("শিরোনাম (English)", "Title (English)")}</label>
                        <input type="text" value={newEvent.titleEn} onChange={(e) => setNewEvent({ ...newEvent, titleEn: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("শুরুর তারিখ", "Start Date")}</label>
                        <input type="date" value={newEvent.startDate} onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{t("শেষ তারিখ (ঐচ্ছিক)", "End Date (Optional)")}</label>
                        <input type="date" value={newEvent.endDate} onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("ধরন", "Type")}</label>
                      <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as "event" })} className="w-full px-4 py-2 rounded-lg border border-border bg-background">
                        <option value="exam">{t("পরীক্ষা", "Exam")}</option>
                        <option value="holiday">{t("ছুটি", "Holiday")}</option>
                        <option value="event">{t("অনুষ্ঠান", "Event")}</option>
                        <option value="other">{t("অন্যান্য", "Other")}</option>
                      </select>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={uploading} className="w-full squishy-button disabled:opacity-50">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t("যোগ করুন", "Add")}
                    </motion.button>
                  </form>
                )}
              </div>
            )}

            {activeTab === "notices" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bengali text-xl font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {t("নোটিশ বোর্ড", "Notice Board")}
                  </h2>
                  <button
                    onClick={() => setShowNoticeForm(!showNoticeForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    {t("নতুন নোটিশ", "New Notice")}
                  </button>
                </div>

                {showNoticeForm && (
                  <form onSubmit={handleNoticeSubmit} className="space-y-4 p-4 bg-secondary/30 rounded-lg mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("শিরোনাম (বাংলা)", "Title (Bangla)")} *</label>
                        <input
                          type="text"
                          value={newNotice.titleBn}
                          onChange={(e) => setNewNotice({ ...newNotice, titleBn: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("শিরোনাম (English)", "Title (English)")}</label>
                        <input
                          type="text"
                          value={newNotice.titleEn}
                          onChange={(e) => setNewNotice({ ...newNotice, titleEn: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("বিবরণ (বাংলা)", "Description (Bangla)")}</label>
                        <textarea
                          value={newNotice.descriptionBn}
                          onChange={(e) => setNewNotice({ ...newNotice, descriptionBn: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("বিবরণ (English)", "Description (English)")}</label>
                        <textarea
                          value={newNotice.descriptionEn}
                          onChange={(e) => setNewNotice({ ...newNotice, descriptionEn: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bengali text-sm font-medium mb-1 block">{t("পিডিএফ সংযুক্ত", "Attach PDF")}</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80">
                          <Upload className="w-4 h-4" />
                          {noticePdf ? noticePdf.name : t("পিডিএফ নির্বাচন", "Select PDF")}
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setNoticePdf(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                        {noticePdf && (
                          <button type="button" onClick={() => setNoticePdf(null)} className="text-red-500 text-sm">
                            {t("বাতিল", "Cancel")}
                          </button>
                        )}
                      </div>
                    </div>
                    <motion.button
                      type="submit"
                      disabled={uploading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {t("প্রকাশ করুন", "Publish")}
                    </motion.button>
                  </form>
                )}

                {notices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t("কোনো নোটিশ নেই", "No notices yet")}</p>
                ) : (
                  <div className="space-y-4">
                    {notices.map((notice) => (
                      <div key={notice.id} className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bengali font-bold">{lang === "bn" ? notice.titleBn : notice.titleEn || notice.titleBn}</p>
                            {notice.descriptionBn || notice.descriptionEn ? (
                              <p className="text-sm text-muted-foreground mt-1">
                                {lang === "bn" ? notice.descriptionBn : notice.descriptionEn || notice.descriptionBn}
                              </p>
                            ) : null}
                            {notice.pdfUrl && (
                              <a
                                href={notice.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                              >
                                <FileText className="w-4 h-4" />
                                {t("পিডিএফ দেখুন", "View PDF")}
                              </a>
                            )}
                          </div>
                          <button onClick={() => handleDeleteNotice(notice.id!)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notice.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "results" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bengali text-xl font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {t("পরীক্ষার ফলাফল", "Exam Results")}
                  </h2>
                  <button
                    onClick={() => setShowResultForm(!showResultForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    {t("নতুন ফলাফল", "New Result")}
                  </button>
                </div>

                {showResultForm && (
                  <form onSubmit={handleResultSubmit} className="space-y-4 p-4 bg-secondary/30 rounded-lg mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("পরীক্ষা (বাংলা)", "Exam (Bangla)")} *</label>
                        <input
                          type="text"
                          value={newResult.exam}
                          onChange={(e) => setNewResult({ ...newResult, exam: e.target.value })}
                          placeholder="বার্ষিক পরীক্ষা ২০২৫"
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("পরীক্ষা (English)", "Exam (English)")}</label>
                        <input
                          type="text"
                          value={newResult.examEn}
                          onChange={(e) => setNewResult({ ...newResult, examEn: e.target.value })}
                          placeholder="Annual Exam 2025"
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("শ্রেণি (বাংলা)", "Class (Bangla)")} *</label>
                        <input
                          type="text"
                          value={newResult.className}
                          onChange={(e) => setNewResult({ ...newResult, className: e.target.value })}
                          placeholder="৬ষ্ঠ"
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("শ্রেণি (English)", "Class (English)")}</label>
                        <input
                          type="text"
                          value={newResult.classNameEn}
                          onChange={(e) => setNewResult({ ...newResult, classNameEn: e.target.value })}
                          placeholder="Class 6"
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bengali text-sm font-medium mb-1 block">{t("ক্যাম্পাস", "Campus")}</label>
                      <select
                        value={newResult.campus}
                        onChange={(e) => setNewResult({ ...newResult, campus: e.target.value as "boys" | "girls" | "both" })}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                      >
                        <option value="both">{t("উভয়", "Both")}</option>
                        <option value="boys">{t("বালক", "Boys")}</option>
                        <option value="girls">{t("বালিকা", "Girls")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bengali text-sm font-medium mb-1 block">{t("পিডিএফ", "PDF")}</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80">
                          <Upload className="w-4 h-4" />
                          {resultPdf ? resultPdf.name : t("পিডিএফ নির্বাচন", "Select PDF")}
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setResultPdf(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                        {resultPdf && (
                          <button type="button" onClick={() => setResultPdf(null)} className="text-red-500 text-sm">
                            {t("বাতিল", "Cancel")}
                          </button>
                        )}
                      </div>
                    </div>
                    <motion.button
                      type="submit"
                      disabled={uploading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {t("যোগ করুন", "Add")}
                    </motion.button>
                  </form>
                )}

                {results.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t("কোনো ফলাফল নেই", "No results yet")}</p>
                ) : (
                  <div className="space-y-4">
                    {results.map((result) => (
                      <div key={result.id} className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bengali font-bold">{lang === "bn" ? result.exam : result.examEn || result.exam} - {lang === "bn" ? result.className : result.classNameEn || result.className}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.campus === "both" ? t("উভয় ক্যাম্পাস", "Both Campus") : result.campus === "boys" ? t("বালক ক্যাম্পাস", "Boys Campus") : t("বালিকা ক্যাম্পাস", "Girls Campus")}
                            </p>
                            {result.pdfUrl && (
                              <a
                                href={result.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                              >
                                <FileText className="w-4 h-4" />
                                {t("পিডিএফ দেখুন", "View PDF")}
                              </a>
                            )}
                          </div>
                          <button onClick={() => handleDeleteResult(result.id!)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h2 className="font-bengali text-xl font-bold flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5" />
                  {t("রিভিউ ম্যানেজমেন্ট", "Reviews Management")}
                </h2>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t("কোনো রিভিউ নেই", "No reviews yet")}</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bengali font-bold">{review.name}</p>
                            <p className="font-bengali text-sm text-muted-foreground">{review.relation}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!review.approved && (
                              <button 
                                onClick={() => handleApproveReview(review.id!)}
                                className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                              >
                                {t("অনুমোদন", "Approve")}
                              </button>
                            )}
                            <button onClick={() => handleDeleteReview(review.id!)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="font-bengali text-sm text-muted-foreground italic">"{lang === "bn" ? review.review : review.reviewEn || review.review}"</p>
                        <div className="flex items-center gap-2 mt-2">
                          {review.approved ? (
                            <span className="text-xs text-green-500">✓ {t("অনুমোদিত", "Approved")}</span>
                          ) : (
                            <span className="text-xs text-yellow-500">⏸ {t("অপেক্ষায়", "Pending")}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "teachers" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bengali text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t("শিক্ষক ম্যানেজমেন্ট", "Teachers Management")}
                  </h2>
                  <button
                    onClick={() => setShowTeacherForm(!showTeacherForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    {t("নতুন শিক্ষক", "New Teacher")}
                  </button>
                </div>

                {showTeacherForm && (
                  <form onSubmit={handleTeacherSubmit} className="space-y-4 p-4 bg-secondary/30 rounded-lg mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("নাম (বাংলা)", "Name (Bangla)")} *</label>
                        <input
                          type="text"
                          value={newTeacher.name}
                          onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("নাম (English)", "Name (English)")}</label>
                        <input
                          type="text"
                          value={newTeacher.nameEn}
                          onChange={(e) => setNewTeacher({ ...newTeacher, nameEn: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("পদবি (বাংলা)", "Designation (Bangla)")} *</label>
                        <input
                          type="text"
                          value={newTeacher.designation}
                          onChange={(e) => setNewTeacher({ ...newTeacher, designation: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("পদবি (English)", "Designation (English)")}</label>
                        <input
                          type="text"
                          value={newTeacher.designationEn}
                          onChange={(e) => setNewTeacher({ ...newTeacher, designationEn: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bengali text-sm font-medium mb-1 block">{t("ক্যাম্পাস", "Campus")}</label>
                      <select
                        value={newTeacher.campus}
                        onChange={(e) => setNewTeacher({ ...newTeacher, campus: e.target.value as "boys" | "girls" })}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                      >
                        <option value="boys">{t("বালক", "Boys")}</option>
                        <option value="girls">{t("বালিকা", "Girls")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bengali text-sm font-medium mb-1 block">{t("ছবি", "Image")}</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80">
                          <Upload className="w-4 h-4" />
                          {teacherImage ? teacherImage.name : t("ছবি নির্বাচন", "Select Image")}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setTeacherImage(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                        {teacherImage && (
                          <button type="button" onClick={() => setTeacherImage(null)} className="text-red-500 text-sm">
                            {t("বাতিল", "Cancel")}
                          </button>
                        )}
                      </div>
                    </div>
                    <motion.button
                      type="submit"
                      disabled={uploading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {t("যোগ করুন", "Add")}
                    </motion.button>
                  </form>
                )}

                {teachers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t("কোনো শিক্ষক নেই", "No teachers yet")}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teachers.map((teacher) => (
                      <div key={teacher.id} className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            {teacher.imageUrl ? (
                              <img src={teacher.imageUrl} alt={teacher.name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                {teacher.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-bengali font-bold">{lang === "bn" ? teacher.name : teacher.nameEn || teacher.name}</p>
                              <p className="font-bengali text-sm text-muted-foreground">{lang === "bn" ? teacher.designation : teacher.designationEn || teacher.designation}</p>
                              <p className="font-bengali text-xs text-accent">{teacher.campus === "boys" ? t("বালক", "Boys") : t("বালিকা", "Girls")}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteTeacher(teacher.id!)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "tours" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bengali text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t("ভার্চুয়াল ট্যুর ম্যানেজমেন্ট", "Virtual Tours Management")}
                  </h2>
                  <button
                    onClick={() => setShowTourForm(!showTourForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    {t("নতুন ট্যুর", "New Tour")}
                  </button>
                </div>

                {showTourForm && (
                  <form onSubmit={handleTourSubmit} className="space-y-4 p-4 bg-secondary/30 rounded-lg mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("শিরোনাম (বাংলা)", "Title (Bangla)")} *</label>
                        <input
                          type="text"
                          value={newTour.title}
                          onChange={(e) => setNewTour({ ...newTour, title: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("শিরোনাম (English)", "Title (English)")}</label>
                        <input
                          type="text"
                          value={newTour.titleEn}
                          onChange={(e) => setNewTour({ ...newTour, titleEn: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("বিবরণ (বাংলা)", "Description (Bangla)")}</label>
                        <textarea
                          value={newTour.description}
                          onChange={(e) => setNewTour({ ...newTour, description: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="font-bengali text-sm font-medium mb-1 block">{t("বিবরণ (English)", "Description (English)")}</label>
                        <textarea
                          value={newTour.descriptionEn}
                          onChange={(e) => setNewTour({ ...newTour, descriptionEn: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bengali text-sm font-medium mb-1 block">{t("YouTube/Vimeo URL", "YouTube/Vimeo URL")}</label>
                      <input
                        type="url"
                        value={newTour.videoUrl}
                        onChange={(e) => setNewTour({ ...newTour, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/embed/..."
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        YouTube ekatra URL: https://www.youtube.com/embed/VIDEO_ID
                      </p>
                    </div>
                    <motion.button
                      type="submit"
                      disabled={uploading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {t("যোগ করুন", "Add")}
                    </motion.button>
                  </form>
                )}

                {virtualTours.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t("কোনো ভার্চুয়াল ট্যুর নেই", "No virtual tours yet")}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {virtualTours.map((tour) => (
                      <div key={tour.id} className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bengali font-bold">{lang === "bn" ? tour.title : tour.titleEn || tour.title}</p>
                            {tour.description && (
                              <p className="font-bengali text-sm text-muted-foreground mt-1">
                                {lang === "bn" ? tour.description : tour.descriptionEn || tour.description}
                              </p>
                            )}
                            {tour.videoUrl && (
                              <a
                                href={tour.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline mt-2 block"
                              >
                                🔗 {t("ভিডিও দেখুন", "View Video")}
                              </a>
                            )}
                          </div>
                          <button onClick={() => handleDeleteTour(tour.id!)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "admissions" && (
              <div>
                <h2 className="font-bengali text-xl font-bold flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5" />
                  {t("ভর্তি আবেদন", "Admissions")}
                </h2>
                {admissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t("কোনো আবেদন নেই", "No applications yet")}</p>
                ) : (
                  <div className="space-y-4">
                    {admissions.map((admission) => (
                      <div key={admission.id} className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bengali font-bold">{admission.studentNameBn || admission.studentName}</p>
                            <p className="text-sm text-muted-foreground">{admission.class} • {admission.campus}</p>
                          </div>
                          <button onClick={() => handleDeleteAdmission(admission.id!)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{t("পিতা", "Father")}: {admission.fatherNameBn || admission.fatherName} • {admission.fatherPhone}</p>
                          <p>{t("মাতা", "Mother")}: {admission.motherNameBn || admission.motherName} • {admission.motherPhone}</p>
                          <p>{t("ঠিকানা", "Address")}: {admission.presentAddressBn || admission.presentAddress}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Admin;
