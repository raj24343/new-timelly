import RequireRole from "@/components/RequireRole";
import Home from "@/components/schoolAdmin";

export default function SchoolAdminPages() {
  return (
    <RequireRole allowedRoles={["SCHOOLADMIN"]}>
          <Home />
    </RequireRole>
  );
}