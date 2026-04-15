import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Edit3, Receipt, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FeeEntry } from "@/lib/feeEntries";
import { feeStatusOptions } from "@/lib/feeHelpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FeeEntriesTableProps {
  entries: FeeEntry[];
  onEdit: (entry: FeeEntry) => void;
  onPayment: (entry: FeeEntry) => void;
  onDelete: (id: string) => Promise<void>;
}

const statusVariant: Record<FeeEntry["status"], "default" | "secondary" | "outline"> = {
  paid: "default",
  partial: "secondary",
  unpaid: "outline",
};

const FeeEntriesTable = ({ entries, onEdit, onPayment, onDelete }: FeeEntriesTableProps) => {
  const { t } = useLanguage();
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const groupedEntries = useMemo(() => {
    const map = new Map<string, FeeEntry[]>();
    entries.forEach((entry) => {
      const key = entry.studentId || "unknown-student";
      const list = map.get(key) || [];
      list.push(entry);
      map.set(key, list);
    });

    return Array.from(map.entries()).map(([studentId, items]) => {
      const totals = items.reduce(
        (acc, item) => {
          acc.amount += item.amount;
          acc.paid += item.paidAmount;
          acc.due += item.dueAmount;
          return acc;
        },
        { amount: 0, paid: 0, due: 0 },
      );

      const representative = items[0];
      return {
        studentId,
        items: [...items].sort((a, b) => b.billingMonth.localeCompare(a.billingMonth)),
        studentName: representative.studentName,
        className: representative.className,
        guardianName: representative.guardianName,
        totals,
      };
    });
  }, [entries]);

  const toggleExpand = (key: string) => {
    setExpandedKeys((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <Card className="rounded-3xl border-0 bg-transparent shadow-none">
      <CardContent className="p-0">
        {entries.length === 0 ? (
          <div className="px-6 py-12 text-center font-bengali text-sm text-muted-foreground">
            {t("কোনো ফি এন্ট্রি পাওয়া যায়নি", "No fee entries found")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="space-y-4 md:hidden">
              {groupedEntries.map((group) => {
                const isOpen = Boolean(expandedKeys[group.studentId]);
                return (
                  <div key={group.studentId} className="rounded-3xl border border-border/60 bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-bengali text-base font-semibold text-foreground">{group.studentName}</p>
                        <p className="font-bengali text-xs text-muted-foreground">
                          {t("স্টুডেন্ট আইডি", "Student ID")}: {group.studentId}
                        </p>
                        <p className="font-bengali text-xs text-muted-foreground">{group.className}</p>
                        <p className="font-bengali text-xs text-muted-foreground">
                          {group.guardianName || t("অভিভাবক উল্লেখ নেই", "Guardian not set")}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="rounded-full border border-border p-1 text-muted-foreground transition hover:text-foreground"
                        onClick={() => toggleExpand(group.studentId)}
                      >
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="mt-4 grid gap-2 rounded-2xl bg-muted/20 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bengali text-muted-foreground">{t("মোট আইটেম", "Items")}</span>
                        <span className="font-display font-semibold">{group.items.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bengali text-muted-foreground">{t("মোট", "Total")}</span>
                        <span className="font-display font-semibold">৳{group.totals.amount.toLocaleString("en-US")}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bengali text-muted-foreground">{t("পরিশোধিত", "Paid")}</span>
                        <span className="font-display">৳{group.totals.paid.toLocaleString("en-US")}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bengali text-muted-foreground">{t("বাকি", "Due")}</span>
                        <span className="font-display">৳{group.totals.due.toLocaleString("en-US")}</span>
                      </div>
                      <div className="pt-1">
                        <Badge variant={group.totals.due > 0 ? "outline" : "default"} className="rounded-full">
                          {group.totals.due > 0 ? t("বাকি", "Due") : t("পরিশোধিত", "Paid")}
                        </Badge>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-4 space-y-3">
                        {group.items.map((entry) => (
                          <div key={entry.id} className="rounded-2xl border border-border/60 bg-muted/10 p-3">
                            <div className="space-y-1">
                              <p className="font-bengali text-sm font-semibold text-foreground">{entry.title}</p>
                              <p className="text-xs text-muted-foreground">{entry.category}</p>
                              <p className="font-bengali text-xs text-muted-foreground">{entry.billingMonth}</p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="font-display">৳{entry.amount.toLocaleString("en-US")}</span>
                                <span className="font-display text-muted-foreground">৳{entry.paidAmount.toLocaleString("en-US")}</span>
                                <span className="font-display text-muted-foreground">৳{entry.dueAmount.toLocaleString("en-US")}</span>
                              </div>
                              {entry.note && <p className="font-bengali text-xs text-muted-foreground">{entry.note}</p>}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button type="button" variant="outline" size="sm" className="rounded-xl font-bengali" onClick={() => onPayment(entry)}>
                                <Receipt className="mr-2 h-4 w-4" />
                                {t("পেমেন্ট", "Payment")}
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="rounded-xl font-bengali" onClick={() => onEdit(entry)}>
                                <Edit3 className="mr-2 h-4 w-4" />
                                {t("এডিট", "Edit")}
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="rounded-xl font-bengali text-red-600 hover:text-red-600" onClick={() => void onDelete(entry.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("মুছুন", "Delete")}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <table className="min-w-full text-sm hidden md:table">
              <thead className="border-b border-border/70 bg-muted/30">
                <tr className="text-left">
                  {[
                    t("শিক্ষার্থী", "Student"),
                    t("ফি আইটেম", "Fee Item"),
                    t("মাস", "Month"),
                    t("মোট", "Total"),
                    t("পরিশোধিত", "Paid"),
                    t("বাকি", "Due"),
                    t("স্ট্যাটাস", "Status"),
                    t("অ্যাকশন", "Actions"),
                  ].map((label) => (
                    <th key={label} className="px-4 py-4 font-bengali font-semibold text-foreground">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedEntries.map((group) => {
                  const isOpen = Boolean(expandedKeys[group.studentId]);
                  return (
                    <React.Fragment key={group.studentId}>
                      <tr key={group.studentId} className="border-b border-border/50 align-top bg-background/60">
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              className="mt-1 rounded-full border border-border p-1 text-muted-foreground transition hover:text-foreground"
                              onClick={() => toggleExpand(group.studentId)}
                            >
                              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                            <div className="space-y-1">
                              <p className="font-bengali font-medium text-foreground">{group.studentName}</p>
                              <p className="font-bengali text-xs text-muted-foreground">
                                {t("স্টুডেন্ট আইডি", "Student ID")}: {group.studentId}
                              </p>
                              <p className="font-bengali text-xs text-muted-foreground">{group.className}</p>
                              <p className="font-bengali text-xs text-muted-foreground">
                                {group.guardianName || t("অভিভাবক উল্লেখ নেই", "Guardian not set")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bengali text-sm text-muted-foreground">
                            {t("মোট আইটেম", "Items")}: {group.items.length}
                          </p>
                        </td>
                        <td className="px-4 py-4 font-bengali text-muted-foreground">-</td>
                        <td className="px-4 py-4 font-display font-semibold text-foreground">৳{group.totals.amount.toLocaleString("en-US")}</td>
                        <td className="px-4 py-4 font-display text-foreground">৳{group.totals.paid.toLocaleString("en-US")}</td>
                        <td className="px-4 py-4 font-display text-foreground">৳{group.totals.due.toLocaleString("en-US")}</td>
                        <td className="px-4 py-4">
                          <Badge variant={group.totals.due > 0 ? "outline" : "default"} className="rounded-full">
                            {group.totals.due > 0 ? t("বাকি", "Due") : t("পরিশোধিত", "Paid")}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          {group.items[0] ? (
                            <div className="flex flex-wrap gap-2">
                              <Button type="button" variant="outline" size="sm" className="rounded-xl font-bengali" onClick={() => onPayment(group.items[0])}>
                                <Receipt className="mr-2 h-4 w-4" />
                                {t("পেমেন্ট", "Payment")}
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="rounded-xl font-bengali" onClick={() => onEdit(group.items[0])}>
                                <Edit3 className="mr-2 h-4 w-4" />
                                {t("এডিট", "Edit")}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl font-bengali text-red-600 hover:text-red-600"
                                onClick={() => void onDelete(group.items[0].id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("মুছুন", "Delete")}
                              </Button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr key={`${group.studentId}-details`} className="border-b border-border/50">
                          <td colSpan={8} className="px-4 pb-6 pt-0">
                            <div className="mt-2 rounded-2xl border border-border/60 bg-muted/10 p-3">
                              <div className="grid gap-3">
                                {group.items.map((entry) => (
                                  <div key={entry.id} className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                                    <div className="grid gap-3 md:grid-cols-[1.6fr_0.9fr_0.8fr_0.9fr_0.9fr_0.9fr_1fr]">
                                      <div className="space-y-1">
                                        <p className="font-bengali font-medium text-foreground">{entry.title}</p>
                                        <p className="text-xs text-muted-foreground">{entry.category}</p>
                                        {entry.note && <p className="font-bengali text-xs text-muted-foreground">{entry.note}</p>}
                                      </div>
                                      <div className="text-xs font-bengali text-muted-foreground">{entry.billingMonth}</div>
                                      <div className="text-sm font-display font-semibold">৳{entry.amount.toLocaleString("en-US")}</div>
                                      <div className="text-sm font-display">৳{entry.paidAmount.toLocaleString("en-US")}</div>
                                      <div className="text-sm font-display">৳{entry.dueAmount.toLocaleString("en-US")}</div>
                                      <div>
                                        <Badge variant={statusVariant[entry.status]} className="rounded-full">
                                          {t(
                                            feeStatusOptions.find((item) => item.value === entry.status)?.labelBn || entry.status,
                                            feeStatusOptions.find((item) => item.value === entry.status)?.labelEn || entry.status,
                                          )}
                                        </Badge>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        <Button type="button" variant="outline" size="sm" className="rounded-xl font-bengali" onClick={() => onPayment(entry)}>
                                          <Receipt className="mr-2 h-4 w-4" />
                                          {t("পেমেন্ট", "Payment")}
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" className="rounded-xl font-bengali" onClick={() => onEdit(entry)}>
                                          <Edit3 className="mr-2 h-4 w-4" />
                                          {t("এডিট", "Edit")}
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" className="rounded-xl font-bengali text-red-600 hover:text-red-600" onClick={() => void onDelete(entry.id)}>
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          {t("মুছুন", "Delete")}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeEntriesTable;
