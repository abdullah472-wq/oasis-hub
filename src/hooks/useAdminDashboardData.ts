import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";
import { saveNewsToFirestore, getNewsFromFirestore, deleteNewsFromFirestore, updateNewsInFirestore, type NewsPost } from "@/lib/news";
import { saveGalleryImage, getGalleryImages, deleteGalleryImage, type GalleryImage } from "@/lib/gallery";
import { saveEvent, getEvents, deleteEvent, type Event } from "@/lib/events";
import { getAdmissions, deleteAdmission, type AdmissionForm } from "@/lib/admission";
import { saveNotice, getNotices, deleteNotice, uploadPdf, type Notice } from "@/lib/notices";
import { saveResult, getResults, deleteResult, uploadResultPdf, type Result } from "@/lib/results";
import { getAllReviews, approveReview, deleteReview, type Review } from "@/lib/reviews";
import { addTeacher, getTeachers, deleteTeacher, uploadTeacherImage, type Teacher } from "@/lib/teachers";
import { addVirtualTour, getVirtualTours, deleteVirtualTour, type VirtualTour } from "@/lib/virtualTour";
import {
  getActivityFeed,
  getDashboardSettings,
  logActivity,
  saveDashboardSettings,
  type ActivityItem,
  type DashboardSettings,
  type GuardianRequest,
} from "@/lib/adminDashboard";
import {
  createManagedUser,
  deleteManagedUserProfile,
  listUsersByRole,
  type FirestoreUserProfile,
  type ManagerFormValues,
  updateManagedUser,
} from "@/lib/adminUsers";
import {
  createFeeEntriesBatch,
  deleteFeeEntry,
  listFeeEntries,
  updateFeeEntry,
  updateFeeEntryPayment,
  type FeeBatchDraft,
  type FeeEntry,
  type FeeEntryUpdateInput,
} from "@/lib/feeEntries";
import { buildFeeEntryUpdatePayload, buildFeeStudentOptions, calculateFeeSummary } from "@/lib/feeHelpers";
import { listAttendanceRecords, saveAttendanceSheet, type AttendanceRecord, type AttendanceSheetRowInput } from "@/lib/attendanceService";
import { calculateAttendanceMonthlySummary } from "@/lib/attendanceHelpers";
import { listStudents, type StudentRecord } from "@/lib/students";
import {
  deleteRamadanSponsor,
  listRamadanSponsorRequests,
  updateRamadanSponsor,
  type RamadanSponsor,
  type RamadanSponsorUpdateInput,
} from "@/lib/ramadanSponsors";
import { getRamadanSettings, saveRamadanSettings, type RamadanSettings } from "@/lib/ramadanSettings";
import {
  getRunningNoticeSettings,
  saveRunningNoticeSettings,
  type RunningNoticeSettings,
} from "@/lib/runningNoticeSettings";
import {
  createGuardianRequestByAdmin,
  deleteGuardianRequest,
  listGuardianRequests,
  subscribeGuardianRequests,
  updateGuardianRequest,
} from "@/lib/guardianRequests";
import {
  activateGuardianAccount,
  createGuardianAccountByAdmin,
  type GuardianRegistrationInput,
} from "@/lib/guardianRegistration";
import { deleteAchievement, getAchievements, saveAchievement, type AchievementItem } from "@/lib/achievements";
import { listDailyEngagement, type DailyEngagement } from "@/lib/engagementAnalytics";

const mergeAttendanceRecords = (current: AttendanceRecord[], nextItems: AttendanceRecord[]) => {
  const map = new Map(current.map((item) => [item.id, item] as const));
  nextItems.forEach((item) => map.set(item.id, item));

  return Array.from(map.values()).sort(
    (a, b) => b.date.localeCompare(a.date) || a.className.localeCompare(b.className) || a.roll - b.roll,
  );
};

