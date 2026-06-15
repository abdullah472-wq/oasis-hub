import { v4 as uuidv4 } from "uuid";
import { saveSubject } from "@/lib/subjects";
import type { Subject, SubjectMarkConfig, SubjectGpaConfig, SubjectCreditConfig } from "@/lib/subjects";

export interface ClassSubjectAssignment {
  subjectId: string;
  subjectCode: string;
  nameBn: string;
  nameEn: string;
  orderIndex: number;
  markConfig?: SubjectMarkConfig;
  gpaConfig?: SubjectGpaConfig;
  creditConfig?: SubjectCreditConfig;
}

export interface ClassConfig {
  id: string;
  className: string;
  classNameEn: string;
  academicYear: string;
  session: string;
  subjects: ClassSubjectAssignment[];
  groups: string[];
  locked: boolean;
  tenantId: string;
  createdAt: number;
  updatedAt: number;
}

const CLASS_CONFIGS_COLLECTION = "class_subject_configs";
const CLASS_CONFIGS_CACHE_KEY = "oasis_class_configs_v1";

export const normalizeClassConfig = (input: Partial<ClassConfig>, index: number): ClassConfig => ({
  id: String(input.id || `class-config-${Date.now()}-${index}`),
  className: String(input.className || ""),
  classNameEn: String(input.classNameEn || input.className || ""),
  academicYear: String(input.academicYear || new Date().getFullYear().toString()),
  session: String(input.session || "annual"),
  subjects: Array.isArray(input.subjects) ? input.subjects : [],
  groups: Array.isArray(input.groups) ? input.groups : [],
  locked: Boolean(input.locked),
  tenantId: String(input.tenantId || "default"),
  createdAt: Number(input.createdAt || Date.now()),
  updatedAt: Number(input.updatedAt || Date.now()),
});

export const createClassConfig = (overrides: Partial<ClassConfig> = {}): ClassConfig => {
  const now = Date.now();
  return normalizeClassConfig({
    id: uuidv4(),
    className: "",
    classNameEn: "",
    academicYear: new Date().getFullYear().toString(),
    session: "annual",
    subjects: [],
    groups: [],
    locked: false,
    tenantId: "default",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }, 0);
};

export const addSubjectToClass = (config: ClassConfig, subject: Subject): ClassConfig => {
  const exists = config.subjects.some((item) => item.subjectId === subject.id);
  if (exists) return config;

  const assignment: ClassSubjectAssignment = {
    subjectId: subject.id,
    subjectCode: subject.code,
    nameBn: subject.nameBn,
    nameEn: subject.nameEn,
    orderIndex: config.subjects.length,
    markConfig: subject.markConfig,
    gpaConfig: subject.gpaConfig,
    creditConfig: subject.creditConfig,
  };

  return {
    ...config,
    subjects: [...config.subjects, assignment],
    updatedAt: Date.now(),
  };
};

export const removeSubjectFromClass = (config: ClassConfig, subjectId: string): ClassConfig => ({
  ...config,
  subjects: config.subjects.filter((item) => item.subjectId !== subjectId).map((item, index) => ({ ...item, orderIndex: index })),
  updatedAt: Date.now(),
});

export const reorderClassSubjects = (config: ClassConfig, orderedIds: string[]): ClassConfig => {
  const subjectMap = new Map(config.subjects.map((item) => [item.subjectId, item]));
  const reordered: ClassSubjectAssignment[] = [];
  for (const id of orderedIds) {
    const subject = subjectMap.get(id);
    if (subject) reordered.push({ ...subject, orderIndex: reordered.length });
  }
  return {
    ...config,
    subjects: reordered,
    updatedAt: Date.now(),
  };
};

export const updateClassSubjectMarks = (
  config: ClassConfig,
  subjectId: string,
  markConfig: SubjectMarkConfig,
): ClassConfig => ({
  ...config,
  subjects: config.subjects.map((item) => (item.subjectId === subjectId ? { ...item, markConfig } : item)),
  updatedAt: Date.now(),
});

export const updateClassSubjectGpa = (
  config: ClassConfig,
  subjectId: string,
  gpaConfig: SubjectGpaConfig,
): ClassConfig => ({
  ...config,
  subjects: config.subjects.map((item) => (item.subjectId === subjectId ? { ...item, gpaConfig } : item)),
  updatedAt: Date.now(),
});

export const updateClassSubjectCredits = (
  config: ClassConfig,
  subjectId: string,
  creditConfig: SubjectCreditConfig,
): ClassConfig => ({
  ...config,
  subjects: config.subjects.map((item) => (item.subjectId === subjectId ? { ...item, creditConfig } : item)),
  updatedAt: Date.now(),
});

export const copyClassConfig = (source: ClassConfig, targetClassName: string): ClassConfig => {
  const now = Date.now();
  return normalizeClassConfig(
    {
      id: uuidv4(),
      className: targetClassName,
      classNameEn: targetClassName,
      subjects: source.subjects.map((item) => ({ ...item, id: undefined })),
      groups: [...source.groups],
      locked: false,
      tenantId: source.tenantId,
      createdAt: now,
      updatedAt: now,
    },
    0,
  );
};

export const validateMarkDistribution = (markConfig: SubjectMarkConfig | undefined): boolean => {
  if (!markConfig) return true;
  const fullMarks = markConfig.fullMarks || 0;
  const passMarks = markConfig.passMarks || 0;
  if (passMarks > fullMarks) return false;
  if (!fullMarks) return true;

  if (typeof markConfig.testMarks === "number" && typeof markConfig.semesterMarks === "number") {
    return markConfig.testMarks + markConfig.semesterMarks === fullMarks;
  }
  const written = markConfig.writtenMarks || 0;
  const oral = markConfig.oralMarks || 0;
  const practical = markConfig.practicalMarks || 0;
  const assignment = markConfig.assignmentMarks || 0;
  return written + oral + practical + assignment === fullMarks;
};
