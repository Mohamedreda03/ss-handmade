"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSellerPaymentStatus(earningId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { error: "No autenticado" };
    }

    if (session.user.role !== "ADMIN") {
      return {
        error:
          "No autorizado, solo los administradores pueden realizar esta acción",
      };
    }

    // Buscar el registro de ingresos del vendedor
    const sellerEarning = await prisma.sellerEarning.findUnique({
      where: {
        id: earningId,
      },
    });

    if (!sellerEarning) {
      return { error: "Registro de ingresos no encontrado" };
    }

    // Actualizar estado de pago
    const updatedEarning = await prisma.sellerEarning.update({
      where: {
        id: earningId,
      },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });

    // Revalidar rutas para que los cambios se reflejen inmediatamente
    revalidatePath("/admin/seller-earnings");
    revalidatePath(`/my-earnings`);

    return { success: true, data: updatedEarning };
  } catch (error) {
    console.error("Error al actualizar el estado de pago:", error);
    return { error: "Ocurrió un error al actualizar el estado de pago" };
  }
}
