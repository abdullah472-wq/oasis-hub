import { z } from "zod";
import type { GuardianRelationship } from "@/lib/guardianRegistration";

export const guardianRelationships: Array<{ value: GuardianRelationship; labelBn: string; labelEn: string }> = [
  { value: "Father", labelBn: "পিতা", labelEn: "Father" },
  { value: "Mother", labelBn: "মাতা", labelEn: "Mother" },
  { value: "Guardian", labelBn: "অভিভাবক", labelEn: "Guardian" },
];

export const guardianRegisterSchema = z.object({
  fullName: z.string().min(2, "পূর্ণ নাম লিখুন"),
  phone: z.string().min(6, "ফোন নম্বর লিখুন"),
  email: z.string().email("সঠিক ইমেইল দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
  gender: z.enum(["male", "female"], {
    required_error: "লিঙ্গ নির্বাচন করুন",
  }),
  relationship: z.enum(["Father", "Mother", "Guardian"], {
    required_error: "সম্পর্ক নির্বাচন করুন",
  }),
  address: z.string().optional(),
  nid: z.string().optional(),
  studentId: z
    .string()
    .min(1, "শিক্ষার্থী আইডি দিন")
    .regex(/^(G-)?\d+$/, "শিক্ষার্থী আইডি শুধুমাত্র সংখ্যা হবে (মেয়েদের জন্য G- যুক্ত হবে)"),
  studentName: z.string().min(2, "শিক্ষার্থীর নাম লিখুন"),
  className: z.string().min(1, "শ্রেণি লিখুন"),
  section: z.string().optional(),
});

export type GuardianRegisterValues = z.infer<typeof guardianRegisterSchema>;
