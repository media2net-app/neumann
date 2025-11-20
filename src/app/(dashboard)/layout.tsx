import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { getNeumannClient } from "@/lib/clients";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const client = getNeumannClient();

  return (
    <div data-client={client.id} className="client-shell">
      <Sidebar client={client} />
      <div className="client-main">
        <div className="client-content">{children}</div>
      </div>
    </div>
  );
}

