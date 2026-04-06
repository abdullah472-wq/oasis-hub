import { Edit3, Receipt, Trash2 } from "lucide-react";
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

  return (
    <Card className="rounded-3xl border-0 bg-transparent shadow-none">
      <CardContent className="p-0">
        {entries.length === 0 ? (
          <div className="px-6 py-12 text-center font-bengali text-sm text-muted-foreground">
            {t("কোনো ফি এন্ট্রি পাওয়া যায়নি", "No fee entries found")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
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
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50 align-top">
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="font-bengali font-medium text-foreground">{entry.studentName}</p>
                        <p className="font-bengali text-xs text-muted-foreground">{entry.className}</p>
                        <p className="font-bengali text-xs text-muted-foreground">{entry.guardianName || t("অভিভাবক উল্লেখ নেই", "Guardian not set")}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="font-bengali font-medium text-foreground">{entry.title}</p>
                        <p className="text-xs text-muted-foreground">{entry.category}</p>
                        {entry.note && <p className="font-bengali text-xs text-muted-foreground">{entry.note}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bengali text-muted-foreground">{entry.billingMonth}</td>
                    <td className="px-4 py-4 font-display font-semibold text-foreground">৳{entry.amount.toLocaleString("en-US")}</td>
                    <td className="px-4 py-4 font-display text-foreground">৳{entry.paidAmount.toLocaleString("en-US")}</td>
                    <td className="px-4 py-4 font-display text-foreground">৳{entry.dueAmount.toLocaleString("en-US")}</td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[entry.status]} className="rounded-full">
                        {t(
                          feeStatusOptions.find((item) => item.value === entry.status)?.labelBn || entry.status,
                          feeStatusOptions.find((item) => item.value === entry.status)?.labelEn || entry.status,
                        )}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeEntriesTable;
