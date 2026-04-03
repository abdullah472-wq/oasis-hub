export type LocalizedText = {
  bn: string;
  en: string;
};

export const pickLocalizedText = (text: LocalizedText, lang: "bn" | "en") =>
  lang === "bn" ? text.bn : text.en;

export const siteBrand = {
  name: {
    bn: "আন্নূর শিক্ষা পরিবার",
    en: "Annoor Education Family",
  },
  founded: {
    bn: "প্রতিষ্ঠিত ২০১৩",
    en: "Founded 2013",
  },
  mission: {
    bn: "ঈমান ও শ্রেষ্ঠত্বের ভিত্তি গড়ি। আমাদের লক্ষ্য হলো ইসলামী মূল্যবোধের আলোকে আধুনিক শিক্ষা প্রদান।",
    en: "Building foundations of faith and excellence. Our mission is to provide modern education in the light of Islamic values.",
  },
  copyright: {
    bn: "আন্নূর শিক্ষা পরিবার। সর্বস্বত্ব সংরক্ষিত।",
    en: "Annoor Education Family. All rights reserved.",
  },
} as const;

export const navLabels = {
  home: { bn: "হোম", en: "Home" },
  about: { bn: "আমাদের সম্পর্কে", en: "About" },
  news: { bn: "সংবাদ", en: "News" },
  contact: { bn: "যোগাযোগ", en: "Contact" },
  ramadan: { bn: "রমজান", en: "Ramadan" },
  admission: { bn: "ভর্তি", en: "Admission" },
  admissionInfo: { bn: "ভর্তি তথ্য", en: "Admission Info" },
  onlineAdmission: { bn: "অনলাইন ভর্তি", en: "Online Admission" },
  academic: { bn: "একাডেমিক", en: "Academic" },
  teachers: { bn: "শিক্ষকবৃন্দ", en: "Teachers" },
  notices: { bn: "নোটিশ বোর্ড", en: "Notice" },
  results: { bn: "পরীক্ষার ফলাফল", en: "Results" },
  gallery: { bn: "গ্যালারি", en: "Gallery" },
  events: { bn: "ইভেন্ট ক্যালেন্ডার", en: "Events" },
} as const;

export const footerLabels = {
  quickLinks: { bn: "দ্রুত লিংক", en: "Quick Links" },
  aboutUs: { bn: "আমাদের সম্পর্কে", en: "About Us" },
  examResults: { bn: "পরীক্ষার ফলাফল", en: "Exam Results" },
  contact: { bn: "যোগাযোগ", en: "Contact" },
  principal: { bn: "প্রধান শিক্ষক", en: "Principal" },
  manager: { bn: "ম্যানেজার", en: "Manager" },
  bank: { bn: "ব্যাংক", en: "Bank" },
  address: {
    bn: "মেইন রোড, কাপাসিয়া বাজার, কাপাসিয়া, গাজীপুর",
    en: "Main Road, Kapasia Bazar, Kapasia, Gazipur",
  },
  principalName: {
    bn: "হাফেজ আমানুল্লাহ",
    en: "Hafez Amanullah",
  },
  managerName: {
    bn: "মুফতি আব্দুল্লাহ আল মামুন",
    en: "Mufti Abdullah Al Mamon",
  },
} as const;
