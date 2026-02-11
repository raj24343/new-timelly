"use client";

import React, { useEffect, useState } from "react";
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Pencil,
  LayoutGrid,
  Loader2 
} from "lucide-react";
import PageHeader from "../../../common/PageHeader";


export default function ExamDetailsView({ examId, onBack, onEdit }: any) {
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDetails() {
      setLoading(true);
      try {
        // Attempt to fetch from API
        const res = await fetch(`/api/exams/terms/${examId}`);
        const data = await res.json();
        
        if (data.term) {
          setExam(data.term);
        } else {
          throw new Error("No data");
        }
      } catch (error) {
        console.log("Using dummy data fallback...");
        // EXACT DUMMY DATA MATCHING YOUR SCREENSHOTS
        setExam({
          name: "Term 1 Mathematics Finals",
          status: "UPCOMING",
          date: "2023-10-15",
          time: "09:00 AM",
          duration: "3 Hours",
          subject: "Mathematics",
          totalCoverage: 65,
          class: { name: "10", section: "A" },
          syllabus: [
            { subject: "Real Numbers", completedPercent: 100 },
            { subject: "Polynomials", completedPercent: 100 },
            { subject: "Quadratic Equations", completedPercent: 60 },
            { subject: "Arithmetic Progressions", completedPercent: 0 }
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (examId) {
      getDetails();
    }
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-[#b4ff39] gap-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="text-white/40 font-bold tracking-widest uppercase text-xs">Loading Details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-10 animate-in fade-in duration-500">
      {/* NAVIGATION & HEADER */}
      <div className="px-1 md:px-0 mb-4">
       
        
        <PageHeader
          title={exam?.name || "Exam Details"}
          subtitle="Detailed breakdown of schedule and syllabus progress"
          icon={<CheckCircle2 className="text-[#b4ff39]" size={28} />}
        />
      </div>
       <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Exams</span>
        </button>

      <div className="max-w-[1450px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-1 md:px-0">
        
        {/* LEFT COLUMN: EXAM PROFILE CARD */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className=" bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-[1rem] p-4 flex flex-col gap-5 shadow-2xl">
            
            <div className="flex justify-between items-center">
               <h2 className="text-ms tracking-tight text-white uppercase ">Exam Info</h2>
               <span className="px-4 py-1 rounded-full bg-[#b4ff39]/10   border border-[#b4ff39]/30 text-[#b4ff39] text-[10px] font-black tracking-[0.2em]">
                 {exam?.status}
               </span>
            </div>

            <div className="space-y-4">
              {/* Date Chip */}
              <div className="backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-4 transition-all ">
                <div className="p-3 bg-[#b4ff39]/10 rounded-xl text-[#b4ff39]">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Date</p>
                  <p className="text-ms text-white/90">{exam?.date}</p>
                </div>
              </div>

              {/* Time Chip */}
              <div className="backdrop-blur-xl border border-white/10 border border-white/10 rounded-2xl p-3 flex items-center gap-4 transition-all ">
                <div className="p-3 bg-[#b4ff39]/10 rounded-xl text-[#b4ff39]">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Time</p>
                  <p className="text-ms  text-white/90">{exam?.time} ({exam?.duration})</p>
                </div>
              </div>

              {/* Class Chip */}
              <div className="backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-4 transition-all ">
                <div className="p-3 bg-[#b4ff39]/10 rounded-xl text-[#b4ff39]">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Class & Subject</p>
                  <p className="text-ms  text-white/90">
                    Class {exam?.class?.name}-{exam?.class?.section} • {exam?.subject}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Coverage Bar */}
            <div className="mt-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-end mb-3">
                   <p className="text-[8px]  text-white/40 uppercase tracking-[0.2em]">Total Coverage</p>
                   <span className="text-xl  text-[#b4ff39]">{exam?.totalCoverage}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#b4ff39] shadow-[0_0_20px_rgba(180,255,57,0.5)] transition-all duration-1000" 
                      style={{ width: `${exam?.totalCoverage}%` }}
                    />
                </div>
            </div>
          </div>

          {/* Edit Button */}
          <button 
            onClick={onEdit}
            className="w-full bg-[#b4ff39] text-black py-3 rounded-2xl  font-bold text-sm uppercase  flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(180,255,57,0.3)] "
          >
            <Pencil size={18} />    
            Edit Exam Details
          </button>
        </div>

        {/* RIGHT COLUMN: SYLLABUS BREAKDOWN */}
        <div className="lg:col-span-8 bg-[#1e162e]/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden">
          <div className="p-9 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
            <CheckCircle2 className="text-[#b4ff39]" size={24} />
            <h2 className="text-ms tracking-tight text-white ">Syllabus Breakdown</h2>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[850px] custom-scrollbar">
            {exam?.syllabus?.map((unit: any, idx: number) => (
              <div key={idx} className=" border border-white/5 rounded-[1rem] p-2 flex flex-col gap-6 transition-all hover:bg-[#2a213a]/45">
                <div className="flex items-center gap-6">
                  {/* Step ID */}
                  <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-sm font-black shadow-inner">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-ms  text-white tracking-tight">{unit.subject}</h3>
                      <span className="text-xl  text-white/90">{unit.completedPercent}%</span>
                    </div>
                    <p className={`text-[10px]  uppercase tracking-[0.2em] ${
                      unit.completedPercent === 100 ? 'text-[#b4ff39]' : 
                      unit.completedPercent > 0 ? 'text-yellow-400' : 'text-red-500'
                    }`}>
                      {unit.completedPercent === 100 ? 'COMPLETED' : unit.completedPercent > 0 ? 'PARTIAL' : 'PENDING'}
                    </p>
                  </div>
                </div>

                {/* Progress Visual */}
                <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(180,255,57,0.4)] ${
                      unit.completedPercent === 100 ? 'bg-[#b4ff39]' : 
                      unit.completedPercent > 0 ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'bg-red-400'
                    }`}
                    style={{ width: `${unit.completedPercent}%` }}
                  />
                </div>
                
                <div className="flex justify-end">
                   <p className="text-[10px]  text-white/20 uppercase tracking-widest">Complete</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}