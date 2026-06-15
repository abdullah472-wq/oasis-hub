import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronDown, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { CLASS_NAME_OPTIONS, normalizeClassName } from "@/lib/attendanceHelpers";
import type { ClassRoutineConfig, ClassRoutineItem } from "@/lib/classRoutine";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DeleteIconButton,
  EmptyState,
  Field,
  FormCard,
  ModuleShell,
  shellCardClass,
} from "@/components/admin/AdminPagePrimitives";

const dayOptions = [
  { value: "saturday", labelBn: "শনিবার", labelEn: "Saturday" },
  { value: "sunday", labelBn: "রবিবার", labelEn: "Sunday" },
  { value: "monday", labelBn: "সোমবার", labelEn: "Monday" },
  { value: "tuesday", labelBn: "মঙ্গলবার", labelEn: "Tuesday" },
  { value: "wednesday", labelBn: "বুধবার", labelEn: "Wednesday" },
  { value: "thursday", labelBn: "বৃহস্পতিবার", labelEn: "Thursday" },
  { value: "friday", labelBn: "শুক্রবার", labelEn: "Friday" },
];

const createEmptyRoutineItem = (index: number): ClassRoutineItem => ({
  id: `routine-${Date.now()}-${index}`,
  day: "saturday",
  dayBn: "শনিবার",
  periodName: `Period ${index + 1}`,
  subjectName: "",
  subjectNameEn: "",
  teacherName: "",
  location: "",
});

const getDayLabel = (value: string, isBn: boolean) => {
  const option = dayOptions.find((item) => item.value === value);
  return option ? (isBn ? option.labelBn : option.labelEn) : value;
};

