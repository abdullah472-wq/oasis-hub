import { useState, useEffect } from "react";
import {
  Loader2,
  CreditCard,
  Building2,
  Smartphone,
  Save,
  Info,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  Power,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, logAdminActivity } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { broadcastSiteSettingsUpdated, defaultSiteSettings, getCachedSiteSettings } from "@/lib/siteSettings";
import type { PaymentAccountItem, PaymentMethodType } from "@/types/cms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const initialAccountForm: Omit<PaymentAccountItem, "id"> = {
  type: "bank",
  title_bn: "",
  title_en: "",
  account_number: "",
  account_name: "",
  account_type: "personal",
  bank_name_bn: "",
  bank_name_en: "",
  branch_bn: "",
  branch_en: "",
  routing_no: "",
  instructions_bn: "",
  instructions_en: "",
  is_active: true,
};

export const BankingSettingsForm = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dialog state for Add/Edit Payment Account
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountFormData, setAccountFormData] = useState<Omit<PaymentAccountItem, "id">>(initialAccountForm);

  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccountItem[]>(() => {
    const cached = getCachedSiteSettings();
    return Array.isArray(cached.payment_accounts) ? cached.payment_accounts : [];
  });

  const [formData, setFormData] = useState(() => {
    const cached = getCachedSiteSettings();
    return {
      bank_name_bn: cached.bank_name_bn || defaultSiteSettings.bank_name_bn || "",
      bank_name_en: cached.bank_name_en || defaultSiteSettings.bank_name_en || "",
      bank_account_name: cached.bank_account_name || defaultSiteSettings.bank_account_name || "",
      bank_account_no: cached.bank_account_no || defaultSiteSettings.bank_account_no || "",
      bank_branch_bn: cached.bank_branch_bn || defaultSiteSettings.bank_branch_bn || "",
      bank_branch_en: cached.bank_branch_en || defaultSiteSettings.bank_branch_en || "",
      bank_routing_no: cached.bank_routing_no || defaultSiteSettings.bank_routing_no || "",
      bkash_number: cached.bkash_number || defaultSiteSettings.bkash_number || "",
      bkash_type: cached.bkash_type || defaultSiteSettings.bkash_type || "personal",
      nagad_number: cached.nagad_number || defaultSiteSettings.nagad_number || "",
      nagad_type: cached.nagad_type || defaultSiteSettings.nagad_type || "personal",
      rocket_number: cached.rocket_number || defaultSiteSettings.rocket_number || "",
      rocket_type: cached.rocket_type || defaultSiteSettings.rocket_type || "personal",
      payment_instructions_bn: cached.payment_instructions_bn || defaultSiteSettings.payment_instructions_bn || "",
      payment_instructions_en: cached.payment_instructions_en || defaultSiteSettings.payment_instructions_en || "",
    };
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setFormData({
          bank_name_bn: data.bank_name_bn || defaultSiteSettings.bank_name_bn || "",
          bank_name_en: data.bank_name_en || defaultSiteSettings.bank_name_en || "",
          bank_account_name: data.bank_account_name || defaultSiteSettings.bank_account_name || "",
          bank_account_no: data.bank_account_no || defaultSiteSettings.bank_account_no || "",
          bank_branch_bn: data.bank_branch_bn || defaultSiteSettings.bank_branch_bn || "",
          bank_branch_en: data.bank_branch_en || defaultSiteSettings.bank_branch_en || "",
          bank_routing_no: data.bank_routing_no || defaultSiteSettings.bank_routing_no || "",
          bkash_number: data.bkash_number || defaultSiteSettings.bkash_number || "",
          bkash_type: data.bkash_type || defaultSiteSettings.bkash_type || "personal",
          nagad_number: data.nagad_number || defaultSiteSettings.nagad_number || "",
          nagad_type: data.nagad_type || defaultSiteSettings.nagad_type || "personal",
          rocket_number: data.rocket_number || defaultSiteSettings.rocket_number || "",
          rocket_type: data.rocket_type || defaultSiteSettings.rocket_type || "personal",
          payment_instructions_bn: data.payment_instructions_bn || defaultSiteSettings.payment_instructions_bn || "",
          payment_instructions_en: data.payment_instructions_en || defaultSiteSettings.payment_instructions_en || "",
        });

        if (Array.isArray(data.payment_accounts)) {
          setPaymentAccounts(data.payment_accounts);
        }
      }
    } catch (err: any) {
      console.error("Error fetching banking settings:", err);
      toast.error(t("ব্যাংক সেটিংস লোড করতে সমস্যা হয়েছে", "Failed to load banking settings"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingAccountId(null);
    setAccountFormData(initialAccountForm);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (account: PaymentAccountItem) => {
    setEditingAccountId(account.id);
    setAccountFormData({
      type: account.type,
      title_bn: account.title_bn,
      title_en: account.title_en,
      account_number: account.account_number,
      account_name: account.account_name || "",
      account_type: account.account_type || "personal",
      bank_name_bn: account.bank_name_bn || "",
      bank_name_en: account.bank_name_en || "",
      branch_bn: account.branch_bn || "",
      branch_en: account.branch_en || "",
      routing_no: account.routing_no || "",
      instructions_bn: account.instructions_bn || "",
      instructions_en: account.instructions_en || "",
      is_active: account.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountFormData.account_number.trim()) {
      toast.error(t("অ্যাকাউন্ট নম্বর অবশ্যই প্রদান করতে হবে", "Account number is required"));
      return;
    }

    if (editingAccountId) {
      // Update existing
      setPaymentAccounts((prev) =>
        prev.map((acc) =>
          acc.id === editingAccountId
            ? { ...accountFormData, id: editingAccountId }
            : acc
        )
      );
      toast.success(t("অ্যাকাউন্ট তথ্য আপডেট করা হয়েছে", "Payment account updated"));
    } else {
      // Add new
      const newAccount: PaymentAccountItem = {
        ...accountFormData,
        id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title_bn: accountFormData.title_bn.trim() || getDefaultAccountTitle(accountFormData.type, "bn"),
        title_en: accountFormData.title_en.trim() || getDefaultAccountTitle(accountFormData.type, "en"),
      };
      setPaymentAccounts((prev) => [...prev, newAccount]);
      toast.success(t("নতুন পেমেন্ট অ্যাকাউন্ট যুক্ত করা হয়েছে", "New payment account added"));
    }

    setIsDialogOpen(false);
    setEditingAccountId(null);
    setAccountFormData(initialAccountForm);
  };

  const handleDeleteAccount = (id: string) => {
    setPaymentAccounts((prev) => prev.filter((acc) => acc.id !== id));
    toast.info(t("অ্যাকাউন্টটি তালিকা থেকে সরানো হয়েছে", "Account removed from list"));
  };

  const handleToggleAccountStatus = (id: string, currentStatus: boolean) => {
    setPaymentAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, is_active: !currentStatus } : acc))
    );
  };

  const copyNumber = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    toast.success(t("অ্যাকাউন্ট নম্বর কপি করা হয়েছে", "Account number copied"));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDefaultAccountTitle = (type: PaymentMethodType, lang: "bn" | "en") => {
    switch (type) {
      case "bank":
        return lang === "bn" ? "ব্যাংক অ্যাকাউন্ট" : "Bank Account";
      case "bkash":
        return lang === "bn" ? "বিকাশ পেমেন্ট" : "bKash Payment";
      case "nagad":
        return lang === "bn" ? "নগদ পেমেন্ট" : "Nagad Payment";
      case "rocket":
        return lang === "bn" ? "রকেট পেমেন্ট" : "Rocket Payment";
      case "upay":
        return lang === "bn" ? "উপায় পেমেন্ট" : "Upay Payment";
      default:
        return lang === "bn" ? "পেমেন্ট অ্যাকাউন্ট" : "Payment Account";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        id: 1,
        bank_name_bn: formData.bank_name_bn.trim() || null,
        bank_name_en: formData.bank_name_en.trim() || null,
        bank_account_name: formData.bank_account_name.trim() || null,
        bank_account_no: formData.bank_account_no.trim() || null,
        bank_branch_bn: formData.bank_branch_bn.trim() || null,
        bank_branch_en: formData.bank_branch_en.trim() || null,
        bank_routing_no: formData.bank_routing_no.trim() || null,
        bkash_number: formData.bkash_number.trim() || null,
        bkash_type: formData.bkash_type,
        nagad_number: formData.nagad_number.trim() || null,
        nagad_type: formData.nagad_type,
        rocket_number: formData.rocket_number.trim() || null,
        rocket_type: formData.rocket_type,
        payment_instructions_bn: formData.payment_instructions_bn.trim() || null,
        payment_instructions_en: formData.payment_instructions_en.trim() || null,
        payment_accounts: paymentAccounts,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      // Broadcast update across the whole application instantly
      broadcastSiteSettingsUpdated(payload);

      await logAdminActivity(
        "UPDATE",
        "site_settings",
        `ব্যাংক ও পেমেন্ট অ্যাকাউন্ট সেটিংস আপডেট (${paymentAccounts.length} টি অতিরিক্ত অ্যাকাউন্ট)`
      );

      toast.success(
        t("ব্যাংক ও ফি পেমেন্ট তথ্য সফলভাবে সংরক্ষিত হয়েছে", "Banking & fee payment settings saved successfully")
      );
    } catch (err: any) {
      console.error("Error saving banking settings:", err);
      toast.error(err.message || t("সংরক্ষণ করতে সমস্যা হয়েছে", "Failed to save settings"));
    } finally {
      setSaving(false);
    }
  };

  const getAccountTypeBadge = (type: PaymentMethodType) => {
    switch (type) {
      case "bank":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"><Building2 className="h-3 w-3" /> Bank</Badge>;
      case "bkash":
        return <Badge className="bg-pink-600 hover:bg-pink-700 text-white gap-1"><Smartphone className="h-3 w-3" /> bKash</Badge>;
      case "nagad":
        return <Badge className="bg-amber-600 hover:bg-amber-700 text-white gap-1"><Smartphone className="h-3 w-3" /> Nagad</Badge>;
      case "rocket":
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white gap-1"><Smartphone className="h-3 w-3" /> Rocket</Badge>;
      case "upay":
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white gap-1"><Smartphone className="h-3 w-3" /> Upay</Badge>;
      default:
        return <Badge className="bg-slate-700 text-white gap-1"><CreditCard className="h-3 w-3" /> Other</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">{t("লোড হচ্ছে...", "Loading...")}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Official Bank Account Information */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">
                {t("প্রাতিষ্ঠানিক প্রধান ব্যাংক অ্যাকাউন্ট", "Primary Institutional Bank Account")}
              </CardTitle>
            </div>
            <CardDescription>
              {t(
                "ওয়েবসাইটের ফুটার, ভর্তি পেজ ও ফি রসিদে প্রদর্শিত কেন্দ্রীয় ব্যাংক হিসাব",
                "Primary bank account details displayed in footer, admission page, and receipts"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name_bn">{t("ব্যাংকের নাম (বাংলা)", "Bank Name (Bangla)")}</Label>
                <Input
                  id="bank_name_bn"
                  value={formData.bank_name_bn}
                  onChange={(e) => setFormData({ ...formData, bank_name_bn: e.target.value })}
                  placeholder="যেমন: ইসলামী ব্যাংক বাংলাদেশ পিএলসি"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name_en">{t("ব্যাংকের নাম (ইংরেজি)", "Bank Name (English)")}</Label>
                <Input
                  id="bank_name_en"
                  value={formData.bank_name_en}
                  onChange={(e) => setFormData({ ...formData, bank_name_en: e.target.value })}
                  placeholder="e.g. Islami Bank Bangladesh PLC"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_account_name">{t("অ্যাকাউন্টধারীর নাম (A/C Name)", "Account Name")}</Label>
                <Input
                  id="bank_account_name"
                  value={formData.bank_account_name}
                  onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                  placeholder="e.g. Annoor Tahfizul Quran Madrasa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account_no" className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {t("অ্যাকাউন্ট নম্বর (A/C No) *", "Account Number *")}
                </Label>
                <Input
                  id="bank_account_no"
                  value={formData.bank_account_no}
                  onChange={(e) => setFormData({ ...formData, bank_account_no: e.target.value })}
                  placeholder="e.g. 20503760201161316"
                  className="font-mono font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_branch_bn">{t("শাখা (বাংলা)", "Branch (Bangla)")}</Label>
                <Input
                  id="bank_branch_bn"
                  value={formData.bank_branch_bn}
                  onChange={(e) => setFormData({ ...formData, bank_branch_bn: e.target.value })}
                  placeholder="যেমন: কাপাসিয়া শাখা, গাজীপুর"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_branch_en">{t("শাখা (ইংরেজি)", "Branch (English)")}</Label>
                <Input
                  id="bank_branch_en"
                  value={formData.bank_branch_en}
                  onChange={(e) => setFormData({ ...formData, bank_branch_en: e.target.value })}
                  placeholder="e.g. Kapasia Branch, Gazipur"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_routing_no">{t("রাউটিং নম্বর (Routing No)", "Routing Number")}</Label>
                <Input
                  id="bank_routing_no"
                  value={formData.bank_routing_no}
                  onChange={(e) => setFormData({ ...formData, bank_routing_no: e.target.value })}
                  placeholder="e.g. 125271874"
                  className="font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Mobile Banking Accounts */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-pink-600" />
              <CardTitle className="text-lg">
                {t("প্রধান মোবাইল ব্যাংকিং (বিকাশ / নগদ / রকেট)", "Primary Mobile Banking (bKash / Nagad / Rocket)")}
              </CardTitle>
            </div>
            <CardDescription>
              {t("অভিভাবকদের জন্য দ্রুত ফি ও অনুদানের প্রধান মোবাইল ব্যাংকিং নম্বরসমূহ", "Primary mobile banking numbers for fees and donations")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* bKash */}
              <div className="p-3.5 rounded-xl border border-pink-200 dark:border-pink-900/40 bg-pink-50/40 dark:bg-pink-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-pink-700 dark:text-pink-400 text-sm">bKash (বিকাশ)</span>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bkash_number" className="text-xs">{t("বিকাশ নম্বর", "bKash Number")}</Label>
                  <Input
                    id="bkash_number"
                    value={formData.bkash_number}
                    onChange={(e) => setFormData({ ...formData, bkash_number: e.target.value })}
                    placeholder="018XXXXXXXX"
                    className="font-mono bg-background text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bkash_type" className="text-xs">{t("অ্যাকাউন্ট টাইপ", "Account Type")}</Label>
                  <Select
                    value={formData.bkash_type || "personal"}
                    onValueChange={(val: "merchant" | "personal") => setFormData({ ...formData, bkash_type: val })}
                  >
                    <SelectTrigger id="bkash_type" className="bg-background text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">{t("Personal (ব্যক্তিগত)", "Personal")}</SelectItem>
                      <SelectItem value="merchant">{t("Merchant (মার্চেন্ট)", "Merchant")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Nagad */}
              <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">Nagad (নগদ)</span>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nagad_number" className="text-xs">{t("নগদ নম্বর", "Nagad Number")}</Label>
                  <Input
                    id="nagad_number"
                    value={formData.nagad_number}
                    onChange={(e) => setFormData({ ...formData, nagad_number: e.target.value })}
                    placeholder="015XXXXXXXX"
                    className="font-mono bg-background text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nagad_type" className="text-xs">{t("অ্যাকাউন্ট টাইপ", "Account Type")}</Label>
                  <Select
                    value={formData.nagad_type || "personal"}
                    onValueChange={(val: "merchant" | "personal") => setFormData({ ...formData, nagad_type: val })}
                  >
                    <SelectTrigger id="nagad_type" className="bg-background text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">{t("Personal (ব্যক্তিগত)", "Personal")}</SelectItem>
                      <SelectItem value="merchant">{t("Merchant (মার্চেন্ট)", "Merchant")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rocket */}
              <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-700 dark:text-purple-400 text-sm">Rocket (রকেট)</span>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rocket_number" className="text-xs">{t("রকেট নম্বর", "Rocket Number")}</Label>
                  <Input
                    id="rocket_number"
                    value={formData.rocket_number}
                    onChange={(e) => setFormData({ ...formData, rocket_number: e.target.value })}
                    placeholder="01XXXXXXXXX-X"
                    className="font-mono bg-background text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rocket_type" className="text-xs">{t("অ্যাকাউন্ট টাইপ", "Account Type")}</Label>
                  <Select
                    value={formData.rocket_type || "personal"}
                    onValueChange={(val: "merchant" | "personal") => setFormData({ ...formData, rocket_type: val })}
                  >
                    <SelectTrigger id="rocket_type" className="bg-background text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">{t("Personal (ব্যক্তিগত)", "Personal")}</SelectItem>
                      <SelectItem value="merchant">{t("Merchant (মার্চেন্ট)", "Merchant")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Payment Accounts (Add Payment Account Option) */}
        <Card className="border-border/60 shadow-sm border-l-4 border-l-primary">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">
                    {t("অতিরিক্ত পেমেন্ট চ্যানেল ও অ্যাকাউন্টসমূহ", "Additional Payment Channels & Accounts")}
                  </CardTitle>
                </div>
                <CardDescription className="mt-1">
                  {t(
                    "ভর্তি ফি, হোস্টেল ফি, সাধারণ দান বা অন্যান্য উদ্দেশ্যে একাধিক ব্যাংক বা ওয়ালেট অ্যাকাউন্ট তৈরি করুন",
                    "Add and manage multiple bank accounts or mobile wallets for tuition, hostel, or donations"
                  )}
                </CardDescription>
              </div>

              <Button
                type="button"
                onClick={handleOpenAddDialog}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>{t("নতুন অ্যাকাউন্ট যোগ করুন", "Add Payment Account")}</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {paymentAccounts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {t("এখনো কোনো অতিরিক্ত পেমেন্ট অ্যাকাউন্ট যুক্ত করা হয়নি", "No additional payment accounts added yet")}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    {t(
                      "অভিভাবক বা শুভানুধ্যায়ীদের সুবিধার জন্য নির্দিষ্ট ব্যাংক বা মোবাইল ব্যাংকিং নম্বর যোগ করতে উপরের বোতামটিতে ক্লিক করুন।",
                      "Click the 'Add Payment Account' button above to add dedicated accounts for specific fee channels."
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAddDialog}
                  className="gap-1.5 text-xs font-semibold text-primary border-primary/30"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t("প্রথম অ্যাকাউন্ট যোগ করুন", "Add First Account")}</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentAccounts.map((account) => {
                  const isCopied = copiedId === account.id;

                  return (
                    <div
                      key={account.id}
                      className={`rounded-2xl border transition-all p-4 space-y-3 bg-card shadow-xs ${
                        account.is_active
                          ? "border-border/80 hover:border-primary/40"
                          : "border-border/40 opacity-70 bg-muted/20"
                      }`}
                    >
                      {/* Card Top: Badges & Status Switch */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getAccountTypeBadge(account.type)}
                          {account.account_type && (
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {account.account_type}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={account.is_active}
                            onCheckedChange={() => handleToggleAccountStatus(account.id, account.is_active)}
                            aria-label={t("অ্যাকাউন্ট স্ট্যাটাস", "Account status")}
                          />
                        </div>
                      </div>

                      {/* Title & Bank Name */}
                      <div>
                        <h4 className="font-bold text-sm text-foreground line-clamp-1">
                          {account.title_bn || account.title_en}
                        </h4>
                        {(account.bank_name_bn || account.bank_name_en) && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {account.bank_name_bn || account.bank_name_en}
                            {(account.branch_bn || account.branch_en) && ` (${account.branch_bn || account.branch_en})`}
                          </p>
                        )}
                        {account.account_name && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium line-clamp-1">
                            {t("হিসাবধারক:", "A/C Name:")} {account.account_name}
                          </p>
                        )}
                      </div>

                      {/* Number Display Box with Copy Action */}
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-2">
                        <span className="font-mono text-xs sm:text-sm font-bold text-foreground tracking-wider select-all truncate">
                          {account.account_number}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                          onClick={() => copyNumber(account.account_number, account.id)}
                          title={t("কপি করুন", "Copy")}
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>

                      {/* Instructions if any */}
                      {(account.instructions_bn || account.instructions_en) && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 italic bg-muted/10 p-1.5 rounded-lg">
                          {account.instructions_bn || account.instructions_en}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {account.is_active ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {t("সক্রিয়", "Active")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                              {t("নিষ্ক্রিয়", "Inactive")}
                            </span>
                          )}
                        </span>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 hover:text-primary"
                            onClick={() => handleOpenEditDialog(account)}
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>{t("এডিট", "Edit")}</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteAccount(account.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>{t("মুছুন", "Delete")}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Guidelines & Instructions */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-sky-600" />
              <CardTitle className="text-lg">
                {t("ফি পরিশোধের সার্বিক নির্দেশনা ও নির্দেশিকা", "Payment Instructions & Guidelines")}
              </CardTitle>
            </div>
            <CardDescription>
              {t(
                "ভর্তি পেজ ও নোটিশে প্রদর্শিত ফি পরিশোধ সংক্রান্ত বিস্তারিত নিয়ম ও রেফারেন্স নির্দেশিকা",
                "Detailed fee payment instructions and guidance shown on admission pages"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment_instructions_bn">{t("নির্দেশনা (বাংলা)", "Instructions (Bangla)")}</Label>
              <Textarea
                id="payment_instructions_bn"
                rows={3}
                value={formData.payment_instructions_bn}
                onChange={(e) => setFormData({ ...formData, payment_instructions_bn: e.target.value })}
                placeholder="ক্যাম্পাস ক্যাশ কাউন্টার ছাড়াও বিকাশ, নগদ, রকেট ও নির্ধারিত ব্যাংক অ্যাকাউন্টের মাধ্যমে অফিসিয়াল রসিদ সহ ফি প্রদান করা যায়..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_instructions_en">{t("নির্দেশনা (ইংরেজি)", "Instructions (English)")}</Label>
              <Textarea
                id="payment_instructions_en"
                rows={3}
                value={formData.payment_instructions_en}
                onChange={(e) => setFormData({ ...formData, payment_instructions_en: e.target.value })}
                placeholder="Fees can be paid at campus accounts counters or through bKash, Nagad, Rocket, and designated bank accounts with official receipts..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white min-w-[170px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("সংরক্ষণ হচ্ছে...", "Saving...")}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{t("পরিবর্তন সংরক্ষণ করুন", "Save Changes")}</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Add / Edit Payment Account Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>
                {editingAccountId
                  ? t("পেমেন্ট অ্যাকাউন্ট সম্পাদনা করুন", "Edit Payment Account")
                  : t("নতুন পেমেন্ট অ্যাকাউন্ট যুক্ত করুন", "Add New Payment Account")}
              </span>
            </DialogTitle>
            <DialogDescription>
              {t(
                "ব্যাংক বা মোবাইল ওয়ালেট অ্যাকাউন্টের বিস্তারিত তথ্য প্রদান করুন",
                "Enter details for the bank account or mobile wallet channel"
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAccount} className="space-y-4 pt-2">
            {/* Account Category / Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="channel_type">{t("পেমেন্ট চ্যানেল / ক্যাটাগরি *", "Payment Channel *")}</Label>
                <Select
                  value={accountFormData.type}
                  onValueChange={(val: PaymentMethodType) =>
                    setAccountFormData({ ...accountFormData, type: val })
                  }
                >
                  <SelectTrigger id="channel_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">🏦 Bank Account (ব্যাংক অ্যাকাউন্ট)</SelectItem>
                    <SelectItem value="bkash">🌸 bKash (বিকাশ)</SelectItem>
                    <SelectItem value="nagad">🔶 Nagad (নগদ)</SelectItem>
                    <SelectItem value="rocket">🟣 Rocket (রকেট)</SelectItem>
                    <SelectItem value="upay">🔷 Upay (উপায়)</SelectItem>
                    <SelectItem value="other">💳 Other (অন্যান্য)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account_type">{t("অ্যাকাউন্ট টাইপ", "Account Type")}</Label>
                <Select
                  value={accountFormData.account_type || "personal"}
                  onValueChange={(val: any) => setAccountFormData({ ...accountFormData, account_type: val })}
                >
                  <SelectTrigger id="account_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal (ব্যক্তিগত)</SelectItem>
                    <SelectItem value="merchant">Merchant (মার্চেন্ট)</SelectItem>
                    <SelectItem value="agent">Agent (এজেন্ট)</SelectItem>
                    <SelectItem value="current">Current Account (চলতি হিসাব)</SelectItem>
                    <SelectItem value="savings">Savings Account (সঞ্চয়ী হিসাব)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="title_bn">{t("অ্যাকাউন্ট শিরোনাম (বাংলা)", "Title (Bangla)")}</Label>
                <Input
                  id="title_bn"
                  value={accountFormData.title_bn}
                  onChange={(e) => setAccountFormData({ ...accountFormData, title_bn: e.target.value })}
                  placeholder="যেমন: ভর্তি ও পরীক্ষার ফি"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title_en">{t("অ্যাকাউন্ট শিরোনাম (ইংরেজি)", "Title (English)")}</Label>
                <Input
                  id="title_en"
                  value={accountFormData.title_en}
                  onChange={(e) => setAccountFormData({ ...accountFormData, title_en: e.target.value })}
                  placeholder="e.g. Admission & Exam Fees"
                />
              </div>
            </div>

            {/* Account Number & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="acc_number" className="font-semibold text-primary">
                  {t("অ্যাকাউন্ট / ওয়ালেট নম্বর *", "Account / Wallet Number *")}
                </Label>
                <Input
                  id="acc_number"
                  required
                  value={accountFormData.account_number}
                  onChange={(e) => setAccountFormData({ ...accountFormData, account_number: e.target.value })}
                  placeholder="e.g. 018XXXXXXXX or 2050..."
                  className="font-mono font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="acc_name">{t("হিসাবধারকের নাম (A/C Name)", "Account Name")}</Label>
                <Input
                  id="acc_name"
                  value={accountFormData.account_name || ""}
                  onChange={(e) => setAccountFormData({ ...accountFormData, account_name: e.target.value })}
                  placeholder="e.g. Annoor Education Trust"
                />
              </div>
            </div>

            {/* Bank Specific Details */}
            {accountFormData.type === "bank" && (
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  {t("ব্যাংকের অতিরিক্ত বিবরণ", "Bank Details")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="bank_name_bn_item" className="text-xs">{t("ব্যাংকের নাম (বাংলা)", "Bank (Bangla)")}</Label>
                    <Input
                      id="bank_name_bn_item"
                      value={accountFormData.bank_name_bn || ""}
                      onChange={(e) => setAccountFormData({ ...accountFormData, bank_name_bn: e.target.value })}
                      placeholder="যেমন: ডাচ-বাংলা ব্যাংক"
                      className="text-xs bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bank_name_en_item" className="text-xs">{t("ব্যাংকের নাম (ইংরেজি)", "Bank (English)")}</Label>
                    <Input
                      id="bank_name_en_item"
                      value={accountFormData.bank_name_en || ""}
                      onChange={(e) => setAccountFormData({ ...accountFormData, bank_name_en: e.target.value })}
                      placeholder="e.g. Dutch-Bangla Bank PLC"
                      className="text-xs bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="branch_bn_item" className="text-xs">{t("শাখা (বাংলা)", "Branch (Bangla)")}</Label>
                    <Input
                      id="branch_bn_item"
                      value={accountFormData.branch_bn || ""}
                      onChange={(e) => setAccountFormData({ ...accountFormData, branch_bn: e.target.value })}
                      placeholder="কাপাসিয়া শাখা"
                      className="text-xs bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="branch_en_item" className="text-xs">{t("শাখা (ইংরেজি)", "Branch (English)")}</Label>
                    <Input
                      id="branch_en_item"
                      value={accountFormData.branch_en || ""}
                      onChange={(e) => setAccountFormData({ ...accountFormData, branch_en: e.target.value })}
                      placeholder="Kapasia Branch"
                      className="text-xs bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="routing_item" className="text-xs">{t("রাউটিং নম্বর", "Routing No")}</Label>
                    <Input
                      id="routing_item"
                      value={accountFormData.routing_no || ""}
                      onChange={(e) => setAccountFormData({ ...accountFormData, routing_no: e.target.value })}
                      placeholder="09027..."
                      className="text-xs font-mono bg-background"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Note / Instruction */}
            <div className="space-y-1.5">
              <Label htmlFor="instructions_bn">{t("বিশেষ নির্দেশনা / নোট", "Special Note / Instructions")}</Label>
              <Input
                id="instructions_bn"
                value={accountFormData.instructions_bn || ""}
                onChange={(e) => setAccountFormData({ ...accountFormData, instructions_bn: e.target.value })}
                placeholder="যেমন: রেফারেন্সে শিক্ষার্থীর রোল ও শাখা উল্লেখ করুন"
                className="text-xs"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20">
              <div>
                <Label htmlFor="is_active" className="text-sm font-semibold cursor-pointer">
                  {t("অ্যাকাউন্টটি সক্রিয় রাখুন", "Keep Account Active")}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("সক্রিয় থাকলে ওয়েবসাইটে প্রদর্শন করা হবে", "When enabled, visible to public visitors")}
                </p>
              </div>
              <Switch
                id="is_active"
                checked={accountFormData.is_active}
                onCheckedChange={(checked) => setAccountFormData({ ...accountFormData, is_active: checked })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t("বাতিল", "Cancel")}
              </Button>
              <Button type="submit" className="bg-primary">
                {editingAccountId ? t("আপডেট করুন", "Update Account") : t("যুক্ত করুন", "Add Account")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
