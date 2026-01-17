"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Save, X, Clock, BookOpen, Coffee, UtensilsCrossed } from "lucide-react";

interface Class {
  id: string;
  name: string;
  section: string | null;
}

interface TimetableEntry {
  id?: string;
  day: string;
  period: number;
  type: "SUBJECT" | "BREAK" | "LUNCH";
  subject?: string | null;
  teacherName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetableManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchTimetable();
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/class/list");
      const data = await res.json();
      if (data.classes) {
        setClasses(data.classes);
        if (data.classes.length > 0) {
          setSelectedClassId(data.classes[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchTimetable = async () => {
    if (!selectedClassId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/timetable/list?classId=${selectedClassId}`);
      const data = await res.json();
      if (res.ok && data.timetables) {
        setTimetables(data.timetables);
      } else {
        setTimetables([]);
      }
    } catch (err) {
      console.error("Error fetching timetable:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEntry = (day: string, period: number): TimetableEntry | null => {
    return timetables.find((t) => t.day === day && t.period === period) || null;
  };

  const updateEntry = (day: string, period: number, updates: Partial<TimetableEntry>) => {
    const existing = getEntry(day, period);
    const newEntry: TimetableEntry = {
      ...existing,
      day,
      period,
      ...updates,
    };

    setTimetables((prev) => {
      const filtered = prev.filter((t) => !(t.day === day && t.period === period));
      return [...filtered, newEntry];
    });
  };

  const handleSaveAll = async () => {
    if (!selectedClassId) {
      setMessage("Please select a class");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      // Save all timetable entries
      const savePromises = timetables.map((entry) =>
        fetch("/api/timetable/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: selectedClassId,
            day: entry.day,
            period: entry.period,
            type: entry.type,
            subject: entry.subject || null,
            teacherName: entry.teacherName || null,
            startTime: entry.startTime || null,
            endTime: entry.endTime || null,
          }),
        })
      );

      await Promise.all(savePromises);
      setMessage("Timetable saved successfully!");
      fetchTimetable();
    } catch (err) {
      console.error("Error saving timetable:", err);
      setMessage("Failed to save timetable");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (timetableId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await fetch(`/api/timetable/delete?id=${timetableId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTimetables((prev) => prev.filter((t) => t.id !== timetableId));
        setMessage("Entry deleted successfully");
      } else {
        setMessage("Failed to delete entry");
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
      setMessage("Failed to delete entry");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Timetable Management
        </h2>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} {cls.section ? `- ${cls.section}` : ""}
              </option>
            ))}
          </select>
        </div>

        {selectedClassId && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save All Changes"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Day / Period</th>
                    {PERIODS.map((period) => (
                      <th key={period} className="border p-2 text-center min-w-[150px]">
                        Period {period}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day}>
                      <td className="border p-2 font-semibold bg-gray-50">{day}</td>
                      {PERIODS.map((period) => {
                        const entry = getEntry(day, period);
                        return (
                          <td key={period} className="border p-2">
                            <TimetableCell
                              entry={entry}
                              day={day}
                              period={period}
                              onUpdate={(updates) => updateEntry(day, period, updates)}
                              onDelete={entry?.id ? () => handleDelete(entry.id!) : undefined}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TimetableCell({
  entry,
  day,
  period,
  onUpdate,
  onDelete,
}: {
  entry: TimetableEntry | null;
  day: string;
  period: number;
  onUpdate: (updates: Partial<TimetableEntry>) => void;
  onDelete?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    type: entry?.type || "SUBJECT",
    subject: entry?.subject || "",
    teacherName: entry?.teacherName || "",
    startTime: entry?.startTime || "",
    endTime: entry?.endTime || "",
  });

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      type: entry?.type || "SUBJECT",
      subject: entry?.subject || "",
      teacherName: entry?.teacherName || "",
      startTime: entry?.startTime || "",
      endTime: entry?.endTime || "",
    });
    setIsEditing(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUBJECT":
        return <BookOpen className="w-4 h-4" />;
      case "BREAK":
        return <Coffee className="w-4 h-4" />;
      case "LUNCH":
        return <UtensilsCrossed className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SUBJECT":
        return "bg-blue-100 text-blue-800";
      case "BREAK":
        return "bg-yellow-100 text-yellow-800";
      case "LUNCH":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!entry && !isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-600 text-sm"
      >
        <Plus className="w-4 h-4 mx-auto" />
        Add
      </button>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-2 p-2 bg-gray-50 rounded">
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full p-1 text-sm border rounded"
        >
          <option value="SUBJECT">Subject</option>
          <option value="BREAK">Break</option>
          <option value="LUNCH">Lunch</option>
        </select>

        {formData.type === "SUBJECT" && (
          <>
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-1 text-sm border rounded"
            />
            <input
              type="text"
              placeholder="Teacher Name"
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              className="w-full p-1 text-sm border rounded"
            />
          </>
        )}

        <input
          type="time"
          placeholder="Start Time"
          value={formData.startTime || ""}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          className="w-full p-1 text-sm border rounded"
        />
        <input
          type="time"
          placeholder="End Time"
          value={formData.endTime || ""}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          className="w-full p-1 text-sm border rounded"
        />

        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-2 rounded text-sm ${getTypeColor(entry!.type)}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          {getTypeIcon(entry!.type)}
          <span className="font-semibold">{entry!.type}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsEditing(true)} className="text-xs hover:underline">
            Edit
          </button>
          {onDelete && (
            <button onClick={onDelete} className="text-xs hover:underline text-red-600">
              Del
            </button>
          )}
        </div>
      </div>
      {entry!.type === "SUBJECT" && (
        <>
          {entry!.subject && <div className="font-medium">{entry!.subject}</div>}
          {entry!.teacherName && <div className="text-xs">{entry!.teacherName}</div>}
        </>
      )}
      {(entry!.startTime || entry!.endTime) && (
        <div className="text-xs mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {entry!.startTime} - {entry!.endTime}
        </div>
      )}
    </div>
  );
}
