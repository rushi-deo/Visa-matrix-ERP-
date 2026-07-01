import React from "react";
const getStatusTone = (label) => {
  const normalizedLabel = String(label ?? "").toLowerCase();

  if (
    normalizedLabel.includes("approved") ||
    normalizedLabel.includes("paid") ||
    normalizedLabel.includes("verified") ||
    normalizedLabel.includes("completed") ||
    normalizedLabel.includes("converted") ||
    normalizedLabel.includes("live") ||
    normalizedLabel.includes("active") ||
    normalizedLabel.includes("uploaded")
  ) {
    return "success";
  }

  if (
    normalizedLabel.includes("pending") ||
    normalizedLabel.includes("follow-up") ||
    normalizedLabel.includes("open") ||
    normalizedLabel.includes("missing") ||
    normalizedLabel.includes("waiting") ||
    normalizedLabel.includes("overdue")
  ) {
    return "warning";
  }

  if (
    normalizedLabel.includes("review") ||
    normalizedLabel.includes("partial") ||
    normalizedLabel.includes("qualified") ||
    normalizedLabel.includes("scheduled") ||
    normalizedLabel.includes("progress") ||
    normalizedLabel.includes("processing") ||
    normalizedLabel.includes("filed")
  ) {
    return "info";
  }

  if (
    normalizedLabel.includes("escalated") ||
    normalizedLabel.includes("rejected") ||
    normalizedLabel.includes("blocked")
  ) {
    return "danger";
  }

  if (normalizedLabel.includes("draft")) {
    return "neutral";
  }

  return "neutral";
};

export default function StatusPill({ label }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusTone(label) === "success" ? "bg-emerald-50 text-emerald-700" : getStatusTone(label) === "warning" ? "bg-amber-50 text-amber-700" : getStatusTone(label) === "info" ? "bg-blue-50 text-blue-700" : getStatusTone(label) === "danger" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"}`}>{label}</span>;
}
