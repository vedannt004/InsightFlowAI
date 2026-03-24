"use client";
import { useState, useMemo } from "react";
import { useCurrency, ALL_CURRENCIES, Currency } from "@/contexts/CurrencyContext";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return ALL_CURRENCIES;
    const q = search.toLowerCase();
    return ALL_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.includes(q)
    );
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex items-center justify-between whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm h-9 px-4 gap-2 text-xs font-semibold border-border bg-background hover:bg-muted w-[210px]"
        role="combobox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Globe className="h-3.5 w-3.5 text-violet-500 shrink-0" />
          <span className="text-muted-foreground">{currency.symbol}</span>
          <span>{currency.code}</span>
          <span className="text-muted-foreground font-normal ml-1 truncate">
            {currency.name}
          </span>
        </div>
        <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-40 ml-2" />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <Command>
          <CommandInput
            placeholder="Search currency..."
            value={search}
            onValueChange={setSearch}
            className="h-9 text-sm"
          />
          <CommandList className="max-h-72">
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {filtered.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`${c.code} ${c.name}`}
                  onSelect={() => {
                    setCurrency(c);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex items-center gap-3 text-sm cursor-pointer"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      currency.code === c.code ? "opacity-100 text-violet-500" : "opacity-0"
                    )}
                  />
                  <span className="font-mono w-8 text-muted-foreground text-xs">
                    {c.symbol}
                  </span>
                  <span className="font-semibold text-xs">{c.code}</span>
                  <span className="text-muted-foreground truncate text-xs flex-1">
                    {c.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
