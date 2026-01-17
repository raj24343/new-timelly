"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Building2, MapPin, Bed, CheckCircle, IndianRupee } from "lucide-react";

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
    };
  }>;
}

interface HostelData {
  id: string;
  name: string;
  address: string;
  gender: string;
  rooms: Room[];
}

interface MyBooking {
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
}

export default function HostelBooking() {
  const { data: session, status } = useSession();
  const [hostels, setHostels] = useState<HostelData[]>([]);
  const [myBooking, setMyBooking] = useState<MyBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedCot, setSelectedCot] = useState<number | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      fetchHostels();
      fetchMyBooking();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status, mounted]);

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

  const fetchMyBooking = async () => {
    if (!session?.user?.studentId || !mounted) return;
    
    try {
      const res = await fetch("/api/hostel/list");
      const data = await res.json();
      if (res.ok && data.hostels) {
        for (const hostel of data.hostels) {
          for (const room of hostel.rooms || []) {
            if (room.bookings && Array.isArray(room.bookings)) {
              const myBook = room.bookings.find(
                (b: any) => b.student?.id === session.user.studentId
              );
              if (myBook) {
                setMyBooking({
                  id: myBook.id,
                  cotNumber: myBook.cotNumber,
                  amount: myBook.amount || 0,
                  paymentStatus: myBook.paymentStatus || "PENDING",
                  createdAt: myBook.createdAt || "",
                  room: {
                    id: room.id,
                    roomNumber: room.roomNumber,
                    floor: room.floor,
                    hostel: {
                      id: hostel.id,
                      name: hostel.name,
                      address: hostel.address,
                      gender: hostel.gender,
                    },
                  },
                });
                return;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching my booking:", err);
    }
  };

  const handleBookCot = async () => {
    if (!selectedRoom || !selectedCot) {
      alert("Please select a room and cot");
      return;
    }

    if (!razorpayLoaded) {
      alert("Payment gateway is loading. Please wait a moment and try again.");
      return;
    }

    const selectedHostelData = hostels.find((h) => h.id === selectedHostel);
    const selectedRoomData = selectedHostelData?.rooms.find((r) => r.id === selectedRoom);

    if (!selectedRoomData) {
      alert("Selected room not found");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch("/api/hostel/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoom,
          cotNumber: selectedCot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create booking");
        return;
      }

      const { booking, razorpayOrder } = data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: "Hostel Booking",
        description: `${selectedHostelData?.name} - Room ${selectedRoomData.roomNumber} - Cot ${selectedCot}`,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/hostel/booking/verify", {
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
            setSelectedHostel(null);
            setSelectedRoom(null);
            setSelectedCot(null);
            fetchHostels();
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

  if (!mounted) {
    return null;
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-green-700 font-medium">Loading hostels...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "STUDENT") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600 text-lg font-medium">Access Denied: Only students can book hostels.</p>
      </div>
    );
  }

  const selectedHostelData = hostels.find((h) => h.id === selectedHostel);
  const selectedRoomData = selectedHostelData?.rooms.find((r) => r.id === selectedRoom);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-700">Hostel Booking</h1>

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
              <p className="text-sm text-gray-600">Hostel</p>
              <p className="text-lg font-bold text-green-700">{myBooking.room.hostel.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Room</p>
              <p className="text-lg font-bold text-green-700">Room {myBooking.room.roomNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cot Number</p>
              <p className="text-lg font-bold text-green-700">Cot {myBooking.cotNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="text-lg font-bold text-green-700">₹{myBooking.amount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="text-lg font-medium">{myBooking.room.hostel.address}</p>
            </div>
          </div>
          {myBooking.createdAt && (
            <p className="text-sm text-gray-500 mt-4">
              Booked on: {mounted ? new Date(myBooking.createdAt).toLocaleDateString() : myBooking.createdAt}
            </p>
          )}
        </motion.div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          {myBooking && myBooking.paymentStatus === "PAID" ? "Other Available Hostels" : "Available Hostels"}
        </h2>
        {hostels.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No hostels available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {hostels.map((hostel) => {
              const isMyHostel = myBooking?.room.hostel.id === hostel.id && myBooking?.paymentStatus === "PAID";
              const hasBooking = myBooking && myBooking.paymentStatus === "PAID";

              return (
                <motion.div
                  key={hostel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
                    selectedHostel === hostel.id
                      ? "border-green-500 shadow-xl"
                      : "border-green-200 hover:shadow-xl"
                  } ${hasBooking && !isMyHostel ? "opacity-60" : ""}`}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {hostel.rooms.map((room) => (
                      <div
                        key={room.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                          selectedRoom === room.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        } ${room.availableCotsCount === 0 ? "opacity-50" : ""}`}
                        onClick={() => {
                          if (room.availableCotsCount > 0 && !hasBooking) {
                            setSelectedHostel(hostel.id);
                            setSelectedRoom(room.id);
                            setSelectedCot(null);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-green-700">Room {room.roomNumber}</p>
                            <p className="text-xs text-gray-600">Floor {room.floor}</p>
                          </div>
                          <span className="font-bold text-green-700">₹{room.amount}</span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">
                            {room.availableCotsCount} / {room.cotCount} cots available
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${(room.availableCotsCount / room.cotCount) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {selectedRoomData && (!myBooking || myBooking.paymentStatus !== "PAID") && selectedRoomData.availableCotsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-green-200 space-y-6"
        >
          <h2 className="text-2xl font-bold text-green-700">
            Book Cot - {selectedHostelData?.name} - Room {selectedRoomData.roomNumber}
          </h2>

          <div>
            <p className="text-sm text-gray-600 mb-4 font-medium">Select a cot (available cots are shown in green):</p>
            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: selectedRoomData.cotCount }, (_, i) => i + 1).map((cotNum) => {
                const isBooked = !selectedRoomData.availableCots.includes(cotNum);
                const isSelected = selectedCot === cotNum;

                return (
                  <button
                    key={cotNum}
                    onClick={() => !isBooked && setSelectedCot(cotNum)}
                    disabled={isBooked}
                    className={`p-3 rounded-lg font-medium transition flex items-center justify-center gap-1 ${
                      isBooked
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : isSelected
                        ? "bg-green-600 text-white ring-2 ring-green-400"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    <Bed size={16} />
                    {cotNum}
                  </button>
                );
              })}
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

          {selectedCot && selectedRoomData && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-gray-700 mb-3">Booking Summary:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hostel:</span>
                  <span className="font-medium">{selectedHostelData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">Room {selectedRoomData.roomNumber} (Floor {selectedRoomData.floor})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cot:</span>
                  <span className="font-medium">Cot {selectedCot}</span>
                </div>
                <div className="border-t border-green-300 pt-2 mt-2 flex justify-between font-bold text-green-700">
                  <span>Total Amount:</span>
                  <span>₹{selectedRoomData.amount}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleBookCot}
              disabled={!selectedCot || bookingLoading || !razorpayLoaded}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                selectedCot && !bookingLoading && razorpayLoaded
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {bookingLoading ? "Processing..." : razorpayLoaded ? `Pay ₹${selectedRoomData?.amount || 0}` : "Loading Payment..."}
            </button>
            <button
              onClick={() => {
                setSelectedHostel(null);
                setSelectedRoom(null);
                setSelectedCot(null);
              }}
              className="px-6 py-3 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
