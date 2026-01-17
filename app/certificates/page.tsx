import CertificatesPage from "@/components/Certificates";
import RequireRole from "@/components/RequireRole";

export default function CertificatesPages() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
          <CertificatesPage />
    </RequireRole>
  );
}