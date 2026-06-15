import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";
import { saveNewsToFirestore, getNewsFromFirestore, deleteNewsFromFirestore, updateNewsInFirestore, type NewsPost } from "@/lib/news";
import { saveGalleryImage, getGalleryImages, deleteGalleryImage, type GalleryImage } from "@/lib/gallery";
import { saveEvent, getEvents, deleteEvent, type Event } from "@/lib/events";
import { deleteAdmission, getAdmissions, updateAdmissionStatus, type AdmissionForm, type AdmissionStatus } from "@/lib/admission";
import { saveNotice, getNotices, deleteNotice, uploadPdf, type Notice } from "@/lib/notices";
import { saveResult, saveResultsBatch, getResults, deleteResult, uploadResultPdf, type Result } from "@/lib/results";
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
  ensureMonthlyFeeEntries,
  listFeeEntries,
  updateFeeEntry,
  updateFeeEntryPayment,
  type FeeBatchDraft,
  type FeeEntry,
  type FeeEntryUpdateInput,
} from "@/lib/feeEntries";
import { buildFeeEntryUpdatePayload, buildFeeStudentOptions, calculateFeeSummary } from "@/lib/feeHelpers";
import { deleteAttendanceRecord, listAttendanceRecords, saveAttendanceSheet, type AttendanceRecord, type AttendanceSheetRowInput } from "@/lib/attendanceService";
import { calculateAttendanceMonthlySummary } from "@/lib/attendanceHelpers";
import {
  deleteGuardianProfileRecord,
  deleteGuardianUserRecord,
  deleteStudentGuardianLink,
  deleteStudentRecord,
  listStudents,
  syncStudentRecord,
  type StudentRecord,
} from "@/lib/students";
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
import {
  createMobileAppNotification,
  deleteMobileAppNotification,
  listMobileAppNotifications,
  type MobileAppNotification,
} from "@/lib/mobileNotifications";
import {
  getAppDownloadSettings,
  saveAppDownloadSettings,
  type AppDownloadSettings,
} from "@/lib/appDownloadSettings";
import {
  deleteClassRoutineConfig,
  listClassRoutineConfigs,
  saveClassRoutineConfig,
  type ClassRoutineConfig,
} from "@/lib/classRoutine";
import {
  deleteClassSubjectConfig,
  listClassSubjectConfigs,
  saveClassSubjectConfig,
  type ClassSubjectConfig,
} from "@/lib/classSubjects";
import {
  listSubjects as listSubjectsFromFirestore,
  saveSubject as saveSubjectToFirestore,
  deleteSubject as deleteSubjectFromFirestore,
  updateSubjectStatus as updateSubjectStatusInFirestore,
  updateSubjectOrder as updateSubjectOrderInFirestore,
  type Subject,
  type SubjectStatus,
} from "@/lib/subjects";
import {
  listSubjectGroups as listSubjectGroupsFromFirestore,
  saveSubjectGroup as saveSubjectGroupToFirestore,
  deleteSubjectGroup as deleteSubjectGroupFromFirestore,
  type SubjectGroup,
} from "@/lib/subjectGroups";
import {
  listAccounts as listAccountsFromFirestore,
  createChartOfAccount as saveAccountToFirestore,
  deleteChartOfAccount as deleteAccountFromFirestore,
  listJournals as listJournalsFromFirestore,
  createJournal as saveJournalToFirestore,
  updateJournalStatus as updateJournalStatusInFirestore,
  deleteJournal as deleteJournalFromFirestore,
  createDonation as saveDonationToFirestore,
  listDonations as listDonationsFromFirestore,
  createBankAccount as saveBankToFirestore,
  listBankAccounts as listBanksFromFirestore,
  updateBankAccount as updateBankInFirestore,
  deleteBankAccount as deleteBankFromFirestore,
  type ChartOfAccount,
  type JournalEntry,
  type DonationRecord,
  type BankAccount,
  type VoucherStatus,
} from "@/lib/accounting";
import {
  deleteExamName,
  getExamNames,
  saveExamName,
  type ExamName,
} from "@/lib/examNames";
import {
  getExams as getExamsFromFirestore,
  saveExam as saveExamToFirestore,
  updateExam as updateExamInFirestore,
  deleteExam as deleteExamFromFirestore,
  type Exam,
  type ExamStatus,
} from "@/lib/examManagement";
import {
  listGradingSystems as listGradingSystemsFromFirestore,
  saveGradingSystem as saveGradingSystemToFirestore,
  deleteGradingSystem as deleteGradingSystemFromFirestore,
  type GradingSystem,
} from "@/lib/gradingSystems";

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
  const [examNames, setExamNames] = useState<ExamName[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [gradingSystems, setGradingSystems] = useState<GradingSystem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [virtualTours, setVirtualTours] = useState<VirtualTour[]>([]);
  const [managers, setManagers] = useState<FirestoreUserProfile[]>([]);
  const [feeEntries, setFeeEntries] = useState<FeeEntry[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);
  const [classSubjectConfigs, setClassSubjectConfigs] = useState<ClassSubjectConfig[]>([]);
  const [classRoutineConfigs, setClassRoutineConfigs] = useState<ClassRoutineConfig[]>([]);
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
  const [mobileNotifications, setMobileNotifications] = useState<MobileAppNotification[]>([]);
  const [appDownloadSettings, setAppDownloadSettings] = useState<AppDownloadSettings>({
    enabled: false,
    apkUrl: "",
    version: "",
    releaseNotesBn: "",
    releaseNotesEn: "",
    fileName: "",
    fileSizeLabel: "",
    updatedAt: 0,
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
          nextExamNames,
          nextExams,
          nextGradingSystems,
          nextReviews,
          nextAchievements,
          nextTeachers,
          nextTours,
          nextManagers,
          nextFeeEntries,
          nextSubjects,
          nextSubjectGroups,
          nextClassSubjectConfigs,
          nextClassRoutineConfigs,
          nextAccounts,
          nextJournals,
          nextDonations,
          nextBankAccounts,
          nextStudents,
          nextAttendanceRecords,
          nextGuardianRequests,
          nextRamadanRequests,
          nextRamadanSettings,
          nextRunningNoticeSettings,
          nextMobileNotifications,
          nextAppDownloadSettings,
          nextDailyEngagement,
        ] = await Promise.all([
          getNewsFromFirestore().catch(() => []),
          getGalleryImages().catch(() => []),
          getEvents().catch(() => []),
          getAdmissions().catch(() => []),
          getNotices().catch(() => []),
          getResults().catch(() => []),
          getExamNames().catch(() => []),
          getExamsFromFirestore().catch(() => []),
          listGradingSystemsFromFirestore().catch(() => []),
          getAllReviews().catch(() => []),
          getAchievements().catch(() => []),
          getTeachers().catch(() => []),
          getVirtualTours().catch(() => []),
          listUsersByRole("manager").catch(() => []),
          listFeeEntries().catch(() => []),
          listSubjectsFromFirestore().catch(() => []),
          listSubjectGroupsFromFirestore().catch(() => []),
listClassSubjectConfigs().catch(() => []),
          listClassRoutineConfigs().catch(() => []),
          listAccountsFromFirestore().catch(() => []),
          listJournalsFromFirestore().catch(() => []),
          listDonationsFromFirestore().catch(() => []),
          listBanksFromFirestore().catch(() => []),
          listStudents().catch(() => []),
          listAttendanceRecords().catch(() => []),
          listGuardianRequests().catch(() => []),
          listRamadanSponsorRequests().catch(() => []),
          getRamadanSettings().catch(() => ({ isPublic: true, updatedAt: Date.now() })),
          getRunningNoticeSettings().catch(() => ({ runningNoticeEnabled: true, runningNotices: [], updatedAt: Date.now() })),
          listMobileAppNotifications().catch(() => []),
          getAppDownloadSettings().catch(() => ({
            enabled: false,
            apkUrl: "",
            version: "",
            releaseNotesBn: "",
            releaseNotesEn: "",
            fileName: "",
            fileSizeLabel: "",
            updatedAt: 0,
          })),
          listDailyEngagement().catch(() => []),
        ]);

        if (!isMounted) return;

        setNewsPosts(nextNews);
        setGalleryImages(nextGallery);
        setEvents(nextEvents);
        setAdmissions(nextAdmissions);
        setNotices(nextNotices);
        setResults(nextResults);
        setExamNames(nextExamNames);
        setExams(nextExams);
        setGradingSystems(nextGradingSystems);
        setReviews(nextReviews);
        setAchievements(nextAchievements);
        setTeachers(nextTeachers);
        setVirtualTours(nextTours);
        setManagers(nextManagers);
        setFeeEntries(nextFeeEntries);
        setSubjects(nextSubjects);
        setSubjectGroups(nextSubjectGroups);
        setClassSubjectConfigs(nextClassSubjectConfigs);
        setClassRoutineConfigs(nextClassRoutineConfigs);
        setAccounts(nextAccounts);
        setJournals(nextJournals);
        setDonations(nextDonations);
        setBankAccounts(nextBankAccounts);
        setAttendanceStudents(nextStudents);
        setAttendanceRecords(nextAttendanceRecords);
        setGuardianRequests(nextGuardianRequests);
        setRamadanRequests(nextRamadanRequests);
        setRamadanSettings(nextRamadanSettings);
        setRunningNoticeSettings(nextRunningNoticeSettings);
        setMobileNotifications(nextMobileNotifications);
        setAppDownloadSettings(nextAppDownloadSettings);
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

  const addResultBatchItems = async (payloads: Array<Omit<Result, "id" | "createdAt" | "pdfUrl">>) => {
    const saved = await saveResultsBatch(payloads);
    setResults((current) => [...saved, ...current]);
    if (payloads[0]) {
      appendActivity("Class results published", `${payloads[0].exam} - ${payloads[0].className}`, "results");
    }
    notifySaved("ক্লাস রেজাল্ট সংরক্ষণ হয়েছে", "Class results saved");
    return saved;
  };

  const removeResultItem = async (id: string) => {
    await deleteResult(id);
    setResults((current) => current.filter((item) => item.id !== id));
    appendActivity("Result removed", "A result was deleted", "results");
  };

  const saveSubjectItem = async (payload: Omit<Subject, "createdAt" | "updatedAt"> & { id?: string }) => {
    const saved = await saveSubjectToFirestore(payload);
    setSubjects((current) => {
      const next = current.filter((item) => item.id !== saved.id);
      return [...next, saved].sort((a, b) => a.orderIndex - b.orderIndex);
    });
    appendActivity("Subject saved", saved.nameBn, "subjects");
    notifySaved("বিষয় সংরক্ষণ হয়েছে", "Subject saved");
    return saved;
  };

  const deleteSubjectItem = async (id: string) => {
    await deleteSubjectFromFirestore(id);
    setSubjects((current) => current.filter((item) => item.id !== id));
    appendActivity("Subject removed", "A subject was deleted", "subjects");
  };

  const updateSubjectStatusItem = async (id: string, status: SubjectStatus) => {
    await updateSubjectStatusInFirestore(id, status);
    setSubjects((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    appendActivity("Subject status updated", status, "subjects");
  };

  const updateSubjectOrderItem = async (updatedSubjects: Subject[]) => {
    await updateSubjectOrderInFirestore(updatedSubjects);
    setSubjects(updatedSubjects);
    appendActivity("Subjects reordered", `${updatedSubjects.length} subjects`, "subjects");
  };

  const saveSubjectGroupItem = async (payload: Omit<SubjectGroup, "createdAt" | "updatedAt"> & { id?: string }) => {
    const saved = await saveSubjectGroupToFirestore(payload);
    setSubjectGroups((current) => {
      const next = current.filter((item) => item.id !== saved.id);
      return [...next, saved].sort((a, b) => a.orderIndex - b.orderIndex);
    });
    appendActivity("Subject group saved", saved.nameBn, "subject-groups");
    notifySaved("গ্রুপ সংরক্ষণ হয়েছে", "Group saved");
    return saved;
  };

  const deleteSubjectGroupItem = async (id: string) => {
    await deleteSubjectGroupFromFirestore(id);
    setSubjectGroups((current) => current.filter((item) => item.id !== id));
    appendActivity("Subject group removed", "A group was deleted", "subject-groups");
  };

  const saveAccountItem = async (payload: any) => {
    const saved = await saveAccountToFirestore(payload);
    setAccounts((current) => {
      const next = current.filter((item) => item.id !== saved.id);
      return [...next, saved].sort((a, b) => a.orderIndex - b.orderIndex);
    });
    appendActivity("Account saved", saved.name, "accounts");
    notifySaved("অ্যাকাউন্ট সংরক্ষণ হয়েছে", "Account saved");
    return saved;
  };

  const deleteAccountItem = async (id: string) => {
    await deleteAccountFromFirestore(id);
    setAccounts((current) => current.filter((item) => item.id !== id));
    appendActivity("Account removed", "An account was deleted", "accounts");
  };

  const saveJournalItem = async (payload: any) => {
    const saved = await saveJournalToFirestore(payload);
    setJournals((current) => [saved, ...current]);
    appendActivity("Journal entry saved", saved.voucherNumber, "accounts");
    notifySaved("জার্নাল সংরক্ষণ হয়েছে", "Journal saved");
    return saved;
  };

  const deleteJournalItem = async (id: string) => {
    await deleteJournalFromFirestore(id);
    setJournals((current) => current.filter((item) => item.id !== id));
    appendActivity("Journal removed", "A journal entry was deleted", "accounts");
  };

  const updateJournalStatusItem = async (id: string, status: VoucherStatus) => {
    await updateJournalStatusInFirestore(id, status);
    setJournals((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    appendActivity("Journal status updated", status, "accounts");
  };

  const saveDonationItem = async (payload: any) => {
    const saved = await saveDonationToFirestore(payload);
    setDonations((current) => [saved, ...current]);
    appendActivity("Donation saved", saved.donorName, "accounts");
    notifySaved("দান সংরক্ষণ হয়েছে", "Donation saved");
    return saved;
  };

  const saveBankItem = async (payload: any) => {
    const saved = await saveBankToFirestore(payload);
    setBankAccounts((current) => {
      const next = current.filter((item) => item.id !== saved.id);
      return [...next, saved].sort((a, b) => a.bankName.localeCompare(b.bankName));
    });
    appendActivity("Bank account saved", saved.bankName, "accounts");
    notifySaved("ব্যাংক অ্যাকাউন্ট সংরক্ষণ হয়েছে", "Bank account saved");
    return saved;
  };

  const deleteBankItem = async (id: string) => {
    await deleteBankFromFirestore(id);
    setBankAccounts((current) => current.filter((item) => item.id !== id));
    appendActivity("Bank account removed", "A bank account was deleted", "accounts");
  };

  const saveClassSubjectConfigItem = async (payload: Omit<ClassSubjectConfig, "createdAt" | "updatedAt">) => {
    const saved = await saveClassSubjectConfig(payload);
    setClassSubjectConfigs((current) => {
      const next = current.filter((item) => item.id !== saved.id);
      return [...next, saved].sort((a, b) => a.className.localeCompare(b.className));
    });
    appendActivity("Class subject config saved", saved.className, "results");
    notifySaved("ক্লাসের বিষয় সংরক্ষণ হয়েছে", "Class subjects saved");
    return saved;
  };

  const removeClassSubjectConfigItem = async (id: string) => {
    await deleteClassSubjectConfig(id);
    setClassSubjectConfigs((current) => current.filter((item) => item.id !== id));
    appendActivity("Class subject config removed", id, "results");
  };

  const saveClassRoutineConfigItem = async (payload: Omit<ClassRoutineConfig, "createdAt" | "updatedAt">) => {
    const saved = await saveClassRoutineConfig(payload);
    setClassRoutineConfigs((current) => {
      const next = current.filter((item) => item.id !== saved.id);
      return [...next, saved].sort((a, b) => a.className.localeCompare(b.className));
    });
    appendActivity("Class routine config saved", saved.className, "attendance");
    notifySaved("ক্লাস রুটিন সংরক্ষণ হয়েছে", "Class routine saved");
    return saved;
  };

  const removeClassRoutineConfigItem = async (id: string) => {
    await deleteClassRoutineConfig(id);
    setClassRoutineConfigs((current) => current.filter((item) => item.id !== id));
    appendActivity("Class routine config removed", id, "attendance");
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

  const syncAdmissionStudentRecord = async (item: AdmissionForm) => {
    if (!item.id) return;

    const studentId = item.approvedStudentId?.trim() || item.id;

    await syncStudentRecord({
      studentId,
      studentName: item.studentNameBn || item.studentName,
      className: item.approvedClass || item.class,
      section: item.approvedSection || "",
      roll: Number(item.approvedRoll || 0),
      monthlyFee: Number(item.approvedMonthlyFee || 0),
      guardianUid: "",
      guardianName: item.fatherNameBn || item.fatherName || item.motherNameBn || item.motherName || "",
      guardianPhone: item.fatherPhone || item.motherPhone || "",
      status: "active",
    });
  };

  const saveAdmissionStatusItem = async (
    payload: AdmissionFormValues,
    imageFile: File | null,
  ) => {
    if (!payload.id) {
      const saved = await addAdmission(payload, imageFile);
      setAdmissions((current) =>
        [saved, ...current].sort((a, b) => b.createdAt - a.createdAt),
      );
      appendActivity("Admission added", saved.studentName, "admissions");
      notifySaved("ভর্তি সংরক্ষণ হয়েছে", "Admission saved");
      return saved;
    }

    let imageUrl = payload.imageUrl || "";
    if (imageFile) imageUrl = await uploadImage(imageFile);

    const updated = await updateAdmissionStatus(payload.id, {
      studentName: payload.studentName,
      class: payload.class,
      status: payload.status,
      imageUrl,
      phone: payload.phone,
    });

    setAdmissions((current) =>
      current
        .map((item) => (item.id === payload.id ? updated : item))
        .sort((a, b) => b.createdAt - a.createdAt),
    );
    appendActivity("Admission updated", updated.studentName, "admissions");
    notifySaved("ভর্তি আপডেট হয়েছে", "Admission updated");
    return updated;
  };

  const removeAdmissionItem = async (id: string) => {
    const currentItem = admissions.find((item) => item.id === id);
    await deleteAdmission(id);
    await deleteStudentRecord(currentItem?.approvedStudentId?.trim() || id).catch(() => undefined);
    setAdmissions((current) => current.filter((item) => item.id !== id));
    setAttendanceStudents(await listStudents());
    appendActivity("Admission removed", "An admission record was deleted", "admissions");
  };

  const saveExamNameItem = async (payload: Omit<ExamName, "id" | "createdAt">) => {
    const saved = await saveExamName(payload);
    setExamNames((current) => [...current, saved]);
    appendActivity("Exam name saved", payload.name, "examNames");
    notifySaved("পরীক্ষার নাম সংরক্ষণ হয়েছে", "Exam name saved");
    return saved;
  };

  const removeExamNameItem = async (id: string) => {
    await deleteExamName(id);
    setExamNames((current) => current.filter((item) => item.id !== id));
    appendActivity("Exam name removed", id, "examNames");
    notifySaved("পরীক্ষার নাম বাদ হয়েছে", "Exam name removed");
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

  const addFeeBulkBatchItems = async (drafts: FeeBatchDraft[], createdBy: string) => {
    const createdGroups = await Promise.all(drafts.map((draft) => createFeeEntriesBatch(draft, createdBy)));
    const created = createdGroups.flat().sort((a, b) => b.createdAt - a.createdAt);

    if (created.length === 0) return;

    setFeeEntries((current) => [...created, ...current]);
    appendActivity("Fee batch added", `${drafts.length} student batches created`, "fees");
    notifySaved("ক্লাসভিত্তিক ফি সংরক্ষণ হয়েছে", "Class-wise fee entries saved");
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

  const removeStudentItem = async (student: StudentRecord) => {
    const studentId = student.studentId.trim();
    const guardianUid = student.guardianUid.trim();
    const siblingCount = guardianUid
      ? attendanceStudents.filter((item) => item.guardianUid.trim() === guardianUid).length
      : 0;

    const relatedFeeEntries = feeEntries.filter((item) => item.studentId === studentId);
    const relatedAttendanceRecords = attendanceRecords.filter((item) => item.studentId === studentId);
    const relatedGuardianRequests = guardianRequests.filter(
      (item) => item.studentId === studentId || (guardianUid && item.guardianUid === guardianUid),
    );
    const relatedResults = results.filter((item) => item.studentId === studentId);
    const relatedAdmissions = admissions.filter((item) => item.id === studentId);
    const relatedRamadanRequests = ramadanRequests.filter((item) => item.studentId === studentId);

    await Promise.all([
      ...relatedFeeEntries.map((item) => deleteFeeEntry(item.id)),
      ...relatedAttendanceRecords.map((item) => deleteAttendanceRecord(item.id)),
      ...relatedGuardianRequests.map((item) => deleteGuardianRequest(item.id)),
      ...relatedResults.filter((item): item is Result & { id: string } => Boolean(item.id)).map((item) => deleteResult(item.id!)),
      ...relatedAdmissions.filter((item): item is AdmissionForm & { id: string } => Boolean(item.id)).map((item) => deleteAdmission(item.id!)),
      ...relatedRamadanRequests.filter((item): item is RamadanSponsor & { id: string } => Boolean(item.id)).map((item) => deleteRamadanSponsor(item.id!)),
      deleteStudentRecord(studentId).catch(() => undefined),
      deleteStudentGuardianLink(studentId).catch(() => undefined),
    ]);

    if (guardianUid && siblingCount <= 1) {
      await Promise.all([
        deleteGuardianProfileRecord(guardianUid).catch(() => undefined),
        deleteGuardianUserRecord(guardianUid).catch(() => undefined),
      ]);
    }

    setFeeEntries((current) => current.filter((item) => item.studentId !== studentId));
    setAttendanceRecords((current) => current.filter((item) => item.studentId !== studentId));
    setGuardianRequests((current) =>
      current.filter((item) => item.studentId !== studentId && (!guardianUid || item.guardianUid !== guardianUid)),
    );
    setResults((current) => current.filter((item) => item.studentId !== studentId));
    setAdmissions((current) => current.filter((item) => item.id !== studentId));
    setRamadanRequests((current) => current.filter((item) => item.studentId !== studentId));
    setAttendanceStudents((current) => current.filter((item) => item.studentId !== studentId));

    appendActivity("Student removed", `${student.studentName || studentId} deleted`, "students");
    notifySaved("শিক্ষার্থীর সংশ্লিষ্ট তথ্য মুছে ফেলা হয়েছে", "Student-related data deleted");

    if (guardianUid && siblingCount <= 1) {
      toast.message(
        "Guardian app documents were removed. Firebase Auth login may still need manual cleanup.",
      );
    }
  };

  const updateStudentItem = async (student: StudentRecord) => {
    await syncStudentRecord({
      studentId: student.studentId,
      studentName: student.studentName,
      className: student.className,
      section: student.section,
      roll: Number(student.roll || 0),
      monthlyFee: Number(student.monthlyFee || 0),
      guardianUid: student.guardianUid,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      status: student.status || "active",
    });

    setAttendanceStudents(await listStudents());
    appendActivity("Student updated", `${student.studentName || student.studentId} updated`, "students");
    notifySaved("শিক্ষার্থীর তথ্য আপডেট হয়েছে", "Student information updated");
  };

  const saveSettingsItem = (nextSettings: DashboardSettings) => {
    setSettings(nextSettings);
    saveDashboardSettings(nextSettings);
    appendActivity("Settings saved", nextSettings.institutionName, "settings");
    notifySaved("সেটিংস সংরক্ষণ হয়েছে", "Settings saved");
  };

  const saveAppDownloadSettingsItem = async (
    nextSettings: Omit<AppDownloadSettings, "updatedAt">,
  ) => {
    const saved = await saveAppDownloadSettings({
      ...nextSettings,
      apkUrl: nextSettings.apkUrl.trim(),
      fileName: nextSettings.fileName.trim(),
      fileSizeLabel: nextSettings.fileSizeLabel.trim(),
    });

    setAppDownloadSettings(saved);
    appendActivity("Guardian app updated", saved.version || saved.fileName || "APK upload settings saved", "settings");
    notifySaved("গার্ডিয়ান অ্যাপ সেটিংস সংরক্ষণ হয়েছে", "Guardian app settings saved");
  };

  const sendMobileNotificationItem = async (
    payload: Omit<MobileAppNotification, "id" | "createdAt" | "createdBy">,
    createdBy: string,
  ) => {
    const fallbackTitle =
      payload.titleBn.trim() ||
      payload.titleEn.trim() ||
      payload.messageBn.trim().slice(0, 60) ||
      payload.messageEn.trim().slice(0, 60);
    const saved = await createMobileAppNotification({
      ...payload,
      titleBn: payload.titleBn.trim() || payload.titleEn.trim(),
      titleEn: payload.titleEn.trim() || payload.titleBn.trim(),
      messageBn: payload.messageBn.trim() || payload.messageEn.trim(),
      messageEn: payload.messageEn.trim() || payload.messageBn.trim(),
      createdBy,
    });

    setMobileNotifications((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
    appendActivity("Mobile notification sent", fallbackTitle, "mobile-notifications");
    notifySaved("মোবাইল অ্যাপ নোটিফিকেশন পাঠানো হয়েছে", "Mobile app notification sent");
  };

  const removeMobileNotificationItem = async (id: string) => {
    await deleteMobileAppNotification(id);
    setMobileNotifications((current) => current.filter((item) => item.id !== id));
    appendActivity("Mobile notification deleted", id, "mobile-notifications");
    notifySaved("মোবাইল নোটিফিকেশন মুছে ফেলা হয়েছে", "Mobile notification deleted");
  };

  const saveExamItem = async (payload: Omit<Exam, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    const saved = await saveExamToFirestore(payload as Omit<Exam, "id" | "createdAt" | "updatedAt">);
    setExams((current) => {
      const next = current.filter((e) => e.id !== saved.id);
      return [saved, ...next].sort((a, b) => b.createdAt - a.createdAt);
    });
    appendActivity("Exam created", saved.name, "results");
    notifySaved("পরীক্ষা সংরক্ষণ হয়েছে", "Exam saved");
    return saved;
  };

  const removeExamItem = async (id: string) => {
    await deleteExamFromFirestore(id);
    setExams((current) => current.filter((e) => e.id !== id));
    appendActivity("Exam deleted", id, "results");
  };

  const updateExamStatusItem = async (id: string, status: ExamStatus) => {
    await updateExamInFirestore(id, { status });
    setExams((current) => current.map((e) => (e.id === id ? { ...e, status } : e)));
    appendActivity("Exam status updated", `${id} → ${status}`, "results");
  };

  const saveGradingSystemItem = async (payload: Omit<GradingSystem, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    const saved = await saveGradingSystemToFirestore(payload);
    setGradingSystems((current) => {
      const next = current.filter((g) => g.id !== saved.id);
      return [...next, saved].sort((a, b) => a.createdAt - b.createdAt);
    });
    appendActivity("Grading system saved", saved.name, "results");
    notifySaved("গ্রেডিং সিস্টেম সংরক্ষণ হয়েছে", "Grading system saved");
    return saved;
  };

  const removeGradingSystemItem = async (id: string) => {
    await deleteGradingSystemFromFirestore(id);
    setGradingSystems((current) => current.filter((g) => g.id !== id));
    appendActivity("Grading system deleted", id, "results");
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

  useEffect(() => {
    if (!enabled || feeStudents.length === 0) return;

    let isCancelled = false;

    const syncMonthlyFees = async () => {
      const created = await ensureMonthlyFeeEntries({
        students: feeStudents,
        existingEntries: feeEntries,
        billingMonth: currentMonth,
        createdBy: "system:auto-monthly",
      }).catch(() => []);

      if (isCancelled || created.length === 0) return;

      setFeeEntries((current) => [...created, ...current]);
      appendActivity("Monthly fees auto-added", `${created.length} dues created for ${currentMonth}`, "fees");
    };

    void syncMonthlyFees();

    return () => {
      isCancelled = true;
    };
  }, [currentMonth, enabled, feeEntries, feeStudents]);

  return {
    loading,
    newsPosts,
    galleryImages,
    events,
    admissions,
    notices,
    results,
    examNames,
    exams,
    gradingSystems,
    reviews,
    achievements,
    teachers,
    virtualTours,
    managers,
    feeEntries,
    accounts,
    journals,
    donations,
    bankAccounts,
    subjects,
    subjectGroups,
    classSubjectConfigs,
    classRoutineConfigs,
    feeStudents,
    feeSummary,
    attendanceStudents,
    guardianRequests,
    ramadanRequests,
    ramadanSettings,
    runningNoticeSettings,
    mobileNotifications,
    appDownloadSettings,
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
      addResultBatchItems,
      removeResultItem,
      saveAccountItem,
      deleteAccountItem,
      saveJournalItem,
      deleteJournalItem,
      updateJournalStatusItem,
      saveDonationItem,
      saveBankItem,
      deleteBankItem,
      saveSubjectItem,
      deleteSubjectItem,
      updateSubjectStatusItem,
      updateSubjectOrderItem,
      saveSubjectGroupItem,
      deleteSubjectGroupItem,
      saveClassSubjectConfigItem,
      removeClassSubjectConfigItem,
      saveClassRoutineConfigItem,
      removeClassRoutineConfigItem,
      saveExamNameItem,
      removeExamNameItem,
      saveExamItem,
      removeExamItem,
      updateExamStatusItem,
      saveGradingSystemItem,
      removeGradingSystemItem,
      approveReviewItem,
      addAchievementItem,
      removeAchievementItem,
      removeReviewItem,
      addTeacherItem,
      removeTeacherItem,
      addVirtualTourItem,
      removeVirtualTourItem,
      saveAdmissionStatusItem,
      removeAdmissionItem,
      saveManagerItem,
      removeManagerItem,
      addFeeBatchItems,
      addFeeBulkBatchItems,
      updateFeeEntryItem,
      updateFeePaymentItem,
      removeFeeEntryItem,
      saveAttendanceSheetItems,
      updateStudentItem,
      removeStudentItem,
      saveGuardianRequestItem,
      createGuardianAccountItem,
      removeGuardianRequestItem,
      saveRamadanSettingsItem,
      saveRunningNoticeSettingsItem,
      saveRamadanRequestItem,
      removeRamadanRequestItem,
      saveSettingsItem,
      saveAppDownloadSettingsItem,
      sendMobileNotificationItem,
      removeMobileNotificationItem,
    },
  };
};





