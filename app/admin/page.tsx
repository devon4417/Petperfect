import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import AdminDashboard from "./AdminDashboard";

// Server component: unauthenticated visitors are redirected before the
// dashboard (or any order data) is ever sent to their browser.
export default function AdminPage() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    redirect("/admin/login");
  }
  return <AdminDashboard />;
}
