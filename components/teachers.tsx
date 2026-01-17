"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Users, Plus, Mail, Phone } from "lucide-react";

interface Teacher {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
}

export default function TeacherSignupPage() {
  const { data: session, status } = useSession();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (session) {
      fetchTeachers();
    }
  }, [session]);

  const fetchTeachers = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/teacher/list");
      const data = await res.json();
      if (res.ok && data.teachers) {
        setTeachers(data.teachers);
      } else {
        console.error("Error fetching teachers:", data.message);
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/teacher/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Failed to create teacher");
        return;
      }
      setMessage("Teacher created successfully");
      setForm({ name: "", email: "", password: "", mobile: "" });
      setShowForm(false);
      fetchTeachers(); // Refresh the list
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || fetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-green-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return <p className="p-6 text-red-600">Not authenticated</p>;
  if (session.user.role !== "SCHOOLADMIN")
    return <p className="p-6 text-red-600">Forbidden: School Admins only</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-700">Teachers Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus size={20} />
          {showForm ? "Cancel" : "Add Teacher"}
        </button>
      </div>

      {/* Create Teacher Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-green-200"
        >
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Add New Teacher</h2>

        {message && (
          <div
            className={`p-3 mb-4 rounded ${
              message.includes("success")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-sm text-green-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile (optional)
            </label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-medium transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Create Teacher"}
          </button>
        </form>
        </motion.div>
      )}

      {/* Teachers List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-green-200">
          <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <Users size={24} />
            All Teachers ({teachers.length})
          </h2>
        </div>

        {teachers.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No teachers found</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add Teacher" to create your first teacher</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Mobile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-green-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {teacher.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      {teacher.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      {teacher.mobile || "N/A"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
