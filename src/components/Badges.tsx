import React from "react";

export function StatusBadge({ status }: { status: string }) {
  let style = "bg-brand-white text-brand-black border-brand-black";

  switch (status) {
    case "Open":
      style = "bg-brand-accent text-brand-black border-brand-black";
      break;
    case "Assigned":
      style = "bg-brand-primary text-brand-white border-brand-black";
      break;
    case "In Progress":
      style = "bg-brand-black text-brand-accent border-brand-black";
      break;
    case "Waiting for Customer":
      style = "bg-brand-offwhite text-brand-black border-brand-black";
      break;
    case "Resolved":
      style = "bg-brand-primary text-brand-white border-brand-black";
      break;
    case "Closed":
      style = "bg-brand-black text-brand-white border-brand-black";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold font-mono tracking-wider uppercase border ${style}`}>
      [{status}]
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "Critical":
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold font-mono tracking-wider uppercase bg-brand-pink text-brand-white border border-brand-black shadow-hard-pink">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-white mr-1.5 animate-pulse" />
          CRITICAL
        </span>
      );
    case "High":
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold font-mono tracking-wider uppercase bg-brand-accent text-brand-black border border-brand-black">
          HIGH
        </span>
      );
    case "Medium":
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold font-mono tracking-wider uppercase bg-brand-white text-brand-black border border-brand-black">
          MEDIUM
        </span>
      );
    case "Low":
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-mono tracking-wider uppercase bg-brand-offwhite text-brand-black border border-brand-black/40">
          LOW
        </span>
      );
  }
}

export function SentimentBadge({ sentiment }: { sentiment: string }) {
  let style = "bg-brand-white text-brand-black border-brand-black";

  switch (sentiment) {
    case "Frustrated":
    case "Angry":
      style = "bg-brand-pink text-brand-white border-brand-black";
      break;
    case "Urgent":
      style = "bg-brand-accent text-brand-black border-brand-black font-bold";
      break;
    case "Confused":
      style = "bg-brand-offwhite text-brand-black border-brand-black";
      break;
    case "Satisfied":
      style = "bg-brand-primary text-brand-white border-brand-black";
      break;
    case "Neutral":
    default:
      style = "bg-brand-white text-brand-black border-brand-black/60";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono tracking-wider uppercase border ${style}`}>
      SENTIMENT: {sentiment}
    </span>
  );
}