export const ClassRoutineManagerPage = ({
  configs,
  onSave,
  onDelete,
}: {
  configs: ClassRoutineConfig[];
  onSave: (payload: Omit<ClassRoutineConfig, "createdAt" | "updatedAt">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useLanguage();
  const classOptions = CLASS_NAME_OPTIONS;
  const maxRoutineCount = useMemo(
    () => configs.reduce((max, item) => Math.max(max, item.routine.length), 0),
    [configs],
  );
  const [saving, setSaving] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [className, setClassName] = useState("");
  const [classNameEn, setClassNameEn] = useState("");
  const [routine, setRoutine] = useState<ClassRoutineItem[]>([createEmptyRoutineItem(0)]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const selectedConfig = useMemo(
    () => configs.find((item) => normalizeClassName(item.className) === normalizeClassName(selectedClass)) || null,
    [configs, selectedClass],
  );

  useEffect(() => {
    if (!selectedConfig) return;

    const normalizedClass = normalizeClassName(selectedConfig.className);
    setSelectedClass(normalizedClass);
    setClassName(normalizedClass);
    setClassNameEn(selectedConfig.classNameEn || normalizedClass);
    setRoutine(
      selectedConfig.routine.length > 0
        ? selectedConfig.routine.map((item, index) => ({ ...item, id: item.id || `routine-${index + 1}` }))
        : [createEmptyRoutineItem(0)],
    );
  }, [selectedConfig?.id]);

  const resetForm = () => {
    setSelectedClass("");
    setClassName("");
    setClassNameEn("");
    setRoutine([createEmptyRoutineItem(0)]);
  };

  const updateRoutineItem = (index: number, patch: Partial<ClassRoutineItem>) => {
    setRoutine((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!className.trim()) return;

    setSaving(true);
    try {
      await onSave({
        id: selectedConfig?.id || "",
        className: className.trim(),
        classNameEn: classNameEn.trim(),
        routine: routine
          .map((item) => ({
            ...item,
            day: String(item.day || "saturday"),
            dayBn: item.dayBn ? String(item.dayBn) : undefined,
            periodName: item.periodName.trim() || "",
            subjectName: item.subjectName.trim(),
            subjectNameEn: item.subjectNameEn?.trim() || "",
            teacherName: item.teacherName?.trim() || "",
            location: item.location?.trim() || "",
          }))
          .filter((item) => item.subjectName),
      });
      setExpandedCardId(selectedConfig?.id || null);
      resetForm();
    } catch {
      toast.error(t("ক্লাস রুটিন সংরক্ষণ করা যায়নি", "Could not save class routine"));
      return;
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleShell
      title={t("ক্লাস রুটিন সেটআপ", "Class Routine Setup")}
      description={t(
        "প্রতি ক্লাসের জন্য দিবসভিত্তিক পিরিয়ড ও বিষয়ের রুটিন এখানে তৈরি করুন",
        "Create day-wise periods and subjects for each class here",
      )}
      icon={<BookOpen className="h-5 w-5" />}
      recordCount={configs.length}
      recordLabel={t("রুটিন", "Routines")}
    >
      <FormCard onSubmit={submit} saving={saving} submitLabel={t("ক্লাস রুটিন সংরক্ষণ করুন", "Save class routine")}> 
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("ক্লাস নির্বাচন করুন", "Select class")}>
            <select
              value={selectedClass}
              onChange={(event) => {
                const next = normalizeClassName(event.target.value);
                setSelectedClass(next);
                if (!next) {
                  resetForm();
                  return;
                }

                const matched = configs.find((item) => normalizeClassName(item.className) === next) || null;
                if (matched) {
                  setClassName(next);
                  setClassNameEn(matched.classNameEn || next);
                  setRoutine(matched.routine.length > 0 ? matched.routine : [createEmptyRoutineItem(0)]);
                  return;
                }

                setClassName(next);
                setClassNameEn(next);
                setRoutine([createEmptyRoutineItem(0)]);
              }}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
            >
              <option value="">{t("একটি ক্লাস নির্বাচন করুন", "Select a class")}</option>
              {classOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 pb-1">
            <p className="font-bengali text-sm font-semibold text-foreground">{t("রুটিন তালিকা", "Routine list")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-xl px-3 text-xs font-bengali gap-1.5"
              onClick={() => setRoutine((current) => [...current, createEmptyRoutineItem(current.length)])}
            >
              <Plus className="h-3.5 w-3.5" />
              {t("রুটিন যোগ করুন", "Add routine")}
            </Button>
          </div>

          <div className="divide-y divide-border/50 rounded-2xl border border-border/60 bg-muted/20 overflow-hidden">
            {routine.map((item, index) => (
              <div
                key={item.id}
                className="grid gap-x-3 gap-y-3 px-4 py-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_36px] items-end bg-background/60 hover:bg-background/90 transition-colors"
              >
                <Field label={t("দিবস", "Day")}>
                  <select
                    value={item.day}
                    onChange={(event) => updateRoutineItem(index, {
                      day: event.target.value,
                      dayBn: dayOptions.find((option) => option.value === event.target.value)?.labelBn,
                    })}
                    className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none"
                  >
                    {dayOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelBn, option.labelEn)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("পিরিয়ড", "Period") }>
                  <Input
                    value={item.periodName}
                    onChange={(event) => updateRoutineItem(index, { periodName: event.target.value })}
                    className="rounded-xl h-9 text-sm"
                  />
                </Field>
                <Field label={t("বিষয়ের নাম", "Subject name") }>
                  <Input
                    value={item.subjectName}
                    onChange={(event) => updateRoutineItem(index, { subjectName: event.target.value })}
                    className="rounded-xl h-9 text-sm"
                  />
                </Field>
                <Field label={t("শিক্ষকের নাম", "Teacher name") }>
                  <Input
                    value={item.teacherName || ""}
                    onChange={(event) => updateRoutineItem(index, { teacherName: event.target.value })}
                    className="rounded-xl h-9 text-sm"
                  />
                </Field>
                <div className="flex items-end justify-center pb-0.5">
                  <DeleteIconButton
                    onClick={() => setRoutine((current) => (current.length > 1 ? current.filter((_, itemIndex) => itemIndex !== index) : current))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" className="h-8 rounded-xl px-3 text-xs font-bengali" onClick={resetForm}>
            {t("রিসেট", "Reset")}
          </Button>
        </div>
      </FormCard>

      {configs.length === 0 ? (
        <Card className={shellCardClass}>
          <CardContent className="p-6">
            <EmptyState text={t("এখনও কোনো ক্লাস রুটিন সেট করা হয়নি", "No class routine has been configured yet")} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {configs.map((config, index) => {
            const tones = [
              {
                shell: "border-slate-200/70 bg-white",
                accent: "bg-sky-500",
                ringColor: "#0ea5e9",
                chip: "bg-sky-50 text-sky-700 border-sky-100",
                dot: "bg-sky-400",
              },
              {
                shell: "border-slate-200/70 bg-white",
                accent: "bg-emerald-500",
                ringColor: "#10b981",
                chip: "bg-emerald-50 text-emerald-700 border-emerald-100",
                dot: "bg-emerald-400",
              },
              {
                shell: "border-slate-200/70 bg-white",
                accent: "bg-amber-500",
                ringColor: "#f59e0b",
                chip: "bg-amber-50 text-amber-700 border-amber-100",
                dot: "bg-amber-400",
              },
              {
                shell: "border-slate-200/70 bg-white",
                accent: "bg-rose-500",
                ringColor: "#f43f5e",
                chip: "bg-rose-50 text-rose-700 border-rose-100",
                dot: "bg-rose-400",
              },
            ][index % 4];

            const isLeader = config.routine.length === maxRoutineCount && maxRoutineCount > 0;
            const ringPercent = maxRoutineCount > 0 ? Math.max((config.routine.length / maxRoutineCount) * 100, 8) : 8;

            return (
              <div
                key={config.id}
                className={cn(
                  "rounded-2xl border shadow-sm transition-shadow duration-200 hover:shadow-md overflow-hidden",
                  tones.shell,
                )}
              >
                <div className={cn("h-0.5 w-full", tones.accent)} />

                <div className="relative">
                  <div className="px-4 pt-3 pb-3 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="flex-1 text-left min-w-0"
                        onClick={() => setExpandedCardId((current) => (current === config.id ? null : config.id))}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", tones.dot)} />
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                            {t("দিবসভিত্তিক", "Day-wise")}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-semibold leading-tight text-slate-900 break-words">{config.className}</h3>
                          <Badge variant="outline" className={cn("rounded-full border text-[11px] px-2 py-0", tones.chip)}>
                            {config.routine.length} {t("পিরিয়ড", "periods")}
                          </Badge>
                          {isLeader ? (
                            <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-900 text-white text-[11px] px-2 py-0">
                              {t("সর্বোচ্চ", "Top")}
                            </Badge>
                          ) : null}
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full"
                          style={{
                            background: `conic-gradient(${tones.ringColor} ${ringPercent}%, #f1f5f9 0)`,
                          }}
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-slate-700">
                            {config.routine.length}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-xl p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setSelectedClass(config.className);
                            setClassName(config.className);
                            setClassNameEn(config.classNameEn || config.className);
                            setRoutine(config.routine.length > 0 ? config.routine : [createEmptyRoutineItem(0)]);
                            setExpandedCardId(config.id);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <DeleteIconButton onClick={() => void onDelete(config.id)} />
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setExpandedCardId((current) => (current === config.id ? null : config.id))}
                        >
                          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expandedCardId === config.id && "rotate-180")} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedCardId === config.id ? (
                    <div className="grid gap-2 p-3 md:grid-cols-2 xl:grid-cols-3 bg-slate-50/60">
                      {config.routine.map((entry) => (
                        <div key={entry.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <p className="font-bengali text-sm font-semibold text-slate-800 leading-tight truncate">{entry.subjectName}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{entry.periodName} • {getDayLabel(entry.day, true)}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                              {entry.teacherName || t("শিক্ষক নেই", "No teacher")}
                            </span>
                          </div>
                          <div className="space-y-1 text-[12px] text-slate-600">
                            {entry.location ? <p>{t("কক্ষ", "Room")}: {entry.location}</p> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ModuleShell>
  );
};

export default ClassRoutineManagerPage;
