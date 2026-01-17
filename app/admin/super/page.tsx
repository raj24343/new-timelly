import RequireRole from "@/components/RequireRole";
import SignupPage from "@/components/schoolSingup";

export default function SchoolSInguppahes() {
  return (
    <RequireRole allowedRoles={["SUPERADMIN"]}>
          <SignupPage />
    </RequireRole>
  );
}