"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  onDelete: () => Promise<{ success: boolean; error?: string }>;
  itemName: string;
  redirectPath?: string;
  className?: string;
}

export default function DeleteButton({ onDelete, itemName, redirectPath, className = "dashboard-action-btn", showIcon = true }: DeleteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await onDelete();
      if (result.success) {
        setIsModalOpen(false);
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          router.refresh();
        }
      } else {
        alert(result.error || "Er is een fout opgetreden");
      }
    });
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className={className}
        title="Verwijderen"
        style={{ color: className.includes('btn') ? undefined : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        {showIcon && <Trash2 size={16} />}
        {className.includes('btn') && 'Verwijderen'}
      </button>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="page-card"
            style={{
              maxWidth: "500px",
              width: "100%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "2px solid var(--client-border)",
              }}
            >
              <h2 style={{ margin: 0 }}>Bevestig Verwijderen</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  color: "#64748b",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <p style={{ marginBottom: "2rem", color: "#64748b" }}>
              Weet je zeker dat je <strong>{itemName}</strong> wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={isPending}
              >
                Annuleren
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleDelete}
                disabled={isPending}
                style={{
                  background: isPending ? "#94a3b8" : "#ef4444",
                  borderColor: isPending ? "#94a3b8" : "#ef4444",
                }}
              >
                {isPending ? "Verwijderen..." : "Verwijderen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

