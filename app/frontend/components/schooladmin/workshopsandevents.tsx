"use client";

import HeaderActionButton from "../common/HeaderActionButton";
import PageHeader from "../common/PageHeader";
import CreateHub from "./workshops/CreateHub";
import { CalendarDays, CheckCircle, List, Plus, Users } from "lucide-react";
import { ReactNode, useState } from "react";

export default function WorkshopsAndEventsTab() {
  const [activeAction, setActiveAction] = useState<"workshop" | "none">("none");

  const StatTile = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string;
    icon: ReactNode;
  }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 md:px-5 md:py-4 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-lime-400">
          {icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-white/60">
            {title}
          </div>
          <div className="text-2xl font-semibold text-white">{value}</div>
        </div>
      </div>
    </div>
  );

  const renderButton = (
    type: "workshop",
    Icon: any,
    label: string,
    onClick: () => void,
    primary?: boolean
  ) => {
    const isActive = type === "workshop" && activeAction === "workshop";

    return (
      <>
        {/* MOBILE */}
        <div className="xl:hidden">
          {isActive ? (
            <HeaderActionButton
              icon={Icon}
              label={label}
              primary={primary}
              onClick={onClick}
            />
          ) : (
            <button
              onClick={onClick}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            >
              <Icon size={18} />
            </button>
          )}
        </div>

        {/* DESKTOP */}
        <div className="hidden xl:block">
          <HeaderActionButton
            icon={Icon}
            label={label}
            primary={primary}
            onClick={onClick}
          />
        </div>
      </>
    );
  };

  return (
    <div className="px-4 md:px-6 pb-24 lg:pb-6 text-gray-200">
      <div className="w-full space-y-6">
        <PageHeader
          title="Workshops & Events"
          subtitle="Plan, manage, and issue certificates for workshops and events"
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg flex flex-col xl:flex-row xl:items-center justify-between gap-4"
          rightSlot={
            <div className="w-full xl:w-auto">
              <div className="flex flex-wrap gap-2 sm:gap-3 xl:justify-end">
                {renderButton(
                  "workshop",
                  Plus,
                  "Create Event",
                  () => setActiveAction("workshop"),
                  true
                )}
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile title="TOTAL" value="3" icon={<List size={24} />} />
          <StatTile title="UPCOMING" value="2" icon={<CalendarDays size={24} />} />
          <StatTile title="PARTICIPANTS" value="143" icon={<Users size={24} />} />
          <StatTile title="COMPLETED" value="1" icon={<CheckCircle size={24} />} />
        </div>

        <CreateHub />
      </div>
    </div>
  );
}
