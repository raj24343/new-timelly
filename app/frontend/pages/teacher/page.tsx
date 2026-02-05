"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AppLayout from "../../AppLayout";
import { TEACHER_MENU_ITEMS } from "../../constants/sidebar";
import RequiredRoles from "../../auth/RequiredRoles";

const TEACHER_TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  attendance: "Attendance",
  marks: "Marks",
  homework: "Homework",
  classes: "Classes",
  leaves: "Leave Request",
  circulars: "Circulars",
  settings: "Settings",
};

function TeacherDashboardContent() {
  const { data: session } = useSession();
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = TEACHER_TAB_TITLES[tab] ?? tab.toUpperCase();

  return (
    <RequiredRoles allowedRoles={["TEACHER"]}>
      <AppLayout
        activeTab={tab}
        title={title}
        menuItems={TEACHER_MENU_ITEMS}
        profile={{
          name: session?.user?.name ?? "Teacher",
          subtitle: "Teacher",
        }}
        children={
          <div>{/* TODO: render tab content here based on `tab` */}</div>
        }
      />
    </RequiredRoles>
  );
}

export default function TeacherDashboard() {
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-white/70">Loading...</div>}>
      <TeacherDashboardContent />
    </Suspense>
  );
}
