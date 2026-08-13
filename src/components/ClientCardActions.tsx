"use client";

import Link from "next/link";
import { Edit, Calendar } from "lucide-react";
import DeleteButton from "@/components/DeleteButton";

type ClientCardActionsProps = {
  clientId: string;
  clientName: string;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
};

export default function ClientCardActions({
  clientId,
  clientName,
  onDelete,
}: ClientCardActionsProps) {
  return (
    <div
      className="dashboard-actions"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Link
        href={`/clients/${clientId}`}
        className="dashboard-action-btn"
        title="Bekijken"
        onClick={(e) => e.stopPropagation()}
      >
        <Edit size={16} />
      </Link>
      <Link
        href={`/clients/${clientId}`}
        className="dashboard-action-btn"
        title="Agenda"
        onClick={(e) => e.stopPropagation()}
      >
        <Calendar size={16} />
      </Link>
      <DeleteButton
        onDelete={onDelete}
        itemName={clientName}
        redirectPath="/clients"
      />
    </div>
  );
}
