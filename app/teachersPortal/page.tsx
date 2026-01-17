import RequireRole from "@/components/RequireRole";
import TeachersPage from "@/components/teachersPortal";

export default function TeachersPortalPage() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
          <TeachersPage />
    </RequireRole>
  );
}