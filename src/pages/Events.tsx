import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WaveDivider from "@/components/WaveDivider";
import { getEvents, Event } from "@/lib/events";

const eventTypeColors: Record<string, string> = {
  exam: "bg-red-500",
  holiday: "bg-green-500",
  event: "bg-blue-500",
  other: "bg-yellow-500",
};

const Calendar = () => {
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const months = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];
  const monthsEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);

  const getEventsForDay = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => {
      const startDate = new Date(e.startDate);
      const endDate = e.endDate ? new Date(e.endDate) : startDate;
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const navigateMonth = (direction: number) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const upcomingEvents = events
    .filter((e) => new Date(e.endDate || e.startDate) >= new Date())
    .slice(0, 5);

  return (
    <div>
      <section className="relative h-48 md:h-64 bg-primary overflow-hidden flex items-center justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bengali text-primary-foreground"
          style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}
        >
          {t("ইভেন্ট ক্যালেন্ডার", "Event Calendar")}
        </motion.h1>
        <WaveDivider className="absolute bottom-0" />
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card-institutional p-6">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-secondary rounded-lg"
                  >
                    ←
                  </button>
                  <h2 className="font-bengali text-xl font-bold">
                    {lang === "bn" ? months[selectedMonth] : monthsEn[selectedMonth]} {selectedYear}
                  </h2>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-secondary rounded-lg"
                  >
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                  {["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"].map((day, i) => (
                    <div key={i} className="text-sm font-medium text-muted-foreground py-2">
                      {lang === "bn" ? day : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDay(day);
                    const isToday = new Date().getDate() === day && 
                      new Date().getMonth() === selectedMonth && 
                      new Date().getFullYear() === selectedYear;
                    return (
                      <div
                        key={day}
                        className={`min-h-[80px] p-2 rounded-lg border ${
                          isToday ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <span className={`text-sm ${isToday ? "font-bold text-primary" : ""}`}>{day}</span>
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event, j) => (
                            <div
                              key={j}
                              className={`text-xs text-white px-1 py-0.5 rounded truncate ${eventTypeColors[event.type] || "bg-gray-500"}`}
                              title={event.endDate && event.endDate !== event.startDate ? `${event.startDate} - ${event.endDate}` : event.startDate}
                            >
                              {event.endDate && event.endDate !== event.startDate 
                                ? `${new Date(event.startDate).getDate()}-${new Date(event.endDate).getDate()} `
                                : ""
                              }{lang === "bn" ? event.titleBn : event.titleEn}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{dayEvents.length - 2}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <div className="card-institutional p-6">
                <h3 className="font-bengali text-lg font-bold mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {t("আসন্ন ইভেন্ট", "Upcoming Events")}
                </h3>
                {loading ? (
                  <p className="text-muted-foreground">{t("লোড হচ্ছে...", "Loading...")}</p>
                ) : upcomingEvents.length === 0 ? (
                  <p className="text-muted-foreground">{t("কোনো ইভেন্ট নেই", "No upcoming events")}</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <CalendarIcon className="w-4 h-4" />
                          {event.endDate && event.endDate !== event.startDate 
                            ? `${new Date(event.startDate).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")} - ${new Date(event.endDate).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}`
                            : new Date(event.startDate).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")
                          }
                        </div>
                        <p className="font-bengali font-medium">
                          {lang === "bn" ? event.titleBn : event.titleEn}
                        </p>
                        <span className={`inline-block text-xs text-white px-2 py-0.5 rounded mt-1 ${eventTypeColors[event.type] || "bg-gray-500"}`}>
                          {event.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-institutional p-6 mt-6">
                <h3 className="font-bengali text-lg font-bold mb-4">
                  {t("ইভেন্টের ধরন", "Event Types")}
                </h3>
                <div className="space-y-2">
                  {[
                    { type: "exam", bn: "পরীক্ষা", en: "Exam", color: "bg-red-500" },
                    { type: "holiday", bn: "ছুটি", en: "Holiday", color: "bg-green-500" },
                    { type: "event", bn: "অনুষ্ঠান", en: "Event", color: "bg-blue-500" },
                    { type: "other", bn: "অন্যান্য", en: "Other", color: "bg-yellow-500" },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="font-bengali text-sm">
                        {lang === "bn" ? item.bn : item.en}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Calendar;
