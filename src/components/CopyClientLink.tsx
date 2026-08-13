"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export default function CopyClientLink({
  planId,
  variant = "icon",
}: {
  planId: string;
  variant?: "icon" | "button";
}) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/my-plan/${planId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Kopieer deze link:", url);
    }
  };

  if (variant === "button") {
    return (
      <button type="button" className="btn btn--secondary" onClick={copy}>
        {copied ? <Check size={16} /> : <Link2 size={16} />}
        {copied ? "Gekopieerd!" : "Kopieer klantlink"}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="dashboard-action-btn"
      title={copied ? "Gekopieerd!" : "Klantlink kopiëren"}
      aria-label="Klantlink kopiëren"
      onClick={copy}
    >
      {copied ? <Check size={16} /> : <Link2 size={16} />}
    </button>
  );
}