export const useAdminDashboardData = (enabled = true) => {
  const [loading, setLoading] = useState(true);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionForm[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [virtualTours, setVirtualTours] = useState<VirtualTour[]>([]);
  const [managers, setManagers] = useState<FirestoreUserProfile[]>([]);
  const [feeEntries, setFeeEntries] = useState<FeeEntry[]>([]);
  const [attendanceStudents, setAttendanceStudents] = useState<StudentRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [guardianRequests, setGuardianRequests] = useState<GuardianRequest[]>([]);
  const [ramadanRequests, setRamadanRequests] = useState<RamadanSponsor[]>([]);
  const [ramadanSettings, setRamadanSettings] = useState<RamadanSettings>({ isPublic: true, updatedAt: Date.now() });
  const [runningNoticeSettings, setRunningNoticeSettings] = useState<RunningNoticeSettings>({
    runningNoticeEnabled: true,
    runningNotices: [],
    updatedAt: Date.now(),
  });
  const [settings, setSettings] = useState<DashboardSettings>(getDashboardSettings());
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [dailyEngagement, setDailyEngagement] = useState<DailyEngagement[]>([]);

  useEffect(() => {
    let isMounted = true;

    if (!enabled) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const load = async () => {
      setLoading(true);
      try {
        const [
          nextNews,
          nextGallery,
          nextEvents,
          nextAdmissions,
          nextNotices,
          nextResults,
          nextReviews,
          nextAchievements,
          nextTeachers,
          nextTours,
          nextManagers,
          nextFeeEntries,
          nextStudents,
          nextAttendanceRecords,
          nextGuardianRequests,
          nextRamadanRequests,
          nextRamadanSettings,
          nextRunningNoticeSettings,
          nextDailyEngagement,
        ] = await Promise.all([
          getNewsFromFirestore().catch(() => []),
          getGalleryImages().catch(() => []),
          getEvents().catch(() => []),
          getAdmissions().catch(() => []),
          getNotices().catch(() => []),
          getResults().catch(() => []),
          getAllReviews().catch(() => []),
          getAchievements().catch(() => []),
          getTeachers().catch(() => []),
          getVirtualTours().catch(() => []),
          listUsersByRole("manager").catch(() => []),
          listFeeEntries().catch(() => []),
          listStudents().catch(() => []),
          listAttendanceRecords().catch(() => []),
          listGuardianRequests().catch(() => []),
          listRamadanSponsorRequests().catch(() => []),
          getRamadanSettings().catch(() => ({ isPublic: true, updatedAt: Date.now() })),
          getRunningNoticeSettings().catch(() => ({ runningNoticeEnabled: true, runningNotices: [], updatedAt: Date.now() })),
          listDailyEngagement().catch(() => []),
        ]);

        if (!isMounted) return;

        setNewsPosts(nextNews);
        setGalleryImages(nextGallery);
        setEvents(nextEvents);
        setAdmissions(nextAdmissions);
        setNotices(nextNotices);
        setResults(nextResults);
        setReviews(nextReviews);
        setAchievements(nextAchievements);
        setTeachers(nextTeachers);
        setVirtualTours(nextTours);
        setManagers(nextManagers);
        setFeeEntries(nextFeeEntries);
        setAttendanceStudents(nextStudents);
        setAttendanceRecords(nextAttendanceRecords);
        setGuardianRequests(nextGuardianRequests);
        setRamadanRequests(nextRamadanRequests);
        setRamadanSettings(nextRamadanSettings);
        setRunningNoticeSettings(nextRunningNoticeSettings);
        setDailyEngagement(nextDailyEngagement);
        setSettings(getDashboardSettings());
        setActivityFeed(getActivityFeed());
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribeGuardianRequests((items) => {
      setGuardianRequests(items);
    });

    return unsubscribe;
  }, [enabled]);

  const refreshActivity = () => setActivityFeed(getActivityFeed());

  const appendActivity = (title: string, detail: string, module: string) => {
    logActivity({ title, detail, module });
    refreshActivity();
  };

  const notifySaved = (bn: string, en: string) => {
    toast.success(`${bn} / ${en}`);
  };

  const addNews = async (payload: Omit<NewsPost, "id" | "createdAt" | "date"> & { id?: string }, imageFile: File | null) => {
    const { id: _ignoredId, ...restPayload } = payload;
    let imageUrl = "";
    if (imageFile) imageUrl = await uploadImage(imageFile);

    const saved = await saveNewsToFirestore({
      ...restPayload,
      imageUrl,
      date: new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" }),
    });
    setNewsPosts((current) => [saved, ...current]);
    appendActivity("News published", restPayload.titleBn, "news");
    notifySaved("সংবাদ সংরক্ষণ হয়েছে", "News saved");
    return saved;
  };

  const saveNewsItem = async (
    payload: Omit<NewsPost, "createdAt" | "date">,
    imageFile: File | null,
  ) => {
    if (!payload.id) {
      return addNews(payload, imageFile);
    }

    let imageUrl = payload.imageUrl || "";
    if (imageFile) imageUrl = await uploadImage(imageFile);

    const nextDate = new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
    await updateNewsInFirestore(payload.id, {
      titleBn: payload.titleBn,
      titleEn: payload.titleEn,
      excerptBn: payload.excerptBn,
      excerptEn: payload.excerptEn,
      imageUrl,
      date: nextDate,
    });

    setNewsPosts((current) =>
      current
        .map((item) =>
          item.id === payload.id
            ? {
                ...item,
                titleBn: payload.titleBn,
                titleEn: payload.titleEn,
                excerptBn: payload.excerptBn,
                excerptEn: payload.excerptEn,
                imageUrl,
                date: nextDate,
                createdAt: Date.now(),
              }
            : item,
        )
        .sort((a, b) => b.createdAt - a.createdAt),
    );
    appendActivity("News updated", payload.titleBn, "news");
    notifySaved("সংবাদ আপডেট হয়েছে", "News updated");
  };

  const removeNews = async (id: string) => {
    await deleteNewsFromFirestore(id);
    setNewsPosts((current) => current.filter((item) => item.id !== id));
    appendActivity("News removed", "A news item was deleted", "news");
  };

  const addGalleryItem = async (payload: Omit<GalleryImage, "id" | "src" | "createdAt">, imageFile: File) => {
    const imageUrl = await uploadImage(imageFile);
    const saved = await saveGalleryImage({ ...payload, src: imageUrl });
    setGalleryImages((current) => [saved, ...current]);
    appendActivity("Gallery image added", payload.titleBn, "gallery");
    notifySaved("গ্যালারি সংরক্ষণ হয়েছে", "Gallery saved");
    return saved;
  };

  const removeGalleryItem = async (id: string) => {
    await deleteGalleryImage(id);
    setGalleryImages((current) => current.filter((item) => item.id !== id));
    appendActivity("Gallery item removed", "A gallery item was deleted", "gallery");
  };

  const addEventItem = async (payload: Omit<Event, "id" | "createdAt">) => {
    const saved = await saveEvent(payload);
    setEvents((current) => [...current, saved].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
    appendActivity("Event added", payload.titleBn, "events");
    notifySaved("ইভেন্ট সংরক্ষণ হয়েছে", "Event saved");
    return saved;
  };

  const removeEventItem = async (id: string) => {
    await deleteEvent(id);
    setEvents((current) => current.filter((item) => item.id !== id));
    appendActivity("Event removed", "An event was deleted", "events");
  };

  const addNoticeItem = async (payload: Omit<Notice, "id" | "createdAt" | "pdfUrl">, file: File | null) => {
    const pdfUrl = file ? await uploadPdf(file) : undefined;
    const saved = await saveNotice({ ...payload, pdfUrl });
    setNotices((current) => [saved, ...current]);
    appendActivity("Notice published", payload.titleBn, "notices");
    notifySaved("নোটিশ সংরক্ষণ হয়েছে", "Notice saved");
    return saved;
  };

  const removeNoticeItem = async (id: string) => {
    await deleteNotice(id);
    setNotices((current) => current.filter((item) => item.id !== id));
    appendActivity("Notice removed", "A notice was deleted", "notices");
  };

  const addResultItem = async (payload: Omit<Result, "id" | "createdAt" | "pdfUrl">, file: File | null) => {
    const pdfUrl = file ? await uploadResultPdf(file) : undefined;
    const saved = await saveResult({
      ...payload,
      ...(pdfUrl ? { pdfUrl } : {}),
    });
    setResults((current) => [saved, ...current]);
    appendActivity("Result published", `${payload.exam} - ${payload.className}`, "results");
    notifySaved("ফলাফল সংরক্ষণ হয়েছে", "Result saved");
    return saved;
  };

  const removeResultItem = async (id: string) => {
    await deleteResult(id);
    setResults((current) => current.filter((item) => item.id !== id));
    appendActivity("Result removed", "A result was deleted", "results");
  };

  const approveReviewItem = async (id: string) => {
    await approveReview(id);
    setReviews((current) => current.map((item) => (item.id === id ? { ...item, approved: true } : item)));
    appendActivity("Review approved", "A review is now visible", "reviews");
    notifySaved("রিভিউ অনুমোদন করা হয়েছে", "Review approved");
  };

  const addAchievementItem = async (payload: Omit<AchievementItem, "id" | "createdAt">) => {
    const saved = await saveAchievement(payload);
    setAchievements((current) => [saved, ...current]);
    appendActivity("Achievement published", payload.titleBn, "achievements");
    notifySaved("অর্জন সংরক্ষণ হয়েছে", "Achievement saved");
    return saved;
  };

  const removeAchievementItem = async (id: string) => {
    await deleteAchievement(id);
    setAchievements((current) => current.filter((item) => item.id !== id));
    appendActivity("Achievement removed", "An achievement item was deleted", "achievements");
  };

  const removeReviewItem = async (id: string) => {
    await deleteReview(id);
    setReviews((current) => current.filter((item) => item.id !== id));
    appendActivity("Review removed", "A review was deleted", "reviews");
  };

  const addTeacherItem = async (payload: Omit<Teacher, "id" | "createdAt" | "imageUrl">, file: File | null) => {
    const imageUrl = file ? await uploadTeacherImage(file) : undefined;
    const saved = await addTeacher({ ...payload, imageUrl });
    setTeachers((current) => [saved, ...current]);
    appendActivity("Teacher added", payload.name, "teachers");
    notifySaved("শিক্ষক তথ্য সংরক্ষণ হয়েছে", "Teacher saved");
    return saved;
  };

  const removeTeacherItem = async (id: string) => {
    await deleteTeacher(id);
    setTeachers((current) => current.filter((item) => item.id !== id));
    appendActivity("Teacher removed", "A teacher profile was deleted", "teachers");
  };

  const addVirtualTourItem = async (payload: Omit<VirtualTour, "id" | "createdAt">) => {
    const saved = await addVirtualTour(payload);
    setVirtualTours((current) => [saved, ...current]);
    appendActivity("Virtual tour added", payload.title, "virtualTours");
    notifySaved("ভার্চুয়াল ট্যুর সংরক্ষণ হয়েছে", "Virtual tour saved");
    return saved;
  };

  const removeVirtualTourItem = async (id: string) => {
    await deleteVirtualTour(id);
    setVirtualTours((current) => current.filter((item) => item.id !== id));
    appendActivity("Virtual tour removed", "A virtual tour was deleted", "virtualTours");
  };

  const removeAdmissionItem = async (id: string) => {
    await deleteAdmission(id);
    setAdmissions((current) => current.filter((item) => item.id !== id));
    appendActivity("Admission removed", "An admission record was deleted", "admissions");
  };

  const saveManagerItem = async (manager: ManagerFormValues) => {
    if (manager.uid) {
      await updateManagedUser(manager.uid, {
        fullName: manager.fullName,
        email: manager.email,
        role: manager.role,
        status: manager.status,
        permissions: manager.permissions,
      });
      setManagers((current) =>
        current.map((item) =>
          item.uid === manager.uid
            ? {
                ...item,
                fullName: manager.fullName,
                email: manager.email.trim().toLowerCase(),
                role: manager.role,
                status: manager.status,
                permissions: manager.permissions,
              }
            : item,
        ),
      );
    } else {
      const created = await createManagedUser(manager);
      setManagers((current) => [created, ...current]);
    }
    appendActivity("Manager updated", manager.fullName, "managers");
    notifySaved("ম্যানেজার তথ্য সংরক্ষণ হয়েছে", "Manager saved");
  };

  const removeManagerItem = async (uid: string) => {
    await deleteManagedUserProfile(uid);
    setManagers((current) => current.filter((item) => item.uid !== uid));
    appendActivity("Manager removed", "A manager profile was deleted", "managers");
  };

  const addFeeBatchItems = async (draft: FeeBatchDraft, createdBy: string) => {
    const created = await createFeeEntriesBatch(draft, createdBy);
    setFeeEntries((current) => [...created, ...current]);
    appendActivity("Fee batch added", `${draft.studentName} - ${created.length}`, "fees");
    notifySaved("ফি তথ্য সংরক্ষণ হয়েছে", "Fee entries saved");
  };

  const updateFeeEntryItem = async (id: string, payload: FeeEntryUpdateInput) => {
    const nextPayload = buildFeeEntryUpdatePayload(payload);
    await updateFeeEntry(id, nextPayload);
    setFeeEntries((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...nextPayload,
              updatedAt: Date.now(),
            }
          : item,
      ),
    );
    appendActivity("Fee updated", nextPayload.title, "fees");
    notifySaved("ফি তথ্য আপডেট হয়েছে", "Fee updated");
  };

  const updateFeePaymentItem = async (id: string, paidAmount: number) => {
    const currentEntry = feeEntries.find((item) => item.id === id);
    if (!currentEntry) return;

    const nextPayload = buildFeeEntryUpdatePayload({
      title: currentEntry.title,
      category: currentEntry.category,
      amount: currentEntry.amount,
      paidAmount,
      billingMonth: currentEntry.billingMonth,
      note: currentEntry.note || "",
    });

    await updateFeeEntryPayment(id, {
      paidAmount: nextPayload.paidAmount,
      dueAmount: nextPayload.dueAmount,
      status: nextPayload.status,
    });

    setFeeEntries((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              paidAmount: nextPayload.paidAmount,
              dueAmount: nextPayload.dueAmount,
              status: nextPayload.status,
              updatedAt: Date.now(),
            }
          : item,
      ),
    );
    appendActivity("Fee payment updated", currentEntry.title, "fees");
    notifySaved("পেমেন্ট আপডেট হয়েছে", "Payment updated");
  };

  const removeFeeEntryItem = async (id: string) => {
    await deleteFeeEntry(id);
    setFeeEntries((current) => current.filter((item) => item.id !== id));
    appendActivity("Fee removed", "A fee entry was deleted", "fees");
  };

  const saveAttendanceSheetItems = async (rows: AttendanceSheetRowInput[], markedBy: string) => {
    const saved = await saveAttendanceSheet(rows, markedBy);
    setAttendanceRecords((current) => mergeAttendanceRecords(current, saved));
    appendActivity("Attendance saved", `${rows.length} students updated`, "attendance");
    notifySaved("উপস্থিতি সংরক্ষণ হয়েছে", "Attendance saved");
  };

  const saveGuardianRequestItem = async (request: GuardianRequest) => {
    const exists = guardianRequests.some((item) => item.id === request.id);
    const previousRequest = guardianRequests.find((item) => item.id === request.id);

    if (exists) {
      setGuardianRequests((current) =>
        current.map((item) =>
          item.id === request.id
            ? {
                ...item,
                ...request,
              }
            : item,
        ),
      );

      try {
        await updateGuardianRequest(request.id, {
          topic: request.topic,
          message: request.message,
          status: request.status,
        });

        if (request.status === "resolved" && request.guardianUid && request.studentId) {
          await activateGuardianAccount({
            guardianUid: request.guardianUid,
            studentId: request.studentId,
            guardianName: request.guardianName,
            guardianPhone: request.guardianPhone,
            studentName: request.studentName,
            className: request.className,
            section: request.section,
          });
        }
      } catch (error) {
        if (previousRequest) {
          setGuardianRequests((current) =>
            current.map((item) => (item.id === request.id ? previousRequest : item)),
          );
        }
        throw error;
      }
      appendActivity("Guardian request updated", request.topic, "guardianRequests");
      notifySaved("গার্ডিয়ান রিকোয়েস্ট আপডেট হয়েছে", "Guardian request updated");
      return;
    }

    const created = await createGuardianRequestByAdmin({
      guardianUid: request.guardianUid,
      studentId: request.studentId,
      guardianName: request.guardianName,
      studentName: request.studentName,
      topic: request.topic,
      message: request.message,
      status: request.status,
    });

    setGuardianRequests((current) => [created, ...current]);
    appendActivity("Guardian request added", created.topic, "guardianRequests");
    notifySaved("গার্ডিয়ান রিকোয়েস্ট সংরক্ষণ হয়েছে", "Guardian request saved");
  };

  const createGuardianAccountItem = async (payload: GuardianRegistrationInput) => {
    await createGuardianAccountByAdmin(payload, "active");
    appendActivity("Guardian account created", payload.fullName, "guardianRequests");
    notifySaved("গার্ডিয়ান অ্যাকাউন্ট তৈরি হয়েছে", "Guardian account created");
  };

  const removeGuardianRequestItem = async (id: string) => {
    await deleteGuardianRequest(id);
    const next = guardianRequests.filter((item) => item.id !== id);
    setGuardianRequests(next);
    appendActivity("Guardian request removed", "A guardian request was deleted", "guardianRequests");
  };

  const saveSettingsItem = (nextSettings: DashboardSettings) => {
    setSettings(nextSettings);
    saveDashboardSettings(nextSettings);
    appendActivity("Settings saved", nextSettings.institutionName, "settings");
    notifySaved("সেটিংস সংরক্ষণ হয়েছে", "Settings saved");
  };

  const saveRamadanSettingsItem = async (nextSettings: Pick<RamadanSettings, "isPublic">) => {
    const saved = await saveRamadanSettings(nextSettings);
    setRamadanSettings(saved);
    appendActivity("Ramadan settings saved", saved.isPublic ? "Public page enabled" : "Public page hidden", "ramadan");
    notifySaved("রমাদান সেটিংস সংরক্ষণ হয়েছে", "Ramadan settings saved");
  };

  const saveRunningNoticeSettingsItem = async (
    nextSettings: Pick<RunningNoticeSettings, "runningNoticeEnabled" | "runningNotices">,
  ) => {
    const saved = await saveRunningNoticeSettings(nextSettings);
    setRunningNoticeSettings(saved);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("running-notice-settings-updated", { detail: saved }));
    }

    appendActivity(
      "Running notice settings saved",
      saved.runningNoticeEnabled ? "Running notice bar visible" : "Running notice bar hidden",
      "notices",
    );
    notifySaved("রানিং নোটিশ সংরক্ষণ হয়েছে", "Running notice saved");
  };

  const saveRamadanRequestItem = async (id: string, payload: RamadanSponsorUpdateInput) => {
    const saved = await updateRamadanSponsor(id, payload);
    setRamadanRequests((current) => current.map((item) => (item.id === id ? saved : item)));
    appendActivity("Ramadan request updated", payload.name, "ramadan");
    notifySaved("রমাদান রিকোয়েস্ট সংরক্ষণ হয়েছে", "Ramadan request saved");
  };

  const removeRamadanRequestItem = async (id: string) => {
    await deleteRamadanSponsor(id);
    setRamadanRequests((current) => current.filter((item) => item.id !== id));
    appendActivity("Ramadan request removed", "A Ramadan sponsor request was deleted", "ramadan");
  };

  const feeSummary = useMemo(() => calculateFeeSummary(feeEntries), [feeEntries]);
  const feeStudents = useMemo(() => buildFeeStudentOptions(attendanceStudents, admissions), [admissions, attendanceStudents]);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const attendanceSummary = useMemo(
    () => calculateAttendanceMonthlySummary(attendanceRecords.filter((item) => item.month === currentMonth)),
    [attendanceRecords, currentMonth],
  );

  const dashboardStats = useMemo(
    () => ({
      totalNews: newsPosts.length,
      totalNotices: notices.length,
      pendingReviews: reviews.filter((item) => !item.approved).length,
      pendingAdmissions: admissions.filter((item) => item.status === "pending").length,
      activeManagers: managers.filter((item) => item.status === "active").length,
      pendingGuardianRequests: guardianRequests.filter((item) => item.status !== "resolved").length,
      monthlyFees: feeSummary.totalDue,
      monthlyCollected: feeSummary.totalPaid,
      attendanceRate: attendanceSummary.attendancePercent,
    }),
    [admissions, attendanceSummary.attendancePercent, feeSummary.totalDue, feeSummary.totalPaid, guardianRequests, managers, newsPosts.length, notices.length, reviews],
  );

  return {
    loading,
    newsPosts,
    galleryImages,
    events,
    admissions,
    notices,
    results,
    reviews,
    achievements,
    teachers,
    virtualTours,
    managers,
    feeEntries,
    feeStudents,
    feeSummary,
    attendanceStudents,
    attendanceRecords,
    guardianRequests,
    ramadanRequests,
    ramadanSettings,
    runningNoticeSettings,
    settings,
    activityFeed,
    dailyEngagement,
    dashboardStats,
    actions: {
      addNews,
      saveNewsItem,
      removeNews,
      addGalleryItem,
      removeGalleryItem,
      addEventItem,
      removeEventItem,
      addNoticeItem,
      removeNoticeItem,
      addResultItem,
      removeResultItem,
      approveReviewItem,
      addAchievementItem,
      removeAchievementItem,
      removeReviewItem,
      addTeacherItem,
      removeTeacherItem,
      addVirtualTourItem,
      removeVirtualTourItem,
      removeAdmissionItem,
      saveManagerItem,
      removeManagerItem,
      addFeeBatchItems,
      updateFeeEntryItem,
      updateFeePaymentItem,
      removeFeeEntryItem,
      saveAttendanceSheetItems,
      saveGuardianRequestItem,
      createGuardianAccountItem,
      removeGuardianRequestItem,
      saveRamadanSettingsItem,
      saveRunningNoticeSettingsItem,
      saveRamadanRequestItem,
      removeRamadanRequestItem,
      saveSettingsItem,
    },
  };
};





