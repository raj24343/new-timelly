"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "SUPERADMIN";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("SUPERADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Signup failed");
      return;
    }

    router.push("/admin/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <form
        onSubmit={handleSignup}
        className="bg-white shadow-xl p-10 rounded-2xl w-96 relative overflow-hidden"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-black">
          Sign Up
        </h2>

        {error && (
          <p className="text-black mb-4 text-center animate-pulse">{error}</p>
        )}

        {/* Name Input */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border border-green-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition text-black placeholder-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email Input */}
        <div className="mb-4 relative">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-green-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition text-black placeholder-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Input */}
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border border-green-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition pr-12 text-black placeholder-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-black font-semibold"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Role Select */}
        <div className="mb-6 relative">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full border border-green-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition text-black placeholder-black"
          >
            <option value="SUPERADMIN">SUPERADMIN</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold shadow-md hover:bg-green-700 transition transform hover:scale-105"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-300 rounded-full opacity-20 animate-pulse"></div>
      </form>
    </div>
  );
}
