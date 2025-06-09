import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const body = await req.json();
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session?.user.id,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: {
        id: params.courseId,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Check if user is already subscribed
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        courseId: params.courseId,
        userId: user.id,
      },
    });

    if (existingSubscription) {
      return new NextResponse("Already subscribed to this course", {
        status: 400,
      });
    }

    const addDaysToCurrent = (days: number) => {
      const currentTime = new Date();
      currentTime.setDate(currentTime.getDate() + days);
      return currentTime;
    };

    const expireDate = addDaysToCurrent(7);

    // Generate invoice ID and reference if not provided
    const invoice_id =
      body.invoice_id || Math.floor(Math.random() * 1000000).toString();
    const invoice_ref =
      body.invoice_ref ||
      "REF-" + Math.floor(Math.random() * 1000000).toString();

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount: body.amount.toString(),
        userId: user.id,
        expire_date: expireDate,
        invoice_id: invoice_id,
        invoice_ref: invoice_ref,
        status: "PAID",
        payment_time: new Date(),
      },
    });

    // Create course subscription
    await prisma.subscription.create({
      data: {
        courseId: params.courseId,
        userId: session.user.id,
      },
    });

    // Create history record
    await prisma.history.create({
      data: {
        userId: session.user.id,
        courseId: params.courseId,
        price: parseFloat(body.amount),
        couponId: body.couponId || null,
      },
    });

    // If coupon was used, mark it as used
    if (body.couponId) {
      await prisma.coupon.update({
        where: {
          id: body.couponId,
        },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json(
      {
        data: payment,
        message: "Course purchased successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("COURSE PAYMENT ERROR:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
