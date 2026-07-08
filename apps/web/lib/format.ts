export function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder.toString().padStart(2, "0")}m`;
}

export function formatRating(rating: number) {
  return rating > 0 ? rating.toFixed(1) : "Live";
}
