import { useFormContext, type Control } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { GuardianRegisterValues } from "./schema";

interface StudentInfoSectionProps {
  control: Control<GuardianRegisterValues>;
}

const StudentInfoSection = ({ control }: StudentInfoSectionProps) => {
  const { t } = useLanguage();
  const { watch, setValue } = useFormContext<GuardianRegisterValues>();
  const gender = watch("gender");

  const normalizeStudentId = (value: string, targetGender: GuardianRegisterValues["gender"]) => {
    const digits = value.replace(/\D/g, "");
    if (targetGender === "female") {
      return digits ? `G-${digits}` : "G-";
    }
    return digits;
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bengali text-xl font-semibold text-foreground">{t("শিক্ষার্থীর তথ্য", "Student Information")}</h3>
        <p className="font-bengali text-sm text-muted-foreground">{t("শিক্ষার্থীর প্রাথমিক পরিচিতির তথ্য দিন", "Provide the student's primary identification details")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField control={control} name="gender" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("লিঙ্গ", "Gender")}</FormLabel>
            <FormControl>
              <select
                value={field.value}
                onChange={(event) => {
                  const nextGender = event.target.value as GuardianRegisterValues["gender"];
                  field.onChange(nextGender);
                  setValue("studentId", normalizeStudentId(watch("studentId") || "", nextGender), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="male">{t("ছেলে", "Boy")}</option>
                <option value="female">{t("মেয়ে", "Girl")}</option>
              </select>
            </FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />

        <FormField control={control} name="studentId" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("শিক্ষার্থী আইডি", "Student ID")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                inputMode="numeric"
                pattern="(G-)?[0-9]*"
                onChange={(event) => {
                  const nextValue = normalizeStudentId(event.target.value, gender);
                  field.onChange(nextValue);
                }}
                className="rounded-2xl"
                placeholder={t("শুধু সংখ্যা দিন", "Digits only")}
              />
            </FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />

        <FormField control={control} name="studentName" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("শিক্ষার্থীর নাম", "Student Name")}</FormLabel>
            <FormControl><Input {...field} className="rounded-2xl" /></FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />

        <FormField control={control} name="className" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("শ্রেণি", "Class")}</FormLabel>
            <FormControl>
              <select
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="">{t("শ্রেণি নির্বাচন করুন", "Select class")}</option>
                {[
                  "Play",
                  "Nursery",
                  "Class 1",
                  "Class 2",
                  "Class 3",
                  "Class 4",
                  "Class 5",
                  "Class 6",
                  "Class 7",
                  "Class 8",
                  "Class 9",
                  "Class 10",
                ].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />

        <FormField control={control} name="section" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("সেকশন", "Section")}</FormLabel>
            <FormControl>
              <select
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              >
                <option value="">{t("সেকশন নির্বাচন করুন", "Select section")}</option>
                <option value="Nurani">Nurani</option>
                <option value="Nazera">Nazera</option>
              </select>
            </FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />

      </div>
    </div>
  );
};

export default StudentInfoSection;
