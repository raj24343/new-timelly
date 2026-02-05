"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "../../AppLayout";
import { SUPERADMIN_SIDEBAR_ITEMS } from "../../constants/sidebar";
import Dashboard from "../../components/superadmin/Dashboard";
import AddSchool from "../../components/superadmin/AddSchool";
import Schools from "../../components/superadmin/Schools";
import Transactions from "../../components/superadmin/Transactions";
import RequiredRoles from "../../auth/RequiredRoles";

const SUPERADMIN_TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  addschool: "Add School",
  schools: "Schools",
  transactions: "Transactions",
};

function SuperAdminContent() {
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = SUPERADMIN_TAB_TITLES[tab] ?? tab.toUpperCase();
  const renderComponent = () => {
    switch (tab) {
      case "dashboard":
        return <Dashboard />;
      case "addschool":
        return <AddSchool />;
      case "schools":
        return <Schools />;
      case "transactions":
        return <Transactions />;
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <RequiredRoles allowedRoles={["SUPERADMIN"]}>
      <AppLayout
        title={title}
        activeTab={tab}
        menuItems={SUPERADMIN_SIDEBAR_ITEMS}
        profile={{ name: "Super Admin" }}
        children={renderComponent()}
      />
    </RequiredRoles>
  );
}

export default function SuperAdminDashboard() {
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-white/70">Loading...</div>}>
      <SuperAdminContent />
    </Suspense>
  );
}

