import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

/**
 * Superadmin dashboard – single API returning all dashboard data.
 * GET /api/superadmin/dashboard
 * Requires SUPERADMIN role.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const [
      totalSchools,
      totalStudents,
      schoolsList,
      recentPayments,
      totalTeachers,
    ] = await Promise.all([
      prisma.school.count(),
      prisma.student.count(),
      prisma.school.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          location: true,
          _count: { select: { students: true, teachers: true, classes: true } },
        },
      }),
      prisma.payment.findMany({
        take: 15,
        orderBy: { createdAt: "desc" },
        where: { status: "SUCCESS" },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          student: {
            select: {
              user: { select: { name: true } },
              school: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.user.count({ where: { role: "TEACHER" } }),
    ]);

    const schools = schoolsList.map((s) => ({
      id: s.id,
      name: s.name,
      location: s.location ?? "",
      studentCount: s._count.students,
      teacherCount: s._count.teachers,
      classCount: s._count.classes,
    }));

    const feeTransactions = recentPayments
      .filter((p) => p.student?.school)
      .map((p, idx) => ({
        id: p.id,
        slNo: idx + 1,
        amount: p.amount,
        schoolId: p.student!.school!.id,
        schoolName: p.student!.school!.name,
        studentName: p.student!.user?.name ?? "—",
        createdAt: p.createdAt,
      }));

    const payload = {
      stats: {
        totalSchools,
        totalStudents,
        totalTeachers,
      },
      schools,
      feeTransactions,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (e: unknown) {
    console.error("Superadmin dashboard:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
