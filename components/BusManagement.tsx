"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bus, Plus, Users, Clock, Phone, MapPin, X, IndianRupee } from "lucide-react";

interface Route {
  id: string;
  location: string;
  amount: number;
}

interface BusRoute {
  id: string;
  location: string;
  amount: number;
}

interface BusData {
  id: string;
  busNumber: string;
  driverName: string;
  driverNumber: string;
  totalSeats: number;
  time: string;
  routes: BusRoute[];
  availableSeats: number[];
  bookedSeatsCount: number;
  availableSeatsCount: number;
  bookings: Array<{
    id: string;
    seatNumber: number;
    route?: { id: string; location: string; amount: number };
    student: {
      user: { name: string | null; email: string | null };
      class: { name: string; section: string | null } | null;
    };
  }>;
  createdAt: string;
}

interface Booking {
  id: string;
  seatNumber: number;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  bus: {
    id: string;
    busNumber: string;
    driverName: string;
    driverNumber: string;
    time: string;
  };
  route?: {
    id: string;
    location: string;
    amount: number;
  };
  student: {
    user: { name: string | null; email: string | null };
    class: { name: string; section: string | null } | null;
  };
}

export default function BusManagement() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"buses" | "create" | "bookings">("buses");
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    busNumber: "",
    driverName: "",
    driverNumber: "",
    totalSeats: "",
    time: "",
  });

  const [routes, setRoutes] = useState<Array<{ location: string; amount: string }>>([
    { location: "", amount: "" },
  ]);

  useEffect(() => {
    fetchBuses();
    fetchBookings();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bus/list");
      const data = await res.json();
      if (res.ok && data.buses) {
        setBuses(data.buses);
      } else {
        console.error("Error fetching buses:", data.message || "Unknown error");
        alert(data.message || "Failed to fetch buses");
      }
    } catch (err: any) {
      console.error("Error fetching buses:", err);
      alert(err?.message || "Failed to fetch buses. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bus/bookings");
      const data = await res.json();
      if (res.ok && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate routes
    const validRoutes = routes.filter(r => r.location.trim() && r.amount && parseFloat(r.amount) >= 0);
    if (validRoutes.length === 0) {
      alert("Please add at least one route with location and amount");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/bus/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          routes: validRoutes.map(r => ({
            location: r.location.trim(),
            amount: parseFloat(r.amount),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create bus");
        return;
      }

      alert("Bus created successfully!");
      setFormData({
        busNumber: "",
        driverName: "",
        driverNumber: "",
        totalSeats: "",
        time: "",
      });
      setRoutes([{ location: "", amount: "" }]);
      setActiveTab("buses");
      fetchBuses();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const addRoute = () => {
    setRoutes([...routes, { location: "", amount: "" }]);
  };

  const removeRoute = (index: number) => {
    if (routes.length > 1) {
      setRoutes(routes.filter((_, i) => i !== index));
    }
  };

  const updateRoute = (index: number, field: "location" | "amount", value: string) => {
    const updated = [...routes];
    updated[index][field] = value;
    setRoutes(updated);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-700">Bus Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("buses")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "buses"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Buses
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
            Create Bus
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

      {/* Create Bus Form */}
      {activeTab === "create" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-green-200"
        >
          <h2 className="text-2xl font-bold text-green-700 mb-6">Create New Bus</h2>
          <form onSubmit={handleCreateBus} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bus Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.busNumber}
                  onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g., MH-12-AB-1234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Driver full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.driverNumber}
                  onChange={(e) => setFormData({ ...formData, driverNumber: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g., +91 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Seats *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g., 40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="text"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g., 08:00 AM"
                />
              </div>
            </div>

            {/* Routes Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Routes & Pricing</h3>
                <button
                  type="button"
                  onClick={addRoute}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                >
                  <Plus size={16} />
                  Add Route
                </button>
              </div>
              <div className="space-y-3">
                {routes.map((route, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location *
                        </label>
                        <input
                          type="text"
                          required
                          value={route.location}
                          onChange={(e) => updateRoute(index, "location", e.target.value)}
                          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                          placeholder="e.g., Main Gate, City Center"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={route.amount}
                          onChange={(e) => updateRoute(index, "amount", e.target.value)}
                          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                          placeholder="e.g., 500"
                        />
                      </div>
                    </div>
                    {routes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoute(index)}
                        className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Add multiple routes (locations) for this bus. Each route can have a different price.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={creating}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                {creating ? "Creating..." : "Create Bus"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("buses");
                  setFormData({
                    busNumber: "",
                    driverName: "",
                    driverNumber: "",
                    totalSeats: "",
                    time: "",
                  });
                  setRoutes([{ location: "", amount: "" }]);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* All Buses */}
      {activeTab === "buses" && (
        <div className="space-y-4">
          {buses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Bus size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No buses created yet</p>
              <button
                onClick={() => setActiveTab("create")}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Create First Bus
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buses.map((bus) => (
                <motion.div
                  key={bus.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Bus className="text-green-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-700">{bus.busNumber}</h3>
                        <p className="text-sm text-gray-600">Driver: {bus.driverName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-gray-500" />
                      <span className="text-gray-700">{bus.driverNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-gray-500" />
                      <span className="text-gray-700">{bus.time}</span>
                    </div>
                  </div>

                  {/* Routes */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Routes & Pricing:</p>
                    <div className="space-y-2">
                      {bus.routes.map((route) => (
                        <div key={route.id} className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-green-600" />
                            <span className="text-sm text-gray-700">{route.location}</span>
                          </div>
                          <span className="text-sm font-semibold text-green-700">₹{route.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Seats</span>
                      <span className="text-sm font-medium text-green-700">
                        {bus.bookedSeatsCount} / {bus.totalSeats} booked
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(bus.bookedSeatsCount / bus.totalSeats) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {bus.availableSeatsCount} seats available
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Bookings */}
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
                    <th className="px-4 py-3 text-left">Bus Number</th>
                    <th className="px-4 py-3 text-left">Seat</th>
                    <th className="px-4 py-3 text-left">Location</th>
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
                        {booking.bus.busNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                          Seat {booking.seatNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">{booking.route?.location || "N/A"}</td>
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