import RequireRole from "@/components/RequireRole";
import StudentDashboardPage from "@/components/student";

export default function StudnetPages() {
  return (
    <RequireRole allowedRoles={["STUDENT"]}>
          <StudentDashboardPage />
    </RequireRole>
  );
}