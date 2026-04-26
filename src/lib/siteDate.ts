const SITE_TIME_ZONE = "Asia/Dhaka";

export const getSiteDateInputValue = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
