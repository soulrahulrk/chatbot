export function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return timePart;

  const datePart = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${datePart} · ${timePart}`;
}

export default formatTimestamp;
