export function formatIndianTime(date) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}