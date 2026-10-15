import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  FileText,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getFeeItems,
  deleteFeeItem,
  saveFeeItem,
  getAdmissionRules,
  deleteAdmissionRule,
  type FeeStructureItem,
  type AdmissionRuleItem,
} from "@/lib/admissionInfo";
import { FeeItemDialog } from "./FeeItemDialog";
import { AdmissionRuleDialog } from "./AdmissionRuleDialog";

export const AdmissionInfoManager = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"fees" | "rules">("fees");

  const [fees, setFees] = useState<FeeStructureItem[]>([]);
  const [rules, setRules] = useState<AdmissionRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialogs
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeStructureItem | null>(null);

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AdmissionRuleItem | null>(null);

  // Deletion
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "fee" | "rule";
    id: string;
    title: string;
  } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feesData, rulesData] = await Promise.all([
        getFeeItems(),
        getAdmissionRules(),
      ]);
      setFees(feesData);
      setRules(rulesData);
    } catch (err) {
      console.error("Failed to load admission management data:", err);
      toast.error(t("তথ্য লোড করতে সমস্যা হয়েছে", "Failed to load data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFeeStatus = async (item: FeeStructureItem) => {
    try {
      await saveFeeItem({
        ...item,
        is_active: !item.is_active,
      });
      toast.success(
        !item.is_active
          ? t("ফি সক্রিয় করা হয়েছে", "Fee activated")
          : t("ফি নিষ্ক্রিয় করা হয়েছে", "Fee deactivated")
      );
      loadData();
    } catch (err) {
      toast.error(t("স্ট্যাটাস পরিবর্তন ব্যর্থ", "Failed to toggle status"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "fee") {
        await deleteFeeItem(deleteTarget.id);
        toast.success(t("ফি সফলভাবে মুছে ফেলা হয়েছে", "Fee item deleted"));
      } else {
        await deleteAdmissionRule(deleteTarget.id);
        toast.success(t("নিয়ম/ডকুমেন্ট সফলভাবে মুছে ফেলা হয়েছে", "Rule deleted"));
      }
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast.error(t("মুছে ফেলতে সমস্যা হয়েছে", "Failed to delete item"));
    }
  };

  const filteredFees = useMemo(() => {
    if (!searchQuery.trim()) return fees;
    const q = searchQuery.toLowerCase();
    return fees.filter(
      (f) =>
        f.type_bn.toLowerCase().includes(q) ||
        f.type_en.toLowerCase().includes(q) ||
        f.amount_bn.toLowerCase().includes(q) ||
        f.note_bn.toLowerCase().includes(q)
    );
  }, [fees, searchQuery]);

  const filteredRules = useMemo(() => {
    if (!searchQuery.trim()) return rules;
    const q = searchQuery.toLowerCase();
    return rules.filter(
      (r) =>
        r.rule_bn.toLowerCase().includes(q) ||
        r.rule_en.toLowerCase().includes(q)
    );
  }, [rules, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bengali text-xl font-bold text-foreground">
                {t("ফি ও ভর্তি নির্দেশিকা ব্যবস্থাপনা", "Fees & Admission Guidelines")}
              </h2>
              <p className="font-bengali text-xs text-muted-foreground">
                {t(
                  "অনাবাসিক ও আবাসিক টিউশন ফি, ভর্তি ফি এবং ভর্তি পরীক্ষার নিয়মাবলী ও ডকুমেন্টস নিয়ন্ত্রণ করুন",
                  "Manage tuition, boarding fees, admission rules, and required document checklist"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admission"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 font-bengali text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{t("পাবলিক পেজ দেখুন", "View Public Page")}</span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="rounded-xl font-bengali text-xs gap-1.5"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{t("রিফ্রেশ", "Refresh")}</span>
          </Button>

          {activeTab === "fees" ? (
            <Button
              onClick={() => {
                setSelectedFee(null);
                setFeeDialogOpen(true);
              }}
              className="rounded-xl font-bengali text-xs gap-1.5 bg-primary"
            >
              <Plus className="h-4 w-4" />
              <span>{t("নতুন ফি যুক্ত করুন", "Add New Fee")}</span>
            </Button>
          ) : (
            <Button
              onClick={() => {
                setSelectedRule(null);
                setRuleDialogOpen(true);
              }}
              className="rounded-xl font-bengali text-xs gap-1.5 bg-primary"
            >
              <Plus className="h-4 w-4" />
              <span>{t("নতুন নিয়ম বা ডকুমেন্ট", "Add Rule/Doc")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs and Search */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <TabsList className="bg-muted/70 p-1 rounded-xl">
            <TabsTrigger value="fees" className="font-bengali text-xs gap-2 rounded-lg">
              <CreditCard className="h-3.5 w-3.5" />
              <span>{t("ফি কাঠামো তালিকা", "Fee Structure")} ({fees.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="font-bengali text-xs gap-2 rounded-lg">
              <FileText className="h-3.5 w-3.5" />
              <span>{t("ভর্তির নিয়ম ও ডকুমেন্টস", "Rules & Documents")} ({rules.length})</span>
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("অনুসন্ধান করুন...", "Search items...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* TAB 1: FEES */}
        <TabsContent value="fees" className="mt-0">
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-bengali text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                    <th className="py-3 px-4 font-semibold">{t("ক্রম", "Order")}</th>
                    <th className="py-3 px-4 font-semibold">{t("ফি ধরন", "Fee Type")}</th>
                    <th className="py-3 px-4 font-semibold">{t("পরিমাণ", "Amount")}</th>
                    <th className="py-3 px-4 font-semibold">{t("মন্তব্য", "Note")}</th>
                    <th className="py-3 px-4 font-semibold">{t("ক্যাটাগরি", "Category")}</th>
                    <th className="py-3 px-4 font-semibold text-center">{t("স্ট্যাটাস", "Status")}</th>
                    <th className="py-3 px-4 text-right font-semibold">{t("অ্যাকশন", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        {t("লোড হচ্ছে...", "Loading...")}
                      </td>
                    </tr>
                  ) : filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        {t("কোনো ফি পাওয়া যায়নি", "No fees found")}
                      </td>
                    </tr>
                  ) : (
                    filteredFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-muted-foreground">
                          {fee.order_index}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{fee.type_bn}</span>
                            {fee.highlight && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {t("হাইলাইট", "Highlighted")}
                              </Badge>
                            )}
                          </div>
                          {fee.type_en && (
                            <span className="text-xs text-muted-foreground block">{fee.type_en}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-display font-bold text-primary text-sm sm:text-base">
                          {fee.amount_bn}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {fee.note_bn}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {fee.category === "tuition"
                              ? t("টিউশন", "Tuition")
                              : fee.category === "admission"
                              ? t("ভর্তি", "Admission")
                              : fee.category === "exam"
                              ? t("পরীক্ষা", "Exam")
                              : t("অন্যান্য", "Other")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Switch
                            checked={fee.is_active}
                            onCheckedChange={() => handleToggleFeeStatus(fee)}
                          />
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedFee(fee);
                              setFeeDialogOpen(true);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteTarget({
                                type: "fee",
                                id: fee.id,
                                title: fee.type_bn,
                              })
                            }
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: RULES & DOCUMENTS */}
        <TabsContent value="rules" className="mt-0">
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-bengali text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                    <th className="py-3 px-4 font-semibold">{t("ক্রম", "Order")}</th>
                    <th className="py-3 px-4 font-semibold">{t("বিবরণ", "Description")}</th>
                    <th className="py-3 px-4 font-semibold">{t("ধরন", "Type")}</th>
                    <th className="py-3 px-4 font-semibold">{t("আবশ্যকতা", "Requirement")}</th>
                    <th className="py-3 px-4 text-right font-semibold">{t("অ্যাকশন", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        {t("লোড হচ্ছে...", "Loading...")}
                      </td>
                    </tr>
                  ) : filteredRules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        {t("কোনো নিয়ম বা ডকুমেন্ট পাওয়া যায়নি", "No rules or documents found")}
                      </td>
                    </tr>
                  ) : (
                    filteredRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-muted-foreground">
                          {rule.order_index}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-foreground">{rule.rule_bn}</p>
                          {rule.rule_en && (
                            <p className="text-xs text-muted-foreground">{rule.rule_en}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                              rule.type === "rule"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                : rule.type === "document"
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                : "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                            }`}
                          >
                            {rule.type === "rule"
                              ? t("নিয়মাবলী", "Rule")
                              : rule.type === "document"
                              ? t("ডকুমেন্ট", "Document")
                              : t("ধাপ", "Step")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {rule.is_required ? (
                            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs">
                              {t("বাধ্যতামূলক", "Mandatory")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              {t("ঐচ্ছিক / যদি থাকে", "Optional")}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedRule(rule);
                              setRuleDialogOpen(true);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteTarget({
                                type: "rule",
                                id: rule.id,
                                title: rule.rule_bn,
                              })
                            }
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Fee Dialog */}
      <FeeItemDialog
        isOpen={feeDialogOpen}
        onClose={() => setFeeDialogOpen(false)}
        onSuccess={loadData}
        feeItem={selectedFee}
      />

      {/* Admission Rule Dialog */}
      <AdmissionRuleDialog
        isOpen={ruleDialogOpen}
        onClose={() => setRuleDialogOpen(false)}
        onSuccess={loadData}
        ruleItem={selectedRule}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="font-bengali">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              {t("আইটেমটি মুছে ফেলতে চান?", "Are you sure you want to delete?")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              "{deleteTarget?.title}" {t("মুছে ফেলা হলে তা আর ওয়েবসাইটে প্রদর্শিত হবে না।", "will be permanently removed from public view.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>{t("বাতিল", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t("হ্যাঁ, মুছে ফেলুন", "Yes, Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
