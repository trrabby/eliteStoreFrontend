import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { enUS, bn } from "date-fns/locale";

// BD timezone offset — UTC+6
const BD_OFFSET_MS = 6 * 60 * 60 * 1000;

const toBDTime = (date: Date | string): Date => {
  const d = new Date(date);
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + BD_OFFSET_MS);
};

export const formatDate = (
  date: Date | string,
  locale: "en" | "bn" = "en",
  pattern: string = "dd MMM yyyy",
): string => {
  const d = toBDTime(date);
  return format(d, pattern, { locale: locale === "bn" ? bn : enUS });
};

export const formatDateTime = (
  date: Date | string,
  locale: "en" | "bn" = "en",
): string => {
  const d = toBDTime(date);
  return format(d, "dd MMM yyyy, hh:mm a", {
    locale: locale === "bn" ? bn : enUS,
  });
};

export const timeAgo = (
  date: Date | string,
  locale: "en" | "bn" = "en",
): string => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: locale === "bn" ? bn : enUS,
  });
};

export const smartDate = (
  date: Date | string,
  locale: "en" | "bn" = "en",
): string => {
  const d = new Date(date);
  if (isToday(d)) return locale === "bn" ? "আজ" : "Today";
  if (isYesterday(d)) return locale === "bn" ? "গতকাল" : "Yesterday";
  return formatDate(d, locale);
};
