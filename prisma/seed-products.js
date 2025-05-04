const { PrismaClient, ProductType } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("بدء إضافة بيانات المنتجات...");

  // حذف المنتجات الحالية إذا كانت موجودة
  await prisma.product.deleteMany({});
  console.log("تم حذف المنتجات الموجودة سابقًا");

  // معرف المسؤول (Admin)
  const adminId = "43a9b61d-f82d-4713-9919-af06b773e2bd";

  // منتجات المصنوعات اليدوية (25 منتج)
  const handmadeProducts = [
    {
      name: "سجادة يدوية مطرزة",
      description:
        "سجادة مصنوعة يدويًا من الصوف الطبيعي بتصميم تقليدي مطرز بألوان زاهية",
      price: 450,
      imageUrl:
        "https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg",
      stock: 15,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "وسادة مزخرفة",
      description:
        "وسادة قطنية مزخرفة بنقوش تقليدية، مصنوعة يدويًا بألوان طبيعية",
      price: 120,
      imageUrl:
        "https://images.pexels.com/photos/4992486/pexels-photo-4992486.jpeg",
      stock: 25,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "سلة خوص منسوجة",
      description:
        "سلة تخزين منسوجة من الخوص الطبيعي بحرفية عالية، مثالية للديكور المنزلي",
      price: 85,
      imageUrl:
        "https://images.pexels.com/photos/4506941/pexels-photo-4506941.jpeg",
      stock: 20,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "مفرش طاولة مطرز",
      description:
        "مفرش طاولة قطني مطرز يدويًا بنقوش تراثية ملونة، مقاس 150×150 سم",
      price: 180,
      imageUrl:
        "https://images.pexels.com/photos/1517355/pexels-photo-1517355.jpeg",
      stock: 12,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "خزف مزخرف",
      description: "آنية خزفية مزخرفة ومرسومة يدويًا بزخارف نباتية تقليدية",
      price: 220,
      imageUrl:
        "https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg",
      stock: 8,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "تعليقة جدارية منسوجة",
      description:
        "تعليقة جدارية منسوجة يدويًا من خيوط قطنية متعددة الألوان بتصميم هندسي",
      price: 150,
      imageUrl:
        "https://images.pexels.com/photos/1070360/pexels-photo-1070360.jpeg",
      stock: 10,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "شموع معطرة يدوية",
      description:
        "مجموعة من الشموع المعطرة المصنوعة يدويًا بزيوت طبيعية وأعشاب عطرية",
      price: 65,
      imageUrl:
        "https://images.pexels.com/photos/3270223/pexels-photo-3270223.jpeg",
      stock: 30,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "حقيبة يد مطرزة",
      description: "حقيبة يد نسائية مطرزة يدويًا بخيوط ملونة وتصاميم تراثية",
      price: 195,
      imageUrl:
        "https://images.pexels.com/photos/5935740/pexels-photo-5935740.jpeg",
      stock: 15,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "قلادة فضية مصنوعة يدويًا",
      description:
        "قلادة فضية مزخرفة بأحجار طبيعية ملونة، مصنوعة يدويًا بتقنيات تقليدية",
      price: 280,
      imageUrl:
        "https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg",
      stock: 7,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "صندوق خشبي محفور",
      description:
        "صندوق خشبي محفور يدويًا بزخارف نباتية دقيقة، مثالي لحفظ المجوهرات",
      price: 210,
      imageUrl:
        "https://images.pexels.com/photos/247929/pexels-photo-247929.jpeg",
      stock: 9,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "لوحة فنية مصنوعة من الخرز",
      description:
        "لوحة فنية مزخرفة بالخرز الملون المصنوع من أحجار طبيعية، عمل فني فريد",
      price: 350,
      imageUrl:
        "https://images.pexels.com/photos/5232470/pexels-photo-5232470.jpeg",
      stock: 5,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "وشاح حريري مصبوغ يدويًا",
      description:
        "وشاح حريري مصبوغ يدويًا بتقنية الباتيك التقليدية بألوان متداخلة",
      price: 175,
      imageUrl:
        "https://images.pexels.com/photos/6045028/pexels-photo-6045028.jpeg",
      stock: 12,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "أقراط خشبية منحوتة",
      description: "أقراط خشبية منحوتة يدويًا بأشكال هندسية وتفاصيل دقيقة",
      price: 45,
      imageUrl:
        "https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg",
      stock: 20,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "مزهرية خزفية مطلية بالمينا",
      description: "مزهرية خزفية مطلية يدويًا بالمينا الملونة بتصميم عصري",
      price: 240,
      imageUrl:
        "https://images.pexels.com/photos/6045217/pexels-photo-6045217.jpeg",
      stock: 8,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "دمية قماشية محشوة",
      description:
        "دمية قماشية محشوة مصنوعة يدويًا من أقمشة قطنية ملونة، هدية مثالية للأطفال",
      price: 90,
      imageUrl:
        "https://images.pexels.com/photos/3934268/pexels-photo-3934268.jpeg",
      stock: 15,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "سلسلة مفاتيح جلدية",
      description:
        "سلسلة مفاتيح مصنوعة من الجلد الطبيعي المشغول يدويًا بتصميم أنيق",
      price: 35,
      imageUrl:
        "https://images.pexels.com/photos/842956/pexels-photo-842956.jpeg",
      stock: 25,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "بطانية صوف محاكة يدويًا",
      description: "بطانية دافئة من الصوف الطبيعي محاكة يدويًا بألوان متناسقة",
      price: 380,
      imageUrl:
        "https://images.pexels.com/photos/6194951/pexels-photo-6194951.jpeg",
      stock: 7,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "علبة مجوهرات خشبية مزخرفة",
      description:
        "علبة مجوهرات خشبية مزخرفة بالحفر والنقش اليدوي بتصاميم هندسية دقيقة",
      price: 160,
      imageUrl:
        "https://images.pexels.com/photos/177703/pexels-photo-177703.jpeg",
      stock: 10,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "قنديل زجاجي معشق",
      description: "قنديل زجاجي معشق بالرصاص، مصنوع يدويًا بألوان زاهية",
      price: 290,
      imageUrl:
        "https://images.pexels.com/photos/3616500/pexels-photo-3616500.jpeg",
      stock: 6,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "محفظة جلدية مطرزة",
      description: "محفظة جلدية مطرزة يدويًا بخيوط ملونة وزخارف تقليدية",
      price: 120,
      imageUrl:
        "https://images.pexels.com/photos/6044198/pexels-photo-6044198.jpeg",
      stock: 15,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "إطار صور خشبي مزخرف",
      description: "إطار صور خشبي مزخرف بالحفر اليدوي الدقيق، مقاس 20×25 سم",
      price: 95,
      imageUrl:
        "https://images.pexels.com/photos/1669799/pexels-photo-1669799.jpeg",
      stock: 18,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "ساعة حائط خشبية منحوتة",
      description: "ساعة حائط من الخشب الطبيعي منحوتة يدويًا بتصميم عصري أنيق",
      price: 270,
      imageUrl:
        "https://images.pexels.com/photos/1095601/pexels-photo-1095601.jpeg",
      stock: 8,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "سجادة قطنية مزخرفة",
      description:
        "سجادة من القطن المزخرف بأنماط هندسية تقليدية، منسوجة يدويًا",
      price: 330,
      imageUrl:
        "https://images.pexels.com/photos/6527094/pexels-photo-6527094.jpeg",
      stock: 12,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "طقم شاي خزفي مرسوم يدويًا",
      description:
        "طقم شاي خزفي مكون من 6 قطع، مرسوم باليد ومزين بزخارف نباتية",
      price: 310,
      imageUrl:
        "https://images.pexels.com/photos/6270663/pexels-photo-6270663.jpeg",
      stock: 7,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
    {
      name: "سلة هدايا مزينة يدويًا",
      description:
        "سلة هدايا مصنوعة من القش الطبيعي ومزينة يدويًا بشرائط ملونة وزهور مجففة",
      price: 75,
      imageUrl:
        "https://images.pexels.com/photos/6108082/pexels-photo-6108082.jpeg",
      stock: 20,
      type: ProductType.HANDMADE,
      userId: adminId,
    },
  ];

  // منتجات أدوات الحرف اليدوية (15 منتج)
  const equipmentProducts = [
    {
      name: "طقم أدوات النحت الخشبي",
      description:
        "طقم كامل من أدوات النحت الخشبي المصنوعة من الفولاذ عالي الجودة، 12 قطعة مع حقيبة تخزين",
      price: 320,
      imageUrl:
        "https://images.pexels.com/photos/5802061/pexels-photo-5802061.jpeg",
      stock: 10,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "ماكينة خياطة للأعمال اليدوية",
      description:
        "ماكينة خياطة مدمجة مثالية للأعمال اليدوية والمشاريع الصغيرة، سهلة الاستخدام ومتعددة الوظائف",
      price: 650,
      imageUrl:
        "https://images.pexels.com/photos/6050318/pexels-photo-6050318.jpeg",
      stock: 5,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "طقم أدوات الخزف",
      description:
        "طقم أدوات تشكيل الخزف المحترف، يتضمن 8 أدوات أساسية مصنوعة من الخشب والمعدن",
      price: 180,
      imageUrl:
        "https://images.pexels.com/photos/4200825/pexels-photo-4200825.jpeg",
      stock: 12,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "نول نسيج يدوي صغير",
      description:
        "نول نسيج خشبي يدوي للمبتدئين، سهل الاستخدام ومثالي لصنع المنسوجات الصغيرة",
      price: 230,
      imageUrl:
        "https://images.pexels.com/photos/6044295/pexels-photo-6044295.jpeg",
      stock: 8,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "فرن حرق الخزف الصغير",
      description:
        "فرن كهربائي صغير لحرق الخزف والصلصال، مناسب للاستخدام المنزلي والمشاريع الصغيرة",
      price: 1200,
      imageUrl:
        "https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg",
      stock: 3,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "طقم أدوات صناعة المجوهرات",
      description:
        "طقم شامل لصناعة المجوهرات يحتوي على 25 قطعة من الأدوات الأساسية مع حقيبة تخزين",
      price: 280,
      imageUrl:
        "https://images.pexels.com/photos/4506966/pexels-photo-4506966.jpeg",
      stock: 15,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "آلة قطع الزجاج",
      description:
        "آلة دقيقة لقطع الزجاج، مناسبة لمشاريع الزجاج المعشق والديكورات الزجاجية",
      price: 190,
      imageUrl:
        "https://images.pexels.com/photos/5428826/pexels-photo-5428826.jpeg",
      stock: 9,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "طقم أدوات الرسم والتلوين",
      description:
        "طقم احترافي للرسم والتلوين يشمل أقلام وفرش وألوان متنوعة، 50 قطعة في حافظة خشبية",
      price: 350,
      imageUrl:
        "https://images.pexels.com/photos/6177542/pexels-photo-6177542.jpeg",
      stock: 20,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "ملزمة خشبية للأعمال اليدوية",
      description:
        "ملزمة خشبية متينة لتثبيت القطع أثناء العمل، مناسبة لمختلف الأعمال اليدوية",
      price: 140,
      imageUrl:
        "https://images.pexels.com/photos/5708822/pexels-photo-5708822.jpeg",
      stock: 15,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "آلة قص الورق الدقيق",
      description:
        "آلة دقيقة لقص الورق والكرتون، مثالية لأعمال الديكوباج والأشغال الورقية",
      price: 220,
      imageUrl:
        "https://images.pexels.com/photos/6048103/pexels-photo-6048103.jpeg",
      stock: 12,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "مجموعة قوالب السيليكون",
      description:
        "مجموعة متنوعة من قوالب السيليكون للصب والتشكيل، 20 قالب بأشكال مختلفة",
      price: 95,
      imageUrl:
        "https://images.pexels.com/photos/5430762/pexels-photo-5430762.jpeg",
      stock: 25,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "مكبس طباعة يدوي",
      description:
        "مكبس طباعة يدوي خشبي لطباعة النقوش والتصاميم على الورق والأقمشة",
      price: 260,
      imageUrl:
        "https://images.pexels.com/photos/6045048/pexels-photo-6045048.jpeg",
      stock: 7,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "حامل تطريز خشبي",
      description: "حامل تطريز خشبي قابل للتعديل، مثالي لمشاريع التطريز اليدوي",
      price: 85,
      imageUrl:
        "https://images.pexels.com/photos/6147369/pexels-photo-6147369.jpeg",
      stock: 18,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "أدوات تشكيل الجلود",
      description:
        "مجموعة أدوات احترافية لتشكيل وزخرفة الجلود، 15 قطعة مع حقيبة جلدية",
      price: 210,
      imageUrl:
        "https://images.pexels.com/photos/6069053/pexels-photo-6069053.jpeg",
      stock: 10,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
    {
      name: "عجلة فخار صغيرة",
      description:
        "عجلة فخار كهربائية صغيرة للاستخدام المنزلي، مثالية للمبتدئين وهواة صناعة الفخار",
      price: 780,
      imageUrl:
        "https://images.pexels.com/photos/4992464/pexels-photo-4992464.jpeg",
      stock: 4,
      type: ProductType.EQUIPMENT,
      userId: adminId,
    },
  ];

  // إضافة المنتجات إلى قاعدة البيانات
  for (const product of [...handmadeProducts, ...equipmentProducts]) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(
    `تمت إضافة ${
      handmadeProducts.length + equipmentProducts.length
    } منتج بنجاح:`
  );
  console.log(`- ${handmadeProducts.length} منتج من المصنوعات اليدوية`);
  console.log(`- ${equipmentProducts.length} منتج من الأدوات`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("حدث خطأ أثناء إضافة البيانات:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
