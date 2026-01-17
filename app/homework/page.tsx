import HomeworkPage from "@/components/Homework";
import RequireRole from "@/components/RequireRole";

export default function HomeworkPages() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
          <HomeworkPage/>
    </RequireRole>
  );
}