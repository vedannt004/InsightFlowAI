"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// All world currencies
export const ALL_CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س" },
  { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب" },
  { code: "OMR", name: "Omani Rial", symbol: "ر.ع." },
  { code: "JOD", name: "Jordanian Dinar", symbol: "د.أ" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "रू" },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh" },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA" },
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م." },
  { code: "DZD", name: "Algerian Dinar", symbol: "دج" },
  { code: "TND", name: "Tunisian Dinar", symbol: "د.ت" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "CLP", name: "Chilean Peso", symbol: "CL$" },
  { code: "COP", name: "Colombian Peso", symbol: "CO$" },
  { code: "ARS", name: "Argentine Peso", symbol: "AR$" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/." },
  { code: "VES", name: "Venezuelan Bolívar", symbol: "Bs." },
  { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs." },
  { code: "PYG", name: "Paraguayan Guaraní", symbol: "₲" },
  { code: "UYU", name: "Uruguayan Peso", symbol: "UY$" },
  { code: "CRC", name: "Costa Rican Colón", symbol: "₡" },
  { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q" },
  { code: "HNL", name: "Honduran Lempira", symbol: "L" },
  { code: "NIO", name: "Nicaraguan Córdoba", symbol: "C$" },
  { code: "DOP", name: "Dominican Peso", symbol: "RD$" },
  { code: "TTD", name: "Trinidad Dollar", symbol: "TT$" },
  { code: "JMD", name: "Jamaican Dollar", symbol: "J$" },
  { code: "BBD", name: "Barbadian Dollar", symbol: "Bds$" },
  { code: "XCD", name: "East Caribbean Dollar", symbol: "EC$" },
  { code: "ISK", name: "Icelandic Króna", symbol: "kr" },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв" },
  { code: "RSD", name: "Serbian Dinar", symbol: "din" },
  { code: "MKD", name: "Macedonian Denar", symbol: "ден" },
  { code: "BAM", name: "Bosnian Marka", symbol: "KM" },
  { code: "ALL", name: "Albanian Lek", symbol: "L" },
  { code: "GEL", name: "Georgian Lari", symbol: "₾" },
  { code: "AMD", name: "Armenian Dram", symbol: "֏" },
  { code: "AZN", name: "Azerbaijani Manat", symbol: "₼" },
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸" },
  { code: "UZS", name: "Uzbekistani Som", symbol: "so'm" },
  { code: "MNT", name: "Mongolian Tögrög", symbol: "₮" },
  { code: "KGS", name: "Kyrgyzstani Som", symbol: "с" },
  { code: "TJS", name: "Tajikistani Somoni", symbol: "SM" },
  { code: "AFN", name: "Afghan Afghani", symbol: "؋" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼" },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د" },
  { code: "SYP", name: "Syrian Pound", symbol: "£S" },
  { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل" },
  { code: "YER", name: "Yemeni Rial", symbol: "﷼" },
  { code: "MUR", name: "Mauritian Rupee", symbol: "Rs" },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT" },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK" },
  { code: "BWP", name: "Botswana Pula", symbol: "P" },
  { code: "NAD", name: "Namibian Dollar", symbol: "N$" },
  { code: "SZL", name: "Swazi Lilangeni", symbol: "L" },
  { code: "LSL", name: "Lesotho Loti", symbol: "L" },
  { code: "MVR", name: "Maldivian Rufiyaa", symbol: "Rf" },
  { code: "BTN", name: "Bhutanese Ngultrum", symbol: "Nu" },
  { code: "KHR", name: "Cambodian Riel", symbol: "៛" },
  { code: "LAK", name: "Lao Kip", symbol: "₭" },
  { code: "PGK", name: "Papua New Guinean Kina", symbol: "K" },
  { code: "FJD", name: "Fijian Dollar", symbol: "FJ$" },
  { code: "SBD", name: "Solomon Islands Dollar", symbol: "SI$" },
  { code: "TOP", name: "Tongan Paʻanga", symbol: "T$" },
  { code: "WST", name: "Samoan Tālā", symbol: "WS$" },
  { code: "VUV", name: "Vanuatu Vatu", symbol: "VT" },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Record<string, number>;
  convert: (usdAmount: number) => number;
  format: (usdAmount: number, compact?: boolean) => string;
  loadingRates: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: ALL_CURRENCIES[0],
  setCurrency: () => {},
  rates: {},
  convert: (n) => n,
  format: (n) => `$${n.toLocaleString()}`,
  loadingRates: false,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(ALL_CURRENCIES[0]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    // Load saved currency preference
    const saved = localStorage.getItem("insightflow_currency");
    if (saved) {
      const found = ALL_CURRENCIES.find((c) => c.code === saved);
      if (found) setCurrencyState(found);
    }
  }, []);

  useEffect(() => {
    // Fetch live exchange rates from free API (no key needed)
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((data) => {
        if (data.rates) setRates(data.rates);
      })
      .catch(() => {
        // Fallback: approximate static rates if API fails
        setRates({
          USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150.2, CNY: 7.24, INR: 83.1,
          CAD: 1.36, AUD: 1.53, CHF: 0.90, HKD: 7.82, SGD: 1.35, NZD: 1.63,
          KRW: 1325, MXN: 17.1, BRL: 4.97, RUB: 91.5, TRY: 32.2, ZAR: 18.6,
          SEK: 10.4, NOK: 10.6, DKK: 6.89, PLN: 3.98, CZK: 23.0, HUF: 356,
          RON: 4.6, AED: 3.67, SAR: 3.75, QAR: 3.64, KWD: 0.307, NGN: 1500,
          PKR: 278, BDT: 110, THB: 35.1, VND: 24500, IDR: 15700, MYR: 4.72,
          PHP: 55.8, TWD: 31.8, KES: 130, GHS: 14.2, EGP: 48.0, ILS: 3.65,
          ARS: 900, CLP: 950, COP: 3900, PEN: 3.75, UAH: 38.0, KZT: 450,
          GEL: 2.65, AZN: 1.7, AMD: 400, BHD: 0.377, OMR: 0.385, JOD: 0.709,
        });
      })
      .finally(() => setLoadingRates(false));
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("insightflow_currency", c.code);
  }, []);

  const convert = useCallback(
    (usdAmount: number) => {
      const rate = rates[currency.code] ?? 1;
      return usdAmount * rate;
    },
    [rates, currency.code]
  );

  const format = useCallback(
    (usdAmount: number, compact = false) => {
      const converted = convert(usdAmount);
      const sym = currency.symbol;
      if (compact) {
        if (Math.abs(converted) >= 1_000_000)
          return `${sym}${(converted / 1_000_000).toFixed(1)}M`;
        if (Math.abs(converted) >= 1_000)
          return `${sym}${(converted / 1_000).toFixed(1)}k`;
        return `${sym}${Math.round(converted).toLocaleString()}`;
      }
      return `${sym}${converted.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    },
    [convert, currency.symbol]
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, rates, convert, format, loadingRates }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
