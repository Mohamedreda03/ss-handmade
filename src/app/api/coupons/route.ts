import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth";
import { isAdmin } from "@/actions/isAdmin";
import { dashRoles } from "@/lib/dashRoles";

const generateCoupons = async (
  count: number,
  value: number,
  options: {
    courseId?: string;
    productId?: string;
    discountType?: "PERCENTAGE" | "FIXED";
    maxUses?: number;
    expiresAt?: Date;
    constructorId?: string;
  }
) => {
  const coupons = [];
  const couponData = [];

  for (let i = 0; i < count; i++) {
    let couponCode: string;
    let isUnique = false;

    while (!isUnique) {
      couponCode = uuidv4().slice(0, 18);
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });
      if (!existingCoupon) {
        isUnique = true;
      }
    }

    couponData.push({
      code: couponCode!,
      value,
      isUsed: false,
      email: null,
      courseId: options.courseId || null,
      productId: options.productId || null,
      discountType: options.discountType || "PERCENTAGE",
      maxUses: options.maxUses || 1,
      usedCount: 0,
      expiresAt: options.expiresAt || null,
      constructorId: options.constructorId || null,
    });

    coupons.push(`${couponCode!}`);
  }

  await prisma.coupon.createMany({
    data: couponData,
  });

  return coupons;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const session = await auth();
    const isAllowed = dashRoles.includes(session?.user.role!);

    if (!session || !isAllowed) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      value,
      numberOfCoupons,
      courseId,
      productId,
      couponType,
      discountType,
      maxUses,
      expiresAt,
    } = body;

    let options: {
      courseId?: string;
      productId?: string;
      discountType?: "PERCENTAGE" | "FIXED";
      maxUses?: number;
      expiresAt?: Date;
      constructorId?: string;
    } = {
      discountType: discountType || "PERCENTAGE",
      maxUses: maxUses || 1,
      expiresAt: expiresAt || null,
      constructorId: session.user.id,
    };

    if (couponType === "course" && courseId) {
      options.courseId = courseId;
    } else if (couponType === "product" && productId) {
      options.productId = productId;
    }

    const coupons = await generateCoupons(numberOfCoupons, value, options);

    const fileContent = coupons.join("\n");

    return new NextResponse(fileContent, {
      headers: {
        "Content-Disposition": `attachment; filename=coupons-${uuidv4()
          .split("-")
          .join()
          .slice(0, 8)}.txt`,
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.log("Generate coupons error:", error);
    return new NextResponse("Internal server error", {
      status: 500,
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const code = req.nextUrl.searchParams.get("code") as string;
    const coupon_code = code?.length > 0 ? code : undefined;

    const page = Number(req.nextUrl.searchParams.get("page") || "1");
    const pageSize = Number(req.nextUrl.searchParams.get("pageSize") || "20");

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let coupons: any[] = [];
    let totalCoupons = 0;

    if (session.user.role === "ADMIN") {
      coupons = await prisma.coupon.findMany({
        where: {
          code: coupon_code
            ? {
                startsWith: coupon_code,
                mode: "insensitive",
              }
            : undefined,
        },
        include: {
          course: { select: { title: true } },
          product: { select: { name: true } },
        } as any,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      });
      totalCoupons = await prisma.coupon.count({
        where: {
          code: coupon_code
            ? {
                startsWith: coupon_code,
                mode: "insensitive",
              }
            : undefined,
        },
      });
    } else {
      coupons = await prisma.coupon.findMany({
        where: {
          code: coupon_code
            ? {
                startsWith: coupon_code,
                mode: "insensitive",
              }
            : undefined,
          constructorId: session.user.id,
        },
        include: {
          course: { select: { title: true } },
          product: { select: { name: true } },
        } as any,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      });
      totalCoupons = await prisma.coupon.count({
        where: {
          code: coupon_code
            ? {
                startsWith: coupon_code,
                mode: "insensitive",
              }
            : undefined,
          constructorId: session.user.id,
        },
      });
    }

    const totalPages = Math.ceil(totalCoupons / pageSize);

    return NextResponse.json({
      data: coupons,
      meta: {
        totalCoupons,
        totalPages,
        currentPage: page,
        pageSize,
      },
    });
  } catch (error) {
    console.log("Get all coupons error:", error);
    return new NextResponse("Internal server error", {
      status: 500,
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Buscar el cupón
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: body.code,
        isUsed: false,
        usedCount: { lt: body.maxUses || 1 },
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({
        success: false,
        message: "الكوبون غير صالح أو انتهت صلاحيته",
      });
    }

    const userData = await prisma.user.findUnique({
      where: {
        id: session?.user.id,
      },
    });

    if (!userData) {
      return new NextResponse("User not found", {
        status: 404,
      });
    }

    let message: string;
    let discountAmount = 0;
    // Determinar el tipo de cupón
    let couponType = "general";
    if (coupon.courseId) couponType = "course";
    if (coupon.productId) couponType = "product";

    // Verificar si los elementos del carrito son compatibles con el tipo de cupón
    if (body.validateOnly === true && body.itemTypes) {
      const { hasProducts, hasCourses } = body.itemTypes;

      // Si es cupón de curso pero no hay cursos en el carrito
      if (couponType === "course" && !hasCourses) {
        return NextResponse.json({
          success: true, // Devolvemos success true pero con el tipo para que el front pueda manejar el mensaje
          couponType,
          message: "هذا الكوبون صالح للكورسات فقط وليس للمنتجات",
        });
      }

      // Si es cupón de producto pero no hay productos en el carrito
      if (couponType === "product" && !hasProducts) {
        return NextResponse.json({
          success: true, // Devolvemos success true pero con el tipo para que el front pueda manejar el mensaje
          couponType,
          message: "هذا الكوبون صالح للمنتجات فقط وليس للكورسات",
        });
      }
    }

    // For course coupon
    if (couponType === "course") {
      // En caso de validación solamente
      if (body.validateOnly === true) {
        const course = await prisma.course.findUnique({
          where: { id: coupon.courseId! },
        });

        if (!course) {
          return NextResponse.json({
            success: false,
            message: "الكورس غير متاح",
          });
        }

        // Calcular el descuento según el tipo
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (course.price! * coupon.value) / 100;
        } else {
          discountAmount = Math.min(coupon.value, course.price!);
        }

        message = "تم تطبيق الكوبون بنجاح";
      }
      // Aplicación real del cupón (creación de suscripción)
      else {
        await prisma.subscription.create({
          data: {
            courseId: coupon.courseId!,
            userId: session?.user.id!,
          },
        });

        await prisma.history.create({
          data: {
            price: coupon.value,
            courseId: coupon.courseId!,
            userId: session?.user.id!,
            couponId: coupon.id,
          },
        });

        message = "تم الاشتراك بنجاح";
      }
    }
    // For product coupon
    else if (couponType === "product") {
      // Solo validamos el cupón y devolvemos la información del descuento
      const product = await prisma.product.findUnique({
        where: { id: coupon.productId! },
      });

      if (!product) {
        return NextResponse.json({
          success: false,
          message: "المنتج غير متاح",
        });
      }

      if (coupon.discountType === "PERCENTAGE") {
        discountAmount = (product.price * coupon.value) / 100;
      } else {
        discountAmount = Math.min(coupon.value, product.price);
      }

      message = "تم تطبيق الكوبون بنجاح";
    }
    // For general discount
    else {
      // Descuento general para el monto proporcionado
      if (body.amount) {
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (body.amount * coupon.value) / 100;
        } else {
          discountAmount = Math.min(coupon.value, body.amount);
        }

        message = "تم تطبيق الخصم بنجاح";
      } else {
        // Si es solo validación, no creamos registro histórico
        if (body.validateOnly !== true) {
          await prisma.history.create({
            data: {
              price: coupon.value,
              userId: session?.user.id!,
              couponId: coupon.id,
            },
          });
        }

        message = "تم اضافة المبلغ بنجاح";
      }
    }

    // Actualizar el uso del cupón si no es solo validación
    if (body.validateOnly !== true) {
      await prisma.coupon.update({
        where: {
          id: coupon.id,
        },
        data: {
          isUsed: coupon.maxUses === 1 ? true : false,
          usedCount: { increment: 1 },
          email: session?.user.email,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message,
      discount: discountAmount,
      discountType: coupon.discountType,
      originalValue: coupon.value,
      couponId: coupon.id,
      couponType, // Añadimos el tipo de cupón para que el front pueda validar
    });
  } catch (error) {
    console.log("Apply coupon error:", error);
    return new NextResponse("Internal server error", {
      status: 500,
    });
  }
}
