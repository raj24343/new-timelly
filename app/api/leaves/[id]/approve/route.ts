import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";

interface Params {
  id: string;
}

type ApproveType = "FULL" | "CONDITIONAL";

export async function PATCH(
  req: Request,
  { params }: { params: Params | Promise<Params> }
) {
  try {
    // 1️⃣ Get leave ID
    const { id } = await params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Leave ID is required" }),
        { status: 400 }
      );
    }

    // 2️⃣ Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    // 3️⃣ Parse body
    const body = await req.json();
    const { type, remarks }: { type: ApproveType; remarks?: string } = body;

    if (!type || !["FULL", "CONDITIONAL"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid approval type" }),
        { status: 400 }
      );
    }

    if (type === "CONDITIONAL" && !remarks?.trim()) {
      return new Response(
        JSON.stringify({
          error: "Remarks are required for conditional approval"
        }),
        { status: 400 }
      );
    }

    // 4️⃣ Ensure leave exists & is pending
    const existingLeave = await prisma.leaveRequest.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!existingLeave) {
      return new Response(
        JSON.stringify({ error: "Leave request not found" }),
        { status: 404 }
      );
    }

    if (existingLeave.status !== "PENDING") {
      return new Response(
        JSON.stringify({
          error: `Leave is already ${existingLeave.status.toLowerCase()}`
        }),
        { status: 409 }
      );
    }

    // 5️⃣ Update leave
    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status:
          type === "CONDITIONAL"
            ? "CONDITIONALLY_APPROVED"
            : "APPROVED",
        remarks: remarks || null,
        approverId: session.user.id
      }
    });

    // 6️⃣ Success response
    return new Response(JSON.stringify(leave), { status: 200 });

  } catch (err: any) {
    console.error("Approve leave failed:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Unable to approve leave"
      }),
      { status: 500 }
    );
  }
}
