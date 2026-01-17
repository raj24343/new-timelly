"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Users, MapPin, IndianRupee, X, Bed } from "lucide-react";

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  cotCount: number;
  amount: number;
  availableCots: number[];
  bookedCotsCount: number;
  availableCotsCount: number;
  bookings: Array<{
    id: string;
    cotNumber: number;
    student: {
      user: { name: string | null; email: string | null };
      class: { name: string; section: string | null } | null;
    };
  }>;
}

interface HostelData {
  id: string;
  name: string;
  address: string;
  gender: string;
  rooms: Room[];
  createdAt: string;
}

interface Booking {
  id: string;
  cotNumber: number;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  room: {
    id: string;
    roomNumber: string;
    floor: number;
    hostel: {
      id: string;
      name: string;
      address: string;
      gender: string;
    };
  };
  student: {
    user: { name: string | null; email: string | null };
    class: { name: string; section: string | null } | null;
  };
}

export default function HostelManagement() {
  const [hostels, setHostels] = useState<HostelData[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"hostels" | "create" | "bookings">("hostels");
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    gender: "MALE",
  });

  const [rooms, setRooms] = useState<Array<{ roomNumber: string; floor: string; cotCount: string; amount: string }>>([
    { roomNumber: "", floor: "", cotCount: "", amount: "" },
  ]);

  useEffect(() => {
    fetchHostels();
    fetchBookings();
  }, []);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hostel/list");
      const data = await res.json();
      if (res.ok && data.hostels) {
        setHostels(data.hostels);
      } else {
        alert(data.message || "Failed to fetch hostels");
      }
    } catch (err: any) {
      console.error("Error fetching hostels:", err);
      alert(err?.message || "Failed to fetch hostels");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/hostel/bookings");
      const data = await res.json();
      if (res.ok && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validRooms = rooms.filter(r => r.roomNumber.trim() && r.floor && r.cotCount && r.amount && parseFloat(r.amount) >= 0);
    if (validRooms.length === 0) {
      alert("Please add at least one room with all details");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/hostel/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rooms: validRooms.map(r => ({
            roomNumber: r.roomNumber.trim(),
            floor: parseInt(r.floor),
            cotCount: parseInt(r.cotCount),
            amount: parseFloat(r.amount),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create hostel");
        return;
      }

      alert("Hostel created successfully!");
      setFormData({ name: "", address: "", gender: "MALE" });
      setRooms([{ roomNumber: "", floor: "", cotCount: "", amount: "" }]);
      setActiveTab("hostels");
      fetchHostels();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const addRoom = () => {
    setRooms([...rooms, { roomNumber: "", floor: "", cotCount: "", amount: "" }]);
  };

  const removeRoom = (index: number) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index));
    }
  };

  const updateRoom = (index: number, field: "roomNumber" | "floor" | "cotCount" | "amount", value: string) => {
    const updated = [...rooms];
    updated[index][field] = value;
    setRooms(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-green-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-700">Hostel Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("hostels")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "hostels"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Hostels
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === "create"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <Plus size={18} />
            Create Hostel
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "bookings"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Bookings
          </button>
        </div>
      </div>

      {activeTab === "create" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-green-200"
        >
          <h2 className="text-2xl font-bold text-green-700 mb-6">Create New Hostel</h2>
          <form onSubmit={handleCreateHostel} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hostel Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g., Boys Hostel A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Hostel address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Rooms & Pricing</h3>
                <button
                  type="button"
                  onClick={addRoom}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                >
                  <Plus size={16} />
                  Add Room
                </button>
              </div>
              <div className="space-y-3">
                {rooms.map((room, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                        <input
                          type="text"
                          required
                          value={room.roomNumber}
                          onChange={(e) => updateRoom(index, "roomNumber", e.target.value)}
                          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                          placeholder="e.g., 101, A-1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Floor *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={room.floor}
                          onChange={(e) => updateRoom(index, "floor", e.target.value)}
                          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cots *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={room.cotCount}
                          onChange={(e) => updateRoom(index, "cotCount", e.target.value)}
                          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                          placeholder="e.g., 2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={room.amount}
                          onChange={(e) => updateRoom(index, "amount", e.target.value)}
                          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                          placeholder="e.g., 5000"
                        />
                      </div>
                    </div>
                    {rooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoom(index)}
                        className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={creating}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                {creating ? "Creating..." : "Create Hostel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("hostels");
                  setFormData({ name: "", address: "", gender: "MALE" });
                  setRooms([{ roomNumber: "", floor: "", cotCount: "", amount: "" }]);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {activeTab === "hostels" && (
        <div className="space-y-4">
          {hostels.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No hostels created yet</p>
              <button
                onClick={() => setActiveTab("create")}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Create First Hostel
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {hostels.map((hostel) => (
                <motion.div
                  key={hostel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-green-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-green-700">{hostel.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{hostel.address}</span>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          {hostel.gender}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {hostel.rooms.map((room) => (
                      <div key={room.id} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-green-700">Room {room.roomNumber}</p>
                            <p className="text-xs text-gray-600">Floor {room.floor}</p>
                          </div>
                          <span className="font-bold text-green-700">₹{room.amount}</span>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-1">
                            {room.bookedCotsCount} / {room.cotCount} cots booked
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${(room.bookedCotsCount / room.cotCount) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-green-700 mb-6">All Student Bookings</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No bookings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Student Name</th>
                    <th className="px-4 py-3 text-left">Class</th>
                    <th className="px-4 py-3 text-left">Hostel</th>
                    <th className="px-4 py-3 text-left">Room</th>
                    <th className="px-4 py-3 text-left">Cot</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Booked On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-green-50">
                      <td className="px-4 py-3 font-medium">
                        {booking.student.user.name || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {booking.student.class
                          ? `${booking.student.class.name}${booking.student.class.section ? ` - ${booking.student.class.section}` : ""}`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 font-medium text-green-700">
                        {booking.room.hostel.name}
                      </td>
                      <td className="px-4 py-3">Room {booking.room.roomNumber}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                          Cot {booking.cotNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-700">₹{booking.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.paymentStatus === "PAID" 
                            ? "bg-green-100 text-green-800" 
                            : booking.paymentStatus === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
