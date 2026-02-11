"use client";
import { useEffect, useState } from "react";
import { X, Plus, BookOpen, CheckCircle2, Trash2, Save, Calendar, Clock } from "lucide-react";
import PageHeader from "../../../common/PageHeader";

export default function ScheduleExamView({
    mode = "create",
    examId,
    onCancel,
    onSave,
}: any) {
    const [units, setUnits] = useState([
        { id: 1, name: "Real Numbers", status: "Completed", completion: 100 },
        { id: 2, name: "Polynomials", status: "Completed", completion: 100 },
        { id: 3, name: "Quadratic Equations", status: "Partial", completion: 60 },
    ]);

    const addUnit = () => setUnits([...units, { id: Date.now(), name: "", status: "Pending", completion: 0 }]);
    const removeUnit = (id: number) => setUnits(units.filter(u => u.id !== id));

    const isEdit = mode === "edit";

    return (
        <div className="min-h-screen text-white pb-10">
            <PageHeader
                title={isEdit ? "Edit Exam" : "Schedule Exam"}
                subtitle="Manage schedules and track syllabus coverage"
            />

            <form className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">

                {/* LEFT COLUMN: Exam Details Card */}
              <div className="lg:col-span-4 flex flex-col gap-6">
    {/* EXAM DETAILS CONTAINER */}
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-[1rem] p-8 flex flex-col gap-8 h-fit ">
        <div className="flex items-center gap-3">
            <BookOpen className="text-lime-400" size={22} />
            <h2 className="text-xl font-semibold text-white">Exam Details</h2>
        </div>

        <div className="space-y-3">
            {/* Exam Title */}
            <div className="flex flex-col gap-2">
                <label className="text-[12px] text-white/50 uppercase ">Exam Title</label>
                <input 
                    placeholder="Term 1 Mathematics Finals" 
                    className="bg-[#2a213a]/50 border border-white/5 rounded-2xl p-2 text-white/80 focus:border-[#b4ff39]/50 focus:bg-[#2a213a] outline-none transition-all placeholder:text-white" 
                />
            </div>

            {/* Class and Subject */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px]  text-white/30 uppercase tracking-[0.1em]">Class</label>
                    <input placeholder="Class 10-A" className="bg-[#2a213a]/50 border border-white/5 rounded-2xl p-2 text-white/80 focus:border-[#b4ff39]/50 outline-none placeholder:text-white/20" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Subject</label>
                    <input placeholder="Mathematics" className="bg-[#2a213a]/50 border border-white/5 rounded-2xl p-2 text-white/80 focus:border-[#b4ff39]/50 outline-none placeholder:text-white/20" />
                </div>
            </div>

            {/* Date and Status */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 relative">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Date</label>
                    <input type="text" placeholder="10/15/2023" className="bg-[#2a213a]/50 border border-white/5 rounded-2xl p-2 text-white/80 outline-none placeholder:text-white/20" />
                    <Calendar className="absolute right-4 bottom-4 text-white/40" size={18} />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Status</label>
                    <div className="bg-[#2a213a]/50 border border-white/5 rounded-2xl p-2 text-white/80">Upcoming</div>
                </div>
            </div>

            {/* Time and Duration */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 relative">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Time</label>
                    <input type="text" placeholder="--:-- --" className="bg-[#2a213a]/50 border border-white/5 rounded-2xl p-2 text-white outline-none placeholder:text-white/20" />
                    <Clock className="absolute right-4 bottom-4 text-white/40" size={18} />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Duration</label>
                    <input placeholder="3 Hours" className="bg-[#2a213a]/50 border border-white/5 rounded-2xl p-2 text-white outline-none placeholder:text-white/20" />
                </div>
            </div>
        </div>
    </div>

   
    <div className="flex gap-4">
        <button 
            type="button" 
            onClick={onCancel} 
            className="flex-1 bg-[#1e162e]/40 backdrop-blur-xl border border-white/10 py-4 rounded-2xl font-semibold text-white hover:bg-white/10 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
        >
            <X size={18} /> Cancel
        </button>
        <button 
            type="submit" 
            className="flex-[1.5] bg-[#b4ff39] text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(180,255,57,0.2)] hover:scale-[1.02] transition-transform"
        >
            <Save size={20} /> Save Exam
        </button>
    </div>
</div>

                {/* RIGHT COLUMN: Syllabus & Coverage Card */}
              <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-[1rem] flex flex-col overflow-hidden shadow-2xl">
    {/* Header Section */}
    <div className="p-8 border-b border-white/30 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[#b4ff39]/10 rounded-lg">
                <CheckCircle2 className="text-[#b4ff39]" size={20} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white">Syllabus & Coverage</h2>
        </div>
        <button type="button" onClick={addUnit} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white/70 text-xs font-bold flex items-center gap-2 hover:bg-[#b4ff39] hover:text-black transition-all">
            <Plus size={16} /> Add Unit
        </button>
    </div>

    {/* Units Content */}
    <div className="p-2 space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar">
        {units.map((unit, idx) => (
            <div key={unit.id} className=" text-white-400 border border-white/5 rounded-[1rem] p-5 relative transition-all hover:bg-[#2a213a]/50 group">
                <div className="flex gap-8">
                    {/* Number Badge */}
                    <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white-400 text-sm font-bold shrink-0">
                        {idx + 1}
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <input
                                value={unit.name}
                                onChange={(e) => {
                                    const newUnits = [...units];
                                    newUnits[idx].name = e.target.value;
                                    setUnits(newUnits);
                                }}
                                placeholder="Unit / Topic Name"
                                className="bg-transparent text-sm font-semibold text-white w-full outline-none "
                            />
                            <button onClick={() => removeUnit(unit.id)} className="text-white/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 size={20} />
                            </button>
                        </div>

                        {/* SINGLE ROW: Status Buttons + Progress Bar */}
                        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6 xl:gap-8">
                            
                            {/* Status Selection */}
                            <div className="shrink-0 z-10">
                                <label className="block text-[10px]  text-white/20 uppercase tracking-[0.1em] mb-3">Status</label>
                                <div className="flex items-center">
                                    <div className="flex p-1  rounded-xl border border-white/5">
                                        {["Pending", "Partial", "Completed"].map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => {
                                                    const newUnits = [...units];
                                                    newUnits[idx].status = status;
                                                    // Sync completion percentage based on status
                                                    if (status === "Completed") newUnits[idx].completion = 100;
                                                    if (status === "Pending") newUnits[idx].completion = 0;
                                                    setUnits(newUnits);
                                                }}
                                                className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                                                    unit.status === status 
                                                    ? status === "Completed" ? "text-black shadow-lg" : status === "Partial" ? "bg-yellow-400 text-black" : "bg-red-500 text-white" 
                                                    : "text-white/30 hover:text-white/60 hover:bg-white/5"
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Vertical spacer */}
                                    <div className="hidden xl:block h-10 w-px bg-white/10 mx-4" />
                                </div>
                            </div>

                            {/* Progress Slider */}
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Completion %</label>
                                    <span className="text-sm font-black text-[#b4ff39]">{unit.completion}%</span>
                                </div>
                                
                                <div className="relative h-6 flex items-center group">
                                    {/* Slider Track */}
                                    <div className="h-2 w-full bg-white/5 rounded-full relative overflow-visible">
                                        {/* Progress Fill */}
                                        <div 
                                            className="h-full bg-[#b4ff39] rounded-full shadow-[0_0_15px_rgba(180,255,57,0.5)] transition-all duration-300" 
                                            style={{ width: `${unit.completion}%` }} 
                                        />
                                        
                                        {/* Glow Knob (Thumb) */}
                                        <div 
                                            className="absolute top-1/2 h-5 w-5 bg-[#b4ff39] border-[4px] border-[#1e162e] rounded-full shadow-lg -translate-y-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-300"
                                            style={{ left: `${unit.completion}%` }}
                                        />
                                    </div>
                                    
                                    {/* Transparent Range Input for Interactivity */}
                                    <input 
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={unit.completion}
                                        onChange={(e) => {
                                            const newUnits = [...units];
                                            const val = parseInt(e.target.value);
                                            newUnits[idx].completion = val;
                                            // Sync status based on slider value
                                            if (val === 100) newUnits[idx].status = "Completed";
                                            else if (val > 0) newUnits[idx].status = "Partial";
                                            else newUnits[idx].status = "Pending";
                                            setUnits(newUnits);
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
</div>
            </form>
        </div>
    );
}