import RequireRole from "@/components/RequireRole";
import SchoolPage from "@/components/school";

export default function SchoolPages() {
  return (
    <RequireRole allowedRoles={["SCHOOLADMIN"]}>
          <SchoolPage />
    </RequireRole>
  );
}