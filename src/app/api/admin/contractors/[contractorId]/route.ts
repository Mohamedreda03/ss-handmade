import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateContractorSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { contractorId: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated and is admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: true, message: "غير مصرح لك بالوصول" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validationResult = UpdateContractorSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: true, message: "البيانات المرسلة غير صحيحة" },
        { status: 400 }
      );
    }
    const { status } = validationResult.data; // Check if contractor exists
    const existingContractor = await prisma.contractorProfile.findUnique({
      where: { id: params.contractorId },
      include: { user: true },
    });

    if (!existingContractor) {
      return NextResponse.json(
        { error: true, message: "الكونستراكتور غير موجود" },
        { status: 404 }
      );
    } // Update contractor status
    const updatedContractor = await prisma.contractorProfile.update({
      where: { id: params.contractorId },
      data: {
        status,
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If approved, update user role to CONSTRUCTOR
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: existingContractor.userId },
        data: { role: "CONSTRUCTOR" },
      });
    }

    // TODO: Send notification email to contractor
    // You can implement email notification here using your preferred service

    return NextResponse.json({
      message: `تم ${
        status === "APPROVED" ? "قبول" : status === "REJECTED" ? "رفض" : "تعليق"
      } طلب الكونستراكتور بنجاح`,
      contractor: updatedContractor,
    });
  } catch (error) {
    console.error("Error updating contractor:", error);
    return NextResponse.json(
      { error: true, message: "حدث خطأ في معالجة الطلب" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { contractorId: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const { contractorId } = params;
    const { status, note } = await req.json();

    // Validate status
    if (!["APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "حالة غير صحيحة" },
        { status: 400 }
      );
    }

    // Check if contractor exists
    const existingContractor = await prisma.contractorProfile.findUnique({
      where: { id: contractorId },
      include: { user: true },
    });

    if (!existingContractor) {
      return NextResponse.json(
        { success: false, error: "الكونستراكتور غير موجود" },
        { status: 404 }
      );
    } // Update contractor status
    const updatedContractor = await prisma.contractorProfile.update({
      where: {
        id: contractorId,
      },
      data: {
        status,
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If approved, update user role to CONSTRUCTOR
    if (status === "APPROVED") {
      await prisma.user.update({
        where: {
          id: updatedContractor.userId,
        },
        data: {
          role: "CONSTRUCTOR",
        },
      });
    } else if (status === "REJECTED" || status === "SUSPENDED") {
      // If rejected or suspended, set role back to STUDENT
      await prisma.user.update({
        where: {
          id: updatedContractor.userId,
        },
        data: {
          role: "STUDENT",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedContractor,
      message: `تم ${
        status === "APPROVED" ? "قبول" : status === "REJECTED" ? "رفض" : "تعليق"
      } طلب الكونستراكتور بنجاح`,
    });
  } catch (error) {
    console.error("[CONTRACTOR_UPDATE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في النظام" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { contractorId: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated and is admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: true, message: "غير مصرح لك بالوصول" },
        { status: 403 }
      );
    }
    const contractor = await prisma.contractorProfile.findUnique({
      where: { id: params.contractorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!contractor) {
      return NextResponse.json(
        { error: true, message: "الكونستراكتور غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contractor,
    });
  } catch (error) {
    console.error("Error fetching contractor:", error);
    return NextResponse.json(
      { error: true, message: "حدث خطأ في تحميل بيانات الكونستراكتور" },
      { status: 500 }
    );
  }
}
