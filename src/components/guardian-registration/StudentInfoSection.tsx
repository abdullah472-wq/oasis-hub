import type { Control } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { GuardianRegisterValues } from "./schema";

interface StudentInfoSectionProps {
  control: Control<GuardianRegisterValues>;
}

const StudentInfoSection = ({ control }: StudentInfoSectionProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bengali text-xl font-semibold text-foreground">{t("শিক্ষার্থীর তথ্য", "Student Information")}</h3>
        <p className="font-bengali text-sm text-muted-foreground">{t("শিক্ষার্থীর প্রাথমিক পরিচিতির তথ্য দিন", "Provide the student's primary identification details")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField control={control} name="studentId" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("শিক্ষার্থী আইডি", "Student ID")}</FormLabel>
            <FormControl><Input {...field} className="rounded-2xl" /></FormControl>
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
            <FormControl><Input {...field} className="rounded-2xl" /></FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />

        <FormField control={control} name="section" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("সেকশন", "Section")}</FormLabel>
            <FormControl><Input {...field} className="rounded-2xl" /></FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />

        <FormField control={control} name="roll" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("রোল", "Roll")}</FormLabel>
            <FormControl><Input type="number" min="1" {...field} onChange={(event) => field.onChange(event.target.value)} className="rounded-2xl" /></FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />
      </div>
    </div>
  );
};

export default StudentInfoSection;
