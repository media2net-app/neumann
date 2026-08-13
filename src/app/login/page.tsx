import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import {
  clientDashboardPath,
  isClientId,
  listClients,
} from "@/lib/clients";

async function loginAction(clientId: string) {
  "use server";

  if (!isClientId(clientId)) {
    redirect("/login");
  }

  const cookieStore = await cookies();

  cookieStore.set("demo-client", clientId, {
    path: "/",
    httpOnly: false,
    maxAge: 60 * 60 * 8,
    sameSite: "lax",
  });

  redirect("/dashboard");
}

export default function LoginPage() {
  const clients = listClients();

  return (
    <div className="login-page">
      <LoginForm clients={clients} loginAction={loginAction} />
    </div>
  );
}

