import RequireRole from "@/components/RequireRole";
import SettingsForm from "@/components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <RequireRole allowedRoles={["SUPERADMIN", "SCHOOLADMIN", "TEACHER", "STUDENT"]}>
      <SettingsForm />
    </RequireRole>
  );
}

