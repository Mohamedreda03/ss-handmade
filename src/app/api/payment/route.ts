import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    const addDaysToCurrent = (days: number) => {
      const currentTime = new Date();
      currentTime.setDate(currentTime.getDate() + days);
      return currentTime;
    };

    const expireDate = addDaysToCurrent(7);

    console.log("expireDate:", expireDate);

    // Crear un registro de pago
    const payment = await prisma.payment.create({
      data: {
        amount: body.amount.toString(),
        userId: user.id,
        expire_date: expireDate,
        invoice_id: body.invoice_id,
        invoice_ref: body.invoice_ref,
        status: "PAID", // Cambiamos directamente a PAID para simular un pago exitoso
        payment_time: new Date(), // Registramos el tiempo de pago
      },
    });

    // Extraer los items del carrito del cuerpo de la petición
    const { items, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new NextResponse("No items provided", { status: 400 });
    }

    // Crear la orden asociada al pago
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: parseFloat(body.amount),
        status: "COMPLETED", // La orden se completa directamente, ya que el pago se ha simulado
        // Guardar dirección y número de teléfono si están disponibles
        address: shippingAddress?.address || null,
        phoneNumber: shippingAddress?.phoneNumber || null,
        orderItems: {
          createMany: {
            data: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                User: true, // Incluimos la información del vendedor
              },
            },
          },
        },
      },
    });

    // Actualizar el inventario y crear registros de ingresos para los vendedores
    const sellerEarnings = [];

    for (const item of order.orderItems) {
      // Actualizar inventario
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      // Registrar ingreso para el vendedor si existe
      if (item.product.User && item.product.User.id) {
        const sellerEarning = await prisma.sellerEarning.create({
          data: {
            sellerId: item.product.User.id,
            orderItemId: item.id,
            orderId: order.id,
            amount: item.price * item.quantity, // El vendedor recibe el monto total del producto
            isPaid: false, // Por defecto, el pago al vendedor está pendiente
          },
        });
        sellerEarnings.push(sellerEarning);
      }
    }

    return NextResponse.json(
      {
        data: payment,
        order: order,
        sellerEarnings: sellerEarnings,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return new NextResponse("internal server error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: {
        userId: session?.user.id,
        expire_date: {
          lte: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ payments, session });
  } catch (error) {
    console.log("PAYMENT GET ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.payment.deleteMany({
      where: {
        userId: session?.user.id,
        status: "UNCREATED",
      },
    });

    return new NextResponse("Payment deleted", { status: 200 });
  } catch (error) {
    console.log("PAYMENT DELETE ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
