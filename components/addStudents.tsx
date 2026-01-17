"use client";

import BulkStudentUpload from "@/app/bulkstudent/page";
import { div } from "framer-motion/client";
import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileSpreadsheet } from "lucide-react";

export default function AddStudentPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    email: "",
    phoneNo: "",
    aadhaarNo: "",
    dob: "",
    address: "",
    totalFee: "",
    discountPercent: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (!form.name || !form.dob || !form.fatherName || !form.aadhaarNo || !form.phoneNo) {
      alert("Please fill in all required fields: Name, Date of Birth, Father Name, Aadhaar Number, and Phone Number");
      return;
    }

    if (!form.totalFee) {
      alert("Please enter the total fee for this student");
      return;
    }

    const totalFee = Number(form.totalFee);
    const discountPercent = form.discountPercent ? Number(form.discountPercent) : 0;

    if (isNaN(totalFee) || totalFee <= 0) {
      alert("Total fee must be a positive number");
      return;
    }

    if (discountPercent < 0 || discountPercent > 100) {
      alert("Discount percentage must be between 0 and 100");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/student/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          totalFee,
          discountPercent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create student");
        return;
      }

      alert("Student created successfully");

      setForm({
        name: "",
        fatherName: "",
        email: "",
        phoneNo: "",
        aadhaarNo: "",
        dob: "",
        address: "",
        totalFee: "",
        discountPercent: "",
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
<div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-green-200">
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-green-700 text-center">
            Add Student
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/** Student Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Student Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter student name"
                required
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/** Father Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Father Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
                placeholder="Enter father name"
                required
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/** Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@email.com"
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/** Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="phoneNo"
                value={form.phoneNo}
                onChange={handleChange}
                placeholder="9876543210"
                required
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/** Aadhaar */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Aadhaar Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="aadhaarNo"
                value={form.aadhaarNo}
                onChange={handleChange}
                placeholder="XXXX-XXXX-XXXX"
                required
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/** DOB */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/** Address */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Student address"
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/** Total Fee */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Total Fee (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalFee"
                value={form.totalFee}
                onChange={handleChange}
                placeholder="e.g. 12000"
                min={0}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/** Discount Percent */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Discount (%) 
              </label>
              <input
                type="number"
                name="discountPercent"
                value={form.discountPercent}
                onChange={handleChange}
                placeholder="e.g. 10"
                min={0}
                max={100}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-medium transition"
          >
            {loading ? "Saving..." : "Create Student"}
          </button>

          <p className="text-xs text-center text-gray-500">
            Default password will be student's Date of Birth (YYYYMMDD)
          </p>
        </div>
      </div>
    </div>
    <div>
      <motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  viewport={{ once: true }}
  className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-6"
>
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 200 }}
    className="w-full max-w-3xl bg-white/80 backdrop-blur-xl border border-green-200 rounded-3xl shadow-[0_20px_60px_rgba(22,163,74,0.25)] p-8"
  >
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex items-center gap-4 mb-6"
    >
      <div className="p-4 rounded-2xl bg-green-100 text-green-700 shadow">
        <UploadCloud size={32} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-green-700">
          Bulk Student Upload
        </h2>
        <p className="text-sm text-gray-600">
          Upload students using Excel sheet
        </p>
      </div>
    </motion.div>

    {/* Info Strip */}
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center gap-3 mb-6 bg-green-50 border border-green-200 rounded-xl p-4"
    >
      <FileSpreadsheet className="text-green-600" />
      <p className="text-sm text-gray-700">
        Accepted format: <b>.xlsx</b> · Follow the sample template
      </p>
    </motion.div>

    {/* Excel Upload Component (UNCHANGED LOGIC) */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border-2 border-dashed border-green-300 p-6 hover:border-green-500 transition"
    >
      <BulkStudentUpload />
    </motion.div>
  </motion.div>
</motion.div>

    </div>
    </div>
    
  );
}
