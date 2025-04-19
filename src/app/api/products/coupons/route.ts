import { auth } from "@/auth";
import { dashRoles } from "@/lib/dashRoles";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Mark this route as dynamic to avoid static generation issues
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const isAllowed = dashRoles.includes(session?.user.role!);

    if (!session || !isAllowed) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let products: any[] = [];

    if (session.user.role === "ADMIN") {
      products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
        },
      });
    } else if (session.user.role === "CONSTRUCTOR") {
      products = await prisma.product.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
        },
      });
    }

    return NextResponse.json({
      data: products,
      session: session,
    });
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
