"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Bus, MapPin, Clock, Phone, Users, CheckCircle, IndianRupee } from "lucide-react";

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
    };
  }>;
}

interface MyBooking {
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
}

export default function BusBooking() {
  const { data: session, status } = useSession();
  const [buses, setBuses] = useState<BusData[]>([]);
  const [myBooking, setMyBooking] = useState<MyBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load Razorpay script (client-side only)
  useEffect(() => {
    if (!mounted) return;
    
    if (!(window as any).Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
      };
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    if (status === "authenticated" && session?.user?.role === "STUDENT") {
      fetchBuses();
      fetchMyBooking();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status, mounted]);

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

  const fetchMyBooking = async () => {
    if (!session?.user?.studentId || !mounted) return;
    
    try {
      const res = await fetch("/api/bus/list");
      const data = await res.json();
      if (res.ok && data.buses) {
        // Find if student has any booking
        for (const bus of data.buses) {
          if (bus.bookings && Array.isArray(bus.bookings)) {
            const myBook = bus.bookings.find(
              (b: any) => b.student?.id === session.user.studentId
            );
            if (myBook) {
              setMyBooking({
                id: myBook.id,
                seatNumber: myBook.seatNumber,
                amount: myBook.amount || 0,
                paymentStatus: myBook.paymentStatus || "PENDING",
                createdAt: myBook.createdAt || "",
                bus: {
                  id: bus.id,
                  busNumber: bus.busNumber,
                  driverName: bus.driverName,
                  driverNumber: bus.driverNumber,
                  time: bus.time,
                },
                route: myBook.route,
              });
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching my booking:", err);
    }
  };

  const handleBookSeat = async () => {
    if (!selectedBus || !selectedSeat || !selectedRoute) {
      alert("Please select a bus, route, and seat");
      return;
    }

    if (!razorpayLoaded) {
      alert("Payment gateway is loading. Please wait a moment and try again.");
      return;
    }

    const selectedBusData = buses.find((b) => b.id === selectedBus);
    const selectedRouteData = selectedBusData?.routes.find((r) => r.id === selectedRoute);

    if (!selectedRouteData) {
      alert("Selected route not found");
      return;
    }

    setBookingLoading(true);
    try {
      // Step 1: Create booking and get Razorpay order
      const res = await fetch("/api/bus/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: selectedBus,
          routeId: selectedRoute,
          seatNumber: selectedSeat,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create booking");
        return;
      }

      const { booking, razorpayOrder } = data;

      // Step 2: Open Razorpay payment gateway
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: "Bus Booking",
        description: `Bus ${selectedBusData?.busNumber} - Seat ${selectedSeat} - ${selectedRouteData.location}`,
        handler: async (response: any) => {
          // Step 3: Verify payment
          try {
            const verifyRes = await fetch("/api/bus/booking/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: booking.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              alert(verifyData.message || "Payment verification failed");
              return;
            }

            alert("Payment successful! Your booking is confirmed.");
            setSelectedBus(null);
            setSelectedRoute(null);
            setSelectedSeat(null);
            fetchBuses();
            fetchMyBooking();
          } catch (err) {
            console.error("Payment verification error:", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: () => {
            console.log("Payment cancelled");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setBookingLoading(false);
    }
  };

  // Show loading state until mounted and session is loaded
  if (!mounted) {
    return null; // Don't render anything until mounted to prevent hydration errors
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-green-700 font-medium">Loading buses...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "STUDENT") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600 text-lg font-medium">Access Denied: Only students can book buses.</p>
      </div>
    );
  }

  const selectedBusData = buses.find((b) => b.id === selectedBus);
  const selectedRouteData = selectedBusData?.routes.find((r) => r.id === selectedRoute);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-700">Bus Booking</h1>

      {/* My Booking */}
      {myBooking && myBooking.paymentStatus === "PAID" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-lg p-6 border-2 border-green-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-green-600" size={32} />
            <h2 className="text-2xl font-bold text-green-700">My Booking</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Bus Number</p>
              <p className="text-lg font-bold text-green-700">{myBooking.bus.busNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Seat Number</p>
              <p className="text-lg font-bold text-green-700">Seat {myBooking.seatNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="text-lg font-medium">{myBooking.route?.location || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="text-lg font-bold text-green-700">₹{myBooking.amount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="text-lg font-medium">{myBooking.bus.time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Driver</p>
              <p className="text-lg font-medium">{myBooking.bus.driverName}</p>
            </div>
          </div>
          {myBooking.createdAt && (
            <p className="text-sm text-gray-500 mt-4">
              Booked on: {mounted ? new Date(myBooking.createdAt).toLocaleDateString() : myBooking.createdAt}
            </p>
          )}
        </motion.div>
      )}

      {/* Available Buses */}
      <div>
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          {myBooking && myBooking.paymentStatus === "PAID" ? "Other Available Buses" : "Available Buses"}
        </h2>
        {buses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Bus size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No buses available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.map((bus) => {
              const isMyBus = myBooking?.bus.id === bus.id && myBooking?.paymentStatus === "PAID";
              const hasBooking = myBooking && myBooking.paymentStatus === "PAID";

              return (
                <motion.div
                  key={bus.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-white rounded-xl shadow-lg p-6 border-2 transition ${
                    selectedBus === bus.id
                      ? "border-green-500 shadow-xl"
                      : "border-green-200 hover:shadow-xl"
                  } ${hasBooking && !isMyBus ? "opacity-60" : ""}`}
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
                      {bus.routes && bus.routes.length > 0 ? bus.routes.map((route) => (
                        <div key={route.id} className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-green-600" />
                            <span className="text-sm text-gray-700">{route.location}</span>
                          </div>
                          <span className="text-sm font-semibold text-green-700">₹{route.amount}</span>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-500">No routes configured</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Available Seats</span>
                      <span className="text-sm font-medium text-green-700">
                        {bus.availableSeatsCount} / {bus.totalSeats}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(bus.availableSeatsCount / bus.totalSeats) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {!hasBooking && bus.availableSeatsCount > 0 && (
                    <button
                      onClick={() => setSelectedBus(bus.id)}
                      className={`w-full py-2 rounded-lg font-medium transition ${
                        selectedBus === bus.id
                          ? "bg-green-700 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {selectedBus === bus.id ? "Selected" : "Select This Bus"}
                    </button>
                  )}

                  {hasBooking && !isMyBus && (
                    <p className="text-sm text-center text-gray-500 py-2">
                      You already have a booking
                    </p>
                  )}

                  {isMyBus && (
                    <p className="text-sm text-center text-green-600 font-medium py-2">
                      ✓ This is your booked bus
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Route and Seat Selection */}
      {selectedBusData && (!myBooking || myBooking.paymentStatus !== "PAID") && selectedBusData.availableSeatsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-green-200 space-y-6"
        >
          <h2 className="text-2xl font-bold text-green-700">
            Book Seat - {selectedBusData.busNumber}
          </h2>

          {/* Route Selection */}
          {!selectedRoute && (
            <div>
              <p className="text-sm text-gray-600 mb-4 font-medium">Select a Route (Location):</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedBusData.routes && selectedBusData.routes.length > 0 ? selectedBusData.routes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRoute(route.id)}
                    className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-green-600" />
                        <span className="font-medium text-gray-700">{route.location}</span>
                      </div>
                      <span className="font-bold text-green-700 text-lg">₹{route.amount}</span>
                    </div>
                  </button>
                )) : (
                  <p className="text-gray-500">No routes available for this bus</p>
                )}
              </div>
            </div>
          )}

          {/* Seat Selection */}
          {selectedRoute && (
            <>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-green-600" />
                  <span className="font-medium text-gray-700">{selectedRouteData?.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee size={18} className="text-green-600" />
                  <span className="font-bold text-green-700 text-lg">₹{selectedRouteData?.amount}</span>
                </div>
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Change
                </button>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-4 font-medium">
                  Select a seat (available seats are shown in green):
                </p>
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: selectedBusData.totalSeats }, (_, i) => i + 1).map(
                    (seatNum) => {
                      const isBooked = !selectedBusData.availableSeats.includes(seatNum);
                      const isSelected = selectedSeat === seatNum;

                      return (
                        <button
                          key={seatNum}
                          onClick={() => !isBooked && setSelectedSeat(seatNum)}
                          disabled={isBooked}
                          className={`p-3 rounded-lg font-medium transition ${
                            isBooked
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : isSelected
                              ? "bg-green-600 text-white ring-2 ring-green-400"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {seatNum}
                        </button>
                      );
                    }
                  )}
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                    <span className="text-sm text-gray-600">Booked</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              {selectedSeat && selectedRouteData && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-gray-700 mb-3">Booking Summary:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bus:</span>
                      <span className="font-medium">{selectedBusData.busNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Route:</span>
                      <span className="font-medium">{selectedRouteData.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Seat:</span>
                      <span className="font-medium">Seat {selectedSeat}</span>
                    </div>
                    <div className="border-t border-green-300 pt-2 mt-2 flex justify-between font-bold text-green-700">
                      <span>Total Amount:</span>
                      <span>₹{selectedRouteData.amount}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleBookSeat}
                  disabled={!selectedSeat || bookingLoading || !razorpayLoaded}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    selectedSeat && !bookingLoading && razorpayLoaded
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {bookingLoading ? "Processing..." : razorpayLoaded ? `Pay ₹${selectedRouteData?.amount || 0}` : "Loading Payment..."}
                </button>
                <button
                  onClick={() => {
                    setSelectedBus(null);
                    setSelectedRoute(null);
                    setSelectedSeat(null);
                  }}
                  className="px-6 py-3 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}