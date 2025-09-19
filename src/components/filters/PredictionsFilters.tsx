"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SlidersHorizontal, Filter, Calendar, ListFilter, ArrowDownZA } from "lucide-react";

const DATE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "Weekend" },
] as const;

const TYPE_OPTIONS = [
  { value: "ALL", label: "All types" },
  { value: "ONE_X_TWO", label: "1X2" },
  { value: "OVER_UNDER", label: "Over/Under" },
  { value: "BTTS", label: "BTTS" },
  { value: "HT_FT", label: "HT/FT" },
  { value: "CUSTOM", label: "Custom" },
] as const;

const SORT_OPTIONS = [
  { value: "DATE_DESC", label: "Newest" },
  { value: "DATE_ASC", label: "Oldest" },
  { value: "CONF_DESC", label: "Conf: High to Low" },
  { value: "CONF_ASC", label: "Conf: Low to High" },
] as const;

export function PredictionsFilters({ currentDate, currentType, currentSort }: { currentDate: string; currentType: string; currentSort: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initial = useMemo(() => ({
    date: (currentDate || "all") as (typeof DATE_OPTIONS)[number]["value"],
    type: (currentType || "ALL") as (typeof TYPE_OPTIONS)[number]["value"],
    sort: (currentSort || "DATE_DESC") as (typeof SORT_OPTIONS)[number]["value"],
  }), [currentDate, currentType, currentSort]);

  const [mobile, setMobile] = useState(initial);

  const applyParams = (next: { date?: string; type?: string; sort?: string }) => {
    const url = new URL(window.location.href);
    if (next.date) url.searchParams.set("date", next.date);
    if (next.type) url.searchParams.set("type", next.type);
    if (next.sort) url.searchParams.set("sort", next.sort);
    router.push(url.pathname + url.search);
  };

  const clearAll = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("date", "all");
    url.searchParams.set("type", "ALL");
    url.searchParams.set("sort", "DATE_DESC");
    router.push(url.pathname + url.search);
  };

  return (
    <div className="w-full">
      {/* Desktop toolbar */}
      <div className="hidden md:flex items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue={initial.date} onValueChange={(v) => applyParams({ date: v })}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {DATE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue={initial.type} onValueChange={(v) => applyParams({ type: v })}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TYPE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDownZA className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue={initial.sort} onValueChange={(v) => applyParams({ sort: v })}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SORT_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearAll}>Reset</Button>
        </div>
      </div>

      {/* Mobile trigger */}
      <div className="md:hidden">
        <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => setOpen(true)}>
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl px-6 pt-4 pb-6 pb-[env(safe-area-inset-bottom)]">
            <SheetHeader className="p-0">
              <SheetTitle className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-3 space-y-5 mx-auto w-full max-w-md">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <Select value={mobile.date} onValueChange={(v) => setMobile(m => ({ ...m, date: v as typeof m.date }))}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <Select value={mobile.type} onValueChange={(v) => setMobile(m => ({ ...m, type: v as typeof m.type }))}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Sort</p>
                <Select value={mobile.sort} onValueChange={(v) => setMobile(m => ({ ...m, sort: v as typeof m.sort }))}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setMobile(initial); applyParams(initial); setOpen(false); }}>Reset</Button>
                <Button className="flex-1" onClick={() => { applyParams(mobile); setOpen(false); }}>Apply</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
