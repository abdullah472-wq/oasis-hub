import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FeeItemDraft } from "@/lib/feeEntries";
import { feeCategoryOptions } from "@/lib/feeHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MultiFeeItemFormProps {
  items: FeeItemDraft[];
  onChange: (items: FeeItemDraft[]) => void;
}

const MultiFeeItemForm = ({ items, onChange }: MultiFeeItemFormProps) => {
  const { t } = useLanguage();

  const updateItem = (index: number, patch: Partial<FeeItemDraft>) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const addItem = () => {
    onChange([...items, { title: "", category: "monthly", amount: 0, note: "" }]);
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${index}-${item.title}`} className="rounded-3xl border border-border/60 bg-muted/20 p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-bengali text-sm font-semibold text-foreground">
              {t("ফি আইটেম", "Fee Item")} #{index + 1}
            </p>
            <Button type="button" variant="outline" size="icon" className="rounded-2xl" onClick={() => removeItem(index)} disabled={items.length === 1}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.4fr_0.9fr_0.7fr]">
            <div className="space-y-2">
              <Label className="font-bengali">{t("আইটেমের নাম", "Item title")}</Label>
              <Input value={item.title} onChange={(event) => updateItem(index, { title: event.target.value })} className="rounded-2xl" placeholder={t("যেমন: মাসিক ফি / খাতা", "Example: Monthly fee / Khata")} />
            </div>

            <div className="space-y-2">
              <Label className="font-bengali">{t("ক্যাটাগরি", "Category")}</Label>
              <select value={item.category} onChange={(event) => updateItem(index, { category: event.target.value as FeeItemDraft["category"] })} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none">
                {feeCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelBn, option.labelEn)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="font-bengali">{t("পরিমাণ", "Amount")}</Label>
              <Input type="number" min="0" value={item.amount} onChange={(event) => updateItem(index, { amount: Number(event.target.value) })} className="rounded-2xl" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label className="font-bengali">{t("নোট", "Note")}</Label>
            <Textarea value={item.note} onChange={(event) => updateItem(index, { note: event.target.value })} className="rounded-2xl" rows={2} placeholder={t("ঐচ্ছিক নোট", "Optional note")} />
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-3 rounded-3xl border border-dashed border-border/70 bg-background p-4 md:flex-row md:items-center md:justify-between">
        <Button type="button" variant="outline" className="rounded-2xl font-bengali" onClick={addItem}>
          <Plus className="mr-2 h-4 w-4" />
          {t("আরও আইটেম যোগ করুন", "Add another item")}
        </Button>
        <p className="font-bengali text-sm font-medium text-foreground">
          {t("সাবটোটাল", "Subtotal")}: <span className="font-display">৳{subtotal.toLocaleString("en-US")}</span>
        </p>
      </div>
    </div>
  );
};

export default MultiFeeItemForm;
