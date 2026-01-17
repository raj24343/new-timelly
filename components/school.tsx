"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function SchoolPage() {
    const { data: session, status } = useSession();

    const [showForm, setShowForm] = useState(false);
    const [school, setSchool] = useState<any>(null);

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [location, setLocation] = useState("");
    const [msg, setMsg] = useState("");

    // Fetch school for the logged-in user
    useEffect(() => {
        if (!session) return;

        async function fetchSchool() {
            const res = await fetch("/api/school/mine");
            const data = await res.json();
            if (data.school) {
                setSchool(data.school);
                setName(data.school.name);
                setAddress(data.school.address);
                setLocation(data.school.location);
            }
        }

        fetchSchool();
    }, [session]);

    if (status === "loading") return <p className="p-6">Loading session…</p>;
    if (!session) return <p className="p-6 text-red-600">Not authenticated</p>;

    // Create school
    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        const res = await fetch("/api/school/create", {
            method: "POST",
            body: JSON.stringify({ name, address, location }),
        });
        const data = await res.json();
        setMsg(data.message);
        if (data.school) setSchool(data.school);
    }

    // Update school
    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        const res = await fetch("/api/school/update", {
            method: "PUT",
            body: JSON.stringify({ name, address, location }),
        });
        const data = await res.json();
        setMsg(data.message);
        if (data.updated) setSchool(data.updated);
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="bg-green-600 text-white p-4 flex justify-between items-center shadow-md">
                <h1 className="text-xl font-bold">School Details Update</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-white text-green-600 px-4 py-2 rounded hover:bg-green-100 transition"
                >
                    {session.user?.email}
                </button>
            </nav>

            <div className="p-6 max-w-lg mx-auto">
                {/* Message */}
                {msg && <p className="text-green-700 font-semibold mb-4">{msg}</p>}

                {/* Show existing school */}
                {school && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border p-4 mb-6 rounded bg-green-50"
                    >
                        <h3 className="text-lg font-semibold text-green-700">Your School</h3>
                        <p>School Id: {school.id}</p>

                        <p>School Name: {school.name}</p>
                        <p>Address: {school.address}</p>
                        <p>Location: {school.location}</p>
                    </motion.div>
                )}

                {/* Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="border p-6 rounded shadow-md bg-white"
                        >
                            <h2 className="text-2xl font-bold mb-4 text-green-600">
                                {school ? "Update School" : "Create School"}
                            </h2>

                            <form
                                onSubmit={school ? handleUpdate : handleCreate}
                                className="space-y-4"
                            >
                                <input
                                    className="border p-2 w-full rounded"
                                    placeholder="School Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <input
                                    className="border p-2 w-full rounded"
                                    placeholder="Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                                <input
                                    className="border p-2 w-full rounded"
                                    placeholder="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className={`px-4 py-2 rounded text-white ${school ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
                                        } transition`}
                                >
                                    {school ? "Update School" : "Create School"}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
