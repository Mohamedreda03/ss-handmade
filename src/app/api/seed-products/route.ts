import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductType } from "@prisma/client";

const sampleProducts = [
  {
    name: "ثوب تطريز فلاحي",
    description: "ثوب فلاحي مطرز يدوياً بتصميم تقليدي جميل",
    price: 350,
    imageUrl: "https://placehold.co/600x400/png?text=ثوب+تطريز+فلاحي",
    stock: 10,
    isAvailable: true,
    type: "HANDMADE" as ProductType,
  },
  {
    name: "وشاح حرير مطرز",
    description: "وشاح حرير مطرز يدوياً بألوان زاهية",
    price: 150,
    imageUrl: "https://placehold.co/600x400/png?text=وشاح+حرير+مطرز",
    stock: 15,
    isAvailable: true,
    type: "HANDMADE" as ProductType,
  },
  {
    name: "حقيبة جلدية يدوية الصنع",
    description: "حقيبة جلدية فاخرة مصنوعة يدوياً بتصميم عصري",
    price: 250,
    imageUrl: "https://placehold.co/600x400/png?text=حقيبة+جلدية",
    stock: 8,
    isAvailable: true,
    type: "HANDMADE" as ProductType,
  },
  {
    name: "طقم أدوات خياطة",
    description: "طقم أدوات خياطة احترافية تشمل إبر وخيوط متنوعة",
    price: 120,
    imageUrl: "https://placehold.co/600x400/png?text=أدوات+خياطة",
    stock: 20,
    isAvailable: true,
    type: "EQUIPMENT" as ProductType,
  },
  {
    name: "آلة تطريز صغيرة",
    description: "آلة تطريز صغيرة مناسبة للمبتدئين والهواة",
    price: 500,
    imageUrl: "https://placehold.co/600x400/png?text=آلة+تطريز",
    stock: 5,
    isAvailable: true,
    type: "EQUIPMENT" as ProductType,
  },
];

export async function GET() {
  try {
    // Check if products already exist
    const existingCount = await prisma.product.count();

    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Products already exist (${existingCount} products found). No new products added.`,
      });
    }

    // Add sample products
    const createdProducts = await prisma.$transaction(
      sampleProducts.map((product) =>
        prisma.product.create({
          data: product,
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Successfully added ${createdProducts.length} sample products`,
      products: createdProducts,
    });
  } catch (error) {
    console.error("Error seeding products:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to seed products: ${error}`,
      },
      { status: 500 }
    );
  }
}
