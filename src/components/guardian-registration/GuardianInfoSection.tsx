import { useLanguage } from "@/contexts/LanguageContext";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { guardianRelationships, type GuardianRegisterValues } from "./schema";
import type { Control } from "react-hook-form";

interface GuardianInfoSectionProps {
  control: Control<GuardianRegisterValues>;
}

const GuardianInfoSection = ({ control }: GuardianInfoSectionProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bengali text-xl font-semibold text-foreground">{t("গার্ডিয়ানের তথ্য", "Guardian Information")}</h3>
        <p className="font-bengali text-sm text-muted-foreground">{t("অ্যাকাউন্ট খোলার জন্য প্রয়োজনীয় তথ্য দিন", "Provide the required details to open the account")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField control={control} name="fullName" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("পূর্ণ নাম", "Full Name")}</FormLabel>
            <FormControl><Input {...field} className="rounded-2xl" /></FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />

        <FormField control={control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("ফোন", "Phone")}</FormLabel>
            <FormControl><Input {...field} className="rounded-2xl" /></FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />

        <FormField control={control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("ইমেইল", "Email")}</FormLabel>
            <FormControl><Input type="email" {...field} className="rounded-2xl" /></FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />

        <FormField control={control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("পাসওয়ার্ড", "Password")}</FormLabel>
            <FormControl><Input type="password" {...field} className="rounded-2xl" /></FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />

        <FormField control={control} name="relationship" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("সম্পর্ক", "Relationship")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder={t("সম্পর্ক নির্বাচন করুন", "Select relationship")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {guardianRelationships.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelBn, option.labelEn)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />

        <FormField control={control} name="nid" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bengali">{t("এনআইডি (ঐচ্ছিক)", "NID (Optional)")}</FormLabel>
            <FormControl><Input {...field} className="rounded-2xl" /></FormControl>
            <FormMessage className="font-bengali" />
          </FormItem>
        )} />
      </div>

      <FormField control={control} name="address" render={({ field }) => (
        <FormItem>
          <FormLabel className="font-bengali">{t("ঠিকানা (ঐচ্ছিক)", "Address (Optional)")}</FormLabel>
          <FormControl><Input {...field} className="rounded-2xl" /></FormControl>
          <FormMessage className="font-bengali" />
        </FormItem>
      )} />
    </div>
  );
};

export default GuardianInfoSection;
